-- Create user_sessions table for comprehensive session tracking
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  device_type text NOT NULL CHECK (device_type IN ('admin', 'teacher', 'student', 'kiosk')),
  login_time timestamp with time zone NOT NULL DEFAULT now(),
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  session_status text NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'idle', 'ended')),
  location text,
  kiosk_id integer,
  device_identifier text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for session management
CREATE POLICY "Teachers and admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any session" 
ON public.user_sessions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can end their own sessions" 
ON public.user_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can end any session" 
ON public.user_sessions 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_device_type ON public.user_sessions(device_type);
CREATE INDEX idx_user_sessions_session_status ON public.user_sessions(session_status);
CREATE INDEX idx_user_sessions_kiosk_id ON public.user_sessions(kiosk_id) WHERE kiosk_id IS NOT NULL;
CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions(last_activity);

-- Create function to automatically create session on login
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id uuid,
  p_device_type text,
  p_location text DEFAULT NULL,
  p_kiosk_id integer DEFAULT NULL,
  p_device_identifier text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  session_id uuid;
BEGIN
  -- End any existing active sessions for the user
  UPDATE public.user_sessions 
  SET session_status = 'ended', updated_at = now()
  WHERE user_id = p_user_id 
  AND session_status = 'active';
  
  -- Create new session
  INSERT INTO public.user_sessions (
    user_id, device_type, location, kiosk_id, device_identifier, metadata
  ) VALUES (
    p_user_id, p_device_type, p_location, p_kiosk_id, p_device_identifier, p_metadata
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Create function to update session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET 
    last_activity = now(),
    session_status = 'active',
    updated_at = now()
  WHERE id = p_session_id;
END;
$$;

-- Create function to end session
CREATE OR REPLACE FUNCTION public.end_user_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET 
    session_status = 'ended',
    updated_at = now()
  WHERE id = p_session_id;
END;
$$;

-- Create function to get active sessions summary
CREATE OR REPLACE FUNCTION public.get_active_sessions_summary()
RETURNS TABLE (
  device_type text,
  active_count bigint,
  idle_count bigint,
  total_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    us.device_type,
    COUNT(*) FILTER (WHERE us.session_status = 'active') as active_count,
    COUNT(*) FILTER (WHERE us.session_status = 'idle') as idle_count,
    COUNT(*) as total_count
  FROM public.user_sessions us
  WHERE us.session_status IN ('active', 'idle')
  GROUP BY us.device_type
  ORDER BY us.device_type;
$$;