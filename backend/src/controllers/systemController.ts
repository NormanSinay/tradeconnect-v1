/**
 * @fileoverview Controlador de Configuración del Sistema para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para endpoints de configuración del sistema
 *
 * Archivo: backend/src/controllers/systemController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { SystemConfigService } from '../services/systemConfigService';

const systemConfigService = new SystemConfigService();
import {
  CreateSystemConfigRequest,
  UpdateSystemConfigRequest,
  BulkSystemConfigRequest,
  SystemConfigFilters,
  SystemConfigCategory
} from '../types/system.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS, PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de configuración del sistema
 */
export class SystemController {

  /**
   * @swagger
   * /api/system/config:
   *   get:
   *     tags: [System Configuration]
   *     summary: Obtener configuración del sistema
   *     description: Obtiene la configuración completa del sistema organizada por categorías
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Configuración obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Configuración completa del sistema obtenida exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/SystemConfiguration'
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getSystemConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG) &&
          !userPermissions.includes(PERMISSIONS.VIEW_AUDIT_LOGS)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para acceder a la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await systemConfigService.getFullSystemConfig();
      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);

    } catch (error) {
      logger.error('Error obteniendo configuración del sistema:', error);
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
   * /api/system/config/public:
   *   get:
   *     tags: [System Configuration]
   *     summary: Obtener configuración pública
   *     description: Obtiene la configuración pública del sistema (no requiere autenticación)
   *     responses:
   *       200:
   *         description: Configuración pública obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Configuraciones públicas obtenidas exitosamente"
   *                 data:
   *                   type: object
   *                   example: {"system.language": "es", "system.timezone": "America/Guatemala"}
   *       500:
   *         description: Error interno del servidor
   */
  async getPublicConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = await systemConfigService.getPublicConfigs();
      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);

    } catch (error) {
      logger.error('Error obteniendo configuración pública:', error);
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
   * /api/system/config/{key}:
   *   get:
   *     tags: [System Configuration]
   *     summary: Obtener configuración por clave
   *     description: Obtiene una configuración específica por su clave
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Clave de configuración
   *         example: "system.language"
   *     responses:
   *       200:
   *         description: Configuración obtenida exitosamente
   *       403:
   *         description: No tienes permisos
   *       404:
   *         description: Configuración no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getConfigByKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG) &&
          !userPermissions.includes(PERMISSIONS.VIEW_AUDIT_LOGS)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para acceder a la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { key } = req.params;
      const { includeInactive } = req.query;

      const result = await systemConfigService.getConfigByKey(
        key,
        includeInactive === 'true'
      );

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'CONFIG_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error obteniendo configuración por clave:', error);
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
   * /api/system/config/category/{category}:
   *   get:
   *     tags: [System Configuration]
   *     summary: Obtener configuración por categoría
   *     description: Obtiene todas las configuraciones de una categoría específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: category
   *         required: true
   *         schema:
   *           type: string
   *           enum: [general, security, payment, notification, email, integration, ui, performance]
   *         description: Categoría de configuración
   *     responses:
   *       200:
   *         description: Configuraciones obtenidas exitosamente
   *       403:
   *         description: No tienes permisos
   *       500:
   *         description: Error interno del servidor
   */
  async getConfigByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG) &&
          !userPermissions.includes(PERMISSIONS.VIEW_AUDIT_LOGS)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para acceder a la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { category } = req.params;
      const { includeInactive } = req.query;

      // Validar categoría
      const validCategories: SystemConfigCategory[] = [
        'general', 'security', 'payment', 'notification',
        'email', 'integration', 'ui', 'performance'
      ];

      if (!validCategories.includes(category as SystemConfigCategory)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Categoría inválida',
          error: 'INVALID_CATEGORY',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await systemConfigService.getConfigsByCategory(
        category as SystemConfigCategory,
        includeInactive === 'true'
      );

      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);

    } catch (error) {
      logger.error('Error obteniendo configuración por categoría:', error);
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
   * /api/system/config:
   *   post:
   *     tags: [System Configuration]
   *     summary: Crear configuración
   *     description: Crea una nueva configuración del sistema
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateSystemConfigRequest'
   *     responses:
   *       201:
   *         description: Configuración creada exitosamente
   *       400:
   *         description: Datos inválidos
   *       403:
   *         description: No tienes permisos
   *       409:
   *         description: Configuración ya existe
   *       500:
   *         description: Error interno del servidor
   */
  async createConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para modificar la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar validaciones
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

      const configData: CreateSystemConfigRequest = req.body;
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

      const result = await systemConfigService.createConfig(configData, userId);

      const statusCode = result.success ? HTTP_STATUS.CREATED :
        result.error === 'CONFIG_ALREADY_EXISTS' ? HTTP_STATUS.CONFLICT :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error creando configuración:', error);
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
   * /api/system/config/{key}:
   *   put:
   *     tags: [System Configuration]
   *     summary: Actualizar configuración
   *     description: Actualiza una configuración existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Clave de configuración
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateSystemConfigRequest'
   *     responses:
   *       200:
   *         description: Configuración actualizada exitosamente
   *       403:
   *         description: No tienes permisos
   *       404:
   *         description: Configuración no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async updateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para modificar la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar validaciones
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

      const { key } = req.params;
      const updateData: UpdateSystemConfigRequest = req.body;
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

      const result = await systemConfigService.updateConfig(key, updateData, userId);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'CONFIG_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error actualizando configuración:', error);
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
   * /api/system/config/{key}:
   *   delete:
   *     tags: [System Configuration]
   *     summary: Eliminar configuración
   *     description: Elimina una configuración del sistema (soft delete)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Clave de configuración
   *     responses:
   *       200:
   *         description: Configuración eliminada exitosamente
   *       403:
   *         description: No tienes permisos
   *       404:
   *         description: Configuración no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async deleteConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para modificar la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { key } = req.params;
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

      const result = await systemConfigService.deleteConfig(key, userId);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'CONFIG_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error eliminando configuración:', error);
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
   * /api/system/config/bulk:
   *   post:
   *     tags: [System Configuration]
   *     summary: Crear configuraciones masivamente
   *     description: Crea múltiples configuraciones del sistema en una sola operación
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BulkSystemConfigRequest'
   *     responses:
   *       200:
   *         description: Configuraciones procesadas exitosamente
   *       403:
   *         description: No tienes permisos
   *       500:
   *         description: Error interno del servidor
   */
  async bulkCreateConfigs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para modificar la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar validaciones
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

      const bulkData: BulkSystemConfigRequest = req.body;
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

      const result = await systemConfigService.bulkCreateConfigs(bulkData, userId);
      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);

    } catch (error) {
      logger.error('Error creando configuraciones masivamente:', error);
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
   * /api/system/config/list:
   *   get:
   *     tags: [System Configuration]
   *     summary: Listar configuraciones
   *     description: Obtiene una lista paginada de configuraciones con filtros
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Registros por página
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [general, security, payment, notification, email, integration, ui, performance]
   *         description: Filtrar por categoría
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Buscar por clave o descripción
   *     responses:
   *       200:
   *         description: Configuraciones listadas exitosamente
   *       403:
   *         description: No tienes permisos
   *       500:
   *         description: Error interno del servidor
   */
  async listConfigs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG) &&
          !userPermissions.includes(PERMISSIONS.VIEW_AUDIT_LOGS)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para acceder a la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const filters: SystemConfigFilters = {
        category: req.query.category as SystemConfigCategory,
        isPublic: req.query.isPublic ? req.query.isPublic === 'true' : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : true,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      };

      const result = await systemConfigService.getAllConfigs(filters);
      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);

    } catch (error) {
      logger.error('Error listando configuraciones:', error);
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
   * /api/system/config/stats:
   *   get:
   *     tags: [System Configuration]
   *     summary: Obtener estadísticas
   *     description: Obtiene estadísticas de la configuración del sistema
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
   *       403:
   *         description: No tienes permisos
   *       500:
   *         description: Error interno del servidor
   */
  async getConfigStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG) &&
          !userPermissions.includes(PERMISSIONS.VIEW_AUDIT_LOGS)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para acceder a las estadísticas del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await systemConfigService.getConfigStats();
      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);

    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
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
   * /api/system/config/initialize:
   *   post:
   *     tags: [System Configuration]
   *     summary: Inicializar configuración por defecto
   *     description: Crea la configuración por defecto del sistema
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Configuración inicializada exitosamente
   *       403:
   *         description: No tienes permisos
   *       500:
   *         description: Error interno del servidor
   */
  async initializeDefaultConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para inicializar la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
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

      const result = await systemConfigService.initializeDefaultConfig(userId);
      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);

    } catch (error) {
      logger.error('Error inicializando configuración por defecto:', error);
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
   * /api/system/config/full:
   *   get:
   *     tags: [System Configuration]
   *     summary: Obtener configuración completa organizada
   *     description: Obtiene toda la configuración del sistema organizada por categorías
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Configuración completa obtenida exitosamente
   *       403:
   *         description: No tienes permisos
   *       500:
   *         description: Error interno del servidor
   */
  async getFullConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes(PERMISSIONS.MANAGE_SYSTEM_CONFIG) &&
          !userPermissions.includes(PERMISSIONS.VIEW_AUDIT_LOGS)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tienes permisos para acceder a la configuración del sistema',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await systemConfigService.getFullSystemConfig();

      // Organizar por categorías
      const organized: any = {};
      if (result.success && result.data && Array.isArray(result.data)) {
        result.data.forEach((config: any) => {
          if (!organized[config.category]) {
            organized[config.category] = {};
          }
          organized[config.category][config.key] = config.value;
        });
      }

      res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: result.success,
        message: result.message,
        data: organized,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo configuración completa:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const systemController = new SystemController();