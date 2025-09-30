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

      const eventData: CreateEventData = req.body;

      const result = await eventService.createEvent(eventData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error creando evento:', error);
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

      const updateData: UpdateEventData = req.body;

      const result = await eventService.updateEvent(eventId, updateData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error actualizando evento:', error);
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

      const publishData: PublishEventData = req.body || {};

      const result = await eventService.publishEvent(eventId, publishData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error publicando evento:', error);
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

      const customizations: Partial<CreateEventData> = req.body;

      const result = await eventService.duplicateEvent(eventId, customizations, userId);

      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error duplicando evento:', error);
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

      // Verificar que el evento existe y el usuario tiene permisos
      const event = await eventService.getEventById(eventId, true);
      if (!event.success || !event.data) {
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
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No se encontraron archivos para subir',
          error: 'NO_FILES_UPLOADED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validar archivos
      const validation = uploadService.validateFiles(files);
      if (!validation.valid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Archivos inválidos',
          error: 'INVALID_FILES',
          details: validation.errors,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const uploadedFiles = [];
      const errors = [];

      // Procesar cada archivo
      for (const file of files) {
        try {
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
          logger.error('Error processing file:', error);
          errors.push({
            filename: file.originalname,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: `Se subieron ${uploadedFiles.length} archivo(s) exitosamente`,
        data: {
          uploaded: uploadedFiles,
          errors: errors.length > 0 ? errors : undefined
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error uploading media:', error);
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
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const eventController = new EventController();