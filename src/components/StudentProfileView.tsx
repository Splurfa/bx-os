import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, GraduationCap, Target } from 'lucide-react';

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

interface StudentProfileViewProps {
  student: StudentProfile;
  onClearSelection: () => void;
}

const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student, onClearSelection }) => {
  // Generate mock trend data for visualization
  const trendData = [
    { month: 'Aug', incidents: Math.floor(student.historical_incidents * 0.1) || 0 },
    { month: 'Sep', incidents: Math.floor(student.historical_incidents * 0.15) || 0 },
    { month: 'Oct', incidents: Math.floor(student.historical_incidents * 0.2) || 0 },
    { month: 'Nov', incidents: Math.floor(student.historical_incidents * 0.25) || 0 },
    { month: 'Dec', incidents: Math.floor(student.historical_incidents * 0.3) || 0 },
    { month: 'Jan', incidents: Math.floor(student.current_incidents * 0.4) || 0 },
    { month: 'Feb', incidents: Math.floor(student.current_incidents * 0.6) || 0 },
    { month: 'Mar', incidents: Math.floor(student.current_incidents * 0.8) || 0 },
    { month: 'Apr', incidents: student.current_incidents || 0 },
  ];

  const comparisonData = [
    { category: 'Current Year', incidents: student.current_incidents },
    { category: 'Historical', incidents: student.historical_incidents },
  ];

  const yearOverYearChange = student.current_incidents - student.historical_incidents;
  const percentChange = student.historical_incidents > 0 
    ? ((yearOverYearChange / student.historical_incidents) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {student.first_name} {student.last_name}
              </CardTitle>
              <CardDescription className="text-lg">
                <Badge variant="outline" className="mr-2">{student.current_grade} Grade</Badge>
                Comprehensive Student Profile
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClearSelection}>
              Back to Search
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Year</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.current_incidents}</div>
            <p className="text-xs text-muted-foreground">Behavior incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Historical Baseline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.historical_incidents}</div>
            <p className="text-xs text-muted-foreground">
              {student.historical_grade ? `${student.historical_grade} Grade` : 'Previous year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">GPA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year-over-Year</CardTitle>
            {yearOverYearChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : yearOverYearChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <Target className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              yearOverYearChange > 0 ? 'text-destructive' : 
              yearOverYearChange < 0 ? 'text-green-600' : 
              'text-muted-foreground'
            }`}>
              {yearOverYearChange > 0 ? '+' : ''}{yearOverYearChange}
            </div>
            <p className="text-xs text-muted-foreground">
              {percentChange}% change
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Incident Trend</CardTitle>
            <CardDescription>Behavioral incidents over the academic year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Year Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Year-over-Year Comparison</CardTitle>
            <CardDescription>Current year vs. historical performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="incidents" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Analysis</CardTitle>
          <CardDescription>Key insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Performance Summary</h4>
              <p className="text-sm text-muted-foreground">
                {student.current_incidents === 0 ? (
                  "Excellent behavior - no incidents this year."
                ) : student.current_incidents < student.historical_incidents ? (
                  "Improved behavior compared to historical baseline."
                ) : student.current_incidents > student.historical_incidents ? (
                  "Increased incidents compared to historical baseline. Consider intervention strategies."
                ) : (
                  "Consistent with historical behavior patterns."
                )}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Academic Correlation</h4>
              <p className="text-sm text-muted-foreground">
                {student.gpa && student.attendance_rate ? (
                  `GPA: ${student.gpa.toFixed(2)}, Attendance: ${student.attendance_rate.toFixed(0)}% - 
                  ${student.gpa >= 3.0 && student.attendance_rate >= 90 ? 
                    'Strong academic performance may correlate with positive behavior.' :
                    'Academic support may help improve overall performance.'}`
                ) : (
                  "Academic data not available for correlation analysis."
                )}
              </p>
            </div>
          </div>
          
          {student.current_incidents > student.historical_incidents && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Intervention Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Consider one-on-one behavioral support</li>
                <li>• Review recent incidents for pattern identification</li>
                <li>• Coordinate with academic support teams</li>
                <li>• Schedule follow-up assessment in 30 days</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfileView;