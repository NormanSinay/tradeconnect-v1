/**
 * @fileoverview Controlador de Plantillas de Email para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de plantillas de email
 *
 * Archivo: backend/src/controllers/emailTemplateController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { emailTemplateService } from '../services/emailTemplateService';
import {
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  PreviewEmailTemplateRequest
} from '../types/notification.types';
import { HTTP_STATUS, PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Controlador para manejo de plantillas de email
 */
export class EmailTemplateController {

  /**
   * @swagger
   * /api/v1/email-templates:
   *   get:
   *     tags: [Email Templates]
   *     summary: Obtener plantillas de email
   *     description: Obtiene la lista de plantillas de email con filtros opcionales
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: type
   *         in: query
   *         schema:
   *           type: string
   *           enum: [TRANSACTIONAL, PROMOTIONAL, OPERATIONAL]
   *       - name: active
   *         in: query
   *         schema:
   *           type: boolean
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           default: 20
   *       - name: offset
   *         in: query
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: Plantillas obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as any,
        active: req.query.active ? req.query.active === 'true' : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await emailTemplateService.getTemplates(filters);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Plantillas obtenidas exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getTemplates controller:', error);
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
   * /api/v1/email-templates:
   *   post:
   *     tags: [Email Templates]
   *     summary: Crear plantilla de email
   *     description: Crea una nueva plantilla de email
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEmailTemplateRequest'
   *     responses:
   *       201:
   *         description: Plantilla creada exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       409:
   *         description: Código de plantilla ya existe
   *       500:
   *         description: Error interno del servidor
   */
  async createTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const templateData: CreateEmailTemplateRequest = req.body;
      const result = await emailTemplateService.createTemplate(templateData, req.user!.id);

      const statusCode = result.success ? HTTP_STATUS.CREATED :
        result.error === 'TEMPLATE_CODE_EXISTS' ? HTTP_STATUS.CONFLICT :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Plantilla creada exitosamente' : result.error,
        data: result.success ? { template: result.template } : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en createTemplate controller:', error);
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
   * /api/v1/email-templates/{id}:
   *   get:
   *     tags: [Email Templates]
   *     summary: Obtener plantilla por ID
   *     description: Obtiene los detalles de una plantilla específica
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Plantilla obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Plantilla no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const templateId = parseInt(req.params.id);
      const result = await emailTemplateService.getTemplate(templateId);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Plantilla obtenida exitosamente' : 'Plantilla no encontrada',
        data: result.success ? { template: result.template } : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getTemplate controller:', error);
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
   * /api/v1/email-templates/{id}:
   *   put:
   *     tags: [Email Templates]
   *     summary: Actualizar plantilla de email
   *     description: Actualiza una plantilla de email existente
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateEmailTemplateRequest'
   *     responses:
   *       200:
   *         description: Plantilla actualizada exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Plantilla no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async updateTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const templateId = parseInt(req.params.id);
      const updateData: UpdateEmailTemplateRequest = req.body;
      const result = await emailTemplateService.updateTemplate(templateId, updateData, req.user!.id);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'TEMPLATE_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Plantilla actualizada exitosamente' : result.error,
        data: result.success ? { template: result.template } : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en updateTemplate controller:', error);
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
   * /api/v1/email-templates/{id}:
   *   delete:
   *     tags: [Email Templates]
   *     summary: Eliminar plantilla de email
   *     description: Elimina una plantilla de email (soft delete)
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Plantilla eliminada exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Plantilla no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async deleteTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const templateId = parseInt(req.params.id);
      const result = await emailTemplateService.deleteTemplate(templateId);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'TEMPLATE_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Plantilla eliminada exitosamente' : result.error,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en deleteTemplate controller:', error);
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
   * /api/v1/email-templates/{id}/preview:
   *   post:
   *     tags: [Email Templates]
   *     summary: Vista previa de plantilla
   *     description: Genera una vista previa de la plantilla con variables de prueba
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PreviewEmailTemplateRequest'
   *     responses:
   *       200:
   *         description: Vista previa generada exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Plantilla no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async previewTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const templateId = parseInt(req.params.id);
      const previewData: PreviewEmailTemplateRequest = req.body;

