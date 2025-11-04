/**
 * @fileoverview Servicio de Speakers para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de speakers
 *
 * Archivo: backend/src/services/speakerService.ts
 */

import { Speaker } from '../models/Speaker';
import { Specialty } from '../models/Specialty';
import { SpeakerSpecialty } from '../models/SpeakerSpecialty';
import { SpeakerAvailabilityBlock } from '../models/SpeakerAvailabilityBlock';
import { SpeakerEvent } from '../models/SpeakerEvent';
import { SpeakerEvaluation } from '../models/SpeakerEvaluation';
import { SpeakerPayment } from '../models/SpeakerPayment';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { Event } from '../models/Event';
import {
  CreateSpeakerData,
  UpdateSpeakerData,
  PublicSpeaker,
  DetailedSpeaker,
  AdminSpeaker,
  SpeakerFilters,
  SpeakerQueryParams,
  SpeakerSearchResult,
  CreateAvailabilityBlockData,
  CreateSpeakerEvaluationData,
  SpeakerStats,
  SpeakersOverviewStats
} from '../types/speaker.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { EventEmitter } from 'events';
import { cacheService } from './cacheService';

/**
 * Servicio para manejo de operaciones de speakers
 */
export class SpeakerService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // OPERACIONES CRUD BÁSICAS
  // ====================================================================

  /**
   * Crea un nuevo speaker
   */
  async createSpeaker(
    speakerData: CreateSpeakerData,
    createdBy: number
  ): Promise<ApiResponse<DetailedSpeaker>> {
    try {
      // Validar datos de entrada
      const validation = await this.validateSpeakerData(speakerData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de speaker inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del speaker
      const speakerPayload: any = {
        ...speakerData,
        createdBy,
        totalEvents: 0,
        rating: 0,
        isActive: true
      };

      // Crear speaker
      const speaker = await Speaker.create(speakerPayload);

      // Crear relaciones con especialidades si se proporcionaron
      if (speakerData.specialtyIds && speakerData.specialtyIds.length > 0) {
        const specialtyRelations = speakerData.specialtyIds.map(specialtyId => ({
          speakerId: speaker.id,
          specialtyId
        }));
        await SpeakerSpecialty.bulkCreate(specialtyRelations);
      }

      // Cargar speaker completo con relaciones
      const fullSpeaker = await this.getSpeakerWithRelations(speaker.id);

      if (!fullSpeaker) {
        return {
          success: false,
          message: 'Error al cargar el speaker creado',
          error: 'SPEAKER_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'speaker_created',
        'speaker',
        {
          userId: createdBy,
          resourceId: speaker.id.toString(),
          newValues: speakerData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché de listas públicas
      await cacheService.deleteByPattern('speakers:active:*');

      // Emitir evento
      this.eventEmitter.emit('SpeakerCreated', {
        speakerId: speaker.id,
        speakerData: fullSpeaker,
        createdBy
      });

      return {
        success: true,
        message: 'Speaker creado exitosamente',
        data: fullSpeaker,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un speaker existente
   */
  async updateSpeaker(
    speakerId: number,
    updateData: UpdateSpeakerData,
    updatedBy: number
  ): Promise<ApiResponse<DetailedSpeaker>> {
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

      // Verificar permisos (solo el creador o admin puede actualizar)
      if (speaker.createdBy !== updatedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para actualizar este speaker',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validateSpeakerData(updateData as Partial<CreateSpeakerData>, true);
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
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        email: speaker.email,
        baseRate: speaker.baseRate,
        category: speaker.category,
        isActive: speaker.isActive
      };

      // Actualizar especialidades si se proporcionaron
      if (updateData.specialtyIds !== undefined) {
        await SpeakerSpecialty.destroy({ where: { speakerId } });
        if (updateData.specialtyIds.length > 0) {
          const specialtyRelations = updateData.specialtyIds.map(specialtyId => ({
            speakerId,
            specialtyId
          }));
          await SpeakerSpecialty.bulkCreate(specialtyRelations);
        }
      }

      // Actualizar speaker
      await speaker.update(updateData);

      // Cargar speaker actualizado
      const updatedSpeaker = await this.getSpeakerWithRelations(speakerId);

      if (!updatedSpeaker) {
        return {
          success: false,
          message: 'Error al cargar el speaker actualizado',
          error: 'SPEAKER_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'speaker_updated',
        'speaker',
        {
          userId: updatedBy,
          resourceId: speakerId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del speaker específico y listas
      await cacheService.delete(`speaker:detail:${speakerId}`);
      await cacheService.deleteByPattern('speakers:active:*');

      // Emitir evento
      this.eventEmitter.emit('SpeakerUpdated', {
        speakerId,
        oldData: oldValues,
        newData: updatedSpeaker,
        updatedBy
      });

      return {
        success: true,
        message: 'Speaker actualizado exitosamente',
        data: updatedSpeaker,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un speaker (soft delete)
   */
  async deleteSpeaker(
    speakerId: number,
    deletedBy: number
  ): Promise<ApiResponse<void>> {
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

      // Verificar permisos
      if (speaker.createdBy !== deletedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para eliminar este speaker',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si tiene eventos futuros asignados
      const futureEvents = await SpeakerEvent.count({
        where: {
          speakerId,
          participationStart: { [Op.gt]: new Date() },
          status: { [Op.in]: ['confirmed', 'tentative'] }
        }
      });

      if (futureEvents > 0) {
        return {
          success: false,
          message: 'No se puede eliminar un speaker con eventos futuros asignados',
          error: 'SPEAKER_HAS_FUTURE_EVENTS',
          timestamp: new Date().toISOString()
        };
      }

      // Soft delete
      await speaker.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'speaker_deleted',
        'speaker',
        {
          userId: deletedBy,
          resourceId: speakerId.toString(),
          oldValues: {
            firstName: speaker.firstName,
            lastName: speaker.lastName,
            email: speaker.email
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del speaker específico y listas
      await cacheService.delete(`speaker:detail:${speakerId}`);
      await cacheService.deleteByPattern('speakers:active:*');

      // Emitir evento
      this.eventEmitter.emit('SpeakerDeleted', {
        speakerId,
        speakerData: speaker.toJSON(),
        deletedBy
      });

      return {
        success: true,
        message: 'Speaker eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // OPERACIONES DE ESTADO Y VERIFICACIÓN
  // ====================================================================

  /**
   * Verifica un speaker
   */
  async verifySpeaker(
    speakerId: number,
    verifiedBy: number
  ): Promise<ApiResponse<DetailedSpeaker>> {
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

      // Verificar permisos (solo admin puede verificar)
      // TODO: Verificar permisos de administrador

      // Actualizar estado de verificación
      await speaker.update({
        verifiedAt: new Date(),
        verifiedBy
      });

      // Cargar speaker actualizado
      const verifiedSpeaker = await this.getSpeakerWithRelations(speakerId);

      if (!verifiedSpeaker) {
        return {
          success: false,
          message: 'Error al cargar el speaker verificado',
          error: 'SPEAKER_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'speaker_verified',
        'speaker',
        {
          userId: verifiedBy,
          resourceId: speakerId.toString(),
          newValues: {
            verifiedAt: speaker.verifiedAt,
            verifiedBy
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del speaker específico
      await cacheService.delete(`speaker:detail:${speakerId}`);

      // Emitir evento
      this.eventEmitter.emit('SpeakerVerified', {
        speakerId,
        speakerData: verifiedSpeaker,
        verifiedBy
      });

      return {
        success: true,
        message: 'Speaker verificado exitosamente',
        data: verifiedSpeaker,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error verificando speaker:', error);
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
   * Crea un bloqueo de disponibilidad
   */
  async createAvailabilityBlock(
    blockData: CreateAvailabilityBlockData
  ): Promise<ApiResponse<any>> {
    try {
      // Validar que no haya conflictos
      const conflicts = await SpeakerAvailabilityBlock.findAll({
        where: {
          speakerId: blockData.speakerId,
          [Op.or]: [
            {
              startDate: { [Op.lte]: blockData.startDate },
              endDate: { [Op.gte]: blockData.startDate }
            },
            {
              startDate: { [Op.lte]: blockData.endDate },
              endDate: { [Op.gte]: blockData.endDate }
            },
            {
              startDate: { [Op.gte]: blockData.startDate },
              endDate: { [Op.lte]: blockData.endDate }
            }
          ]
        }
      });

      if (conflicts.length > 0) {
        return {
          success: false,
          message: 'Ya existe un bloqueo de disponibilidad en ese horario',
          error: 'AVAILABILITY_CONFLICT',
          timestamp: new Date().toISOString()
        };
      }

      // Crear bloqueo
      const block = await SpeakerAvailabilityBlock.create({
        ...blockData,
        createdBy: blockData.createdBy
      });

      // Invalidar caché del speaker
      await cacheService.delete(`speaker:detail:${blockData.speakerId}`);

      return {
        success: true,
        message: 'Bloqueo de disponibilidad creado exitosamente',
        data: block,
        timestamp: new Date().toISOString()
      };

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

  // ====================================================================
  // EVALUACIONES
  // ====================================================================

  /**
   * Crea una evaluación de speaker
   */
  async createSpeakerEvaluation(
    evaluationData: CreateSpeakerEvaluationData
  ): Promise<ApiResponse<any>> {
    try {
      // Verificar que el speaker participó en el evento
      const speakerEvent = await SpeakerEvent.findOne({
        where: {
          speakerId: evaluationData.speakerId,
          eventId: evaluationData.eventId,
          status: 'completed'
        }
      });

      if (!speakerEvent) {
        return {
          success: false,
          message: 'El speaker no participó en este evento o aún no ha finalizado',
          error: 'SPEAKER_EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Crear evaluación
      const evaluation = await SpeakerEvaluation.create(evaluationData);

      // Recalcular rating promedio del speaker
      await this.updateSpeakerAverageRating(evaluationData.speakerId);

      // Invalidar caché del speaker
      await cacheService.delete(`speaker:detail:${evaluationData.speakerId}`);

      return {
        success: true,
        message: 'Evaluación creada exitosamente',
        data: evaluation,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando evaluación:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // CONSULTAS Y BÚSQUEDAS
  // ====================================================================

  /**
   * Obtiene speakers activos con filtros (con caché)
   */
  async getActiveSpeakers(params: SpeakerQueryParams = {}): Promise<ApiResponse<SpeakerSearchResult>> {
    try {
      const cacheKey = `speakers:active:${JSON.stringify(params)}`;

      // Usar patrón cache-aside
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => await this.fetchActiveSpeakersFromDB(params),
        300 // TTL de 5 minutos
      );

      return {
        success: true,
        message: 'Speakers obtenidos exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo speakers activos:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Método privado para obtener speakers activos desde la base de datos
   */
  private async fetchActiveSpeakersFromDB(params: SpeakerQueryParams): Promise<SpeakerSearchResult> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'rating',
      sortOrder = 'DESC',
      search,
      filters = {}
    } = params;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = { isActive: true };

    // Aplicar filtros adicionales
    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.minRating) {
      where.rating = { [Op.gte]: filters.minRating };
    }

    if (filters.modalities && filters.modalities.length > 0) {
      where.modalities = { [Op.overlap]: filters.modalities };
    }

    if (filters.languages && filters.languages.length > 0) {
      where.languages = { [Op.overlap]: filters.languages };
    }

    if (filters.minRate !== undefined || filters.maxRate !== undefined) {
      where.baseRate = {};
      if (filters.minRate !== undefined) where.baseRate[Op.gte] = filters.minRate;
      if (filters.maxRate !== undefined) where.baseRate[Op.lte] = filters.maxRate;
    }

    // Búsqueda por texto
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { shortBio: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Ordenamiento
    const order: any[] = [];
    switch (sortBy) {
      case 'firstName':
        order.push(['firstName', sortOrder]);
        break;
      case 'lastName':
        order.push(['lastName', sortOrder]);
        break;
      case 'rating':
        order.push(['rating', sortOrder], ['totalEvents', 'DESC']);
        break;
      case 'totalEvents':
        order.push(['totalEvents', sortOrder]);
        break;
      case 'baseRate':
        order.push(['baseRate', sortOrder]);
        break;
      case 'createdAt':
        order.push(['createdAt', sortOrder]);
        break;
      case 'verifiedAt':
        order.push(['verifiedAt', sortOrder]);
        break;
      default:
        order.push(['rating', 'DESC'], ['totalEvents', 'DESC']);
    }

    const include: any[] = [
      {
        model: Specialty,
        through: { attributes: [] }
      }
    ];

    // Filtro por especialidades
    if (filters.specialties && filters.specialties.length > 0) {
      include[0].where = { id: { [Op.in]: filters.specialties } };
      include[0].required = true;
    }

    const { rows: speakers, count: total } = await Speaker.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true
    });

    const formattedSpeakers: PublicSpeaker[] = speakers.map(speaker => ({
      id: speaker.id,
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      fullName: speaker.fullName,
      email: speaker.email,
      phone: speaker.phone,
      country: speaker.country,
      profileImage: speaker.profileImage,
      shortBio: speaker.shortBio,
      linkedinUrl: speaker.linkedinUrl,
      twitterUrl: speaker.twitterUrl,
      websiteUrl: speaker.websiteUrl,
      baseRate: speaker.baseRate,
      rateType: speaker.rateType,
      modalities: speaker.modalities,
      languages: speaker.languages,
      category: speaker.category,
      rating: speaker.rating,
      totalEvents: speaker.totalEvents,
      isActive: speaker.isActive,
      verifiedAt: speaker.verifiedAt,
      specialties: speaker.specialties?.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        isActive: s.isActive
      })) || [],
      createdAt: speaker.createdAt
    }));

    return {
      speakers: formattedSpeakers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      },
      filters
    };
  }

  /**
   * Obtiene un speaker por ID con relaciones completas
   */
  async getSpeakerById(speakerId: number, includePrivate: boolean = false): Promise<ApiResponse<DetailedSpeaker | PublicSpeaker>> {
    try {
      const speaker = await this.getSpeakerWithRelations(speakerId, includePrivate);
      if (!speaker) {
        return {
          success: false,
          message: 'Speaker no encontrado',
          error: 'SPEAKER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Speaker obtenido exitosamente',
        data: speaker,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo speaker por ID:', error);
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
   * Obtiene estadísticas del dashboard para un speaker
   */
  async getSpeakerDashboardStats(speakerId: number): Promise<ApiResponse<SpeakerStats>> {
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
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + parseFloat(p.amount.toString()), 0);

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

  /**
   * Obtiene eventos asignados al speaker con filtros
   */
  async getSpeakerAssignedEvents(
    speakerId: number,
    filters: {
      status?: string;
      upcoming?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<{ events: any[]; pagination: any }>> {
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
          model: require('../models/Event').Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate', 'modality', 'status', 'location']
        }],
        limit,
        offset,
        order: [['participationStart', 'ASC']]
      });

      const events: any[] = speakerEvents.map(se => ({
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
  async updateSpeakerEventStatus(
    speakerId: number,
    eventId: number,
    status: string,
    notes?: string
  ): Promise<ApiResponse<any>> {
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
          participationStart: speakerEvent.participationStart!,
          participationEnd: speakerEvent.participationEnd!,
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
        } as any,
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

  /**
   * Obtiene un speaker con todas sus relaciones cargadas
   */
  private async getSpeakerWithRelations(speakerId: number, includePrivate: boolean = false): Promise<DetailedSpeaker | null> {
    const speaker = await Speaker.findByPk(speakerId, {
      include: [
        {
          model: Specialty,
          through: { attributes: [] }
        },
        {
          model: SpeakerAvailabilityBlock,
          as: 'availabilityBlocks'
        },
        {
          model: SpeakerEvaluation,
          as: 'evaluations',
          include: [
            {
              model: SpeakerEvent,
              as: 'speakerEvent',
              attributes: ['eventId']
            }
          ]
        }
      ]
    });

    if (!speaker) return null;

    const baseSpeaker = {
      id: speaker.id,
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      fullName: speaker.fullName,
      email: speaker.email,
      phone: speaker.phone,
      country: speaker.country,
      profileImage: speaker.profileImage,
      shortBio: speaker.shortBio,
      linkedinUrl: speaker.linkedinUrl,
      twitterUrl: speaker.twitterUrl,
      websiteUrl: speaker.websiteUrl,
      baseRate: speaker.baseRate,
      rateType: speaker.rateType,
      modalities: speaker.modalities,
      languages: speaker.languages,
      category: speaker.category,
      rating: speaker.rating,
      totalEvents: speaker.totalEvents,
      isActive: speaker.isActive,
      verifiedAt: speaker.verifiedAt,
      specialties: speaker.specialties?.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        isActive: s.isActive
      })) || [],
      createdAt: speaker.createdAt
    };

    const detailedSpeaker: DetailedSpeaker = {
      ...baseSpeaker,
      nit: includePrivate ? speaker.nit : undefined,
      cui: includePrivate ? speaker.cui : undefined,
      rtu: includePrivate ? speaker.rtu : undefined,
      fullBio: includePrivate ? speaker.fullBio : undefined,
      cvFile: includePrivate ? speaker.cvFile : undefined,
      availabilityBlocks: speaker.availabilityBlocks || [],
      recentEvaluations: speaker.evaluations?.slice(0, 5).map(e => ({
        id: e.id,
        eventId: e.eventId,
        eventTitle: '', // TODO: Obtener título del evento
        evaluatorType: e.evaluatorType,
        evaluatorId: e.evaluatorId,
        overallRating: e.overallRating,
        criteriaRatings: e.criteriaRatings,
        comments: e.comments,
        isPublic: e.isPublic,
        evaluationDate: e.evaluationDate,
        createdAt: e.createdAt
      })) || [],
      evaluationStats: await this.getSpeakerEvaluationStats(speakerId),
      updatedAt: speaker.updatedAt
    };

    return detailedSpeaker;
  }

  /**
   * Actualiza el rating promedio de un speaker
   */
  private async updateSpeakerAverageRating(speakerId: number): Promise<void> {
    const evaluations = await SpeakerEvaluation.findAll({
      where: { speakerId },
      attributes: ['overallRating']
    });

    if (evaluations.length === 0) return;

    const sum = evaluations.reduce((acc, evaluation) => acc + evaluation.overallRating, 0);
    const averageRating = Math.round((sum / evaluations.length) * 100) / 100;

    await Speaker.update(
      { rating: averageRating },
      { where: { id: speakerId } }
    );
  }

  /**
   * Obtiene estadísticas de evaluaciones de un speaker
   */
  private async getSpeakerEvaluationStats(speakerId: number): Promise<any> {
    const evaluations = await SpeakerEvaluation.findAll({
      where: { speakerId },
      attributes: ['overallRating', 'criteriaRatings']
    });

    const totalEvaluations = evaluations.length;
    const averageRating = totalEvaluations > 0
      ? evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / totalEvaluations
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    evaluations.forEach(evaluation => {
      const rating = Math.floor(evaluation.overallRating);
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    return {
      totalEvaluations,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      criteriaAverages: {} // TODO: Implementar cálculo de promedios por criterio
    };
  }

  /**
   * Valida datos de speaker
   */
  private async validateSpeakerData(data: Partial<CreateSpeakerData>, isUpdate: boolean = false): Promise<any> {
    const errors: any[] = [];

    // Validaciones básicas
    if (!isUpdate || data.firstName !== undefined) {
      if (!data.firstName || data.firstName.trim().length < 2) {
        errors.push({
          field: 'firstName',
          message: 'El nombre debe tener al menos 2 caracteres',
          value: data.firstName
        });
      }
    }

    if (!isUpdate || data.lastName !== undefined) {
      if (!data.lastName || data.lastName.trim().length < 2) {
        errors.push({
          field: 'lastName',
          message: 'El apellido debe tener al menos 2 caracteres',
          value: data.lastName
        });
      }
    }

    if (!isUpdate || data.email !== undefined) {
      if (!data.email) {
        errors.push({
          field: 'email',
          message: 'El email es requerido',
          value: data.email
        });
      }
    }

    if (!isUpdate || data.baseRate !== undefined) {
      if (data.baseRate !== undefined && data.baseRate < 0) {
        errors.push({
          field: 'baseRate',
          message: 'La tarifa base no puede ser negativa',
          value: data.baseRate
        });
      }
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

export const speakerService = new SpeakerService();
