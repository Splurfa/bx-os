-- Create RLS policies for anonymous kiosk access
-- This allows students to access kiosks without authentication

-- Allow anonymous users to read students for kiosk selection
CREATE POLICY "Anonymous kiosk student read access" 
ON public.students FOR SELECT 
USING (auth.role() = 'anon');

-- Allow anonymous users to read waiting behavior requests
CREATE POLICY "Anonymous kiosk behavior request read access" 
ON public.behavior_requests FOR SELECT 
USING (auth.role() = 'anon' AND status = 'waiting');

-- Allow anonymous users to create reflections
CREATE POLICY "Anonymous kiosk reflection creation" 
ON public.reflections FOR INSERT 
WITH CHECK (auth.role() = 'anon');

-- Allow anonymous users to read kiosks for status
CREATE POLICY "Anonymous kiosk read access" 
ON public.kiosks FOR SELECT 
USING (auth.role() = 'anon');

-- Allow system to update kiosks for anonymous users
CREATE POLICY "System kiosk updates for anonymous" 
ON public.kiosks FOR UPDATE 
USING (true);

-- Allow anonymous users to read families (for student context)
CREATE POLICY "Anonymous family read access" 
ON public.families FOR SELECT 
USING (auth.role() = 'anon');