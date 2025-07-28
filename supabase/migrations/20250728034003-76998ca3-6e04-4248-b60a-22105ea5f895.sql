-- Drop the existing restrictive status constraint
ALTER TABLE public.behavior_requests DROP CONSTRAINT IF EXISTS behavior_requests_status_check;

-- Add updated constraint to allow 'waiting', 'completed', and 'review' status values
ALTER TABLE public.behavior_requests ADD CONSTRAINT behavior_requests_status_check 
CHECK (status IN ('waiting', 'completed', 'review'));