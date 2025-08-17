# 🧭 BX-OS Production Knowledge Compass

## System Identity & Mission

**BX-OS (Behavior Support Request Operating System)** is a comprehensive Student Behavior Management System designed for real-time classroom intervention support. The system enables teachers to create Behavior Support Requests (BSRs), students to complete reflections via tablet kiosks, and administrators to manage the entire behavioral intervention workflow.

---

## 🎯 Current Sprint Context

### Sprint Objective
Transform BX-OS from functional prototype to production-ready classroom system within 24-hour implementation window.

### Critical Success Factors
1. **Kiosk Liberation:** Students must access reflection systems without authentication barriers
2. **Role-Based Security:** Proper access control for super_admin, admin, and teacher roles  
3. **Mobile-First Experience:** Touch-optimized interfaces for classroom tablet deployment
4. **Real-Time Communication:** Live queue updates and notification system for immediate teacher awareness

---

## 📋 Strategic Documentation References

### 🗺️ Transformation Blueprint
**Location:** `docs/architecture/transformation-blueprint.md`

**Purpose:** Complete architectural mapping from current prototype state to production requirements

**Key Sections:**
- **Current State Analysis:** Detailed technical assessment of existing limitations
- **Future State Architecture:** Production specifications for each system domain
- **Transformation Requirements:** Implementation priorities and dependency mapping

**When to Reference:** 
- Understanding what needs to change and why
- Technical specification lookup during implementation
- Architectural decision validation
- Sprint planning and scope definition

### ✅ Sprint Execution Checklist
**Location:** `docs/technical/production-sprint-checklist.md`

**Purpose:** Hour-by-hour implementation guide with verification checkpoints

**Key Sections:**
- **Phase-Based Task Breakdown:** 5 phases across 24-hour sprint timeline
- **Critical Checkpoints:** Risk mitigation and progress validation points
- **Rollback Procedures:** Fallback strategies for high-risk implementations
- **Final Acceptance Criteria:** Production readiness validation requirements

**When to Reference:**
- Daily sprint execution tracking
- Task completion verification  
- Risk assessment and mitigation
- Progress reporting and timeline management

---

## 🏛️ Architectural Foundation

### Technology Stack
- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **State Management:** React Context + React Query for server state
- **Mobile/Gestures:** Framer Motion or @react-spring/gesture for touch interactions
- **Backend:** Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- **Deployment:** Lovable Platform with Supabase integration
- **Security:** Row Level Security (RLS) + JWT Authentication + Anonymous access for kiosks

### Current System State
```typescript
// Authentication: Password-only, blocks kiosks
// Roles: teacher, admin (missing super_admin)
// Routing: Static, non-role-aware
// UI: Desktop-first responsive design
// Notifications: None implemented
// Kiosks: Authentication-blocked (non-functional)
```

### Production Target State  
```typescript
// Authentication: Google OAuth @school.edu + password fallback + dev bypass
// Roles: super_admin, admin, teacher with proper hierarchy
// Routing: Role-aware smart landing with automatic redirects
// UI: Mobile-first with gesture support and touch optimization
// Notifications: Real-time bell system with role-based filtering
// Kiosks: Anonymous access, tablet-optimized, FIFO queue management
```

---

## 👥 User Architecture & Workflow

### Role Hierarchy
```
super_admin (Zach): zach@zavitechllc.com
├── Full system access and user management
├── Development login bypass via /dev-login
└── Reset capabilities and system administration

admin (School Administrators): 
├── Manage all students, teachers, and data
├── Access kiosks for testing and monitoring
└── View comprehensive system analytics

teacher (Classroom Teachers):
├── Create and manage Behavior Support Requests (BSRs)
├── Review and approve student reflections
└── Monitor classroom queue and intervention status
```

### Core Workflow: BSR → Reflection → Resolution
1. **Teacher** creates BSR for student behavioral intervention
2. **Student** accesses anonymous kiosk for 4-question reflection
3. **System** manages FIFO queue with real-time position tracking
4. **Teacher** receives notification, reviews reflection, approves/requests revision
5. **Admin** monitors overall system health and intervention outcomes

---

## 🗺️ Routing & Navigation Architecture

### Current Route Structure
```
/ → AuthPage (static login)
/auth → Authentication interface
/teacher → Teacher dashboard (protected)
/admin-dashboard → Admin interface (protected)  
/kiosk1, /kiosk2, /kiosk3 → Student kiosks (currently protected - BROKEN)
```

### Production Route Architecture
```typescript
/ → Smart EntryPoint with role-based routing:
  ├── super_admin → /admin-dashboard (system management)
  ├── admin → /admin-dashboard (school management)  
  ├── teacher → /teacher (classroom management)
  └── unauthenticated → /auth (login/registration)

/dev-login → Development super_admin bypass (password-only)
/kiosk1, /kiosk2, /kiosk3 → Anonymous student access (NO AUTH)
```

---

## 🔐 Security & Access Control

### Current Security Gaps
- No domain restriction on authentication (@school.edu requirement missing)
- Kiosks blocked by authentication (prevents student access)
- Missing super_admin role for system management
- Basic RLS without granular role differentiation

