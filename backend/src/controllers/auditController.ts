/**
 * @fileoverview Controlador de Auditoría y Logs para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controlador para gestión completa de auditoría, logs de seguridad y monitoreo de sistema
 *
 * Archivo: backend/src/controllers/auditController.ts
 */

import { Request, Response } from 'express';
import { AuditService } from '../services/auditService';
import { AuthenticatedRequest } from '../types/auth.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../utils/constants';

const auditService = new AuditService();

export class AuditController {

  // ====================================================================
  // GESTIÓN DE LOGS
  // ====================================================================

  /**
   * @swagger
   * /api/v1/audit/logs:
   *   get:
   *     tags: [Audit]
   *     summary: Obtener logs de auditoría
   *     description: Obtiene lista paginada de logs de auditoría con filtros avanzados
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
   *         name: userId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de usuario
   *       - in: query
   *         name: action
   *         schema:
   *           type: string
   *         description: Filtrar por acción
   *       - in: query
   *         name: resource
   *         schema:
   *           type: string
   *         description: Filtrar por recurso
   *       - in: query
   *         name: severity
   *         schema:
   *           type: string
   *           enum: [low, medium, high, critical]
   *         description: Filtrar por severidad
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [success, failure, warning]
   *         description: Filtrar por estado
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de inicio
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de fin
   *       - in: query
   *         name: ipAddress
   *         schema:
   *           type: string
   *         description: Filtrar por dirección IP
   *     responses:
   *       200:
   *         description: Logs obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        action,
        resource,
        severity,
        status,
        startDate,
        endDate,
        ipAddress
      } = req.query;

      const filters = {
        userId: userId ? parseInt(userId as string) : undefined,
        action: action as string,
        resource: resource as string,
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        status: status as 'success' | 'failure' | 'warning',
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        ipAddress: ipAddress as string
      };

      const result = await auditService.getAuditLogs({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters
      });

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo logs de auditoría:', error);
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
   * /api/v1/audit/logs/{id}:
   *   get:
   *     tags: [Audit]
   *     summary: Obtener log específico
   *     description: Obtiene detalles completos de un log de auditoría específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del log
   *     responses:
   *       200:
   *         description: Log obtenido exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Log no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getAuditLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const logId = parseInt(id);

      if (isNaN(logId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de log inválido',
          error: 'INVALID_LOG_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await auditService.getAuditLog(logId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo log de auditoría:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * @swagger
   * /api/v1/audit/stats:
   *   get:
   *     tags: [Audit]
   *     summary: Estadísticas de auditoría
   *     description: Obtiene estadísticas generales de auditoría por período
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [1h, 24h, 7d, 30d, 90d]
   *           default: 24h
   *         description: Período para las estadísticas
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
  async getAuditStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { period = '24h' } = req.query;

      const result = await auditService.getAuditStats(period as string);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo estadísticas de auditoría:', error);
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
   * /api/v1/audit/critical-events:
   *   get:
   *     tags: [Audit]
   *     summary: Eventos críticos
   *     description: Obtiene lista de eventos críticos recientes
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: hours
   *         schema:
   *           type: integer
   *           default: 24
   *         description: Horas hacia atrás para buscar eventos
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Número máximo de eventos
   *     responses:
   *       200:
   *         description: Eventos críticos obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getCriticalEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { hours = 24, limit = 50 } = req.query;

      const result = await auditService.getCriticalEvents(
        parseInt(hours as string),
        parseInt(limit as string)
      );

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo eventos críticos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // LOGS DE SEGURIDAD
  // ====================================================================

  /**
   * @swagger
   * /api/v1/audit/security-logs:
   *   get:
   *     tags: [Audit]
   *     summary: Logs de seguridad
   *     description: Obtiene logs relacionados con seguridad del sistema
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
   *         name: eventType
   *         schema:
   *           type: string
   *           enum: [login, logout, password_change, failed_login, account_locked, suspicious_activity]
   *         description: Tipo de evento de seguridad
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de inicio
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de fin
   *     responses:
   *       200:
   *         description: Logs de seguridad obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getSecurityLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        eventType,
        startDate,
        endDate
      } = req.query;

      const result = await auditService.getSecurityLogs({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        eventType: eventType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo logs de seguridad:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // LOGS DE SISTEMA
  // ====================================================================

  /**
   * @swagger
   * /api/v1/audit/system-logs:
   *   get:
   *     tags: [Audit]
   *     summary: Logs del sistema
   *     description: Obtiene logs del sistema y operaciones administrativas
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
   *         name: level
   *         schema:
   *           type: string
   *           enum: [error, warn, info, debug]
   *         description: Nivel de log
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de inicio
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Fecha de fin
   *     responses:
   *       200:
   *         description: Logs del sistema obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getSystemLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        level,
        startDate,
        endDate
      } = req.query;

      const result = await auditService.getSystemLogs({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        level: level as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo logs del sistema:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // EXPORTACIÓN Y REPORTES
  // ====================================================================

  /**
   * @swagger
   * /api/v1/audit/export:
   *   post:
   *     tags: [Audit]
   *     summary: Exportar logs de auditoría
   *     description: Exporta logs de auditoría en diferentes formatos
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - format
   *             properties:
   *               format:
   *                 type: string
   *                 enum: [csv, json, pdf]
   *               filters:
   *                 type: object
   *                 properties:
   *                   userId:
   *                     type: integer
   *                   action:
   *                     type: string
   *                   resource:
   *                     type: string
   *                   severity:
   *                     type: string
   *                     enum: [low, medium, high, critical]
   *                   startDate:
   *                     type: string
   *                     format: date-time
   *                   endDate:
   *                     type: string
   *                     format: date-time
   *     responses:
   *       200:
   *         description: Exportación completada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async exportAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { format, filters } = req.body;

      if (!['csv', 'json', 'pdf'].includes(format)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Formato de exportación no válido',
          error: 'INVALID_FORMAT',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await auditService.exportAuditLogs(format, filters);

      if (result.success) {
        // Configurar headers para descarga
        const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' :
                                         format === 'json' ? 'application/json' :
                                         'application/pdf');
        res.status(HTTP_STATUS.OK).send(result.data);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error exportando logs de auditoría:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // LIMPIEZA Y MANTENIMIENTO
  // ====================================================================

  /**
   * @swagger
   * /api/v1/audit/cleanup:
   *   post:
   *     tags: [Audit]
   *     summary: Limpiar logs antiguos
   *     description: Elimina logs de auditoría antiguos según política de retención
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               daysToKeep:
   *                 type: integer
   *                 minimum: 30
   *                 maximum: 3650
   *                 default: 365
   *                 description: Días de logs a mantener
   *               dryRun:
   *                 type: boolean
   *                 default: true
   *                 description: Solo simular sin eliminar
   *     responses:
   *       200:
   *         description: Limpieza completada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async cleanupAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { daysToKeep = 365, dryRun = true } = req.body;

      if (daysToKeep < 30 || daysToKeep > 3650) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Días a mantener debe estar entre 30 y 3650',
          error: 'INVALID_RETENTION_PERIOD',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await auditService.cleanupAuditLogs(daysToKeep, dryRun);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error limpiando logs de auditoría:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Método auxiliar para obtener código de estado HTTP desde el tipo de error
   */
  private getStatusCodeFromError(errorType?: string): number {
    switch (errorType) {
      case 'VALIDATION_ERROR':
        return HTTP_STATUS.BAD_REQUEST;
      case 'UNAUTHORIZED':
        return HTTP_STATUS.UNAUTHORIZED;
      case 'INSUFFICIENT_PERMISSIONS':
        return HTTP_STATUS.FORBIDDEN;
      case 'AUDIT_LOG_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const auditController = new AuditController();