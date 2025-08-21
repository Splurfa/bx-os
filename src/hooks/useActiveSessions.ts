import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActiveSession {
  id: string;
  user_id: string;
  device_type: string;
  device_identifier?: string | null;
  location: string | null;
  login_time: string;
  last_activity: string;
  session_status: string;
  user_email: string;
  user_name: string;
  user_role: string;
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
        .select('id, email, full_name, role')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const formattedSessions = sessionsData.map(session => {
        const profile = profilesData?.find(p => p.id === session.user_id);
        return {
          id: session.id,
          user_id: session.user_id,
          device_type: session.device_type,
          device_identifier: (session as any).device_identifier || null,
          location: session.location,
          login_time: session.login_time,
          last_activity: session.last_activity,
          session_status: session.session_status,
          user_email: profile?.email || 'Unknown',
          user_name: profile?.full_name || 'Unknown User',
          user_role: profile?.role || 'unknown'
        } as ActiveSession;
      });

      // Deduplicate by user_id only (one session per user), keep most recent by last_activity
      const map = new Map<string, ActiveSession>();
      formattedSessions
        .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
        .forEach(s => {
          const key = s.user_id; // Simple deduplication by user_id
          if (!map.has(key)) {
            map.set(key, s);
          }
        });

      setSessions(Array.from(map.values()));
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();

    // Set up real-time subscription for user sessions
    const channel = supabase
      .channel('user_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions'
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { sessions, loading, refetch: fetchActiveSessions };
};