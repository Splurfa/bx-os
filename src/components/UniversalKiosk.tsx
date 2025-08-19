import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeviceSessionManager, deviceSessionManager } from '@/lib/deviceSessionManager';
import { useDeviceSession } from '@/hooks/useDeviceSession';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Wifi, WifiOff, Lock, XCircle, AlertCircle } from 'lucide-react';

// Import existing kiosk components
import KioskOne from '@/components/KioskOne';
import KioskTwo from '@/components/KioskTwo';
import KioskThree from '@/components/KioskThree';

interface UniversalKioskProps {
  // Optional props for testing or specific kiosk assignment
  forcedKioskId?: number;
  sessionId?: string;
}

const UniversalKiosk: React.FC<UniversalKioskProps> = ({ 
  forcedKioskId, 
  sessionId: propSessionId 
}) => {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const sessionId = propSessionId || urlSessionId;
  const extractedSessionId = sessionId;
  
  const [currentKioskComponent, setCurrentKioskComponent] = useState<React.ComponentType | null>(null);
  const [kioskError, setKioskError] = useState<string | null>(null);

  const deviceSession = useDeviceSession({
    sessionId,
    autoHeartbeat: true,
    heartbeatInterval: 30000,
    onSessionExpired: () => {
      console.log('Session expired');
    },
    onConflictDetected: () => {
      console.warn('Multi-tab conflict detected');
    }
  });

  // Multi-tab conflict check (non-blocking)
  const hasMultiTabConflict = deviceSessionManager.checkMultiTabConflict();
  
  useEffect(() => {
    if (hasMultiTabConflict && !deviceSessionManager.isMultiTabBypassEnabled()) {
      console.warn('⚠️ Multi-tab conflict detected (warning only)');
      // Don't block access, just warn
    }
  }, [hasMultiTabConflict]);

  // Handle session ID changes
  useEffect(() => {
    const currentSessionId = sessionId || extractedSessionId;
    
    if (currentSessionId && currentSessionId !== deviceSession.sessionId) {
      console.log('🔄 Session ID changed, validating:', currentSessionId);
      deviceSession.validateSession();
    }
  }, [sessionId, extractedSessionId, deviceSession]);

  // Set current kiosk component based on kioskId
  useEffect(() => {
    let kioskId = deviceSession.kioskId;
    
    if (forcedKioskId) {
      kioskId = forcedKioskId;
      console.log('🎯 Using forced kiosk ID:', forcedKioskId);
    }

    if (kioskId) {
      const components = {
        1: KioskOne,
        2: KioskTwo,
        3: KioskThree,
      } as const;
      
      const SelectedComponent = components[kioskId as keyof typeof components];
      if (SelectedComponent) {
        setCurrentKioskComponent(() => SelectedComponent);
        console.log(`✅ Kiosk ${kioskId} component selected`);
      } else {
        console.error(`❌ No component found for kiosk ID: ${kioskId}`);
        setKioskError(`Kiosk ${kioskId} is not available`);
      }
    } else {
      setCurrentKioskComponent(null);
    }
  }, [deviceSession.kioskId, forcedKioskId]);

  // Handle different states with priority: kiosk error > session validation > loading
  
  // Priority 1: Kiosk-specific errors (component not found, etc.)
  if (kioskError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Kiosk Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{kioskError}</p>
            <Button 
              onClick={() => {
                setKioskError(null);
                navigate('/');
              }}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Priority 2: No session ID provided - show access required
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              A valid access link is required to use this kiosk.
            </p>
            <p className="text-sm text-muted-foreground">
              Please use the access link provided by your teacher or administrator.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Priority 3: Session loading state - simplified to prevent flickering
  if (deviceSession.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <CardTitle>Connecting to Kiosk</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Setting up your kiosk experience...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Priority 4: Invalid session or critical session errors  
  if (!deviceSession.isValid || deviceSession.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Session Invalid</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Your kiosk session is no longer valid.
              </p>
              {deviceSession.error && (
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {deviceSession.error}
                </p>
              )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This could happen if:</p>
              <ul className="text-left space-y-1">
                <li>• The session has expired</li>
                <li>• The access link is incorrect</li>
                <li>• The device fingerprint has changed</li>
              </ul>
            </div>
            {hasMultiTabConflict && (
              <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                ⚠️ Multiple tabs detected - this may cause access issues
              </p>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  deviceSession.clearSession();
                  window.location.reload();
                }}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Priority 5: Valid session - show kiosk interface  
  if (currentKioskComponent && deviceSession.isValid) {
    const KioskComponent = currentKioskComponent;
    
    return (
      <div className="min-h-screen bg-background">
        {/* Session status bar */}
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Kiosk {deviceSession.kioskId} Active</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{deviceSession.formatRemainingTime()} remaining</span>
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Session: {sessionId}
            </div>
          </div>
        </div>

        {/* Kiosk component */}
        <KioskComponent />
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading Kiosk...</CardTitle>
          <CardDescription>
            Setting up your kiosk experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalKiosk;