/**
 * @fileoverview Servicio de Colas para Procesamiento de Streams
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Gestión de colas Redis/Bull para procesamiento de transmisiones en vivo
 *
 * Archivo: backend/src/services/streamQueueService.ts
 */

import Queue from 'bull';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { streamingService } from './streamingService';
import { virtualParticipantService } from './virtualParticipantService';

/**
 * Tipos de trabajos en cola
 */
export enum StreamJobType {
  START_STREAM = 'start_stream',
  STOP_STREAM = 'stop_stream',
  PROCESS_RECORDING = 'process_recording',
  CONVERT_VIDEO = 'convert_video',
  UPDATE_PARTICIPANT_METRICS = 'update_participant_metrics',
  CLEANUP_EXPIRED_SESSIONS = 'cleanup_expired_sessions'
}

/**
 * Datos para trabajos de stream
 */
export interface StreamJobData {
  eventId: number;
  roomId?: number;
  platform?: string;
  quality?: string;
  recordingEnabled?: boolean;
  participantId?: number;
  sessionId?: string;
}

/**
 * Servicio para manejo de colas de procesamiento de streams
 */
export class StreamQueueService {
  private startStreamQueue: Queue.Queue;
  private stopStreamQueue: Queue.Queue;
  private recordingQueue: Queue.Queue;
  private participantMetricsQueue: Queue.Queue;
  private cleanupQueue: Queue.Queue;

  constructor() {
    // Cola para iniciar streams
    this.startStreamQueue = new Queue('start_stream', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    });

