import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportingData } from '@/hooks/useReportingData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, TrendingUp, Users, FileText, Calendar, User } from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { debounce } from 'lodash';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { currentDate, academicYearStart } = useDateContext();
  const {
    overviewMetrics,
    studentProfiles,
    loading,
    searchStudents
  } = useReportingData();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim().length >= 2) {
        setIsSearching(true);
        await searchStudents(term);
        setIsSearching(false);
      }
    }, 300),
    [searchStudents]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedStudent(null);
    debouncedSearch(value);
  };

  const handleStudentSelect = (student: StudentProfile) => {
    setSelectedStudent(student);
    setSearchTerm(`${student.first_name} ${student.last_name}`);
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setSearchTerm('');
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

  const StudentCard = ({ student, isSelected, onClick }: {
    student: StudentProfile;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">{student.first_name} {student.last_name}</div>
          <Badge variant="outline">{student.current_grade} Grade</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {student.current_incidents} current incidents • {student.historical_incidents} historical
        </div>
      </CardContent>
    </Card>
  );

  const DetailedStudentProfile = ({ student }: { student: StudentProfile }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {student.first_name} {student.last_name}
            </CardTitle>
            <CardDescription>{student.current_grade} Grade Student Profile</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-medium">Current Year</p>
            <p className="text-2xl font-bold">{student.current_incidents}</p>
            <p className="text-xs text-muted-foreground">Incidents</p>
          </div>
          <div>
            <p className="text-sm font-medium">Historical</p>
            <p className="text-2xl font-bold">{student.historical_incidents}</p>
            <p className="text-xs text-muted-foreground">
              {student.historical_grade ? `${student.historical_grade} Grade` : 'No data'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">GPA</p>
            <p className="text-2xl font-bold">
              {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Academic Performance</p>
          </div>
          <div>
            <p className="text-sm font-medium">Attendance</p>
            <p className="text-2xl font-bold">
              {student.attendance_rate ? `${student.attendance_rate.toFixed(0)}%` : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </div>
        </div>
        
        {student.current_incidents > 0 && student.historical_incidents > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Year-over-Year Trend:</strong>{' '}
              {student.current_incidents > student.historical_incidents ? (
                <span className="text-destructive">Increase</span>
              ) : student.current_incidents < student.historical_incidents ? (
                <span className="text-green-600">Decrease</span>
              ) : (
                <span className="text-muted-foreground">No Change</span>
              )}{' '}
              ({student.current_incidents - student.historical_incidents > 0 ? '+' : ''}
              {student.current_incidents - student.historical_incidents} incidents)
            </p>
          </div>
        )}
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
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Student Search</CardTitle>
              <CardDescription>Search and select a student to view detailed profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type student name (minimum 2 characters)..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Student Details */}
          {selectedStudent && (
            <DetailedStudentProfile student={selectedStudent} />
          )}

          {/* Search Results */}
          {searchTerm.length >= 2 && !selectedStudent && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>Click on a student to view detailed profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {studentProfiles.map((student) => (
                    <StudentCard
                      key={student.student_id}
                      student={student}
                      isSelected={false}
                      onClick={() => handleStudentSelect(student)}
                    />
                  ))}
                  {studentProfiles.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">No students found</p>
                      <p className="text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {searchTerm.length < 2 && !selectedStudent && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Start typing to search</p>
                <p className="text-muted-foreground">Enter at least 2 characters to find students</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReportsRefactored;