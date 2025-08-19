# 🧪 BX-OS User Testing Guide

## 🎯 Purpose
This guide provides specific, actionable test scenarios to validate BX-OS functionality from an end-user perspective. Follow these steps to ensure the system works correctly for all user roles.

---

## 🔧 Pre-Testing Setup

### Test Environment Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for authentication
- Access to admin and teacher Google accounts (if available)
- Mobile device or tablet for kiosk testing (optional but recommended)

### Test Data Needed
- List of student names for kiosk testing
- Admin Google account credentials
- Teacher Google account credentials

---

## 🎭 USER ROLE TESTING SCENARIOS

### 📱 SCENARIO 1: Anonymous Student Kiosk Access

**Objective**: Verify students can use kiosks without authentication

**Steps to Test**:
1. Open browser in incognito/private mode
2. Navigate to: `your-domain.com/kiosk1`
3. **Expected**: Page loads without login prompt
4. Look for student selection interface
5. Try selecting a student name
6. Complete behavior selection process
7. Submit the form

**Success Criteria**:
- ✅ No authentication required
- ✅ Student list displays correctly
- ✅ Can complete full workflow
- ✅ Submission creates queue entry

**If This Fails**:
- Screenshot the error/redirect page
- Note exact URL you were redirected to
- Check browser console for errors (F12 → Console tab)

---

### 👩‍🏫 SCENARIO 2: Teacher Dashboard Access

**Objective**: Verify teachers can access appropriate features

**Steps to Test**:
1. Navigate to: `your-domain.com/auth`
2. Sign in with teacher Google account
3. **Expected**: Redirect to teacher dashboard
4. Try accessing: `your-domain.com/admin-dashboard`
5. **Expected**: Should be blocked/redirected
6. Return to teacher dashboard
7. Look for student queue display
8. Test creating a BSR for a student
9. Try accessing user management features

**Success Criteria**:
- ✅ Teacher login successful
- ✅ Teacher dashboard accessible
- ✅ Admin dashboard blocked
- ✅ Can view student queue
- ✅ Can create BSR entries
- ❌ Cannot access user management

**If This Fails**:
- Note which specific access control failed
- Screenshot unexpected access to admin features
- Document any missing teacher functionality

---

### 👨‍💼 SCENARIO 3: Admin System Management

**Objective**: Verify admins have full system access

**Steps to Test**:
1. Navigate to: `your-domain.com/auth`
2. Sign in with admin Google account
3. **Expected**: Redirect to admin dashboard
4. Try accessing: `your-domain.com/teacher`
5. **Expected**: Should be allowed
6. Navigate back to admin dashboard
7. Look for user management section
8. Test viewing active sessions
9. Try importing student data (if CSV available)
10. Test creating/managing user accounts

**Success Criteria**:
- ✅ Admin login successful
- ✅ Admin dashboard accessible
- ✅ Teacher dashboard accessible
- ✅ User management functions available
- ✅ Session monitoring works
- ✅ Student data import functional

**If This Fails**:
- Note which admin functions are missing
- Screenshot broken or inaccessible features
- Document any permission errors

---

### 🔄 SCENARIO 4: Real-Time Updates

**Objective**: Verify live data synchronization

**Steps to Test**:
1. Open two browser windows
2. Window 1: Login as teacher
3. Window 2: Access kiosk in incognito mode
4. In Window 2: Submit student to queue
5. In Window 1: Check if queue updates immediately
6. In Window 1: Update student status
7. Check if changes appear in Window 2

**Success Criteria**:
- ✅ Queue updates appear without page refresh
- ✅ Changes sync between windows within 5 seconds
- ✅ No data conflicts or duplicates
- ✅ All status changes display correctly

**If This Fails**:
- Note delay time for updates
- Check if manual page refresh shows correct data
- Document any sync conflicts or missing updates

---

## 🔍 DETAILED FEATURE TESTING

### NotificationBell Functionality
**Location**: Top right of teacher/admin dashboards

