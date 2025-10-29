/**
 * @fileoverview Controlador de Reglas de Notificación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para endpoints de reglas de notificación
 *
 * Archivo: backend/src/controllers/notificationRuleController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { notificationRuleService } from '../services/notificationRuleService';
import { PERMISSIONS, HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  CreateNotificationRuleRequest,
  UpdateNotificationRuleRequest
} from '../types/notification.types';

/**
 * Controlador para manejo de reglas de notificación
 */
export class NotificationRuleController {

  /**
   * Obtiene todas las reglas de notificación
   */
  async getNotificationRules(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
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

      const options = {
        eventType: req.query.eventType as string,
        active: req.query.active ? req.query.active === 'true' : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const result = await notificationRuleService.getNotificationRules(options);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Reglas de notificación obtenidas exitosamente',
        data: {
          rules: result.rules,
          total: result.total,
          limit: options.limit || 50,
          offset: options.offset || 0
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getNotificationRules controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtiene una regla específica por ID
   */
  async getNotificationRule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
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

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de regla inválido',
          error: 'INVALID_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const rule = await notificationRuleService.getNotificationRuleById(id);

      if (!rule) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Regla de notificación no encontrada',
          error: 'RULE_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Regla de notificación obtenida exitosamente',
        data: { rule },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getNotificationRule controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crea una nueva regla de notificación
   */
  async createNotificationRule(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const ruleData: CreateNotificationRuleRequest = req.body;
      const result = await notificationRuleService.createNotificationRule(
        ruleData,
        req.user!.id
      );

      const statusCode = result.success ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Regla de notificación creada exitosamente' : result.error,
        data: result.success ? { rule: result.rule } : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en createNotificationRule controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualiza una regla de notificación existente
   */
  async updateNotificationRule(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de regla inválido',
          error: 'INVALID_ID',
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

      const updateData: UpdateNotificationRuleRequest = req.body;
      const result = await notificationRuleService.updateNotificationRule(
        id,
        updateData,
        req.user!.id
      );

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Regla de notificación actualizada exitosamente' : result.error,
        data: result.success ? { rule: result.rule } : undefined,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en updateNotificationRule controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Elimina una regla de notificación
   */
  async deleteNotificationRule(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de regla inválido',
          error: 'INVALID_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await notificationRuleService.deleteNotificationRule(id);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json({
        success: result.success,
        message: result.success ? 'Regla de notificación eliminada exitosamente' : result.error,
        error: result.error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en deleteNotificationRule controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtiene estadísticas de reglas
   */
  async getRuleStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
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

      const stats = await notificationRuleService.getRuleStats();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estadísticas de reglas obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getRuleStats controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const notificationRuleController = new NotificationRuleController();
