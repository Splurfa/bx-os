-- Clear problematic Aaron Dakar records (history first, then requests)
-- Step 1: Delete existing behavior history records for Aaron Dakar
DELETE FROM behavior_history 
WHERE behavior_request_id IN (
  SELECT br.id FROM behavior_requests br
  JOIN students s ON s.id = br.student_id
  WHERE s.first_name = 'Aaron' AND s.last_name = 'Dakar'
);

-- Step 2: Clear kiosk assignments for these requests
UPDATE kiosks 
SET current_student_id = NULL,
    current_behavior_request_id = NULL,
    updated_at = now()
WHERE current_behavior_request_id IN (
  SELECT br.id FROM behavior_requests br
  JOIN students s ON s.id = br.student_id
  WHERE s.first_name = 'Aaron' AND s.last_name = 'Dakar'
);

-- Step 3: Delete the problematic behavior requests
DELETE FROM behavior_requests 
WHERE id IN (
  SELECT br.id FROM behavior_requests br
  JOIN students s ON s.id = br.student_id
  WHERE s.first_name = 'Aaron' AND s.last_name = 'Dakar'
);