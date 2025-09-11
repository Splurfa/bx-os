-- Fix attendance_rate column type in academic_records
ALTER TABLE academic_records 
ALTER COLUMN attendance_rate TYPE DECIMAL(5,2);

-- Add unique constraint to historical_staff email to prevent duplicates
ALTER TABLE historical_staff 
ADD CONSTRAINT unique_historical_staff_email_year UNIQUE (email, academic_year);

-- Update seed_current_year_behavior_data to use proper urgency levels and be idempotent
CREATE OR REPLACE FUNCTION public.seed_current_year_behavior_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  student_rec RECORD;
  teacher_rec RECORD;
  incident_date DATE;
  incidents_created INTEGER := 0;
  behavior_types TEXT[] := ARRAY['Disruptive', 'Avoidance', 'Social/Emotional', 'Eloping', 'Inappropriate Language'];
  locations TEXT[] := ARRAY['General Studies', 'Judaic Studies', 'Unstructured', 'Lunch', 'Recess'];
  urgency_levels TEXT[] := ARRAY['standard', 'medium', 'high'];
  daily_incident_count INTEGER;
  existing_count INTEGER;
BEGIN
  -- Check if data already exists to make function idempotent
  SELECT COUNT(*) INTO existing_count 
  FROM behavior_requests 
  WHERE created_at >= '2025-08-26'::DATE 
    AND created_at <= '2025-09-11'::DATE
    AND note LIKE '%Auto-generated test data%';
  
  IF existing_count > 0 THEN
    RETURN existing_count;
  END IF;

  -- Generate incidents from August 26, 2025 to September 11, 2025 (current date)
  incident_date := '2025-08-26'::DATE;
  
  WHILE incident_date <= '2025-09-11'::DATE LOOP
    -- Skip weekends (DOW: 0=Sunday, 6=Saturday)
    IF EXTRACT(DOW FROM incident_date) BETWEEN 1 AND 5 THEN
      -- Generate 10-20 incidents per day
      daily_incident_count := 10 + floor(random() * 11)::INTEGER;
      
      FOR i IN 1..daily_incident_count LOOP
        -- Get random student from current roster
        SELECT s.id, s.first_name, s.last_name INTO student_rec
        FROM students s 
        WHERE s.grade IN ('6th', '7th', '8th')
        ORDER BY random() 
        LIMIT 1;
        
        -- Get random teacher
        SELECT p.id, p.full_name INTO teacher_rec
        FROM profiles p
        WHERE p.role = 'teacher' AND p.is_active = true
        ORDER BY random()
        LIMIT 1;
        
        -- Create behavior request with proper urgency level
        INSERT INTO behavior_requests (
          student_id,
          teacher_id,
          teacher_name,
          behavior_type,
          description,
          location,
          urgency_level,
          priority_level,
          time_of_incident,
          status,
          note
        ) VALUES (
          student_rec.id,
          teacher_rec.id,
          COALESCE(teacher_rec.full_name, 'Unknown Teacher'),
          behavior_types[1 + floor(random() * array_length(behavior_types, 1))::INTEGER],
          'Simulated incident for ' || incident_date || ' - behavior tracking data',
          locations[1 + floor(random() * array_length(locations, 1))::INTEGER],
          urgency_levels[1 + floor(random() * array_length(urgency_levels, 1))::INTEGER],
          CASE WHEN random() < 0.3 THEN 'high' ELSE 'medium' END,
          incident_date + (random() * INTERVAL '8 hours') + INTERVAL '8 hours', -- School day
          'completed', -- Mark as completed for historical data
          'Auto-generated test data for 2025-2026 school year'
        );
        
        incidents_created := incidents_created + 1;
      END LOOP;
    END IF;
    
    incident_date := incident_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN incidents_created;
END;
$function$;

-- Update match_students_to_historical_data to avoid DELETE without WHERE
CREATE OR REPLACE FUNCTION public.match_students_to_historical_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE 
  match_count INTEGER := 0;
  student_rec RECORD;
  historical_rec RECORD;
  expected_historical_grade TEXT;
BEGIN
  -- Clear existing links (fix DELETE without WHERE clause)
  DELETE FROM student_historical_links WHERE id IS NOT NULL OR id IS NULL;
  
  -- Match current students to historical data
  FOR student_rec IN 
    SELECT id, first_name, last_name, grade 
    FROM students 
    WHERE grade IN ('7th', '8th')
  LOOP
    -- Determine expected historical grade
    expected_historical_grade := CASE 
      WHEN student_rec.grade = '7th' THEN '6th'
      WHEN student_rec.grade = '8th' THEN '7th'
      ELSE NULL
    END;
    
    -- Find matching historical incidents
    FOR historical_rec IN
      SELECT student_name, grade_at_time, COUNT(*) as incident_count
      FROM historical_incidents hi
      WHERE LOWER(TRIM(hi.student_name)) = LOWER(TRIM(student_rec.first_name || ' ' || student_rec.last_name))
        AND hi.grade_at_time = expected_historical_grade
      GROUP BY student_name, grade_at_time
    LOOP
      INSERT INTO student_historical_links (
        current_student_id, historical_student_name, academic_year,
        total_historical_incidents, historical_grade, confidence_score
      ) VALUES (
        student_rec.id, historical_rec.student_name, '2024-2025',
        historical_rec.incident_count, historical_rec.grade_at_time, 1.0
      );
      match_count := match_count + 1;
    END LOOP;
  END LOOP;
  
  RETURN match_count;
END;
$function$;