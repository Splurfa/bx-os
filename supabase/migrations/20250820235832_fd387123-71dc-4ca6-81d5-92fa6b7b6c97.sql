-- Fix the incomplete approval for Asher Ram and improve the approval process
-- First, complete the approval that got stuck

-- Insert the missing behavior history record
INSERT INTO behavior_history (
  behavior_request_id,
  student_id,
  reflection_id,
  resolution_type,
  resolution_notes,
  completed_at,
  archived_at
)
SELECT 
  br.id,
  br.student_id,
  r.id,
  'approved',
  'Reflection approved by teacher',
  now(),
  now()
FROM behavior_requests br
JOIN reflections r ON r.behavior_request_id = br.id
WHERE br.id = '360103e1-886d-4920-a2a3-bf6aea600808'
AND r.teacher_approved = true
AND NOT EXISTS (
  SELECT 1 FROM behavior_history bh WHERE bh.behavior_request_id = br.id
);

-- Update the behavior request status to completed
UPDATE behavior_requests 
SET status = 'completed', updated_at = now()
WHERE id = '360103e1-886d-4920-a2a3-bf6aea600808'
AND status = 'review';