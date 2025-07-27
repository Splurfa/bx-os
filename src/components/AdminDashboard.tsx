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
import { Monitor, Users, Activity, Clock, AlertTriangle, Power, PowerOff } from 'lucide-react';
import AppHeader from './AppHeader';
import QueueDisplay from './QueueDisplay';
import UserManagement from './UserManagement';
import ReviewReflection from './ReviewReflection';
import { SessionMonitor } from './SessionMonitor';
import RealTimeStatus from './RealTimeStatus';
import { useToast } from '@/hooks/use-toast';
import { BehaviorRequest } from '@/hooks/useSupabaseQueue';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { kiosks, activateKiosk, deactivateKiosk, deactivateAllKiosks, refreshKiosks, loading: kioskLoading } = useKiosks();
  const { 
    items, 
    loading: queueLoading, 
    approveReflection, 
    requestRevision, 
    clearQueue,
    formatTimeElapsed 
  } = useSupabaseQueue();
  const { history: behaviorHistory, loading: historyLoading } = useBehaviorHistory();
  const { students, loading: studentsLoading } = useStudents();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedReflection, setSelectedReflection] = useState<BehaviorRequest | null>(null);

  // Filter queue items
  const completedReflections = items.filter(item => 
    item.reflection && item.reflection.status === 'pending'
  );
  const waitingInQueue = items.filter(item => item.status === 'waiting');
  const assignedStudents = items.filter(item => item.assigned_kiosk_id && item.status === 'waiting');
  const unassignedStudents = waitingInQueue.filter(item => !item.assigned_kiosk_id);

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

  // Handle reflection review
  const handleSelectReflection = (item: BehaviorRequest) => {
    setSelectedReflection(item);
  };

  const handleApproveReflection = async () => {
    if (selectedReflection) {
      try {
        await approveReflection(selectedReflection.id);
        setSelectedReflection(null);
      } catch (error) {
        console.error('Error approving reflection:', error);
        toast({
          variant: "destructive",
          title: "Error", 
          description: "Failed to approve reflection.",
        });
      }
    }
  };

  const handleRequestRevision = async (feedback: string) => {
    if (selectedReflection) {
      try {
        await requestRevision(selectedReflection.id, feedback);
        setSelectedReflection(null);
      } catch (error) {
        console.error('Error requesting revision:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to request revision.",
        });
      }
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

  // Calculate active kiosks
  const activeKiosks = kiosks.filter(k => k.isActive);
  const kioskCount = kiosks.length;
  const activeKioskCount = activeKiosks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AppHeader />
      
      <div className="container-page spacing-section">
        {/* Mobile RealTime Status */}
        {isMobile && (
          <div className="flex justify-end mb-4">
            <RealTimeStatus isConnected={true} lastUpdate={new Date()} />
          </div>
        )}
        {!isMobile && (
          <div className="flex justify-end mb-6">
            <RealTimeStatus isConnected={true} lastUpdate={new Date()} />
          </div>
        )}

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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeactivateAll}
                    disabled={kioskLoading || activeKioskCount === 0}
                  >
                    <PowerOff className="icon-inline mr-2" />
                    Deactivate All
                  </Button>
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
                        
                        <div className={`space-y-${isMobile ? '1' : '2'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Status</span>
                            <Badge variant={kiosk.isActive ? "default" : "secondary"} className={isMobile ? "text-xs px-1.5 py-0.5" : ""}>
                              {kiosk.isActive ? (
                                kiosk.currentStudentId ? "In Use" : "Active"
                              ) : "Inactive"}
                            </Badge>
                          </div>
                          
                          {kiosk.location && !isMobile && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Location</span>
                              <span className="text-sm">{kiosk.location}</span>
                            </div>
                          )}
                          
                          {kiosk.currentStudentId && (
                            <div className="flex items-center justify-between">
                              <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                                {isMobile ? 'Student' : 'Current Student'}
                              </span>
                              <Badge variant="outline" className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}`}>
                                {isMobile ? 'Active' : 'Active Session'}
                              </Badge>
                            </div>
                          )}
                          
                          {kiosk.isActive && kiosk.activatedAt && !isMobile && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Activated</span>
                              <span className="text-xs">
                                {new Date(kiosk.activatedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Queue Summary */}
            <div className={`grid grid-cols-2 ${isMobile ? 'gap-2' : 'md:grid-cols-4 gap-3'}`}>
              <Card>
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{waitingInQueue.length}</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {isMobile ? 'Waiting' : 'Waiting in Queue'}
                      </p>
                    </div>
                    <Clock className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-orange-500 flex-shrink-0`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{completedReflections.length}</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {isMobile ? 'Review' : 'Pending Review'}
                      </p>
                    </div>
                    <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-500 flex-shrink-0`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{assignedStudents.length}</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {isMobile ? 'At Kiosks' : 'At Kiosks'}
                      </p>
                    </div>
                    <Monitor className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500 flex-shrink-0`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{activeKioskCount}</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {isMobile ? 'Active' : 'Active Kiosks'}
                      </p>
                    </div>
                    <Power className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-500 flex-shrink-0`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Queue Actions */}
            {items.length > 0 && (
              <Card>
                <CardHeader className={isMobile ? "p-3 pb-2" : ""}>
                  <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
                    <CardTitle className={isMobile ? "text-base" : ""}>Queue Actions</CardTitle>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleClearQueue}
                      disabled={queueLoading}
                      className={isMobile ? "text-xs px-2" : ""}
                    >
                      {isMobile ? 'Clear Queue' : 'Clear Entire Queue'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Queue Display */}
            <Card>
              <CardHeader className={isMobile ? "p-3 pb-2" : ""}>
                <CardTitle className={isMobile ? "text-base" : ""}>Behavior Queue</CardTitle>
                {!isMobile && (
                  <CardDescription>
                    Real-time view of all behavior requests and reflections
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className={isMobile ? "p-3 pt-0" : ""}>
                <QueueDisplay
                  items={items}
                  onSelectReflection={handleSelectReflection}
                  formatTimeElapsed={formatTimeElapsed}
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

      {/* Review Reflection Modal */}
      {selectedReflection && (
        <ReviewReflection
          item={selectedReflection}
          onApprove={handleApproveReflection}
          onRequestRevision={handleRequestRevision}
          onBack={() => setSelectedReflection(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;