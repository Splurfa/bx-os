-- Create historical_staff table for 2024-2025 staff records
CREATE TABLE public.historical_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2024-2025',
  department TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on historical_staff
ALTER TABLE public.historical_staff ENABLE ROW LEVEL SECURITY;

-- Create policies for historical_staff
CREATE POLICY "Admins can manage historical staff" 
ON public.historical_staff 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'super_admin'])
));

-- Create indexes for performance
CREATE INDEX idx_historical_staff_academic_year ON public.historical_staff(academic_year);
CREATE INDEX idx_historical_staff_email ON public.historical_staff(email);

-- Update historical_incidents table to include more fields from CSV
ALTER TABLE public.historical_incidents 
ADD COLUMN IF NOT EXISTS bsr_submission_id TEXT,
ADD COLUMN IF NOT EXISTS staff_member TEXT,
ADD COLUMN IF NOT EXISTS staff_email TEXT,
ADD COLUMN IF NOT EXISTS teacher_notes TEXT,
ADD COLUMN IF NOT EXISTS immediate_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS srf_status TEXT,
ADD COLUMN IF NOT EXISTS student_first_name TEXT,
ADD COLUMN IF NOT EXISTS student_last_name TEXT,
ADD COLUMN IF NOT EXISTS staff_first_name TEXT,
ADD COLUMN IF NOT EXISTS staff_last_name TEXT,
ADD COLUMN IF NOT EXISTS incident_time TIME,
ADD COLUMN IF NOT EXISTS reflection_question_1 TEXT,
ADD COLUMN IF NOT EXISTS reflection_question_2 TEXT,
ADD COLUMN IF NOT EXISTS reflection_question_3 TEXT,
ADD COLUMN IF NOT EXISTS reflection_question_4 TEXT;

-- Create function to generate current year test data
CREATE OR REPLACE FUNCTION public.seed_current_year_behavior_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  student_rec RECORD;
  teacher_rec RECORD;
  current_date DATE;
  incidents_created INTEGER := 0;
  behavior_types TEXT[] := ARRAY['Disruptive', 'Avoidance', 'Social/Emotional', 'Eloping', 'Inappropriate Language'];
  locations TEXT[] := ARRAY['General Studies', 'Judaic Studies', 'Unstructured', 'Lunch', 'Recess'];
  urgency_levels TEXT[] := ARRAY['standard', 'medium', 'high'];
  daily_incident_count INTEGER;
BEGIN
  -- Generate incidents from August 26, 2025 to September 11, 2025 (current date)
  current_date := '2025-08-26'::DATE;
  
  WHILE current_date <= '2025-09-11'::DATE LOOP
    -- Skip weekends
    IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
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
          'Simulated incident for ' || current_date || ' - behavior tracking data',
          locations[1 + floor(random() * array_length(locations, 1))::INTEGER],
          urgency_levels[1 + floor(random() * array_length(urgency_levels, 1))::INTEGER],
          CASE WHEN random() < 0.3 THEN 'high' ELSE 'medium' END,
          current_date + (random() * INTERVAL '8 hours') + INTERVAL '8 hours', -- School day
          'completed', -- Mark as completed for historical data
          'Auto-generated test data for 2025-2026 school year'
        );
        
        incidents_created := incidents_created + 1;
      END LOOP;
    END IF;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN incidents_created;
END;
$$;

-- Create comprehensive view for reporting
CREATE OR REPLACE VIEW public.student_profile_complete AS
SELECT 
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.grade as current_grade,
  ar.gpa,
  ar.attendance_rate,
  
  -- Current year incident/reflection counts
  COUNT(DISTINCT br.id) as current_incidents,
  COUNT(DISTINCT r.id) as current_reflections,
  
  -- Historical data from links
  shl.historical_grade,
  shl.total_historical_incidents as historical_incidents,
  shl.confidence_score as historical_match_confidence
  
FROM students s
LEFT JOIN academic_records ar ON s.id = ar.student_id AND ar.academic_year = '2025-2026'
LEFT JOIN behavior_requests br ON s.id = br.student_id
LEFT JOIN reflections r ON br.id = r.behavior_request_id
LEFT JOIN student_historical_links shl ON s.id = shl.current_student_id
WHERE s.grade IN ('6th', '7th', '8th')
GROUP BY s.id, s.first_name, s.last_name, s.grade, ar.gpa, ar.attendance_rate, 
         shl.historical_grade, shl.total_historical_incidents, shl.confidence_score;