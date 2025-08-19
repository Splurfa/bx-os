# 🟢 Device Instance Management System (New)

**Status**: SPRINT DELIVERABLE - Core system for managing kiosk device instances

## Dynamic Kiosk Assignment Architecture

<lov-mermaid>
flowchart TD
    A[Admin Dashboard] --> B[Generate Kiosk URL]
    B --> C[Create Device Session ID]
    C --> D[Kiosk URL: /kiosk?session=abc123]
    
    D --> E[Device Accesses URL]
    E --> F[useDeviceSession Hook]
    F --> G[Validate Session ID]
    
    G --> H{Valid Session?}
    H -->|Yes| I[Bind Device to Kiosk]
    H -->|No| J[Access Denied]
    
    I --> K[Start Heartbeat Monitoring]
    K --> L[Update Kiosk Status: Active]
    L --> M[Auto-Assign Waiting Student]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style C fill:#e8f5e8,stroke:#4caf50
    style F fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Device Session Management Flow

<lov-mermaid>
sequenceDiagram
    participant A as Admin
    participant DM as DeviceManager
    participant D as Device
    participant DS as useDeviceSession
    participant DB as Database
    participant Q as Queue

    A->>DM: Request kiosk activation
    DM->>DM: Generate unique session ID
    DM->>DB: Store device session record
    DM->>A: Return kiosk URL with session
    
    A->>D: Navigate device to URL
    D->>DS: Initialize with session ID
    DS->>DB: Validate session ID
    
    alt Valid Session
        DB->>DS: Session confirmed
        DS->>D: Device authorized
        D->>DS: Start heartbeat interval
        DS->>DB: Update device status: online
        DS->>Q: Trigger student assignment
    else Invalid Session  
        DB->>DS: Session rejected
        DS->>D: Show access denied
    end
    
    loop Every 30 seconds
        D->>DS: Send heartbeat
        DS->>DB: Update last_seen timestamp
    end
</lov-mermaid>

## UniversalKiosk Component Architecture

<lov-mermaid>
flowchart TD
    A[UniversalKiosk.tsx] --> B[useDeviceSession Hook]
    A --> C[Device Binding Logic]
    A --> D[Student Assignment Flow]
    
    B --> E[Session Validation]
    B --> F[Heartbeat Management]
    B --> G[Device Status Tracking]
    
    C --> H[Single Device Enforcement]
    C --> I[Multi-Tab Prevention]
    C --> J[Session Timeout Handling]
    
    D --> K[Auto-Student Assignment]
    D --> L[Reflection Workflow]
    D --> M[Completion & Next Student]
    
    N[Device States] --> O[Connecting: Validating session]
    N --> P[Active: Student assigned]
    N --> Q[Waiting: No students in queue]
    N --> R[Offline: Heartbeat failed]
    N --> S[Error: Session invalid]
    
    style B fill:#e8f5e8,stroke:#4caf50
    style E fill:#e8f5e8,stroke:#4caf50
    style F fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style K fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Device Session Database Schema Enhancement

<lov-mermaid>
erDiagram
    KIOSKS {
        integer id PK
        text name
        text location
        boolean is_active
        uuid current_student_id FK
        uuid current_behavior_request_id FK
        text device_session_id
        timestamp last_heartbeat
        jsonb device_info
        text device_status
        timestamp activated_at
        uuid activated_by FK
    }
    
    DEVICE_SESSIONS {
        uuid id PK
        text session_token
        integer kiosk_id FK
        text device_fingerprint
        timestamp created_at
        timestamp expires_at
        timestamp last_seen
        text status
        uuid created_by FK
        jsonb device_metadata
    }
    
    KIOSKS ||--o| DEVICE_SESSIONS : "bound_to"
</lov-mermaid>

## Admin Kiosk Management Interface

<lov-mermaid>
flowchart TD
    A[Admin Dashboard] --> B[Kiosk Management Panel]
    B --> C[Generate Kiosk Access]
    B --> D[Monitor Device Status]
    B --> E[Remote Control Actions]
    
    C --> F[Create Device Session]
    F --> G[Generate Unique URL]
    G --> H[Display QR Code + Link]
    
    D --> I[Real-time Status Display]
    I --> J[Online/Offline Status]
    I --> K[Current Student Assignment]
    I --> L[Last Heartbeat Time]
    
    E --> M[Force Logout Student]
    E --> N[Deactivate Kiosk]
    E --> O[Reset Device Session]
    E --> P[Clear Queue Assignment]
    
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style H fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style N fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Device Conflict Prevention System

<lov-mermaid>
flowchart TD
    A[Device Session Request] --> B[Check Existing Sessions]
    B --> C{Session Already Active?}
    
    C -->|Yes| D[Existing Device Check]
    C -->|No| E[Create New Session]
    
    D --> F{Same Device?}
    F -->|Yes| G[Resume Existing Session]
    F -->|No| H[Show Conflict Warning]
    
    H --> I[Admin Override Required]
    I --> J[Force End Previous Session]
    J --> K[Create New Session for New Device]
    
    E --> L[Generate Session Token]
    L --> M[Store Device Fingerprint]
    M --> N[Set Heartbeat Schedule]
    
    style H fill:#fff3e0,stroke:#f57c00
    style I fill:#fff3e0,stroke:#f57c00
    style J fill:#fff3e0,stroke:#f57c00
    style G fill:#e8f5e8,stroke:#4caf50
    style L fill:#e8f5e8,stroke:#4caf50
    style M fill:#e8f5e8,stroke:#4caf50
    style N fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Heartbeat Monitoring & Timeout System

