
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  status: 'waiting' | 'completed';
  kiosk_status: 'waiting' | 'ready' | 'in_progress';
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
  const [clearQueueLoading, setClearQueueLoading] = useState(false);

  // Fetch queue items with student and reflection data
  const fetchQueue = async (skipLoadingState = false) => {
    try {
      if (!skipLoadingState && !clearQueueLoading) {
        setLoading(true);
      }
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

      // Calculate positions (only for waiting items with kiosk assignment)
      const waitingItems = transformedData.filter(item => 
        item.status === 'waiting' && item.assigned_kiosk_id !== null
      );
      
      // Group by kiosk and calculate position within each kiosk's queue
      const kioskGroups: Record<number, any[]> = {};
      waitingItems.forEach(item => {
        if (item.assigned_kiosk_id) {
          if (!kioskGroups[item.assigned_kiosk_id]) {
            kioskGroups[item.assigned_kiosk_id] = [];
          }
          kioskGroups[item.assigned_kiosk_id].push(item);
        }
      });
      
      // Set positions within each kiosk's queue
      Object.values(kioskGroups).forEach(kioskItems => {
        kioskItems.forEach((item, index) => {
          item.position = index + 1;
        });
      });

      setItems(transformedData);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      if (!skipLoadingState) {
        setLoading(false);
      }
    }
  };

  // Debounced fetch function for real-time updates
  const debouncedFetch = (() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fetchQueue(true), 300);
    };
  })();

  // Subscribe to real-time updates
  useEffect(() => {
    fetchQueue();

    const subscription = supabase
      .channel('queue-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'behavior_requests' },
        () => debouncedFetch()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reflections' },
        () => debouncedFetch()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Call new database function to reassign all waiting students
  const reassignWaitingStudents = async (): Promise<void> => {
    try {
      const { error } = await supabase.rpc('reassign_waiting_students');
      if (error) {
        console.error('Error reassigning waiting students:', error);
        throw error;
      }
      console.log('Successfully reassigned waiting students');
    } catch (error) {
      console.error('Failed to reassign waiting students:', error);
      throw error;
    }
  };

  // Add student to queue with enhanced FIFO assignment
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

      // Create behavior request without kiosk assignment first to ensure FIFO
      const { error: requestError } = await supabase
        .from('behavior_requests')
        .insert([{
          student_id: studentId,
          teacher_id: teacherId,
          behaviors: data.behaviors,
          mood: data.mood,
          status: 'waiting',
          urgent: data.urgent || false,
          notes: data.notes || null,
          assigned_kiosk_id: null, // Start unassigned for proper FIFO
          kiosk_status: 'waiting'
        }]);

      if (requestError) throw requestError;

      // Immediately trigger reassignment to ensure FIFO order
      await reassignWaitingStudents();

      await fetchQueue(true);
    } catch (error) {
      console.error('Error adding to queue:', error);
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


      await fetchQueue(true);
    } catch (error) {
      console.error('Error submitting reflection:', error);
    }
  };

  // Approve reflection and save to behavior history
  const approveReflection = async (behaviorRequestId: string) => {
    try {
      // Get complete behavior request data with related information
      const { data: behaviorData, error: behaviorError } = await supabase
        .from('behavior_requests')
        .select(`
          *,
          student:students(*),
          reflection:reflections(*)
        `)
        .eq('id', behaviorRequestId)
        .single();

      if (behaviorError) throw behaviorError;
      if (!behaviorData) throw new Error('Behavior request not found');

      // Extract reflection data (it comes as an array from the join)
      const reflectionData = Array.isArray(behaviorData.reflection) 
        ? behaviorData.reflection[0] 
        : behaviorData.reflection;

      // Get teacher data
      const { data: teacherData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', behaviorData.teacher_id)
        .single();

      // Get kiosk data if assigned
      let kioskData = null;
      if (behaviorData.assigned_kiosk_id) {
        const { data: kiosk } = await supabase
          .from('kiosks')
          .select('name, location')
          .eq('id', behaviorData.assigned_kiosk_id)
          .single();
        kioskData = kiosk;
      }

      // Calculate time in queue
      const queueTime = Math.floor(
        (new Date().getTime() - new Date(behaviorData.created_at).getTime()) / (1000 * 60)
      );

      // Calculate queue position when created
      const queuePosition = items.findIndex(item => item.id === behaviorRequestId) + 1;

      // Create comprehensive behavior history record
      const historyRecord = {
        original_request_id: behaviorData.id,
        student_id: behaviorData.student_id,
        teacher_id: behaviorData.teacher_id,
        behaviors: behaviorData.behaviors,
        mood: behaviorData.mood,
        urgent: behaviorData.urgent,
        notes: behaviorData.notes,
        assigned_kiosk_id: behaviorData.assigned_kiosk_id,
        
        // Student snapshot
        student_name: behaviorData.student?.name || 'Unknown',
        student_grade: behaviorData.student?.grade,
        student_class_name: behaviorData.student?.class_name,
        
        // Teacher snapshot
        teacher_name: teacherData?.full_name,
        teacher_email: teacherData?.email,
        
        // Kiosk snapshot
        kiosk_name: kioskData?.name,
        kiosk_location: kioskData?.location,
        
        // Reflection data
        reflection_id: reflectionData?.id,
        question1: reflectionData?.question1,
        question2: reflectionData?.question2,
        question3: reflectionData?.question3,
        question4: reflectionData?.question4,
        teacher_feedback: reflectionData?.teacher_feedback,
        
        // Workflow metadata
        queue_position: queuePosition,
        time_in_queue_minutes: queueTime,
        completion_status: 'completed',
        intervention_outcome: 'approved',
        
        // Timestamps
        queue_created_at: behaviorData.created_at,
        queue_started_at: behaviorData.updated_at,
        completed_at: new Date().toISOString()
      };

      // Save to behavior history
      const { error: historyError } = await supabase
        .from('behavior_history')
        .insert([historyRecord]);

      if (historyError) throw historyError;

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


      await fetchQueue(true);
    } catch (error) {
      console.error('Error approving reflection:', error);
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


      await fetchQueue(true);
    } catch (error) {
      console.error('Error requesting revision:', error);
    }
  };

  // Get first waiting student for specific kiosk based on new status logic
  const getFirstWaitingStudentForKiosk = (kioskId: number) => {
    // Find students assigned to this kiosk, prioritizing by kiosk_status and position
    const kioskStudents = items.filter(item => 
      item.assigned_kiosk_id === kioskId && 
      item.status === 'waiting'
    ).sort((a, b) => {
      // Sort by kiosk_status priority and then by position
      const statusPriority = { 'in_progress': 0, 'ready': 1, 'waiting': 2 };
      const aPriority = statusPriority[a.kiosk_status] || 3;
      const bPriority = statusPriority[b.kiosk_status] || 3;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (a.position || 0) - (b.position || 0);
    });

    return kioskStudents.length > 0 ? kioskStudents[0] : undefined;
  };

  // Get first waiting student (legacy function for compatibility)
  const getFirstWaitingStudent = () => {
    const waitingItems = items.filter(item => 
      item.status === 'waiting' && item.kiosk_status === 'waiting'
    );
    return waitingItems.length > 0 ? waitingItems[0] : undefined;
  };

  // Clear entire queue
  const clearQueue = async () => {
    try {
      setClearQueueLoading(true);
      
      const { error } = await supabase
        .from('behavior_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        throw error;
      }

      // Immediately update local state to prevent flickering
      setItems([]);
      
      // Fetch fresh data without showing loading spinner
      await fetchQueue(true);
    } catch (error) {
      console.error('💥 CLEAR QUEUE ERROR:', error);
    } finally {
      setClearQueueLoading(false);
    }
  };

  // Legacy kiosk assignment - replaced by database function
  const assignStudentToKiosk = async (): Promise<number | null> => {
    try {
      // Get active kiosks count for return value
      const { data: activeKiosks, error: kioskError } = await supabase
        .from('kiosks')
        .select('id')
        .eq('is_active', true)
        .limit(1);

      if (kioskError) throw kioskError;
      
      return activeKiosks && activeKiosks.length > 0 ? activeKiosks[0].id : null;
    } catch (error) {
      console.error('Error in kiosk assignment:', error);
      return null;
    }
  };

  // Enhanced reassign students using database RPC
  const reassignStudents = async () => {
    try {
      // Use the enhanced database function for proper FIFO reassignment
      await reassignWaitingStudents();
      await fetchQueue(true);
      console.log('Reassigned waiting students using enhanced database function');
    } catch (error) {
      console.error('Error reassigning students:', error);
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

  // Update student kiosk status with local state optimization
  const updateStudentKioskStatus = async (behaviorRequestId: string, newStatus: 'waiting' | 'ready' | 'in_progress') => {
    try {
      const { error } = await supabase.rpc('update_student_kiosk_status', {
        p_behavior_request_id: behaviorRequestId,
        p_new_kiosk_status: newStatus
      });

      if (error) throw error;
      
      // Update local state immediately to prevent flickering
      setItems(prev => prev.map(item => 
        item.id === behaviorRequestId 
          ? { ...item, kiosk_status: newStatus }
          : item
      ));
      
      console.log(`Updated kiosk status for ${behaviorRequestId} to ${newStatus}`);
    } catch (error) {
      console.error('Error updating student kiosk status:', error);
    }
  };

  // Enhanced assign waiting students to newly activated kiosk with FIFO
  const assignWaitingStudentsToKiosk = async (kioskId: number) => {
    try {
      // Use enhanced database function that handles FIFO assignment and load balancing
      const { error } = await supabase.rpc('assign_waiting_students_to_kiosk', {
        p_kiosk_id: kioskId
      });

      if (error) throw error;
      
      console.log(`Assigned waiting students to kiosk ${kioskId} using FIFO`);
      
      // Refresh queue to show updates
      await fetchQueue(true);
    } catch (error) {
      console.error('Error assigning students to kiosk:', error);
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
    getFirstWaitingStudent,
    getFirstWaitingStudentForKiosk,
    reassignStudents,
    clearQueue,
    formatTimeElapsed,
    updateStudentKioskStatus,
    assignWaitingStudentsToKiosk,
    reassignWaitingStudents,
    refreshQueue: fetchQueue
  };
};
