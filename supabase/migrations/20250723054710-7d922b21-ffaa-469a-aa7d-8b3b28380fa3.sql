
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT,
  class_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create behavior_requests table
CREATE TABLE public.behavior_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  behaviors TEXT[] NOT NULL,
  mood TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  urgent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested')),
  teacher_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_behavior_requests_student_id ON public.behavior_requests(student_id);
CREATE INDEX idx_behavior_requests_status ON public.behavior_requests(status);
CREATE INDEX idx_behavior_requests_created_at ON public.behavior_requests(created_at);
CREATE INDEX idx_reflections_behavior_request_id ON public.reflections(behavior_request_id);

-- Enable real-time subscriptions for the tables
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.behavior_requests REPLICA IDENTITY FULL;
ALTER TABLE public.reflections REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.behavior_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reflections;
