-- PHASE 1.1: Database Foundation - Add Super Admin Role System (Fixed v2)
-- Following docs/technical/database-migration-plan.md

-- Step 1: Create role_type enum
CREATE TYPE role_type AS ENUM ('teacher', 'admin', 'super_admin');

-- Step 2: Drop all RLS policies that reference the role column
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Step 3: Now we can safely alter the column type
-- Drop the default constraint first
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Alter the column type
ALTER TABLE profiles ALTER COLUMN role TYPE role_type USING role::role_type;

-- Re-add the default constraint
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'teacher'::role_type;

-- Step 4: Create Zach's super admin profile
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'zach@zavitechllc.com') THEN
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
        UPDATE profiles 
        SET role = 'super_admin'::role_type 
        WHERE email = 'zach@zavitechllc.com';
    END IF;
END $$;

-- Step 5: Recreate RLS policies with super_admin support
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

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

-- Step 6: Update the admin_update_user_role function
CREATE OR REPLACE FUNCTION public.admin_update_user_role(p_target_user_id uuid, p_new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: admin or super_admin only';
  END IF;

  IF p_new_role NOT IN ('teacher', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role: %', p_new_role;
  END IF;

  UPDATE public.profiles
  SET role = p_new_role::role_type,
      updated_at = now()
  WHERE id = p_target_user_id;
END;
$function$;