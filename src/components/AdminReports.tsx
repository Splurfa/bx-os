import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReportingData } from '@/hooks/useReportingData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Database, TrendingUp, Users, FileText } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AdminReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    overviewMetrics,
    studentProfiles,
    loading,
    isSeeded,
    seedReportingData,
    searchStudents
  } = useReportingData();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchStudents(searchTerm);
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Reports</h1>
          <p className="text-muted-foreground">Behavioral incident analytics and student outcomes</p>
        </div>
        {!isSeeded && (
          <Button onClick={seedReportingData} disabled={loading}>
            <Database className="mr-2 h-4 w-4" />
            {loading ? 'Seeding Data...' : 'Seed Test Data'}
          </Button>
        )}
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
              <CardDescription>Find specific student profiles and incident history</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </CardContent>
          </Card>

          {/* Student Profiles */}
          <div className="grid gap-4">
            {studentProfiles.map((student) => (
              <Card key={student.student_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {student.first_name} {student.last_name}
                    </CardTitle>
                    <Badge variant="outline">{student.current_grade} Grade</Badge>
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
            ))}
          </div>

          {studentProfiles.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No students found</p>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;