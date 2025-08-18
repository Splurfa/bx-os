# 🗄️ BX-OS Database Schema Flowcharts

## Complete Database Architecture for Nuclear Reset

This document provides comprehensive database architecture flowcharts for the BX-OS Nuclear Reset transformation, showing the evolution from prototype to production-ready Behavioral Intelligence Platform.

## 🎯 Nuclear Reset Database Architecture

### Current vs. Future Database Design

```mermaid
flowchart TD
    subgraph "Current Prototype Schema"
        A1[Individual behavior_requests]
        A2[Basic student records]
        A3[Simple user profiles]
        A4[No family context]
        A5[Limited relationships]
    end
    
    subgraph "Nuclear Reset Schema"
        B1[families - Family Units]
        B2[students - Student Records]
        B3[guardians - Parent/Guardian Info]
        B4[behavior_requests - Enhanced BSRs]
        B5[reflections - Student Responses]
        B6[behavior_history - Completed Cases]
    end
    
    subgraph "Extension Point Tables"
        C1[external_data - SIS Integration]
        C2[behavior_patterns - AI Analysis]
        C3[ai_insights - ML Recommendations]
        C4[communication_templates - Parent Notifications]
        C5[communication_logs - Message Tracking]
        C6[data_sources - External Systems]
    end
    
    A1 --> B4
    A2 --> B2
    A3 --> B1
    A4 --> B3
    A5 --> B6
    
    B1 --> C1
    B2 --> C2
    B4 --> C3
    B5 --> C4
    B6 --> C5
    
    style B1 fill:#e8f5e8
    style B2 fill:#e8f5e8
    style B3 fill:#e8f5e8
    style C1 fill:#fff3e0
    style C2 fill:#fff3e0
    style C3 fill:#fff3e0
```

## 🏗️ Core Student-Centric Architecture

### Family → Student → Guardian Relationships

```mermaid
erDiagram
    FAMILIES ||--o{ STUDENTS : contains
    FAMILIES ||--o{ GUARDIANS : has
    STUDENTS ||--o{ BEHAVIOR_REQUESTS : receives
    BEHAVIOR_REQUESTS ||--|| REFLECTIONS : generates
    STUDENTS ||--o{ EXTERNAL_DATA : correlates
    STUDENTS ||--o{ BEHAVIOR_PATTERNS : analyzed
    STUDENTS ||--o{ AI_INSIGHTS : receives
    GUARDIANS ||--o{ COMMUNICATION_LOGS : receives
    
    FAMILIES {
        uuid id PK
        text family_name
        text primary_contact_name
        text primary_contact_phone
        text primary_contact_email
        text address_line1
        text address_line2
        text city
        text state
        text zip_code
        text emergency_contact_name
        text emergency_contact_phone
        text notes
    }
    
    STUDENTS {
        uuid id PK
        uuid family_id FK
        text first_name
        text last_name
        text name
        text grade
        text class_name
        date date_of_birth
        text gender
        text student_id_external
        text special_needs
        text medications
        text allergies
        text notes
    }
    
    GUARDIANS {
        uuid id PK
        uuid family_id FK
        text first_name
        text last_name
        text name
        text relationship
        text phone_primary
        text phone_secondary
        text email
        text communication_preference
        boolean is_primary_contact
        boolean can_pickup
        boolean emergency_contact
        text notes
    }
    
    BEHAVIOR_REQUESTS {
        uuid id PK
        uuid student_id FK
        uuid teacher_id FK
        text teacher_name
        text behavior_type
        text description
        text location
        text priority_level
        text status
        integer assigned_kiosk
        timestamp time_of_incident
    }
    
    REFLECTIONS {
        uuid id PK
        uuid behavior_request_id FK
        uuid student_id FK
        text question_1_response
        text question_2_response
        text question_3_response
        text question_4_response
        integer mood_rating
        text teacher_feedback
        boolean teacher_approved
        boolean revision_requested
        jsonb ai_analysis
    }
```

