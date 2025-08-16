# 🏗️ System Architecture Documentation

## Overview
This document outlines the complete system architecture for the Student Behavior Management System, including component interactions, authentication flows, and user journey mappings.

---

## 🎯 System Architecture Overview

<lov-mermaid>
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[Authentication Layer]
        B[Teacher Dashboard]
        C[Student Kiosk Interface]
        D[Admin Dashboard]
        E[Shared Components]
    end
    
    subgraph "Backend (Supabase)"
        F[Auth Service]
        G[Database (PostgreSQL)]
        H[Edge Functions]
        I[Real-time Subscriptions]
        J[Row Level Security]
    end
    
    subgraph "External Services"
        K[Email Service]
        L[Monitoring/Analytics]
    end
    
    A --> F
    B --> G
    C --> G
    D --> G
    F --> G
    H --> G
    G --> I
    J --> G
    F --> K
    B --> L
    D --> L
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style G fill:#e8f5e8
    style H fill:#fff3e0
</lov-mermaid>

---

## 🔐 Authentication & Authorization Flow

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant A as Auth Page
    participant S as Supabase Auth
    participant D as Dashboard
    participant P as Profile Service
    
    U->>A: Navigate to /auth
    A->>A: Check existing session
    alt No existing session
        U->>A: Enter credentials
        A->>S: signIn(email, password)
        S-->>A: Session + User data
        A->>P: Fetch user profile
        P-->>A: Profile with role
        alt Teacher role
            A->>D: Redirect to /teacher
        else Admin role
            A->>D: Redirect to /admin-dashboard
        end
    else Existing session
        A->>P: Validate session
        P-->>A: Current user role
        A->>D: Auto-redirect to dashboard
    end
    
    Note over S: RLS policies enforce<br/>data access based on role
</lov-mermaid>

---

## 🧩 Component Architecture

<lov-mermaid>
graph TD
    subgraph "Context Providers"
        AC[AuthContext]
        KC[KioskContext]
        QC[QueryClient]
        TC[TooltipProvider]
    end
    
    subgraph "Page Components"
        AP[AuthPage]
        TD[TeacherDashboard]
        AD[AdminDashboard]
        K1[KioskOne]
        K2[KioskTwo]
        K3[KioskThree]
    end
    
    subgraph "Feature Components"
        QD[QueueDisplay] 
        BM[BSRModal]
        RR[ReviewReflection]
        UM[UserManagement]
        SM[SessionMonitor]
        RT[RealTimeStatus]
    end
    
    subgraph "UI Components"
        BU[Button]
        CA[Card]
        IN[Input]
        TA[Table]
        DI[Dialog]
        TO[Toast]
    end
    
    subgraph "Custom Hooks"
        UQ[useSupabaseQueue]
        US[useStudents]
        UP[useProfile]
        UA[useActiveSessions]
        UB[useBehaviorHistory]
    end
    
    AC --> AP
    AC --> TD
    AC --> AD
    KC --> K1
    KC --> K2
    KC --> K3
    
    TD --> QD
    TD --> BM
    TD --> RR
    AD --> UM
    AD --> SM
    
    QD --> UQ
    BM --> US
    RR --> UQ
    UM --> UA
    SM --> UB
    
    QD --> CA
    BM --> DI
    RR --> BU
    UM --> TA
    
    style AC fill:#e1f5fe
    style KC fill:#f3e5f5
    style UQ fill:#e8f5e8
    style US fill:#fff3e0
</lov-mermaid>

---

## 📱 Application Flow Diagram

