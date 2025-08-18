-- Fix the search_path security issue in the user registration function
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role TEXT DEFAULT 'teacher';
  user_full_name TEXT;
BEGIN
  -- Extract full name from metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NEW.email
  );
  
  -- Determine role based on email domain and specific users
  IF NEW.email = 'zsummerfield@hillelhebrew.org' THEN
    user_role := 'super_admin';
  ELSIF NEW.email LIKE '%@hillelhebrew.org' THEN
    user_role := 'admin';
  ELSIF NEW.email IN ('admin@school.edu', 'superadmin@school.edu') THEN
    user_role := 'admin';
  ELSIF NEW.email = 'teacher@school.edu' THEN
    user_role := 'teacher';
  ELSE
    -- Default role for other users
    user_role := 'teacher';
  END IF;
  
  -- Insert profile for new user
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_role,
    CASE 
      WHEN user_role = 'super_admin' THEN 'Administration'
      WHEN user_role = 'admin' THEN 'Administration'
      ELSE 'Education'
    END,
    true
  );
  
  RETURN NEW;
END;
$$;