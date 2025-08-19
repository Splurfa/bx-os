import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface RoleBasedRedirectProps {
  children?: React.ReactNode;
}

const RoleBasedRedirect = ({ children }: RoleBasedRedirectProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else if (profile?.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }

  // Fallback to auth if role is unknown
  return <Navigate to="/auth" replace />;
};

export default RoleBasedRedirect;