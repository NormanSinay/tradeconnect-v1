/**
 * @fileoverview Controlador de Notificaciones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para endpoints de notificaciones
 *
 * Archivo: backend/src/controllers/notificationController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { notificationService } from '../services/notificationService';
import { emailService } from '../services/emailService';
import {
  SendNotificationRequest,
  SendBulkNotificationRequest,
  GetNotificationsRequest,
  MarkNotificationReadRequest,
  UnsubscribeRequest,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  PreviewEmailTemplateRequest,
  CreateNotificationRuleRequest,
  UpdateNotificationRuleRequest,
  UpdateNotificationPreferencesRequest
} from '../types/notification.types';
import { HTTP_STATUS, PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Controlador para manejo de notificaciones
 */
export class NotificationController {

  /**
   * @swagger
   * /api/v1/notifications/send:
   *   post:
   *     tags: [Notifications]
   *     summary: Enviar notificación individual
   *     description: Envía una notificación a un usuario específico
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SendNotificationRequest'
   *     responses:
   *       200:
   *         description: Notificación enviada exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async sendNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.SEND_NOTIFICATION);

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

      const notificationData: SendNotificationRequest = req.body;
      const result = await notificationService.sendNotification(notificationData);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Notificación enviada exitosamente' : 'Error al enviar notificación',
        data: result.success ? { notificationId: result.notificationId } : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en sendNotification controller:', error);
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
   * /api/v1/notifications/bulk-send:
   *   post:
   *     tags: [Notifications]
   *     summary: Enviar notificaciones masivas
   *     description: Envía notificaciones a múltiples usuarios
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SendBulkNotificationRequest'
   *     responses:
   *       200:
   *         description: Notificaciones enviadas exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async sendBulkNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.SEND_NOTIFICATION);

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

      const bulkData: SendBulkNotificationRequest = req.body;
      const result = await notificationService.sendBulkNotifications(bulkData);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Notificaciones enviadas exitosamente' : 'Error al enviar notificaciones',
        data: result.success ? {
          totalRequested: bulkData.userIds.length,
          successful: result.totalSent,
          failed: result.totalFailed
        } : undefined,
        errors: result.errors,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en sendBulkNotification controller:', error);
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
   * /api/v1/notifications:
   *   get:
   *     tags: [Notifications]
   *     summary: Obtener notificaciones
   *     description: Obtiene la lista de notificaciones con filtros opcionales
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: status
   *         in: query
   *         schema:
   *           type: string
   *           enum: [PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED]
   *       - name: type
   *         in: query
   *         schema:
   *           type: string
   *           enum: [EMAIL, POPUP, SMS, WHATSAPP]
   *       - name: channel
   *         in: query
   *         schema:
   *           type: string
   *           enum: [EMAIL, POPUP, SMS, WHATSAPP]
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
   *         description: Notificaciones obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters: GetNotificationsRequest = {
        userId: req.user?.id,
        status: req.query.status as any,
        type: req.query.type as any,
        channel: req.query.channel as any,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const result = await notificationService.getUserNotifications(
        req.user!.id,
        filters
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Notificaciones obtenidas exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getNotifications controller:', error);
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
   * /api/v1/notifications/{id}/read:
   *   put:
   *     tags: [Notifications]
   *     summary: Marcar notificación como leída
   *     description: Marca una notificación específica como leída
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Notificación marcada como leída
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Notificación no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = await notificationService.markAsRead(notificationId, userId);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'Notificación no encontrada' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Notificación marcada como leída' : result.error,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en markAsRead controller:', error);
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
   * /api/v1/notifications/{id}:
   *   get:
   *     tags: [Notifications]
   *     summary: Obtener notificación por ID
   *     description: Obtiene los detalles de una notificación específica
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Notificación obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Notificación no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;

      const notifications = await notificationService.getUserNotifications(userId, {
        limit: 1,
        offset: 0
      });

      const notification = notifications.notifications.find(n => n.id === notificationId);

      if (!notification) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Notificación no encontrada',
          error: 'NOTIFICATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Notificación obtenida exitosamente',
        data: { notification },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getNotification controller:', error);
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
   * /api/v1/notifications/user/{userId}:
   *   get:
   *     tags: [Notifications]
   *     summary: Obtener notificaciones de usuario (admin)
   *     description: Obtiene las notificaciones de un usuario específico (solo administradores)
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         schema:
   *           type: integer
   *       - name: status
   *         in: query
   *         schema:
   *           type: string
   *           enum: [PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED]
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
   *         description: Notificaciones obtenidas exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.VIEW_NOTIFICATION_LOGS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const targetUserId = parseInt(req.params.userId);
      const filters: GetNotificationsRequest = {
        userId: targetUserId,
        status: req.query.status as any,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await notificationService.getUserNotifications(targetUserId, filters);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Notificaciones obtenidas exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getUserNotifications controller:', error);
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
   * /api/v1/notifications/stats:
   *   get:
   *     tags: [Notifications]
   *     summary: Obtener estadísticas de notificaciones
   *     description: Obtiene estadísticas generales del sistema de notificaciones
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - name: startDate
   *         in: query
   *         schema:
   *           type: string
   *           format: date
   *       - name: endDate
   *         in: query
   *         schema:
   *           type: string
   *           format: date
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
  async getNotificationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.VIEW_NOTIFICATION_LOGS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await notificationService.getNotificationStats(startDate, endDate);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getNotificationStats controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // TRACKING DE EMAILS
  // ====================================================================

  /**
   * Tracking de apertura de emails (pixel 1x1)
   */
  async trackEmailOpen(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      // Decodificar token para obtener notificationId
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      const notificationId = parseInt(decoded);

      if (isNaN(notificationId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).send('Invalid tracking token');
        return;
      }

      // Registrar apertura
      await notificationService.trackEmailOpen(notificationId, {
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        timestamp: new Date()
      });

      // Devolver pixel transparente 1x1
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.set({
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.send(pixel);

    } catch (error) {
      logger.error('Error tracking email open:', error);
      // Aún devolver pixel para no romper el tracking
      const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.set('Content-Type', 'image/gif');
      res.send(pixel);
    }
  }

  /**
   * Cancela una notificación específica
   */
  async cancelNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = await notificationService.cancelNotification(notificationId, userId);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Notificación cancelada exitosamente' : result.error,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en cancelNotification controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Reintenta envío de una notificación específica
   */
  async retryNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user!.id;

      const result = await notificationService.retryNotification(notificationId, userId);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Reintento de notificación programado' : result.error,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en retryNotification controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtiene notificaciones popup pendientes
   */
  async getPendingPopupNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await notificationService.getPendingPopupNotifications(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Notificaciones popup pendientes obtenidas exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getPendingPopupNotifications controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Tracking de clics en enlaces de emails
   */
  async trackEmailClick(req: Request, res: Response): Promise<void> {
    try {
      const { token, linkId } = req.params;

      // Decodificar token para obtener notificationId
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      const notificationId = parseInt(decoded);

      if (isNaN(notificationId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).send('Invalid tracking token');
        return;
      }

      // Registrar clic
      const result = await notificationService.trackEmailClick(notificationId, linkId, {
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
        timestamp: new Date()
      });

      if (result.success && result.redirectUrl) {
        // Redireccionar al enlace original
        res.redirect(result.redirectUrl);
      } else {
        // Si no hay URL, redireccionar a página por defecto
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/link-expired`);
      }

    } catch (error) {
      logger.error('Error tracking email click:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Tracking error');
    }
  }
}

export const notificationController = new NotificationController();