### Production Security Model
```sql
-- Role-Based Access Control (RBAC)
- Google OAuth restricted to @school.edu domain
- RLS policies enforce role hierarchy access
- Anonymous kiosk access for student reflections
- Development environment super_admin bypass

-- Data Protection
- Students: No direct database access, anonymous kiosk interaction
- Teachers: Access own BSRs and assigned reflections only  
- Admins: School-wide data access for management
- Super Admin: Full system access including user management
```

---

## 📱 Mobile-First Requirements

### Current Mobile Limitations
- Desktop-ported responsive design (not mobile-first)
- Button-based navigation (no gesture support)
- Touch targets too small for reliable tablet interaction
- Missing native mobile interaction patterns

### Production Mobile Specifications
```typescript
// Touch Optimization Requirements
- Minimum 44px touch targets for all interactive elements
- Gesture recognition: <50ms swipe detection threshold
- Touch response latency: <100ms for all interactions
- Haptic feedback: navigator.vibrate([100]) for touch responses
- Progressive disclosure for complex forms with smooth animations

// Performance Benchmarks
- Kiosk load time: <2 seconds on iPad (iOS 12+)
- Gesture response: 60fps smooth animations using transform/opacity
- Memory usage: <100MB for sustained kiosk operation
- Network efficiency: <1MB initial load, <10KB per interaction

// Device Support Priority Matrix
- Primary: iPad (iOS 12+) / Android tablets (API 21+) for kiosk deployment
- Secondary: iPhone (iOS 12+) for teacher mobile access  
- Tertiary: Desktop browsers (Chrome 90+, Safari 14+, Firefox 88+)
- Testing: Chrome DevTools mobile emulation + actual device validation
```

---

## ⚡ Real-Time System Requirements

### Current Real-Time Gaps
- No notification system implemented
- Queue updates require manual refresh
- No real-time communication between teacher/student interactions
- Missing live position tracking for kiosk queue

### Production Real-Time Architecture
```typescript
// Supabase Real-Time Subscriptions
- Queue position updates for students at kiosks
- BSR notifications for teachers (new requests, reflections submitted)
- Reflection approval status for queue management
- System announcements for all authenticated users

// Notification Bell System
- Role-based notification filtering
- Notification persistence and history
- Toast integration for immediate alerts
- Badge counts for unread notifications
```

---

## 📊 Data Architecture & Workflow State Machine

### Core Tables & Relationships
```sql
profiles (user roles & authentication)
├── students (classroom roster)
├── behavior_requests (BSR workflow state)
├── reflections (student responses) 
├── kiosks (tablet station management)
└── user_sessions (activity tracking)
```

### BSR Workflow State Machine
```
BSR Created (teacher) → Queue Position Assigned → Kiosk Available → 
Student Reflection → Teacher Review → [Approved|Revision Requested] → 
Completed/Archived
```

---

## 🚨 Critical Implementation Priorities

### BLOCKING ISSUES (Must Fix Immediately)
1. **Kiosk Authentication Removal** - Students cannot access system
2. **Super Admin Role Creation** - Zach needs system management access  
3. **Google OAuth Domain Restriction** - Security requirement for school deployment

### HIGH PRIORITY (Production Quality)
4. **Mobile Touch Optimization** - Required for tablet kiosk deployment
5. **Real-Time Notification System** - Essential for teacher workflow efficiency
6. **Role-Based Landing Logic** - Improves user experience and security

### MEDIUM PRIORITY (Enhancement)  
7. **Tutorial System** - Improves new user onboarding
8. **Advanced Mobile Gestures** - Enhanced user experience
9. **Comprehensive Analytics** - Long-term system optimization

---

## 🎯 Sprint Success Metrics

### Functional Validation
- [ ] Students can complete reflections without authentication barriers
- [ ] Teachers receive real-time queue and reflection notifications
- [ ] Admins can manage users and monitor system health  
- [ ] Super admin can access development environment and reset system
- [ ] Mobile tablets support all core kiosk functionality

### Technical Validation
- [ ] Google OAuth restricts access to @school.edu domain only
- [ ] All RLS policies enforce proper role-based access control
- [ ] Real-time subscriptions perform efficiently under classroom load
- [ ] Mobile-first responsive design validated across target devices
- [ ] Security audit passes all production readiness checks

---

## 🔗 Integration & Deployment Context

### Supabase Services Integration
- **Database:** PostgreSQL with RLS for secure multi-role access
- **Authentication:** Google OAuth + email/password with domain restrictions  
- **Real-Time:** WebSocket subscriptions for live queue and notification updates
- **Edge Functions:** Custom logic for user creation and session management

### Deployment Environment
- **Platform:** Lovable with automatic deployment pipeline
- **Domain:** Custom school domain configuration required
- **Performance:** Optimized for classroom network conditions and tablet hardware
- **Monitoring:** Real-time error tracking and performance metrics

---

**🧭 This knowledge document serves as the master compass for the BX-OS production sprint. Reference the transformation blueprint for detailed technical specifications and the sprint checklist for implementation execution. All three documents work together to ensure successful prototype-to-production transformation within the 24-hour sprint timeline.**