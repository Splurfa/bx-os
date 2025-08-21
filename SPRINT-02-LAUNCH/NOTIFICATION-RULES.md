# 🔔 BX-OS NOTIFICATION SYSTEM RULES (SIMPLIFIED)

This document outlines the simplified notification system for the BX-OS, focusing on one core notification type.

**Updated**: August 21, 2025  
**Status**: SIMPLIFIED - Single notification rule active

---

## 🎯 ACTIVE NOTIFICATION RULE

### ✅ ONLY ACTIVE RULE: Reflection Ready for Review
**TRIGGER:** When a student completes and submits their reflection (status changes to 'review')
**WHO GETS NOTIFIED:** 
- ✅ The teacher who created the original behavior request (action required)
**WHO DOESN'T GET NOTIFIED:**
- ❌ Admins (postponed)
- ❌ Other teachers
- ❌ The student (they know they submitted it)

**MESSAGE FORMAT:** "[Student Name] completed their reflection - ready for review"
**PRIORITY:** HIGH (requires teacher action)
**DATABASE CONTROL:** Managed via `notification_settings` table with type `reflection_ready_for_review`

**BUSINESS LOGIC:**
- Only show for reflections where `submitted_at` is not null
- Only show if `teacher_approved` is false
- Only show if `revision_requested` is false
- Only show to the teacher who owns the behavior request

---

## 🚫 POSTPONED NOTIFICATION RULES

All other notification types have been temporarily disabled to simplify the system:

### ❌ POSTPONED: Behavior Request Creation
**TRIGGER:** When a teacher creates a new behavior request  
**STATUS:** Postponed - no notifications sent
**REASON:** Focus on core workflow completion

### ❌ POSTPONED: Student Assignment to Kiosk  
**TRIGGER:** When a student is assigned to a kiosk from the queue
**STATUS:** Postponed - no notifications sent
**REASON:** Teachers can monitor queue status directly

### ❌ POSTPONED: Teacher Review Decision
**TRIGGER:** When a teacher approves or requests revision
**STATUS:** Postponed - no notifications sent
**REASON:** Admin oversight can be added later

### ❌ POSTPONED: Admin Oversight Notifications
**TRIGGER:** Various system events for admin monitoring
**STATUS:** Postponed - no notifications sent
**REASON:** Focus on teacher workflow first

---

## 🔧 NOTIFICATION SETTINGS ARCHITECTURE

### Database Table: `notification_settings`
```sql
- user_id: UUID (references auth.users)
- notification_type: TEXT ('reflection_ready_for_review')  
- enabled: BOOLEAN (default: true)
- created_at, updated_at: TIMESTAMP
```

### User Management Rules
- **Teachers**: Automatically get `reflection_ready_for_review` enabled
- **Admins**: Can manage notification settings for all users (future UI)
- **Settings**: Stored per user, per notification type for future expansion

### Future Extensibility Plan
1. Add new notification types to enum in database
2. Create new entries in notification_settings for users
3. Update NotificationBell component logic
4. Build admin UI for managing user notification preferences

---

## 📱 TECHNICAL IMPLEMENTATION

### Real-Time Updates
- **Database Trigger**: Only listen to reflections table changes
- **Filter**: Only UPDATE events where `submitted_at` is not null
- **Performance**: Single subscription instead of multiple channels

### Component Logic  
- **Single Fetch Query**: Get reflections with joined behavior_request and student data
- **Permission Check**: Only fetch reflections for current user's behavior requests
- **Settings Check**: Respect user's notification_settings.enabled flag

### Visual Design
- **Icon**: FileText (green) for reflection ready notifications
- **Priority**: Always HIGH priority (green border)
- **Message**: Clear action-oriented text with student name
- **Badge**: Shows count of unread reflection notifications only

---

## 📈 SUCCESS CRITERIA

### Immediate Goals
- ✅ Teachers receive notifications when their students complete reflections
- ✅ No noise from other notification types
- ✅ Clear, actionable notification messages
- ✅ Real-time updates work reliably

### Future Expansion (When Ready)
- Admin oversight notifications
- Student assignment notifications  
- Completion tracking notifications
- Email/push notification channels
- User preference management UI

---

**IMPLEMENTATION STATUS**: ✅ ACTIVE - Single notification rule implemented with database-driven settings for future expansion