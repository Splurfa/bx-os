# Reporting Database Schema Design (Enhanced)

*Last Updated: January 11, 2025*

## Overview
Enhanced database schema architecture for BX-OS reporting functionality with historical data support tables, segmented data management, and automatic bootstrapping capabilities.

## Phase 1: Historical Data Support Tables

### A. Historical Staff Support
```sql
-- Historical teachers from previous years
CREATE TABLE historical_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'teacher',
  academic_year TEXT NOT NULL,
  department TEXT,
  grades_taught TEXT[], -- Array of grades like ['6th', '7th']
  employment_status TEXT DEFAULT 'active', -- active, terminated, transferred
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Map historical incidents to historical staff
CREATE TABLE historical_teacher_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  historical_staff_id UUID REFERENCES historical_staff(id),
  historical_incident_id UUID REFERENCES historical_incidents(id),
  teacher_name_raw TEXT, -- Original name from CSV
  confidence_score DECIMAL(3,2) DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### B. Historical Student Support  
```sql
-- Historical student rosters by year
CREATE TABLE historical_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  grade_at_time TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  class_section TEXT,
  homeroom_teacher TEXT,
  student_id_external TEXT, -- External ID if available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### C. Academic Year Configuration
```sql
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label TEXT UNIQUE NOT NULL, -- e.g., '2023-2024'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one current year
CREATE UNIQUE INDEX idx_current_academic_year ON academic_years (is_current) WHERE is_current = TRUE;
```

### D. System Configuration
```sql
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default academic year config
INSERT INTO system_config VALUES 
('current_academic_year', '"2024-2025"', 'Current academic year for reporting'),
('academic_year_start', '"2024-08-15"', 'Start of current academic year'),
('test_data_seeded', 'false', 'Whether test data has been seeded'),
('daily_incident_target', '[10, 20]', 'Target range for daily incidents in test data');
```

## Phase 2: Enhanced Core Tables

### Enhanced `historical_incidents`
```sql
CREATE TABLE historical_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  grade_at_time TEXT,
  incident_date DATE,
  behavior_type TEXT,
  subject_context TEXT,
  reflection_completed BOOLEAN DEFAULT FALSE,
  academic_year TEXT DEFAULT '2024-2025',
  data_quality_score DECIMAL(3,2),
  historical_student_id UUID REFERENCES historical_students(id),
  historical_staff_id UUID REFERENCES historical_staff(id),
  original_teacher_name TEXT, -- Preserve original for audit
  import_batch_id TEXT, -- Track import batches
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `student_historical_links`
```sql
CREATE TABLE student_historical_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_student_id UUID NOT NULL REFERENCES students(id),
  historical_student_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  total_historical_incidents INTEGER DEFAULT 0,
  historical_grade TEXT,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Phase 3: Performance Optimization Views

### Enhanced `student_comprehensive_profile`
```sql
-- Student comprehensive profile view
CREATE VIEW student_comprehensive_profile AS
SELECT 
  s.id as student_id,
  s.first_name, s.last_name, s.grade as current_grade,
  -- Current year data
  COUNT(DISTINCT br.id) FILTER (WHERE br.created_at >= (SELECT start_date FROM academic_years WHERE is_current)) as current_incidents,
  COUNT(DISTINCT r.id) as current_reflections,
  -- Historical data  
  hs.grade_at_time as previous_grade,
  COUNT(DISTINCT hi.id) as historical_incidents,
  -- Academic correlation
  ar.gpa, ar.attendance_rate,
  -- Trend analysis
  date_trunc('month', br.created_at) as incident_month
FROM students s
LEFT JOIN behavior_requests br ON br.student_id = s.id
LEFT JOIN reflections r ON r.student_id = s.id  
LEFT JOIN student_historical_links shl ON shl.current_student_id = s.id
LEFT JOIN historical_students hs ON hs.id = shl.historical_student_id
LEFT JOIN historical_incidents hi ON hi.historical_student_id = hs.id
LEFT JOIN academic_records ar ON ar.student_id = s.id
WHERE s.grade IN ('6th', '7th', '8th')
GROUP BY s.id, s.first_name, s.last_name, s.grade, hs.grade_at_time, ar.gpa, ar.attendance_rate, incident_month;
```

### Materialized View for Overview Metrics
```sql
-- Materialized view for overview metrics
CREATE MATERIALIZED VIEW mv_overview_metrics AS
SELECT 
  academic_year,
  grade_level,
  behavior_type,
  date_trunc('month', incident_date) as month,
  COUNT(*) as incident_count,
  COUNT(DISTINCT student_id) as unique_students,
  AVG(CASE WHEN reflection_completed THEN 1 ELSE 0 END) as reflection_rate
FROM (
  -- Union current and historical data
  SELECT br.created_at::date as incident_date, s.grade as grade_level, 
         br.behavior_type, br.student_id, 
         CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as reflection_completed,
         ay.year_label as academic_year
  FROM behavior_requests br
  JOIN students s ON s.id = br.student_id  
  JOIN academic_years ay ON br.created_at BETWEEN ay.start_date AND ay.end_date
  LEFT JOIN reflections r ON r.behavior_request_id = br.id
  
  UNION ALL
  
  SELECT hi.incident_date, hs.grade_at_time as grade_level,
         hi.behavior_type, hs.id as student_id,
         hi.reflection_completed,
         hi.academic_year
  FROM historical_incidents hi
  JOIN historical_students hs ON hs.id = hi.historical_student_id
) combined_data
GROUP BY academic_year, grade_level, behavior_type, month;

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_overview_metrics() RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_overview_metrics;
END;
$$ LANGUAGE plpgsql;
```

