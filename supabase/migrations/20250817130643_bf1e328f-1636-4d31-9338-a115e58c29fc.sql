-- PHASE 1.1: Database Foundation - Add Super Admin Role System (Fixed)
-- Following docs/technical/database-migration-plan.md

-- Step 1: Create role_type enum with all three values
CREATE TYPE role_type AS ENUM ('teacher', 'admin', 'super_admin');

-- Step 2: Fix the default constraint issue before altering column type
-- First, drop the existing default constraint
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Then, alter the column type using the existing values
ALTER TABLE profiles ALTER COLUMN role TYPE role_type USING role::role_type;

-- Re-add the default constraint with proper enum type
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'teacher'::role_type;

-- Step 3: Create Zach's super admin profile
-- First check if a profile with this email exists, if not create one
DO $$
BEGIN
    -- Check if Zach's profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'zach@zavitechllc.com') THEN
        -- Create new profile for Zach
        INSERT INTO profiles (id, email, full_name, role, first_name, last_name)
        VALUES (
            gen_random_uuid(), 
            'zach@zavitechllc.com', 
            'Zach Zavitechllc', 
            'super_admin'::role_type,
            'Zach',
            'Zavitechllc'
        );
    ELSE
        -- Update existing profile to super_admin
        UPDATE profiles 
        SET role = 'super_admin'::role_type 
        WHERE email = 'zach@zavitechllc.com';
    END IF;
END $$;

-- Step 4: Update RLS policies to include super_admin access
-- Update admin policies to include super_admin role
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

-- Step 5: Update the admin_update_user_role function to allow super_admin operations
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
  SET role = p_new_role::role_type,
      updated_at = now()
  WHERE id = p_target_user_id;
END;
$function$;