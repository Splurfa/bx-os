import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MiddleSchoolStudent {
  id: string;
  name?: string;
  first_name: string;
  last_name: string;
  grade: string | null;
  class_name: string | null;
  family_id: string;
  created_at: string;
  updated_at: string;
}

export type { MiddleSchoolStudent };

/**
 * Hook specifically for middle school students (6th, 7th, 8th grade)
 * Used by kiosk components for student selection
 */
export const useMiddleSchoolStudents = () => {
  const [students, setStudents] = useState<MiddleSchoolStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMiddleSchoolStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .in('grade', ['6th', '7th', '8th'])
        .order('first_name, last_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching middle school students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiddleSchoolStudents();

    // Set up real-time subscription
    const channel = supabase
      .channel('middle_school_students_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students'
        },
        () => {
          fetchMiddleSchoolStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
    students, 
    loading, 
    refetch: fetchMiddleSchoolStudents,
    count: students.length 
  };
};