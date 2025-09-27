/**
 * @fileoverview Servicio de Seguridad para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios de seguridad, auditoría y validaciones de seguridad
 *
 * Archivo: backend/src/services/securityService.ts
 */

import { Op } from 'sequelize';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { SecurityAuditLog, SecurityEventType } from '../types/auth.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';

/**
 * Servicio para manejo de operaciones de seguridad
 */
export class SecurityService {

  /**
   * Registra un evento de seguridad en el log de auditoría
   */
  async logSecurityEvent(
    eventType: SecurityEventType,
    data: {
      userId?: number;
      resource?: string;
      resourceId?: string;
      ipAddress: string;
      userAgent: string;
      metadata?: Record<string, any>;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<void> {
    try {
      const {
        userId,
        resource = 'system',
        resourceId,
        ipAddress,
        userAgent,
        metadata,
        severity = 'low'
    } = data;

      await AuditLog.log(
        eventType,
        resource,
        {
          userId,
          resourceId,
          ipAddress,
          userAgent,
          metadata,
          severity
        }
      );

      // Log adicional para eventos críticos
      if (severity === 'critical' || severity === 'high') {
        logger.warn(`Security Event: ${eventType}`, {
          userId,
          resource,
          resourceId,
          ipAddress,
          severity,
          metadata
        });
      }

    } catch (error) {
      logger.error('Error registrando evento de seguridad:', error);
    }
  }

  /**
   * Obtiene logs de auditoría con filtros avanzados
   */
  async getAuditLogs(options: {
    userId?: number;
    resource?: string;
    eventType?: SecurityEventType;
    severity?: string[];
    status?: string[];
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    logs: SecurityAuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    try {
      const {
        userId,
        resource,
        eventType,
        severity,
        status,
        startDate,
        endDate,
        ipAddress,
        page = 1,
        limit = 50
      } = options;

      const where: any = {};

      if (userId) where.userId = userId;
      if (resource) where.resource = resource;
      if (eventType) where.action = eventType;
      if (ipAddress) where.ipAddress = ipAddress;

      if (severity && severity.length > 0) {
        where.severity = { [Op.in]: severity };
      }

      if (status && status.length > 0) {
        where.status = { [Op.in]: status };
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = startDate;
        if (endDate) where.createdAt.$lte = endDate;
      }

      const offset = (page - 1) * limit;

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

      const formattedLogs: SecurityAuditLog[] = logs.map(log => ({
        userId: log.userId,
        eventType: log.action as SecurityEventType,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        description: log.description,
        metadata: log.metadata,
        riskLevel: log.severity as 'low' | 'medium' | 'high' | 'critical',
        createdAt: log.createdAt
      }));

      return {
        success: true,
        message: 'Logs de auditoría obtenidos exitosamente',
        data: {
          logs: formattedLogs,
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
   * Detecta actividades sospechosas
   */
  async detectSuspiciousActivity(
    userId?: number,
    timeWindowMinutes: number = 60
  ): Promise<ApiResponse<any>> {
    try {
      const startTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

      // Obtener logs de seguridad recientes
      const recentLogs = await AuditLog.findAll({
        where: {
          createdAt: { [Op.gte]: startTime },
          ...(userId && { userId })
        },
        order: [['createdAt', 'DESC']]
      });

      const analysis = {
        totalEvents: recentLogs.length,
        criticalEvents: 0,
        failedLogins: 0,
        differentIPs: new Set<string>(),
        suspiciousPatterns: [] as string[],
        riskScore: 0
      };

      // Analizar eventos
      for (const log of recentLogs) {
        analysis.differentIPs.add(log.ipAddress);

        if (log.severity === 'critical') {
          analysis.criticalEvents++;
          analysis.riskScore += 10;
        } else if (log.severity === 'high') {
          analysis.riskScore += 5;
        }

        if (log.action === 'login_failed') {
          analysis.failedLogins++;
          analysis.riskScore += 2;
        }

        // Patrones específicos
        if (log.action === 'suspicious_activity') {
          analysis.suspiciousPatterns.push('Actividad sospechosa detectada');
          analysis.riskScore += 8;
        }

        if (analysis.differentIPs.size > 5) {
          analysis.suspiciousPatterns.push('Múltiples IPs detectadas');
          analysis.riskScore += 3;
        }

        if (analysis.failedLogins > 10) {
          analysis.suspiciousPatterns.push('Múltiples intentos de login fallidos');
          analysis.riskScore += 5;
        }
      }

      // Determinar nivel de riesgo
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (analysis.riskScore >= 20) riskLevel = 'critical';
      else if (analysis.riskScore >= 10) riskLevel = 'high';
      else if (analysis.riskScore >= 5) riskLevel = 'medium';

      return {
        success: true,
        message: 'Análisis de actividad sospechosa completado',
        data: {
          ...analysis,
          riskLevel,
          timeWindow: `${timeWindowMinutes} minutos`,
          recommendations: this.getSecurityRecommendations(riskLevel, analysis)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error detectando actividad sospechosa:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Genera recomendaciones de seguridad basadas en el análisis
   */
  private getSecurityRecommendations(
    riskLevel: string,
    analysis: any
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('Cuenta suspendida temporalmente por actividad crítica');
      recommendations.push('Revisión inmediata por administrador de seguridad');
      recommendations.push('Cambio obligatorio de contraseña');
    } else if (riskLevel === 'high') {
      recommendations.push('Verificación de identidad requerida');
      recommendations.push('Revisar dispositivos y sesiones activas');
      recommendations.push('Considerar habilitar 2FA si no está activo');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitoreo adicional recomendado');
      recommendations.push('Revisar logs de acceso recientes');
    }

    if (analysis.failedLogins > 5) {
      recommendations.push('Demasiados intentos de login fallidos - considere cambiar contraseña');
    }

    if (analysis.differentIPs.size > 3) {
      recommendations.push('Acceso desde múltiples ubicaciones - verificar legitimidad');
    }

    return recommendations;
  }

  /**
   * Bloquea una IP por tiempo determinado
   */
  async blockIP(
    ipAddress: string,
    durationMinutes: number,
    reason: string,
    blockedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const key = `blocked_ip:${ipAddress}`;
      const expiration = durationMinutes * 60; // segundos

      await redis.setex(key, expiration, JSON.stringify({
        blockedAt: new Date().toISOString(),
        reason,
        blockedBy,
        durationMinutes
      }));

      // Registrar en auditoría
      await this.logSecurityEvent('ip_blocked', {
        userId: blockedBy,
        resource: 'security',
        resourceId: ipAddress,
        ipAddress,
        userAgent: 'system',
        metadata: { reason, durationMinutes },
        severity: 'high'
      });

      return {
        success: true,
        message: `IP ${ipAddress} bloqueada por ${durationMinutes} minutos`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error bloqueando IP:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica si una IP está bloqueada
   */
  async isIPBlocked(ipAddress: string): Promise<boolean> {
    try {
      const key = `blocked_ip:${ipAddress}`;
      const result = await redis.get(key);
      return !!result;
    } catch (error) {
      logger.error('Error verificando IP bloqueada:', error);
      return false;
    }
  }

  /**
   * Desbloquea una IP
   */
  async unblockIP(ipAddress: string, unblockedBy: number): Promise<ApiResponse<void>> {
    try {
      const key = `blocked_ip:${ipAddress}`;
      const wasBlocked = await redis.del(key);

      if (wasBlocked) {
        await this.logSecurityEvent('ip_unblocked', {
          userId: unblockedBy,
          resource: 'security',
          resourceId: ipAddress,
          ipAddress,
          userAgent: 'system',
          severity: 'medium'
        });
      }

      return {
        success: true,
        message: `IP ${ipAddress} desbloqueada exitosamente`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error desbloqueando IP:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene lista de IPs bloqueadas
   */
  async getBlockedIPs(): Promise<ApiResponse<any[]>> {
    try {
      const keys = await redis.keys('blocked_ip:*');
      const blockedIPs: any[] = [];

      for (const key of keys) {
        const ipAddress = key.replace('blocked_ip:', '');
        const data = await redis.get(key);
        if (data) {
          try {
            const blockInfo = JSON.parse(data);
            blockedIPs.push({
              ipAddress,
              ...blockInfo
            });
          } catch (e) {
            // Ignorar entradas mal formateadas
          }
        }
      }

      return {
        success: true,
        message: 'IPs bloqueadas obtenidas exitosamente',
        data: blockedIPs,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo IPs bloqueadas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Valida fortaleza de contraseña
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Longitud mínima
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('La contraseña debe tener al menos 8 caracteres');
    }

    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('La contraseña debe contener al menos una mayúscula');
    }

    // Contiene minúsculas
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('La contraseña debe contener al menos una minúscula');
    }

    // Contiene números
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('La contraseña debe contener al menos un número');
    }

    // Contiene caracteres especiales
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('La contraseña debe contener al menos un carácter especial');
    }

    // Longitud extra
    if (password.length >= 12) {
      score += 1;
    }

    return {
      isValid: score >= 4, // Requiere al menos 4 de 6 criterios
      score,
      feedback
    };
  }

  /**
   * Detecta intentos de fuerza bruta
   */
  async detectBruteForce(ipAddress: string): Promise<{
    isBruteForce: boolean;
    attempts: number;
    timeWindow: number;
  }> {
    try {
      const key = `brute_force:${ipAddress}`;
      const attempts = await redis.incr(key);

      // Si es el primer intento, establecer expiración de 15 minutos
      if (attempts === 1) {
        await redis.expire(key, 15 * 60);
      }

      const isBruteForce = attempts >= 5; // Más de 5 intentos en 15 minutos

      if (isBruteForce) {
        await this.logSecurityEvent('brute_force_attempt', {
          resource: 'auth',
          resourceId: ipAddress,
          ipAddress,
          userAgent: 'unknown',
          metadata: { attempts },
          severity: 'high'
        });
      }

      return {
        isBruteForce,
        attempts,
        timeWindow: 15 * 60 // 15 minutos en segundos
      };

    } catch (error) {
      logger.error('Error detectando fuerza bruta:', error);
      return {
        isBruteForce: false,
        attempts: 0,
        timeWindow: 0
      };
    }
  }

  /**
   * Limpia contador de fuerza bruta después de login exitoso
   */
  async clearBruteForceCounter(ipAddress: string): Promise<void> {
    try {
      const key = `brute_force:${ipAddress}`;
      await redis.del(key);
    } catch (error) {
      logger.error('Error limpiando contador de fuerza bruta:', error);
    }
  }

  /**
   * Genera reporte de seguridad
   */
  async generateSecurityReport(
    startDate: Date,
    endDate: Date
  ): Promise<ApiResponse<any>> {
    try {
      // Estadísticas de eventos de seguridad
      const securityStats = await AuditLog.findAll({
        attributes: [
          'severity',
          'status',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'count']
        ],
        where: {
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate }
        },
        group: ['severity', 'status'],
        raw: true
      });

      // Eventos críticos
      const criticalEvents = await AuditLog.getCriticalEvents(24 * 7); // Última semana

      // Usuarios con más eventos de seguridad
      const riskyUsers = await AuditLog.findAll({
        attributes: [
          'userId',
          [AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'eventCount']
        ],
        where: {
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
          severity: { [Op.in]: ['high', 'critical'] }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['email', 'firstName', 'lastName']
          }
        ],
        group: ['AuditLog.userId', 'user.id', 'user.email', 'user.firstName', 'user.lastName'],
        order: [[AuditLog.sequelize!.fn('COUNT', AuditLog.sequelize!.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      return {
        success: true,
        message: 'Reporte de seguridad generado exitosamente',
        data: {
          period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          securityStats,
          criticalEvents: criticalEvents.length,
          riskyUsers,
          recommendations: this.generateSecurityRecommendations(securityStats, criticalEvents.length)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error generando reporte de seguridad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Genera recomendaciones de seguridad basadas en estadísticas
   */
  private generateSecurityRecommendations(stats: any[], criticalEvents: number): string[] {
    const recommendations: string[] = [];

    const highSeverityCount = stats.filter(s => s.severity === 'high').reduce((sum, s) => sum + parseInt(s.count), 0);
    const criticalSeverityCount = stats.filter(s => s.severity === 'critical').reduce((sum, s) => sum + parseInt(s.count), 0);

    if (criticalEvents > 10) {
      recommendations.push('Alto número de eventos críticos - revisión inmediata requerida');
    }

    if (highSeverityCount > 50) {
      recommendations.push('Incrementar monitoreo de eventos de alta severidad');
    }

    if (criticalSeverityCount > 5) {
      recommendations.push('Implementar medidas de seguridad adicionales');
    }

    recommendations.push('Revisar logs de auditoría regularmente');
    recommendations.push('Mantener actualizado el sistema de detección de intrusiones');

    return recommendations;
  }

  /**
   * Verifica si un token de sesión está en la lista negra
   */
  async isTokenBlacklisted(sessionId: string): Promise<boolean> {
    try {
      const result = await redis.get(`blacklist:${sessionId}`);
      return !!result;
    } catch (error) {
      logger.error('Error verificando token en lista negra:', error);
      return false;
    }
  }

  /**
   * Valida token JWT y verifica si está en lista negra
   */
  async validateToken(token: string, sessionId: string): Promise<boolean> {
    try {
      // Verificar si está en lista negra
      const isBlacklisted = await this.isTokenBlacklisted(sessionId);
      if (isBlacklisted) {
        return false;
      }

      // Verificar sesión activa
      const session = await Session.findBySessionId(sessionId);
      if (!session || !session.isValid) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validando token:', error);
      return false;
    }
  }
}

export const securityService = new SecurityService();