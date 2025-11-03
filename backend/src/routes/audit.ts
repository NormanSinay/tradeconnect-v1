/**
 * @fileoverview Rutas de Auditoría y Logs para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión completa de auditoría, logs de seguridad y monitoreo
 *
 * Archivo: backend/src/routes/audit.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AuditController } from '../controllers/auditController';

const auditController = new AuditController();
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA AUDITORÍA
// ====================================================================

// Rate limiter general para auditoría
const auditLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de auditoría. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para estadísticas
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de estadísticas. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para exportaciones
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: {
    success: false,
    message: 'Demasiadas exportaciones. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para filtros de logs
const logFiltersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('userId').optional().isInt({ min: 1 }).withMessage('userId debe ser un número entero positivo'),
  query('action').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Acción debe ser una cadena de 1-100 caracteres'),
  query('resource').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Recurso debe ser una cadena de 1-50 caracteres'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Severidad no válida'),
  query('status').optional().isIn(['success', 'failure', 'warning']).withMessage('Estado no válido'),
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio debe ser una fecha ISO válida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin debe ser una fecha ISO válida'),
  query('ipAddress').optional().isIP().withMessage('Dirección IP no válida')
];

// Validación para ID de log
const logIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de log debe ser un número entero positivo')
];

// Validación para exportación
const exportValidation = [
  body('format')
    .isIn(['csv', 'json', 'pdf'])
    .withMessage('Formato debe ser csv, json o pdf'),
  body('filters').optional().isObject().withMessage('Filtros deben ser un objeto')
];

// Validación para limpieza
const cleanupValidation = [
  body('daysToKeep')
    .isInt({ min: 30, max: 3650 })
    .withMessage('Días a mantener debe estar entre 30 y 3650'),
  body('dryRun')
    .optional()
    .isBoolean()
    .withMessage('dryRun debe ser un booleano')
];

// ====================================================================
// RUTAS DE GESTIÓN DE LOGS
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
router.get('/logs', authenticated, auditLimiter, logFiltersValidation, auditController.getAuditLogs);

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
router.get('/logs/:id', authenticated, auditLimiter, logIdValidation, auditController.getAuditLog);

// ====================================================================
// RUTAS DE ESTADÍSTICAS
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
router.get('/stats', authenticated, statsLimiter, [
  query('period').optional().isIn(['1h', '24h', '7d', '30d', '90d']).withMessage('Período no válido')
], auditController.getAuditStats);

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
router.get('/critical-events', authenticated, auditLimiter, [
  query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Horas debe estar entre 1 y 168'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Límite debe estar entre 1 y 200')
], auditController.getCriticalEvents);

// ====================================================================
// RUTAS DE LOGS DE SEGURIDAD
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
router.get('/security-logs', authenticated, auditLimiter, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('eventType').optional().isIn(['login', 'logout', 'password_change', 'failed_login', 'account_locked', 'suspicious_activity']).withMessage('Tipo de evento no válido'),
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio debe ser una fecha ISO válida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin debe ser una fecha ISO válida')
], auditController.getSecurityLogs);

// ====================================================================
// RUTAS DE LOGS DEL SISTEMA
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
router.get('/system-logs', authenticated, auditLimiter, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('level').optional().isIn(['error', 'warn', 'info', 'debug']).withMessage('Nivel de log no válido'),
  query('startDate').optional().isISO8601().withMessage('Fecha de inicio debe ser una fecha ISO válida'),
  query('endDate').optional().isISO8601().withMessage('Fecha de fin debe ser una fecha ISO válida')
], auditController.getSystemLogs);

// ====================================================================
// RUTAS DE EXPORTACIÓN
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
router.post('/export', authenticated, exportLimiter, exportValidation, auditController.exportAuditLogs);

// ====================================================================
// RUTAS DE MANTENIMIENTO
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
router.post('/cleanup', authenticated, auditLimiter, cleanupValidation, auditController.cleanupAuditLogs);

export default router;