import { supabase } from '@/integrations/supabase/client';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private audioContext: AudioContext | null = null;
  private notificationSound: AudioBuffer | null = null;

  private constructor() {
    this.initializeAudio();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load notification sound
      const response = await fetch('/notification-sound.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.notificationSound = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  async playNotificationSound() {
    if (!this.audioContext || !this.notificationSound) {
      console.warn('Audio not available');
      return;
    }

    try {
      // Resume audio context if suspended (required for mobile)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.notificationSound;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false };
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  async showPushNotification(title: string, options: NotificationOptions = {}) {
    const permission = await this.requestNotificationPermission();
    
    if (!permission.granted) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'bsr-notification',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.warn('Failed to show notification:', error);
    }
  }

  async getUserNotificationSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Convert array to settings object
      const settings: Record<string, boolean> = {};
      data?.forEach(setting => {
        settings[setting.notification_type] = setting.enabled;
      });

      return {
        audio_enabled: settings.audio_enabled ?? true,
        push_enabled: settings.push_enabled ?? false,
        reflection_ready: settings.reflection_ready ?? true
      };
    } catch (error) {
      console.warn('Failed to get notification settings:', error);
      return {
        audio_enabled: true,
        push_enabled: false,
        reflection_ready: true
      };
    }
  }

  async updateNotificationSetting(userId: string, notificationType: string, enabled: boolean) {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          notification_type: notificationType,
          enabled
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update notification setting:', error);
    }
  }

  async handleNewNotification(userId: string, title: string, message: string) {
    const settings = await this.getUserNotificationSettings(userId);

    // Play audio notification if enabled
    if (settings.audio_enabled) {
      await this.playNotificationSound();
    }

    // Show push notification if enabled and permission granted
    if (settings.push_enabled) {
      await this.showPushNotification(title, {
        body: message,
        data: { userId, timestamp: Date.now() }
      });
    }
  }
}

export const notificationService = NotificationService.getInstance();