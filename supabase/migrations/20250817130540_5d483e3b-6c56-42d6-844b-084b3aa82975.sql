-- PHASE 1.1: Database Foundation - Add Super Admin Role System
-- Following docs/technical/database-migration-plan.md

-- Step 1: Create role_type enum with all three values
CREATE TYPE role_type AS ENUM ('teacher', 'admin', 'super_admin');

-- Step 2: Alter profiles table to use the new enum type
-- First, we need to update the column type
ALTER TABLE profiles ALTER COLUMN role TYPE role_type USING role::role_type;

-- Step 3: Create Zach's profile if it doesn't exist, or update existing
-- We'll use an UPSERT (INSERT ... ON CONFLICT) to handle both cases
INSERT INTO profiles (id, email, full_name, role, first_name, last_name)
VALUES (
  gen_random_uuid(), 
  'zach@zavitechllc.com', 
  'Zach Zavitechllc', 
  'super_admin',
  'Zach',
  'Zavitechllc'
)
ON CONFLICT (id) DO NOTHING;

-- If the profile already exists but with different email, update the role
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'zach@zavitechllc.com';

-- Step 4: Update RLS policies to include super_admin access
-- Update admin policies to include super_admin role
-- Admins can update any profile policy
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" 
ON profiles 
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'super_admin')
  )
);

-- Update the admin_update_user_role function to allow super_admin operations
CREATE OR REPLACE FUNCTION public.admin_update_user_role(p_target_user_id uuid, p_new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Super admins and admins can change roles
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: admin or super_admin only';
  END IF;

  -- Validate role (super_admin can assign any role including super_admin)
  IF p_new_role NOT IN ('teacher', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_new_role;
  END IF;

  -- Update the target user's role
  UPDATE public.profiles
  SET role = p_new_role,
      updated_at = now()
  WHERE id = p_target_user_id;
END;
$function$;