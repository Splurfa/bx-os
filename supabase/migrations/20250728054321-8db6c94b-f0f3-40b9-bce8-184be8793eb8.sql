-- STEP 1: Fix RLS Policies for Teacher Data Isolation
-- Drop existing policies
DROP POLICY IF EXISTS "Teachers and admins can view behavior requests" ON public.behavior_requests;
DROP POLICY IF EXISTS "Teachers and admins can update behavior requests" ON public.behavior_requests;
DROP POLICY IF EXISTS "Teachers and admins can delete behavior requests" ON public.behavior_requests;
DROP POLICY IF EXISTS "Teachers and admins can create behavior requests" ON public.behavior_requests;

-- Create new teacher-specific RLS policies
CREATE POLICY "Teachers can view their own behavior requests" 
ON public.behavior_requests 
FOR SELECT 
USING (
  CASE 
    WHEN public.get_current_user_role() = 'admin' THEN true
    WHEN public.get_current_user_role() = 'teacher' THEN teacher_id = auth.uid()
    ELSE false
  END
);

CREATE POLICY "Teachers can create behavior requests as themselves" 
ON public.behavior_requests 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN public.get_current_user_role() IN ('admin', 'teacher') THEN teacher_id = auth.uid()
    ELSE false
  END
);

CREATE POLICY "Teachers can update their own behavior requests" 
ON public.behavior_requests 
FOR UPDATE 
USING (
  CASE 
    WHEN public.get_current_user_role() = 'admin' THEN true
    WHEN public.get_current_user_role() = 'teacher' THEN teacher_id = auth.uid()
    ELSE false
  END
);

CREATE POLICY "Teachers can delete their own behavior requests" 
ON public.behavior_requests 
FOR DELETE 
USING (
  CASE 
    WHEN public.get_current_user_role() = 'admin' THEN true
    WHEN public.get_current_user_role() = 'teacher' THEN teacher_id = auth.uid()
    ELSE false
  END
);

-- STEP 2: Secure Archive Function with Role Checks and Queue Position
CREATE OR REPLACE FUNCTION public.archive_completed_intervention_with_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_role TEXT;
  student_record RECORD;
  teacher_record RECORD;
  reflection_record RECORD;
  kiosk_record RECORD;
  queue_start_time TIMESTAMP WITH TIME ZONE;
  queue_minutes INTEGER;
  position_in_queue INTEGER;
  all_reflection_history JSONB;
