# Component Documentation

## Authentication Components

### AdminRoute
```typescript
// Role-based route protection for administrators
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useProfile();
  
  if (loading) return <div>Loading...</div>;
  
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

### TeacherRoute  
```typescript
// Route protection for teachers and above
export const TeacherRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useProfile();
  
  if (loading) return <div>Loading...</div>;
  
  if (!profile || !['teacher', 'admin', 'super_admin'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
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
export const useSupabaseQueue = () => {
  const [queueItems, setQueueItems] = useState([]);
  
  useEffect(() => {
    const fetchQueue = async () => {
      const { data } = await supabase
        .from('queue_items')
        .select(`
          *,
          students(first_name, last_name, student_id),
          behavior_support_requests(behavior_category, description)
        `)
        .order('created_at');
      setQueueItems(data || []);
    };
    
    fetchQueue();
    
    const subscription = supabase
      .channel('queue_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'queue_items' },
        () => fetchQueue()
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, []);
  
  return { data: queueItems };
};
```