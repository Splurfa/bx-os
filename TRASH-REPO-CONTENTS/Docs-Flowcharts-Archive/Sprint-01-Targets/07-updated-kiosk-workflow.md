# 🟢 Updated Kiosk Workflow (Dynamic Assignment)

**Status**: SPRINT DELIVERABLE - End-to-end student reflection workflow with device management

## Complete Student Journey Flow

<lov-mermaid>
flowchart TD
    A[Teacher Creates BSR] --> B[Student Added to Queue]
    B --> C[Admin Generates Kiosk URL]
    C --> D[Device Accesses Kiosk]
    D --> E[Auto-Student Assignment]
    E --> F[Student Authentication]
    F --> G[Reflection Questions]
    G --> H[Submission & Review]
    H --> I[Teacher Approval Process]
    I --> J[Next Student Auto-Assignment]
    
    K[Parallel: Real-time Updates] --> L[Teacher Notifications]
    K --> M[Admin Dashboard Updates]
    K --> N[Queue Status Changes]
    
    style E fill:#e8f5e8,stroke:#4caf50
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Kiosk Device Initialization & Student Assignment

<lov-mermaid>
sequenceDiagram
    participant A as Admin
    participant K as Kiosk Device
    participant DS as DeviceSession
    participant Q as Queue Manager
    participant S as Student
    participant T as Teacher

    A->>K: Navigate to generated kiosk URL
    K->>DS: Initialize device session
    DS->>DS: Validate session token
    DS->>Q: Request student assignment
    
    Q->>Q: Find next waiting student
    Q->>DS: Assign Student A to kiosk
    DS->>K: Display student welcome screen
    
    K->>S: "Welcome [Student Name]"
    S->>K: Proceed to authentication
    K->>K: Show birthday password prompt
    S->>K: Enter MMDD password
    
    alt Correct Password
        K->>K: Show reflection questions
        S->>K: Complete reflection
        K->>DS: Submit reflection data
        DS->>T: Notify teacher of submission
    else Incorrect Password
        K->>K: Show retry prompt
        Note over K: Max 3 attempts, then skip
    end
</lov-mermaid>

## Student Authentication & Security Flow

<lov-mermaid>
flowchart TD
    A[Student Approaches Kiosk] --> B[Kiosk Shows Student Name]
    B --> C[Birthday Password Prompt]
    C --> D[Student Enters MMDD]
    
    D --> E{Password Validation}
    E -->|Correct| F[Proceed to Reflection]
    E -->|Incorrect| G[Retry Counter]
    
    G --> H{Attempts < 3?}
    H -->|Yes| I[Show Retry Message]
    H -->|No| J[Skip Authentication]
    
    I --> C
    J --> K[Log Security Event]
    K --> F
    
    L[Security Features] --> M[Rate Limiting per Kiosk]
    L --> N[Attempt Logging]
    L --> O[Admin Notifications for Skips]
    
    style E fill:#e3f2fd,stroke:#1976d2
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#fff3e0,stroke:#f57c00
    style J fill:#fff3e0,stroke:#f57c00
    style K fill:#e3f2fd,stroke:#1976d2
    style M fill:#e3f2fd,stroke:#1976d2
    style N fill:#e3f2fd,stroke:#1976d2
    style O fill:#e3f2fd,stroke:#1976d2
</lov-mermaid>

## Reflection Question Flow

<lov-mermaid>
flowchart TD
    A[Authentication Success] --> B[Question 1: What Happened?]
    B --> C[Student Types Response]
    C --> D[Next Button → Question 2]
    
    D --> E[Question 2: How Did Others Feel?]
    E --> F[Student Response]
    F --> G[Next Button → Question 3]
    
    G --> H[Question 3: What Could You Do Differently?]
    H --> I[Student Response]
    I --> J[Next Button → Question 4]
    
    J --> K[Question 4: How Will You Prevent This?]
    K --> L[Student Response]
    L --> M[Mood Rating Slider]
    
    M --> N[Review Answers Screen]
    N --> O{Student Confirms?}
    O -->|Yes| P[Submit Reflection]
    O -->|No| Q[Edit Previous Answers]
    
    P --> R[Success Message]
    R --> S[Auto-Clear & Next Student]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style E fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style P fill:#e8f5e8,stroke:#4caf50
    style S fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Real-Time Teacher Notification System