## 🔮 Extension Point Architecture

### AI & External Integration Framework

```mermaid
flowchart TD
    subgraph "Core Data"
        A1[STUDENTS]
        A2[BEHAVIOR_REQUESTS]
        A3[REFLECTIONS]
        A4[FAMILIES]
        A5[GUARDIANS]
    end
    
    subgraph "AI Integration Layer"
        B1[BEHAVIOR_PATTERNS]
        B2[AI_INSIGHTS]
        B3[Pattern Recognition Engine]
        B4[Predictive Analytics]
    end
    
    subgraph "External Data Layer"
        C1[DATA_SOURCES]
        C2[EXTERNAL_DATA]
        C3[SIS Integration]
        C4[Assessment Correlation]
    end
    
    subgraph "Communication Layer"
        D1[COMMUNICATION_TEMPLATES]
        D2[COMMUNICATION_LOGS]
        D3[Parent Notifications]
        D4[Multi-Channel Delivery]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B2
    B1 --> B3
    B2 --> B4
    
    A1 --> C2
    C1 --> C2
    C2 --> C3
    C3 --> C4
    
    A4 --> D2
    A5 --> D2
    D1 --> D3
    D2 --> D4
    
    style B1 fill:#e3f2fd
    style B2 fill:#e3f2fd
    style C1 fill:#f3e5f5
    style C2 fill:#f3e5f5
    style D1 fill:#fff3e0
    style D2 fill:#fff3e0
```

## 📊 Data Flow Architecture

### Complete Student Journey Through Database

```mermaid
sequenceDiagram
    participant T as Teacher
    participant BSR as behavior_requests
    participant S as students
    participant F as families
    participant G as guardians
    participant R as reflections
    participant H as behavior_history
    participant AI as ai_insights
    participant CL as communication_logs
    
    T->>BSR: Create behavior request
    BSR->>S: Link to student
    S->>F: Fetch family context
    F->>G: Get guardian contacts
    BSR->>R: Student completes reflection
    R->>AI: Trigger AI analysis
    AI->>R: Store insights
    T->>R: Review & approve
    R->>H: Archive completed case
    H->>CL: Trigger parent notification
    CL->>G: Send to guardians
```

## 🔄 CSV Import Data Transformation

### Flat CSV to Relational Structure

```mermaid
flowchart LR
    subgraph "CSV Input Data"
        A1[Student Name]
        A2[Grade]
        A3[Class]
        A4[Parent Name]
        A5[Parent Email]
        A6[Parent Phone]
        A7[Emergency Contact]
    end
    
    subgraph "Normalization Process"
        B1[Extract Family Info]
        B2[Create Student Record]
        B3[Generate Guardian Records]
        B4[Link Relationships]
    end
    
    subgraph "Relational Output"
        C1[families table]
        C2[students table]
        C3[guardians table]
        C4[Linked via foreign keys]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B2
    A4 --> B3
    A5 --> B3
    A6 --> B3
    A7 --> B3
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
    
    style B1 fill:#e8f5e8
    style B2 fill:#e8f5e8
    style B3 fill:#e8f5e8
    style B4 fill:#e8f5e8
```

## 🛡️ Security & Access Control Schema

### Row Level Security (RLS) Architecture

```mermaid
flowchart TD
    subgraph "Authentication Layer"
        A1[Supabase Auth]
        A2[JWT Tokens]
        A3[Role Assignment]
    end
    
    subgraph "RLS Policy Enforcement"
        B1[Teacher Policies]
        B2[Admin Policies]
        B3[System Policies]
        B4[Anonymous Policies]
    end
    
    subgraph "Data Access Control"
        C1[Own BSRs Only - Teachers]
        C2[All Data - Admins]
        C3[Device-Based - Kiosks]
        C4[Family Context - Authorized]
    end
    
    A1 --> A2
    A2 --> A3
    A3 --> B1
    A3 --> B2
    A3 --> B3
    A3 --> B4
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C3
    
    style B1 fill:#e8f5e8
    style B2 fill:#e3f2fd
    style B3 fill:#fff3e0
    style B4 fill:#fce4ec
```

