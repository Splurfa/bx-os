# CRITICAL ISSUES DOCUMENTATION

**For AI Assistant Handoff**  
**Last Updated**: 2025-07-28  

## ISSUE #1: CLEAR QUEUE FUNCTIONALITY BROKEN 🔴

### Priority: CRITICAL - BLOCKS DEPLOYMENT

### Current Status
- **Symptom**: Clear queue button appears to succeed but records remain in database
- **Observable State**: 4 behavior_requests records persist after clear operations
- **User Experience**: Button shows success message, but data not actually cleared
- **Database Impact**: Records accumulate and cannot be removed through UI

### File Location
- **Primary File**: `src/hooks/useSupabaseQueue.ts`
- **Lines**: 534-607 (clearQueue function)
- **Related Files**: `src/components/AdminDashboard.tsx` (clear button implementation)

### Attempted Fixes (Chronological)

#### Attempt 1: RPC Function Approach
- **Date**: Early in development cycle
- **Implementation**: Used `supabase.rpc('clear_teacher_queue')`
- **Code Change**: Called database function directly
- **Result**: Function appeared to execute but records remained
- **Observable Behavior**: No error messages, but database state unchanged

#### Attempt 2: Manual Database Operations
- **Implementation**: Direct DELETE operations via Supabase client
- **Code Change**: `supabase.from('behavior_requests').delete()`
- **Result**: Silent failure or permission issues
- **Observable Behavior**: No errors in console, records persist

#### Attempt 3: Role-Based Filtering
- **Implementation**: Added teacher_id filtering for role-based access
- **Code Change**: Added `.eq('teacher_id', user.id)` conditions
- **Result**: Still failing to delete records
- **Observable Behavior**: Count query returns correct number, delete fails

#### Attempt 4: Transaction Approach
- **Implementation**: Attempted to use database transactions
- **Code Change**: Multiple query approach with error handling
- **Result**: Records still persisting

#### Attempt 5: Authentication Context Fix
- **Implementation**: Added user authentication checks and role verification
- **Code Change**: Enhanced user context and role checking
- **Result**: Authentication works, but deletion still fails

#### Attempt 6-10: Various Permission and Query Modifications
- **Implementations**: Multiple iterations of query construction
- **Results**: All attempts resulted in persistent records

### Most Recent Implementation (Lines 534-607)
```typescript
// Current broken implementation
const clearQueue = async () => {
  try {
    setClearQueueLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get user role for proper filtering
    const currentRole = userRole || await getUserRole();
    
    // Get items to be deleted for counting
    let countQuery = supabase
      .from('behavior_requests')
      .select('id', { count: 'exact', head: true });
    
    if (currentRole === 'teacher') {
      countQuery = countQuery.eq('teacher_id', user.id);
    }
    
    const { count } = await countQuery;
    
    // Delete behavior requests
    let deleteQuery = supabase.from('behavior_requests').delete();
    
    if (currentRole === 'teacher') {
      deleteQuery = deleteQuery.eq('teacher_id', user.id);
    }
    
    const { error: deleteError } = await deleteQuery;
    
    if (deleteError) {
      console.error('❌ Clear queue error:', deleteError);
      throw deleteError;
    }
    
    // ... rest of implementation
  } catch (error) {
    // Error handling
  }
};
```

### Observable Behavior Patterns
1. Count query returns correct number of records
2. Delete query executes without throwing errors
3. Success message displays to user
4. Database records remain unchanged
5. Queue display updates temporarily then reverts

### Console Output Patterns
- "🧹 Starting clear queue operation..."
- "✅ Cleared X behavior requests from queue"
- No error messages in console
- Database state unchanged despite success messages

### Database Verification
- **Query**: `SELECT COUNT(*) FROM behavior_requests`
- **Before Clear**: 4 records
- **After Clear**: 4 records (unchanged)
- **Expected**: 0 records

### Row Level Security (RLS) Context
- RLS policies are active on behavior_requests table
- Policies may be interfering with delete operations
- User authentication appears to work for other operations
- Role-based access functions properly for read operations

### Related Database Functions
- `clear_teacher_queue()` function exists but may not be working
- Archive triggers may be interfering with deletion
- Cascading delete operations may be blocked

### Impact Assessment
- **Development**: Cannot test full workflow
- **Deployment**: Blocks production readiness
- **User Experience**: Queue management appears broken
- **Data Integrity**: Records accumulate without cleanup option

### Testing Requirements
1. Verify clear queue removes all records from database
2. Confirm RLS policies allow delete operations for appropriate users
3. Test across different user roles (teacher vs admin)
4. Verify cascade operations work correctly
5. Ensure archive triggers don't prevent deletion

---

## ISSUE #2: BUILD SYSTEM PWA SERVICE WORKER 🟡

### Priority: LOW - NON-BLOCKING

### Current Status
- **Symptom**: Service Worker registration failing in console
- **Observable Error**: "Script https://[domain]/sw.js load failed"
- **Impact**: PWA functionality not working but core app functional

### Console Output
```
SW registration failed: {
  "_type": "Error",
  "value": {
    "name": "SecurityError", 
    "message": "Script https://0441a3c5-af2a-4db4-8a77-0953fae340e1.lovableproject.com/sw.js load failed",
    "stack": ""
  }
}
```

### File Location
- **Related**: PWA configuration in `vite.config.ts`
- **Impact**: Service worker functionality only

### Resolution Priority
- **Status**: LOW - Does not block core functionality
- **Recommendation**: Address after critical queue issue is resolved

---

## ISSUE RESOLUTION DEPENDENCIES

### Primary Dependency Chain
1. **MUST FIX FIRST**: Clear queue functionality (Issue #1)
2. **THEN**: Complete end-to-end testing
3. **FINALLY**: Address PWA service worker (Issue #2)

### Verification Steps After Fix
1. Clear queue operation removes all database records
2. Queue display reflects empty state
3. Add new student after clear works correctly
4. Archive functionality preserves historical data
5. Role-based access works across clear operations