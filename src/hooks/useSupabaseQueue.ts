import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  name?: string;
  first_name: string;
  last_name: string;
  grade?: string;
  class_name?: string;
  family_id: string;
  created_at: string;
  updated_at: string;
}

export interface BehaviorRequest {
  id: string;
  student_id: string;
  teacher_id?: string;
  behavior_type: string;
  description: string;
  teacher_name: string;
  status: 'waiting' | 'active' | 'completed' | 'review';
  priority_level?: string;
  assigned_kiosk?: number;
  assigned_kiosk_id?: number;
  location?: string;
  time_of_incident?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  reflection?: Reflection;
  position?: number;
  timestamp?: Date;
  behaviors?: string[];
}

export interface Reflection {
  id: string;
  behavior_request_id: string;
  student_id: string;
  question_1_response?: string;
  question_2_response?: string;  
  question_3_response?: string;
  question_4_response?: string;
  teacher_feedback?: string;
  teacher_approved: boolean;
  revision_requested: boolean;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  status?: 'pending' | 'approved' | 'revision_requested';
}

export const useSupabaseQueue = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<BehaviorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearQueueLoading, setClearQueueLoading] = useState(false);

  // Fetch queue items
  const fetchQueue = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get user role for filtering
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('behavior_requests')
        .select(`
          *,
          student:students(*),
          reflection:reflections(*)
        `);

      // Filter by teacher if not admin
      if (profile?.role === 'teacher') {
        query = query.eq('teacher_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;

      const transformedData = data?.map((item: any, index: number) => ({
        ...item,
        student: item.student,
        reflection: Array.isArray(item.reflection) 
          ? item.reflection[0] 
          : item.reflection,
        position: index + 1,
        timestamp: new Date(item.created_at),
        behaviors: item.behavior_type ? item.behavior_type.split(', ') : [],
        assigned_kiosk_id: item.assigned_kiosk
      } as BehaviorRequest)) || [];

      setItems(transformedData);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchQueue();

    const subscription = supabase
      .channel('queue-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'behavior_requests' },
        () => fetchQueue()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reflections' },
        () => fetchQueue()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchQueue]);

  // Add student to queue
  const addToQueue = async (data: {
    student: Student;
    behaviors: string[];
    mood: string;
    urgent?: boolean;
    notes?: string;
  }) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add students to the queue",
          variant: "destructive",
        });
        return;
      }

      // Use the provided student directly
      const studentId = data.student.id;
      const familyId = data.student.family_id;

      // Check for existing active/waiting behavior requests for this student
      const { data: existingRequests, error: checkError } = await supabase
        .from('behavior_requests')
        .select('id')
        .eq('student_id', studentId)
        .in('status', ['waiting', 'active'])
        .limit(1);

      if (checkError) throw checkError;

      if (existingRequests && existingRequests.length > 0) {
        toast({
          title: "Student Already in Queue",
          description: `${data.student.first_name} ${data.student.last_name} already has an active behavior request.`,
          variant: "destructive",
        });
        return;
      }

      // Create behavior request
      const { error: requestError } = await supabase
        .from('behavior_requests')
        .insert([{
          student_id: studentId,
          teacher_id: user.id,
          behavior_type: data.behaviors.join(', '),
          description: data.notes || 'Behavior incident',
          teacher_name: user.email?.split('@')[0] || 'Teacher',
          status: 'waiting',
          priority_level: data.urgent ? 'high' : 'medium'
        }]);

      if (requestError) throw requestError;

      toast({
        title: "Student Added",
        description: `${data.student.first_name} ${data.student.last_name} has been added to the queue.`,
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Error",
        description: "Failed to add student to queue. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Submit reflection
  const submitReflection = async (
    behaviorRequestId: string,
    reflectionData: {
      question1: string;
      question2: string;
      question3: string;
      question4: string;
    }
  ) => {
    try {
      // Get behavior request to find student_id
      const { data: request } = await supabase
        .from('behavior_requests')
        .select('student_id')
        .eq('id', behaviorRequestId)
        .single();

      if (!request) throw new Error('Behavior request not found');

      // Insert reflection
      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert([{
          behavior_request_id: behaviorRequestId,
          student_id: request.student_id,
          question_1_response: reflectionData.question1,
          question_2_response: reflectionData.question2,
          question_3_response: reflectionData.question3,
          question_4_response: reflectionData.question4,
          teacher_approved: false,
          revision_requested: false,
          submitted_at: new Date().toISOString()
        }]);

      if (reflectionError) throw reflectionError;

      // Update behavior request status
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ status: 'completed' })
        .eq('id', behaviorRequestId);

      if (updateError) throw updateError;

      await fetchQueue();
    } catch (error) {
      console.error('Error submitting reflection:', error);
    }
  };

  // Approve reflection
  const approveReflection = async (behaviorRequestId: string) => {
    try {
      // Update reflection to approved
      const { error: reflectionError } = await supabase
        .from('reflections')
        .update({ 
          teacher_approved: true,
          reviewed_at: new Date().toISOString()
        })
        .eq('behavior_request_id', behaviorRequestId);

      if (reflectionError) throw reflectionError;

      // Archive the behavior request
      const { error: archiveError } = await supabase
        .from('behavior_requests')
        .delete()
        .eq('id', behaviorRequestId);

      if (archiveError) throw archiveError;

      toast({
        title: "Reflection Approved",
        description: "Student removed from queue.",
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error approving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to approve reflection",
        variant: "destructive",
      });
    }
  };

  // Request revision
  const requestRevision = async (behaviorRequestId: string, feedback: string) => {
    try {
      // Update reflection with feedback
      const { error: reflectionError } = await supabase
        .from('reflections')
        .update({
          revision_requested: true,
          teacher_feedback: feedback,
          teacher_approved: false
        })
        .eq('behavior_request_id', behaviorRequestId);

      if (reflectionError) throw reflectionError;

      // Reset behavior request to waiting
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ status: 'waiting' })
        .eq('id', behaviorRequestId);

      if (updateError) throw updateError;

      toast({
        title: "Revision Requested",
        description: "Student has been notified to revise their reflection.",
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Error",
        description: "Failed to request revision. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Clear queue based on user role  
  const clearQueue = async () => {
    try {
      setClearQueueLoading(true);
      
      if (!user) throw new Error('User not authenticated');

      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        // Admin can clear all queues
        const { error } = await supabase.rpc('admin_clear_all_queues');
        if (error) throw error;
        toast({
          title: "Queue Cleared",
          description: "All student queues have been cleared successfully.",
        });
      } else {
        // Teacher can only clear their own queue using proper archiving
        const { error } = await supabase.rpc('clear_teacher_queue', {
          p_teacher_id: user.id
        });
        if (error) throw error;
        toast({
          title: "Queue Cleared", 
          description: "Your student queue has been cleared successfully.",
        });
      }

      await fetchQueue();
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({
        title: 'Error clearing queue',
        description: 'Failed to clear the queue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClearQueueLoading(false);
    }
  };

  // Clear single item using proper archiving
  const clearItem = async (behaviorRequestId: string) => {
    try {
      const { error } = await supabase.rpc('clear_single_behavior_request', {
        p_behavior_request_id: behaviorRequestId
      });

      if (error) throw error;

      toast({
        title: "Student Removed",
        description: "Student successfully removed from queue.",
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error clearing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove student from queue. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Format time elapsed
  const formatTimeElapsed = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min';
    if (diffMins < 60) return `${diffMins} mins`;
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours === 1) {
      return remainingMins > 0 ? `1h ${remainingMins}m` : '1 hour';
    }
    
    return remainingMins > 0 ? `${diffHours}h ${remainingMins}m` : `${diffHours} hours`;
  };

  // Get first waiting student for kiosk
  const getFirstWaitingStudentForKiosk = (kioskId: number) => {
    const waiting = items.find(item => item.status === 'waiting');
    return waiting || null;
  };

  // Update student kiosk status
  const updateStudentKioskStatus = async (
    kioskId: number,
    studentId?: string,
    behaviorRequestId?: string
  ) => {
    try {
      await supabase.rpc('update_student_kiosk_status', {
        p_kiosk_id: kioskId,
        p_student_id: studentId,
        p_behavior_request_id: behaviorRequestId
      });
      await fetchQueue();
    } catch (error) {
      console.error('Error updating kiosk status:', error);
    }
  };

  return {
    items,
    loading,
    clearQueueLoading,
    addToQueue,
    submitReflection,
    approveReflection,
    requestRevision,
    clearQueue,
    clearItem,
    formatTimeElapsed,
    refreshQueue: fetchQueue,
    getFirstWaitingStudentForKiosk,
    updateStudentKioskStatus
  };
};