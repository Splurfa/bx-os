# 🔗 Database Table Relationships - Visual Connection Maps

## Overview
This document shows how our database tables connect to each other, like a "wiring diagram" for data. Each line shows how information flows between different parts of our system.

---

## 🌐 Master Relationship Map

<lov-mermaid>
erDiagram
    AUTH_USERS ||--|| PROFILES : "has_profile"
    PROFILES ||--o{ BEHAVIOR_REQUESTS : "creates_bsr"
    PROFILES ||--o{ USER_SESSIONS : "has_sessions" 
    BEHAVIOR_REQUESTS ||--|| STUDENTS : "references_student"
    BEHAVIOR_REQUESTS ||--o| KIOSKS : "assigned_to_kiosk"
    BEHAVIOR_REQUESTS ||--o| REFLECTIONS : "generates_reflection"
    REFLECTIONS ||--o{ REFLECTIONS_HISTORY : "has_revision_history"
    BEHAVIOR_HISTORY }o--|| BEHAVIOR_REQUESTS : "archived_from_bsr"
    BEHAVIOR_HISTORY }o--|| STUDENTS : "student_snapshot"
    BEHAVIOR_HISTORY }o--|| PROFILES : "teacher_snapshot"
    USER_SESSIONS }o--o| KIOSKS : "kiosk_session"

    AUTH_USERS {
        uuid id PK
        text email
        jsonb raw_user_meta_data
        timestamptz created_at
        timestamptz updated_at
        timestamptz email_confirmed_at
    }

    PROFILES {
        uuid id PK "FK: auth.users.id"
        text email
        text full_name
        text first_name
        text last_name
        text role "teacher|admin"
        timestamptz created_at
        timestamptz updated_at
    }

    STUDENTS {
        uuid id PK
        text name
        text grade
        text class_name
        timestamptz created_at
        timestamptz updated_at
    }

    BEHAVIOR_REQUESTS {
        uuid id PK
        uuid student_id FK
        uuid teacher_id FK
        text_array behaviors
        text mood "1-10 scale"
        text notes
        boolean urgent
        integer assigned_kiosk_id FK
        text status "waiting|review|completed"
        text kiosk_status "waiting|ready|in_progress"
        timestamptz created_at
        timestamptz updated_at
    }

    REFLECTIONS {
        uuid id PK
        uuid behavior_request_id FK
        text question1 "What did you do?"
        text question2 "What were you hoping?"
        text question3 "Who was impacted?"
        text question4 "What's expected?"
        text status "pending|submitted|approved|revision_requested"
        text teacher_feedback
        timestamptz created_at
        timestamptz updated_at
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
        timestamptz original_created_at
        timestamptz original_updated_at
        timestamptz archived_at
    }

    KIOSKS {
        integer id PK
        text name
        text location
        boolean is_active
        uuid current_student_id
        uuid current_behavior_request_id
        uuid activated_by FK
        timestamptz activated_at
        timestamptz created_at
        timestamptz updated_at
    }

    BEHAVIOR_HISTORY {
        uuid id PK
        uuid original_request_id "Original BSR ID"
        uuid student_id "Student snapshot"
        uuid teacher_id "Teacher snapshot"
        text student_name "Denormalized"
        text student_grade "Denormalized"
        text student_class_name "Denormalized"
        text teacher_name "Denormalized"
        text teacher_email "Denormalized"
        text_array behaviors
        text mood
        text notes
        boolean urgent
        integer assigned_kiosk_id
        text kiosk_name "Denormalized"
        text kiosk_location "Denormalized"
        uuid reflection_id
        text question1
        text question2
        text question3
        text question4
        text teacher_feedback
        text completion_status
        text intervention_outcome
        integer queue_position
        integer time_in_queue_minutes
        timestamptz queue_created_at
        timestamptz queue_started_at
        timestamptz completed_at
        jsonb reflection_history
        uuid session_id
        text device_type
        text device_location
        timestamptz created_at
        timestamptz updated_at
    }

    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        text device_type "web|kiosk"
        text location
        integer kiosk_id FK
        text device_identifier
        text session_status "active|idle|ended"
        timestamptz login_time
        timestamptz last_activity
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }
</lov-mermaid>

---

## 🔄 Relationship Flow Patterns

### Primary User Flow
*How data flows through the system during normal operation*

