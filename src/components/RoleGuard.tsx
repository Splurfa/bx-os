import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  requiredRoles: ('teacher' | 'admin' | 'super_admin')[];
  children: React.ReactNode;
  redirectPath?: string;
}

const RoleGuard = ({ requiredRoles, children, redirectPath }: RoleGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (loading || !user) return;

    // If no profile or role doesn't match requirements
    if (!profile || !requiredRoles.includes(profile.role as any)) {
      console.warn(`🚫 Role guard blocking access: user role "${profile?.role}" not in required roles:`, requiredRoles);
      
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        // Smart redirect based on actual role
        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (profile?.role === 'teacher') {
          navigate('/teacher', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      }
    }
  }, [loading, user, profile, requiredRoles, redirectPath, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by parent routes
  }

  if (!profile || !requiredRoles.includes(profile.role as any)) {
    return null; // Will be redirected by useEffect
  }

  return <>{children}</>;
};

export default RoleGuard;