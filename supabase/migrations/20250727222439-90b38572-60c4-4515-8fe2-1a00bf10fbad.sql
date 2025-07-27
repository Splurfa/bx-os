-- Fix queue assignment logic to prevent multiple students per kiosk
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
  available_kiosk_count integer;
  total_waiting integer;
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
  
  -- Get count of available kiosks (active kiosks without current assignments)
  SELECT COUNT(*) INTO available_kiosk_count
  FROM public.kiosks k
  WHERE k.is_active = true 
    AND NOT EXISTS (
      SELECT 1 FROM public.behavior_requests br 
      WHERE br.assigned_kiosk_id = k.id 
        AND br.status = 'waiting'
        AND br.kiosk_status IN ('waiting', 'ready', 'in_progress')
    );
  
  -- Get total unassigned waiting students
  SELECT COUNT(*) INTO total_waiting
  FROM public.behavior_requests
  WHERE status = 'waiting' 
    AND kiosk_status = 'waiting'
    AND assigned_kiosk_id IS NULL;
    
  -- Only assign students if there are available kiosks
  IF available_kiosk_count = 0 THEN
    -- No available kiosks, keep students in waiting state
    RETURN;
  END IF;
  
  -- Assign unassigned waiting students to available kiosks (max 1 per kiosk)
  FOR waiting_student_record IN
    SELECT id
    FROM public.behavior_requests
    WHERE status = 'waiting' 
      AND kiosk_status = 'waiting'
      AND assigned_kiosk_id IS NULL
    ORDER BY created_at ASC
    LIMIT available_kiosk_count
  LOOP
    -- Get next available kiosk (active and no current assignments)
    SELECT k.id INTO current_assignments
    FROM public.kiosks k
    WHERE k.is_active = true 
      AND NOT EXISTS (
        SELECT 1 FROM public.behavior_requests br 
        WHERE br.assigned_kiosk_id = k.id 
          AND br.status = 'waiting'
          AND br.kiosk_status IN ('waiting', 'ready', 'in_progress')
      )
    ORDER BY k.id
    LIMIT 1;
    
    -- If we found an available kiosk, assign the student
    IF current_assignments IS NOT NULL THEN
      UPDATE public.behavior_requests
      SET 
        assigned_kiosk_id = current_assignments,
        kiosk_status = 'waiting',
        updated_at = now()
      WHERE id = waiting_student_record.id;
      
      -- Log assignment for debugging
      RAISE NOTICE 'Assigned student % to kiosk %', waiting_student_record.id, current_assignments;
    END IF;
    
    -- Reset for next iteration
    current_assignments := NULL;
  END LOOP;
END;
$function$;