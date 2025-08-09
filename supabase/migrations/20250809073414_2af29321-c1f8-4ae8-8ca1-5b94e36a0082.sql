-- Create admin_clear_all_queues function and grant execute
CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admin check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  -- Prevent concurrent clears
  IF NOT pg_try_advisory_lock(12348) THEN
    RAISE EXCEPTION 'Queue clear already in progress';
  END IF;

  BEGIN
    -- FK-safe hard wipe (fast)
    TRUNCATE TABLE public.reflections, public.behavior_requests RESTART IDENTITY CASCADE;
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(12348);
    RAISE;
  END;

  PERFORM pg_advisory_unlock(12348);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_clear_all_queues() TO authenticated;