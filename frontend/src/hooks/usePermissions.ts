import { useAuthStore } from '@/stores/authStore';

interface PermissionCheck {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePermissionsReturn {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isOperator: boolean;
  isSpeaker: boolean;
  isParticipant: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canManageEvents: boolean;
  canManageFinance: boolean;
  canViewAuditLogs: boolean;
  canManageSystem: boolean;
  checkPermission: (permission: string) => PermissionCheck;
}

/**
 * Hook personalizado para manejo de permisos basado en roles
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuthStore();

  // Verificaciones básicas de roles
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isManager = user?.role === 'manager' || isAdmin;
  const isOperator = user?.role === 'operator' || isManager;
  const isSpeaker = user?.role === 'speaker';
  const isParticipant = user?.role === 'participant';

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(user?.role || '');
  };

  // Permisos específicos para funcionalidades
  const canAccessAdminPanel = isSuperAdmin || isAdmin;
  const canManageUsers = isSuperAdmin || isAdmin;
  const canManageEvents = isSuperAdmin || isAdmin || isManager;
  const canManageFinance = isSuperAdmin || isAdmin;
  const canViewAuditLogs = isSuperAdmin || isAdmin;
  const canManageSystem = isSuperAdmin;

  const checkPermission = (permission: string): PermissionCheck => {
    const permissions: { [key: string]: boolean } = {
      'access_admin_panel': canAccessAdminPanel,
      'manage_users': canManageUsers,
      'manage_events': canManageEvents,
      'manage_finance': canManageFinance,
      'view_audit_logs': canViewAuditLogs,
      'manage_system': canManageSystem,
      'create_users': canManageUsers,
      'delete_users': isSuperAdmin,
      'update_users': canManageUsers,
      'view_users': canManageUsers,
      'create_events': canManageEvents,
      'update_events': canManageEvents,
      'delete_events': isSuperAdmin || isAdmin,
      'view_events': true, // Todos pueden ver eventos públicos
      'manage_financial_reports': canManageFinance,
      'export_data': canManageUsers || canManageEvents,
      'system_backup': isSuperAdmin,
      'system_config': isSuperAdmin,
    };

    return {
      hasPermission: permissions[permission] || false,
      isLoading: false,
      error: null
    };
  };

  return {
    isSuperAdmin,
    isAdmin,
    isManager,
    isOperator,
    isSpeaker,
    isParticipant,
    hasRole,
    hasAnyRole,
    canAccessAdminPanel,
    canManageUsers,
    canManageEvents,
    canManageFinance,
    canViewAuditLogs,
    canManageSystem,
    checkPermission
  };
};