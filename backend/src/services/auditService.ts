/**
 * @fileoverview Servicio de Auditoría y Logs para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión completa de auditoría, logs de seguridad y monitoreo de sistema
 *
 * Archivo: backend/src/services/auditService.ts
 */

import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';
import { Op } from 'sequelize';

export class AuditService {

  // ====================================================================
  // GESTIÓN DE LOGS DE AUDITORÍA
  // ====================================================================

  /**
   * Obtener logs de auditoría con filtros avanzados
   */
  async getAuditLogs(options: {
    page: number;
    limit: number;
    filters?: {
      userId?: number;
      action?: string;
      resource?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      status?: 'success' | 'failure' | 'warning';
      startDate?: Date;
      endDate?: Date;
      ipAddress?: string;
    };
  }): Promise<ApiResponse<{
    logs: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalLogs: number;
      criticalEvents: number;
      securityEvents: number;
      systemEvents: number;
    };
  }>> {
    try {
      const { page, limit, filters = {} } = options;
      const offset = (page - 1) * limit;

      // Construir filtros WHERE
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.resource) where.resource = filters.resource;
      if (filters.severity) where.severity = filters.severity;
      if (filters.status) where.status = filters.status;
      if (filters.ipAddress) where.ipAddress = filters.ipAddress;

      // Filtros de fecha
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt[Op.gte] = filters.startDate;
        if (filters.endDate) where.createdAt[Op.lte] = filters.endDate;
      }

      // Obtener logs con paginación
      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      // Calcular estadísticas del conjunto actual
      const criticalEvents = logs.filter(log => log.severity === 'critical' || log.severity === 'high').length;
      const securityEvents = logs.filter(log =>
        ['login', 'logout', 'password_change', 'failed_login', 'account_locked', 'suspicious_activity'].includes(log.action)
      ).length;
      const systemEvents = logs.filter(log => !log.userId).length;

      // Transformar logs para respuesta
      const transformedLogs = logs.map(log => ({
        id: log.id,
        userId: log.userId,
        user: log.user ? {
          id: log.user.id,
          email: log.user.email,
          firstName: log.user.firstName,
          lastName: log.user.lastName
        } : null,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        oldValues: log.oldValues,
        newValues: log.newValues,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata,
        severity: log.severity,
        status: log.status,
        description: log.description,
        createdAt: log.createdAt,
        isCritical: log.isCritical,
        location: this.extractLocationFromIP(log.ipAddress),
        deviceInfo: this.extractDeviceInfo(log.userAgent)
      }));

      return {
        success: true,
        message: 'Logs de auditoría obtenidos exitosamente',
        data: {
          logs: transformedLogs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
          },
          summary: {
            totalLogs: total,
            criticalEvents,
            securityEvents,
            systemEvents
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo logs de auditoría:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtener log específico por ID
   */
  async getAuditLog(logId: number): Promise<ApiResponse<any>> {
    try {
      const log = await AuditLog.findByPk(logId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      if (!log) {
        return {
          success: false,
          message: 'Log de auditoría no encontrado',
          error: 'AUDIT_LOG_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Log de auditoría obtenido exitosamente',
        data: {
          id: log.id,
          userId: log.userId,
          user: log.user ? {
            id: log.user.id,
            email: log.user.email,
            firstName: log.user.firstName,
            lastName: log.user.lastName
          } : null,
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          oldValues: log.oldValues,
          newValues: log.newValues,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          metadata: log.metadata,
          severity: log.severity,
          status: log.status,
          description: log.description,
          createdAt: log.createdAt,
          isCritical: log.isCritical,
          location: this.extractLocationFromIP(log.ipAddress),
          deviceInfo: this.extractDeviceInfo(log.userAgent),
          relatedLogs: await this.getRelatedLogs(log)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo log de auditoría:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y ANALYTICS
  // ====================================================================

  /**
   * Obtener estadísticas de auditoría
   */
  async getAuditStats(period: string = '24h'): Promise<ApiResponse<any>> {
    try {
      // Calcular fechas según período
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '1h':
          startDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Estadísticas generales
      const totalLogs = await AuditLog.count({
        where: { createdAt: { [Op.gte]: startDate } }
      });

      const criticalLogs = await AuditLog.count({
        where: {
          createdAt: { [Op.gte]: startDate },
          severity: { [Op.in]: ['critical', 'high'] }
        }
      });

      const securityLogs = await AuditLog.count({
        where: {
          createdAt: { [Op.gte]: startDate },
          action: { [Op.in]: ['login', 'logout', 'password_change', 'failed_login', 'account_locked', 'suspicious_activity'] }
        }
      });

      // Distribución por severidad
      const severityStats = await AuditLog.findAll({
        attributes: [
          'severity',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: startDate } },
        group: ['severity'],
        raw: true
      });

      // Distribución por estado
      const statusStats = await AuditLog.findAll({
        attributes: [
          'status',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: startDate } },
        group: ['status'],
        raw: true
      });

      // Top acciones
      const topActions = await AuditLog.findAll({
        attributes: [
          'action',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: startDate } },
        group: ['action'],
        order: [[AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Top recursos
      const topResources = await AuditLog.findAll({
        attributes: [
          'resource',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: startDate } },
        group: ['resource'],
        order: [[AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Logs por hora (últimas 24 horas)
      const hourlyStats = await AuditLog.findAll({
        attributes: [
          [AuditLog.sequelize!.fn('DATE_TRUNC', 'hour', AuditLog.sequelize!.col('created_at')), 'hour'],
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: startDate } },
        group: [AuditLog.sequelize!.fn('DATE_TRUNC', 'hour', AuditLog.sequelize!.col('created_at'))],
        order: [[AuditLog.sequelize!.fn('DATE_TRUNC', 'hour', AuditLog.sequelize!.col('created_at')), 'ASC']],
        raw: true
      });

      return {
        success: true,
        message: 'Estadísticas de auditoría obtenidas exitosamente',
        data: {
          period,
          overview: {
            totalLogs,
            criticalLogs,
            securityLogs,
            successRate: totalLogs > 0 ? ((totalLogs - criticalLogs) / totalLogs) * 100 : 0
          },
          distribution: {
            bySeverity: severityStats.map(stat => ({
              severity: (stat as any).severity,
              count: parseInt((stat as any).count)
            })),
            byStatus: statusStats.map(stat => ({
              status: (stat as any).status,
              count: parseInt((stat as any).count)
            }))
          },
          topItems: {
            actions: topActions.map(action => ({
              action: (action as any).action,
              count: parseInt((action as any).count)
            })),
            resources: topResources.map(resource => ({
              resource: (resource as any).resource,
              count: parseInt((resource as any).count)
            }))
          },
          timeline: {
            hourly: hourlyStats.map(stat => ({
              hour: (stat as any).hour,
              count: parseInt((stat as any).count)
            }))
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de auditoría:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtener eventos críticos recientes
   */
  async getCriticalEvents(hours: number = 24, limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const logs = await AuditLog.findAll({
        where: {
          createdAt: { [Op.gte]: startDate },
          [Op.or]: [
            { severity: 'critical' },
            { severity: 'high', status: 'failure' }
          ]
        },
        limit,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      const transformedLogs = logs.map(log => ({
        id: log.id,
        userId: log.userId,
        user: log.user ? {
          id: log.user.id,
          email: log.user.email,
          firstName: log.user.firstName,
          lastName: log.user.lastName
        } : null,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        severity: log.severity,
        status: log.status,
        description: log.description,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        isCritical: log.isCritical,
        location: this.extractLocationFromIP(log.ipAddress)
      }));

      return {
        success: true,
        message: 'Eventos críticos obtenidos exitosamente',
        data: transformedLogs,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo eventos críticos:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // LOGS DE SEGURIDAD
  // ====================================================================

  /**
   * Obtener logs de seguridad
   */
  async getSecurityLogs(options: {
    page: number;
    limit: number;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ApiResponse<{
    logs: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalEvents: number;
      failedLogins: number;
      suspiciousActivities: number;
      accountLocks: number;
    };
  }>> {
    try {
      const { page, limit, eventType, startDate, endDate } = options;
      const offset = (page - 1) * limit;

      // Eventos de seguridad
      const securityEvents = [
        'login', 'logout', 'password_change', 'password_reset_request',
        'password_reset_complete', '2fa_enabled', '2fa_disabled',
        '2fa_verification_failed', 'email_verification', 'account_locked',
        'account_unlocked', 'suspicious_activity', 'failed_login'
      ];

      const where: any = {
        action: securityEvents
      };

      if (eventType) {
        where.action = eventType;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }

      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      // Calcular estadísticas
      const failedLogins = logs.filter(log => log.action === 'failed_login').length;
      const suspiciousActivities = logs.filter(log => log.action === 'suspicious_activity').length;
      const accountLocks = logs.filter(log => log.action === 'account_locked').length;

      const transformedLogs = logs.map(log => ({
        id: log.id,
        userId: log.userId,
        user: log.user ? {
          id: log.user.id,
          email: log.user.email,
          firstName: log.user.firstName,
          lastName: log.user.lastName
        } : null,
        action: log.action,
        resource: log.resource,
        severity: log.severity,
        status: log.status,
        description: log.description,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata,
        createdAt: log.createdAt,
        location: this.extractLocationFromIP(log.ipAddress),
        deviceInfo: this.extractDeviceInfo(log.userAgent),
        riskLevel: this.calculateRiskLevel(log)
      }));

      return {
        success: true,
        message: 'Logs de seguridad obtenidos exitosamente',
        data: {
          logs: transformedLogs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
          },
          summary: {
            totalEvents: total,
            failedLogins,
            suspiciousActivities,
            accountLocks
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo logs de seguridad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // LOGS DEL SISTEMA
  // ====================================================================

  /**
   * Obtener logs del sistema
   */
  async getSystemLogs(options: {
    page: number;
    limit: number;
    level?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ApiResponse<{
    logs: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    try {
      const { page, limit, level, startDate, endDate } = options;
      const offset = (page - 1) * limit;

      // Eventos del sistema (sin userId)
      const where: any = {
        userId: null,
        resource: { [Op.in]: ['system', 'admin', 'config', 'maintenance'] }
      };

      if (level) {
        // Mapear niveles de log a severidad
        const severityMap: { [key: string]: string[] } = {
          'error': ['critical', 'high'],
          'warn': ['medium'],
          'info': ['low'],
          'debug': ['low']
        };
        where.severity = { [Op.in]: severityMap[level] || ['low'] };
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }

      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const transformedLogs = logs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        severity: log.severity,
        status: log.status,
        description: log.description,
        metadata: log.metadata,
        createdAt: log.createdAt,
        level: this.mapSeverityToLogLevel(log.severity)
      }));

      return {
        success: true,
        message: 'Logs del sistema obtenidos exitosamente',
        data: {
          logs: transformedLogs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo logs del sistema:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exportar logs de auditoría
   */
  async exportAuditLogs(format: string, filters: any = {}): Promise<ApiResponse<any>> {
    try {
      // Obtener todos los logs con filtros
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.resource) where.resource = filters.resource;
      if (filters.severity) where.severity = filters.severity;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt[Op.gte] = new Date(filters.startDate);
        if (filters.endDate) where.createdAt[Op.lte] = new Date(filters.endDate);
      }

      const logs = await AuditLog.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      let exportData: any;

      switch (format) {
        case 'csv':
          exportData = this.convertToCSV(logs);
          break;
        case 'json':
          exportData = logs.map(log => ({
            id: log.id,
            userId: log.userId,
            userEmail: log.user?.email || null,
            action: log.action,
            resource: log.resource,
            resourceId: log.resourceId,
            severity: log.severity,
            status: log.status,
            description: log.description,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt
          }));
          break;
        case 'pdf':
          exportData = this.generatePDFReport(logs);
          break;
        default:
          throw new Error('Formato no soportado');
      }

      return {
        success: true,
        message: `Logs exportados en formato ${format}`,
        data: exportData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error exportando logs de auditoría:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // LIMPIEZA Y MANTENIMIENTO
  // ====================================================================

  /**
   * Limpiar logs antiguos
   */
  async cleanupAuditLogs(daysToKeep: number, dryRun: boolean = true): Promise<ApiResponse<{
    deletedCount: number;
    wouldDeleteCount: number;
    cutoffDate: Date;
    dryRun: boolean;
  }>> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      // Contar logs que serían eliminados
      const wouldDeleteCount = await AuditLog.count({
        where: {
          createdAt: { [Op.lt]: cutoffDate },
          severity: { [Op.ne]: 'critical' } // Mantener logs críticos
        }
      });

      let deletedCount = 0;

      if (!dryRun) {
        deletedCount = await AuditLog.destroy({
          where: {
            createdAt: { [Op.lt]: cutoffDate },
            severity: { [Op.ne]: 'critical' }
          }
        });

        // Registrar la limpieza
        await AuditLog.log(
          'audit_cleanup',
          'system',
          {
            userId: undefined,
            resourceId: 'audit_logs',
            metadata: {
              daysToKeep,
              cutoffDate: cutoffDate.toISOString(),
              deletedCount
            },
            ipAddress: '127.0.0.1',
            userAgent: 'system'
          }
        );
      }

      return {
        success: true,
        message: dryRun ? 'Simulación de limpieza completada' : 'Limpieza de logs completada',
        data: {
          deletedCount,
          wouldDeleteCount,
          cutoffDate,
          dryRun
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error limpiando logs de auditoría:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Obtener logs relacionados a un log específico
   */
  private async getRelatedLogs(log: AuditLog): Promise<any[]> {
    try {
      const relatedLogs = await AuditLog.findAll({
        where: {
          [Op.or]: [
            { userId: log.userId },
            { resourceId: log.resourceId },
            {
              resource: log.resource,
              createdAt: {
                [Op.gte]: new Date(log.createdAt.getTime() - 5 * 60 * 1000), // 5 minutos antes
                [Op.lte]: new Date(log.createdAt.getTime() + 5 * 60 * 1000)  // 5 minutos después
              }
            }
          ],
          id: { [Op.ne]: log.id }
        },
        limit: 10,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'action', 'resource', 'severity', 'createdAt']
      });

      return relatedLogs.map(rl => ({
        id: rl.id,
        action: rl.action,
        resource: rl.resource,
        severity: rl.severity,
        createdAt: rl.createdAt
      }));

    } catch (error) {
      logger.error('Error obteniendo logs relacionados:', error);
      return [];
    }
  }

  /**
   * Extraer ubicación desde IP (simulado)
   */
  private extractLocationFromIP(ipAddress: string): string {
    // En producción, usar un servicio de geolocalización
    return 'Guatemala City, Guatemala';
  }

  /**
   * Extraer información del dispositivo desde User-Agent
   */
  private extractDeviceInfo(userAgent: string): any {
    if (!userAgent) return { type: 'unknown', browser: 'unknown', os: 'unknown' };

    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown';

    const os = userAgent.includes('Windows') ? 'Windows' :
              userAgent.includes('Mac') ? 'macOS' :
              userAgent.includes('Linux') ? 'Linux' :
              userAgent.includes('Android') ? 'Android' :
              userAgent.includes('iOS') ? 'iOS' : 'Unknown';

    return {
      type: isMobile ? 'mobile' : 'desktop',
      browser,
      os
    };
  }

  /**
   * Calcular nivel de riesgo de un evento
   */
  private calculateRiskLevel(log: AuditLog): string {
    if (log.action === 'suspicious_activity' || log.severity === 'critical') {
      return 'high';
    }
    if (log.action === 'failed_login' && log.metadata && (log.metadata as any).attempts > 5) {
      return 'high';
    }
    if (log.action === 'account_locked' || log.severity === 'high') {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Mapear severidad a nivel de log
   */
  private mapSeverityToLogLevel(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
      default:
        return 'info';
    }
  }

  /**
   * Convertir logs a CSV
   */
  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'ID', 'Usuario ID', 'Email', 'Acción', 'Recurso', 'ID Recurso',
      'Severidad', 'Estado', 'Descripción', 'IP', 'Fecha'
    ];

    const rows = logs.map(log => [
      log.id,
      log.userId || '',
      log.user?.email || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.severity,
      log.status,
      log.description || '',
      log.ipAddress,
      log.createdAt.toISOString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Generar reporte PDF (simulado)
   */
  private generatePDFReport(logs: AuditLog[]): Buffer {
    // En producción, usar una librería como pdfkit
    const reportData = {
      title: 'Reporte de Auditoría',
      generatedAt: new Date().toISOString(),
      totalLogs: logs.length,
      logs: logs.slice(0, 100) // Limitar para el ejemplo
    };

    return Buffer.from(JSON.stringify(reportData, null, 2));
  }
}

export const auditService = new AuditService();