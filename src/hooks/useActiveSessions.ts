import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveSession {
  id: string;
  user_id: string;
  device_type: string;
  location: string | null;
  login_time: string;
  last_activity: string;
  session_status: string;
  user_email: string;
  user_name: string;
}

export const useActiveSessions = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveSessions = async () => {
    try {
      // First get the sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .in('session_status', ['active', 'idle'])
        .order('login_time', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (!sessionsData || sessionsData.length === 0) {
        setSessions([]);
        return;
      }

      // Get user IDs from sessions
      const userIds = sessionsData.map(session => session.user_id);

      // Then get the profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const formattedSessions = sessionsData.map(session => {
        const profile = profilesData?.find(p => p.id === session.user_id);
        return {
          id: session.id,
          user_id: session.user_id,
          device_type: session.device_type,
          location: session.location,
          login_time: session.login_time,
          last_activity: session.last_activity,
          session_status: session.session_status,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.full_name || 'Unknown User'
        };
      });

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  return { sessions, loading, refetch: fetchActiveSessions };
};