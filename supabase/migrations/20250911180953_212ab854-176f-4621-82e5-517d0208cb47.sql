-- Phase 1: Historical Data Schema for Reporting Feature
-- Create historical incidents table
CREATE TABLE public.historical_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  grade_at_time TEXT,
  incident_date DATE,
  behavior_type TEXT,
  subject_context TEXT,
  reflection_completed BOOLEAN DEFAULT FALSE,
  academic_year TEXT DEFAULT '2024-2025',
  data_quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student historical links table
CREATE TABLE public.student_historical_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_student_id UUID NOT NULL REFERENCES students(id),
  historical_student_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  total_historical_incidents INTEGER DEFAULT 0,
  historical_grade TEXT,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic records table for correlations
CREATE TABLE public.academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  academic_year TEXT NOT NULL DEFAULT '2024-2025',
  gpa DECIMAL(3,2),
  english_grade TEXT,
  math_grade TEXT,
  science_grade TEXT,
  social_studies_grade TEXT,
  hebrew_grade TEXT,
  attendance_rate DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create import exceptions table
CREATE TABLE public.import_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id TEXT NOT NULL,
  exception_type TEXT NOT NULL,
  student_name TEXT,
  raw_data JSONB,
  error_message TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.historical_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_historical_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_exceptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin-only access
CREATE POLICY "Admins can manage historical incidents" 
ON public.historical_incidents 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

CREATE POLICY "Admins can manage student historical links" 
ON public.student_historical_links 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

CREATE POLICY "Admins can manage academic records" 
ON public.academic_records 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

CREATE POLICY "Admins can manage import exceptions" 
ON public.import_exceptions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

-- Create indexes for performance
CREATE INDEX idx_historical_incidents_student_name ON historical_incidents(student_name);
CREATE INDEX idx_historical_incidents_date ON historical_incidents(incident_date);
CREATE INDEX idx_historical_incidents_grade ON historical_incidents(grade_at_time);
CREATE INDEX idx_student_links_current_id ON student_historical_links(current_student_id);
CREATE INDEX idx_academic_records_student_id ON academic_records(student_id);

-- Student profile analytics view
CREATE VIEW student_profile_complete AS
SELECT 
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.grade as current_grade,
  COUNT(DISTINCT br.id) as current_incidents,
  COUNT(DISTINCT r.id) as current_reflections,
  COALESCE(shl.total_historical_incidents, 0) as historical_incidents,
  shl.historical_grade,
  shl.confidence_score as historical_match_confidence,
  ar.gpa,
  ar.attendance_rate
FROM students s
LEFT JOIN behavior_requests br ON br.student_id = s.id
LEFT JOIN reflections r ON r.student_id = s.id
LEFT JOIN student_historical_links shl ON shl.current_student_id = s.id 
LEFT JOIN academic_records ar ON ar.student_id = s.id
WHERE s.grade IN ('6th', '7th', '8th')
GROUP BY s.id, s.first_name, s.last_name, s.grade, 
         shl.total_historical_incidents, shl.historical_grade, shl.confidence_score,
         ar.gpa, ar.attendance_rate;

-- Historical data import function
CREATE OR REPLACE FUNCTION import_historical_csv_data(csv_data TEXT)
RETURNS TABLE(imported_incidents INTEGER, quality_issues INTEGER) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  line_data TEXT[];
  student_name_val TEXT;
  grade_val TEXT;
  incident_date_val DATE;
  behavior_type_val TEXT;
  subject_val TEXT;
  reflection_completed_val BOOLEAN;
  quality_score DECIMAL(3,2);
  imported_count INTEGER := 0;
  quality_issue_count INTEGER := 0;
