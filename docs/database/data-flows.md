# 🌊 Database Data Flows - Visual Journey Maps

## Overview
This document shows how data moves through our system from start to finish, like following a river from source to sea. Each flow shows the complete journey of information through our database.

---

## 🎯 Primary Data Flow - Complete Student Journey

### The Full Journey from Incident to Archive

<lov-mermaid>
flowchart TD
    subgraph "🏫 Classroom Phase"
        A[👨‍🏫 Teacher notices behavior]
        B[📝 Opens BSR creation form]
        C[🎓 Selects student from dropdown]
        D[🏷️ Chooses behavior categories]
        E[😔 Sets mood level (1-10)]
        F[📝 Adds contextual notes]
        G[🚨 Marks urgent if needed]
        H[✅ Submits BSR]
    end
    
    subgraph "⚙️ System Processing Phase"
        I[💾 BSR saved to database]
        J[📊 Status set to 'waiting']
        K[⏰ Timestamp recorded]
        L[🔍 System checks kiosk availability]
        M{🖥️ Kiosk available?}
        N[⏳ Added to queue]
        O[🎯 Auto-assigned to kiosk]
        P[📱 Kiosk status updated]
    end
    
    subgraph "🖥️ Kiosk Phase"
        Q[👨‍🎓 Student approaches kiosk]
        R[🔐 Student enters credentials]
        S[✅ Authentication verified]
        T[💭 Reflection interface loads]
        U[❓ Student answers Question 1]
        V[❓ Student answers Question 2]
        W[❓ Student answers Question 3]
        X[❓ Student answers Question 4]
        Y[👀 Student reviews all answers]
        Z[📤 Submits reflection]
    end
    
    subgraph "👨‍🏫 Review Phase"
        AA[📬 Teacher receives notification]
        BB[💭 Teacher opens reflection]
        CC[📖 Teacher reads responses]
        DD{🤔 Quality check}
        EE[✅ Approves reflection]
        FF[📝 Requests revision with feedback]
        GG[💾 Feedback saved to database]
        HH[📋 Revision history recorded]
    end
    
    subgraph "📚 Archive Phase"
        II[🗂️ Complete data snapshot created]
        JJ[📊 All metrics calculated]
        KK[💾 Saved to behavior_history]
        LL[🆓 Kiosk marked available]
        MM[🔄 Next student auto-assigned]
        NN[📈 Analytics updated]
    end
    
    A --> B --> C --> D --> E --> F --> G --> H
    H --> I --> J --> K --> L --> M
    M -->|No| N --> O
    M -->|Yes| O
    O --> P --> Q --> R --> S --> T
    T --> U --> V --> W --> X --> Y --> Z
    Z --> AA --> BB --> CC --> DD
    DD -->|Approved| EE --> II
    DD -->|Needs Revision| FF --> GG --> HH --> U
    II --> JJ --> KK --> LL --> MM --> NN
    
    style A fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style I fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style U fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style EE fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style FF fill:#ffebee,stroke:#c62828,stroke-width:2px
    style KK fill:#fce4ec,stroke:#c2185b,stroke-width:2px
</lov-mermaid>

---

## 📊 Data State Transitions

### Behavior Request Status Flow

<lov-mermaid>
stateDiagram-v2
    [*] --> Waiting : BSR Created
    Waiting --> Ready : Kiosk Assigned
    Ready --> InProgress : Student Login
    InProgress --> Review : Reflection Submitted
    Review --> Completed : Teacher Approves
    Review --> Revision : Teacher Requests Changes
    Revision --> InProgress : Student Revises
    Completed --> [*] : Archived to History
    
    note right of Waiting : Queue position assigned<br/>Wait time tracking begins
    note right of Ready : Kiosk assignment complete<br/>Student can now login
    note right of InProgress : Active reflection session<br/>Progress tracking active
    note right of Review : Teacher notification sent<br/>Awaiting review decision
    note right of Revision : Feedback provided<br/>Previous attempt archived
    note right of Completed : Success metrics recorded<br/>Ready for archive
</lov-mermaid>

### Reflection Status Lifecycle

<lov-mermaid>
stateDiagram-v2
    [*] --> Pending : Reflection Created
    Pending --> InProgress : Student Begins
    InProgress --> Submitted : All Questions Answered
    Submitted --> UnderReview : Teacher Begins Review
    UnderReview --> Approved : Teacher Approves
    UnderReview --> RevisionRequested : Teacher Requests Changes
    RevisionRequested --> InProgress : Student Makes Changes
    Approved --> Archived : Moved to History
    Archived --> [*] : Process Complete
    
    note right of Pending : Waiting for student<br/>Kiosk assignment active
    note right of InProgress : Student actively typing<br/>Auto-save enabled
    note right of Submitted : Ready for teacher review<br/>Student session ended
    note right of RevisionRequested : Feedback provided<br/>History record created
    note right of Archived : Permanent storage<br/>Analytics updated