## 🚀 Performance & Scalability Architecture

### Indexing and Optimization Strategy

```mermaid
flowchart TD
    subgraph "Primary Indexes"
        A1[UUID Primary Keys]
        A2[Foreign Key Indexes]
        A3[Status Field Indexes]
        A4[Timestamp Indexes]
    end
    
    subgraph "Composite Indexes"
        B1[student_id + status]
        B2[teacher_id + created_at]
        B3[family_id + relationship]
        B4[behavior_type + priority]
    end
    
    subgraph "Search Optimization"
        C1[Student Name Search]
        C2[Behavior Pattern Search]
        C3[Family Contact Search]
        C4[Full-Text on Reflections]
    end
    
    subgraph "Archive Strategy"
        D1[Hot Data - Active Tables]
        D2[Warm Data - Recent History]
        D3[Cold Data - Long-term Archive]
        D4[Automated Partitioning]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
    
    C1 --> D1
    C2 --> D2
    C3 --> D3
    C4 --> D4
    
    style D1 fill:#e8f5e8
    style D2 fill:#fff3e0
    style D3 fill:#f3e5f5
    style D4 fill:#e3f2fd
```

## 🔗 API Integration Architecture

### External System Connection Framework

```mermaid
flowchart TD
    subgraph "BX-OS Core Database"
        A1[students table]
        A2[families table]
        A3[behavior_requests table]
        A4[reflections table]
    end
    
    subgraph "Integration Framework"
        B1[data_sources table]
        B2[external_data table]
        B3[Correlation Engine]
        B4[Sync Scheduler]
    end
    
    subgraph "External Systems"
        C1[PowerSchool SIS]
        C2[Google Classroom]
        C3[Assessment Platforms]
        C4[Communication Tools]
    end
    
    subgraph "AI Services"
        D1[OpenAI API]
        D2[Custom ML Models]
        D3[Pattern Recognition]
        D4[Predictive Analytics]
    end
    
    A1 --> B2
    A2 --> B2
    A3 --> B2
    A4 --> B2
    
    B1 --> B3
    B2 --> B3
    B3 --> B4
    
    C1 --> B1
    C2 --> B1
    C3 --> B1
    C4 --> B1
    
    D1 --> B3
    D2 --> B3
    D3 --> B3
    D4 --> B3
    
    style B3 fill:#e8f5e8
    style B4 fill:#e8f5e8
```

## 📈 Future Evolution Architecture

### Multi-School Platform Database Design

```mermaid
flowchart TD
    subgraph "Single School (Current)"
        A1[School Database]
        A2[Local Students]
        A3[Local Families]
        A4[Local Analytics]
    end
    
    subgraph "Multi-School Platform (Future)"
        B1[District Database]
        B2[School Partitions]
        B3[Cross-School Analytics]
        B4[Federated Intelligence]
    end
    
    subgraph "Intelligence Layer"
        C1[Behavioral Trends]
        C2[Best Practices]
        C3[Resource Optimization]
        C4[Compliance Reporting]
    end
    
    A1 --> B2
    A2 --> B2
    A3 --> B2
    A4 --> B3
    
    B1 --> B3
    B2 --> B3
    B3 --> B4
    
    B4 --> C1
    B4 --> C2
    B4 --> C3
    B4 --> C4
    
    style B4 fill:#f3e5f5
    style C1 fill:#f3e5f5
    style C2 fill:#f3e5f5
    style C3 fill:#f3e5f5
    style C4 fill:#f3e5f5
```

---

**🎯 Database Architecture Success Definition:** Complete student-centric relational architecture with family context, AI integration hooks, external data correlation framework, and scalable multi-school platform foundation, ready for immediate production deployment and future behavioral intelligence expansion.