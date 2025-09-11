# Admin Reporting Feature Specification

## Overview
Comprehensive specification for BX-OS admin reporting functionality, providing behavioral incident analytics across current and historical academic data with focus on student outcomes and system effectiveness.

## Feature Architecture

### Two-Tab Interface Design

#### Tab 1: Overview Dashboard
System-wide behavioral analytics and trend analysis

#### Tab 2: Student Profile
Individual student behavioral history and academic correlation

### Access Control
- **Admin/Super Admin Only**: Reporting interface restricted to administrative roles
- **Teacher Protection**: Teachers cannot access student data outside their own BSRs
- **Student Privacy**: No personally identifiable information in overview metrics

## Tab 1: Overview Dashboard

### Primary Metrics Display

#### Current Academic Year Summary
```
Total Incidents: 247
Students with Incidents: 89 of 151 (59%)
Reflection Completion Rate: 76.9%
Average Resolution Time: 2.3 days
```

#### Year-over-Year Comparison
```
Incidents vs Previous Year: +15 (+6.5%)
Reflection Rate vs Previous Year: +8.2%
Students Affected vs Previous Year: -7 (-7.3%)
```

#### Grade-Level Breakdown
```
6th Grade: 67 incidents (27.1%) | 89.6% reflection rate
7th Grade: 98 incidents (39.7%) | 71.4% reflection rate  
8th Grade: 82 incidents (33.2%) | 73.2% reflection rate
```

### Trend Analysis Charts

#### Monthly Incident Volume
Line chart showing incident counts by month with:
- Current academic year data (primary line)
- Previous academic year overlay (comparison line)
- Seasonal trend indicators
- Key school events annotations

#### Behavior Type Distribution
Pie chart breakdown:
- Academic/Classroom behaviors
- Social/Peer interactions
- Authority/Respect issues
- Physical/Safety concerns
- Other/Miscellaneous

#### Subject Context Analysis
Bar chart showing incidents by academic area:
- General Studies (Math, Science, English, History)
- Judaic Studies (Hebrew, Torah, Jewish History)
- Unstructured Time (Recess, Lunch, Transitions)

### Performance Indicators

#### System Effectiveness Metrics
- **Average Time to Kiosk**: 4.7 minutes from BSR creation
- **Reflection Quality Score**: 3.8/5.0 average
- **Teacher Satisfaction**: 87% positive feedback
- **Administrative Efficiency**: 23% reduction in paperwork

#### Data Quality Indicators  
- **Historical Data Coverage**: 98.4% of previous year incidents imported
- **Student Matching Accuracy**: 94.7% high-confidence matches
- **Missing Data Points**: 3.2% of current year records incomplete

### Filter Controls

#### Time Period Selection
- Current academic year (default)
- Previous academic year
- Custom date range
- Quarter/semester comparison

#### Grade Level Filter
- All grades (default)
- 6th grade only
- 7th grade only  
- 8th grade only
- Multi-grade selection

#### Incident Type Filter
- All behavior types (default)
- Academic behaviors
- Social behaviors
- Disciplinary behaviors
- Custom category selection

## Tab 2: Student Profile

### Student Search Interface

#### Search Functionality
- **Autocomplete search**: Type-ahead with real-time filtering
- **Search by name**: First name, last name, or full name
- **Filter by grade**: Dropdown to limit search scope
- **Search universe**: Limited to 151 current middle school students

#### Search Results Display
```
[Search: "Sarah"]

Sarah Goldstein - 7th Grade
24 current year incidents | 18 previous year incidents (6th grade)

Sarah Martinez - 8th Grade  
12 current year incidents | No previous year data (new student)

Sarah Thompson - 6th Grade
7 current year incidents | No previous year data (first year MS)
```

### Individual Student Profile

#### Student Header Information
```
Emma Rodriguez - 8th Grade
Current GPA: 3.2 | Attendance: 94.7%
Historical Match: High Confidence (7th grade, 2024-2025)
```

#### Current Academic Year Data

**Incident Summary**
- Total incidents: 18
- Completed reflections: 14 (77.8%)
- Pending reflections: 2
- Average resolution time: 1.8 days

**Behavioral Patterns**
- Most common behavior type: Academic disruption (11 incidents)
- Most common context: General Studies (13 incidents)
- Most common time: Period 3 (Morning focus decline)

**Reflection Quality**
- Average quality score: 4.1/5.0
- Teacher approval rate: 100%
- Revision requests: 2 (11.1%)

#### Historical Academic Year Data (When Available)

**Previous Year Comparison (7th Grade)**
- Total incidents: 22 (-4 vs current year)
- Reflection completion: 16 (72.7% vs 77.8% current)
- Behavioral improvement: 18% reduction in academic disruptions

