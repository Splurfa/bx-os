import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  MockBehaviorRequest, 
  MockReflection, 
  MockStudent,
  MOCK_STUDENTS,
  getStudentByName,
  createMockId,
  formatTimeStamp
} from './useMockData';
import { useKiosks } from '@/contexts/KioskContext';

export const useEnhancedQueue = () => {
  const [items, setItems] = useState<MockBehaviorRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { kiosks } = useKiosks();

  // Simulate loading delay for realistic feel
  const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 300));

  // Load initial data from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem('bsr_queue');
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue);
        // Convert timestamp strings back to Date objects
        const transformedData = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.created_at)
        }));
        setItems(transformedData);
      } catch (error) {
        console.warn('Failed to load saved queue:', error);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('bsr_queue', JSON.stringify(items));
  }, [items]);

  // Smart kiosk assignment - distribute to kiosk with fewest students
  const assignToOptimalKiosk = useCallback((requests: MockBehaviorRequest[]): MockBehaviorRequest[] => {
    const activeKiosks = kiosks.filter(k => k.isActive);
    if (activeKiosks.length === 0) return requests;

    // Count students per kiosk
    const kioskCounts = activeKiosks.reduce((acc, kiosk) => {
      const count = requests.filter(r => 
        r.assigned_kiosk_id === kiosk.id && r.status === 'waiting'
      ).length;
      acc[kiosk.id] = count;
      return acc;
    }, {} as Record<number, number>);

    return requests.map(item => {
      // Only assign unassigned waiting students
      if (item.status === 'waiting' && !item.assigned_kiosk_id) {
        // Find kiosk with minimum students
        const optimalKioskId = activeKiosks.reduce((minKiosk, kiosk) => 
          kioskCounts[kiosk.id] < kioskCounts[minKiosk.id] ? kiosk : minKiosk
        ).id;
        
        kioskCounts[optimalKioskId]++;
        return { ...item, assigned_kiosk_id: optimalKioskId };
      }
      return item;
    });
  }, [kiosks]);

  // Calculate positions for waiting items per kiosk
  const updatePositions = useCallback((requests: MockBehaviorRequest[]) => {
    const assignedRequests = assignToOptimalKiosk(requests);
    
    // Calculate position within each kiosk's queue
    return assignedRequests.map(item => {
      if (item.status === 'waiting' && item.assigned_kiosk_id) {
        const kioskWaitingItems = assignedRequests
          .filter(r => 
            r.status === 'waiting' && 
            r.assigned_kiosk_id === item.assigned_kiosk_id
          )
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        const position = kioskWaitingItems.findIndex(r => r.id === item.id) + 1;
        return { ...item, position };
      }
      return { ...item, position: 0 };
    });
  }, [assignToOptimalKiosk]);

  // Add student to queue
  const addToQueue = async (data: {
    studentName: string;
    behaviors: string[];
    mood: string;
    urgent?: boolean;
    notes?: string;
  }) => {
    setLoading(true);
    await simulateDelay();

    try {
      // Find or create student
      let student = getStudentByName(data.studentName);
      if (!student) {
        // Create new student if not found
        student = {
          id: createMockId(),
          name: data.studentName,
          grade: '6th', // Default grade
          class_name: '6A', // Default class
          created_at: formatTimeStamp(new Date())
        };
        MOCK_STUDENTS.push(student);
      }

      const newRequest: MockBehaviorRequest = {
        id: createMockId(),
        student_id: student.id,
        teacher_id: 'current-teacher', // Mock teacher ID
        behaviors: data.behaviors,
        mood: data.mood,
        status: 'waiting',
        urgent: data.urgent || false,
        notes: data.notes,
        created_at: formatTimeStamp(new Date()),
        updated_at: formatTimeStamp(new Date()),
        student,
        timestamp: new Date()
      };

      setItems(prev => {
        const updated = [...prev, newRequest];
        return updatePositions(updated);
      });

      toast({
        title: "Student Added",
        description: `${data.studentName} has been added to the queue.`
      });

    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Error",
        description: "Failed to add student to queue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    setLoading(true);
    await simulateDelay();

    try {
      const reflection: MockReflection = {
        id: createMockId(),
        behavior_request_id: behaviorRequestId,
        ...reflectionData,
        status: 'pending',
        created_at: formatTimeStamp(new Date()),
        updated_at: formatTimeStamp(new Date())
      };

      setItems(prev =>
        prev.map(item =>
          item.id === behaviorRequestId
            ? { 
                ...item, 
                status: 'completed' as const, 
                reflection,
                updated_at: formatTimeStamp(new Date())
              }
            : item
        )
      );

      toast({
        title: "Reflection Submitted",
        description: "Your reflection has been submitted for review."
      });

    } catch (error) {
      console.error('Error submitting reflection:', error);
      toast({
        title: "Error",
        description: "Failed to submit reflection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve reflection
  const approveReflection = async (behaviorRequestId: string) => {
    setLoading(true);
    await simulateDelay();

    try {
      setItems(prev => prev.filter(item => item.id !== behaviorRequestId));

      toast({
        title: "Reflection Approved",
        description: "Student has been removed from the queue."
      });

    } catch (error) {
      console.error('Error approving reflection:', error);
      toast({
        title: "Error",
        description: "Failed to approve reflection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Request revision
  const requestRevision = async (behaviorRequestId: string, feedback: string) => {
    setLoading(true);
    await simulateDelay();

    try {
      setItems(prev =>
        updatePositions(
          prev.map(item =>
            item.id === behaviorRequestId
              ? {
                  ...item,
                  status: 'waiting' as const,
                  reflection: item.reflection ? {
                    ...item.reflection,
                    status: 'revision_requested' as const,
                    teacher_feedback: feedback
                  } : undefined,
                  updated_at: formatTimeStamp(new Date())
                }
              : item
          )
        )
      );

      toast({
        title: "Revision Requested",
        description: "Student will receive feedback and can revise their reflection."
      });

    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Error",
        description: "Failed to request revision",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get first waiting student for specific kiosk (with fallback)
  const getFirstWaitingStudentForKiosk = (kioskId: number) => {
    // First, try to find students assigned to this kiosk
    let waitingItems = items
      .filter(item => item.status === 'waiting' && item.assigned_kiosk_id === kioskId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // If no assigned students, check for orphaned students and auto-assign
    if (waitingItems.length === 0) {
      const orphanedStudents = items
        .filter(item => item.status === 'waiting' && !item.assigned_kiosk_id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      if (orphanedStudents.length > 0) {
        
        const studentToAssign = orphanedStudents[0];
        
        // Auto-assign the first orphaned student to this kiosk
        setItems(prev => prev.map(item => 
          item.id === studentToAssign.id 
            ? { ...item, assigned_kiosk_id: kioskId }
            : item
        ));
        
        return { ...studentToAssign, assigned_kiosk_id: kioskId };
      }
    }
    
    return waitingItems.length > 0 ? waitingItems[0] : undefined;
  };

  // Get first waiting student (for backward compatibility)
  const getFirstWaitingStudent = () => {
    const waitingItems = items
      .filter(item => item.status === 'waiting')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return waitingItems.length > 0 ? waitingItems[0] : undefined;
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

  // Handle kiosk deactivation - reassign students to other kiosks
  const handleKioskDeactivation = useCallback((deactivatedKioskId: number) => {
    setItems(prev => {
      const studentsToReassign = prev.filter(item => 
        'assigned_kiosk_id' in item && 
        item.assigned_kiosk_id === deactivatedKioskId && 
        item.status === 'waiting'
      );
      
      if (studentsToReassign.length === 0) return prev;
      
      // Remove kiosk assignment from these students
      const updatedItems = prev.map(item => 
        studentsToReassign.some(s => s.id === item.id) 
          ? { ...item, assigned_kiosk_id: undefined }
          : item
      );
      
      // Re-apply kiosk assignment logic
      return updatePositions(updatedItems);
    });
  }, [updatePositions]);

  // Reassign orphaned students (waiting but no kiosk assignment)
  const reassignOrphanedStudents = useCallback(() => {
    setItems(prev => {
      const orphanedStudents = prev.filter(item => 
        item.status === 'waiting' && !item.assigned_kiosk_id
      );
      
      if (orphanedStudents.length > 0) {
        
        return updatePositions(prev);
      }
      
      return prev;
    });
  }, [updatePositions]);

  // React to kiosk changes
  useEffect(() => {
    const activeKioskIds = kiosks.filter(k => k.isActive).map(k => k.id);
    
    // Find students assigned to deactivated kiosks
    const studentsNeedingReassignment = items.filter(item => 
      'assigned_kiosk_id' in item && 
      item.assigned_kiosk_id && 
      !activeKioskIds.includes(item.assigned_kiosk_id) &&
      item.status === 'waiting'
    );

    // Find orphaned students (waiting but no kiosk assignment)
    const orphanedStudents = items.filter(item => 
      item.status === 'waiting' && !item.assigned_kiosk_id
    );

    if (studentsNeedingReassignment.length > 0 || orphanedStudents.length > 0) {
      setItems(prev => {
        // Remove kiosk assignments for students on deactivated kiosks
        const updatedItems = prev.map(item => 
          studentsNeedingReassignment.some(s => s.id === item.id)
            ? { ...item, assigned_kiosk_id: undefined }
            : item
        );
        
        // Re-apply optimal kiosk assignment (includes orphaned students)
        return updatePositions(updatedItems);
      });
    }
  }, [kiosks, items, updatePositions]);

  // Auto-reassign orphaned students when kiosks become available
  useEffect(() => {
    const activeKiosks = kiosks.filter(k => k.isActive);
    if (activeKiosks.length > 0) {
      reassignOrphanedStudents();
    }
  }, [kiosks, reassignOrphanedStudents]);

  // Clear all queue items (for demo reset)
  const clearQueue = () => {
    setItems([]);
    localStorage.removeItem('bsr_queue');
    toast({
      title: "Queue Cleared",
      description: "All items have been removed from the queue."
    });
  };

  return {
    items,
    loading,
    addToQueue,
    submitReflection,
    approveReflection,
    requestRevision,
    getFirstWaitingStudent,
    getFirstWaitingStudentForKiosk,
    formatTimeElapsed,
    clearQueue,
    reassignOrphanedStudents,
    refreshQueue: () => {}, // No-op for mock system
  };
};