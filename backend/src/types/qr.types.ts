/**
 * @fileoverview Tipos TypeScript para el módulo QR y control de acceso
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos específicos para códigos QR, asistencia y control de acceso
 *
 * Archivo: backend/src/types/qr.types.ts
 */

import { Request } from 'express';
import { QRStatus } from '../models/QRCode';
import { AttendanceMethod, AttendanceStatus } from '../models/Attendance';
import { AccessType, AccessResult, AccessSeverity } from '../models/AccessLog';
import { SyncStatus, ConflictResolution, SyncPriority } from '../models/QrSyncLog';

// ====================================================================
// INTERFACES PARA CÓDIGOS QR
// ====================================================================

/**
 * Datos encriptados dentro del QR
 */
export interface QRData {
  /** ID de la inscripción */
  registrationId: number;
  /** ID del evento */
  eventId: number;
  /** ID del participante */
  participantId: number;
  /** Hash SHA-256 del contenido */
  hash: string;
  /** Timestamp de generación */
  timestamp: Date;
  /** Datos adicionales opcionales */
  metadata?: any;
}

/**
 * Request para generar código QR
 */
export interface GenerateQRRequest {
  /** ID de la inscripción */
  registrationId: number;
  /** Fecha de expiración opcional */
  expiresAt?: Date;
  /** Metadatos adicionales */
  metadata?: any;
}

/**
 * Response de generación de QR
 */
export interface GenerateQRResponse {
  /** ID del código QR generado */
  qrId: number;
  /** Hash del QR para verificación */
  qrHash: string;
  /** URL del código QR */
  qrUrl: string;
  /** Datos encriptados del QR */
  qrData: QRData;
  /** Estado del QR */
  status: QRStatus;
  /** Fecha de expiración */
  expiresAt?: Date;
  /** Hash de transacción de blockchain (si aplica) */
  blockchainTxHash?: string;
}

/**
 * Request para validar código QR
 */
export interface ValidateQRRequest {
  /** Hash del código QR */
  qrHash: string;
  /** ID del evento para validación */
  eventId: number;
  /** Punto de acceso donde se escanea */
  accessPoint?: string;
  /** Información del dispositivo */
  deviceInfo?: any;
  /** Información de geolocalización */
  location?: any;
}

/**
 * Response de validación de QR
 */
export interface ValidateQRResponse {
  /** Si el QR es válido */
  isValid: boolean;
  /** Estado del QR */
  status: QRStatus;
  /** ID del participante */
  participantId?: number;
  /** ID de la inscripción */
  registrationId?: number;
  /** ID del evento */
  eventId?: number;
  /** Mensaje de resultado */
  message: string;
  /** Si se registró asistencia automáticamente */
  attendanceRecorded?: boolean;
  /** ID del registro de asistencia (si se creó) */
  attendanceId?: number;
  /** Razón del fallo (si no es válido) */
  failureReason?: string;
}

/**
 * Request para regenerar código QR
 */
export interface RegenerateQRRequest {
  /** ID de la inscripción */
  registrationId: number;
  /** Razón de la regeneración */
  reason?: string;
  /** Fecha de expiración opcional */
  expiresAt?: Date;
}

/**
 * Request para invalidar código QR
 */
export interface InvalidateQRRequest {
  /** ID del código QR */
  qrId: number;
  /** Razón de la invalidación */
  reason: string;
  /** Usuario que realiza la invalidación */
  invalidatedBy: number;
}

// ====================================================================
// INTERFACES PARA ASISTENCIA
// ====================================================================

/**
 * Request para marcar asistencia
 */
export interface MarkAttendanceRequest {
  /** ID del evento */
  eventId: number;
  /** ID del participante */
  userId: number;
  /** Método de registro */
  method: AttendanceMethod;
  /** Punto de acceso */
  accessPoint?: string;
  /** ID del código QR usado */
  qrCodeId?: number;
  /** Información del dispositivo */
  deviceInfo?: any;
  /** IP del dispositivo */
  ipAddress?: string;
  /** Geolocalización */
  location?: any;
  /** Notas adicionales */
  notes?: string;
}

/**
 * Response de registro de asistencia
 */
export interface MarkAttendanceResponse {
  /** ID del registro de asistencia */
  attendanceId: number;
  /** Estado de la asistencia */
  status: AttendanceStatus;
  /** Timestamp de entrada */
  checkInTime: Date;
  /** Método usado */
  method: AttendanceMethod;
  /** Mensaje de confirmación */
  message: string;
}

/**
 * Request para checkout de asistencia
 */
export interface CheckoutAttendanceRequest {
  /** ID del registro de asistencia */
  attendanceId: number;
  /** Punto de acceso de salida */
  accessPoint?: string;
  /** Notas de salida */
  notes?: string;
}

/**
 * Estadísticas de asistencia por evento
 */
