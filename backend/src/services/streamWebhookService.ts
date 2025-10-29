/**
 * @fileoverview Servicio de Webhooks para Streams
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Manejo de webhooks de plataformas de streaming y notificaciones push
 *
 * Archivo: backend/src/services/streamWebhookService.ts
 */

import crypto from 'crypto';
import { logger } from '../utils/logger';
import { streamingService } from './streamingService';
import { virtualParticipantService } from './virtualParticipantService';
import { streamQueueService } from './streamQueueService';
import { socketService } from './socketService';
import { AuditLog } from '../models/AuditLog';

/**
 * Tipos de eventos de webhook por plataforma
 */
export enum WebhookEventType {
  // Zoom
  ZOOM_MEETING_STARTED = 'meeting.started',
  ZOOM_MEETING_ENDED = 'meeting.ended',
  ZOOM_PARTICIPANT_JOINED = 'meeting.participant_joined',
  ZOOM_PARTICIPANT_LEFT = 'meeting.participant_left',

  // Google Meet
  GOOGLE_MEET_STARTED = 'meet.started',
  GOOGLE_MEET_ENDED = 'meet.ended',
  GOOGLE_MEET_PARTICIPANT_JOINED = 'meet.participant_joined',
  GOOGLE_MEET_PARTICIPANT_LEFT = 'meet.participant_left',

  // Microsoft Teams
  TEAMS_MEETING_STARTED = 'teams.meeting_started',
  TEAMS_MEETING_ENDED = 'teams.meeting_ended',
  TEAMS_PARTICIPANT_JOINED = 'teams.participant_joined',
  TEAMS_PARTICIPANT_LEFT = 'teams.participant_left',

  // Jitsi
  JITSI_ROOM_CREATED = 'jitsi.room_created',
  JITSI_ROOM_DESTROYED = 'jitsi.room_destroyed',
  JITSI_PARTICIPANT_JOINED = 'jitsi.participant_joined',
  JITSI_PARTICIPANT_LEFT = 'jitsi.participant_left',

  // Genéricos
  STREAM_STARTED = 'stream.started',
  STREAM_ENDED = 'stream.ended',
  STREAM_ERROR = 'stream.error',
  RECORDING_COMPLETED = 'recording.completed'
}

/**
 * Datos de webhook
 */
export interface WebhookData {
  platform: string;
  eventType: WebhookEventType;
  eventId: string;
  meetingId?: string;
  participantId?: string;
  userId?: string;
  timestamp: Date;
  payload: any;
  signature?: string;
}

/**
 * Servicio para manejo de webhooks de plataformas de streaming
 */
export class StreamWebhookService {

  // ====================================================================
  // MANEJO DE WEBHOOKS
  // ====================================================================

