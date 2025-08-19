# 🔴 Current Database Schema

**Status**: PARTIALLY FUNCTIONAL - Schema exists but with integration issues

## Complete Database Entity Relationship Diagram

<lov-mermaid>
erDiagram
    auth_users {
        uuid id PK
        string email
        timestamp created_at
        timestamp updated_at
    }
    
    profiles {
        uuid id PK
        uuid user_id FK
        string role
        string display_name
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }
    
    students {
        uuid id PK
        string first_name
        string last_name
        string student_id
        int grade_level
        string homeroom_teacher
        boolean active
        timestamp created_at
        timestamp updated_at
    }
    
    behavior_support_requests {
        uuid id PK
        uuid student_id FK
        uuid created_by FK
        uuid assigned_to FK
        string status
        string priority
        text description
        text student_reflection
        text teacher_feedback
        timestamp created_at
        timestamp updated_at
        timestamp completed_at
    }
    
    active_sessions {
        uuid id PK
        uuid user_id FK
        string device_type
        string session_token
        boolean is_active
        timestamp created_at
        timestamp last_activity
    }
    
    queue_items {
        uuid id PK
        uuid student_id FK
        uuid bsr_id FK
        string status
        int queue_position
        timestamp created_at
        timestamp assigned_at
        timestamp completed_at
    }

    auth_users ||--o| profiles : "may have profile"
    profiles ||--o{ behavior_support_requests : "creates BSRs"
    profiles ||--o{ active_sessions : "has sessions"
    students ||--o{ behavior_support_requests : "subject of BSR"
    students ||--o{ queue_items : "in queue"
    behavior_support_requests ||--o| queue_items : "generates queue item"
</lov-mermaid>

## Current Schema Integration Issues

<lov-mermaid>
flowchart TD
    A[Google OAuth User] --> B[auth.users table]
    B --> C{Profile Creation?}
    C -->|Missing| D[❌ No profiles record]
    C -->|Exists| E[profiles table]
    
    D --> F[❌ role = null]
    D --> G[❌ display_name = null]
    
    E --> H[Valid User Profile]
    H --> I[BSR Creation]
    H --> J[Session Tracking]
    
    I --> K{Student Lookup}
    K -->|Field Mismatch| L[❌ Wrong field names used]
    K -->|Correct| M[Valid BSR]
    
    J --> N{Session Display}
    N -->|Profile Missing| O[❌ "Unknown User"]
    N -->|Profile Exists| P[Correct Display]
    
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style F fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style L fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style O fill:#ffebee,stroke:#d32f2f,stroke-width:3px
</lov-mermaid>

## Data Flow Problems

<lov-mermaid>
sequenceDiagram
    participant UI as Frontend
    participant DB as Database
    participant Q as Queue System
    participant S as Student Lookup

    UI->>S: Search student by name
    S->>DB: Query students table
    Note over DB: ❌ Using incorrect field mapping
    DB->>S: Return wrong/no results
    S->>UI: Display incorrect student data
    
    UI->>Q: Fetch queue items
    Q->>DB: JOIN students + queue_items
    Note over DB: ❌ Field name mismatches
    DB->>Q: Return incomplete data
    Q->>UI: Display "Unknown Student" in queue
</lov-mermaid>

## Row Level Security Status

<lov-mermaid>
flowchart TD
    A[Database Tables] --> B{RLS Enabled?}
    B -->|Yes| C[Most Tables Protected]
    B -->|No| D[❌ Some Tables Exposed]
    
    C --> E[profiles: Protected]
    C --> F[students: Protected]
    C --> G[behavior_support_requests: Protected]
    
    D --> H[❌ Potential Data Exposure]
    
    E --> I{Policy Validation}
    I -->|Needs Review| J[❌ May be overly permissive]
    I -->|Correct| K[Proper Access Control]
    
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style J fill:#fff3e0,stroke:#ff9800,stroke-width:2px
</lov-mermaid>

## Critical Database Issues

### 🔴 Profile Creation Problems
1. **Missing Trigger**: No automatic profile creation on user registration
2. **Null Roles**: New users have no role assignment
3. **Display Names**: Missing display names cause "Unknown User" display

### 🔴 Data Integration Issues  
1. **Field Name Mismatches**: Student lookup uses wrong field references
2. **JOIN Failures**: Queue display shows incomplete student information
3. **Session Correlation**: Active sessions not properly linked to user profiles

### 🔴 Security Concerns
1. **RLS Policy Review**: Policies may be overly permissive
2. **Cross-role Data Access**: Need validation of access boundaries
3. **Audit Trail**: Missing comprehensive logging of data changes

### 🟡 Data Quality Issues
1. **Student Import**: CSV import may have field mapping problems
2. **Queue Management**: Status updates not properly synchronized
3. **Session Deduplication**: Multiple active sessions not handled

## Required Database Fixes
1. **Create Profile Trigger**: Automatic profile creation on user registration
2. **Fix Field Mappings**: Correct student lookup field references
3. **Validate RLS Policies**: Review and tighten security policies
4. **Implement Session Deduplication**: Handle multiple active sessions
5. **Add Comprehensive Logging**: Audit trail for all data modifications