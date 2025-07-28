-- Create function to archive reflection before revision
CREATE OR REPLACE FUNCTION public.archive_reflection_before_revision()
RETURNS TRIGGER AS $$
DECLARE
  attempt_num integer;
BEGIN
  -- Only archive if status is changing to revision_requested
  IF OLD.status != 'revision_requested' AND NEW.status = 'revision_requested' THEN
    -- Get the next attempt number for this behavior request
    SELECT COALESCE(MAX(attempt_number), 0) + 1
    INTO attempt_num
    FROM public.reflections_history
    WHERE behavior_request_id = OLD.behavior_request_id;
    
    -- Archive the current reflection before it gets revised
    INSERT INTO public.reflections_history (
      original_reflection_id,
      behavior_request_id,
      question1,
      question2,
      question3,
      question4,
      status,
      teacher_feedback,
      attempt_number,
      original_created_at,
      original_updated_at,
      archived_by,
      revision_reason
    ) VALUES (
      OLD.id,
      OLD.behavior_request_id,
      OLD.question1,
      OLD.question2,
      OLD.question3,
      OLD.question4,
      OLD.status,
      OLD.teacher_feedback,
      attempt_num,
      OLD.created_at,
      OLD.updated_at,
      auth.uid(),
      COALESCE(NEW.teacher_feedback, 'Revision requested')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to archive reflections before revision
CREATE TRIGGER archive_reflection_on_revision
  BEFORE UPDATE ON public.reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.archive_reflection_before_revision();

-- Update the archive_completed_intervention function to include reflection history
CREATE OR REPLACE FUNCTION public.archive_completed_intervention_with_history()
RETURNS TRIGGER AS $$
DECLARE
  student_record RECORD;
  teacher_record RECORD;
  reflection_record RECORD;
  kiosk_record RECORD;
  queue_start_time TIMESTAMP WITH TIME ZONE;
  queue_minutes INTEGER;
  position_in_queue INTEGER;
  all_reflection_history JSONB;
BEGIN
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
  
  -- Get kiosk information if assigned
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
  
  -- Get all reflection history including current reflection
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
    
    -- Current final version
    SELECT 
      r.question1, r.question2, r.question3, r.question4,
      r.status, r.teacher_feedback,
      COALESCE((SELECT MAX(attempt_number) FROM public.reflections_history WHERE behavior_request_id = OLD.id), 0) + 1 as attempt_number,
      r.created_at, r.updated_at,
      'final' as version_type
    FROM public.reflections r
    WHERE r.behavior_request_id = OLD.id
  )
  SELECT jsonb_agg(
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
  ) INTO all_reflection_history
  FROM all_reflections;
  
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
    reflection_history -- NEW: Store complete reflection history
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
    'web', -- Default device type
    NULL, -- Device location
    OLD.assigned_kiosk_id,
    kiosk_record.name,
    kiosk_record.location,
    reflection_record.id,
    reflection_record.question1,
    reflection_record.question2,
    reflection_record.question3,
    reflection_record.question4,
    reflection_record.teacher_feedback,
    'approved',
    OLD.created_at,
    queue_start_time,
    queue_minutes,
    position_in_queue,
    all_reflection_history -- Complete history of all reflection attempts
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add reflection_history column to behavior_history table
ALTER TABLE public.behavior_history 
ADD COLUMN reflection_history JSONB;