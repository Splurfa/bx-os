-- Fix generate_device_session_id function to work reliably
-- Replace gen_random_bytes() with gen_random_uuid() to avoid search_path issues

CREATE OR REPLACE FUNCTION public.generate_device_session_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  session_id TEXT;
  collision_count INT := 0;
BEGIN
  LOOP
    -- Generate a URL-safe session ID (8 characters) using uuid
    session_id := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8));
    
    -- Check for collisions
    IF NOT EXISTS (
      SELECT 1 FROM device_sessions WHERE device_session_id = session_id
      UNION
      SELECT 1 FROM kiosks WHERE device_session_id = session_id
    ) THEN
      RETURN session_id;
    END IF;
    
    collision_count := collision_count + 1;
    
    -- Prevent infinite loops
    IF collision_count > 100 THEN
      RAISE EXCEPTION 'Failed to generate unique session ID after 100 attempts';
    END IF;
  END LOOP;
END;
$function$