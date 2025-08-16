# 📊 Database Schema Documentation

## Overview
This document provides a comprehensive overview of the Student Behavior Management System database schema, including entity relationships, data flows, constraints, and security policies.

---

## 🗂️ Entity Relationship Diagram (ERD)

<lov-mermaid>
erDiagram
    AUTH_USERS ||--|| PROFILES : "has profile"
    PROFILES ||--o{ BEHAVIOR_REQUESTS : "creates"
    PROFILES ||--o{ USER_SESSIONS : "has sessions"
    BEHAVIOR_REQUESTS ||--|| STUDENTS : "references"
    BEHAVIOR_REQUESTS ||--o| KIOSKS : "assigned to"
    BEHAVIOR_REQUESTS ||--o| REFLECTIONS : "has reflection"
    REFLECTIONS ||--o{ REFLECTIONS_HISTORY : "revision history"
    BEHAVIOR_HISTORY }o--|| BEHAVIOR_REQUESTS : "archived from"
    BEHAVIOR_HISTORY }o--|| STUDENTS : "references"
    BEHAVIOR_HISTORY }o--|| PROFILES : "handled by"
    USER_SESSIONS }o--o| KIOSKS : "session at kiosk"

    AUTH_USERS {
        uuid id PK
        text email
        timestamp email_confirmed_at
        jsonb raw_user_meta_data
        timestamp created_at
        timestamp updated_at
    }

    PROFILES {
        uuid id PK "FK: auth.users.id"
        text email
        text full_name
        text first_name
        text last_name
        text role "teacher|admin"
        timestamp created_at
        timestamp updated_at
    }

    STUDENTS {
        uuid id PK
        text name
        text grade
        text class_name
        timestamp created_at
        timestamp updated_at
    }

    BEHAVIOR_REQUESTS {
        uuid id PK
        uuid student_id FK
        uuid teacher_id FK
        text_array behaviors
        text mood
        text notes
        boolean urgent
        integer assigned_kiosk_id FK
        text status "waiting|review|completed"
        text kiosk_status "waiting|ready|in_progress"
        timestamp created_at
        timestamp updated_at
    }

    REFLECTIONS {
        uuid id PK
        uuid behavior_request_id FK
        text question1
        text question2
        text question3
        text question4
        text status "pending|submitted|approved|revision_requested"
        text teacher_feedback
        timestamp created_at
        timestamp updated_at
    }

    REFLECTIONS_HISTORY {
        uuid id PK
        uuid original_reflection_id FK
        uuid behavior_request_id FK
        integer attempt_number
        text question1
        text question2
        text question3
        text question4
        text status
        text teacher_feedback
        text revision_reason
        uuid archived_by FK
        timestamp original_created_at
        timestamp original_updated_at
        timestamp archived_at
    }

    KIOSKS {
        integer id PK
        text name
        text location
        boolean is_active
        uuid current_student_id
        uuid current_behavior_request_id
        uuid activated_by FK
        timestamp activated_at
        timestamp created_at
        timestamp updated_at
    }

    BEHAVIOR_HISTORY {
        uuid id PK
        uuid original_request_id
        uuid student_id
        uuid teacher_id
        text student_name
        text student_grade
        text student_class_name
        text teacher_name
        text teacher_email
        text_array behaviors
        text mood
        text notes
        boolean urgent
        integer assigned_kiosk_id
        text kiosk_name
        text kiosk_location
        uuid reflection_id
        text question1
        text question2
        text question3
        text question4
        text teacher_feedback
        text completion_status "completed"
        text intervention_outcome "approved"
        integer queue_position
        integer time_in_queue_minutes
        timestamp queue_created_at
        timestamp queue_started_at
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
        jsonb reflection_history
        uuid session_id
        text device_type
        text device_location
    }

    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        text device_type "web|kiosk"
        text location
        integer kiosk_id FK
        text device_identifier
        text session_status "active|idle|ended"
        timestamp login_time
        timestamp last_activity
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }
</lov-mermaid>

---

## 🔄 Data Flow Diagram

