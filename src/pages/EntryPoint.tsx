import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Tablet, RefreshCw, Settings, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CSVImportTest } from "@/components/CSVImportTest";

const EntryPoint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [demoMode, setDemoMode] = useState(true);

  const handleResetDemoData = () => {
    // Clear any localStorage or demo data
    localStorage.clear();
    toast({
      title: "Demo Data Reset",
      description: "All demo data has been cleared successfully.",
    });
  };

  const handleTeacherAccess = () => {
    // Route based on user role
    if (user?.email === 'admin@school.edu') {
      navigate("/admin-dashboard");
    } else {
      navigate("/teacher-dashboard");
    }
  };

  const handleKioskAccess = () => {
    navigate("/kiosk1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Behavior Support Application
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Digital behavior support queue management for middle school classrooms
          </p>
        </div>

        {/* Demo Mode Toggle */}
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Demo Settings</CardTitle>
              </div>
              <Badge variant={demoMode ? "default" : "secondary"}>
                {demoMode ? "Demo Mode" : "Live Mode"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="demo-mode" className="text-sm font-medium">
                Enable Demo Mode (pre-filled data for testing)
              </Label>
              <Switch
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={setDemoMode}
              />
            </div>
            <Separator />
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemoData}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset All Demo Data
            </Button>
          </CardContent>
        </Card>

        {/* CSV Import Test - Development Only */}
        {import.meta.env.DEV && (
          <Card className="border-2 border-dashed border-orange-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm text-orange-600">Development: CSV Import</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CSVImportTest />
            </CardContent>
          </Card>
        )}

        {/* Main Navigation */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Teacher Dashboard Card */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Teacher Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Create behavior reports, manage the student queue, and review reflections
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>• Create BSR reports</span>
                  <span>✓ Available</span>
                </div>
                <div className="flex justify-between">
                  <span>• Live queue management</span>
                  <span>✓ Available</span>
                </div>
                <div className="flex justify-between">
                  <span>• Review reflections</span>
                  <span>✓ Available</span>
                </div>
                <div className="flex justify-between">
                  <span>• Mobile optimized</span>
                  <span>✓ Available</span>
                </div>
              </div>
              {user ? (
                <Button 
                  onClick={handleTeacherAccess}
                  className="w-full group-hover:scale-105 transition-transform"
                >
                  Access Teacher Dashboard
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  className="w-full group-hover:scale-105 transition-transform"
                >
                  Sign In for Teacher Access
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Student Kiosk Card */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors w-fit">
                <Tablet className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Student Kiosk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                FIFO queue system where only position #1 can complete reflection
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>• Queue position tracking</span>
                  <span>✓ Available</span>
                </div>
                <div className="flex justify-between">
                  <span>• 4-question reflection</span>
                  <span>✓ Available</span>
                </div>
                <div className="flex justify-between">
                  <span>• Live timer display</span>
                  <span>✓ Available</span>
                </div>
                <div className="flex justify-between">
                  <span>• Tablet optimized</span>
                  <span>✓ Available</span>
                </div>
              </div>
              {user ? (
                <Button 
                  onClick={handleKioskAccess}
                  className="w-full group-hover:scale-105 transition-transform"
                  variant="secondary"
                >
                  Access Student Kiosk
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate("/auth")}
                  className="w-full group-hover:scale-105 transition-transform"
                  variant="secondary"
                >
                  Sign In for Kiosk Access
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Demo Account Info */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Demo Accounts for Testing</h3>
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-background rounded border">
                  <p className="font-medium text-foreground mb-1">👩‍🏫 Teacher Account</p>
                  <p className="text-muted-foreground">sarah.johnson@school.edu</p>
                  <p className="text-muted-foreground">password123</p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <p className="font-medium text-foreground mb-1">👩‍💼 Admin Account</p>
                  <p className="text-muted-foreground">admin@school.edu</p>
                  <p className="text-muted-foreground">password123</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Use admin account to test student kiosk • Teacher account for queue management
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            {demoMode ? "Demo Mode: Sample data will be used for testing" : "Live Mode: Real data will be used"}
          </p>
          <p className="text-xs text-muted-foreground">
            Built with React • Vite • Tailwind CSS • TypeScript
          </p>
        </div>
      </div>
    </div>
  );
};

export default EntryPoint;