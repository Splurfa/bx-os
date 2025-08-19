# User Roles & Permissions System

## Role Definitions

### Teacher
**Primary Role**: Classroom behavior management and student interaction
- Target Users: Classroom teachers, specialist teachers, educational staff
- System Access: Limited to teaching-related functions
- Security Level: Standard user with teaching privileges

### Administrator (admin) 
**Primary Role**: School operations and system oversight
- Target Users: Assistant principals, department heads, office managers
- System Access: Comprehensive school operations except user management
- Security Level: Administrative privileges with user management restrictions

### Super Administrator (super_admin)
**Primary Role**: Complete system administration and user governance
- Target Users: Principal, IT administrator, system owner
- System Access: Full system control including user lifecycle management
- Security Level: Complete administrative control

## Permission Matrix

| Permission Category | Action | Teacher | Admin | Super Admin |
|-------------------|--------|---------|-------|-------------|
| **User Management** | View user profiles | ❌ | ✅ | ✅ |
| | Create new users | ❌ | ❌ | ✅ |
| | Change user roles | ❌ | ❌ | ✅ |
| | Delete/deactivate users | ❌ | ❌ | ✅ |
| **Queue Management** | View all queues | ❌ | ✅ | ✅ |
| | Clear all queues | ❌ | ✅ | ✅ |
| | Assign students | ✅ | ✅ | ✅ |
| **Behavior Management** | Create behavior requests | ✅ | ✅ | ✅ |
| | Approve reflections | ✅ | ✅ | ✅ |
| | View own students | ✅ | ✅ | ✅ |
| **Kiosk Management** | Manage kiosks | ❌ | ✅ | ✅ |
| | Create device sessions | ❌ | ✅ | ✅ |
| | View kiosk analytics | ❌ | ✅ | ✅ |
| **System Administration** | View system logs | ❌ | ❌ | ✅ |
| | Manage settings | ❌ | ❌ | ✅ |
| | Export data | ❌ | ✅ | ✅ |

## UI Access Patterns

### Teacher Dashboard
- **Visible Elements**: Own behavior requests, student assignment, reflection approval
- **Hidden Elements**: User management, system settings, kiosk management
- **Navigation**: Limited to teacher-specific functions

### Admin Dashboard  
- **Visible Elements**: All queues, kiosk management, system analytics, user list (read-only)
- **Hidden Elements**: User creation, role changes, user deletion, system settings
- **Navigation**: Full administrative functions except user management

### Super Admin Dashboard
- **Visible Elements**: Complete system access, full user management, system settings
- **Hidden Elements**: None - complete access
- **Navigation**: All system functions available

## User Management Restrictions

### Regular Admin Limitations
- **Cannot Create Users**: No "Add User" button visible
- **Cannot Change Roles**: No role change options in user dropdown
- **Cannot Delete Users**: No delete option in user dropdown  
- **Read-Only Access**: Can view user profiles and information only
- **UI Indicators**: Ellipsis menu (⋯) hidden for user actions

### Super Admin Privileges
- **Full User Lifecycle**: Create, modify, delete users
- **Role Management**: Change any user's role including creating other admins
- **Complete Access**: All user management functions available
- **UI Control**: Full ellipsis menu with all user actions

## Notification Rules & Preferences

### Teacher Notifications
- **Behavior Requests**: Notified when students complete reflections
- **Queue Updates**: Alerts when students are assigned to kiosks
- **System Messages**: General announcements from administration

### Admin Notifications  
- **System Status**: Kiosk connectivity, queue overflow alerts
- **User Activity**: High-level usage analytics
- **Security Events**: Login failures, session anomalies

### Super Admin Notifications
- **User Management**: Account creation, role changes, deletions
- **System Health**: Critical system errors, maintenance needs
- **Security Alerts**: Failed authorization attempts, suspicious activity

## Authentication & Security

### Role Assignment Rules
1. **Default Role**: New users assigned 'teacher' role by default
2. **Email-Based Assignment**: `@hillelhebrew.org` domain users get 'admin' role
3. **Super Admin Assignment**: Only existing super_admin can create other super_admins
4. **Role Hierarchy**: super_admin > admin > teacher (no lateral role changes)

### Session Management
- **Role Validation**: Each request validates current user role
- **Permission Caching**: Role permissions cached per session
- **Automatic Logout**: Sessions expire based on role-specific timeouts

### Security Boundaries
- **Function-Level**: All API calls verify role permissions
- **UI-Level**: Interface elements hidden based on user role
- **Database-Level**: RLS policies enforce data access restrictions

## Implementation Notes

### Frontend Components
- `AdminRoute`: Protects admin-only pages (admin + super_admin)
- `TeacherRoute`: Protects teacher-accessible pages (teacher + admin + super_admin)  
- `usePermissions`: Hook providing role-based permission checks
- `UserManagement`: Component with conditional rendering based on role

### Backend Functions
- `create-user`: Restricted to super_admin role only
- `handle_new_user_registration`: Automatic role assignment trigger
- `get_current_user_role`: Security definer function for role checking

### Database Policies
- Row Level Security enforces data access by role
- Profile table restrictions prevent unauthorized role changes
- Audit logging tracks all administrative actions

---

*This document serves as the canonical reference for BX-OS role-based access control. Update this document whenever permissions or role definitions change.*