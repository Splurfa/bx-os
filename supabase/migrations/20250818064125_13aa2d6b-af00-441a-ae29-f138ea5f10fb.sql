-- Create Zach Summerfield's super admin profile
-- Note: This user will be created when they first log in via Google OAuth
-- We're creating a profile entry that will be linked to their Google account

-- First check if super_admin role exists in any constraints or enums
-- If profiles.role has an enum constraint, we may need to add super_admin

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