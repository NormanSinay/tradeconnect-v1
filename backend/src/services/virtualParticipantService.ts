/**
 * @fileoverview Servicio de Participantes Virtuales para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de participantes virtuales
 *
 * Archivo: backend/src/services/virtualParticipantService.ts
 */

import { VirtualParticipant } from '../models/VirtualParticipant';
import { VirtualRoom } from '../models/VirtualRoom';
import { HybridEvent } from '../models/HybridEvent';
import { EventRegistration } from '../models/EventRegistration';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  VirtualParticipantStatus,
  VirtualParticipantRole,
  JoinVirtualEventRequest,
  VirtualAccessResponse
} from '../types/hybrid.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { EventEmitter } from 'events';
import { cacheService } from './cacheService';
import crypto from 'crypto';

/**
 * Servicio para manejo de operaciones de participantes virtuales
 */
export class VirtualParticipantService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // GESTIÓN DE ACCESO Y AUTENTICACIÓN
  // ====================================================================

  /**
   * Registra o actualiza un participante virtual
   */
  async joinVirtualEvent(
    userId: number,
    request: JoinVirtualEventRequest
  ): Promise<ApiResponse<VirtualAccessResponse>> {
    try {
      // Verificar que el evento híbrido existe
      const hybridEvent = await HybridEvent.findOne({
        where: { eventId: request.eventId }
      });

      if (!hybridEvent) {
        return {
          success: false,
          message: 'Evento híbrido no encontrado',
          error: 'HYBRID_EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el usuario esté registrado en el evento
      const registration = await EventRegistration.findOne({
        where: {
          eventId: request.eventId,
          userId,
          status: 'confirmed'
        }
      });

      if (!registration) {
        return {
          success: false,
          message: 'Usuario no está registrado en este evento',
          error: 'NOT_REGISTERED',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar sala si se especifica
      let room: VirtualRoom | null = null;
      if (request.roomId) {
        room = await VirtualRoom.findByPk(request.roomId);
        if (!room || room.hybridEventId !== hybridEvent.id) {
          return {
            success: false,
            message: 'Sala virtual no encontrada o no pertenece al evento',
            error: 'ROOM_NOT_FOUND',
            timestamp: new Date().toISOString()
          };
        }

        if (!room.isActive || room.status === 'closed') {
          return {
            success: false,
            message: 'La sala virtual no está disponible',
            error: 'ROOM_UNAVAILABLE',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Buscar participante existente o crear uno nuevo
      const whereCondition: any = {
        hybridEventId: hybridEvent.id,
        userId
      };

      if (request.roomId) {
        whereCondition.roomId = request.roomId;
      } else {
        whereCondition.roomId = { [Op.is]: null };
      }

      let participant = await VirtualParticipant.findOne({
        where: whereCondition
      });

      const accessToken = this.generateAccessToken();
      const now = new Date();

      if (participant) {
        // Actualizar participante existente
        await participant.update({
          status: VirtualParticipantStatus.JOINED,
          accessToken,
          joinedAt: now,
          lastActivity: now,
          deviceInfo: request.deviceInfo || participant.deviceInfo
        });
      } else {
        // Crear nuevo participante
        participant = await VirtualParticipant.create({
          hybridEventId: hybridEvent.id,
          userId,
          roomId: request.roomId,
          accessToken,
          status: VirtualParticipantStatus.JOINED,
          joinedAt: now,
          lastActivity: now,
          deviceInfo: request.deviceInfo,
          isModerator: false, // TODO: Determinar basado en roles
          canChat: hybridEvent.chatEnabled,
          canQA: hybridEvent.qaEnabled,
          tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        });
      }

      // Generar URL de acceso
      const joinUrl = this.generateJoinUrl(hybridEvent, room, accessToken);

      // Registrar en auditoría
      await AuditLog.log(
        'virtual_participant_joined',
        'virtual_participant',
        {
          userId,
          resourceId: participant.id.toString(),
          newValues: {
            eventId: request.eventId,
            roomId: request.roomId,
            accessToken: accessToken.substring(0, 8) + '...' // Solo loggear parte del token
          },
          ipAddress: 'system',
          userAgent: request.userAgent || 'unknown'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(request.eventId);

      // Emitir evento
      this.eventEmitter.emit('VirtualParticipantJoined', {
        eventId: request.eventId,
        roomId: request.roomId,
        participantId: participant.id,
        userId,
        joinedAt: now
      });

      const response: VirtualAccessResponse = {
        accessToken,
        joinUrl,
        roomConfig: room ? {
          name: room.name,
          capacity: room.capacity,
          platform: room.platform,
          moderators: room.moderators,
          isPrivate: room.isPrivate,
          password: room.password,
          description: room.description
        } as any : undefined,
        participantConfig: {
          isModerator: participant.isModerator,
          canChat: participant.canChat,
          canQA: participant.canQA,
          permissions: this.getParticipantPermissions(participant)
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      };

      return {
        success: true,
        message: 'Participante virtual registrado exitosamente',
        data: response,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error registrando participante virtual:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Registra salida de participante virtual
   */
  async leaveVirtualEvent(
    userId: number,
    eventId: number,
    roomId?: number
  ): Promise<ApiResponse<void>> {
    try {
      const whereCondition: any = {
        hybridEventId: eventId,
        userId,
        status: VirtualParticipantStatus.JOINED
      };

      if (roomId) {
        whereCondition.roomId = roomId;
      } else {
        whereCondition.roomId = { [Op.is]: null };
      }

      const participant = await VirtualParticipant.findOne({
        where: whereCondition
      });

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const now = new Date();
      const sessionTime = participant.joinedAt
        ? Math.floor((now.getTime() - participant.joinedAt.getTime()) / 1000)
        : 0;

      // Actualizar estadísticas
      await participant.update({
        status: VirtualParticipantStatus.LEFT,
        leftAt: now,
        lastActivity: now,
        totalTimeConnected: participant.totalTimeConnected + sessionTime
      });

      // Registrar en auditoría
      await AuditLog.log(
        'virtual_participant_left',
        'virtual_participant',
        {
          userId,
          resourceId: participant.id.toString(),
          oldValues: { status: VirtualParticipantStatus.JOINED },
          newValues: {
            status: VirtualParticipantStatus.LEFT,
            sessionTime,
            totalTimeConnected: participant.totalTimeConnected
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento
      this.eventEmitter.emit('VirtualParticipantLeft', {
        eventId,
        roomId,
        participantId: participant.id,
        userId,
        leftAt: now,
        sessionTime
      });

      return {
        success: true,
        message: 'Participante virtual desconectado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error desconectando participante virtual:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE ACTIVIDAD Y ESTADÍSTICAS
  // ====================================================================

  /**
   * Actualiza actividad de participante
   */
  async updateParticipantActivity(
    participantId: number,
    activityData?: {
      connectionQuality?: any;
      lastActivity?: Date;
    }
  ): Promise<ApiResponse<void>> {
    try {
      const participant = await VirtualParticipant.findByPk(participantId);

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const updateData: any = {
        lastActivity: new Date()
      };

      if (activityData?.connectionQuality) {
        updateData.connectionQuality = activityData.connectionQuality;
      }

      await participant.update(updateData);

      return {
        success: true,
        message: 'Actividad de participante actualizada',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando actividad de participante:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de participantes virtuales
   */
  async getVirtualParticipantsStats(eventId: number, roomId?: number): Promise<ApiResponse<any>> {
    try {
      const where: any = { hybridEventId: eventId };

      if (roomId) {
        where.roomId = roomId;
      }

      const participants = await VirtualParticipant.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
        ]
      });

      const stats = {
        totalParticipants: participants.length,
        activeParticipants: participants.filter(p => p.status === VirtualParticipantStatus.JOINED).length,
        totalTimeConnected: participants.reduce((sum, p) => sum + p.totalTimeConnected, 0),
        averageSessionTime: 0,
        deviceBreakdown: {
          desktop: 0,
          mobile: 0,
          tablet: 0,
          unknown: 0
        },
        topParticipants: participants
          .sort((a, b) => b.totalTimeConnected - a.totalTimeConnected)
          .slice(0, 10)
          .map(p => ({
            id: p.id,
            user: p.user,
            totalTimeConnected: p.totalTimeConnected,
            lastActivity: p.lastActivity
          }))
      };

      // Calcular tiempo promedio
      const completedSessions = participants.filter(p => p.leftAt);
      if (completedSessions.length > 0) {
        stats.averageSessionTime = Math.floor(
          completedSessions.reduce((sum, p) => sum + p.totalTimeConnected, 0) / completedSessions.length
        );
      }

      // Contar dispositivos
      participants.forEach(p => {
        const device = p.deviceInfo?.platform?.toLowerCase() || 'unknown';
        if (device.includes('desktop') || device.includes('windows') || device.includes('mac')) {
          stats.deviceBreakdown.desktop++;
        } else if (device.includes('mobile') || device.includes('android') || device.includes('ios')) {
          stats.deviceBreakdown.mobile++;
        } else if (device.includes('tablet')) {
          stats.deviceBreakdown.tablet++;
        } else {
          stats.deviceBreakdown.unknown++;
        }
      });

      return {
        success: true,
        message: 'Estadísticas de participantes obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de participantes:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MODERACIÓN AVANZADA DE PARTICIPANTES
  // ====================================================================

  /**
   * Silencia a un participante
   */
  async muteParticipant(
    participantId: number,
    mutedBy: number,
    reason?: string
  ): Promise<ApiResponse<void>> {
    try {
      const participant = await VirtualParticipant.findByPk(participantId);

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await participant.update({
        isMuted: true,
        moderationNotes: reason || 'Silenciado por moderador',
        lastActivity: new Date()
      });

      // Registrar en auditoría
      await AuditLog.log(
        'participant_muted',
        'virtual_participant',
        {
          userId: mutedBy,
          resourceId: participantId.toString(),
          oldValues: { isMuted: false },
          newValues: { isMuted: true, reason },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento via WebSocket
      this.eventEmitter.emit('ParticipantMuted', {
        eventId: participant.hybridEventId,
        roomId: participant.roomId,
        participantId,
        userId: participant.userId,
        mutedBy,
        reason
      });

      return {
        success: true,
        message: 'Participante silenciado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error silenciando participante:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Quita el silencio a un participante
   */
  async unmuteParticipant(
    participantId: number,
    unmutedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const participant = await VirtualParticipant.findByPk(participantId);

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await participant.update({
        isMuted: false,
        moderationNotes: undefined,
        lastActivity: new Date()
      });

      // Registrar en auditoría
      await AuditLog.log(
        'participant_unmuted',
        'virtual_participant',
        {
          userId: unmutedBy,
          resourceId: participantId.toString(),
          oldValues: { isMuted: true },
          newValues: { isMuted: false },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento via WebSocket
      this.eventEmitter.emit('ParticipantUnmuted', {
        eventId: participant.hybridEventId,
        roomId: participant.roomId,
        participantId,
        userId: participant.userId,
        unmutedBy
      });

      return {
        success: true,
        message: 'Participante sin silencio exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error quitando silencio a participante:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Bloquea a un participante
   */
  async blockParticipant(
    participantId: number,
    blockedBy: number,
    reason?: string
  ): Promise<ApiResponse<void>> {
    try {
      const participant = await VirtualParticipant.findByPk(participantId);

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await participant.update({
        isBlocked: true,
        status: VirtualParticipantStatus.BLOCKED,
        moderationNotes: reason || 'Bloqueado por moderador',
        leftAt: new Date(),
        lastActivity: new Date()
      });

      // Registrar en auditoría
      await AuditLog.log(
        'participant_blocked',
        'virtual_participant',
        {
          userId: blockedBy,
          resourceId: participantId.toString(),
          oldValues: { isBlocked: false, status: participant.status },
          newValues: { isBlocked: true, status: VirtualParticipantStatus.BLOCKED, reason },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento via WebSocket
      this.eventEmitter.emit('ParticipantBlocked', {
        eventId: participant.hybridEventId,
        roomId: participant.roomId,
        participantId,
        userId: participant.userId,
        blockedBy,
        reason
      });

      return {
        success: true,
        message: 'Participante bloqueado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error bloqueando participante:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cambia el rol de un participante
   */
  async changeParticipantRole(
    participantId: number,
    newRole: VirtualParticipantRole,
    changedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const participant = await VirtualParticipant.findByPk(participantId);

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const oldRole = participant.role;

      await participant.update({
        role: newRole,
        isModerator: newRole === 'moderator' || newRole === 'organizer',
        lastActivity: new Date()
      });

      // Registrar en auditoría
      await AuditLog.log(
        'participant_role_changed',
        'virtual_participant',
        {
          userId: changedBy,
          resourceId: participantId.toString(),
          oldValues: { role: oldRole, isModerator: participant.isModerator },
          newValues: { role: newRole, isModerator: newRole === 'moderator' || newRole === 'organizer' },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento via WebSocket
      this.eventEmitter.emit('ParticipantRoleChanged', {
        eventId: participant.hybridEventId,
        roomId: participant.roomId,
        participantId,
        userId: participant.userId,
        oldRole,
        newRole,
        changedBy
      });

      return {
        success: true,
        message: 'Rol de participante cambiado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error cambiando rol de participante:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza métricas de engagement del participante
   */
  async updateParticipantEngagement(
    participantId: number,
    engagementData: {
      messagesSent?: number;
      questionsAsked?: number;
      pollsParticipated?: number;
      timeActive?: number;
      latency?: number;
    }
  ): Promise<ApiResponse<void>> {
    try {
      const participant = await VirtualParticipant.findByPk(participantId);

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const updateData: any = {
        lastActivity: new Date(),
        lastPingAt: new Date()
      };

      if (engagementData.messagesSent !== undefined) {
        updateData.messagesSent = (participant.messagesSent || 0) + engagementData.messagesSent;
      }

      if (engagementData.questionsAsked !== undefined) {
        updateData.questionsAsked = (participant.questionsAsked || 0) + engagementData.questionsAsked;
      }

      if (engagementData.pollsParticipated !== undefined) {
        updateData.pollsParticipated = (participant.pollsParticipated || 0) + engagementData.pollsParticipated;
      }

      if (engagementData.timeActive !== undefined) {
        updateData.totalTimeActive = (participant.totalTimeActive || 0) + engagementData.timeActive;
      }

      if (engagementData.latency !== undefined) {
        updateData.averageLatency = engagementData.latency;
      }

      await participant.update(updateData);

      return {
        success: true,
        message: 'Métricas de engagement actualizadas',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando engagement:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE PARTICIPANTES
  // ====================================================================

  /**
   * Lista participantes virtuales de un evento
   */
  async getVirtualParticipants(
    eventId: number,
    roomId?: number,
    filters?: {
      status?: VirtualParticipantStatus;
      isModerator?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<any>> {
    try {
      const where: any = { hybridEventId: eventId };

      if (roomId) {
        where.roomId = roomId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.isModerator !== undefined) {
        where.isModerator = filters.isModerator;
      }

      const participants = await VirtualParticipant.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
          { model: VirtualRoom, as: 'room', attributes: ['id', 'name'] }
        ],
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
        order: [['joinedAt', 'DESC']]
      });

      const formattedParticipants = participants.map(p => ({
        id: p.id,
        user: p.user,
        room: p.room,
        status: p.status,
        joinedAt: p.joinedAt,
        leftAt: p.leftAt,
        totalTimeConnected: p.totalTimeConnected,
        lastActivity: p.lastActivity,
        isModerator: p.isModerator,
        canChat: p.canChat,
        canQA: p.canQA,
        deviceInfo: p.deviceInfo
      }));

      return {
        success: true,
        message: 'Participantes virtuales obtenidos exitosamente',
        data: {
          participants: formattedParticipants,
          total: formattedParticipants.length
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo participantes virtuales:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Expulsa a un participante virtual
   */
  async removeParticipant(
    participantId: number,
    removedBy: number,
    reason?: string
  ): Promise<ApiResponse<void>> {
    try {
      const participant = await VirtualParticipant.findByPk(participantId, {
        include: [
          { model: User, as: 'user' },
          { model: VirtualRoom, as: 'room' }
        ]
      });

      if (!participant) {
        return {
          success: false,
          message: 'Participante virtual no encontrado',
          error: 'PARTICIPANT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Actualizar estado
      await participant.update({
        status: VirtualParticipantStatus.REMOVED,
        leftAt: new Date(),
        lastActivity: new Date()
      });

      // Registrar en auditoría
      await AuditLog.log(
        'virtual_participant_removed',
        'virtual_participant',
        {
          userId: removedBy,
          resourceId: participantId.toString(),
          oldValues: { status: participant.status },
          newValues: {
            status: VirtualParticipantStatus.REMOVED,
            reason: reason || 'Removed by moderator'
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento
      this.eventEmitter.emit('VirtualParticipantRemoved', {
        eventId: participant.hybridEventId,
        roomId: participant.roomId,
        participantId,
        userId: participant.userId,
        removedBy,
        reason
      });

      return {
        success: true,
        message: 'Participante virtual removido exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error removiendo participante virtual:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES
  // ====================================================================

  /**
   * Genera token de acceso único
   */
  private generateAccessToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Genera URL de acceso para participante
   */
  private generateJoinUrl(hybridEvent: HybridEvent, room?: VirtualRoom | null, token?: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let url = `${baseUrl}/events/${hybridEvent.eventId}/virtual`;

    if (room) {
      url += `/room/${room.id}`;
    }

    if (token) {
      url += `?token=${token}`;
    }

    return url;
  }

  /**
   * Obtiene permisos del participante
   */
  private getParticipantPermissions(participant: VirtualParticipant): string[] {
    const permissions: string[] = [];

    if (participant.canChat) {
      permissions.push('chat');
    }

    if (participant.canQA) {
      permissions.push('qa');
    }

    if (participant.isModerator) {
      permissions.push('moderate', 'manage_participants', 'manage_stream');
    }

    return permissions;
  }

  /**
   * Valida token de acceso
   */
  async validateAccessToken(token: string, eventId: number): Promise<VirtualParticipant | null> {
    try {
      const participant = await VirtualParticipant.findOne({
        where: {
          accessToken: token,
          hybridEventId: eventId,
          status: VirtualParticipantStatus.JOINED
        },
        include: [
          { model: User, as: 'user' },
          { model: VirtualRoom, as: 'room' }
        ]
      });

      return participant;
    } catch (error) {
      logger.error('Error validando token de acceso:', error);
      return null;
    }
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

export const virtualParticipantService = new VirtualParticipantService();