/**
 * @fileoverview Tipos TypeScript para el módulo de autenticación
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos específicos para autenticación y autorización
 * 
 * Archivo: backend/src/types/auth.types.ts
 */

import { Request } from 'express';
import { UserRole, Permission } from '../utils/constants';

// ====================================================================
// INTERFACES DE AUTENTICACIÓN
// ====================================================================

/**
 * Interface para credenciales de login
 */
export interface LoginCredentials {
  /** Email del usuario */
  email: string;
  /** Contraseña del usuario */
  password: string;
  /** Código 2FA (opcional si está habilitado) */
  twoFactorCode?: string;
  /** Indica si mantener la sesión activa */
  rememberMe?: boolean;
}

/**
 * Interface para registro de nuevos usuarios
 */
export interface RegisterData {
  /** Email del usuario */
  email: string;
  /** Contraseña del usuario */
  password: string;
  /** Confirmación de contraseña */
  confirmPassword: string;
  /** Nombre completo */
  firstName: string;
  /** Apellido completo */
  lastName: string;
  /** Número de teléfono */
  phone?: string;
  /** NIT guatemalteco (opcional) */
  nit?: string;
  /** CUI guatemalteco (opcional) */
  cui?: string;
  /** Términos y condiciones aceptados */
  termsAccepted: boolean;
  /** Marketing emails aceptados */
  marketingAccepted?: boolean;
}

/**
 * Interface para respuesta de autenticación exitosa
 */
export interface AuthResponse {
  /** Token de acceso JWT */
  accessToken: string;
  /** Token de refresco */
  refreshToken: string;
  /** Información del usuario autenticado */
  user: AuthUser;
  /** Tiempo de expiración del token (segundos) */
  expiresIn: number;
  /** Tipo de token */
  tokenType: 'Bearer';
  /** Indica si requiere verificación 2FA */
  requires2FA?: boolean;
  /** Indica si requiere verificación de email */
  requiresEmailVerification?: boolean;
}

/**
 * Interface para información del usuario autenticado
 */
export interface AuthUser {
  /** ID único del usuario */
  id: number;
  /** Email del usuario */
  email: string;
  /** Nombre completo */
  firstName: string;
  /** Apellido completo */
  lastName: string;
  /** Nombre completo concatenado */
  fullName: string;
  /** Roles asignados al usuario */
  roles: UserRole[];
  /** Permisos específicos del usuario */
  permissions: Permission[];
  /** Indica si el email está verificado */
  isEmailVerified: boolean;
  /** Indica si 2FA está habilitado */
  is2faEnabled: boolean;
  /** Indica si el usuario está activo */
  isActive: boolean;
  /** Avatar del usuario (URL) */
  avatar?: string;
  /** Última conexión */
  lastLoginAt?: Date;
  /** Fecha de creación de la cuenta */
  createdAt: Date;
}

/**
 * Interface para datos de cambio de contraseña
 */
export interface ChangePasswordData {
  /** Contraseña actual */
  currentPassword: string;
  /** Nueva contraseña */
  newPassword: string;
  /** Confirmación de nueva contraseña */
  confirmNewPassword: string;
}

/**
 * Interface para reset de contraseña
 */
export interface ResetPasswordData {
  /** Token de reset recibido por email */
  resetToken: string;
  /** Nueva contraseña */
  newPassword: string;
  /** Confirmación de nueva contraseña */
  confirmPassword: string;
}

/**
 * Interface para configuración de 2FA
 */
export interface TwoFactorSetup {
  /** Método de 2FA (totp, sms, email) */
  method?: 'totp' | 'sms' | 'email';
  /** Número de teléfono para SMS */
  phoneNumber?: string;
  /** Dirección de email para email */
  emailAddress?: string;
  /** Secret para generar códigos TOTP */
  secret: string;
  /** URL para generar QR code */
  qrCodeUrl: string;
  /** Códigos de backup de emergencia */
  backupCodes: string[];
  /** Código de verificación para confirmar setup */
  verificationCode?: string;
}

/**
 * Interface para verificación de 2FA
 */
export interface TwoFactorVerification {
  /** Código TOTP o código de backup */
  code: string;
  /** Tipo de código utilizado */
  type: 'totp' | 'backup';
}