<lov-mermaid>
sequenceDiagram
    participant D as Device
    participant DS as useDeviceSession
    participant DB as Database
    participant AM as Admin Monitor
    participant Q as Queue Manager

    loop Every 30 seconds
        D->>DS: Send heartbeat ping
        DS->>DB: Update last_heartbeat
        DB->>DS: Confirm received
    end
    
    Note over DB: If no heartbeat for 2 minutes...
    
    DB->>AM: Device offline detected
    AM->>AM: Update device status: offline
    AM->>Q: Release assigned student
    Q->>Q: Return student to waiting queue
    
    Note over Q: Student available for next kiosk
    
    alt Device Reconnects
        D->>DS: Reconnection attempt
        DS->>DB: Validate session still active
        DB->>DS: Session valid but expired
        DS->>D: Require new session from admin
    end
</lov-mermaid>

## Device Fingerprinting & Security

<lov-mermaid>
flowchart TD
    A[Device Access Attempt] --> B[Generate Device Fingerprint]
    B --> C[Browser Info + Screen Resolution]
    B --> D[Timezone + Language Settings]
    B --> E[Hardware Capabilities]
    
    F[Security Checks] --> G[Session Token Validation]
    F --> H[Device Fingerprint Match]
    F --> I[Session Expiry Check]
    F --> J[Heartbeat Status Validation]
    
    K[Fingerprint Components] --> L[User Agent String]
    K --> M[Screen Dimensions]
    K --> N[Available Fonts]
    K --> O[Timezone Offset]
    
    P[Security Benefits] --> Q[Prevent Session Hijacking]
    P --> R[Detect Device Changes]
    P --> S[Audit Trail for Devices]
    
    style G fill:#e3f2fd,stroke:#1976d2
    style H fill:#e3f2fd,stroke:#1976d2
    style I fill:#e3f2fd,stroke:#1976d2
    style J fill:#e3f2fd,stroke:#1976d2
    style Q fill:#e3f2fd,stroke:#1976d2
    style R fill:#e3f2fd,stroke:#1976d2
    style S fill:#e3f2fd,stroke:#1976d2
</lov-mermaid>

## Student Assignment Integration

<lov-mermaid>
flowchart TD
    A[Device Session Active] --> B[Check Student Queue]
    B --> C{Students Waiting?}
    
    C -->|Yes| D[Auto-Assign Next Student]
    C -->|No| E[Display Waiting State]
    
    D --> F[Update Kiosk Assignment]
    F --> G[Update Behavior Request Status]
    G --> H[Display Student Welcome]
    
    H --> I[Student Completes Reflection]
    I --> J[Submit to Database]
    J --> K[Clear Kiosk Assignment]
    K --> L[Return to Queue Check]
    
    E --> M[Monitor for New BSRs]
    M --> N[Real-time Queue Updates]
    N --> O[Auto-Assign When Available]
    
    style D fill:#e8f5e8,stroke:#4caf50
    style F fill:#e8f5e8,stroke:#4caf50
    style G fill:#e8f5e8,stroke:#4caf50
    style I fill:#e8f5e8,stroke:#4caf50
    style J fill:#e8f5e8,stroke:#4caf50
    style O fill:#e8f5e8,stroke:#4caf50
</lov-mermaid>

## Implementation Components

### 🟢 Core Components
- **UniversalKiosk.tsx**: Single kiosk component with device binding
- **useDeviceSession.ts**: Hook for device session management
- **deviceSessionManager.ts**: Utility functions for session operations
- **KioskDeviceManager**: Admin interface for device management

### 🟢 Database Enhancements
- **DEVICE_SESSIONS table**: Track device sessions and metadata
- **KIOSKS table updates**: Add device_session_id, last_heartbeat, device_status
- **Session validation functions**: Database functions for security checks

### 🟢 Security Features
- **Session Token Validation**: Cryptographically secure session tokens
- **Device Fingerprinting**: Prevent unauthorized device access
- **Heartbeat Monitoring**: Automatic offline detection and cleanup
- **Admin Override**: Force logout and session management

### 🟢 User Experience
- **QR Code Generation**: Easy device onboarding for admins
- **Real-time Status**: Live device monitoring in admin dashboard
- **Conflict Prevention**: Clear messaging for multi-device scenarios
- **Automatic Recovery**: Graceful handling of network interruptions

## Success Metrics for Sprint
1. **Single Device Control**: Only one device can control a kiosk at a time
2. **Auto-Assignment**: Students automatically assigned to available kiosks
3. **Heartbeat Monitoring**: Devices go offline when disconnected
4. **Session Security**: Devices cannot access without valid admin-generated sessions
5. **Admin Control**: Full remote management of all kiosk devices