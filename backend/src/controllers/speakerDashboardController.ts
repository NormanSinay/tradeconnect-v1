/**
 * @fileoverview Controlador de Dashboard para Speakers en TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para funcionalidades específicas del dashboard de speakers
 *
 * Archivo: backend/src/controllers/speakerDashboardController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { speakerService } from '../services/speakerService';
import { speakerDashboardService } from '../services/speakerDashboardService';
import { eventService } from '../services/eventService';
import { notificationService } from '../services/notificationService';
import {
  SpeakerStats,
  SpeakerEventInfo,
  UpdateSpeakerData,
  CreateAvailabilityBlockData,
  SpeakerEvaluationInfo
} from '../types/speaker.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { SpeakerEvent } from '../models/SpeakerEvent';
import { Speaker } from '../models/Speaker';
import { Op } from 'sequelize';

/**
 * Controlador para manejo de operaciones del dashboard de speakers
 */
export class SpeakerDashboardController {

  /**
   * @swagger
   * /api/v1/speakers/dashboard/stats:
   *   get:
   *     tags: [Speaker Dashboard]
   *     summary: Obtener estadísticas del dashboard del speaker
   *     description: Obtiene estadísticas generales del speaker para el dashboard
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await speakerDashboardService.getDashboardStats(speakerId);
      if (!result.success) {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
        return;
      }

      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo estadísticas del dashboard:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/speakers/dashboard/events:
   *   get:
   *     tags: [Speaker Dashboard]
   *     summary: Obtener eventos asignados del speaker
   *     description: Obtiene la lista de eventos asignados al speaker con filtros opcionales
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [tentative, confirmed, cancelled, completed]
   *       - in: query
   *         name: upcoming
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: Eventos obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getAssignedEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { status, upcoming, page = 1, limit = 20 } = req.query;

      const result = await speakerDashboardService.getAssignedEvents(speakerId, {
        status: status as string,
        upcoming: upcoming === 'true',
        page: Number(page),
        limit: Number(limit)
      });

      if (!result.success) {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
        return;
      }

      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo eventos asignados:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/speakers/dashboard/materials:
   *   get:
   *     tags: [Speaker Dashboard]
   *     summary: Obtener materiales del speaker
   *     description: Obtiene la lista de materiales asociados al speaker
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Materiales obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getSpeakerMaterials(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await speakerDashboardService.getSpeakerMaterials(speakerId);
      if (!result.success) {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
        return;
      }

      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo materiales del speaker:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/speakers/dashboard/notifications:
   *   get:
   *     tags: [Speaker Dashboard]
   *     summary: Obtener notificaciones del speaker
   *     description: Obtiene las notificaciones del speaker con paginación
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: unreadOnly
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Notificaciones obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getSpeakerNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { page = 1, limit = 20, unreadOnly } = req.query;

      const result = await speakerDashboardService.getSpeakerNotifications(speakerId, {
        page: Number(page),
        limit: Number(limit),
        unreadOnly: unreadOnly === 'true'
      });

      if (!result.success) {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
        return;
      }

      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo notificaciones del speaker:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/speakers/dashboard/profile:
   *   get:
   *     tags: [Speaker Dashboard]
   *     summary: Obtener perfil del speaker
   *     description: Obtiene la información completa del perfil del speaker
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil obtenido exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Speaker no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getSpeakerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await speakerDashboardService.getSpeakerProfile(speakerId);

      if (!result.success) {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
        return;
      }

      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo perfil del speaker:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/speakers/dashboard/profile:
   *   put:
   *     tags: [Speaker Dashboard]
   *     summary: Actualizar perfil del speaker
   *     description: Actualiza la información del perfil del speaker
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateSpeakerData'
   *     responses:
   *       200:
   *         description: Perfil actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Speaker no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async updateSpeakerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: UpdateSpeakerData = req.body;

      const result = await speakerService.updateSpeaker(speakerId, updateData, speakerId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error actualizando perfil del speaker:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/speakers/dashboard/availability:
   *   get:
   *     tags: [Speaker Dashboard]
   *     summary: Obtener disponibilidad del speaker
   *     description: Obtiene los bloques de disponibilidad del speaker
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Disponibilidad obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getSpeakerAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await speakerDashboardService.getSpeakerAvailability(speakerId);
      if (!result.success) {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
        return;
      }

      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo disponibilidad del speaker:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/v1/speakers/dashboard/availability:
   *   post:
   *     tags: [Speaker Dashboard]
   *     summary: Crear bloqueo de disponibilidad
   *     description: Crea un nuevo bloqueo de disponibilidad para el speaker
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - startDate
   *               - endDate
   *             properties:
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *               reason:
   *                 type: string
   *                 maxLength: 500
   *               isRecurring:
   *                 type: boolean
   *               recurrencePattern:
   *                 type: string
   *                 enum: [daily, weekly, monthly, yearly]
   *     responses:
   *       201:
   *         description: Bloqueo creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       409:
   *         description: Conflicto de disponibilidad
   *       500:
   *         description: Error interno del servidor
   */
  async createAvailabilityBlock(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const speakerId = req.user?.id;
      if (!speakerId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const blockData: CreateAvailabilityBlockData = {
        speakerId,
        ...req.body,
        createdBy: speakerId
      };

      const result = await speakerDashboardService.createAvailabilityBlock(blockData);

      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error creando bloqueo de disponibilidad:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // MÉTODOS PRIVADOS DE APOYO
  // ====================================================================

  /**
   * Obtiene estadísticas del speaker para el dashboard
   */
  private async getSpeakerStats(speakerId: number): Promise<SpeakerStats> {
    const speaker = await Speaker.findByPk(speakerId);
    if (!speaker) {
      throw new Error('Speaker no encontrado');
    }

    // Eventos asignados
    const events = await SpeakerEvent.findAll({
      where: { speakerId },
      attributes: ['status', 'participationStart', 'participationEnd']
    });

    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const upcomingEvents = events.filter(e => e.status === 'confirmed' && e.participationStart && e.participationStart > new Date()).length;
    const cancelledEvents = events.filter(e => e.status === 'cancelled').length;

    // Evaluaciones (calculando directamente)
    const evaluations = await this.calculateSpeakerEvaluationStats(speakerId);

    // Próximos eventos
    const nextEvent = await SpeakerEvent.findOne({
      where: {
        speakerId,
        status: 'confirmed',
        participationStart: { [Op.gt]: new Date() }
      },
      order: [['participationStart', 'ASC']]
    });

    // Calcular último evento completado
    const completedEventsList = events
      .filter(e => e.status === 'completed' && e.participationEnd)
      .sort((a, b) => (b.participationEnd!.getTime() - a.participationEnd!.getTime()));

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      cancelledEvents,
      totalEarnings: 0, // TODO: Implementar cálculo de ganancias
      averageRating: evaluations.averageRating,
      totalEvaluations: evaluations.totalEvaluations,
      ratingDistribution: evaluations.ratingDistribution,
      mostUsedModality: 'virtual', // TODO: Calcular modalidad más usada
      mostCommonRole: 'keynote_speaker', // TODO: Calcular rol más común
      specialtiesCount: speaker.specialties?.length || 0,
      yearsOfExperience: 0, // TODO: Calcular años de experiencia
      lastEventDate: completedEventsList.length > 0 ? completedEventsList[0].participationEnd! : undefined,
      nextEventDate: nextEvent?.participationStart || undefined
    };
  }

  /**
   * Obtiene eventos asignados al speaker
   */
  private async getSpeakerAssignedEvents(speakerId: number, filters: any): Promise<any> {
    const where: any = { speakerId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.upcoming) {
      where.participationStart = { [Op.gt]: new Date() };
      where.status = { [Op.in]: ['confirmed', 'tentative'] };
    }

    const { rows: events, count: total } = await SpeakerEvent.findAndCountAll({
      where,
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      order: [['participationStart', 'ASC']],
      include: [{
        model: require('../models/Event').Event,
        as: 'event',
        attributes: ['id', 'title', 'startDate', 'endDate', 'modality', 'status']
      }]
    });

    return {
      events: events.map(e => ({
        id: e.id,
        eventId: e.eventId,
        eventTitle: e.event?.title || 'Evento sin título',
        eventStartDate: e.event?.startDate,
        eventEndDate: e.event?.endDate,
        role: e.role,
        participationStart: e.participationStart,
        participationEnd: e.participationEnd,
        durationMinutes: e.durationMinutes,
        modality: e.modality,
        order: e.order,
        status: e.status,
        notes: e.notes,
        confirmedAt: e.confirmedAt,
        cancelledAt: e.cancelledAt,
        cancellationReason: e.cancellationReason
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
        hasNext: filters.page * filters.limit < total,
        hasPrevious: filters.page > 1
      }
    };
  }

  /**
   * Obtiene materiales del speaker
   */
  private async getSpeakerMaterialsData(speakerId: number): Promise<any[]> {
    // TODO: Implementar cuando se tenga el modelo de materiales
    // Por ahora retornamos un array vacío
    return [];
  }

  /**
   * Obtiene notificaciones del speaker
   */
  private async getSpeakerNotificationsData(speakerId: number, filters: any): Promise<any> {
    // TODO: Implementar cuando se tenga el servicio de notificaciones
    // Por ahora retornamos datos mock
    return {
      notifications: [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrevious: false
      }
    };
  }

  /**
   * Obtiene disponibilidad del speaker
   */
  private async getSpeakerAvailabilityData(speakerId: number): Promise<any[]> {
    const { SpeakerAvailabilityBlock } = require('../models/SpeakerAvailabilityBlock');

    const blocks = await SpeakerAvailabilityBlock.findAll({
      where: { speakerId },
      order: [['startDate', 'ASC']]
    });

    return blocks.map((block: any) => ({
      id: block.id,
      startDate: block.startDate,
      endDate: block.endDate,
      reason: block.reason,
      isRecurring: block.isRecurring,
      recurrencePattern: block.recurrencePattern,
      createdAt: block.createdAt
    }));
  }

  /**
   * Calcula estadísticas de evaluaciones del speaker
   */
  private async calculateSpeakerEvaluationStats(speakerId: number): Promise<any> {
    const { SpeakerEvaluation } = require('../models/SpeakerEvaluation');

    const evaluations = await SpeakerEvaluation.findAll({
      where: { speakerId },
      attributes: ['overallRating', 'criteriaRatings']
    });

    const totalEvaluations = evaluations.length;
    const averageRating = totalEvaluations > 0
      ? evaluations.reduce((sum: number, evaluation: any) => sum + evaluation.overallRating, 0) / totalEvaluations
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    evaluations.forEach((evaluation: any) => {
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
   * Método auxiliar para obtener código de estado HTTP desde el tipo de error
   */
  private getStatusCodeFromError(errorType?: string): number {
    switch (errorType) {
      case 'VALIDATION_ERROR':
        return HTTP_STATUS.BAD_REQUEST;
      case 'UNAUTHORIZED':
        return HTTP_STATUS.UNAUTHORIZED;
      case 'INSUFFICIENT_PERMISSIONS':
        return HTTP_STATUS.FORBIDDEN;
      case 'SPEAKER_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'AVAILABILITY_CONFLICT':
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const speakerDashboardController = new SpeakerDashboardController();