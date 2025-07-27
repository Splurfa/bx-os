-- Create security definer function to safely get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage kiosks" ON public.kiosks;

-- Recreate the policy using the security definer function
CREATE POLICY "Admins can manage kiosks" 
ON public.kiosks 
FOR ALL 
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');