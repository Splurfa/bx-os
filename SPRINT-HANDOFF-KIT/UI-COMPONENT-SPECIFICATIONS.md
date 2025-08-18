# 📱 UI Component Specifications

## Mobile-First Component Requirements for Classroom Tablet Deployment

### **TOUCH-OPTIMIZED COMPONENT LIBRARY**

## 1. 🖱️ TouchOptimizedButton Component

### Component Specifications
**File:** `src/components/ui/touch-optimized-button.tsx`
**Priority:** CRITICAL - Foundation component for all interfaces

**Requirements:**
- [ ] **Minimum 44px touch targets** for accessibility compliance
- [ ] **Immediate visual feedback** on touch interaction (<50ms)
- [ ] **Haptic feedback simulation** using navigator.vibrate() when available
- [ ] **Touch state management** with pressed, hover, and disabled states
- [ ] **Gesture recognition** for long press and double tap events

**Technical Implementation:**
```typescript
interface TouchOptimizedButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'kiosk';
  size: 'sm' | 'md' | 'lg' | 'xl' | 'kiosk'; // kiosk = extra large for students
  hapticFeedback?: boolean;
  touchResponse?: 'immediate' | 'delayed';
  gestureHandlers?: {
    onLongPress?: () => void;
    onDoubleClick?: () => void;
  };
}
```

**Design Specifications:**
```css
/* Touch-optimized sizing */
.touch-button-sm { min-height: 44px; min-width: 44px; }
.touch-button-md { min-height: 48px; min-width: 88px; }
.touch-button-lg { min-height: 56px; min-width: 120px; }
.touch-button-xl { min-height: 64px; min-width: 140px; }
.touch-button-kiosk { min-height: 80px; min-width: 200px; font-size: 1.5rem; }

/* Immediate touch feedback */
.touch-button:active { 
  transform: scale(0.98); 
  transition: transform 0.05s ease-out;
}
```

---

## 2. 🎯 SwipeNavigation Component

### Component Specifications
**File:** `src/components/ui/swipe-navigation.tsx`
**Priority:** HIGH - Enhanced mobile navigation

**Requirements:**
- [ ] **Horizontal swipe detection** with configurable sensitivity
- [ ] **Smooth animation transitions** between navigation states
- [ ] **Touch boundary recognition** to prevent accidental swipes
- [ ] **Momentum scrolling** with natural deceleration
- [ ] **Accessibility support** with keyboard navigation fallback

**Technical Implementation:**
```typescript
interface SwipeNavigationProps {
  items: NavigationItem[];
  sensitivity: number; // Default: 50px swipe threshold
  animationDuration: number; // Default: 300ms
  enableMomentum: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onNavigate?: (index: number) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  component: React.ComponentType;
  icon?: React.ComponentType;
}
```

**Gesture Recognition:**
```typescript
// Swipe gesture implementation using framer-motion
const swipeHandlers = {
  onPanStart: (event, info) => {
    setIsSwiping(true);
    setSwipeStartX(info.point.x);
  },
  onPanEnd: (event, info) => {
    const swipeDistance = info.point.x - swipeStartX;
    const swipeVelocity = info.velocity.x;
    
    if (Math.abs(swipeDistance) > sensitivity || Math.abs(swipeVelocity) > 500) {
      swipeDistance > 0 ? onSwipeRight?.() : onSwipeLeft?.();
    }
    setIsSwiping(false);
  }
};
```

---

## 3. 📄 MobileModal Component

### Component Specifications
**File:** `src/components/ui/mobile-modal.tsx`
**Priority:** HIGH - Critical for mobile workflow management

**Requirements:**
- [ ] **Full-screen modal design** optimized for tablet viewing
- [ ] **Swipe-to-close gesture** with pull-down indicator
- [ ] **Touch-outside-to-close** with large touch zones
- [ ] **Smooth slide animations** with spring physics
- [ ] **Focus management** for keyboard navigation accessibility

**Technical Implementation:**
```typescript
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  swipeToClose?: boolean;
  closeOnOverlayClick?: boolean;
  animationType: 'slide' | 'fade' | 'scale';
  position: 'bottom' | 'center' | 'top';
}
```

**Animation Specifications:**
```typescript
// Framer Motion animation variants
const modalVariants = {
  hidden: { 
    y: '100%', 
    opacity: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  visible: { 
    y: '0%', 
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
};
```

---

## 4. 🏢 TabletKioskInterface Component

### Component Specifications
**File:** `src/components/ui/tablet-kiosk-interface.tsx`
**Priority:** CRITICAL - Core student-facing interface

**Requirements:**
- [ ] **Extra-large touch elements** designed for student use
- [ ] **Clear visual hierarchy** with high contrast colors
- [ ] **Error prevention** with confirmation dialogs for critical actions
- [ ] **Student-friendly messaging** with age-appropriate language
- [ ] **Progress indicators** showing reflection completion status

**Design Specifications:**
```css
/* Tablet-optimized kiosk styling */
.kiosk-interface {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-variant)));
}

.kiosk-button {
  min-height: 80px;
  min-width: 200px;
  font-size: 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
}

.kiosk-text {
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.kiosk-input {
  min-height: 56px;
  font-size: 1.125rem;
  padding: 1rem;
  border-radius: 8px;
}
```