## Phase 4: Enhanced Import Functions

### Segmented Import Functions
```sql
-- Import historical staff rosters
CREATE OR REPLACE FUNCTION import_historical_staff_roster(
  p_academic_year TEXT,
  p_staff_data JSONB
) RETURNS INT;

-- Import historical student rosters  
CREATE OR REPLACE FUNCTION import_historical_student_roster(
  p_academic_year TEXT,
  p_student_data JSONB
) RETURNS INT;

-- Enhanced incident import with proper relationships
CREATE OR REPLACE FUNCTION import_historical_incidents_enhanced(
  p_academic_year TEXT,
  p_incidents_data JSONB,
  p_batch_id TEXT DEFAULT gen_random_uuid()::TEXT
) RETURNS TABLE(imported_count INT, teacher_matches INT, student_matches INT);

-- Generate 10-20 incidents per school day for entire academic year
CREATE OR REPLACE FUNCTION seed_realistic_behavior_data(
  p_start_date DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_daily_incident_range INT[] DEFAULT ARRAY[10,20]
) RETURNS TABLE(
  total_incidents_created INT,
  school_days_covered INT,
  teachers_involved INT,
  students_involved INT
);
```

### Student Matching
```sql
CREATE OR REPLACE FUNCTION match_students_to_historical_data()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE match_count INTEGER := 0;
BEGIN
  INSERT INTO student_historical_links (current_student_id, historical_student_name, academic_year, total_historical_incidents, historical_grade)
  SELECT s.id, hi.student_name, '2024-2025', COUNT(hi.id), hi.grade_at_time
  FROM students s
  INNER JOIN historical_incidents hi ON LOWER(TRIM(s.first_name || ' ' || s.last_name)) = LOWER(TRIM(hi.student_name))
  WHERE s.grade IN ('7th', '8th') AND hi.grade_at_time = CASE WHEN s.grade = '7th' THEN '6th' WHEN s.grade = '8th' THEN '7th' END
  GROUP BY s.id, hi.student_name, hi.grade_at_time;
  
  GET DIAGNOSTICS match_count = ROW_COUNT;
  RETURN match_count;
END;
$$;
```

## Performance Optimization

### Enhanced Performance Indexes
```sql
-- Historical data performance
CREATE INDEX idx_historical_incidents_student_grade ON historical_incidents(student_name, grade_at_time);
CREATE INDEX idx_historical_students_lookup ON historical_students(full_name, academic_year);
CREATE INDEX idx_historical_staff_lookup ON historical_staff(full_name, academic_year);

-- Current data performance  
CREATE INDEX idx_student_links_lookup ON student_historical_links(current_student_id, academic_year);
CREATE INDEX idx_behavior_requests_student_status ON behavior_requests(student_id, status);
CREATE INDEX idx_behavior_requests_created_at ON behavior_requests(created_at);

-- Academic year performance
CREATE INDEX idx_academic_years_current ON academic_years(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_academic_years_date_range ON academic_years(start_date, end_date);

-- Materialized view performance
CREATE INDEX idx_mv_overview_metrics_filters ON mv_overview_metrics(academic_year, grade_level, behavior_type);
```

### Enhanced Query Performance Targets
- **Overview Dashboard Load**: <300ms (with materialized view)
- **Student Profile Lookup**: <1 second (cold start)
- **Historical Data Search**: <2 seconds
- **Filter Response Time**: <500ms
- **Bootstrap Data Generation**: <30 seconds for full academic year

### Automatic Bootstrap Functions
```sql
-- Ensure test data bootstrap on first admin access
CREATE OR REPLACE FUNCTION ensure_test_bootstrap()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  seeded BOOLEAN;
BEGIN
  -- Check if already seeded
  SELECT (value::TEXT = 'true') INTO seeded 
  FROM system_config WHERE key = 'test_data_seeded';
  
  IF NOT seeded THEN
    -- Run bootstrap process
    PERFORM seed_realistic_behavior_data(
      (SELECT value::TEXT::DATE FROM system_config WHERE key = 'academic_year_start'),
      CURRENT_DATE
    );
    
    -- Mark as seeded
    UPDATE system_config SET value = 'true' WHERE key = 'test_data_seeded';
    
    result = '{"bootstrapped": true, "message": "Test data generated successfully"}';
  ELSE
    result = '{"bootstrapped": false, "message": "Test data already exists"}';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Test data validation summary
CREATE OR REPLACE FUNCTION test_seed_summary()
RETURNS TABLE(
  metric TEXT,
  value TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'Total Incidents'::TEXT, COUNT(*)::TEXT, 
         CASE WHEN COUNT(*) >= 1000 THEN 'PASS' ELSE 'FAIL' END
  FROM behavior_requests
  WHERE created_at >= (SELECT value::TEXT::DATE FROM system_config WHERE key = 'academic_year_start')
  
  UNION ALL
  
  SELECT 'Daily Average'::TEXT, 
         ROUND(COUNT(*)::DECIMAL / GREATEST(1, EXTRACT(DAYS FROM (CURRENT_DATE - (SELECT value::TEXT::DATE FROM system_config WHERE key = 'academic_year_start')))), 1)::TEXT,
         CASE WHEN COUNT(*) / GREATEST(1, EXTRACT(DAYS FROM (CURRENT_DATE - (SELECT value::TEXT::DATE FROM system_config WHERE key = 'academic_year_start')))) >= 10 THEN 'PASS' ELSE 'FAIL' END
  FROM behavior_requests
  WHERE created_at >= (SELECT value::TEXT::DATE FROM system_config WHERE key = 'academic_year_start');
END;
$$ LANGUAGE plpgsql;
```