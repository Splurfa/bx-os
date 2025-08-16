# 📊 Database Schema Overview - Visual Wireframes

## Overview
This document provides **wireframe-style visual representations** of our database schema, designed for easy understanding by non-technical stakeholders. Think of these as "blueprints" showing how data is structured and connected.

---

## 🏗️ Database Architecture Wireframe

<lov-mermaid>
graph TB
    subgraph "👥 User Management Layer"
        AUTH[🔐 Auth Users<br/>Supabase Managed]
        PROF[👤 User Profiles<br/>Extended Info]
        SESS[💻 User Sessions<br/>Device Tracking]
    end
    
    subgraph "🎓 Student Management Layer" 
        STUD[🎓 Students<br/>Directory]
        BSR[📝 Behavior Requests<br/>Incident Reports]
        REFL[💭 Reflections<br/>Student Responses]
    end
    
    subgraph "🖥️ Kiosk Management Layer"
        KIOSK[🖥️ Kiosks<br/>Physical Devices]
        QUEUE[⏳ Queue System<br/>Built into BSR]
    end
    
    subgraph "📚 Archive & History Layer"
        HIST[📚 Behavior History<br/>Completed Cases]
        REFL_HIST[📋 Reflection History<br/>Revision Tracking]
    end
    
    AUTH -.->|creates| PROF
    PROF -->|creates| BSR
    PROF -->|has| SESS
    BSR -->|references| STUD
    BSR -->|assigned to| KIOSK
    BSR -->|generates| REFL
    REFL -->|archived to| REFL_HIST
    BSR -->|completed to| HIST
    SESS -.->|may use| KIOSK
    
    classDef userMgmt fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef studentMgmt fill:#f1f8e9,stroke:#388e3c,stroke-width:2px  
    classDef kioskMgmt fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef archiveMgmt fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class AUTH,PROF,SESS userMgmt
    class STUD,BSR,REFL studentMgmt
    class KIOSK,QUEUE kioskMgmt
    class HIST,REFL_HIST archiveMgmt
</lov-mermaid>

---

## 📋 Table Structure Wireframes

### 👤 User Profiles Table
*The "business card" for each system user*

<lov-mermaid>
graph LR
    subgraph "👤 PROFILES Table"
        A["🆔 ID (UUID)<br/>Primary Key"]
        B["📧 Email<br/>Contact Info"]
        C["👨‍💼 Full Name<br/>Display Name"]
        D["🎭 Role<br/>teacher | admin"]
        E["📅 Created/Updated<br/>Timestamps"]
    end
    
    subgraph "🔐 AUTH_USERS"
        F["🆔 Auth ID<br/>Supabase Managed"]
        G["🔑 Credentials<br/>Login Info"]
    end
    
    F -->|"links to"| A
    
    style A fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    style D fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

**What it stores:**
- 👤 **Personal Info**: Names, email addresses
- 🎭 **Role Assignment**: Teacher or Administrator
- 🔗 **Account Linking**: Connected to Supabase authentication

---

### 🎓 Students Directory Table
*The student roster for the school*

<lov-mermaid>
graph LR
    subgraph "🎓 STUDENTS Table"
        A["🆔 Student ID<br/>Unique Identifier"]
        B["👨‍🎓 Full Name<br/>Student Name"]
        C["📚 Grade Level<br/>Academic Year"]
        D["🏫 Class Name<br/>Homeroom/Section"]
        E["📅 Record Dates<br/>Created/Updated"]
    end
    
    style A fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    style B fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style C fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
    style D fill:#f1f8e9,stroke:#388e3c,stroke-width:2px
</lov-mermaid>

**What it stores:**
- 👨‍🎓 **Student Identity**: Names and identifiers
- 📚 **Academic Info**: Grade levels and class assignments
- 🏫 **Organization**: How students are grouped

---

### 📝 Behavior Requests Table - The Core Workflow
*This is where all behavior incidents start their journey*

