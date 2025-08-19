-- Add index for better session performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_status ON user_sessions(user_id, session_status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status_activity ON user_sessions(session_status, last_activity);

-- Add index for device sessions performance
CREATE INDEX IF NOT EXISTS idx_device_sessions_status_expires ON device_sessions(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_device_sessions_kiosk_status ON device_sessions(kiosk_id, status);

-- Update device session cleanup to be more efficient
CREATE OR REPLACE FUNCTION public.cleanup_expired_device_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Mark expired sessions as inactive with better performance
  UPDATE device_sessions 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at <= now();
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Clear kiosk session info for expired sessions more efficiently
  UPDATE kiosks 
  SET 
    device_session_id = NULL,
    device_fingerprint = NULL,
    session_expires_at = NULL,
    session_status = 'inactive',
    access_url = NULL,
    updated_at = now()
  WHERE session_expires_at <= now()
  AND session_status = 'active';
  
  -- Clean up old expired sessions (older than 7 days)
  DELETE FROM device_sessions 
  WHERE status = 'expired' 
  AND expires_at < now() - interval '7 days';
  
  RETURN cleaned_count;
END;
$function$;