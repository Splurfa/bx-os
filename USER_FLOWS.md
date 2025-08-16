# 👥 User Flows & Wireframe Documentation

## Overview
This document provides comprehensive wireframe-style user journey diagrams for all user roles in the Student Behavior Management System, including detailed interaction flows and UI patterns.

---

## 🎯 User Role Overview

<lov-mermaid>
mindmap
  root((User Roles))
    Teachers
      Create BSRs
      Monitor Queue
      Review Reflections
      Provide Feedback
    Students
      Kiosk Login
      Complete Reflections
      Submit Responses
      Receive Feedback
    Administrators
      User Management
      System Monitoring
      Data Analytics
      Kiosk Management
    System
      Queue Processing
      Auto-assignment
      Real-time Updates
      Data Archival
</lov-mermaid>

---

## 📚 Teacher User Journey

### Complete Teacher Workflow

<lov-mermaid>
journey
    title Teacher Complete Daily Workflow
    section Authentication
      Navigate to system     : 5: Teacher
      Enter credentials      : 4: Teacher
      Access teacher dashboard: 5: Teacher
    section Morning Preparation
      Review overnight queue : 4: Teacher
      Check kiosk status     : 3: Teacher
      Plan for behavior incidents: 4: Teacher
    section Incident Management
      Identify behavior issue: 2: Teacher
      Open BSR creation modal: 5: Teacher
      Select student from list: 4: Teacher
      Choose behavior categories: 4: Teacher
      Set mood/urgency level : 3: Teacher
      Add contextual notes   : 4: Teacher
      Submit behavior request: 5: Teacher
    section Queue Monitoring
      Monitor live queue     : 4: Teacher
      Check student progress : 4: Teacher
      Handle urgent cases    : 3: Teacher
    section Reflection Review
      Receive notification   : 5: Teacher
      Open reflection viewer : 5: Teacher
      Read student responses : 4: Teacher
      Evaluate thoughtfulness: 3: Teacher
      Decide approve/revise  : 4: Teacher
      Provide constructive feedback: 5: Teacher
    section End of Day
      Review completed cases : 3: Teacher
      Export daily reports   : 2: Teacher
      Sign out of system     : 5: Teacher
</lov-mermaid>

### Teacher Dashboard Interface Flow

<lov-mermaid>
flowchart TD
    A[Teacher Login] --> B[Dashboard Landing]
    B --> C{Queue Status}
    C -->|Empty| D[Show Empty State]
    C -->|Has Items| E[Display Queue List]
    
    B --> F[FAB: Create BSR]
    F --> G[Student Selection Modal]
    G --> H[Behavior Category Selection]
    H --> I[Mood & Notes Input]
    I --> J[Submit BSR]
    J --> K[Success Toast]
    K --> E
    
    E --> L[Queue Item Click]
    L --> M{Item Status}
    M -->|Waiting| N[Show Wait Time]
    M -->|In Progress| O[Show Kiosk Info]
    M -->|Review| P[Open Reflection Viewer]
    
    P --> Q[Review Interface]
    Q --> R{Decision}
    R -->|Approve| S[Mark Complete]
    R -->|Revise| T[Feedback Modal]
    
    S --> U[Archive Notification]
    T --> V[Send Revision Request]
    V --> W[Student Notified]
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style Q fill:#e8f5e8
    style S fill:#c8e6c9
    style T fill:#fff3e0
</lov-mermaid>

### BSR Creation Wireframe Flow

<lov-mermaid>
stateDiagram-v2
    [*] --> StudentSearch : Click "Create BSR"
    StudentSearch --> BehaviorSelection : Select student
    BehaviorSelection --> MoodAssessment : Choose behaviors
    MoodAssessment --> NotesEntry : Set mood level
    NotesEntry --> UrgencyCheck : Add notes
    UrgencyCheck --> ReviewConfirm : Mark urgent if needed
    ReviewConfirm --> Submit : Confirm details
    Submit --> Success : BSR created
    Success --> [*] : Return to dashboard
    
    StudentSearch --> StudentSearch : Search/filter students
    BehaviorSelection --> BehaviorSelection : Multi-select behaviors
    NotesEntry --> NotesEntry : Optional context
    ReviewConfirm --> StudentSearch : Edit details
    
    note right of StudentSearch : Auto-complete search\nRecent students list
    note right of BehaviorSelection : Pre-defined categories\nCustom behavior option
    note right of MoodAssessment : 1-10 slider scale\nColor-coded indicators
    note right of Success : Live queue update\nAuto-assignment check
