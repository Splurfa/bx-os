import { supabase } from "@/integrations/supabase/client";

/**
 * Device Session Manager - Handles device fingerprinting, session creation, and validation
 */
export class DeviceSessionManager {
  private static readonly FINGERPRINT_KEY = 'device_fingerprint';

  /**
   * Generate a device fingerprint based on available browser characteristics
   */
  generateDeviceFingerprint(): string {
    // Create a stable, consistent fingerprint without time-sensitive data
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.platform || 'unknown'
    ].join('|');
    
    // Simple hash function for consistent fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const fingerprintHash = Math.abs(hash).toString(36);
    
    // Store in localStorage for persistence across tabs
    localStorage.setItem(DeviceSessionManager.FINGERPRINT_KEY, fingerprintHash);
    console.log('🔐 Generated and stored device fingerprint:', fingerprintHash);
    
    return fingerprintHash;
  }

  /**
   * Get persistent device fingerprint from localStorage or generate new one
   */
  getDeviceFingerprint(): string {
    // Try to get from localStorage first for cross-tab consistency
    const stored = localStorage.getItem(DeviceSessionManager.FINGERPRINT_KEY);
    if (stored) {
      console.log('🔐 Using stored device fingerprint:', stored);
      return stored;
    }
    
    // Generate new if not found
    console.log('🔐 No stored fingerprint found, generating new one');
    return this.generateDeviceFingerprint();
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
   * Validate an existing device session with graceful fingerprint handling
   */
  async validateDeviceSession(sessionId: string): Promise<{
    isValid: boolean;
    kioskId: number | null;
    remainingSeconds: number;
    fingerprintMismatch?: boolean;
  }> {
    const deviceFingerprint = this.getDeviceFingerprint();
    
    try {
      // Use enhanced validation with fingerprint recovery
      const { data, error } = await supabase.rpc('validate_device_session_with_recovery', {
        p_session_id: sessionId,
        p_device_fingerprint: deviceFingerprint
      });

      if (error) {
        console.error('❌ Session validation error:', error);
        return { isValid: false, kioskId: null, remainingSeconds: 0 };
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ Session validation result:', result);
        
        // If fingerprint mismatch detected, try to update it
        if (result.fingerprint_mismatch && result.is_valid) {
          console.warn('⚠️ Fingerprint mismatch detected, attempting to update...');
          await this.updateSessionFingerprint(sessionId, deviceFingerprint);
        }
        
        return {
          isValid: result.is_valid || false,
          kioskId: result.kiosk_id || null,
          remainingSeconds: result.remaining_seconds || 0,
          fingerprintMismatch: result.fingerprint_mismatch || false
        };
      }

      return { isValid: false, kioskId: null, remainingSeconds: 0 };
    } catch (error) {
      console.error('❌ Session validation failed:', error);
      return { isValid: false, kioskId: null, remainingSeconds: 0 };
    }
  }

  /**
   * Update device fingerprint for existing session
   */
  async updateSessionFingerprint(sessionId: string, newFingerprint: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_device_session_fingerprint', {
        p_session_id: sessionId,
        p_new_fingerprint: newFingerprint
      });

      if (error) {
        console.error('❌ Failed to update session fingerprint:', error);
        return false;
      }

      console.log('✅ Session fingerprint updated successfully');
      return data === true;
    } catch (error) {
      console.error('❌ Error updating session fingerprint:', error);
      return false;
    }
  }

  /**
   * Send heartbeat to maintain session
   */
  async sendHeartbeat(sessionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_session_heartbeat', {
        p_session_id: sessionId
      });

      if (error) {
        console.error('❌ Heartbeat update error:', error);
        return false;
      }

      console.log('💓 Heartbeat sent successfully:', data);
      return data === true;
    } catch (error) {
      console.error('❌ Heartbeat failed:', error);
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
   * Enable development mode bypass for easier testing
   */
  enableDevelopmentMode(): void {
    localStorage.setItem('kiosk_development_mode', 'true');
    console.log('🔧 Development mode enabled - bypassing strict validation');
  }

  /**
   * Disable development mode bypass
   */
  disableDevelopmentMode(): void {
    localStorage.removeItem('kiosk_development_mode');
    console.log('🔒 Development mode disabled');
  }

  /**
   * Check if development mode is enabled
   */
  isDevelopmentModeEnabled(): boolean {
    return localStorage.getItem('kiosk_development_mode') === 'true' || 
           process.env.NODE_ENV === 'development';
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
   * Check if multi-tab bypass is enabled
   */
  isMultiTabBypassEnabled(): boolean {
    return localStorage.getItem('bypass_multi_tab_detection') === 'true';
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