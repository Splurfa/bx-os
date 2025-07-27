import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useKiosks } from '@/contexts/KioskContext';
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { useBehaviorHistory } from '@/hooks/useBehaviorHistory';
import { useStudents } from '@/hooks/useStudents';
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
        toast({
          title: "Kiosk Deactivated",
          description: `Kiosk ${kioskId} has been deactivated successfully.`,
        });
      } else {
        await activateKiosk(kioskId);
        toast({
          title: "Kiosk Activated", 
          description: `Kiosk ${kioskId} has been activated successfully.`,
        });
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
      toast({
        title: "All Kiosks Deactivated",
        description: "All kiosks have been deactivated successfully.",
      });
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
        toast({
          title: "Reflection Approved",
          description: "The student's reflection has been approved.",
        });
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
        toast({
          title: "Revision Requested",
          description: "The student has been asked to revise their reflection.",
        });
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
      toast({
        title: "Queue Cleared",
        description: "All behavior requests have been removed from the queue.",
      });
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
      
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Unified kiosk management and system monitoring</p>
            </div>
            <RealTimeStatus isConnected={true} lastUpdate={new Date()} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="sessions">Session Monitor</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Unified Kiosk Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    <CardTitle>Kiosk Management</CardTitle>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeactivateAll}
                    disabled={kioskLoading || activeKioskCount === 0}
                  >
                    <PowerOff className="w-4 h-4 mr-2" />
                    Deactivate All
                  </Button>
                </div>
                <CardDescription>
                  Manage kiosk activation status and monitor real-time usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kiosks.map((kiosk) => (
                    <Card key={kiosk.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Monitor className="w-4 h-4" />
                            <span className="font-medium">{kiosk.name}</span>
                          </div>
                          <Switch
                            checked={kiosk.isActive}
                            onCheckedChange={(checked) => handleKioskToggle(kiosk.id, kiosk.isActive)}
                            disabled={kioskLoading}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant={kiosk.isActive ? "default" : "secondary"}>
                              {kiosk.isActive ? (
                                kiosk.currentStudentId ? "In Use" : "Active"
                              ) : "Inactive"}
                            </Badge>
                          </div>
                          
                          {kiosk.location && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Location</span>
                              <span className="text-sm">{kiosk.location}</span>
                            </div>
                          )}
                          
                          {kiosk.currentStudentId && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Current Student</span>
                              <Badge variant="outline" className="text-xs">
                                Active Session
                              </Badge>
                            </div>
                          )}
                          
                          {kiosk.isActive && kiosk.activatedAt && (
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{waitingInQueue.length}</p>
                      <p className="text-sm text-muted-foreground">Waiting in Queue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{completedReflections.length}</p>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{assignedStudents.length}</p>
                      <p className="text-sm text-muted-foreground">At Kiosks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Power className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{activeKioskCount}</p>
                      <p className="text-sm text-muted-foreground">Active Kiosks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Queue Actions */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Queue Actions</CardTitle>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleClearQueue}
                      disabled={queueLoading}
                    >
                      Clear Entire Queue
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Queue Display */}
            <Card>
              <CardHeader>
                <CardTitle>Behavior Queue</CardTitle>
                <CardDescription>
                  Real-time view of all behavior requests and reflections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QueueDisplay
                  items={items}
                  onSelectReflection={handleSelectReflection}
                  formatTimeElapsed={formatTimeElapsed}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session Monitor Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <SessionMonitor />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
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