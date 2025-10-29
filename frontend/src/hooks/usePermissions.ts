import { useAuthStore } from '@/stores/authStore';
import { EVENT_PERMISSIONS, EVENT_PERMISSION_GROUPS, type EventPermission } from '@/utils/eventPermissions';

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
  canDeleteUsers: boolean;
  checkPermission: (permission: string) => PermissionCheck;
  // Permisos específicos de eventos
  canViewEvents: boolean;
  canCreateEvents: boolean;
  canUpdateEvents: boolean;
  canDeleteEvents: boolean;
  canPublishEvents: boolean;
  canCancelEvents: boolean;
  canDuplicateEvents: boolean;
  canChangeEventStatus: boolean;
  canManageEventMedia: boolean;
  canViewEventReports: boolean;
  canExportEventData: boolean;
  canManageEventAnalytics: boolean;
  canApproveEvents: boolean;
  canArchiveEvents: boolean;
  canManageEventCategories: boolean;
  canManageEventTypes: boolean;
  canConfigureEventNotifications: boolean;
  canManageEventTemplates: boolean;
  checkEventPermission: (permission: EventPermission) => PermissionCheck;
  hasAnyEventPermission: (permissions: EventPermission[]) => boolean;
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

  // Permisos específicos de eventos basados en roles
  const getEventPermissionsForRole = (role: string): readonly EventPermission[] => {
    switch (role) {
      case 'super_admin':
        return EVENT_PERMISSION_GROUPS.SUPER_ADMIN;
      case 'admin':
        return EVENT_PERMISSION_GROUPS.ADMIN;
      case 'manager':
        return EVENT_PERMISSION_GROUPS.ADVANCED_MANAGER;
      case 'operator':
        return EVENT_PERMISSION_GROUPS.BASIC_MANAGER;
      default:
        return [EVENT_PERMISSIONS.VIEW_EVENTS]; // Permisos mínimos para otros roles
    }
  };

  const userEventPermissions = getEventPermissionsForRole(user?.role || '');

  // Permisos específicos de eventos
  const canViewEvents = userEventPermissions.includes(EVENT_PERMISSIONS.VIEW_EVENTS);
  const canCreateEvents = userEventPermissions.includes(EVENT_PERMISSIONS.CREATE_EVENTS);
  const canUpdateEvents = userEventPermissions.includes(EVENT_PERMISSIONS.UPDATE_EVENTS);
  const canDeleteEvents = userEventPermissions.includes(EVENT_PERMISSIONS.DELETE_EVENTS);
  const canPublishEvents = userEventPermissions.includes(EVENT_PERMISSIONS.PUBLISH_EVENTS);
  const canCancelEvents = userEventPermissions.includes(EVENT_PERMISSIONS.CANCEL_EVENTS);
  const canDuplicateEvents = userEventPermissions.includes(EVENT_PERMISSIONS.DUPLICATE_EVENTS);
  const canChangeEventStatus = userEventPermissions.includes(EVENT_PERMISSIONS.CHANGE_EVENT_STATUS);
  const canManageEventMedia = userEventPermissions.includes(EVENT_PERMISSIONS.MANAGE_EVENT_MEDIA);
  const canViewEventReports = userEventPermissions.includes(EVENT_PERMISSIONS.VIEW_EVENT_REPORTS);
  const canExportEventData = userEventPermissions.includes(EVENT_PERMISSIONS.EXPORT_EVENT_DATA);
  const canManageEventAnalytics = userEventPermissions.includes(EVENT_PERMISSIONS.MANAGE_EVENT_ANALYTICS);
  const canApproveEvents = userEventPermissions.includes(EVENT_PERMISSIONS.APPROVE_EVENTS);
  const canArchiveEvents = userEventPermissions.includes(EVENT_PERMISSIONS.ARCHIVE_EVENTS);
  const canManageEventCategories = userEventPermissions.includes(EVENT_PERMISSIONS.MANAGE_EVENT_CATEGORIES);
  const canManageEventTypes = userEventPermissions.includes(EVENT_PERMISSIONS.MANAGE_EVENT_TYPES);
  const canConfigureEventNotifications = userEventPermissions.includes(EVENT_PERMISSIONS.CONFIGURE_EVENT_NOTIFICATIONS);
  const canManageEventTemplates = userEventPermissions.includes(EVENT_PERMISSIONS.MANAGE_EVENT_TEMPLATES);

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

  const checkEventPermission = (permission: EventPermission): PermissionCheck => {
    return {
      hasPermission: userEventPermissions.includes(permission),
      isLoading: false,
      error: null
    };
  };

  const hasAnyEventPermission = (permissions: EventPermission[]): boolean => {
    return permissions.some(permission => userEventPermissions.includes(permission));
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
    canDeleteUsers: isSuperAdmin || checkPermission('delete_users').hasPermission,
    checkPermission,
    // Permisos específicos de eventos
    canViewEvents,
    canCreateEvents,
    canUpdateEvents,
    canDeleteEvents,
    canPublishEvents,
    canCancelEvents,
    canDuplicateEvents,
    canChangeEventStatus,
    canManageEventMedia,
    canViewEventReports,
    canExportEventData,
    canManageEventAnalytics,
    canApproveEvents,
    canArchiveEvents,
    canManageEventCategories,
    canManageEventTypes,
    canConfigureEventNotifications,
    canManageEventTemplates,
    checkEventPermission,
    hasAnyEventPermission
  };
};