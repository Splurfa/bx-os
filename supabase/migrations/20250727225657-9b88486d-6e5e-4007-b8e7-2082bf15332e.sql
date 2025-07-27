-- CRITICAL FIX: Eliminate race condition in kiosk assignment with atomic operations and row locking

-- First, add a unique constraint to prevent multiple students per kiosk
ALTER TABLE public.behavior_requests 
ADD CONSTRAINT unique_kiosk_assignment 
UNIQUE (assigned_kiosk_id) 
DEFERRABLE INITIALLY DEFERRED;

-- Add partial unique index to allow NULL assigned_kiosk_id values
DROP INDEX IF EXISTS idx_unique_kiosk_assignment;
CREATE UNIQUE INDEX idx_unique_kiosk_assignment 
ON public.behavior_requests (assigned_kiosk_id) 
WHERE assigned_kiosk_id IS NOT NULL 
  AND kiosk_status IN ('waiting', 'ready', 'in_progress');

-- Create atomic assignment function with row-level locking
CREATE OR REPLACE FUNCTION public.reassign_waiting_students()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  assignment_result RECORD;
  active_kiosk_count integer;
  waiting_count integer;
BEGIN
  -- Use advisory lock to prevent concurrent executions
  IF NOT pg_try_advisory_lock(12345) THEN
    -- Another instance is running, exit early
    RETURN;
  END IF;
  
  BEGIN
    -- Get count of active kiosks
    SELECT COUNT(*) INTO active_kiosk_count
    FROM public.kiosks
    WHERE is_active = true;
    
    -- If no active kiosks, unassign all waiting students
    IF active_kiosk_count = 0 THEN
      UPDATE public.behavior_requests
      SET 
        assigned_kiosk_id = NULL,
        kiosk_status = 'waiting',
        updated_at = now()
      WHERE status = 'waiting' AND assigned_kiosk_id IS NOT NULL;
      
      -- Release lock and return
      PERFORM pg_advisory_unlock(12345);
      RETURN;
    END IF;
    
    -- Get count of unassigned waiting students
    SELECT COUNT(*) INTO waiting_count
    FROM public.behavior_requests
    WHERE status = 'waiting' 
      AND kiosk_status = 'waiting'
      AND assigned_kiosk_id IS NULL;
    
    -- If no waiting students, release lock and return
    IF waiting_count = 0 THEN
      PERFORM pg_advisory_unlock(12345);
      RETURN;
    END IF;
    
    -- ATOMIC ASSIGNMENT: Use single query with row locking and immediate assignment
    -- This prevents race conditions by locking kiosks and assigning in one operation
    WITH available_kiosks AS (
      SELECT k.id as kiosk_id
      FROM public.kiosks k
      WHERE k.is_active = true 
        AND NOT EXISTS (
          SELECT 1 FROM public.behavior_requests br 
          WHERE br.assigned_kiosk_id = k.id 
            AND br.kiosk_status IN ('waiting', 'ready', 'in_progress')
        )
      ORDER BY k.id
      FOR UPDATE SKIP LOCKED  -- Lock available kiosks, skip if already locked
    ),
    waiting_students AS (
      SELECT br.id as request_id, ROW_NUMBER() OVER (ORDER BY br.created_at ASC) as rn
      FROM public.behavior_requests br
      WHERE br.status = 'waiting' 
        AND br.kiosk_status = 'waiting'
        AND br.assigned_kiosk_id IS NULL
      ORDER BY br.created_at ASC
    ),
    assignments AS (
      SELECT 
        ws.request_id,
        ak.kiosk_id,
        ROW_NUMBER() OVER () as assignment_order
      FROM waiting_students ws
      JOIN available_kiosks ak ON ws.rn = ROW_NUMBER() OVER (ORDER BY ak.kiosk_id)
    )
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = assignments.kiosk_id,
      kiosk_status = 'waiting',
      updated_at = now()
    FROM assignments
    WHERE public.behavior_requests.id = assignments.request_id;
    
    -- Get assignment results for logging
    GET DIAGNOSTICS assignment_result.assignment_count = ROW_COUNT;
    
    -- Log successful assignments
    RAISE NOTICE 'Successfully assigned % students to kiosks atomically', assignment_result.assignment_count;
    
  EXCEPTION
    WHEN unique_violation THEN
      -- Handle constraint violation gracefully
      RAISE WARNING 'Constraint violation prevented duplicate kiosk assignment';
    WHEN OTHERS THEN
      -- Log any other errors
      RAISE WARNING 'Error in reassign_waiting_students: %', SQLERRM;
  END;
  
  -- Always release the advisory lock
  PERFORM pg_advisory_unlock(12345);
END;
$function$;

-- Create optimized function for single kiosk activation
CREATE OR REPLACE FUNCTION public.assign_waiting_students_to_kiosk(p_kiosk_id integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  assignment_count integer := 0;
BEGIN
  -- Use kiosk-specific advisory lock
  IF NOT pg_try_advisory_lock(12346, p_kiosk_id) THEN
    -- Another assignment is in progress for this kiosk
    RETURN;
  END IF;
  
  BEGIN
    -- Check if kiosk is active and available
    IF NOT EXISTS (
      SELECT 1 FROM public.kiosks k
      WHERE k.id = p_kiosk_id 
        AND k.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM public.behavior_requests br 
          WHERE br.assigned_kiosk_id = k.id 
            AND br.kiosk_status IN ('waiting', 'ready', 'in_progress')
        )
    ) THEN
      -- Kiosk not available, release lock and return
      PERFORM pg_advisory_unlock(12346, p_kiosk_id);
      RETURN;
    END IF;
    
    -- Atomic assignment of one student to this specific kiosk
    WITH next_student AS (
      SELECT id
      FROM public.behavior_requests
      WHERE status = 'waiting' 
        AND kiosk_status = 'waiting'
        AND assigned_kiosk_id IS NULL
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    UPDATE public.behavior_requests
    SET 
      assigned_kiosk_id = p_kiosk_id,
      kiosk_status = 'waiting',
      updated_at = now()
    FROM next_student
    WHERE public.behavior_requests.id = next_student.id;
    
    GET DIAGNOSTICS assignment_count = ROW_COUNT;
    
    -- Log assignment
    IF assignment_count > 0 THEN
      RAISE NOTICE 'Assigned 1 student to kiosk % atomically', p_kiosk_id;
    END IF;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE WARNING 'Kiosk % already has a student assigned', p_kiosk_id;
    WHEN OTHERS THEN
      RAISE WARNING 'Error assigning to kiosk %: %', p_kiosk_id, SQLERRM;
  END;
  
  -- Release kiosk-specific lock
  PERFORM pg_advisory_unlock(12346, p_kiosk_id);
END;
$function$;