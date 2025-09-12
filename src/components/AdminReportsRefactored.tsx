import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudentSelection from '@/components/StudentSelection';
import StudentProfileView from '@/components/StudentProfileView';
import { useReportingData } from '@/hooks/useReportingData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, RefreshCw } from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/hooks/useStudents';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

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

const AdminReportsRefactored = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [initializingData, setInitializingData] = useState(false);
  const { currentDate, academicYearStart } = useDateContext();
  const { toast } = useToast();
  const {
    overviewMetrics,
    studentProfiles,
    loading,
    autoInitializeData
  } = useReportingData();

  const handleReinitializeData = async () => {
    setInitializingData(true);
    try {
      await autoInitializeData();
      toast({
        title: "Data Reinitialized",
        description: "Reporting data has been refreshed successfully",
      });
    } catch (error) {
      console.error('Error reinitializing data:', error);
      toast({
        title: "Reinitialization Failed",
        description: "Failed to refresh reporting data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setInitializingData(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleStudentDeselect = () => {
    setSelectedStudent(null);
  };

  // Convert Student to StudentProfile format for the profile view
  const getStudentProfileData = (student: Student): StudentProfile | null => {
    if (!student) return null;
    
    const profile = studentProfiles.find(p => p.student_id === student.id);
    return {
      student_id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      current_grade: student.grade || 'Unknown',
      current_incidents: profile?.current_incidents || 0,
      current_reflections: profile?.current_reflections || 0,
      historical_incidents: profile?.historical_incidents || 0,
      historical_grade: profile?.historical_grade,
      gpa: profile?.gpa,
      attendance_rate: profile?.attendance_rate,
    };
  };

  const MetricCard = ({ title, value, description, icon: Icon }: {
    title: string;
    value: number | string;
    description: string;
    icon: React.ElementType;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2">Behavioral Analytics</h1>
          <p className="text-muted-foreground">
            Data from {academicYearStart.toLocaleDateString()} onwards • Current: {currentDate.toLocaleDateString()}
          </p>
        </div>
        <Button 
          onClick={handleReinitializeData}
          disabled={initializingData || loading}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${initializingData ? 'animate-spin' : ''}`} />
          {initializingData ? 'Reinitializing...' : 'Reinitialize Data'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview Dashboard</TabsTrigger>
          <TabsTrigger value="students">Student Profiles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Current Year Incidents"
              value={overviewMetrics?.currentYearIncidents || 0}
              description="Total behavior incidents this year"
              icon={FileText}
            />
            <MetricCard
              title="Reflections Completed"
              value={overviewMetrics?.currentYearReflections || 0}
              description="Student reflections submitted"
              icon={TrendingUp}
            />
            <MetricCard
              title="Middle School Students"
              value={studentProfiles.length}
              description="6th, 7th, and 8th graders"
              icon={Users}
            />
            <MetricCard
              title="Completion Rate"
              value={overviewMetrics?.currentYearIncidents ? 
                `${Math.round((overviewMetrics.currentYearReflections / overviewMetrics.currentYearIncidents) * 100)}%` : '0%'}
              description="Incidents with completed reflections"
              icon={TrendingUp}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Grade Level</CardTitle>
                <CardDescription>Current year incident distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewMetrics?.gradeBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="incidents" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Behavior Type Distribution</CardTitle>
                <CardDescription>Most common incident types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overviewMetrics?.behaviorTypes || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(overviewMetrics?.behaviorTypes || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {/* Show Student Profile View when student is selected */}
          {selectedStudent ? (
            <StudentProfileView 
              student={getStudentProfileData(selectedStudent)!}
              onClearSelection={handleStudentDeselect}
            />
          ) : (
            /* Show Student Selection Component */
            <Card>
              <CardHeader>
                <CardTitle>Student Search & Selection</CardTitle>
                <CardDescription>Search for a student to view their comprehensive profile</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentSelection
                  onStudentSelect={handleStudentSelect}
                  onStudentDeselect={handleStudentDeselect}
                  selectedStudentId={selectedStudent?.id}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReportsRefactored;