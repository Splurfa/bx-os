# Database Schema Documentation

## Schema Overview

The Behavior Support System uses a PostgreSQL database hosted on Supabase with comprehensive Row Level Security (RLS) policies. The schema supports a complete workflow from behavior incident reporting through student reflection and administrative oversight.

## Visual Database Schema

```mermaid
erDiagram
    profiles ||--o{ behavior_requests : "teacher creates"
    profiles ||--o{ user_sessions : "user has"
    students ||--o{ behavior_requests : "subject of"
    behavior_requests ||--o| reflections : "has reflection"
    behavior_requests ||--o| kiosks : "assigned to"
    kiosks ||--o{ user_sessions : "tracks sessions"

    profiles {
        uuid id PK
        text email
        text full_name
        text role
        timestamp created_at
        timestamp updated_at
    }

    students {
        uuid id PK
        text name
        text grade
        text class_name
        timestamp created_at
        timestamp updated_at
    }

    behavior_requests {
        uuid id PK
        uuid student_id FK
        uuid teacher_id FK
        text_array behaviors
        text mood
        boolean urgent
        text status
        text kiosk_status
        integer assigned_kiosk_id FK
        text notes
        timestamp created_at
        timestamp updated_at
    }

    reflections {
        uuid id PK
        uuid behavior_request_id FK
        text question1
        text question2
        text question3
        text question4
        text status
        text teacher_feedback
        timestamp created_at
        timestamp updated_at
    }

    kiosks {
        integer id PK
        text name
        text location
        boolean is_active
        uuid current_student_id FK
        uuid current_behavior_request_id FK
        uuid activated_by FK
        timestamp activated_at
        timestamp created_at
        timestamp updated_at
    }

    user_sessions {
        uuid id PK
        uuid user_id FK
        text device_type
        text location
        integer kiosk_id FK
        text session_status
        jsonb metadata
        timestamp login_time
        timestamp last_activity
        timestamp created_at
        timestamp updated_at
    }

    behavior_history {
        uuid id PK
        uuid original_request_id FK
        uuid student_id FK
        uuid teacher_id FK
        text student_name
        text behaviors_array
        text mood
        boolean urgent
        text completion_status
        timestamp completed_at
        timestamp created_at
    }
```

## Data Flow Overview

**Workflow**: BSR Creation → Queue → Kiosk Assignment → Reflection → Review → Archive

**Status Progression**:
- `waiting` → `ready` → `in_progress` → `completed` → `approved`

## Security Model

All tables implement Row Level Security (RLS) with role-based policies:
- **Teachers**: Can view/manage their own requests
- **Admins**: Full system access
- **Students**: Limited kiosk interface access

## Key Features

- Real-time subscriptions for live updates
- Automated archival to behavior_history
- Session tracking and management
- Comprehensive audit trails
- Performance-optimized indexes