/**
 * Interface para perfil de usuario
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
  /** Nombre completo concatenado */
  fullName: string;
  /** Teléfono del usuario */
  phone?: string;
  /** Avatar del usuario (URL) */
  avatar?: string;
  /** NIT guatemalteco */
  nit?: string;
  /** CUI guatemalteco */
  cui?: string;
  /** Indica si el email está verificado */
  isEmailVerified: boolean;
  /** Indica si 2FA está habilitado */
  is2faEnabled: boolean;
  /** Indica si el usuario está activo */
  isActive: boolean;
  /** Última conexión */
  lastLoginAt?: Date;
  /** Roles del usuario */
  roles: string[];
  /** Zona horaria del usuario */
  timezone: string;
  /** Idioma preferido */
  locale: string;
  /** Fecha de creación de la cuenta */
  createdAt: Date;
  /** Fecha de actualización */
  updatedAt: Date;
}

/**
 * Interface para datos de actualización de usuario
 */
export interface UserUpdateData {
  /** Nombre completo */
  firstName?: string;
  /** Apellido completo */
  lastName?: string;
  /** Teléfono del usuario */
  phone?: string;
  /** Avatar del usuario (URL) */
  avatar?: string;
  /** NIT guatemalteco */
  nit?: string;
  /** CUI guatemalteco */
  cui?: string;
}

/**
 * Interface para creación de usuario (admin)
 */
export interface CreateUserData {
  /** Email del usuario */
  email: string;
  /** Contraseña del usuario */
  password: string;
  /** Nombre completo */
  firstName: string;
  /** Apellido completo */
  lastName: string;
  /** Teléfono del usuario */
  phone?: string;
  /** NIT guatemalteco */
  nit?: string;
  /** CUI guatemalteco */
  cui?: string;
  /** Rol del usuario */
  role?: UserRole;
  /** Indica si está activo */
  isActive?: boolean;
}

// ====================================================================
// INTERFACES DE SESIÓN
// ====================================================================

/**
 * Interface para información de sesión
 */
export interface SessionInfo {
  /** ID único de la sesión */
  sessionId: string;
  /** ID del usuario */
  userId: number;
  /** IP desde donde se conectó */
  ipAddress: string;
  /** User agent del navegador */
  userAgent: string;
  /** Dispositivo detectado */
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os: string;
    browser: string;
  };
  /** Ubicación geográfica (aproximada) */
  location?: {
    country: string;
    city: string;
    region: string;
  };
  /** Fecha de inicio de sesión */
  createdAt: Date;
  /** Última actividad */
  lastActivity: Date;
  /** Indica si la sesión está activa */
  isActive: boolean;
  /** Indica si es la sesión actual */
  isCurrent: boolean;
}

/**
 * Interface para Request extendido con información de autenticación
 */
export interface AuthenticatedRequest extends Request {
  /** Información del usuario autenticado */
  user?: AuthUser;
  /** ID de la sesión actual */
  sessionId?: string;
  /** Token JWT decodificado */
  token?: {
    userId: number;
    email: string;
    roles: UserRole[];
    permissions: Permission[];
    iat: number;
    exp: number;
    jti?: string;
  };
}

// ====================================================================
// INTERFACES DE AUDITORÍA Y SEGURIDAD
// ====================================================================

/**
 * Interface para logs de auditoría de seguridad
 */
export interface SecurityAuditLog {
  /** ID del usuario (si aplica) */
  userId?: number;
  /** Tipo de evento de seguridad */
  eventType: SecurityEventType;
  /** IP desde donde se realizó la acción */
  ipAddress: string;
  /** User agent */
  userAgent: string;
  /** Descripción del evento */
  description: string;
  /** Datos adicionales del evento */
  metadata?: Record<string, any>;
  /** Nivel de riesgo del evento */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  /** Timestamp del evento */
  createdAt: Date;
}

/**
 * Tipos de eventos de seguridad para auditoría
 */
