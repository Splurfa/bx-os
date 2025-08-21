-- Fix clear_teacher_queue to handle foreign key constraints properly
CREATE OR REPLACE FUNCTION public.clear_teacher_queue(p_teacher_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Step 1: Clear any kiosk assignments for this teacher's requests first
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id IN (
    SELECT br.id FROM behavior_requests br 
    WHERE br.teacher_id = p_teacher_id AND br.status IN ('waiting', 'active')
  );
  
  -- Step 2: Archive all waiting and active behavior requests for this teacher WITHOUT reflection_id
  -- This avoids creating FK references to data we're about to delete
  INSERT INTO behavior_history (
    behavior_request_id,
    student_id,
    reflection_id,  -- Will be NULL to avoid FK constraint issues
    resolution_type,
    resolution_notes,
    archived_at
  )
  SELECT 
    br.id,
    br.student_id,
    NULL,  -- Set to NULL to avoid foreign key constraint with reflections we'll delete
    'teacher_cleared',
    'Cleared by teacher - bulk queue clear',
    now()
  FROM behavior_requests br
  LEFT JOIN behavior_history bh ON bh.behavior_request_id = br.id
  WHERE br.teacher_id = p_teacher_id
  AND br.status IN ('waiting', 'active')
  AND bh.id IS NULL; -- Only insert if no history record exists
  
  -- Step 3: Delete reflections first to avoid foreign key constraints
  DELETE FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests 
    WHERE teacher_id = p_teacher_id AND status IN ('waiting', 'active')
  );
  
  -- Step 4: Delete the behavior requests for this teacher
  DELETE FROM behavior_requests 
  WHERE teacher_id = p_teacher_id 
  AND status IN ('waiting', 'active');
  
  -- Step 5: Reassign waiting students to available kiosks
  PERFORM reassign_waiting_students();
END;
$function$