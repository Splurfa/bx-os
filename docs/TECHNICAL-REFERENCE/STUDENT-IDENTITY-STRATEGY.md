# Student Identity Strategy for Historical Data Integration

## Overview
This document defines BX-OS's approach to student identity management across academic years, focusing on the current student roster as the authoritative source for reporting and historical data integration.

## Core Strategy

### Authoritative Data Source
**Current Student Roster**: The existing `students` table containing 151 middle school students (6th, 7th, 8th grade) serves as the single source of truth for all reporting functionality.

### Key Principles
1. **Current Roster Primacy**: Only students in the current academic year roster are searchable in reporting
2. **Automatic Grade Progression**: Historical grade calculation based on current grade minus academic years
3. **Simple Name Matching**: Historical data linked via name matching with current student records
4. **Graduated Student Exclusion**: Students who have graduated (9th grade+) are not available for current reporting

## Implementation Details

### Grade Progression Logic
```
Current Grade → Previous Year Grade
8th grade    → 7th grade (2024-2025)
7th grade    → 6th grade (2024-2025)  
6th grade    → No historical data (new to middle school)
```

### Student Matching Rules

#### Available for Reporting
- **Current 8th graders**: May have 7th grade historical data
- **Current 7th graders**: May have 6th grade historical data  
- **Current 6th graders**: No expected historical data (first year middle school)

#### Excluded from Reporting
- **Graduated students**: Former 8th graders now in 9th grade not in current roster
- **Transferred students**: Students who left the school not in current roster

### Historical Data Matching Process

#### Database Function Design
```sql
-- Simplified student matching for historical data
CREATE OR REPLACE FUNCTION match_historical_student_data(
  p_current_student_id UUID,
  p_academic_year TEXT DEFAULT '2024-2025'
) RETURNS TABLE (
  historical_incidents INTEGER,
  historical_reflections INTEGER,
  previous_grade TEXT
);
```

#### Matching Algorithm
1. **Extract current student info**: name, current grade from students table
2. **Calculate expected historical grade**: current_grade - 1 academic year
3. **Search historical CSV data**: match by name and calculated grade
4. **Return match status**: incident count, reflection count, grade confirmation

### Data Integration Architecture

#### Current Year Data (Authoritative)
- **Source**: Live `students`, `behavior_requests`, `reflections` tables
- **Coverage**: 151 middle school students, real-time incident tracking
- **Quality**: High (validated via application workflow)

#### Historical Data (Supplementary)
- **Source**: 2024-2025 CSV import (1,237 incidents)
- **Coverage**: Previous academic year incidents and reflections
- **Quality**: Medium (requires normalization and validation)
- **Linking**: Name-based matching to current roster

### Reporting Implications

#### Student Profile Search
- **Search universe**: Limited to 151 current middle school students
- **Historical context**: Previous year data displayed when available
- **No data scenarios**: Clearly indicated for new 6th graders

#### Overview Analytics
- **Trend analysis**: Current year vs. historical year comparisons
- **Grade-level insights**: 6th/7th/8th grade incident patterns
- **Cohort tracking**: Student progression from previous year to current

## Implementation Benefits

### Simplified Architecture
- **No complex identity resolution**: Current roster defines scope
- **Predictable data relationships**: Clear grade progression rules
- **Manageable scale**: 151 students vs. potentially unlimited historical records

### Data Quality
- **Authoritative source**: Current roster maintained by school administration
- **Controlled scope**: Limited to active middle school population
- **Clear boundaries**: Graduated/transferred students naturally excluded

### User Experience
- **Intuitive search**: Teachers/admins find current students easily
- **Expected results**: Historical data appears when logically available
- **Clear messaging**: No confusion about data availability

## Database Schema Impact

### Core Tables (No Changes Required)
- `students`: Current roster remains authoritative
- `behavior_requests`: Current year incidents
- `reflections`: Current year reflection data

### New Reporting Tables
```sql
-- Historical incidents imported from CSV
CREATE TABLE historical_incidents (
  id UUID PRIMARY KEY,
  student_name TEXT,
  grade_at_time TEXT,
  academic_year TEXT,
  -- ... other fields from CSV
);

-- Student matching lookup
CREATE TABLE student_historical_links (
  current_student_id UUID REFERENCES students(id),
  historical_student_name TEXT,
  academic_year TEXT,
  matched_incidents INTEGER,
  confidence_score DECIMAL
);
```

### Reporting Views
```sql
-- Unified student profile view
CREATE VIEW student_profile_complete AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.grade as current_grade,
  -- Current year data
  COUNT(DISTINCT br.id) as current_incidents,
  COUNT(DISTINCT r.id) as current_reflections,
  -- Historical data (via matching)
  COALESCE(shl.matched_incidents, 0) as historical_incidents
FROM students s
LEFT JOIN behavior_requests br ON br.student_id = s.id
LEFT JOIN reflections r ON r.student_id = s.id  
LEFT JOIN student_historical_links shl ON shl.current_student_id = s.id
WHERE s.grade IN ('6th', '7th', '8th')
GROUP BY s.id, shl.matched_incidents;
```

## Success Metrics

### Data Integration Quality
- **≥95% name matching accuracy** for current 7th/8th graders
- **≥98% historical incident import success** from CSV source
- **100% current roster coverage** in reporting interface

### User Experience Quality  
- **<2 second search response time** for student profile lookup
- **Clear indication** when historical data unavailable
- **Intuitive grade progression** display in reporting interface

### System Performance
- **Efficient queries** limited to 151 student scope
- **Minimal data duplication** via lookup table approach
- **Scalable architecture** for future academic years

---

*This strategy balances simplicity with functionality, ensuring reliable historical data integration while maintaining system performance and user experience quality.*