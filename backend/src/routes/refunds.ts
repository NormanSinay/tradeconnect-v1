/**
 * @fileoverview Rutas de Reembolsos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de reembolsos
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { refundController } from '../controllers/refundController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA REEMBOLSOS
// ====================================================================

// Rate limiter específico para reembolsos
const refundLimiter = rateLimit({
  windowMs: RATE_LIMITS.PAYMENT.windowMs,
  max: Math.floor(RATE_LIMITS.PAYMENT.max / 2), // Mitad del límite de pagos
  message: {
    success: false,
    message: 'Demasiadas solicitudes de reembolso. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para procesar reembolso
const processRefundValidation = [
  body('transactionId')
    .matches(/^txn_\d+_[a-f0-9]+$/)
    .withMessage('ID de transacción tiene formato inválido'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Monto del reembolso debe ser mayor a 0'),
  body('reason')
    .isIn(['cancelacion_evento', 'duplicado', 'fraudulento', 'error_sistema', 'insatisfaccion', 'otro'])
    .withMessage('Razón de reembolso inválida'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres')
];

// Validación para ID de reembolso
const refundIdValidation = [
  param('refundId')
    .matches(/^ref_\d+_[a-z0-9]+$/)
    .withMessage('ID de reembolso tiene formato inválido')
];

// Validación para ID de pago
const paymentIdValidation = [
  param('paymentId')
    .isInt({ min: 1 })
    .withMessage('ID de pago debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/refunds:
 *   post:
 *     tags: [Refunds]
 *     summary: Procesar reembolso
 *     description: Procesa una solicitud de reembolso para un pago completado
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticated, refundLimiter, processRefundValidation, refundController.processRefund);

/**
 * @swagger
 * /api/refunds/{refundId}:
 *   get:
 *     tags: [Refunds]
 *     summary: Obtener reembolso
 *     description: Obtiene los detalles de un reembolso específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reembolso
 */
router.get('/:refundId', authenticated, refundIdValidation, refundController.getRefund);

/**
 * @swagger
 * /api/refunds/payment/{paymentId}:
 *   get:
 *     tags: [Refunds]
 *     summary: Reembolsos de un pago
 *     description: Obtiene todos los reembolsos asociados a un pago específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago
 */
router.get('/payment/:paymentId', authenticated, paymentIdValidation, refundController.getRefundsByPayment);

/**
 * @swagger
 * /api/refunds/{refundId}/cancel:
 *   post:
 *     tags: [Refunds]
 *     summary: Cancelar reembolso
 *     description: Cancela un reembolso que está pendiente de procesamiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del reembolso
 */
router.post('/:refundId/cancel', authenticated, refundLimiter, refundIdValidation, refundController.cancelRefund);

export default router;