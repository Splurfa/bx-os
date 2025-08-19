# Phase 4: Sprint Plan Assembly - ARCHITECTURAL FOUNDATION COMPLETION

## Sprint Overview

**CRITICAL DISCOVERY**: System requires foundational architecture completion before any feature work or data population can succeed reliably.

**REVISED SPRINT GOAL**: Build missing authentication, authorization, session management, and kiosk device instance management infrastructure to enable core functionality.

## Phase 0.5: Kiosk Device Instance Management System (Hours 0-4)

### Database Schema Enhancement
**Task**: Add device session tracking to kiosks table
**Database Migration Required**:
```sql
ALTER TABLE kiosks ADD COLUMN device_session_id UUID;
ALTER TABLE kiosks ADD COLUMN device_last_seen TIMESTAMP WITH TIME ZONE;
ALTER TABLE kiosks ADD COLUMN device_heartbeat_interval INTEGER DEFAULT 30;
```

### Dynamic Kiosk Route Architecture
**Task**: Replace static routes with dynamic assignment system
**Files to Create**:
- `src/components/UniversalKiosk.tsx` - Single kiosk component for all devices
- `src/hooks/useDeviceSession.ts` - Device session management hook
- `src/lib/deviceSessionManager.ts` - Device identification and binding utilities

**Files to Modify**:
- `src/App.tsx` - Replace `/kiosk1`, `/kiosk2`, `/kiosk3` with single `/kiosk` route
- `src/contexts/KioskContext.tsx` - Add device session management functions
- `src/components/AdminDashboard.tsx` - Add kiosk access URL generation

### Device-to-Kiosk Binding System
**Task**: Implement secure device instance control
**Success Criteria**:
- Multiple browser tabs cannot control the same kiosk simultaneously
- Admin dashboard generates unique kiosk access URLs
- Device sessions automatically timeout after 2 minutes of inactivity
- Kiosk assignment works reliably with dynamic routing
- Device heartbeat system prevents ghost sessions

### Security & Access Control Features
**Task**: Prevent multi-device conflicts and maintain admin control
- Device session validation before kiosk operations
- "Kiosk in use by another device" error handling
- Automatic session cleanup after inactivity
- Admin dashboard shows device session status per kiosk
- Force-release device control for admins

## Phase 1: Emergency Security Architecture (Hours 4-8)

### Role-Based Route Protection Implementation
**Task**: Create `AdminRoute` and `TeacherRoute` components for proper authorization
**Files to Create**:
- `src/components/AdminRoute.tsx`
- `src/components/TeacherRoute.tsx`

**Files to Modify**:
- `src/App.tsx` - Replace `ProtectedRoute` with role-based components
- Remove generic `ProtectedRoute` usage from admin/teacher dashboards

**Success Criteria**:
- Teachers cannot access Admin Dashboard
- Admins cannot access Teacher Dashboard  
- Route protection validates both authentication AND authorization

### UI Permission Framework Development
**Task**: Build component-level authorization system
**Files to Create**:
- `src/hooks/usePermissions.ts` - Permission validation hook
- `src/lib/permissions.ts` - Permission helper utilities

**Files to Modify**:
- `src/components/UserManagement.tsx` - Add role-based visibility
- `src/components/AdminDashboard.tsx` - Implement permission checks
- `src/components/TeacherDashboard.tsx` - Add appropriate restrictions

**Success Criteria**:
- Admin functions hidden from non-admin users
- "Add User" button only visible to super_admin
- Component permissions enforce role boundaries

## Phase 2: Session & User Management Reconstruction (Hours 8-11)

### Session Architecture Fixes
**Task**: Rebuild session creation and user correlation logic
**Files to Modify**:
- `src/hooks/useActiveSessions.ts` - Fix session creation logic
- Separate device type tracking from user role correlation
- Fix "Unknown User" display issues
- Implement proper session deduplication

**Success Criteria**:
- Session tracking shows correct user information
- Role correlation works with Google OAuth users
- Device tracking doesn't interfere with user identification

### User Management Fixes
**Task**: Implement proper user management restrictions
**Files to Modify**:
- `src/components/UserManagement.tsx`
- Hide "Add User" button for non-super_admin roles
- Implement user deactivation (soft delete) instead of hard delete
- Add proper error handling for user operations

**Success Criteria**:
- User management functions restricted to appropriate roles
- Soft delete implemented for user archival
- Error handling prevents system crashes

## Phase 3: Core Functionality Restoration (Hours 11-13)

### Anonymous Kiosk Access Liberation
**Task**: Integrate with Device Instance Management System
**Files to Modify**:
- Ensure `/kiosk` route works with device session system
- Validate anonymous access works with device binding
- Test queue management with device-based identification

