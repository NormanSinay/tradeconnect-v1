/**
 * @fileoverview Controlador de Sesiones de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de sesiones de eventos
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { eventSessionService } from '../services/eventSessionService';
import {
  CreateEventSessionData,
  UpdateEventSessionData,
  EventSessionQueryParams
} from '../types/event-session.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';

/**
 * Controlador para manejo de operaciones de sesiones de eventos
 */
export class EventSessionController {

  /**
   * @swagger
   * /api/events/{eventId}/sessions:
   *   post:
   *     tags: [Event Sessions]
   *     summary: Crear sesión de evento
   *     description: Crea una nueva sesión para un evento específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEventSessionData'
   *     responses:
   *       201:
   *         description: Sesión creada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async createEventSession(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { eventId } = req.params;
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

      const sessionData: CreateEventSessionData = {
        ...req.body,
        eventId: parseInt(eventId)
      };

      const result = await eventSessionService.createEventSession(sessionData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error creando sesión de evento:', error);
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
   * /api/events/{eventId}/sessions:
   *   get:
   *     tags: [Event Sessions]
   *     summary: Listar sesiones de evento
   *     description: Obtiene todas las sesiones de un evento específico
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
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
   *         name: sessionType
   *         schema:
   *           type: string
   *           enum: [date, time_slot, workshop, track, other]
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Sesiones obtenidas exitosamente
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getEventSessions(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const eventIdNum = parseInt(eventId);

      if (isNaN(eventIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Extraer parámetros de consulta
      const {
        page = 1,
        limit = 20,
        sessionType,
        isActive,
        isVirtual,
        hasCapacity,
        sortBy,
        sortOrder
      } = req.query;

      const params: EventSessionQueryParams = {
        page: Number(page),
        limit: Number(limit),
        search: req.query.search as string,
        sortBy: sortBy as 'startDate' | 'endDate' | 'title' | 'capacity' | 'createdAt',
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC',
        filters: {}
      };

      // Aplicar filtros
      if (sessionType) {
        params.filters!.sessionType = sessionType as string;
      }
      if (isActive !== undefined) {
        params.filters!.isActive = isActive === 'true';
      }
      if (isVirtual !== undefined) {
        params.filters!.isVirtual = isVirtual === 'true';
      }
      if (hasCapacity !== undefined) {
        params.filters!.hasCapacity = hasCapacity === 'true';
      }

      const result = await eventSessionService.getEventSessions(eventIdNum, params);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo sesiones del evento:', error);
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
   * /api/events/{eventId}/sessions/{sessionId}:
   *   get:
   *     tags: [Event Sessions]
   *     summary: Obtener sesión específica
   *     description: Obtiene los detalles de una sesión específica
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Sesión obtenida exitosamente
   *       404:
   *         description: Sesión no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getEventSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId);

      if (isNaN(sessionIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de sesión inválido',
          error: 'INVALID_SESSION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventSessionService.getEventSessionById(sessionIdNum);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo sesión de evento:', error);
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
   * /api/events/{eventId}/sessions/{sessionId}:
   *   put:
   *     tags: [Event Sessions]
   *     summary: Actualizar sesión
   *     description: Actualiza la información de una sesión específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateEventSessionData'
   *     responses:
   *       200:
   *         description: Sesión actualizada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Sesión no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async updateEventSession(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId);
      const userId = req.user?.id;

      if (isNaN(sessionIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de sesión inválido',
          error: 'INVALID_SESSION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: UpdateEventSessionData = req.body;

      const result = await eventSessionService.updateEventSession(sessionIdNum, updateData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error actualizando sesión de evento:', error);
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
   * /api/events/{eventId}/sessions/{sessionId}:
   *   delete:
   *     tags: [Event Sessions]
   *     summary: Eliminar sesión
   *     description: Elimina una sesión de evento (soft delete)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Sesión eliminada exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Sesión no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async deleteEventSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId);
      const userId = req.user?.id;

      if (isNaN(sessionIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de sesión inválido',
          error: 'INVALID_SESSION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventSessionService.deleteEventSession(sessionIdNum, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error eliminando sesión de evento:', error);
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
   * /api/events/{eventId}/sessions/{sessionId}/availability:
   *   get:
   *     tags: [Event Sessions]
   *     summary: Verificar disponibilidad
   *     description: Verifica la disponibilidad de capacidad para una sesión
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: quantity
   *         schema:
   *           type: integer
   *           default: 1
   *     responses:
   *       200:
   *         description: Disponibilidad verificada
   *       404:
   *         description: Sesión no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async checkSessionAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId);
      const quantity = parseInt(req.query.quantity as string) || 1;

      if (isNaN(sessionIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de sesión inválido',
          error: 'INVALID_SESSION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventSessionService.checkSessionAvailability(sessionIdNum, quantity);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error verificando disponibilidad de sesión:', error);
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
   * /api/events/{eventId}/sessions/{sessionId}/block:
   *   post:
   *     tags: [Event Sessions]
   *     summary: Bloquear capacidad
   *     description: Bloquea capacidad temporalmente para una sesión
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *               blockDurationMinutes:
   *                 type: integer
   *                 minimum: 5
   *                 maximum: 60
   *                 default: 15
   *     responses:
   *       200:
   *         description: Capacidad bloqueada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Sesión no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async blockSessionCapacity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId);
      const { quantity, blockDurationMinutes = 15 } = req.body;

      if (isNaN(sessionIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de sesión inválido',
          error: 'INVALID_SESSION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!quantity || quantity < 1) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Cantidad debe ser mayor a 0',
          error: 'INVALID_QUANTITY',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventSessionService.blockSessionCapacity(sessionIdNum, quantity, blockDurationMinutes);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error bloqueando capacidad de sesión:', error);
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
   * /api/events/{eventId}/sessions/{sessionId}/release:
   *   post:
   *     tags: [Event Sessions]
   *     summary: Liberar capacidad
   *     description: Libera capacidad bloqueada de una sesión
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *     responses:
   *       200:
   *         description: Capacidad liberada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Sesión no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async releaseBlockedCapacity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId);
      const { quantity } = req.body;

      if (isNaN(sessionIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de sesión inválido',
          error: 'INVALID_SESSION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!quantity || quantity < 1) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Cantidad debe ser mayor a 0',
          error: 'INVALID_QUANTITY',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventSessionService.releaseBlockedCapacity(sessionIdNum, quantity);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error liberando capacidad de sesión:', error);
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
   * /api/events/{eventId}/sessions/stats:
   *   get:
   *     tags: [Event Sessions]
   *     summary: Estadísticas de sesiones
   *     description: Obtiene estadísticas generales de las sesiones de un evento
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getEventSessionsStats(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const eventIdNum = parseInt(eventId);

      if (isNaN(eventIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventSessionService.getEventSessionsStats(eventIdNum);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo estadísticas de sesiones:', error);
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
      case 'EVENT_NOT_FOUND':
      case 'SESSION_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'INSUFFICIENT_CAPACITY':
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const eventSessionController = new EventSessionController();