-- Fix remaining function search_path security warnings

-- Update remaining functions that don't have proper search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.assign_waiting_students_to_kiosk(p_kiosk_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Get the first waiting student and assign to kiosk
  UPDATE behavior_requests 
  SET assigned_kiosk = p_kiosk_id, 
      status = 'active',
      updated_at = now()
  WHERE id = (
    SELECT id 
    FROM behavior_requests 
    WHERE status = 'waiting' 
    AND assigned_kiosk IS NULL
    ORDER BY created_at ASC 
    LIMIT 1
  );
  
  -- Update kiosk with assigned student
  UPDATE kiosks 
  SET current_behavior_request_id = (
    SELECT id 
    FROM behavior_requests 
    WHERE assigned_kiosk = p_kiosk_id 
    AND status = 'active'
    LIMIT 1
  ),
  current_student_id = (
    SELECT student_id 
    FROM behavior_requests 
    WHERE assigned_kiosk = p_kiosk_id 
    AND status = 'active'
    LIMIT 1
  ),
  updated_at = now()
  WHERE id = p_kiosk_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reassign_waiting_students()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  kiosk_rec RECORD;
  student_rec RECORD;
BEGIN
  -- Loop through active kiosks that don't have assigned students
  FOR kiosk_rec IN 
    SELECT id FROM kiosks 
    WHERE is_active = true 
    AND current_student_id IS NULL
  LOOP
    -- Get next waiting student
    SELECT id, student_id INTO student_rec
    FROM behavior_requests 
    WHERE status = 'waiting' 
    AND assigned_kiosk IS NULL
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If student found, assign to kiosk
    IF student_rec.id IS NOT NULL THEN
      UPDATE behavior_requests 
      SET assigned_kiosk = kiosk_rec.id,
          status = 'active',
          updated_at = now()
      WHERE id = student_rec.id;
      
      UPDATE kiosks 
      SET current_behavior_request_id = student_rec.id,
          current_student_id = student_rec.student_id,
          updated_at = now()
      WHERE id = kiosk_rec.id;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_clear_all_queues()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Archive all waiting and active behavior requests
  INSERT INTO behavior_history (
    behavior_request_id,
    student_id,
    reflection_id,
    resolution_type,
    resolution_notes,
    archived_at
  )
  SELECT 
    br.id,
    br.student_id,
    r.id,
    'admin_cleared',
    'Cleared by admin - bulk queue clear',
    now()
  FROM behavior_requests br
  LEFT JOIN reflections r ON r.behavior_request_id = br.id
  WHERE br.status IN ('waiting', 'active');
  
  -- Delete the behavior requests
  DELETE FROM behavior_requests WHERE status IN ('waiting', 'active');
  
  -- Clear all kiosk assignments
  UPDATE kiosks 
  SET current_student_id = NULL,
      current_behavior_request_id = NULL,
      updated_at = now()
  WHERE is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_student_kiosk_status(p_kiosk_id integer, p_student_id uuid DEFAULT NULL::uuid, p_behavior_request_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update kiosk with new student/request
  UPDATE kiosks 
  SET current_student_id = p_student_id,
      current_behavior_request_id = p_behavior_request_id,
      updated_at = now()
  WHERE id = p_kiosk_id;
  
  -- If clearing kiosk, reassign waiting students
  IF p_student_id IS NULL AND p_behavior_request_id IS NULL THEN
    PERFORM reassign_waiting_students();
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT DEFAULT 'teacher';
  user_full_name TEXT;
BEGIN
  -- Extract full name from metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NEW.email
  );
  
  -- Determine role based on email domain and specific users
  IF NEW.email = 'zsummerfield@hillelhebrew.org' THEN
    user_role := 'super_admin';
  ELSIF NEW.email LIKE '%@hillelhebrew.org' THEN
    user_role := 'admin';
  ELSIF NEW.email IN ('admin@school.edu', 'superadmin@school.edu') THEN
    user_role := 'admin';
  ELSIF NEW.email = 'teacher@school.edu' THEN
    user_role := 'teacher';
  ELSE
    -- Default role for other users
    user_role := 'teacher';
  END IF;
  
  -- Insert profile for new user
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    department,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_role,
    CASE 
      WHEN user_role = 'super_admin' THEN 'Administration'
      WHEN user_role = 'admin' THEN 'Administration'
      ELSE 'Education'
    END,
    true
  );
  
  RETURN NEW;
END;
$function$;