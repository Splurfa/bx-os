-- CRITICAL FIX: Clean up existing duplicates and implement atomic kiosk assignment

-- Step 1: Clean up existing duplicate assignments
-- Keep only the earliest created behavior request for each kiosk
WITH duplicate_assignments AS (
  SELECT 
    assigned_kiosk_id,
    id,
    ROW_NUMBER() OVER (PARTITION BY assigned_kiosk_id ORDER BY created_at ASC) as rn
  FROM public.behavior_requests 
  WHERE assigned_kiosk_id IS NOT NULL
    AND kiosk_status IN ('waiting', 'ready', 'in_progress')
)
UPDATE public.behavior_requests
SET 
  assigned_kiosk_id = NULL,
  kiosk_status = 'waiting',
  updated_at = now()
FROM duplicate_assignments
WHERE public.behavior_requests.id = duplicate_assignments.id
  AND duplicate_assignments.rn > 1;

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.behavior_requests 
ADD CONSTRAINT unique_kiosk_assignment 
UNIQUE (assigned_kiosk_id) 
DEFERRABLE INITIALLY DEFERRED;

-- Step 3: Create partial unique index for active assignments only
CREATE UNIQUE INDEX idx_unique_active_kiosk_assignment 
ON public.behavior_requests (assigned_kiosk_id) 
WHERE assigned_kiosk_id IS NOT NULL 
  AND kiosk_status IN ('waiting', 'ready', 'in_progress');

-- Step 4: Create atomic assignment function with row-level locking
CREATE OR REPLACE FUNCTION public.reassign_waiting_students()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  assignment_count integer := 0;
BEGIN
  -- Use advisory lock to prevent concurrent executions
  IF NOT pg_try_advisory_lock(12345) THEN
    -- Another instance is running, exit early to prevent race conditions
    RAISE NOTICE 'Another reassignment process is running, skipping';
    RETURN;
  END IF;
  
  BEGIN
    -- Clean up any invalid assignments first
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
    
    -- ATOMIC ASSIGNMENT: Single query with proper ordering and locking
    WITH available_kiosks AS (
      -- Get available kiosks with row-level locking
      SELECT k.id as kiosk_id
      FROM public.kiosks k
      WHERE k.is_active = true 
        AND NOT EXISTS (
          SELECT 1 FROM public.behavior_requests br 
          WHERE br.assigned_kiosk_id = k.id 
            AND br.kiosk_status IN ('waiting', 'ready', 'in_progress')
        )
      ORDER BY k.id
      FOR UPDATE SKIP LOCKED
    ),
    waiting_students AS (
      -- Get waiting students in FIFO order
      SELECT id as request_id
      FROM public.behavior_requests
      WHERE status = 'waiting' 
        AND kiosk_status = 'waiting'
        AND assigned_kiosk_id IS NULL
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
    ),
    assignments AS (
      -- Match students to kiosks 1:1
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
$function$;

-- Step 5: Update kiosk-specific assignment function
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
    RAISE NOTICE 'Kiosk % assignment already in progress', p_kiosk_id;
    RETURN;
  END IF;
  
  BEGIN
    -- Atomic assignment with proper availability check
    WITH next_student AS (
      SELECT br.id
      FROM public.behavior_requests br
      WHERE br.status = 'waiting' 
        AND br.kiosk_status = 'waiting'
        AND br.assigned_kiosk_id IS NULL
        AND EXISTS (
          SELECT 1 FROM public.kiosks k
          WHERE k.id = p_kiosk_id 
            AND k.is_active = true
            AND NOT EXISTS (
              SELECT 1 FROM public.behavior_requests br2 
              WHERE br2.assigned_kiosk_id = k.id 
                AND br2.kiosk_status IN ('waiting', 'ready', 'in_progress')
            )
        )
      ORDER BY br.created_at ASC
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
    
    IF assignment_count > 0 THEN
      RAISE NOTICE 'Assigned 1 student to kiosk % atomically', p_kiosk_id;
    ELSE
      RAISE NOTICE 'No students assigned to kiosk % (no available students or kiosk occupied)', p_kiosk_id;
    END IF;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE WARNING 'Kiosk % already occupied, assignment prevented', p_kiosk_id;
    WHEN OTHERS THEN
      RAISE WARNING 'Error assigning to kiosk %: %', p_kiosk_id, SQLERRM;
  END;
  
  PERFORM pg_advisory_unlock(12346, p_kiosk_id);
END;
$function$;