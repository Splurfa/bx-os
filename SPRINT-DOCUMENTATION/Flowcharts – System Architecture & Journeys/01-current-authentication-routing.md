# 🔴 Current Authentication & Routing Flow

**Status**: BROKEN - Critical architectural failures blocking production

## Current Authentication Flow

<lov-mermaid>
flowchart TD
    A[User Access] --> B{Is Authenticated?}
    B -->|No| C[Redirect to /auth]
    B -->|Yes| D[ProtectedRoute Component]
    D --> E{Route Protection}
    E --> F["/teacher → ProtectedRoute"]
    E --> G["/admin → ProtectedRoute"] 
    E --> H["/kiosk1,2,3 → ProtectedRoute"]
    
    F --> I[Teacher Dashboard]
    G --> J[Admin Dashboard]
    H --> K[❌ BLOCKED: Kiosk Pages]
    
    K --> L[❌ Students Cannot Access]
    
    style K fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style L fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style A fill:#f3e5f5,stroke:#9c27b0
    style C fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Role-Based Access Issues

<lov-mermaid>
flowchart TD
    A[Authenticated User] --> B[ProtectedRoute Check]
    B --> C{User Role?}
    C --> D[❌ NO ROLE VALIDATION]
    D --> E[Any User → Any Dashboard]
    
    E --> F[Teacher can access Admin Dashboard]
    E --> G[Admin can access Teacher Dashboard]
    E --> H[❌ No Component-Level Authorization]
    
    H --> I[All Functions Visible to All Users]
    I --> J[Security Risk: Unauthorized Actions]
    
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style E fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style F fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style I fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style J fill:#ffebee,stroke:#d32f2f,stroke-width:3px
</lov-mermaid>

## Google OAuth Session Creation (Broken)

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant G as Google OAuth
    participant S as Supabase Auth
    participant DB as Database
    participant UI as Frontend

    U->>G: Initiate Google Login
    G->>S: Return OAuth Token
    S->>DB: Create User Record
    Note over DB: ❌ No Profile Creation Trigger
    S->>UI: Session Created
    UI->>UI: ❌ Role = "Unknown"
    UI->>UI: ❌ Display Name = "Unknown User"
    Note over UI: Session tracking shows wrong info
</lov-mermaid>

## Critical Issues Identified

### 🔴 Authentication Blockers
1. **No Role-Based Route Protection**: Any authenticated user can access any dashboard
2. **Missing UI Permission Framework**: All functions visible to all users
3. **Kiosk Routes Blocked**: Students cannot access kiosk functionality
4. **Session Correlation Broken**: Google OAuth users show as "Unknown"

### 🔴 Security Vulnerabilities
1. **Cross-Role Access**: Teachers can perform admin functions
2. **Data Exposure**: All users can see all data regardless of role
3. **Audit Trail Missing**: No tracking of who performs what actions

### 🔴 User Experience Issues
1. **Confusing Interface**: Wrong functions visible to wrong users
2. **Session Display Broken**: "Unknown User" instead of actual names
3. **Blocked Workflows**: Core kiosk functionality inaccessible

## Required Immediate Fixes
1. Create `AdminRoute` and `TeacherRoute` components
2. Build `usePermissions()` hook for UI authorization
3. Remove authentication guards from kiosk routes
4. Fix Google OAuth profile creation
5. Implement proper session tracking and display