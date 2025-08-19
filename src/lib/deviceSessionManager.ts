import { supabase } from "@/integrations/supabase/client";

/**
 * Device Session Manager - Handles device fingerprinting, session creation, and validation
 */
export class DeviceSessionManager {
  private deviceFingerprint: string | null = null;

  /**
   * Generate a device fingerprint based on available browser characteristics
   */
  generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 0,
      navigator.platform
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    this.deviceFingerprint = Math.abs(hash).toString(36);
    return this.deviceFingerprint;
  }

  /**
   * Get or generate device fingerprint
   */
  getDeviceFingerprint(): string {
    if (!this.deviceFingerprint) {
      return this.generateDeviceFingerprint();
    }
    return this.deviceFingerprint;
  }

  /**
   * Create a new device session for a kiosk
   */
  async createDeviceSession(kioskId: number, expiresInHours: number = 24): Promise<{
    sessionId: string;
    accessUrl: string;
  } | null> {
    try {
      console.log('🔄 Creating device session for kiosk:', kioskId);
      const fingerprint = this.getDeviceFingerprint();
      console.log('🔐 Device fingerprint generated:', fingerprint);
      
      const { data, error } = await supabase.rpc('create_device_session', {
        p_kiosk_id: kioskId,
        p_device_fingerprint: fingerprint,
        p_user_agent: navigator.userAgent,
        p_ip_address: null, // Will be handled server-side
        p_expires_in_hours: expiresInHours
      });

      console.log('📡 RPC response:', { data, error });

      if (error) {
        console.error('❌ Failed to create device session:', error);
        throw new Error(`Failed to create device session: ${error.message}`);
      }

      if (data && data.length > 0) {
        const result = {
          sessionId: data[0].session_id,
          accessUrl: data[0].access_url
        };
        console.log('✅ Device session created successfully:', result);
        return result;
      }

      console.warn('⚠️ No data returned from device session creation');
      throw new Error('No session data returned from database');
    } catch (error) {
      console.error('💥 Error creating device session:', error);
      throw error; // Re-throw instead of returning null to trigger error handling
    }
  }

  /**
   * Validate an existing device session
   */
  async validateDeviceSession(sessionId: string): Promise<{
    isValid: boolean;
    kioskId: number | null;
    remainingSeconds: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('validate_device_session', {
        p_session_id: sessionId,
        p_device_fingerprint: this.getDeviceFingerprint()
      });

      if (error) {
        console.error('Failed to validate device session:', error);
        return { isValid: false, kioskId: null, remainingSeconds: 0 };
      }

      if (data && data.length > 0) {
        const result = data[0];
        return {
          isValid: result.is_valid,
          kioskId: result.kiosk_id,
          remainingSeconds: result.remaining_seconds
        };
      }

      return { isValid: false, kioskId: null, remainingSeconds: 0 };
    } catch (error) {
      console.error('Error validating device session:', error);
      return { isValid: false, kioskId: null, remainingSeconds: 0 };
    }
  }

  /**
   * Send heartbeat to maintain session
   */
  async sendHeartbeat(sessionId: string): Promise<boolean> {
    try {
      // Heartbeat is automatically sent when validating session
      const result = await this.validateDeviceSession(sessionId);
      return result.isValid;
    } catch (error) {
      console.error('Error sending heartbeat:', error);
      return false;
    }
  }

  /**
   * Cleanup expired sessions (admin function)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_device_sessions');

      if (error) {
        console.error('Failed to cleanup expired sessions:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Check if device has multiple tabs open (conflict detection)
   */
  checkMultiTabConflict(): boolean {
    const storageKey = 'kiosk_session_tab_id';
    const currentTabId = Date.now().toString();
    
    // Set current tab ID
    sessionStorage.setItem(storageKey, currentTabId);
    
    // Check if another tab is already active
    const existingTabId = localStorage.getItem(storageKey);
    
    if (existingTabId && existingTabId !== currentTabId) {
      return true; // Conflict detected
    }
    
    // Set as active tab
    localStorage.setItem(storageKey, currentTabId);
    return false;
  }

  /**
   * Clear multi-tab tracking
   */
  clearTabTracking(): void {
    localStorage.removeItem('kiosk_session_tab_id');
    sessionStorage.removeItem('kiosk_session_tab_id');
  }

  /**
   * Extract session ID from URL path
   */
  static extractSessionIdFromUrl(path: string): string | null {
    const match = path.match(/\/kiosk\/([A-Z0-9]{8})$/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Generate kiosk access URL
   */
  static generateAccessUrl(sessionId: string): string {
    return `/kiosk/${sessionId}`;
  }
}

// Singleton instance
export const deviceSessionManager = new DeviceSessionManager();