<lov-mermaid>
flowchart TD
    A[User Access] --> B{Authenticated?}
    B -->|No| C[Auth Page]
    B -->|Yes| D{Role Check}
    
    C --> E[Login Form]
    E --> F{Valid Credentials?}
    F -->|No| G[Show Error]
    F -->|Yes| H[Create Session]
    G --> E
    H --> D
    
    D -->|Teacher| I[Teacher Dashboard]
    D -->|Admin| J[Admin Dashboard]
    D -->|Invalid| K[Access Denied]
    
    I --> L[Queue Management]
    I --> M[Student Selection]
    I --> N[Review Reflections]
    
    J --> O[User Management]
    J --> P[System Monitoring] 
    J --> Q[Kiosk Management]
    J --> R[Data Analytics]
    
    L --> S[Create BSR]
    S --> T[Add to Queue]
    T --> U{Kiosk Available?}
    U -->|Yes| V[Auto-assign Student]
    U -->|No| W[Queue Position]
    
    V --> X[Student Kiosk Flow]
    W --> Y[Wait for Kiosk]
    Y --> V
    
    X --> Z[Student Login]
    Z --> AA[Reflection Questions]
    AA --> BB[Submit Reflection]
    BB --> N
    
    N --> CC{Approve?}
    CC -->|Yes| DD[Mark Complete]
    CC -->|No| EE[Request Revision]
    
    DD --> FF[Archive to History]
    EE --> GG[Save Revision Note]
    GG --> AA
    
    style A fill:#e1f5fe
    style I fill:#f3e5f5
    style J fill:#e8f5e8
    style X fill:#fff3e0
</lov-mermaid>

---

## 🎓 Student Kiosk Interaction Flow

<lov-mermaid>
stateDiagram-v2
    [*] --> Setup : Kiosk starts
    Setup --> Welcome : Student assigned
    Welcome --> Password : Student approaches
    Password --> Reflection : Valid credentials
    Password --> Password : Invalid credentials
    Reflection --> Question1 : Start reflection
    Question1 --> Question2 : Answer Q1
    Question2 --> Question3 : Answer Q2
    Question3 --> Question4 : Answer Q3
    Question4 --> Review : Answer Q4
    Review --> Submit : Confirm answers
    Submit --> Completed : Successful submission
    Completed --> Welcome : Next student
    
    note right of Setup : Checking for assigned students
    note right of Welcome : Display student name
    note right of Password : Enter student ID + password
    note right of Reflection : Guided question flow
    note right of Completed : Show success message
</lov-mermaid>

---

## 🔄 Real-time Data Synchronization

<lov-mermaid>
sequenceDiagram
    participant T as Teacher Dashboard
    participant S as Supabase
    participant K as Kiosk Interface
    participant A as Admin Dashboard
    
    Note over S: Real-time subscriptions active
    
    T->>S: Create behavior request
    S-->>T: Confirm creation
    S-->>A: Notify new request (real-time)
    S-->>K: Check for assignment (real-time)
    
    alt Student assigned to kiosk
        S-->>K: Show student assignment
        K->>S: Student logs in
        S-->>T: Update status (real-time)
        S-->>A: Update dashboard (real-time)
    end
    
    K->>S: Submit reflection
    S-->>T: New reflection ready (real-time)
    S-->>A: Update metrics (real-time)
    
    T->>S: Approve/Request revision
    S-->>K: Update status (if revision)
    S-->>A: Update completion stats (real-time)
</lov-mermaid>

---

## 🛠️ Custom Hooks Architecture

### Queue Management Hook (`useSupabaseQueue`)

<lov-mermaid>
graph LR
    A[useSupabaseQueue] --> B[Behavior Requests]
    A --> C[Reflections]
    A --> D[Students Data]
    A --> E[Real-time Updates]
    
    B --> F[addToQueue]
    B --> G[updateStatus]
    C --> H[submitReflection]
    C --> I[approveReflection]
    C --> J[requestRevision]
    D --> K[Student Selection]
    E --> L[Live Queue Updates]
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style H fill:#e8f5e8
    style I fill:#fff3e0
</lov-mermaid>

### Kiosk Management Hook (`useKiosks`)

