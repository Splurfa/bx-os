-- Fix the clear_single_behavior_request function to have proper search_path
CREATE OR REPLACE FUNCTION public.clear_single_behavior_request(p_behavior_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Archive the behavior request if it doesn't already have a history record
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
    'manually_cleared',
    'Cleared by user - individual item removal',
    now()
  FROM behavior_requests br
  LEFT JOIN reflections r ON r.behavior_request_id = br.id
  LEFT JOIN behavior_history bh ON bh.behavior_request_id = br.id
  WHERE br.id = p_behavior_request_id
  AND bh.id IS NULL; -- Only insert if no history record exists
  
  -- Update any kiosks that had this request assigned first
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id = p_behavior_request_id;
  
  -- Delete the reflection first to avoid foreign key constraint issues
  DELETE FROM reflections WHERE behavior_request_id = p_behavior_request_id;
  
  -- Delete the behavior request
  DELETE FROM behavior_requests WHERE id = p_behavior_request_id;
  
  -- Reassign waiting students to available kiosks
  PERFORM reassign_waiting_students();
END;
$function$