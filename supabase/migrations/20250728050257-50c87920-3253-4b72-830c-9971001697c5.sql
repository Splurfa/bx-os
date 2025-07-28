-- Create reflections_history table to preserve all reflection versions
CREATE TABLE public.reflections_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_reflection_id uuid NOT NULL,
  behavior_request_id uuid NOT NULL,
  question1 text NOT NULL,
  question2 text NOT NULL,
  question3 text NOT NULL,
  question4 text NOT NULL,
  status text NOT NULL,
  teacher_feedback text,
  attempt_number integer NOT NULL DEFAULT 1,
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  original_created_at timestamp with time zone NOT NULL,
  original_updated_at timestamp with time zone NOT NULL,
  archived_by uuid,
  revision_reason text
);

-- Enable RLS
ALTER TABLE public.reflections_history ENABLE ROW LEVEL SECURITY;

-- Create policies for reflections_history
CREATE POLICY "Teachers and admins can view reflection history" 
ON public.reflections_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('teacher', 'admin')
));

CREATE POLICY "Teachers and admins can create reflection history" 
ON public.reflections_history 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role IN ('teacher', 'admin')
));

-- Add indexes for performance
CREATE INDEX idx_reflections_history_behavior_request_id ON public.reflections_history(behavior_request_id);
CREATE INDEX idx_reflections_history_original_reflection_id ON public.reflections_history(original_reflection_id);
CREATE INDEX idx_reflections_history_archived_at ON public.reflections_history(archived_at);

-- Add single active request constraint to behavior_requests
ALTER TABLE public.behavior_requests 
ADD CONSTRAINT unique_active_student_request 
UNIQUE (student_id) 
DEFERRABLE INITIALLY DEFERRED;