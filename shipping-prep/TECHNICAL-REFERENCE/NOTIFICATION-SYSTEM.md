# Notification System Architecture

## Overview

The BX-OS notification system provides real-time alerts for behavior reflection completions using audio notifications, browser push notifications, and visual indicators.

## System Components

### NotificationService (`src/services/notificationService.ts`)

**Purpose**: Central service managing audio and push notifications

**Key Features**:
- Web Audio API integration for cross-browser audio support
- Browser Notification API for push notifications
- User preference management via Supabase
- Singleton pattern ensuring single service instance

**Core Methods**:
```typescript
class NotificationService {
  // Audio notification management
  playNotificationSound(): Promise<void>
  
  // Push notification management  
  requestNotificationPermission(): Promise<NotificationPermission>
  showPushNotification(title: string, options: NotificationOptions): void
  
  // Orchestration method
  handleNewNotification(type: string, data: any): Promise<void>
}
```

### NotificationBell Component (`src/components/NotificationBell.tsx`)

**Purpose**: UI component for notification display and interaction

**Features**:
- Real-time subscription to reflection updates
- Notification count badge with visual indicator
- Dropdown list showing unread notifications
- Integration with NotificationService for alerts

**Key Props**:
- `userRole`: Determines notification filtering rules
- `maxNotifications`: Limits displayed notification count
- `autoMarkAsRead`: Automatically marks notifications as read when viewed
- `showPWAGuidance`: Displays PWA installation guidance

### NotificationSettings Component (`src/components/NotificationSettings.tsx`)

**Purpose**: User interface for managing notification preferences

**Available Settings**:
- Audio notifications (enable/disable)
- Push notifications (permission request + enable/disable)
- Reflection completion alerts (enable/disable)
- Test notification functionality

## Database Integration

### notification_settings Table Schema

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

**Supported Notification Types**:
- `audio_enabled`: Controls audio notification sounds
- `push_enabled`: Controls browser push notifications  
- `reflection_ready`: Controls reflection completion alerts

### Real-Time Subscriptions

**Queue Updates Subscription**:
```typescript
const subscription = supabase
  .channel('reflections_notifications')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public', 
    table: 'behavior_support_requests',
    filter: 'status=eq.completed'
  }, (payload) => {
    handleReflectionComplete(payload.new);
  })
  .subscribe();
```

## Workflow & User Experience

### Initial Setup Flow

1. **User Authentication** → Default notification settings created automatically
2. **Settings Access** → User navigates to notification preferences
3. **Permission Request** → Browser prompts for push notification permission
4. **Preference Storage** → Settings saved to database for session persistence

### Notification Trigger Flow

1. **Student Submits Reflection** → Database updates `behavior_support_requests.status`
2. **Real-Time Event Fires** → Supabase subscription triggers in NotificationBell
3. **Notification Processing** → New notification detected and processed
4. **Audio Alert** → Immediate sound notification (if enabled)
5. **Push Notification** → Browser notification for background alerts (if enabled)
6. **Visual Update** → Notification badge and dropdown updated

### User Interaction Flow

1. **Visual Notification** → User sees notification badge on bell icon
2. **Dropdown Access** → Click bell to open notification dropdown
3. **Notification Review** → Click individual notifications to mark as read
4. **Dashboard Navigation** → Navigate to appropriate dashboard for detailed review

## Technical Implementation

### Audio Notification System

**Web Audio API Implementation**:
```typescript
class AudioManager {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer;
  
  async initializeAudio(): Promise<void> {
    this.audioContext = new AudioContext();
    const response = await fetch('/notification-sound.mp3');
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }
  
  playSound(): void {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }
}
```

**Features**:
- Cross-browser compatibility via Web Audio API
- Audio context suspension handling for mobile browsers
- Graceful fallback if audio initialization fails
- Lazy loading of audio resources

### Push Notification System

**Browser API Integration**:
```typescript
class PushNotificationManager {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    
    return await Notification.requestPermission();
  }
  
  showNotification(title: string, options: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'bx-os-reflection',
        requireInteraction: false,
        ...options
      });
    }
  }
}
```

**Features**:
- Permission state management
- PWA icon integration for consistent branding
- Automatic notification closure after 5 seconds
- Graceful handling of permission denial

### Real-Time Update System

**Supabase Integration**:
```typescript
const useNotifications = (userRole: string) => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const subscription = supabase
      .channel('user_notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'behavior_support_requests',
        filter: userRole === 'teacher' ? `teacher_id=eq.${userId}` : ''
      }, () => {
        fetchNotifications();
      })
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [userRole]);
};
```

## Performance Optimization

### Efficient Resource Management

- **Singleton Pattern**: Single NotificationService instance across application
- **Lazy Loading**: Audio resources loaded only when needed
- **Memoized Notifications**: Notification list generation optimized
- **Efficient Subscriptions**: Real-time updates target specific user data only

### Memory Management

- **Subscription Cleanup**: Automatic unsubscription on component unmount
- **Audio Context Management**: Proper audio context suspension and resumption
- **Notification Limiting**: Maximum notification display prevents memory bloat

## Error Handling & Fallbacks

### Audio System Errors

- **Initialization Failures**: Console warnings without blocking application
- **Browser Compatibility**: Graceful degradation for unsupported browsers
- **Network Issues**: Silent failure if audio file unavailable

### Push Notification Errors

- **Permission Denied**: Clear user messaging about enabling permissions
- **Unsupported Browsers**: Disabled UI states for incompatible browsers
- **Network Failures**: Local notification fallback for connectivity issues

### Real-Time System Errors

- **Connection Failures**: Automatic reconnection via Supabase client
- **Database Errors**: Error logging without UI crashes
- **Network Interruptions**: Fallback to last known notification state

## Testing & Validation

### Manual Testing Procedures

1. **Audio Test**: Use "Test Notifications" button in settings
2. **Permission Test**: Verify browser permission request flow
3. **Push Test**: Test notifications with app minimized/closed
4. **Real-Time Test**: Create test reflection and verify notification appears

### Integration Testing

1. **End-to-End Flow**: Create BSR → Student completes → Teacher receives notification
2. **Cross-Session Testing**: Verify notifications appear across multiple browser sessions
3. **Preference Persistence**: Verify settings save and load correctly across sessions
4. **Performance Testing**: Test notification system under concurrent user load

## PWA Integration

### Service Worker Enhancement

**Notification Support**:
```javascript
// Service worker notification handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open app if notification clicked
  event.waitUntil(
    clients.openWindow('/teacher-dashboard')
  );
});
```

### Installation Benefits

- **Background Notifications**: Notifications work when app not actively open
- **Native Feel**: Notifications integrate with device notification system
- **Offline Support**: Notification preferences cached for offline access

## Future Enhancement Opportunities

### Advanced Notification Types

- **Escalation Alerts**: Notifications for overdue reflections
- **Administrative Alerts**: System health and user management notifications
- **Batch Notifications**: Grouped notifications for multiple reflections

### Enhanced User Experience

- **Notification Preview**: Quick preview of reflection content in notification
- **Custom Sounds**: User-selectable notification sounds
- **Do Not Disturb**: Scheduled quiet hours for notifications
- **Email Integration**: Email notifications for critical alerts

---

**Last Updated**: August 2025  
**Dependencies**: Supabase Real-time, Web Audio API, Browser Notification API, PWA Service Worker