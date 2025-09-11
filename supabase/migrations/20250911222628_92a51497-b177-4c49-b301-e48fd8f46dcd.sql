-- Update seed_current_year_behavior_data to be date-driven and idempotent per academic year
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
  academic_year_start DATE;
  today DATE := now()::DATE;
BEGIN
  -- Determine academic year start (Aug 1 of the academic year)
  IF EXTRACT(MONTH FROM now()) >= 8 THEN
    academic_year_start := make_date(EXTRACT(YEAR FROM now())::int, 8, 1);
  ELSE
    academic_year_start := make_date(EXTRACT(YEAR FROM now())::int - 1, 8, 1);
  END IF;

  -- Idempotency: if test data already exists for this academic year, return count
  SELECT COUNT(*) INTO existing_count
  FROM behavior_requests
  WHERE time_of_incident::date >= academic_year_start
    AND note LIKE '%Auto-generated test data%';

  IF existing_count > 0 THEN
    RETURN existing_count;
  END IF;

  incident_date := academic_year_start;

  WHILE incident_date <= today LOOP
    -- Weekdays only (Mon-Fri)
    IF EXTRACT(DOW FROM incident_date) BETWEEN 1 AND 5 THEN
      daily_incident_count := 10 + floor(random() * 11)::INTEGER; -- 10-20 per day
      FOR i IN 1..daily_incident_count LOOP
        -- Random middle school student
        SELECT s.id INTO student_rec
        FROM students s
        WHERE s.grade IN ('6th', '7th', '8th')
        ORDER BY random()
        LIMIT 1;

        -- Random teacher
        SELECT p.id, p.full_name INTO teacher_rec
        FROM profiles p
        WHERE p.role = 'teacher' AND p.is_active = true
        ORDER BY random()
        LIMIT 1;

        -- Create a completed incident for historical analytics
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
          incident_date + (random() * INTERVAL '8 hours') + INTERVAL '8 hours', -- During school day
          'completed', -- Completed to avoid affecting live queues
          'Auto-generated test data for current academic year'
        );

        incidents_created := incidents_created + 1;
      END LOOP;
    END IF;

    incident_date := incident_date + INTERVAL '1 day';
  END LOOP;

  RETURN incidents_created;
END;
$function$;