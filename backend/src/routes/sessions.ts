/**
 * @fileoverview Rutas de Sesiones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de sesiones de usuario
 *
 * Archivo: backend/src/routes/sessions.ts
 */

import { Router } from 'express';
import { param, query } from 'express-validator';
import { sessionController } from '../controllers/sessionController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA SESIONES
// ====================================================================

// Rate limiter para operaciones de sesión
const sessionLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para parámetros de sesión
const sessionIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID de sesión es requerido')
    .isUUID()
    .withMessage('ID de sesión debe ser un UUID válido')
];

// Validación para parámetros de consulta de historial
const historyQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe estar entre 1 y 50'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe tener formato YYYY-MM-DD'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe tener formato YYYY-MM-DD')
];

// Validación para estadísticas
const statsQueryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Días debe estar entre 1 y 365')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/sessions/active:
 *   get:
 *     tags: [Sessions]
 *     summary: Obtener sesiones activas
 *     description: Obtiene todas las sesiones activas del usuario autenticado con información detallada
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones activas obtenidas exitosamente
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
 *                   example: "Sesiones activas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           deviceInfo:
 *                             type: object
 *                             properties:
 *                               userAgent:
 *                                 type: string
 *                                 example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                               ipAddress:
 *                                 type: string
 *                                 example: "192.168.1.100"
 *                               location:
 *                                 type: string
 *                                 example: "Guatemala City, Guatemala"
 *                               deviceType:
 *                                 type: string
 *                                 enum: [desktop, mobile, tablet]
 *                                 example: "desktop"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-15T10:00:00.000Z"
 *                           lastActivity:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-15T14:30:00.000Z"
 *                           isCurrent:
 *                             type: boolean
 *                             example: true
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-16T10:00:00.000Z"
 *                     totalActive:
 *                       type: integer
 *                       example: 3
 *             examples:
 *               sesiones_activas:
 *                 summary: Sesiones activas obtenidas
 *                 value:
 *                   success: true
 *                   message: "Sesiones activas obtenidas exitosamente"
 *                   data:
 *                     sessions:
 *                       - id: "550e8400-e29b-41d4-a716-446655440000"
 *                         deviceInfo:
 *                           userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                           ipAddress: "192.168.1.100"
 *                           location: "Guatemala City, Guatemala"
 *                           deviceType: "desktop"
 *                         createdAt: "2023-10-15T10:00:00.000Z"
 *                         lastActivity: "2023-10-15T14:30:00.000Z"
 *                         isCurrent: true
 *                         expiresAt: "2023-10-16T10:00:00.000Z"
 *                       - id: "660e8400-e29b-41d4-a716-446655440001"
 *                         deviceInfo:
 *                           userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"
 *                           ipAddress: "192.168.1.101"
 *                           location: "Guatemala City, Guatemala"
 *                           deviceType: "mobile"
 *                         createdAt: "2023-10-14T08:00:00.000Z"
 *                         lastActivity: "2023-10-14T09:00:00.000Z"
 *                         isCurrent: false
 *                         expiresAt: "2023-10-15T08:00:00.000Z"
 *                     totalActive: 2
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
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.get('/active', authenticated, sessionLimiter, sessionController.getActiveSessions);

