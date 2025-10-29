/**
 * @fileoverview Rutas de Streaming para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para control de transmisiones en vivo
 *
 * Archivo: backend/src/routes/streaming.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { streamingController } from '../controllers/streamingController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA STREAMING
// ====================================================================

// Rate limiter general para operaciones de streaming
const streamingLimiter = rateLimit({
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

// Rate limiter específico para operaciones críticas de streaming
const streamingControlLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 operaciones por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de control de streaming. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para iniciar streaming
const startStreamingValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('quality')
    .optional()
    .isIn(['480p', '720p', '1080p', '4k'])
    .withMessage('La calidad debe ser: 480p, 720p, 1080p o 4k'),
  body('record')
    .optional()
    .isBoolean()
    .withMessage('record debe ser un valor booleano')
];

// Validación para parámetros de evento
const eventIdValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
];

// Validación para parámetros de consulta de analytics
const analyticsQueryValidation = [
  query('period')
    .optional()
    .isIn(['realtime', 'last_hour', 'last_24h', 'all'])
    .withMessage('El período debe ser: realtime, last_hour, last_24h o all')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/streaming/events/{eventId}/start:
 *   post:
 *     tags: [Streaming]
 *     summary: Iniciar transmisión
 *     description: Inicia la transmisión en vivo para un evento híbrido
 *     security:
 *       - bearerAuth: []
 */
router.post('/events/:eventId/start', authenticated, streamingControlLimiter, startStreamingValidation, streamingController.startStreaming);

/**
 * @swagger
 * /api/streaming/events/{eventId}/stop:
 *   post:
 *     tags: [Streaming]
 *     summary: Detener transmisión
 *     description: Detiene la transmisión en vivo de un evento
 *     security:
 *       - bearerAuth: []
 */
router.post('/events/:eventId/stop', authenticated, streamingControlLimiter, eventIdValidation, streamingController.stopStreaming);

/**
 * @swagger
 * /api/streaming/events/{eventId}/status:
 *   get:
 *     tags: [Streaming]
 *     summary: Obtener estado de transmisión
 *     description: Obtiene el estado actual de la transmisión de un evento
 *     security:
 *       - bearerAuth: []
 */
router.get('/events/:eventId/status', authenticated, streamingLimiter, eventIdValidation, streamingController.getStreamingStatus);

/**
 * @swagger
 * /api/streaming/events/{eventId}/analytics:
 *   get:
 *     tags: [Streaming]
 *     summary: Obtener analytics de transmisión
 *     description: Obtiene métricas y estadísticas de la transmisión
 *     security:
 *       - bearerAuth: []
 */
router.get('/events/:eventId/analytics', authenticated, streamingLimiter, [...eventIdValidation, ...analyticsQueryValidation], streamingController.getStreamingAnalytics);

export default router;
