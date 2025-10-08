/**
 * @fileoverview Servicio de Eventos Híbridos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de eventos híbridos
 *
 * Archivo: backend/src/services/hybridEventService.ts
 */

import { HybridEvent } from '../models/HybridEvent';
import { StreamingConfig } from '../models/StreamingConfig';
import { VirtualRoom } from '../models/VirtualRoom';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  CreateHybridEventData,
  UpdateHybridEventData,
  HybridEventData,
  StreamingConfigData,
  VirtualRoomData,
  HybridEventFilters,
  HybridEventQueryParams,
  HybridEventSearchResult,
  VirtualRoomStatus
} from '../types/hybrid.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { EventEmitter } from 'events';
import { cacheService } from './cacheService';

/**
 * Servicio para manejo de operaciones de eventos híbridos
 */
export class HybridEventService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // OPERACIONES CRUD BÁSICAS
  // ====================================================================

  /**
   * Crea una nueva configuración híbrida para un evento
   */
  async createHybridEvent(
    eventId: number,
    hybridData: CreateHybridEventData,
    createdBy: number
  ): Promise<ApiResponse<HybridEventData>> {
    try {
      // Verificar que el evento existe
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el creador del evento puede configurar híbrido)
      if (event.createdBy !== createdBy) {
        return {
          success: false,
          message: 'No tiene permisos para configurar este evento como híbrido',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que no exista ya una configuración híbrida
      const existingHybrid = await HybridEvent.findOne({ where: { eventId } });
      if (existingHybrid) {
        return {
          success: false,
          message: 'El evento ya tiene configuración híbrida',
          error: 'HYBRID_CONFIG_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de entrada
      const validation = await this.validateHybridEventData(hybridData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de configuración híbrida inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos según plataforma
      const hybridEventData: any = {
        eventId,
        modality: hybridData.config.modality,
        presentialCapacity: hybridData.config.presentialCapacity,
        virtualCapacity: hybridData.config.virtualCapacity,
        streamingPlatform: hybridData.config.streamingPlatform,
        recordingEnabled: hybridData.config.recordingEnabled ?? false,
        recordingRetentionDays: hybridData.config.recordingRetentionDays ?? 30,
        chatEnabled: hybridData.config.chatEnabled ?? true,
        qaEnabled: hybridData.config.qaEnabled ?? false,
        pollsEnabled: hybridData.config.pollsEnabled ?? false,
        timezone: hybridData.config.timezone ?? 'America/Guatemala',
        streamDelaySeconds: hybridData.config.streamDelaySeconds ?? 0,
        isActive: true,
        createdBy
      };

      // Agregar campos específicos según plataforma
      if (hybridData.config.streamingPlatform === 'zoom' && hybridData.streamingConfig) {
        const zoomConfig = hybridData.streamingConfig as any;
        hybridEventData.zoomMeetingId = zoomConfig.meetingId;
        hybridEventData.zoomMeetingPassword = zoomConfig.meetingPassword;
        hybridEventData.zoomJoinUrl = zoomConfig.joinUrl;
        hybridEventData.zoomStartUrl = zoomConfig.startUrl;
      } else if (hybridData.config.streamingPlatform === 'google_meet' && hybridData.streamingConfig) {
        const googleConfig = hybridData.streamingConfig as any;
        hybridEventData.googleMeetUrl = googleConfig.meetUrl;
      } else if (hybridData.config.streamingPlatform === 'microsoft_teams' && hybridData.streamingConfig) {
        const teamsConfig = hybridData.streamingConfig as any;
        hybridEventData.teamsMeetingUrl = teamsConfig.meetingUrl;
        hybridEventData.teamsMeetingId = teamsConfig.meetingId;
        hybridEventData.teamsJoinUrl = teamsConfig.joinUrl;
      } else if (hybridData.config.streamingPlatform === 'jitsi' && hybridData.streamingConfig) {
        const jitsiConfig = hybridData.streamingConfig as any;
        hybridEventData.jitsiRoomName = jitsiConfig.roomName;
        hybridEventData.jitsiDomain = jitsiConfig.domain;
        hybridEventData.jitsiJwtToken = jitsiConfig.jwtToken;
        hybridEventData.jitsiModeratorPassword = jitsiConfig.moderatorPassword;
        hybridEventData.jitsiUserPassword = jitsiConfig.userPassword;
      } else if (hybridData.config.streamingPlatform === 'custom_streaming' && hybridData.streamingConfig) {
        const customConfig = hybridData.streamingConfig as any;
        hybridEventData.customStreamUrl = customConfig.streamUrl;
        hybridEventData.customStreamKey = customConfig.streamKey;
      }

      // Crear configuración híbrida
      const hybridEvent = await HybridEvent.create(hybridEventData);

      // Crear salas virtuales por defecto
      await this.createDefaultVirtualRooms(hybridEvent.id, createdBy);

      // Cargar configuración completa
      const fullHybridEvent = await this.getHybridEventWithRelations(hybridEvent.id);

      if (!fullHybridEvent) {
        return {
          success: false,
          message: 'Error al cargar la configuración híbrida creada',
          error: 'HYBRID_CONFIG_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'hybrid_event_created',
        'hybrid_event',
        {
          userId: createdBy,
          resourceId: hybridEvent.id.toString(),
          newValues: hybridData,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(eventId);

      // Emitir evento
      this.eventEmitter.emit('HybridEventCreated', {
        eventId,
        hybridEventId: hybridEvent.id,
        hybridData: fullHybridEvent,
        createdBy
      });

      return {
        success: true,
        message: 'Configuración híbrida creada exitosamente',
        data: fullHybridEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando configuración híbrida:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza una configuración híbrida existente
   */
  async updateHybridEvent(
    hybridEventId: number,
    updateData: UpdateHybridEventData,
    updatedBy: number
  ): Promise<ApiResponse<HybridEventData>> {
    try {
      const hybridEvent = await HybridEvent.findByPk(hybridEventId, {
        include: [{ model: Event, as: 'event' }]
      });

      if (!hybridEvent) {
        return {
          success: false,
          message: 'Configuración híbrida no encontrada',
          error: 'HYBRID_EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (hybridEvent.event!.createdBy !== updatedBy) {
        return {
          success: false,
          message: 'No tiene permisos para actualizar esta configuración híbrida',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validateHybridEventData(updateData.config as any, true);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de actualización inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      const oldValues = {
        modality: hybridEvent.modality,
        presentialCapacity: hybridEvent.presentialCapacity,
        virtualCapacity: hybridEvent.virtualCapacity,
        streamingPlatform: hybridEvent.streamingPlatform,
        recordingEnabled: hybridEvent.recordingEnabled,
        chatEnabled: hybridEvent.chatEnabled,
        qaEnabled: hybridEvent.qaEnabled,
        pollsEnabled: hybridEvent.pollsEnabled,
        timezone: hybridEvent.timezone,
        streamDelaySeconds: hybridEvent.streamDelaySeconds
      };

      // Preparar datos de actualización
      const updateDataObj: any = {};

      if (updateData.config) {
        Object.assign(updateDataObj, updateData.config);
      }

      // Actualizar campos específicos según plataforma
      if (updateData.streamingConfig) {
        if (hybridEvent.streamingPlatform === 'zoom') {
          const zoomConfig = updateData.streamingConfig as any;
          if (zoomConfig.meetingId) updateDataObj.zoomMeetingId = zoomConfig.meetingId;
          if (zoomConfig.meetingPassword) updateDataObj.zoomMeetingPassword = zoomConfig.meetingPassword;
          if (zoomConfig.joinUrl) updateDataObj.zoomJoinUrl = zoomConfig.joinUrl;
          if (zoomConfig.startUrl) updateDataObj.zoomStartUrl = zoomConfig.startUrl;
        } else if (hybridEvent.streamingPlatform === 'google_meet') {
          const googleConfig = updateData.streamingConfig as any;
          if (googleConfig.meetUrl) updateDataObj.googleMeetUrl = googleConfig.meetUrl;
        } else if (hybridEvent.streamingPlatform === 'microsoft_teams') {
          const teamsConfig = updateData.streamingConfig as any;
          if (teamsConfig.meetingUrl) updateDataObj.teamsMeetingUrl = teamsConfig.meetingUrl;
          if (teamsConfig.meetingId) updateDataObj.teamsMeetingId = teamsConfig.meetingId;
          if (teamsConfig.joinUrl) updateDataObj.teamsJoinUrl = teamsConfig.joinUrl;
        } else if (hybridEvent.streamingPlatform === 'jitsi') {
          const jitsiConfig = updateData.streamingConfig as any;
          if (jitsiConfig.roomName) updateDataObj.jitsiRoomName = jitsiConfig.roomName;
          if (jitsiConfig.domain) updateDataObj.jitsiDomain = jitsiConfig.domain;
          if (jitsiConfig.jwtToken) updateDataObj.jitsiJwtToken = jitsiConfig.jwtToken;
          if (jitsiConfig.moderatorPassword) updateDataObj.jitsiModeratorPassword = jitsiConfig.moderatorPassword;
          if (jitsiConfig.userPassword) updateDataObj.jitsiUserPassword = jitsiConfig.userPassword;
        } else if (hybridEvent.streamingPlatform === 'custom_streaming') {
          const customConfig = updateData.streamingConfig as any;
          if (customConfig.streamUrl) updateDataObj.customStreamUrl = customConfig.streamUrl;
          if (customConfig.streamKey) updateDataObj.customStreamKey = customConfig.streamKey;
        }
      }

      // Actualizar configuración híbrida
      await hybridEvent.update(updateDataObj);

      // Cargar configuración actualizada
      const updatedHybridEvent = await this.getHybridEventWithRelations(hybridEventId);

      if (!updatedHybridEvent) {
        return {
          success: false,
          message: 'Error al cargar la configuración híbrida actualizada',
          error: 'HYBRID_CONFIG_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'hybrid_event_updated',
        'hybrid_event',
        {
          userId: updatedBy,
          resourceId: hybridEventId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(hybridEvent.eventId);

      // Emitir evento
      this.eventEmitter.emit('HybridEventUpdated', {
        eventId: hybridEvent.eventId,
        hybridEventId,
        oldData: oldValues,
        newData: updatedHybridEvent,
        updatedBy
      });

      return {
        success: true,
        message: 'Configuración híbrida actualizada exitosamente',
        data: updatedHybridEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando configuración híbrida:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene configuración híbrida por ID de evento
   */
  async getHybridEventByEventId(eventId: number): Promise<ApiResponse<HybridEventData | null>> {
    try {
      const hybridEvent = await this.getHybridEventWithRelationsByEventId(eventId);

      return {
        success: true,
        message: 'Configuración híbrida obtenida exitosamente',
        data: hybridEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo configuración híbrida:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Lista configuraciones híbridas con filtros
   */
  async getHybridEvents(params: HybridEventQueryParams = {}): Promise<ApiResponse<HybridEventSearchResult>> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        filters = {}
      } = params;

      const offset = (page - 1) * limit;

      // Construir filtros
      const where: any = {};

      if (filters.modality) {
        where.modality = filters.modality;
      }
      if (filters.platform) {
        where.streamingPlatform = filters.platform;
      }
      if (filters.createdBy) {
        where.createdBy = filters.createdBy;
      }

      // Ordenamiento
      const order: any[] = [];
      switch (sortBy) {
        case 'createdAt':
          order.push(['createdAt', sortOrder]);
          break;
        case 'modality':
          order.push(['modality', sortOrder]);
          break;
        case 'platform':
          order.push(['streamingPlatform', sortOrder]);
          break;
        default:
          order.push(['createdAt', 'DESC']);
      }

      const { rows: hybridEvents, count: total } = await HybridEvent.findAndCountAll({
        where,
        include: [
          {
            model: Event,
            as: 'event',
            include: [
              { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
            ]
          },
          { model: StreamingConfig, as: 'streamingConfig' },
          { model: VirtualRoom, as: 'virtualRooms' }
        ],
        limit,
        offset,
        order,
        distinct: true
      });

      const formattedEvents: HybridEventData[] = hybridEvents.map(he => this.formatHybridEventData(he));

      return {
        success: true,
        message: 'Configuraciones híbridas obtenidas exitosamente',
        data: {
          hybridEvents: formattedEvents,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrevious: page > 1
          },
          filters
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo configuraciones híbridas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES Y HELPERS
  // ====================================================================

  /**
   * Obtiene configuración híbrida con todas sus relaciones
   */
  private async getHybridEventWithRelations(hybridEventId: number): Promise<HybridEventData | null> {
    const hybridEvent = await HybridEvent.findByPk(hybridEventId, {
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
          ]
        },
        { model: StreamingConfig, as: 'streamingConfig' },
        { model: VirtualRoom, as: 'virtualRooms' }
      ]
    });

    if (!hybridEvent) return null;

    return this.formatHybridEventData(hybridEvent);
  }

  /**
   * Obtiene configuración híbrida por ID de evento
   */
  private async getHybridEventWithRelationsByEventId(eventId: number): Promise<HybridEventData | null> {
    const hybridEvent = await HybridEvent.findOne({
      where: { eventId },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
          ]
        },
        { model: StreamingConfig, as: 'streamingConfig' },
        { model: VirtualRoom, as: 'virtualRooms' }
      ]
    });

    if (!hybridEvent) return null;

    return this.formatHybridEventData(hybridEvent);
  }

  /**
   * Formatea datos de evento híbrido para respuesta
   */
  private formatHybridEventData(hybridEvent: HybridEvent): HybridEventData {
    return {
      id: hybridEvent.id,
      eventId: hybridEvent.eventId,
      config: {
        modality: hybridEvent.modality,
        presentialCapacity: hybridEvent.presentialCapacity,
        virtualCapacity: hybridEvent.virtualCapacity,
        streamingPlatform: hybridEvent.streamingPlatform,
        recordingEnabled: hybridEvent.recordingEnabled,
        recordingRetentionDays: hybridEvent.recordingRetentionDays,
        chatEnabled: hybridEvent.chatEnabled,
        qaEnabled: hybridEvent.qaEnabled,
        pollsEnabled: hybridEvent.pollsEnabled,
        timezone: hybridEvent.timezone,
        streamDelaySeconds: hybridEvent.streamDelaySeconds,
        isActive: hybridEvent.isActive
      },
      streamingConfig: {
        platform: hybridEvent.streamingPlatform,
        meetingId: hybridEvent.zoomMeetingId || hybridEvent.teamsMeetingId || hybridEvent.jitsiRoomName,
        streamUrl: hybridEvent.customStreamUrl,
        isActive: hybridEvent.isActive
      },
      virtualRooms: hybridEvent.virtualRooms?.map(room => ({
        id: room.id,
        name: room.name,
        type: room.platform,
        capacity: room.capacity,
        isActive: room.isActive
      })) || [],
      event: {
        id: hybridEvent.event!.id,
        title: hybridEvent.event!.title,
        startDate: hybridEvent.event!.startDate,
        endDate: hybridEvent.event!.endDate,
        location: hybridEvent.event!.location,
        virtualLocation: hybridEvent.event!.virtualLocation,
        isVirtual: hybridEvent.event!.isVirtual,
        creator: hybridEvent.event!.creator ? {
          id: hybridEvent.event!.creator.id,
          firstName: hybridEvent.event!.creator.firstName,
          lastName: hybridEvent.event!.creator.lastName,
          avatar: hybridEvent.event!.creator.avatar
        } : undefined
      },
      createdBy: hybridEvent.createdBy,
      createdAt: hybridEvent.createdAt,
      updatedAt: hybridEvent.updatedAt
    };
  }

  /**
   * Crea salas virtuales por defecto
   */
  private async createDefaultVirtualRooms(hybridEventId: number, createdBy: number): Promise<void> {
    const defaultRooms = [
      { name: 'Sala Principal', platform: 'zoom', capacity: 500 },
      { name: 'Sala de Networking', platform: 'google_meet', capacity: 100 },
      { name: 'Sala de Preguntas', platform: 'microsoft_teams', capacity: 200 },
      { name: 'Sala Técnica', platform: 'jitsi', capacity: 50 }
    ];

    for (const room of defaultRooms) {
      await VirtualRoom.create({
        hybridEventId,
        name: room.name,
        platform: room.platform as any,
        capacity: room.capacity,
        status: VirtualRoomStatus.INACTIVE,
        moderators: [createdBy],
        isPrivate: false,
        isActive: true,
        createdBy
      });
    }
  }

  /**
   * Valida datos de configuración híbrida
   */
  private async validateHybridEventData(data: any, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Validar modalidad
    if (!isUpdate || data.modality !== undefined) {
      const validModalities = ['presential_only', 'virtual_only', 'hybrid'];
      if (!data.modality || !validModalities.includes(data.modality)) {
        errors.push({
          field: 'config.modality',
          message: 'La modalidad debe ser: presential_only, virtual_only o hybrid',
          value: data.modality
        });
      }
    }

    // Validar capacidades
    if (data.presentialCapacity !== undefined && data.presentialCapacity < 1) {
      errors.push({
        field: 'config.presentialCapacity',
        message: 'La capacidad presencial debe ser mayor a 0',
        value: data.presentialCapacity
      });
    }

    if (data.virtualCapacity !== undefined && data.virtualCapacity < 1) {
      errors.push({
        field: 'config.virtualCapacity',
        message: 'La capacidad virtual debe ser mayor a 0',
        value: data.virtualCapacity
      });
    }

    // Validar plataforma de streaming
    if (!isUpdate || data.streamingPlatform !== undefined) {
      const validPlatforms = ['zoom', 'google_meet', 'microsoft_teams', 'jitsi', 'custom_streaming'];
      if (!data.streamingPlatform || !validPlatforms.includes(data.streamingPlatform)) {
        errors.push({
          field: 'config.streamingPlatform',
          message: 'La plataforma debe ser: zoom, google_meet, microsoft_teams, jitsi o custom_streaming',
          value: data.streamingPlatform
        });
      }
    }

    // Validar delay del stream
    if (data.streamDelaySeconds !== undefined && (data.streamDelaySeconds < 0 || data.streamDelaySeconds > 30)) {
      errors.push({
        field: 'config.streamDelaySeconds',
        message: 'El delay del stream debe estar entre 0 y 30 segundos',
        value: data.streamDelaySeconds
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
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

export const hybridEventService = new HybridEventService();