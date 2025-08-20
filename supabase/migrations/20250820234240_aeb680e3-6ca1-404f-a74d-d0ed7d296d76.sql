-- Clean Testing Data Reset
-- Clear all behavior workflow test data while preserving core student/family data

-- Step 1: Clear kiosk assignments first to avoid foreign key issues
UPDATE kiosks 
SET current_student_id = NULL,
    current_behavior_request_id = NULL,
    updated_at = now()
WHERE current_student_id IS NOT NULL OR current_behavior_request_id IS NOT NULL;

-- Step 2: Clear behavior history records
DELETE FROM behavior_history;

-- Step 3: Clear reflections 
DELETE FROM reflections;

-- Step 4: Clear behavior requests
DELETE FROM behavior_requests;

-- Step 5: Reset any user session logs related to behavior requests
DELETE FROM user_sessions 
WHERE device_type IN ('admin_action', 'kiosk') 
AND session_status IN ('completed', 'failed');

-- Verification queries to confirm cleanup
-- These will show 0 if cleanup was successful
SELECT COUNT(*) as remaining_behavior_requests FROM behavior_requests;
SELECT COUNT(*) as remaining_reflections FROM reflections;
SELECT COUNT(*) as remaining_behavior_history FROM behavior_history;
SELECT COUNT(*) as kiosks_with_assignments FROM kiosks WHERE current_student_id IS NOT NULL OR current_behavior_request_id IS NOT NULL;

-- Show preserved data counts
SELECT COUNT(*) as preserved_students FROM students;
SELECT COUNT(*) as preserved_families FROM families;
SELECT COUNT(*) as preserved_guardians FROM guardians;