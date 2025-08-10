
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useKiosks } from '@/contexts/KioskContext';
import { toast } from '@/hooks/use-toast';

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
  status: 'waiting' | 'completed' | 'review';
  kiosk_status: 'waiting' | 'ready' | 'in_progress' | 'completed';
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
  const { user } = useAuth();
  const { updateKioskStudent } = useKiosks();
  const [items, setItems] = useState<BehaviorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearQueueLoading, setClearQueueLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user role
  const getUserRole = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'teacher'; // Default to teacher if error
      }
      
      return data?.role || 'teacher';
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return 'teacher';
    }
  }, [user?.id]);

  // Fetch queue items with student and reflection data
  const fetchQueue = useCallback(async (skipLoadingState = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      if (!skipLoadingState && !clearQueueLoading) {
        setLoading(true);
      }
      
      console.log("🔄 Fetching queue data...");
      
      // Get user role if not already cached
      if (!userRole) {
        const role = await getUserRole();
        setUserRole(role);
      }
      
      // Build query with role-based filtering
      let query = supabase
        .from('behavior_requests')
        .select(`
          *,
          student:students(*),
          reflection:reflections(*)
        `);
      
      // Apply role-based filtering
      const currentRole = userRole || await getUserRole();
      if (currentRole === 'teacher') {
        // Teachers only see their own behavior requests
        query = query.eq('teacher_id', user.id);
        console.log("🔒 Applying teacher filter: only showing requests from current user");
      } else {
        // Admins see all behavior requests
        console.log("👑 Admin access: showing all behavior requests");
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      console.log("✅ Queue data fetched successfully:", data?.length || 0, "items");
      
      // Transform data to match expected format
      const transformedData = data?.map((item: any) => {
        // Normalize reflection: Supabase may return an array; we want a single latest entry
        const normalizedReflection = Array.isArray(item.reflection)
          ? item.reflection[0]
          : item.reflection;

        return {
          ...item,
          reflection: normalizedReflection,
          position: 0, // Will be calculated below
          timestamp: new Date(item.created_at)
        };
      }) || [];

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
      console.log("📋 Queue state updated with", transformedData.length, "items");
    } catch (error) {
      console.error('❌ Error fetching queue:', error);
      // Show a toast notification for error
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      // Always ensure loading is set to false
      if (!skipLoadingState) {
        setLoading(false);
        console.log("⏹️ Loading state set to false");
      }
    }
  }, [user?.id, clearQueueLoading, userRole, getUserRole]);

  // Call new database function to reassign all waiting students
  const reassignWaitingStudents = useCallback(async (): Promise<void> => {
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
  }, []);

  // Enhanced debounced fetch function with longer delay to prevent race conditions
  const debouncedFetch = useCallback((() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fetchQueue(true), 1000); // Increased from 300ms to 1000ms
    };
  })(), [fetchQueue]);

  // Initialize user role
  useEffect(() => {
    if (user?.id && !userRole) {
      getUserRole().then(setUserRole);
    }
  }, [user?.id, userRole, getUserRole]);

  // Optimized real-time subscription with intelligent reassignment triggers
  useEffect(() => {
    fetchQueue();

    const subscription = supabase
      .channel('queue-changes')
        .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'behavior_requests' },
        (payload) => {
          console.log('📡 Real-time update:', payload.eventType, payload);
          
          // Trigger immediate reassignment when a student moves to review or completes reflection
          if (payload.eventType === 'UPDATE' && 
              (payload.new?.status === 'review' || payload.new?.status === 'completed') && 
              payload.old?.status === 'waiting') {
            console.log('🔄 Student moved to review status - triggering immediate reassignment');
            reassignWaitingStudents().catch(console.error);
          }
          
          // Debounced queue refresh for UI updates
          debouncedFetch();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reflections' },
        (payload) => {
          console.log('📝 Reflection update:', payload);
          debouncedFetch();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, fetchQueue, debouncedFetch, reassignWaitingStudents]);

  // Add student to queue with enhanced FIFO assignment and duplicate prevention
  const addToQueue = async (data: {
    studentName: string;
    behaviors: string[];
    mood: string;
    urgent?: boolean;
    notes?: string;
  }) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add students to the queue",
          variant: "destructive",
        });
        return;
      }

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

      if (existingStudent) {
        // CRITICAL: Check for existing active request for this student
        const { data: existingRequest, error: checkError } = await supabase
          .from('behavior_requests')
          .select('id, status')
          .eq('student_id', studentId)
          .in('status', ['waiting', 'review'])
          .maybeSingle();

        if (checkError) {
          console.error('Error checking for existing request:', checkError);
          throw checkError;
        }

        if (existingRequest) {
          toast({
            title: "Student Already in Queue",
            description: `${data.studentName} already has an active behavior request (${existingRequest.status}). Please complete or cancel the existing request first.`,
            variant: "destructive",
          });
          return;
        }
      } else {
        // Create student if doesn't exist
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

      // Create behavior request - unique constraint will prevent duplicates
      const { error: requestError } = await supabase
        .from('behavior_requests')
        .insert([{
          student_id: studentId,
          teacher_id: user.id,
          behaviors: data.behaviors,
          mood: data.mood,
          status: 'waiting',
          urgent: data.urgent || false,
          notes: data.notes || null,
          assigned_kiosk_id: null, // Start unassigned for proper FIFO
          kiosk_status: 'waiting'
        }]);

      if (requestError) {
        console.error('Error creating behavior request:', requestError);
        // Handle unique constraint violation gracefully
        if (requestError.code === '23505') {
          toast({
            title: "Student Already in Queue",
            description: `${data.studentName} already has an active behavior request. Please complete or cancel the existing request first.`,
            variant: "destructive",
          });
          return;
        }
        throw requestError;
      }

      toast({
        title: "Student Added",
        description: `${data.studentName} has been added to the queue successfully.`,
      });

      // Immediately trigger reassignment to ensure FIFO order
      await reassignWaitingStudents();

      await fetchQueue(true);
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
      // Insert reflection
      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert([{
          behavior_request_id: behaviorRequestId,
          ...reflectionData,
          status: 'pending'
        }]);

      if (reflectionError) throw reflectionError;

      // Set status to 'review' for teacher review, and kiosk_status to 'completed' to free the kiosk
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ 
          status: 'review',  // Ready for teacher review
          kiosk_status: 'completed'  // This allows the database function to recognize the kiosk as available
        })
        .eq('id', behaviorRequestId);

      if (updateError) throw updateError;

      console.log('✅ Reflection submitted with status=review, kiosk_status=completed (ready for teacher review)');
      
      // Immediately trigger reassignment - the database function will handle cleanup and assignment
      try {
        await reassignWaitingStudents();
        console.log('✅ Queue reassignment triggered successfully after reflection completion');
      } catch (reassignError) {
        console.error('❌ Queue reassignment failed after reflection completion:', reassignError);
        // Don't throw - reflection submission should succeed even if reassignment fails
      }

      // Single refresh after all operations complete
      await fetchQueue(true);
    } catch (error) {
      console.error('Error submitting reflection:', error);
    }
  };

  // Approve reflection - simplified to just delete, let database trigger handle archival
  const approveReflection = async (behaviorRequestId: string) => {
    try {
      // Simply delete the behavior request - the database trigger will handle archival
      const { error: deleteError } = await supabase
        .from('behavior_requests')
        .delete()
        .eq('id', behaviorRequestId);

      if (deleteError) throw deleteError;

      // Trigger reassignment of waiting students
      await reassignWaitingStudents();

      toast({
        title: "Reflection Approved",
        description: "Student removed from queue.",
      });

      await fetchQueue(true);
    } catch (error) {
      console.error('Error approving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to approve reflection",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Request revision - FIXED: Reuses existing request with complete history preservation
  const requestRevision = async (behaviorRequestId: string, feedback: string) => {
    try {
      // CRITICAL: The reflection history trigger will automatically archive the current reflection
      // when we update its status to 'revision_requested'
      
      // Update reflection with feedback and revision status (triggers automatic archival)
      const { error: reflectionError } = await supabase
        .from('reflections')
        .update({ 
          status: 'revision_requested',
          teacher_feedback: feedback
        })
        .eq('behavior_request_id', behaviorRequestId);

      if (reflectionError) throw reflectionError;

      // FIXED: Reuse existing behavior request instead of creating duplicate
      // Reset to waiting status so student can retry with the same request
      const { error: updateError } = await supabase
        .from('behavior_requests')
        .update({ 
          status: 'waiting',
          kiosk_status: 'waiting', // Reset kiosk status so they can be reassigned
          assigned_kiosk_id: null   // Clear kiosk assignment for reassignment
        })
        .eq('id', behaviorRequestId);

      if (updateError) throw updateError;

      // Clear the reflection content so student can provide new answers
      // (Keep the archived version in reflections_history)
      const { error: clearReflectionError } = await supabase
        .from('reflections')
        .update({
          question1: '',
          question2: '',
          question3: '',
          question4: '',
          status: 'pending' // Ready for new submission
        })
        .eq('behavior_request_id', behaviorRequestId);

      if (clearReflectionError) throw clearReflectionError;

      // Trigger reassignment to put student back in proper queue order
      await reassignWaitingStudents();

      toast({
        title: "Revision Requested",
        description: "Student has been notified to revise their reflection and placed back in the queue.",
      });

      await fetchQueue(true);
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Error",
        description: "Failed to request revision. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get first waiting student for specific kiosk based on new status logic
  const getFirstWaitingStudentForKiosk = (kioskId: number) => {
    // Find students assigned to this kiosk, including those completing reflection
    const kioskStudents = items.filter(item => 
      item.assigned_kiosk_id === kioskId && 
      // Include students in various stages of completion flow, not just waiting
      (item.status === 'waiting' || 
       (item.status === 'review' && item.kiosk_status !== 'waiting') ||
       (item.status === 'completed' && item.reflection?.status === 'approved'))
    ).sort((a, b) => {
      // Sort by kiosk_status priority and then by position
      const statusPriority = { 'in_progress': 0, 'ready': 1, 'waiting': 2 };
      const aPriority = statusPriority[a.kiosk_status] || 3;
      const bPriority = statusPriority[b.kiosk_status] || 3;
      
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (a.position || 0) - (b.position || 0);
    });

    console.log(`🔍 Kiosk ${kioskId} students found:`, kioskStudents.map(s => ({
      name: s.student?.name, 
      status: s.status, 
      kiosk_status: s.kiosk_status,
      reflection_status: s.reflection?.status
    })));

    return kioskStudents.length > 0 ? kioskStudents[0] : undefined;
  };

  // Get first waiting student (legacy function for compatibility)
  const getFirstWaitingStudent = () => {
    const waitingItems = items.filter(item => 
      item.status === 'waiting' && item.kiosk_status === 'waiting'
    );
    return waitingItems.length > 0 ? waitingItems[0] : undefined;
  };

  // Clear all queue items (admin: hard reset via RPC; teacher: own queue)
  const clearQueue = async () => {
    try {
      setClearQueueLoading(true);
      console.log('🧹 Starting clear queue operation...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Determine role (cached or fetched)
      const currentRole = userRole || await getUserRole();

      if (currentRole === 'admin') {
        // ADMIN: Hard reset using RPC function
        console.log('👑 Admin detected — invoking RPC admin_clear_all_queues');
        const { error } = await supabase.rpc('admin_clear_all_queues');
        if (error) {
          console.error('❌ RPC admin_clear_all_queues error:', error);
          throw error;
        }
        console.log('✅ RPC admin_clear_all_queues succeeded');
        
        // Local reset + fresh fetch
        setItems([]);
        await fetchQueue(true);
        
        toast({ title: 'Queue cleared.' });
        return;
      }

      // TEACHER: Clear only own queue (legacy path)
      // Count items first (teacher scope)
      const { count } = await supabase
        .from('behavior_requests')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      // Delete behavior requests for this teacher
      const { error: deleteError } = await supabase
        .from('behavior_requests')
        .delete()
        .eq('teacher_id', user.id);
      
      if (deleteError) {
        console.error('❌ Clear queue error (teacher):', deleteError);
        throw deleteError;
      }

      // Best-effort reassignment
      try {
        await reassignWaitingStudents();
      } catch (reassignError) {
        console.warn('Warning: Reassign after teacher clear failed:', reassignError);
      }

      setItems([]);
      await fetchQueue(true);
      toast({ title: 'Queue cleared.' });
    } catch (error) {
      console.error('💥 CLEAR QUEUE ERROR:', error);
      toast({
        title: 'Error clearing queue',
        description: 'Failed to clear the queue. Please try again.',
        variant: 'destructive',
      });
      throw error;
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