</lov-mermaid>

---

## 🏫 Student Kiosk Journey

### Complete Student Experience

<lov-mermaid>
journey
    title Student Kiosk Experience Journey
    section Arrival at Kiosk
      Approach kiosk station: 2: Student
      See welcome screen     : 4: Student  
      Read assignment message: 3: Student
    section Authentication
      Enter student ID       : 3: Student
      Enter password        : 3: Student
      Access granted        : 5: Student
    section Reflection Introduction
      Read instructions     : 4: Student
      Understand expectations: 4: Student
      Begin reflection process: 4: Student
    section Question Progression
      Read question 1       : 4: Student
      Think about response  : 3: Student
      Type thoughtful answer: 4: Student
      Move to question 2    : 5: Student
      Continue through all 4: 4: Student
    section Review & Submit
      Review all answers    : 5: Student
      Make final edits      : 4: Student
      Submit reflection     : 5: Student
      See success confirmation: 5: Student
    section Return to Class
      Receive instructions  : 5: Student
      Leave kiosk area      : 5: Student
      Return to classroom   : 4: Student
</lov-mermaid>

### Kiosk Interface State Machine

<lov-mermaid>
stateDiagram-v2
    [*] --> Setup : Kiosk initialized
    Setup --> Waiting : No students assigned
    Setup --> Welcome : Student assigned
    
    Waiting --> Welcome : Student assignment
    Welcome --> Password : Student approaches
    
    Password --> Welcome : Invalid credentials
    Password --> Reflection : Valid login
    
    Reflection --> Question1 : Start reflection
    Question1 --> Question2 : Answer complete
    Question2 --> Question3 : Answer complete
    Question3 --> Question4 : Answer complete
    Question4 --> Review : Answer complete
    
    Review --> Question1 : Edit previous
    Review --> Question2 : Edit previous
    Review --> Question3 : Edit previous
    Review --> Question4 : Edit previous
    Review --> Submit : Confirm submission
    
    Submit --> Completed : Success
    Completed --> Welcome : Next student ready
    Completed --> Waiting : No students queued
    
    note right of Setup : System check\nConnection verify
    note right of Welcome : Display student name\nShow kiosk number
    note right of Password : Secure authentication\nInvalid attempts locked
    note right of Reflection : Progress indicator\n4-step process
    note right of Completed : Success animation\nReturn instructions
</lov-mermaid>

### Kiosk Screen Wireframes

<lov-mermaid>
flowchart LR
    subgraph "Welcome Screen"
        A1[Header: Kiosk 1]
        A2["Welcome [Student Name]"]
        A3[Please tap to continue]
        A4[Kiosk status indicator]
    end
    
    subgraph "Login Screen"
        B1[Enter Student ID]
        B2[Enter Password]
        B3[Show/Hide Password]
        B4[Login Button]
        B5[Error Messages]
    end
    
    subgraph "Reflection Screen"
        C1[Progress: Step X of 4]
        C2[Question Text]
        C3[Helper Text]
        C4[Large Text Area]
        C5[Previous/Next Buttons]
        C6[Character Counter]
    end
    
    subgraph "Review Screen"
        D1[Review Your Answers]
        D2[Question 1 Summary]
        D3[Question 2 Summary]
        D4[Question 3 Summary]
        D5[Question 4 Summary]
        D6[Edit/Submit Buttons]
    end
    
    A1 --> B1 : Tap screen
    B4 --> C1 : Valid login
    C5 --> D1 : Complete all
    D6 --> E1 : Submit
    
    subgraph "Success Screen"
        E1[Success Animation]
        E2[Thank you message]
        E3[Return to class]
        E4[Next student prompt]
    end
    
    style A1 fill:#e1f5fe
    style B1 fill:#f3e5f5
    style C1 fill:#e8f5e8
    style D1 fill:#fff3e0
    style E1 fill:#c8e6c9
