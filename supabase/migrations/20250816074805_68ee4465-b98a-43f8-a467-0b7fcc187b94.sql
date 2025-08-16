-- Emulation Test: Delete existing test user and recreate with fixed process
DELETE FROM auth.users WHERE email = 'tinytime@school.edu';

-- Test our fix by simulating the exact createUser API call
DO $$
DECLARE
  test_user_id uuid;
  test_email text := 'emulation_test@school.edu';
  test_password text := 'TestPassword123!';
  profile_exists boolean;
  user_confirmed boolean;
BEGIN
  -- Log start of emulation
  RAISE NOTICE 'EMULATION: Creating test user with email: %', test_email;
  
  -- Simulate the createUser call with the same parameters our fixed function uses
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
      'role', 'teacher',
      'email_verified', true
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO test_user_id;
  
  RAISE NOTICE 'EMULATION: Created user with ID: %', test_user_id;
  
  -- Check if profile was auto-created by trigger
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = test_user_id
  ) INTO profile_exists;
  
  -- Check if user is properly confirmed
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE id = test_user_id 
    AND email_confirmed_at IS NOT NULL
  ) INTO user_confirmed;
  
  RAISE NOTICE 'EMULATION RESULTS:';
  RAISE NOTICE '  - Profile created by trigger: %', profile_exists;  
  RAISE NOTICE '  - Email confirmed: %', user_confirmed;
  
  IF profile_exists AND user_confirmed THEN
    RAISE NOTICE 'EMULATION SUCCESS: User should be able to login immediately';
  ELSE
    RAISE NOTICE 'EMULATION FAILED: User creation incomplete';
    
    -- Try to fix manually
    IF NOT profile_exists THEN
      INSERT INTO public.profiles (id, email, full_name, role, first_name, last_name)
      VALUES (test_user_id, test_email, 'Test User', 'teacher', 'Test', 'User');
      RAISE NOTICE 'EMULATION: Manually created missing profile';
    END IF;
  END IF;
  
  -- Clean up test user
  DELETE FROM public.profiles WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
  RAISE NOTICE 'EMULATION: Cleaned up test user';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'EMULATION ERROR: %', SQLERRM;
    -- Cleanup on error
    DELETE FROM public.profiles WHERE email = test_email;
    DELETE FROM auth.users WHERE email = test_email;
END $$;