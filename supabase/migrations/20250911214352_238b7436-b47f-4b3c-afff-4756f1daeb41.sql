-- Create function to generate current year test data (2025-2026)
CREATE OR REPLACE FUNCTION public.seed_current_year_behavior_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  student_rec RECORD;
  teacher_rec RECORD;
  incident_date DATE;
  incidents_created INTEGER := 0;
  behavior_types TEXT[] := ARRAY['Disruptive', 'Avoidance', 'Social/Emotional', 'Eloping', 'Inappropriate Language'];
  locations TEXT[] := ARRAY['General Studies', 'Judaic Studies', 'Unstructured', 'Lunch', 'Recess'];
  urgency_levels TEXT[] := ARRAY['standard', 'medium', 'high'];
  daily_incident_count INTEGER;
BEGIN
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
        
        -- Create behavior request
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
$$;