-- Manually trigger assignment of waiting student to available kiosk
DO $$
DECLARE
  waiting_request_id UUID;
  waiting_student_id UUID;
BEGIN
  -- Get the first waiting behavior request
  SELECT id, student_id INTO waiting_request_id, waiting_student_id
  FROM behavior_requests 
  WHERE status = 'waiting' 
  AND assigned_kiosk IS NULL
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- If we found a waiting request, assign it to kiosk 1
  IF waiting_request_id IS NOT NULL THEN
    PERFORM update_student_kiosk_status(1, waiting_student_id, waiting_request_id);
  END IF;
END $$;