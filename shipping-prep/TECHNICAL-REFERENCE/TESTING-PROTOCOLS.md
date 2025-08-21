# Testing & Validation Protocols

## Overview

Comprehensive testing protocols for validating BX-OS functionality, ensuring system reliability, and maintaining quality assurance standards.

## Systematic Validation Framework

### Database State Verification

**User & Authentication Testing**
```sql
-- Verify user accounts and role assignments
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as account_created,
    p.display_name,
    p.role,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Check active session correlation
SELECT 
    s.id as session_id,
    s.user_id,
    p.display_name,
    p.role,
    s.device_type,
    s.device_name,
    s.is_active,
    s.created_at
FROM public.active_sessions s
LEFT JOIN public.profiles p ON s.user_id = p.user_id
WHERE s.is_active = true
ORDER BY s.created_at DESC;
```

**Queue & Student Data Validation**
```sql
-- Verify queue entries with student correlation
SELECT 
    q.id as queue_id,
    s.first_name,
    s.last_name,
    s.grade_level,
    q.status,
    q.priority,
    q.created_at,
    q.updated_at
FROM public.queue_items q
JOIN public.students s ON q.student_id = s.id
ORDER BY q.created_at DESC
LIMIT 20;

-- Check data consistency across relationships
SELECT 
    COUNT(*) as total_students,
    (SELECT COUNT(*) FROM public.queue_items WHERE status = 'waiting') as waiting_in_queue,
    (SELECT COUNT(*) FROM public.behavior_support_requests WHERE status = 'pending') as open_requests,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'teacher') as teacher_accounts,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_accounts;
```

### Component Existence Verification

**Critical Component Validation**
```bash
# Authentication Components
[ -f 'src/components/AdminRoute.tsx' ] && echo '✅ AdminRoute exists' || echo '❌ AdminRoute missing'
[ -f 'src/components/TeacherRoute.tsx' ] && echo '✅ TeacherRoute exists' || echo '❌ TeacherRoute missing'
[ -f 'src/components/ProtectedRoute.tsx' ] && echo '✅ ProtectedRoute exists' || echo '❌ ProtectedRoute missing'

# Permission System Components
[ -f 'src/hooks/usePermissions.ts' ] && echo '✅ usePermissions exists' || echo '❌ usePermissions missing'
[ -f 'src/lib/permissions.ts' ] && echo '✅ permissions lib exists' || echo '❌ permissions lib missing'

# UI Components
[ -f 'src/components/NotificationBell.tsx' ] && echo '✅ NotificationBell exists' || echo '❌ NotificationBell missing'
[ -f 'src/components/QueueDisplay.tsx' ] && echo '✅ QueueDisplay exists' || echo '❌ QueueDisplay missing'
```

## Authentication & Authorization Testing

### Route Protection Validation

**Anonymous Access Testing**
```javascript
const testAnonymousAccess = async () => {
  const protectedRoutes = ['/admin-dashboard', '/teacher-dashboard'];
  
  for (const route of protectedRoutes) {
    try {
      window.history.pushState({}, '', route);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentPath = window.location.pathname;
      if (currentPath === route) {
        console.log(`❌ SECURITY ISSUE: Anonymous user accessed ${route}`);
      } else {
        console.log(`✅ Route protection working for ${route}`);
      }
    } catch (error) {
      console.log(`✅ Route ${route} properly protected:`, error.message);
    }
  }
};
```

**Kiosk Route Testing**
```javascript
const testKioskAccess = async () => {
  const kioskRoutes = ['/kiosk1', '/kiosk2', '/kiosk3'];
  
  for (const route of kioskRoutes) {
    try {
      window.history.pushState({}, '', route);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentPath = window.location.pathname;
      if (currentPath === route) {
        console.log(`✅ Kiosk route ${route} accessible anonymously`);
      } else {
        console.log(`❌ Kiosk route ${route} blocked by authentication`);
      }
    } catch (error) {
      console.log(`❌ Kiosk route ${route} access failed:`, error.message);
    }
  }
};
```

