# 📋 BX-OS Knowledge Container Content

**This content should be copied and pasted into the project's knowledge container for AI alignment throughout the production sprint.**

---

## 🎯 PROJECT CONTEXT: BX-OS Production Sprint

**CURRENT PHASE:** 24-hour production transformation sprint  
**OBJECTIVE:** Transform Student Behavior Management System from prototype to classroom-ready production system

### 🗂️ DOCUMENTATION HIERARCHY

**Master Knowledge Compass:** `BX-OS-PRODUCTION-KNOWLEDGE.md`
- Strategic overview and system understanding
- Role definitions and workflow documentation  
- Integration context and success metrics

**Technical Transformation Map:** `docs/architecture/transformation-blueprint.md`  
- Current state → Future state architectural mapping
- Domain-specific transformation requirements
- Implementation specifications and dependencies

**Sprint Execution Guide:** `docs/technical/production-sprint-checklist.md`
- Hour-by-hour implementation checklist
- Critical checkpoints and rollback procedures
- Acceptance criteria and verification steps

---

## 🚨 CRITICAL IMPLEMENTATION PRIORITIES

### IMMEDIATE BLOCKERS (Must Fix First)
1. **Remove authentication from kiosk routes** - Students cannot access reflection system
2. **Create super_admin role** - Zach needs system management capabilities  
3. **Implement Google OAuth domain restriction** - Security requirement for @school.edu

### HIGH PRIORITY (Production Essential)
4. **Mobile-first touch optimization** - Tablets are primary kiosk hardware
5. **Real-time notification system** - Teachers need immediate queue awareness
6. **Role-based landing page logic** - Proper user experience flow

---

## 👥 USER ROLES & ACCESS PATTERNS

### Super Admin (Zach: zach@zavitechllc.com)
- **Access:** Development bypass via `/dev-login` + full system control
- **Capabilities:** User management, system reset, all data access
- **Implementation:** Must create `super_admin` role in database enum

### Admin (School Administrators)  
- **Access:** Google OAuth @school.edu domain + admin dashboard
- **Capabilities:** Student/teacher management, system monitoring, kiosk testing
- **Landing:** `/admin-dashboard` after authentication

### Teacher (Classroom Teachers)
- **Access:** Google OAuth @school.edu domain + teacher interface  
- **Capabilities:** Create BSRs, review reflections, manage classroom queue
- **Landing:** `/teacher` after authentication

### Students (Kiosk Users)
- **Access:** Anonymous access, NO AUTHENTICATION required
- **Capabilities:** Complete 4-question reflections, view queue position
- **Routes:** `/kiosk1`, `/kiosk2`, `/kiosk3` must work without auth

---

## 🏗️ TECHNICAL ARCHITECTURE REQUIREMENTS

### Authentication System
```typescript
// CURRENT (Broken): All routes require auth, kiosks blocked
// REQUIRED (Production):
- Google OAuth restricted to @school.edu domain
- Password fallback for all users  
- /dev-login bypass for super_admin development access
- Kiosk routes (/kiosk1, /kiosk2, /kiosk3) NO AUTH required
```

### Mobile-First Design Requirements
```typescript  
// CURRENT (Problem): Desktop-first responsive, button navigation
// REQUIRED (Production):
- Touch-first design with 44px minimum targets
- Gesture-based navigation (swipe support)
- Tablet-optimized kiosk interfaces
- Progressive disclosure for complex forms
```

### Real-Time System Requirements
```typescript
// CURRENT (Missing): No notifications, manual refresh required  
// REQUIRED (Production):
- Notification bell in teacher/admin headers
- Real-time queue position updates for students
- Live BSR notifications for teachers
- Toast system integration for immediate alerts
```

---

## 🔄 TRANSFORMATION WORKFLOW

### Phase 1: Foundation (Hours 0-8)
**Critical Path:** Authentication overhaul + kiosk liberation
- Remove ProtectedRoute from kiosk paths
- Implement super_admin role and /dev-login  
- Configure Google OAuth domain restriction
- **Checkpoint:** Kiosks accessible, super_admin functional

### Phase 2: Role System (Hours 8-12)  
**Critical Path:** Role-based access control + smart routing
- Create role-aware landing page logic
- Implement permission system for UI components
- Update RLS policies for role hierarchy
- **Checkpoint:** Role-based routing and permissions working

### Phase 3: Mobile UI (Hours 12-18)
**Critical Path:** Touch optimization + gesture support  
- Create mobile-first component library
- Implement swipe navigation and touch targets
- Optimize kiosk interfaces for tablets
- **Checkpoint:** Mobile devices fully functional

### Phase 4: Real-Time (Hours 18-22)
**Critical Path:** Notification system + live updates
- Implement notification bell with real-time subscriptions
- Add toast integration and queue updates  
- Create role-based notification filtering
- **Checkpoint:** Real-time communication operational

### Phase 5: Polish (Hours 22-24)
**Critical Path:** Tutorial system + production readiness
- Add onboarding tutorials for each role
- Comprehensive testing and security validation
- **Final Checkpoint:** System ready for classroom deployment

---

## 🚨 ROLLBACK PROCEDURES

### Authentication Rollback
**If Google OAuth fails:** Maintain password auth + kiosk liberation (critical)

### Mobile UI Rollback  
**If gestures fail:** Fall back to optimized button navigation with large touch targets

### Real-Time Rollback
**If Supabase subscriptions fail:** Implement polling fallback for queue updates

---

## ✅ SUCCESS CRITERIA VALIDATION

### Functional Requirements
- [ ] Students access kiosks without authentication barriers
- [ ] Teachers receive real-time queue notifications
- [ ] Super admin has development access via /dev-login
- [ ] Google OAuth restricted to @school.edu domain  
- [ ] Mobile tablets support all core functionality

### Technical Requirements
- [ ] RLS policies enforce role-based security
- [ ] Real-time updates perform efficiently
- [ ] Mobile-first responsive design validated
- [ ] Cross-browser compatibility verified
- [ ] Security audit passes completely

---

## 📚 AI IMPLEMENTATION GUIDANCE

### Always Reference Documentation
Before implementing any changes, consult:
1. **Current task context** from `docs/technical/production-sprint-checklist.md`
2. **Technical specifications** from `docs/architecture/transformation-blueprint.md`  
3. **System overview** from `BX-OS-PRODUCTION-KNOWLEDGE.md`

### Implementation Principles
- **Mobile-First:** Design for tablets, enhance for desktop
- **Security-Conscious:** Maintain RLS while enabling anonymous kiosk access
- **Performance-Aware:** Real-time features must not impact classroom usability
- **Role-Centric:** Every UI decision should consider user role context

### Critical Success Factors
1. **Kiosk Liberation:** Students MUST access reflection system without authentication
2. **Role Hierarchy:** Super admin → Admin → Teacher access control must function  
3. **Mobile Optimization:** Tablet interfaces MUST be touch-friendly and responsive
4. **Real-Time Communication:** Teachers MUST receive immediate queue awareness

---

**🎯 SPRINT SUCCESS DEFINITION:** All critical functionality operational, system ready for immediate classroom deployment, mobile-first design validated, security requirements met.**