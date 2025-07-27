-- Create comprehensive behavior_history table for permanent intervention records
CREATE TABLE public.behavior_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Original behavior request data
  original_request_id uuid NOT NULL,
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  behaviors text[] NOT NULL DEFAULT '{}',
  mood text NOT NULL,
  urgent boolean NOT NULL DEFAULT false,
  notes text,
  assigned_kiosk_id integer,
  
  -- Student data snapshot (for historical consistency)
  student_name text NOT NULL,
  student_grade text,
  student_class_name text,
  
  -- Teacher data snapshot
  teacher_name text,
  teacher_email text,
  
  -- Kiosk data snapshot
  kiosk_name text,
  kiosk_location text,
  
  -- Reflection data
  reflection_id uuid,
  question1 text,
  question2 text,
  question3 text,
  question4 text,
  teacher_feedback text,
  
  -- Workflow metadata
  queue_position integer,
  time_in_queue_minutes integer,
  completion_status text NOT NULL DEFAULT 'completed',
  intervention_outcome text NOT NULL DEFAULT 'approved', -- 'approved', 'revision_requested'
  
  -- Session tracking
  session_id uuid,
  device_type text,
  device_location text,
  
  -- Timestamps
  queue_created_at timestamp with time zone NOT NULL,
  queue_started_at timestamp with time zone,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.behavior_history ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for behavior_history
CREATE POLICY "Teachers and admins can view behavior history" 
ON public.behavior_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can create behavior history" 
ON public.behavior_history 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

CREATE POLICY "Teachers and admins can update behavior history" 
ON public.behavior_history 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])
));

-- Create indexes for efficient querying
CREATE INDEX idx_behavior_history_student_id ON public.behavior_history(student_id);
CREATE INDEX idx_behavior_history_teacher_id ON public.behavior_history(teacher_id);
CREATE INDEX idx_behavior_history_kiosk_id ON public.behavior_history(assigned_kiosk_id);
CREATE INDEX idx_behavior_history_completed_at ON public.behavior_history(completed_at);
CREATE INDEX idx_behavior_history_behaviors ON public.behavior_history USING GIN(behaviors);
CREATE INDEX idx_behavior_history_completion_status ON public.behavior_history(completion_status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_behavior_history_updated_at
BEFORE UPDATE ON public.behavior_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();