-- ABSOLUTE FINAL LOCKDOWN: Zero anonymous access to behavior_requests

-- Remove all anonymous access policies for behavior_requests
DROP POLICY IF EXISTS "emergency_behavior_requests_no_anon_access" ON public.behavior_requests;
DROP POLICY IF EXISTS "emergency_behavior_requests_kiosk_validation_only" ON public.behavior_requests;

-- ABSOLUTE ZERO anonymous access to behavior_requests
-- Anonymous users cannot access behavior_requests at all
CREATE POLICY "absolute_behavior_requests_zero_anon_access" 
ON public.behavior_requests 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Create new reflection submission policy that doesn't require behavior_requests access
-- Instead, kiosks will validate through the kiosks table directly
DROP POLICY IF EXISTS "secure_kiosk_reflection_submission" ON public.reflections;

CREATE POLICY "secure_reflection_submission_via_kiosk_validation" 
ON public.reflections 
FOR INSERT 
TO anon
WITH CHECK (
  -- Validate that the behavior_request_id and student_id match a currently active kiosk
  EXISTS (
    SELECT 1 FROM kiosks k
    WHERE k.is_active = true 
    AND k.current_behavior_request_id = behavior_request_id
    AND k.current_student_id = student_id
    AND k.current_behavior_request_id IS NOT NULL
    AND k.current_student_id IS NOT NULL
  )
);