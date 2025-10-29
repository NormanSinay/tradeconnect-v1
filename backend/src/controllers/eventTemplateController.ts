/**
 * @fileoverview Controlador de Plantillas de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de plantillas de eventos
 *
 * Archivo: backend/src/controllers/eventTemplateController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { EventTemplate } from '../models/EventTemplate';
import { Event } from '../models/Event';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse, PaginatedResponse } from '../types/global.types';
import { eventService } from '../services/eventService';

/**
 * Controlador para manejo de operaciones de plantillas de eventos
 */
export class EventTemplateController {

  /**
   * Obtener plantillas del usuario o públicas
   */
  async getTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const {
        page = 1,
        limit = 20,
        search,
        isPublic
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = {};

      // Filtros
      if (search) {
        where.$or = [
          { name: { $iLike: `%${search}%` } },
          { description: { $iLike: `%${search}%` } }
        ];
      }

      // Si no es admin, solo mostrar plantillas públicas o propias
      if (isPublic === 'true') {
        where.isPublic = true;
      } else if (userId) {
        where.$or = [
          { createdBy: userId },
          { isPublic: true }
        ];
      } else {
        where.isPublic = true;
      }

      const { rows: templates, count: total } = await EventTemplate.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Event,
            as: 'events',
            attributes: ['id', 'title', 'startDate'],
            required: false,
            limit: 5 // Solo mostrar los últimos 5 eventos creados con esta plantilla
          }
        ]
      });

      const response: PaginatedResponse<any> = {
        success: true,
        message: 'Plantillas obtenidas exitosamente',
        data: templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          thumbnailUrl: template.thumbnailUrl,
          isPublic: template.isPublic,
          usageCount: template.usageCount,
          createdBy: template.createdBy,
          createdAt: template.createdAt,
          recentEvents: template.events?.slice(0, 3) || []
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
          hasNext: Number(page) * Number(limit) < total,
          hasPrevious: Number(page) > 1
        },
        timestamp: new Date().toISOString()
      };

      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      logger.error('Error obteniendo plantillas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener una plantilla específica
   */
  async getTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const templateId = parseInt(id);

      if (isNaN(templateId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de plantilla inválido',
          error: 'INVALID_TEMPLATE_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const template = await EventTemplate.findByPk(templateId, {
        include: [
          {
            model: Event,
            as: 'events',
            attributes: ['id', 'title', 'startDate', 'eventStatus'],
            required: false,
            limit: 10
          }
        ]
      });

      if (!template) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Plantilla no encontrada',
          error: 'TEMPLATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos (solo el creador o si es pública)
      if (!template.isPublic && template.createdBy !== userId) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para ver esta plantilla',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: ApiResponse<any> = {
        success: true,
        message: 'Plantilla obtenida exitosamente',
        data: {
          id: template.id,
          name: template.name,
          description: template.description,
          templateData: template.templateData,
          thumbnailUrl: template.thumbnailUrl,
          isPublic: template.isPublic,
          usageCount: template.usageCount,
          createdBy: template.createdBy,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          eventsCreated: template.events?.length || 0,
          recentEvents: template.events?.slice(0, 5) || []
        },
        timestamp: new Date().toISOString()
      };

      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      logger.error('Error obteniendo plantilla:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear una nueva plantilla
   */
  async createTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const {
        name,
        description,
        templateData,
        thumbnailUrl,
        isPublic = false
      } = req.body;

      // Verificar si el nombre ya existe para este usuario
      const existingTemplate = await EventTemplate.findOne({
        where: {
          name,
          createdBy: userId
        }
      });

      if (existingTemplate) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Ya tienes una plantilla con este nombre',
          error: 'TEMPLATE_NAME_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const template = await EventTemplate.create({
        name,
        description,
        templateData,
        thumbnailUrl,
        isPublic,
        createdBy: userId
      });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Plantilla creada exitosamente',
        data: {
          id: template.id,
          name: template.name,
          description: template.description,
          thumbnailUrl: template.thumbnailUrl,
          isPublic: template.isPublic,
          createdAt: template.createdAt
        },
        timestamp: new Date().toISOString()
      };

      res.status(HTTP_STATUS.CREATED).json(response);

    } catch (error) {
      logger.error('Error creando plantilla:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar una plantilla
   */
  async updateTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const userId = req.user?.id;
      const templateId = parseInt(id);

      if (isNaN(templateId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de plantilla inválido',
          error: 'INVALID_TEMPLATE_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const template = await EventTemplate.findByPk(templateId);
      if (!template) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Plantilla no encontrada',
          error: 'TEMPLATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos (solo el creador puede editar)
      if (template.createdBy !== userId) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para editar esta plantilla',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData = req.body;

      // Verificar nombre único si se está cambiando
      if (updateData.name && updateData.name !== template.name) {
        const existingTemplate = await EventTemplate.findOne({
          where: {
            name: updateData.name,
            createdBy: userId,
            id: { $ne: templateId }
          }
        });

        if (existingTemplate) {
          res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: 'Ya tienes una plantilla con este nombre',
            error: 'TEMPLATE_NAME_EXISTS',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      await template.update(updateData);

      const response: ApiResponse<any> = {
        success: true,
        message: 'Plantilla actualizada exitosamente',
        data: {
          id: template.id,
          name: template.name,
          description: template.description,
          thumbnailUrl: template.thumbnailUrl,
          isPublic: template.isPublic,
          updatedAt: template.updatedAt
        },
        timestamp: new Date().toISOString()
      };

      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      logger.error('Error actualizando plantilla:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar una plantilla
   */
  async deleteTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const templateId = parseInt(id);

      if (isNaN(templateId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de plantilla inválido',
          error: 'INVALID_TEMPLATE_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const template = await EventTemplate.findByPk(templateId);
      if (!template) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Plantilla no encontrada',
          error: 'TEMPLATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos (solo el creador puede eliminar)
      if (template.createdBy !== userId) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para eliminar esta plantilla',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Soft delete
      await template.destroy();

      const response: ApiResponse<void> = {
        success: true,
        message: 'Plantilla eliminada exitosamente',
        timestamp: new Date().toISOString()
      };

      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      logger.error('Error eliminando plantilla:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Usar una plantilla para crear un evento
   */
  async useTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const templateId = parseInt(id);

      if (isNaN(templateId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de plantilla inválido',
          error: 'INVALID_TEMPLATE_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const template = await EventTemplate.findByPk(templateId);
      if (!template) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Plantilla no encontrada',
          error: 'TEMPLATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos (plantilla pública o propia)
      if (!template.isPublic && template.createdBy !== userId) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para usar esta plantilla',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { customizations = {} } = req.body;

      // Combinar datos de plantilla con personalizaciones
      const eventData = {
        ...template.templateData,
        ...customizations,
        createdBy: userId,
        eventTemplateId: templateId
      };

      // Crear evento usando el servicio
      const result = await eventService.createEvent(eventData, userId!);

      if (!result.success) {
        res.status(result.error === 'VALIDATION_ERROR' ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);
        return;
      }

      // Incrementar contador de uso de la plantilla
      await EventTemplate.increment('usageCount', { by: 1, where: { id: templateId } });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Evento creado exitosamente desde plantilla',
        data: {
          event: result.data,
          templateUsed: {
            id: template.id,
            name: template.name
          }
        },
        timestamp: new Date().toISOString()
      };

      res.status(HTTP_STATUS.CREATED).json(response);

    } catch (error) {
      logger.error('Error usando plantilla:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const eventTemplateController = new EventTemplateController();
