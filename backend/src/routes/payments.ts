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
 *     description: Inicia el procesamiento de un pago para una inscripción de evento con validación de seguridad
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *               - gateway
 *               - paymentType
 *               - amount
 *               - currency
 *               - billingInfo
 *             properties:
 *               registrationId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la inscripción al evento
 *                 example: 123
 *               gateway:
 *                 type: string
 *                 enum: [paypal, stripe, neonet, bam]
 *                 description: Pasarela de pago a utilizar
 *                 example: "stripe"
 *               paymentType:
 *                 type: string
 *                 enum: [one_time, recurring, installment, deposit]
 *                 description: Tipo de pago
 *                 example: "one_time"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Monto del pago
 *                 example: 150.00
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *                 description: Moneda del pago
 *                 example: "GTQ"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción opcional del pago
 *                 example: "Inscripción al evento Tech Conference 2023"
 *               billingInfo:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     description: Nombre del pagador
 *                     example: "María"
 *                   lastName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     description: Apellido del pagador
 *                     example: "González"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email del pagador
 *                     example: "maria.gonzalez@email.com"
 *                   phone:
 *                     type: string
 *                     pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                     description: Teléfono guatemalteco (opcional)
 *                     example: "+502 5555-1234"
 *               paymentMethod:
 *                 type: object
 *                 description: Información del método de pago (tarjeta, etc.)
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [card, bank_transfer, digital_wallet]
 *                     example: "card"
 *                   cardNumber:
 *                     type: string
 *                     description: Número de tarjeta (solo para pruebas)
 *                     example: "4111111111111111"
 *                   expiryMonth:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 12
 *                     example: 12
 *                   expiryYear:
 *                     type: integer
 *                     minimum: 2023
 *                     example: 2025
 *                   cvv:
 *                     type: string
 *                     minLength: 3
 *                     maxLength: 4
 *                     example: "123"
 *                   holderName:
 *                     type: string
 *                     example: "MARIA GONZALEZ"
 *           examples:
 *             pago_unico_stripe:
 *               summary: Pago único con Stripe
 *               value:
 *                 registrationId: 123
 *                 gateway: "stripe"
 *                 paymentType: "one_time"
 *                 amount: 150.00
 *                 currency: "GTQ"
 *                 description: "Inscripción al evento Tech Conference 2023"
 *                 billingInfo:
 *                   firstName: "María"
 *                   lastName: "González"
 *                   email: "maria.gonzalez@email.com"
 *                   phone: "+502 5555-1234"
 *                 paymentMethod:
 *                   type: "card"
 *                   cardNumber: "4111111111111111"
 *                   expiryMonth: 12
 *                   expiryYear: 2025
 *                   cvv: "123"
 *                   holderName: "MARIA GONZALEZ"
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pago procesado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       example: "txn_123_abc123def"
 *                     status:
 *                       type: string
 *                       enum: [pending, processing, completed, failed]
 *                       example: "processing"
 *                     gatewayResponse:
 *                       type: object
 *                       description: Respuesta específica de la pasarela
 *                       properties:
 *                         paymentIntentId:
 *                           type: string
 *                           example: "pi_1234567890"
 *                         clientSecret:
 *                           type: string
 *                           example: "pi_1234567890_secret_abc123"
 *                     amount:
 *                       type: number
 *                       example: 150.00
 *                     currency:
 *                       type: string
 *                       example: "GTQ"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T12:00:00.000Z"
 *             examples:
 *               pago_exitoso:
 *                 summary: Pago procesado correctamente
 *                 value:
 *                   success: true
 *                   message: "Pago procesado exitosamente"
 *                   data:
 *                     transactionId: "txn_123_abc123def"
 *                     status: "processing"
 *                     gatewayResponse:
 *                       paymentIntentId: "pi_1234567890"
 *                       clientSecret: "pi_1234567890_secret_abc123"
 *                     amount: 150.00
 *                     currency: "GTQ"
 *                     createdAt: "2023-10-01T12:00:00.000Z"
 *       400:
 *         description: Datos inválidos o pago rechazado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Datos de pago inválidos"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Monto debe ser mayor a 0", "Email inválido"]
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       402:
 *         description: Pago rechazado por la pasarela
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Pago rechazado por la pasarela"
 *                 error:
 *                   type: string
 *                   example: "PAYMENT_DECLINED"
 *                 gatewayError:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "card_declined"
 *                     message:
 *                       type: string
 *                       example: "Your card was declined"
 *       429:
 *         description: Demasiadas solicitudes de pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Demasiadas solicitudes de pago. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-01T12:00:00.000Z"
 */
