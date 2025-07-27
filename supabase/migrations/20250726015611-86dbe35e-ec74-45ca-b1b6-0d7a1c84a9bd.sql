-- Drop the trigger first, then the function, then recreate both correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the corrected function as VOLATILE instead of STABLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample kiosks for testing
INSERT INTO public.kiosks (name, location, is_active) VALUES
('Kiosk 1', 'Classroom A', false),
('Kiosk 2', 'Classroom B', false),
('Kiosk 3', 'Main Office', false);