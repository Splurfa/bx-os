-- Fix the validate_student_birthday_password function to use correct column name
CREATE OR REPLACE FUNCTION public.validate_student_birthday_password(
  p_student_id uuid,
  p_password text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  student_dob DATE;
  expected_password TEXT;
BEGIN
  -- Get student's date of birth
  SELECT date_of_birth INTO student_dob
  FROM students 
  WHERE id = p_student_id;
  
  -- Return false if student not found or no date of birth
  IF student_dob IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Format date as MMDD (e.g., March 20th = 0320)
  expected_password := TO_CHAR(student_dob, 'MMDD');
  
  -- Compare with provided password
  RETURN p_password = expected_password;
END;
$$;