</lov-mermaid>

---

## 🔄 Real-time Data Flow

### Live Update Distribution

<lov-mermaid>
sequenceDiagram
    participant T as Teacher Dashboard
    participant DB as Database  
    participant RT as Real-time Engine
    participant K as Kiosk Interface
    participant A as Admin Dashboard
    
    Note over T,A: Teacher Creates BSR
    T->>DB: INSERT behavior_request
    DB->>RT: Trigger: new_behavior_request
    RT->>A: Update: new BSR in system
    RT->>K: Check: kiosk assignment
    
    Note over T,A: System Auto-Assignment
    DB->>DB: Auto-assign to available kiosk
    DB->>RT: Trigger: kiosk_assignment_updated
    RT->>K: Update: student assigned
    RT->>T: Update: BSR status changed
    RT->>A: Update: kiosk utilization
    
    Note over T,A: Student Interaction
    K->>DB: Student login event
    DB->>RT: Trigger: session_started
    RT->>T: Update: student begun reflection
    RT->>A: Update: active session count
    
    K->>DB: Reflection submitted
    DB->>RT: Trigger: reflection_ready
    RT->>T: Notification: ready for review
    RT->>A: Update: completion metrics
    
    Note over T,A: Teacher Review
    T->>DB: Approve/Request revision
    DB->>RT: Trigger: review_completed
    RT->>K: Update: kiosk availability
    RT->>A: Update: system metrics
</lov-mermaid>

---

## 🗃️ Data Storage Patterns

### Active vs Archive Data Flow

<lov-mermaid>
graph TB
    subgraph "🔄 Active Data Layer"
        A[📝 behavior_requests<br/>Current BSRs]
        B[💭 reflections<br/>Active responses]
        C[🎓 students<br/>Student directory]
        D[👨‍🏫 profiles<br/>User information]
        E[🖥️ kiosks<br/>Device management]
    end
    
    subgraph "📋 Revision Tracking"
        F[📋 reflections_history<br/>All revision attempts]
    end
    
    subgraph "📚 Archive Layer"
        G[📚 behavior_history<br/>Completed cases]
    end
    
    subgraph "⚡ Performance Benefits"
        H[🚀 Fast Active Queries<br/>Small table sizes]
        I[📊 Rich Historical Data<br/>Complete reporting]
        J[🔍 Detailed Analytics<br/>Trend analysis]
    end
    
    A --> F
    B --> F
    A --> G
    B --> G
    C --> G
    D --> G
    E --> G
    
    G --> I
    F --> I
    A --> H
    I --> J
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style F fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style G fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style H fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
</lov-mermaid>

**Data Movement Strategy:**
- 🔄 **Active Tables**: Keep only current, in-progress items
- 📋 **Revision Tables**: Track all attempts and changes
- 📚 **Archive Tables**: Store complete historical records
- ⚡ **Performance**: Fast queries on small active tables, rich reporting on archives

---

## 👥 User Data Access Patterns

### Teacher Data Flow

<lov-mermaid>
journey
    title Teacher Data Access Pattern
    section Login & Setup
      Authenticate with Supabase     : 5: Teacher
      Load teacher profile data      : 5: Teacher
      Subscribe to real-time updates : 4: Teacher
    section Dashboard Loading
      Query own behavior requests    : 5: Teacher
      Load student directory         : 4: Teacher
      Check kiosk availability       : 3: Teacher
    section Create BSR Flow
      Search student records         : 4: Teacher
      Insert new behavior request    : 5: Teacher
      Trigger queue processing       : 5: Teacher
    section Review Process
      Receive reflection notification: 5: Teacher
      Load reflection data           : 4: Teacher
      Update reflection status       : 5: Teacher
      Archive completed case         : 4: Teacher
    section Real-time Monitoring
      Monitor queue changes          : 4: Teacher
      Track student progress         : 4: Teacher
      Receive completion alerts      : 5: Teacher
</lov-mermaid>

### Admin Data Flow