    // Cola para detener streams
    this.stopStreamQueue = new Queue('stop_stream', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000
        }
      }
    });

    // Cola para procesamiento de grabaciones
    this.recordingQueue = new Queue('recording_processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000
        }
      }
    });

    // Cola para métricas de participantes
    this.participantMetricsQueue = new Queue('participant_metrics', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 20,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1000
        }
      }
    });

    // Cola para limpieza
    this.cleanupQueue = new Queue('cleanup', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 30000
        }
      }
    });

    this.setupWorkers();
    this.setupCleanupJobs();
  }

  // ====================================================================
  // GESTIÓN DE TRABAJOS
  // ====================================================================

  /**
   * Agrega trabajo para iniciar stream
   */
  async addStartStreamJob(data: StreamJobData, delay?: number): Promise<void> {
    try {
      const jobOptions: any = {};
      if (delay) {
        jobOptions.delay = delay;
      }

      await this.startStreamQueue.add(StreamJobType.START_STREAM, data, jobOptions);
      logger.info(`Trabajo de inicio de stream agregado para evento ${data.eventId}`);
    } catch (error) {
      logger.error('Error agregando trabajo de inicio de stream:', error);
      throw error;
    }
  }

  /**
   * Agrega trabajo para detener stream
   */
  async addStopStreamJob(data: StreamJobData): Promise<void> {
    try {
      await this.stopStreamQueue.add(StreamJobType.STOP_STREAM, data);
      logger.info(`Trabajo de detención de stream agregado para evento ${data.eventId}`);
    } catch (error) {
      logger.error('Error agregando trabajo de detención de stream:', error);
      throw error;
    }
  }

  /**
   * Agrega trabajo para procesar grabación
   */
  async addRecordingJob(data: StreamJobData): Promise<void> {
    try {
      await this.recordingQueue.add(StreamJobType.PROCESS_RECORDING, data);
      logger.info(`Trabajo de procesamiento de grabación agregado para evento ${data.eventId}`);
    } catch (error) {
      logger.error('Error agregando trabajo de grabación:', error);
      throw error;
    }
  }

  /**
   * Agrega trabajo para actualizar métricas de participante
   */
  async addParticipantMetricsJob(data: StreamJobData): Promise<void> {
    try {
      await this.participantMetricsQueue.add(StreamJobType.UPDATE_PARTICIPANT_METRICS, data, {
        priority: 1, // Alta prioridad
        delay: 5000 // Procesar en 5 segundos
      });
      logger.info(`Trabajo de métricas de participante agregado para ID ${data.participantId}`);
    } catch (error) {
      logger.error('Error agregando trabajo de métricas:', error);
      throw error;
    }
  }

  // ====================================================================
  // WORKERS
  // ====================================================================

  /**
   * Configura los workers para procesar trabajos
   */
  private setupWorkers(): void {
    // Worker para iniciar streams
    this.startStreamQueue.process(StreamJobType.START_STREAM, async (job) => {
      const { eventId, roomId, platform, quality, recordingEnabled } = job.data;

      try {
        logger.info(`Procesando inicio de stream para evento ${eventId}`);

        // Llamar al servicio de streaming
        const result = await streamingService.startStreaming(eventId, roomId, {
          quality: quality as any,
          record: recordingEnabled
        }, 0); // TODO: Obtener userId del sistema

        if (!result.success) {
          throw new Error(result.message);
        }

        logger.info(`Stream iniciado exitosamente para evento ${eventId}`);
        return result;
      } catch (error) {
        logger.error(`Error procesando inicio de stream para evento ${eventId}:`, error);
        throw error;
      }
    });

    // Worker para detener streams
    this.stopStreamQueue.process(StreamJobType.STOP_STREAM, async (job) => {
      const { eventId, roomId } = job.data;

      try {
        logger.info(`Procesando detención de stream para evento ${eventId}`);

        const result = await streamingService.stopStreaming(eventId, roomId, 0); // TODO: Obtener userId

        if (!result.success) {
          throw new Error(result.message);
        }

        logger.info(`Stream detenido exitosamente para evento ${eventId}`);
        return result;
      } catch (error) {
        logger.error(`Error procesando detención de stream para evento ${eventId}:`, error);
        throw error;
      }
    });

    // Worker para procesar grabaciones
    this.recordingQueue.process(StreamJobType.PROCESS_RECORDING, async (job) => {
      const { eventId, sessionId } = job.data;

      try {
        logger.info(`Procesando grabación para evento ${eventId}, sesión ${sessionId}`);

        // TODO: Implementar procesamiento de grabación
        // - Convertir formato de video
        // - Subir a storage (S3, etc.)
        // - Generar thumbnails
        // - Crear URLs de acceso

        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulación

        logger.info(`Grabación procesada exitosamente para evento ${eventId}`);
        return { success: true, message: 'Recording processed' };
      } catch (error) {
        logger.error(`Error procesando grabación para evento ${eventId}:`, error);
        throw error;
      }
    });

    // Worker para métricas de participantes
    this.participantMetricsQueue.process(StreamJobType.UPDATE_PARTICIPANT_METRICS, async (job) => {
      const { participantId, eventId } = job.data;

      try {
        if (!participantId) return;

        logger.info(`Actualizando métricas para participante ${participantId}`);

        // Simular actualización de métricas
        const engagementData = {
          timeActive: Math.floor(Math.random() * 300), // 0-5 minutos
          messagesSent: Math.floor(Math.random() * 5),
          questionsAsked: Math.floor(Math.random() * 2),
          pollsParticipated: Math.floor(Math.random() * 3),
          latency: Math.floor(Math.random() * 200) + 50 // 50-250ms
        };

        const result = await virtualParticipantService.updateParticipantEngagement(
          participantId,
          engagementData
        );

        if (!result.success) {
          throw new Error(result.message);
        }

        logger.info(`Métricas actualizadas para participante ${participantId}`);
        return result;
      } catch (error) {
        logger.error(`Error actualizando métricas para participante ${participantId}:`, error);
        throw error;
      }
    });

    // Worker para limpieza
    this.cleanupQueue.process(StreamJobType.CLEANUP_EXPIRED_SESSIONS, async (job) => {
      try {
        logger.info('Ejecutando limpieza de sesiones expiradas');

        // TODO: Implementar limpieza
        // - Cerrar sesiones expiradas
        // - Limpiar tokens expirados
        // - Liberar recursos

        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación

        logger.info('Limpieza de sesiones completada');
        return { success: true, message: 'Cleanup completed' };
      } catch (error) {
        logger.error('Error en limpieza de sesiones:', error);
        throw error;
      }
    });
  }

  // ====================================================================
  // GESTIÓN DE COLAS
  // ====================================================================

  /**
   * Configura trabajos programados de limpieza
   */
  private setupCleanupJobs(): void {
    // Limpiar sesiones expiradas cada hora
    this.cleanupQueue.add(
      StreamJobType.CLEANUP_EXPIRED_SESSIONS,
      {},
      {
        repeat: { cron: '0 * * * *' }, // Cada hora
        jobId: 'hourly_cleanup'
      }
    );
  }

  /**
   * Obtiene estadísticas de las colas
   */
  async getQueueStats(): Promise<any> {
    try {
      const [startStats, stopStats, recordingStats, metricsStats, cleanupStats] = await Promise.all([
        this.startStreamQueue.getJobCounts(),
        this.stopStreamQueue.getJobCounts(),
        this.recordingQueue.getJobCounts(),
        this.participantMetricsQueue.getJobCounts(),
        this.cleanupQueue.getJobCounts()
      ]);

      return {
        startStream: startStats,
        stopStream: stopStats,
        recording: recordingStats,
        participantMetrics: metricsStats,
        cleanup: cleanupStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de colas:', error);
      throw error;
    }
  }

  /**
   * Verifica si las colas están listas
   */
  async isReady(): Promise<boolean> {
    try {
      await Promise.all([
        this.startStreamQueue.client.ping(),
        this.stopStreamQueue.client.ping(),
        this.recordingQueue.client.ping(),
        this.participantMetricsQueue.client.ping(),
        this.cleanupQueue.client.ping()
      ]);
      return true;
    } catch (error) {
      logger.error('Error verificando estado de colas:', error);
      return false;
    }
  }

  /**
   * Cierra todas las conexiones de las colas
   */
  async close(): Promise<void> {
    try {
      await Promise.all([
        this.startStreamQueue.close(),
        this.stopStreamQueue.close(),
        this.recordingQueue.close(),
        this.participantMetricsQueue.close(),
        this.cleanupQueue.close()
      ]);
      logger.info('Conexiones de colas cerradas');
    } catch (error) {
      logger.error('Error cerrando conexiones de colas:', error);
      throw error;
    }
  }

  /**
   * Pausa todas las colas
   */
  async pauseAll(): Promise<void> {
    try {
      await Promise.all([
        this.startStreamQueue.pause(),
        this.stopStreamQueue.pause(),
        this.recordingQueue.pause(),
        this.participantMetricsQueue.pause(),
        this.cleanupQueue.pause()
      ]);
      logger.info('Todas las colas pausadas');
    } catch (error) {
      logger.error('Error pausando colas:', error);
      throw error;
    }
  }

  /**
   * Reanuda todas las colas
   */
  async resumeAll(): Promise<void> {
    try {
      await Promise.all([
        this.startStreamQueue.resume(),
        this.stopStreamQueue.resume(),
        this.recordingQueue.resume(),
        this.participantMetricsQueue.resume(),
        this.cleanupQueue.resume()
      ]);
      logger.info('Todas las colas reanudadas');
    } catch (error) {
      logger.error('Error reanudando colas:', error);
      throw error;
    }
  }
}

export const streamQueueService = new StreamQueueService();
