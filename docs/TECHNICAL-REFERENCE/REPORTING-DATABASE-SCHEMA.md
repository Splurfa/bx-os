# Reporting Database Schema Design

## Overview
Database schema architecture for BX-OS reporting functionality, including historical data integration, student identity management, and analytics query optimization.

## Core Tables

### `historical_incidents`
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

## Analytics Views

### `student_profile_complete`
```sql
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
  shl.confidence_score as historical_match_confidence
FROM students s
LEFT JOIN behavior_requests br ON br.student_id = s.id
LEFT JOIN reflections r ON r.student_id = s.id
LEFT JOIN student_historical_links shl ON shl.current_student_id = s.id 
WHERE s.grade IN ('6th', '7th', '8th')
GROUP BY s.id, s.first_name, s.last_name, s.grade, 
         shl.total_historical_incidents, shl.historical_grade, shl.confidence_score;
```

## Import Functions

### Historical Data Import
```sql
CREATE OR REPLACE FUNCTION import_historical_csv_data()
RETURNS TABLE(imported_incidents INTEGER, quality_issues INTEGER) 
LANGUAGE plpgsql AS $$
BEGIN
  -- Import from CSV with quality scoring
  INSERT INTO historical_incidents (student_name, grade_at_time, incident_date, behavior_type, subject_context, reflection_completed, data_quality_score)
  SELECT student_name, grade, incident_date::DATE, behavior_type, subject, reflection_completed::BOOLEAN,
         (CASE WHEN student_name IS NOT NULL THEN 0.3 ELSE 0 END + CASE WHEN incident_date IS NOT NULL THEN 0.3 ELSE 0 END + CASE WHEN behavior_type IS NOT NULL THEN 0.4 ELSE 0 END)
  FROM csv_import_staging WHERE student_name IS NOT NULL;
END;
$$;
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

### Key Indexes
```sql
CREATE INDEX idx_historical_incidents_student_grade ON historical_incidents(student_name, grade_at_time);
CREATE INDEX idx_student_links_lookup ON student_historical_links(current_student_id, academic_year);
CREATE INDEX idx_behavior_requests_student_status ON behavior_requests(student_id, status);
```

### Query Performance Targets
- Student Profile lookup: <2 seconds
- Overview analytics: <5 seconds  
- Historical data search: <3 seconds