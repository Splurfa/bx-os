import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, GraduationCap, Download, Share, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const { isInstallable, installApp, debugInfo, isIOSSafari } = usePWAInstall();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (user) {
    // Route based on user role - admins go to admin dashboard, teachers go to teacher dashboard
    const isAdmin = user.email === 'admin@school.edu';
    navigate(isAdmin ? '/admin-dashboard' : '/teacher');
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      // Route based on user role after successful sign in
      const isAdmin = email === 'admin@school.edu';
      const destination = isAdmin ? '/admin-dashboard' : '/teacher';
      
      navigate(destination);
    }

    setLoading(false);
  };

  const handleInstallApp = async () => {
    const result = await installApp();
    
    if (!result && result !== 'ios-instructions') {
      toast({
        title: "Installation failed",
        description: "Unable to install the app. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-h2 text-gray-900">Behavior Support</h1>
          <p className="text-body-small text-gray-600">Professional behavior management system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Welcome</CardTitle>
            <CardDescription className="text-body-small">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="teacher@school.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            {isInstallable && (
              <div className="mt-4 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleInstallApp}
                >
                  {isIOSSafari ? <Share className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                  {isIOSSafari ? 'Add to Home Screen' : 'Install App'}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  {isIOSSafari 
                    ? 'Use Safari Share button → "Add to Home Screen" to install'
                    : 'Install BSR System on your device for quick access'
                  }
                </p>
              </div>
            )}

            {/* Debug Information - Remove after testing */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <strong>PWA Debug Info:</strong>
                <div>Installable: {isInstallable.toString()}</div>
                <div>iOS Safari: {debugInfo.isIOSSafari.toString()}</div>
                <div>Standalone: {debugInfo.isStandalone.toString()}</div>
                <div>Prompt Event: {debugInfo.promptEventFired.toString()}</div>
                <div>Supports Prompt: {debugInfo.supportsInstallPrompt.toString()}</div>
                <div className="mt-1 text-xs text-gray-600 break-all">
                  UA: {debugInfo.userAgent.substring(0, 50)}...
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>teacher@school.edu</strong> / password123 (Teacher Dashboard)</div>
                <div><strong>admin@school.edu</strong> / password123 (Admin Control Panel)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;