<lov-mermaid>
graph LR
    A[useKiosks] --> B[Kiosk Status]
    A --> C[Student Assignment]
    A --> D[Queue Integration]
    
    B --> E[activateKiosk]
    B --> F[deactivateKiosk]
    C --> G[assignStudent]
    C --> H[updateKioskStudent]
    D --> I[getFirstWaiting]
    D --> J[updateKioskStatus]
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style G fill:#e8f5e8
    style I fill:#fff3e0
</lov-mermaid>

---

## 📊 Data Flow Patterns

### Teacher Workflow

<lov-mermaid>
journey
    title Teacher Daily Workflow
    section Morning Setup
      Login to System        : 5: Teacher
      Review Overnight Queue : 4: Teacher
      Activate Kiosks       : 3: Teacher
    section During Class
      Create Behavior Request: 5: Teacher
      Monitor Queue Status  : 4: Teacher
      Handle Urgent Cases   : 3: Teacher
    section Review Period
      Review Reflections    : 5: Teacher
      Provide Feedback      : 4: Teacher
      Approve/Request Revisions: 5: Teacher
    section End of Day
      Archive Completed Cases: 3: Teacher
      Generate Reports      : 2: Teacher
      System Logout         : 5: Teacher
</lov-mermaid>

### Student Kiosk Experience

<lov-mermaid>
journey
    title Student Kiosk Experience
    section Arrival
      Approach Kiosk       : 2: Student
      See Welcome Message  : 4: Student
      Enter Credentials    : 3: Student
    section Reflection Process
      Read Question 1      : 3: Student
      Provide Thoughtful Answer: 4: Student
      Progress Through Questions: 4: Student
      Review All Answers   : 5: Student
    section Completion
      Submit Reflection    : 4: Student
      See Success Message  : 5: Student
      Return to Class      : 5: Student
</lov-mermaid>

### Admin Monitoring Flow

<lov-mermaid>
journey
    title Admin Monitoring Workflow
    section System Health
      Check Active Sessions: 5: Admin
      Monitor Kiosk Status : 5: Admin
      Review Error Logs    : 3: Admin
    section User Management
      Create New Users     : 4: Admin
      Manage User Roles    : 3: Admin
      Handle Access Issues : 2: Admin
    section Data Analysis
      Generate Usage Reports: 4: Admin
      Analyze Behavior Trends: 5: Admin
      Export Data for Review: 3: Admin
    section System Maintenance
      Clear Old Data       : 2: Admin
      Update System Settings: 3: Admin
      Backup Configuration : 4: Admin
</lov-mermaid>

---

## 🔌 API Integration Patterns

### Supabase Client Configuration

```typescript
// Client configuration with optimal settings
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: localStorage,        // Persistent sessions
      persistSession: true,         // Maintain login state
      autoRefreshToken: true,       // Automatic token refresh
    },
    realtime: {
      params: {
        eventsPerSecond: 10         // Rate limiting
      }
    }
  }
);
```

### Real-time Subscription Pattern

```typescript
// Queue monitoring with real-time updates
useEffect(() => {
  const subscription = supabase
    .channel('behavior_requests_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'behavior_requests',
        filter: `teacher_id=eq.${user.id}`
      },
      (payload) => {
        // Handle real-time updates
        refreshQueue();
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [user.id]);
```

---

## 🚀 Performance Optimization Strategies

### Client-Side Caching

<lov-mermaid>
graph LR
    A[React Query] --> B[Server State Cache]
    A --> C[Background Refetch]
    A --> D[Optimistic Updates]
    
    B --> E[Queue Data]
    B --> F[Student Lists]
    B --> G[User Profiles]
    
    C --> H[Automatic Refresh]
    C --> I[Stale-While-Revalidate]
    
    D --> J[Instant UI Updates]
    D --> K[Rollback on Error]
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style H fill:#e8f5e8
    style J fill:#fff3e0
</lov-mermaid>

### Database Query Optimization

- **Connection Pooling**: Supabase handles automatically
- **Index Usage**: Strategic indexes on query patterns  
- **Row Level Security**: Efficient policy design
- **Real-time Filtering**: Server-side event filtering