</lov-mermaid>

---

## 👨‍💼 Administrator User Journey

### Admin Complete Workflow

<lov-mermaid>
journey
    title Administrator Daily Workflow
    section System Health Check
      Login to admin dashboard: 5: Admin
      Review system status    : 5: Admin
      Check active sessions   : 4: Admin
      Monitor kiosk status    : 4: Admin
      Review error logs       : 3: Admin
    section User Management
      Check new user requests : 4: Admin
      Create teacher accounts : 5: Admin
      Assign user roles       : 4: Admin
      Deactivate old accounts : 3: Admin
      Reset user passwords    : 2: Admin
    section Data Management
      Run daily reports       : 4: Admin
      Export behavior data    : 3: Admin
      Archive old records     : 2: Admin
      Backup system data      : 4: Admin
    section System Configuration
      Update kiosk settings   : 3: Admin
      Modify user permissions : 3: Admin
      Configure system alerts : 4: Admin
      Test emergency procedures: 2: Admin
    section Analytics Review
      Analyze usage patterns : 5: Admin
      Review behavior trends  : 5: Admin
      Generate monthly reports: 4: Admin
      Plan system improvements: 5: Admin
</lov-mermaid>

### Admin Dashboard Navigation Flow

<lov-mermaid>
flowchart TD
    A[Admin Login] --> B[Admin Dashboard]
    
    B --> C[User Management]
    B --> D[System Monitoring]
    B --> E[Data Analytics]
    B --> F[Kiosk Management]
    B --> G[System Settings]
    
    C --> C1[Create New User]
    C --> C2[Edit User Roles]
    C --> C3[Deactivate Users]
    C --> C4[Reset Passwords]
    
    D --> D1[Active Sessions]
    D --> D2[System Health]
    D --> D3[Error Logs]
    D --> D4[Performance Metrics]
    
    E --> E1[Usage Reports]
    E --> E2[Behavior Analytics]
    E --> E3[Export Data]
    E --> E4[Trend Analysis]
    
    F --> F1[Kiosk Status]
    F --> F2[Activate/Deactivate]
    F --> F3[Assignment Rules]
    F --> F4[Kiosk Configuration]
    
    G --> G1[System Configuration]
    G --> G2[Email Settings]
    G --> G3[Security Policies]
    G --> G4[Backup Settings]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#ffecb3
    style F fill:#f8bbd9
    style G fill:#d1c4e9
</lov-mermaid>

### User Management Interface Flow

<lov-mermaid>
sequenceDiagram
    participant A as Admin
    participant UI as Admin Interface
    participant S as Supabase
    participant E as Edge Function
    
    A->>UI: Navigate to User Management
    UI->>S: Fetch all users
    S-->>UI: Return user list
    UI-->>A: Display user table
    
    A->>UI: Click "Create User"
    UI-->>A: Show creation modal
    A->>UI: Fill user details
    A->>UI: Click "Create"
    UI->>E: Call create-user function
    E->>S: Create auth user
    E->>S: Create profile record
    S-->>E: Confirm creation
    E-->>UI: Return success
    UI-->>A: Show success message
    UI->>S: Refresh user list
    S-->>UI: Updated users
    UI-->>A: Update table display
</lov-mermaid>

---

## 🔄 Cross-User Interaction Flows

### Complete System Interaction

