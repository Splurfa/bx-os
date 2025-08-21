# 🔔 BX-OS Notification System Rules

**Created**: August 21, 2025  
**Purpose**: Define when, how, and to whom notifications are sent in the BX-OS system

---

## 📋 NOTIFICATION TRIGGER RULES

### 1. Behavior Request Creation
**When**: Teacher creates a new BSR for a student
**Who Gets Notified**:
- ✅ Creating teacher (confirmation)
- ✅ Admins/Super Admins (oversight)
- ❌ Other teachers (not their student)
- ❌ Students (they'll be called to kiosk)

**Message Examples**:
- Teacher: "BSR created for [Student Name] - waiting for kiosk assignment"
- Admin: "New BSR: [Teacher] assigned [Student Name] for reflection"

---

### 2. Student Assignment to Kiosk
**When**: Student is automatically assigned to an available kiosk
**Who Gets Notified**:
- ✅ Requesting teacher (their student is now active)
- ✅ Admins/Super Admins (system monitoring)
- ❌ Student (teacher will call them directly)
- ❌ Other teachers (not relevant to them)

**Message Examples**:
- Teacher: "[Student Name] assigned to Kiosk 2 - please send student"
- Admin: "[Student Name] assigned to Kiosk 2 by [Teacher Name]"

---

### 3. Reflection Submission (MOST IMPORTANT)
**When**: Student completes their reflection at kiosk
**Who Gets Notified**:
- ✅ Requesting teacher (IMMEDIATE - needs to review)
- ✅ Admins/Super Admins (workflow tracking)
- ❌ Student (they're done for now)
- ❌ Other teachers (not their student)

**Message Examples**:
- Teacher: "🔔 [Student Name] submitted reflection - READY FOR REVIEW"
- Admin: "[Student Name] completed reflection - awaiting [Teacher] review"

**Priority**: HIGH - Teachers need immediate notification to review quickly

---

### 4. Teacher Review Decision
**When**: Teacher approves or requests revision of reflection
**Who Gets Notified**:
- ✅ Admins/Super Admins (completion tracking)
- ❌ Student (teacher handles this directly)
- ❌ Other teachers (not relevant)

**Message Examples**:
- Admin (Approved): "[Teacher] approved [Student Name]'s reflection - case closed"
- Admin (Revision): "[Teacher] requested revision from [Student Name] - back to queue"

---

## 🚨 NOTIFICATION PRIORITY LEVELS

### HIGH Priority (Red/Urgent)
- Student completed reflection → Teacher review needed
- System errors or kiosk connectivity issues
- Security alerts or failed authentication attempts

### MEDIUM Priority (Yellow/Standard)
- New behavior requests created
- Student assigned to kiosk
- Queue status changes

### LOW Priority (Green/Informational)
- Reflection approved/completed
- System maintenance notices
- General announcements

---

## 🎯 NOTIFICATION DISPLAY RULES

### What Makes a Good Notification
1. **Clear Action Required**: "Review needed" vs "For your info"
2. **Student Name Prominent**: Easy to identify which student
3. **Kiosk Location**: When relevant, show which kiosk
4. **Time Sensitivity**: How urgent is this action
5. **One-Click Action**: Link directly to review screen when possible

### What We DON'T Want
1. **Spam**: Too many low-priority notifications
2. **Irrelevant Info**: Notifications about other teachers' students
3. **Unclear Actions**: Vague messages that don't explain what to do
4. **System Noise**: Technical details that don't help users

---

## 👥 ROLE-SPECIFIC NOTIFICATION PREFERENCES

### Teachers
**NEED TO KNOW**:
- Their students complete reflections (HIGH priority)
- Their students assigned to kiosks (MEDIUM priority)
- System issues affecting their workflow (HIGH priority)

**DON'T NEED**:
- Other teachers' student activities
- Detailed admin system monitoring
- Low-level technical alerts

### Admins
**NEED TO KNOW**:
- All system activity for oversight (MEDIUM priority)
- Workflow bottlenecks or delays (HIGH priority)
- System health and performance issues (HIGH priority)
- User management events (MEDIUM priority)

**DON'T NEED**:
- Individual reflection content details
- Minor system status updates

### Super Admins
**NEED TO KNOW**:
- Everything admins see
- Security events and user role changes (HIGH priority)
- System configuration changes (HIGH priority)
- Critical system failures (HIGH priority)

---

## 🔧 TECHNICAL NOTIFICATION RULES

### Real-Time Delivery
- Notifications should appear within 5 seconds of event
- No manual refresh required to see new notifications
- Visual indicator (badge) updates immediately

### Notification Persistence
- Keep unread notifications until user acknowledges
- Mark as read when user clicks notification
- Auto-expire informational notifications after 24 hours

### Delivery Channels
- **In-App**: Primary method - notification bell in header
- **Future**: Email summaries for end-of-day or missed items
- **Future**: Push notifications for mobile/PWA usage

---

## 🎨 NOTIFICATION APPEARANCE RULES

### Visual Design
- **High Priority**: Red left border, bold text
- **Medium Priority**: Yellow left border, normal text
- **Low Priority**: Green left border, muted text
- **Unread**: Highlighted background
- **Read**: Subdued appearance

### Content Format
```
[ICON] [TITLE]
[Brief message with student name and action]
[Timestamp] [Kiosk location if relevant]
```

### Interaction
- **Click notification**: Mark as read and navigate to relevant screen
- **Dismiss**: Remove from notification list
- **Badge count**: Show number of unread notifications

---

## 📝 NOTIFICATION CONTENT GUIDELINES

### DO Write:
- "Emma Johnson submitted reflection - ready for review"
- "Michael Chen assigned to Kiosk 3 - please send student"
- "Sarah Williams needs revision - back in queue"

### DON'T Write:
- "Database update completed successfully"
- "User authentication event logged"
- "System maintenance scheduled"

---

## 🎯 SUCCESS METRICS

### Good Notification System
- Teachers review reflections within 10 minutes of submission
- Less than 3 clicks to act on any notification
- Zero missed student completions due to notification issues
- Users find notifications helpful, not annoying

### Warning Signs
- Teachers report missing student completion notifications
- Users disable notifications due to spam
- Important actions delayed due to unclear notifications
- System feels "noisy" or overwhelming

---

**CURRENT STATUS**: Notification system exists but needs enhancement to follow these rules consistently.