<lov-mermaid>
flowchart TD
    A[👨‍🏫 Teacher Profile] --> B[📝 Creates BSR]
    B --> C[🎓 References Student]
    B --> D[⏳ Enters Queue]
    D --> E[🖥️ Assigned to Kiosk]
    E --> F[👨‍🎓 Student Login Session]
    F --> G[💭 Creates Reflection]
    G --> H[👨‍🏫 Teacher Reviews]
    H --> I{Approved?}
    I -->|Yes| J[📚 Archive to History]
    I -->|No| K[📋 Save to Revision History]
    K --> L[🔄 Student Revises]
    L --> G
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style B fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style E fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style G fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style J fill:#fce4ec,stroke:#c2185b,stroke-width:2px
</lov-mermaid>

---

## 🔗 Detailed Relationship Analysis

### 1. **User Authentication Chain** 🔐

<lov-mermaid>
graph LR
    subgraph "🔐 Authentication Layer"
        A[Supabase Auth Users<br/>🔑 Handles login/passwords]
        B[User Profiles<br/>👤 Extended user info]
        C[User Sessions<br/>💻 Track device usage]
    end
    
    A -->|"1:1"| B
    B -->|"1:Many"| C
    
    A2["🔑 Stores:<br/>• Email & password<br/>• Confirmation status<br/>• Auth metadata"]
    B2["👤 Stores:<br/>• Full name & role<br/>• Contact information<br/>• System permissions"]
    C2["💻 Stores:<br/>• Device type & location<br/>• Session duration<br/>• Activity tracking"]
    
    A -.-> A2
    B -.-> B2  
    C -.-> C2
    
    style A fill:#ffebee,stroke:#c62828,stroke-width:2px
    style B fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style C fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
</lov-mermaid>

**Key Relationships:**
- Each Supabase auth user **must have** exactly one profile
- Each profile **can have** multiple active sessions (web + kiosk)
- Sessions track which devices users are logged into

---

### 2. **Behavior Request Workflow Chain** 📝

<lov-mermaid>
graph TB
    subgraph "📝 Incident Management Flow"
        A[👨‍🏫 Teacher Profile]
        B[📝 Behavior Request]
        C[🎓 Student Record]
        D[🖥️ Kiosk Assignment]
        E[💭 Student Reflection]
        F[📋 Revision History]
        G[📚 Final Archive]
    end
    
    A -->|"creates"| B
    B -->|"references"| C
    B -->|"assigned to"| D
    B -->|"generates"| E
    E -->|"may have revisions"| F
    B -->|"when completed"| G
    
    A1["👨‍🏫 Teacher can create<br/>many behavior requests"]
    B1["📝 Each BSR references<br/>exactly one student"]
    C1["🎓 Students can be in<br/>multiple BSRs (over time)"]
    D1["🖥️ Kiosks can handle<br/>one BSR at a time"]
    E1["💭 Each BSR generates<br/>exactly one reflection"]
    F1["📋 Reflections can have<br/>multiple revision attempts"]
    G1["📚 Completed BSRs archived<br/>with complete history"]
    
    A -.-> A1
    B -.-> B1
    C -.-> C1
    D -.-> D1
    E -.-> E1
    F -.-> F1
    G -.-> G1
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style B fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style D fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style E fill:#fce4ec,stroke:#c2185b,stroke-width:2px
</lov-mermaid>

**Key Relationships:**
- Teachers own their behavior requests (can't see others')
- Each BSR connects to exactly one student
- Kiosks can only handle one student at a time
- Reflections can be revised multiple times before approval

---

### 3. **Archive & History Preservation** 📚

<lov-mermaid>
graph LR
    subgraph "📚 Archive Strategy"
        subgraph "🔄 Active Data"
            A[📝 Behavior Request]
            B[💭 Reflection]  
            C[🎓 Student Info]
            D[👨‍🏫 Teacher Info]
            E[🖥️ Kiosk Info]
        end
        
        subgraph "📋 Revision Tracking"
            F[📋 Reflection History<br/>All revision attempts]
        end
        
        subgraph "📚 Permanent Archive"
            G[📚 Behavior History<br/>Complete snapshot]
        end
    end
    
    A --> G
    B --> F
    B --> G
    C --> G
    D --> G
    E --> G
    
    G1["📚 Denormalized Storage:<br/>• Complete student snapshot<br/>• Complete teacher snapshot<br/>• Complete kiosk snapshot<br/>• All reflection attempts<br/>• Timing analytics"]
    
    G -.-> G1
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style F fill:#fff3e0,stroke:#f57c00,stroke-width:2px  
    style G fill:#fce4ec,stroke:#c2185b,stroke-width:3px
</lov-mermaid>

**Archive Strategy Benefits:**
- **Complete Historical Record**: Everything needed for reporting
- **Performance**: Active tables stay fast, archives handle bulk storage
- **Data Integrity**: Snapshots preserve information even if original records change
- **Analytics Ready**: Pre-formatted data for easy reporting

