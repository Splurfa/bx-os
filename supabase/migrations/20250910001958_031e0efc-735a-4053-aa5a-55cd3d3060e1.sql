-- Refactor reflections table for 8-step student reflection flow
-- This migration transforms the current 4-step combined workflow to an 8-step separated workflow

-- First, add new columns for the 8-step flow
ALTER TABLE public.reflections 
ADD COLUMN step1_incident_response text,
ADD COLUMN step2_mood_before integer CHECK (step2_mood_before >= 1 AND step2_mood_before <= 5),
ADD COLUMN step3_accountability integer CHECK (step3_accountability >= 1 AND step3_accountability <= 5),
ADD COLUMN step4_intent_response text,
ADD COLUMN step5_impact_response text,
ADD COLUMN step5_others_mood integer CHECK (step5_others_mood >= 1 AND step5_others_mood <= 5),
ADD COLUMN step6_plan_response text,
ADD COLUMN step7_mood_after integer CHECK (step7_mood_after >= 1 AND step7_mood_after <= 5),
ADD COLUMN step8_commitment integer CHECK (step8_commitment >= 1 AND step8_commitment <= 5);

-- Migrate existing data from old columns to new columns
UPDATE public.reflections SET
  step1_incident_response = question_1_response,
  step4_intent_response = question_2_response,
  step5_impact_response = question_3_response,
  step6_plan_response = question_4_response,
  step3_accountability = accountability_step1,
  step8_commitment = commitment_step4
WHERE question_1_response IS NOT NULL;

-- Add comments to document the new 8-step structure
COMMENT ON COLUMN public.reflections.step1_incident_response IS 'Step 1: What did you do that led to being sent out of class?';
COMMENT ON COLUMN public.reflections.step2_mood_before IS 'Step 2: How were you feeling just before or during the incident? (1-5 mood scale)';
COMMENT ON COLUMN public.reflections.step3_accountability IS 'Step 3: How much responsibility do you take for this incident? (1=None, 5=All)';
COMMENT ON COLUMN public.reflections.step4_intent_response IS 'Step 4: What were you hoping would happen when you acted that way?';
COMMENT ON COLUMN public.reflections.step5_impact_response IS 'Step 5: Who else was affected by your behaviour, and how do you think they felt?';
COMMENT ON COLUMN public.reflections.step5_others_mood IS 'Step 5 followup: Others mood perception (1-5 mood scale)';
COMMENT ON COLUMN public.reflections.step6_plan_response IS 'Step 6: What will you do differently next time?';
COMMENT ON COLUMN public.reflections.step7_mood_after IS 'Step 7: How do you feel now? (1-5 mood scale)';
COMMENT ON COLUMN public.reflections.step8_commitment IS 'Step 8: How ready are you to follow through? (1=Not ready, 5=Fully ready)';

COMMENT ON TABLE public.reflections IS 'Student reflection responses using 8-step workflow: incident description, mood before, accountability, intent, impact & others mood, plan, mood after, commitment';

-- Note: We keep the old columns for now to maintain backward compatibility
-- They can be dropped in a future migration once the new system is stable