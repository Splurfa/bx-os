-- First, let's clean up duplicate entries by keeping only the most recent request per student
-- This will remove older duplicate requests, keeping the latest one

-- Create the reflections_history table first (without the constraint)
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

-- Now clean up duplicates: Delete older duplicate behavior requests, keeping the most recent one per student
WITH duplicate_requests AS (
  SELECT 
    id,
    student_id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) as rn
  FROM public.behavior_requests
),
requests_to_delete AS (
  SELECT id 
  FROM duplicate_requests 
  WHERE rn > 1
)
DELETE FROM public.behavior_requests 
WHERE id IN (SELECT id FROM requests_to_delete);

-- Now we can safely add the unique constraint
ALTER TABLE public.behavior_requests 
ADD CONSTRAINT unique_active_student_request 
UNIQUE (student_id) 
DEFERRABLE INITIALLY DEFERRED;