<lov-mermaid>
sequenceDiagram
    participant S as Student
    participant K as Kiosk
    participant DB as Database
    participant N as NotificationSystem
    participant T as Teacher Dashboard
    participant B as NotificationBell

    S->>K: Submit reflection
    K->>DB: Store reflection data
    DB->>N: Trigger notification event
    
    N->>T: Real-time update via Supabase subscription
    T->>B: Update notification count
    B->>B: Show badge with new count
    
    T->>T: Update queue display
    Note over T: Show "Pending Review" status
    
    alt Teacher is Active
        T->>T: Auto-refresh reflection list
        T->>T: Highlight new submission
    else Teacher is Away
        N->>N: Store notification for later
        Note over N: Badge persists until viewed
    end
</lov-mermaid>

## Teacher Review & Approval Process

<lov-mermaid>
flowchart TD
    A[Teacher Sees Notification] --> B[Open Reflection Review]
    B --> C[Read Student Responses]
    C --> D[View Mood Rating]
    D --> E[Teacher Decision]
    
    E --> F{Approve or Request Changes?}
    F -->|Approve| G[Mark as Approved]
    F -->|Need Changes| H[Request Revision]
    
    G --> I[Archive to Behavior History]
    I --> J[Notify Family (Optional)]
    J --> K[Clear from Queue]
    
    H --> L[Add Teacher Feedback]
    L --> M[Student Gets Revision Request]
    M --> N[Return to Kiosk Queue]
    N --> O[Next Kiosk Assignment]
    
    style C fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style L fill:#fff3e0,stroke:#f57c00
    style M fill:#fff3e0,stroke:#f57c00
    style O fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Automatic Queue Management

<lov-mermaid>
flowchart TD
    A[Reflection Submitted] --> B[Clear Kiosk Assignment]
    B --> C[Update Behavior Request Status]
    C --> D[Check Queue for Waiting Students]
    
    D --> E{More Students Waiting?}
    E -->|Yes| F[Auto-Assign Next Student]
    E -->|No| G[Kiosk Shows Waiting Screen]
    
    F --> H[Update Kiosk Display]
    H --> I[Show New Student Name]
    I --> J[Start Authentication Flow]
    
    G --> K[Monitor for New BSRs]
    K --> L[Real-time Queue Updates]
    L --> M[Auto-Assignment When Available]
    
    N[Admin Controls] --> O[Force Clear Assignment]
    N --> P[Manually Assign Student]
    N --> Q[Deactivate Kiosk]
    
    style F fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Kiosk State Management

<lov-mermaid>
stateDiagram-v2
    [*] --> Connecting : Device starts up
    Connecting --> Active : Session validated
    Connecting --> Error : Invalid session
    
    Active --> StudentAssigned : Auto-assignment
    Active --> Waiting : No students in queue
    
    StudentAssigned --> Authentication : Student present
    Authentication --> Reflection : Password correct
    Authentication --> Retry : Password incorrect
    Retry --> Authentication : Retry attempt
    Retry --> Skip : Max attempts reached
    Skip --> Reflection : Continue without auth
    
    Reflection --> Submission : Questions completed
    Submission --> Processing : Data being saved
    Processing --> Success : Save successful
    Processing --> Error : Save failed
    
    Success --> Active : Clear assignment, check queue
    Waiting --> StudentAssigned : New BSR added
    
    Error --> Retry : Recoverable error
    Error --> Offline : Critical error
    Offline --> Connecting : Admin reset
</lov-mermaid>

## Admin Monitoring & Control Interface

