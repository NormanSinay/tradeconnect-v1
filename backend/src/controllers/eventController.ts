/**
 * @fileoverview Controlador de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de eventos
 *
 * Archivo: backend/src/controllers/eventController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { eventService } from '../services/eventService';
import {
  CreateEventData,
  UpdateEventData,
  PublishEventData,
  EventQueryParams
} from '../types/event.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';
import { uploadService } from '../services/uploadService';

/**
 * Controlador para manejo de operaciones de eventos
 */
export class EventController {

  /**
   * @swagger
   * /api/events:
   *   post:
   *     tags: [Events]
   *     summary: Crear un nuevo evento
   *     description: Crea un evento en el sistema
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEventData'
   *     responses:
   *       201:
   *         description: Evento creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validación de entrada con express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Errores de validación en createEvent:', errors.array());
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Los datos proporcionados no cumplen con los requisitos',
          error: 'VALIDATION_ERROR',
          details: errors.array().map(err => ({
            field: (err as any).param || (err as any).path,
            message: err.msg,
            value: (err as any).value
          })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        logger.warn('Intento de crear evento sin autenticación');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const eventData: CreateEventData = req.body;

      // Validaciones adicionales del negocio
      try {
        this.validateEventData(eventData);
      } catch (validationError) {
        logger.warn('Error de validación de negocio en createEvent:', validationError);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validationError instanceof Error ? validationError.message : 'Datos inválidos',
          error: 'BUSINESS_VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventService.createEvent(eventData, userId);

      if (result.success) {
        logger.info(`Evento creado exitosamente: ${result.data?.id} por usuario ${userId}`);
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        logger.error('Error del servicio al crear evento:', result.error);
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error interno creando evento:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor al crear el evento',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/events/{id}:
   *   get:
   *     tags: [Events]
   *     summary: Obtener evento por ID
   *     description: Obtiene los detalles de un evento específico
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Evento obtenido exitosamente
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventService.getEventById(eventId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo evento:', error);
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
   * /api/events/{id}:
   *   put:
   *     tags: [Events]
   *     summary: Actualizar evento
   *     description: Actualiza la información de un evento específico
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
   *             $ref: '#/components/schemas/UpdateEventData'
   *     responses:
   *       200:
   *         description: Evento actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Errores de validación en updateEvent:', errors.array());
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Los datos proporcionados no cumplen con los requisitos',
          error: 'VALIDATION_ERROR',
          details: errors.array().map(err => ({
            field: (err as any).param || (err as any).path,
            message: err.msg,
            value: (err as any).value
          })),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId) || eventId <= 0) {
        logger.warn(`ID de evento inválido: ${id}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        logger.warn('Intento de actualizar evento sin autenticación');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: UpdateEventData = req.body;

      // Validaciones adicionales del negocio para actualización
      try {
        this.validateUpdateEventData(updateData, eventId);
      } catch (validationError) {
        logger.warn('Error de validación de negocio en updateEvent:', validationError);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validationError instanceof Error ? validationError.message : 'Datos inválidos',
          error: 'BUSINESS_VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventService.updateEvent(eventId, updateData, userId);

      if (result.success) {
        logger.info(`Evento actualizado exitosamente: ${eventId} por usuario ${userId}`);
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        logger.error('Error del servicio al actualizar evento:', result.error);
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error interno actualizando evento:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor al actualizar el evento',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/events/{id}:
   *   delete:
   *     tags: [Events]
   *     summary: Eliminar evento
   *     description: Elimina un evento del sistema (soft delete)
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
   *         description: Evento eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Evento no encontrado
   *       409:
   *         description: Evento tiene inscripciones activas
   *       500:
   *         description: Error interno del servidor
   */
  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
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

