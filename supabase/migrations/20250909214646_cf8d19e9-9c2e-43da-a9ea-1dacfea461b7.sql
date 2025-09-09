-- Execute immediate database cleanup
-- Clean up old user sessions (ended sessions older than 7 days)
DELETE FROM user_sessions 
WHERE session_status = 'ended' 
  AND ended_at < now() - interval '7 days'
  AND device_type NOT IN ('admin_action', 'system_audit', 'teacher_action');

-- Clean up audit events older than 30 days
DELETE FROM user_sessions
WHERE session_status IN ('audit_log', 'completed')
  AND login_time < now() - interval '30 days';

-- Mark naturally expired device sessions as 'expired'
UPDATE device_sessions 
SET status = 'expired' 
WHERE status = 'active' AND expires_at <= now();

-- Delete expired device sessions older than 72 hours
DELETE FROM device_sessions 
WHERE status = 'expired' 
  AND expires_at < now() - interval '72 hours';

-- Delete sessions for inactive/deleted kiosks
DELETE FROM device_sessions ds
WHERE NOT EXISTS (
  SELECT 1 FROM kiosks k 
  WHERE k.id = ds.kiosk_id AND k.is_active = true
);

-- Mark sessions without heartbeat for 2+ hours as expired
UPDATE device_sessions 
SET status = 'expired'
WHERE status = 'active' 
  AND last_heartbeat < now() - interval '2 hours';

-- Clean up old behavior history (older than 2 years)
DELETE FROM behavior_history 
WHERE archived_at < now() - interval '2 years';