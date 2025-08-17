-- PHASE 1.1: Database Foundation - Revised Simple Approach
-- Create Super Admin Support Without Breaking Existing Schema

-- Step 1: Create role_type enum (for future use)
CREATE TYPE IF NOT EXISTS role_type AS ENUM ('teacher', 'admin', 'super_admin');

-- Step 2: Create/Update Zach's super admin profile (using TEXT for now)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'zach@zavitechllc.com') THEN
        INSERT INTO profiles (id, email, full_name, role, first_name, last_name)
        VALUES (
            gen_random_uuid(), 
            'zach@zavitechllc.com', 
            'Zach Zavitechllc', 
            'super_admin',
            'Zach',
            'Zavitechllc'
        );
    ELSE
        UPDATE profiles 
        SET role = 'super_admin'
        WHERE email = 'zach@zavitechllc.com';
    END IF;
END $$;

-- Step 3: Update admin_update_user_role function to support super_admin
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

-- Step 4: Update existing RLS policies to include super_admin
-- Update the admin profile policy
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