/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Sistema
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para usuarios, roles, permisos y auditoría del sistema en el panel administrativo
 */

// ====================================================================
// TIPOS BASE DE USUARIOS
// ====================================================================

/**
 * Roles de usuario disponibles
 */
export type UserRole = 'super_admin' | 'admin' | 'organizer' | 'moderator' | 'support' | 'viewer';

/**
 * Estados de usuario
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification' | 'locked';

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

// ====================================================================
// TIPOS DE ROLES Y PERMISOS
// ====================================================================

/**
 * Permisos disponibles en el sistema
 */
export type Permission =
  // Dashboard
  | 'dashboard.view'
  | 'dashboard.analytics'

  // Eventos
  | 'events.view'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  | 'events.publish'
  | 'events.cancel'

  // Speakers
  | 'speakers.view'
  | 'speakers.create'
  | 'speakers.edit'
  | 'speakers.delete'
  | 'speakers.contracts'

  // Inscripciones
  | 'registrations.view'
  | 'registrations.create'
  | 'registrations.edit'
  | 'registrations.cancel'
  | 'registrations.refund'

  // Pagos
  | 'payments.view'
  | 'payments.process'
  | 'payments.refund'
  | 'payments.reconcile'

  // Certificados
  | 'certificates.view'
  | 'certificates.generate'
  | 'certificates.revoke'

  // QR y Control de Acceso
  | 'qr.view'
  | 'qr.generate'
  | 'qr.invalidate'
  | 'attendance.view'
  | 'attendance.mark'

  // Promociones
  | 'promotions.view'
  | 'promotions.create'
  | 'promotions.edit'
  | 'promotions.delete'

  // Usuarios y Sistema
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.roles'
  | 'system.settings'
  | 'system.audit'
  | 'system.backup';

/**
 * Interface para definición de rol
 */
export interface RoleDefinition {
  id: number;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

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
// TIPOS DE AUDITORÍA
// ====================================================================

/**
 * Tipos de acción auditada
 */
export type AuditAction =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'profile_update'
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'role_assign'
  | 'role_revoke'
  | 'event_create'
  | 'event_update'
  | 'event_delete'
  | 'registration_create'
  | 'registration_cancel'
  | 'payment_process'
  | 'payment_refund'
  | 'certificate_generate'
  | 'certificate_revoke'
  | 'qr_generate'
  | 'qr_invalidate'
  | 'system_config_update'
  | 'data_export'
  | 'data_import';

/**
 * Severidad del log de auditoría
 */
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Interface para registro de auditoría
 */
export interface AuditLog {
  id: number;
  timestamp: Date;
  userId?: number;
  userEmail?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: number;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
  correlationId?: string;
}

/**
 * Interface para filtros de auditoría
 */
export interface AuditFilters {
  userId?: number;
  action?: AuditAction[];
  resourceType?: string;
  resourceId?: number;
  severity?: AuditSeverity[];
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  success?: boolean;
}

/**
 * Interface para consulta de auditoría
 */
export interface AuditQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'action' | 'severity' | 'userId';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: AuditFilters;
}

/**
 * Interface para resultado de consulta de auditoría
 */
export interface AuditSearchResult {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: AuditFilters;
}

// ====================================================================
// TIPOS DE CONFIGURACIÓN DEL SISTEMA
// ====================================================================

/**
 * Configuración general del sistema
 */
export interface SystemConfig {
  site: {
    name: string;
    description: string;
    url: string;
    logo?: string;
    favicon?: string;
    timezone: string;
    locale: string;
    currency: 'GTQ' | 'USD';
  };
  email: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string; // Encriptado
    };
    from: {
      name: string;
      email: string;
    };
    templates: {
      welcome: string;
      passwordReset: string;
      emailVerification: string;
    };
  };
  security: {
    sessionTimeout: number; // minutos
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    twoFactor: {
      enabled: boolean;
      required: boolean;
      methods: ('app' | 'sms' | 'email')[];
    };
    rateLimiting: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
  };
  features: {
    events: boolean;
    speakers: boolean;
    certificates: boolean;
    payments: boolean;
    qr: boolean;
    promotions: boolean;
    fel: boolean;
  };
  integrations: {
    blockchain: {
      enabled: boolean;
      network: string;
      contractAddress?: string;
    };
    paymentGateways: Array<{
      name: string;
      enabled: boolean;
      sandbox: boolean;
    }>;
    fel: {
      enabled: boolean;
      certifier: 'infile' | 'dimexa';
      environment: 'production' | 'testing';
    };
  };
}