**Student-Friendly Features:**
```typescript
interface KioskInterfaceProps {
  studentName: string;
  queuePosition: number;
  reflectionStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Age-appropriate messaging
const kioskMessages = {
  welcome: `Hi ${studentName}! You're in position ${queuePosition} in the queue.`,
  progress: `Step ${reflectionStep} of ${totalSteps}`,
  encouragement: "Take your time and think about your answer.",
  completion: "Great job! Your reflection has been submitted."
};
```

---

## 5. 🎨 MoodSlider Component (Enhanced)

### Component Specifications
**File:** `src/components/ui/mood-slider.tsx`
**Priority:** MEDIUM - Enhanced reflection interface

**Requirements:**
- [ ] **Large thumb control** for easy touch manipulation
- [ ] **Visual emotion indicators** along the slider track
- [ ] **Haptic feedback** at slider position milestones
- [ ] **Accessibility labels** for screen reader support
- [ ] **Touch-friendly sizing** with extended touch zones

**Enhanced Design:**
```typescript
interface MoodSliderProps {
  value: number; // 1-10 scale
  onChange: (value: number) => void;
  showEmoticons?: boolean;
  showLabels?: boolean;
  hapticFeedback?: boolean;
  touchZoneSize?: 'normal' | 'large' | 'xl';
}

const emotionLabels = {
  1: { emoji: '😢', label: 'Very Sad' },
  3: { emoji: '😔', label: 'Sad' },
  5: { emoji: '😐', label: 'Okay' },
  7: { emoji: '🙂', label: 'Good' },
  10: { emoji: '😄', label: 'Great' }
};
```

---

## 6. 🔔 NotificationBell Component

### Component Specifications
**File:** `src/components/ui/notification-bell.tsx`
**Priority:** MEDIUM - Real-time notification system

**Requirements:**
- [ ] **Badge count display** with dynamic updates
- [ ] **Dropdown notification list** with touch-friendly items
- [ ] **Real-time subscription** to Supabase changes
- [ ] **Role-based filtering** for relevant notifications
- [ ] **Touch-optimized interactions** for all notification actions

**Technical Implementation:**
```typescript
interface NotificationBellProps {
  userId: string;
  userRole: 'teacher' | 'admin' | 'super_admin';
  maxNotifications?: number; // Default: 10
  autoMarkAsRead?: boolean;
  onNotificationClick?: (notification: Notification) => void;
}

interface Notification {
  id: string;
  type: 'BSR_assigned' | 'reflection_completed' | 'urgent_behavior';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  studentName?: string;
  actionUrl?: string;
}
```

**Real-Time Integration:**
```typescript
// Supabase subscription for real-time notifications
useEffect(() => {
  const subscription = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'behavior_requests',
      filter: `teacher_id=eq.${userId}`
    }, (payload) => {
      addNotification({
        type: 'BSR_assigned',
        title: 'New Behavior Request',
        message: `${payload.new.student_name} has been assigned to your queue`,
        timestamp: new Date(),
        isRead: false
      });
    })
    .subscribe();
    
  return () => supabase.removeChannel(subscription);
}, [userId]);
```

---

## **COMPONENT LIBRARY INTEGRATION**

### 7. 📚 Component Export Structure

**File:** `src/components/ui/index.ts`
```typescript
// Touch-Optimized Component Exports
export { TouchOptimizedButton } from './touch-optimized-button';
export { SwipeNavigation } from './swipe-navigation';
export { MobileModal } from './mobile-modal';
export { TabletKioskInterface } from './tablet-kiosk-interface';
export { NotificationBell } from './notification-bell';

// Enhanced Existing Components
export { MoodSlider } from './mood-slider';
export { Button } from './button'; // Enhanced with touch targets
export { Card } from './card'; // Enhanced with touch interactions
```

### 8. 🎨 Design System Integration

**File:** `src/index.css` (Enhancements)
```css
/* Touch-optimized design tokens */
:root {
  /* Touch target sizes */
  --touch-target-sm: 44px;
  --touch-target-md: 48px;
  --touch-target-lg: 56px;
  --touch-target-xl: 64px;
  --touch-target-kiosk: 80px;
  
  /* Touch feedback */
  --touch-response-fast: 50ms;
  --touch-response-normal: 150ms;
  --touch-scale-active: 0.98;
  
  /* Kiosk-specific tokens */
  --kiosk-font-size: 1.5rem;
  --kiosk-padding: 2rem;
  --kiosk-border-radius: 12px;
  --kiosk-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
}

/* Touch interaction base classes */
.touch-interactive {
  min-height: var(--touch-target-md);
  min-width: var(--touch-target-md);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.touch-feedback:active {
  transform: scale(var(--touch-scale-active));
  transition: transform var(--touch-response-fast) ease-out;
}
```

---

## **IMPLEMENTATION CHECKLIST**

### Component Development Priority
- [ ] **TouchOptimizedButton** - Foundation component (1 hour)
- [ ] **TabletKioskInterface** - Critical for kiosk deployment (2 hours)
- [ ] **SwipeNavigation** - Enhanced mobile navigation (1 hour)
- [ ] **MobileModal** - Workflow management (30 minutes)
- [ ] **NotificationBell** - Real-time system (1 hour)
- [ ] **MoodSlider Enhancement** - Reflection interface (30 minutes)

### Testing & Validation Requirements
- [ ] **Touch target accessibility** validation on actual tablets
- [ ] **Gesture recognition** testing with various swipe patterns
- [ ] **Performance benchmarks** <100ms response times
- [ ] **Cross-device compatibility** iPad, Android tablets, phones
- [ ] **Visual feedback consistency** across all components

**🎯 Component Success Definition:** Complete touch-optimized component library operational on classroom tablets with <100ms response times and accessibility compliance for student use.