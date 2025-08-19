-- Remove the conflicting RLS policy that blocks all anonymous access
DROP POLICY IF EXISTS "absolute_behavior_requests_zero_anon_access" ON behavior_requests;

-- Manually clear all current behavior requests and queue data
DELETE FROM reflections WHERE behavior_request_id IN (
  SELECT id FROM behavior_requests WHERE status IN ('waiting', 'active')
);

DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');

-- Clear all kiosk assignments
UPDATE kiosks 
SET current_student_id = NULL,
    current_behavior_request_id = NULL,
    updated_at = now()
WHERE is_active = true;