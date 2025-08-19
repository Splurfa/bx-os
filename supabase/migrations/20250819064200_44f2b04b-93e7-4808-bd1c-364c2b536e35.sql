-- EMERGENCY SECURITY LOCKDOWN: Comprehensive RLS Implementation

-- 1. STUDENTS TABLE SECURITY
DROP POLICY IF EXISTS "Users can view all students" ON public.students;
DROP POLICY IF EXISTS "Kiosk student authentication minimal access" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;

CREATE POLICY "secure_teachers_view_assigned_students" 
ON public.students 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM behavior_requests br 
    WHERE br.student_id = students.id 
    AND br.teacher_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "secure_kiosk_student_auth_only" 
ON public.students 
FOR SELECT 
TO anon
USING (
  id IN (
    SELECT k.current_student_id 
    FROM kiosks k 
    WHERE k.is_active = true 
    AND k.current_student_id IS NOT NULL
  )
);

CREATE POLICY "secure_admin_student_management" 
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

-- 2. FAMILIES TABLE SECURITY
DROP POLICY IF EXISTS "Users can view all families" ON public.families;
DROP POLICY IF EXISTS "Admins can manage families" ON public.families;

CREATE POLICY "secure_teachers_view_student_families" 
ON public.families 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN behavior_requests br ON br.student_id = s.id
    WHERE s.family_id = families.id 
    AND br.teacher_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "secure_admin_family_management" 
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

-- 3. GUARDIANS TABLE SECURITY
DROP POLICY IF EXISTS "Users can view all guardians" ON public.guardians;
DROP POLICY IF EXISTS "Admins can manage guardians" ON public.guardians;

CREATE POLICY "secure_teachers_view_student_guardians" 
ON public.guardians 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN behavior_requests br ON br.student_id = s.id
    WHERE s.family_id = guardians.family_id 
    AND br.teacher_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "secure_admin_guardian_management" 
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

-- 4. BEHAVIOR_REQUESTS TABLE SECURITY
DROP POLICY IF EXISTS "Anonymous kiosk behavior request read only" ON public.behavior_requests;

CREATE POLICY "secure_kiosk_active_behavior_only" 
ON public.behavior_requests 
FOR SELECT 
TO anon
USING (
  status = 'active' 
  AND id IN (
    SELECT k.current_behavior_request_id 
    FROM kiosks k 
    WHERE k.is_active = true 
    AND k.current_behavior_request_id = behavior_requests.id
  )
);

-- 5. REFLECTIONS TABLE SECURITY
DROP POLICY IF EXISTS "Anonymous kiosk reflection submission verified" ON public.reflections;

CREATE POLICY "secure_kiosk_reflection_submission" 
ON public.reflections 
FOR INSERT 
TO anon
WITH CHECK (
  behavior_request_id IN (
    SELECT k.current_behavior_request_id
    FROM kiosks k
    JOIN behavior_requests br ON br.id = k.current_behavior_request_id
    WHERE k.is_active = true 
    AND br.status = 'active'
    AND k.current_behavior_request_id IS NOT NULL
    AND student_id = k.current_student_id
  )
);

-- 6. COMMUNICATION LOGS SECURITY
DROP POLICY IF EXISTS "Users can view communication logs for their students" ON public.communication_logs;

CREATE POLICY "secure_teacher_student_communications" 
ON public.communication_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM behavior_requests br 
    WHERE br.student_id = communication_logs.student_id 
    AND br.teacher_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- 7. CSV IMPORT TABLE SECURITY
DROP POLICY IF EXISTS "Admin only csv import access" ON public.csv_import_raw;

CREATE POLICY "secure_super_admin_csv_only" 
ON public.csv_import_raw 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
  )
);