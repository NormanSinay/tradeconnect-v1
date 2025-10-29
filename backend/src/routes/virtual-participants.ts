/**
 * @fileoverview Rutas de Participantes Virtuales para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de participantes virtuales
 *
 * Archivo: backend/src/routes/virtual-participants.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { virtualParticipantController } from '../controllers/virtualParticipantController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA PARTICIPANTES VIRTUALES
// ====================================================================

// Rate limiter general para operaciones de participantes virtuales
const virtualParticipantLimiter = rateLimit({
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

// Rate limiter específico para operaciones de participación (join/leave)
const participationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 operaciones por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de participación. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para unirse a evento virtual
const joinVirtualEventValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('roomId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la sala debe ser un número entero positivo'),
  body('userAgent')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El user agent no puede exceder 500 caracteres')
];

// Validación para actualizar estado de participante
const updateParticipantStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del participante debe ser un número entero positivo'),
  body('status')
    .isIn(['invited', 'joined', 'left', 'removed', 'blocked'])
    .withMessage('El estado debe ser: invited, joined, left, removed o blocked'),
  body('reason')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('La razón debe tener entre 10 y 500 caracteres')
];

// Validación para parámetros de evento
const eventIdValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
];

// Validación para parámetros de participante
const participantIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del participante debe ser un número entero positivo')
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
  query('status')
    .optional()
    .isIn(['invited', 'joined', 'left', 'removed', 'blocked'])
    .withMessage('Estado inválido'),
  query('roomId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la sala debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/virtual-participants/events/{eventId}/join:
 *   post:
 *     tags: [Virtual Participants]
 *     summary: Unirse a evento virtual
 *     description: Registra la participación de un usuario en un evento virtual
 *     security:
 *       - bearerAuth: []
 */
router.post('/events/:eventId/join', authenticated, participationLimiter, joinVirtualEventValidation, virtualParticipantController.joinVirtualEvent);

/**
 * @swagger
 * /api/virtual-participants/events/{eventId}/leave:
 *   post:
 *     tags: [Virtual Participants]
 *     summary: Salir de evento virtual
 *     description: Registra la salida de un participante de un evento virtual
 *     security:
 *       - bearerAuth: []
 */
router.post('/events/:eventId/leave', authenticated, participationLimiter, eventIdValidation, virtualParticipantController.leaveVirtualEvent);

/**
 * @swagger
 * /api/virtual-participants/events/{eventId}/access:
 *   get:
 *     tags: [Virtual Participants]
 *     summary: Obtener acceso virtual
 *     description: Obtiene el token y URLs de acceso para un participante virtual
 *     security:
 *       - bearerAuth: []
 */
router.get('/events/:eventId/access', authenticated, virtualParticipantLimiter, eventIdValidation, virtualParticipantController.getVirtualAccess);

/**
 * @swagger
 * /api/virtual-participants/events/{eventId}/participants:
 *   get:
 *     tags: [Virtual Participants]
 *     summary: Listar participantes virtuales
 *     description: Obtiene la lista de participantes activos en un evento virtual
 *     security:
 *       - bearerAuth: []
 */
router.get('/events/:eventId/participants', authenticated, virtualParticipantLimiter, [...eventIdValidation, ...queryValidation], virtualParticipantController.getVirtualParticipants);

/**
 * @swagger
 * /api/virtual-participants/{id}/status:
 *   put:
 *     tags: [Virtual Participants]
 *     summary: Actualizar estado de participante
 *     description: Actualiza el estado de un participante virtual (solo moderadores)
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', authenticated, virtualParticipantLimiter, updateParticipantStatusValidation, virtualParticipantController.updateParticipantStatus);

export default router;
