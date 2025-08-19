# 🟢 Updated Authentication & Authorization Flow

**Status**: SPRINT DELIVERABLE - Role-based protection & anonymous kiosk access

## Post-Sprint Authentication Architecture

<lov-mermaid>
flowchart TD
    A[User Access] --> B{Authentication Required?}
    B -->|Kiosk Routes| C[Anonymous Kiosk Access]
    B -->|Admin/Teacher Routes| D[Authentication Check]
    
    C --> E[Direct Kiosk Access]
    D --> F{Authenticated?}
    F -->|No| G[Redirect to /auth]
    F -->|Yes| H[Role Validation]
    
    H --> I{User Role?}
    I -->|Admin| J[AdminRoute Component]
    I -->|Teacher| K[TeacherRoute Component]
    I -->|Other| L[Access Denied]
    
    J --> M[Admin Dashboard Access]
    K --> N[Teacher Dashboard Access]
    E --> O[Kiosk Student Flow]
    
    style C fill:#e8f5e8,stroke:#4caf50
    style E fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style N fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Role-Based Route Protection System

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant R as Router
    participant AR as AdminRoute
    participant TR as TeacherRoute
    participant P as usePermissions
    participant DB as Database

    U->>R: Navigate to /admin
    R->>AR: Route to AdminRoute
    AR->>P: Check user role
    P->>DB: Query profiles table
    DB->>P: Return user role
    
    alt User is Admin/Super Admin
        P->>AR: Permission granted
        AR->>AR: Render Admin Dashboard
    else User is not Admin
        P->>AR: Permission denied
        AR->>R: Redirect to appropriate dashboard
    end
    
    Note over AR,TR: Same logic applies for TeacherRoute
</lov-mermaid>

## Component-Level Authorization System

<lov-mermaid>
flowchart TD
    A[UI Component] --> B[usePermissions Hook]
    B --> C[Check User Role + Component Action]
    
    C --> D{Permission Check}
    D -->|Allowed| E[Show Component]
    D -->|Denied| F[Hide Component]
    
    G[Permission Examples] --> H[Add User Button: Super Admin Only]
    G --> I[Delete BSR: Admin + Teacher who created]
    G --> J[View Sessions: Admin Only]
    G --> K[Force Logout: Super Admin Only]
    
    L[usePermissions Implementation] --> M[hasRole function]
    L --> N[canPerformAction function] 
    L --> O[isOwnerOrAdmin function]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style E fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style N fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Anonymous Kiosk Access Security Model

<lov-mermaid>
flowchart TD
    A[Kiosk Device] --> B[Navigate to /kiosk]
    B --> C[No Authentication Required]
    C --> D[Device Session Management]
    
    D --> E[Generate Device Session ID]
    E --> F[Bind to Kiosk Instance]
    F --> G[RLS Policy: Kiosk Data Only]
    
    G --> H[Can Read: Assigned Student Data]
    G --> I[Can Write: Reflection Submissions]
    G --> J[Cannot Access: Other Students/Users]
    
    K[Security Boundaries] --> L[No Auth Token Required]
    K --> M[RLS Restricts Data Access]
    K --> N[Device Session Timeout]
    K --> O[Admin Can Monitor/Control]
    
    style C fill:#e8f5e8,stroke:#4caf50
    style D fill:#e8f5e8,stroke:#4caf50
    style E fill:#e8f5e8,stroke:#4caf50
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#e3f2fd,stroke:#1976d2
    style H fill:#e3f2fd,stroke:#1976d2
    style I fill:#e3f2fd,stroke:#1976d2
    style J fill:#e3f2fd,stroke:#1976d2
</lov-mermaid>

## Fixed Google OAuth Profile Creation

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant G as Google OAuth
    participant S as Supabase Auth
    participant T as Database Trigger
    participant P as Profiles Table
    participant UI as Frontend

    U->>G: Sign in with Google
    G->>S: OAuth success + user metadata
    S->>S: Create user in auth.users
    S->>T: Fire handle_new_user_registration trigger
    
    T->>T: Extract full_name from metadata
    T->>T: Determine role from email domain
    T->>P: Create profile record
    
    Note over T: zsummerfield@hillelhebrew.org → super_admin
    Note over T: @hillelhebrew.org → admin  
    Note over T: Others → teacher
    
    S->>UI: Authentication complete
    UI->>P: Fetch user profile
    P->>UI: Return role + display name
    UI->>UI: Show correct user info
</lov-mermaid>

## Permission Framework Architecture

