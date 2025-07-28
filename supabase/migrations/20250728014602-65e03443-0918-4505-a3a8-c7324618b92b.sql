-- Phase 1: Fix Data Consistency
-- Update Alex Thompson's completed record to have proper kiosk_status and remove kiosk assignment
UPDATE behavior_requests 
SET 
  kiosk_status = 'completed',
  assigned_kiosk_id = NULL,
  updated_at = now()
WHERE id = '6673b6b8-21b6-4f82-a6c2-11cb19de3533' 
  AND status = 'completed';

-- Manually trigger reassignment to assign Jordan Martinez to available kiosk
SELECT reassign_waiting_students();