/**
 * Configuración de backup
 */
export interface BackupConfig {
  enabled: boolean;
  schedule: 'daily' | 'weekly' | 'monthly';
  retention: number; // días
  storage: {
    provider: 'local' | 's3' | 'azure';
    path?: string;
    bucket?: string;
    accessKey?: string;
    secretKey?: string; // Encriptado
  };
  encryption: {
    enabled: boolean;
    key?: string; // Encriptado
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    emailRecipients: string[];
  };
}

// ====================================================================
// TIPOS DE ESTADÍSTICAS DEL SISTEMA
// ====================================================================

/**
 * Estadísticas generales del sistema
 */
export interface SystemStats {
  uptime: number; // segundos
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    queriesPerSecond: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    memoryUsage: number;
  };
  queue: {
    pending: number;
    processing: number;
    failed: number;
  };
}

/**
 * Métricas de rendimiento
 */
export interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    bytesPerSecond: number;
  };
  errorRate: {
    total: number;
    byEndpoint: Record<string, number>;
  };
  availability: {
    uptime: number;
    incidents: number;
  };
}

// ====================================================================
// TIPOS DE NOTIFICACIONES DEL SISTEMA
// ====================================================================

/**
 * Tipos de notificación del sistema
 */
export type SystemNotificationType =
  | 'maintenance_scheduled'
  | 'maintenance_completed'
  | 'security_alert'
  | 'performance_issue'
  | 'backup_completed'
  | 'backup_failed'
  | 'storage_warning'
  | 'license_expiring';

/**
 * Notificación del sistema
 */
export interface SystemNotification {
  id: number;
  type: SystemNotificationType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  targetUsers?: number[]; // IDs de usuarios específicos, vacío = todos los admins
  targetRoles?: UserRole[]; // Roles que deben recibir la notificación
  channels: ('email' | 'in_app' | 'sms')[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdBy?: number;
  createdAt: Date;
  sentAt?: Date;
}

// ====================================================================
// TIPOS DE EXPORTACIÓN E IMPORTACIÓN
// ====================================================================

/**
 * Opciones de exportación de datos del sistema
 */
export interface SystemExportOptions {
  includeUsers: boolean;
  includeEvents: boolean;
  includeRegistrations: boolean;
  includePayments: boolean;
  includeAuditLogs: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  format: 'json' | 'csv' | 'excel';
  compress: boolean;
}

/**
 * Resultado de exportación del sistema
 */
export interface SystemExportResult {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  recordCounts: {
    users?: number;
    events?: number;
    registrations?: number;
    payments?: number;
    auditLogs?: number;
  };
  generatedAt: Date;
  expiresAt: Date;
  requestedBy: number;
}

/**
 * Opciones de importación de datos
 */
export interface SystemImportOptions {
  source: 'file' | 'url';
  format: 'json' | 'csv' | 'excel';
  mode: 'create' | 'update' | 'upsert';
  validateBeforeImport: boolean;
  stopOnFirstError: boolean;
  notifyOnCompletion: boolean;
}

/**
 * Resultado de importación del sistema
 */
export interface SystemImportResult {
  id: string;
  totalRecords: number;
  processedRecords: number;
  createdRecords: number;
  updatedRecords: number;
  failedRecords: number;
  errors: Array<{
    record: any;
    error: string;
    line?: number;
  }>;
  warnings: string[];
  completedAt: Date;
  requestedBy: number;
}

// ====================================================================
// TIPOS DE MANTENIMIENTO
// ====================================================================

/**
 * Tarea de mantenimiento
 */
export interface MaintenanceTask {
  id: number;
  name: string;
  description: string;
  type: 'database_cleanup' | 'cache_clear' | 'index_rebuild' | 'backup' | 'update' | 'custom';
  schedule?: {
    cron: string;
    timezone: string;
  };
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  lastResult?: {
    success: boolean;
    duration: number;
    message?: string;
    error?: string;
  };
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ventana de mantenimiento programado
 */
export interface MaintenanceWindow {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  affectedServices: string[];
  notificationSent: boolean;
  completed: boolean;
  createdBy: number;
  createdAt: Date;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

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
 * Estados de sesión
 */
export type SessionStatus = 'active' | 'expired' | 'terminated';

/**
 * Información de sesión
 */
export interface SessionInfo {
  id: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  status: SessionStatus;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
}