<lov-mermaid>
flowchart TD
    A[Permission System] --> B[usePermissions Hook]
    A --> C[Permission Utils]
    A --> D[Role Definitions]
    
    B --> E[hasRole: Check user role]
    B --> F[canManageUsers: Super admin only]
    B --> G[canManageBSR: Admin + Teacher who created]
    B --> H[canViewSessions: Admin roles]
    
    C --> I[permissions.ts helper functions]
    I --> J[isAdmin function]
    I --> K[isSuperAdmin function]
    I --> L[isOwnerOrAdmin function]
    
    D --> M[Role Hierarchy]
    M --> N[super_admin: Full access]
    M --> O[admin: School management]
    M --> P[teacher: Classroom scope]
    
    Q[UI Integration] --> R[Conditional Rendering]
    R --> S[{hasRole('admin') && <AddUserButton />}]
    R --> T[{canManageBSR(bsr) && <DeleteButton />}]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style E fill:#e8f5e8,stroke:#4caf50
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style S fill:#e8f5e8,stroke:#4caf50
    style T fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Session Management Reconstruction

<lov-mermaid>
flowchart TD
    A[User Login] --> B[AuthContext Enhanced]
    B --> C[Create Session Record]
    C --> D[Detect Device Type]
    
    D --> E[Desktop Browser]
    D --> F[Tablet/Mobile]
    D --> G[Kiosk Device]
    
    E --> H[device_type: "desktop"]
    F --> I[device_type: "mobile"]
    G --> J[device_type: "kiosk"]
    
    C --> K[Session Deduplication]
    K --> L[End Previous Sessions]
    K --> M[Create Single Active Session]
    
    N[Session Display] --> O[Fetch Profile Data]
    O --> P[Show: "John Doe (Admin) on Desktop"]
    O --> Q[Show: "Jane Smith (Teacher) on Tablet"]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style C fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
    style P fill:#e8f5e8,stroke:#4caf50
    style Q fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Route Configuration After Sprint

<lov-mermaid>
flowchart TD
    A[App.tsx Routes] --> B[Public Routes]
    A --> C[Protected Routes]
    A --> D[Anonymous Routes]
    
    B --> E[/ - Landing Page]
    B --> F[/auth - Login/Signup]
    
    C --> G[AdminRoute Wrapper]
    C --> H[TeacherRoute Wrapper]
    
    G --> I[/admin - Admin Dashboard]
    H --> J[/teacher - Teacher Dashboard]
    
    D --> K[/kiosk - Universal Kiosk]
    D --> L[Dynamic Device Binding]
    
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Implementation Status

### ❌ **NOT IMPLEMENTED** - Required for Sprint
- **AdminRoute.tsx**: Role-based admin route protection component
- **TeacherRoute.tsx**: Role-based teacher route protection component
- **usePermissions.ts**: Component-level authorization hook
- **permissions.ts**: Permission utility helper functions
- **Enhanced AuthContext**: Session creation on login
- **Profile creation trigger**: Auto-profile creation for Google OAuth users

### 🔄 **PARTIALLY IMPLEMENTED** - Needs Refinement
- **ProtectedRoute component**: Exists but lacks role validation
- **Google OAuth flow**: Basic authentication works, profile creation may be incomplete
- **Session tracking**: Infrastructure exists but needs proper correlation

### ✅ **IMPLEMENTED** - Foundation Ready
- **Database schema**: Profiles and user_sessions tables exist
- **Basic authentication**: Supabase auth integration working
- **Route structure**: Basic routing framework in place

## Sprint Deliverables Summary

### 🟢 Authentication Components
- **AdminRoute.tsx**: Restricts admin dashboard to admin/super_admin roles
- **TeacherRoute.tsx**: Restricts teacher dashboard to teacher+ roles  
- **usePermissions.ts**: Component-level authorization hook
- **permissions.ts**: Permission utility functions

### 🟢 Session Management Fixes
- **Enhanced AuthContext**: Creates proper session records
- **Fixed Profile Creation**: Auto-profile trigger for Google OAuth
- **Session Deduplication**: One active session per user
- **Correct Display**: Shows actual names and roles

### 🟢 Security Architecture
- **Role-Based Access**: Clear role hierarchy and permissions
- **Anonymous Kiosk Access**: Secure, limited data access for kiosks
- **Component Authorization**: UI elements hidden based on permissions
- **Audit Trail**: Proper session tracking and user correlation

### 🟢 User Experience
- **Clear Role Separation**: Admins and teachers see appropriate interfaces
- **Proper Session Display**: Meaningful session information
- **Blocked Function Removal**: No confusing UI elements for wrong roles
- **Seamless Kiosk Access**: Students can use kiosks without authentication