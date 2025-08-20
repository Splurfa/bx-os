-- Fix student assignment to kiosk logic
-- Update the function to properly handle behavior request status transitions

CREATE OR REPLACE FUNCTION public.update_student_kiosk_status(
  p_kiosk_id integer, 
  p_student_id uuid DEFAULT NULL::uuid, 
  p_behavior_request_id uuid DEFAULT NULL::uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- If assigning a student to a kiosk
  IF p_student_id IS NOT NULL AND p_behavior_request_id IS NOT NULL THEN
    -- Update the behavior request status to active and assign kiosk
    UPDATE behavior_requests 
    SET status = 'active',
        assigned_kiosk = p_kiosk_id,
        updated_at = now()
    WHERE id = p_behavior_request_id
    AND student_id = p_student_id
    AND status = 'waiting';
    
    -- Update kiosk with assigned student
    UPDATE kiosks 
    SET current_student_id = p_student_id,
        current_behavior_request_id = p_behavior_request_id,
        updated_at = now()
    WHERE id = p_kiosk_id;
    
  -- If clearing kiosk assignment
  ELSE
    -- Clear the kiosk assignment
    UPDATE kiosks 
    SET current_student_id = NULL,
        current_behavior_request_id = NULL,
        updated_at = now()
    WHERE id = p_kiosk_id;
    
    -- Find any behavior requests that were assigned to this kiosk and reset them to waiting
    UPDATE behavior_requests 
    SET status = 'waiting',
        assigned_kiosk = NULL,
        updated_at = now()
    WHERE assigned_kiosk = p_kiosk_id
    AND status = 'active';
    
    -- Reassign waiting students to available kiosks
    PERFORM reassign_waiting_students();
  END IF;
END;
$function$