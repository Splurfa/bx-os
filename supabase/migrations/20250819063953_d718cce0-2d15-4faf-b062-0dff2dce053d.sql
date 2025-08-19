-- EMERGENCY SECURITY LOCKDOWN: Implement comprehensive RLS policies

-- 1. STUDENTS TABLE SECURITY
-- Drop existing permissive policies and create secure ones
DROP POLICY IF EXISTS "Users can view all students" ON public.students;
DROP POLICY IF EXISTS "Kiosk student authentication minimal access" ON public.students;

-- Secure student data access policies
CREATE POLICY "Teachers can view students in their care" 
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

CREATE POLICY "Kiosk minimal student access for authentication" 
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

CREATE POLICY "Admins can manage students" 
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
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view all families" ON public.families;

-- Secure family data access
CREATE POLICY "Teachers can view families of their students" 
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

CREATE POLICY "Admins can manage families" 
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
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view all guardians" ON public.guardians;

-- Secure guardian data access
CREATE POLICY "Teachers can view guardians of their students" 
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

CREATE POLICY "Admins can manage guardians" 
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
-- Drop existing overly permissive anonymous policy
DROP POLICY IF EXISTS "Anonymous kiosk behavior request read only" ON public.behavior_requests;

-- More restrictive kiosk access
CREATE POLICY "Kiosk minimal behavior request access" 
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
    AND k.current_behavior_request_id IS NOT NULL
  )
);

-- 5. REFLECTIONS TABLE SECURITY
-- Add anonymous submission policy with stricter validation
DROP POLICY IF EXISTS "Anonymous kiosk reflection submission verified" ON public.reflections;

CREATE POLICY "Kiosk reflection submission secure" 
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

-- 6. SECURE COMMUNICATION LOGS AND TEMPLATES
-- Ensure teachers can only see communications for their students
DROP POLICY IF EXISTS "Users can view communication logs for their students" ON public.communication_logs;

CREATE POLICY "Teachers can view their student communications" 
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

-- 7. SECURE CSV IMPORT ACCESS (Admin only)
-- This is already secure but ensure it remains so
CREATE POLICY "Super admin only csv import" 
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

-- 8. LOG SECURITY EVENT
INSERT INTO user_sessions (
  user_id,
  device_type,
  device_info,
  location,
  session_status
) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
  'security_system',
  jsonb_build_object(
    'event_type', 'emergency_security_lockdown',
    'timestamp', now(),
    'policies_implemented', 'comprehensive_rls_security',
    'vulnerability_count', 5,
    'status', 'resolved'
  ),
  'System Security Implementation',
  'completed'
);