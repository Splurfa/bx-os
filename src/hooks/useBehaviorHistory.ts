import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BehaviorHistoryItem {
  id: string;
  behavior_request_id: string;
  student_id: string;
  reflection_id: string;
  resolution_type: string;
  resolution_notes: string | null;
  intervention_applied: string | null;
  family_notified: boolean | null;
  notification_method: string | null;
  follow_up_required: boolean | null;
  follow_up_date: string | null;
  archived_at: string;
  created_at: string;
}

export const useBehaviorHistory = () => {
  const [history, setHistory] = useState<BehaviorHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBehaviorHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('behavior_history')
        .select('*')
        .order('archived_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching behavior history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBehaviorHistory();

    // Set up real-time subscription for behavior history
    const channel = supabase
      .channel('behavior_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'behavior_history'
        },
        () => {
          fetchBehaviorHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { history, loading, refetch: fetchBehaviorHistory };
};