<lov-mermaid>
sequenceDiagram
    participant T as Teacher
    participant S as System
    participant K as Kiosk
    participant St as Student
    participant A as Admin
    
    Note over T,A: Morning System Startup
    A->>S: Activate kiosks
    S-->>K: Kiosk ready status
    T->>S: Login and check queue
    S-->>T: Show empty queue
    
    Note over T,A: Incident Occurs
    T->>S: Create BSR for student
    S->>S: Process queue assignment
    S-->>K: Assign student to kiosk
    S-->>T: Confirm BSR created
    S-->>A: Update system metrics
    
    Note over T,A: Student Interaction
    St->>K: Approach assigned kiosk
    K-->>St: Show welcome screen
    St->>K: Login with credentials
    K->>S: Validate student
    S-->>K: Grant access
    K-->>St: Start reflection
    St->>K: Complete all questions
    K->>S: Submit reflection
    S-->>T: Notify teacher (real-time)
    S-->>A: Update completion stats
    
    Note over T,A: Teacher Review
    T->>S: Review reflection
    T->>S: Approve/Request revision
    S->>S: Archive or mark for revision
    S-->>K: Update kiosk availability
    S-->>A: Update analytics
    
    Note over T,A: System Cleanup
    S->>S: Auto-assign next student
    A->>S: Monitor system health
    S-->>A: System status report
</lov-mermaid>

### Real-time Update Flow

<lov-mermaid>
flowchart TD
    A[User Action] --> B[Database Update]
    B --> C[Real-time Trigger]
    C --> D[Supabase Channels]
    
    D --> E[Teacher Dashboard]
    D --> F[Admin Dashboard] 
    D --> G[Kiosk Interface]
    D --> H[System Monitoring]
    
    E --> I[Queue Updates]
    E --> J[Reflection Notifications]
    E --> K[Status Changes]
    
    F --> L[User Activity]
    F --> M[System Metrics]
    F --> N[Error Alerts]
    
    G --> O[Assignment Updates]
    G --> P[Student Login Events]
    G --> Q[Availability Changes]
    
    H --> R[Performance Metrics]
    H --> S[Health Checks]
    H --> T[Audit Logs]
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style I fill:#e8f5e8
    style L fill:#fff3e0
    style O fill:#ffecb3
    style R fill:#f8bbd9
</lov-mermaid>

---

## 📱 Responsive Design Patterns

### Mobile-First Navigation

<lov-mermaid>
flowchart LR
    subgraph "Mobile Layout"
        A1[Hamburger Menu]
        A2[Collapsible Navigation]
        A3[Bottom Tab Bar]
        A4[Swipe Gestures]
    end
    
    subgraph "Tablet Layout"
        B1[Side Navigation]
        B2[Split View]
        B3[Modal Dialogs]
        B4[Touch Targets]
    end
    
    subgraph "Desktop Layout"
        C1[Full Navigation]
        C2[Multi-panel View]
        C3[Hover States]
        C4[Keyboard Shortcuts]
    end
    
    A1 --> B1 : Expand to tablet
    B1 --> C1 : Expand to desktop
    A3 --> B2 : Transform layout
    B2 --> C2 : Add panels
    
    style A1 fill:#e1f5fe
    style B1 fill:#f3e5f5
    style C1 fill:#e8f5e8
</lov-mermaid>

### Component Responsiveness

<lov-mermaid>
graph TB
    subgraph "Queue Display Component"
        A1[Mobile: Card Stack]
        A2[Tablet: 2-Column Grid]
        A3[Desktop: Table View]
    end
    
    subgraph "BSR Modal Component"
        B1[Mobile: Full Screen]
        B2[Tablet: Large Modal]
        B3[Desktop: Centered Modal]
    end
    
    subgraph "Kiosk Interface"
        C1[Mobile: Not Supported]
        C2[Tablet: Full Screen]
        C3[Desktop: Kiosk Mode]
    end
    
    A1 -->|768px+| A2
    A2 -->|1024px+| A3
    B1 -->|768px+| B2
    B2 -->|1024px+| B3
    C2 -->|1024px+| C3
    
    style A1 fill:#e1f5fe
    style B1 fill:#f3e5f5
    style C2 fill:#e8f5e8
</lov-mermaid>

---

## 🎨 UI/UX Design Patterns

### Color-Coded System States

<lov-mermaid>
pie title System Status Colors
    "Waiting (Blue)" : 35
    "In Progress (Yellow)" : 25
    "Review (Orange)" : 20
    "Completed (Green)" : 15
    "Error (Red)" : 5
