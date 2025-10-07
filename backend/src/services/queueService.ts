/**
 * @fileoverview Servicio de Colas para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Gestión de colas Bull para procesamiento asíncrono de certificados
 *
 * Archivo: backend/src/services/queueService.ts
 */

import Queue, { Job, JobOptions } from 'bull';
import {
  QueueType,
  CertificateGenerationJobData,
  BulkCertificateGenerationJobData,
  CertificateEmailResendJobData,
  CertificateWebhookJobData,
  CertificateCleanupJobData,
  CertificateGenerationJobResult,
  BulkCertificateGenerationJobResult,
  CertificateEmailResendJobResult,
  CertificateWebhookJobResult,
  CertificateCleanupJobResult,
  NotificationSendJobData,
  BulkNotificationSendJobData,
  NotificationRetryJobData,
  NotificationCleanupJobData,
  NotificationSendJobResult,
  BulkNotificationSendJobResult,
  NotificationRetryJobResult,
  NotificationCleanupJobResult,
  QueueJobOptions,
  QueueStats,
  QueueHealth,
  DEFAULT_QUEUE_CONFIG
} from '../types/queue.types';
import { certificateService } from './certificateService';
import { emailService } from './emailService';
import { notificationService } from './notificationService';
import { logger } from '../utils/logger';
import { config } from '../config/environment';

