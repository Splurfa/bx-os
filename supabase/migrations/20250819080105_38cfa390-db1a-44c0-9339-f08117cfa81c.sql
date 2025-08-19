-- Fix the search path security warning for the functions we just created
-- Update both functions to have proper security settings

CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- First archive all waiting and active behavior requests that don't already have history
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
  LEFT JOIN behavior_history bh ON bh.behavior_request_id = br.id
  WHERE br.status IN ('waiting', 'active')
  AND bh.id IS NULL; -- Only insert if no history record exists
  
  -- Delete the behavior requests (this should now work since we have proper archiving)
  DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');
  
  -- Clear all kiosk assignments
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE is_active = true;
END;
$function$;

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
  
  -- Delete the behavior request
  DELETE FROM behavior_requests WHERE id = p_behavior_request_id;
  
  -- Update any kiosks that had this request assigned
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id = p_behavior_request_id;
  
  -- Reassign waiting students to available kiosks
  PERFORM reassign_waiting_students();
END;
$function$;