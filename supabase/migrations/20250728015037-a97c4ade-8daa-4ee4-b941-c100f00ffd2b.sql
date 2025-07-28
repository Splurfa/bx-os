-- Fix Alex Thompson's kiosk_status to be 'completed'
UPDATE behavior_requests 
SET kiosk_status = 'completed'
WHERE id = '6673b6b8-21b6-4f82-a6c2-11cb19de3533' 
  AND status = 'completed' 
  AND kiosk_status = 'waiting';