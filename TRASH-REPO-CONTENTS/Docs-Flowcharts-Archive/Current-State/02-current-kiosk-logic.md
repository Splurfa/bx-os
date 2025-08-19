# 🔴 Current Kiosk Logic (Static Routes)

**Status**: BROKEN - Race conditions, conflicts, no device binding

> **UPDATE (Sprint Prep)**: `UniversalKiosk` component and `useDeviceSession` hook exist in codebase but need refinement. Static route conflicts still present.

## Current Static Route Implementation

<lov-mermaid>
flowchart TD
    A[Admin: Activate Kiosk] --> B{Select Kiosk}
    B --> C[Kiosk 1: /kiosk1]
    B --> D[Kiosk 2: /kiosk2] 
    B --> E[Kiosk 3: /kiosk3]
    
    C --> F[❌ Hard-coded Route]
    D --> G[❌ Hard-coded Route]
    E --> H[❌ Hard-coded Route]
    
    F --> I[Multiple Tabs Can Access]
    G --> J[Multiple Tabs Can Access]
    H --> K[Multiple Tabs Can Access]
    
    I --> L[❌ Multi-Tab Conflicts]
    J --> M[❌ Multi-Tab Conflicts] 
    K --> N[❌ Multi-Tab Conflicts]
    
    style F fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style L fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style M fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style N fill:#ffebee,stroke:#d32f2f,stroke-width:3px
</lov-mermaid>

## Student Assignment Race Conditions

<lov-mermaid>
sequenceDiagram
    participant A as Admin
    participant K1 as Kiosk 1 Tab A
    participant K2 as Kiosk 1 Tab B
    participant DB as Database
    participant S as Student Queue

    A->>DB: Activate Kiosk 1
    DB->>S: Assign Student A to Kiosk 1
    
    Note over K1,K2: Both tabs load /kiosk1
    K1->>DB: Fetch assigned student
    K2->>DB: Fetch assigned student
    
    K1->>K1: Display Student A
    K2->>K2: Display Student A
    
    Note over K1,K2: ❌ Both tabs control same student
    
    K1->>DB: Submit reflection for Student A
    K2->>DB: ❌ Try to submit different reflection
    
    Note over DB: ❌ Data conflicts & overwrites
</lov-mermaid>

## Current Kiosk Component Logic Issues

<lov-mermaid>
flowchart TD
    A[KioskOne/Two/Three Component] --> B[useKiosks Hook]
    B --> C[Check Kiosk Status]
    C --> D{Is Kiosk Active?}
    
    D -->|No| E[Show Activation Screen]
    D -->|Yes| F[Check Student Assignment]
    
    F --> G{Student Assigned?}
    G -->|No| H[❌ No Auto-Assignment Logic]
    G -->|Yes| I[Start Student Flow]
    
    H --> J[Manual Refresh Required]
    I --> K[Password Verification]
    K --> L[Reflection Questions]
    L --> M[Submission]
    
    M --> N[❌ No Automatic Next Student]
    N --> O[Manual Admin Intervention Required]
    
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style J fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style N fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style O fill:#ffebee,stroke:#d32f2f,stroke-width:3px
</lov-mermaid>

## Device Binding Issues

<lov-mermaid>
flowchart TD
    A[Physical Kiosk Device] --> B[❌ No Device Identification]
    B --> C[Any Browser Can Access Any Route]
    C --> D[❌ No Session Binding]
    
    D --> E[Multiple Devices → Same Kiosk Route]
    D --> F[Same Device → Multiple Kiosk Routes]
    
    E --> G[Conflicts & Data Corruption]
    F --> H[Confusion & Security Issues]
    
    I[Admin Perspective] --> J[❌ Cannot Track Device Status]
    J --> K[❌ Cannot Remotely Control Devices]
    K --> L[❌ No Heartbeat Monitoring]
    
    style B fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style C fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style D fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style J fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style K fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style L fill:#ffebee,stroke:#d32f2f,stroke-width:3px
</lov-mermaid>

## Authentication Barriers for Kiosks

<lov-mermaid>
flowchart TD
    A[Student Approaches Kiosk] --> B[Navigate to /kiosk1]
    B --> C[ProtectedRoute Check]
    C --> D{Student Authenticated?}
    
    D -->|No| E[❌ Redirect to /auth]
    D -->|Yes| F[❌ Wrong - Students shouldn't authenticate]
    
    E --> G[Student Cannot Login]
    F --> H[Security Violation]
    
    G --> I[❌ Kiosk Unusable by Students]
    H --> J[❌ Cross-User Data Access Risk]
    
    style E fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style F fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style G fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style I fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    style J fill:#ffebee,stroke:#d32f2f,stroke-width:3px
</lov-mermaid>

## Critical Problems Summary

### 🔴 Technical Issues
1. **Static Routes**: Hard-coded /kiosk1, /kiosk2, /kiosk3 routes
2. **Multi-Tab Conflicts**: Multiple browser tabs can control same kiosk
3. **No Device Binding**: No way to associate device with kiosk instance
4. **Race Conditions**: Student assignments can be overwritten
5. **Authentication Barriers**: Students blocked from accessing kiosks

### 🔴 Operational Issues
1. **Manual Intervention Required**: Admin must manually assign students
2. **No Auto-Flow**: No automatic next student assignment
3. **No Device Monitoring**: Cannot track device status or health
4. **Scaling Impossible**: Cannot add new kiosks without code changes

### 🔴 Security Issues
1. **Cross-Device Access**: Any device can access any kiosk route
2. **Session Conflicts**: Multiple sessions can interfere with each other
3. **Data Integrity**: Reflection submissions can be corrupted
4. **Audit Trail Missing**: No tracking of device-specific actions

## Required Architecture Changes
1. **Dynamic Routing**: Single `/kiosk` route with device session binding
2. **Device Instance Management**: Unique device sessions with heartbeat monitoring
3. **Anonymous Access**: Remove authentication barriers for kiosk routes
4. **Conflict Prevention**: Single-device-per-kiosk enforcement
5. **Auto-Assignment**: Automatic student queue processing