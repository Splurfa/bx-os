-- Fix search paths for all existing functions to address security warnings

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix end_user_session function
CREATE OR REPLACE FUNCTION public.end_user_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET 
    session_status = 'ended',
    ended_at = now()
  WHERE id = p_session_id;
END;
$$;

-- Fix create_user_session function
CREATE OR REPLACE FUNCTION public.create_user_session(p_user_id uuid, p_device_type text DEFAULT NULL::text, p_device_info jsonb DEFAULT NULL::jsonb, p_location text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO public.user_sessions (
    user_id,
    device_type,
    device_info,
    location
  ) VALUES (
    p_user_id,
    p_device_type,
    p_device_info,
    p_location
  )
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;