BEGIN
  -- Parse CSV data and insert into historical_incidents
  -- This is a simplified version - would need robust CSV parsing
  FOREACH line_data SLICE 1 IN ARRAY string_to_array(csv_data, E'\n')
  LOOP
    IF array_length(line_data, 1) >= 6 THEN
      student_name_val := trim(line_data[1]);
      grade_val := trim(line_data[2]);
      
      BEGIN
        incident_date_val := line_data[3]::DATE;
      EXCEPTION
        WHEN OTHERS THEN
          incident_date_val := NULL;
      END;
      
      behavior_type_val := trim(line_data[4]);
      subject_val := trim(line_data[5]);
      reflection_completed_val := CASE WHEN lower(trim(line_data[6])) = 'true' THEN true ELSE false END;
      
      -- Calculate quality score
      quality_score := (
        CASE WHEN student_name_val IS NOT NULL AND length(student_name_val) > 0 THEN 0.3 ELSE 0 END +
        CASE WHEN incident_date_val IS NOT NULL THEN 0.3 ELSE 0 END +
        CASE WHEN behavior_type_val IS NOT NULL AND length(behavior_type_val) > 0 THEN 0.4 ELSE 0 END
      );
      
      IF quality_score >= 0.6 THEN
        INSERT INTO historical_incidents (
          student_name, grade_at_time, incident_date, behavior_type, 
          subject_context, reflection_completed, data_quality_score
        ) VALUES (
          student_name_val, grade_val, incident_date_val, behavior_type_val,
          subject_val, reflection_completed_val, quality_score
        );
        imported_count := imported_count + 1;
      ELSE
        quality_issue_count := quality_issue_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT imported_count, quality_issue_count;
END;
$$;

-- Student matching function
CREATE OR REPLACE FUNCTION match_students_to_historical_data()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
  match_count INTEGER := 0;
  student_rec RECORD;
  historical_rec RECORD;
  expected_historical_grade TEXT;
BEGIN
  -- Clear existing links
  DELETE FROM student_historical_links;
  
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
$$;

-- Seed academic records for middle school students
CREATE OR REPLACE FUNCTION seed_academic_records()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  student_rec RECORD;
  seeded_count INTEGER := 0;
  base_gpa DECIMAL(3,2);
  incident_count INTEGER;
BEGIN
  FOR student_rec IN 
    SELECT id FROM students WHERE grade IN ('6th', '7th', '8th')
  LOOP
    -- Get current incident count for this student
    SELECT COUNT(*) INTO incident_count 
    FROM behavior_requests 
    WHERE student_id = student_rec.id;
    
    -- Generate GPA inversely correlated with incidents
    base_gpa := CASE 
      WHEN incident_count = 0 THEN 3.5 + (random() * 0.5)
      WHEN incident_count <= 2 THEN 3.0 + (random() * 0.5)
      WHEN incident_count <= 5 THEN 2.5 + (random() * 0.7)
      ELSE 2.0 + (random() * 0.8)
    END;
    
    INSERT INTO academic_records (
      student_id, gpa, attendance_rate,
      english_grade, math_grade, science_grade, social_studies_grade, hebrew_grade
    ) VALUES (
      student_rec.id,
      LEAST(4.0, base_gpa),
      85 + (random() * 15), -- 85-100% attendance
      CASE WHEN base_gpa >= 3.5 THEN 'A' WHEN base_gpa >= 3.0 THEN 'B' WHEN base_gpa >= 2.5 THEN 'C' ELSE 'D' END,
      CASE WHEN base_gpa >= 3.5 THEN 'A' WHEN base_gpa >= 3.0 THEN 'B' WHEN base_gpa >= 2.5 THEN 'C' ELSE 'D' END,
      CASE WHEN base_gpa >= 3.5 THEN 'A' WHEN base_gpa >= 3.0 THEN 'B' WHEN base_gpa >= 2.5 THEN 'C' ELSE 'D' END,
      CASE WHEN base_gpa >= 3.5 THEN 'A' WHEN base_gpa >= 3.0 THEN 'B' WHEN base_gpa >= 2.5 THEN 'C' ELSE 'D' END,
      CASE WHEN base_gpa >= 3.5 THEN 'A' WHEN base_gpa >= 3.0 THEN 'B' WHEN base_gpa >= 2.5 THEN 'C' ELSE 'D' END
    );
    seeded_count := seeded_count + 1;
  END LOOP;
  
  RETURN seeded_count;
END;
$$;