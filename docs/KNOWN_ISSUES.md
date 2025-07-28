# KNOWN ISSUES AND TROUBLESHOOTING

**Project**: Student Behavior Reflection System  
**Last Updated**: 2025-07-28  
**For**: Development team and AI assistant handoff  

## CRITICAL ISSUES 🔴

### Issue: Clear Queue Functionality Broken
**Impact**: BLOCKS DEPLOYMENT  
**File**: `src/hooks/useSupabaseQueue.ts` (lines 534-607)  

#### Symptoms
- Clear queue button shows success message
- Toast notification displays successful clearing
- 4 behavior_requests records remain in database after clear
- Queue display temporarily updates then reverts to showing records

#### Reproduction Steps
1. Login as admin or teacher
2. Navigate to dashboard with existing queue items
3. Click "Clear Queue" button
4. Observe success message and temporary UI update
5. Check database: `SELECT COUNT(*) FROM behavior_requests` (returns 4, should be 0)

#### Console Output (Misleading)
```
🧹 Starting clear queue operation...
✅ Cleared 4 behavior requests from queue
```

#### Database Verification
```sql
-- Before clear operation
SELECT COUNT(*) FROM behavior_requests; -- Returns: 4

-- After "successful" clear operation  
SELECT COUNT(*) FROM behavior_requests; -- Still returns: 4 (PROBLEM)
```

#### Attempted Fixes (All Failed)
1. **RPC Function Approach**: `supabase.rpc('clear_teacher_queue')`
2. **Direct Delete Operations**: `supabase.from('behavior_requests').delete()`
3. **Role-Based Filtering**: Added teacher_id conditions
4. **Authentication Verification**: Enhanced user context checking
5. **Transaction Attempts**: Multiple query approaches
6. **Permission Debugging**: Various RLS policy investigations
7. **Cascade Handling**: Attempted to handle related record deletion
8. **Error Masking Investigation**: Checked for silent failures
9. **Count vs Delete Separation**: Verified count works but delete fails
10. **Manual Database Testing**: Direct SQL operations outside application

#### Current Implementation (Still Broken)
```typescript
const clearQueue = async () => {
  try {
    setClearQueueLoading(true);
    console.log('🧹 Starting clear queue operation...');
    
    // Get current user
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
    
    // Delete behavior requests - THIS PART FAILS SILENTLY
    let deleteQuery = supabase.from('behavior_requests').delete();
    
    if (currentRole === 'teacher') {
      deleteQuery = deleteQuery.eq('teacher_id', user.id);
    }
    
    const { error: deleteError } = await deleteQuery;
    
    if (deleteError) {
      console.error('❌ Clear queue error:', deleteError);
      throw deleteError;
    }
    
    console.log(`✅ Cleared ${count || 0} behavior requests from queue`);
    // ... rest of function
  }
};
```

#### Potential Root Causes (Unconfirmed)
- RLS policies blocking delete operations
- Database trigger interference
- Cascade constraint issues
- Authentication context problems
- Transaction isolation issues
- Archive trigger preventing deletion

---

## MINOR ISSUES 🟡

### Issue: PWA Service Worker Registration Failure
**Impact**: LOW - Does not affect core functionality  
**Status**: Non-blocking for deployment  

#### Console Error
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

#### Impact Assessment
- PWA install functionality not working
- Core application functionality unaffected
- Service worker features unavailable
- Can be addressed after critical queue issue resolved

---

## WORKING SYSTEMS ✅

### Confirmed Working Features
- **Authentication**: Login/logout across all user roles
- **Teacher Dashboard**: All functions except clear queue
- **Student Kiosk**: Complete three-step reflection workflow
- **Queue Management**: Add, view, assign, approve (except clear)
- **Real-time Updates**: Live queue updates via Supabase subscriptions
- **Database Operations**: All CRUD operations except clear queue
- **Archive System**: Historical data preservation working
- **Role-based Access**: RLS policies functioning correctly
- **Reflection Workflow**: Submit, review, approve, request revisions

### Database Functions Status
- **Working**: add, update, approve, archive, reassign operations
- **Broken**: clear queue operations (all variants attempted)
- **Triggers**: Archive triggers working correctly
- **RLS**: Row Level Security policies functioning

---

## DEBUGGING INFORMATION

### Database State Analysis
Current persistent records in behavior_requests table:
```sql
SELECT id, student_id, teacher_id, status, created_at 
FROM behavior_requests 
ORDER BY created_at;
```

### RLS Policy Check
```sql
-- Verify user can read records (this works)
SELECT COUNT(*) FROM behavior_requests;

-- Check delete permissions (this may be the issue)
-- Manual delete test would require direct database access
```

### User Context Verification
In application console:
```javascript
// Check current user authentication
supabase.auth.getUser();

// Check user role
// (This appears to work based on other operations)
```

### Error Logging Investigation
- No errors appear in console during clear operation
- Success messages display despite operation failure
- Database state remains unchanged
- Application behaves as if operation succeeded

---

## TROUBLESHOOTING CHECKLIST

### For Clear Queue Issue Resolution

#### Step 1: Verify Problem Still Exists
1. Check current database record count
2. Attempt clear queue operation
3. Re-check database record count
4. Confirm records persist

#### Step 2: Isolate Failure Point
1. Test user authentication context
2. Verify role-based permissions
3. Check RLS policy constraints
4. Test individual components of clear operation

#### Step 3: Database-Level Testing
1. Test delete operations directly in Supabase SQL editor
2. Verify RLS policies allow delete for current user
3. Check for blocking triggers or constraints
4. Confirm cascade operations work correctly

#### Step 4: Code-Level Debugging
1. Add detailed logging to each step of clear operation
2. Test count query vs delete query separately
3. Verify query construction and filters
4. Check for silent error masking

#### Step 5: Alternative Approaches
1. Test different delete query structures
2. Try manual record removal methods
3. Investigate bypass options for testing
4. Consider alternative implementation strategies

---

## IMPACT ASSESSMENT

### Development Impact
- **Deployment**: Blocked until queue clearing works
- **Testing**: Cannot test complete workflow cycles
- **User Experience**: Queue management appears broken
- **Data Integrity**: Records accumulate without cleanup

### Business Impact
- **Functionality**: Core feature missing for teachers/admins
- **Usability**: System appears to have fundamental flaw
- **Testing**: Cannot verify complete system operation
- **Confidence**: Deployment readiness compromised

### Technical Debt
- **Code Quality**: Multiple failed fix attempts in codebase
- **Architecture**: May indicate deeper design issues
- **Maintenance**: Unclear root cause creates ongoing risk
- **Documentation**: Extensive troubleshooting history needed

---

## RECOMMENDATIONS FOR NEW DEVELOPERS

### Immediate Actions
1. **DO NOT** modify working features while debugging clear queue
2. **DO** focus exclusively on clear queue issue until resolved
3. **DO** verify each step of operation with database checks
4. **DO** use incremental testing approach

### Investigation Strategy
1. Start with simplest possible clear operation
2. Test outside application context if necessary
3. Verify permissions at database level
4. Build up complexity only after basic operation works

### Success Criteria
- Clear queue removes ALL records from behavior_requests table
- Database count shows 0 after clear operation
- UI reflects empty queue state
- Can add new students after successful clear
- No console errors during clear operation

### Definition of Done
- [ ] Clear queue functionality verified working
- [ ] All existing features still working
- [ ] End-to-end workflow tested successfully
- [ ] Database integrity maintained
- [ ] Ready for production deployment