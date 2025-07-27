
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table linked to profiles
CREATE TABLE public.teachers (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  school_name TEXT,
  classroom TEXT,
  grade_level TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update students table to link to teachers
ALTER TABLE public.students 
ADD COLUMN teacher_id UUID REFERENCES public.teachers(id);

-- Update behavior_requests to use proper teacher reference
ALTER TABLE public.behavior_requests 
DROP CONSTRAINT IF EXISTS behavior_requests_teacher_id_fkey,
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

-- Create security definer function to check if user is teacher of student
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.teachers t ON s.teacher_id = t.id
    WHERE s.id = student_id AND t.id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for teachers
CREATE POLICY "Teachers can view their own record" ON public.teachers
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own record" ON public.teachers
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all teachers" ON public.teachers
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for students
CREATE POLICY "Teachers can view their own students" ON public.students
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own students" ON public.students
FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own students" ON public.students
FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all students" ON public.students
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for behavior_requests
CREATE POLICY "Teachers can view their students' behavior requests" ON public.behavior_requests
FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert behavior requests for their students" ON public.behavior_requests
FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their students' behavior requests" ON public.behavior_requests
FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their students' behavior requests" ON public.behavior_requests
FOR DELETE USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all behavior requests" ON public.behavior_requests
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for reflections
CREATE POLICY "Teachers can view reflections for their students" ON public.reflections
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.behavior_requests br
    WHERE br.id = behavior_request_id AND br.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update reflections for their students" ON public.reflections
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.behavior_requests br
    WHERE br.id = behavior_request_id AND br.teacher_id = auth.uid()
  )
);

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
-- Sample teachers (profiles will be created when they sign up)
INSERT INTO public.profiles (id, email, first_name, last_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@school.edu', 'System', 'Admin', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'sarah.johnson@school.edu', 'Sarah', 'Johnson', 'teacher'),
  ('33333333-3333-3333-3333-333333333333', 'mike.davis@school.edu', 'Mike', 'Davis', 'teacher'),
  ('44444444-4444-4444-4444-444444444444', 'lisa.chen@school.edu', 'Lisa', 'Chen', 'teacher');

-- Sample teacher records
INSERT INTO public.teachers (id, school_name, classroom, grade_level, subject) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Lincoln Elementary', 'Room 101', '3rd Grade', 'Mathematics'),
  ('33333333-3333-3333-3333-333333333333', 'Lincoln Elementary', 'Room 205', '4th Grade', 'Science'),
  ('44444444-4444-4444-4444-444444444444', 'Lincoln Elementary', 'Room 150', '5th Grade', 'English');

-- Sample students
INSERT INTO public.students (id, name, grade, class_name, teacher_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alex Thompson', '3rd', 'Ms. Johnson', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Emma Rodriguez', '3rd', 'Ms. Johnson', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'James Wilson', '3rd', 'Ms. Johnson', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sophia Martinez', '4th', 'Mr. Davis', '33333333-3333-3333-3333-333333333333'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Michael Brown', '4th', 'Mr. Davis', '33333333-3333-3333-3333-333333333333'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Olivia Taylor', '5th', 'Ms. Chen', '44444444-4444-4444-4444-444444444444'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'William Anderson', '5th', 'Ms. Chen', '44444444-4444-4444-4444-444444444444');

-- Sample behavior requests for testing
INSERT INTO public.behavior_requests (id, student_id, teacher_id, behaviors, mood, status, urgent, notes) VALUES
  ('12345678-1234-1234-1234-123456789012', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 
   ARRAY['Disruptive', 'Social-Emotional'], 'frustrated', 'waiting', false, 'Disrupting math lesson'),
  ('23456789-2345-2345-2345-234567890123', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 
   ARRAY['Avoidance'], 'anxious', 'completed', false, 'Refusing to participate in group work');

-- Sample reflection for completed behavior request
INSERT INTO public.reflections (behavior_request_id, question1, question2, question3, question4, status) VALUES
  ('23456789-2345-2345-2345-234567890123', 
   'I refused to work with my group and put my head down when the teacher asked me to participate.',
   'I was hoping the teacher would leave me alone and let me work by myself because I was feeling overwhelmed.',
   'My group members felt confused and left out. My teacher had to spend extra time trying to help me instead of helping other students.',
   'When I feel overwhelmed, I will take deep breaths and ask for a short break. I will communicate my feelings to my teacher instead of shutting down.',
   'pending');

-- Enable realtime for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.teachers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;
