import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useKiosks } from '@/contexts/KioskContext';
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { useBehaviorHistory } from '@/hooks/useBehaviorHistory';
import { useStudents } from '@/hooks/useStudents';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Monitor, PowerOff } from 'lucide-react';
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

  // Handle kiosk activation toggle
  const handleKioskToggle = async (kioskId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateKiosk(kioskId);
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
                  {kiosks.map((kiosk) => (
                    <Card key={kiosk.id} className="relative">
                      <CardContent className={isMobile ? "p-3" : "p-4"}>
                        <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
                          <div className="flex items-center space-x-2">
                            <Monitor className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                            <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{kiosk.name}</span>
                          </div>
                          <Switch
                            checked={kiosk.isActive}
                            onCheckedChange={(checked) => handleKioskToggle(kiosk.id, kiosk.isActive)}
                            disabled={kioskLoading}
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Activated</span>
                            <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                              {kiosk.activatedAt ? new Date(kiosk.activatedAt).toLocaleTimeString() : '—'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
