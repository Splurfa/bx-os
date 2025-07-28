-- Fix the reassign_waiting_students function to properly clear kiosk assignments for review status students
CREATE OR REPLACE FUNCTION public.reassign_waiting_students()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  assignment_count integer := 0;
  cleanup_count integer := 0;
BEGIN
  -- Use advisory lock to prevent concurrent executions
  IF NOT pg_try_advisory_lock(12345) THEN
    RAISE NOTICE 'Another reassignment process is running, skipping';
    RETURN;
  END IF;
  
  BEGIN
    -- CRITICAL FIX: Clear kiosk assignments for students in 'review' or 'completed' status
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = NULL,
      kiosk_status = 'waiting',
      updated_at = now()
    WHERE status IN ('review', 'completed') 
      AND assigned_kiosk_id IS NOT NULL;
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RAISE NOTICE 'Cleared % kiosk assignments for review/completed students', cleanup_count;
    
    -- Clean up any invalid assignments (kiosks that are no longer active)
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = NULL,
      kiosk_status = 'waiting',
      updated_at = now()
    WHERE assigned_kiosk_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.kiosks k 
        WHERE k.id = assigned_kiosk_id AND k.is_active = true
      );
    
    -- If no active kiosks, unassign all waiting students
    IF NOT EXISTS (SELECT 1 FROM public.kiosks WHERE is_active = true) THEN
      UPDATE public.behavior_requests
      SET 
        assigned_kiosk_id = NULL,
        kiosk_status = 'waiting',
        updated_at = now()
      WHERE status = 'waiting' AND assigned_kiosk_id IS NOT NULL;
      
      PERFORM pg_advisory_unlock(12345);
      RETURN;
    END IF;
    
    -- IMPROVED ASSIGNMENT: Find available kiosks (now properly freed up)
    WITH available_kiosks AS (
      SELECT k.id as kiosk_id
      FROM public.kiosks k
      WHERE k.is_active = true 
        AND NOT EXISTS (
          SELECT 1 FROM public.behavior_requests br 
          WHERE br.assigned_kiosk_id = k.id 
            AND br.status = 'waiting'  -- Only consider waiting requests
            AND br.kiosk_status IN ('waiting', 'ready', 'in_progress')
        )
      ORDER BY k.id
      FOR UPDATE SKIP LOCKED
    ),
    waiting_students AS (
      SELECT id as request_id
      FROM public.behavior_requests
      WHERE status = 'waiting' 
        AND kiosk_status = 'waiting'
        AND assigned_kiosk_id IS NULL
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
    ),
    assignments AS (
      SELECT 
        ws.request_id,
        ak.kiosk_id,
        ROW_NUMBER() OVER () as assignment_order
      FROM (
        SELECT request_id, ROW_NUMBER() OVER (ORDER BY request_id) as student_order
        FROM waiting_students
      ) ws
      JOIN (
        SELECT kiosk_id, ROW_NUMBER() OVER (ORDER BY kiosk_id) as kiosk_order  
        FROM available_kiosks
      ) ak ON ws.student_order = ak.kiosk_order
    )
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = assignments.kiosk_id,
      kiosk_status = 'waiting',
      updated_at = now()
    FROM assignments
    WHERE public.behavior_requests.id = assignments.request_id;
    
    GET DIAGNOSTICS assignment_count = ROW_COUNT;
    RAISE NOTICE 'Atomically assigned % students to kiosks', assignment_count;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE WARNING 'Prevented duplicate kiosk assignment via constraint';
    WHEN OTHERS THEN
      RAISE WARNING 'Error in reassign_waiting_students: %', SQLERRM;
  END;
  
  -- Always release the advisory lock
  PERFORM pg_advisory_unlock(12345);
END;
$function$