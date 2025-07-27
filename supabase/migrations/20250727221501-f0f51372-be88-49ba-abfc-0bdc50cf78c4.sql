-- Enhanced function to assign ALL waiting students to available kiosks with proper FIFO ordering
CREATE OR REPLACE FUNCTION public.assign_waiting_students_to_kiosk(p_kiosk_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  waiting_student_record RECORD;
  active_kiosk_count integer;
  students_per_kiosk integer;
  assigned_count integer := 0;
BEGIN
  -- Get count of active kiosks for load balancing
  SELECT COUNT(*) INTO active_kiosk_count
  FROM public.kiosks
  WHERE is_active = true;
  
  -- If no active kiosks, exit
  IF active_kiosk_count = 0 THEN
    RETURN;
  END IF;
  
  -- Calculate how many students this kiosk should handle
  SELECT COUNT(*) INTO students_per_kiosk
  FROM public.behavior_requests
  WHERE status = 'waiting' 
    AND kiosk_status = 'waiting'
    AND assigned_kiosk_id IS NULL;
    
  students_per_kiosk := CEILING(students_per_kiosk::float / active_kiosk_count::float);
  
  -- Assign waiting students to this kiosk in FIFO order
  FOR waiting_student_record IN
    SELECT id
    FROM public.behavior_requests
    WHERE status = 'waiting' 
      AND kiosk_status = 'waiting'
      AND assigned_kiosk_id IS NULL
    ORDER BY created_at ASC
    LIMIT students_per_kiosk
  LOOP
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = p_kiosk_id,
      kiosk_status = 'waiting', -- Will become 'ready' when kiosk shows welcome
      updated_at = now()
    WHERE id = waiting_student_record.id;
    
    assigned_count := assigned_count + 1;
  END LOOP;
  
  -- Log assignment for debugging
  RAISE NOTICE 'Assigned % students to kiosk %', assigned_count, p_kiosk_id;
END;
$function$;

-- New function to reassign all waiting students across active kiosks
CREATE OR REPLACE FUNCTION public.reassign_waiting_students()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  active_kiosk_record RECORD;
  waiting_student_record RECORD;
  active_kiosk_count integer;
  total_waiting integer;
  students_per_kiosk integer;
  current_assignments integer;
  kiosk_counter integer := 0;
BEGIN
  -- Get count of active kiosks
  SELECT COUNT(*) INTO active_kiosk_count
  FROM public.kiosks
  WHERE is_active = true;
  
  -- If no active kiosks, unassign all waiting students
  IF active_kiosk_count = 0 THEN
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = NULL,
      kiosk_status = 'waiting',
      updated_at = now()
    WHERE status = 'waiting' AND assigned_kiosk_id IS NOT NULL;
    RETURN;
  END IF;
  
  -- Get total waiting students
  SELECT COUNT(*) INTO total_waiting
  FROM public.behavior_requests
  WHERE status = 'waiting' 
    AND kiosk_status = 'waiting'
    AND assigned_kiosk_id IS NULL;
    
  -- Calculate students per kiosk
  students_per_kiosk := CEILING(total_waiting::float / active_kiosk_count::float);
  
  -- Round-robin assignment of unassigned waiting students
  FOR waiting_student_record IN
    SELECT id
    FROM public.behavior_requests
    WHERE status = 'waiting' 
      AND kiosk_status = 'waiting'
      AND assigned_kiosk_id IS NULL
    ORDER BY created_at ASC
  LOOP
    -- Get next active kiosk in round-robin fashion
    SELECT id INTO current_assignments
    FROM public.kiosks
    WHERE is_active = true
    ORDER BY id
    OFFSET (kiosk_counter % active_kiosk_count)
    LIMIT 1;
    
    -- Assign student to kiosk
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = current_assignments,
      kiosk_status = 'waiting',
      updated_at = now()
    WHERE id = waiting_student_record.id;
    
    kiosk_counter := kiosk_counter + 1;
  END LOOP;
END;
$function$;

-- Enhanced kiosk deactivation handler to reassign students
CREATE OR REPLACE FUNCTION public.handle_kiosk_deactivation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- If kiosk is being deactivated, reset students back to waiting without kiosk
  IF OLD.is_active = true AND NEW.is_active = false THEN
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = NULL,
      kiosk_status = 'waiting',
      updated_at = now()
    WHERE assigned_kiosk_id = NEW.id
      AND status = 'waiting'; -- Only affect waiting students, not completed ones
      
    -- Reassign waiting students to remaining active kiosks
    PERFORM public.reassign_waiting_students();
  END IF;
  
  -- If kiosk is being activated, assign waiting students
  IF OLD.is_active = false AND NEW.is_active = true THEN
    PERFORM public.reassign_waiting_students();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for kiosk activation/deactivation
DROP TRIGGER IF EXISTS trigger_handle_kiosk_deactivation ON public.kiosks;
CREATE TRIGGER trigger_handle_kiosk_deactivation
  BEFORE UPDATE ON public.kiosks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_kiosk_deactivation();