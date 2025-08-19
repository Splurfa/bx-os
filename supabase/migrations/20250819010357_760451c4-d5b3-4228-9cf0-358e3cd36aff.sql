-- Phase 0.5: Device Instance Management System - Database Schema Enhancements

-- Add device session tracking columns to kiosks table
ALTER TABLE public.kiosks 
ADD COLUMN IF NOT EXISTS device_session_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS session_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS access_url TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS created_by_admin UUID REFERENCES auth.users(id);

-- Create device_sessions table for comprehensive session tracking
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_session_id TEXT NOT NULL UNIQUE,
  kiosk_id INTEGER REFERENCES public.kiosks(id),
  device_fingerprint TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on device_sessions
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for device_sessions
CREATE POLICY "Anonymous kiosk session access" 
ON public.device_sessions 
FOR SELECT 
USING (status = 'active' AND expires_at > now());

CREATE POLICY "Admins can manage device sessions" 
ON public.device_sessions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'super_admin'])
));

CREATE POLICY "System can manage device sessions" 
ON public.device_sessions 
FOR ALL 
USING (true);

-- Create function to generate unique device session ID
CREATE OR REPLACE FUNCTION public.generate_device_session_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_id TEXT;
  collision_count INT := 0;
BEGIN
  LOOP
    -- Generate a URL-safe session ID (8 characters)
    session_id := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    
    -- Remove URL-unsafe characters
    session_id := replace(replace(replace(session_id, '/', ''), '+', ''), '=', '');
    
    -- Ensure it's exactly 8 characters
    IF length(session_id) = 8 THEN
      -- Check for collisions
      IF NOT EXISTS (
        SELECT 1 FROM device_sessions WHERE device_session_id = session_id
        UNION
        SELECT 1 FROM kiosks WHERE device_session_id = session_id
      ) THEN
        RETURN session_id;
      END IF;
    END IF;
    
    collision_count := collision_count + 1;
    
    -- Prevent infinite loops
    IF collision_count > 100 THEN
      RAISE EXCEPTION 'Failed to generate unique session ID after 100 attempts';
    END IF;
  END LOOP;
END;
$$;

-- Create function to create device session
CREATE OR REPLACE FUNCTION public.create_device_session(
  p_kiosk_id INTEGER,
  p_device_fingerprint TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_expires_in_hours INTEGER DEFAULT 24
)
RETURNS TABLE(session_id TEXT, access_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_session_id TEXT;
  new_access_url TEXT;
  expires_at_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate unique session ID
  new_session_id := generate_device_session_id();
  
  -- Calculate expiration time
  expires_at_time := now() + (p_expires_in_hours || ' hours')::interval;
  
  -- Generate access URL
  new_access_url := '/kiosk/' || new_session_id;
  
  -- Insert device session
  INSERT INTO public.device_sessions (
    device_session_id,
    kiosk_id,
    device_fingerprint,
    user_agent,
    ip_address,
    expires_at,
    status
  ) VALUES (
    new_session_id,
    p_kiosk_id,
    p_device_fingerprint,
    p_user_agent,
    p_ip_address,
    expires_at_time,
    'active'
  );
  
  -- Update kiosk with session info
  UPDATE public.kiosks 
  SET 
    device_session_id = new_session_id,
    device_fingerprint = p_device_fingerprint,
    session_expires_at = expires_at_time,
    session_status = 'active',
    access_url = new_access_url,
    last_heartbeat = now(),
    updated_at = now()
  WHERE id = p_kiosk_id;
  
  RETURN QUERY SELECT new_session_id, new_access_url;
END;
$$;

-- Create function to validate device session
CREATE OR REPLACE FUNCTION public.validate_device_session(
  p_session_id TEXT,
  p_device_fingerprint TEXT
)
RETURNS TABLE(
  is_valid BOOLEAN,
  kiosk_id INTEGER,
  remaining_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  session_record RECORD;
BEGIN
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
  
  -- Check if session exists and is valid
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, 0;
    RETURN;
  END IF;
  
  -- Validate session
  IF session_record.status = 'active' 
     AND session_record.expires_at > now()
     AND session_record.fingerprint = p_device_fingerprint
     AND session_record.kiosk_active = TRUE THEN
    
    -- Update heartbeat
    UPDATE device_sessions 
    SET last_heartbeat = now()
    WHERE device_session_id = p_session_id;
    
    UPDATE kiosks
    SET last_heartbeat = now()
    WHERE id = session_record.kid;
    
    RETURN QUERY SELECT 
      TRUE,
      session_record.kid,
      EXTRACT(EPOCH FROM (session_record.expires_at - now()))::INTEGER;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::INTEGER, 0;
  END IF;
END;
$$;

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_device_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Mark expired sessions as inactive
  UPDATE device_sessions 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at <= now();
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Clear kiosk session info for expired sessions
  UPDATE kiosks 
  SET 
    device_session_id = NULL,
    device_fingerprint = NULL,
    session_expires_at = NULL,
    session_status = 'inactive',
    access_url = NULL
  WHERE session_expires_at <= now()
  AND session_status = 'active';
  
  RETURN cleaned_count;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_sessions_session_id ON device_sessions(device_session_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_status_expires ON device_sessions(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_kiosks_device_session ON kiosks(device_session_id);
CREATE INDEX IF NOT EXISTS idx_kiosks_session_status ON kiosks(session_status);