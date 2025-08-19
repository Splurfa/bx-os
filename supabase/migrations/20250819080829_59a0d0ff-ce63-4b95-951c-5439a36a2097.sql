-- Clear problematic duplicate Aaron Dakar records
-- First archive the records to behavior_history
INSERT INTO behavior_history (
  behavior_request_id,
  student_id,
  reflection_id,
  resolution_type,
  resolution_notes,
  archived_at
)
SELECT 
  br.id,
  br.student_id,
  NULL, -- No reflections for these
  'system_cleanup',
  'Cleared duplicate records - system maintenance',
  now()
FROM behavior_requests br
JOIN students s ON s.id = br.student_id
WHERE s.first_name = 'Aaron' AND s.last_name = 'Dakar'
AND NOT EXISTS (
  SELECT 1 FROM behavior_history bh WHERE bh.behavior_request_id = br.id
);

-- Clear kiosk assignments for these requests
UPDATE kiosks 
SET current_student_id = NULL,
    current_behavior_request_id = NULL,
    updated_at = now()
WHERE current_behavior_request_id IN (
  SELECT br.id FROM behavior_requests br
  JOIN students s ON s.id = br.student_id
  WHERE s.first_name = 'Aaron' AND s.last_name = 'Dakar'
);

-- Delete the problematic behavior requests
DELETE FROM behavior_requests 
WHERE id IN (
  SELECT br.id FROM behavior_requests br
  JOIN students s ON s.id = br.student_id
  WHERE s.first_name = 'Aaron' AND s.last_name = 'Dakar'
);