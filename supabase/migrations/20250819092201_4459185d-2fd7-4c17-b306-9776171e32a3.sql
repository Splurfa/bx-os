-- Fix the RLS policy for students table to allow teachers to view all students
-- This resolves the circular dependency where teachers could only see students 
-- they already had behavior requests for

DROP POLICY IF EXISTS "emergency_students_auth_view_only" ON public.students;

CREATE POLICY "emergency_students_auth_view_only" 
ON public.students 
FOR SELECT 
USING (
  -- Allow admins, super_admins, and teachers to view all students
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'teacher'::text])
  )
);