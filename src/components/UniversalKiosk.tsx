import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DeviceSessionManager } from '@/lib/deviceSessionManager';
import { useDeviceSession } from '@/hooks/useDeviceSession';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Wifi, WifiOff } from 'lucide-react';

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
  
  const [currentKioskComponent, setCurrentKioskComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    kioskId,
    isValid,
    isLoading,
    error: sessionError,
    remainingSeconds,
    formatRemainingTime,
    validateSession,
    clearSession
  } = useDeviceSession({
    sessionId,
    autoHeartbeat: true,
    heartbeatInterval: 30000,
    onSessionExpired: () => {
      setError('Your session has expired. Please contact your teacher for a new access link.');
      clearSession();
    },
    onConflictDetected: () => {
      setError('Multiple tabs detected. Please close other kiosk tabs and refresh this page.');
    }
  });

  // Determine which kiosk component to render based on kioskId
  useEffect(() => {
    if (!isValid || !kioskId) return;

    // Use forced kiosk ID for testing or override
    const effectiveKioskId = forcedKioskId || kioskId;

    // Map kiosk IDs to components
    // This mapping can be made more sophisticated as needed
    switch (effectiveKioskId) {
      case 1:
        setCurrentKioskComponent(() => KioskOne);
        break;
      case 2:
        setCurrentKioskComponent(() => KioskTwo);
        break;
      case 3:
        setCurrentKioskComponent(() => KioskThree);
        break;
      default:
        // Default to KioskOne for any other ID
        setCurrentKioskComponent(() => KioskOne);
        break;
    }
  }, [kioskId, isValid, forcedKioskId]);

  // Invalid session ID format
  if (sessionId && !DeviceSessionManager.extractSessionIdFromUrl(`/kiosk/${sessionId}`)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-destructive/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Invalid Access Link</CardTitle>
            </div>
            <CardDescription>
              The access link format is invalid. Please contact your teacher for a valid link.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

  // No session ID provided
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              You need a valid access link to use this kiosk. Please ask your teacher for an access link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Kiosk access links are provided by teachers and expire after 24 hours for security.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Validating Access...</CardTitle>
            <CardDescription>
              Please wait while we verify your kiosk session.
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
  }

  // Session error or validation failed - but allow access if just multi-tab warning
  if (sessionError || (error && !isValid && !error.includes('Multiple tabs'))) {
    const displayError = error || sessionError || 'Session validation failed';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-destructive/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-destructive" />
              <CardTitle>Session Invalid</CardTitle>
            </div>
            <CardDescription>
              Your kiosk session could not be validated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Error</AlertTitle>
                <AlertDescription>
                  {displayError}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => validateSession()} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : null}
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')} 
                  className="w-full"
                >
                  Return to Home
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Debug Info:<br/>
                  Session ID: {sessionId}<br/>
                  Valid: {isValid ? 'Yes' : 'No'}<br/>
                  Kiosk ID: {kioskId || 'None'}<br/>
                  Remaining: {remainingSeconds}s<br/>
                  Error: {displayError}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Valid session - render the appropriate kiosk component
  if (currentKioskComponent && isValid) {
    const KioskComponent = currentKioskComponent;
    
    return (
      <div className="min-h-screen bg-background">
        {/* Session status bar */}
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Kiosk {kioskId} Active</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatRemainingTime()} remaining</span>
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