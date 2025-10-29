/**
 * @fileoverview Servicio de Sesiones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de sesiones de usuario
 *
 * Archivo: backend/src/services/sessionService.ts
 */

import { Session } from '../models/Session';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { SessionInfo } from '../types/auth.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';

/**
 * Servicio para manejo de operaciones de sesión
 */
export class SessionService {

  /**
   * Obtiene todas las sesiones activas de un usuario
   */
  async getUserActiveSessions(userId: number): Promise<ApiResponse<SessionInfo[]>> {
    try {
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
        isCurrent: false // Se determina en el controlador
      }));

      return {
        success: true,
        message: 'Sesiones activas obtenidas exitosamente',
        data: sessionInfos,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo sesiones activas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene información de la sesión actual
   */
  async getCurrentSession(userId: number, sessionId: string): Promise<ApiResponse<SessionInfo>> {
    try {
      const session = await Session.findBySessionId(sessionId);
      if (!session || session.userId !== userId) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
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

      return {
        success: true,
        message: 'Información de sesión obtenida exitosamente',
        data: sessionInfo,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo sesión actual:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene historial de sesiones de un usuario
   */
  async getUserSessionHistory(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ApiResponse<{
    sessions: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    try {
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate
      } = options;

      const offset = (page - 1) * limit;
      const where: any = { userId };

      // Filtros de fecha
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = startDate;
        if (endDate) where.createdAt.$lte = endDate;
      }

      const { rows: sessions, count: total } = await Session.findAndCountAll({
        where,
        limit,
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

      return {
        success: true,
        message: 'Historial de sesiones obtenido exitosamente',
        data: {
          sessions: sessionHistory,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo historial de sesiones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Termina una sesión específica
   */
  async terminateSession(
    userId: number,
    sessionId: string,
    clientInfo: { ipAddress: string; userAgent: string }
  ): Promise<ApiResponse<void>> {
    try {
      const session = await Session.findBySessionId(sessionId);
      if (!session || session.userId !== userId) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
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
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        }
      );

      return {
        success: true,
        message: 'Sesión terminada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error terminando sesión:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Termina todas las sesiones de un usuario excepto la actual
   */
  async terminateOtherSessions(
    userId: number,
    currentSessionId: string,
    clientInfo: { ipAddress: string; userAgent: string }
  ): Promise<ApiResponse<{ terminatedCount: number }>> {
    try {
      const terminatedCount = await Session.terminateUserSessions(userId, currentSessionId);

      // Registrar en auditoría
      await AuditLog.log(
        'other_sessions_terminated',
        'session',
        {
          userId,
          resourceId: currentSessionId,
          oldValues: { terminatedCount },
          newValues: { currentSession: currentSessionId },
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        }
      );

      return {
        success: true,
        message: `${terminatedCount} sesiones terminadas exitosamente`,
        data: { terminatedCount },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error terminando otras sesiones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de sesiones
   */
  async getSessionStats(days: number = 30): Promise<ApiResponse<any>> {
    try {
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

      // Sesiones únicas por usuario (últimos 30 días)
      const uniqueUsers = await Session.count({
        where: {
          createdAt: { $gte: startDate }
        },
        distinct: true,
        col: 'userId'
      });

      // Sesiones expiradas pendientes de limpieza
      const expiredSessions = await Session.count({
        where: {
          expiresAt: { $lt: new Date() },
          isActive: true
        }
      });

      return {
        success: true,
        message: 'Estadísticas de sesiones obtenidas exitosamente',
        data: {
          period: `${days} días`,
          overview: {
            activeSessions,
            uniqueUsers,
            expiredSessions,
            totalSessions: await Session.count({
              where: { createdAt: { $gte: startDate } }
            })
          },
          dailyStats,
          deviceStats
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de sesiones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Detecta sesiones sospechosas para un usuario
   */
  async detectSuspiciousSessions(userId: number): Promise<ApiResponse<any>> {
    try {
      const suspiciousSessions = await Session.detectSuspiciousSessions(userId);

      return {
        success: true,
        message: 'Análisis de sesiones sospechosas completado',
        data: {
          suspiciousSessions: suspiciousSessions.map(session => ({
            sessionId: session.sessionId,
            ipAddress: session.ipAddress,
            deviceType: session.deviceType,
            locationCountry: session.locationCountry,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity
          })),
          isSuspicious: suspiciousSessions.length > 0,
          riskLevel: suspiciousSessions.length > 2 ? 'high' :
                    suspiciousSessions.length > 0 ? 'medium' : 'low'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error detectando sesiones sospechosas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Limpia sesiones expiradas
   */
  async cleanupExpiredSessions(): Promise<ApiResponse<{ cleanedCount: number }>> {
    try {
      const cleanedCount = await Session.cleanupExpiredSessions();

      // Registrar en auditoría
      if (cleanedCount > 0) {
        await AuditLog.log(
          'expired_sessions_cleaned',
          'session',
          {
            userId: undefined, // Sistema
            resourceId: 'system',
            oldValues: { expiredSessions: cleanedCount },
            newValues: { action: 'cleanup' },
            ipAddress: '127.0.0.1',
            userAgent: 'system'
          }
        );
      }

      return {
        success: true,
        message: `${cleanedCount} sesiones expiradas limpiadas exitosamente`,
        data: { cleanedCount },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error limpiando sesiones expiradas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fuerza terminación de sesión por administrador
   */
  async forceTerminateSession(
    sessionId: string,
    terminatedBy: number,
    reason: string = 'Administratively terminated'
  ): Promise<ApiResponse<void>> {
    try {
      const session = await Session.findBySessionId(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await session.terminate();

      // Registrar en auditoría
      await AuditLog.log(
        'session_force_terminated',
        'session',
        {
          userId: terminatedBy,
          resourceId: sessionId,
          oldValues: {
            userId: session.userId,
            isActive: true
          },
          newValues: {
            isActive: false,
            reason
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Sesión terminada exitosamente por administrador',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error forzando terminación de sesión:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Extiende la duración de una sesión
   */
  async extendSession(
    sessionId: string,
    additionalHours: number,
    extendedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const session = await Session.findBySessionId(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await session.extendSession(additionalHours);

      // Registrar en auditoría
      await AuditLog.log(
        'session_extended',
        'session',
        {
          userId: extendedBy,
          resourceId: sessionId,
          oldValues: { expiresAt: session.expiresAt },
          newValues: {
            additionalHours,
            newExpiresAt: session.expiresAt
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: `Sesión extendida ${additionalHours} horas exitosamente`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error extendiendo sesión:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene sesiones de un usuario por IP
   */
  async getUserSessionsByIP(userId: number, ipAddress: string): Promise<ApiResponse<any[]>> {
    try {
      const sessions = await Session.findAll({
        where: {
          userId,
          ipAddress
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: [
          'sessionId', 'deviceType', 'deviceOS', 'deviceBrowser',
          'isActive', 'createdAt', 'lastActivity', 'expiresAt'
        ]
      });

      return {
        success: true,
        message: 'Sesiones por IP obtenidas exitosamente',
        data: sessions,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo sesiones por IP:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const sessionService = new SessionService();
