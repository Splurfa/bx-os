-- Phase 1: Create improved atomic kiosk assignment function
CREATE OR REPLACE FUNCTION public.update_student_kiosk_status_atomic(
  p_kiosk_id integer, 
  p_student_id uuid DEFAULT NULL::uuid, 
  p_behavior_request_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(success boolean, message text, kiosk_assigned boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_assignment_check RECORD;
  target_kiosk_check RECORD;
BEGIN
  -- Start transaction block (implicit in function)
  
  -- If assigning a student to a kiosk
  IF p_student_id IS NOT NULL AND p_behavior_request_id IS NOT NULL THEN
    
    -- Check if student already has an active assignment
    SELECT br.id, br.assigned_kiosk, br.status INTO current_assignment_check
    FROM behavior_requests br
    WHERE br.student_id = p_student_id 
      AND br.status IN ('active', 'waiting')
      AND br.id != p_behavior_request_id;
    
    IF FOUND THEN
      RETURN QUERY SELECT false, 'Student already has an active assignment on kiosk ' || current_assignment_check.assigned_kiosk, false;
      RETURN;
    END IF;
    
    -- Check if target kiosk already has an assignment
    SELECT k.current_student_id, k.current_behavior_request_id INTO target_kiosk_check
    FROM kiosks k
    WHERE k.id = p_kiosk_id AND k.current_student_id IS NOT NULL;
    
    IF FOUND THEN
      RETURN QUERY SELECT false, 'Kiosk ' || p_kiosk_id || ' already has student assigned', false;
      RETURN;
    END IF;
    
    -- Proceed with assignment atomically
    
    -- First update the behavior request
    UPDATE behavior_requests 
    SET status = 'active',
        assigned_kiosk = p_kiosk_id,
        updated_at = now()
    WHERE id = p_behavior_request_id
      AND student_id = p_student_id
      AND status = 'waiting'
      AND assigned_kiosk IS NULL;
    
    IF NOT FOUND THEN
      RETURN QUERY SELECT false, 'Behavior request not found or not available for assignment', false;
      RETURN;
    END IF;
    
    -- Then update kiosk assignment
    UPDATE kiosks 
    SET current_student_id = p_student_id,
        current_behavior_request_id = p_behavior_request_id,
        updated_at = now()
    WHERE id = p_kiosk_id
      AND current_student_id IS NULL;
    
    IF NOT FOUND THEN
      -- Rollback the behavior request update
      UPDATE behavior_requests 
      SET status = 'waiting',
          assigned_kiosk = NULL,
          updated_at = now()
      WHERE id = p_behavior_request_id;
      
      RETURN QUERY SELECT false, 'Kiosk assignment failed - kiosk may be occupied', false;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT true, 'Student successfully assigned to kiosk', true;
    
  -- If clearing kiosk assignment
  ELSE
    -- Clear the kiosk assignment atomically
    UPDATE kiosks 
    SET current_student_id = NULL,
        current_behavior_request_id = NULL,
        updated_at = now()
    WHERE id = p_kiosk_id;
    
    -- Reset any behavior requests that were assigned to this kiosk
    UPDATE behavior_requests 
    SET status = 'waiting',
        assigned_kiosk = NULL,
        updated_at = now()
    WHERE assigned_kiosk = p_kiosk_id
      AND status = 'active';
    
    -- Don't trigger automatic reassignment here to avoid recursion
    -- The calling code should handle reassignment if needed
    
    RETURN QUERY SELECT true, 'Kiosk cleared successfully', false;
  END IF;
  
END;
$function$;

-- Phase 2: Create a safe queue integrity check function
CREATE OR REPLACE FUNCTION public.check_queue_integrity()
RETURNS TABLE(
  issue_type text,
  kiosk_id integer,
  student_id uuid,
  behavior_request_id uuid,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check for kiosks with assignment but no matching behavior request
  RETURN QUERY
  SELECT 
    'kiosk_orphaned_assignment'::text,
    k.id,
    k.current_student_id,
    k.current_behavior_request_id,
    'Kiosk has assignment but behavior request does not exist or is not active'::text
  FROM kiosks k
  LEFT JOIN behavior_requests br ON k.current_behavior_request_id = br.id
  WHERE k.current_student_id IS NOT NULL
    AND k.current_behavior_request_id IS NOT NULL
    AND (br.id IS NULL OR br.status != 'active' OR br.assigned_kiosk != k.id);
  
  -- Check for active behavior requests not reflected in kiosk assignments
  RETURN QUERY
  SELECT 
    'behavior_request_orphaned'::text,
    br.assigned_kiosk,
    br.student_id,
    br.id,
    'Active behavior request assigned to kiosk but kiosk does not reflect assignment'::text
  FROM behavior_requests br
  LEFT JOIN kiosks k ON br.assigned_kiosk = k.id
  WHERE br.status = 'active' 
    AND br.assigned_kiosk IS NOT NULL
    AND (k.current_behavior_request_id != br.id OR k.current_student_id != br.student_id);
  
  -- Check for multiple active requests for same student
  RETURN QUERY
  SELECT 
    'duplicate_student_assignments'::text,
    br.assigned_kiosk,
    br.student_id,
    br.id,
    'Student has multiple active behavior requests'::text
  FROM behavior_requests br
  WHERE br.status IN ('active', 'waiting')
    AND br.student_id IN (
      SELECT student_id 
      FROM behavior_requests 
      WHERE status IN ('active', 'waiting')
      GROUP BY student_id 
      HAVING COUNT(*) > 1
    );
END;
$function$;

-- Phase 3: Create automatic integrity repair function  
CREATE OR REPLACE FUNCTION public.repair_queue_integrity()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  repairs_made INTEGER := 0;
  repair_log TEXT := '';
BEGIN
  -- Fix orphaned kiosk assignments
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE (current_student_id IS NOT NULL OR current_behavior_request_id IS NOT NULL)
    AND id IN (
      SELECT k.id
      FROM kiosks k
      LEFT JOIN behavior_requests br ON k.current_behavior_request_id = br.id
      WHERE k.current_student_id IS NOT NULL
        AND k.current_behavior_request_id IS NOT NULL
        AND (br.id IS NULL OR br.status != 'active' OR br.assigned_kiosk != k.id)
    );
  
  GET DIAGNOSTICS repairs_made = ROW_COUNT;
  repair_log := repair_log || 'Fixed ' || repairs_made || ' orphaned kiosk assignments. ';
  
  -- Fix orphaned behavior request assignments
  UPDATE behavior_requests
  SET assigned_kiosk = NULL,
      status = 'waiting',
      updated_at = now()
  WHERE status = 'active' 
    AND assigned_kiosk IS NOT NULL
    AND id IN (
      SELECT br.id
      FROM behavior_requests br
      LEFT JOIN kiosks k ON br.assigned_kiosk = k.id
      WHERE br.status = 'active' 
        AND br.assigned_kiosk IS NOT NULL
        AND (k.current_behavior_request_id != br.id OR k.current_student_id != br.student_id)
    );
  
  GET DIAGNOSTICS repairs_made = ROW_COUNT;
  repair_log := repair_log || 'Fixed ' || repairs_made || ' orphaned behavior request assignments. ';
  
  -- Archive duplicate requests (keep the earliest one per student)
  WITH duplicate_requests AS (
    SELECT id, student_id,
           ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at ASC) as rn
    FROM behavior_requests
    WHERE status IN ('active', 'waiting')
  )
  UPDATE behavior_requests
  SET status = 'completed'
  WHERE id IN (
    SELECT id FROM duplicate_requests WHERE rn > 1
  );
  
  GET DIAGNOSTICS repairs_made = ROW_COUNT;
  repair_log := repair_log || 'Archived ' || repairs_made || ' duplicate requests. ';
  
  -- Run reassignment after cleanup
  PERFORM reassign_waiting_students();
  repair_log := repair_log || 'Reassigned waiting students.';
  
  RETURN repair_log;
END;
$function$;