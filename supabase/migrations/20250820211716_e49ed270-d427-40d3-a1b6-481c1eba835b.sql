-- Fix the clear_teacher_queue function to have proper search_path
CREATE OR REPLACE FUNCTION public.clear_teacher_queue(p_teacher_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Archive all waiting and active behavior requests for this teacher
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
    'teacher_cleared',
    'Cleared by teacher - bulk queue clear',
    now()
  FROM behavior_requests br
  LEFT JOIN reflections r ON r.behavior_request_id = br.id
  LEFT JOIN behavior_history bh ON bh.behavior_request_id = br.id
  WHERE br.teacher_id = p_teacher_id
  AND br.status IN ('waiting', 'active')
  AND bh.id IS NULL; -- Only insert if no history record exists
  
  -- Clear any kiosk assignments for this teacher's requests first
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id IN (
    SELECT br.id FROM behavior_requests br 
    WHERE br.teacher_id = p_teacher_id AND br.status IN ('waiting', 'active')
  );
  
  -- Delete reflections first to avoid foreign key constraints
  DELETE FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests 
    WHERE teacher_id = p_teacher_id AND status IN ('waiting', 'active')
  );
  
  -- Delete the behavior requests for this teacher
  DELETE FROM behavior_requests 
  WHERE teacher_id = p_teacher_id 
  AND status IN ('waiting', 'active');
  
  -- Reassign waiting students to available kiosks
  PERFORM reassign_waiting_students();
END;
$function$