-- Final fix for Alex Thompson's kiosk_status
UPDATE behavior_requests 
SET kiosk_status = 'completed'
WHERE id = '6673b6b8-21b6-4f82-a6c2-11cb19de3533' 
  AND kiosk_status = 'waiting';