  /**
   * Procesa webhook de plataforma externa
   */
  async processWebhook(webhookData: WebhookData): Promise<{ success: boolean; message: string }> {
    try {
      logger.info(`Procesando webhook ${webhookData.eventType} para plataforma ${webhookData.platform}`);

      // Verificar firma si está presente
      if (webhookData.signature) {
        const isValid = await this.verifyWebhookSignature(webhookData);
        if (!isValid) {
          logger.warn(`Firma inválida para webhook ${webhookData.eventType}`);
          return { success: false, message: 'Invalid signature' };
        }
      }

      // Registrar webhook en auditoría
      await AuditLog.log(
        'webhook_received',
        'streaming',
        {
          resourceId: webhookData.eventId,
          newValues: {
            platform: webhookData.platform,
            eventType: webhookData.eventType,
            payload: JSON.stringify(webhookData.payload)
          },
          ipAddress: 'webhook',
          userAgent: webhookData.platform
        }
      );

      // Procesar según tipo de evento
      switch (webhookData.eventType) {
        case WebhookEventType.ZOOM_MEETING_STARTED:
        case WebhookEventType.GOOGLE_MEET_STARTED:
        case WebhookEventType.TEAMS_MEETING_STARTED:
        case WebhookEventType.JITSI_ROOM_CREATED:
        case WebhookEventType.STREAM_STARTED:
          await this.handleStreamStarted(webhookData);
          break;

        case WebhookEventType.ZOOM_MEETING_ENDED:
        case WebhookEventType.GOOGLE_MEET_ENDED:
        case WebhookEventType.TEAMS_MEETING_ENDED:
        case WebhookEventType.JITSI_ROOM_DESTROYED:
        case WebhookEventType.STREAM_ENDED:
          await this.handleStreamEnded(webhookData);
          break;

        case WebhookEventType.ZOOM_PARTICIPANT_JOINED:
        case WebhookEventType.GOOGLE_MEET_PARTICIPANT_JOINED:
        case WebhookEventType.TEAMS_PARTICIPANT_JOINED:
        case WebhookEventType.JITSI_PARTICIPANT_JOINED:
          await this.handleParticipantJoined(webhookData);
          break;

        case WebhookEventType.ZOOM_PARTICIPANT_LEFT:
        case WebhookEventType.GOOGLE_MEET_PARTICIPANT_LEFT:
        case WebhookEventType.TEAMS_PARTICIPANT_LEFT:
        case WebhookEventType.JITSI_PARTICIPANT_LEFT:
          await this.handleParticipantLeft(webhookData);
          break;

        case WebhookEventType.STREAM_ERROR:
          await this.handleStreamError(webhookData);
          break;

        case WebhookEventType.RECORDING_COMPLETED:
          await this.handleRecordingCompleted(webhookData);
          break;

        default:
          logger.warn(`Tipo de evento webhook no manejado: ${webhookData.eventType}`);
      }

      return { success: true, message: 'Webhook processed successfully' };

    } catch (error) {
      logger.error('Error procesando webhook:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  // ====================================================================
  // MANEJADORES DE EVENTOS
  // ====================================================================

  /**
   * Maneja evento de stream iniciado
   */
  private async handleStreamStarted(data: WebhookData): Promise<void> {
    try {
      logger.info(`Stream iniciado: ${data.eventId}`);

      // Notificar via WebSocket
      socketService.broadcastToEvent(parseInt(data.eventId), 'streamStarted', {
        platform: data.platform,
        meetingId: data.meetingId,
        timestamp: data.timestamp
      });

      // Enviar notificación push a administradores
      await this.sendAdminNotification(
        'stream_started',
        `Stream iniciado en ${data.platform}`,
        {
          eventId: data.eventId,
          platform: data.platform,
          meetingId: data.meetingId
        }
      );

    } catch (error) {
      logger.error('Error manejando stream iniciado:', error);
    }
  }

  /**
   * Maneja evento de stream terminado
   */
  private async handleStreamEnded(data: WebhookData): Promise<void> {
    try {
      logger.info(`Stream terminado: ${data.eventId}`);

      // Agregar trabajo de procesamiento de grabación si aplica
      if (data.payload?.recordingEnabled) {
        await streamQueueService.addRecordingJob({
          eventId: parseInt(data.eventId),
          sessionId: data.meetingId
        });
      }

      // Notificar via WebSocket
      socketService.broadcastToEvent(parseInt(data.eventId), 'streamEnded', {
        platform: data.platform,
        meetingId: data.meetingId,
        timestamp: data.timestamp
      });

      // Enviar notificación push a administradores
      await this.sendAdminNotification(
        'stream_ended',
        `Stream terminado en ${data.platform}`,
        {
          eventId: data.eventId,
          platform: data.platform,
          meetingId: data.meetingId
        }
      );

    } catch (error) {
      logger.error('Error manejando stream terminado:', error);
    }
  }

  /**
   * Maneja participante que se unió
   */
  private async handleParticipantJoined(data: WebhookData): Promise<void> {
    try {
      logger.info(`Participante se unió: ${data.participantId} al evento ${data.eventId}`);

      // Actualizar métricas del participante
      if (data.participantId) {
        await streamQueueService.addParticipantMetricsJob({
          eventId: parseInt(data.eventId),
          participantId: parseInt(data.participantId)
        });
      }

      // Notificar via WebSocket
      socketService.broadcastToEvent(parseInt(data.eventId), 'participantJoined', {
        participantId: data.participantId,
        userId: data.userId,
        platform: data.platform,
        timestamp: data.timestamp
      });

    } catch (error) {
      logger.error('Error manejando participante unido:', error);
    }
  }

  /**
   * Maneja participante que salió
   */
  private async handleParticipantLeft(data: WebhookData): Promise<void> {
    try {
      logger.info(`Participante salió: ${data.participantId} del evento ${data.eventId}`);

      // Actualizar métricas finales del participante
      if (data.participantId) {
        await streamQueueService.addParticipantMetricsJob({
          eventId: parseInt(data.eventId),
          participantId: parseInt(data.participantId)
        });
      }

      // Notificar via WebSocket
      socketService.broadcastToEvent(parseInt(data.eventId), 'participantLeft', {
        participantId: data.participantId,
        userId: data.userId,
        platform: data.platform,
        timestamp: data.timestamp
      });

    } catch (error) {
      logger.error('Error manejando participante salido:', error);
    }
  }

  /**
   * Maneja errores de stream
   */
  private async handleStreamError(data: WebhookData): Promise<void> {
    try {
      logger.error(`Error de stream: ${data.eventId}`, data.payload);

      // Notificar via WebSocket
      socketService.broadcastToEvent(parseInt(data.eventId), 'streamError', {
        platform: data.platform,
        error: data.payload?.error,
        timestamp: data.timestamp
      });

      // Enviar notificación crítica a administradores
      await this.sendAdminNotification(
        'stream_error',
        `Error crítico en stream de ${data.platform}`,
        {
          eventId: data.eventId,
          platform: data.platform,
          error: data.payload?.error
        },
        'critical'
      );

    } catch (error) {
      logger.error('Error manejando error de stream:', error);
    }
  }

  /**
   * Maneja grabación completada
   */
  private async handleRecordingCompleted(data: WebhookData): Promise<void> {
    try {
      logger.info(`Grabación completada: ${data.eventId}`);

      // Notificar via WebSocket
      socketService.broadcastToEvent(parseInt(data.eventId), 'recordingCompleted', {
        platform: data.platform,
        recordingUrl: data.payload?.recordingUrl,
        duration: data.payload?.duration,
        timestamp: data.timestamp
      });

      // Enviar notificación a administradores
      await this.sendAdminNotification(
        'recording_completed',
        `Grabación completada en ${data.platform}`,
        {
          eventId: data.eventId,
          platform: data.platform,
          recordingUrl: data.payload?.recordingUrl
        }
      );

    } catch (error) {
      logger.error('Error manejando grabación completada:', error);
    }
  }

  // ====================================================================
  // UTILIDADES
  // ====================================================================

  /**
   * Verifica firma de webhook
   */
  private async verifyWebhookSignature(data: WebhookData): Promise<boolean> {
    try {
      // Implementar verificación según plataforma
      switch (data.platform) {
        case 'zoom':
          return this.verifyZoomSignature(data);
        case 'microsoft_teams':
          return this.verifyTeamsSignature(data);
        default:
          // Para otras plataformas, aceptar sin verificación por ahora
          return true;
      }
    } catch (error) {
      logger.error('Error verificando firma:', error);
      return false;
    }
  }

  /**
   * Verifica firma de Zoom
   */
  private verifyZoomSignature(data: WebhookData): boolean {
    // Implementar verificación HMAC-SHA256 de Zoom
    // https://developers.zoom.us/docs/api/rest/webhook-signing/
    const secret = process.env.ZOOM_WEBHOOK_SECRET;
    if (!secret) return false;

    const message = `${data.payload.timestamp}.${JSON.stringify(data.payload)}`;
    const hash = crypto.createHmac('sha256', secret).update(message).digest('hex');

    return hash === data.signature;
  }

  /**
   * Verifica firma de Microsoft Teams
   */
  private verifyTeamsSignature(data: WebhookData): boolean {
    // Implementar verificación de Microsoft Graph webhooks
    // https://docs.microsoft.com/en-us/graph/webhooks
    return true; // TODO: Implementar verificación completa
  }

  /**
   * Envía notificación push a administradores
   */
  private async sendAdminNotification(
    type: string,
    message: string,
    data: any,
    priority: 'normal' | 'critical' = 'normal'
  ): Promise<void> {
    try {
      // TODO: Implementar envío de notificaciones push
      // - Buscar administradores en BD
      // - Enviar emails/SMS/push notifications
      // - Integrar con servicio de notificaciones existente

      logger.info(`Notificación administrativa: ${type} - ${message}`, data);

      // Por ahora, solo loggear
      // En el futuro: integrar con notificationService

    } catch (error) {
      logger.error('Error enviando notificación administrativa:', error);
    }
  }

  /**
   * Envía notificación push a participante específico
   */
  async sendParticipantNotification(
    participantId: number,
    type: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // TODO: Implementar notificación específica a participante
      // Por ahora, solo loggear
      logger.info(`Notificación a participante ${participantId}: ${type} - ${message}`, data);

    } catch (error) {
      logger.error('Error enviando notificación a participante:', error);
    }
  }

  /**
   * Envía notificación a todos los participantes de un evento
   */
  async broadcastToEvent(
    eventId: number,
    type: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // Usar el método existente de socketService
      socketService.broadcastToEvent(eventId, type, {
        message,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error enviando broadcast a evento:', error);
    }
  }
}

export const streamWebhookService = new StreamWebhookService();
