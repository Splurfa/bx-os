# 📋 BX-OS Sprint Feature Requirements - Architectural Prerequisites Added

## 🚨 CRITICAL PREREQUISITE: ARCHITECTURAL FOUNDATION

**IMPORTANT**: All feature implementations require completing the foundational architecture first. The following features cannot be implemented reliably until authentication, authorization, and session management systems are functional.

## 🔐 PHASE 0.5: KIOSK DEVICE INSTANCE MANAGEMENT (CRITICAL PREREQUISITE)

### **Device Session Management**
**Status**: ❌ CRITICAL ARCHITECTURAL GAP
**Required Components**:
- `src/components/UniversalKiosk.tsx` - Single kiosk component
- `src/hooks/useDeviceSession.ts` - Device session management
- `src/lib/deviceSessionManager.ts` - Device binding utilities
- Database migration for device session columns

**Success Criteria**:
- Single `/kiosk` route with dynamic assignment
- Device sessions prevent multi-tab conflicts  
- Admin dashboard generates kiosk access URLs
- Automatic session cleanup after 2 minutes inactivity
- Force-release controls for administrators

**Dependencies**: None
**Blocks**: All kiosk-related functionality

### **Dynamic Kiosk Route System**
**Status**: ❌ MISSING - Requires Complete Rebuild
**Required Components**:
- Replace static `/kiosk1`, `/kiosk2`, `/kiosk3` routes
- Device-to-kiosk binding algorithm
- Heartbeat system for session maintenance
- Admin URL generation system

**Success Criteria**:
- Prevents kiosk access conflicts across devices
- Maintains admin control over kiosk assignments
- Provides secure anonymous access for students
- Enables reliable device session tracking

**Dependencies**: Database schema enhancement
**Blocks**: Anonymous kiosk access, admin kiosk management

## 🔐 PHASE 1: FOUNDATIONAL ARCHITECTURE (PREREQUISITE)

### Role-Based Authentication System
**Status**: ❌ MISSING - Critical blocker for all features
**Components Required**:
- `AdminRoute` component for admin dashboard protection
- `TeacherRoute` component for teacher dashboard protection  
- `usePermissions` hook for component-level authorization
- Permission helper utilities for role validation

**Success Criteria**:
- Teachers cannot access admin dashboards
- Admins have proper administrative privileges
- Anonymous users can access kiosk routes only
- Role-based functionality properly enforced

### Session Management Architecture
**Status**: ❌ BROKEN - Requires complete reconstruction
**Components Required**:
- Rebuilt `useActiveSessions` hook with proper user correlation
- Device tracking separated from role management
- Google OAuth user session handling
- Session deduplication and cleanup

**Success Criteria**:
- Session tracking shows correct user information
- "Unknown User" issues resolved
- Role correlation works across auth methods
- Device tracking doesn't interfere with user identification

### UI Permission Framework
**Status**: ❌ MISSING - Required for secure feature implementation
**Components Required**:
- Component-level permission validation
- Role-based UI element visibility controls
- Admin function restriction system
- User management access controls

**Success Criteria**:
- Admin functions hidden from non-admin users
- "Add User" functionality restricted to super_admin
- Role-appropriate UI elements displayed
- Security boundaries maintained in UI

## 📱 PHASE 2: CORE FEATURE IMPLEMENTATION

### Anonymous Kiosk Access System
**Status**: ❌ BLOCKED by Device Session Management
**Prerequisites**: Device Instance Management System complete
**Components Required**:
- Integration with Device Instance Management System
- Anonymous access validation with device binding
- Secure kiosk operations without authentication

**Success Criteria**:
- Students access `/kiosk` route without authentication
- Device session management works for anonymous users
- Anonymous reflection submission through device-bound kiosks
- Maintained security boundaries for sensitive operations

**Dependencies**: Device Instance Management System, RLS policy updates
**Blocks**: Student kiosk workflows

**Feature Specifications**:
- Students access kiosks without login
- Anonymous behavior request submission
- Device identification for queue tracking
- Secure data boundaries maintained
- Session tracking for usage analytics

**Success Criteria**:
- Students can access all three kiosk interfaces without authentication
- Behavior requests submitted anonymously appear in teacher queues
- Queue management maintains student privacy
- Security audit passes for anonymous access implementation

### Real-Time Notification System
**Status**: ❌ BROKEN - NotificationBell exists but interactions fail
**Prerequisites**: UI permission framework and session management complete
**Components Required**:
- Fix NotificationBell dropdown interaction handling
- Implement real-time Supabase subscriptions for behavior requests
- Add role-based notification filtering
- Mobile touch optimization for notification interactions

**Feature Specifications**:
- Real-time notification badge with accurate counts
- Dropdown notification list with role-based filtering
- Mobile-optimized touch interactions
- PWA notification integration for offline scenarios
- Sound/vibration support for mobile devices

**Success Criteria**:
- NotificationBell dropdown responds to clicks/touches
- Real-time updates appear within 2 seconds of creation
- Role-based filtering shows appropriate notifications only
- Mobile interactions work smoothly on tablets
- PWA notifications function when app is backgrounded

