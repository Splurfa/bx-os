-- Create an enhanced seed function with set-based insert and top-up logic
CREATE OR REPLACE FUNCTION public.seed_current_year_behavior_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  incidents_created INTEGER := 0;
  existing_count INTEGER;
  target_count INTEGER := 600; -- Target total incidents for the year
  academic_year_start DATE;
  today DATE := now()::DATE;
  days_elapsed INTEGER;
  incidents_per_day DECIMAL;
  behavior_types TEXT[] := ARRAY['Disruptive', 'Avoidance', 'Social/Emotional', 'Eloping', 'Inappropriate Language'];
  locations TEXT[] := ARRAY['General Studies', 'Judaic Studies', 'Unstructured', 'Lunch', 'Recess'];
  urgency_levels TEXT[] := ARRAY['standard', 'medium', 'high'];
  students_available INTEGER;
  teachers_available INTEGER;
BEGIN
  -- Determine academic year start (Aug 1 of the academic year)
  IF EXTRACT(MONTH FROM now()) >= 8 THEN
    academic_year_start := make_date(EXTRACT(YEAR FROM now())::int, 8, 1);
  ELSE
    academic_year_start := make_date(EXTRACT(YEAR FROM now())::int - 1, 8, 1);
  END IF;

  -- Check current incidents count for this academic year
  SELECT COUNT(*) INTO existing_count
  FROM behavior_requests
  WHERE time_of_incident::date >= academic_year_start
    AND note LIKE '%Auto-generated test data%';

  -- Calculate how many school days have passed
  SELECT COUNT(*) INTO days_elapsed
  FROM generate_series(academic_year_start, today, '1 day'::interval) AS day
  WHERE EXTRACT(DOW FROM day) BETWEEN 1 AND 5; -- Weekdays only

  -- Calculate incidents per day based on elapsed time
  incidents_per_day := CASE 
    WHEN days_elapsed > 0 THEN LEAST(target_count::DECIMAL / GREATEST(days_elapsed, 1), 20)
    ELSE 15
  END;

  -- Calculate how many incidents we should have by now
  target_count := GREATEST((days_elapsed * incidents_per_day)::INTEGER, 100);

  -- If we already have enough incidents, return existing count
  IF existing_count >= target_count THEN
    RETURN existing_count;
  END IF;

  -- Check if we have students and teachers
  SELECT COUNT(*) INTO students_available FROM students WHERE grade IN ('6th', '7th', '8th');
  SELECT COUNT(*) INTO teachers_available FROM profiles WHERE role = 'teacher' AND is_active = true;

  IF students_available = 0 OR teachers_available = 0 THEN
    RAISE EXCEPTION 'Cannot seed data: no students (%) or teachers (%) available', students_available, teachers_available;
  END IF;

  -- Calculate how many new incidents to create
  incidents_created := target_count - existing_count;

  -- Use set-based insert for efficiency
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
  )
  SELECT 
    s.id,
    t.id,
    COALESCE(t.full_name, 'Unknown Teacher'),
    behavior_types[1 + floor(random() * array_length(behavior_types, 1))::INTEGER],
    'Simulated incident for ' || incident_date || ' - behavior tracking data',
    locations[1 + floor(random() * array_length(locations, 1))::INTEGER],
    urgency_levels[1 + floor(random() * array_length(urgency_levels, 1))::INTEGER],
    CASE WHEN random() < 0.3 THEN 'high' ELSE 'medium' END,
    incident_date + (random() * INTERVAL '8 hours') + INTERVAL '8 hours',
    'completed',
    'Auto-generated test data for current academic year'
  FROM (
    -- Generate incident dates
    SELECT generate_series(
      academic_year_start + (random() * (today - academic_year_start))::INTEGER,
      today,
      '1 day'::interval
    )::date AS incident_date
    FROM generate_series(1, incidents_created)
    WHERE EXTRACT(DOW FROM generate_series(
      academic_year_start + (random() * (today - academic_year_start))::INTEGER,
      today,
      '1 day'::interval
    )) BETWEEN 1 AND 5
    LIMIT incidents_created
  ) dates
  CROSS JOIN LATERAL (
    SELECT id FROM students WHERE grade IN ('6th', '7th', '8th') ORDER BY random() LIMIT 1
  ) s
  CROSS JOIN LATERAL (
    SELECT id, full_name FROM profiles WHERE role = 'teacher' AND is_active = true ORDER BY random() LIMIT 1
  ) t;

  GET DIAGNOSTICS incidents_created = ROW_COUNT;

  RETURN existing_count + incidents_created;
END;
$function$;