### Role-Based Access Testing

**Admin Access Validation**
```javascript
const testAdminAccess = async (userToken) => {
  const adminRoutes = ['/admin-dashboard'];
  const allowedRoutes = ['/teacher-dashboard', '/kiosk1'];
  
  // Test admin can access appropriate routes
  for (const route of [...adminRoutes, ...allowedRoutes]) {
    const response = await fetch(route, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.ok) {
      console.log(`✅ Admin access granted to ${route}`);
    } else {
      console.log(`❌ Admin access denied to ${route}`);
    }
  }
};
```

## UI Component Testing

### Interactive Element Validation

**NotificationBell Testing**
```javascript
const testNotificationBell = () => {
  const bell = document.querySelector('[data-testid="notification-bell"]');
  const dropdown = document.querySelector('[data-testid="notification-dropdown"]');
  
  if (!bell) {
    console.log('❌ NotificationBell not found in DOM');
    return false;
  }
  
  // Test click interaction
  bell.click();
  
  setTimeout(() => {
    const isVisible = dropdown && dropdown.style.display !== 'none';
    if (isVisible) {
      console.log('✅ NotificationBell dropdown opens on click');
    } else {
      console.log('❌ NotificationBell dropdown does not open');
    }
  }, 500);
};
```

**Queue Display Testing**
```javascript
const testQueueDisplay = () => {
  const queue = document.querySelector('[data-testid="queue-display"]');
  const queueItems = document.querySelectorAll('[data-testid="queue-item"]');
  
  if (!queue) {
    console.log('❌ QueueDisplay not found in DOM');
    return false;
  }
  
  console.log(`✅ QueueDisplay found with ${queueItems.length} items`);
  
  // Validate queue item data
  queueItems.forEach((item, index) => {
    const studentName = item.querySelector('[data-testid="student-name"]');
    if (studentName && studentName.textContent !== 'Unknown User') {
      console.log(`✅ Queue item ${index} shows proper student name`);
    } else {
      console.log(`❌ Queue item ${index} shows Unknown User or missing name`);
    }
  });
};
```

### Permission-Based UI Testing

**Role-Specific Element Visibility**
```javascript
const testUserManagement = (userRole) => {
  const adminFunctions = document.querySelectorAll('[data-testid="admin-only"]');
  const teacherFunctions = document.querySelectorAll('[data-testid="teacher-only"]');
  
  if (userRole === 'teacher') {
    if (adminFunctions.length === 0) {
      console.log('✅ Admin functions hidden from teacher user');
    } else {
      console.log('❌ Admin functions visible to teacher user');
    }
  }
  
  if (userRole === 'admin') {
    if (adminFunctions.length > 0) {
      console.log('✅ Admin functions visible to admin user');
    } else {
      console.log('❌ Admin functions not visible to admin user');
    }
  }
};
```

## Real-Time System Testing

### Subscription Validation

**Queue Update Testing**
```javascript
const testQueueUpdates = async () => {
  let updateReceived = false;
  
  // Subscribe to queue changes
  const subscription = supabase
    .channel('queue-test')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'queue_items'
    }, (payload) => {
      updateReceived = true;
      console.log('✅ Real-time queue update received:', payload);
    })
    .subscribe();
    
  // Make test change
  await supabase
    .from('queue_items')
    .insert({
      student_id: 'test-student-id',
      status: 'waiting',
      priority: 1
    });
    
  // Verify update received
  setTimeout(() => {
    if (updateReceived) {
      console.log('✅ Real-time updates working correctly');
    } else {
      console.log('❌ Real-time updates not working');
    }
    subscription.unsubscribe();
  }, 2000);
};
```

### Cross-Session Synchronization

**Multi-Session Testing**
```javascript
const testCrossSessionSync = async () => {
  // Open multiple browser sessions
  // Make change in session 1
  // Verify change appears in session 2
  // Measure propagation time
};
```

## End-to-End Workflow Testing

### Complete BSR Workflow