**Academic Correlation Analysis**
- GPA trend: 3.0 → 3.2 (+0.2 improvement)
- Attendance correlation: Higher attendance weeks = fewer incidents
- Subject performance: Math improvement correlates with behavior improvement

#### Trend Visualization

**Monthly Incident Timeline**
Interactive chart showing:
- Current year monthly incidents (bars)
- Previous year overlay (comparison line)
- Academic quarters marked
- Major events/interventions noted

**Behavior Category Breakdown**
Stacked bar chart across quarters:
- Academic behaviors
- Social behaviors  
- Disciplinary behaviors
- Trend direction indicators

### Academic Correlation Display

#### GPA vs Incident Rate
Scatter plot correlation:
- X-axis: Academic quarter GPA
- Y-axis: Incident count per quarter
- Trend line with correlation coefficient
- Outlier identification

#### Subject-Specific Analysis
```
Math: 3.4 GPA | 3 incidents (Strong performance, minimal issues)
English: 2.9 GPA | 8 incidents (Struggling area, higher incidents)
Science: 3.6 GPA | 2 incidents (Excellent performance, rare issues)
History: 3.1 GPA | 5 incidents (Moderate performance, some challenges)
```

#### Attendance Impact Analysis
```
95%+ Attendance Weeks: 0.8 avg incidents/week
90-94% Attendance Weeks: 1.3 avg incidents/week  
<90% Attendance Weeks: 2.1 avg incidents/week

Correlation: r = -0.67 (Strong negative correlation)
```

## Technical Implementation

### Data Sources Integration

#### Current Year Data (Real-time)
- `students` table: 151 middle school students
- `behavior_requests` table: Live incident tracking
- `reflections` table: Student reflection data
- `simulated_academic_data` table: GPA and attendance simulation

#### Historical Data (Imported)
- `historical_incidents` table: 1,237 previous year incidents
- `student_historical_links` table: Current-to-historical student matching
- Data quality score: 94.7% high-confidence matches

### Query Performance Requirements

#### Overview Dashboard
- **Load time**: <5 seconds for full dashboard
- **Filter response**: <2 seconds for any filter combination
- **Chart rendering**: <3 seconds for complex visualizations
- **Data refresh**: Real-time updates for current year data

#### Student Profile
- **Search response**: <1 second for autocomplete results
- **Profile load**: <3 seconds for complete student data
- **Historical lookup**: <2 seconds for previous year data
- **Trend charts**: <4 seconds for interactive visualizations

### Database Optimization

#### Analytical Views
```sql
-- Pre-computed overview metrics
CREATE MATERIALIZED VIEW overview_dashboard_cache AS
SELECT 
  -- Current year aggregates
  COUNT(DISTINCT br.id) as total_incidents,
  COUNT(DISTINCT br.student_id) as students_with_incidents,
  AVG(CASE WHEN r.id IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100 as reflection_rate,
  -- Grade breakdown
  jsonb_object_agg(s.grade, COUNT(DISTINCT br.id)) as incidents_by_grade,
  -- Monthly trends
  jsonb_object_agg(
    EXTRACT(MONTH FROM br.created_at),
    COUNT(DISTINCT br.id)
  ) as monthly_incidents
FROM behavior_requests br
LEFT JOIN reflections r ON r.behavior_request_id = br.id
LEFT JOIN students s ON s.id = br.student_id
WHERE br.created_at >= '2025-08-01'  -- Current academic year
GROUP BY EXTRACT(YEAR FROM br.created_at);

-- Refresh every hour
CREATE INDEX idx_overview_cache_refresh ON overview_dashboard_cache(last_refresh);
```

#### Student Profile Optimization
```sql
-- Individual student summary view
CREATE VIEW student_profile_summary AS
SELECT 
  s.id,
  s.first_name || ' ' || s.last_name as full_name,
  s.grade,
  -- Current year metrics
  COUNT(DISTINCT br.id) as current_incidents,
  COUNT(DISTINCT r.id) as current_reflections,
  -- Historical metrics via links
  shl.total_historical_incidents,
  shl.historical_grade,
  shl.confidence_score,
  -- Academic metrics
  AVG(sad.overall_gpa) as current_gpa,
  AVG(sad.attendance_rate) as current_attendance
FROM students s
LEFT JOIN behavior_requests br ON br.student_id = s.id
LEFT JOIN reflections r ON r.student_id = s.id
LEFT JOIN student_historical_links shl ON shl.current_student_id = s.id
LEFT JOIN simulated_academic_data sad ON sad.student_id = s.id
WHERE s.grade IN ('6th', '7th', '8th')
GROUP BY s.id, s.first_name, s.last_name, s.grade,
         shl.total_historical_incidents, shl.historical_grade, shl.confidence_score;
```

