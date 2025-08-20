-- Update the existing behavior request from 'completed' to 'review' status
-- so it appears in the "Ready for Review" queue
UPDATE behavior_requests 
SET status = 'review', 
    updated_at = now()
WHERE status = 'completed' 
AND id IN (
  SELECT br.id 
  FROM behavior_requests br
  INNER JOIN reflections r ON r.behavior_request_id = br.id
  WHERE br.status = 'completed'
  ORDER BY br.updated_at DESC
  LIMIT 1
);