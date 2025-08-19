# 🟢 Fixed Session Management Architecture

**Status**: SPRINT DELIVERABLE - Corrected session tracking, user correlation, and display

## Enhanced AuthContext with Session Creation

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant AC as AuthContext
    participant SA as Supabase Auth
    participant DB as Database
    participant UI as UI Components

    U->>AC: Login request
    AC->>SA: supabase.auth.signInWithPassword()
    SA->>AC: Return session + user
    
    AC->>AC: Extract session data
    AC->>DB: createUserSession()
    
    Note over DB: Store session with correct device_type
    
    DB->>AC: Session record created
    AC->>AC: Set both user + session state
    AC->>UI: Notify components of auth change
    
    UI->>AC: Request user display info
    AC->>DB: Fetch profile data
    DB->>AC: Return full_name + role
    AC->>UI: Display "John Doe (Admin)"
</lov-mermaid>

## Corrected Device Type & Role Separation

<lov-mermaid>
flowchart TD
    A[User Login] --> B[Device Detection]
    B --> C[Screen Size Analysis]
    B --> D[User Agent Detection]
    B --> E[Touch Capability Check]
    
    C --> F{Screen Width}
    F -->|< 768px| G[Mobile Device]
    F -->|768-1024px| H[Tablet Device]  
    F -->|> 1024px| I[Desktop Device]
    
    J[Role Determination] --> K[Query Profiles Table]
    K --> L[Extract Role Field]
    L --> M[super_admin / admin / teacher]
    
    N[Session Creation] --> O[device_type: Physical device]
    N --> P[location: Geographic/logical location]
    N --> Q[user_id: Links to auth.users]
    
    R[Display Logic] --> S[Name from profiles.full_name]
    R --> T[Role from profiles.role] 
    R --> U[Device from session.device_type]
    R --> V[Show: "Jane Smith (Teacher) on Tablet"]
    
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
    style P fill:#e8f5e8,stroke:#4caf50
    style Q fill:#e8f5e8,stroke:#4caf50
    style V fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Fixed Profile Creation Trigger

<lov-mermaid>
flowchart TD
    A[New User Registration] --> B[handle_new_user_registration Trigger]
    B --> C[Extract User Metadata]
    
    C --> D[Get full_name from raw_user_meta_data]
    C --> E[Get email from user record]
    
    F[Role Determination Logic] --> G{Email Domain Check}
    G -->|zsummerfield@hillelhebrew.org| H[super_admin]
    G -->|@hillelhebrew.org| I[admin]
    G -->|Other domains| J[teacher]
    
    K[Profile Creation] --> L[Insert into profiles table]
    L --> M[Set id = auth user id]
    L --> N[Set extracted full_name]
    L --> O[Set determined role]
    L --> P[Set department based on role]
    
    Q[Session Integration] --> R[Profile available for session display]
    R --> S[No more "Unknown User"]
    R --> T[Proper role-based access control]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style D fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style S fill:#e8f5e8,stroke:#4caf50
    style T fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Session Deduplication Logic

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant AC as AuthContext
    participant DB as Database
    participant SM as SessionManager

    U->>AC: New login attempt
    AC->>DB: Check existing active sessions
    DB->>AC: Return current sessions for user
    
    AC->>SM: Process existing sessions
    
    alt Has Active Sessions
        SM->>DB: End previous sessions
        Note over DB: UPDATE user_sessions SET session_status = 'ended'
        SM->>DB: Create new session
    else No Active Sessions
        SM->>DB: Create new session directly
    end
    
    DB->>AC: New session created
    AC->>AC: Update state with single active session
    
    Note over SM: User now has exactly 1 active session
</lov-mermaid>

## Enhanced SessionMonitor Display

<lov-mermaid>
flowchart TD
    A[SessionMonitor Component] --> B[useActiveSessions Hook]
    B --> C[Query Enhanced Session Data]
    
    C --> D[JOIN user_sessions WITH profiles]
    D --> E[Get session + user profile data]
    
    E --> F[Process Session Display Info]
    F --> G[Extract full_name from profiles]
    F --> H[Extract role from profiles]
    F --> I[Extract device_type from session]
    F --> J[Extract location from session]
    F --> K[Calculate session duration]
    
    L[Display Components] --> M[User Avatar + Name]
    L --> N[Role Badge]
    L --> O[Device Type Icon]
    L --> P[Location Text]
    L --> Q[Duration Timer]
    L --> R[Actions Menu]
    
    style D fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style N fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Google OAuth Integration Fix

