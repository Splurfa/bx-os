-- Add development mode bypass to student birthday password validation
CREATE OR REPLACE FUNCTION public.validate_student_birthday_password(p_student_id uuid, p_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  student_dob DATE;
  expected_password TEXT;
  development_mode BOOLEAN := false;
BEGIN
  -- Check for development mode bypass password
  IF p_password = '0000' THEN
    -- Log the testing bypass attempt for audit purposes
    INSERT INTO user_sessions (
      user_id,
      device_type,
      device_info,
      location,
      session_status
    ) VALUES (
      p_student_id,
      'kiosk_testing',
      jsonb_build_object(
        'bypass_used', true,
        'testing_password', '0000',
        'timestamp', now()
      ),
      'Kiosk Testing Mode',
      'testing_bypass'
    );
    
    RETURN TRUE; -- Allow access with testing password
  END IF;
  
  -- Get student's date of birth for normal validation
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
$function$