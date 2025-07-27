-- Enable RLS on remaining tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS Policies for students
DROP POLICY IF EXISTS "Teachers can view their own students" ON public.students;
CREATE POLICY "Teachers can view their own students" ON public.students
FOR SELECT USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can insert their own students" ON public.students;
CREATE POLICY "Teachers can insert their own students" ON public.students
FOR INSERT WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update their own students" ON public.students;
CREATE POLICY "Teachers can update their own students" ON public.students
FOR UPDATE USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all students" ON public.students;
CREATE POLICY "Admins can view all students" ON public.students
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for behavior_requests
DROP POLICY IF EXISTS "Teachers can view their students' behavior requests" ON public.behavior_requests;
CREATE POLICY "Teachers can view their students' behavior requests" ON public.behavior_requests
FOR SELECT USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can insert behavior requests for their students" ON public.behavior_requests;
CREATE POLICY "Teachers can insert behavior requests for their students" ON public.behavior_requests
FOR INSERT WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update their students' behavior requests" ON public.behavior_requests;
CREATE POLICY "Teachers can update their students' behavior requests" ON public.behavior_requests
FOR UPDATE USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can delete their students' behavior requests" ON public.behavior_requests;
CREATE POLICY "Teachers can delete their students' behavior requests" ON public.behavior_requests
FOR DELETE USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all behavior requests" ON public.behavior_requests;
CREATE POLICY "Admins can view all behavior requests" ON public.behavior_requests
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for reflections
DROP POLICY IF EXISTS "Teachers can view reflections for their students" ON public.reflections;
CREATE POLICY "Teachers can view reflections for their students" ON public.reflections
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.behavior_requests br
    WHERE br.id = behavior_request_id AND br.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Teachers can update reflections for their students" ON public.reflections;
CREATE POLICY "Teachers can update reflections for their students" ON public.reflections
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.behavior_requests br
    WHERE br.id = behavior_request_id AND br.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can view all reflections" ON public.reflections;
CREATE POLICY "Admins can view all reflections" ON public.reflections
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Allow reflections to be inserted by anyone (for kiosk functionality)
DROP POLICY IF EXISTS "Anyone can insert reflections" ON public.reflections;
CREATE POLICY "Anyone can insert reflections" ON public.reflections
FOR INSERT WITH CHECK (true);