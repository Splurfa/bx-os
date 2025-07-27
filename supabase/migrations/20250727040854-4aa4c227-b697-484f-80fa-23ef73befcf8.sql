-- Fix security warnings: Update functions with CASCADE to handle dependencies

-- Fix validate_kiosk_availability function with CASCADE
DROP FUNCTION IF EXISTS public.validate_kiosk_availability() CASCADE;
CREATE OR REPLACE FUNCTION public.validate_kiosk_availability()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Recreate the trigger that was dropped
CREATE TRIGGER validate_kiosk_availability_trigger
  BEFORE INSERT OR UPDATE ON public.behavior_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_kiosk_availability();

-- Fix handle_kiosk_deactivation function with CASCADE
DROP FUNCTION IF EXISTS public.handle_kiosk_deactivation() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_kiosk_deactivation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Recreate the trigger that was dropped
CREATE TRIGGER handle_kiosk_deactivation_trigger
  BEFORE UPDATE ON public.kiosks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_kiosk_deactivation();