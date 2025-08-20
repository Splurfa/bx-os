# 🟢 Simplified Kiosk System (Sprint 02 Target)

**Status**: SPRINT TARGET - Static URL system for 3 dedicated iPads serving 159 middle school students

## Target Kiosk Architecture

```mermaid
flowchart TD
    A[159 Middle School Students] --> B[3 Dedicated iPads]
    
    B --> C[iPad 1: /kiosk1]
    B --> D[iPad 2: /kiosk2]  
    B --> E[iPad 3: /kiosk3]
    
    C --> F[Static URL Assignment]
    D --> G[Static URL Assignment]
    E --> H[Static URL Assignment]
    
    F --> I[Queue-Based Student Assignment]
    G --> J[Queue-Based Student Assignment]
    H --> K[Queue-Based Student Assignment]
    
    I --> L[Auto-Progress to Next Student]
    J --> M[Auto-Progress to Next Student]
    K --> N[Auto-Progress to Next Student]
    
    style C fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style D fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style I fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style J fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style K fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style L fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style M fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style N fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Queue-Based Student Assignment Flow

```mermaid
flowchart TD
    A[Teacher Creates BSR] --> B[Student Added to Queue]
    B --> C[Queue Position Assigned]
    C --> D{Available Kiosk?}
    
    D -->|Kiosk 1 Free| E[Auto-assign to /kiosk1]
    D -->|Kiosk 2 Free| F[Auto-assign to /kiosk2]
    D -->|Kiosk 3 Free| G[Auto-assign to /kiosk3]
    D -->|All Busy| H[Wait in Queue]
    
    E --> I[Student Completes BSR on iPad 1]
    F --> J[Student Completes BSR on iPad 2]
    G --> K[Student Completes BSR on iPad 3]
    
    I --> L[Auto-Progress to Next in Queue]
    J --> M[Auto-Progress to Next in Queue]
    K --> N[Auto-Progress to Next in Queue]
    
    L --> O[iPad 1 Ready for Next Student]
    M --> P[iPad 2 Ready for Next Student]
    N --> Q[iPad 3 Ready for Next Student]
    
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style F fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style G fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style L fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style M fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style N fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Anonymous Access Implementation

```mermaid
flowchart TD
    A[Student Accesses iPad] --> B[Navigate to assigned URL]
    B --> C[/kiosk1, /kiosk2, or /kiosk3]
    C --> D[✅ No Authentication Required]
    
    D --> E[Load Kiosk Component]
    E --> F[Fetch Assigned Student]
    F --> G{Student Available?}
    
    G -->|Yes| H[Load Student BSR]
    G -->|No| I[Display "No Students Assigned"]
    
    H --> J[Student Completes Reflection]
    J --> K[Submit for Teacher Review]
    K --> L[Auto-Progress to Next Student]
    
    I --> M[Wait for Queue Assignment]
    
    style D fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style H fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style L fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Conflict Prevention System

```mermaid
sequenceDiagram
    participant K1 as Kiosk 1
    participant K2 as Kiosk 2
    participant Q as Queue System
    participant DB as Database

    K1->>Q: Request next student
    Q->>DB: Get next unassigned student
    DB->>Q: Return Student A
    Q->>DB: Mark Student A as assigned to Kiosk 1
    Q->>K1: Assign Student A
    
    K2->>Q: Request next student
    Q->>DB: Get next unassigned student (skips A)
    DB->>Q: Return Student B
    Q->>DB: Mark Student B as assigned to Kiosk 2
    Q->>K2: Assign Student B
    
    Note over K1,K2: ✅ No conflicts - different students assigned
```

## Middle School Student Filtering

```mermaid
flowchart TD
    A[All Students in Database] --> B[Grade Level Filter]
    B --> C{Grade Level}
    C -->|6th Grade| D[✅ Include in Queue]
    C -->|7th Grade| E[✅ Include in Queue]
    C -->|8th Grade| F[✅ Include in Queue]
    C -->|Other Grades| G[❌ Exclude from Queue]
    
    D --> H[Middle School Student Pool]
    E --> H
    F --> H
    
    H --> I[Available for Kiosk Assignment]
    I --> J[159 Total Students]
    
    style D fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style E fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style F fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style H fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style I fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style J fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
```

## Implementation Status

### ✅ IMPLEMENTED
- Basic kiosk components exist (KioskOne, KioskTwo, KioskThree)
- Student database with grade level filtering
- Queue system foundation exists

### 🔄 PARTIALLY IMPLEMENTED
- Queue assignment logic needs refinement
- Auto-progression needs completion
- Student filtering by grade level needs validation

### ❌ NOT IMPLEMENTED
- Anonymous access for kiosk routes (remove ProtectedRoute)
- Automatic student assignment from queue
- Conflict prevention system
- Auto-progression after BSR completion

## Implementation Requirements

### 1. Remove Authentication Barriers
```typescript
// Update App.tsx routing
// Remove ProtectedRoute wrapper from kiosk routes
// Enable direct access to /kiosk1, /kiosk2, /kiosk3
```

### 2. Implement Queue-Based Assignment
```typescript
// Update kiosk components to auto-fetch next student
// Implement conflict prevention logic
// Add auto-progression after completion
```

### 3. Add Middle School Filtering
```typescript
// Filter students by grade_level (6, 7, 8)
// Ensure only middle school students appear in queue
// Validate total count of 159 students
```

### 4. Conflict Prevention
```typescript
// Implement session locking for student assignments
// Prevent multiple kiosks from getting same student
// Add real-time queue updates
```

## Simplified Architecture Benefits

### 🎯 Operational Simplicity
- **Static URLs**: Each iPad has fixed assignment (/kiosk1, /kiosk2, /kiosk3)
- **No Device Binding**: Removes complexity of dynamic device detection
- **Predictable Access**: Teachers know exactly which URL each iPad uses

### 🎯 Student Experience
- **No Authentication**: Students can immediately start their reflection
- **Automatic Assignment**: System assigns next student from queue
- **Clear Process**: One student per kiosk, clear progression

### 🎯 Teacher Management
- **Simple Setup**: Configure 3 iPads with 3 static URLs
- **Easy Monitoring**: Know which student is on which kiosk
- **Queue Visibility**: See all students waiting for reflection

## Cross-References
- **Implementation Details**: `SPRINT-02-LAUNCH/IMPLEMENTATION-CHECKLIST.md` items 2.1-2.4
- **Technical Context**: `SPRINT-02-LAUNCH/BX-OS-TECHNICAL-CONTEXT.md` Simplified Architecture
- **Current Problems**: `02-current-kiosk-logic.md`