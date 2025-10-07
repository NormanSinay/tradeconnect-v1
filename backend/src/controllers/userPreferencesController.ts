/**
 * @fileoverview Controlador de Preferencias de Notificaciones de Usuario para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de preferencias de notificaciones
 *
 * Archivo: backend/src/controllers/userPreferencesController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { userPreferencesService } from '../services/userPreferencesService';
import { UpdateNotificationPreferencesRequest } from '../types/notification.types';
import { HTTP_STATUS, PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Controlador para gestión de preferencias de notificaciones de usuario
 */
export class UserPreferencesController {

  /**
   * @swagger
   * /api/v1/user/preferences:
   *   get:
   *     tags: [User Preferences]
   *     summary: Obtener preferencias de notificaciones del usuario
   *     description: Obtiene las preferencias de notificaciones del usuario autenticado
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Preferencias obtenidas exitosamente
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
   *                   example: "Preferencias obtenidas exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/UserNotificationPreferences'
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getUserPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const result = await userPreferencesService.getUserPreferences(userId);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Preferencias obtenidas exitosamente' : 'Error al obtener preferencias',
        data: result.preferences,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getUserPreferences controller:', error);
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
   * /api/v1/user/preferences:
   *   put:
   *     tags: [User Preferences]
   *     summary: Actualizar preferencias de notificaciones
   *     description: Actualiza las preferencias de notificaciones del usuario autenticado
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateNotificationPreferencesRequest'
   *     responses:
   *       200:
   *         description: Preferencias actualizadas exitosamente
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
   *                   example: "Preferencias actualizadas exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/UserNotificationPreferences'
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async updateUserPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
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

      const updates: UpdateNotificationPreferencesRequest = req.body;

      const result = await userPreferencesService.updateUserPreferences(userId, updates);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Preferencias actualizadas exitosamente' : 'Error al actualizar preferencias',
        data: result.preferences,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en updateUserPreferences controller:', error);
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
   * /api/v1/user/preferences/reset:
   *   post:
   *     tags: [User Preferences]
   *     summary: Restablecer preferencias por defecto
   *     description: Restablece las preferencias de notificaciones a valores por defecto
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Preferencias restablecidas exitosamente
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
   *                   example: "Preferencias restablecidas exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/UserNotificationPreferences'
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async resetUserPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const result = await userPreferencesService.resetUserPreferences(userId);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Preferencias restablecidas exitosamente' : 'Error al restablecer preferencias',
        data: result.preferences,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en resetUserPreferences controller:', error);
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
   * /api/v1/user/unsubscribe/{token}:
   *   post:
   *     tags: [User Preferences]
   *     summary: Desuscribir de emails promocionales
   *     description: Desuscribe al usuario de emails promocionales usando un token
   *     parameters:
   *       - name: token
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: Token único de desuscripción
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               confirm:
   *                 type: boolean
   *                 description: Confirmación de desuscripción
   *                 example: true
   *     responses:
   *       200:
   *         description: Desuscripción exitosa
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
   *                   example: "Te has desuscrito exitosamente de los emails promocionales"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Token inválido
   *       500:
   *         description: Error interno del servidor
   */
  async unsubscribeWithToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { confirm } = req.body;

      if (!confirm) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Debe confirmar la desuscripción',
          error: 'CONFIRMATION_REQUIRED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await userPreferencesService.unsubscribeWithToken(token);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json({
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en unsubscribeWithToken controller:', error);
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
   * /api/v1/admin/preferences/stats:
   *   get:
   *     tags: [Admin - User Preferences]
   *     summary: Estadísticas de preferencias (Admin)
   *     description: Obtiene estadísticas globales de preferencias de usuarios (solo administradores)
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas exitosamente
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
   *                   example: "Estadísticas obtenidas exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalUsers:
   *                       type: integer
   *                       example: 1000
   *                     emailEnabled:
   *                       type: integer
   *                       example: 850
   *                     smsEnabled:
   *                       type: integer
   *                       example: 150
   *                     pushEnabled:
   *                       type: integer
   *                       example: 900
   *                     marketingEmailsDisabled:
   *                       type: integer
   *                       example: 200
   *                     promotionalEmailsDisabled:
   *                       type: integer
   *                       example: 150
   *                     unsubscribedUsers:
   *                       type: integer
   *                       example: 120
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getPreferencesStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.UPDATE_USER);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await userPreferencesService.getPreferencesStats();

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Estadísticas obtenidas exitosamente' : 'Error al obtener estadísticas',
        data: result.stats,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getPreferencesStats controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const userPreferencesController = new UserPreferencesController();