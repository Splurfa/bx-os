-- Fix the ambiguous column reference in check_queue_integrity
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
  
  -- Check for multiple active requests for same student - fix ambiguous reference
  RETURN QUERY
  SELECT 
    'duplicate_student_assignments'::text,
    br1.assigned_kiosk,
    br1.student_id,
    br1.id,
    'Student has multiple active behavior requests'::text
  FROM behavior_requests br1
  WHERE br1.status IN ('active', 'waiting')
    AND br1.student_id IN (
      SELECT br2.student_id 
      FROM behavior_requests br2
      WHERE br2.status IN ('active', 'waiting')
      GROUP BY br2.student_id 
      HAVING COUNT(*) > 1
    );
END;
$function$;

-- Make repair function read-only and return suggestions instead of making changes
CREATE OR REPLACE FUNCTION public.get_queue_repair_suggestions()
RETURNS TABLE(
  repair_type text,
  kiosk_id integer,
  behavior_request_id uuid,
  suggested_action text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Suggestions for orphaned kiosk assignments
  RETURN QUERY
  SELECT 
    'clear_orphaned_kiosk'::text,
    k.id,
    k.current_behavior_request_id,
    'Clear kiosk assignment for kiosk ' || k.id::text
  FROM kiosks k
  LEFT JOIN behavior_requests br ON k.current_behavior_request_id = br.id
  WHERE k.current_student_id IS NOT NULL
    AND k.current_behavior_request_id IS NOT NULL
    AND (br.id IS NULL OR br.status != 'active' OR br.assigned_kiosk != k.id);
  
  -- Suggestions for orphaned behavior request assignments
  RETURN QUERY
  SELECT 
    'reset_orphaned_request'::text,
    br.assigned_kiosk,
    br.id,
    'Reset behavior request ' || br.id::text || ' to waiting status'
  FROM behavior_requests br
  LEFT JOIN kiosks k ON br.assigned_kiosk = k.id
  WHERE br.status = 'active' 
    AND br.assigned_kiosk IS NOT NULL
    AND (k.current_behavior_request_id != br.id OR k.current_student_id != br.student_id);
END;
$function$;