<lov-mermaid>
flowchart TD
    A[Teacher Login] --> B[Create Behavior Request]
    B --> C{Urgent?}
    C -->|Yes| D[Priority Queue]
    C -->|No| E[Regular Queue]
    
    D --> F[Auto-assign to Kiosk]
    E --> F
    
    F --> G{Kiosk Available?}
    G -->|Yes| H[Student Assigned to Kiosk]
    G -->|No| I[Wait in Queue]
    
    H --> J[Student Login at Kiosk]
    J --> K[Complete Reflection]
    K --> L[Submit for Review]
    
    L --> M[Teacher Reviews]
    M --> N{Approved?}
    N -->|Yes| O[Archive to History]
    N -->|No| P[Request Revision]
    
    P --> Q[Save to Reflection History]
    Q --> R[Student Revises]
    R --> K
    
    O --> S[Free Kiosk]
    S --> T[Assign Next Student]
    T --> F
    
    I --> U[Kiosk Becomes Available]
    U --> F

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style O fill:#e8f5e8
    style P fill:#fff3e0
</lov-mermaid>

---

## 📋 Table Details

### 👤 Profiles Table
**Purpose**: Extended user information and role management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users | User identifier |
| email | text | | User email address |
| full_name | text | | Complete name |
| first_name | text | | First name |
| last_name | text | | Last name |
| role | text | DEFAULT 'teacher' | User role (teacher/admin) |
| created_at | timestamptz | DEFAULT now() | Record creation time |
| updated_at | timestamptz | DEFAULT now() | Last update time |

**Indexes:**
- `profiles_pkey` (UNIQUE): id
- Auto-updated via trigger: `update_updated_at_column()`

---

### 🎓 Students Table
**Purpose**: Student directory and information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Student identifier |
| name | text | NOT NULL | Student full name |
| grade | text | | Grade level |
| class_name | text | | Class/homeroom |
| created_at | timestamptz | DEFAULT now() | Record creation time |
| updated_at | timestamptz | DEFAULT now() | Last update time |

**Indexes:**
- `students_pkey` (UNIQUE): id
- `idx_students_name`: name (for search optimization)

---

### 📝 Behavior Requests Table
**Purpose**: Core behavior incidents and queue management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Request identifier |
| student_id | uuid | NOT NULL | FK → students.id |
| teacher_id | uuid | NOT NULL | FK → profiles.id |
| behaviors | text[] | DEFAULT '{}' | Array of behavior tags |
| mood | text | NOT NULL | Student mood rating (1-10) |
| notes | text | | Additional context |
| urgent | boolean | DEFAULT false | Priority flag |
| assigned_kiosk_id | integer | | FK → kiosks.id |
| status | text | DEFAULT 'waiting' | waiting/review/completed |
| kiosk_status | text | DEFAULT 'waiting' | waiting/ready/in_progress |
| created_at | timestamptz | DEFAULT now() | Request creation time |
| updated_at | timestamptz | DEFAULT now() | Last update time |

**Critical Indexes:**
- `behavior_requests_pkey` (UNIQUE): id
- `idx_behavior_requests_status`: status
- `idx_behavior_requests_created_at`: created_at
- `unique_active_student_request` (UNIQUE): student_id (prevents duplicates)
- `idx_unique_active_kiosk_assignment` (UNIQUE): assigned_kiosk_id WHERE active

---

### 💭 Reflections Table
**Purpose**: Student reflection responses and review workflow

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Reflection identifier |
| behavior_request_id | uuid | NOT NULL | FK → behavior_requests.id |
| question1 | text | NOT NULL | "What did you do?" |
| question2 | text | NOT NULL | "What were you hoping?" |
| question3 | text | NOT NULL | "Who was impacted?" |
| question4 | text | NOT NULL | "What's expected?" |
| status | text | DEFAULT 'pending' | pending/submitted/approved/revision_requested |
| teacher_feedback | text | | Review comments |
| created_at | timestamptz | DEFAULT now() | Reflection start time |
| updated_at | timestamptz | DEFAULT now() | Last update time |

**Indexes:**
- `reflections_pkey` (UNIQUE): id
- `idx_reflections_behavior_request_id`: behavior_request_id

---

### 📚 Reflections History Table
**Purpose**: Revision tracking and audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | History record identifier |
| original_reflection_id | uuid | NOT NULL | FK → reflections.id |
| behavior_request_id | uuid | NOT NULL | FK → behavior_requests.id |
| attempt_number | integer | DEFAULT 1 | Revision attempt number |
| question1-4 | text | NOT NULL | Archived responses |
| status | text | NOT NULL | Status at archive time |
| teacher_feedback | text | | Review feedback |
| revision_reason | text | | Reason for revision |
| archived_by | uuid | | Who archived (teacher/admin) |
| original_created_at | timestamptz | NOT NULL | Original creation time |
| original_updated_at | timestamptz | NOT NULL | Original update time |
| archived_at | timestamptz | DEFAULT now() | Archive timestamp |

