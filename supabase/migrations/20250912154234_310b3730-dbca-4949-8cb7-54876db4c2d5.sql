-- Replace seed_current_year_behavior_data with a robust, set-based implementation
CREATE OR REPLACE FUNCTION public.seed_current_year_behavior_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_count INTEGER := 0;
  incidents_created INTEGER := 0;
  target_total INTEGER := 600; -- annual target
  academic_year_start DATE;
  today DATE := now()::date;
  days_elapsed INTEGER := 0;
  target_count INTEGER := 0;
  to_create INTEGER := 0;
  students_available INTEGER := 0;
  teachers_available INTEGER := 0;
BEGIN
  -- Academic year starts Aug 1 of the current academic year
  IF EXTRACT(MONTH FROM now()) >= 8 THEN
    academic_year_start := make_date(EXTRACT(YEAR FROM now())::int, 8, 1);
  ELSE
    academic_year_start := make_date((EXTRACT(YEAR FROM now())::int - 1), 8, 1);
  END IF;

  -- Existing incident count for this academic year (only auto-generated)
  SELECT COUNT(*) INTO existing_count
  FROM behavior_requests
  WHERE time_of_incident::date >= academic_year_start
    AND note LIKE '%Auto-generated test data%';

  -- Count of school days (weekdays) elapsed in the academic year
  SELECT COUNT(*) INTO days_elapsed
  FROM generate_series(academic_year_start, today, '1 day'::interval) AS d
  WHERE EXTRACT(DOW FROM d) BETWEEN 1 AND 5;

  -- Compute dynamic target: at least 100 so dashboards have data, up to target_total
  -- Use ~15 incidents per school day as a reasonable pacing
  target_count := GREATEST(100, LEAST(target_total, days_elapsed * 15));
  to_create := GREATEST(target_count - existing_count, 0);

  IF to_create <= 0 THEN
    RETURN existing_count;
  END IF;

  -- Ensure we have students and teachers
  SELECT COUNT(*) INTO students_available FROM students WHERE grade IN ('6th','7th','8th');
  SELECT COUNT(*) INTO teachers_available FROM profiles WHERE role = 'teacher' AND is_active = true;

  IF students_available = 0 OR teachers_available = 0 THEN
    RAISE EXCEPTION 'Cannot seed data: no students (%) or teachers (%) available', students_available, teachers_available;
  END IF;

  WITH school_days AS (
    SELECT d::date AS incident_date
    FROM generate_series(academic_year_start, today, '1 day'::interval) d
    WHERE EXTRACT(DOW FROM d) BETWEEN 1 AND 5
  )
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
    (ARRAY['Disruptive','Avoidance','Social/Emotional','Eloping','Inappropriate Language'])[1 + floor(random() * 5)::int],
    'Simulated incident for ' || d.incident_date::text || ' - behavior tracking data',
    (ARRAY['General Studies','Judaic Studies','Unstructured','Lunch','Recess'])[1 + floor(random() * 5)::int],
    (ARRAY['standard','medium','high'])[1 + floor(random() * 3)::int],
    CASE WHEN random() < 0.3 THEN 'high' ELSE 'medium' END,
    d.incident_date::timestamp
      + make_interval(hours => 8)
      + (random() * interval '8 hours'), -- random time between 8am-4pm
    'completed',
    'Auto-generated test data for current academic year'
  FROM generate_series(1, to_create) g(n)
  CROSS JOIN LATERAL (
    SELECT incident_date FROM school_days ORDER BY random() LIMIT 1
  ) d
  CROSS JOIN LATERAL (
    SELECT id FROM students WHERE grade IN ('6th','7th','8th') ORDER BY random() LIMIT 1
  ) s
  CROSS JOIN LATERAL (
    SELECT id, full_name FROM profiles WHERE role = 'teacher' AND is_active = true ORDER BY random() LIMIT 1
  ) t;

  GET DIAGNOSTICS incidents_created = ROW_COUNT;
  RETURN existing_count + incidents_created;
END;
$function$;