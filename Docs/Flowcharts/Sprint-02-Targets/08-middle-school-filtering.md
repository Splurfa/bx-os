# 🟢 Middle School Student Filtering System (Sprint 02 Target)

**Status**: SPRINT TARGET - Student filtering and data management for 159 middle school students

## Target Student Population Management

```mermaid
flowchart TD
    A[All Students in Database] --> B[Grade Level Filter]
    B --> C{Grade Level Check}
    
    C -->|grade_level = 6| D[6th Grade Students]
    C -->|grade_level = 7| E[7th Grade Students]
    C -->|grade_level = 8| F[8th Grade Students]
    C -->|grade_level != 6,7,8| G[Exclude from System]
    
    D --> H[Middle School Pool]
    E --> H
    F --> H
    
    H --> I[159 Total Students]
    I --> J[Available for BSR Creation]
    J --> K[Eligible for Queue Assignment]
    
    style D fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style F fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style H fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style I fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style J fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style K fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Student Data Import and Validation

```mermaid
flowchart TD
    A[CSV Import: hillel_students_2025.csv] --> B[Data Validation]
    B --> C{Grade Level Validation}
    
    C -->|Valid (6,7,8)| D[Import Student]
    C -->|Invalid (other)| E[Skip Student]
    
    D --> F[Create Student Record]
    F --> G[Assign Middle School Flag]
    G --> H[Set Active Status]
    
    H --> I[Student Available for BSR]
    I --> J[Add to System Count]
    
    E --> K[Log Excluded Student]
    K --> L[Exclude from Count]
    
    J --> M[Verify Total = 159]
    
    style D fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style F fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style G fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style H fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style I fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style J fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style M fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Student Selection Interface

```mermaid
flowchart TD
    A[Teacher Creates BSR] --> B[Student Selection Component]
    B --> C[Query Students Database]
    C --> D[Apply Grade Level Filter]
    
    D --> E[WHERE grade_level IN 6 7 8]
    E --> F[AND active = true]
    F --> G[ORDER BY last_name, first_name]
    
    G --> H[Display Filtered Results]
    H --> I[Student Search Functionality]
    I --> J{Search Type}
    
    J -->|Name Search| K[Search first_name + last_name]
    J -->|Student ID| L[Search student_id]
    J -->|Homeroom| M[Search homeroom_teacher]
    
    K --> N[Display Matching Students]
    L --> N
    M --> N
    
    N --> O[Teacher Selects Student]
    O --> P[Create BSR for Selected Student]
    
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style F fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style G fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style H fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style N fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style P fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Grade-Based Dashboard Analytics

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[Student Analytics]
    B --> C[Grade Level Breakdown]
    
    C --> D[6th Grade Count]
    C --> E[7th Grade Count]  
    C --> F[8th Grade Count]
    
    D --> G[BSRs per Grade Level]
    E --> H[BSRs per Grade Level]
    F --> I[BSRs per Grade Level]
    
    G --> J[Behavioral Trends by Grade]
    H --> J
    I --> J
    
    J --> K[Teacher Insights]
    K --> L[Grade-Specific Interventions]
    
    style C fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style D fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style F fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style J fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style K fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Homeroom Teacher Integration

```mermaid
flowchart TD
    A[Student Data] --> B[Homeroom Teacher Field]
    B --> C[Teacher Dashboard Filter]
    
    C --> D{Filter Options}
    D -->|My Students| E[homeroom_teacher = current_user]
    D -->|All Students| F[All Middle School Students]
    D -->|Specific Teacher| G[homeroom_teacher = selected_teacher]
    
    E --> H[Teacher's Homeroom Students Only]
    F --> I[All 159 Students]
    G --> J[Colleague's Students]
    
    H --> K[Create BSR for My Students]
    I --> L[Create BSR for Any Student]
    J --> M[Collaborative Support]
    
    style B fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style H fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style I fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style K fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style L fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Data Quality Validation

```mermaid
sequenceDiagram
    participant CSV as CSV File
    participant I as Import System
    participant V as Validation
    participant DB as Database
    participant A as Admin Dashboard

    CSV->>I: Upload student data
    I->>V: Validate each record
    V->>V: Check grade_level (6,7,8)
    V->>V: Validate required fields
    V->>V: Check for duplicates
    V->>DB: Insert valid records only
    DB->>A: Return import summary
    A->>A: Display 159 students imported
    Note over A: Show any excluded records
```

## Implementation Status

### ✅ IMPLEMENTED
- Student database with grade_level field
- CSV import functionality exists
- Student selection components exist

### 🔄 PARTIALLY IMPLEMENTED
- Grade level filtering needs validation
- Student count verification needed
- Dashboard analytics need grade breakdowns

### ❌ NOT IMPLEMENTED
- Automatic grade level filtering in all components
- Middle school student count validation (159 total)
- Grade-based analytics dashboard
- Homeroom teacher filtering system

## Implementation Requirements

### 1. Add Grade Level Filtering
```sql
-- Update all student queries to include grade level filter
WHERE grade_level IN (6, 7, 8) AND active = true
```

### 2. Validate Student Count
```typescript
// Verify exactly 159 middle school students imported
// Add validation to CSV import process
// Display total count in admin dashboard
```

### 3. Update Student Selection
```typescript
// Filter student selection to middle school only
// Add grade level display in student lists
// Implement homeroom teacher filtering
```

### 4. Add Grade-Based Analytics
```typescript
// Dashboard component showing grade level breakdown
// BSR counts per grade level
// Behavioral trend analysis by grade
```

## Student Data Structure

### 📋 Required Fields
```typescript
interface Student {
  id: uuid;
  first_name: string;
  last_name: string;
  student_id: string;
  grade_level: number; // Must be 6, 7, or 8
  homeroom_teacher: string;
  active: boolean; // Only active students available
}
```

### 🎯 Filtering Logic
- **Grade Filter**: `grade_level IN (6, 7, 8)`
- **Active Filter**: `active = true`
- **Total Count**: Exactly 159 students
- **Homeroom Filter**: Optional filtering by homeroom teacher

## Data Import Validation

### ✅ Valid Records
- Grade level is 6, 7, or 8
- All required fields present
- No duplicate student IDs
- Active status set to true

### ❌ Invalid Records
- Grade level not in middle school range
- Missing required fields
- Duplicate student IDs
- Inactive students

## Cross-References
- **Implementation Details**: `SPRINT-02-LAUNCH/IMPLEMENTATION-CHECKLIST.md` items 4.1-4.3
- **Technical Context**: `SPRINT-02-LAUNCH/BX-OS-TECHNICAL-CONTEXT.md` Student Data Management
- **Student Data**: `public/data/hillel_students_2025.csv`