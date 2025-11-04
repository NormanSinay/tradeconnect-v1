/**
 * @fileoverview Servicio de Dashboard para Speakers en TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio específica para el dashboard de speakers
 *
 * Archivo: backend/src/services/speakerDashboardService.ts
 */

import { Speaker } from '../models/Speaker';
import { SpeakerEvent } from '../models/SpeakerEvent';
import { SpeakerEvaluation } from '../models/SpeakerEvaluation';
import { SpeakerAvailabilityBlock } from '../models/SpeakerAvailabilityBlock';
import { Event } from '../models/Event';
import { Notification } from '../models/Notification';
import { SpeakerPayment } from '../models/SpeakerPayment';
import { Specialty } from '../models/Specialty';
import { SpeakerSpecialty } from '../models/SpeakerSpecialty';
import {
  SpeakerStats,
  SpeakerEventInfo,
  UpdateSpeakerData,
  CreateAvailabilityBlockData,
  SpeakerEvaluationInfo,
  SpeakerFilters,
  SpeakerQueryParams,
  SpeakerSearchResult,
  DetailedSpeaker,
  PublicSpeaker
} from '../types/speaker.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op, Sequelize } from 'sequelize';
import { EventEmitter } from 'events';
import { cacheService } from './cacheService';
import { speakerService } from './speakerService';

/**
 * Servicio para manejo de operaciones específicas del dashboard de speakers
 */
