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
    // Development/testing bypass
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('bypass_multi_tab_detection') === 'true') {
      console.log('🔧 Multi-tab detection bypassed for development/testing');
      return false;
    }

    const storageKey = 'kiosk_session_tab_id';
    const heartbeatKey = 'kiosk_tab_heartbeat';
    const currentTime = Date.now();
    
    // Get or create persistent tab ID for this session
    let currentTabId = sessionStorage.getItem(storageKey);
    if (!currentTabId) {
      currentTabId = `tab_${currentTime}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(storageKey, currentTabId);
      console.log('🏷️ Generated new tab ID:', currentTabId);
    }
    
    // Check for other active tabs by looking at heartbeat data
    const storedData = localStorage.getItem(heartbeatKey);
    let activeTabsData: Record<string, number> = {};
    
    try {
      activeTabsData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {
      console.warn('Failed to parse tab heartbeat data, resetting');
      activeTabsData = {};
    }
    
    // Clean up stale tabs (older than 10 seconds)
    const staleThreshold = currentTime - 10000;
    Object.keys(activeTabsData).forEach(tabId => {
      if (activeTabsData[tabId] < staleThreshold) {
        delete activeTabsData[tabId];
      }
    });
    
    // Update current tab's heartbeat
    activeTabsData[currentTabId] = currentTime;
    localStorage.setItem(heartbeatKey, JSON.stringify(activeTabsData));
    
    // Check if there are other active tabs
    const activeTabs = Object.keys(activeTabsData).filter(tabId => tabId !== currentTabId);
    const hasConflict = activeTabs.length > 0;
    
    if (hasConflict) {
      console.warn('🚨 Multi-tab conflict detected. Active tabs:', activeTabs);
    } else {
      console.log('✅ No multi-tab conflict detected');
    }
    
    return hasConflict;
  }

  /**
   * Clear multi-tab tracking
   */
  clearTabTracking(): void {
    const storageKey = 'kiosk_session_tab_id';
    const heartbeatKey = 'kiosk_tab_heartbeat';
    
    // Get current tab ID
    const currentTabId = sessionStorage.getItem(storageKey);
    
    // Remove current tab from heartbeat tracking
    if (currentTabId) {
      const storedData = localStorage.getItem(heartbeatKey);
      try {
        const activeTabsData = storedData ? JSON.parse(storedData) : {};
        delete activeTabsData[currentTabId];
        localStorage.setItem(heartbeatKey, JSON.stringify(activeTabsData));
        console.log('🧹 Cleared tab tracking for:', currentTabId);
      } catch (e) {
        console.warn('Failed to update tab heartbeat data during cleanup');
      }
    }
    
    // Clear session storage
    sessionStorage.removeItem(storageKey);
    
    // Only clear localStorage if no other tabs are active
    const storedData = localStorage.getItem(heartbeatKey);
    try {
      const activeTabsData = storedData ? JSON.parse(storedData) : {};
      if (Object.keys(activeTabsData).length === 0) {
        localStorage.removeItem(heartbeatKey);
        console.log('🧹 All tabs closed, cleared localStorage tracking');
      }
    } catch (e) {
      // If parsing fails, clear everything
      localStorage.removeItem(heartbeatKey);
    }
  }

  /**
   * Enable bypass for multi-tab detection (for testing/admin)
   */
  enableMultiTabBypass(): void {
    localStorage.setItem('bypass_multi_tab_detection', 'true');
    console.log('🔓 Multi-tab detection bypass enabled');
  }

  /**
   * Disable bypass for multi-tab detection
   */
  disableMultiTabBypass(): void {
    localStorage.removeItem('bypass_multi_tab_detection');
    console.log('🔒 Multi-tab detection bypass disabled');
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