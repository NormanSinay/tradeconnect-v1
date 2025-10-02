/**
 * @fileoverview Controlador de Speakers para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de speakers
 *
 * Archivo: backend/src/controllers/speakerController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { speakerService } from '../services/speakerService';
import {
  CreateSpeakerData,
  UpdateSpeakerData,
  CreateAvailabilityBlockData,
  CreateSpeakerEvaluationData,
  SpeakerQueryParams
} from '../types/speaker.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones de speakers
 */
export class SpeakerController {

  /**
   * @swagger
   * /api/speakers:
   *   post:
   *     tags: [Speakers]
   *     summary: Crear un nuevo speaker
   *     description: Crea un speaker en el sistema
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateSpeakerData'
   *     responses:
   *       201:
   *         description: Speaker creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async createSpeaker(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const speakerData: CreateSpeakerData = req.body;

      const result = await speakerService.createSpeaker(speakerData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error creando speaker:', error);
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
   * /api/speakers/{id}:
   *   get:
   *     tags: [Speakers]
   *     summary: Obtener speaker por ID
   *     description: Obtiene los detalles de un speaker específico
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Speaker obtenido exitosamente
   *       404:
   *         description: Speaker no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getSpeaker(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const speakerId = parseInt(id);

      if (isNaN(speakerId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de speaker inválido',
          error: 'INVALID_SPEAKER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await speakerService.getSpeakerById(speakerId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo speaker:', error);
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
   * /api/speakers/{id}:
   *   put:
   *     tags: [Speakers]
   *     summary: Actualizar speaker
   *     description: Actualiza la información de un speaker específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateSpeakerData'
   *     responses:
   *       200:
   *         description: Speaker actualizado exitosamente
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
  async updateSpeaker(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { id } = req.params;
      const speakerId = parseInt(id);

      if (isNaN(speakerId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de speaker inválido',
          error: 'INVALID_SPEAKER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: UpdateSpeakerData = req.body;

      const result = await speakerService.updateSpeaker(speakerId, updateData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error actualizando speaker:', error);
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
   * /api/speakers/{id}:
   *   delete:
   *     tags: [Speakers]
   *     summary: Eliminar speaker
   *     description: Elimina un speaker del sistema (soft delete)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Speaker eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Speaker no encontrado
   *       409:
   *         description: Speaker tiene eventos futuros
   *       500:
   *         description: Error interno del servidor
   */
  async deleteSpeaker(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const speakerId = parseInt(id);

      if (isNaN(speakerId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de speaker inválido',
          error: 'INVALID_SPEAKER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await speakerService.deleteSpeaker(speakerId, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error eliminando speaker:', error);
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
   * /api/speakers/{id}/verify:
   *   post:
   *     tags: [Speakers]
   *     summary: Verificar speaker
   *     description: Marca un speaker como verificado administrativamente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Speaker verificado exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Speaker no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async verifySpeaker(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const speakerId = parseInt(id);

      if (isNaN(speakerId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de speaker inválido',
          error: 'INVALID_SPEAKER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await speakerService.verifySpeaker(speakerId, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error verificando speaker:', error);
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
   * /api/speakers:
   *   get:
   *     tags: [Speakers]
   *     summary: Listar speakers activos
   *     description: Obtiene una lista de speakers activos con filtros
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
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [national, international, expert, special_guest]
   *       - in: query
   *         name: minRating
   *         schema:
   *           type: number
   *       - in: query
   *         name: modalities
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *     responses:
   *       200:
   *         description: Lista de speakers obtenida exitosamente
   *       500:
   *         description: Error interno del servidor
   */
  async getActiveSpeakers(req: Request, res: Response): Promise<void> {
    try {
      // Extraer parámetros de consulta
      const {
        page = 1,
        limit = 20,
        search,
        category,
        minRating,
        modalities,
        languages,
        specialties,
        sortBy,
        sortOrder
      } = req.query;

      const validSortBy = ['firstName', 'lastName', 'rating', 'totalEvents', 'baseRate', 'createdAt', 'verifiedAt'].includes(sortBy as string)
        ? sortBy as 'firstName' | 'lastName' | 'rating' | 'totalEvents' | 'baseRate' | 'createdAt' | 'verifiedAt'
        : 'rating';

      const params: SpeakerQueryParams = {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: validSortBy,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC',
        filters: {}
      };

      // Aplicar filtros
      if (category) {
        params.filters!.category = category as any;
      }
      if (minRating) {
        params.filters!.minRating = Number(minRating);
      }
      if (modalities) {
        params.filters!.modalities = Array.isArray(modalities) ? modalities as string[] : [modalities as string];
      }
      if (languages) {
        params.filters!.languages = Array.isArray(languages) ? languages as string[] : [languages as string];
      }
      if (specialties) {
        params.filters!.specialties = Array.isArray(specialties) ? specialties.map(s => Number(s)) : [Number(specialties)];
      }

      const result = await speakerService.getActiveSpeakers(params);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo speakers activos:', error);
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
   * /api/speakers/{id}/availability:
   *   post:
   *     tags: [Speakers]
   *     summary: Crear bloqueo de disponibilidad
   *     description: Crea un bloqueo de fechas no disponibles para un speaker
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateAvailabilityBlockData'
   *     responses:
   *       201:
   *         description: Bloqueo creado exitosamente
   *       400:
   *         description: Datos inválidos o conflicto de disponibilidad
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Speaker no encontrado
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

      const { id } = req.params;
      const speakerId = parseInt(id);

      if (isNaN(speakerId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de speaker inválido',
          error: 'INVALID_SPEAKER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const blockData: CreateAvailabilityBlockData = {
        ...req.body,
        speakerId,
        createdBy: userId
      };

      const result = await speakerService.createAvailabilityBlock(blockData);

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

  /**
   * @swagger
   * /api/speakers/{id}/evaluate:
   *   post:
   *     tags: [Speakers]
   *     summary: Evaluar speaker
   *     description: Crea una evaluación para un speaker después de un evento
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateSpeakerEvaluationData'
   *     responses:
   *       201:
   *         description: Evaluación creada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Speaker o evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async createSpeakerEvaluation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { id } = req.params;
      const speakerId = parseInt(id);

      if (isNaN(speakerId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de speaker inválido',
          error: 'INVALID_SPEAKER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const evaluationData: CreateSpeakerEvaluationData = {
        ...req.body,
        speakerId,
        evaluatorId: userId
      };

      const result = await speakerService.createSpeakerEvaluation(evaluationData);

      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error creando evaluación:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
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
      case 'EVENT_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'SPEAKER_HAS_FUTURE_EVENTS':
      case 'AVAILABILITY_CONFLICT':
      case 'SPEAKER_EVENT_NOT_FOUND':
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const speakerController = new SpeakerController();