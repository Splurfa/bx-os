import { useState, useEffect, useCallback } from 'react';
import { deviceSessionManager } from '@/lib/deviceSessionManager';
import { useToast } from '@/hooks/use-toast';

interface DeviceSessionState {
  sessionId: string | null;
  kioskId: number | null;
  isValid: boolean;
  remainingSeconds: number;
  isLoading: boolean;
  error: string | null;
}

interface UseDeviceSessionOptions {
  sessionId?: string;
  autoHeartbeat?: boolean;
  heartbeatInterval?: number; // milliseconds
  onSessionExpired?: () => void;
  onConflictDetected?: () => void;
}

export function useDeviceSession(options: UseDeviceSessionOptions = {}) {
  const {
    sessionId: providedSessionId,
    autoHeartbeat = true,
    heartbeatInterval = 30000, // 30 seconds
    onSessionExpired,
    onConflictDetected
  } = options;

  const { toast } = useToast();

  const [state, setState] = useState<DeviceSessionState>({
    sessionId: providedSessionId || null,
    kioskId: null,
    isValid: false,
    remainingSeconds: 0,
    isLoading: false,
    error: null
  });

  /**
   * Validate current session
   */
  const validateSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check for multi-tab conflicts (non-blocking warning)
      const hasMultiTabConflict = deviceSessionManager.checkMultiTabConflict();
      if (hasMultiTabConflict) {
        console.warn('⚠️ Multi-tab conflict detected, but continuing with session validation');
        toast({
          variant: "destructive",
          title: "Multiple Tabs Warning",
          description: "Multiple kiosk tabs detected. For best performance, close other tabs.",
        });
        onConflictDetected?.();
        // Continue with validation instead of blocking
      }

      const result = await deviceSessionManager.validateDeviceSession(sessionId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isValid: result.isValid,
        kioskId: result.kioskId,
        remainingSeconds: result.remainingSeconds,
        error: result.isValid ? null : 'Session is invalid or expired'
      }));

      // Show warning for fingerprint mismatch but don't block access
      if (result.fingerprintMismatch) {
        toast({
          variant: "default",
          title: "Device Change Detected",
          description: "Session recovered successfully despite device fingerprint change.",
        });
      }

      if (!result.isValid && onSessionExpired) {
        onSessionExpired();
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isValid: false,
        error: 'Failed to validate session'
      }));
      console.error('Session validation error:', error);
    }
  }, [onSessionExpired, onConflictDetected, toast]);

  /**
   * Create a new device session for a kiosk
   */
  const createSession = useCallback(async (kioskId: number, expiresInHours = 24) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await deviceSessionManager.createDeviceSession(kioskId, expiresInHours);

      if (result) {
        setState(prev => ({
          ...prev,
          sessionId: result.sessionId,
          kioskId,
          isValid: true,
          remainingSeconds: expiresInHours * 3600,
          isLoading: false,
          error: null
        }));

        toast({
          title: "Session Created",
          description: `Kiosk session created successfully. Access URL: ${result.accessUrl}`
        });

        return result;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to create device session'
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error creating session'
      }));
      console.error('Session creation error:', error);
      return null;
    }
  }, [toast]);

  /**
   * Clear current session
   */
  const clearSession = useCallback(() => {
    deviceSessionManager.clearTabTracking();
    setState({
      sessionId: null,
      kioskId: null,
      isValid: false,
      remainingSeconds: 0,
      isLoading: false,
      error: null
    });
  }, []);

  /**
   * Send heartbeat
   */
  const sendHeartbeat = useCallback(async () => {
    if (!state.sessionId) return false;
    
    try {
      const success = await deviceSessionManager.sendHeartbeat(state.sessionId);
      if (!success && state.isValid) {
        // Only set error if session was previously valid
        setState(prev => ({ 
          ...prev, 
          error: 'Session heartbeat failed - session may have expired' 
        }));
      }
      return success;
    } catch (error) {
      console.error('Heartbeat error:', error);
      // Don't set error state for heartbeat failures - they're not critical
      return false;
    }
  }, [state.sessionId, state.isValid]);

  // Initial validation when sessionId changes
  useEffect(() => {
    if (providedSessionId) {
      setState(prev => ({ ...prev, sessionId: providedSessionId }));
      validateSession(providedSessionId);
    }
  }, [providedSessionId, validateSession]);

  // Auto-heartbeat
  useEffect(() => {
    if (!autoHeartbeat || !state.sessionId || !state.isValid) return;

    const interval = setInterval(sendHeartbeat, heartbeatInterval);
    return () => clearInterval(interval);
  }, [autoHeartbeat, state.sessionId, state.isValid, heartbeatInterval, sendHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.sessionId) {
        deviceSessionManager.clearTabTracking();
      }
    };
  }, [state.sessionId]);

  // Session countdown
  useEffect(() => {
    if (state.remainingSeconds <= 0 || !state.isValid) return;

    const interval = setInterval(() => {
      setState(prev => {
        const newRemaining = prev.remainingSeconds - 1;
        if (newRemaining <= 0) {
          onSessionExpired?.();
          return { ...prev, remainingSeconds: 0, isValid: false };
        }
        return { ...prev, remainingSeconds: newRemaining };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.remainingSeconds, state.isValid, onSessionExpired]);

  return {
    ...state,
    validateSession: () => state.sessionId ? validateSession(state.sessionId) : Promise.resolve(),
    createSession,
    clearSession,
    sendHeartbeat,
    formatRemainingTime: () => {
      const hours = Math.floor(state.remainingSeconds / 3600);
      const minutes = Math.floor((state.remainingSeconds % 3600) / 60);
      const seconds = state.remainingSeconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    }
  };
}