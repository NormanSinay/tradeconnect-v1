/**
 * @fileoverview Tipos TypeScript para gestión de usuarios
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos específicos para operaciones de usuario
 *
 * Archivo: backend/src/types/user.types.ts
 */

import { UserRole } from '../utils/constants';

// ====================================================================
// INTERFACES DE PERFIL DE USUARIO
// ====================================================================

/**
 * Interface para perfil público de usuario
 */
export interface UserProfile {
  /** ID único del usuario */
  id: number;
  /** Email del usuario */
  email: string;
  /** Nombre completo */
  firstName: string;
  /** Apellido completo */
  lastName: string;
  /** Número de teléfono */
  phone?: string;
  /** URL del avatar */
  avatar?: string;
  /** NIT guatemalteco */
  nit?: string;
  /** CUI guatemalteco */
  cui?: string;
  /** Indica si el email está verificado */
  isEmailVerified: boolean;
  /** Indica si el usuario está activo */
  isActive: boolean;
  /** Indica si 2FA está habilitado */
  is2FAEnabled: boolean;
  /** Zona horaria del usuario */
  timezone: string;
  /** Idioma preferido */
  locale: string;
  /** Roles asignados al usuario */
  roles: UserRole[];
  /** Última conexión */
  lastLoginAt?: Date;
  /** Fecha de creación de la cuenta */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Interface para actualización de perfil de usuario
 */
export interface UserUpdateData {
  /** Nombre completo */
  firstName?: string;
  /** Apellido completo */
  lastName?: string;
  /** Número de teléfono */
  phone?: string;
  /** URL del avatar */
  avatar?: string;
  /** NIT guatemalteco */
  nit?: string;
  /** CUI guatemalteco */
  cui?: string;
  /** Zona horaria */
  timezone?: string;
  /** Idioma preferido */
  locale?: string;
}

/**
 * Interface para creación de usuario por administrador
 */
export interface UserCreateData {
  /** Email del usuario */
  email: string;
  /** Contraseña del usuario */
  password: string;
  /** Nombre completo */
  firstName: string;
  /** Apellido completo */
  lastName: string;
  /** Número de teléfono */
  phone?: string;
  /** Rol inicial del usuario */
  role?: UserRole;
}

/**
 * Interface para filtros de búsqueda de usuarios
 */
export interface UserSearchFilters {
  /** Búsqueda por nombre o email */
  query?: string;
  /** Filtrar por rol específico */
  role?: UserRole;
  /** Filtrar por estado activo */
  isActive?: boolean;
  /** Filtrar por verificación de email */
  isEmailVerified?: boolean;
  /** Filtrar por habilitación de 2FA */
  is2FAEnabled?: boolean;
  /** Fecha de creación desde */
  createdFrom?: Date;
  /** Fecha de creación hasta */
  createdTo?: Date;
  /** Último login desde */
  lastLoginFrom?: Date;
  /** Último login hasta */
  lastLoginTo?: Date;
}

/**
 * Interface para opciones de paginación de usuarios
 */
export interface UserPaginationOptions {
  /** Número de página (comenzando desde 1) */
  page?: number;
  /** Cantidad de elementos por página */
  limit?: number;
  /** Campo para ordenar */
  orderBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'email' | 'firstName';
  /** Dirección del ordenamiento */
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * Interface para lista de usuarios con paginación
 */
export interface UserListResponse {
  /** Lista de usuarios */
  users: UserProfile[];
  /** Información de paginación */
  pagination: {
    /** Página actual */
    page: number;
    /** Elementos por página */
    limit: number;
    /** Total de elementos */
    total: number;
    /** Total de páginas */
    pages: number;
  };
  /** Filtros aplicados */
  filters?: UserSearchFilters;
}

// ====================================================================
// INTERFACES DE ESTADÍSTICAS DE USUARIO
// ====================================================================

/**
 * Interface para estadísticas generales de usuarios
 */
export interface UserStats {
  /** Estadísticas de resumen */
  overview: {
    /** Total de usuarios registrados */
    total: number;
    /** Usuarios activos */
    active: number;
    /** Usuarios con email verificado */
    verified: number;
    /** Usuarios con 2FA habilitado */
    with2FA: number;
  };
  /** Distribución por roles */
  byRole: Array<{
    /** Nombre del rol */
    role: UserRole;
    /** Cantidad de usuarios con este rol */
    count: number;
    /** Porcentaje del total */
    percentage: number;
  }>;
  /** Registro mensual */
  monthly: Array<{
    /** Mes y año */
    month: string;
    /** Cantidad de registros */
    count: number;
    /** Crecimiento respecto al mes anterior */
    growth: number;
  }>;
  /** Actividad reciente */
  recentActivity: {
    /** Nuevos usuarios hoy */
    newToday: number;
    /** Nuevos usuarios esta semana */
    newThisWeek: number;
    /** Nuevos usuarios este mes */
    newThisMonth: number;
    /** Usuarios activos en las últimas 24 horas */
    activeLast24h: number;
  };
}

/**
 * Interface para métricas de engagement de usuario
 */
export interface UserEngagementMetrics {
  /** Tasa de retención */
  retention: {
    /** Día 1 */
    day1: number;
    /** Día 7 */
    day7: number;
    /** Día 30 */
    day30: number;
  };
  /** Frecuencia de uso */
  usage: {
    /** Usuarios diarios activos */
    dau: number;
    /** Usuarios semanales activos */
    wau: number;
    /** Usuarios mensuales activos */
    mau: number;
  };
  /** Tasa de conversión */
  conversion: {
    /** De registro a verificación de email */
    registrationToVerification: number;
    /** De verificación a primer login */
    verificationToFirstLogin: number;
    /** De primer login a usuario activo */
    firstLoginToActive: number;
  };
}

// ====================================================================
// INTERFACES DE GESTIÓN DE ROLES Y PERMISOS
// ====================================================================

/**
 * Interface para asignación de rol a usuario
 */
export interface RoleAssignment {
  /** ID del usuario */
  userId: number;
  /** Rol a asignar */
  role: UserRole;
  /** ID del usuario que asigna el rol */
  assignedBy: number;
  /** Fecha de expiración del rol (opcional) */
  expiresAt?: Date;
  /** Razón de la asignación */
  reason?: string;
}

/**
 * Interface para revocación de rol
 */
export interface RoleRevocation {
  /** ID del usuario */
  userId: number;
  /** Rol a revocar */
  role: UserRole;
  /** ID del usuario que revoca el rol */
  revokedBy: number;
  /** Razón de la revocación */
  reason?: string;
}

/**
 * Interface para historial de roles de usuario
 */
export interface UserRoleHistory {
  /** ID del usuario */
  userId: number;
  /** Historial de asignaciones y revocaciones */
  history: Array<{
    /** Tipo de evento */
    event: 'assigned' | 'revoked' | 'expired';
    /** Rol afectado */
    role: UserRole;
    /** Fecha del evento */
    timestamp: Date;
    /** Usuario que realizó la acción */
    performedBy?: number;
    /** Razón del cambio */
    reason?: string;
    /** Fecha de expiración (si aplica) */
    expiresAt?: Date;
  }>;
}

// ====================================================================
// INTERFACES DE VALIDACIÓN Y VERIFICACIÓN
// ====================================================================

/**
 * Interface para resultado de validación de usuario
 */
export interface UserValidationResult {
  /** Indica si la validación fue exitosa */
  isValid: boolean;
  /** Lista de errores encontrados */
  errors: string[];
  /** Lista de advertencias */
  warnings: string[];
  /** Campos que requieren atención */
  fieldsRequiringAttention: string[];
}

/**
 * Interface para verificación de identidad de usuario
 */
export interface UserIdentityVerification {
  /** ID del usuario */
  userId: number;
  /** Nivel de verificación alcanzado */
  verificationLevel: 'none' | 'basic' | 'intermediate' | 'advanced' | 'complete';
  /** Documentos verificados */
  verifiedDocuments: {
    /** Email verificado */
    email: boolean;
    /** Teléfono verificado */
    phone: boolean;
    /** Identidad verificada (DPI/CUI) */
    identity: boolean;
    /** Dirección verificada */
    address: boolean;
  };
  /** Puntaje de confianza (0-100) */
  trustScore: number;
  /** Última verificación */
  lastVerification: Date;
  /** Próxima verificación requerida */
  nextVerificationDue?: Date;
}

/**
 * Interface para configuración de privacidad de usuario
 */
export interface UserPrivacySettings {
  /** Visibilidad del perfil */
  profileVisibility: 'public' | 'private' | 'contacts';
  /** Quién puede enviar mensajes */
  messagePrivacy: 'everyone' | 'contacts' | 'nobody';
  /** Mostrar actividad en línea */
  showOnlineStatus: boolean;
  /** Permitir búsqueda por email */
  searchableByEmail: boolean;
  /** Recibir notificaciones por email */
  emailNotifications: boolean;
  /** Recibir notificaciones push */
  pushNotifications: boolean;
  /** Compartir datos de uso para mejoras */
  shareUsageData: boolean;
}

// ====================================================================
// INTERFACES DE EXPORTACIÓN E IMPORTACIÓN
// ====================================================================

/**
 * Interface para opciones de exportación de usuarios
 */
export interface UserExportOptions {
  /** Campos a incluir en la exportación */
  fields: Array<keyof UserProfile>;
  /** Filtros a aplicar */
  filters?: UserSearchFilters;
  /** Formato de exportación */
  format: 'csv' | 'json' | 'xlsx';
  /** Incluir metadatos */
  includeMetadata: boolean;
  /** Incluir historial de actividad */
  includeActivityHistory: boolean;
}

/**
 * Interface para resultado de exportación
 */
export interface UserExportResult {
  /** URL del archivo exportado */
  fileUrl: string;
  /** Nombre del archivo */
  fileName: string;
  /** Tamaño del archivo en bytes */
  fileSize: number;
  /** Cantidad de registros exportados */
  recordCount: number;
  /** Fecha de expiración del archivo */
  expiresAt: Date;
}

/**
 * Interface para importación de usuarios
 */
export interface UserImportOptions {
  /** Fuente de datos */
  source: 'file' | 'api' | 'csv';
  /** Modo de importación */
  mode: 'create' | 'update' | 'upsert';
  /** Rol por defecto para nuevos usuarios */
  defaultRole?: UserRole;
  /** Enviar emails de bienvenida */
  sendWelcomeEmails: boolean;
  /** Validar datos antes de importar */
  validateBeforeImport: boolean;
  /** Detener en primer error */
  stopOnFirstError: boolean;
}

/**
 * Interface para resultado de importación
 */
export interface UserImportResult {
  /** Total de registros procesados */
  totalProcessed: number;
  /** Registros creados exitosamente */
  created: number;
  /** Registros actualizados exitosamente */
  updated: number;
  /** Registros con errores */
  errors: number;
  /** Detalle de errores */
  errorDetails: Array<{
    /** Número de fila (si aplica) */
    row?: number;
    /** Datos del registro */
    data: any;
    /** Error específico */
    error: string;
  }>;
  /** Advertencias durante el proceso */
  warnings: string[];
}

// ====================================================================
// INTERFACES DE NOTIFICACIONES DE USUARIO
// ====================================================================

/**
 * Interface para preferencias de notificación de usuario
 */
export interface UserNotificationPreferences {
  /** Notificaciones de seguridad */
  security: {
    /** Cambios de contraseña */
    passwordChanges: boolean;
    /** Nuevos inicios de sesión */
    newLogins: boolean;
    /** Intentos de login fallidos */
    failedLogins: boolean;
    /** Cambios en 2FA */
    twoFactorChanges: boolean;
  };
  /** Notificaciones de actividad */
  activity: {
    /** Menciones en comentarios */
    mentions: boolean;
    /** Nuevos seguidores */
    newFollowers: boolean;
    /** Invitaciones a eventos */
    eventInvitations: boolean;
  };
  /** Notificaciones del sistema */
  system: {
    /** Actualizaciones de mantenimiento */
    maintenanceUpdates: boolean;
    /** Nuevas funcionalidades */
    featureUpdates: boolean;
    /** Cambios en políticas */
    policyChanges: boolean;
  };
  /** Canales de notificación */
  channels: {
    /** Correo electrónico */
    email: boolean;
    /** Notificaciones push */
    push: boolean;
    /** SMS */
    sms: boolean;
    /** Notificaciones en app */
    inApp: boolean;
  };
}

// ====================================================================
// TYPES ADICIONALES
// ====================================================================

/**
 * Estados posibles de un usuario
 */
export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification'
  | 'locked';

/**
 * Tipos de acción sobre usuarios
 */
export type UserAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'suspend'
  | 'unsuspend'
  | 'verify_email'
  | 'reset_password'
  | 'change_role';

/**
 * Contextos de usuario para diferentes operaciones
 */
export type UserContext =
  | 'registration'
  | 'login'
  | 'profile_update'
  | 'admin_action'
  | 'system_action'
  | 'api_call';