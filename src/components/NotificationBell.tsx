import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'behavior_request' | 'reflection_submitted' | 'reflection_approved';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  behavior_request_id?: string;
  student_name?: string;
}

interface NotificationBellProps {
  className?: string;
  maxNotifications?: number;
  showPWAGuidance?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
  maxNotifications = 10,
  showPWAGuidance = true
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    fetchNotifications();

    // Set up real-time subscriptions
    const behaviorRequestsChannel = supabase
      .channel('notification_behavior_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'behavior_requests'
        },
        (payload) => {
          if (payload.new.teacher_id !== user.id) {
            addNotification({
              type: 'behavior_request',
              title: 'New Behavior Request',
              message: `New behavior request submitted`,
              behavior_request_id: payload.new.id,
              student_name: 'Student'
            });
          }
        }
      )
      .subscribe();

    const reflectionsChannel = supabase
      .channel('notification_reflections')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reflections'
        },
        () => {
          addNotification({
            type: 'reflection_submitted',
            title: 'Reflection Submitted',
            message: 'A student has submitted their reflection',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reflections'
        },
        (payload) => {
          if (payload.new.teacher_approved && !payload.old.teacher_approved) {
            addNotification({
              type: 'reflection_approved',
              title: 'Reflection Approved',
              message: 'A reflection has been approved',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(behaviorRequestsChannel);
      supabase.removeChannel(reflectionsChannel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    // This would fetch from a notifications table in a full implementation
    // For now, we'll use mock data
    setNotifications([]);
    setUnreadCount(0);
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}`,
      created_at: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, maxNotifications - 1)]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationData.title, {
        body: notificationData.message,
        icon: '/icon-192x192.png'
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {showPWAGuidance && 'Notification' in window && Notification.permission === 'default' && (
                <Button
                  variant="outline"  
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="text-xs"
                >
                  Enable
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="w-full text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};