**Indexes:**
- `reflections_history_pkey` (UNIQUE): id
- `idx_reflections_history_behavior_request_id`: behavior_request_id
- `idx_reflections_history_original_reflection_id`: original_reflection_id
- `idx_reflections_history_archived_at`: archived_at

---

### 🖥️ Kiosks Table
**Purpose**: Physical kiosk management and assignment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | integer | PK, SERIAL | Kiosk identifier |
| name | text | NOT NULL | Kiosk display name |
| location | text | | Physical location |
| is_active | boolean | DEFAULT true | Operational status |
| current_student_id | uuid | | Currently assigned student |
| current_behavior_request_id | uuid | | Current active request |
| activated_by | uuid | | Last admin to activate |
| activated_at | timestamptz | | Last activation time |
| created_at | timestamptz | DEFAULT now() | Record creation time |
| updated_at | timestamptz | DEFAULT now() | Last update time |

**Indexes:**
- `kiosks_pkey` (UNIQUE): id

---

### 📊 Behavior History Table
**Purpose**: Completed intervention archive and reporting

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | History record identifier |
| original_request_id | uuid | NOT NULL | Original behavior_requests.id |
| student_id | uuid | NOT NULL | Student identifier |
| teacher_id | uuid | NOT NULL | Teacher identifier |
| student_name | text | NOT NULL | Student name (denormalized) |
| student_grade | text | | Grade level |
| student_class_name | text | | Class name |
| teacher_name | text | | Teacher name (denormalized) |
| teacher_email | text | | Teacher email |
| behaviors | text[] | NOT NULL | Behavior tags |
| mood | text | NOT NULL | Mood rating |
| notes | text | | Additional notes |
| urgent | boolean | DEFAULT false | Priority flag |
| assigned_kiosk_id | integer | | Kiosk used |
| kiosk_name | text | | Kiosk name (denormalized) |
| kiosk_location | text | | Kiosk location |
| reflection_id | uuid | | Final reflection ID |
| question1-4 | text | | Final reflection responses |
| teacher_feedback | text | | Final teacher feedback |
| completion_status | text | DEFAULT 'completed' | Completion status |
| intervention_outcome | text | DEFAULT 'approved' | Final outcome |
| queue_position | integer | | Position in original queue |
| time_in_queue_minutes | integer | | Total queue time |
| queue_created_at | timestamptz | NOT NULL | Original request time |
| queue_started_at | timestamptz | | When student started reflection |
| completed_at | timestamptz | DEFAULT now() | Completion timestamp |
| reflection_history | jsonb | | Complete revision history |
| session_id | uuid | | User session reference |
| device_type | text | | Device used |
| device_location | text | | Device location |

**Performance Indexes:**
- `behavior_history_pkey` (UNIQUE): id
- `idx_behavior_history_completed_at`: completed_at
- `idx_behavior_history_student_id`: student_id
- `idx_behavior_history_teacher_id`: teacher_id
- `idx_behavior_history_behaviors` (GIN): behaviors
- `idx_behavior_history_completion_status`: completion_status
- `idx_behavior_history_kiosk_id`: assigned_kiosk_id

---

### 💻 User Sessions Table
**Purpose**: Session tracking and device management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Session identifier |
| user_id | uuid | NOT NULL | FK → profiles.id |
| device_type | text | NOT NULL | web/kiosk |
| location | text | | Device location |
| kiosk_id | integer | | FK → kiosks.id (if kiosk session) |
| device_identifier | text | | Unique device ID |
| session_status | text | DEFAULT 'active' | active/idle/ended |
| login_time | timestamptz | DEFAULT now() | Session start |
| last_activity | timestamptz | DEFAULT now() | Last activity timestamp |
| metadata | jsonb | DEFAULT '{}' | Additional session data |
| created_at | timestamptz | DEFAULT now() | Record creation |
| updated_at | timestamptz | DEFAULT now() | Last update |

**Indexes:**
- `user_sessions_pkey` (UNIQUE): id
- `idx_user_sessions_device_type`: device_type
- `idx_user_sessions_session_status`: session_status
- `idx_user_sessions_user_id`: user_id

---

## 🔐 Row Level Security (RLS) Policies

