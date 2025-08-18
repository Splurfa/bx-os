-- Fix search paths for all remaining functions to address security warnings

-- Fix assign_waiting_students_to_kiosk function
CREATE OR REPLACE FUNCTION public.assign_waiting_students_to_kiosk(p_kiosk_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Get the first waiting student and assign to kiosk
  UPDATE behavior_requests 
  SET assigned_kiosk = p_kiosk_id, 
      status = 'active',
      updated_at = now()
  WHERE id = (
    SELECT id 
    FROM behavior_requests 
    WHERE status = 'waiting' 
    AND assigned_kiosk IS NULL
    ORDER BY created_at ASC 
    LIMIT 1
  );
  
  -- Update kiosk with assigned student
  UPDATE kiosks 
  SET current_behavior_request_id = (
    SELECT id 
    FROM behavior_requests 
    WHERE assigned_kiosk = p_kiosk_id 
    AND status = 'active'
    LIMIT 1
  ),
  current_student_id = (
    SELECT student_id 
    FROM behavior_requests 
    WHERE assigned_kiosk = p_kiosk_id 
    AND status = 'active'
    LIMIT 1
  ),
  updated_at = now()
  WHERE id = p_kiosk_id;
END;
$$;

-- Fix reassign_waiting_students function
CREATE OR REPLACE FUNCTION public.reassign_waiting_students()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  kiosk_rec RECORD;
  student_rec RECORD;
BEGIN
  -- Loop through active kiosks that don't have assigned students
  FOR kiosk_rec IN 
    SELECT id FROM kiosks 
    WHERE is_active = true 
    AND current_student_id IS NULL
  LOOP
    -- Get next waiting student
    SELECT id, student_id INTO student_rec
    FROM behavior_requests 
    WHERE status = 'waiting' 
    AND assigned_kiosk IS NULL
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If student found, assign to kiosk
    IF student_rec.id IS NOT NULL THEN
      UPDATE behavior_requests 
      SET assigned_kiosk = kiosk_rec.id,
          status = 'active',
          updated_at = now()
      WHERE id = student_rec.id;
      
      UPDATE kiosks 
      SET current_behavior_request_id = student_rec.id,
          current_student_id = student_rec.student_id,
          updated_at = now()
      WHERE id = kiosk_rec.id;
    END IF;
  END LOOP;
END;
$$;

-- Fix admin_clear_all_queues function
CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Archive all waiting and active behavior requests
  INSERT INTO behavior_history (
    behavior_request_id,
    student_id,
    reflection_id,
    resolution_type,
    resolution_notes,
    archived_at
  )
  SELECT 
    br.id,
    br.student_id,
    r.id,
    'admin_cleared',
    'Cleared by admin - bulk queue clear',
    now()
  FROM behavior_requests br
  LEFT JOIN reflections r ON r.behavior_request_id = br.id
  WHERE br.status IN ('waiting', 'active');
  
  -- Delete the behavior requests
  DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');
  
  -- Clear all kiosk assignments
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE is_active = true;
END;
$$;