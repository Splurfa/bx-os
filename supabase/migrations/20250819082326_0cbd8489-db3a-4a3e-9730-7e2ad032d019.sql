-- Create test super admin account directly
-- This is a one-time setup to bootstrap the super admin system

-- First check if the test super admin already exists
DO $$
DECLARE
  test_admin_exists BOOLEAN;
BEGIN
  -- Check if superadmin@school.edu already exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'superadmin@school.edu'
  ) INTO test_admin_exists;
  
  IF NOT test_admin_exists THEN
    -- Call the edge function to create the test super admin
    RAISE NOTICE 'Test super admin does not exist. Please use the create-super-admin-test edge function to create it.';
  ELSE
    RAISE NOTICE 'Test super admin already exists with email: superadmin@school.edu';
  END IF;
END $$;