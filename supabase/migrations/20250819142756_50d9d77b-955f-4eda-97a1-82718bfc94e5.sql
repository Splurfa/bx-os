-- Phase 1: Update RLS policies for anonymous kiosk access to students with grade filtering
-- Allow anonymous read access to students table for kiosk operations with grade filter
DROP POLICY IF EXISTS "kiosk_student_validation_access" ON students;

CREATE POLICY "kiosk_student_middle_school_access" ON students
FOR SELECT 
TO anon
USING (
  grade IN ('6th', '7th', '8th') 
);

-- Drop existing anonymous policies first
DROP POLICY IF EXISTS "kiosk_behavior_request_insert" ON behavior_requests;
DROP POLICY IF EXISTS "kiosk_behavior_request_update" ON behavior_requests;
DROP POLICY IF EXISTS "kiosk_behavior_request_select" ON behavior_requests;
DROP POLICY IF EXISTS "kiosk_reflection_operations" ON reflections;
DROP POLICY IF EXISTS "kiosk_status_access" ON kiosks;

-- Allow anonymous inserts for behavior requests (needed for kiosk operations)
CREATE POLICY "kiosk_behavior_request_insert" ON behavior_requests
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow anonymous updates for behavior requests (needed for status changes)
CREATE POLICY "kiosk_behavior_request_update" ON behavior_requests  
FOR UPDATE
TO anon
USING (true);

-- Allow anonymous reads for behavior requests (needed for kiosk queue management)
CREATE POLICY "kiosk_behavior_request_select" ON behavior_requests
FOR SELECT
TO anon  
USING (true);

-- Allow anonymous operations on reflections for kiosk submissions
CREATE POLICY "kiosk_reflection_operations" ON reflections
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous read access to kiosks table for kiosk status checks
CREATE POLICY "kiosk_status_access" ON kiosks
FOR SELECT
TO anon
USING (true);