### UI/UX Performance

- **Code Splitting**: Route-based lazy loading
- **Component Memoization**: Prevent unnecessary re-renders
- **Virtual Scrolling**: Large list performance
- **Optimistic Updates**: Instant feedback

---

## 🔧 Development & Deployment Architecture

### Development Workflow

<lov-mermaid>
gitgraph
    commit id: "Initial Setup"
    branch feature/auth
    checkout feature/auth
    commit id: "Auth Implementation"
    commit id: "RLS Policies"
    checkout main
    merge feature/auth
    branch feature/kiosk
    checkout feature/kiosk
    commit id: "Kiosk Interface"
    commit id: "Queue Integration"
    checkout main
    merge feature/kiosk
    commit id: "Production Deploy"
</lov-mermaid>

### Environment Architecture

<lov-mermaid>
graph TB
    subgraph "Development"
        A[Local Development]
        B[Feature Branches]
        C[Testing Environment]
    end
    
    subgraph "Staging"
        D[Preview Deployments]
        E[Integration Testing]
        F[User Acceptance Testing]
    end
    
    subgraph "Production"
        G[Live Application]
        H[Production Database]
        I[Monitoring & Alerts]
    end
    
    A --> D
    B --> D
    C --> E
    D --> G
    E --> G
    F --> G
    
    style G fill:#e8f5e8
    style H fill:#f3e5f5
    style I fill:#fff3e0
</lov-mermaid>

---

## 📈 Scalability Considerations

### Horizontal Scaling Points

1. **Database Layer**
   - Read replicas for reporting
   - Connection pooling optimization
   - Query performance monitoring

2. **Application Layer**
   - CDN for static assets
   - Edge function distribution
   - Client-side caching strategies

3. **User Load Management**
   - Session timeout policies
   - Real-time connection limits
   - Queue processing optimization

### Monitoring & Observability

<lov-mermaid>
graph LR
    A[Application Metrics] --> B[Dashboard Analytics]
    A --> C[Error Tracking]
    A --> D[Performance Monitoring]
    
    B --> E[User Activity]
    B --> F[Queue Statistics]
    B --> G[System Health]
    
    C --> H[Error Alerts]
    C --> I[Bug Reports]
    
    D --> J[Response Times]
    D --> K[Database Performance]
    D --> L[Real-time Latency]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e8
</lov-mermaid>

---

## 🛡️ Security Architecture

### Multi-Layer Security Model

<lov-mermaid>
graph TB
    A[User Authentication] --> B[Session Management]
    B --> C[Row Level Security]
    C --> D[API Authorization]
    D --> E[Data Encryption]
    
    F[Frontend Validation] --> G[Backend Validation]
    G --> H[Database Constraints]
    H --> I[Audit Logging]
    
    J[Network Security] --> K[HTTPS/TLS]
    K --> L[CORS Policies]
    L --> M[Rate Limiting]
    
    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style E fill:#e8f5e8
    style I fill:#fff3e0
</lov-mermaid>

### Data Protection Flow

1. **Input Sanitization**: Client-side validation + server-side verification
2. **Authentication**: JWT tokens with automatic refresh
3. **Authorization**: Role-based RLS policies
4. **Data Access**: Filtered queries based on user context
5. **Audit Trail**: Complete action logging for compliance

---

## 📱 Mobile & Responsive Considerations

### Responsive Breakpoints

```typescript
// Tailwind CSS breakpoint usage
const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets  
  lg: '1024px',  // Small desktops
  xl: '1280px',  // Large desktops
  '2xl': '1536px' // Extra large screens
};
```

### Mobile-First Components

- **Touch-friendly**: Large tap targets (44px minimum)
- **Responsive Tables**: Horizontal scroll + mobile stack
- **Modal Adaptations**: Full-screen on mobile
- **Navigation**: Collapsible menu systems

---

*Last Updated: $(date)*
*Architecture Version: 2.1*