router.post('/process', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.processPayment);

/**
 * @swagger
 * /api/payments/paypal/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago PayPal
 *     description: Crea una orden de pago en PayPal con validación de seguridad y checksum
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *               - amount
 *               - currency
 *               - billingInfo
 *             properties:
 *               registrationId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la inscripción al evento
 *                 example: 123
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Monto del pago
 *                 example: 150.00
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *                 description: Moneda del pago
 *                 example: "USD"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción del pago
 *                 example: "Inscripción al evento Tech Conference 2023"
 *               billingInfo:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "María"
 *                   lastName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "González"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "maria.gonzalez@email.com"
 *                   phone:
 *                     type: string
 *                     pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                     example: "+502 5555-1234"
 *               checksum:
 *                 type: string
 *                 description: Checksum SHA-256 para validación de integridad
 *                 example: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *           examples:
 *             paypal_payment:
 *               summary: Crear pago PayPal
 *               value:
 *                 registrationId: 123
 *                 amount: 150.00
 *                 currency: "USD"
 *                 description: "Inscripción al evento Tech Conference 2023"
 *                 billingInfo:
 *                   firstName: "María"
 *                   lastName: "González"
 *                   email: "maria.gonzalez@email.com"
 *                   phone: "+502 5555-1234"
 *                 checksum: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *     responses:
 *       201:
 *         description: Orden PayPal creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden PayPal creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       example: "txn_123_paypal123"
 *                     paypalOrderId:
 *                       type: string
 *                       example: "5O190127TN364715T"
 *                     status:
 *                       type: string
 *                       example: "CREATED"
 *                     approvalUrl:
 *                       type: string
 *                       example: "https://www.paypal.com/checkoutnow?token=5O190127TN364715T"
 *                     amount:
 *                       type: number
 *                       example: 150.00
 *                     currency:
 *                       type: string
 *                       example: "USD"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T13:00:00.000Z"
 *             examples:
 *               paypal_order_created:
 *                 summary: Orden PayPal creada
 *                 value:
 *                   success: true
 *                   message: "Orden PayPal creada exitosamente"
 *                   data:
 *                     transactionId: "txn_123_paypal123"
 *                     paypalOrderId: "5O190127TN364715T"
 *                     status: "CREATED"
 *                     approvalUrl: "https://www.paypal.com/checkoutnow?token=5O190127TN364715T"
 *                     amount: 150.00
 *                     currency: "USD"
 *                     expiresAt: "2023-10-01T13:00:00.000Z"
 *       400:
 *         description: Datos inválidos o checksum incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Checksum inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_CHECKSUM"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       500:
 *         description: Error en PayPal API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error al crear orden en PayPal"
 *                 error:
 *                   type: string
 *                   example: "PAYPAL_API_ERROR"
 *                 paypalError:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "INVALID_REQUEST"
 *                     message:
 *                       type: string
 *                       example: "Request is not well-formed"
 */
