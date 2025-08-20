import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const { isInstallable, installApp, debugInfo, isIOSSafari } = usePWAInstall();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routingUser, setRoutingUser] = useState(false);

  // Prevent unwanted navigation after authentication - only route initially
  useEffect(() => {
    const routeUser = async () => {
      if (!user || routingUser) return;
      
      // Only route if we're actually on the auth page (prevents navigation from other pages)
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
        console.log('🛑 Skipping navigation - user not on auth page:', window.location.pathname);
        return;
      }
      
      setRoutingUser(true);
      console.log('🔄 Routing user:', user.email, 'ID:', user.id);
      
      // Retry logic for role fetching with exponential backoff
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`📡 Attempt ${retryCount + 1}: Fetching profile for user ${user.id}`);
          
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('❌ Profile query error:', profileError);
            throw profileError;
          }
          
          if (!data) {
            console.warn('⚠️ No profile found, waiting for trigger to create it...');
            // Wait a bit for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            retryCount++;
            continue;
          }
          
          const role = data.role || 'teacher';
          console.log('✅ User profile found:', { role, name: data.full_name });
          
          // Route based on role - super_admin and admin go to admin dashboard
          if (role === 'super_admin' || role === 'admin') {
            console.log('🚀 Routing to admin dashboard');
            navigate('/admin-dashboard', { replace: true });
          } else {
            console.log('🚀 Routing to teacher dashboard');
            navigate('/teacher', { replace: true });
          }
          
          setRoutingUser(false);
          return;
          
        } catch (e) {
          console.error(`❌ Routing attempt ${retryCount + 1} failed:`, e);
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Exponential backoff: wait 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
          }
        }
      }
      
      // All retries failed - fallback to teacher with warning
      console.warn('⚠️ All routing attempts failed, defaulting to teacher dashboard');
      navigate('/teacher', { replace: true });
      setRoutingUser(false);
    };
    
    routeUser();
  }, [user, navigate, routingUser]);

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
      try {
        const { data: { user: signedInUser } } = await supabase.auth.getUser();
        if (signedInUser) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', signedInUser.id)
            .single();
          const role = data?.role || 'teacher';
          // Route based on role - super_admin and admin go to admin dashboard
          if (role === 'super_admin' || role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/teacher', { replace: true });
          }
        } else {
          navigate('/teacher', { replace: true });
        }
      } catch {
        navigate('/teacher', { replace: true });
      }
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

            <div className="mt-4 pt-4 border-t">
              <GoogleAuthButton />
            </div>

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

            <div className="mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>teacher@school.edu</strong> / password123 (Teacher Dashboard)</div>
                  <div><strong>admin@school.edu</strong> / password123 (Admin Control Panel)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;