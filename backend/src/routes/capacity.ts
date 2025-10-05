/**
 * @fileoverview Rutas de Capacidades para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de capacidades
 */

import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { capacityController } from '../controllers/capacityController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA CAPACIDADES
// ====================================================================

const capacityLimiter = rateLimit({
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

// Validación para configurar capacidad
const configureCapacityValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('totalCapacity')
    .isInt({ min: 1 })
    .withMessage('La capacidad total debe ser un número entero positivo'),
  body('overbookingPercentage')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('El porcentaje de overbooking debe estar entre 0 y 50'),
  body('overbookingEnabled')
    .optional()
    .isBoolean()
    .withMessage('overbookingEnabled debe ser un valor booleano'),
  body('waitlistEnabled')
    .optional()
    .isBoolean()
    .withMessage('waitlistEnabled debe ser un valor booleano'),
  body('lockTimeoutMinutes')
    .optional()
    .isInt({ min: 5, max: 60 })
    .withMessage('El tiempo de bloqueo debe estar entre 5 y 60 minutos')
];

// Validación para reservar capacidad
const reserveCapacityValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La cantidad debe estar entre 1 y 50'),
  body('accessTypeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del tipo de acceso debe ser un número entero positivo'),
  body('sessionId')
    .isString()
    .notEmpty()
    .withMessage('El ID de sesión es requerido')
];

// Validación para confirmar reserva
const confirmReservationValidation = [
  param('lockId')
    .isString()
    .notEmpty()
    .withMessage('El ID del bloqueo es requerido'),
  body('registrationId')
    .isInt({ min: 1 })
    .withMessage('El ID de la inscripción debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/capacity/events/{eventId}:
 *   get:
 *     tags: [Capacity]
 *     summary: Obtener capacidad del evento
 *     description: Obtiene la configuración y estado actual de capacidad de un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Capacidad obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:eventId', authenticated, capacityLimiter, [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
], capacityController.getCapacityStatus);

/**
 * @swagger
 * /api/capacity/events/{eventId}/configure:
 *   post:
 *     tags: [Capacity]
 *     summary: Configurar capacidad del evento
 *     description: Configura la capacidad total y parámetros de un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalCapacity
 *             properties:
 *               totalCapacity:
 *                 type: integer
 *                 minimum: 1
 *               overbookingPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               overbookingEnabled:
 *                 type: boolean
 *               waitlistEnabled:
 *                 type: boolean
 *               lockTimeoutMinutes:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 60
 *     responses:
 *       200:
 *         description: Capacidad configurada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:eventId/configure', authenticated, createEditLimiter, configureCapacityValidation, capacityController.configureCapacity);

/**
 * @swagger
 * /api/capacity/events/{eventId}/update:
 *   put:
 *     tags: [Capacity]
 *     summary: Actualizar configuración de capacidad
 *     description: Actualiza la configuración de capacidad de un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalCapacity:
 *                 type: integer
 *                 minimum: 1
 *               overbookingPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               overbookingEnabled:
 *                 type: boolean
 *               waitlistEnabled:
 *                 type: boolean
 *               lockTimeoutMinutes:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 60
 *     responses:
 *       200:
 *         description: Capacidad actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/events/:eventId/update', authenticated, createEditLimiter, configureCapacityValidation, capacityController.configureCapacity);

/**
 * @swagger
 * /api/capacity/events/{eventId}/real-time:
 *   get:
 *     tags: [Capacity]
 *     summary: Estado de capacidad en tiempo real
 *     description: Obtiene el estado actualizado de capacidad para vistas en tiempo real
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:eventId/real-time', authenticated, capacityLimiter, [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
], capacityController.getCapacityStatus);

/**
 * @swagger
 * /api/capacity/events/{eventId}/statistics:
 *   get:
 *     tags: [Capacity]
 *     summary: Estadísticas de ocupación
 *     description: Obtiene estadísticas detalladas de ocupación del evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:eventId/statistics', authenticated, capacityLimiter, [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
], capacityController.getCapacityReport);

/**
 * @swagger
 * /api/capacity/events/{eventId}/validate:
 *   get:
 *     tags: [Capacity]
 *     summary: Validar disponibilidad
 *     description: Valida si hay capacidad disponible para una cantidad específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: accessTypeId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Validación completada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:eventId/validate', authenticated, capacityLimiter, [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  query('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La cantidad debe estar entre 1 y 50'),
  query('accessTypeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del tipo de acceso debe ser un número entero positivo')
], capacityController.validateCapacity);

/**
 * @swagger
 * /api/capacity/events/{eventId}/reserve:
 *   post:
 *     tags: [Capacity]
 *     summary: Reservar capacidad
 *     description: Reserva temporalmente capacidad para un proceso de inscripción
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 1
 *               accessTypeId:
 *                 type: integer
 *               sessionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Capacidad reservada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Capacidad insuficiente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:eventId/reserve', authenticated, createEditLimiter, reserveCapacityValidation, capacityController.reserveCapacity);

/**
 * @swagger
 * /api/capacity/reservations/{lockId}/confirm:
 *   post:
 *     tags: [Capacity]
 *     summary: Confirmar reserva
 *     description: Confirma una reserva de capacidad convirtiéndola en inscripción definitiva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lockId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *             properties:
 *               registrationId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Reserva confirmada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       410:
 *         description: Reserva expirada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/reservations/:lockId/confirm', authenticated, capacityLimiter, confirmReservationValidation, capacityController.confirmReservation);

/**
 * @swagger
 * /api/capacity/reservations/{lockId}/release:
 *   post:
 *     tags: [Capacity]
 *     summary: Liberar reserva
 *     description: Libera una reserva de capacidad expirada o cancelada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lockId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reserva liberada exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/reservations/:lockId/release', authenticated, capacityLimiter, [
  param('lockId')
    .isString()
    .notEmpty()
    .withMessage('El ID del bloqueo es requerido')
], capacityController.releaseReservation);

/**
 * @swagger
 * /api/capacity/events/{eventId}/rules:
 *   post:
 *     tags: [Capacity]
 *     summary: Crear regla de capacidad
 *     description: Crea una regla específica para el control de capacidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [GLOBAL, DATE_SPECIFIC, SESSION_SPECIFIC, ACCESS_TYPE_SPECIFIC]
 *               conditions:
 *                 type: object
 *               actions:
 *                 type: object
 *     responses:
 *       201:
 *         description: Regla creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:eventId/rules', authenticated, createEditLimiter, [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('name')
    .isString()
    .notEmpty()
    .withMessage('El nombre de la regla es requerido'),
  body('type')
    .isIn(['GLOBAL', 'DATE_SPECIFIC', 'SESSION_SPECIFIC', 'ACCESS_TYPE_SPECIFIC'])
    .withMessage('Tipo de regla inválido')
], (req: Request, res: Response) => {
  // TODO: Implementar controlador para reglas
  res.status(501).json({
    success: false,
    message: 'Funcionalidad de reglas en desarrollo',
    error: 'NOT_IMPLEMENTED',
    timestamp: new Date().toISOString()
  });
});

export default router;