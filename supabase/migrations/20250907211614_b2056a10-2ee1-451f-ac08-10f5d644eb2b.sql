-- Restore original validate_student_birthday_password function without "0000" bypass
CREATE OR REPLACE FUNCTION validate_student_birthday_password(
  p_student_id UUID,
  p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  student_birthday DATE;
  expected_password TEXT;
BEGIN
  -- Get the student's birthday
  SELECT birthday INTO student_birthday
  FROM students 
  WHERE id = p_student_id;
  
  -- If student not found, return false
  IF student_birthday IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Format birthday as MMDD (e.g., March 15 becomes "0315")
  expected_password := TO_CHAR(student_birthday, 'MMDD');
  
  -- Check if provided password matches
  RETURN p_password = expected_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;