-- SECURITY FIX: Implement birthday authentication and secure RLS policies

-- Create function to validate student birthday password (MMDD format)
CREATE OR REPLACE FUNCTION public.validate_student_birthday_password(
  p_student_id UUID,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- SECURITY FIX: Remove dangerous anonymous policies that expose all student data
DROP POLICY IF EXISTS "Anonymous kiosk student read access" ON public.students;
DROP POLICY IF EXISTS "Anonymous family read access" ON public.families;
DROP POLICY IF EXISTS "Allow full access to csv_import_raw for processing" ON public.csv_import_raw;

-- Create minimal secure anonymous policies for kiosk operation only
CREATE POLICY "Anonymous kiosk minimal student validation" 
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

-- Secure anonymous reflection submission (kiosk workflow only)
CREATE POLICY "Anonymous kiosk reflection submission only" 
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

-- Secure CSV import access (admins only)
CREATE POLICY "Admin only csv import access" 
ON public.csv_import_raw 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Add rate limiting function for authentication attempts
CREATE OR REPLACE FUNCTION public.log_kiosk_auth_attempt(
  p_kiosk_id INTEGER,
  p_student_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;