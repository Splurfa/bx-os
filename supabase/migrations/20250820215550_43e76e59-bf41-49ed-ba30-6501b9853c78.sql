-- Fix security warning: Function Search Path Mutable
-- Update the existing function to use proper search_path setting

CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Step 1: Clear all kiosk assignments first (no constraints)
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Step 2: Archive behavior requests to history WITHOUT reflection_id to avoid constraint issues
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
    NULL, -- Set reflection_id to NULL initially to avoid constraint
    'admin_cleared',
    'Cleared by admin - bulk queue clear',
    now()
  FROM behavior_requests br
  LEFT JOIN behavior_history bh ON bh.behavior_request_id = br.id
  WHERE br.status IN ('waiting', 'active')
  AND bh.id IS NULL; -- Only insert if no history record exists
  
  -- Step 3: Delete reflections first to remove foreign key constraint on behavior_requests
  DELETE FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Step 4: Finally delete the behavior requests (now safe)
  DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');
  
  -- Log successful operation
  INSERT INTO user_sessions (
    user_id,
    device_type,
    device_info,
    location,
    session_status
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'admin_action',
    jsonb_build_object(
      'action', 'admin_clear_all_queues',
      'timestamp', now(),
      'status', 'success'
    ),
    'Admin Dashboard',
    'completed'
  );
END;
$function$;