      const result = await eventService.deleteEvent(eventId, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error eliminando evento:', error);
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
   * /api/events/{id}/publish:
   *   post:
   *     tags: [Events]
   *     summary: Publicar evento
   *     description: Publica un evento para que sea visible para los usuarios
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PublishEventData'
   *     responses:
   *       200:
   *         description: Evento publicado exitosamente
   *       400:
   *         description: Evento no listo para publicar
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async publishEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId) || eventId <= 0) {
        logger.warn(`ID de evento inválido para publicar: ${id}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        logger.warn('Intento de publicar evento sin autenticación');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const publishData: PublishEventData = req.body || {};

      // Validar datos de publicación
      if (publishData.notifySubscribers !== undefined && typeof publishData.notifySubscribers !== 'boolean') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'El campo notifySubscribers debe ser un valor booleano',
          error: 'INVALID_PUBLISH_DATA',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (publishData.notificationMessage !== undefined) {
        if (typeof publishData.notificationMessage !== 'string') {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'El mensaje de notificación debe ser una cadena de texto',
            error: 'INVALID_PUBLISH_DATA',
            timestamp: new Date().toISOString()
          });
          return;
        }

        if (publishData.notificationMessage.length > 500) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'El mensaje de notificación no puede exceder 500 caracteres',
            error: 'INVALID_PUBLISH_DATA',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      const result = await eventService.publishEvent(eventId, publishData, userId);

      if (result.success) {
        logger.info(`Evento publicado exitosamente: ${eventId} por usuario ${userId}`);
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        logger.error('Error del servicio al publicar evento:', result.error);
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error interno publicando evento:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor al publicar el evento',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/events/{id}/status:
   *   put:
   *     tags: [Events]
   *     summary: Cambiar estado del evento
   *     description: Cambia el estado de un evento (cancelar, etc.)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: action
   *         required: true
   *         schema:
   *           type: string
   *           enum: [cancel]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Razón del cambio de estado
   *     responses:
   *       200:
   *         description: Estado del evento cambiado exitosamente
   *       400:
   *         description: Acción inválida
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async updateEventStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action } = req.query;
      const eventId = parseInt(id);

      if (isNaN(eventId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
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

      const { reason } = req.body;

      let result: ApiResponse<any>;

      switch (action) {
        case 'cancel':
          if (!reason || reason.trim().length === 0) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'Se requiere una razón para cancelar el evento',
              error: 'REASON_REQUIRED',
              timestamp: new Date().toISOString()
            });
            return;
          }
          result = await eventService.cancelEvent(eventId, reason, userId);
          break;

        default:
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Acción inválida',
            error: 'INVALID_ACTION',
            timestamp: new Date().toISOString()
          });
          return;
      }

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error cambiando estado del evento:', error);
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
   * /api/events:
   *   get:
   *     tags: [Events]
   *     summary: Listar eventos del usuario
   *     description: Obtiene una lista de eventos creados por el usuario autenticado
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
   *         name: status
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de eventos obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getUserEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
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

      // Extraer parámetros de consulta
      const {
        page = 1,
        limit = 20,
        status,
        search,
        sortBy,
        sortOrder
      } = req.query;

      const validSortBy = ['startDate', 'endDate', 'title', 'price', 'createdAt', 'publishedAt'].includes(sortBy as string)
        ? sortBy as 'startDate' | 'endDate' | 'title' | 'price' | 'createdAt' | 'publishedAt'
        : 'createdAt';

      const params: EventQueryParams = {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: validSortBy,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC',
        filters: {}
      };

      // Aplicar filtro de estado si se especifica
      if (status) {
        // Mapear nombres de estado comunes a IDs
        const statusMapping: { [key: string]: number } = {
          'draft': 1,      // Asumiendo IDs estándar
          'published': 2,
          'cancelled': 3,
          'completed': 4
        };

        const statusId = statusMapping[status as string];
        if (statusId) {
          params.filters!.eventStatusId = statusId;
        }
      }

      const result = await eventService.getUserEvents(userId, params);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo eventos del usuario:', error);
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
   * /api/events/{id}/duplicate:
   *   post:
   *     tags: [Events]
   *     summary: Duplicar evento
   *     description: Crea una copia del evento especificado
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: Nuevo título para el evento duplicado
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: Nueva fecha de inicio
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: Nueva fecha de fin
   *               price:
   *                 type: number
   *                 description: Nuevo precio
   *     responses:
   *       201:
   *         description: Evento duplicado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async duplicateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId) || eventId <= 0) {
        logger.warn(`ID de evento inválido para duplicar: ${id}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        logger.warn('Intento de duplicar evento sin autenticación');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const customizations: Partial<CreateEventData> = req.body;

      // Validaciones para las personalizaciones de duplicación
      try {
        this.validateDuplicateCustomizations(customizations);
      } catch (validationError) {
        logger.warn('Error de validación en duplicación:', validationError);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: validationError instanceof Error ? validationError.message : 'Datos de duplicación inválidos',
          error: 'DUPLICATE_VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventService.duplicateEvent(eventId, customizations, userId);

      if (result.success) {
        logger.info(`Evento duplicado exitosamente: ${eventId} por usuario ${userId}`);
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        logger.error('Error del servicio al duplicar evento:', result.error);
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error interno duplicando evento:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor al duplicar el evento',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/events/{id}/upload-media:
   *   post:
   *     tags: [Events]
   *     summary: Subir archivos multimedia al evento
   *     description: Sube imágenes, videos o documentos al evento
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
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *               altText:
   *                 type: string
   *               description:
   *                 type: string
   *               isFeatured:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Archivos subidos exitosamente
   *       400:
   *         description: Archivos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async uploadMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId) || eventId <= 0) {
        logger.warn(`ID de evento inválido para subir media: ${id}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        logger.warn('Intento de subir media sin autenticación');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar que el evento existe y el usuario tiene permisos
      const event = await eventService.getEventById(eventId, true);
      if (!event.success || !event.data) {
        logger.warn(`Evento no encontrado para subir media: ${eventId}`);
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos (solo el creador puede subir archivos)
      if ((event.data as any).creator?.id !== userId) {
        logger.warn(`Usuario ${userId} intentó subir media al evento ${eventId} sin permisos`);
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para subir archivos a este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar que hay archivos
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        logger.warn('Intento de subir media sin archivos');
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No se encontraron archivos para subir',
          error: 'NO_FILES_UPLOADED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const files = Array.isArray(req.files) ? req.files : req.files.files || [];
      if (files.length === 0) {
        logger.warn('Lista de archivos vacía');
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No se encontraron archivos para subir',
          error: 'NO_FILES_UPLOADED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validar límite de archivos (máximo 10 por subida)
      if (files.length > 10) {
        logger.warn(`Intento de subir ${files.length} archivos (máximo 10)`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No se pueden subir más de 10 archivos a la vez',
          error: 'TOO_MANY_FILES',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validar archivos
      const validation = uploadService.validateFiles(files);
      if (!validation.valid) {
        logger.warn('Archivos inválidos:', validation.errors);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Uno o más archivos no cumplen con los requisitos',
          error: 'INVALID_FILES',
          details: validation.errors,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validar metadatos opcionales
      if (req.body.altText && req.body.altText.length > 200) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'El texto alternativo no puede exceder 200 caracteres',
          error: 'INVALID_ALT_TEXT',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (req.body.description && req.body.description.length > 500) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'La descripción no puede exceder 500 caracteres',
          error: 'INVALID_DESCRIPTION',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const uploadedFiles = [];
      const errors = [];

      // Procesar cada archivo
      for (const file of files) {
        try {
          logger.info(`Procesando archivo: ${file.originalname}`);

          // Procesar archivo
          const processedFile = await uploadService.processUploadedFile(file);

          // Guardar en base de datos
          const mediaRecord = await uploadService.saveFileToDatabase(
            eventId,
            processedFile,
            userId,
            {
              altText: req.body.altText,
              description: req.body.description,
              isFeatured: req.body.isFeatured === 'true'
            }
          );

          uploadedFiles.push({
            id: mediaRecord.id,
            filename: processedFile.filename,
            originalName: processedFile.originalName,
            url: processedFile.url,
            type: mediaRecord.type,
            size: processedFile.size,
            thumbnails: processedFile.thumbnails
          });

        } catch (error) {
          logger.error(`Error procesando archivo ${file.originalname}:`, error);
          errors.push({
            filename: file.originalname,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      logger.info(`Subida de media completada: ${uploadedFiles.length} exitosos, ${errors.length} errores`);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: `Se subieron ${uploadedFiles.length} archivo(s) exitosamente${errors.length > 0 ? ` con ${errors.length} error(es)` : ''}`,
        data: {
          uploaded: uploadedFiles,
          errors: errors.length > 0 ? errors : undefined
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error interno subiendo media:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor al subir archivos multimedia',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/events/{id}/media:
   *   get:
   *     tags: [Events]
   *     summary: Obtener archivos multimedia del evento
   *     description: Obtiene la lista de archivos multimedia asociados al evento
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
   *         description: Archivos obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getEventMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Implementar método en servicio para obtener media del evento
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Funcionalidad en desarrollo',
        data: [],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting event media:', error);
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
   * /api/events/{id}/media/{mediaId}:
   *   delete:
   *     tags: [Events]
   *     summary: Eliminar archivo multimedia
   *     description: Elimina un archivo multimedia del evento
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: mediaId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Archivo eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Archivo no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async deleteMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id, mediaId } = req.params;
      const eventId = parseInt(id);
      const mediaIdNum = parseInt(mediaId);

      if (isNaN(eventId) || isNaN(mediaIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'IDs inválidos',
          error: 'INVALID_IDS',
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

      // TODO: Implementar lógica para eliminar archivo multimedia
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Funcionalidad en desarrollo',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error deleting media:', error);
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
      case 'BUSINESS_VALIDATION_ERROR':
        return HTTP_STATUS.BAD_REQUEST;
      case 'UNAUTHORIZED':
        return HTTP_STATUS.UNAUTHORIZED;
      case 'INSUFFICIENT_PERMISSIONS':
        return HTTP_STATUS.FORBIDDEN;
      case 'USER_NOT_FOUND':
      case 'EVENT_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'EVENT_NOT_READY_FOR_PUBLISHING':
      case 'EVENT_HAS_ACTIVE_REGISTRATIONS':
      case 'DUPLICATE_EVENT':
        return HTTP_STATUS.CONFLICT;
      case 'INVALID_FILE':
      case 'FILE_TOO_LARGE':
      case 'UNSUPPORTED_FILE_TYPE':
        return HTTP_STATUS.UNPROCESSABLE_ENTITY;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Método auxiliar para validaciones de negocio adicionales
   */
  private validateEventData(eventData: CreateEventData): void {
    // Validar fechas
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    const now = new Date();

    if (startDate <= now) {
      throw new Error('La fecha de inicio debe ser futura');
    }

    if (endDate <= startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validar duración máxima (30 días)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      throw new Error('La duración del evento no puede exceder 30 días');
    }

    // Validar precio
    if (eventData.price !== undefined && eventData.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (eventData.price !== undefined && eventData.price > 10000) {
      throw new Error('El precio no puede exceder Q10,000.00');
    }

    // Validar capacidad
    if (eventData.capacity !== undefined && eventData.capacity < 0) {
      throw new Error('La capacidad no puede ser negativa');
    }

    if (eventData.capacity !== undefined && eventData.capacity > 10000) {
      throw new Error('La capacidad no puede exceder 10,000 personas');
    }

    // Validar edades
    if (eventData.minAge !== undefined && eventData.minAge < 0) {
      throw new Error('La edad mínima no puede ser negativa');
    }

    if (eventData.maxAge !== undefined && eventData.maxAge < 0) {
      throw new Error('La edad máxima no puede ser negativa');
    }

    if (eventData.minAge !== undefined && eventData.maxAge !== undefined &&
        eventData.minAge > eventData.maxAge) {
      throw new Error('La edad máxima debe ser mayor o igual que la mínima');
    }

    // Validar título
    if (!eventData.title?.trim()) {
      throw new Error('El título del evento es obligatorio');
    }

    if (eventData.title.trim().length < 3) {
      throw new Error('El título debe tener al menos 3 caracteres');
    }

    if (eventData.title.trim().length > 100) {
      throw new Error('El título no puede exceder 100 caracteres');
    }

    // Validar descripción corta
    if (eventData.shortDescription && eventData.shortDescription.length > 200) {
      throw new Error('La descripción corta no puede exceder 200 caracteres');
    }

    // Validar descripción completa
    if (eventData.description && eventData.description.length > 2000) {
      throw new Error('La descripción completa no puede exceder 2000 caracteres');
    }

    // Validar requisitos
    if (eventData.requirements && eventData.requirements.length > 500) {
      throw new Error('Los requisitos no pueden exceder 500 caracteres');
    }

    // Validar ubicación para eventos presenciales
    if (!eventData.isVirtual && !eventData.location?.trim()) {
      throw new Error('La ubicación es obligatoria para eventos presenciales');
    }

    if (!eventData.isVirtual && eventData.location?.trim() && eventData.location.trim().length < 5) {
      throw new Error('La ubicación debe tener al menos 5 caracteres');
    }

    // Validar enlace virtual para eventos virtuales
    if (eventData.isVirtual && !eventData.virtualLocation?.trim()) {
      throw new Error('El enlace virtual es obligatorio para eventos virtuales');
    }

    if (eventData.isVirtual && eventData.virtualLocation?.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(eventData.virtualLocation.trim())) {
        throw new Error('El enlace virtual debe ser una URL válida (https://...)');
      }
    }

    // Validar tags
    if (eventData.tags && eventData.tags.length > 10) {
      throw new Error('No puede tener más de 10 etiquetas');
    }

    if (eventData.tags) {
      const invalidTags = eventData.tags.filter(tag => tag.length > 20);
      if (invalidTags.length > 0) {
        throw new Error('Cada etiqueta no puede exceder 20 caracteres');
      }
    }
  }

  /**
   * Método auxiliar para validaciones de personalizaciones de duplicación
   */
  private validateDuplicateCustomizations(customizations: Partial<CreateEventData>): void {
    // Validar título si se proporciona
    if (customizations.title !== undefined) {
      if (!customizations.title.trim()) {
        throw new Error('El título no puede estar vacío');
      }

      if (customizations.title.trim().length < 3) {
        throw new Error('El título debe tener al menos 3 caracteres');
      }

      if (customizations.title.trim().length > 100) {
        throw new Error('El título no puede exceder 100 caracteres');
      }
    }

    // Validar fechas si se proporcionan ambas
    if (customizations.startDate && customizations.endDate) {
      const startDate = new Date(customizations.startDate);
      const endDate = new Date(customizations.endDate);
      const now = new Date();

      if (startDate >= endDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      // Validar que las fechas no sean en el pasado
      if (startDate <= now) {
        throw new Error('La fecha de inicio debe ser futura');
      }

      // Validar duración máxima (30 días)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        throw new Error('La duración del evento no puede exceder 30 días');
      }
    } else if (customizations.startDate && !customizations.endDate) {
      throw new Error('Si se modifica la fecha de inicio, también debe modificarse la fecha de fin');
    } else if (!customizations.startDate && customizations.endDate) {
      throw new Error('Si se modifica la fecha de fin, también debe modificarse la fecha de inicio');
    }

    // Validar precio si se proporciona
    if (customizations.price !== undefined && customizations.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (customizations.price !== undefined && customizations.price > 10000) {
      throw new Error('El precio no puede exceder Q10,000.00');
    }

    // Validar otras personalizaciones usando la validación general
    if (Object.keys(customizations).length > 0) {
      try {
        // Crear un objeto temporal con las personalizaciones para validar
        const tempEventData: any = {
          title: customizations.title || 'Temporal',
          startDate: customizations.startDate || new Date(Date.now() + 86400000).toISOString(),
          endDate: customizations.endDate || new Date(Date.now() + 86400000 * 2).toISOString(),
          eventTypeId: customizations.eventTypeId || 1,
          eventCategoryId: customizations.eventCategoryId || 1,
          ...customizations
        };

        this.validateEventData(tempEventData);
      } catch (error) {
        // Re-throw con mensaje más específico para duplicación
        if (error instanceof Error) {
          throw new Error(`Error en personalización de duplicación: ${error.message}`);
        }
        throw error;
      }
    }
  }

  /**
   * Método auxiliar para validaciones de negocio en actualización
   */
  private validateUpdateEventData(updateData: UpdateEventData, eventId: number): void {
    // Validar fechas si se proporcionan
    if (updateData.startDate || updateData.endDate) {
      // Obtener las fechas actuales del evento para comparación
      // Nota: En un escenario real, esto debería obtenerse del servicio
      const startDate = updateData.startDate ? new Date(updateData.startDate) : null;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : null;

      if (startDate) {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time for date comparison

        // Solo validar fecha futura si es un evento que aún no ha empezado
        // Esto debería verificarse contra la fecha actual del evento
        if (startDate < now) {
          throw new Error('La fecha de inicio no puede ser en el pasado');
        }
      }

      if (startDate && endDate && endDate <= startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      if (startDate && endDate) {
        // Validar duración máxima (30 días)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
          throw new Error('La duración del evento no puede exceder 30 días');
        }
      }
    }

    // Validar precio
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    if (updateData.price !== undefined && updateData.price > 10000) {
      throw new Error('El precio no puede exceder Q10,000.00');
    }

    // Validar capacidad
    if (updateData.capacity !== undefined && updateData.capacity < 0) {
      throw new Error('La capacidad no puede ser negativa');
    }

    if (updateData.capacity !== undefined && updateData.capacity > 10000) {
      throw new Error('La capacidad no puede exceder 10,000 personas');
    }

    // Validar edades
    if (updateData.minAge !== undefined && updateData.minAge < 0) {
      throw new Error('La edad mínima no puede ser negativa');
    }

    if (updateData.maxAge !== undefined && updateData.maxAge < 0) {
      throw new Error('La edad máxima no puede ser negativa');
    }

    if (updateData.minAge !== undefined && updateData.maxAge !== undefined &&
        updateData.minAge > updateData.maxAge) {
      throw new Error('La edad máxima debe ser mayor o igual que la mínima');
    }

    // Validar título
    if (updateData.title !== undefined) {
      if (!updateData.title.trim()) {
        throw new Error('El título del evento es obligatorio');
      }

      if (updateData.title.trim().length < 3) {
        throw new Error('El título debe tener al menos 3 caracteres');
      }

      if (updateData.title.trim().length > 100) {
        throw new Error('El título no puede exceder 100 caracteres');
      }
    }

    // Validar descripciones
    if (updateData.shortDescription && updateData.shortDescription.length > 200) {
      throw new Error('La descripción corta no puede exceder 200 caracteres');
    }

    if (updateData.description && updateData.description.length > 2000) {
      throw new Error('La descripción completa no puede exceder 2000 caracteres');
    }

    if (updateData.requirements && updateData.requirements.length > 500) {
      throw new Error('Los requisitos no pueden exceder 500 caracteres');
    }

    // Validar ubicación para eventos presenciales
    if (updateData.isVirtual === false && updateData.location !== undefined) {
      if (!updateData.location.trim()) {
        throw new Error('La ubicación es obligatoria para eventos presenciales');
      }

      if (updateData.location.trim().length < 5) {
        throw new Error('La ubicación debe tener al menos 5 caracteres');
      }
    }

    // Validar enlace virtual para eventos virtuales
    if (updateData.isVirtual === true && updateData.virtualLocation !== undefined) {
      if (!updateData.virtualLocation.trim()) {
        throw new Error('El enlace virtual es obligatorio para eventos virtuales');
      }

      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(updateData.virtualLocation.trim())) {
        throw new Error('El enlace virtual debe ser una URL válida (https://...)');
      }
    }

    // Validar tags
    if (updateData.tags && updateData.tags.length > 10) {
      throw new Error('No puede tener más de 10 etiquetas');
    }

    if (updateData.tags) {
      const invalidTags = updateData.tags.filter(tag => tag.length > 20);
      if (invalidTags.length > 0) {
        throw new Error('Cada etiqueta no puede exceder 20 caracteres');
      }
    }
  }
}

export const eventController = new EventController();