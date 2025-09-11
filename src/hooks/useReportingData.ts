import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';

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
  const { toast } = useToast();
  const { academicYearStart, initializeData, isInitialized } = useDateContext();

  const autoInitializeData = async () => {
    setLoading(true);
    try {
      // Step 1: Import historical CSV data (2024-2025)
      try {
        const { data: csvImportData, error: csvError } = await supabase.functions.invoke('import-historical-csv');
        if (csvError) {
          console.error('Error importing historical CSV:', csvError);
          toast({
            title: "Historical Import Warning",
            description: "Historical CSV import failed. Continuing with other initialization steps.",
            variant: "destructive",
          });
        } else {
          console.log('Historical CSV import completed:', csvImportData);
          toast({
            title: "Historical Data Imported",
            description: `Imported ${csvImportData?.stats?.insertedIncidents || 0} historical incidents`,
          });
        }
      } catch (importError) {
        console.error('Historical CSV import failed:', importError);
        toast({
          title: "Historical Import Failed",
          description: "Could not import historical data. Check if CSV file exists.",
          variant: "destructive",
        });
      }

      // Step 2: Seed academic records for current students
      const { data: academicResult, error: academicError } = await supabase
        .rpc('seed_academic_records');
      
      if (academicError) {
        console.error('Error seeding academic records:', academicError);
      } else {
        console.log('Academic records seeded:', academicResult);
      }

      // Step 3: Generate current year test data (2025-2026)
      const { data: currentYearData, error: currentYearError } = await supabase.rpc('seed_current_year_behavior_data');
      if (currentYearError) {
        console.error('Error generating current year data:', currentYearError);
      } else {
        console.log('Current year behavior data generated:', currentYearData);
        toast({
          title: "Test Data Generated",
          description: `Generated ${currentYearData || 0} current year incidents`,
        });
      }

      // Step 4: Match students to historical data
      const { data: matchResult, error: matchError } = await supabase
        .rpc('match_students_to_historical_data');

      if (matchError) {
        console.error('Error matching students to historical data:', matchError);
      } else {
        console.log('Students matched to historical data:', matchResult);
      }

      await initializeData();
      toast({
        title: "Data Initialization Complete",
        description: "All reporting data has been initialized successfully",
      });

      // Step 5: Refresh the reporting data
      await fetchOverviewMetrics();
      await fetchStudentProfiles();

    } catch (error) {
      console.error('Error during initialization:', error);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize reporting data. Please check console for details.",
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
        .gte('created_at', '2025-08-25'); // 2025-2026 school year start

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
    
    // Auto-initialize data on first admin access
    if (!isInitialized) {
      autoInitializeData();
    }
  }, [isInitialized]);

  return {
    overviewMetrics,
    studentProfiles,
    loading,
    autoInitializeData,
    fetchOverviewMetrics,
    fetchStudentProfiles,
    searchStudents
  };
};