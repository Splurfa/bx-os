import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { deviceSessionManager } from '@/lib/deviceSessionManager';
import { Bug, Trash2, RefreshCw, Shield, Eye } from 'lucide-react';

interface KioskDebugPanelProps {
  className?: string;
}

const KioskDebugPanel: React.FC<KioskDebugPanelProps> = ({ className }) => {
  const { toast } = useToast();

  const handleClearAllData = () => {
    try {
      // Clear all kiosk-related localStorage data
      localStorage.removeItem('device_fingerprint');
      localStorage.removeItem('admin_kiosk_sessions');
      localStorage.removeItem('bypass_multi_tab_detection');
      localStorage.removeItem('kiosk_development_mode');
      localStorage.removeItem('kiosk_tab_heartbeat');
      
      // Clear session storage
      sessionStorage.removeItem('kiosk_session_tab_id');
      
      toast({
        title: "Debug Reset Complete",
        description: "All kiosk data cleared. Refresh to see changes.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Failed to clear debug data.",
      });
    }
  };

  const handleToggleDevelopmentMode = () => {
    const isEnabled = deviceSessionManager.isDevelopmentModeEnabled();
    if (isEnabled) {
      deviceSessionManager.disableDevelopmentMode();
      deviceSessionManager.disableMultiTabBypass();
    } else {
      deviceSessionManager.enableDevelopmentMode();
      deviceSessionManager.enableMultiTabBypass();
    }
    
    toast({
      title: isEnabled ? "Development Mode Disabled" : "Development Mode Enabled",
      description: isEnabled 
        ? "Strict validation restored" 
        : "Validation bypasses active for testing",
    });
  };

  const currentFingerprint = localStorage.getItem('device_fingerprint');
  const isDevelopmentMode = deviceSessionManager.isDevelopmentModeEnabled();
  const hasStoredSessions = localStorage.getItem('admin_kiosk_sessions') !== null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          <CardTitle className="text-sm">Kiosk Debug Panel</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Development Mode</span>
            <Badge variant={isDevelopmentMode ? "default" : "secondary"}>
              {isDevelopmentMode ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Device Fingerprint</span>
            <code className="text-xs bg-muted px-1 rounded">
              {currentFingerprint ? currentFingerprint : 'None'}
            </code>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stored Sessions</span>
            <Badge variant={hasStoredSessions ? "default" : "secondary"}>
              {hasStoredSessions ? "Present" : "None"}
            </Badge>
          </div>
        </div>

        {/* Debug Actions */}
        <div className="space-y-2">
          <Button
            size="sm"
            variant={isDevelopmentMode ? "destructive" : "default"}
            className="w-full text-xs"
            onClick={handleToggleDevelopmentMode}
          >
            <Shield className="w-3 h-3 mr-1" />
            {isDevelopmentMode ? "Disable" : "Enable"} Dev Mode
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={handleClearAllData}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All Debug Data
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-xs"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reload Page
          </Button>
        </div>

        {/* Quick Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <div className="flex items-start gap-1">
            <Eye className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              Development mode bypasses fingerprint validation and multi-tab detection for easier testing.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KioskDebugPanel;