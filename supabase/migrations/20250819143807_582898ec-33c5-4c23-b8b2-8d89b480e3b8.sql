-- Fix admin_clear_all_queues function to handle existing behavior_history records
CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Archive behavior requests that don't already have history records
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
  
  -- Delete reflections first to avoid foreign key conflicts
  DELETE FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Delete the behavior requests
  DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');
  
  -- Clear all kiosk assignments
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE is_active = true;
END;
$function$;