**Test Steps**:
1. Click the bell icon
2. **Expected**: Dropdown opens with notifications
3. Click outside dropdown
4. **Expected**: Dropdown closes
5. If notifications exist, click on one
6. **Expected**: Appropriate action occurs

**Success Indicators**:
- ✅ Dropdown opens/closes on click
- ✅ Shows actual notification data
- ✅ Interactions work smoothly
- ✅ No visual glitches or transparency issues

### Student Queue Management
**Location**: Teacher and admin dashboards

**Test Steps**:
1. Look for student queue display
2. Verify student names show as "First Last" format
3. Check for different status indicators (waiting, in-progress, completed)
4. Try updating a student's status
5. Verify queue reflects changes immediately

**Success Indicators**:
- ✅ Student names display correctly
- ✅ All queue statuses visible
- ✅ Status updates work
- ✅ Real-time updates functional

### User Management (Admin Only)
**Location**: Admin dashboard user management section

**Test Steps**:
1. Look for "Add User" or user creation buttons
2. Try creating a new user account
3. Test assigning roles (teacher, admin)
4. Verify user list displays correctly
5. Test user deactivation/deletion

**Success Indicators**:
- ✅ User creation works
- ✅ Role assignment functional
- ✅ User list accurate
- ✅ Deactivation works properly

---

## 🚨 CRITICAL ERROR IDENTIFICATION

### Security Issues (STOP TESTING IF FOUND)
- ❌ Unauthenticated users accessing admin/teacher dashboards
- ❌ Teachers accessing admin-only functions
- ❌ Student data visible to wrong users
- ❌ Session tokens exposed in browser

### Data Issues (DOCUMENT IMMEDIATELY)
- ❌ Student names showing as "Unknown" or incorrect format
- ❌ Queue entries disappearing unexpectedly
- ❌ Duplicate students or records
- ❌ BSR data not saving correctly

### UI/UX Issues (NOTE FOR IMPROVEMENT)
- ⚠️ Buttons not responding to clicks
- ⚠️ Pages loading slowly (>5 seconds)
- ⚠️ Mobile interface not working on tablets
- ⚠️ Dropdown menus transparent or invisible

---

## 📋 BUG REPORTING TEMPLATE

When you find an issue, please document:

```
**Bug Type**: [Security/Data/UI/Performance]
**User Role**: [Anonymous/Teacher/Admin]
**Browser**: [Chrome/Firefox/Safari/Edge]
**Device**: [Desktop/Tablet/Mobile]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshot/Video**: 
[If possible, attach visual evidence]

**Console Errors**: 
[If any, from browser console - F12]

**Priority**: [Critical/High/Medium/Low]
```

---

## ✅ TESTING COMPLETION CHECKLIST

### Basic Functionality (Required)
- [ ] Anonymous kiosk access works
- [ ] Teacher login and dashboard functional
- [ ] Admin login and dashboard functional
- [ ] Role-based access controls working
- [ ] Student queue displays correctly
- [ ] Real-time updates functional

### Advanced Features (Nice to Have)
- [ ] NotificationBell interactions smooth
- [ ] User management complete
- [ ] CSV import successful
- [ ] Mobile/tablet compatibility good
- [ ] Performance acceptable (<5s load times)

### Security Validation (Critical)
- [ ] No unauthorized access possible
- [ ] Student data properly protected
- [ ] Session security maintained
- [ ] Role restrictions enforced

---

## 🎯 TESTING SUCCESS CRITERIA

**System Ready for Production When**:
- All basic functionality tests pass
- No critical security issues found
- Role-based access working correctly
- Real-time features functional
- Performance acceptable for intended usage

**Next Steps After Testing**:
1. Document all findings using bug reporting template
2. Prioritize issues by severity
3. Schedule fixes for critical/high priority items
4. Plan user training for functional features
5. Prepare rollback plan if critical issues found

---

**Remember**: This testing guide focuses on real user workflows, not technical implementation details. Test as your actual users would use the system.