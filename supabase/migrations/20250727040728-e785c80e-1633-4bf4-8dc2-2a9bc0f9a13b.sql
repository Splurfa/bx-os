-- Phase 1: Database Status Enhancement (without realtime line)
-- Add new kiosk_status field to behavior_requests for tracking student kiosk state
ALTER TABLE public.behavior_requests 
ADD COLUMN kiosk_status text DEFAULT 'waiting' NOT NULL;

-- Add check constraint for kiosk_status values
ALTER TABLE public.behavior_requests 
ADD CONSTRAINT behavior_requests_kiosk_status_check 
CHECK (kiosk_status IN ('waiting', 'ready', 'in_progress'));

-- Update existing status field check constraint to only allow 'waiting' and 'completed'
-- First drop the existing constraint if it exists
ALTER TABLE public.behavior_requests 
DROP CONSTRAINT IF EXISTS behavior_requests_status_check;

-- Add the new constraint
ALTER TABLE public.behavior_requests 
ADD CONSTRAINT behavior_requests_status_check 
CHECK (status IN ('waiting', 'completed'));

-- Create function to validate kiosk availability before status updates
CREATE OR REPLACE FUNCTION public.validate_kiosk_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- If assigning to a kiosk, validate it's active and available
  IF NEW.assigned_kiosk_id IS NOT NULL THEN
    -- Check if kiosk exists and is active
    IF NOT EXISTS (
      SELECT 1 FROM public.kiosks 
      WHERE id = NEW.assigned_kiosk_id 
      AND is_active = true
    ) THEN
      -- Keep student in waiting if kiosk is not active
      NEW.kiosk_status = 'waiting';
      NEW.assigned_kiosk_id = NULL;
    END IF;
  END IF;
  
  -- If no kiosk assigned, ensure status is waiting
  IF NEW.assigned_kiosk_id IS NULL THEN
    NEW.kiosk_status = 'waiting';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for kiosk availability validation
CREATE TRIGGER validate_kiosk_availability_trigger
  BEFORE INSERT OR UPDATE ON public.behavior_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_kiosk_availability();

-- Create function to update student status when kiosk shows welcome screen
CREATE OR REPLACE FUNCTION public.update_student_kiosk_status(
  p_behavior_request_id uuid,
  p_new_kiosk_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Validate status transition
  IF p_new_kiosk_status NOT IN ('waiting', 'ready', 'in_progress') THEN
    RAISE EXCEPTION 'Invalid kiosk status: %', p_new_kiosk_status;
  END IF;
  
  -- Update the kiosk status
  UPDATE public.behavior_requests
  SET 
    kiosk_status = p_new_kiosk_status,
    updated_at = now()
  WHERE id = p_behavior_request_id;
END;
$$;

-- Create function to assign waiting students to newly activated kiosks
CREATE OR REPLACE FUNCTION public.assign_waiting_students_to_kiosk(p_kiosk_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  waiting_student_id uuid;
BEGIN
  -- Find first waiting student without kiosk assignment
  SELECT id INTO waiting_student_id
  FROM public.behavior_requests
  WHERE status = 'waiting' 
    AND kiosk_status = 'waiting'
    AND assigned_kiosk_id IS NULL
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Assign student to the kiosk if found
  IF waiting_student_id IS NOT NULL THEN
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = p_kiosk_id,
      kiosk_status = 'waiting', -- Will become 'ready' when kiosk shows welcome
      updated_at = now()
    WHERE id = waiting_student_id;
  END IF;
END;
$$;

-- Create function to handle kiosk deactivation
CREATE OR REPLACE FUNCTION public.handle_kiosk_deactivation()
RETURNS TRIGGER AS $$
BEGIN
  -- If kiosk is being deactivated, reset students back to waiting without kiosk
  IF OLD.is_active = true AND NEW.is_active = false THEN
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = NULL,
      kiosk_status = 'waiting',
      updated_at = now()
    WHERE assigned_kiosk_id = NEW.id
      AND status = 'waiting'; -- Only affect waiting students, not completed ones
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for kiosk deactivation
CREATE TRIGGER handle_kiosk_deactivation_trigger
  BEFORE UPDATE ON public.kiosks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_kiosk_deactivation();

-- Enable realtime for behavior_requests table (replica identity only as table is already in publication)
ALTER TABLE public.behavior_requests REPLICA IDENTITY FULL;