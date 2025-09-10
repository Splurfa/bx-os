-- Add slider value columns to reflections table for Student Reflection Flow
-- This enables storing accountability and commitment values alongside text responses

-- Add accountability slider values for steps 1-3
ALTER TABLE public.reflections 
ADD COLUMN IF NOT EXISTS accountability_step1 INTEGER CHECK (accountability_step1 >= 1 AND accountability_step1 <= 5),
ADD COLUMN IF NOT EXISTS accountability_step2 INTEGER CHECK (accountability_step2 >= 1 AND accountability_step2 <= 5),
ADD COLUMN IF NOT EXISTS accountability_step3 INTEGER CHECK (accountability_step3 >= 1 AND accountability_step3 <= 5);

-- Add commitment slider value for step 4
ALTER TABLE public.reflections 
ADD COLUMN IF NOT EXISTS commitment_step4 INTEGER CHECK (commitment_step4 >= 1 AND commitment_step4 <= 5);

-- Add mood slider value for step 4 (if future enhancement needed)
ALTER TABLE public.reflections 
ADD COLUMN IF NOT EXISTS mood_step4 INTEGER CHECK (mood_step4 >= 1 AND mood_step4 <= 5);

-- Create comment to document the Student Reflection Flow schema
COMMENT ON COLUMN public.reflections.accountability_step1 IS 'Accountability slider value (1-5) for Step 1: What did you do that led to being sent out of class?';
COMMENT ON COLUMN public.reflections.accountability_step2 IS 'Accountability slider value (1-5) for Step 2: What were you hoping would happen when you acted that way?';
COMMENT ON COLUMN public.reflections.accountability_step3 IS 'Accountability slider value (1-5) for Step 3: Who else was impacted by your behavior, and in what way?';
COMMENT ON COLUMN public.reflections.commitment_step4 IS 'Commitment slider value (1-5) for Step 4: Write two sentences that show you understand whats expected of you when you go back to class.';
COMMENT ON COLUMN public.reflections.mood_step4 IS 'Mood slider value (1-5) for future mood assessment functionality';

-- Update the table comment to reflect the Student Reflection Flow
COMMENT ON TABLE public.reflections IS 'Student behavior reflections with text responses and slider values following the Student Reflection Flow methodology';