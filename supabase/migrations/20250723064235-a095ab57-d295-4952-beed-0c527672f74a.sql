-- Create profiles table with proper structure
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

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
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

-- Create trigger function to handle new users
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

-- Create trigger for new users
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
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Create teacher records for teacher profiles
INSERT INTO public.teachers (id, school_name, classroom, grade_level, subject)
SELECT 
  p.id,
  'Lincoln Elementary',
  CASE 
    WHEN p.email = 'sarah.johnson@school.edu' THEN 'Room 101'
    ELSE 'Room TBD'
  END,
  CASE 
    WHEN p.email = 'sarah.johnson@school.edu' THEN '3rd Grade'
    ELSE 'TBD'
  END,
  CASE 
    WHEN p.email = 'sarah.johnson@school.edu' THEN 'Mathematics'
    ELSE 'General'
  END
FROM public.profiles p
WHERE p.role = 'teacher' AND p.id NOT IN (SELECT id FROM public.teachers)
ON CONFLICT (id) DO NOTHING;

-- Enable realtime for new tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.teachers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;