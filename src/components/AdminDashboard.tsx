import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminReportsRefactored from '@/components/AdminReportsRefactored';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, PowerOff, Copy, Shield, ExternalLink, Home, BarChart } from 'lucide-react';
import AppHeader from './AppHeader';
import QueueDisplay from './QueueDisplay';
import UserManagement from './UserManagement';
import { QueueIntegrityMonitor } from './QueueIntegrityMonitor';
import { SessionMonitor } from './SessionMonitor';
import { DataInitializationButton } from './DataInitializationButton';
import { CSVImportTest } from './CSVImportTest';
import StickyFooter from './StickyFooter';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'home' | 'reports'>('home');
  const { kiosks, activateKiosk, deactivateKiosk, deactivateAllKiosks, refreshKiosks, loading: kioskLoading } = useKiosks();

  // Defensive role checking - ensure admin is on correct dashboard
  useEffect(() => {
    if (profile && user) {
      if (profile.role !== 'admin' && profile.role !== 'super_admin') {
        console.warn('🚫 Non-admin user detected on admin dashboard, redirecting:', profile.role);
        if (profile.role === 'teacher') {
          navigate('/teacher', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      }
    }
  }, [profile, user, navigate]);
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

  // Device session state with localStorage persistence
  const [generatingSession, setGeneratingSession] = useState<number | null>(null);
  const [kioskSessions, setKioskSessions] = useState<Record<number, {
    sessionId: string;
    accessUrl: string;
    expiresAt: Date;
  }>>(() => {
    // Initialize from localStorage to persist across tab switches
    try {
      const stored = localStorage.getItem('admin_kiosk_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert expiresAt strings back to Date objects
        Object.keys(parsed).forEach(key => {
          parsed[key].expiresAt = new Date(parsed[key].expiresAt);
        });
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load stored kiosk sessions:', error);
    }
    return {};
  });

  // Handle kiosk activation toggle
  const handleKioskToggle = async (kioskId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateKiosk(kioskId);
        // Clear session when deactivating and persist to localStorage
        const updatedSessions = { ...kioskSessions };
        delete updatedSessions[kioskId];
        setKioskSessions(updatedSessions);
        
        try {
          localStorage.setItem('admin_kiosk_sessions', JSON.stringify(updatedSessions));
        } catch (error) {
          console.warn('Failed to persist session removal:', error);
        }
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
        // Store session info locally for display and persist to localStorage
        const newSessions = {
          ...kioskSessions,
          [kioskId]: {
            sessionId: result.sessionId,
            accessUrl: result.accessUrl,
            expiresAt: new Date(Date.now() + (expiresInHours * 60 * 60 * 1000))
          }
        };
        
        setKioskSessions(newSessions);
        
        // Persist to localStorage for cross-tab consistency
        try {
          localStorage.setItem('admin_kiosk_sessions', JSON.stringify(newSessions));
        } catch (error) {
          console.warn('Failed to persist kiosk sessions:', error);
        }

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
      
      <div className="container-page spacing-section max-w-[1600px] mx-auto pb-20">
        {/* Home View with Tabs */}
        {currentView === 'home' && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">System Overview</TabsTrigger>
              <TabsTrigger value="sessions">User Sessions</TabsTrigger>
              <TabsTrigger value="data">Data Management</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className={isMobile ? "space-y-3" : "space-y-6"}>
              {/* Simplified Kiosk Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="icon-h2 text-primary" />
                      <CardTitle className="text-h3">iPad Kiosk Setup</CardTitle>
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
                    Static URLs for 3 dedicated iPads - no session management needed
                  </CardDescription>
                </CardHeader>
                <CardContent className={`space-y-4 ${isMobile ? 'p-3 pt-0' : ''}`}>
                  <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'sm:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                    {kiosks.map((kiosk) => {
                      const staticUrl = `/kiosk${kiosk.id}`;
                      
                      return (
                        <Card key={kiosk.id} className="relative">
                          <CardContent className={isMobile ? "p-3" : "p-4"}>
                            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
                              <div className="flex items-center space-x-2">
                                <Monitor className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                                <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{kiosk.name}</span>
                                {kiosk.isActive && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Ready
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
                                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Status</span>
                                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                                  {kiosk.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              {/* Static URL Info */}
                              {kiosk.isActive && (
                                <div className="space-y-2 p-2 bg-muted/50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Static URL</span>
                                    <code className="text-xs font-mono">{staticUrl}</code>
                                  </div>
                                  <div className="flex gap-1 pt-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-6 px-2"
                                      onClick={() => handleCopyUrl(staticUrl, kiosk.id)}
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy URL
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-6 px-2"
                                      onClick={() => handleOpenKiosk(staticUrl)}
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      Open
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Inactive Notice */}
                              {!kiosk.isActive && (
                                <Alert className="p-2">
                                  <AlertDescription className="text-xs">
                                    Activate kiosk to enable student access at {staticUrl}
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
              <Card className="mt-6">
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

            <TabsContent value="sessions" className={isMobile ? "space-y-3" : "space-y-6"}>
              <QueueIntegrityMonitor />
              <UserManagement />
              <SessionMonitor />
            </TabsContent>

            <TabsContent value="data" className={isMobile ? "space-y-3" : "space-y-6"}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <DataInitializationButton />
                <CSVImportTest />
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Reports View */}
        {currentView === 'reports' && (
          <AdminReportsRefactored />
        )}
      </div>

      {/* Sticky Footer Navigation */}
      <StickyFooter
        primaryAction={{
          label: currentView === 'home' ? 'Reports' : 'Home',
          onClick: () => setCurrentView(currentView === 'home' ? 'reports' : 'home'),
          variant: currentView === 'home' ? 'outline' : 'default'
        }}
        secondaryAction={{
          label: currentView === 'home' ? 'Home' : 'Reports',
          onClick: () => setCurrentView(currentView === 'home' ? 'reports' : 'home'),
          variant: currentView === 'home' ? 'default' : 'outline'
        }}
        className="flex items-center justify-center"
      />
    </div>
  );
};

export default AdminDashboard;
