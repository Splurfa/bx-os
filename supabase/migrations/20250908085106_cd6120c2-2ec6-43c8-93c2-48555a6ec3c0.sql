-- Create function to apply queue integrity repairs
CREATE OR REPLACE FUNCTION public.apply_queue_integrity_repairs()
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