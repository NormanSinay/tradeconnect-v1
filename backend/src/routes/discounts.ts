/**
 * @fileoverview Rutas de Descuentos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de descuentos
 *
 * Archivo: backend/src/routes/discounts.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { discountController } from '../controllers/discountController';
import { authenticateToken } from '../middleware/auth';
import { promoCodeLimiter } from '../middleware/rateLimiting';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ====================================================================
// DESCUESTOS POR VOLUMEN
// ====================================================================

/**
 * @swagger
 * /api/discounts/volume/{eventId}:
 *   get:
 *     tags: [Discounts]
 *     summary: Obtener descuentos por volumen de un evento
 *     description: Obtiene todos los descuentos por volumen configurados para un evento específico
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Descuentos por volumen obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         discounts:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/VolumeDiscount'
 *                         nextTier:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             minQuantity:
 *                               type: integer
 *                             discountPercentage:
 *                               type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/volume/:eventId',
  [
    param('eventId').isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    query('isActive').optional().isBoolean().withMessage('isActive debe ser un valor booleano')
  ],
  discountController.getVolumeDiscountsByEvent.bind(discountController)
);

// ====================================================================
// DESCUESTOS EARLY BIRD
// ====================================================================

/**
 * @swagger
 * /api/discounts/early-bird/{eventId}:
 *   get:
 *     tags: [Discounts]
 *     summary: Obtener descuentos early bird de un evento
 *     description: Obtiene todos los descuentos early bird configurados para un evento específico
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
 *         name: registrationDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de registro para calcular descuento aplicable
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Descuentos early bird obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         discounts:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/EarlyBirdDiscount'
 *                         applicableDiscount:
 *                           $ref: '#/components/schemas/EarlyBirdDiscount'
 *                         daysUntilEvent:
 *                           type: integer
 *                           nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/early-bird/:eventId',
  [
    param('eventId').isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    query('registrationDate').optional().isISO8601().withMessage('Fecha de registro debe tener formato ISO 8601'),
    query('isActive').optional().isBoolean().withMessage('isActive debe ser un valor booleano')
  ],
  discountController.getEarlyBirdDiscountsByEvent.bind(discountController)
);

// ====================================================================
// VALIDACIÓN Y APLICACIÓN DE CÓDIGOS PROMOCIONALES
// ====================================================================

/**
 * @swagger
 * /api/discounts/validate-code:
 *   post:
 *     tags: [Discounts]
 *     summary: Validar código promocional
 *     description: Valida un código promocional antes de aplicarlo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidatePromoCodeRequest'
 *     responses:
 *       200:
 *         description: Código validado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ValidatePromoCodeResponse'
 *       400:
 *         description: Código inválido o datos incorrectos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         description: Demasiados intentos de validación
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/validate-code',
  promoCodeLimiter, // Rate limiting específico para códigos promocionales
  [
    body('code')
      .isLength({ min: 4, max: 50 })
      .withMessage('Código debe tener entre 4 y 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/i)
      .withMessage('Código solo puede contener letras, números, guiones y guiones bajos'),
    body('eventId').isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    body('userId').optional().isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo'),
    body('cartTotal').optional().isFloat({ min: 0 }).withMessage('Total del carrito debe ser un número positivo')
  ],
  discountController.validatePromoCode.bind(discountController)
);

/**
 * @swagger
 * /api/discounts/apply:
 *   post:
 *     tags: [Discounts]
 *     summary: Aplicar código promocional
 *     description: Aplica un código promocional a una compra
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyPromoCodeRequest'
 *     responses:
 *       200:
 *         description: Código aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         discountAmount:
 *                           type: number
 *                           description: Monto del descuento aplicado
 *                         finalAmount:
 *                           type: number
 *                           description: Monto final después del descuento
 *                         promoCode:
 *                           $ref: '#/components/schemas/PromoCode'
 *                         usageId:
 *                           type: integer
 *                           description: ID del registro de uso
 *       400:
 *         description: Código inválido o no se puede aplicar
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         description: Demasiados intentos de aplicación
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/apply',
  promoCodeLimiter, // Rate limiting específico para códigos promocionales
  [
    body('code')
      .isLength({ min: 4, max: 50 })
      .withMessage('Código debe tener entre 4 y 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/i)
      .withMessage('Código solo puede contener letras, números, guiones y guiones bajos'),
    body('eventId').isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    body('cartTotal').isFloat({ min: 0 }).withMessage('Total del carrito debe ser un número positivo'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Cantidad debe ser un número entero positivo')
  ],
  discountController.applyPromoCode.bind(discountController)
);

// ====================================================================
// CÁLCULO DE DESCUESTOS APLICABLES
// ====================================================================

/**
 * @swagger
 * /api/discounts/applicable:
 *   post:
 *     tags: [Discounts]
 *     summary: Calcular descuentos aplicables
 *     description: Calcula todos los descuentos aplicables para una compra específica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicableDiscountsRequest'
 *     responses:
 *       200:
 *         description: Descuentos calculados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ApplicableDiscountsResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/applicable',
  [
    body('eventId').isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser un número entero positivo'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Precio base debe ser un número positivo'),
    body('userId').optional().isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo'),
    body('registrationDate').optional().isISO8601().withMessage('Fecha de registro debe tener formato ISO 8601'),
    body('currentDiscounts').optional().isArray().withMessage('Descuentos actuales debe ser un array')
  ],
  discountController.calculateApplicableDiscounts.bind(discountController)
);

export default router;