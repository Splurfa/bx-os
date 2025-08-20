import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  reflection?: any;
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

export const useKioskQueue = () => {
  const [items, setItems] = useState<BehaviorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch queue items with anonymous access for kiosks
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching queue data for kiosk (anonymous access)...');
      
      // Anonymous query - no auth check needed for kiosks
      const { data, error } = await supabase
        .from('behavior_requests')
        .select(`
          *,
          student:students(*),
          reflection:reflections(*)
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Queue fetch error:', error);
        throw error;
      }

      console.log('✅ Queue data fetched:', data?.length || 0, 'items');

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
      console.error('Error fetching kiosk queue:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscriptions for kiosks
  useEffect(() => {
    fetchQueue();

    const subscription = supabase
      .channel('kiosk-queue-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'behavior_requests' },
        () => {
          console.log('🔄 Queue update detected, refreshing...');
          fetchQueue();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reflections' },
        () => {
          console.log('🔄 Reflection update detected, refreshing...');
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchQueue]);

  // Submit reflection (anonymous access for kiosks)
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
      console.log('📝 Submitting reflection for behavior request:', behaviorRequestId);
      
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

      console.log('✅ Reflection submitted successfully');
      await fetchQueue();
    } catch (error) {
      console.error('❌ Error submitting reflection:', error);
      throw error;
    }
  };

  // Get first waiting student for specific kiosk
  const getFirstWaitingStudentForKiosk = (kioskId: number) => {
    console.log(`🔍 Checking kiosk ${kioskId} for assigned students...`);
    console.log(`📋 Available queue items:`, items.map(item => ({
      id: item.id,
      status: item.status,
      assigned_kiosk: item.assigned_kiosk,
      student_name: `${item.student?.first_name || 'Unknown'} ${item.student?.last_name || 'Student'}`
    })));
    
    // First check if there's a student already assigned to this specific kiosk
    const assignedToKiosk = items.find(item => 
      item.status === 'active' && item.assigned_kiosk === kioskId
    );
    
    if (assignedToKiosk) {
      console.log(`✅ Found assigned student for kiosk ${kioskId}:`, assignedToKiosk);
      return assignedToKiosk;
    }
    
    // If no assigned student, find first waiting student
    const waiting = items.find(item => item.status === 'waiting');
    console.log(`⏳ ${waiting ? 'Found' : 'No'} waiting student for kiosk ${kioskId}:`, waiting);
    return waiting || null;
  };

  // Update student kiosk status
  const updateStudentKioskStatus = async (
    kioskId: number,
    studentId?: string,
    behaviorRequestId?: string
  ) => {
    try {
      console.log(`🔄 Updating kiosk ${kioskId} status:`, { studentId, behaviorRequestId });
      
      await supabase.rpc('update_student_kiosk_status', {
        p_kiosk_id: kioskId,
        p_student_id: studentId,
        p_behavior_request_id: behaviorRequestId
      });
      
      await fetchQueue();
    } catch (error) {
      console.error('❌ Error updating kiosk status:', error);
    }
  };

  return {
    items,
    loading,
    refreshQueue: fetchQueue,
    getFirstWaitingStudentForKiosk,
    updateStudentKioskStatus,
    submitReflection
  };
};