-- Fix clear queue foreign key constraint by removing behavior_history archiving from bulk operations
-- This prevents the FK violation while maintaining audit logging through user_sessions

CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cleared_requests_count INTEGER := 0;
  cleared_reflections_count INTEGER := 0;
BEGIN
  -- Step 1: Clear all kiosk assignments first (no foreign key dependencies)
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE current_behavior_request_id IS NOT NULL;
  
  -- Step 2: Count items for logging before deletion
  SELECT COUNT(*) INTO cleared_requests_count
  FROM behavior_requests 
  WHERE status IN ('waiting', 'active');
  
  SELECT COUNT(*) INTO cleared_reflections_count
  FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Step 3: Delete reflections (now safe since no history references them)
  DELETE FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
  );
  
  -- Step 4: Delete the behavior requests (all constraints resolved)
  DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');
  
  -- Step 5: Enhanced audit logging in user_sessions
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
      'version', '4.0',
      'items_cleared', jsonb_build_object(
        'behavior_requests', cleared_requests_count,
        'reflections', cleared_reflections_count
      ),
      'note', 'Bulk clear operation - no individual archiving to behavior_history'
    ),
    'Admin Dashboard',
    'completed'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.clear_teacher_queue(p_teacher_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cleared_requests_count INTEGER := 0;
  cleared_reflections_count INTEGER := 0;
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
  
  -- Step 2: Count items for logging before deletion
  SELECT COUNT(*) INTO cleared_requests_count
  FROM behavior_requests 
  WHERE teacher_id = p_teacher_id AND status IN ('waiting', 'active');
  
  SELECT COUNT(*) INTO cleared_reflections_count
  FROM reflections 
  WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests 
    WHERE teacher_id = p_teacher_id AND status IN ('waiting', 'active')
  );
  
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
  
  -- Step 5: Enhanced audit logging in user_sessions
  INSERT INTO user_sessions (
    user_id,
    device_type,
    device_info,
    location,
    session_status
  ) VALUES (
    COALESCE(p_teacher_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'teacher_action',
    jsonb_build_object(
      'action', 'clear_teacher_queue',
      'timestamp', now(),
      'status', 'success',
      'version', '4.0',
      'items_cleared', jsonb_build_object(
        'behavior_requests', cleared_requests_count,
        'reflections', cleared_reflections_count
      ),
      'note', 'Bulk clear operation - no individual archiving to behavior_history'
    ),
    'Teacher Dashboard',
    'completed'
  );
  
  -- Step 6: Reassign waiting students to available kiosks
  PERFORM reassign_waiting_students();
END;
$function$;