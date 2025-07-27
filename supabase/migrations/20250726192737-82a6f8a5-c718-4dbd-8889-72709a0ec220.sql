-- Add missing columns to kiosks table that the code expects
ALTER TABLE public.kiosks 
ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN activated_by UUID,
ADD COLUMN current_behavior_request_id UUID;

-- Add comment for clarity
COMMENT ON COLUMN public.kiosks.activated_at IS 'Timestamp when kiosk was activated';
COMMENT ON COLUMN public.kiosks.activated_by IS 'User ID who activated the kiosk';
COMMENT ON COLUMN public.kiosks.current_behavior_request_id IS 'Current behavior request being handled by this kiosk';