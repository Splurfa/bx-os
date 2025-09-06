# Antecedent Context Implementation Flow

## Overview
This flowchart documents the implementation of the antecedent (context) feature that enhances BSR creation with structured context capture using a 4-step wizard approach.

## Enhanced BSR Creation Flow

```mermaid
flowchart TD
    A[Teacher starts BSR creation] --> B[Step 1: Student Selection]
    B --> C{Student selected?}
    C -->|No| B
    C -->|Yes| D[Step 2: Context Selection]
    
    D --> E[Display 6 context options]
    E --> F{Context selected?}
    F -->|No| E
    F -->|Yes| G[Step 3: Behavior Selection]
    
    G --> H[Display behavior categories]
    H --> I{Behaviors selected?}
    I -->|No| H
    I -->|Yes| J[Step 4: Review & Submit]
    
    J --> K[Display summary with chips]
    J --> L[Teacher mood slider]
    J --> M[Urgency level selector]
    J --> N[Optional notes field]
    
    K --> O[Final validation]
    L --> O
    M --> O
    N --> O
    
    O --> P{All required fields?}
    P -->|No| Q[Show validation errors]
    Q --> J
    P -->|Yes| R[Submit BSR with context]
    
    R --> S[Insert into behavior_requests]
    S --> T[Queue assignment with context]
    T --> U[Real-time kiosk update]

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style G fill:#f3e5f5
    style J fill:#e8f5e8
    style R fill:#ffebee
```

## Context Selection Detail

```mermaid
flowchart LR
    A[Context Selection Screen] --> B[Frontal teaching lecture]
    A --> C[Individual quiet classwork]
    A --> D[Group/partner classwork]
    A --> E[Group discussion]
    A --> F[Test/Quiz]
    A --> G[Transitions]
    
    B --> H[Single selection logic]
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Store context_id]
    I --> J[Enable Next button]
    
    style A fill:#fff3e0
    style H fill:#e8f5e8
    style I fill:#e1f5fe
```

## Database Integration Flow

```mermaid
sequenceDiagram
    participant UI as Teacher UI
    participant API as Supabase API
    participant AC as antecedent_contexts
    participant BR as behavior_requests
    participant Q as Queue System
    
    UI->>API: Fetch context options
    API->>AC: SELECT * ORDER BY sort_order
    AC-->>API: Return 6 contexts
    API-->>UI: Context options with labels
    
    UI->>API: Submit BSR with context
    API->>BR: INSERT with antecedent_context_id
    BR-->>API: BSR created with ID
    API->>Q: Add to queue with context
    Q-->>API: Queue position assigned
    API-->>UI: Success confirmation
    
    Note over UI,Q: Context data flows through entire pipeline
```

## Component Architecture

```mermaid
graph TB
    subgraph "Enhanced CreateBSRForm"
        A[StudentSelection] --> B[ActivitySelection]
        B --> C[BehaviorSelection]
        C --> D[ReviewScreen]
    end
    
    subgraph "New Components"
        E[ActivitySelection]
        F[ReviewScreen]
        G[MoodSlider]
        H[UrgencySelector]
    end
    
    subgraph "Database"
        I[antecedent_contexts]
        J[behavior_requests]
    end
    
    B -.-> E
    D -.-> F
    F --> G
    F --> H
    
    E --> I
    D --> J
    
    style E fill:#fff3e0
    style F fill:#e8f5e8
    style I fill:#e1f5fe
    style J fill:#ffebee
```

## Data Structure Enhancement

```mermaid
erDiagram
    antecedent_contexts {
        uuid id PK
        text key UK
        text label
        text description
        integer sort_order
        timestamp created_at
        timestamp updated_at
    }
    
    behavior_requests {
        uuid id PK
        uuid student_id FK
        uuid teacher_id FK
        text behavior_type
        uuid antecedent_context_id FK
        text urgency_level
        integer teacher_mood
        text note
        text status
        timestamp created_at
    }
    
    students {
        uuid id PK
        text first_name
        text last_name
        text grade
    }
    
    profiles {
        uuid id PK
        text email
        text role
        text full_name
    }
    
    antecedent_contexts ||--o{ behavior_requests : "provides context for"
    students ||--o{ behavior_requests : "subject of"
    profiles ||--o{ behavior_requests : "created by"
```

## Real-time Integration

```mermaid
sequenceDiagram
    participant T as Teacher
    participant WS as WebSocket
    participant DB as Database
    participant K as Kiosk
    
    T->>DB: Create BSR with context
    DB->>WS: Trigger real-time event
    WS->>K: Push context data
    K->>K: Update interface with context
    
    Note over T,K: Context preserved through real-time flow
```

## Validation & Error Handling

```mermaid
flowchart TD
    A[Form Submission] --> B{Student selected?}
    B -->|No| C[Show student error]
    B -->|Yes| D{Context selected?}
    D -->|No| E[Show context error]
    D -->|Yes| F{Behavior selected?}
    F -->|No| G[Show behavior error]
    F -->|Yes| H{Valid mood rating?}
    H -->|No| I[Show mood error]
    H -->|Yes| J{Valid urgency level?}
    J -->|No| K[Show urgency error]
    J -->|Yes| L[Submit BSR]
    
    C --> A
    E --> A
    G --> A
    I --> A
    K --> A
    
    style L fill:#e8f5e8
    style C,E,G,I,K fill:#ffebee
```

## Future Enhancement Hooks

```mermaid
graph LR
    A[Current Context Feature] --> B[Quick-Select Notes]
    A --> C[Analytics Dashboard]
    A --> D[SIS Integration]
    A --> E[AI Recommendations]
    
    B --> F[Context-based suggestions]
    C --> G[Pattern analysis]
    D --> H[Clinical reports]
    E --> I[Predictive insights]
    
    style A fill:#e1f5fe
    style B,C,D,E fill:#fff3e0
    style F,G,H,I fill:#e8f5e8
```

## Implementation Status: ✅ IMPLEMENTED

### Database Schema: Complete
- `antecedent_contexts` table created
- `behavior_requests` enhanced with context fields
- RLS policies configured
- Sample data seeded

### Component Development: Complete
- 4-step wizard implemented
- Context selection component
- Review screen with mood/urgency
- Enhanced behavior selection

### Integration: Complete
- Real-time functionality maintained
- Queue system enhanced with context
- Backward compatibility preserved

---

*This implementation provides the foundation for comprehensive behavior analysis while maintaining BX-OS's core principles of simplicity and clinical relevance.*