**Teacher-to-Student-to-Completion Flow**
```javascript
const testCompleteWorkflow = async () => {
  const testSteps = [
    'Teacher creates BSR',
    'Student assigned to kiosk',
    'Student completes reflection',
    'Teacher receives notification',
    'BSR marked as completed'
  ];
  
  for (const step of testSteps) {
    try {
      await executeWorkflowStep(step);
      console.log(`✅ ${step} - Success`);
    } catch (error) {
      console.log(`❌ ${step} - Failed:`, error.message);
      break;
    }
  }
};
```

### Performance Testing

**Concurrent User Load Testing**
```javascript
const testConcurrentLoad = async () => {
  const userSessions = [
    { role: 'teacher', count: 5 },
    { role: 'admin', count: 2 },
    { role: 'kiosk', count: 3 }
  ];
  
  // Simulate concurrent sessions
  // Measure response times
  // Verify data consistency
  // Check for race conditions
};
```

## System Health Validation

### Comprehensive Health Check

**Complete System Validation**
```javascript
const fullSystemCheck = async () => {
  const results = {
    database: { connected: false, tables: [], errors: [] },
    authentication: { working: false, roles: [], errors: [] },
    components: { existing: [], missing: [], errors: [] },
    routes: { protected: [], accessible: [], errors: [] },
    ui: { functional: [], broken: [], errors: [] },
    realtime: { subscriptions: [], errors: [] }
  };

  // Database connectivity
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    results.database.connected = !error;
    if (error) results.database.errors.push(error.message);
  } catch (e) {
    results.database.errors.push(e.message);
  }

  // Authentication system
  try {
    const { data: { user } } = await supabase.auth.getUser();
    results.authentication.working = !!user;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (profile) results.authentication.roles.push(profile.role);
    }
  } catch (e) {
    results.authentication.errors.push(e.message);
  }

  console.log('🔍 SYSTEM HEALTH CHECK RESULTS:', results);
  return results;
};
```

## Automated Testing Protocols

### Required Testing Sequence

**Pre-Implementation Validation** (3 minutes)
1. **Database State Check** (30 seconds)
   - User/role verification queries
   - Data integrity across relationships
   - Queue and session data correlation

2. **Component Existence Check** (15 seconds)
   - Critical component file verification
   - Component import functionality testing
   - Integration dependency checking

3. **Route Protection Test** (60 seconds)
   - Anonymous access to protected routes
   - Kiosk route accessibility verification
   - Role-based route restriction testing

4. **UI Interaction Test** (45 seconds)
   - NotificationBell dropdown functionality
   - QueueDisplay data verification
   - Role-based UI element visibility

5. **Real-Time Functionality Test** (30 seconds)
   - Supabase subscription updates
   - Cross-session data synchronization
   - Notification propagation testing

### Continuous Validation Protocol

**Integration with Development Workflow**
- ✅ **Pre-Implementation**: Run full system check to establish baseline
- 🔄 **Mid-Implementation**: Run relevant subsystem tests after each component change
- ✅ **Post-Implementation**: Run complete validation before claiming completion
- 🎯 **Pre-Deployment**: Run comprehensive test and document actual capabilities

**Failure Response Protocol**
- Investigate and fix any test failures before proceeding
- Document test failures and their resolution
- Never claim completion with failing validation tests
- Update documentation to reflect actual system capabilities

## Quality Assurance Standards

### Documentation Accuracy Requirements

1. **ALWAYS verify component existence before claiming issues**
2. **ALWAYS test functionality before declaring broken**
3. **ALWAYS distinguish between "empty state" and "error state"**
4. **ALWAYS validate database queries before making data claims**

### Testing Evidence Standards

- All testing claims must include verification evidence
- Screenshots or console output for UI testing
- Database query results for data validation
- Error logs for failure investigation
- Performance metrics for load testing

---

**Testing Philosophy**: "Code tells the truth, documentation tells stories. Testing ensures we stay anchored to functional reality."

**Last Updated**: August 2025  
**Review Schedule**: Monthly validation protocol review