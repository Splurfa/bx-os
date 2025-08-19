-- Fix the test super admin account role
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'superadmin@school.edu';