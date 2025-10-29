/**
 * @fileoverview Rutas de Overbooking para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de overbooking
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { overbookingController } from '../controllers/overbookingController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA OVERBOOKING
// ====================================================================

const overbookingLimiter = rateLimit({
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

// Validación para configurar overbooking
const configureOverbookingValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('maxPercentage')
    .isFloat({ min: 0, max: 50 })
    .withMessage('El porcentaje máximo debe estar entre 0 y 50'),
  body('autoActions')
    .optional()
    .isObject()
    .withMessage('Las acciones automáticas deben ser un objeto'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/overbooking/events/{eventId}/status:
 *   get:
 *     tags: [Overbooking]
 *     summary: Obtener estado de overbooking
 *     description: Obtiene el estado actual de overbooking para un evento
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
 *         description: Estado de overbooking obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:eventId/status', authenticated, overbookingLimiter, [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
], overbookingController.getOverbookingStatus);

/**
 * @swagger
 * /api/overbooking/events/{eventId}/overbooking:
 *   post:
 *     tags: [Overbooking]
 *     summary: Configurar overbooking
 *     description: Configura los parámetros de overbooking para un evento
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
 *               - maxPercentage
 *             properties:
 *               maxPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               autoActions:
 *                 type: object
 *                 properties:
 *                   alertAdmins:
 *                     type: boolean
 *                   notifyUsers:
 *                     type: boolean
 *                   offerAlternatives:
 *                     type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Overbooking configurado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:eventId/overbooking', authenticated, createEditLimiter, configureOverbookingValidation, overbookingController.configureOverbooking);

/**
 * @swagger
 * /api/overbooking/events/{eventId}/adjust:
 *   put:
 *     tags: [Overbooking]
 *     summary: Ajustar configuración de overbooking
 *     description: Ajusta dinámicamente los parámetros de overbooking durante el evento
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
 *               maxPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 50
 *               autoActions:
 *                 type: object
 *                 properties:
 *                   alertAdmins:
 *                     type: boolean
 *                   notifyUsers:
 *                     type: boolean
 *                   offerAlternatives:
 *                     type: boolean
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Overbooking ajustado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/events/:eventId/adjust', authenticated, createEditLimiter, configureOverbookingValidation, overbookingController.adjustOverbooking);

export default router;