export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_blocked'
  | 'logout'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verification_failed'
  | 'email_verification'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'session_hijack_attempt'
  | 'brute_force_attempt'
  | 'token_refresh'
  | 'permission_escalation_attempt'
  | 'blacklisted_token_used'
  | 'api_access'
  | 'rate_limit_exceeded'
  | 'auth_rate_limit_exceeded'
  | 'suspicious_user_agent'
  | 'suspicious_path_access'
  | 'suspicious_headers'
  | 'invalid_origin'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'directory_traversal_attempt'
  | 'invalid_file_type'
  | 'api_performance'
  | 'ip_blocked'
  | 'ip_unblocked';

/**
 * Interface para configuración de seguridad por usuario
 */
export interface UserSecuritySettings {
  /** Indica si 2FA está habilitado */
  is2faEnabled: boolean;
  /** Intentos fallidos de login */
  failedLoginAttempts: number;
  /** Timestamp del último intento fallido */
  lastFailedLogin?: Date;
  /** Indica si la cuenta está bloqueada */
  isAccountLocked: boolean;
  /** Timestamp de cuando se bloqueó la cuenta */
  accountLockedAt?: Date;
  /** Timestamp de cuando expira el bloqueo */
  lockExpiresAt?: Date;
  /** IPs permitidas (whitelist) */
  allowedIPs?: string[];
  /** Indica si requiere verificación por email para nuevos dispositivos */
  requireDeviceVerification: boolean;
  /** Lista de dispositivos confiables */
  trustedDevices: TrustedDevice[];
}

/**
 * Interface para dispositivos confiables
 */
export interface TrustedDevice {
  /** ID único del dispositivo */
  deviceId: string;
  /** Nombre del dispositivo */
  deviceName: string;
  /** Fingerprint del dispositivo */
  fingerprint: string;
  /** Fecha cuando se marcó como confiable */
  trustedAt: Date;
  /** Última vez que se usó */
  lastUsed: Date;
  /** Indica si está activo */
  isActive: boolean;
}

// ====================================================================
// INTERFACES DE RATE LIMITING
// ====================================================================

/**
 * Interface para configuración de rate limiting
 */
export interface RateLimitConfig {
  /** Ventana de tiempo en milisegundos */
  windowMs: number;
  /** Máximo número de requests por ventana */
  max: number;
  /** Mensaje de error cuando se excede el límite */
  message: string;
  /** Headers a incluir en la respuesta */
  standardHeaders: boolean;
  /** Headers legacy */
  legacyHeaders: boolean;
  /** Función personalizada para generar key */
  keyGenerator?: (req: Request) => string;
  /** Función para manejar cuando se excede el límite */
  handler?: (req: Request, res: any) => void;
}

/**
 * Interface para tracking de rate limiting por usuario
 */
export interface UserRateLimit {
  /** Identificador único (IP, userId, etc.) */
  identifier: string;
  /** Tipo de límite aplicado */
  limitType: 'login' | 'registration' | 'password_reset' | 'general';
  /** Número de requests realizados */
  requestCount: number;
  /** Timestamp de reset de la ventana */
  windowReset: Date;
  /** Indica si está bloqueado */
  isBlocked: boolean;
  /** Timestamp de cuando se bloqueó */
  blockedAt?: Date;
  /** Timestamp de cuando expira el bloqueo */
  blockExpiresAt?: Date;
}

// ====================================================================
// TYPES Y ENUMS ADICIONALES
// ====================================================================

/**
 * Estados posibles de una sesión
 */
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  INVALID = 'invalid'
}

/**
 * Tipos de tokens JWT
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  DEVICE_VERIFICATION = 'device_verification'
}

/**
 * Niveles de autenticación requeridos
 */
export enum AuthLevel {
  /** Sin autenticación requerida */
  NONE = 0,
  /** Autenticación básica (email/password) */
  BASIC = 1,
  /** Autenticación con 2FA requerido */
  TWO_FACTOR = 2,
  /** Autenticación elevada (re-login reciente) */
  ELEVATED = 3,
  /** Autenticación administrativa */
  ADMIN = 4
}

/**
 * Tipos de errores de autenticación
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  TWO_FACTOR_INVALID = 'TWO_FACTOR_INVALID',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  DEVICE_NOT_TRUSTED = 'DEVICE_NOT_TRUSTED'
}