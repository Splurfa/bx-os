-- Fix: Restrict access to teacher emails in public.profiles
-- 1) Remove broad SELECT policy allowing all authenticated users
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;

-- 2) Ensure RLS remains enabled (safe no-op if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Allow only admins to view all profiles; users can already view their own via existing policy
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Note:
-- Existing policy "Users can view own profile" remains in place to allow users to read their own row.
-- No changes to INSERT/UPDATE/DELETE policies.