### Profiles Table
```sql
-- Users can view own profile
POLICY "Users can view own profile" FOR SELECT 
USING (auth.uid() = id);

-- Users can update own profile  
POLICY "Users can update own profile" FOR UPDATE
USING (auth.uid() = id);

-- Public profiles viewable by authenticated users
POLICY "Public profiles are viewable by authenticated users" FOR SELECT
USING (auth.role() = 'authenticated');

-- Admins can update any profile
POLICY "Admins can update any profile" FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
```

### Behavior Requests Table
```sql
-- Teachers can view their own behavior requests
POLICY "Teachers can view their own behavior requests" FOR SELECT
USING (
  CASE 
    WHEN get_current_user_role() = 'admin' THEN true
    WHEN get_current_user_role() = 'teacher' THEN teacher_id = auth.uid()
    ELSE false
  END
);

-- Teachers can create behavior requests as themselves
POLICY "Teachers can create behavior requests as themselves" FOR INSERT
WITH CHECK (
  CASE
    WHEN get_current_user_role() = ANY(ARRAY['admin', 'teacher']) THEN teacher_id = auth.uid()
    ELSE false
  END
);

-- Teachers can update their own behavior requests
POLICY "Teachers can update their own behavior requests" FOR UPDATE
USING (
  CASE
    WHEN get_current_user_role() = 'admin' THEN true
    WHEN get_current_user_role() = 'teacher' THEN teacher_id = auth.uid()
    ELSE false
  END
);

-- Teachers can delete their own behavior requests
POLICY "Teachers can delete their own behavior requests" FOR DELETE
USING (
  CASE
    WHEN get_current_user_role() = 'admin' THEN true
    WHEN get_current_user_role() = 'teacher' THEN teacher_id = auth.uid()
    ELSE false
  END
);
```

### Students, Kiosks, Reflections, Behavior History Tables
```sql
-- Standard teacher/admin access pattern
POLICY "Teachers and admins can view/create/update [TABLE]" 
FOR [OPERATION]
USING/WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(ARRAY['teacher', 'admin'])
  )
);
```

### User Sessions Table
```sql
-- Users can manage their own sessions
POLICY "Users can view their own sessions" FOR SELECT
USING (auth.uid() = user_id);

POLICY "Users can update their own sessions" FOR UPDATE
USING (auth.uid() = user_id);

POLICY "Users can end their own sessions" FOR DELETE
USING (auth.uid() = user_id);

-- Teachers and admins can view all sessions (monitoring)
POLICY "Teachers and admins can view all sessions" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(ARRAY['teacher', 'admin'])
  )
);

-- Admins can manage any session
POLICY "Admins can update any session" FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

POLICY "Admins can end any session" FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

---

## ⚡ Database Functions & Triggers

### Key Functions

#### `get_current_user_role()`
```sql
-- Security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

