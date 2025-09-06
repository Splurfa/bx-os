-- Create antecedent_contexts reference table
CREATE TABLE public.antecedent_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on antecedent_contexts
ALTER TABLE public.antecedent_contexts ENABLE ROW LEVEL SECURITY;

-- Create policies for antecedent_contexts
CREATE POLICY "All authenticated users can view antecedent contexts" 
ON public.antecedent_contexts 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage antecedent contexts" 
ON public.antecedent_contexts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- Add new columns to behavior_requests for antecedent feature
ALTER TABLE public.behavior_requests
ADD COLUMN antecedent_context_id UUID REFERENCES public.antecedent_contexts(id),
ADD COLUMN urgency_level TEXT CHECK (urgency_level IN ('standard','re_integration','urgent')) DEFAULT 'standard',
ADD COLUMN teacher_mood INTEGER CHECK (teacher_mood BETWEEN 1 AND 5),
ADD COLUMN note TEXT;

-- Seed antecedent context data with unified labels
INSERT INTO public.antecedent_contexts (key, label, description, sort_order) VALUES
('frontal_teaching', 'Frontal teaching (lecture)', 'Teacher-led instruction with whole class attention', 1),
('individual_quiet_classwork', 'Individual quiet classwork', 'Students working independently on assignments', 2),
('group_partner_classwork', 'Group/partner classwork', 'Collaborative work with peers', 3),
('group_discussion', 'Group discussion', 'Class discussions or sharing activities', 4),
('test_quiz', 'Test/Quiz', 'Assessment or evaluation activities', 5),
('transitions', 'Transitions', 'Moving between activities, subjects, or locations', 6);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_antecedent_contexts_updated_at
BEFORE UPDATE ON public.antecedent_contexts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();