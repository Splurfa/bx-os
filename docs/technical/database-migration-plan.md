# 🗄️ Database Migration Plan - Super Admin Role

## Migration Overview
**Objective:** Add `super_admin` role to existing role hierarchy without disrupting current functionality.

---

## 🔍 Pre-Migration Analysis

### Current Database State
```sql
-- Current role enum
CREATE TYPE role_type AS ENUM ('teacher', 'admin');

-- Current profiles table structure
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role role_type NOT NULL DEFAULT 'teacher',
  -- ... other columns
);
```

### Impact Assessment
- **Low Risk:** Adding enum value is non-breaking operation
- **Zero Downtime:** Existing data remains unchanged
- **Rollback Available:** Can remove enum value if needed

---

## 📋 Migration Steps

### Step 1: Add Super Admin Role to Enum
```sql
-- Add new role type to existing enum
ALTER TYPE role_type ADD VALUE 'super_admin';

-- Verify addition
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'role_type'::regtype;
```

### Step 2: Update Zach's Profile
```sql
-- Assign super_admin role to Zach
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'zach@zavitechllc.com';

-- Verify update
SELECT email, role FROM profiles WHERE role = 'super_admin';
```

### Step 3: Update RLS Policies
```sql
-- Update existing policies to include super_admin
-- Example for admin-level access
ALTER POLICY "Admins can update any profile" ON profiles 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'super_admin')
  )
);
```

### Step 4: Update Database Functions
```sql
-- Update get_current_user_role function if needed
-- Update admin_update_user_role to allow super_admin operations
-- Verify all functions handle super_admin role properly
```

---

## ✅ Verification Checklist

### Pre-Migration Verification
- [ ] Backup current database state
- [ ] Verify Zach's profile exists: `SELECT * FROM profiles WHERE email = 'zach@zavitechllc.com';`
- [ ] Document current RLS policies

### Post-Migration Verification  
- [ ] Confirm super_admin enum value exists
- [ ] Verify Zach has super_admin role assigned
- [ ] Test super_admin can access admin dashboard
- [ ] Validate existing teacher/admin functionality unchanged
- [ ] Run security audit to ensure RLS policies updated correctly

### Integration Testing
- [ ] Test authentication flow for super_admin
- [ ] Verify permission inheritance (super_admin > admin > teacher)
- [ ] Confirm existing users unaffected
- [ ] Test role-based UI rendering

---

## 🔄 Rollback Procedure

### Emergency Rollback Steps
```sql
-- If migration causes issues, rollback Zach's role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'zach@zavitechllc.com';

-- Note: Cannot easily remove enum value after adding
-- Would require recreation of enum type if absolutely necessary
```

### Rollback Triggers
- Authentication system failure
- RLS policy conflicts
- Application errors related to role handling
- Performance degradation

---

## 📊 Success Criteria

### Functional Requirements
- [ ] Super admin role exists in database
- [ ] Zach has super_admin role assigned
- [ ] Super admin can access all admin functions
- [ ] Existing teacher/admin roles function unchanged

### Security Requirements
- [ ] RLS policies properly include super_admin
- [ ] No unauthorized access granted
- [ ] Role hierarchy properly enforced
- [ ] Security audit passes all checks

---

## ⏰ Execution Timeline

**Estimated Duration:** 30 minutes
- **Planning:** 5 minutes (pre-migration verification)
- **Execution:** 10 minutes (run migration commands)
- **Verification:** 15 minutes (test all functionality)

**Critical Timing:** Execute during Phase 1 (Hours 0-8) to unblock all subsequent development.

---

*This migration is the foundation for the entire sprint. Execute with careful verification at each step to ensure sprint success.*