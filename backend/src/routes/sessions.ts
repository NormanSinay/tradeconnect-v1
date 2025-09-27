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
 *     description: Obtiene todas las sesiones activas del usuario autenticado
 *     security:
 *       - bearerAuth: []
 */
router.get('/active', sessionLimiter, sessionController.getActiveSessions);

/**
 * @swagger
 * /api/sessions/current:
 *   get:
 *     tags: [Sessions]
 *     summary: Obtener sesión actual
 *     description: Obtiene información detallada de la sesión actual
 *     security:
 *       - bearerAuth: []
 */
router.get('/current', sessionLimiter, sessionController.getCurrentSession);

/**
 * @swagger
 * /api/sessions/history:
 *   get:
 *     tags: [Sessions]
 *     summary: Obtener historial de sesiones
 *     description: Obtiene historial paginado de sesiones del usuario autenticado
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', sessionLimiter, historyQueryValidation, sessionController.getSessionHistory);

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
 *         description: ID de la sesión a terminar
 */
router.delete('/:id', sessionLimiter, sessionIdValidation, sessionController.terminateSession);

/**
 * @swagger
 * /api/sessions/terminate-others:
 *   post:
 *     tags: [Sessions]
 *     summary: Terminar otras sesiones
 *     description: Termina todas las sesiones activas excepto la actual
 *     security:
 *       - bearerAuth: []
 */
router.post('/terminate-others', sessionLimiter, sessionController.terminateOtherSessions);

/**
 * @swagger
 * /api/sessions/stats:
 *   get:
 *     tags: [Sessions]
 *     summary: Obtener estadísticas de sesiones
 *     description: Obtiene estadísticas de uso de sesiones (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', sessionLimiter, statsQueryValidation, sessionController.getSessionStats);

export default router;