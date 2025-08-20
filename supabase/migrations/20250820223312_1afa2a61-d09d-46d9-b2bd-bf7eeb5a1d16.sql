-- Fix admin_clear_all_queues function to handle foreign key constraints properly
CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Step 1: Clear all kiosk assignments first (no foreign key dependencies)
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id IS NOT NULL;
  
  -- Step 2: Archive all active behavior requests to history (without reflection_id for now)
  INSERT INTO behavior_history (
    behavior_request_id,
    student_id,
    reflection_id,  -- Will be NULL for now to avoid constraint issues
    resolution_type,
    resolution_notes,
    archived_at
  )
  SELECT 
    br.id,
    br.student_id,
    NULL,  -- Set to NULL initially to avoid foreign key constraint
    'admin_cleared',
    'Cleared by admin - bulk queue clear',
    now()
  FROM behavior_requests br
  LEFT JOIN behavior_history bh ON bh.behavior_request_id = br.id
  WHERE br.status IN ('waiting', 'active')
  AND bh.id IS NULL; -- Only insert if no history record exists
  
  -- Step 3: Update behavior_history with reflection_ids where they exist
  UPDATE behavior_history bh
  SET reflection_id = r.id
  FROM reflections r
  WHERE r.behavior_request_id = bh.behavior_request_id
  AND bh.reflection_id IS NULL
  AND bh.resolution_type = 'admin_cleared'
  AND bh.archived_at >= now() - interval '1 minute'; -- Only update recently archived ones
  
  -- Step 4: Delete reflections (now safe since history is archived)
  DELETE FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Step 5: Finally delete the behavior requests (all constraints resolved)
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
      'status', 'success',
      'version', '2.0'
    ),
    'Admin Dashboard',
    'completed'
  );
END;
$function$;