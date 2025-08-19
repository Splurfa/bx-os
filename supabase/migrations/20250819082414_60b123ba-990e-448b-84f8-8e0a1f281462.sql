-- Create test super admin account using auth.admin functions
-- This bypasses the edge function since we have direct database access

-- Insert the test user into auth.users (this simulates the auth.admin.createUser call)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
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
  'superadmin@school.edu',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Super Administrator", "first_name": "Super", "last_name": "Administrator", "role": "super_admin", "email_verified": true}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID we just created
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'superadmin@school.edu';
  
  -- Insert the profile (this will be handled by the trigger, but let's ensure it exists)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    is_active
  ) VALUES (
    user_uuid,
    'superadmin@school.edu',
    'Super Administrator',
    'super_admin',
    'Administration',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    full_name = 'Super Administrator',
    department = 'Administration';
    
  RAISE NOTICE 'Test super admin created with ID: %', user_uuid;
END $$;