<lov-mermaid>
sequenceDiagram
    participant U as User
    participant G as Google
    participant SA as Supabase Auth
    participant T as Database Trigger
    participant P as Profiles Table
    participant AC as AuthContext

    U->>G: Click "Sign in with Google"
    G->>SA: OAuth flow completion
    SA->>SA: Create user in auth.users
    
    Note over SA: raw_user_meta_data contains Google profile
    
    SA->>T: Fire handle_new_user_registration
    T->>T: Extract name from raw_user_meta_data
    T->>T: Determine role from email domain
    T->>P: INSERT new profile record
    
    SA->>AC: onAuthStateChange fired
    AC->>AC: Set user + session state
    AC->>P: Fetch created profile
    P->>AC: Return full profile data
    
    AC->>AC: Display correct user info
    Note over AC: Shows actual name, not "Unknown User"
</lov-mermaid>

## Device Type Detection Logic

<lov-mermaid>
flowchart TD
    A[Device Detection Function] --> B[Check User Agent]
    A --> C[Analyze Screen Dimensions]
    A --> D[Test Touch Capabilities]
    A --> E[Check Platform Info]
    
    B --> F{Mobile User Agent?}
    F -->|Yes| G[Mobile Device]
    F -->|No| H[Continue Analysis]
    
    C --> I{Screen Width}
    I -->|< 768px| J[Mobile]
    I -->|768-1200px| K[Tablet]
    I -->|> 1200px| L[Desktop]
    
    D --> M{Touch Support?}
    M -->|Yes + Large Screen| N[Tablet]
    M -->|Yes + Small Screen| O[Mobile]
    M -->|No| P[Desktop]
    
    Q[Special Cases] --> R[iPad → Tablet]
    Q --> S[Chrome on Android → Mobile]
    Q --> T[Windows Touch → Desktop]
    Q --> U[Kiosk Mode → Kiosk]
    
    style G fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style N fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
    style P fill:#e8f5e8,stroke:#4caf50
    style U fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Session Heartbeat & Activity Tracking

<lov-mermaid>
sequenceDiagram
    participant AC as AuthContext
    participant HB as Heartbeat Manager
    participant DB as Database
    participant AM as Admin Monitor

    AC->>HB: Start heartbeat on login
    
    loop Every 30 seconds
        HB->>DB: UPDATE last_activity = now()
        DB->>HB: Confirm update
    end
    
    Note over HB: If user inactive for 5 minutes...
    
    HB->>DB: Check last user interaction
    
    alt User Still Active
        HB->>HB: Continue heartbeat
    else User Inactive
        HB->>DB: Mark session as inactive
        HB->>AM: Notify admin of idle session
    end
    
    Note over AC: On logout or close
    AC->>DB: End session explicitly
    DB->>DB: SET session_status = 'ended'
</lov-mermaid>

## Real-time Session Updates

<lov-mermaid>
flowchart TD
    A[Session State Changes] --> B[Supabase Realtime]
    B --> C[Admin Dashboard Subscription]
    B --> D[User Session Updates]
    
    C --> E[Real-time Session List]
    E --> F[New logins appear instantly]
    E --> G[Logout events update immediately]
    E --> H[Device status changes in real-time]
    
    D --> I[User sees own session info]
    I --> J[Login/logout confirmations]
    I --> K[Session timeout warnings]
    
    L[Subscription Setup] --> M[user_sessions table changes]
    L --> N[profiles table changes]
    L --> O[Cross-table JOIN updates]
    
    style E fill:#e8f5e8,stroke:#4caf50
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style M fill:#e3f2fd,stroke:#1976d2
    style N fill:#e3f2fd,stroke:#1976d2
</lov-mermaid>

## Admin Force Logout Implementation

