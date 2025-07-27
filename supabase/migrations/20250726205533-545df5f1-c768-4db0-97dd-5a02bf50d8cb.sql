-- Drop existing kiosk policies that use get_current_user_role()
DROP POLICY IF EXISTS "Admins can manage kiosks" ON public.kiosks;
DROP POLICY IF EXISTS "Authenticated users can view kiosks" ON public.kiosks;

-- Create new kiosk policies using the same pattern as behavior_requests (which works)
CREATE POLICY "Teachers and admins can view kiosks" 
ON public.kiosks 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])))));

CREATE POLICY "Teachers and admins can create kiosks" 
ON public.kiosks 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])))));

CREATE POLICY "Teachers and admins can update kiosks" 
ON public.kiosks 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])))));

CREATE POLICY "Teachers and admins can delete kiosks" 
ON public.kiosks 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['teacher'::text, 'admin'::text])))));

-- Optional: Add policy for kiosk self-activation (if kiosks should work without auth)
-- Uncomment the next policy if kiosks need to self-activate without authentication
-- CREATE POLICY "Kiosks can self-activate" 
-- ON public.kiosks 
-- FOR UPDATE 
-- USING (true);