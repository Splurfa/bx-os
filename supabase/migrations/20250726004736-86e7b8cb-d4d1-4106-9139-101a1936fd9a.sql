
-- Create users profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT,
  class_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create behavior requests table
CREATE TABLE public.behavior_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  behaviors TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'completed')) DEFAULT 'waiting',
  urgent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  assigned_kiosk_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reflections table
CREATE TABLE public.reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  behavior_request_id UUID NOT NULL REFERENCES public.behavior_requests(id) ON DELETE CASCADE,
  question1 TEXT NOT NULL,
  question2 TEXT NOT NULL,
  question3 TEXT NOT NULL,
  question4 TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'revision_requested')) DEFAULT 'pending',
  teacher_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kiosks table for managing device states
CREATE TABLE public.kiosks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  current_student_id UUID REFERENCES public.students(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for students (accessible to teachers and admins)
CREATE POLICY "Teachers and admins can view students" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can create students" ON public.students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update students" ON public.students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for behavior_requests
CREATE POLICY "Teachers and admins can view behavior requests" ON public.behavior_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can create behavior requests" ON public.behavior_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update behavior requests" ON public.behavior_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can delete behavior requests" ON public.behavior_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for reflections
CREATE POLICY "Teachers and admins can view reflections" ON public.reflections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can create reflections" ON public.reflections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can update reflections" ON public.reflections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for kiosks
CREATE POLICY "Authenticated users can view kiosks" ON public.kiosks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage kiosks" ON public.kiosks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_behavior_requests_student_id ON public.behavior_requests(student_id);
CREATE INDEX idx_behavior_requests_teacher_id ON public.behavior_requests(teacher_id);
CREATE INDEX idx_behavior_requests_status ON public.behavior_requests(status);
CREATE INDEX idx_behavior_requests_created_at ON public.behavior_requests(created_at);
CREATE INDEX idx_reflections_behavior_request_id ON public.reflections(behavior_request_id);
CREATE INDEX idx_students_name ON public.students(name);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_behavior_requests_updated_at
    BEFORE UPDATE ON public.behavior_requests
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
    BEFORE UPDATE ON public.reflections
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_kiosks_updated_at
    BEFORE UPDATE ON public.kiosks
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
