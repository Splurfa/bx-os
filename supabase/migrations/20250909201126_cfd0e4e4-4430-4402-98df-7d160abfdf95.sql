-- Database Hygiene Plan Implementation - Revised to handle FK constraints
-- Phase 1: Drop foreign key constraint that's blocking deletion (if it exists)
-- Note: Based on query results, there might not be an explicit FK constraint

-- Phase 2: Clean up existing completed records FIRST (without deleting from behavior_requests yet)
-- Archive existing completed behavior requests without deleting source records yet
INSERT INTO behavior_history (
    behavior_request_id,
    student_id,
    reflection_id,
    resolution_type,
    resolution_notes,
    archived_at
)
SELECT DISTINCT ON (br.id)
    br.id,
    br.student_id,
    r.id,
    'cleanup_archive',
    'Archived during database hygiene cleanup',
    now()
FROM behavior_requests br
LEFT JOIN reflections r ON r.behavior_request_id = br.id
WHERE br.status = 'completed'
AND NOT EXISTS (
    SELECT 1 FROM behavior_history bh 
    WHERE bh.behavior_request_id = br.id
);

-- Clear kiosk assignments for completed requests
UPDATE kiosks 
SET current_student_id = NULL,
    current_behavior_request_id = NULL,
    updated_at = now()
WHERE current_behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status = 'completed'
);

-- Delete reflections for completed requests first
DELETE FROM reflections 
WHERE behavior_request_id IN (
    SELECT id FROM behavior_requests WHERE status = 'completed'
);

-- Now delete completed behavior requests (they're archived in behavior_history)
DELETE FROM behavior_requests WHERE status = 'completed';

-- Phase 3: Remove duplicate entries from behavior_history  
WITH duplicate_history AS (
    SELECT id, 
           ROW_NUMBER() OVER (
               PARTITION BY behavior_request_id, student_id 
               ORDER BY archived_at ASC
           ) as rn
    FROM behavior_history
)
DELETE FROM behavior_history 
WHERE id IN (
    SELECT id FROM duplicate_history WHERE rn > 1
);

-- Phase 4: Create automatic archival trigger for future completed behavior requests
CREATE OR REPLACE FUNCTION public.auto_archive_completed_behavior_requests()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when status changes to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Insert into behavior_history
        INSERT INTO behavior_history (
            behavior_request_id,
            student_id,
            reflection_id,
            resolution_type,
            resolution_notes,
            archived_at
        )
        SELECT 
            NEW.id,
            NEW.student_id,
            r.id,
            'completed',
            'Automatically archived when marked as completed',
            now()
        FROM reflections r 
        WHERE r.behavior_request_id = NEW.id
        ON CONFLICT DO NOTHING; -- Prevent duplicates
        
        -- Clear any kiosk assignments for this request
        UPDATE kiosks 
        SET current_student_id = NULL,
            current_behavior_request_id = NULL,
            updated_at = now()
        WHERE current_behavior_request_id = NEW.id;
        
        -- Delete reflections first
        DELETE FROM reflections WHERE behavior_request_id = NEW.id;
        
        -- Delete the behavior request (it's now archived)
        DELETE FROM behavior_requests WHERE id = NEW.id;
        
        -- Return NULL to prevent the original UPDATE from completing
        RETURN NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_archive_on_completion ON behavior_requests;
CREATE TRIGGER auto_archive_on_completion
    BEFORE UPDATE ON behavior_requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_archive_completed_behavior_requests();

-- Phase 5: Remove unused tables (AI/Analytics that aren't implemented)
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS behavior_patterns CASCADE; 
DROP TABLE IF EXISTS external_data CASCADE;
DROP TABLE IF EXISTS data_sources CASCADE;
DROP TABLE IF EXISTS csv_import_raw CASCADE;

-- Phase 6: Add data retention policy function for old archives
CREATE OR REPLACE FUNCTION public.cleanup_old_behavior_history()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete behavior history older than 2 years
    DELETE FROM behavior_history 
    WHERE archived_at < now() - interval '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 7: Add performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_behavior_requests_status ON behavior_requests(status);
CREATE INDEX IF NOT EXISTS idx_behavior_requests_teacher_id ON behavior_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_behavior_requests_student_id ON behavior_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_behavior_history_archived_at ON behavior_history(archived_at);
CREATE INDEX IF NOT EXISTS idx_reflections_behavior_request_id ON reflections(behavior_request_id);

-- Phase 8: Add queue health monitoring function
CREATE OR REPLACE FUNCTION public.check_queue_health()
RETURNS TABLE(
    metric_name TEXT,
    metric_value INTEGER,
    status TEXT,
    recommendation TEXT
) AS $$
BEGIN
    -- Check for requests stuck in 'active' status too long (>4 hours)
    RETURN QUERY
    SELECT 
        'stuck_active_requests'::TEXT,
        COUNT(*)::INTEGER,
        CASE WHEN COUNT(*) > 0 THEN 'warning' ELSE 'healthy' END::TEXT,
        'Consider reassigning stuck requests'::TEXT
    FROM behavior_requests 
    WHERE status = 'active' AND created_at < now() - interval '4 hours';
    
    -- Check for orphaned reflections (reflection without behavior_request)
    RETURN QUERY
    SELECT 
        'orphaned_reflections'::TEXT,
        COUNT(*)::INTEGER,
        CASE WHEN COUNT(*) > 0 THEN 'error' ELSE 'healthy' END::TEXT,
        'Clean up orphaned reflection records'::TEXT
    FROM reflections r
    LEFT JOIN behavior_requests br ON br.id = r.behavior_request_id
    WHERE br.id IS NULL;
    
    -- Check total active requests
    RETURN QUERY
    SELECT 
        'total_active_requests'::TEXT,
        COUNT(*)::INTEGER,
        'info'::TEXT,
        'Current queue depth'::TEXT
    FROM behavior_requests 
    WHERE status IN ('waiting', 'active', 'review');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;