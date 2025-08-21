# 🔔 Notification System Integration Guide

## Overview

The BX-OS notification system provides real-time alerts for teachers and administrators about student reflection completions. This document outlines the technical architecture and integration details.

## Architecture Components

### 1. NotificationService (`src/services/notificationService.ts`)
**Purpose**: Central service for managing audio and push notifications

**Key Features**:
- Audio notifications using Web Audio API
- Push notifications using Browser Notification API
- User preference management via Supabase
- Singleton pattern for global access

**Methods**:
- `playNotificationSound()`: Plays audio notification
- `requestNotificationPermission()`: Requests browser notification permission
- `showPushNotification()`: Displays push notification
- `handleNewNotification()`: Orchestrates audio + push based on user settings

### 2. NotificationBell Component (`src/components/NotificationBell.tsx`)
**Purpose**: UI component displaying notification dropdown and managing real-time updates

**Key Features**:
- Real-time subscription to reflection updates
- Notification count badge
- Dropdown list of unread notifications
- Integration with NotificationService for audio/push alerts

**Props**:
- `userRole`: Determines notification visibility rules
- `maxNotifications`: Limits displayed notifications
- `autoMarkAsRead`: Auto-marks notifications as read when viewed
- `showPWAGuidance`: Shows PWA installation suggestion

### 3. NotificationSettings Component (`src/components/NotificationSettings.tsx`)
**Purpose**: User interface for managing notification preferences

**Settings Available**:
- Audio notifications (on/off)
- Push notifications (permission + on/off)
- Reflection ready alerts (on/off)
- Test notification functionality

## Database Integration

### notification_settings Table
```sql
CREATE TABLE notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  notification_type text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

**Supported notification_types**:
- `audio_enabled`: Controls audio notification sounds
- `push_enabled`: Controls browser push notifications
- `reflection_ready`: Controls reflection completion alerts

### Real-time Subscriptions
The system uses Supabase real-time to monitor reflection updates:

```typescript
const reflectionsSubscription = supabase
  .channel('reflections_notifications')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'reflections',
      filter: 'submitted_at=not.is.null'
    }, 
    () => fetchNotifications()
  )
  .subscribe();
```

## PWA Integration

### Service Worker Enhancement
The notification system works with the existing PWA setup in `vite.config.ts`:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'BSR System',
    icons: [
      { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
})
```

### Notification Enhancement
Push notifications automatically use PWA icons and branding:
- Icon: `/icon-192x192.png`
- Badge: `/icon-192x192.png`
- Auto-close after 5 seconds

## User Workflow

### Initial Setup
1. **User logs in** → Default notification settings created
2. **User visits notification settings** → Can enable push notifications
3. **Browser prompts for permission** → User grants/denies
4. **Settings saved to database** → Preferences persist across sessions

### Notification Trigger
1. **Student submits reflection** → Database `reflections` table updated
2. **Real-time subscription fires** → NotificationBell refetches data
3. **New notification detected** → NotificationService.handleNewNotification() called
4. **Audio plays (if enabled)** → Immediate feedback while in app
5. **Push notification shown (if enabled)** → External notification when app closed

### User Interaction
1. **User sees notification badge** → Click bell icon to open dropdown
2. **Dropdown shows reflection list** → Click notification to mark as read
3. **User reviews student reflection** → Navigate to appropriate dashboard

## Technical Implementation Details

### Audio Notification
- Uses Web Audio API for cross-browser compatibility
- Loads `/notification-sound.mp3` on service initialization
- Handles audio context suspension (required for mobile browsers)
- Graceful fallback if audio initialization fails

### Push Notification Permission
- Checks `Notification.permission` status
- Requests permission only when user enables push notifications
- Handles permission denied scenarios gracefully
- Stores permission state for UI updates

### Notification Filtering
- Only shows reflections ready for teacher review
- Filters by teacher_id to show relevant notifications only
- Excludes already approved or revision-requested reflections
- Sorts by submission timestamp (newest first)

### Performance Optimization
- Singleton pattern for NotificationService (one instance)
- Memoized notification generation
- Efficient real-time subscription (updates only, not full queries)
- Lazy audio loading (only when needed)

## Error Handling

### Audio Failures
- Console warnings for audio initialization errors
- Graceful degradation if Web Audio API unavailable
- No blocking errors if sound file fails to load

### Permission Denials
- Clear user messaging about permission requirements
- Disabled UI states for denied permissions
- Instructions for manually enabling in browser settings

### Network Issues
- Real-time subscription reconnection handled by Supabase client
- Database query error logging without UI crashes
- Fallback to last known notification state

## Testing & Validation

### Manual Testing
- Use "Test Notifications" button in settings
- Verify audio playback across different browsers
- Check push notifications with app closed/minimized
- Test permission request flow

### Integration Testing
- Create test reflection submission
- Verify real-time notification appears
- Check notification persistence across page reloads
- Validate user preference saving/loading

## Future Enhancement Opportunities

### Notification Types
- Add behavior request creation alerts
- Include admin oversight notifications
- Student kiosk assignment notifications

### Advanced Features
- Notification grouping (multiple reflections)
- Scheduled notification digests
- Email notification fallback
- Mobile app integration (when implemented)

### Performance Optimizations
- Service worker background sync
- Notification queuing for offline scenarios
- Bulk notification marking

---

**Last Updated**: August 21, 2025  
**Version**: Sprint 02 Implementation  
**Dependencies**: Supabase, VitePWA, Web Audio API, Browser Notification API