<lov-mermaid>
journey
    title Administrator Data Access Pattern
    section System Overview
      Load all active BSRs           : 5: Admin
      Check system health metrics    : 5: Admin  
      Monitor kiosk status           : 4: Admin
      Review error logs              : 3: Admin
    section User Management
      Query all user profiles        : 4: Admin
      Create new teacher accounts    : 5: Admin
      Update user permissions        : 4: Admin
      Track user sessions            : 3: Admin
    section Analytics & Reporting
      Generate usage reports         : 5: Admin
      Export behavior history        : 4: Admin
      Analyze system performance     : 4: Admin
      Create trend reports           : 5: Admin
    section System Maintenance
      Archive old data               : 3: Admin
      Update system configuration    : 4: Admin
      Monitor data integrity         : 4: Admin
      Backup critical data           : 3: Admin
</lov-mermaid>

---

## 📈 Data Volume & Performance Flows

### Expected Data Growth Patterns

<lov-mermaid>
graph TB
    subgraph "📊 Data Volume Projection"
        subgraph "Daily Volume"
            A["📝 New BSRs: 50-200/day<br/>Peak during class hours"]
            B["💭 Reflections: 40-180/day<br/>Matches BSR completion"]
            C["🔄 Revisions: 10-50/day<br/>~20% require revision"]
        end
        
        subgraph "Monthly Accumulation"
            D["📚 Archive Records: 1000-4000<br/>Completed cases"]
            E["📋 Revision History: 200-1000<br/>Revision attempts"]
            F["💻 Session Logs: 2000-8000<br/>All user interactions"]
        end
        
        subgraph "Performance Strategy"
            G["🚀 Active Tables: <500 records<br/>Always fast queries"]
            H["📊 Archive Tables: Unlimited<br/>Optimized for reporting"]
            I["🗜️ Data Cleanup: 30-day cycle<br/>Automated maintenance"]
        end
    end
    
    A --> D
    B --> D  
    C --> E
    D --> H
    E --> H
    F --> I
    G --> I
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style D fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style G fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style I fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

---

## 🔍 Query Optimization Flows

### Common Query Patterns

<lov-mermaid>
flowchart TD
    subgraph "🎯 Most Frequent Queries"
        A["👨‍🏫 Teacher Dashboard:<br/>SELECT own BSRs WHERE status = 'active'"]
        B["⏳ Queue Display:<br/>SELECT BSRs ORDER BY created_at, urgent"]
        C["💭 Reflection Load:<br/>SELECT reflection WHERE BSR_id = ?"]
        D["📊 Admin Overview:<br/>SELECT COUNT(*) GROUP BY status"]
    end
    
    subgraph "🚀 Optimization Strategy"
        E["📋 Index on teacher_id + status<br/>Fast teacher queries"]
        F["⏰ Index on created_at + urgent<br/>Fast queue sorting"]  
        G["🔗 Foreign key indexes<br/>Fast joins"]
        H["📊 Materialized views<br/>Pre-calculated stats"]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    style E fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style F fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style G fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style H fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
</lov-mermaid>

---

## 🛡️ Security Data Flow

### Data Access Control Flow

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant A as Auth Layer
    participant R as RLS Engine  
    participant D as Database
    participant T as Tables
    
    U->>A: Login request
    A->>A: Validate credentials
    A->>R: Set user context (JWT)
    
    U->>D: Query request
    D->>R: Check RLS policies
    R->>R: Evaluate user role & ownership
    
    alt Teacher Access
        R->>T: Filter: teacher_id = current_user
        T-->>R: Return only owned records
    else Admin Access  
        R->>T: Allow: full access
        T-->>R: Return all records
    else Student Access
        R->>T: Block: no direct DB access
        T-->>R: Return empty/error
    end
    
    R-->>D: Filtered results
    D-->>U: Authorized data only
    
    Note over R: RLS policies enforce<br/>data access at row level
</lov-mermaid>

---

## 💡 Data Flow Best Practices

### 1. **Efficient Data Movement** 🚀
- Minimize active table sizes for speed
- Use real-time subscriptions for live updates
- Batch archive operations during low-usage periods

### 2. **Data Integrity Protection** 🛡️
- All state changes go through proper validation
- Cascade rules prevent orphaned data
- Timestamp tracking for complete audit trails

### 3. **Performance Optimization** ⚡
- Strategic indexing on query patterns
- Denormalized archives for fast reporting
- Connection pooling for concurrent access

### 4. **Scalability Planning** 📈
- Archive strategy prevents table bloat
- UUID keys support distributed growth
- Horizontal scaling ready architecture

---

*These data flows show how information moves through our system efficiently and securely. For technical implementation details, see [System Architecture](../architecture/system-overview.md).*