<lov-mermaid>
flowchart TD
    A[Admin Dashboard] --> B[Kiosk Status Panel]
    B --> C[Real-time Device Status]
    B --> D[Current Assignments]
    B --> E[Queue Overview]
    
    C --> F[Online/Offline Status]
    C --> G[Last Heartbeat Time]
    C --> H[Device Information]
    
    D --> I[Current Student Name]
    D --> J[Reflection Progress]
    D --> K[Time on Task]
    
    E --> L[Students Waiting Count]
    E --> M[Average Wait Time]
    E --> N[Recent Completions]
    
    O[Admin Actions] --> P[Generate New Kiosk URL]
    O --> Q[Force Clear Assignment]
    O --> R[Deactivate Device]
    O --> S[Send Message to Kiosk]
    
    style F fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style P fill:#e8f5e8,stroke:#4caf50
    style Q fill:#fff3e0,stroke:#f57c00
    style R fill:#ffebee,stroke:#d32f2f
</lov-mermaid>

## Error Handling & Recovery

<lov-mermaid>
flowchart TD
    A[Kiosk Error Detected] --> B{Error Type}
    
    B -->|Network Disconnection| C[Show Reconnecting Message]
    B -->|Session Expired| D[Show Session Invalid Message]
    B -->|Database Error| E[Show Temporary Unavailable]
    B -->|Student Data Error| F[Skip to Manual Entry]
    
    C --> G[Attempt Reconnection]
    G --> H{Reconnection Success?}
    H -->|Yes| I[Resume Previous State]
    H -->|No| J[Show Admin Contact Info]
    
    D --> K[Require New Session from Admin]
    E --> L[Retry with Backoff]
    F --> M[Admin Notification]
    
    N[Recovery Actions] --> O[Auto-Save Progress]
    N --> P[Queue State Preservation]
    N --> Q[Graceful Degradation]
    
    style C fill:#fff3e0,stroke:#f57c00
    style D fill:#ffebee,stroke:#d32f2f
    style E fill:#fff3e0,stroke:#f57c00
    style I fill:#e8f5e8,stroke:#4caf50
    style O fill:#e3f2fd,stroke:#1976d2
    style P fill:#e3f2fd,stroke:#1976d2
    style Q fill:#e3f2fd,stroke:#1976d2
</lov-mermaid>

## Implementation Status

### ❌ **NOT IMPLEMENTED** - Required for Sprint
- **Auto-student assignment**: Automatic queue processing and kiosk assignment
- **Device session validation**: Secure device binding and session management
- **Birthday authentication**: Student password verification system
- **Real-time notifications**: Teacher notification system for submissions
- **Queue management system**: Automatic student progression through queue
- **Error recovery mechanisms**: Robust error handling and recovery

### 🔄 **PARTIALLY IMPLEMENTED** - Needs Enhancement
- **Kiosk components**: Basic KioskOne/Two/Three exist, need UniversalKiosk replacement
- **Student reflection flow**: Basic reflection questions exist, need workflow integration
- **NotificationBell**: Component exists but dropdown interactions need fixing
- **Queue display**: Basic queue shows but needs proper student status management

### ✅ **IMPLEMENTED** - Foundation Ready
- **Database schema**: Behavior requests, reflections, students tables ready
- **Basic reflection forms**: Question components and submission logic exist
- **Teacher dashboard**: Basic structure exists for review interface
- **Real-time infrastructure**: Supabase subscriptions ready for use

## Sprint Deliverable Summary

### 🟢 Enhanced Student Experience
- **Seamless Assignment**: Automatic student assignment upon kiosk access
- **Clear Authentication**: Birthday-based verification with fallback options
- **Intuitive Flow**: Step-by-step reflection questions with progress indication
- **Immediate Feedback**: Success confirmation and automatic transition

### 🟢 Improved Teacher Workflow  
- **Real-time Notifications**: Instant alerts for new reflection submissions
- **Streamlined Review**: Enhanced review interface with approval/revision options
- **Better Visibility**: Clear queue status and student progress tracking
- **Automated Processing**: Reduced manual intervention required

### 🟢 Robust Admin Control
- **Device Management**: Full control over kiosk devices and sessions
- **Queue Oversight**: Real-time visibility into student assignments and progress
- **Error Recovery**: Comprehensive error handling and recovery mechanisms
- **Performance Monitoring**: Device status, heartbeat, and usage analytics

### 🟢 Technical Improvements
- **Conflict Prevention**: Single device per kiosk enforcement
- **State Management**: Robust state tracking and recovery
- **Real-time Updates**: Live synchronization between devices and dashboards
- **Security**: Enhanced authentication and session management