</lov-mermaid>

### Interactive Element Hierarchy

<lov-mermaid>
graph TD
    A[Primary Actions] --> A1[Create BSR]
    A --> A2[Submit Reflection]
    A --> A3[Approve/Deny]
    
    B[Secondary Actions] --> B1[Edit Details]
    B --> B2[View History]
    B --> B3[Export Data]
    
    C[Tertiary Actions] --> C1[Filter/Sort]
    C --> C2[Settings]
    C --> C3[Help/Info]
    
    style A fill:#2196F3
    style A1 fill:#2196F3
    style A2 fill:#2196F3
    style A3 fill:#2196F3
    
    style B fill:#FF9800
    style B1 fill:#FF9800
    style B2 fill:#FF9800
    style B3 fill:#FF9800
    
    style C fill:#9E9E9E
    style C1 fill:#9E9E9E
    style C2 fill:#9E9E9E
    style C3 fill:#9E9E9E
</lov-mermaid>

---

## 🔍 Error Handling & User Feedback

### Error State Flow

<lov-mermaid>
flowchart TD
    A[User Action] --> B{Action Valid?}
    B -->|Yes| C[Process Action]
    B -->|No| D[Client Validation Error]
    
    C --> E{Server Response}
    E -->|Success| F[Show Success State]
    E -->|Error| G[Show Error State]
    
    D --> H[Inline Error Message]
    G --> I[Toast Notification]
    
    H --> J[Prevent Form Submission]
    I --> K[Allow Retry Action]
    
    F --> L[Update UI State]
    K --> A
    J --> M[Fix Validation Issues]
    M --> A
    
    style A fill:#e1f5fe
    style D fill:#ffcdd2
    style G fill:#ffcdd2
    style F fill:#c8e6c9
    style H fill:#fff3e0
    style I fill:#fff3e0
</lov-mermaid>

### Loading State Patterns

<lov-mermaid>
stateDiagram-v2
    [*] --> Idle : Initial state
    Idle --> Loading : User action
    Loading --> Success : Data received
    Loading --> Error : Request failed
    Success --> Idle : User continues
    Error --> Idle : User acknowledges
    Error --> Loading : User retries
    
    note right of Loading : Show spinner\nDisable controls
    note right of Success : Update content\nHide loading indicators
    note right of Error : Show error message\nEnable retry options
</lov-mermaid>

---

## 🚀 Performance & Accessibility

### Loading Performance Targets

<lov-mermaid>
gantt
    title Performance Optimization Timeline
    dateFormat X
    axisFormat %s
    
    section Initial Load
    HTML Parse       :0, 200
    CSS Load         :0, 300
    JS Parse         :200, 500
    React Hydration  :500, 800
    
    section Data Loading
    Auth Check       :300, 600
    Profile Fetch    :600, 900
    Queue Data       :900, 1200
    
    section Interactive
    First Paint      :milestone, 500, 0
    First Contentful :milestone, 800, 0
    Time to Interactive :milestone, 1200, 0
</lov-mermaid>

### Accessibility Compliance

- **WCAG 2.1 AA**: Full compliance target
- **Screen Reader**: Compatible with all interfaces
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy

---

## 📊 Analytics & Monitoring Points

### User Journey Analytics

<lov-mermaid>
flowchart LR
    A[Page Views] --> B[User Actions]
    B --> C[Conversion Funnels]
    C --> D[Drop-off Points]
    
    E[Error Tracking] --> F[Performance Metrics]
    F --> G[User Satisfaction]
    G --> H[System Health]
    
    A --> I[Dashboard Views]
    A --> J[Modal Opens]
    A --> K[Form Submissions]
    
    E --> L[Failed Logins]
    E --> M[API Errors]
    E --> N[Timeout Issues]
    
    style A fill:#e1f5fe
    style E fill:#ffcdd2
    style C fill:#e8f5e8
    style G fill:#c8e6c9
</lov-mermaid>

---

*Last Updated: $(date)*
*User Flow Version: 2.1*