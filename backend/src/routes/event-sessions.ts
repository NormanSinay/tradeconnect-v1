/**
 * @fileoverview Rutas de Sesiones de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de sesiones de eventos
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { eventSessionController } from '../controllers/eventSessionController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA SESIONES DE EVENTOS
// ====================================================================

// Rate limiter general para operaciones de sesiones
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

// Rate limiter específico para operaciones de creación/edición
const createEditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 operaciones por ventana
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

// Validación para crear sesión de evento
const createEventSessionValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('sessionType')
    .isIn(['date', 'time_slot', 'workshop', 'track', 'other'])
    .withMessage('Tipo de sesión inválido'),
  body('startDate')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La fecha de inicio debe ser futura');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('La capacidad debe estar entre 1 y 100,000'),
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La ubicación no puede exceder 500 caracteres'),
  body('virtualLocation')
    .optional()
    .isURL()
    .withMessage('El enlace virtual debe ser una URL válida'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual debe ser un valor booleano'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los requisitos no pueden exceder 1000 caracteres')
];

// Validación para actualizar sesión de evento
const updateEventSessionValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('El ID de la sesión debe ser un número entero positivo'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('sessionType')
    .optional()
    .isIn(['date', 'time_slot', 'workshop', 'track', 'other'])
    .withMessage('Tipo de sesión inválido'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('La fecha de inicio debe ser futura');
      }
      return true;
    }),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('La capacidad debe estar entre 1 y 100,000'),
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La ubicación no puede exceder 500 caracteres'),
  body('virtualLocation')
    .optional()
    .isURL()
    .withMessage('El enlace virtual debe ser una URL válida'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual debe ser un valor booleano'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los requisitos no pueden exceder 1000 caracteres')
];

// Validación para parámetros de ruta
const eventIdValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
];

const sessionIdValidation = [
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('El ID de la sesión debe ser un número entero positivo')
];

// Validación para bloquear/liberar capacidad
const capacityOperationValidation = [
  ...eventIdValidation,
  ...sessionIdValidation,
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo')
];

const blockCapacityValidation = [
  ...capacityOperationValidation,
  body('blockDurationMinutes')
    .optional()
    .isInt({ min: 5, max: 60 })
    .withMessage('La duración del bloqueo debe estar entre 5 y 60 minutos')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/events/{eventId}/sessions:
 *   post:
 *     tags: [Event Sessions]
 *     summary: Crear sesión de evento
 *     description: Crea una nueva sesión para un evento específico
 *     security:
 *       - bearerAuth: []
 */
router.post('/:eventId/sessions',
  authenticated,
  createEditLimiter,
  createEventSessionValidation,
  eventSessionController.createEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Listar sesiones de evento
 *     description: Obtiene todas las sesiones de un evento específico
 */
router.get('/:eventId/sessions',
  sessionLimiter,
  eventIdValidation,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
    query('sessionType').optional().isIn(['date', 'time_slot', 'workshop', 'track', 'other']).withMessage('Tipo de sesión inválido'),
    query('isActive').optional().isBoolean().withMessage('isActive debe ser un valor booleano'),
    query('isVirtual').optional().isBoolean().withMessage('isVirtual debe ser un valor booleano'),
    query('hasCapacity').optional().isBoolean().withMessage('hasCapacity debe ser un valor booleano'),
    query('sortBy').optional().isIn(['startDate', 'endDate', 'title', 'capacity', 'createdAt']).withMessage('Campo de ordenamiento inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Orden inválido')
  ],
  eventSessionController.getEventSessions
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Obtener sesión específica
 *     description: Obtiene los detalles de una sesión específica
 */
router.get('/:eventId/sessions/:sessionId',
  sessionLimiter,
  [...eventIdValidation, ...sessionIdValidation],
  eventSessionController.getEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}:
 *   put:
 *     tags: [Event Sessions]
 *     summary: Actualizar sesión
 *     description: Actualiza la información de una sesión específica
 *     security:
 *       - bearerAuth: []
 */
router.put('/:eventId/sessions/:sessionId',
  authenticated,
  createEditLimiter,
  updateEventSessionValidation,
  eventSessionController.updateEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}:
 *   delete:
 *     tags: [Event Sessions]
 *     summary: Eliminar sesión
 *     description: Elimina una sesión de evento (soft delete)
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:eventId/sessions/:sessionId',
  authenticated,
  sessionLimiter,
  [...eventIdValidation, ...sessionIdValidation],
  eventSessionController.deleteEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}/availability:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Verificar disponibilidad
 *     description: Verifica la disponibilidad de capacidad para una sesión
 */
router.get('/:eventId/sessions/:sessionId/availability',
  sessionLimiter,
  [...eventIdValidation, ...sessionIdValidation],
  [
    query('quantity').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo')
  ],
  eventSessionController.checkSessionAvailability
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}/block:
 *   post:
 *     tags: [Event Sessions]
 *     summary: Bloquear capacidad
 *     description: Bloquea capacidad temporalmente para una sesión
 *     security:
 *       - bearerAuth: []
 */
router.post('/:eventId/sessions/:sessionId/block',
  authenticated,
  sessionLimiter,
  blockCapacityValidation,
  eventSessionController.blockSessionCapacity
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}/release:
 *   post:
 *     tags: [Event Sessions]
 *     summary: Liberar capacidad
 *     description: Libera capacidad bloqueada de una sesión
 *     security:
 *       - bearerAuth: []
 */
router.post('/:eventId/sessions/:sessionId/release',
  authenticated,
  sessionLimiter,
  capacityOperationValidation,
  eventSessionController.releaseBlockedCapacity
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/stats:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Estadísticas de sesiones
 *     description: Obtiene estadísticas generales de las sesiones de un evento
 */
router.get('/:eventId/sessions/stats',
  sessionLimiter,
  eventIdValidation,
  eventSessionController.getEventSessionsStats
);

export default router;