
import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/hooks/useStudents";

interface StudentSelectionProps {
  onStudentSelect: (student: Student) => void;
  onStudentDeselect?: () => void;
  selectedStudentId?: string;
  onRefresh?: React.MutableRefObject<(() => void) | null>;
}

const StudentSelection = ({ onStudentSelect, onStudentDeselect, selectedStudentId, onRefresh }: StudentSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [queuedStudentIds, setQueuedStudentIds] = useState<string[]>([]);
  const { students, loading } = useStudents();

  // Fetch students who already have active/waiting behavior requests
  useEffect(() => {
    const fetchQueuedStudents = async () => {
      try {
        // Strengthen the query with retry logic and better error handling
        // Exclude ALL non-completed students from selection (waiting, active, review)
        const { data, error } = await supabase
          .from('behavior_requests')
          .select('student_id')
          .neq('status', 'completed')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching queued students:', error);
          return;
        }
        
        if (data) {
          setQueuedStudentIds(data.map(req => req.student_id));
        }
      } catch (error) {
        console.error('Failed to fetch queued students:', error);
      }
    };

    fetchQueuedStudents();

    // Set up real-time subscription for behavior requests to update excluded students
    const channel = supabase
      .channel('behavior_requests_student_selection')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'behavior_requests'
        },
        (payload) => {
          // Optimistic update: immediately add the new student ID to excluded list
          if (payload.new && payload.new.student_id) {
            setQueuedStudentIds(prev => {
              if (!prev.includes(payload.new.student_id)) {
                return [...prev, payload.new.student_id];
              }
              return prev;
            });
          }
          // Also fetch latest data to ensure consistency
          setTimeout(fetchQueuedStudents, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'behavior_requests'
        },
        () => {
          fetchQueuedStudents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'behavior_requests'
        },
        () => {
          fetchQueuedStudents();
        }
      )
      .subscribe();

    // Expose refresh function to parent component
    if (onRefresh) {
      onRefresh.current = fetchQueuedStudents;
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRefresh]);

  const filteredStudents = students.filter(student => {
    // Only show students if there's a search term (at least 1 character)
    if (searchTerm.length === 0) return false;
    
    // Filter out students who already have active behavior requests
    if (queuedStudentIds.includes(student.id)) return false;
    
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
           student.first_name?.toLowerCase().includes(searchLower) ||
           student.last_name?.toLowerCase().includes(searchLower) ||
           student.grade?.toLowerCase().includes(searchLower) ||
           student.class_name?.toLowerCase().includes(searchLower);
  });

  const handleStudentClick = (student: Student) => {
    if (selectedStudentId === student.id) {
      // Deselect if clicking the already selected student
      onStudentDeselect?.();
    } else {
      // Select the student
      onStudentSelect(student);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search and filter */}
      <div className="p-4 border-b border-border bg-background">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      
      {/* Student List - Fixed height, no scrolling */}
      <div className="flex-1 bg-background max-h-60 overflow-hidden">
        {searchTerm.length === 0 && !selectedStudentId ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            <p className="text-xs">Start typing to search...</p>
          </div>
        ) : selectedStudentId ? (
          // Show only selected student
          filteredStudents
            .filter(student => student.id === selectedStudentId)
            .map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student)}
                className="flex items-center justify-between p-4 border-b border-border cursor-pointer transition-colors bg-primary/10"
              >
                 <div>
                   <h4 className="font-medium text-foreground text-sm">{student.first_name} {student.last_name}</h4>
                   <p className="text-sm text-muted-foreground">{student.grade} grade</p>
                 </div>
                <div className="w-4 h-4 rounded-full border-2 bg-primary border-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              </div>
            ))
        ) : (
          // Show max 5 filtered students
          filteredStudents.slice(0, 5).map((student) => (
            <div
              key={student.id}
              onClick={() => handleStudentClick(student)}
              className="flex items-center justify-between p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50"
            >
               <div>
                 <h4 className="font-medium text-foreground text-sm">{student.first_name} {student.last_name}</h4>
                 <p className="text-sm text-muted-foreground">{student.grade} grade</p>
               </div>
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentSelection;
