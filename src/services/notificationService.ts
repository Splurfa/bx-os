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

  async handleNewNotification(userId: string, title: string, message: string, urgencyLevel?: string) {
    const settings = await this.getUserNotificationSettings(userId);

    // Play urgency-specific audio notification if enabled
    if (settings.audio_enabled) {
      await this.playUrgencyNotificationSound(urgencyLevel);
    }

    // Show push notification if enabled and permission granted
    if (settings.push_enabled) {
      await this.showPushNotification(title, {
        body: message,
        data: { userId, timestamp: Date.now(), urgency: urgencyLevel },
        icon: this.getUrgencyIcon(urgencyLevel),
        requireInteraction: urgencyLevel === 'urgent'
      });
    }
  }

  private async playUrgencyNotificationSound(urgencyLevel?: string) {
    if (!this.audioContext || !this.notificationSound) {
      console.warn('Audio not available');
      return;
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.notificationSound;
      
      // Create gain node for volume control based on urgency
      const gainNode = this.audioContext.createGain();
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume based on urgency level
      switch (urgencyLevel) {
        case 'urgent':
          gainNode.gain.value = 1.0; // Full volume
          // Play twice for urgent notifications
          source.start();
          setTimeout(() => {
            const source2 = this.audioContext!.createBufferSource();
            source2.buffer = this.notificationSound;
            const gainNode2 = this.audioContext!.createGain();
            source2.connect(gainNode2);
            gainNode2.connect(this.audioContext!.destination);
            gainNode2.gain.value = 1.0;
            source2.start();
          }, 300);
          break;
        case 're_integration':
          gainNode.gain.value = 0.8; // Slightly lower volume
          source.start();
          break;
        default:
          gainNode.gain.value = 0.6; // Standard volume
          source.start();
          break;
      }
    } catch (error) {
      console.warn('Failed to play urgency notification sound:', error);
    }
  }

  private getUrgencyIcon(urgencyLevel?: string): string {
    switch (urgencyLevel) {
      case 'urgent':
        return '/icon-urgent-192x192.png';
      case 're_integration':
        return '/icon-reintegration-192x192.png';
      default:
        return '/icon-192x192.png';
    }
  }
}

export const notificationService = NotificationService.getInstance();