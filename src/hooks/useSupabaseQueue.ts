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
  date_of_birth?: string | null;
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
  urgency_level?: 'standard' | 're_integration' | 'urgent';
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
  urgent?: boolean;
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
    try {
      setLoading(true);
      
      // For kiosks (anonymous users), fetch all active and waiting items
      // For authenticated users, filter by role
      let query = supabase
        .from('behavior_requests')
        .select(`
          *,
          student:students(*),
          reflection:reflections(*),
          antecedent_context:antecedent_contexts(id, key, label)
        `)
        .neq('status', 'completed'); // Exclude completed items from queue display

      // Only filter by teacher if user is authenticated and is a teacher
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Filter by teacher if not admin
        if (profile?.role === 'teacher') {
          query = query.eq('teacher_id', user.id);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: true }); // Oldest first

      if (error) throw error;

      // Fetch teacher profiles for admin dashboard
      const teacherIds = data?.map(item => item.teacher_id).filter(Boolean) || [];
      let teacherProfiles = {};
      
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', teacherIds);
        
        teacherProfiles = profiles?.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {}) || {};
      }

      // Add teacher profile data to each behavior request
      const dataWithTeachers = data?.map(item => ({
        ...item,
        teacher_profile: teacherProfiles[item.teacher_id] || null
      })) || [];

      // PRIORITY QUEUE BEHAVIOR: Urgent/Re-integration items are intentionally pushed to top
      // This ensures urgent items appear at top of queue regardless of creation time
      const sortedData = dataWithTeachers?.sort((a: any, b: any) => {
        const urgencyOrder = { urgent: 3, re_integration: 2, standard: 1 };
        const aUrgency = urgencyOrder[a.urgency_level as keyof typeof urgencyOrder] || 1;
        const bUrgency = urgencyOrder[b.urgency_level as keyof typeof urgencyOrder] || 1;
        
        if (aUrgency !== bUrgency) {
          return bUrgency - aUrgency; // Higher urgency first (pushes urgent/re_integration to top)
        }
        
        // Same urgency level: sort by created_at (oldest first within same urgency)
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        console.log(`Sorting: ${a.student?.first_name} (${a.created_at}) vs ${b.student?.first_name} (${b.created_at}), result: ${aTime - bTime}`);
        return aTime - bTime;
      });

      const transformedData = sortedData?.map((item: any, index: number) => ({
        ...item,
        student: item.student,
        reflection: Array.isArray(item.reflection) 
          ? item.reflection[0] 
          : item.reflection,
        position: index + 1,
        timestamp: new Date(item.created_at),
        behaviors: item.behavior_type ? item.behavior_type.split(', ') : [],
        assigned_kiosk_id: item.assigned_kiosk,
        urgent: item.priority_level === 'high',
        urgency_level: item.urgency_level || 'standard'
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
    mood: string | number;
    urgent?: boolean;
    urgencyLevel?: 'standard' | 're_integration' | 'urgent';
    notes?: string;
    contextId?: string;
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

      // Determine urgency level
      const urgencyLevel = data.urgencyLevel || (data.urgent ? 'urgent' : 'standard');
      
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
          priority_level: urgencyLevel === 'urgent' ? 'high' : urgencyLevel === 're_integration' ? 'medium' : 'medium',
          antecedent_context_id: data.contextId || null,
          teacher_mood: typeof data.mood === 'number' ? data.mood : parseInt(String(data.mood)) || null,
          urgency_level: urgencyLevel,
          note: data.notes || null
        }]);

      if (requestError) throw requestError;

      // Trigger urgency-specific notifications
      await triggerUrgencyNotifications(urgencyLevel, {
        studentName: `${data.student.first_name} ${data.student.last_name}`,
        teacherName: user.email?.split('@')[0] || 'Teacher',
        behaviors: data.behaviors,
        contextId: data.contextId
      });

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

  // Submit reflection - Updated for 8-step workflow
  const submitReflection = async (
    behaviorRequestId: string, 
    reflectionData: {
      step1_incident_response: string;
      step2_mood_before: number;
      step3_accountability: number;
      step4_intent_response: string;
      step5_impact_response: string;
      step5_others_mood: number;
      step6_plan_response: string;
      step7_mood_after: number;
      step8_commitment: number;
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

      // Insert reflection with new 8-step structure
      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert([{
          behavior_request_id: behaviorRequestId,
          student_id: request.student_id,
          step1_incident_response: reflectionData.step1_incident_response,
          step2_mood_before: reflectionData.step2_mood_before,
          step3_accountability: reflectionData.step3_accountability,
          step4_intent_response: reflectionData.step4_intent_response,
          step5_impact_response: reflectionData.step5_impact_response,
          step5_others_mood: reflectionData.step5_others_mood,
          step6_plan_response: reflectionData.step6_plan_response,
          step7_mood_after: reflectionData.step7_mood_after,
          step8_commitment: reflectionData.step8_commitment,
          teacher_approved: false,
          revision_requested: false,
          submitted_at: new Date().toISOString()
        }]);

      if (reflectionError) throw reflectionError;

      // Update behavior request status to 'review' for proper status display
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ status: 'review' })
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
      // Get the behavior request data first
      const { data: behaviorRequest } = await supabase
        .from('behavior_requests')
        .select('*')
        .eq('id', behaviorRequestId)
        .single();

      if (!behaviorRequest) throw new Error('Behavior request not found');

      // Update reflection to approved
      const { error: reflectionError } = await supabase
        .from('reflections')
        .update({ 
          teacher_approved: true,
          reviewed_at: new Date().toISOString()
        })
        .eq('behavior_request_id', behaviorRequestId);

      if (reflectionError) throw reflectionError;

      // Create behavior history record
      const { error: historyError } = await supabase
        .from('behavior_history')
        .insert({
          behavior_request_id: behaviorRequestId,
          student_id: behaviorRequest.student_id,
          resolution_type: 'approved',
          resolution_notes: 'Reflection approved by teacher',
          completed_at: new Date().toISOString(),
          archived_at: new Date().toISOString()
        });

      if (historyError) throw historyError;

      // Update behavior request status to completed
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', behaviorRequestId);

      if (updateError) throw updateError;

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
        // Admin can clear all queues with new return format
        const { data, error } = await supabase.rpc('admin_clear_all_queues');
        if (error) throw error;
        console.log('Admin clear completed:', data);
        toast({
          title: "Queue Cleared",
          description: `Cleared ${data?.[0]?.deleted_requests_count || 0} requests successfully.`,
        });
      } else {
        // Teacher can only clear their own queue with new return format
        const { data, error } = await supabase.rpc('clear_teacher_queue', {
          p_teacher_id: user.id
        });
        if (error) throw error;
        console.log('Teacher clear completed:', data);
        toast({
          title: "Queue Cleared", 
          description: `Cleared ${data?.[0]?.deleted_requests_count || 0} requests successfully.`,
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

  // Get first waiting student for kiosk or student assigned to this kiosk
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

  // Update student kiosk status with improved atomic logic
  const updateStudentKioskStatus = async (
    kioskId: number,
    studentId?: string,
    behaviorRequestId?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('update_student_kiosk_status_atomic', {
        p_kiosk_id: kioskId,
        p_student_id: studentId || null,
        p_behavior_request_id: behaviorRequestId || null
      });

      if (error) throw error;
      
      // Check if the assignment was successful
      if (data?.[0] && !data[0].success) {
        console.warn('Kiosk assignment warning:', data[0].message);
        // Don't throw error for warnings, just log them
        if (data[0].message.includes('already has student assigned') || 
            data[0].message.includes('already has an active assignment')) {
          // These are expected race condition cases, handle gracefully
          return;
        }
      }

      // Trigger reassignment only if we cleared a kiosk
      if (data?.[0] && data[0].success && !data[0].kiosk_assigned) {
        // Only reassign if we're clearing, not assigning
        await supabase.rpc('reassign_waiting_students');
      }
      
      await fetchQueue();
    } catch (error) {
      console.error('Error updating kiosk status:', error);
      throw error;
    }
  };

  // Trigger urgency-specific notifications
  const triggerUrgencyNotifications = async (
    urgencyLevel: string,
    data: {
      studentName: string;
      teacherName: string;
      behaviors: string[];
      contextId?: string;
    }
  ) => {
    try {
      const title = urgencyLevel === 'urgent' 
        ? '🚨 URGENT BSR Created'
        : urgencyLevel === 're_integration'
        ? '⚠️ Re-Integration BSR Created'
        : '📝 Standard BSR Created';

      const message = `${data.studentName} - ${data.behaviors.join(', ')} (${data.teacherName})`;

      // Call notification edge function based on urgency
      if (urgencyLevel === 'urgent' || urgencyLevel === 're_integration') {
        await supabase.functions.invoke('send-urgency-notifications', {
          body: {
            urgencyLevel,
            title,
            message,
            data
          }
        });
      }

      // Always trigger in-app notifications
      if (user?.id) {
        const { notificationService } = await import('@/services/notificationService');
        await notificationService.handleNewNotification(user.id, title, message);
      }
    } catch (error) {
      console.warn('Failed to trigger urgency notifications:', error);
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