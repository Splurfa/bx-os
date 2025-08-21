import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Volume2, Smartphone } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettingsProps {
  userId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const [settings, setSettings] = useState({
    audio_enabled: true,
    push_enabled: false,
    reflection_ready: true
  });
  const [pushPermission, setPushPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, [userId]);

  const loadSettings = async () => {
    const userSettings = await notificationService.getUserNotificationSettings(userId);
    setSettings(userSettings);
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const handleSettingChange = async (settingType: string, enabled: boolean) => {
    try {
      await notificationService.updateNotificationSetting(userId, settingType, enabled);
      setSettings(prev => ({ ...prev, [settingType]: enabled }));
      
      toast({
        title: "Settings Updated",
        description: `${settingType.replace('_', ' ')} notifications ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };

  const requestPushPermission = async () => {
    const permission = await notificationService.requestNotificationPermission();
    
    if (permission.granted) {
      setPushPermission('granted');
      await handleSettingChange('push_enabled', true);
      toast({
        title: "Success",
        description: "Push notifications enabled! You'll receive notifications even when the app is closed."
      });
    } else {
      toast({
        title: "Permission Denied",
        description: "To enable push notifications, please allow notifications in your browser settings.",
        variant: "destructive"
      });
    }
  };

  const testNotification = async () => {
    await notificationService.handleNewNotification(
      userId,
      "Test Notification",
      "This is a test to make sure your notifications are working properly."
    );
    
    toast({
      title: "Test Sent",
      description: "Check if you heard the sound and/or saw the notification."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to receive notifications about student reflections and system updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="audio-notifications" className="text-base font-medium">
                Audio Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Play a sound when new notifications arrive
              </p>
            </div>
          </div>
          <Switch
            id="audio-notifications"
            checked={settings.audio_enabled}
            onCheckedChange={(checked) => handleSettingChange('audio_enabled', checked)}
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="push-notifications" className="text-base font-medium">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications even when the app is closed
              </p>
              {pushPermission === 'denied' && (
                <p className="text-sm text-destructive">
                  Permission denied. Enable in browser settings to use this feature.
                </p>
              )}
            </div>
          </div>
          {pushPermission === 'granted' ? (
            <Switch
              id="push-notifications"
              checked={settings.push_enabled}
              onCheckedChange={(checked) => handleSettingChange('push_enabled', checked)}
            />
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={requestPushPermission}
              disabled={pushPermission === 'denied'}
            >
              Enable
            </Button>
          )}
        </div>

        {/* Reflection Ready Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="reflection-notifications" className="text-base font-medium">
                Reflection Ready Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when student reflections are ready for review
              </p>
            </div>
          </div>
          <Switch
            id="reflection-notifications"
            checked={settings.reflection_ready}
            onCheckedChange={(checked) => handleSettingChange('reflection_ready', checked)}
          />
        </div>

        {/* Test Button */}
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={testNotification}
            className="w-full"
          >
            Test Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};