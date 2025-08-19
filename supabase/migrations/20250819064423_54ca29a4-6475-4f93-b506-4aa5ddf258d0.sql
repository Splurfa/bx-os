-- EMERGENCY SECURITY LOCKDOWN - FINAL IMPLEMENTATION

-- 1. FORCE ROW LEVEL SECURITY ON ALL SENSITIVE TABLES
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;
ALTER TABLE public.families FORCE ROW LEVEL SECURITY;
ALTER TABLE public.guardians FORCE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_requests FORCE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES TO START CLEAN
DROP POLICY IF EXISTS "secure_teachers_view_assigned_students" ON public.students;
DROP POLICY IF EXISTS "secure_kiosk_student_auth_only" ON public.students;
DROP POLICY IF EXISTS "secure_admin_student_management" ON public.students;
DROP POLICY IF EXISTS "secure_teachers_view_student_families" ON public.families;
DROP POLICY IF EXISTS "secure_admin_family_management" ON public.families;
DROP POLICY IF EXISTS "secure_teachers_view_student_guardians" ON public.guardians;
DROP POLICY IF EXISTS "secure_admin_guardian_management" ON public.guardians;
DROP POLICY IF EXISTS "secure_kiosk_active_behavior_only" ON public.behavior_requests;

-- 3. STUDENTS TABLE - COMPLETE SECURITY LOCKDOWN
-- Deny all anonymous access to students
CREATE POLICY "emergency_students_no_anon_access" 
ON public.students 
FOR ALL 
TO anon
USING (false);

-- Only admins and teachers with behavior requests can view students
CREATE POLICY "emergency_students_auth_view_only" 
ON public.students 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  ) OR
  EXISTS (
    SELECT 1 FROM behavior_requests br 
    WHERE br.student_id = students.id 
    AND br.teacher_id = auth.uid()
  )
);

-- Only admins can modify students
CREATE POLICY "emergency_students_admin_modify" 
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

-- 4. FAMILIES TABLE - COMPLETE SECURITY LOCKDOWN
CREATE POLICY "emergency_families_no_anon_access" 
ON public.families 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "emergency_families_auth_view_only" 
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

CREATE POLICY "emergency_families_admin_modify" 
ON public.families 
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

-- 5. GUARDIANS TABLE - COMPLETE SECURITY LOCKDOWN
CREATE POLICY "emergency_guardians_no_anon_access" 
ON public.guardians 
FOR ALL 
TO anon
USING (false);

CREATE POLICY "emergency_guardians_auth_view_only" 
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

CREATE POLICY "emergency_guardians_admin_modify" 
ON public.guardians 
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

-- 6. BEHAVIOR_REQUESTS - Minimal kiosk access only
CREATE POLICY "emergency_behavior_requests_kiosk_minimal" 
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