-- PHASE 1.1: Database Foundation - Add Super Admin Role System (Final Fix)
-- Drop ALL policies that reference the role column across all tables

-- Step 1: Create role_type enum
CREATE TYPE role_type AS ENUM ('teacher', 'admin', 'super_admin');

-- Step 2: Drop ALL policies that might reference role column
-- Profiles table policies
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- User sessions policies (these likely reference profiles.role)
DROP POLICY IF EXISTS "Admins can end any session" ON user_sessions;
DROP POLICY IF EXISTS "Admins can update any session" ON user_sessions;
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON user_sessions;
DROP POLICY IF EXISTS "Teachers and admins can view all sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can end their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;

-- Other table policies that might reference role
DROP POLICY IF EXISTS "Teachers and admins can create behavior history" ON behavior_history;
DROP POLICY IF EXISTS "Teachers and admins can update behavior history" ON behavior_history;
DROP POLICY IF EXISTS "Teachers and admins can view behavior history" ON behavior_history;
DROP POLICY IF EXISTS "Teachers and admins can create kiosks" ON kiosks;
DROP POLICY IF EXISTS "Teachers and admins can delete kiosks" ON kiosks;
DROP POLICY IF EXISTS "Teachers and admins can update kiosks" ON kiosks;
DROP POLICY IF EXISTS "Teachers and admins can view kiosks" ON kiosks;
DROP POLICY IF EXISTS "Teachers and admins can create reflections" ON reflections;
DROP POLICY IF EXISTS "Teachers and admins can update reflections" ON reflections;
DROP POLICY IF EXISTS "Teachers and admins can view reflections" ON reflections;
DROP POLICY IF EXISTS "Teachers and admins can create reflection history" ON reflections_history;
DROP POLICY IF EXISTS "Teachers and admins can view reflection history" ON reflections_history;
DROP POLICY IF EXISTS "Teachers can create behavior requests as themselves" ON behavior_requests;
DROP POLICY IF EXISTS "Teachers can delete their own behavior requests" ON behavior_requests;
DROP POLICY IF EXISTS "Teachers can update their own behavior requests" ON behavior_requests;
DROP POLICY IF EXISTS "Teachers can view their own behavior requests" ON behavior_requests;
DROP POLICY IF EXISTS "Teachers and admins can create students" ON students;
DROP POLICY IF EXISTS "Teachers and admins can update students" ON students;
DROP POLICY IF EXISTS "Teachers and admins can view students" ON students;

-- Step 3: Now alter the column type
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role TYPE role_type USING role::role_type;
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