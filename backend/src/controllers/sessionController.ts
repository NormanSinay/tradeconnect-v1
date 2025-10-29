/**
 * @fileoverview Controlador de Sesiones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de sesiones de usuario
 *
 * Archivo: backend/src/controllers/sessionController.ts
 */

import { Response } from 'express';
import { Session } from '../models/Session';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest, SessionInfo } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones de sesión
 */
export class SessionController {

  /**
   * @swagger
   * /api/sessions/active:
   *   get:
   *     tags: [Sessions]
   *     summary: Obtener sesiones activas
   *     description: Obtiene todas las sesiones activas del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Sesiones obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/SessionInfo'
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getActiveSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const currentSessionId = req.sessionId;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const sessions = await Session.getActiveUserSessions(userId);

      const sessionInfos: SessionInfo[] = sessions.map(session => ({
        sessionId: session.sessionId,
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        device: {
          type: session.deviceType,
          os: session.deviceOS,
          browser: session.deviceBrowser
        },
        location: {
          country: session.locationCountry || 'Unknown',
          city: session.locationCity || 'Unknown',
          region: session.locationRegion || 'Unknown'
        },
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
        isCurrent: session.sessionId === currentSessionId
      }));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Sesiones activas obtenidas exitosamente',
        data: sessionInfos,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo sesiones activas:', error);
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
   * /api/sessions/{id}:
   *   delete:
   *     tags: [Sessions]
   *     summary: Terminar sesión específica
   *     description: Termina una sesión específica del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la sesión a terminar
   *     responses:
   *       200:
   *         description: Sesión terminada exitosamente
   *       400:
   *         description: ID de sesión inválido
   *       401:
   *         description: No autorizado
   *       403:
   *         description: No puede terminar la sesión actual
   *       404:
   *         description: Sesión no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async terminateSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const currentSessionId = req.sessionId;
      const { id: sessionId } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!sessionId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de sesión es requerido',
          error: 'MISSING_SESSION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // No permitir terminar la sesión actual
      if (sessionId === currentSessionId) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No puede terminar la sesión actual',
          error: 'CANNOT_TERMINATE_CURRENT_SESSION',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const session = await Session.findBySessionId(sessionId);
      if (!session || session.userId !== userId) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await session.terminate();

      // Registrar en auditoría
      await AuditLog.log(
        'session_terminated',
        'session',
        {
          userId,
          resourceId: sessionId,
          oldValues: { isActive: true },
          newValues: { isActive: false },
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Sesión terminada exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error terminando sesión:', error);
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
   * /api/sessions/history:
   *   get:
   *     tags: [Sessions]
   *     summary: Obtener historial de sesiones
   *     description: Obtiene el historial de sesiones del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Elementos por página
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de inicio (YYYY-MM-DD)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de fin (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Historial de sesiones obtenido exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getSessionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const {
        page = 1,
        limit = 20,
        startDate,
        endDate
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = { userId };

      // Filtros de fecha
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = new Date(startDate as string);
        if (endDate) where.createdAt.$lte = new Date(endDate as string);
      }

      const { rows: sessions, count: total } = await Session.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: [
          'sessionId', 'ipAddress', 'userAgent', 'deviceType',
          'deviceOS', 'deviceBrowser', 'locationCountry', 'locationCity',
          'locationRegion', 'isActive', 'lastActivity', 'createdAt'
        ]
      });

      const sessionHistory = sessions.map(session => ({
        sessionId: session.sessionId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        device: {
          type: session.deviceType,
          os: session.deviceOS,
          browser: session.deviceBrowser
        },
        location: {
          country: session.locationCountry || 'Unknown',
          city: session.locationCity || 'Unknown',
          region: session.locationRegion || 'Unknown'
        },
        isActive: session.isActive,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt
      }));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Historial de sesiones obtenido exitosamente',
        data: {
          sessions: sessionHistory,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo historial de sesiones:', error);
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
   * /api/sessions/terminate-others:
   *   post:
   *     tags: [Sessions]
   *     summary: Terminar todas las otras sesiones
   *     description: Termina todas las sesiones activas del usuario excepto la actual
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Otras sesiones terminadas exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async terminateOtherSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const currentSessionId = req.sessionId;

      if (!userId || !currentSessionId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await Session.terminateUserSessions(userId, currentSessionId);

      // Registrar en auditoría
      await AuditLog.log(
        'other_sessions_terminated',
        'session',
        {
          userId,
          resourceId: currentSessionId,
          oldValues: { terminatedCount: result },
          newValues: { currentSession: currentSessionId },
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `${result} sesiones terminadas exitosamente`,
        data: { terminatedCount: result },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error terminando otras sesiones:', error);
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
   * /api/sessions/current:
   *   get:
   *     tags: [Sessions]
   *     summary: Obtener información de sesión actual
   *     description: Obtiene información detallada de la sesión actual
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Información de sesión obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getCurrentSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const currentSessionId = req.sessionId;

      if (!userId || !currentSessionId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const session = await Session.findBySessionId(currentSessionId);
      if (!session || session.userId !== userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Sesión inválida',
          error: 'INVALID_SESSION',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Actualizar actividad de la sesión
      await session.updateActivity();

      const sessionInfo: SessionInfo = {
        sessionId: session.sessionId,
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        device: {
          type: session.deviceType,
          os: session.deviceOS,
          browser: session.deviceBrowser
        },
        location: {
          country: session.locationCountry || 'Unknown',
          city: session.locationCity || 'Unknown',
          region: session.locationRegion || 'Unknown'
        },
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
        isCurrent: true
      };

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Información de sesión obtenida exitosamente',
        data: sessionInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo información de sesión actual:', error);
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
   * /api/sessions/stats:
   *   get:
   *     tags: [Sessions]
   *     summary: Obtener estadísticas de sesiones
   *     description: Obtiene estadísticas de uso de sesiones (requiere permisos administrativos)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           default: 30
   *         description: Número de días para las estadísticas
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
  async getSessionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('view_audit_logs')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para ver estadísticas de sesiones',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const days = Number(req.query.days) || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Estadísticas de sesiones por día
      const dailyStats = await Session.getSessionStats(startDate, new Date());

      // Estadísticas por tipo de dispositivo
      const deviceStats = await Session.getDeviceTypeDistribution();

      // Sesiones activas actualmente
      const activeSessions = await Session.count({
        where: {
          isActive: true,
          expiresAt: { $gt: new Date() }
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estadísticas de sesiones obtenidas exitosamente',
        data: {
          period: `${days} días`,
          activeSessions,
          dailyStats,
          deviceStats
        },
        timestamp: new Date().toISOString()
      });

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
}

export const sessionController = new SessionController();
