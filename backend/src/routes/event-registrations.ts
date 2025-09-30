/**
 * @fileoverview Rutas de Inscripciones a Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de inscripciones a eventos
 *
 * Archivo: backend/src/routes/event-registrations.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { EventRegistrationController } from '../controllers/eventRegistrationController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA INSCRIPCIONES
// ====================================================================

// Rate limiter para operaciones de registro
const registrationLimiter = rateLimit({
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

// Rate limiter específico para registro a eventos
const eventRegistrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 registros por usuario cada 15 minutos
  message: {
    success: false,
    message: 'Demasiados intentos de registro. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para registro a evento
const registerValidation = [
  body('registrationData')
    .optional()
    .isObject()
    .withMessage('Los datos de registro deben ser un objeto'),
  body('paymentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto de pago debe ser un número positivo')
];

// Validación para cancelación
const cancelValidation = [
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La razón no puede exceder 500 caracteres')
];

// Validación para actualización (admin)
const updateValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'attended', 'no_show'])
    .withMessage('Estado de inscripción inválido'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'refunded', 'cancelled'])
    .withMessage('Estado de pago inválido'),
  body('paymentReference')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La referencia de pago no puede exceder 255 caracteres'),
  body('cancellationReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La razón de cancelación no puede exceder 500 caracteres')
];

// Validación para parámetros de consulta
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'attended', 'no_show'])
    .withMessage('Estado de inscripción inválido'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'refunded', 'cancelled'])
    .withMessage('Estado de pago inválido'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Búsqueda debe tener entre 2 y 100 caracteres')
];

// Validación para parámetros de ruta
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
];

const eventIdValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('ID de evento debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

// ====================================================================
// GESTIÓN DE INSCRIPCIONES POR USUARIO
// ====================================================================

/**
 * @swagger
 * /api/event-registrations/my:
 *   get:
 *     tags: [Event Registrations]
 *     summary: Obtener mis inscripciones
 *     description: Obtiene lista paginada de inscripciones del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, attended, no_show]
 *         description: Filtrar por estado
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, refunded, cancelled]
 *         description: Filtrar por estado de pago
 */
router.get('/my',
  authenticated,
  registrationLimiter,
  queryValidation,
  EventRegistrationController.getUserRegistrations
);

/**
 * @swagger
 * /api/event-registrations/check/{eventId}:
 *   get:
 *     tags: [Event Registrations]
 *     summary: Verificar inscripción en evento
 *     description: Verifica si el usuario está inscrito en un evento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 */
router.get('/check/:eventId',
  authenticated,
  registrationLimiter,
  eventIdValidation,
  EventRegistrationController.checkUserRegistration
);

// ====================================================================
// GESTIÓN DE INSCRIPCIONES A EVENTOS
// ====================================================================

/**
 * @swagger
 * /api/event-registrations/events/{eventId}/register:
 *   post:
 *     tags: [Event Registrations]
 *     summary: Registrarse a evento
 *     description: Registra al usuario autenticado en un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registrationData:
 *                 type: object
 *                 description: Datos adicionales de registro
 *               paymentAmount:
 *                 type: number
 *                 description: Monto de pago (opcional)
 */
router.post('/events/:eventId/register',
  authenticated,
  eventRegistrationLimiter,
  eventIdValidation,
  registerValidation,
  EventRegistrationController.registerToEvent
);

/**
 * @swagger
 * /api/event-registrations/{id}/cancel:
 *   post:
 *     tags: [Event Registrations]
 *     summary: Cancelar inscripción
 *     description: Cancela la inscripción del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón de cancelación
 */
router.post('/:id/cancel',
  authenticated,
  registrationLimiter,
  idValidation,
  cancelValidation,
  EventRegistrationController.cancelRegistration
);

/**
 * @swagger
 * /api/event-registrations/{id}/checkin:
 *   post:
 *     tags: [Event Registrations]
 *     summary: Check-in al evento
 *     description: Realiza check-in del usuario en el evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 */
router.post('/:id/checkin',
  authenticated,
  registrationLimiter,
  idValidation,
  EventRegistrationController.checkIn
);

/**
 * @swagger
 * /api/event-registrations/{id}/checkout:
 *   post:
 *     tags: [Event Registrations]
 *     summary: Check-out del evento
 *     description: Realiza check-out del usuario del evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 */
router.post('/:id/checkout',
  authenticated,
  registrationLimiter,
  idValidation,
  EventRegistrationController.checkOut
);

// ====================================================================
// GESTIÓN ADMINISTRATIVA DE INSCRIPCIONES
// ====================================================================

/**
 * @swagger
 * /api/event-registrations/{id}:
 *   get:
 *     tags: [Event Registrations]
 *     summary: Obtener inscripción por ID
 *     description: Obtiene detalles de una inscripción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 */
router.get('/:id',
  authenticated,
  registrationLimiter,
  idValidation,
  EventRegistrationController.getRegistrationById
);

/**
 * @swagger
 * /api/event-registrations/{id}:
 *   put:
 *     tags: [Event Registrations]
 *     summary: Actualizar inscripción (admin)
 *     description: Actualiza el estado de una inscripción (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, attended, no_show]
 *                 description: Nuevo estado de la inscripción
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, refunded, cancelled]
 *                 description: Nuevo estado de pago
 *               paymentReference:
 *                 type: string
 *                 description: Referencia de pago
 *               cancellationReason:
 *                 type: string
 *                 description: Razón de cancelación
 */
router.put('/:id',
  authenticated,
  registrationLimiter,
  idValidation,
  updateValidation,
  EventRegistrationController.updateRegistration
);

/**
 * @swagger
 * /api/event-registrations/events/{eventId}:
 *   get:
 *     tags: [Event Registrations]
 *     summary: Obtener inscripciones de evento (admin)
 *     description: Obtiene lista de inscripciones de un evento (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, attended, no_show]
 *         description: Filtrar por estado
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, refunded, cancelled]
 *         description: Filtrar por estado de pago
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o email
 */
router.get('/events/:eventId',
  authenticated,
  registrationLimiter,
  eventIdValidation,
  queryValidation,
  EventRegistrationController.getEventRegistrations
);

/**
 * @swagger
 * /api/event-registrations/events/{eventId}/stats:
 *   get:
 *     tags: [Event Registrations]
 *     summary: Obtener estadísticas de evento
 *     description: Obtiene estadísticas de inscripciones de un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 */
router.get('/events/:eventId/stats',
  authenticated,
  registrationLimiter,
  eventIdValidation,
  EventRegistrationController.getEventStats
);

export default router;