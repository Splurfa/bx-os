import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BehaviorHistoryItem {
  id: string;
  student_name: string;
  student_grade: string | null;
  student_class_name: string | null;
  behaviors: string[];
  mood: string;
  teacher_name: string | null;
  teacher_email: string | null;
  intervention_outcome: string;
  completion_status: string;
  created_at: string;
  completed_at: string;
  time_in_queue_minutes: number | null;
  kiosk_name: string | null;
  kiosk_location: string | null;
  question1: string | null;
  question2: string | null;
  question3: string | null;
  question4: string | null;
  teacher_feedback: string | null;
  urgent: boolean;
}

export const useBehaviorHistory = () => {
  const [history, setHistory] = useState<BehaviorHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBehaviorHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('behavior_history')
        .select('*')
        .order('completed_at', { ascending: false });

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