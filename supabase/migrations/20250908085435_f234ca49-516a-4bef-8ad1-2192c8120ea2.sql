-- Fix the orphaned behavior request for Andrew Fried
UPDATE behavior_requests 
SET status = 'waiting', 
    assigned_kiosk = NULL,
    updated_at = now()
WHERE id = 'd9160548-d0ae-4dae-bfb4-5b21fb86944d';