#### `handle_new_user()`
```sql
-- Trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
-- Creates profile with metadata from auth.users
-- Handles name parsing and fallbacks
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `archive_completed_intervention_with_history()`
```sql
-- Archives completed behavior requests to history with full context
CREATE OR REPLACE FUNCTION public.archive_completed_intervention_with_history()
RETURNS TRIGGER AS $$
-- Complex archival with:
-- - Complete denormalization
-- - Queue metrics calculation  
-- - Reflection history compilation
-- - Security validation
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `reassign_waiting_students()`
```sql
-- Atomic kiosk assignment with conflict prevention
CREATE OR REPLACE FUNCTION public.reassign_waiting_students()
RETURNS VOID AS $$
-- Features:
-- - Advisory locking
-- - Cleanup of stale assignments
-- - Round-robin assignment
-- - Conflict resolution
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Automation Triggers

| Trigger | Table | Event | Function | Purpose |
|---------|-------|--------|----------|---------|
| `on_auth_user_created` | auth.users | INSERT | `handle_new_user()` | Auto-create profile |
| `update_profiles_updated_at` | profiles | UPDATE | `update_updated_at_column()` | Timestamp management |
| `update_behavior_requests_updated_at` | behavior_requests | UPDATE | `update_updated_at_column()` | Timestamp management |
| `archive_reflection_before_revision` | reflections | UPDATE | `archive_reflection_before_revision()` | Save revision history |
| `behavior_request_archive_trigger` | behavior_requests | DELETE | `archive_completed_intervention_with_history()` | Complete archival |
| `validate_kiosk_availability` | behavior_requests | INSERT/UPDATE | `validate_kiosk_availability()` | Enforce kiosk rules |
| `handle_kiosk_deactivation` | kiosks | UPDATE | `handle_kiosk_deactivation()` | Reassign on deactivation |

---

## 📈 Performance Optimizations

### Query Optimization Indexes

#### GIN Indexes (Array Search)
```sql
-- Fast behavior tag searching
CREATE INDEX idx_behavior_history_behaviors ON behavior_history USING GIN(behaviors);
```

#### Composite Indexes (Multi-column Queries)
```sql
-- Kiosk assignment uniqueness
CREATE UNIQUE INDEX idx_unique_active_kiosk_assignment 
ON behavior_requests(assigned_kiosk_id) 
WHERE assigned_kiosk_id IS NOT NULL 
AND kiosk_status = ANY(ARRAY['waiting', 'ready', 'in_progress']);
```

#### Partial Indexes (Filtered Queries)
```sql
-- Active sessions only
CREATE INDEX idx_active_user_sessions 
ON user_sessions(user_id, last_activity) 
WHERE session_status = 'active';
```

### Connection Optimization
- Connection pooling via Supabase
- Read replicas for reporting queries
- Advisory locks for critical sections

---

## 🔍 Query Patterns

### Common Query Examples

#### Get Teacher's Active Queue
```sql
SELECT br.*, s.name as student_name, r.status as reflection_status
FROM behavior_requests br
LEFT JOIN students s ON br.student_id = s.id  
LEFT JOIN reflections r ON br.id = r.behavior_request_id
WHERE br.teacher_id = $1 
AND br.status IN ('waiting', 'review')
ORDER BY br.urgent DESC, br.created_at ASC;
```

#### Kiosk Assignment Query
```sql
SELECT br.id 
FROM behavior_requests br
WHERE br.status = 'waiting' 
AND br.kiosk_status = 'waiting'
AND br.assigned_kiosk_id IS NULL
ORDER BY br.urgent DESC, br.created_at ASC
LIMIT 1 FOR UPDATE SKIP LOCKED;
```

#### Historical Reporting
```sql
SELECT 
  student_name,
  COUNT(*) as total_incidents,
  AVG(time_in_queue_minutes) as avg_queue_time,
  ARRAY_AGG(DISTINCT unnest(behaviors)) as common_behaviors
FROM behavior_history 
WHERE completed_at >= $1 AND completed_at <= $2
GROUP BY student_name
ORDER BY total_incidents DESC;
```

---

## 🔄 Data Lifecycle

### Request Lifecycle States

<lov-mermaid>
stateDiagram-v2
    [*] --> waiting : Teacher creates BSR
    waiting --> review : Student completes reflection
    review --> completed : Teacher approves
    review --> waiting : Teacher requests revision
    completed --> [*] : Archive to history
    
    note right of waiting : assigned_kiosk_id may be NULL
    note right of review : Reflection exists
    note right of completed : Ready for archival
</lov-mermaid>

### Kiosk Status Flow

<lov-mermaid>
stateDiagram-v2
    [*] --> waiting : Student assigned to kiosk
    waiting --> ready : Student logs in
    ready --> in_progress : Reflection started
    in_progress --> waiting : Reflection submitted
    waiting --> [*] : Request moves to review
    
    note right of waiting : Student can see "You're next"
    note right of ready : Kiosk shows welcome screen
    note right of in_progress : Student filling reflection
</lov-mermaid>

---

## 📋 Data Retention & Archival

### Retention Policies
- **Active Requests**: Indefinite (until completed)
- **Reflection History**: 7 years (academic records)
- **Behavior History**: 7 years (permanent archive)
- **User Sessions**: 90 days (automatic cleanup)
- **Audit Logs**: 1 year (compliance)

### Archive Triggers
- Automatic archival on behavior request deletion
- Complete context preservation
- Denormalized for fast reporting
- JSON revision history for transparency

---

## 🛡️ Security & Compliance

### Data Protection
- **PII Encryption**: Email addresses and names
- **Access Logging**: All administrative actions
- **RLS Enforcement**: Table-level security
- **Role-based Access**: Teacher/Admin separation

### Audit Trail
- Complete reflection revision history
- User session tracking
- Administrative action logging
- Queue position and timing metrics

### Compliance Features
- **FERPA Ready**: Student privacy protection
- **Data Export**: Complete history available
- **Right to Deletion**: Admin tools for removal
- **Access Control**: Granular permissions

---

*Last Updated: $(date)*
*Schema Version: 2.1*