-- Fix bulk clear operations with CTE transaction and FK constraint guards
CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS TABLE(deleted_request_ids uuid[], cleared_kiosks_count integer, deleted_reflections_count integer, deleted_requests_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requests_to_delete_array uuid[];
  kiosks_cleared_count INTEGER := 0;
  reflections_deleted_count INTEGER := 0;
  requests_deleted_count INTEGER := 0;
  remaining_kiosk_refs INTEGER := 0;
BEGIN
  -- Single transaction with CTE capturing exact deletion set
  WITH requests_to_delete AS (
    SELECT id FROM behavior_requests 
    WHERE status IN ('waiting', 'active')
  ),
  kiosks_cleared AS (
    UPDATE kiosks 
    SET current_behavior_request_id = NULL,
        current_student_id = NULL,
        updated_at = now()
    WHERE current_behavior_request_id IN (SELECT id FROM requests_to_delete)
    RETURNING current_behavior_request_id
  ),
  reflections_deleted AS (
    DELETE FROM reflections 
    WHERE behavior_request_id IN (SELECT id FROM requests_to_delete)
    RETURNING behavior_request_id
  ),
  requests_deleted AS (
    DELETE FROM behavior_requests 
    WHERE id IN (SELECT id FROM requests_to_delete)
    RETURNING id
  )
  SELECT 
    array_agg(DISTINCT rd.id) FILTER (WHERE rd.id IS NOT NULL),
    COUNT(DISTINCT kc.current_behavior_request_id),
    COUNT(DISTINCT rfd.behavior_request_id),
    COUNT(DISTINCT rd.id)
  INTO requests_to_delete_array, kiosks_cleared_count, reflections_deleted_count, requests_deleted_count
  FROM requests_deleted rd
  FULL OUTER JOIN kiosks_cleared kc ON true
  FULL OUTER JOIN reflections_deleted rfd ON true;

  -- Guard: Check if any kiosk still references deleted request IDs
  SELECT COUNT(*) INTO remaining_kiosk_refs
  FROM kiosks k
  WHERE k.current_behavior_request_id = ANY(requests_to_delete_array);
  
  IF remaining_kiosk_refs > 0 THEN
    RAISE EXCEPTION 'FK constraint guard failed: % kiosks still reference deleted request IDs', remaining_kiosk_refs;
  END IF;

  -- Enhanced audit logging
  INSERT INTO user_sessions (
    user_id,
    device_type,
    device_info,
    location,
    session_status
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'admin_action',
    jsonb_build_object(
      'action', 'admin_clear_all_queues',
      'timestamp', now(),
      'status', 'success',
      'version', '5.0_cte_transaction',
      'guard_check_passed', true,
      'items_cleared', jsonb_build_object(
        'kiosks_cleared', kiosks_cleared_count,
        'reflections_deleted', reflections_deleted_count,
        'behavior_requests_deleted', requests_deleted_count
      ),
      'deleted_request_ids', requests_to_delete_array,
      'note', 'CTE transaction with FK constraint guard - no archiving'
    ),
    'Admin Dashboard',
    'completed'
  );

  RETURN QUERY SELECT 
    COALESCE(requests_to_delete_array, ARRAY[]::uuid[]),
    kiosks_cleared_count,
    reflections_deleted_count,
    requests_deleted_count;
END;
$function$;