**Success Criteria**:
- Students can access `/kiosk` route without authentication
- Device session management works for anonymous users
- Anonymous users can submit reflections through device-bound kiosks
- Security boundaries maintained for sensitive operations

### NotificationBell Functionality Restoration
**Task**: Fix dropdown interaction and real-time updates
**Files to Modify**:
- `src/components/NotificationBell.tsx` - Debug dropdown interaction issues
- Test click handlers and dropdown positioning
- Validate real-time subscription functionality
- Fix mobile touch optimization

**Success Criteria**:
- NotificationBell dropdown responds to clicks
- Real-time notifications update correctly
- Mobile interactions work properly
- Badge count updates accurately

### Queue Management Data Flow Correction
**Task**: Fix student lookup and display logic
**Files to Modify**:
- `src/hooks/useSupabaseQueue.ts` - Fix student lookup field names
- Change from non-existent `name` field to `first_name + last_name`
- Fix queue display filtering that hides active students
- Correct assignment flow logic

**Success Criteria**:
- Student lookup uses correct field names (`first_name + last_name`)
- Queue display shows all student statuses correctly
- Students don't disappear from interface when assigned to kiosks
- Data flow maintains consistency between database and UI

## Phase 4: Data Integrity & CSV Import (Hours 13-14)

### Student Data Logic Correction
**Task**: Fix CSV import logic for existing schema
**Files to Modify**:
- `src/lib/csvImport.ts` - Correct student/family relationship logic
- Stop attempting to create immutable student records
- Fix family deduplication algorithm
- Validate imported data integrity

**Success Criteria**:
- CSV import populates existing schema correctly
- No attempts to modify immutable student/family records
- Family relationships established properly
- Data validation prevents corruption

## Phase 5: Documentation Correction (Hours 14-15)

### Sprint Folder Hygiene
**Task**: Update misleading documentation to reflect actual system state
**Files to Modify**:
- Correct all "100% Complete" and "Production Ready" claims in markdown files
- Update implementation checklist with accurate progress tracking
- Align success metrics with actual validation results
- Document architectural gaps discovered

**Success Criteria**:
- Documentation accurately reflects system state
- Implementation checklist shows actual progress
- Success metrics align with testing results
- Architecture gaps properly documented

## Success Criteria & Validation

### Critical (Must Complete)
- [ ] Multiple browser tabs cannot control the same kiosk simultaneously
- [ ] Admin dashboard generates unique kiosk access URLs
- [ ] Teachers cannot access Admin Dashboard
- [ ] Admins cannot access Teacher Dashboard
- [ ] NotificationBell dropdown responds to clicks
- [ ] Students can access kiosk routes without authentication
- [ ] Session tracking shows correct user information
- [ ] Device sessions automatically timeout after inactivity

### High Priority (Should Complete)
- [ ] User management functions restricted to appropriate roles
- [ ] Student lookup uses correct field names (`first_name + last_name`)
- [ ] Queue display shows all student statuses correctly
- [ ] CSV import works with existing schema without creating duplicate records

### Moderate Priority (Could Complete)
- [ ] Documentation accurately reflects system state
- [ ] Success metrics validated with proper testing
- [ ] Soft delete implemented for user management
- [ ] Real-time notifications work across all devices

## Risk Assessment

### High Risk Items
- **Device session management**: Risk of kiosk lockouts or assignment conflicts
- **Dynamic routing changes**: Risk of breaking existing kiosk bookmarks/navigation
- **Authentication changes**: Risk of locking out users or creating security vulnerabilities
- **Session management**: Risk of data loss or user confusion during reconstruction
- **Anonymous access**: Risk of exposing sensitive data or creating security gaps

### Medium Risk Items
- **Route restructuring**: Risk of breaking existing navigation
- **Database operations**: Risk of data corruption during CSV import fixes
- **UI permission changes**: Risk of hiding critical functionality inappropriately

### Low Risk Items
- **Documentation updates**: Minimal risk of system impact
- **NotificationBell fixes**: Contained component with limited system impact
- **Queue display logic**: Presentation layer changes with minimal data risk

## Implementation Sequence

### Day 1 Focus: Device & Security Architecture
- Morning: Device Instance Management System implementation
- Afternoon: Role-based route protection and UI permission framework

### Day 2 Focus: Core Functionality  
- Morning: Session management reconstruction and UI permissions
- Afternoon: Anonymous kiosk integration and NotificationBell fixes

### Day 3 Focus: Data Integrity & Documentation
- Morning: Queue management, data flow corrections, and CSV import fixes
- Afternoon: Documentation correction and sprint completion validation

This sprint plan prioritizes **architectural foundation completion** to enable reliable feature implementation and data population in future sprints.