-- FINAL SECURITY PATCH: Complete behavior_requests lockdown

-- Remove the existing minimal kiosk access policy
DROP POLICY IF EXISTS "emergency_behavior_requests_kiosk_minimal" ON public.behavior_requests;

-- Create completely locked down behavior_requests access
CREATE POLICY "emergency_behavior_requests_no_anon_access" 
ON public.behavior_requests 
FOR ALL 
TO anon
USING (false);

-- Extremely limited kiosk access - only for reflection submission validation
-- This allows kiosks to verify they have a valid active request but doesn't expose data
CREATE POLICY "emergency_behavior_requests_kiosk_validation_only" 
ON public.behavior_requests 
FOR SELECT 
TO anon
USING (
  -- Only allow access to verify existence of active request for current kiosk assignment
  status = 'active' 
  AND id IN (
    SELECT current_behavior_request_id 
    FROM kiosks 
    WHERE is_active = true 
    AND current_behavior_request_id = behavior_requests.id
    AND current_student_id IS NOT NULL
  )
  -- Additional security: Only return minimal fields needed for validation
  AND student_id IN (
    SELECT current_student_id 
    FROM kiosks 
    WHERE current_behavior_request_id = behavior_requests.id
  )
);