/**
 * @swagger
 * /api/sessions/current:
 *   get:
 *     tags: [Sessions]
 *     summary: Obtener sesión actual
 *     description: Obtiene información detallada de la sesión actual del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión actual obtenida exitosamente
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
 *                   example: "Sesión actual obtenida exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "550e8400-e29b-41d4-a716-446655440000"
 *                         userId:
 *                           type: integer
 *                           example: 123
 *                         deviceInfo:
 *                           type: object
 *                           properties:
 *                             userAgent:
 *                               type: string
 *                               example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                             ipAddress:
 *                               type: string
 *                               example: "192.168.1.100"
 *                             location:
 *                               type: string
 *                               example: "Guatemala City, Guatemala"
 *                             deviceType:
 *                               type: string
 *                               enum: [desktop, mobile, tablet]
 *                               example: "desktop"
 *                             browser:
 *                               type: string
 *                               example: "Chrome"
 *                             os:
 *                               type: string
 *                               example: "Windows 10"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T10:00:00.000Z"
 *                         lastActivity:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T14:30:00.000Z"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-16T10:00:00.000Z"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         tokenType:
 *                           type: string
 *                           enum: [access, refresh]
 *                           example: "access"
 *             examples:
 *               sesion_actual:
 *                 summary: Sesión actual obtenida
 *                 value:
 *                   success: true
 *                   message: "Sesión actual obtenida exitosamente"
 *                   data:
 *                     session:
 *                       id: "550e8400-e29b-41d4-a716-446655440000"
 *                       userId: 123
 *                       deviceInfo:
 *                         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                         ipAddress: "192.168.1.100"
 *                         location: "Guatemala City, Guatemala"
 *                         deviceType: "desktop"
 *                         browser: "Chrome"
 *                         os: "Windows 10"
 *                       createdAt: "2023-10-15T10:00:00.000Z"
 *                       lastActivity: "2023-10-15T14:30:00.000Z"
 *                       expiresAt: "2023-10-16T10:00:00.000Z"
 *                       isActive: true
 *                       tokenType: "access"
 *       401:
 *         description: Token inválido o sesión expirada
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
 *                   example: "Sesión expirada o token inválido"
 *                 error:
 *                   type: string
 *                   example: "SESSION_EXPIRED"
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.get('/current', authenticated, sessionLimiter, sessionController.getCurrentSession);

/**
 * @swagger
 * /api/sessions/history:
 *   get:
 *     tags: [Sessions]
 *     summary: Obtener historial de sesiones
 *     description: Obtiene historial paginado de sesiones del usuario autenticado con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Número de sesiones por página
 *         example: 20
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar (YYYY-MM-DD)
 *         example: "2023-09-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar (YYYY-MM-DD)
 *         example: "2023-10-01"
 *     responses:
 *       200:
 *         description: Historial de sesiones obtenido exitosamente
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
 *                   example: "Historial de sesiones obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           deviceInfo:
 *                             type: object
 *                             properties:
 *                               userAgent:
 *                                 type: string
 *                                 example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                               ipAddress:
 *                                 type: string
 *                                 example: "192.168.1.100"
 *                               location:
 *                                 type: string
 *                                 example: "Guatemala City, Guatemala"
 *                               deviceType:
 *                                 type: string
 *                                 enum: [desktop, mobile, tablet]
 *                                 example: "desktop"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T10:00:00.000Z"
 *                           lastActivity:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T12:00:00.000Z"
 *                           terminatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T14:00:00.000Z"
 *                           terminationReason:
 *                             type: string
 *                             enum: [expired, manual_logout, forced_logout, security]
 *                             example: "manual_logout"
 *                           duration:
 *                             type: integer
 *                             description: Duración de la sesión en minutos
 *                             example: 240
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
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *             examples:
 *               historial_sesiones:
 *                 summary: Historial de sesiones obtenido
 *                 value:
 *                   success: true
 *                   message: "Historial de sesiones obtenido exitosamente"
 *                   data:
 *                     sessions:
 *                       - id: "550e8400-e29b-41d4-a716-446655440000"
 *                         deviceInfo:
 *                           userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                           ipAddress: "192.168.1.100"
 *                           location: "Guatemala City, Guatemala"
 *                           deviceType: "desktop"
 *                         createdAt: "2023-10-01T10:00:00.000Z"
 *                         lastActivity: "2023-10-01T12:00:00.000Z"
 *                         terminatedAt: "2023-10-01T14:00:00.000Z"
 *                         terminationReason: "manual_logout"
 *                         duration: 240
 *                       - id: "660e8400-e29b-41d4-a716-446655440001"
 *                         deviceInfo:
 *                           userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"
 *                           ipAddress: "192.168.1.101"
 *                           location: "Guatemala City, Guatemala"
 *                           deviceType: "mobile"
 *                         createdAt: "2023-09-28T08:00:00.000Z"
 *                         lastActivity: "2023-09-28T09:00:00.000Z"
 *                         terminatedAt: "2023-09-28T17:00:00.000Z"
 *                         terminationReason: "expired"
 *                         duration: 540
 *                     pagination:
 *                       page: 1
 *                       limit: 20
 *                       total: 150
 *                       totalPages: 8
 *                       hasNext: true
 *                       hasPrev: false
 *       400:
 *         description: Parámetros de consulta inválidos
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
 *                   example: "Fecha de inicio debe ser anterior a la fecha de fin"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
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
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.get('/history', authenticated, sessionLimiter, historyQueryValidation, sessionController.getSessionHistory);

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
 *           format: uuid
 *         description: ID único de la sesión a terminar
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Sesión terminada exitosamente
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
 *                   example: "Sesión terminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     terminatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-15T15:00:00.000Z"
 *                     terminationReason:
 *                       type: string
 *                       example: "manual_logout"
 *                     deviceInfo:
 *                       type: object
 *                       properties:
 *                         deviceType:
 *                           type: string
 *                           example: "mobile"
 *                         location:
 *                           type: string
 *                           example: "Guatemala City, Guatemala"
 *             examples:
 *               sesion_terminada:
 *                 summary: Sesión terminada exitosamente
 *                 value:
 *                   success: true
 *                   message: "Sesión terminada exitosamente"
 *                   data:
 *                     sessionId: "550e8400-e29b-41d4-a716-446655440000"
 *                     terminatedAt: "2023-10-15T15:00:00.000Z"
 *                     terminationReason: "manual_logout"
 *                     deviceInfo:
 *                       deviceType: "mobile"
 *                       location: "Guatemala City, Guatemala"
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
 *         description: No puedes terminar esta sesión
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
 *                   example: "No tienes permisos para terminar esta sesión"
 *                 error:
 *                   type: string
 *                   example: "SESSION_ACCESS_DENIED"
 *       404:
 *         description: Sesión no encontrada
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
 *                   example: "Sesión no encontrada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_NOT_FOUND"
 *       409:
 *         description: Sesión ya terminada
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
 *                   example: "La sesión ya ha sido terminada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_ALREADY_TERMINATED"
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.delete('/:id', authenticated, sessionLimiter, sessionIdValidation, sessionController.terminateSession);

/**
 * @swagger
 * /api/sessions/terminate-others:
 *   post:
 *     tags: [Sessions]
 *     summary: Terminar otras sesiones
 *     description: Termina todas las sesiones activas del usuario excepto la sesión actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Otras sesiones terminadas exitosamente
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
 *                   example: "Otras sesiones terminadas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     terminatedSessions:
 *                       type: integer
 *                       example: 2
 *                     currentSessionId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     terminatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-15T15:00:00.000Z"
 *                     terminatedSessionIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                       example: ["660e8400-e29b-41d4-a716-446655440001", "770e8400-e29b-41d4-a716-446655440002"]
 *             examples:
 *               otras_sesiones_terminadas:
 *                 summary: Otras sesiones terminadas
 *                 value:
 *                   success: true
 *                   message: "Otras sesiones terminadas exitosamente"
 *                   data:
 *                     terminatedSessions: 2
 *                     currentSessionId: "550e8400-e29b-41d4-a716-446655440000"
 *                     terminatedAt: "2023-10-15T15:00:00.000Z"
 *                     terminatedSessionIds: ["660e8400-e29b-41d4-a716-446655440001", "770e8400-e29b-41d4-a716-446655440002"]
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
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/terminate-others', authenticated, sessionLimiter, sessionController.terminateOtherSessions);

/**
 * @swagger
 * /api/sessions/stats:
 *   get:
 *     tags: [Sessions]
 *     summary: Obtener estadísticas de sesiones
 *     description: Obtiene estadísticas detalladas de uso de sesiones del sistema (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Número de días para calcular estadísticas
 *         example: 30
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
 *                   example: "Estadísticas de sesiones obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                       example: 1250
 *                     activeSessions:
 *                       type: integer
 *                       example: 89
 *                     averageSessionDuration:
 *                       type: number
 *                       description: Duración promedio en minutos
 *                       example: 45.5
 *                     sessionsByDevice:
 *                       type: object
 *                       properties:
 *                         desktop:
 *                           type: integer
 *                           example: 650
 *                         mobile:
 *                           type: integer
 *                           example: 480
 *                         tablet:
 *                           type: integer
 *                           example: 120
 *                     sessionsByLocation:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         "Guatemala City, Guatemala": 450
 *                         "Quetzaltenango, Guatemala": 180
 *                         "Antigua, Guatemala": 120
 *                     peakHours:
 *                       type: object
 *                       description: Sesiones por hora del día
 *                       properties:
 *                         "09":
 *                           type: integer
 *                           example: 85
 *                         "10":
 *                           type: integer
 *                           example: 120
 *                         "14":
 *                           type: integer
 *                           example: 95
 *                     terminationReasons:
 *                       type: object
 *                       properties:
 *                         expired:
 *                           type: integer
 *                           example: 400
 *                         manual_logout:
 *                           type: integer
 *                           example: 350
 *                         forced_logout:
 *                           type: integer
 *                           example: 50
 *                         security:
 *                           type: integer
 *                           example: 10
 *             examples:
 *               estadisticas_sesiones:
 *                 summary: Estadísticas de sesiones obtenidas
 *                 value:
 *                   success: true
 *                   message: "Estadísticas de sesiones obtenidas exitosamente"
 *                   data:
 *                     totalSessions: 1250
 *                     activeSessions: 89
 *                     averageSessionDuration: 45.5
 *                     sessionsByDevice:
 *                       desktop: 650
 *                       mobile: 480
 *                       tablet: 120
 *                     sessionsByLocation:
 *                       "Guatemala City, Guatemala": 450
 *                       "Quetzaltenango, Guatemala": 180
 *                       "Antigua, Guatemala": 120
 *                     peakHours:
 *                       "09": 85
 *                       "10": 120
 *                       "14": 95
 *                     terminationReasons:
 *                       expired: 400
 *                       manual_logout: 350
 *                       forced_logout: 50
 *                       security: 10
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
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.get('/stats', authenticated, sessionLimiter, statsQueryValidation, sessionController.getSessionStats);

export default router;
