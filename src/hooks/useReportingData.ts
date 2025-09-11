import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OverviewMetrics {
  currentYearIncidents: number;
  currentYearReflections: number;
  gradeBreakdown: { grade: string; incidents: number; students: number }[];
  monthlyTrends: { month: string; incidents: number; reflections: number }[];
  behaviorTypes: { type: string; count: number }[];
  subjectContext: { subject: string; count: number }[];
}

interface StudentProfile {
  student_id: string;
  first_name: string;
  last_name: string;
  current_grade: string;
  current_incidents: number;
  current_reflections: number;
  historical_incidents: number;
  historical_grade?: string;
  gpa?: number;
  attendance_rate?: number;
}

export const useReportingData = () => {
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const { toast } = useToast();

  const seedReportingData = async () => {
    setLoading(true);
    try {
      // Seed academic records
      const { data: academicResult, error: academicError } = await supabase
        .rpc('seed_academic_records');
      
      if (academicError) throw academicError;

      // Generate sample historical incidents
      const { data: historicalResult, error: historicalError } = await supabase
        .from('historical_incidents')
        .insert([
          // Sample historical data for demonstration
          {
            student_name: 'Asher Abramson',
            grade_at_time: '6th',
            incident_date: '2024-03-15',
            behavior_type: 'Disruptive Behavior',
            subject_context: 'Math',
            reflection_completed: true,
            data_quality_score: 1.0
          },
          {
            student_name: 'Ella Amona',
            grade_at_time: '6th',
            incident_date: '2024-02-10',
            behavior_type: 'Off-Task Behavior',
            subject_context: 'English',
            reflection_completed: false,
            data_quality_score: 0.9
          },
          {
            student_name: 'Ellia Alyesh',
            grade_at_time: '7th',
            incident_date: '2024-01-20',
            behavior_type: 'Inappropriate Language',
            subject_context: 'Science',
            reflection_completed: true,
            data_quality_score: 1.0
          }
        ]);

      if (historicalError) throw historicalError;

      // Match students to historical data
      const { data: matchResult, error: matchError } = await supabase
        .rpc('match_students_to_historical_data');

      if (matchError) throw matchError;

      setIsSeeded(true);
      toast({
        title: "Data Seeded Successfully",
        description: `Academic records: ${academicResult}, Historical matches: ${matchResult}`,
      });

      // Refresh data
      await fetchOverviewMetrics();
      await fetchStudentProfiles();

    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to seed reporting data. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewMetrics = async () => {
    try {
      // Current year incidents and reflections
      const { data: currentData, error: currentError } = await supabase
        .from('behavior_requests')
        .select(`
          id,
          created_at,
          behavior_type,
          student_id,
          students!inner(grade),
          reflections(id)
        `)
        .gte('created_at', '2024-09-01');

      if (currentError) throw currentError;

      // Grade breakdown
      const gradeBreakdown = await supabase
        .from('students')
        .select('grade')
        .in('grade', ['6th', '7th', '8th']);

      const gradeStats = gradeBreakdown.data?.reduce((acc, student) => {
        const grade = student.grade;
        if (!acc[grade]) acc[grade] = { students: 0, incidents: 0 };
        acc[grade].students++;
        return acc;
      }, {} as Record<string, { students: number; incidents: number }>);

      // Add incident counts to grade stats
      currentData?.forEach(incident => {
        const grade = incident.students.grade;
        if (gradeStats?.[grade]) {
          gradeStats[grade].incidents++;
        }
      });

      // Behavior type distribution
      const behaviorTypes = currentData?.reduce((acc, incident) => {
        const type = incident.behavior_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setOverviewMetrics({
        currentYearIncidents: currentData?.length || 0,
        currentYearReflections: currentData?.filter(d => d.reflections.length > 0).length || 0,
        gradeBreakdown: Object.entries(gradeStats || {}).map(([grade, stats]) => ({
          grade,
          incidents: stats.incidents,
          students: stats.students
        })),
        monthlyTrends: [], // Would need more complex aggregation
        behaviorTypes: Object.entries(behaviorTypes || {}).map(([type, count]) => ({
          type,
          count
        })),
        subjectContext: [] // Would come from antecedent context data
      });

    } catch (error) {
      console.error('Error fetching overview metrics:', error);
    }
  };

  const fetchStudentProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profile_complete')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;

      setStudentProfiles(data || []);
    } catch (error) {
      console.error('Error fetching student profiles:', error);
    }
  };

  const searchStudents = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchStudentProfiles();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('student_profile_complete')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true });

      if (error) throw error;

      setStudentProfiles(data || []);
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  useEffect(() => {
    fetchOverviewMetrics();
    fetchStudentProfiles();
  }, []);

  return {
    overviewMetrics,
    studentProfiles,
    loading,
    isSeeded,
    seedReportingData,
    fetchOverviewMetrics,
    fetchStudentProfiles,
    searchStudents
  };
};