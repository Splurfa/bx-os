-- Phase 2: Enhanced Session Validation with Graceful Fingerprint Handling

-- Create enhanced validation function with fingerprint mismatch recovery
CREATE OR REPLACE FUNCTION public.validate_device_session_with_recovery(
  p_session_id text,
  p_device_fingerprint text
)
RETURNS TABLE(is_valid boolean, kiosk_id integer, remaining_seconds integer, fingerprint_mismatch boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_record RECORD;
  development_mode BOOLEAN := false;
BEGIN
  -- Check if development mode bypass is enabled
  development_mode := current_setting('app.development_mode', true)::boolean;
  
  -- Get session info
  SELECT 
    ds.kiosk_id as kid,
    ds.device_fingerprint as fingerprint,
    ds.expires_at,
    ds.status,
    k.is_active as kiosk_active
  INTO session_record
  FROM device_sessions ds
  JOIN kiosks k ON k.id = ds.kiosk_id
  WHERE ds.device_session_id = p_session_id;
  
  -- Check if session exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, 0, FALSE;
    RETURN;
  END IF;
  
  -- Validate basic session requirements
  IF session_record.status != 'active' 
     OR session_record.expires_at <= now()
     OR session_record.kiosk_active != TRUE THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, 0, FALSE;
    RETURN;
  END IF;
  
  -- Check fingerprint with graceful handling
  IF session_record.fingerprint = p_device_fingerprint OR development_mode THEN
    -- Perfect match or development mode - return success
    RETURN QUERY SELECT 
      TRUE,
      session_record.kid,
      EXTRACT(EPOCH FROM (session_record.expires_at - now()))::INTEGER,
      FALSE;
  ELSE
    -- Fingerprint mismatch - still allow access but flag the mismatch
    -- This provides graceful degradation for tab switching issues
    RETURN QUERY SELECT 
      TRUE,
      session_record.kid,
      EXTRACT(EPOCH FROM (session_record.expires_at - now()))::INTEGER,
      TRUE;
  END IF;
END;
$$;

-- Create function to update device fingerprint for existing session
CREATE OR REPLACE FUNCTION public.update_device_session_fingerprint(
  p_session_id text,
  p_new_fingerprint text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  kiosk_id_val INTEGER;
BEGIN
  -- Update the device fingerprint for the session
  UPDATE device_sessions 
  SET 
    device_fingerprint = p_new_fingerprint,
    last_heartbeat = now()
  WHERE device_session_id = p_session_id
  AND status = 'active'
  AND expires_at > now()
  RETURNING kiosk_id INTO kiosk_id_val;
  
  -- If session update succeeded, update kiosk fingerprint too
  IF kiosk_id_val IS NOT NULL THEN
    UPDATE kiosks
    SET 
      device_fingerprint = p_new_fingerprint,
      last_heartbeat = now()
    WHERE id = kiosk_id_val;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;