export interface AttendanceStats {
  /** Total de asistentes */
  totalAttendees: number;
  /** Asistentes que hicieron check-in */
  checkedIn: number;
  /** Asistentes que hicieron check-out */
  checkedOut: number;
  /** Registros cancelados */
  cancelled: number;
  /** Tasa de asistencia */
  attendanceRate: number;
  /** Duración promedio (minutos) */
  averageDuration: number;
  /** Horas pico de llegada */
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
}

// ====================================================================
// INTERFACES PARA LOGS DE ACCESO
// ====================================================================

/**
 * Request para crear log de acceso
 */
export interface CreateAccessLogRequest {
  /** ID del evento */
  eventId: number;
  /** ID del usuario (opcional) */
  userId?: number;
  /** ID del código QR (opcional) */
  qrCodeId?: number;
  /** Tipo de acceso */
  accessType: AccessType;
  /** Resultado del intento */
  result: AccessResult;
  /** Razón del fallo */
  failureReason?: string;
  /** Usuario staff que realizó el escaneo */
  scannedBy?: number;
  /** Punto de acceso */
  accessPoint?: string;
  /** IP del dispositivo */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Información del dispositivo */
  deviceInfo?: any;
  /** Geolocalización */
  location?: any;
  /** Notas adicionales */
  notes?: string;
  /** Metadatos */
  metadata?: any;
}

/**
 * Estadísticas de logs de acceso
 */
export interface AccessLogStats {
  /** Total de intentos de acceso */
  totalAttempts: number;
  /** Intentos exitosos */
  successfulAttempts: number;
  /** Intentos fallidos */
  failedAttempts: number;
  /** Intentos sospechosos */
  suspiciousAttempts: number;
  /** Intentos por tipo */
  attemptsByType: Record<AccessType, number>;
  /** Intentos por resultado */
  attemptsByResult: Record<AccessResult, number>;
  /** Patrones sospechosos detectados */
  suspiciousPatterns: {
    repeatedFailures: Array<{
      ip: string;
      count: number;
    }>;
    rapidAttempts: Array<{
      userId: number;
      attempts: number;
    }>;
    unusualLocations: Array<{
      ip: string;
      location: any;
    }>;
  };
}

// ====================================================================
// INTERFACES PARA SINCRONIZACIÓN OFFLINE
// ====================================================================

/**
 * Request para descargar lista offline
 */
export interface DownloadOfflineListRequest {
  /** ID del evento */
  eventId: number;
  /** ID del dispositivo */
  deviceId: string;
  /** Información del dispositivo */
  deviceInfo?: any;
}

/**
 * Response de descarga offline
 */