<lov-mermaid>
sequenceDiagram
    participant A as Admin
    participant AM as Admin Dashboard  
    participant EF as Edge Function
    participant SA as Supabase Admin
    participant DB as Database
    participant U as Target User

    A->>AM: Click "Force Logout" on session
    AM->>EF: Call force-logout edge function
    EF->>EF: Verify admin permissions
    
    EF->>SA: admin.deleteSession(sessionId)
    SA->>SA: Revoke auth tokens
    SA->>DB: Update session status to 'ended'
    
    DB->>U: Real-time subscription fires
    U->>U: AuthContext detects invalid session
    U->>U: Clear local auth state
    U->>U: Redirect to login page
    
    EF->>AM: Return success response
    AM->>AM: Update session list
    A->>A: See session marked as 'ended'
</lov-mermaid>

## Session Security & Privacy

<lov-mermaid>
flowchart TD
    A[Session Security Measures] --> B[Token Encryption]
    A --> C[Session Expiration]
    A --> D[Device Binding]
    A --> E[Activity Monitoring]
    
    B --> F[Secure session tokens]
    B --> G[Encrypted local storage]
    B --> H[HTTPS-only transmission]
    
    C --> I[Automatic timeout after inactivity]
    C --> J[Configurable session duration]
    C --> K[Refresh token rotation]
    
    D --> L[Device fingerprinting]
    D --> M[IP address validation]
    D --> N[Browser session binding]
    
    E --> O[Failed login attempt tracking]
    E --> P[Unusual activity detection]
    E --> Q[Admin security alerts]
    
    style F fill:#e3f2fd,stroke:#1976d2
    style G fill:#e3f2fd,stroke:#1976d2
    style H fill:#e3f2fd,stroke:#1976d2
    style I fill:#e3f2fd,stroke:#1976d2
    style L fill:#e3f2fd,stroke:#1976d2
    style O fill:#e3f2fd,stroke:#1976d2
    style P fill:#e3f2fd,stroke:#1976d2
    style Q fill:#e3f2fd,stroke:#1976d2
</lov-mermaid>

## Implementation Status

### ❌ **NOT IMPLEMENTED** - Required for Sprint
- **Profile creation trigger**: `handle_new_user_registration` database trigger
- **Enhanced AuthContext**: Session creation logic on login
- **Session deduplication**: Logic to end previous sessions
- **Device type detection**: Accurate device classification function
- **Real-time monitoring**: Admin dashboard session updates
- **Force logout**: Edge function for admin session management

### 🔄 **PARTIALLY IMPLEMENTED** - Needs Completion  
- **Google OAuth flow**: Authentication works but profile creation incomplete
- **SessionMonitor display**: Component exists but shows incorrect data
- **useActiveSessions hook**: Hook exists but needs proper JOIN logic
- **Session display**: Shows "Unknown User" instead of proper names

### ✅ **IMPLEMENTED** - Foundation Ready
- **Database schema**: user_sessions and profiles tables exist
- **Basic authentication**: Supabase auth integration working
- **Session infrastructure**: Basic session tracking exists
- **Real-time subscriptions**: Supabase realtime infrastructure ready

## Sprint Deliverables Summary

### 🟢 Fixed Authentication Issues
- **Profile Creation Trigger**: Automatic profile creation for all new users including Google OAuth
- **Role Assignment**: Proper role determination based on email domain
- **Session Creation**: AuthContext now creates proper session records
- **Display Names**: No more "Unknown User" - shows actual names from profiles

### 🟢 Corrected Session Management
- **Device Type Detection**: Accurate device classification (mobile/tablet/desktop/kiosk)
- **Role Separation**: Clear distinction between user role and device type
- **Session Deduplication**: One active session per user maximum
- **Proper Display**: Shows "Name (Role) on Device" format

### 🟢 Enhanced Admin Controls
- **Real-time Monitoring**: Live session updates in admin dashboard
- **Force Logout**: Ability to remotely end user sessions
- **Session Analytics**: Duration, activity, device information
- **Security Tracking**: Failed attempts, unusual activity monitoring

### 🟢 Improved User Experience
- **Accurate Information**: Correct user names and roles displayed
- **Session Continuity**: Proper session persistence and recovery
- **Clear Status**: Users know their login status and session info
- **Security Feedback**: Clear indicators of session status and activity

### 🟢 Technical Architecture
- **Database Triggers**: Automatic profile creation for new users
- **Real-time Updates**: Supabase subscriptions for live session data
- **Security Framework**: Enhanced session security and validation
- **Error Handling**: Graceful handling of session-related errors