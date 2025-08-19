-- Fix missing completed_at column in behavior_history table
ALTER TABLE behavior_history ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update RLS policies to allow anonymous kiosk access for device sessions
DROP POLICY IF EXISTS "Anonymous kiosk session access" ON device_sessions;
CREATE POLICY "Anonymous kiosk session access" 
ON device_sessions 
FOR ALL 
USING (true);

-- Update RLS policies to allow anonymous access to kiosks table for validation
DROP POLICY IF EXISTS "Anonymous kiosk minimal read access" ON kiosks;
CREATE POLICY "Anonymous kiosk minimal read access" 
ON kiosks 
FOR SELECT 
USING (true);

-- Allow anonymous users to validate students for kiosk access
DROP POLICY IF EXISTS "emergency_students_no_anon_access" ON students;
CREATE POLICY "kiosk_student_validation_access" 
ON students 
FOR SELECT 
USING (true);