export class SpeakerDashboardService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // ESTADÍSTICAS DEL DASHBOARD
  // ====================================================================

  /**
   * Obtiene estadísticas del dashboard para un speaker específico
   */
  async getDashboardStats(speakerId: number): Promise<ApiResponse<SpeakerStats>> {
    try {
      const speaker = await Speaker.findByPk(speakerId);
      if (!speaker) {
        return {
          success: false,
          message: 'Speaker no encontrado',
          error: 'SPEAKER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const stats = await this.calculateSpeakerDashboardStats(speakerId);

      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas del dashboard:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE EVENTOS ASIGNADOS
  // ====================================================================

  /**
   * Obtiene eventos asignados al speaker con filtros
   */
  async getAssignedEvents(
    speakerId: number,
    filters: {
      status?: string;
      upcoming?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<{ events: SpeakerEventInfo[]; pagination: any }>> {
    try {
      const { status, upcoming, page = 1, limit = 20 } = filters;
      const offset = (page - 1) * limit;

      const where: any = { speakerId };

      if (status) {
        where.status = status;
      }

      if (upcoming) {
        where.participationStart = { [Op.gt]: new Date() };
        where.status = { [Op.in]: ['confirmed', 'tentative'] };
      }

      const { rows: speakerEvents, count: total } = await SpeakerEvent.findAndCountAll({
        where,
        include: [{
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate', 'modality', 'status', 'location']
        }],
        limit,
        offset,
        order: [['participationStart', 'ASC']]
      });

      const events: SpeakerEventInfo[] = speakerEvents.map(se => ({
        id: se.id,
        speakerId: se.speakerId,
        eventId: se.eventId,
        eventTitle: se.event?.title || 'Evento sin título',
        eventStartDate: se.event?.startDate,
        eventEndDate: se.event?.endDate,
        role: se.role,
        participationStart: se.participationStart!,
        participationEnd: se.participationEnd!,
        durationMinutes: se.durationMinutes,
        modality: se.modality,
        order: se.order,
        status: se.status,
        notes: se.notes,
        confirmedAt: se.confirmedAt,
        cancelledAt: se.cancelledAt,
        cancellationReason: se.cancellationReason,
        createdBy: se.createdBy,
        createdAt: se.createdAt
      }));

      return {
        success: true,
        message: 'Eventos obtenidos exitosamente',
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrevious: page > 1
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo eventos asignados:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza el estado de un evento asignado
   */
  async updateEventStatus(
    speakerId: number,
    eventId: number,
    status: string,
    notes?: string
  ): Promise<ApiResponse<SpeakerEventInfo>> {
    try {
      const speakerEvent = await SpeakerEvent.findOne({
        where: { speakerId, eventId }
      });

      if (!speakerEvent) {
        return {
          success: false,
          message: 'Evento asignado no encontrado',
          error: 'SPEAKER_EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const updateData: any = { status };
      if (notes) updateData.notes = notes;

      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      await speakerEvent.update(updateData);

      // Invalidar caché
      await cacheService.delete(`speaker:events:${speakerId}`);
      await cacheService.delete(`speaker:stats:${speakerId}`);

      return {
        success: true,
        message: 'Estado del evento actualizado exitosamente',
        data: {
          id: speakerEvent.id,
          speakerId: speakerEvent.speakerId,
          eventId: speakerEvent.eventId,
          role: speakerEvent.role,
          participationStart: speakerEvent.participationStart,
          participationEnd: speakerEvent.participationEnd,
          durationMinutes: speakerEvent.durationMinutes,
          modality: speakerEvent.modality,
          order: speakerEvent.order,
          status: speakerEvent.status,
          notes: speakerEvent.notes,
          confirmedAt: speakerEvent.confirmedAt,
          cancelledAt: speakerEvent.cancelledAt,
          cancellationReason: speakerEvent.cancellationReason,
          createdBy: speakerEvent.createdBy,
          createdAt: speakerEvent.createdAt
        } as SpeakerEventInfo,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando estado del evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE MATERIALES Y PRESENTACIONES
  // ====================================================================

  /**
   * Obtiene materiales del speaker
   */
  async getSpeakerMaterials(speakerId: number): Promise<ApiResponse<any[]>> {
    try {
      // TODO: Implementar cuando se tenga el modelo de materiales
      // Por ahora retornamos un array vacío
      const materials: any[] = [];

      return {
        success: true,
        message: 'Materiales obtenidos exitosamente',
        data: materials,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo materiales del speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Sube un material para el speaker
   */
  async uploadMaterial(
    speakerId: number,
    materialData: {
      title: string;
      description?: string;
      fileUrl: string;
      fileType: string;
      eventId?: number;
    }
  ): Promise<ApiResponse<any>> {
    try {
      // TODO: Implementar cuando se tenga el modelo de materiales
      // Validar que el speaker existe
      const speaker = await Speaker.findByPk(speakerId);
      if (!speaker) {
        return {
          success: false,
          message: 'Speaker no encontrado',
          error: 'SPEAKER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // TODO: Crear material en la base de datos

      return {
        success: true,
        message: 'Material subido exitosamente',
        data: materialData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error subiendo material:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE NOTIFICACIONES
  // ====================================================================

  /**
   * Obtiene notificaciones del speaker
   */
  async getSpeakerNotifications(
    speakerId: number,
    filters: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<ApiResponse<{ notifications: any[]; pagination: any }>> {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = filters;
      const offset = (page - 1) * limit;

      const where: any = {
        userId: speakerId
      };

      if (unreadOnly) {
        where.readAt = null;
      }

      const { rows: notifications, count: total } = await Notification.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        message: 'Notificaciones obtenidas exitosamente',
        data: {
          notifications: notifications.map(n => ({
            id: n.id,
            title: n.subject || 'Notificación',
            message: n.message,
            type: n.type,
            priority: n.priority,
            readAt: n.readAt,
            createdAt: n.createdAt
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrevious: page > 1
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo notificaciones del speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Marca notificaciones como leídas
   */
  async markNotificationsAsRead(
    speakerId: number,
    notificationIds: number[]
  ): Promise<ApiResponse<void>> {
    try {
      await Notification.update(
        { readAt: new Date() },
        {
          where: {
            id: { [Op.in]: notificationIds },
            userId: speakerId
          }
        }
      );

      return {
        success: true,
        message: 'Notificaciones marcadas como leídas',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error marcando notificaciones como leídas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE PERFIL
  // ====================================================================

  /**
   * Actualiza el perfil del speaker
   */
  async updateSpeakerProfile(
    speakerId: number,
    updateData: UpdateSpeakerData
  ): Promise<ApiResponse<DetailedSpeaker>> {
    try {
      return await speakerService.updateSpeaker(speakerId, updateData, speakerId);
    } catch (error) {
      logger.error('Error actualizando perfil del speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene el perfil completo del speaker
   */
  async getSpeakerProfile(speakerId: number): Promise<ApiResponse<DetailedSpeaker>> {
    try {
      const result = await speakerService.getSpeakerById(speakerId, true);
      if (result.success && result.data) {
        // Asegurarse de que sea DetailedSpeaker
        return {
          success: true,
          message: result.message,
          data: result.data as DetailedSpeaker,
          timestamp: result.timestamp
        };
      }
      return result as ApiResponse<DetailedSpeaker>;
    } catch (error) {
      logger.error('Error obteniendo perfil del speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE DISPONIBILIDAD
  // ====================================================================

  /**
   * Obtiene bloques de disponibilidad del speaker
   */
  async getSpeakerAvailability(speakerId: number): Promise<ApiResponse<any[]>> {
    try {
      const blocks = await SpeakerAvailabilityBlock.findAll({
        where: { speakerId },
        order: [['startDate', 'ASC']]
      });

      const availabilityBlocks = blocks.map(block => ({
        id: block.id,
        startDate: block.startDate,
        endDate: block.endDate,
        reason: block.reason,
        isRecurring: block.isRecurring,
        recurrencePattern: block.recurrencePattern,
        createdAt: block.createdAt
      }));

      return {
        success: true,
        message: 'Disponibilidad obtenida exitosamente',
        data: availabilityBlocks,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo disponibilidad del speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Crea un bloqueo de disponibilidad
   */
  async createAvailabilityBlock(
    blockData: CreateAvailabilityBlockData
  ): Promise<ApiResponse<any>> {
    try {
      return await speakerService.createAvailabilityBlock(blockData);
    } catch (error) {
      logger.error('Error creando bloqueo de disponibilidad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un bloqueo de disponibilidad
   */
  async deleteAvailabilityBlock(
    speakerId: number,
    blockId: number
  ): Promise<ApiResponse<void>> {
    try {
      const block = await SpeakerAvailabilityBlock.findOne({
        where: { id: blockId, speakerId }
      });

      if (!block) {
        return {
          success: false,
          message: 'Bloqueo de disponibilidad no encontrado',
          error: 'AVAILABILITY_BLOCK_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await block.destroy();

      // Invalidar caché
      await cacheService.delete(`speaker:availability:${speakerId}`);

      return {
        success: true,
        message: 'Bloqueo de disponibilidad eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando bloqueo de disponibilidad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS PRIVADOS DE APOYO
  // ====================================================================

  /**
   * Calcula estadísticas del dashboard para un speaker
   */
  private async calculateSpeakerDashboardStats(speakerId: number): Promise<SpeakerStats> {
    // Eventos asignados
    const events = await SpeakerEvent.findAll({
      where: { speakerId },
      attributes: ['status', 'participationStart', 'participationEnd', 'role', 'modality']
    });

    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const upcomingEvents = events.filter(e =>
      e.status === 'confirmed' && e.participationStart && e.participationStart > new Date()
    ).length;
    const cancelledEvents = events.filter(e => e.status === 'cancelled').length;

    // Pagos y ganancias
    const payments = await SpeakerPayment.findAll({
      where: { speakerId },
      attributes: ['amount', 'status']
    });

    const totalEarnings = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    // Evaluaciones
    const evaluations = await SpeakerEvaluation.findAll({
      where: { speakerId },
      attributes: ['overallRating']
    });

    const averageRating = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length
      : 0;

    const totalEvaluations = evaluations.length;

    // Distribución de ratings
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    evaluations.forEach(e => {
      const rating = Math.floor(e.overallRating);
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Modalidad más usada
    const modalityCount: Record<string, number> = {};
    events.forEach(e => {
      modalityCount[e.modality] = (modalityCount[e.modality] || 0) + 1;
    });
    const mostUsedModality = Object.keys(modalityCount).length > 0
      ? Object.keys(modalityCount).reduce((a, b) => modalityCount[a] > modalityCount[b] ? a : b)
      : 'virtual';

    // Rol más común
    const roleCount: Record<string, number> = {};
    events.forEach(e => {
      roleCount[e.role] = (roleCount[e.role] || 0) + 1;
    });
    const mostCommonRole = Object.keys(roleCount).length > 0
      ? Object.keys(roleCount).reduce((a, b) => roleCount[a] > roleCount[b] ? a : b)
      : 'keynote_speaker';

    // Especialidades
    const speaker = await Speaker.findByPk(speakerId, {
      include: [{ model: Specialty, through: { attributes: [] } }]
    });
    const specialtiesCount = speaker?.specialties?.length || 0;

    // Próximos eventos
    const nextEvent = await SpeakerEvent.findOne({
      where: {
        speakerId,
        status: 'confirmed',
        participationStart: { [Op.gt]: new Date() }
      },
      order: [['participationStart', 'ASC']]
    });

    // Último evento completado
    const completedEventsList = events
      .filter(e => e.status === 'completed' && e.participationEnd)
      .sort((a, b) => (b.participationEnd!.getTime() - a.participationEnd!.getTime()));

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      cancelledEvents,
      totalEarnings,
      averageRating: Math.round(averageRating * 100) / 100,
      totalEvaluations,
      ratingDistribution,
      mostUsedModality: mostUsedModality as any,
      mostCommonRole: mostCommonRole as any,
      specialtiesCount,
      yearsOfExperience: 0, // TODO: Calcular basado en fecha de creación o eventos
      lastEventDate: completedEventsList.length > 0 ? completedEventsList[0].participationEnd! : undefined,
      nextEventDate: nextEvent?.participationStart || undefined
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

export const speakerDashboardService = new SpeakerDashboardService();