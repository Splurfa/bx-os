
-- First, let's create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table linked to profiles
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  school_name TEXT,
  classroom TEXT,
  grade_level TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update students table to link to teachers if column doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'students' 
                 AND column_name = 'teacher_id') THEN
    ALTER TABLE public.students ADD COLUMN teacher_id UUID REFERENCES public.teachers(id);
  END IF;
END $$;

-- Update behavior_requests foreign key constraint
ALTER TABLE public.behavior_requests 
DROP CONSTRAINT IF EXISTS behavior_requests_teacher_id_fkey;

ALTER TABLE public.behavior_requests 
ADD CONSTRAINT behavior_requests_teacher_id_fkey 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for teachers
DROP POLICY IF EXISTS "Teachers can view their own record" ON public.teachers;
CREATE POLICY "Teachers can view their own record" ON public.teachers
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Teachers can update their own record" ON public.teachers;
CREATE POLICY "Teachers can update their own record" ON public.teachers
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all teachers" ON public.teachers;
CREATE POLICY "Admins can view all teachers" ON public.teachers
FOR SELECT USING (public.get_current_user_role() = 'admin');

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

-- Create trigger to automatically create profile when user signs up
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Populate profiles for existing auth users
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'first_name', 'Demo'),
  COALESCE(raw_user_meta_data->>'last_name', 'User'),
  CASE 
    WHEN email = 'admin@school.edu' THEN 'admin'
    ELSE 'teacher'
  END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Create teacher records for teacher profiles
INSERT INTO public.teachers (id, school_name, classroom, grade_level, subject)
SELECT 
  p.id,
  'Lincoln Elementary',
  CASE 
    WHEN p.email = 'sarah.johnson@school.edu' THEN 'Room 101'
    WHEN p.email = 'mike.davis@school.edu' THEN 'Room 205'
    WHEN p.email = 'lisa.chen@school.edu' THEN 'Room 150'
    ELSE 'Room TBD'
  END,
  CASE 
    WHEN p.email = 'sarah.johnson@school.edu' THEN '3rd Grade'
    WHEN p.email = 'mike.davis@school.edu' THEN '4th Grade'
    WHEN p.email = 'lisa.chen@school.edu' THEN '5th Grade'
    ELSE 'TBD'
  END,
  CASE 
    WHEN p.email = 'sarah.johnson@school.edu' THEN 'Mathematics'
    WHEN p.email = 'mike.davis@school.edu' THEN 'Science'
    WHEN p.email = 'lisa.chen@school.edu' THEN 'English'
    ELSE 'General'
  END
FROM public.profiles p
WHERE p.role = 'teacher' AND p.id NOT IN (SELECT id FROM public.teachers);

-- Update existing students to link to teachers
UPDATE public.students 
SET teacher_id = (
  SELECT t.id 
  FROM public.teachers t 
  JOIN public.profiles p ON t.id = p.id 
  WHERE p.email = 'sarah.johnson@school.edu'
  LIMIT 1
)
WHERE teacher_id IS NULL AND grade = '3rd';

-- Sample students for the teacher
INSERT INTO public.students (id, name, grade, class_name, teacher_id) 
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Alex Thompson',
  '3rd',
  'Ms. Johnson',
  t.id
FROM public.teachers t 
JOIN public.profiles p ON t.id = p.id 
WHERE p.email = 'sarah.johnson@school.edu'
AND NOT EXISTS (SELECT 1 FROM public.students WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

INSERT INTO public.students (id, name, grade, class_name, teacher_id) 
SELECT 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Emma Rodriguez',
  '3rd',
  'Ms. Johnson',
  t.id
FROM public.teachers t 
JOIN public.profiles p ON t.id = p.id 
WHERE p.email = 'sarah.johnson@school.edu'
AND NOT EXISTS (SELECT 1 FROM public.students WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- Sample behavior requests for testing
INSERT INTO public.behavior_requests (id, student_id, teacher_id, behaviors, mood, status, urgent, notes) 
SELECT 
  '12345678-1234-1234-1234-123456789012',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  t.id,
  ARRAY['Disruptive', 'Social-Emotional'],
  'frustrated',
  'waiting',
  false,
  'Disrupting math lesson'
FROM public.teachers t 
JOIN public.profiles p ON t.id = p.id 
WHERE p.email = 'sarah.johnson@school.edu'
AND NOT EXISTS (SELECT 1 FROM public.behavior_requests WHERE id = '12345678-1234-1234-1234-123456789012');

-- Enable realtime for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.teachers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;
