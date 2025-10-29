/**
 * @fileoverview Servicio de Streaming para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para control de transmisiones en vivo
 *
 * Archivo: backend/src/services/streamingService.ts
 */

import { StreamingConfig } from '../models/StreamingConfig';
import { HybridEvent } from '../models/HybridEvent';
import { VirtualRoom } from '../models/VirtualRoom';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  StreamingStatus,
  StreamQuality,
  RecordingStatus,
  StreamingPlatform
} from '../types/hybrid.types';
import {
  StartStreamingRequest,
  StopStreamingRequest,
  StreamingSession,
  StreamingMetrics,
  PlatformCredentials,
  StreamingSessionStatus
} from '../types/streaming.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { EventEmitter } from 'events';
import { cacheService } from './cacheService';

/**
 * Servicio para manejo de operaciones de streaming
 */
export class StreamingService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // OPERACIONES DE CONTROL DE STREAMING
  // ====================================================================

  /**
   * Inicia una sesión de streaming
   */
  async startStreaming(
    hybridEventId: number,
    roomId: number | undefined,
    request: StartStreamingRequest,
    startedBy: number
  ): Promise<ApiResponse<StreamingSession>> {
    try {
      // Verificar que existe el evento híbrido
      const hybridEvent = await HybridEvent.findByPk(hybridEventId);
      if (!hybridEvent) {
        return {
          success: false,
          message: 'Evento híbrido no encontrado',
          error: 'HYBRID_EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el creador puede iniciar streaming)
      if (hybridEvent.createdBy !== startedBy) {
        return {
          success: false,
          message: 'No tiene permisos para iniciar streaming en este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar sala si se especifica
      let room: VirtualRoom | undefined;
      if (roomId) {
        room = await VirtualRoom.findByPk(roomId) || undefined;
        if (!room || room.hybridEventId !== hybridEventId) {
          return {
            success: false,
            message: 'Sala virtual no encontrada o no pertenece al evento',
            error: 'ROOM_NOT_FOUND',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Verificar que no haya una sesión activa
      const activeSession = await StreamingConfig.findOne({
        where: {
          hybridEventId,
          sessionId: roomId ? roomId.toString() : undefined,
          status: StreamingStatus.ACTIVE
        }
      });

      if (activeSession) {
        return {
          success: false,
          message: 'Ya existe una sesión de streaming activa',
          error: 'STREAMING_ALREADY_ACTIVE',
          timestamp: new Date().toISOString()
        };
      }

      // Crear nueva sesión de streaming
      const sessionId = this.generateSessionId();
      const streamingConfig = await StreamingConfig.create({
        hybridEventId,
        sessionId,
        status: StreamingStatus.STARTING,
        title: request.title || `Streaming ${hybridEvent.event?.title}`,
        description: request.description,
        startTime: new Date(),
        isActive: true,
        createdBy: startedBy
      });

      // Iniciar streaming según plataforma
      const platformResult = await this.startPlatformStreaming(
        hybridEvent,
        room,
        streamingConfig,
        request
      );

      if (!platformResult.success) {
        // Marcar como error si falla
        await streamingConfig.update({ status: StreamingStatus.ERROR });
        return platformResult;
      }

      // Actualizar estado a activo
      await streamingConfig.update({
        status: StreamingStatus.ACTIVE,
        streamUrl: platformResult.data?.streamUrl,
        viewerUrl: platformResult.data?.viewerUrl
      });

      // Registrar en auditoría
      await AuditLog.log(
        'streaming_started',
        'streaming_config',
        {
          userId: startedBy,
          resourceId: streamingConfig.id.toString(),
          newValues: {
            sessionId,
            platform: hybridEvent.streamingPlatform,
            roomId
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(hybridEventId);

      // Emitir evento
      this.eventEmitter.emit('StreamingStarted', {
        hybridEventId,
        roomId,
        sessionId,
        streamingConfig: streamingConfig.toDetailedJSON(),
        startedBy
      });

      const session: StreamingSession = {
        id: streamingConfig.id,
        sessionId,
        status: StreamingSessionStatus.LIVE,
        platform: hybridEvent.streamingPlatform,
        streamUrl: streamingConfig.streamUrl,
        viewerUrl: streamingConfig.viewerUrl,
        startTime: streamingConfig.startTime || new Date(),
        title: streamingConfig.title || '',
        description: streamingConfig.description
      };

      return {
        success: true,
        message: 'Sesión de streaming iniciada exitosamente',
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error iniciando streaming:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detiene una sesión de streaming
   */
  async stopStreaming(
    hybridEventId: number,
    sessionId: string,
    stoppedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      // Buscar sesión activa
      const streamingConfig = await StreamingConfig.findOne({
        where: {
          hybridEventId,
          sessionId,
          status: StreamingStatus.ACTIVE
        },
        include: [{ model: HybridEvent, as: 'hybridEvent' }]
      });

      if (!streamingConfig) {
        return {
          success: false,
          message: 'Sesión de streaming no encontrada o no está activa',
          error: 'STREAMING_SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (streamingConfig.hybridEvent!.createdBy !== stoppedBy) {
        return {
          success: false,
          message: 'No tiene permisos para detener este streaming',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Detener streaming en la plataforma
      await this.stopPlatformStreaming(streamingConfig);

      // Actualizar estado
      await streamingConfig.update({
        status: StreamingStatus.STOPPED,
        endTime: new Date()
      });

      // Calcular duración
      if (streamingConfig.startTime) {
        const duration = Math.floor((Date.now() - streamingConfig.startTime.getTime()) / 1000);
        await streamingConfig.update({ duration });
      }

      // Registrar en auditoría
      await AuditLog.log(
        'streaming_stopped',
        'streaming_config',
        {
          userId: stoppedBy,
          resourceId: streamingConfig.id.toString(),
          oldValues: { status: StreamingStatus.ACTIVE },
          newValues: {
            status: StreamingStatus.STOPPED,
            endTime: streamingConfig.endTime,
            duration: streamingConfig.duration
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(hybridEventId);

      // Emitir evento
      this.eventEmitter.emit('StreamingStopped', {
        hybridEventId,
        sessionId,
        streamingConfig: streamingConfig.toDetailedJSON(),
        stoppedBy
      });

      return {
        success: true,
        message: 'Sesión de streaming detenida exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error deteniendo streaming:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene métricas de streaming
   */
  async getStreamingMetrics(
    hybridEventId: number,
    sessionId?: string
  ): Promise<ApiResponse<StreamingMetrics>> {
    try {
      const where: any = { hybridEventId, isActive: true };

      if (sessionId) {
        where.sessionId = sessionId;
      }

      const streamingConfigs = await StreamingConfig.findAll({
        where,
        include: [{ model: HybridEvent, as: 'hybridEvent' }]
      });

      if (streamingConfigs.length === 0) {
        return {
          success: false,
          message: 'No se encontraron sesiones de streaming',
          error: 'NO_STREAMING_SESSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular métricas agregadas
      const metrics: StreamingMetrics = {
        eventId: hybridEventId,
        timestamp: new Date(),
        concurrentViewers: 0, // TODO: Implementar conteo real de espectadores
        totalParticipants: 0, // TODO: Implementar conteo real de participantes
        averageBitrate: 0,
        averageLatency: 0,
        packetLoss: 0,
        messagesSent: 0,
        questionsAsked: 0,
        pollsCreated: 0,
        recordingsCreated: streamingConfigs.filter(s => s.recordingConfig?.enabled).length
      };

      return {
        success: true,
        message: 'Métricas de streaming obtenidas exitosamente',
        data: metrics,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo métricas de streaming:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // INTEGRACIÓN CON PLATAFORMAS
  // ====================================================================

  /**
   * Inicia streaming en la plataforma específica
   */
  private async startPlatformStreaming(
    hybridEvent: HybridEvent,
    room: VirtualRoom | undefined,
    streamingConfig: StreamingConfig,
    request: StartStreamingRequest
  ): Promise<ApiResponse<any>> {
    try {
      switch (hybridEvent.streamingPlatform) {
        case 'zoom':
          return await this.startZoomStreaming(hybridEvent, room, streamingConfig, request);

        case 'google_meet':
          return await this.startGoogleMeetStreaming(hybridEvent, room, streamingConfig, request);

        case 'microsoft_teams':
          return await this.startTeamsStreaming(hybridEvent, room, streamingConfig, request);

        case 'jitsi':
          return await this.startJitsiStreaming(hybridEvent, room, streamingConfig, request);

        case 'custom_streaming':
          return await this.startCustomStreaming(hybridEvent, room, streamingConfig, request);

        default:
          return {
            success: false,
            message: 'Plataforma de streaming no soportada',
            error: 'UNSUPPORTED_PLATFORM',
            timestamp: new Date().toISOString()
          };
      }
    } catch (error) {
      logger.error('Error iniciando streaming en plataforma:', error);
      return {
        success: false,
        message: 'Error al iniciar streaming en la plataforma',
        error: 'PLATFORM_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detiene streaming en la plataforma específica
   */
  private async stopPlatformStreaming(streamingConfig: StreamingConfig): Promise<void> {
    try {
      const hybridEvent = streamingConfig.hybridEvent;

      switch (hybridEvent?.streamingPlatform) {
        case 'zoom':
          await this.stopZoomStreaming(streamingConfig);
          break;

        case 'google_meet':
          await this.stopGoogleMeetStreaming(streamingConfig);
          break;

        case 'microsoft_teams':
          await this.stopTeamsStreaming(streamingConfig);
          break;

        case 'jitsi':
          await this.stopJitsiStreaming(streamingConfig);
          break;

        case 'custom_streaming':
          await this.stopCustomStreaming(streamingConfig);
          break;
      }
    } catch (error) {
      logger.error('Error deteniendo streaming en plataforma:', error);
      // No lanzamos error para no interrumpir el proceso de detención
    }
  }

  /**
   * Inicia streaming en Zoom
   */
  private async startZoomStreaming(
    hybridEvent: HybridEvent,
    room: VirtualRoom | undefined,
    streamingConfig: StreamingConfig,
    request: StartStreamingRequest
  ): Promise<ApiResponse<any>> {
    try {
      // TODO: Implementar integración real con Zoom API
      // Por ahora simulamos la respuesta

      const meetingId = hybridEvent.zoomMeetingId || this.generateMeetingId();
      const joinUrl = hybridEvent.zoomJoinUrl || `https://zoom.us/j/${meetingId}`;
      const startUrl = hybridEvent.zoomStartUrl || `https://zoom.us/s/${meetingId}`;

      // Actualizar datos de Zoom en el evento híbrido
      await hybridEvent.update({
        zoomMeetingId: meetingId,
        zoomJoinUrl: joinUrl,
        zoomStartUrl: startUrl
      });

      return {
        success: true,
        message: 'Streaming de Zoom iniciado exitosamente',
        data: {
          meetingId,
          joinUrl,
          startUrl,
          streamUrl: joinUrl,
          viewerUrl: joinUrl
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error iniciando streaming en Zoom:', error);
      return {
        success: false,
        message: 'Error al iniciar streaming en Zoom',
        error: 'ZOOM_API_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Inicia streaming en Google Meet
   */
  private async startGoogleMeetStreaming(
    hybridEvent: HybridEvent,
    room: VirtualRoom | undefined,
    streamingConfig: StreamingConfig,
    request: StartStreamingRequest
  ): Promise<ApiResponse<any>> {
    try {
      // TODO: Implementar integración real con Google Meet API
      const meetUrl = hybridEvent.googleMeetUrl || `https://meet.google.com/${this.generateMeetingId()}`;

      // Actualizar URL de Google Meet
      await hybridEvent.update({ googleMeetUrl: meetUrl });

      return {
        success: true,
        message: 'Streaming de Google Meet iniciado exitosamente',
        data: {
          meetUrl,
          streamUrl: meetUrl,
          viewerUrl: meetUrl
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error iniciando streaming en Google Meet:', error);
      return {
        success: false,
        message: 'Error al iniciar streaming en Google Meet',
        error: 'GOOGLE_MEET_API_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Inicia streaming en Microsoft Teams
   */
  private async startTeamsStreaming(
    hybridEvent: HybridEvent,
    room: VirtualRoom | undefined,
    streamingConfig: StreamingConfig,
    request: StartStreamingRequest
  ): Promise<ApiResponse<any>> {
    try {
      // TODO: Implementar integración real con Microsoft Graph API
      const teamsUrl = hybridEvent.teamsMeetingUrl || `https://teams.microsoft.com/meeting/${this.generateMeetingId()}`;

      // Actualizar URL de Teams
      await hybridEvent.update({ teamsMeetingUrl: teamsUrl });

      return {
        success: true,
        message: 'Streaming de Microsoft Teams iniciado exitosamente',
        data: {
          teamsUrl,
          streamUrl: teamsUrl,
          viewerUrl: teamsUrl
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error iniciando streaming en Microsoft Teams:', error);
      return {
        success: false,
        message: 'Error al iniciar streaming en Microsoft Teams',
        error: 'TEAMS_API_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Inicia streaming en Jitsi
   */
  private async startJitsiStreaming(
    hybridEvent: HybridEvent,
    room: VirtualRoom | undefined,
    streamingConfig: StreamingConfig,
    request: StartStreamingRequest
  ): Promise<ApiResponse<any>> {
    try {
      // Usar configuración existente de Jitsi o generar nueva
      const roomName = hybridEvent.jitsiRoomName || this.generateMeetingId();
      const domain = hybridEvent.jitsiDomain || 'meet.jit.si';
      const jwtToken = hybridEvent.jitsiJwtToken;

      const jitsiUrl = `https://${domain}/${roomName}`;

      // Actualizar configuración de Jitsi en el evento híbrido
      await hybridEvent.update({
        jitsiRoomName: roomName,
        jitsiDomain: domain
      });

      return {
        success: true,
        message: 'Streaming de Jitsi iniciado exitosamente',
        data: {
          roomName,
          domain,
          jwtToken,
          jitsiUrl,
          streamUrl: jitsiUrl,
          viewerUrl: jitsiUrl
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error iniciando streaming en Jitsi:', error);
      return {
        success: false,
        message: 'Error al iniciar streaming en Jitsi',
        error: 'JITSI_API_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Inicia streaming personalizado
   */
  private async startCustomStreaming(
    hybridEvent: HybridEvent,
    room: VirtualRoom | undefined,
    streamingConfig: StreamingConfig,
    request: StartStreamingRequest
  ): Promise<ApiResponse<any>> {
    try {
      // Para streaming personalizado, usar los datos existentes
      const streamUrl = hybridEvent.customStreamUrl;
      const streamKey = hybridEvent.customStreamKey;

      if (!streamUrl) {
        return {
          success: false,
          message: 'URL de streaming personalizado no configurada',
          error: 'CUSTOM_STREAMING_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Streaming personalizado iniciado exitosamente',
        data: {
          streamUrl,
          streamKey,
          viewerUrl: streamUrl
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error iniciando streaming personalizado:', error);
      return {
        success: false,
        message: 'Error al iniciar streaming personalizado',
        error: 'CUSTOM_STREAMING_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detiene streaming en Zoom
   */
  private async stopZoomStreaming(streamingConfig: StreamingConfig): Promise<void> {
    // TODO: Implementar llamada a Zoom API para terminar reunión
    logger.info(`Deteniendo streaming de Zoom para sesión ${streamingConfig.sessionId}`);
  }

  /**
   * Detiene streaming en Google Meet
   */
  private async stopGoogleMeetStreaming(streamingConfig: StreamingConfig): Promise<void> {
    // TODO: Implementar llamada a Google API para terminar reunión
    logger.info(`Deteniendo streaming de Google Meet para sesión ${streamingConfig.sessionId}`);
  }

  /**
   * Detiene streaming en Microsoft Teams
   */
  private async stopTeamsStreaming(streamingConfig: StreamingConfig): Promise<void> {
    // TODO: Implementar llamada a Microsoft Graph API para terminar reunión
    logger.info(`Deteniendo streaming de Microsoft Teams para sesión ${streamingConfig.sessionId}`);
  }

  /**
   * Detiene streaming en Jitsi
   */
  private async stopJitsiStreaming(streamingConfig: StreamingConfig): Promise<void> {
    // Para Jitsi, solo registrar (no hay API para terminar reuniones)
    logger.info(`Deteniendo streaming de Jitsi para sesión ${streamingConfig.sessionId}`);
  }

  /**
   * Detiene streaming personalizado
   */
  private async stopCustomStreaming(streamingConfig: StreamingConfig): Promise<void> {
    // Para streaming personalizado, solo registrar
    logger.info(`Deteniendo streaming personalizado para sesión ${streamingConfig.sessionId}`);
  }

  // ====================================================================
  // UTILIDADES
  // ====================================================================

  /**
   * Genera un ID único para sesión
   */
  private generateSessionId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera un ID de reunión
   */
  private generateMeetingId(): string {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  // ====================================================================
  // EVENT EMITTER ACCESS
  // ====================================================================

  /**
   * Obtiene el event emitter para registro de listeners
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const streamingService = new StreamingService();
