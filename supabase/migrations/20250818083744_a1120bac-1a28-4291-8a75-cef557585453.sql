-- PHASE 1: CRITICAL SECURITY FIXES
-- Fix dangerous anonymous RLS policies that expose sensitive data

-- 1. Remove dangerous anonymous access to students table
DROP POLICY IF EXISTS "Anonymous kiosk minimal student validation" ON public.students;

-- Create secure minimal student access for kiosks only
CREATE POLICY "Anonymous kiosk student authentication only" 
ON public.students 
FOR SELECT 
USING (
  auth.role() = 'anon' 
  AND id IN (
    SELECT current_student_id 
    FROM kiosks 
    WHERE is_active = true 
    AND current_student_id IS NOT NULL
  )
);

-- 2. Remove any dangerous anonymous access to families (if exists)
DROP POLICY IF EXISTS "Anonymous can view families" ON public.families;

-- 3. Remove any dangerous anonymous access to guardians (if exists) 
DROP POLICY IF EXISTS "Anonymous can view guardians" ON public.guardians;

-- 4. Secure behavior_requests anonymous access - limit to essential fields only
DROP POLICY IF EXISTS "Anonymous kiosk behavior request read access" ON public.behavior_requests;

-- Create minimal anonymous access for behavior requests
CREATE POLICY "Anonymous kiosk behavior request minimal access" 
ON public.behavior_requests 
FOR SELECT 
USING (
  auth.role() = 'anon' 
  AND status = 'waiting'
  AND id IN (
    SELECT current_behavior_request_id 
    FROM kiosks 
    WHERE is_active = true 
    AND current_behavior_request_id IS NOT NULL
  )
);

-- 5. Secure reflections anonymous access - only allow creation, not reading
DROP POLICY IF EXISTS "Anonymous kiosk reflection creation" ON public.reflections;
DROP POLICY IF EXISTS "Anonymous kiosk reflection submission only" ON public.reflections;

-- Create secure anonymous reflection policy - INSERT only for active kiosk sessions
CREATE POLICY "Anonymous kiosk reflection submission" 
ON public.reflections 
FOR INSERT 
WITH CHECK (
  auth.role() = 'anon' 
  AND behavior_request_id IN (
    SELECT current_behavior_request_id 
    FROM kiosks 
    WHERE is_active = true 
    AND current_behavior_request_id IS NOT NULL
  )
);

-- 6. Fix function search_path security warnings
-- Update all functions to use proper SECURITY DEFINER with search_path

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.validate_student_birthday_password(p_student_id uuid, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  student_dob DATE;
  expected_password TEXT;
BEGIN
  -- Get student's date of birth
  SELECT date_of_birth INTO student_dob
  FROM students
  WHERE id = p_student_id;
  
  -- Return false if student not found or no DOB
  IF student_dob IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Format birthday as MMDD (e.g., "0315" for March 15)
  expected_password := TO_CHAR(student_dob, 'MMDD');
  
  -- Compare with provided password
  RETURN p_password = expected_password;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_kiosk_auth_attempt(p_kiosk_id integer, p_student_id uuid DEFAULT NULL::uuid, p_success boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log authentication attempt (can be extended for rate limiting)
  INSERT INTO user_sessions (
    user_id,
    device_type,
    device_info,
    location,
    session_status
  ) VALUES (
    p_student_id,
    'kiosk',
    jsonb_build_object(
      'kiosk_id', p_kiosk_id,
      'auth_success', p_success,
      'auth_timestamp', now()
    ),
    'Kiosk ' || p_kiosk_id,
    CASE WHEN p_success THEN 'active' ELSE 'failed' END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_session(p_user_id uuid, p_device_type text DEFAULT NULL::text, p_device_info jsonb DEFAULT NULL::jsonb, p_location text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.end_user_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_sessions 
  SET 
    session_status = 'ended',
    ended_at = now()
  WHERE id = p_session_id;
END;
$function$;

-- 7. Add rate limiting for kiosk authentication attempts
CREATE OR REPLACE FUNCTION public.check_kiosk_rate_limit(p_kiosk_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count failed attempts in last 5 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM user_sessions
  WHERE device_info->>'kiosk_id' = p_kiosk_id::text
    AND session_status = 'failed'
    AND created_at > now() - interval '5 minutes';
  
  -- Allow max 5 failed attempts per 5 minutes
  RETURN attempt_count < 5;
END;
$function$;