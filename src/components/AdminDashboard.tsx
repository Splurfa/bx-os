import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useKiosks } from '@/contexts/KioskContext';
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { useBehaviorHistory } from '@/hooks/useBehaviorHistory';
import { useStudents } from '@/hooks/useStudents';
import { useDeviceSession } from '@/hooks/useDeviceSession';
import { deviceSessionManager } from '@/lib/deviceSessionManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Monitor, PowerOff, Link as LinkIcon, Copy, Clock, Shield, ExternalLink } from 'lucide-react';
import AppHeader from './AppHeader';
import QueueDisplay from './QueueDisplay';
import UserManagement from './UserManagement';

import { SessionMonitor } from './SessionMonitor';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { kiosks, activateKiosk, deactivateKiosk, deactivateAllKiosks, refreshKiosks, loading: kioskLoading } = useKiosks();
  const { 
    items, 
    loading: queueLoading, 
    clearQueueLoading,
    clearQueue,
    approveReflection,
    clearItem,
    formatTimeElapsed 
  } = useSupabaseQueue();
  const { history: behaviorHistory, loading: historyLoading } = useBehaviorHistory();
  const { students, loading: studentsLoading } = useStudents();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Device session state
  const [generatingSession, setGeneratingSession] = useState<number | null>(null);
  const [kioskSessions, setKioskSessions] = useState<Record<number, {
    sessionId: string;
    accessUrl: string;
    expiresAt: Date;
  }>>({});

  // Handle kiosk activation toggle
  const handleKioskToggle = async (kioskId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateKiosk(kioskId);
        // Clear session when deactivating
        setKioskSessions(prev => {
          const updated = { ...prev };
          delete updated[kioskId];
          return updated;
        });
      } else {
        await activateKiosk(kioskId);
      }
      await refreshKiosks(); // Add UI refresh fix
    } catch (error) {
      console.error('Error toggling kiosk:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isActive ? 'deactivate' : 'activate'} kiosk ${kioskId}.`,
      });
    }
  };

  // Generate device session for kiosk
  const handleGenerateSession = async (kioskId: number, expiresInHours: number = 24) => {
    console.log('🎯 Generate session button clicked for kiosk:', kioskId);
    setGeneratingSession(kioskId);
    try {
      console.log('📞 Calling deviceSessionManager.createDeviceSession...');
      const result = await deviceSessionManager.createDeviceSession(kioskId, expiresInHours);
      
      console.log('📊 Session creation result:', result);
      if (result) {
        // Store session info locally for display
        setKioskSessions(prev => ({
          ...prev,
          [kioskId]: {
            sessionId: result.sessionId,
            accessUrl: result.accessUrl,
            expiresAt: new Date(Date.now() + (expiresInHours * 60 * 60 * 1000))
          }
        }));

        console.log('✅ Session stored locally, showing success toast');
        toast({
          title: "Session Created",
          description: `Generated access URL for Kiosk ${kioskId}. Valid for ${expiresInHours} hours.`
        });
      } else {
        console.error('❌ No result returned from device session manager');
        throw new Error('Failed to create device session - no result returned');
      }
    } catch (error) {
      console.error('💥 Error in handleGenerateSession:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: `Failed to generate session for Kiosk ${kioskId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      console.log('🏁 Generate session complete, clearing loading state');
      setGeneratingSession(null);
    }
  };

  // Copy access URL to clipboard
  const handleCopyUrl = async (url: string, kioskId: number) => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Copied!",
        description: `Kiosk ${kioskId} access URL copied to clipboard.`
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL to clipboard."
      });
    }
  };

  // Open kiosk in new tab
  const handleOpenKiosk = (url: string) => {
    window.open(url, '_blank');
  };

  // Handle mass deactivation
  const handleDeactivateAll = async () => {
    try {
      await deactivateAllKiosks();
    } catch (error) {
      console.error('Error deactivating all kiosks:', error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to deactivate all kiosks.",
      });
    }
  };


  // Handle queue clearing
  const handleClearQueue = async () => {
    try {
      await clearQueue();
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear queue.",
      });
    }
  };

  // Clear a single student from the queue (stage-agnostic)
  const handleClearItem = async (id: string) => {
    try {
      await clearItem(id); // archive with tags and remove from queue
      toast({ title: 'Removed from queue.' });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove student from queue.',
      });
    }
  };

  // Calculate active kiosks
  const activeKioskCount = kiosks.filter(k => k.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AppHeader />
      
      {/* Widen the content area slightly on larger screens without affecting global layout */}
      <div className="container-page spacing-section max-w-[1600px] mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="users">Users & Sessions</TabsTrigger>
          </TabsList>

          {/* System Overview Tab */}
          <TabsContent value="overview" className={isMobile ? "space-y-3" : "space-y-6"}>
            {/* Unified Kiosk Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="icon-h2 text-primary" />
                    <CardTitle className="text-h3">Kiosk Management</CardTitle>
                  </div>
                  {!isMobile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDeactivateAll}
                      disabled={kioskLoading || activeKioskCount === 0}
                    >
                      <PowerOff className="icon-inline mr-2" />
                      Deactivate All
                    </Button>
                  )}
                </div>
                <CardDescription className="text-body-small">
                  Manage kiosk activation status and monitor real-time usage
                </CardDescription>
              </CardHeader>
              <CardContent className={`space-y-4 ${isMobile ? 'p-3 pt-0' : ''}`}>
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'sm:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                  {kiosks.map((kiosk) => {
                    const session = kioskSessions[kiosk.id];
                    const isSessionExpired = session && session.expiresAt < new Date();
                    
                    return (
                      <Card key={kiosk.id} className="relative">
                        <CardContent className={isMobile ? "p-3" : "p-4"}>
                          <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
                            <div className="flex items-center space-x-2">
                              <Monitor className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                              <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{kiosk.name}</span>
                              {session && !isSessionExpired && (
                                <Badge variant="secondary" className="text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Active Session
                                </Badge>
                              )}
                            </div>
                            <Switch
                              checked={kiosk.isActive}
                              onCheckedChange={(checked) => handleKioskToggle(kiosk.id, kiosk.isActive)}
                              disabled={kioskLoading}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Activated</span>
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                                {kiosk.activatedAt ? new Date(kiosk.activatedAt).toLocaleTimeString() : '—'}
                              </span>
                            </div>

                            {/* Session Info */}
                            {session && !isSessionExpired && (
                              <div className="space-y-2 p-2 bg-muted/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Session ID</span>
                                  <code className="text-xs font-mono">{session.sessionId}</code>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Expires
                                  </span>
                                  <span className="text-xs">
                                    {session.expiresAt.toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex gap-1 pt-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2"
                                    onClick={() => handleCopyUrl(session.accessUrl, kiosk.id)}
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy URL
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2"
                                    onClick={() => handleOpenKiosk(session.accessUrl)}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Open
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Generate Session Button */}
                            {kiosk.isActive && (!session || isSessionExpired) && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="flex-1 text-xs"
                                  onClick={() => handleGenerateSession(kiosk.id)}
                                  disabled={generatingSession === kiosk.id}
                                >
                                  <LinkIcon className="w-3 h-3 mr-1" />
                                  {generatingSession === kiosk.id ? 'Generating...' : 'Generate Access URL'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs px-2"
                                  onClick={() => {
                                    localStorage.setItem('bypass_multi_tab_detection', 'true');
                                    toast({ title: "Multi-tab bypass enabled for testing" });
                                  }}
                                  title="Enable multi-tab bypass for testing"
                                >
                                  🔧
                                </Button>
                              </div>
                            )}

                            {/* Inactive Notice */}
                            {!kiosk.isActive && (
                              <Alert className="p-2">
                                <AlertDescription className="text-xs">
                                  Activate kiosk to generate access URLs
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Queue Display */}
            <Card>
              <CardContent className={isMobile ? "p-2" : "px-3 py-2 md:px-4 md:py-3"}>
                <QueueDisplay
                  items={items}
                  onSelectReflection={() => {}}
                  formatTimeElapsed={formatTimeElapsed}
                  onClearQueue={handleClearQueue}
                  clearQueueLoading={clearQueueLoading}
                  queueLoading={queueLoading}
                  showClearButton={true}
                  showReviewButtons={false}
                  onClearItem={handleClearItem}
                  showTeacherLastNameChip={true}
                  layout="admin"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab with Session Monitor */}
          <TabsContent value="users" className={isMobile ? "space-y-3" : "space-y-6"}>
            <UserManagement />
            
            {/* Session Monitor Section */}
            <div className={isMobile ? "mt-4" : "mt-8"}>
              <SessionMonitor />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
