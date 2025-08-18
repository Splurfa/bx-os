-- Add unique constraint on email and create super admin profiles
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Insert Zach's profile with super_admin role
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  department,
  is_active
) VALUES (
  gen_random_uuid(),
  'zsummerfield@hillelhebrew.org',
  'Zach Summerfield',
  'super_admin',
  'Administration',
  true
) ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  full_name = 'Zach Summerfield',
  department = 'Administration',
  is_active = true;

-- Also create a demo super admin profile for testing
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  department,
  is_active
) VALUES (
  gen_random_uuid(),
  'superadmin@school.edu',
  'Super Admin Demo',
  'super_admin',
  'Administration',
  true
) ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  full_name = 'Super Admin Demo',
  department = 'Administration',
  is_active = true;