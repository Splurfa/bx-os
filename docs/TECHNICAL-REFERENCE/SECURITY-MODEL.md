# Security Model & Access Control

## Overview

BX-OS implements a comprehensive security model based on role-based access control (RBAC), row-level security, and authentication boundaries designed for school environments.

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
super_admin > admin > teacher
```

### Role Definitions

**Teacher**
- Primary users: Classroom teachers, specialist teachers, educational staff
- Access scope: Student behavior management and classroom functions
- Security level: Standard user with teaching privileges

**Administrator (admin)**
- Primary users: Assistant principals, department heads, office managers  
- Access scope: School operations and system oversight (excluding user management)
- Security level: Administrative privileges with user management restrictions

**Super Administrator (super_admin)**
- Primary users: Principal, IT administrator, system owner
- Access scope: Complete system control including user lifecycle management
- Security level: Full administrative control

### Permission Matrix

| Function | Teacher | Admin | Super Admin |
|----------|---------|-------|-------------|
| **User Management** |
| View user profiles | ❌ | ✅ | ✅ |
| Create new users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Delete/deactivate users | ❌ | ❌ | ✅ |
| **Queue Management** |
| View all queues | ❌ | ✅ | ✅ |
| Clear all queues | ❌ | ✅ | ✅ |
| Create behavior requests | ✅ | ✅ | ✅ |
| **System Administration** |
| Manage kiosks | ❌ | ✅ | ✅ |
| View system logs | ❌ | ❌ | ✅ |
| Export data | ❌ | ✅ | ✅ |

## Authentication Architecture

### Google OAuth Integration

- **Primary Authentication**: Google Workspace accounts via Supabase Auth
- **Domain Validation**: `@hillelhebrew.org` domain users automatically assigned admin role
- **Default Assignment**: New users receive `teacher` role by default
- **Session Management**: JWT tokens with role-based expiration

### Anonymous Access Boundaries

- **Kiosk Routes**: `/kiosk1`, `/kiosk2`, `/kiosk3` accessible without authentication
- **Student Workflow**: Complete reflection process requires no login credentials
- **Privacy Protection**: No student authentication data collected or stored

## Database Security

### Row Level Security (RLS) Policies

**Profiles Table**
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

-- Only super_admin can modify roles
CREATE POLICY "Super admin can update profiles" ON profiles  
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);
```

**Behavior Support Requests**
```sql
-- Teachers can view their own requests
CREATE POLICY "Teachers view own requests" ON behavior_support_requests
FOR SELECT USING (auth.uid() = teacher_id);

-- Admins can view all requests
CREATE POLICY "Admins view all requests" ON behavior_support_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

**Queue Items**
```sql
-- Real-time subscriptions filtered by role
CREATE POLICY "Role-based queue access" ON queue_items
FOR SELECT USING (
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    THEN true
    WHEN EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'teacher')
    THEN teacher_id = auth.uid()
    ELSE false
  END
);
```

## Component-Level Security

### Route Protection

**AdminRoute Component**
```typescript
// Enforces admin or super_admin access
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('admin_access')) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};
```

**TeacherRoute Component**  
```typescript
// Allows teacher, admin, or super_admin access
const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('teacher_access')) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};
```

### UI Access Control

**Conditional Rendering**
```typescript
// Role-based UI element visibility
const UserManagement = () => {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {hasPermission('view_users') && <UserList />}
      {hasPermission('create_users') && <CreateUserButton />}
      {hasPermission('delete_users') && <DeleteUserButton />}
    </div>
  );
};
```

## Data Protection & Privacy

### Student Data Privacy

- **No Authentication Required**: Students never provide personal credentials
- **Minimal Data Collection**: Only reflection responses and timestamps collected
- **Anonymous Processing**: Student identity linked through database ID only
- **Data Minimization**: No unnecessary personal information stored

### Access Logging

- **Authentication Events**: Login/logout tracked with timestamps
- **Administrative Actions**: User management changes logged with actor ID
- **Data Access**: Queue operations and student data access tracked
- **Security Events**: Failed authentication attempts and permission violations logged

## Security Boundaries

### Function-Level Security

**Database Functions**
```sql
-- Example: User creation restricted to super_admin
CREATE OR REPLACE FUNCTION create_user_profile(email text, role text)
RETURNS uuid
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller has super_admin role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: super_admin required';
  END IF;
  
  -- Proceed with user creation
  -- ... implementation
END;
$$ LANGUAGE plpgsql;
```

### Network Security

- **HTTPS Enforcement**: All communication encrypted via TLS
- **CORS Configuration**: API access restricted to authorized domains
- **Rate Limiting**: Supabase built-in rate limiting prevents abuse
- **API Key Protection**: Database access keys properly secured

## Threat Model & Mitigations

### Identified Threats

1. **Unauthorized Admin Access**
   - Mitigation: Multi-factor role verification, audit logging

2. **Student Data Exposure**
   - Mitigation: Anonymous kiosk access, minimal data collection

3. **Privilege Escalation**
   - Mitigation: RLS policies, function-level security checks

4. **Session Hijacking**
   - Mitigation: JWT token expiration, secure cookie settings

### Security Monitoring

- **Real-time Alerts**: Failed authentication attempts trigger notifications
- **Audit Trail**: All administrative actions logged with timestamps
- **Access Patterns**: Unusual access patterns flagged for review
- **Data Integrity**: Regular checks for unauthorized data modifications

## Compliance Considerations

### Educational Privacy

- **FERPA Compliance**: Student data access restricted to authorized staff
- **Data Retention**: Automatic cleanup of old reflection data
- **Consent Management**: Parental consent handled at school level

### Security Standards

- **Access Control**: NIST guidelines for role-based access
- **Data Encryption**: AES-256 for data at rest, TLS 1.3 for transit
- **Authentication**: Multi-factor authentication for administrative accounts

---

**Security Contact**: Report security issues to technical team immediately
**Last Updated**: August 2025
**Review Schedule**: Quarterly security assessment