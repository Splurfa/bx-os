import React, { useState, useEffect, useCallback } from 'react';
import { Bell, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  type: 'reflection_ready_for_review';
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high';
  data?: any;
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
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);

  // Generate simplified notifications - only reflection ready for review
  const generateNotifications = useCallback((
    reflections: any[]
  ): NotificationItem[] => {
    const notificationItems: NotificationItem[] = [];
    
    // Only show reflections that are submitted and ready for teacher review
    reflections.forEach(reflection => {
      if (reflection.submitted_at && !reflection.teacher_approved && !reflection.revision_requested) {
        const behaviorRequest = reflection.behavior_request;
        if (behaviorRequest?.student) {
          notificationItems.push({
            id: `ref-${reflection.id}`,
            type: 'reflection_ready_for_review',
            message: `${behaviorRequest.student.first_name} ${behaviorRequest.student.last_name} completed their reflection - ready for review`,
            timestamp: reflection.submitted_at,
            read: false,
            priority: 'high',
            data: { reflectionId: reflection.id, behaviorRequestId: reflection.behavior_request_id }
          });
        }
      }
    });

    // Sort by timestamp (newest first)
    return notificationItems
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  // Fetch notifications data
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      if (!user) return;

      // Check if user has notification settings enabled for this type
      const { data: notificationSettings } = await supabase
        .from('notification_settings')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('notification_type', 'reflection_ready_for_review')
        .single();

      // If notifications are disabled, show empty state
      if (notificationSettings && !notificationSettings.enabled) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Only fetch reflections for teacher's behavior requests that need review
      const { data: reflections, error: refError } = await supabase
        .from('reflections')
        .select(`
          *,
          behavior_request:behavior_requests!inner(
            *,
            student:students(*)
          )
        `)
        .eq('behavior_request.teacher_id', user.id)
        .not('submitted_at', 'is', null)
        .eq('teacher_approved', false)
        .eq('revision_requested', false)
        .order('submitted_at', { ascending: false });

      if (refError) {
        console.error('Error fetching reflections:', refError);
        return;
      }

      // Generate notifications
      const newNotifications = generateNotifications(reflections || []);
      
      // Check if we have new notifications and trigger audio/push
      const currentUnreadCount = newNotifications.filter(n => !n.read).length;
      if (currentUnreadCount > previousNotificationCount && previousNotificationCount > 0) {
        // We have new notifications - trigger audio/push
        if (user && newNotifications.length > 0) {
          const latestNotification = newNotifications[0];
          notificationService.handleNewNotification(
            user.id,
            'New Reflection Ready',
            latestNotification.message
          );
        }
      }
      
      setNotifications(newNotifications);
      setPreviousNotificationCount(currentUnreadCount);

    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, generateNotifications]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchNotifications();
    
    // Only subscribe to reflections changes since that's all we care about
    const reflectionsSubscription = supabase
      .channel('reflections_notifications')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'reflections',
          filter: 'submitted_at=not.is.null'
        }, 
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reflectionsSubscription);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get appropriate icon for notification type
  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'reflection_ready_for_review':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    return 'border-l-green-500 bg-green-50';
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
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
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
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 bg-background border shadow-lg z-[100]" 
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
              Reflections ready for review
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
                  No reflections ready for review
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
                                Reflection Ready
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </p>
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