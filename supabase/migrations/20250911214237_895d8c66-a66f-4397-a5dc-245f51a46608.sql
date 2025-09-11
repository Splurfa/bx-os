-- Update historical_incidents table to include more fields from CSV
ALTER TABLE public.historical_incidents 
ADD COLUMN IF NOT EXISTS bsr_submission_id TEXT,
ADD COLUMN IF NOT EXISTS staff_member TEXT,
ADD COLUMN IF NOT EXISTS staff_email TEXT,
ADD COLUMN IF NOT EXISTS teacher_notes TEXT,
ADD COLUMN IF NOT EXISTS immediate_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS srf_status TEXT,
ADD COLUMN IF NOT EXISTS student_first_name TEXT,
ADD COLUMN IF NOT EXISTS student_last_name TEXT,
ADD COLUMN IF NOT EXISTS staff_first_name TEXT,
ADD COLUMN IF NOT EXISTS staff_last_name TEXT,
ADD COLUMN IF NOT EXISTS incident_time TIME,
ADD COLUMN IF NOT EXISTS reflection_question_1 TEXT,
ADD COLUMN IF NOT EXISTS reflection_question_2 TEXT,
ADD COLUMN IF NOT EXISTS reflection_question_3 TEXT,
ADD COLUMN IF NOT EXISTS reflection_question_4 TEXT;