export interface DownloadOfflineListResponse {
  /** ID del lote de sincronización */
  batchId: string;
  /** Lista de QRs válidos */
  qrCodes: Array<{
    qrHash: string;
    qrData: QRData;
    participantInfo: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  /** Reglas de validación del evento */
  eventRules: {
    eventId: number;
    startDate: Date;
    endDate: Date;
    accessWindows: Array<{
      startTime: Date;
      endTime: Date;
    }>;
  };
  /** Timestamp de generación */
  generatedAt: Date;
  /** Expira en (segundos) */
  expiresIn: number;
}

/**
 * Request para validar QR offline
 */
export interface ValidateOfflineQRRequest {
  /** Hash del QR */
  qrHash: string;
  /** ID del lote offline */
  batchId: string;
  /** Timestamp de validación */
  timestamp: Date;
  /** Información del dispositivo */
  deviceInfo?: any;
  /** Punto de acceso */
  accessPoint?: string;
}

/**
 * Response de validación offline
 */
export interface ValidateOfflineQRResponse {
  /** Si es válido */
  isValid: boolean;
  /** ID del participante */
  participantId?: number;
  /** Mensaje */
  message: string;
  /** Datos para sincronización posterior */
  syncData?: {
    qrHash: string;
    participantId: number;
    timestamp: Date;
    deviceInfo: any;
  };
}

/**
 * Request para sincronizar datos offline
 */
export interface SyncOfflineDataRequest {
  /** ID del dispositivo */
  deviceId: string;
  /** ID del lote */
  batchId: string;
  /** Registros de asistencia offline */
  attendanceRecords: Array<{
    qrHash: string;
    participantId: number;
    timestamp: Date;
    deviceInfo: any;
    accessPoint?: string;
  }>;
  /** Información del dispositivo */
  deviceInfo?: any;
}

/**
 * Response de sincronización offline
 */
export interface SyncOfflineDataResponse {
  /** Registros procesados exitosamente */
  processedRecords: number;
  /** Registros con conflictos */
  conflictRecords: number;
  /** Registros fallidos */
  failedRecords: number;
  /** Detalles de conflictos */
  conflicts: Array<{
    qrHash: string;
    conflictType: 'duplicate' | 'time_difference' | 'invalid_data';
    offlineData: any;
    onlineData: any;
    resolution: ConflictResolution;
  }>;
  /** Estadísticas de sincronización */
  syncStats: {
    newAttendances: number;
    updatedAttendances: number;
    skippedDuplicates: number;
  };
}

// ====================================================================
// INTERFACES PARA REPORTES Y ANALYTICS
// ====================================================================

/**
 * Request para reporte de asistencia
 */
export interface AttendanceReportRequest {
  /** ID del evento */
  eventId: number;
  /** Fecha de inicio */
  startDate?: Date;
  /** Fecha de fin */
  endDate?: Date;
  /** Formato de exportación */
  format?: 'json' | 'csv' | 'excel' | 'pdf';
}

/**
 * Reporte de asistencia
 */
export interface AttendanceReport {
  /** Información del evento */
  eventInfo: {
    id: number;
    title: string;
    startDate: Date;
    endDate: Date;
  };
  /** Estadísticas generales */
  summary: AttendanceStats;
  /** Lista detallada de asistentes */
  attendees: Array<{
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    duration?: number;
    method: AttendanceMethod;
    accessPoint?: string;
  }>;
  /** No-shows (inscritos que no asistieron) */
  noShows: Array<{
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    registrationDate: Date;
  }>;
  /** Generado en */
  generatedAt: Date;
}

/**
 * Dashboard de asistencia en tiempo real
 */
export interface AttendanceDashboard {
  /** ID del evento */
  eventId: number;
  /** Asistencia actual */
  currentAttendance: {
    checkedIn: number;
    checkedOut: number;
    total: number;
  };
  /** Capacidad del evento */
  capacity: number;
  /** Porcentaje de ocupación */
  occupancyRate: number;
  /** Gráfica de llegadas por hora */
  arrivalsByHour: Array<{
    hour: string;
    count: number;
  }>;
  /** Puntos de acceso más utilizados */
  topAccessPoints: Array<{
    accessPoint: string;
    count: number;
  }>;
  /** Alertas activas */
  alerts: Array<{
    type: 'capacity_warning' | 'suspicious_activity' | 'system_error';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }>;
  /** Última actualización */
  lastUpdated: Date;
}

// ====================================================================
// INTERFACES PARA API PÚBLICA
// ====================================================================

/**
 * Request para verificación pública de QR
 */
export interface PublicQRVerificationRequest {
  /** Hash del código QR */
  qrHash: string;
  /** API Key para autenticación */
  apiKey: string;
}

/**
 * Response de verificación pública
 */
export interface PublicQRVerificationResponse {
  /** Si el QR es válido */
  isValid: boolean;
  /** Estado del QR */
  status: QRStatus;
  /** Información básica del evento */
  eventInfo?: {
    id: number;
    title: string;
    startDate: Date;
    endDate: Date;
  };
  /** Timestamp de verificación */
  verifiedAt: Date;
  /** Mensaje de resultado */
  message: string;
}

// ====================================================================
// INTERFACES PARA REQUESTS EXTENDIDOS
// ====================================================================

/**
 * Request extendido con información de QR
 */
export interface AuthenticatedQRRequest extends Request {
  /** Información del usuario autenticado */
  user?: any;
  /** ID del código QR (si aplica) */
  qrId?: number;
  /** Hash del QR (si aplica) */
  qrHash?: string;
  /** Información del evento */
  eventId?: number;
}

/**
 * Request extendido para operaciones administrativas de QR
 */
export interface AdminQRRequest extends AuthenticatedQRRequest {
  /** Permisos del usuario administrador */
  permissions: string[];
  /** Si es super admin */
  isSuperAdmin: boolean;
}

// ====================================================================
// TYPES ADICIONALES
// ====================================================================

/**
 * Tipos de encriptación soportados para QR
 */
export enum QREncryptionType {
  AES256 = 'aes256',
  HMAC_SHA256 = 'hmac_sha256'
}

/**
 * Configuración de generación de QR
 */
export interface QRGenerationConfig {
  /** Tipo de encriptación */
  encryptionType: QREncryptionType;
  /** Nivel de corrección de errores */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  /** Versión del QR (1-40) */
  version?: number;
  /** Tamaño en píxeles */
  size?: number;
  /** Margen */
  margin?: number;
  /** Color de fondo */
  backgroundColor?: string;
  /** Color del código */
  foregroundColor?: string;
}

/**
 * Configuración de validación de QR
 */
export interface QRValidationConfig {
  /** Tolerancia de tiempo antes del evento (minutos) */
  earlyToleranceMinutes: number;
  /** Tolerancia de tiempo después del evento (minutos) */
  lateToleranceMinutes: number;
  /** Máximo de usos por QR */
  maxUsesPerQR: number;
  /** Requerir verificación blockchain */
  requireBlockchainVerification: boolean;
  /** Cache TTL en segundos */
  cacheTTLSeconds: number;
}

/**
 * Configuración de sincronización offline
 */
export interface OfflineSyncConfig {
  /** Intervalo de sincronización automática (minutos) */
  syncIntervalMinutes: number;
  /** Tamaño máximo del lote de sincronización */
  maxBatchSize: number;
  /** Timeout de sincronización (segundos) */
  syncTimeoutSeconds: number;
  /** Estrategia de resolución de conflictos */
  conflictResolutionStrategy: 'offline_wins' | 'online_wins' | 'manual';
  /** Retención de datos offline (días) */
  offlineDataRetentionDays: number;
}
