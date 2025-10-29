/**
 * @fileoverview Rutas de Eventos Híbridos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de eventos híbridos
 *
 * Archivo: backend/src/routes/hybrid-events.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { hybridEventController } from '../controllers/hybridEventController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA EVENTOS HÍBRIDOS
// ====================================================================

// Rate limiter general para operaciones de eventos híbridos
const hybridEventLimiter = rateLimit({
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

// Rate limiter específico para operaciones de creación/edición
const createEditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 operaciones por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de creación/edición. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para crear evento híbrido
const createHybridEventValidation = [
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('config.modality')
    .isIn(['presential_only', 'virtual_only', 'hybrid'])
    .withMessage('La modalidad debe ser: presential_only, virtual_only o hybrid'),
  body('config.presentialCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad presencial debe ser un número entero positivo'),
  body('config.virtualCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad virtual debe ser un número entero positivo'),
  body('config.streamingPlatform')
    .isIn(['zoom', 'google_meet', 'microsoft_teams', 'custom_streaming'])
    .withMessage('La plataforma debe ser: zoom, google_meet, microsoft_teams o custom_streaming'),
  body('config.recordingEnabled')
    .optional()
    .isBoolean()
    .withMessage('recordingEnabled debe ser un valor booleano'),
  body('config.chatEnabled')
    .optional()
    .isBoolean()
    .withMessage('chatEnabled debe ser un valor booleano'),
  body('config.qaEnabled')
    .optional()
    .isBoolean()
    .withMessage('qaEnabled debe ser un valor booleano'),
  body('config.pollsEnabled')
    .optional()
    .isBoolean()
    .withMessage('pollsEnabled debe ser un valor booleano'),
  body('config.timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('La zona horaria debe tener entre 1 y 50 caracteres'),
  body('config.streamDelaySeconds')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('El delay del stream debe estar entre 0 y 30 segundos')
];

// Validación para actualizar evento híbrido
const updateHybridEventValidation = [
  body('config.modality')
    .optional()
    .isIn(['presential_only', 'virtual_only', 'hybrid'])
    .withMessage('La modalidad debe ser: presential_only, virtual_only o hybrid'),
  body('config.presentialCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad presencial debe ser un número entero positivo'),
  body('config.virtualCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad virtual debe ser un número entero positivo'),
  body('config.streamingPlatform')
    .optional()
    .isIn(['zoom', 'google_meet', 'microsoft_teams', 'custom_streaming'])
    .withMessage('La plataforma debe ser: zoom, google_meet, microsoft_teams o custom_streaming'),
  body('config.recordingEnabled')
    .optional()
    .isBoolean()
    .withMessage('recordingEnabled debe ser un valor booleano'),
  body('config.chatEnabled')
    .optional()
    .isBoolean()
    .withMessage('chatEnabled debe ser un valor booleano'),
  body('config.qaEnabled')
    .optional()
    .isBoolean()
    .withMessage('qaEnabled debe ser un valor booleano'),
  body('config.pollsEnabled')
    .optional()
    .isBoolean()
    .withMessage('pollsEnabled debe ser un valor booleano'),
  body('config.timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('La zona horaria debe tener entre 1 y 50 caracteres'),
  body('config.streamDelaySeconds')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('El delay del stream debe estar entre 0 y 30 segundos')
];

// Validación para parámetros de ruta
const hybridEventIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del evento híbrido debe ser un número entero positivo')
];

// Validación para parámetros de consulta
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('modality')
    .optional()
    .isIn(['presential_only', 'virtual_only', 'hybrid'])
    .withMessage('Modalidad inválida'),
  query('platform')
    .optional()
    .isIn(['zoom', 'google_meet', 'microsoft_teams', 'custom_streaming'])
    .withMessage('Plataforma inválida')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/hybrid-events:
 *   get:
 *     tags: [Hybrid Events]
 *     summary: Listar eventos híbridos
 *     description: Obtiene una lista de eventos híbridos con filtros opcionales
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticated, hybridEventLimiter, queryValidation, hybridEventController.getHybridEvents);

/**
 * @swagger
 * /api/hybrid-events:
 *   post:
 *     tags: [Hybrid Events]
 *     summary: Crear configuración híbrida
 *     description: Configura un evento existente como híbrido
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticated, createEditLimiter, createHybridEventValidation, hybridEventController.createHybridEvent);

/**
 * @swagger
 * /api/hybrid-events/{id}:
 *   get:
 *     tags: [Hybrid Events]
 *     summary: Obtener configuración híbrida
 *     description: Obtiene la configuración híbrida de un evento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authenticated, hybridEventLimiter, hybridEventIdValidation, hybridEventController.getHybridEvent);

/**
 * @swagger
 * /api/hybrid-events/{id}:
 *   put:
 *     tags: [Hybrid Events]
 *     summary: Actualizar configuración híbrida
 *     description: Actualiza la configuración híbrida de un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', authenticated, createEditLimiter, hybridEventIdValidation, updateHybridEventValidation, hybridEventController.updateHybridEvent);

/**
 * @swagger
 * /api/hybrid-events/{id}/config:
 *   get:
 *     tags: [Hybrid Events]
 *     summary: Obtener configuración detallada
 *     description: Obtiene la configuración completa de streaming y plataformas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id/config', authenticated, hybridEventLimiter, hybridEventIdValidation, hybridEventController.getHybridEventConfig);

export default router;
