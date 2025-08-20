-- Fix the admin_clear_all_queues function to handle foreign key constraints properly
-- The issue is that reflections table has a foreign key to behavior_requests
-- We need to delete reflections BEFORE archiving to behavior_history

CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- First, archive behavior requests with their reflections to history
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
  
  -- Clear all kiosk assignments first to avoid dependency issues
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Delete reflections first to satisfy foreign key constraints
  DELETE FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Finally delete the behavior requests
  DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');
END;
$function$