router.post('/paypal/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createPayPalPayment);

/**
 * @swagger
 * /api/payments/stripe/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago Stripe
 *     description: Crea un Payment Intent en Stripe con validación de firma digital
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *               - amount
 *               - currency
 *               - billingInfo
 *             properties:
 *               registrationId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la inscripción al evento
 *                 example: 123
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Monto en centavos (Stripe usa centavos)
 *                 example: 15000
 *               currency:
 *                 type: string
 *                 enum: [gtq, usd]
 *                 description: Moneda en minúsculas
 *                 example: "usd"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción del pago
 *                 example: "Inscripción al evento Tech Conference 2023"
 *               billingInfo:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "María"
 *                   lastName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "González"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "maria.gonzalez@email.com"
 *                   phone:
 *                     type: string
 *                     pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                     example: "+502 5555-1234"
 *               paymentMethod:
 *                 type: object
 *                 description: Información de método de pago Stripe
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [card]
 *                     example: "card"
 *                   card:
 *                     type: object
 *                     properties:
 *                       number:
 *                         type: string
 *                         example: "4242424242424242"
 *                       exp_month:
 *                         type: integer
 *                         example: 12
 *                       exp_year:
 *                         type: integer
 *                         example: 2025
 *                       cvc:
 *                         type: string
 *                         example: "123"
 *               signature:
 *                 type: string
 *                 description: Firma digital HMAC-SHA256 para validación
 *                 example: "sha256_signature_here"
 *           examples:
 *             stripe_payment_intent:
 *               summary: Crear Payment Intent Stripe
 *               value:
 *                 registrationId: 123
 *                 amount: 15000
 *                 currency: "usd"
 *                 description: "Inscripción al evento Tech Conference 2023"
 *                 billingInfo:
 *                   firstName: "María"
 *                   lastName: "González"
 *                   email: "maria.gonzalez@email.com"
 *                   phone: "+502 5555-1234"
 *                 paymentMethod:
 *                   type: "card"
 *                   card:
 *                     number: "4242424242424242"
 *                     exp_month: 12
 *                     exp_year: 2025
 *                     cvc: "123"
 *                 signature: "sha256_signature_here"
 *     responses:
 *       201:
 *         description: Payment Intent creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment Intent creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       example: "txn_123_stripe123"
 *                     paymentIntentId:
 *                       type: string
 *                       example: "pi_1234567890"
 *                     clientSecret:
 *                       type: string
 *                       example: "pi_1234567890_secret_abc123def"
 *                     status:
 *                       type: string
 *                       example: "requires_payment_method"
 *                     amount:
 *                       type: integer
 *                       example: 15000
 *                     currency:
 *                       type: string
 *                       example: "usd"
 *                     expiresAt:
 *                       type: integer
 *                       description: Timestamp Unix de expiración
 *                       example: 1696166400
 *             examples:
 *               stripe_intent_created:
 *                 summary: Payment Intent creado
 *                 value:
 *                   success: true
 *                   message: "Payment Intent creado exitosamente"
 *                   data:
 *                     transactionId: "txn_123_stripe123"
 *                     paymentIntentId: "pi_1234567890"
 *                     clientSecret: "pi_1234567890_secret_abc123def"
 *                     status: "requires_payment_method"
 *                     amount: 15000
 *                     currency: "usd"
 *                     expiresAt: 1696166400
 *       400:
 *         description: Datos inválidos o firma incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Firma digital inválida"
 *                 error:
 *                   type: string
 *                   example: "INVALID_SIGNATURE"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       500:
 *         description: Error en Stripe API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error al crear Payment Intent en Stripe"
 *                 error:
 *                   type: string
 *                   example: "STRIPE_API_ERROR"
 *                 stripeError:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "api_error"
 *                     message:
 *                       type: string
 *                       example: "Invalid API Key provided"
 */
router.post('/stripe/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createStripePayment);

/**
 * @swagger
 * /api/payments/neonet/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago NeoNet
 *     description: Crea una transacción en NeoNet con validación de firma digital
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *               - amount
 *               - currency
 *               - billingInfo
 *             properties:
 *               registrationId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la inscripción al evento
 *                 example: 123
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Monto del pago
 *                 example: 150.00
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *                 description: Moneda del pago
 *                 example: "GTQ"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción del pago
 *                 example: "Inscripción al evento Tech Conference 2023"
 *               billingInfo:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "María"
 *                   lastName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "González"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "maria.gonzalez@email.com"
 *                   phone:
 *                     type: string
 *                     pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                     example: "+502 5555-1234"
 *               paymentMethod:
 *                 type: object
 *                 description: Información de método de pago NeoNet
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [card, bank_transfer]
 *                     example: "card"
 *                   cardNumber:
 *                     type: string
 *                     example: "4111111111111111"
 *                   expiryMonth:
 *                     type: integer
 *                     example: 12
 *                   expiryYear:
 *                     type: integer
 *                     example: 2025
 *                   cvv:
 *                     type: string
 *                     example: "123"
 *               signature:
 *                 type: string
 *                 description: Firma digital para validación de integridad
 *                 example: "neonet_hmac_signature"
 *           examples:
 *             neonet_transaction:
 *               summary: Crear transacción NeoNet
 *               value:
 *                 registrationId: 123
 *                 amount: 150.00
 *                 currency: "GTQ"
 *                 description: "Inscripción al evento Tech Conference 2023"
 *                 billingInfo:
 *                   firstName: "María"
 *                   lastName: "González"
 *                   email: "maria.gonzalez@email.com"
 *                   phone: "+502 5555-1234"
 *                 paymentMethod:
 *                   type: "card"
 *                   cardNumber: "4111111111111111"
 *                   expiryMonth: 12
 *                   expiryYear: 2025
 *                   cvv: "123"
 *                 signature: "neonet_hmac_signature"
 *     responses:
 *       201:
 *         description: Transacción NeoNet creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transacción NeoNet creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       example: "txn_123_neonet123"
 *                     neonetReference:
 *                       type: string
 *                       example: "NEO123456789"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     redirectUrl:
 *                       type: string
 *                       description: URL para completar el pago
 *                       example: "https://neonet.gt/payment/NEO123456789"
 *                     amount:
 *                       type: number
 *                       example: 150.00
 *                     currency:
 *                       type: string
 *                       example: "GTQ"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T13:00:00.000Z"
 *             examples:
 *               neonet_transaction_created:
 *                 summary: Transacción NeoNet creada
 *                 value:
 *                   success: true
 *                   message: "Transacción NeoNet creada exitosamente"
 *                   data:
 *                     transactionId: "txn_123_neonet123"
 *                     neonetReference: "NEO123456789"
 *                     status: "pending"
 *                     redirectUrl: "https://neonet.gt/payment/NEO123456789"
 *                     amount: 150.00
 *                     currency: "GTQ"
 *                     expiresAt: "2023-10-01T13:00:00.000Z"
 *       400:
 *         description: Datos inválidos o firma incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Firma digital inválida"
 *                 error:
 *                   type: string
 *                   example: "INVALID_SIGNATURE"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       500:
 *         description: Error en NeoNet API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error al crear transacción en NeoNet"
 *                 error:
 *                   type: string
 *                   example: "NEONET_API_ERROR"
 *                 neonetError:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_REQUEST"
 *                     message:
 *                       type: string
 *                       example: "Invalid merchant credentials"
 */
router.post('/neonet/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createNeoNetPayment);

/**
 * @swagger
 * /api/payments/bam/create:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago BAM
 *     description: Crea una transacción en BAM con validación de firma digital
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *               - amount
 *               - currency
 *               - billingInfo
 *             properties:
 *               registrationId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la inscripción al evento
 *                 example: 123
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Monto del pago
 *                 example: 150.00
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *                 description: Moneda del pago
 *                 example: "GTQ"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción del pago
 *                 example: "Inscripción al evento Tech Conference 2023"
 *               billingInfo:
 *                 type: object
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - email
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "María"
 *                   lastName:
 *                     type: string
 *                     minLength: 2
 *                     maxLength: 50
 *                     example: "González"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "maria.gonzalez@email.com"
 *                   phone:
 *                     type: string
 *                     pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                     example: "+502 5555-1234"
 *               paymentMethod:
 *                 type: object
 *                 description: Información de método de pago BAM
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [card, bank_transfer]
 *                     example: "card"
 *                   cardNumber:
 *                     type: string
 *                     example: "4111111111111111"
 *                   expiryMonth:
 *                     type: integer
 *                     example: 12
 *                   expiryYear:
 *                     type: integer
 *                     example: 2025
 *                   cvv:
 *                     type: string
 *                     example: "123"
 *               signature:
 *                 type: string
 *                 description: Firma digital para validación de integridad
 *                 example: "bam_hmac_signature"
 *           examples:
 *             bam_transaction:
 *               summary: Crear transacción BAM
 *               value:
 *                 registrationId: 123
 *                 amount: 150.00
 *                 currency: "GTQ"
 *                 description: "Inscripción al evento Tech Conference 2023"
 *                 billingInfo:
 *                   firstName: "María"
 *                   lastName: "González"
 *                   email: "maria.gonzalez@email.com"
 *                   phone: "+502 5555-1234"
 *                 paymentMethod:
 *                   type: "card"
 *                   cardNumber: "4111111111111111"
 *                   expiryMonth: 12
 *                   expiryYear: 2025
 *                   cvv: "123"
 *                 signature: "bam_hmac_signature"
 *     responses:
 *       201:
 *         description: Transacción BAM creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transacción BAM creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       example: "txn_123_bam123"
 *                     bamReference:
 *                       type: string
 *                       example: "BAM987654321"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     redirectUrl:
 *                       type: string
 *                       description: URL para completar el pago
 *                       example: "https://bam.gt/payment/BAM987654321"
 *                     amount:
 *                       type: number
 *                       example: 150.00
 *                     currency:
 *                       type: string
 *                       example: "GTQ"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T13:00:00.000Z"
 *             examples:
 *               bam_transaction_created:
 *                 summary: Transacción BAM creada
 *                 value:
 *                   success: true
 *                   message: "Transacción BAM creada exitosamente"
 *                   data:
 *                     transactionId: "txn_123_bam123"
 *                     bamReference: "BAM987654321"
 *                     status: "pending"
 *                     redirectUrl: "https://bam.gt/payment/BAM987654321"
 *                     amount: 150.00
 *                     currency: "GTQ"
 *                     expiresAt: "2023-10-01T13:00:00.000Z"
 *       400:
 *         description: Datos inválidos o firma incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Firma digital inválida"
 *                 error:
 *                   type: string
 *                   example: "INVALID_SIGNATURE"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       500:
 *         description: Error en BAM API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error al crear transacción en BAM"
 *                 error:
 *                   type: string
 *                   example: "BAM_API_ERROR"
 *                 bamError:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "INVALID_REQUEST"
 *                     message:
 *                       type: string
 *                       example: "Invalid merchant credentials"
 */
router.post('/bam/create', authenticated, paymentLimiter, initiatePaymentValidation, paymentController.createBamPayment);

/**
 * @swagger
 * /api/payments/{transactionId}/status:
 *   get:
 *     tags: [Payments]
 *     summary: Estado de transacción
 *     description: Obtiene el estado actual detallado de una transacción de pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^txn_\\d+_[a-f0-9]+$'
 *         description: ID único de la transacción
 *         example: "txn_123_abc123def"
 *     responses:
 *       200:
 *         description: Estado de transacción obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estado de transacción obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       example: "txn_123_abc123def"
 *                     status:
 *                       type: string
 *                       enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded, disputed, expired]
 *                       example: "completed"
 *                     gateway:
 *                       type: string
 *                       enum: [paypal, stripe, neonet, bam]
 *                       example: "stripe"
 *                     amount:
 *                       type: number
 *                       example: 150.00
 *                     currency:
 *                       type: string
 *                       example: "GTQ"
 *                     gatewayResponse:
 *                       type: object
 *                       description: Respuesta específica de la pasarela
 *                       properties:
 *                         paymentIntentId:
 *                           type: string
 *                           example: "pi_1234567890"
 *                         chargeId:
 *                           type: string
 *                           example: "ch_1234567890"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T12:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T12:05:00.000Z"
 *             examples:
 *               status_completed:
 *                 summary: Transacción completada
 *                 value:
 *                   success: true
 *                   message: "Estado de transacción obtenido exitosamente"
 *                   data:
 *                     transactionId: "txn_123_abc123def"
 *                     status: "completed"
 *                     gateway: "stripe"
 *                     amount: 150.00
 *                     currency: "GTQ"
 *                     gatewayResponse:
 *                       paymentIntentId: "pi_1234567890"
 *                       chargeId: "ch_1234567890"
 *                     createdAt: "2023-10-01T12:00:00.000Z"
 *                     updatedAt: "2023-10-01T12:05:00.000Z"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       403:
 *         description: Acceso denegado a la transacción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No tienes acceso a esta transacción"
 *                 error:
 *                   type: string
 *                   example: "ACCESS_DENIED"
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Transacción no encontrada"
 *                 error:
 *                   type: string
 *                   example: "TRANSACTION_NOT_FOUND"
 */
router.get('/:transactionId/status', authenticated, transactionIdValidation, paymentController.getPaymentStatus);

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     tags: [Payments]
 *     summary: Métodos de pago guardados
 *     description: Obtiene los métodos de pago guardados y tokenizados del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métodos de pago obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Métodos de pago obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentMethods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "pm_1234567890"
 *                           gateway:
 *                             type: string
 *                             enum: [paypal, stripe, neonet, bam]
 *                             example: "stripe"
 *                           type:
 *                             type: string
 *                             enum: [card, bank_account, digital_wallet]
 *                             example: "card"
 *                           lastFour:
 *                             type: string
 *                             description: Últimos 4 dígitos de la tarjeta
 *                             example: "4242"
 *                           brand:
 *                             type: string
 *                             example: "visa"
 *                           expiryMonth:
 *                             type: integer
 *                             example: 12
 *                           expiryYear:
 *                             type: integer
 *                             example: 2025
 *                           isDefault:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-09-01T10:00:00.000Z"
 *                     totalMethods:
 *                       type: integer
 *                       example: 2
 *             examples:
 *               payment_methods_list:
 *                 summary: Lista de métodos de pago
 *                 value:
 *                   success: true
 *                   message: "Métodos de pago obtenidos exitosamente"
 *                   data:
 *                     paymentMethods:
 *                       - id: "pm_1234567890"
 *                         gateway: "stripe"
 *                         type: "card"
 *                         lastFour: "4242"
 *                         brand: "visa"
 *                         expiryMonth: 12
 *                         expiryYear: 2025
 *                         isDefault: true
 *                         createdAt: "2023-09-01T10:00:00.000Z"
 *                       - id: "pm_0987654321"
 *                         gateway: "paypal"
 *                         type: "digital_wallet"
 *                         lastFour: null
 *                         brand: "paypal"
 *                         expiryMonth: null
 *                         expiryYear: null
 *                         isDefault: false
 *                         createdAt: "2023-08-15T14:30:00.000Z"
 *                     totalMethods: 2
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_SERVER_ERROR"
 */
router.get('/methods', authenticated, paymentController.getPaymentMethods);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     tags: [Payments]
 *     summary: Historial de pagos
 *     description: Obtiene el historial paginado de transacciones del usuario autenticado con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de elementos por página
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded, disputed, expired]
 *         description: Filtrar transacciones por estado
 *         example: "completed"
 *       - in: query
 *         name: gateway
 *         schema:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *         description: Filtrar transacciones por pasarela de pago
 *         example: "stripe"
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial para filtrar (YYYY-MM-DD)
 *         example: "2023-09-01"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final para filtrar (YYYY-MM-DD)
 *         example: "2023-10-01"
 *     responses:
 *       200:
 *         description: Historial de pagos obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Historial de pagos obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           transactionId:
 *                             type: string
 *                             example: "txn_123_abc123def"
 *                           registrationId:
 *                             type: integer
 *                             example: 123
 *                           status:
 *                             type: string
 *                             enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded, disputed, expired]
 *                             example: "completed"
 *                           gateway:
 *                             type: string
 *                             enum: [paypal, stripe, neonet, bam]
 *                             example: "stripe"
 *                           amount:
 *                             type: number
 *                             example: 150.00
 *                           currency:
 *                             type: string
 *                             example: "GTQ"
 *                           description:
 *                             type: string
 *                             example: "Inscripción al evento Tech Conference 2023"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T12:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T12:05:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *             examples:
 *               payment_history:
 *                 summary: Historial de pagos
 *                 value:
 *                   success: true
 *                   message: "Historial de pagos obtenido exitosamente"
 *                   data:
 *                     transactions:
 *                       - transactionId: "txn_123_abc123def"
 *                         registrationId: 123
 *                         status: "completed"
 *                         gateway: "stripe"
 *                         amount: 150.00
 *                         currency: "GTQ"
 *                         description: "Inscripción al evento Tech Conference 2023"
 *                         createdAt: "2023-10-01T12:00:00.000Z"
 *                         updatedAt: "2023-10-01T12:05:00.000Z"
 *                       - transactionId: "txn_124_def456ghi"
 *                         registrationId: 124
 *                         status: "pending"
 *                         gateway: "paypal"
 *                         amount: 200.00
 *                         currency: "USD"
 *                         description: "Inscripción al workshop de IA"
 *                         createdAt: "2023-09-28T10:30:00.000Z"
 *                         updatedAt: "2023-09-28T10:30:00.000Z"
 *                     pagination:
 *                       page: 1
 *                       limit: 20
 *                       total: 45
 *                       totalPages: 3
 *                       hasNext: true
 *                       hasPrev: false
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 */
router.get('/history', authenticated, historyQueryValidation, paymentController.getPaymentHistory);

export default router;