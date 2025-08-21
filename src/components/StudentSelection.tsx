
import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/hooks/useStudents";

interface StudentSelectionProps {
  onStudentSelect: (student: Student) => void;
  onStudentDeselect?: () => void;
  selectedStudentId?: string;
}

const StudentSelection = ({ onStudentSelect, onStudentDeselect, selectedStudentId }: StudentSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [queuedStudentIds, setQueuedStudentIds] = useState<string[]>([]);
  const { students, loading } = useStudents();

  // Fetch students who already have active/waiting behavior requests
  useEffect(() => {
    const fetchQueuedStudents = async () => {
      const { data } = await supabase
        .from('behavior_requests')
        .select('student_id')
        .in('status', ['waiting', 'active']);
      
      if (data) {
        setQueuedStudentIds(data.map(req => req.student_id));
      }
    };

    fetchQueuedStudents();

    // Set up real-time subscription for behavior requests to update excluded students
    const channel = supabase
      .channel('behavior_requests_student_selection')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'behavior_requests'
        },
        () => {
          fetchQueuedStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type student name to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>
      
      {/* Student List */}
      <div className="flex-1 overflow-y-auto bg-background">
        {searchTerm.length === 0 && !selectedStudentId ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Start typing to search for students...</p>
          </div>
        ) : selectedStudentId ? (
          // Show only selected student
          filteredStudents
            .filter(student => student.id === selectedStudentId)
            .map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student)}
                className="flex items-center justify-between p-3 border-b border-border cursor-pointer transition-colors bg-primary/10"
              >
                <div>
                  <h4 className="font-medium text-foreground text-sm">{student.first_name} {student.last_name}</h4>
                  <p className="text-xs text-muted-foreground">{student.grade} Grade • Class {student.class_name}</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 bg-primary border-primary flex items-center justify-center transition-all">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              </div>
            ))
        ) : (
          // Show all filtered students
          filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => handleStudentClick(student)}
              className="flex items-center justify-between p-3 border-b border-border cursor-pointer transition-colors hover:bg-muted/50"
            >
              <div>
                <h4 className="font-medium text-foreground text-sm">{student.first_name} {student.last_name}</h4>
                <p className="text-xs text-muted-foreground">{student.grade} Grade • Class {student.class_name}</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center transition-all">
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentSelection;
