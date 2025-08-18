-- Fix RLS infinite recursion by creating security definer function
-- Step 1: Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Step 2: Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Step 3: Create new policies using the security definer function
CREATE POLICY "Admins can manage profiles" 
ON public.profiles 
FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'super_admin'));

-- Note: Keep the existing "Users can view their own profile" policy as it's not recursive