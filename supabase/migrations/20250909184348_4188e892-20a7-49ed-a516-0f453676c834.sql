-- Add new columns for student mood and accountability tracking (1-5 scale)
-- These are separate from teacher mood which remains 0-100 scale

ALTER TABLE reflections 
ADD COLUMN IF NOT EXISTS mood_step1 INTEGER CHECK (mood_step1 >= 1 AND mood_step1 <= 5),
ADD COLUMN IF NOT EXISTS mood_step3 INTEGER CHECK (mood_step3 >= 1 AND mood_step3 <= 5),
ADD COLUMN IF NOT EXISTS mood_step4 INTEGER CHECK (mood_step4 >= 1 AND mood_step4 <= 5),
ADD COLUMN IF NOT EXISTS accountability_step2 INTEGER CHECK (accountability_step2 >= 1 AND accountability_step2 <= 5),
ADD COLUMN IF NOT EXISTS accountability_step3 INTEGER CHECK (accountability_step3 >= 1 AND accountability_step3 <= 5),
ADD COLUMN IF NOT EXISTS accountability_step4 INTEGER CHECK (accountability_step4 >= 1 AND accountability_step4 <= 5),
ADD COLUMN IF NOT EXISTS commitment_step4 INTEGER CHECK (commitment_step4 >= 1 AND commitment_step4 <= 5);

-- Add comments to clarify the difference between teacher and student mood tracking
COMMENT ON COLUMN reflections.mood_rating IS 'Legacy teacher mood rating (percentage 0-100)';
COMMENT ON COLUMN reflections.mood_step1 IS 'Student initial mood (1-5 scale)';
COMMENT ON COLUMN reflections.mood_step3 IS 'Student post-reflection mood (1-5 scale)';
COMMENT ON COLUMN reflections.mood_step4 IS 'Student final mood (1-5 scale)';
COMMENT ON COLUMN reflections.accountability_step2 IS 'Student accountability level step 2 (1-5 scale)';
COMMENT ON COLUMN reflections.accountability_step3 IS 'Student accountability level step 3 (1-5 scale)';
COMMENT ON COLUMN reflections.accountability_step4 IS 'Student accountability level step 4 (1-5 scale)';
COMMENT ON COLUMN reflections.commitment_step4 IS 'Student commitment to change (1-5 scale)';