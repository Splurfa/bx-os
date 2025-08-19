# ⚪ Current Database Schema & Relationships

**Status**: FUNCTIONAL - Schema is correctly structured, relationships intact

## Complete Entity Relationship Diagram

<lov-mermaid>
erDiagram
    PROFILES {
        uuid id PK
        text email
        text full_name
        text role
        text department
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    FAMILIES {
        uuid id PK
        text family_name
        text primary_contact_name
        text primary_contact_phone
        text primary_contact_email
        text address_line1
        text city
        text state
        text zip_code
        timestamp created_at
        timestamp updated_at
    }
    
    GUARDIANS {
        uuid id PK
        uuid family_id FK
        text first_name
        text last_name
        text relationship
        text phone_primary
        text phone_secondary
        text email
        boolean is_primary_contact
        boolean can_pickup
        text communication_preference
        timestamp created_at
        timestamp updated_at
    }
    
    STUDENTS {
        uuid id PK
        uuid family_id FK
        text first_name
        text last_name
        text grade
        text class_name
        date date_of_birth
        text special_needs
        text allergies
        text medications
        timestamp created_at
        timestamp updated_at
    }
    
    KIOSKS {
        integer id PK
        text name
        text location
        boolean is_active
        uuid current_student_id FK
        uuid current_behavior_request_id FK
        uuid activated_by FK
        timestamp activated_at
        jsonb device_info
        timestamp created_at
        timestamp updated_at
    }
    
    BEHAVIOR_REQUESTS {
        uuid id PK
        uuid student_id FK
        uuid teacher_id FK
        text behavior_type
        text description
        text teacher_name
        text location
        text priority_level
        text status
        integer assigned_kiosk FK
        timestamp time_of_incident
        timestamp created_at
        timestamp updated_at
    }
    
    REFLECTIONS {
        uuid id PK
        uuid student_id FK
        uuid behavior_request_id FK
        text question_1_response
        text question_2_response
        text question_3_response
        text question_4_response
        integer mood_rating
        text teacher_feedback
        boolean teacher_approved
        boolean revision_requested
        jsonb ai_analysis
        timestamp submitted_at
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }
    
    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        text device_type
        jsonb device_info
        text location
        text session_status
        text session_token
        inet ip_address
        timestamp login_time
        timestamp last_activity
        timestamp ended_at
        timestamp created_at
    }
    
    BEHAVIOR_HISTORY {
        uuid id PK
        uuid student_id FK
        uuid behavior_request_id FK
        uuid reflection_id FK
        text resolution_type
        text resolution_notes
        text intervention_applied
        boolean family_notified
        text notification_method
        boolean follow_up_required
        date follow_up_date
        timestamp archived_at
        timestamp created_at
    }
    
    COMMUNICATION_LOGS {
        uuid id PK
        uuid student_id FK
        uuid guardian_id FK
        text method
        text recipient
        text subject
        text message_body
        text status
        timestamp sent_at
        timestamp delivered_at
        timestamp opened_at
        jsonb engagement_data
        timestamp created_at
    }

    %% Family Structure
    FAMILIES ||--o{ GUARDIANS : "has"
    FAMILIES ||--o{ STUDENTS : "has"
    
    %% User Management
    PROFILES ||--o{ BEHAVIOR_REQUESTS : "creates"
    PROFILES ||--o{ KIOSKS : "activates"
    PROFILES ||--o{ USER_SESSIONS : "has"
    
    %% Behavior Workflow
    STUDENTS ||--o{ BEHAVIOR_REQUESTS : "subject_of"
    BEHAVIOR_REQUESTS ||--o| REFLECTIONS : "generates"
    KIOSKS ||--o| BEHAVIOR_REQUESTS : "assigned_to"
    KIOSKS ||--o| STUDENTS : "current_student"
    
    %% History & Tracking
    BEHAVIOR_REQUESTS ||--o{ BEHAVIOR_HISTORY : "archived_as"
    REFLECTIONS ||--o{ BEHAVIOR_HISTORY : "archived_as"
    STUDENTS ||--o{ BEHAVIOR_HISTORY : "tracked_in"
    
    %% Communication
    STUDENTS ||--o{ COMMUNICATION_LOGS : "subject_of"
    GUARDIANS ||--o{ COMMUNICATION_LOGS : "receives"
</lov-mermaid>

## Data Flow Architecture

<lov-mermaid>
flowchart TD
    A[Teacher Creates BSR] --> B[BEHAVIOR_REQUESTS Table]
    B --> C[Student Assigned to Queue]
    C --> D[Admin Activates Kiosk]
    D --> E[KIOSKS Table Updated]
    
    E --> F[Auto-Assignment Function]
    F --> G[Student → Kiosk Binding]
    G --> H[KIOSKS.current_student_id]
    
    H --> I[Student Completes Reflection]
    I --> J[REFLECTIONS Table]
    J --> K[Teacher Reviews]
    K --> L{Approved?}
    
    L -->|Yes| M[BEHAVIOR_HISTORY Archive]
    L -->|No| N[Request Revision]
    N --> O[Update REFLECTIONS]
    
    M --> P[Family Notification]
    P --> Q[COMMUNICATION_LOGS]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style E fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style Q fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Row Level Security (RLS) Implementation

<lov-mermaid>
flowchart TD
    A[Database Access Request] --> B{RLS Policy Check}
    
    B --> C[Role-Based Policies]
    C --> D[Admin: Full Access]
    C --> E[Teacher: Own Data + Students]
    C --> F[Anonymous: Kiosk Data Only]
    
    D --> G[All Tables Accessible]
    E --> H[Filtered by teacher_id]
    F --> I[Active Kiosk Records Only]
    
    B --> J[Table-Specific Policies]
    J --> K[STUDENTS: Auth Required]
    J --> L[BEHAVIOR_REQUESTS: Teacher Scope]
    J --> M[KIOSKS: Anonymous Read for Active]
    
    style C fill:#e3f2fd,stroke:#1976d2
    style J fill:#e3f2fd,stroke:#1976d2
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#fff3e0,stroke:#f57c00
    style I fill:#fce4ec,stroke:#c2185b
</lov-mermaid>

## Key Database Functions

<lov-mermaid>
flowchart TD
    A[Database Functions] --> B[Student Assignment]
    A --> C[Session Management]
    A --> D[Security & Audit]
    A --> E[Data Import]
    
    B --> F[assign_waiting_students_to_kiosk]
    B --> G[reassign_waiting_students]
    B --> H[update_student_kiosk_status]
    
    C --> I[create_user_session]
    C --> J[end_user_session]
    
    D --> K[log_security_event]
    D --> L[validate_student_birthday_password]
    D --> M[check_kiosk_rate_limit]
    
    E --> N[import_complete_hillel_csv_data]
    E --> O[process_csv_to_families_and_students]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style C fill:#fff3e0,stroke:#f57c00
    style D fill:#e3f2fd,stroke:#1976d2
    style E fill:#fce4ec,stroke:#c2185b
</lov-mermaid>

## Schema Strengths & Weaknesses

### ✅ Schema Strengths
1. **Proper Normalization**: Clean family/student/guardian relationships
2. **Flexible Behavior Tracking**: Supports various behavior types and workflows
3. **Audit Trail**: Complete history and communication logging
4. **Security Framework**: RLS policies properly implemented
5. **Extensible**: AI insights and pattern recognition tables ready
6. **Data Integrity**: Proper foreign key relationships and constraints

### ⚠️ Areas for Enhancement
1. **Device Session Tracking**: Need device instance management in KIOSKS table
2. **Advanced Analytics**: AI/ML analysis tables need refinement
3. **Performance Optimization**: Indexes for high-traffic queries
4. **Data Archival**: Long-term storage strategy for historical data
5. **Integration Points**: External system sync tracking

### 🔍 Current Data Population Status
- **Families**: Sample data populated (5+ families)
- **Students**: Representative student records
- **Guardians**: Contact information complete
- **Behavior System**: Ready for production use
- **User Profiles**: Awaiting Google OAuth fix
- **Session Tracking**: Infrastructure ready, needs implementation