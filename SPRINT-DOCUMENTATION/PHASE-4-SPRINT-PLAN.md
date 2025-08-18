# Phase 4: Sprint Plan Assembly - ARCHITECTURAL FOUNDATION COMPLETION

## Sprint Overview

**CRITICAL DISCOVERY**: System requires foundational architecture completion before any feature work or data population can succeed reliably.

**REVISED SPRINT GOAL**: Build missing authentication, authorization, and session management infrastructure to enable core functionality.

## Phase 1: Emergency Security Architecture (Hours 0-4)

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

## Phase 2: Session & User Management Reconstruction (Hours 4-7)

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

## Phase 3: Core Functionality Restoration (Hours 7-9)

### Anonymous Kiosk Access Liberation
**Task**: Remove authentication barriers from student kiosk routes
**Files to Modify**:
- `src/App.tsx` - Remove `ProtectedRoute` wrappers from `/kiosk1`, `/kiosk2`, `/kiosk3`
- Supabase RLS policies - Allow anonymous access for kiosk operations
- Add device-based identification for queue management

**Success Criteria**:
- Students can access kiosk routes without authentication
- Anonymous users can submit reflections
- Queue management works with anonymous access
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

## Phase 4: Data Integrity & CSV Import (Hours 9-10)

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

## Phase 5: Documentation Correction (Hours 10-11)

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
- [ ] Teachers cannot access Admin Dashboard
- [ ] Admins cannot access Teacher Dashboard
- [ ] NotificationBell dropdown responds to clicks
- [ ] Students can access kiosk routes without authentication
- [ ] Session tracking shows correct user information

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

### Day 1 Focus: Security Architecture
- Morning: Role-based route protection
- Afternoon: UI permission framework and session fixes

### Day 2 Focus: Core Functionality  
- Morning: Anonymous kiosk access and NotificationBell fixes
- Afternoon: Queue management and data flow corrections

### Day 3 Focus: Data Integrity & Documentation
- Morning: CSV import fixes and data validation
- Afternoon: Documentation correction and sprint completion validation

This sprint plan prioritizes **architectural foundation completion** to enable reliable feature implementation and data population in future sprints.