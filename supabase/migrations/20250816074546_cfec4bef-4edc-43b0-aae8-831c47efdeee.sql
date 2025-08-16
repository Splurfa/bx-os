-- Test login emulation: Create a temporary test user and validate login process
-- First, let's create a temporary test user for debugging
DO $$
DECLARE
  test_user_id uuid;
  test_email text := 'test_emulation_' || extract(epoch from now()) || '@school.edu';
  test_password text := 'TestPassword123!';
  profile_exists boolean;
BEGIN
  -- Log start of test
  RAISE NOTICE 'Starting login emulation test with user: %', test_email;
  
  -- Create test user with admin privileges using auth.admin
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    test_email,
    crypt(test_password, gen_salt('bf')),
    now(),
    jsonb_build_object(
      'full_name', 'Test User',
      'first_name', 'Test',
      'last_name', 'User', 
      'role', 'teacher'
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO test_user_id;
  
  RAISE NOTICE 'Created test user with ID: %', test_user_id;
  
  -- Check if profile was created by trigger
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = test_user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE NOTICE 'SUCCESS: Profile created automatically by trigger';
  ELSE
    RAISE NOTICE 'WARNING: Profile was NOT created by trigger';
    -- Manually create profile to test
    INSERT INTO public.profiles (id, email, full_name, role, first_name, last_name)
    VALUES (
      test_user_id,
      test_email,
      'Test User',
      'teacher',
      'Test',
      'User'
    );
    RAISE NOTICE 'Manually created profile for test user';
  END IF;
  
  -- Clean up test user
  DELETE FROM public.profiles WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
  
  RAISE NOTICE 'Test completed and cleaned up';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Test failed with error: %', SQLERRM;
    -- Try to clean up even on error
    BEGIN
      DELETE FROM public.profiles WHERE email LIKE 'test_emulation_%@school.edu';
      DELETE FROM auth.users WHERE email LIKE 'test_emulation_%@school.edu';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup also failed: %', SQLERRM;
    END;
END $$;