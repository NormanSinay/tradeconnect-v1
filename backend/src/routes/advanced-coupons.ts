/**
 * @fileoverview Rutas de Cupones Avanzados para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de cupones avanzados
 *
 * Archivo: backend/src/routes/advanced-coupons.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { advancedCouponController } from '../controllers/advancedCouponController';
import { authenticateToken } from '../middleware/auth';
import { promoCodeLimiter } from '../middleware/rateLimiting';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ====================================================================
// GESTIÓN DE CUPONES AVANZADOS
// ====================================================================

/**
 * @swagger
 * /api/advanced-coupons:
 *   post:
 *     tags: [Advanced Coupons]
 *     summary: Crear cupón avanzado
 *     description: Crea un nuevo cupón avanzado con reglas complejas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - discountConfig
 *               - conditions
 *               - createdBy
 *             properties:
 *               code:
 *                 type: string
 *                 description: Código único del cupón
 *               name:
 *                 type: string
 *                 description: Nombre del cupón
 *               description:
 *                 type: string
 *                 description: Descripción del cupón
 *               discountConfig:
 *                 type: object
 *                 description: Configuración del descuento
 *               conditions:
 *                 type: array
 *                 description: Condiciones para aplicar el cupón
 *               applicationType:
 *                 type: string
 *                 enum: [AUTOMATIC, MANUAL, CONDITIONAL]
 *                 default: MANUAL
 *               priority:
 *                 type: integer
 *                 default: 0
 *               isStackable:
 *                 type: boolean
 *                 default: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               maxUsesTotal:
 *                 type: integer
 *               maxUsesPerUser:
 *                 type: integer
 *                 default: 1
 *               minPurchaseAmount:
 *                 type: number
 *               maxDiscountAmount:
 *                 type: number
 *               applicableEvents:
 *                 type: array
 *                 items:
 *                   type: integer
 *               applicableCategories:
 *                 type: array
 *                 items:
 *                   type: integer
 *               applicableUserTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicableUserSegments:
 *                 type: array
 *                 items:
 *                   type: string
 *               autoApply:
 *                 type: boolean
 *                 default: false
 *               requiresApproval:
 *                 type: boolean
 *                 default: false
 *               usageLimitWindow:
 *                 type: integer
 *               createdBy:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Cupón creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  [
    body('code')
      .isLength({ min: 3, max: 50 })
      .withMessage('Código debe tener entre 3 y 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/i)
      .withMessage('Código solo puede contener letras, números, guiones y guiones bajos'),
    body('name')
      .isLength({ min: 2, max: 255 })
      .withMessage('Nombre debe tener entre 2 y 255 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Descripción no puede exceder 2000 caracteres'),
    body('discountConfig').isObject().withMessage('Configuración de descuento es requerida'),
    body('conditions').isArray().withMessage('Condiciones deben ser un array'),
    body('applicationType')
      .optional()
      .isIn(['AUTOMATIC', 'MANUAL', 'CONDITIONAL'])
      .withMessage('Tipo de aplicación inválido'),
    body('priority')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Prioridad debe ser un número entero positivo'),
    body('isStackable')
      .optional()
      .isBoolean()
      .withMessage('isStackable debe ser un valor booleano'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe tener formato ISO 8601'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe tener formato ISO 8601'),
    body('maxUsesTotal')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Máximo de usos totales debe ser un número entero positivo'),
    body('maxUsesPerUser')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Máximo de usos por usuario debe ser un número entero positivo'),
    body('minPurchaseAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monto mínimo debe ser un número positivo'),
    body('maxDiscountAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monto máximo de descuento debe ser un número positivo'),
    body('applicableEvents')
      .optional()
      .isArray()
      .withMessage('Eventos aplicables debe ser un array'),
    body('applicableCategories')
      .optional()
      .isArray()
      .withMessage('Categorías aplicables debe ser un array'),
    body('applicableUserTypes')
      .optional()
      .isArray()
      .withMessage('Tipos de usuario aplicables debe ser un array'),
    body('applicableUserSegments')
      .optional()
      .isArray()
      .withMessage('Segmentos de usuario aplicables debe ser un array'),
    body('autoApply')
      .optional()
      .isBoolean()
      .withMessage('autoApply debe ser un valor booleano'),
    body('requiresApproval')
      .optional()
      .isBoolean()
      .withMessage('requiresApproval debe ser un valor booleano'),
    body('usageLimitWindow')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Ventana de límite debe ser un número entero positivo'),
    body('createdBy').isInt({ min: 1 }).withMessage('Usuario creador es requerido')
  ],
  advancedCouponController.createCoupon.bind(advancedCouponController)
);

/**
 * @swagger
 * /api/advanced-coupons/{id}:
 *   get:
 *     tags: [Advanced Coupons]
 *     summary: Obtener cupón avanzado por ID
 *     description: Obtiene un cupón avanzado específico por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cupón
 *     responses:
 *       200:
 *         description: Cupón obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cupón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo')
  ],
  advancedCouponController.getCouponById.bind(advancedCouponController)
);

/**
 * @swagger
 * /api/advanced-coupons:
 *   get:
 *     tags: [Advanced Coupons]
 *     summary: Listar cupones avanzados
 *     description: Obtiene una lista paginada de cupones avanzados con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["ACTIVE", "DRAFT"]
 *       - in: query
 *         name: applicationType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["MANUAL", "AUTOMATIC"]
 *       - in: query
 *         name: discountType
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ["PERCENTAGE", "FIXED_AMOUNT"]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, priority, code, name, startDate, endDate]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Cupones obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/',
  [
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
      .isIn(['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED'])
      .withMessage('Estado inválido'),
    query('applicationType')
      .optional()
      .isIn(['AUTOMATIC', 'MANUAL', 'CONDITIONAL'])
      .withMessage('Tipo de aplicación inválido'),
    query('discountType')
      .optional()
      .isIn(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'SPECIAL_PRICE', 'FREE_SHIPPING', 'BUNDLE_DISCOUNT'])
      .withMessage('Tipo de descuento inválido'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'priority', 'code', 'name', 'startDate', 'endDate'])
      .withMessage('Campo de ordenamiento inválido'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Orden inválido')
  ],
  advancedCouponController.getCoupons.bind(advancedCouponController)
);

/**
 * @swagger
 * /api/advanced-coupons/{id}:
 *   put:
 *     tags: [Advanced Coupons]
 *     summary: Actualizar cupón avanzado
 *     description: Actualiza un cupón avanzado existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvancedCouponAttributes'
 *     responses:
 *       200:
 *         description: Cupón actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cupón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
    body('code')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Código debe tener entre 3 y 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/i)
      .withMessage('Código solo puede contener letras, números, guiones y guiones bajos'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Nombre debe tener entre 2 y 255 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Descripción no puede exceder 2000 caracteres'),
    body('status')
      .optional()
      .isIn(['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'DEPLETED'])
      .withMessage('Estado inválido'),
    body('discountConfig')
      .optional()
      .isObject()
      .withMessage('Configuración de descuento debe ser un objeto'),
    body('conditions')
      .optional()
      .isArray()
      .withMessage('Condiciones deben ser un array'),
    body('applicationType')
      .optional()
      .isIn(['AUTOMATIC', 'MANUAL', 'CONDITIONAL'])
      .withMessage('Tipo de aplicación inválido'),
    body('priority')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Prioridad debe ser un número entero positivo'),
    body('isStackable')
      .optional()
      .isBoolean()
      .withMessage('isStackable debe ser un valor booleano'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de inicio debe tener formato ISO 8601'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de fin debe tener formato ISO 8601'),
    body('maxUsesTotal')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Máximo de usos totales debe ser un número entero positivo'),
    body('maxUsesPerUser')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Máximo de usos por usuario debe ser un número entero positivo'),
    body('minPurchaseAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monto mínimo debe ser un número positivo'),
    body('maxDiscountAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monto máximo de descuento debe ser un número positivo'),
    body('applicableEvents')
      .optional()
      .isArray()
      .withMessage('Eventos aplicables debe ser un array'),
    body('applicableCategories')
      .optional()
      .isArray()
      .withMessage('Categorías aplicables debe ser un array'),
    body('applicableUserTypes')
      .optional()
      .isArray()
      .withMessage('Tipos de usuario aplicables debe ser un array'),
    body('applicableUserSegments')
      .optional()
      .isArray()
      .withMessage('Segmentos de usuario aplicables debe ser un array'),
    body('autoApply')
      .optional()
      .isBoolean()
      .withMessage('autoApply debe ser un valor booleano'),
    body('requiresApproval')
      .optional()
      .isBoolean()
      .withMessage('requiresApproval debe ser un valor booleano'),
    body('usageLimitWindow')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Ventana de límite debe ser un número entero positivo'),
    body('updatedBy')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Usuario actualizador debe ser un número entero positivo')
  ],
  advancedCouponController.updateCoupon.bind(advancedCouponController)
);

/**
 * @swagger
 * /api/advanced-coupons/{id}:
 *   delete:
 *     tags: [Advanced Coupons]
 *     summary: Eliminar cupón avanzado
 *     description: Elimina un cupón avanzado (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cupón eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cupón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo')
  ],
  advancedCouponController.deleteCoupon.bind(advancedCouponController)
);

// ====================================================================
// VALIDACIÓN Y APLICACIÓN DE CUPONES
// ====================================================================

/**
 * @swagger
 * /api/advanced-coupons/validate:
 *   post:
 *     tags: [Advanced Coupons]
 *     summary: Validar cupón avanzado
 *     description: Valida si un cupón avanzado puede aplicarse a una compra
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponCode
 *               - items
 *               - subtotal
 *             properties:
 *               couponCode:
 *                 type: string
 *                 description: Código del cupón a validar
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     categoryId:
 *                       type: integer
 *                     eventId:
 *                       type: integer
 *               subtotal:
 *                 type: number
 *                 description: Subtotal de la compra
 *               context:
 *                 type: object
 *                 description: Contexto adicional para evaluación
 *     responses:
 *       200:
 *         description: Cupón validado exitosamente
 *       400:
 *         description: Cupón inválido o no aplicable
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/validate',
  promoCodeLimiter, // Rate limiting específico para códigos promocionales
  [
    body('couponCode')
      .isLength({ min: 3, max: 50 })
      .withMessage('Código del cupón debe tener entre 3 y 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/i)
      .withMessage('Código del cupón solo puede contener letras, números, guiones y guiones bajos'),
    body('items').isArray({ min: 1 }).withMessage('Items son requeridos'),
    body('items.*.id').isInt({ min: 1 }).withMessage('ID del item debe ser un número entero positivo'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser un número entero positivo'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
    body('items.*.categoryId').optional().isInt({ min: 1 }).withMessage('ID de categoría debe ser un número entero positivo'),
    body('items.*.eventId').optional().isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal debe ser un número positivo'),
    body('context').optional().isObject().withMessage('Contexto debe ser un objeto')
  ],
  advancedCouponController.validateCoupon.bind(advancedCouponController)
);

/**
 * @swagger
 * /api/advanced-coupons/apply:
 *   post:
 *     tags: [Advanced Coupons]
 *     summary: Aplicar cupón avanzado
 *     description: Aplica un cupón avanzado a una compra
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponApplicationRequest'
 *     responses:
 *       200:
 *         description: Cupón aplicado exitosamente
 *       400:
 *         description: Cupón inválido o no aplicable
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/apply',
  promoCodeLimiter, // Rate limiting específico para códigos promocionales
  [
    body('couponCode')
      .isLength({ min: 3, max: 50 })
      .withMessage('Código del cupón debe tener entre 3 y 50 caracteres')
      .matches(/^[A-Z0-9_-]+$/i)
      .withMessage('Código del cupón solo puede contener letras, números, guiones y guiones bajos'),
    body('orderId').optional().isString().withMessage('ID de orden debe ser una cadena'),
    body('items').isArray({ min: 1 }).withMessage('Items son requeridos'),
    body('items.*.id').isInt({ min: 1 }).withMessage('ID del item debe ser un número entero positivo'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser un número entero positivo'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
    body('items.*.categoryId').optional().isInt({ min: 1 }).withMessage('ID de categoría debe ser un número entero positivo'),
    body('items.*.eventId').optional().isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal debe ser un número positivo'),
    body('context').optional().isObject().withMessage('Contexto debe ser un objeto')
  ],
  advancedCouponController.applyCoupon.bind(advancedCouponController)
);

// ====================================================================
// ESTADÍSTICAS Y REPORTES
// ====================================================================

/**
 * @swagger
 * /api/advanced-coupons/{id}/stats:
 *   get:
 *     tags: [Advanced Coupons]
 *     summary: Obtener estadísticas de cupón
 *     description: Obtiene estadísticas de uso de un cupón específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cupón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id/stats',
  [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo')
  ],
  advancedCouponController.getCouponStats.bind(advancedCouponController)
);

/**
 * @swagger
 * /api/advanced-coupons/stats:
 *   get:
 *     tags: [Advanced Coupons]
 *     summary: Obtener estadísticas generales
 *     description: Obtiene estadísticas generales de todos los cupones avanzados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/stats',
  advancedCouponController.getGeneralStats.bind(advancedCouponController)
);

// ====================================================================
// CUPONES AUTOMÁTICOS
// ====================================================================

/**
 * @swagger
 * /api/advanced-coupons/auto-applicable:
 *   post:
 *     tags: [Advanced Coupons]
 *     summary: Obtener cupones aplicables automáticamente
 *     description: Obtiene cupones que pueden aplicarse automáticamente según el contexto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               eventId:
 *                 type: integer
 *               purchaseAmount:
 *                 type: number
 *               itemQuantity:
 *                 type: integer
 *               userType:
 *                 type: string
 *               userSegment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cupones automáticos obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/auto-applicable',
  [
    body('userId').optional().isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo'),
    body('eventId').optional().isInt({ min: 1 }).withMessage('ID de evento debe ser un número entero positivo'),
    body('purchaseAmount').optional().isFloat({ min: 0 }).withMessage('Monto de compra debe ser un número positivo'),
    body('itemQuantity').optional().isInt({ min: 0 }).withMessage('Cantidad de items debe ser un número entero positivo'),
    body('userType').optional().isString().withMessage('Tipo de usuario debe ser una cadena'),
    body('userSegment').optional().isString().withMessage('Segmento de usuario debe ser una cadena')
  ],
  advancedCouponController.getAutoApplicableCoupons.bind(advancedCouponController)
);

export default router;