### Student Queue Management System
**Status**: ❌ BROKEN - Data flow issues prevent proper operation
**Prerequisites**: Session management and UI permissions complete
**Components Required**:
- Fix student lookup logic using correct field names (`first_name + last_name`)
- Repair queue display filtering that hides active students
- Correct assignment flow logic preventing student disappearance
- Implement proper queue status transitions

**Feature Specifications**:
- Real-time queue display with all student statuses visible
- Student assignment to kiosks maintains visibility
- Status transitions tracked accurately
- Teacher dashboard shows complete queue state
- Queue management respects student privacy boundaries

**Success Criteria**:
- All students visible in queue regardless of assignment status
- Student lookup works with correct name field concatenation
- Queue filtering shows accurate status for each student
- Assignment flow maintains data consistency between UI and database
- Real-time updates reflect queue changes immediately

## 📊 PHASE 3: DATA POPULATION & ENHANCEMENT

### CSV Import System
**Status**: ❌ BROKEN - Logic incompatible with existing schema
**Prerequisites**: All foundational architecture complete
**Components Required**:
- Fix CSV import logic to work with existing student/family schema
- Implement family deduplication algorithm
- Correct relationship establishment between students and families
- Add data validation to prevent corruption

**Feature Specifications**:
- Process flat CSV data into relational family/student structure
- Family grouping based on contact information similarity
- Import 100+ students with complete family relationships
- Guardian contact records with communication preferences
- External correlation markers for future SIS integration

**Success Criteria**:
- CSV import completes within 5 minutes for 100+ students
- Family relationships properly normalized with zero duplication
- All student data correctly linked to appropriate families
- Guardian contact information imported with correct preferences
- Data integrity validated post-import with no corruption

### Google OAuth Integration
**Status**: ❌ MISSING - Only email/password auth configured
**Prerequisites**: Role-based authentication system complete
**Components Required**:
- Configure Google Cloud Console OAuth client
- Set up Supabase Google Auth provider
- Integrate Google OAuth option into existing auth flow
- Add domain restrictions for teacher/admin accounts

**Feature Specifications**:
- Google OAuth option in authentication interface
- Domain-restricted access for educational organization
- Seamless integration with existing email/password flow
- Automatic role assignment based on domain/email patterns
- Profile creation and management for OAuth users

**Success Criteria**:
- Google OAuth button functional in auth interface
- Domain restrictions prevent unauthorized access
- OAuth users properly correlated with session management
- Role assignment works correctly for Google-authenticated users
- Profile management maintains consistency across auth methods

## 🔧 PHASE 4: SYSTEM OPTIMIZATION (OPTIONAL)

### Tutorial System Implementation
**Status**: ❌ MISSING - Optional enhancement for user onboarding
**Prerequisites**: All core features functional and tested
**Components Required**:
- TutorialModal component with role-based content
- Step progression and completion tracking
- Skip/replay functionality
- Interactive guidance for core system functions

**Feature Specifications**:
- Role-specific tutorial content (teacher, admin, student)
- Progressive step-by-step guidance
- Interactive elements highlighting key functionality
- Completion tracking and replay options
- Mobile-optimized tutorial interface

**Success Criteria**:
- Tutorial system guides new users through core functionality
- Role-based content appropriate for user type
- Skip option allows experienced users to bypass guidance
- Tutorial completion tracked for analytics
- Mobile interface provides clear guidance on touch interactions

### PWA Enhancement System
**Status**: ✅ PARTIAL - Install hooks exist, needs notification integration
**Prerequisites**: Notification system and core features complete
**Components Required**:
- PWA installation guidance within notification system
- Offline capability for core student reflection functionality
- Background sync for reflection submissions
- Mobile notification handling for PWA environment

**Feature Specifications**:
- Installation prompts integrated with notification system
- Offline reflection capability with sync when online
- Background notifications for teachers when app is closed
- PWA-optimized interfaces for mobile tablet deployment
- Cache management for offline functionality

**Success Criteria**:
- PWA installation guidance increases mobile adoption
- Offline reflection functionality works reliably
- Background notifications delivered to PWA users
- Cache management maintains performance
- Tablet deployment ready for classroom environments

## 🎯 IMPLEMENTATION SEQUENCE & DEPENDENCIES

### Critical Path Dependencies
1. **Device Instance Management** → Enables secure kiosk access
2. **Authentication & Authorization** → Enables role-based access control
3. **Session Management** → Enables user tracking and correlation
4. **Anonymous Kiosk Access** → Enables student workflows
5. **Data Population** → Enables realistic testing and validation

### Feature Interdependencies
- **Device Session Management** blocks **Anonymous Kiosk Access**
- **Authentication System** blocks **User Management** and **Session Tracking**
- **UI Permission Framework** blocks **Admin Dashboard** and **User Management**
- **Student Queue Management** requires **Anonymous Kiosk Access** and **Session Management**
- **CSV Import System** requires **Authentication System** for admin access control

### Risk Mitigation Strategy
**Phase 0.5**: Complete Device Instance Management to prevent kiosk conflicts
**Phase 1-2**: Complete foundational architecture before feature implementation
**Phase 3-4**: Implement features only after stable foundation is confirmed
**Testing**: Validate each phase before proceeding to prevent cascade failures

**CRITICAL**: System requires **Device Instance Management** and **foundational architecture completion** before any feature work or data population can succeed reliably.