BEGIN
  -- SECURITY CHECK: Validate access rights
  SELECT public.get_current_user_role() INTO current_user_role;
  
  -- Teachers can only archive their own requests, admins can archive any
  IF current_user_role = 'teacher' AND OLD.teacher_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Teachers can only archive their own behavior requests';
  END IF;
  
  IF current_user_role NOT IN ('teacher', 'admin') THEN
    RAISE EXCEPTION 'Access denied: Only teachers and admins can archive behavior requests';
  END IF;

  -- Calculate queue position (teacher-specific for teachers, school-wide for admins)
  SELECT COUNT(*) + 1 INTO position_in_queue
  FROM public.behavior_requests br
  WHERE br.created_at < OLD.created_at
    AND DATE(br.created_at) = DATE(OLD.created_at)
    AND CASE 
      WHEN current_user_role = 'teacher' THEN br.teacher_id = OLD.teacher_id
      ELSE true -- Admins see school-wide position
    END;

  -- Get student information
  SELECT * INTO student_record 
  FROM public.students 
  WHERE id = OLD.student_id;
  
  -- Get teacher information  
  SELECT * INTO teacher_record
  FROM public.profiles
  WHERE id = OLD.teacher_id;
  
  -- Get reflection information
  SELECT * INTO reflection_record
  FROM public.reflections
  WHERE behavior_request_id = OLD.id;
  
  -- Get kiosk information if assigned (handle null case)
  kiosk_record := NULL;
  IF OLD.assigned_kiosk_id IS NOT NULL THEN
    SELECT * INTO kiosk_record
    FROM public.kiosks
    WHERE id = OLD.assigned_kiosk_id;
  END IF;
  
  -- Calculate queue metrics
  queue_start_time := COALESCE(
    (SELECT MIN(updated_at) FROM public.reflections WHERE behavior_request_id = OLD.id),
    OLD.created_at
  );
  
  queue_minutes := EXTRACT(EPOCH FROM (COALESCE(queue_start_time, NOW()) - OLD.created_at))/60;
  
  -- Get all reflection history including current reflection (handle case where no reflection exists)
  all_reflection_history := '[]'::jsonb; -- Default to empty array
  
  IF reflection_record IS NOT NULL OR EXISTS(SELECT 1 FROM public.reflections_history WHERE behavior_request_id = OLD.id) THEN
    WITH all_reflections AS (
      -- Historical versions
      SELECT 
        rh.question1, rh.question2, rh.question3, rh.question4,
        rh.status, rh.teacher_feedback, rh.attempt_number,
        rh.original_created_at as created_at,
        rh.original_updated_at as updated_at,
        'historical' as version_type
      FROM public.reflections_history rh
      WHERE rh.behavior_request_id = OLD.id
      
      UNION ALL
      
      -- Current final version (only if exists)
      SELECT 
        r.question1, r.question2, r.question3, r.question4,
        r.status, r.teacher_feedback,
        COALESCE((SELECT MAX(attempt_number) FROM public.reflections_history WHERE behavior_request_id = OLD.id), 0) + 1 as attempt_number,
        r.created_at, r.updated_at,
        'final' as version_type
      FROM public.reflections r
      WHERE r.behavior_request_id = OLD.id
    )
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'attempt_number', attempt_number,
        'question1', question1,
        'question2', question2, 
        'question3', question3,
        'question4', question4,
        'status', status,
        'teacher_feedback', teacher_feedback,
        'created_at', created_at,
        'updated_at', updated_at,
        'version_type', version_type
      ) ORDER BY attempt_number
    ), '[]'::jsonb) INTO all_reflection_history
    FROM all_reflections;
  END IF;
  
  -- Insert into behavior_history with complete reflection history
  INSERT INTO public.behavior_history (
    original_request_id,
    student_id,
    teacher_id,
    student_name,
    student_grade,
    student_class_name,
    teacher_name,
    teacher_email,
    mood,
    behaviors,
    notes,
    urgent,
    device_type,
    device_location,
    assigned_kiosk_id,
    kiosk_name,
    kiosk_location,
    reflection_id,
    question1,
    question2,
    question3,
    question4,
    teacher_feedback,
    intervention_outcome,
    queue_created_at,
    queue_started_at,
    time_in_queue_minutes,
    queue_position,
    reflection_history
  ) VALUES (
    OLD.id,
    OLD.student_id,
    OLD.teacher_id,
    student_record.name,
    student_record.grade,
    student_record.class_name,
    teacher_record.full_name,
    teacher_record.email,
    OLD.mood,
    OLD.behaviors,
    OLD.notes,
    OLD.urgent,
    'web',
    NULL,
    OLD.assigned_kiosk_id,
    CASE WHEN kiosk_record IS NOT NULL THEN kiosk_record.name ELSE NULL END,
    CASE WHEN kiosk_record IS NOT NULL THEN kiosk_record.location ELSE NULL END,
    CASE WHEN reflection_record IS NOT NULL THEN reflection_record.id ELSE NULL END,
    CASE WHEN reflection_record IS NOT NULL THEN reflection_record.question1 ELSE NULL END,
    CASE WHEN reflection_record IS NOT NULL THEN reflection_record.question2 ELSE NULL END,
    CASE WHEN reflection_record IS NOT NULL THEN reflection_record.question3 ELSE NULL END,
    CASE WHEN reflection_record IS NOT NULL THEN reflection_record.question4 ELSE NULL END,
    CASE WHEN reflection_record IS NOT NULL THEN reflection_record.teacher_feedback ELSE NULL END,
    'approved',
    OLD.created_at,
    queue_start_time,
    queue_minutes,
    position_in_queue,
    all_reflection_history
  );
  
  -- Security logging
  RAISE NOTICE 'Behavior request % archived by user % (role: %)', OLD.id, auth.uid(), current_user_role;
  
  RETURN OLD;
END;
$function$;