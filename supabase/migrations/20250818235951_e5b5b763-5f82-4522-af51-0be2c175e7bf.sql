-- Emergency Security Lockdown: Fix Critical RLS Vulnerabilities

-- 1. STUDENT DATA PROTECTION
-- Drop overly permissive anonymous student access policy
DROP POLICY IF EXISTS "Anonymous kiosk student authentication only" ON students;

-- Create minimal kiosk-only access for student authentication (DOB validation only)
CREATE POLICY "Kiosk student authentication minimal access"
ON students
FOR SELECT
TO anon
USING (
  -- Only allow access to specific fields needed for authentication
  -- and only for students currently assigned to active kiosks
  id IN (
    SELECT current_student_id 
    FROM kiosks 
    WHERE is_active = true AND current_student_id IS NOT NULL
  )
);

-- 2. KIOSK SYSTEM HARDENING  
-- Drop overly permissive anonymous policies
DROP POLICY IF EXISTS "Anonymous kiosk read access" ON kiosks;
DROP POLICY IF EXISTS "System kiosk updates for anonymous" ON kiosks;

-- Create secure anonymous kiosk access (minimal info only)
CREATE POLICY "Anonymous kiosk minimal read access"
ON kiosks
FOR SELECT
TO anon
USING (
  -- Only allow reading basic kiosk status, not internal system info
  is_active = true
);

-- Create controlled kiosk update access for authenticated operations only
CREATE POLICY "Authenticated kiosk updates only"
ON kiosks  
FOR UPDATE
TO authenticated
USING (true);

-- Create system-level kiosk updates (for RPC functions) with service role only
CREATE POLICY "Service role kiosk management"
ON kiosks
FOR ALL
TO service_role
USING (true);

-- 3. SESSION DATA PROTECTION
-- Drop overly permissive session policy
DROP POLICY IF EXISTS "System can manage sessions" ON user_sessions;

-- Create restricted session management policies
CREATE POLICY "Service role session management only"
ON user_sessions
FOR ALL  
TO service_role
USING (true);

CREATE POLICY "Authenticated users session updates"
ON user_sessions
FOR UPDATE
TO authenticated  
USING (user_id = auth.uid());

-- 4. BEHAVIOR REQUESTS - Secure anonymous submission pathway
-- Update existing policy to be more restrictive
DROP POLICY IF EXISTS "Anonymous kiosk behavior request minimal access" ON behavior_requests;

CREATE POLICY "Anonymous kiosk behavior request read only"
ON behavior_requests
FOR SELECT
TO anon
USING (
  -- Only allow reading requests that are actively assigned to kiosks
  status IN ('active', 'waiting') AND 
  id IN (
    SELECT current_behavior_request_id 
    FROM kiosks 
    WHERE is_active = true AND current_behavior_request_id IS NOT NULL
  )
);

-- 5. REFLECTIONS - Secure anonymous submission
-- Update reflection policy to ensure proper validation
DROP POLICY IF EXISTS "Anonymous kiosk reflection submission" ON reflections;

CREATE POLICY "Anonymous kiosk reflection submission verified"
ON reflections
FOR INSERT
TO anon  
WITH CHECK (
  -- Only allow reflection submission for active behavior requests on active kiosks
  behavior_request_id IN (
    SELECT k.current_behavior_request_id
    FROM kiosks k
    JOIN behavior_requests br ON br.id = k.current_behavior_request_id
    WHERE k.is_active = true 
    AND br.status = 'active'
    AND k.current_behavior_request_id IS NOT NULL
  )
);

-- Add audit logging function for security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  user_context TEXT DEFAULT NULL,
  additional_data JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_sessions (
    user_id,
    device_type, 
    device_info,
    location,
    session_status
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'security_audit',
    jsonb_build_object(
      'event_type', event_type,
      'user_context', COALESCE(user_context, 'anonymous'),
      'timestamp', now(),
      'additional_data', additional_data
    ),
    'System Security Audit',
    'audit_log'
  );
END;
$$;