export class QueueService {
  private queues: Map<QueueType, Queue.Queue> = new Map();
  private isInitialized = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeQueues();
  }

  // ====================================================================
  // INICIALIZACIÓN
  // ====================================================================

  /**
   * Inicializa todas las colas
   */
  private initializeQueues(): void {
    try {
      // Cola de generación individual de certificados
      this.createQueue(QueueType.CERTIFICATE_GENERATION, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.CERTIFICATE_GENERATION]
      });

      // Cola de generación masiva de certificados
      this.createQueue(QueueType.BULK_CERTIFICATE_GENERATION, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.BULK_CERTIFICATE_GENERATION]
      });

      // Cola de reenvío de emails
      this.createQueue(QueueType.CERTIFICATE_EMAIL_RESEND, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.CERTIFICATE_EMAIL_RESEND]
      });

      // Cola de webhooks
      this.createQueue(QueueType.CERTIFICATE_WEBHOOK, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.CERTIFICATE_WEBHOOK]
      });

      // Cola de limpieza
      this.createQueue(QueueType.CERTIFICATE_CLEANUP, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.CERTIFICATE_CLEANUP]
      });

      // Colas de notificaciones
      this.createQueue(QueueType.NOTIFICATION_SEND, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.NOTIFICATION_SEND]
      });

      this.createQueue(QueueType.BULK_NOTIFICATION_SEND, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.BULK_NOTIFICATION_SEND]
      });

      this.createQueue(QueueType.NOTIFICATION_RETRY, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.NOTIFICATION_RETRY]
      });

      this.createQueue(QueueType.NOTIFICATION_CLEANUP, {
        concurrency: DEFAULT_QUEUE_CONFIG.concurrency[QueueType.NOTIFICATION_CLEANUP]
      });

      this.setupEventHandlers();
      this.startHealthMonitoring();

      this.isInitialized = true;
      logger.info('Queue service initialized successfully');
    } catch (error) {
      logger.error('Error initializing queue service:', error);
      throw error;
    }
  }

  /**
   * Crea una cola específica
   */
  private createQueue(queueType: QueueType, options: { concurrency: number }): void {
    const queue = new Queue(queueType, {
      redis: DEFAULT_QUEUE_CONFIG.redis,
      defaultJobOptions: DEFAULT_QUEUE_CONFIG.defaultJobOptions
    });

    // Configurar procesadores
    this.setupQueueProcessor(queue, queueType, options.concurrency);

    this.queues.set(queueType, queue);
  }

  /**
   * Configura el procesador para una cola
   */
  private setupQueueProcessor(queue: Queue.Queue, queueType: QueueType, concurrency: number): void {
    queue.process(concurrency, async (job: Job) => {
      const startTime = Date.now();

      try {
        logger.info(`Processing job ${job.id} in queue ${queueType}`, { jobData: job.data });

        let result: any;

        switch (queueType) {
          case QueueType.CERTIFICATE_GENERATION:
            result = await this.processCertificateGeneration(job.data as CertificateGenerationJobData);
            break;

          case QueueType.BULK_CERTIFICATE_GENERATION:
            result = await this.processBulkCertificateGeneration(job.data as BulkCertificateGenerationJobData);
            break;

          case QueueType.CERTIFICATE_EMAIL_RESEND:
            result = await this.processCertificateEmailResend(job.data as CertificateEmailResendJobData);
            break;

          case QueueType.CERTIFICATE_WEBHOOK:
            result = await this.processCertificateWebhook(job.data as CertificateWebhookJobData);
            break;

          case QueueType.CERTIFICATE_CLEANUP:
            result = await this.processCertificateCleanup(job.data as CertificateCleanupJobData);
            break;

          case QueueType.NOTIFICATION_SEND:
            result = await this.processNotificationSend(job.data as NotificationSendJobData);
            break;

          case QueueType.BULK_NOTIFICATION_SEND:
            result = await this.processBulkNotificationSend(job.data as BulkNotificationSendJobData);
            break;

          case QueueType.NOTIFICATION_RETRY:
            result = await this.processNotificationRetry(job.data as NotificationRetryJobData);
            break;

          case QueueType.NOTIFICATION_CLEANUP:
            result = await this.processNotificationCleanup(job.data as NotificationCleanupJobData);
            break;

          default:
            throw new Error(`Unknown queue type: ${queueType}`);
        }

        const processingTime = Date.now() - startTime;
        logger.info(`Job ${job.id} completed successfully in ${processingTime}ms`, { result });

        return {
          ...result,
          processingTime
        };

      } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error(`Job ${job.id} failed after ${processingTime}ms:`, error);

        throw error;
      }
    });
  }

  /**
   * Configura manejadores de eventos para todas las colas
   */
  private setupEventHandlers(): void {
    for (const [queueType, queue] of this.queues) {
      queue.on('completed', (job, result) => {
        logger.info(`Job ${job.id} completed in queue ${queueType}`, { result });
      });

      queue.on('failed', (job, err) => {
        logger.error(`Job ${job.id} failed in queue ${queueType}:`, err);
      });

      queue.on('stalled', (job) => {
        logger.warn(`Job ${job.id} stalled in queue ${queueType}`);
      });

      queue.on('waiting', (jobId) => {
        logger.debug(`Job ${jobId} waiting in queue ${queueType}`);
      });

      queue.on('active', (job) => {
        logger.debug(`Job ${job.id} active in queue ${queueType}`);
      });
    }
  }

  // ====================================================================
  // PROCESADORES DE TRABAJOS
  // ====================================================================

  /**
   * Procesa generación individual de certificado
   */
  private async processCertificateGeneration(data: CertificateGenerationJobData): Promise<CertificateGenerationJobResult> {
    try {
      const result = await certificateService.generateCertificate({
        eventId: data.eventId,
        userId: data.userId,
        registrationId: data.registrationId,
        templateId: data.templateId,
        certificateType: data.certificateType as any,
        customData: data.customData
      }, data.createdBy);

      return {
        success: result.success,
        certificateId: result.data?.id,
        certificateNumber: result.data?.certificateNumber,
        pdfUrl: result.data?.pdfUrl,
        blockchainTxHash: result.data?.blockchainTxHash,
        error: result.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Procesa generación masiva de certificados
   */
  private async processBulkCertificateGeneration(data: BulkCertificateGenerationJobData): Promise<BulkCertificateGenerationJobResult> {
    try {
      const result = await certificateService.generateBulkCertificates({
        eventId: data.eventId,
        userIds: data.userIds,
        templateId: data.templateId,
        certificateType: data.certificateType as any,
        eligibilityCriteria: data.eligibilityCriteria
      }, data.createdBy);

      const certificates = (result.data?.certificates || []).map((cert: any) => ({
        userId: cert.userId,
        certificateId: cert.id,
        certificateNumber: cert.certificateNumber,
        success: true
      }));

      return {
        totalRequested: data.userIds.length,
        successful: certificates.length,
        failed: data.userIds.length - certificates.length,
        certificates,
        processingTime: 0 // Se calcula en el procesador principal
      };
    } catch (error) {
      return {
        totalRequested: data.userIds.length,
        successful: 0,
        failed: data.userIds.length,
        certificates: [],
        processingTime: 0
      };
    }
  }

  /**
   * Procesa reenvío de email de certificado
   */
  private async processCertificateEmailResend(data: CertificateEmailResendJobData): Promise<CertificateEmailResendJobResult> {
    try {
      // TODO: Implementar envío de email con certificado adjunto
      // Por ahora, simulamos éxito
      return {
        success: true,
        emailSent: true,
        messageId: `msg_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        emailSent: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Procesa envío de webhook
   */
  private async processCertificateWebhook(data: CertificateWebhookJobData): Promise<CertificateWebhookJobResult> {
    try {
      // TODO: Implementar envío de webhook con firma HMAC
      // Por ahora, simulamos éxito
      return {
        success: true,
        responseStatus: 200,
        responseBody: { received: true },
        retryCount: data.retryCount || 0
      };
    } catch (error) {
      return {
        success: false,
        retryCount: (data.retryCount || 0) + 1,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Procesa limpieza de certificados antiguos
   */
  private async processCertificateCleanup(data: CertificateCleanupJobData): Promise<CertificateCleanupJobResult> {
    try {
      // TODO: Implementar limpieza de certificados antiguos
      // Por ahora, simulamos resultados
      return {
        certificatesFound: 0,
        certificatesDeleted: 0,
        filesRemoved: 0,
        errors: [],
        dryRun: data.dryRun || false
      };
    } catch (error) {
      return {
        certificatesFound: 0,
        certificatesDeleted: 0,
        filesRemoved: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        dryRun: data.dryRun || false
      };
    }
  }

  /**
   * Procesa envío de notificación individual
   */
  private async processNotificationSend(data: NotificationSendJobData): Promise<NotificationSendJobResult> {
    try {
      // TODO: Implementar envío de notificación individual
      // Por ahora, simulamos éxito
      return {
        success: true,
        notificationId: data.notificationId
      };
    } catch (error) {
      return {
        success: false,
        notificationId: data.notificationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Procesa envío masivo de notificaciones
   */
  private async processBulkNotificationSend(data: BulkNotificationSendJobData): Promise<BulkNotificationSendJobResult> {
    try {
      // TODO: Implementar envío masivo de notificaciones
      // Por ahora, simulamos resultados
      return {
        totalRequested: data.notificationIds.length,
        successful: data.notificationIds.length,
        failed: 0,
        results: data.notificationIds.map(id => ({
          notificationId: id,
          success: true
        })),
        processingTime: 0 // Se calcula en el procesador principal
      };
    } catch (error) {
      return {
        totalRequested: data.notificationIds.length,
        successful: 0,
        failed: data.notificationIds.length,
        results: data.notificationIds.map(id => ({
          notificationId: id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })),
        processingTime: 0
      };
    }
  }

  /**
   * Procesa reintento de notificación
   */
  private async processNotificationRetry(data: NotificationRetryJobData): Promise<NotificationRetryJobResult> {
    try {
      // TODO: Implementar reintento de notificación
      // Por ahora, simulamos éxito
      return {
        success: true,
        notificationId: data.notificationId,
        retryCount: 1
      };
    } catch (error) {
      return {
        success: false,
        notificationId: data.notificationId,
        retryCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Procesa limpieza de notificaciones antiguas
   */
  private async processNotificationCleanup(data: NotificationCleanupJobData): Promise<NotificationCleanupJobResult> {
    try {
      // TODO: Implementar limpieza de notificaciones antiguas
      // Por ahora, simulamos resultados
      return {
        notificationsFound: 0,
        notificationsDeleted: 0,
        errors: [],
        dryRun: data.dryRun || false
      };
    } catch (error) {
      return {
        notificationsFound: 0,
        notificationsDeleted: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        dryRun: data.dryRun || false
      };
    }
  }

  // ====================================================================
  // MÉTODOS PÚBLICOS PARA ENCOLAR TRABAJOS
  // ====================================================================

  /**
   * Agrega trabajo de generación de certificado individual
   */
  async addCertificateGenerationJob(data: CertificateGenerationJobData, options?: QueueJobOptions): Promise<Job> {
    const queue = this.queues.get(QueueType.CERTIFICATE_GENERATION);
    if (!queue) throw new Error('Certificate generation queue not initialized');

    return queue.add(data, {
      priority: data.priority || 1,
      ...options
    });
  }

  /**
   * Agrega trabajo de generación masiva de certificados
   */
  async addBulkCertificateGenerationJob(data: BulkCertificateGenerationJobData, options?: QueueJobOptions): Promise<Job> {
    const queue = this.queues.get(QueueType.BULK_CERTIFICATE_GENERATION);
    if (!queue) throw new Error('Bulk certificate generation queue not initialized');

    return queue.add(data, {
      priority: data.priority || 2,
      ...options
    });
  }

  /**
   * Agrega trabajo de reenvío de email
   */
  async addCertificateEmailResendJob(data: CertificateEmailResendJobData, options?: QueueJobOptions): Promise<Job> {
    const queue = this.queues.get(QueueType.CERTIFICATE_EMAIL_RESEND);
    if (!queue) throw new Error('Certificate email resend queue not initialized');

    return queue.add(data, {
      priority: data.priority || 3,
      ...options
    });
  }

  /**
   * Agrega trabajo de webhook
   */
  async addCertificateWebhookJob(data: CertificateWebhookJobData, options?: QueueJobOptions): Promise<Job> {
    const queue = this.queues.get(QueueType.CERTIFICATE_WEBHOOK);
    if (!queue) throw new Error('Certificate webhook queue not initialized');

    return queue.add(data, {
      priority: data.priority || 4,
      ...options
    });
  }

  /**
    * Agrega trabajo de limpieza
    */
   async addCertificateCleanupJob(data: CertificateCleanupJobData, options?: QueueJobOptions): Promise<Job> {
     const queue = this.queues.get(QueueType.CERTIFICATE_CLEANUP);
     if (!queue) throw new Error('Certificate cleanup queue not initialized');

     return queue.add(data, {
       priority: data.priority || 5,
       ...options
     });
   }

   // ====================================================================
   // MÉTODOS PÚBLICOS PARA ENCOLAR TRABAJOS DE NOTIFICACIONES
   // ====================================================================

   /**
    * Agrega trabajo de envío de notificación individual
    */
   async addNotificationSendJob(data: NotificationSendJobData, options?: QueueJobOptions): Promise<Job> {
     const queue = this.queues.get(QueueType.NOTIFICATION_SEND);
     if (!queue) throw new Error('Notification send queue not initialized');

     return queue.add(data, {
       priority: data.priority || 1,
       ...options
     });
   }

   /**
    * Agrega trabajo de envío masivo de notificaciones
    */
   async addBulkNotificationSendJob(data: BulkNotificationSendJobData, options?: QueueJobOptions): Promise<Job> {
     const queue = this.queues.get(QueueType.BULK_NOTIFICATION_SEND);
     if (!queue) throw new Error('Bulk notification send queue not initialized');

     return queue.add(data, {
       priority: data.priority || 2,
       ...options
     });
   }

   /**
    * Agrega trabajo de reintento de notificación
    */
   async addNotificationRetryJob(data: NotificationRetryJobData, options?: QueueJobOptions): Promise<Job> {
     const queue = this.queues.get(QueueType.NOTIFICATION_RETRY);
     if (!queue) throw new Error('Notification retry queue not initialized');

     return queue.add(data, {
       priority: data.priority || 3,
       ...options
     });
   }

   /**
    * Agrega trabajo de limpieza de notificaciones
    */
   async addNotificationCleanupJob(data: NotificationCleanupJobData, options?: QueueJobOptions): Promise<Job> {
     const queue = this.queues.get(QueueType.NOTIFICATION_CLEANUP);
     if (!queue) throw new Error('Notification cleanup queue not initialized');

     return queue.add(data, {
       priority: data.priority || 4,
       ...options
     });
   }

  // ====================================================================
  // MONITOREO Y ESTADÍSTICAS
  // ====================================================================

  /**
   * Obtiene estadísticas de todas las colas
   */
  async getAllQueueStats(): Promise<Record<QueueType, QueueStats>> {
    const stats: Partial<Record<QueueType, QueueStats>> = {};

    for (const [queueType, queue] of this.queues) {
      stats[queueType] = await this.getQueueStats(queueType);
    }

    return stats as Record<QueueType, QueueStats>;
  }

  /**
   * Obtiene estadísticas de una cola específica
   */
  async getQueueStats(queueType: QueueType): Promise<QueueStats> {
    const queue = this.queues.get(queueType);
    if (!queue) throw new Error(`Queue ${queueType} not initialized`);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed()
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: await queue.isPaused()
    };
  }

  /**
   * Obtiene estado de salud de todas las colas
   */
  async getHealthStatus(): Promise<Record<QueueType, QueueHealth>> {
    const health: Partial<Record<QueueType, QueueHealth>> = {};

    for (const queueType of Object.values(QueueType)) {
      health[queueType] = await this.getQueueHealth(queueType);
    }

    return health as Record<QueueType, QueueHealth>;
  }

  /**
   * Obtiene estado de salud de una cola específica
   */
  async getQueueHealth(queueType: QueueType): Promise<QueueHealth> {
    const queue = this.queues.get(queueType);
    if (!queue) throw new Error(`Queue ${queueType} not initialized`);

    const stats = await this.getQueueStats(queueType);
    const totalJobs = stats.waiting + stats.active + stats.completed + stats.failed;

    // Calcular tasa de error
    const errorRate = totalJobs > 0 ? (stats.failed / totalJobs) * 100 : 0;

    // Obtener tiempos de procesamiento promedio
    let averageProcessingTime = 0;
    try {
      const completedJobs = await queue.getCompleted(0, 100);
      if (completedJobs.length > 0) {
        const totalTime = completedJobs.reduce((sum, job) => {
          const result = job.returnvalue as any;
          return sum + (result?.processingTime || 0);
        }, 0);
        averageProcessingTime = totalTime / completedJobs.length;
      }
    } catch (error) {
      logger.warn(`Error calculating average processing time for queue ${queueType}:`, error);
    }

    // Determinar si está saludable
    const isHealthy = errorRate < DEFAULT_QUEUE_CONFIG.monitoring.alertThresholds.errorRate &&
                     stats.waiting < DEFAULT_QUEUE_CONFIG.monitoring.alertThresholds.queueSize &&
                     averageProcessingTime < DEFAULT_QUEUE_CONFIG.monitoring.alertThresholds.processingTime;

    return {
      isHealthy,
      stats,
      errorRate,
      averageProcessingTime
    };
  }

  /**
   * Inicia monitoreo de salud
   */
  private startHealthMonitoring(): void {
    if (!DEFAULT_QUEUE_CONFIG.monitoring.enabled) return;

    this.healthCheckInterval = setInterval(async () => {
      try {
        const healthStatus = await this.getHealthStatus();

        // Log alertas si hay problemas
        for (const [queueType, health] of Object.entries(healthStatus)) {
          if (!health.isHealthy) {
            logger.warn(`Queue ${queueType} health check failed`, {
              errorRate: health.errorRate,
              queueSize: health.stats.waiting,
              processingTime: health.averageProcessingTime
            });
          }
        }
      } catch (error) {
        logger.error('Error during health monitoring:', error);
      }
    }, DEFAULT_QUEUE_CONFIG.monitoring.healthCheckInterval);
  }

  // ====================================================================
  // GESTIÓN DE COLAS
  // ====================================================================

  /**
   * Pausa una cola
   */
  async pauseQueue(queueType: QueueType): Promise<void> {
    const queue = this.queues.get(queueType);
    if (!queue) throw new Error(`Queue ${queueType} not initialized`);

    await queue.pause();
    logger.info(`Queue ${queueType} paused`);
  }

  /**
   * Reanuda una cola
   */
  async resumeQueue(queueType: QueueType): Promise<void> {
    const queue = this.queues.get(queueType);
    if (!queue) throw new Error(`Queue ${queueType} not initialized`);

    await queue.resume();
    logger.info(`Queue ${queueType} resumed`);
  }

  /**
   * Vacía una cola
   */
  async emptyQueue(queueType: QueueType): Promise<void> {
    const queue = this.queues.get(queueType);
    if (!queue) throw new Error(`Queue ${queueType} not initialized`);

    await queue.empty();
    logger.info(`Queue ${queueType} emptied`);
  }

  /**
   * Cierra todas las colas
   */
  async close(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    for (const [queueType, queue] of this.queues) {
      await queue.close();
      logger.info(`Queue ${queueType} closed`);
    }

    this.queues.clear();
    this.isInitialized = false;
  }

  /**
   * Verifica si el servicio está inicializado
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const queueService = new QueueService();