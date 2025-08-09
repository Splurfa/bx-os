-- Create or replace the admin reset function to hard reset app data
CREATE OR REPLACE FUNCTION public.admin_reset_app()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  -- Admin check
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Access denied: admin only';
  end if;

  -- Prevent concurrent resets
  if not pg_try_advisory_lock(22300) then
    raise exception 'Reset already in progress';
  end if;

  begin
    -- Wipe non-persistent data (FK-safe, fast)
    truncate table public.reflections, public.reflections_history, public.behavior_history, public.behavior_requests, public.user_sessions restart identity cascade;

    -- Deactivate all kiosks and clear runtime fields
    update public.kiosks
      set is_active = false,
          current_student_id = null,
          current_behavior_request_id = null,
          activated_at = null,
          updated_at = now();
  exception when others then
    perform pg_advisory_unlock(22300);
    raise;
  end;

  perform pg_advisory_unlock(22300);
end;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reset_app() TO authenticated;