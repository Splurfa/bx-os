# Component Documentation

## Authentication Components

### AdminRoute
```typescript
// Role-based route protection for administrators
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
```

### TeacherRoute  
```typescript
// Route protection for teachers and above
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface TeacherRouteProps {
  children: React.ReactNode;
}

const TeacherRoute = ({ children }: TeacherRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
    // Redirect to admin dashboard if user has admin role but accessed teacher route
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
```

## Queue Management Components

### QueueDisplay
```typescript
// Real-time queue visualization
export const QueueDisplay = () => {
  const { data: queueItems } = useSupabaseQueue();
  
  return (
    <div className="space-y-4">
      {queueItems?.map((item) => (
        <QueueItem key={item.id} item={item} />
      ))}
    </div>
  );
};
```

### NotificationBell
```typescript
// System notifications with audio alerts
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead } = useNotifications();
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

## Kiosk Components

### UniversalKiosk
```typescript
// Shared kiosk interface for all stations
export const UniversalKiosk = ({ kioskId }: { kioskId: number }) => {
  const { assignedStudent, loading } = useKioskAssignment(kioskId);
  
  if (loading) return <LoadingSpinner />;
  
  if (!assignedStudent) {
    return <WaitingForAssignment kioskId={kioskId} />;
  }
  
  return <ReflectionWorkflow student={assignedStudent} kioskId={kioskId} />;
};
```

## Custom Hooks

### usePermissions
```typescript
// Role-based permission checking
export const usePermissions = () => {
  const { profile } = useProfile();
  
  const canManageUsers = profile?.role === 'super_admin';
  const canCreateBSR = ['teacher', 'admin', 'super_admin'].includes(profile?.role);
  const canViewQueue = ['teacher', 'admin', 'super_admin'].includes(profile?.role);
  const canManageQueue = ['admin', 'super_admin'].includes(profile?.role);
  
  return {
    canManageUsers,
    canCreateBSR,
    canViewQueue,
    canManageQueue
  };
};
```

### useSupabaseQueue
```typescript
// Real-time queue management
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseQueue = () => {
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('behavior_requests')
          .select(`
            *,
            students(first_name, last_name, grade),
            kiosks(id, name, is_active),
            reflections(id, submitted_at, teacher_approved)
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setQueueItems(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueue();
    
    const subscription = supabase
      .channel('queue_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'behavior_requests' },
        () => fetchQueue()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reflections' },
        () => fetchQueue()
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);
  
  return { data: queueItems, loading, error };
};
```