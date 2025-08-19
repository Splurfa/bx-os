-- Clean up duplicate and invalid sessions
-- First end all current active sessions to force clean slate
UPDATE user_sessions 
SET session_status = 'ended', ended_at = now() 
WHERE session_status IN ('active', 'idle');

-- Clean up old ended sessions (older than 24 hours)
DELETE FROM user_sessions 
WHERE session_status = 'ended' 
AND ended_at < now() - interval '24 hours';

-- Add index for better query performance on session lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_status 
ON user_sessions(user_id, session_status) 
WHERE session_status IN ('active', 'idle');