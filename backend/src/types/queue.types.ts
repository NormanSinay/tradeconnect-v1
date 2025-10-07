/**
 * @fileoverview Tipos para el sistema de colas Bull
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de tipos para trabajos en cola
 */

import { Job } from 'bull';

// ====================================================================
// TIPOS DE COLAS
// ====================================================================

export enum QueueType {
  CERTIFICATE_GENERATION = 'certificate_generation',
  BULK_CERTIFICATE_GENERATION = 'bulk_certificate_generation',
  CERTIFICATE_EMAIL_RESEND = 'certificate_email_resend',
  CERTIFICATE_WEBHOOK = 'certificate_webhook',
  CERTIFICATE_CLEANUP = 'certificate_cleanup',
  NOTIFICATION_SEND = 'notification_send',
  BULK_NOTIFICATION_SEND = 'bulk_notification_send',
  NOTIFICATION_RETRY = 'notification_retry',
  NOTIFICATION_CLEANUP = 'notification_cleanup'
}

// ====================================================================
// DATOS DE TRABAJOS
// ====================================================================

export interface CertificateGenerationJobData {
  eventId: number;
  userId: number;
  registrationId: number;
  templateId?: string;
  certificateType?: string;
  customData?: any;
  createdBy: number;
  priority?: number;
}

export interface BulkCertificateGenerationJobData {
  eventId: number;
  userIds: number[];
  templateId?: string;
  certificateType?: string;
  eligibilityCriteria?: any;
  createdBy: number;
  priority?: number;
}

export interface CertificateEmailResendJobData {
  certificateId: string;
  recipientEmail: string;
  recipientName: string;
  resendReason?: string;
  priority?: number;
}

export interface CertificateWebhookJobData {
  certificateId: string;
  webhookUrl: string;
  webhookSecret?: string;
  eventType: 'certificate.generated' | 'certificate.revoked' | 'certificate.resent';
  payload: any;
  retryCount?: number;
  priority?: number;
}

export interface CertificateCleanupJobData {
  olderThanDays: number;
  includeRevoked?: boolean;
  dryRun?: boolean;
  priority?: number;
}

export interface NotificationSendJobData {
  notificationId: number;
  priority?: number;
}

export interface BulkNotificationSendJobData {
  notificationIds: number[];
  priority?: number;
}

export interface NotificationRetryJobData {
  notificationId: number;
  maxRetries?: number;
  priority?: number;
}

export interface NotificationCleanupJobData {
  olderThanDays: number;
  includeRead?: boolean;
  dryRun?: boolean;
  priority?: number;
}

// ====================================================================
// RESULTADOS DE TRABAJOS
// ====================================================================

export interface CertificateGenerationJobResult {
  success: boolean;
  certificateId?: string;
  certificateNumber?: string;
  pdfUrl?: string;
  blockchainTxHash?: string;
  error?: string;
  processingTime?: number;
}

export interface BulkCertificateGenerationJobResult {
  totalRequested: number;
  successful: number;
  failed: number;
  certificates: Array<{
    userId: number;
    certificateId?: string;
    certificateNumber?: string;
    success: boolean;
    error?: string;
  }>;
  processingTime: number;
}

export interface CertificateEmailResendJobResult {
  success: boolean;
  emailSent: boolean;
  messageId?: string;
  error?: string;
}

export interface CertificateWebhookJobResult {
  success: boolean;
  responseStatus?: number;
  responseBody?: any;
  retryCount: number;
  error?: string;
}

export interface CertificateCleanupJobResult {
  certificatesFound: number;
  certificatesDeleted: number;
  filesRemoved: number;
  errors: string[];
  dryRun: boolean;
}

export interface NotificationSendJobResult {
  success: boolean;
  notificationId: number;
  error?: string;
  processingTime?: number;
}

export interface BulkNotificationSendJobResult {
  totalRequested: number;
  successful: number;
  failed: number;
  results: Array<{
    notificationId: number;
    success: boolean;
    error?: string;
  }>;
  processingTime: number;
}

export interface NotificationRetryJobResult {
  success: boolean;
  notificationId: number;
  retryCount: number;
  error?: string;
  processingTime?: number;
}

export interface NotificationCleanupJobResult {
  notificationsFound: number;
  notificationsDeleted: number;
  errors: string[];
  dryRun: boolean;
}

// ====================================================================
// OPCIONES DE TRABAJOS
// ====================================================================

export interface QueueJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: number | boolean;
  removeOnFail?: number | boolean;
  timeout?: number;
}

// ====================================================================
// ESTADOS DE COLA
// ====================================================================

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export interface QueueHealth {
  isHealthy: boolean;
  stats: QueueStats;
  lastCompletedJob?: Date;
  lastFailedJob?: Date;
  errorRate: number; // porcentaje de trabajos fallidos
  averageProcessingTime: number; // en milisegundos
}

// ====================================================================
// EVENTOS DE COLA
// ====================================================================

export interface QueueEventData {
  jobId: string | number;
  queueName: string;
  data?: any;
  result?: any;
  error?: Error;
  timestamp: Date;
}

// ====================================================================
// CONFIGURACIÓN DE COLAS
// ====================================================================

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  defaultJobOptions: QueueJobOptions;
  concurrency: {
    [QueueType.CERTIFICATE_GENERATION]: number;
    [QueueType.BULK_CERTIFICATE_GENERATION]: number;
    [QueueType.CERTIFICATE_EMAIL_RESEND]: number;
    [QueueType.CERTIFICATE_WEBHOOK]: number;
    [QueueType.CERTIFICATE_CLEANUP]: number;
    [QueueType.NOTIFICATION_SEND]: number;
    [QueueType.BULK_NOTIFICATION_SEND]: number;
    [QueueType.NOTIFICATION_RETRY]: number;
    [QueueType.NOTIFICATION_CLEANUP]: number;
  };
  retryPolicy: {
    maxAttempts: number;
    backoffDelay: number;
    backoffMultiplier: number;
  };
  monitoring: {
    enabled: boolean;
    healthCheckInterval: number; // en milisegundos
    alertThresholds: {
      errorRate: number; // porcentaje
      queueSize: number;
      processingTime: number; // en milisegundos
    };
  };
}

export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 50,
    removeOnFail: 20,
    timeout: 300000 // 5 minutos
  },
  concurrency: {
    [QueueType.CERTIFICATE_GENERATION]: 5,
    [QueueType.BULK_CERTIFICATE_GENERATION]: 2,
    [QueueType.CERTIFICATE_EMAIL_RESEND]: 10,
    [QueueType.CERTIFICATE_WEBHOOK]: 5,
    [QueueType.CERTIFICATE_CLEANUP]: 1,
    [QueueType.NOTIFICATION_SEND]: 20,
    [QueueType.BULK_NOTIFICATION_SEND]: 5,
    [QueueType.NOTIFICATION_RETRY]: 10,
    [QueueType.NOTIFICATION_CLEANUP]: 1
  },
  retryPolicy: {
    maxAttempts: 3,
    backoffDelay: 5000,
    backoffMultiplier: 2
  },
  monitoring: {
    enabled: true,
    healthCheckInterval: 60000, // 1 minuto
    alertThresholds: {
      errorRate: 10, // 10%
      queueSize: 1000,
      processingTime: 300000 // 5 minutos
    }
  }
};