-- Create read-only session validation function
CREATE OR REPLACE FUNCTION public.validate_device_session_readonly(p_session_id text, p_device_fingerprint text)
 RETURNS TABLE(is_valid boolean, kiosk_id integer, remaining_seconds integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  session_record RECORD;
BEGIN
  -- Get session info without any updates
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
  
  -- Check if session exists and is valid
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, 0;
    RETURN;
  END IF;
  
  -- Validate session (read-only, no updates)
  IF session_record.status = 'active' 
     AND session_record.expires_at > now()
     AND session_record.fingerprint = p_device_fingerprint
     AND session_record.kiosk_active = TRUE THEN
    
    RETURN QUERY SELECT 
      TRUE,
      session_record.kid,
      EXTRACT(EPOCH FROM (session_record.expires_at - now()))::INTEGER;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::INTEGER, 0;
  END IF;
END;
$function$;

-- Create separate heartbeat update function
CREATE OR REPLACE FUNCTION public.update_session_heartbeat(p_session_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  kiosk_id_val INTEGER;
BEGIN
  -- Update device session heartbeat
  UPDATE device_sessions 
  SET last_heartbeat = now()
  WHERE device_session_id = p_session_id
  AND status = 'active'
  AND expires_at > now()
  RETURNING kiosk_id INTO kiosk_id_val;
  
  -- If session update succeeded, update kiosk heartbeat too
  IF kiosk_id_val IS NOT NULL THEN
    UPDATE kiosks
    SET last_heartbeat = now()
    WHERE id = kiosk_id_val;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;