<lov-mermaid>
graph TB
    subgraph "📝 BEHAVIOR REQUESTS - The Heart of the System"
        subgraph "🔍 Identification"
            A["🆔 Request ID<br/>Unique Tracker"]
            B["🎓 Student ID<br/>Who is involved"]
            C["👨‍🏫 Teacher ID<br/>Who reported"]
        end
        
        subgraph "📋 Incident Details"
            D["🏷️ Behaviors[]<br/>What happened<br/>(talking, disruption, etc.)"]
            E["😔 Mood Level<br/>Student's emotional state<br/>(1-10 scale)"]
            F["📝 Notes<br/>Additional context"]
            G["🚨 Urgent Flag<br/>Priority level"]
        end
        
        subgraph "⚙️ System Processing"
            H["🖥️ Assigned Kiosk<br/>Which device"]
            I["📊 Status<br/>waiting → review → completed"]
            J["🔄 Kiosk Status<br/>waiting → ready → in_progress"]
            K["⏰ Timestamps<br/>Created/Updated times"]
        end
    end
    
    A --> D
    B --> D  
    C --> D
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I
    I --> J
    J --> K
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style D fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style I fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style G fill:#ffebee,stroke:#c62828,stroke-width:2px
</lov-mermaid>

**What it stores:**
- 📋 **Incident Report**: What happened and who was involved
- 🎯 **Processing State**: Where in the workflow this request is
- 🔄 **Queue Management**: Assignment to kiosks and timing

---

### 💭 Student Reflection Table
*Where student responses and teacher reviews happen*

<lov-mermaid>
graph TB
    subgraph "💭 REFLECTIONS - Student Self-Assessment"
        A["🆔 Reflection ID<br/>Unique Response"]
        B["🔗 Links to BSR<br/>Behavior Request"]
        
        subgraph "❓ The Four Questions"
            C["Q1: What did you do?<br/>📝 Student's account"]
            D["Q2: What were you hoping?<br/>🎯 Student's intention"]
            E["Q3: Who was impacted?<br/>👥 Affected parties"]
            F["Q4: What's expected?<br/>📚 Understanding rules"]
        end
        
        subgraph "📊 Review Process"
            G["Status Tracker<br/>pending → submitted → approved"]
            H["👨‍🏫 Teacher Feedback<br/>Comments & guidance"]
            I["⏰ Timestamps<br/>Reflection timeline"]
        end
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    
    style A fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    style C fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style D fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style E fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style F fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px
</lov-mermaid>

**What it stores:**
- ❓ **Four Key Questions**: Structured self-reflection prompts
- 🔄 **Review Workflow**: Status tracking from draft to approval
- 📝 **Teacher Feedback**: Guidance and approval/revision requests

---

## 🔄 Data Flow Visual Journey

### The Complete Student Journey - From Incident to Resolution

<lov-mermaid>
journey
    title Complete Data Journey - From Classroom to Archive
    section 🏫 Classroom Incident
      Teacher notices behavior    : 2: Teacher
      Opens BSR creation form     : 5: Teacher
      Selects student from list   : 4: Teacher
      Chooses behavior categories : 4: Teacher
      Sets mood and urgency       : 3: Teacher
      Submits behavior request    : 5: Teacher
    section ⚙️ System Processing
      BSR enters database         : 5: System
      Queue position assigned     : 4: System
      Kiosk auto-assignment       : 5: System
      Student notification sent   : 4: System
    section 🖥️ Kiosk Interaction
      Student approaches kiosk    : 3: Student
      Logs in with credentials    : 4: Student
      Reads reflection prompts    : 4: Student
      Completes all 4 questions   : 3: Student
      Reviews and submits         : 5: Student
    section 👨‍🏫 Teacher Review
      Teacher receives notification: 5: Teacher
      Reviews student responses   : 4: Teacher
      Evaluates thoughtfulness    : 3: Teacher
      Approves or requests revision: 4: Teacher
      Provides constructive feedback: 5: Teacher
    section 📚 Archive & Completion
      Data moves to history table : 5: System
      Kiosk becomes available     : 4: System
      Next student auto-assigned  : 4: System
      Analytics updated           : 3: System
</lov-mermaid>

---

## 🖥️ Kiosk Management Visual

<lov-mermaid>
graph TB
    subgraph "🖥️ KIOSKS - Physical Device Management"
        A["🆔 Kiosk ID<br/>Device Number"]
        B["🏷️ Name & Location<br/>Room 101, Library, etc."]
        C["🟢 Active Status<br/>On/Off/Maintenance"]
        D["👨‍🎓 Current Student<br/>Who's using it now"]
        E["📝 Current BSR<br/>Active behavior request"]
        F["👨‍💼 Activated By<br/>Which admin enabled"]
    end
    
    subgraph "📊 Queue Integration"
        G["⏳ Queue Position<br/>Built into BSR table"]
        H["🔄 Auto-Assignment<br/>System assigns next student"]
        I["📈 Utilization Tracking<br/>Usage statistics"]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    
    G --> H
    H --> I
    
    D -.->|updates| G
    H -.->|assigns| D
    
    style A fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style C fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style D fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style G fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
