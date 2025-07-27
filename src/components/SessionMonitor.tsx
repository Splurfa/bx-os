import { useActiveSessions } from '@/hooks/useActiveSessions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  const { sessions, loading } = useActiveSessions();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading active sessions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Currently active user sessions across the system ({sessions.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active sessions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Time</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.user_name}</div>
                      <div className="text-sm text-muted-foreground">{session.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device_type)}
                      <span className="capitalize">{session.device_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(session.session_status)}>
                      {session.session_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(session.login_time), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {session.location || 'Unknown'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};