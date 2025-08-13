import React, { useState } from 'react';
import { useActiveSessions } from '@/hooks/useActiveSessions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'idle':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  }
};

export const SessionMonitor = () => {
  const { sessions, loading, refetch } = useActiveSessions();
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  const isAdmin = profile?.role === 'admin';
  const { toast } = useToast();
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const handleForceLogout = async (s: any) => {
    if (!isAdmin) return;
    const proceed = window.confirm(`Force logout ${s.user_name || s.user_email}?`);
    if (!proceed) return;
    try {
      setBusy((b) => ({ ...b, [s.id]: true }));
      const { data, error } = await supabase.functions.invoke('force-logout', {
        body: { action: 'logout_user', userId: s.user_id }
      });
      if (error || (data && data.success === false)) {
        throw new Error(error?.message || data?.error || 'Failed to force logout');
      }
      toast({ title: 'User logged out', description: `${s.user_name || s.user_email} has been logged out.` });
      await refetch?.();
    } catch (e: any) {
      toast({ title: 'Logout failed', description: e?.message || 'Unable to logout user', variant: 'destructive' as any });
    } finally {
      setBusy((b) => ({ ...b, [s.id]: false }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className={`flex items-center justify-center ${isMobile ? 'p-4' : 'p-8'}`}>
          <Loader2 className={`${isMobile ? 'h-4 w-4' : 'h-8 w-8'} animate-spin`} />
          <span className={`ml-2 ${isMobile ? 'text-sm' : ''}`}>
            {isMobile ? 'Loading...' : 'Loading active sessions...'}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={isMobile ? "p-3 pb-2" : ""}>
        <CardTitle className={isMobile ? "text-base" : ""}>Active Sessions</CardTitle>
        {!isMobile && (
          <CardDescription>
            Currently active user sessions across the system ({sessions.length} total)
          </CardDescription>
        )}
        {isMobile && (
          <CardDescription className="text-xs">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={isMobile ? "p-3 pt-0" : ""}>
        {sessions.length === 0 ? (
          <div className={`text-center ${isMobile ? 'py-4 text-sm' : 'py-8'} text-muted-foreground`}>
            No active sessions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isMobile ? "text-xs" : ""}>
                  User
                </TableHead>
                <TableHead className={isMobile ? "text-xs" : ""}>
                  {isMobile ? 'Device' : 'Device'}
                </TableHead>
                <TableHead className={isMobile ? "text-xs" : ""}>
                  Status
                </TableHead>
                {!isMobile && <TableHead>Login Time</TableHead>}
                {!isMobile && <TableHead>Last Activity</TableHead>}
                {(!isMobile && isAdmin) && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className={isMobile ? "text-sm" : ""}>
                    <div>
                      <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                        {isMobile ? session.user_name?.split(' ')[0] : session.user_name}
                      </div>
                      {!isMobile && (
                        <div className="text-sm text-muted-foreground">{session.user_email}</div>
                      )}
                      {isMobile && (
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={isMobile ? "text-sm" : ""}>
                    <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
                      {getDeviceIcon(session.device_type)}
                      {!isMobile && (
                        <span className="capitalize">{session.device_type}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(session.session_status)} ${isMobile ? 'text-xs px-1.5 py-0.5' : ''}`}>
                      {session.session_status}
                    </Badge>
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="text-sm">
                      {formatDistanceToNow(new Date(session.login_time), { addSuffix: true })}
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell className="text-sm">
                      {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                    </TableCell>
                  )}
                  {(!isMobile && isAdmin) && (
                    <TableCell className="text-sm">
                      {session.device_type?.toLowerCase() === 'teacher' && ['active','idle'].includes(String(session.session_status).toLowerCase()) ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleForceLogout(session)}
                          disabled={!!busy[session.id]}
                        >
                          
                          {busy[session.id] ? 'Logging out...' : 'Logout'}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};