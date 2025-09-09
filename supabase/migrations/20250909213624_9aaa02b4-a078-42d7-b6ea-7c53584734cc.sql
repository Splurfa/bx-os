-- Session Cleanup System with 72-hour Device Session Retention
-- Phase 1: User Session Cleanup Function
CREATE OR REPLACE FUNCTION public.cleanup_old_user_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  -- Delete ended user sessions older than 7 days (excluding audit events)
  DELETE FROM user_sessions 
  WHERE session_status = 'ended' 
    AND ended_at < now() - interval '7 days'
    AND device_type NOT IN ('admin_action', 'system_audit', 'teacher_action');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_deleted := total_deleted + deleted_count;
  
  -- Delete audit events older than 30 days
  DELETE FROM user_sessions
  WHERE session_status IN ('audit_log', 'completed')
    AND login_time < now() - interval '30 days';
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_deleted := total_deleted + deleted_count;
  
  RETURN total_deleted;
END;
$function$;

-- Phase 2: Enhanced Device Session Cleanup Function (72-hour retention)
CREATE OR REPLACE FUNCTION public.cleanup_device_sessions_enhanced()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
  deleted_count INTEGER := 0;
  total_cleaned INTEGER := 0;
BEGIN
  -- Mark naturally expired sessions as 'expired'
  UPDATE device_sessions 
  SET status = 'expired' 
  WHERE status = 'active' AND expires_at <= now();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  total_cleaned := total_cleaned + updated_count;
  
  -- Delete expired sessions older than 72 hours from expiration
  DELETE FROM device_sessions 
  WHERE status = 'expired' 
    AND expires_at < now() - interval '72 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_cleaned := total_cleaned + deleted_count;
  
  -- Delete sessions for inactive/deleted kiosks
  DELETE FROM device_sessions ds
  WHERE NOT EXISTS (
    SELECT 1 FROM kiosks k 
    WHERE k.id = ds.kiosk_id AND k.is_active = true
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  total_cleaned := total_cleaned + deleted_count;
  
  -- Mark sessions without heartbeat for 2+ hours as expired
  UPDATE device_sessions 
  SET status = 'expired'
  WHERE status = 'active' 
    AND last_heartbeat < now() - interval '2 hours';
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  total_cleaned := total_cleaned + updated_count;
  
  RETURN total_cleaned;
END;
$function$;

-- Phase 3: Cleanup Statistics Function
CREATE OR REPLACE FUNCTION public.get_cleanup_stats()
RETURNS TABLE(
  table_name text,
  total_records integer,
  cleanup_eligible integer,
  retention_policy text,
  last_cleanup timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT 
    'user_sessions'::text,
    COUNT(*)::integer,
    COUNT(*) FILTER (WHERE session_status = 'ended' AND ended_at < now() - interval '7 days')::integer,
    'Ended sessions: 7 days, Audit events: 30 days'::text,
    (SELECT MAX(login_time) FROM user_sessions WHERE device_type = 'cleanup_job')
  FROM user_sessions
  
  UNION ALL
  
  SELECT 
    'device_sessions'::text,
    COUNT(*)::integer, 
    COUNT(*) FILTER (WHERE status = 'expired' AND expires_at < now() - interval '72 hours')::integer,
    'Expired sessions: 72 hours'::text,
    (SELECT MAX(created_at) FROM user_sessions WHERE device_type = 'cleanup_job')
  FROM device_sessions
  
  UNION ALL
  
  SELECT 
    'behavior_history'::text,
    COUNT(*)::integer,
    COUNT(*) FILTER (WHERE archived_at < now() - interval '2 years')::integer,
    'Archived records: 2 years'::text,
    (SELECT MAX(created_at) FROM user_sessions WHERE device_type = 'cleanup_job')
  FROM behavior_history;
END;
$function$;

-- Phase 4: Master Cleanup Function
CREATE OR REPLACE FUNCTION public.run_nightly_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_sessions_cleaned INTEGER;
  device_sessions_cleaned INTEGER;
  behavior_history_cleaned INTEGER;
  cleanup_results JSONB;
BEGIN
  -- Run all cleanup functions
  SELECT cleanup_old_user_sessions() INTO user_sessions_cleaned;
  SELECT cleanup_device_sessions_enhanced() INTO device_sessions_cleaned;
  SELECT cleanup_old_behavior_history() INTO behavior_history_cleaned;
  
  -- Log cleanup results
  cleanup_results := jsonb_build_object(
    'timestamp', now(),
    'user_sessions_cleaned', user_sessions_cleaned,
    'device_sessions_cleaned', device_sessions_cleaned,
    'behavior_history_cleaned', behavior_history_cleaned,
    'status', 'completed'
  );
  
  -- Log the cleanup event
  INSERT INTO user_sessions (
    user_id,
    device_type,
    device_info,
    location,
    session_status
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'cleanup_job',
    cleanup_results,
    'System Maintenance',
    'completed'
  );
  
  RETURN cleanup_results;
END;
$function$;

-- Phase 5: Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_cleanup 
ON user_sessions(session_status, ended_at) 
WHERE session_status = 'ended';

CREATE INDEX IF NOT EXISTS idx_user_sessions_audit_cleanup 
ON user_sessions(session_status, login_time) 
WHERE session_status IN ('audit_log', 'completed');

CREATE INDEX IF NOT EXISTS idx_device_sessions_cleanup 
ON device_sessions(status, expires_at) 
WHERE status IN ('expired', 'active');

CREATE INDEX IF NOT EXISTS idx_device_sessions_heartbeat 
ON device_sessions(status, last_heartbeat) 
WHERE status = 'active';

-- Phase 6: Schedule Nightly Cleanup (requires pg_cron extension)
-- Note: This will be enabled after confirming pg_cron is available
-- SELECT cron.schedule(
--   'nightly-session-cleanup',
--   '0 2 * * *',
--   'SELECT run_nightly_cleanup();'
-- );