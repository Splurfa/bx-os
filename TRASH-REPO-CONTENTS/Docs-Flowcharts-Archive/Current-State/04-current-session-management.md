# 🔴 Current Session Management Flow (Broken)

**Status**: BROKEN - Session tracking shows wrong data, device type confusion

> **UPDATE (Sprint Prep)**: Partial session management improvements may exist, but core issues with device type/role confusion and session deduplication remain unfixed.

## Current Session Creation Issues

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant A as AuthContext
    participant S as Supabase Auth
    participant DB as Database
    participant UI as UI Components

    U->>A: Login Attempt
    A->>S: Authentication Request
    S->>A: Return Session Object
    A->>A: ❌ Set user state only
    Note over A: Session object ignored
    
    A->>DB: ❌ No session tracking created
    A->>UI: Update auth state
    UI->>UI: ❌ Display "Unknown User"
    
    Note over UI: Missing session correlation
    UI->>UI: ❌ Show device type as role
</lov-mermaid>

## Google OAuth Profile Creation (Missing)

<lov-mermaid>
flowchart TD
    A[Google OAuth Success] --> B[Supabase Creates Auth User]
    B --> C{Profile Creation Trigger?}
    C -->|❌ Missing| D[No Profile Record]
    C -->|Should Exist| E[Auto-Create Profile]
    
    D --> F[❌ Role = Undefined]
    D --> G[❌ Display Name = "Unknown"]
    D --> H[❌ Session Shows Wrong Info]
    
    E --> I[Extract Google User Info]
    I --> J[Determine Role from Email]
    J --> K[Create Profile Record]
    K --> L[Proper Session Display]
    
    style C fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style F fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style E fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Session Display Problems

<lov-mermaid>
flowchart TD
    A[Active Sessions Hook] --> B[Fetch USER_SESSIONS]
    B --> C[Process Session Data]
    
    C --> D{User Profile Exists?}
    D -->|No| E[❌ Display "Unknown User"]
    D -->|Yes| F[Show Actual Name]
    
    C --> G{Device Type Logic}
    G --> H[❌ Confuse device_type with role]
    G --> I[Show "admin" as device]
    G --> J[Show "teacher" as device]
    
    E --> K[❌ Meaningless Session List]
    I --> L[❌ Wrong Device Classification]
    J --> M[❌ UI Shows Incorrect Data]
    
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style E fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style I fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style J fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style K fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style L fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style M fill:#ffebee,stroke:#d32f2f,stroke-width:3px
</lov-mermaid>

## Device Type vs Role Confusion

<lov-mermaid>
flowchart TD
    A[Session Creation] --> B{What Gets Stored?}
    
    B --> C[❌ device_type = "admin"]
    B --> D[❌ device_type = "teacher"]
    B --> E[❌ device_type = "security_audit"]
    
    C --> F[Should be: device_type = "desktop"]
    D --> G[Should be: device_type = "tablet"]
    E --> H[Should be: device_type = "system"]
    
    I[UI Display Logic] --> J[❌ Show device_type as role]
    J --> K[Admin Session shows "admin device"]
    J --> L[Teacher Session shows "teacher device"]
    
    M[Correct Logic] --> N[device_type = actual device]
    N --> O[role from profiles table]
    O --> P[Display: "John Doe (Admin) on Desktop"]
    
    style C fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style E fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style J fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style K fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style L fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style N fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
    style P fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Current SessionMonitor Component Issues

<lov-mermaid>
sequenceDiagram
    participant SM as SessionMonitor
    participant AS as useActiveSessions
    participant DB as Database
    participant UI as Display

    SM->>AS: Fetch active sessions
    AS->>DB: Query USER_SESSIONS table
    DB->>AS: Return raw session data
    
    AS->>AS: ❌ Process sessions incorrectly
    Note over AS: device_type treated as role
    
    AS->>SM: Return malformed session list
    SM->>UI: Display sessions
    
    UI->>UI: Show "Unknown User"
    UI->>UI: Show "admin device connected"
    UI->>UI: ❌ Confusing & incorrect display
    
    Note over UI: Users cannot identify sessions
</lov-mermaid>

## Missing Profile Creation Trigger

<lov-mermaid>
flowchart TD
    A[New User Registration] --> B{Trigger Exists?}
    B -->|❌ No| C[No Profile Created]
    B -->|Should| D[handle_new_user_registration]
    
    C --> E[User exists in auth.users only]
    E --> F[❌ No role assignment]
    E --> G[❌ No display name]
    E --> H[❌ Session tracking fails]
    
    D --> I[Extract user metadata]
    I --> J[Determine role from email domain]
    J --> K[Create profiles record]
    K --> L[Enable proper session display]
    
    M[Email Domain Rules] --> N[@hillelhebrew.org → admin]
    M --> O[zsummerfield@hillelhebrew.org → super_admin]
    M --> P[Other domains → teacher]
    
    style B fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style C fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style E fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style F fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style D fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Session Deduplication Issues

<lov-mermaid>
flowchart TD
    A[User Login] --> B[Check Existing Sessions]
    B --> C{Multiple Active Sessions?}
    
    C -->|Yes| D[❌ No Deduplication Logic]
    C -->|No| E[Create New Session]
    
    D --> F[Multiple Sessions Accumulate]
    F --> G[Session List Becomes Cluttered]
    G --> H[❌ Cannot Track Real Activity]
    
    E --> I[Single Clean Session]
    
    J[Correct Logic] --> K[End Previous Sessions]
    K --> L[Create Single New Session]
    L --> M[Clean Session Tracking]
    
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style F fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style K fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Critical Session Management Problems

### 🔴 Profile Creation Issues
1. **Missing Trigger**: No automatic profile creation for new users
2. **Google OAuth Gaps**: OAuth users not getting profiles
3. **Role Assignment Missing**: Users have no role after registration
4. **Display Name Missing**: Sessions show "Unknown User"

### 🔴 Session Tracking Problems
1. **Device Type Confusion**: Roles stored as device types
2. **No Session Creation**: AuthContext doesn't create session records
3. **No Deduplication**: Multiple sessions accumulate per user
4. **Wrong Data Display**: Session monitor shows incorrect information

### 🔴 Data Correlation Issues
1. **Missing User-Profile Link**: Sessions can't find user names
2. **Role-Device Mixup**: UI treats device types as user roles
3. **Session-User Correlation**: Cannot properly link sessions to users
4. **Audit Trail Broken**: Cannot track who did what when

## Required Fixes for Sprint
1. **Create Profile Trigger**: Auto-create profiles for new users
2. **Fix Session Creation**: AuthContext must create session records
3. **Separate Device Type from Role**: Clear data model distinction
4. **Implement Session Deduplication**: One active session per user
5. **Fix Session Display**: Show actual user names and correct device info
6. **Proper Role Assignment**: Email domain-based role determination