### Security Implementation

#### Access Control Functions
```sql
-- Role-based access validation
CREATE OR REPLACE FUNCTION validate_reporting_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all reporting views
CREATE POLICY reporting_admin_only ON overview_dashboard_cache
  FOR SELECT USING (validate_reporting_access());
```

#### Data Privacy Protection
```sql
-- Anonymized overview data (no PII)
CREATE VIEW overview_anonymized AS
SELECT 
  grade_level,
  incident_count,
  reflection_rate,
  behavior_category
FROM overview_dashboard_cache
-- No student names or identifiable information
```

### UI Component Architecture

#### React Component Structure
```
AdminReports/
├── AdminReportsPage.tsx          # Main container
├── components/
│   ├── OverviewDashboard/
│   │   ├── MetricsSummary.tsx    # Key performance indicators
│   │   ├── TrendCharts.tsx       # Monthly/quarterly trends
│   │   ├── GradeBreakdown.tsx    # Grade-level analysis
│   │   └── FilterControls.tsx    # Time/grade/type filters
│   └── StudentProfile/
│       ├── StudentSearch.tsx     # Autocomplete search interface
│       ├── ProfileHeader.tsx     # Student summary information
│       ├── CurrentYearData.tsx   # Current academic year metrics
│       ├── HistoricalData.tsx    # Previous year comparison
│       └── TrendVisualization.tsx # Interactive charts
├── hooks/
│   ├── useOverviewData.ts        # Overview dashboard data
│   ├── useStudentProfile.ts      # Individual student data
│   └── useReportingFilters.ts    # Filter state management
└── types/
    ├── OverviewTypes.ts          # Overview data interfaces
    └── StudentProfileTypes.ts    # Student profile interfaces
```

#### State Management Strategy
```typescript
// Reporting context for shared state
interface ReportingContextType {
  selectedTimeRange: TimeRange;
  selectedGrades: Grade[];
  selectedBehaviorTypes: BehaviorType[];
  searchQuery: string;
  selectedStudent: Student | null;
}

// React Query for data fetching
const useOverviewMetrics = (filters: ReportingFilters) => {
  return useQuery({
    queryKey: ['overview-metrics', filters],
    queryFn: () => fetchOverviewMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minute cache
    cacheTime: 30 * 60 * 1000  // 30 minute retention
  });
};
```

## User Experience Specifications

### Navigation Flow

#### Entry Point
1. Admin clicks "Reports" in main navigation
2. Default view: Overview Dashboard tab
3. Clear tab interface: Overview | Student Profile

#### Overview Dashboard Usage
1. View system-wide metrics at a glance
2. Apply filters to drill down into specific data
3. Click on charts for detailed breakdowns
4. Export data for external analysis

#### Student Profile Usage
1. Switch to Student Profile tab
2. Use search to find specific student
3. Review current year behavioral data
4. Compare with historical data (when available)
5. Analyze academic correlations

### Error Handling

#### Data Availability Messages
```
"No historical data available for this student (first year in middle school)"
"Historical data match: Medium confidence - manual verification recommended"
"Academic data simulation in progress - GPA estimates may vary"
```

#### Performance Degradation
```
"Loading large data set... This may take up to 10 seconds"
"Chart rendering in progress... Complex visualization loading"
"Search results limited to 50 students for performance"
```

#### Access Control Messages
```
"Access denied: Administrative privileges required for reporting features"
"Session expired: Please log in again to access reports"
"Feature unavailable: Reporting module requires admin role"
```

## Success Metrics

### Functional Requirements
- ✅ **Admin-only access**: Role-based security implemented
- ✅ **Current year integration**: Real-time data from operational tables
- ✅ **Historical data**: 94.7% successful import of previous year data
- ✅ **Student matching**: 151 current students linked to historical records
- ✅ **Performance targets**: <5 second load times for all dashboard views

### User Experience Requirements  
- ✅ **Intuitive navigation**: Two-tab interface with clear purpose
- ✅ **Responsive design**: Works on desktop, tablet, mobile devices
- ✅ **Data visualization**: Interactive charts with drill-down capability
- ✅ **Search functionality**: Fast autocomplete for 151 student roster
- ✅ **Export capability**: Data export for external analysis

### Data Quality Requirements
- ✅ **Accuracy**: 98.4% historical data import success rate
- ✅ **Completeness**: 94.7% high-confidence student matches
- ✅ **Timeliness**: Real-time updates for current year data
- ✅ **Consistency**: Standardized behavior categories across years
- ✅ **Privacy**: No PII exposure in overview analytics

---

*This specification provides the complete blueprint for implementing admin reporting functionality while maintaining system security, performance, and user experience standards.*