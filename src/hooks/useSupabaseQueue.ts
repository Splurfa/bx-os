
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  name: string;
  grade?: string;
  class_name?: string;
  created_at: string;
}

export interface BehaviorRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  behaviors: string[];
  mood: string;
  status: 'waiting' | 'active' | 'completed';
  urgent: boolean;
  notes?: string;
  assigned_kiosk_id?: number;
  created_at: string;
  updated_at: string;
  student?: Student;
  reflection?: Reflection;
  position?: number;
  timestamp?: Date;
}

export interface Reflection {
  id: string;
  behavior_request_id: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  status: 'pending' | 'approved' | 'revision_requested';
  teacher_feedback?: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseQueue = () => {
  const [items, setItems] = useState<BehaviorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch queue items with student and reflection data
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('behavior_requests')
        .select(`
          *,
          student:students(*),
          reflection:reflections(*)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform data to match expected format
      const transformedData = data?.map((item: any) => ({
        ...item,
        position: 0, // Will be calculated below
        timestamp: new Date(item.created_at)
      })) || [];

      // Calculate positions (only for waiting items)
      const waitingItems = transformedData.filter(item => item.status === 'waiting');
      waitingItems.forEach((item, index) => {
        item.position = index + 1;
      });

      setItems(transformedData);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast({
        title: "Error",
        description: "Failed to load queue data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
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
  }, []);

  // Add student to queue
  const addToQueue = async (data: {
    studentName: string;
    behaviors: string[];
    mood: string;
    urgent?: boolean;
    notes?: string;
  }) => {
    try {
      // First, ensure student exists
      const { data: existingStudent, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('name', data.studentName)
        .maybeSingle();

      if (studentError) {
        throw studentError;
      }

      let studentId = existingStudent?.id;

      // Create student if doesn't exist
      if (!existingStudent) {
        const { data: newStudent, error: createStudentError } = await supabase
          .from('students')
          .insert([{ name: data.studentName }])
          .select('id')
          .single();

        if (createStudentError) throw createStudentError;
        if (!newStudent) throw new Error('Failed to create student');
        studentId = newStudent.id;
      }

      if (!studentId) throw new Error('Student ID not found');

      // Get current user's teacher ID (for authenticated requests)
      const { data: { user } } = await supabase.auth.getUser();
      let teacherId = user?.id || '00000000-0000-0000-0000-000000000000';

      // Create behavior request
      const { error: requestError } = await supabase
        .from('behavior_requests')
        .insert([{
          student_id: studentId,
          teacher_id: teacherId,
          behaviors: data.behaviors,
          mood: data.mood,
          status: 'waiting',
          urgent: data.urgent || false,
          notes: data.notes || null
        }]);

      if (requestError) throw requestError;

      toast({
        title: "Student Added",
        description: `${data.studentName} has been added to the queue.`
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Error",
        description: "Failed to add student to queue",
        variant: "destructive"
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
      // Insert reflection
      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert([{
          behavior_request_id: behaviorRequestId,
          ...reflectionData,
          status: 'pending'
        }]);

      if (reflectionError) throw reflectionError;

      // Update behavior request status
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ status: 'completed' })
        .eq('id', behaviorRequestId);

      if (updateError) throw updateError;

      toast({
        title: "Reflection Submitted",
        description: "Your reflection has been submitted for review."
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error submitting reflection:', error);
      toast({
        title: "Error",
        description: "Failed to submit reflection",
        variant: "destructive"
      });
    }
  };

  // Approve reflection
  const approveReflection = async (behaviorRequestId: string) => {
    try {
      // Update reflection status
      const { error: reflectionError } = await supabase
        .from('reflections')
        .update({ status: 'approved' })
        .eq('behavior_request_id', behaviorRequestId);

      if (reflectionError) throw reflectionError;

      // Remove from queue by deleting the behavior request
      const { error: deleteError } = await supabase
        .from('behavior_requests')
        .delete()
        .eq('id', behaviorRequestId);

      if (deleteError) throw deleteError;

      toast({
        title: "Reflection Approved",
        description: "Student has been removed from the queue."
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error approving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to approve reflection",
        variant: "destructive"
      });
    }
  };

  // Request revision
  const requestRevision = async (behaviorRequestId: string, feedback: string) => {
    try {
      // Update reflection with feedback and revision status
      const { error: reflectionError } = await supabase
        .from('reflections')
        .update({ 
          status: 'revision_requested',
          teacher_feedback: feedback
        })
        .eq('behavior_request_id', behaviorRequestId);

      if (reflectionError) throw reflectionError;

      // Update behavior request back to waiting
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ status: 'waiting' })
        .eq('id', behaviorRequestId);

      if (updateError) throw updateError;

      toast({
        title: "Revision Requested",
        description: "Student will receive feedback and can revise their reflection."
      });

      await fetchQueue();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Error",
        description: "Failed to request revision",
        variant: "destructive"
      });
    }
  };

  // Get first waiting student for kiosk
  const getFirstWaitingStudent = () => {
    const waitingItems = items.filter(item => item.status === 'waiting');
    return waitingItems.length > 0 ? waitingItems[0] : undefined;
  };

  // Clear entire queue
  const clearQueue = async () => {
    try {
      console.log('🔄 CLEARING ENTIRE QUEUE');
      
      const { error } = await supabase
        .from('behavior_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('❌ CLEAR QUEUE ERROR:', error);
        throw error;
      }

      console.log('✅ QUEUE CLEARED SUCCESSFULLY');
      toast({
        title: "Queue Cleared",
        description: "All students have been removed from the queue."
      });

      await fetchQueue();
    } catch (error) {
      console.error('💥 CLEAR QUEUE ERROR:', error);
      toast({
        title: "Error",
        description: "Failed to clear queue",
        variant: "destructive"
      });
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

  return {
    items,
    loading,
    addToQueue,
    submitReflection,
    approveReflection,
    requestRevision,
    getFirstWaitingStudent,
    clearQueue,
    formatTimeElapsed,
    refreshQueue: fetchQueue
  };
};