</lov-mermaid>

**What it manages:**
- 🖥️ **Physical Devices**: Kiosk locations and operational status
- 👨‍🎓 **Student Assignment**: Which student is currently using each kiosk
- 📊 **Queue Integration**: Automatic assignment from the waiting queue

---

## 📚 Archive & History Visual Structure

<lov-mermaid>
graph TB
    subgraph "📚 BEHAVIOR HISTORY - The Archive Vault"
        subgraph "📋 Complete Record"
            A["🆔 History ID<br/>Archive identifier"]
            B["🔗 Original BSR ID<br/>Links back to original"]
            C["📊 Complete Student Info<br/>Name, grade, class (snapshot)"]
            D["👨‍🏫 Complete Teacher Info<br/>Name, email (snapshot)"]
        end
        
        subgraph "📝 Full Incident Record"
            E["🏷️ All Behaviors<br/>Complete category list"]
            F["😔 Mood Level<br/>Original emotional state"]
            G["📝 All Notes<br/>Context and details"]
            H["🚨 Urgency Level<br/>Priority information"]
        end
        
        subgraph "💭 Complete Reflection"
            I["❓ All 4 Questions<br/>Final approved answers"]
            J["👨‍🏫 Teacher Feedback<br/>Final review comments"]
            K["📋 Revision History<br/>JSON of all attempts"]
            L["✅ Final Outcome<br/>Approved/Completed"]
        end
        
        subgraph "⏱️ Timing Analytics"
            M["📊 Queue Position<br/>Where student waited"]
            N["⏳ Wait Time<br/>Minutes in queue"]
            O["🕐 Start Time<br/>When reflection began"]
            P["✅ Completion Time<br/>When fully resolved"]
        end
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    N --> O
    O --> P
    
    style A fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    style I fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style K fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style P fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
</lov-mermaid>

**What it preserves:**
- 📋 **Complete Snapshot**: Everything about the incident at completion time
- 📊 **Performance Metrics**: How long processes took, queue positions
- 💭 **Full Reflection Journey**: Final responses plus revision history
- 🔍 **Reporting Data**: Structured data for analytics and reporting

---

## 🔐 Security & Access Visual

<lov-mermaid>
graph TB
    subgraph "🔐 Security Layer - Who Can Access What"
        subgraph "👨‍🏫 Teacher Access"
            T1["✅ View own BSRs only"]
            T2["✅ Create BSRs for any student"]  
            T3["✅ Review reflections for own BSRs"]
            T4["✅ View all students"]
            T5["❌ Cannot see other teachers' BSRs"]
            T6["❌ Cannot manage users"]
        end
        
        subgraph "👨‍💼 Admin Access"
            A1["✅ View ALL BSRs"]
            A2["✅ Manage all users"]
            A3["✅ Control kiosk settings"]
            A4["✅ Access all history data"]
            A5["✅ System configuration"]
            A6["✅ Export all data"]
        end
        
        subgraph "🎓 Student Access"
            S1["✅ Login to assigned kiosk only"]
            S2["✅ Complete own reflection only"]
            S3["❌ No database access"]
            S4["❌ Cannot see other students"]
        end
    end
    
    style T1 fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    style T5 fill:#ffebee,stroke:#c62828,stroke-width:2px
    style A1 fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style S1 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style S3 fill:#ffebee,stroke:#c62828,stroke-width:2px
</lov-mermaid>

**Access Control Summary:**
- 🔵 **Teachers**: Can manage their own behavior requests and students
- 🟠 **Admins**: Full system access and user management
- 🟡 **Students**: Limited kiosk access for their assigned reflections

---

## 💡 Key Design Principles

### 1. **Data Integrity** 🛡️
- Every record has timestamps for auditing
- Foreign key relationships maintain data consistency
- Archive tables preserve complete history

### 2. **Performance Optimization** ⚡
- Strategic indexes on frequently queried fields
- Separate archive tables keep active data fast
- Real-time subscriptions for live updates

### 3. **Security First** 🔐
- Row Level Security (RLS) on all tables
- Role-based access control
- No direct database access for students

### 4. **Scalability** 📈
- UUID primary keys for distributed systems
- JSON fields for flexible metadata
- Archive strategy for long-term data growth

---

*This wireframe overview is designed to help non-technical stakeholders understand our data structure. For detailed technical specifications, see the [Table Relationships](table-relationships.md) documentation.*