      const result = await emailTemplateService.previewTemplate(templateId, previewData.variables || {});

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'TEMPLATE_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Vista previa generada exitosamente' : result.error,
        data: result.success ? result.preview : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en previewTemplate controller:', error);
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
   * /api/v1/email-templates/code/{code}:
   *   get:
   *     tags: [Email Templates]
   *     summary: Obtener plantilla por código
   *     description: Obtiene una plantilla activa por su código único
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: code
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Plantilla obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Plantilla no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getTemplateByCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const code = req.params.code;
      const result = await emailTemplateService.getTemplateByCode(code);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Plantilla obtenida exitosamente' : 'Plantilla no encontrada',
        data: result.success ? { template: result.template } : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getTemplateByCode controller:', error);
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
   * /api/v1/email-templates/code/{code}/preview:
   *   post:
   *     tags: [Email Templates]
   *     summary: Vista previa de plantilla por código
   *     description: Genera una vista previa de la plantilla usando su código
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: code
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PreviewEmailTemplateRequest'
   *     responses:
   *       200:
   *         description: Vista previa generada exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Plantilla no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async previewTemplateByCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const code = req.params.code;
      const previewData: PreviewEmailTemplateRequest = req.body;

      const result = await emailTemplateService.previewTemplateByCode(code, previewData.variables || {});

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'TEMPLATE_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Vista previa generada exitosamente' : result.error,
        data: result.success ? result.preview : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en previewTemplateByCode controller:', error);
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
   * /api/v1/email-templates/{id}/duplicate:
   *   post:
   *     tags: [Email Templates]
   *     summary: Duplicar plantilla de email
   *     description: Crea una copia de una plantilla existente con opción de modificar campos
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: ID de la plantilla a duplicar
   *         example: 1
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *                 pattern: '^[A-Z_]+$'
   *                 description: Nuevo código único para la plantilla duplicada
   *                 example: "WELCOME_EMAIL_V2"
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 255
   *                 description: Nuevo nombre para la plantilla duplicada
   *                 example: "Email de Bienvenida - Versión 2"
   *               subject:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *                 description: Nuevo asunto para la plantilla duplicada
   *                 example: "¡Bienvenido a TradeConnect!"
   *               type:
   *                 type: string
   *                 enum: [TRANSACTIONAL, PROMOTIONAL, OPERATIONAL]
   *                 description: Nuevo tipo para la plantilla duplicada
   *                 example: "TRANSACTIONAL"
   *           examples:
   *             duplicar_plantilla:
   *               summary: Duplicar plantilla con cambios
   *               value:
   *                 code: "WELCOME_EMAIL_V2"
   *                 name: "Email de Bienvenida - Versión 2"
   *                 subject: "¡Bienvenido a TradeConnect!"
   *                 type: "TRANSACTIONAL"
   *     responses:
   *       201:
   *         description: Plantilla duplicada exitosamente
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
   *                   example: "Plantilla duplicada exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     originalTemplate:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 1
   *                         name:
   *                           type: string
   *                           example: "Email de Bienvenida"
   *                     duplicatedTemplate:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 2
   *                         code:
   *                           type: string
   *                           example: "WELCOME_EMAIL_V2"
   *                         name:
   *                           type: string
   *                           example: "Email de Bienvenida - Versión 2"
   *                         createdAt:
   *                           type: string
   *                           format: date-time
   *                           example: "2023-10-15T10:30:00.000Z"
   *             examples:
   *               plantilla_duplicada:
   *                 summary: Plantilla duplicada exitosamente
   *                 value:
   *                   success: true
   *                   message: "Plantilla duplicada exitosamente"
   *                   data:
   *                     originalTemplate:
   *                       id: 1
   *                       name: "Email de Bienvenida"
   *                     duplicatedTemplate:
   *                       id: 2
   *                       code: "WELCOME_EMAIL_V2"
   *                       name: "Email de Bienvenida - Versión 2"
   *                       createdAt: "2023-10-15T10:30:00.000Z"
   *       400:
   *         description: Datos inválidos o código ya existe
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "El código WELCOME_EMAIL_V2 ya está en uso"
   *                 error:
   *                   type: string
   *                   example: "TEMPLATE_CODE_EXISTS"
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Token de autenticación inválido"
   *                 error:
   *                   type: string
   *                   example: "INVALID_TOKEN"
   *       403:
   *         description: Permisos insuficientes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "No tienes permisos para duplicar plantillas"
   *                 error:
   *                   type: string
   *                   example: "INSUFFICIENT_PERMISSIONS"
   *       404:
   *         description: Plantilla no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Plantilla no encontrada"
   *                 error:
   *                   type: string
   *                   example: "TEMPLATE_NOT_FOUND"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Error interno del servidor"
   *                 error:
   *                   type: string
   *                   example: "INTERNAL_SERVER_ERROR"
   */
  async duplicateTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.MANAGE_EMAIL_TEMPLATES);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const templateId = parseInt(req.params.id);
      const duplicateData = req.body;
      const result = await emailTemplateService.duplicateTemplate(templateId, duplicateData, req.user!.id);

      const statusCode = result.success ? HTTP_STATUS.CREATED :
        result.error === 'TEMPLATE_CODE_EXISTS' ? HTTP_STATUS.CONFLICT :
        result.error === 'TEMPLATE_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Plantilla duplicada exitosamente' : result.error,
        data: result.success ? result.data : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en duplicateTemplate controller:', error);
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
   * /api/v1/email-templates/{id}/versions:
   *   get:
   *     tags: [Email Templates]
   *     summary: Obtener versiones de plantilla
   *     description: Obtiene el historial de versiones de una plantilla para seguimiento de cambios
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: ID de la plantilla
   *         example: 1
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número de página para paginación
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 20
   *         description: Número de versiones por página
   *         example: 20
   *     responses:
   *       200:
   *         description: Versiones obtenidas exitosamente
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
   *                   example: "Versiones de plantilla obtenidas exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     templateId:
   *                       type: integer
   *                       example: 1
   *                     versions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           version:
   *                             type: integer
   *                             example: 2
   *                           name:
   *                             type: string
   *                             example: "Email de Bienvenida - Actualizado"
   *                           subject:
   *                             type: string
   *                             example: "¡Bienvenido a TradeConnect!"
   *                           changes:
   *                             type: string
   *                             example: "Actualización del contenido HTML y variables"
   *                           createdBy:
   *                             type: string
   *                             example: "admin@tradeconnect.com"
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                             example: "2023-10-10T14:30:00.000Z"
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                           example: 1
   *                         limit:
   *                           type: integer
   *                           example: 20
   *                         total:
   *                           type: integer
   *                           example: 5
   *                         totalPages:
   *                           type: integer
   *                           example: 1
   *                         hasNext:
   *                           type: boolean
   *                           example: false
   *                         hasPrev:
   *                           type: boolean
   *                           example: false
   *             examples:
   *               versiones_obtenidas:
   *                 summary: Versiones obtenidas exitosamente
   *                 value:
   *                   success: true
   *                   message: "Versiones de plantilla obtenidas exitosamente"
   *                   data:
   *                     templateId: 1
   *                     versions:
   *                       - version: 2
   *                         name: "Email de Bienvenida - Actualizado"
   *                         subject: "¡Bienvenido a TradeConnect!"
   *                         changes: "Actualización del contenido HTML y variables"
   *                         createdBy: "admin@tradeconnect.com"
   *                         createdAt: "2023-10-10T14:30:00.000Z"
   *                       - version: 1
   *                         name: "Email de Bienvenida"
   *                         subject: "¡Bienvenido!"
   *                         changes: "Versión inicial"
   *                         createdBy: "admin@tradeconnect.com"
   *                         createdAt: "2023-01-15T10:00:00.000Z"
   *                     pagination:
   *                       page: 1
   *                       limit: 20
   *                       total: 2
   *                       totalPages: 1
   *                       hasNext: false
   *                       hasPrev: false
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Token de autenticación inválido"
   *                 error:
   *                   type: string
   *                   example: "INVALID_TOKEN"
   *       403:
   *         description: Permisos insuficientes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "No tienes permisos para acceder a las versiones"
   *                 error:
   *                   type: string
   *                   example: "INSUFFICIENT_PERMISSIONS"
   *       404:
   *         description: Plantilla no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Plantilla no encontrada"
   *                 error:
   *                   type: string
   *                   example: "TEMPLATE_NOT_FOUND"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Error interno del servidor"
   *                 error:
   *                   type: string
   *                   example: "INTERNAL_SERVER_ERROR"
   */
  async getTemplateVersions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const templateId = parseInt(req.params.id);
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await emailTemplateService.getTemplateVersions(templateId, filters);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Versiones de plantilla obtenidas exitosamente' : result.error,
        data: result.success ? result.data : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getTemplateVersions controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const emailTemplateController = new EmailTemplateController();