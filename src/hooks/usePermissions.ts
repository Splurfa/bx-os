import { useProfile } from './useProfile';
import { hasRole, canPerformAction } from '@/lib/permissions';

export const usePermissions = () => {
  const { profile } = useProfile();

  const checkRole = (role: 'teacher' | 'admin' | 'super_admin') => {
    return hasRole(profile?.role, role);
  };

  const checkAction = (action: string) => {
    return canPerformAction(profile?.role, action);
  };

  return {
    role: profile?.role,
    hasRole: checkRole,
    canPerformAction: checkAction,
    // Convenience methods for common checks
    isTeacher: profile?.role === 'teacher',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
    isSuperAdmin: profile?.role === 'super_admin',
    canViewUserProfiles: canPerformAction(profile?.role, 'view_user_profiles'),
    canCreateUsers: canPerformAction(profile?.role, 'create_users'),
    canChangeUserRoles: canPerformAction(profile?.role, 'change_user_roles'),
    canDeleteUsers: canPerformAction(profile?.role, 'delete_users'),
    canViewAllQueues: canPerformAction(profile?.role, 'view_all_queues'),
    canClearAllQueues: canPerformAction(profile?.role, 'clear_all_queues'),
  };
};