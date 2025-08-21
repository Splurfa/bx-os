-- Fix kiosk assignment regression by adding automatic triggers
-- First, manually assign waiting students to available kiosks
SELECT reassign_waiting_students();

-- Create trigger function for automatic student assignment
CREATE OR REPLACE FUNCTION trigger_reassign_waiting_students()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the reassignment function after any change that might affect assignments
  PERFORM reassign_waiting_students();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger when new behavior requests are created with 'waiting' status
CREATE OR REPLACE TRIGGER trigger_new_behavior_request_assignment
  AFTER INSERT ON behavior_requests
  FOR EACH ROW
  WHEN (NEW.status = 'waiting')
  EXECUTE FUNCTION trigger_reassign_waiting_students();

-- Trigger when behavior requests are completed (frees up kiosks)
CREATE OR REPLACE TRIGGER trigger_completed_behavior_request_reassignment
  AFTER UPDATE ON behavior_requests
  FOR EACH ROW
  WHEN (OLD.status IN ('active', 'review') AND NEW.status = 'completed')
  EXECUTE FUNCTION trigger_reassign_waiting_students();

-- Trigger when kiosks are activated/deactivated
CREATE OR REPLACE TRIGGER trigger_kiosk_status_change_reassignment
  AFTER UPDATE ON kiosks
  FOR EACH ROW
  WHEN (OLD.is_active != NEW.is_active OR 
        (OLD.current_student_id IS NOT NULL AND NEW.current_student_id IS NULL))
  EXECUTE FUNCTION trigger_reassign_waiting_students();