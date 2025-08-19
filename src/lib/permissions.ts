export type UserRole = 'teacher' | 'admin' | 'super_admin';

// Role hierarchy: super_admin > admin > teacher
const ROLE_HIERARCHY: Record<UserRole, number> = {
  teacher: 1,
  admin: 2,
  super_admin: 3,
};

// Permission definitions
const PERMISSIONS: Record<string, UserRole[]> = {
  // User management
  'view_user_profiles': ['admin', 'super_admin'],
  'create_users': ['super_admin'],
  'change_user_roles': ['super_admin'],
  'delete_users': ['super_admin'],
  
  // Queue management
  'view_all_queues': ['admin', 'super_admin'],
  'clear_all_queues': ['admin', 'super_admin'],
  'assign_students': ['teacher', 'admin', 'super_admin'],
  
  // Behavior management
  'create_behavior_requests': ['teacher', 'admin', 'super_admin'],
  'approve_reflections': ['teacher', 'admin', 'super_admin'],
  'view_own_students': ['teacher', 'admin', 'super_admin'],
  
  // Kiosk management
  'manage_kiosks': ['admin', 'super_admin'],
  'create_device_sessions': ['admin', 'super_admin'],
  'view_kiosk_analytics': ['admin', 'super_admin'],
  
  // System administration
  'view_system_logs': ['super_admin'],
  'manage_settings': ['super_admin'],
  'export_data': ['admin', 'super_admin'],
};

export const hasRole = (
  userRole: UserRole | undefined, 
  requiredRole: UserRole
): boolean => {
  if (!userRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  
  return userLevel >= requiredLevel;
};

export const canPerformAction = (
  userRole: UserRole | undefined, 
  action: string
): boolean => {
  if (!userRole) return false;
  
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'teacher':
      return 'Teacher';
    case 'admin':
      return 'Administrator';
    case 'super_admin':
      return 'Super Admin';
    default:
      return 'Unknown';
  }
};

export const getRolePermissions = (role: UserRole): string[] => {
  return Object.keys(PERMISSIONS).filter(action => 
    canPerformAction(role, action)
  );
};