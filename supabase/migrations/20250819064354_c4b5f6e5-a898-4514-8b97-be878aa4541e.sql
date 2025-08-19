-- COMPREHENSIVE EMERGENCY SECURITY LOCKDOWN - DENY-FIRST APPROACH

-- 1. DROP ALL EXISTING POLICIES AND START FRESH
DROP POLICY IF EXISTS "secure_teachers_view_assigned_students" ON public.students;
DROP POLICY IF EXISTS "secure_kiosk_student_auth_only" ON public.students;
DROP POLICY IF EXISTS "secure_admin_student_management" ON public.students;
DROP POLICY IF EXISTS "secure_teachers_view_student_families" ON public.families;
DROP POLICY IF EXISTS "secure_admin_family_management" ON public.families;
DROP POLICY IF EXISTS "secure_teachers_view_student_guardians" ON public.guardians;
DROP POLICY IF EXISTS "secure_admin_guardian_management" ON public.guardians;
DROP POLICY IF EXISTS "secure_kiosk_active_behavior_only" ON public.behavior_requests;

-- 2. FORCE RLS ON ALL TABLES
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;
ALTER TABLE public.families FORCE ROW LEVEL SECURITY;
ALTER TABLE public.guardians FORCE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks FORCE ROW LEVEL SECURITY;

-- 3. CREATE RESTRICTIVE DEFAULT POLICIES (DENY ALL PUBLIC ACCESS)

-- STUDENTS: Complete lockdown for anonymous users
CREATE POLICY "lockdown_students_no_public_access" 
ON public.students 
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

-- STUDENTS: Only authenticated users with specific permissions
CREATE POLICY "lockdown_students_authenticated_only" 
ON public.students 
FOR SELECT 
TO authenticated
USING (
  -- Admins can see all students
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ) OR
  -- Teachers can only see students they have behavior requests for
  EXISTS (
    SELECT 1 FROM behavior_requests br 
    WHERE br.student_id = students.id 
    AND br.teacher_id = auth.uid()
  )
);

-- STUDENTS: Admin management only
CREATE POLICY "lockdown_students_admin_write" 
ON public.students 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- FAMILIES: Complete lockdown
CREATE POLICY "lockdown_families_no_public_access" 
ON public.families 
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

CREATE POLICY "lockdown_families_authenticated_only" 
ON public.families 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ) OR
  EXISTS (
    SELECT 1 FROM students s
    JOIN behavior_requests br ON br.student_id = s.id
    WHERE s.family_id = families.id 
    AND br.teacher_id = auth.uid()
  )
);

-- GUARDIANS: Complete lockdown
CREATE POLICY "lockdown_guardians_no_public_access" 
ON public.guardians 
FOR ALL 
TO public
USING (false)
WITH CHECK (false);

CREATE POLICY "lockdown_guardians_authenticated_only" 
ON public.guardians 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ) OR
  EXISTS (
    SELECT 1 FROM students s
    JOIN behavior_requests br ON br.student_id = s.id
    WHERE s.family_id = guardians.family_id 
    AND br.teacher_id = auth.uid()
  )
);

-- BEHAVIOR_REQUESTS: Minimal kiosk access for active assignments only
CREATE POLICY "lockdown_behavior_requests_no_public_access" 
ON public.behavior_requests 
FOR INSERT 
TO public
USING (false)
WITH CHECK (false);

CREATE POLICY "lockdown_behavior_requests_kiosk_active_only" 
ON public.behavior_requests 
FOR SELECT 
TO anon
USING (
  status = 'active' 
  AND id IN (
    SELECT current_behavior_request_id 
    FROM kiosks 
    WHERE is_active = true 
    AND current_behavior_request_id = behavior_requests.id
  )
);

-- KIOSKS: Minimal public access for active kiosks only
CREATE POLICY "lockdown_kiosks_active_minimal_access" 
ON public.kiosks 
FOR SELECT 
TO anon
USING (
  is_active = true 
  AND current_behavior_request_id IS NOT NULL
);

-- 4. DENY ALL OTHER OPERATIONS TO PUBLIC
CREATE POLICY "lockdown_families_admin_only" ON public.families FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

CREATE POLICY "lockdown_guardians_admin_only" ON public.guardians FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);