---

## 🎯 Relationship Constraints & Rules

### Foreign Key Relationships

<lov-mermaid>
graph TB
    subgraph "🔗 Foreign Key Constraints"
        subgraph "✅ Required Relationships"
            A["profiles.id → auth.users.id<br/>Every profile MUST have auth user"]
            B["behavior_requests.student_id → students.id<br/>Every BSR MUST reference a student"]
            C["behavior_requests.teacher_id → profiles.id<br/>Every BSR MUST have a teacher"]
            D["reflections.behavior_request_id → behavior_requests.id<br/>Every reflection MUST link to BSR"]
        end
        
        subgraph "🔄 Optional Relationships"
            E["behavior_requests.assigned_kiosk_id → kiosks.id<br/>BSRs may or may not be assigned"]
            F["user_sessions.kiosk_id → kiosks.id<br/>Sessions may be web or kiosk"]
            G["reflections_history.archived_by → profiles.id<br/>May be system or user archived"]
        end
    end
    
    style A fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style B fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style C fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style D fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style E fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

---

## 🚀 Performance Optimization Relationships

### Index Strategy Visual

<lov-mermaid>
graph TB
    subgraph "🚀 Database Performance Strategy"
        subgraph "🔍 Primary Lookups"
            A["behavior_requests.teacher_id<br/>Teachers find their BSRs"]
            B["behavior_requests.status<br/>Queue filtering"] 
            C["behavior_requests.created_at<br/>Time-based ordering"]
            D["reflections.behavior_request_id<br/>Link reflections to BSRs"]
        end
        
        subgraph "📊 Reporting Indexes"
            E["behavior_history.completed_at<br/>Historical reporting"]
            F["behavior_history.student_id<br/>Student analytics"]
            G["behavior_history.behaviors (GIN)<br/>Behavior pattern analysis"]
        end
        
        subgraph "🔒 Security Indexes"
            H["profiles.role<br/>Permission checking"]
            I["user_sessions.session_status<br/>Active session tracking"]
        end
    end
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style E fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style H fill:#ffebee,stroke:#c62828,stroke-width:2px
</lov-mermaid>

**Index Benefits:**
- ⚡ **Faster Queries**: Pre-sorted data for common lookups
- 📊 **Efficient Reporting**: Quick access to historical data
- 🔒 **Security Performance**: Fast permission checking

---

## 🛡️ Data Integrity Rules

### Cascade and Constraint Rules

<lov-mermaid>
graph LR
    subgraph "🛡️ Data Protection Rules"
        subgraph "🚫 Cannot Delete"
            A["❌ Cannot delete students<br/>with active BSRs"]
            B["❌ Cannot delete teachers<br/>with active BSRs"]
            C["❌ Cannot delete kiosks<br/>with active assignments"]
        end
        
        subgraph "✅ Safe Operations"
            D["✅ Can archive completed BSRs<br/>to behavior_history"]
            E["✅ Can deactivate users<br/>without losing data"]
            F["✅ Can revise reflections<br/>keeping history"]
        end
        
        subgraph "🔄 Automatic Actions"
            G["🔄 Profile creation triggers<br/>when new auth user added"]
            H["🔄 Timestamp updates<br/>on all record changes"]
            I["🔄 Archive triggers<br/>when BSRs completed"]
        end
    end
    
    style A fill:#ffebee,stroke:#c62828,stroke-width:2px
    style B fill:#ffebee,stroke:#c62828,stroke-width:2px
    style C fill:#ffebee,stroke:#c62828,stroke-width:2px
    style D fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style E fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style F fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style G fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style H fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style I fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
</lov-mermaid>

---

## 💡 Relationship Best Practices

### 1. **Referential Integrity** 🔗
- All foreign keys have proper constraints
- Cascading rules protect against orphaned records
- Archive tables preserve relationships even after deletion

### 2. **Performance Relationships** ⚡
- Denormalized data in archives for fast reporting
- Strategic indexes on commonly joined fields
- Composite indexes for complex queries

### 3. **Security Relationships** 🔐
- Row Level Security enforces data access rules
- Relationship-based permissions (teachers see only their BSRs)
- Audit trail through timestamps and user tracking

### 4. **Scalability Relationships** 📈
- UUID primary keys support distributed systems
- Archive strategy prevents active tables from growing too large
- JSON fields provide flexibility for future enhancements

---

*This relationship map helps you understand how data connects throughout our system. For implementation details, see [Data Flows](data-flows.md).*