/**
 * @fileoverview Rutas de Pagos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de pagos y transacciones
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { paymentController } from '../controllers/paymentController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA PAGOS
// ====================================================================

// Rate limiter específico para pagos
const paymentLimiter = rateLimit({
  windowMs: RATE_LIMITS.PAYMENT.windowMs,
  max: RATE_LIMITS.PAYMENT.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de pago. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para iniciar pago
const initiatePaymentValidation = [
  body('registrationId')
    .isInt({ min: 1 })
    .withMessage('ID de inscripción debe ser un número entero positivo'),
  body('gateway')
    .isIn(['paypal', 'stripe', 'neonet', 'bam'])
    .withMessage('Pasarela de pago inválida'),
  body('paymentType')
    .isIn(['one_time', 'recurring', 'installment', 'deposit'])
    .withMessage('Tipo de pago inválido'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Monto debe ser mayor a 0'),
  body('currency')
    .isIn(['GTQ', 'USD'])
    .withMessage('Moneda debe ser GTQ o USD'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
  body('billingInfo.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  body('billingInfo.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres'),
  body('billingInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('billingInfo.phone')
    .optional()
    .matches(/^\+502\s?\d{4}-?\d{4}$/)
    .withMessage('Teléfono debe tener formato guatemalteco (+502 1234-5678)'),
  body('paymentMethod')
    .optional()
    .isObject()
    .withMessage('Método de pago debe ser un objeto')
];

// Validación para parámetros de consulta de historial
const historyQueryValidation = [
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
    .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed', 'expired'])
    .withMessage('Estado de pago inválido'),
  query('gateway')
    .optional()
    .isIn(['paypal', 'stripe', 'neonet', 'bam'])
    .withMessage('Pasarela de pago inválida')
];

// Validación para ID de transacción
const transactionIdValidation = [
  param('transactionId')
    .matches(/^txn_\d+_[a-f0-9]+$/)
    .withMessage('ID de transacción tiene formato inválido')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/payments/process:
 *   post:
 *     tags: [Payments]
 *     summary: Procesar pago
 *     description: Inicia el procesamiento de un pago para una inscripción
 *     security:
 *       - bearerAuth: []
 */
router.post('/process', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.processPayment);

/**
 * @swagger
 * /api/payments/paypal/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago PayPal
 *     description: Crea una orden de pago en PayPal
 *     security:
 *       - bearerAuth: []
 */
router.post('/paypal/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createPayPalPayment);

/**
 * @swagger
 * /api/payments/stripe/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago Stripe
 *     description: Crea un Payment Intent en Stripe
 *     security:
 *       - bearerAuth: []
 */
router.post('/stripe/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createStripePayment);

/**
 * @swagger
 * /api/payments/neonet/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago NeoNet
 *     description: Crea una transacción en NeoNet
 *     security:
 *       - bearerAuth: []
 */
router.post('/neonet/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createNeoNetPayment);

/**
 * @swagger
 * /api/payments/bam/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago BAM
 *     description: Crea una transacción en BAM
 *     security:
 *       - bearerAuth: []
 */
router.post('/bam/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createBamPayment);

/**
 * @swagger
 * /api/payments/{transactionId}/status:
 *   get:
 *     tags: [Payments]
 *     summary: Estado de transacción
 *     description: Obtiene el estado actual de una transacción de pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 */
router.get('/:transactionId/status', authenticated, transactionIdValidation, paymentController.getPaymentStatus);

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     tags: [Payments]
 *     summary: Métodos de pago
 *     description: Obtiene los métodos de pago guardados del usuario
 *     security:
 *       - bearerAuth: []
 */
router.get('/methods', authenticated, paymentController.getPaymentMethods);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     tags: [Payments]
 *     summary: Historial de pagos
 *     description: Obtiene el historial de pagos del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded, disputed, expired]
 *         description: Filtrar por estado
 *       - in: query
 *         name: gateway
 *         schema:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *         description: Filtrar por pasarela
 */
router.get('/history', authenticated, historyQueryValidation, paymentController.getPaymentHistory);

export default router;