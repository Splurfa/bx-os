import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TouchOptimizedButton } from './TouchOptimizedButton';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  type: 'behavior_request' | 'reflection_submitted' | 'reflection_approved' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  studentName?: string;
  teacherName?: string;
  kioskId?: number;
}

interface NotificationBellProps {
  userRole: 'teacher' | 'admin' | 'super_admin';
  maxNotifications?: number;
  autoMarkAsRead?: boolean;
  showPWAGuidance?: boolean;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userRole,
  maxNotifications = 50,
  autoMarkAsRead = false,
  showPWAGuidance = true,
  className = ""
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate notifications from behavior requests and reflections
  const generateNotifications = (behaviorRequests: any[], reflections: any[]): NotificationItem[] => {
    const notifications: NotificationItem[] = [];

    // Behavior request notifications (for admins and assigned teachers)
    behaviorRequests.forEach(request => {
      if (userRole === 'admin' || userRole === 'super_admin' || request.teacher_id === user?.id) {
        const studentName = `${request.student?.first_name || ''} ${request.student?.last_name || ''}`.trim() || 
                           'Unknown Student';

        if (request.status === 'waiting') {
          notifications.push({
            id: `request-${request.id}`,
            type: 'behavior_request',
            title: 'New Behavior Request',
            message: `${studentName} is waiting for reflection`,
            timestamp: request.created_at,
            read: false,
            priority: request.priority_level === 'high' ? 'high' : 'medium',
            studentName,
            teacherName: request.teacher_name,
            kioskId: request.assigned_kiosk
          });
        }

        if (request.status === 'active' && request.assigned_kiosk) {
          notifications.push({
            id: `active-${request.id}`,
            type: 'behavior_request',
            title: 'Student at Kiosk',
            message: `${studentName} is completing reflection at Kiosk ${request.assigned_kiosk}`,
            timestamp: request.updated_at,
            read: false,
            priority: 'medium',
            studentName,
            teacherName: request.teacher_name,
            kioskId: request.assigned_kiosk
          });
        }
      }
    });

    // Reflection notifications (for teachers and admins)
    reflections.forEach(reflection => {
      const behaviorRequest = behaviorRequests.find(req => req.id === reflection.behavior_request_id);
      if (!behaviorRequest) return;

      const studentName = `${behaviorRequest.student?.first_name || ''} ${behaviorRequest.student?.last_name || ''}`.trim() || 
                         'Unknown Student';

      if (userRole === 'admin' || userRole === 'super_admin' || behaviorRequest.teacher_id === user?.id) {
        if (!reflection.teacher_approved && !reflection.revision_requested) {
          notifications.push({
            id: `reflection-${reflection.id}`,
            type: 'reflection_submitted',
            title: 'Reflection Submitted',
            message: `${studentName} has submitted their reflection for review`,
            timestamp: reflection.submitted_at || reflection.created_at,
            read: false,
            priority: 'medium',
            studentName,
            teacherName: behaviorRequest.teacher_name
          });
        }

        if (reflection.teacher_approved) {
          notifications.push({
            id: `approved-${reflection.id}`,
            type: 'reflection_approved',
            title: 'Reflection Approved',
            message: `${studentName}'s reflection has been approved`,
            timestamp: reflection.reviewed_at || reflection.updated_at,
            read: false,
            priority: 'low',
            studentName,
            teacherName: behaviorRequest.teacher_name
          });
        }
      }
    });

    // Sort by timestamp (newest first) and limit
    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, maxNotifications);
  };

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Fetch behavior requests
      const { data: behaviorRequests, error: requestsError } = await supabase
        .from('behavior_requests')
        .select(`
          *,
          student:students(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (requestsError) throw requestsError;

      // Fetch reflections
      const { data: reflections, error: reflectionsError } = await supabase
        .from('reflections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (reflectionsError) throw reflectionsError;

      const generatedNotifications = generateNotifications(behaviorRequests || [], reflections || []);
      setNotifications(generatedNotifications);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchNotifications();

    // Subscribe to behavior_requests changes
    const behaviorRequestsChannel = supabase
      .channel('behavior_requests_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'behavior_requests'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // Subscribe to reflections changes
    const reflectionsChannel = supabase
      .channel('reflections_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reflections'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(behaviorRequestsChannel);
      supabase.removeChannel(reflectionsChannel);
    };
  }, [user?.id, userRole]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'behavior_request':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'reflection_submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'reflection_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TouchOptimizedButton
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          touchTargetSize="default"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </TouchOptimizedButton>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 bg-background border shadow-lg z-50" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              Real-time behavior management updates
            </CardDescription>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-3 cursor-pointer hover:bg-muted/50 border-l-4 ${getPriorityColor(notification.priority)} ${
                          !notification.read ? 'bg-muted/20' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </p>
                              {notification.kioskId && (
                                <Badge variant="outline" className="text-xs">
                                  Kiosk {notification.kioskId}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          
          {showPWAGuidance && (
            <>
              <Separator />
              <div className="p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground text-center">
                  💡 Install this app for better notification support
                </div>
              </div>
            </>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
};