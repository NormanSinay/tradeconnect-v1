/**
 * @fileoverview Rutas de Promociones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de promociones
 *
 * Archivo: backend/src/routes/promotions.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { promotionController } from '../controllers/promotionController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA PROMOCIONES
// ====================================================================

// Rate limiter general para operaciones de promociones
const promotionLimiter = rateLimit({
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

// Validación para crear promoción
const createPromotionValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('type')
    .isIn(['GENERAL', 'EVENT_SPECIFIC', 'CATEGORY_SPECIFIC', 'MEMBERSHIP'])
    .withMessage('Tipo de promoción inválido'),
  body('eventIds')
    .optional()
    .isArray()
    .withMessage('eventIds debe ser un arreglo'),
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('categoryIds debe ser un arreglo'),
  body('minPurchaseAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto mínimo debe ser un número positivo'),
  body('userTypes')
    .optional()
    .isArray()
    .withMessage('userTypes debe ser un arreglo'),
  body('isStackable')
    .optional()
    .isBoolean()
    .withMessage('isStackable debe ser un valor booleano'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('La prioridad debe estar entre 0 y 100'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    })
];

// Validación para actualizar promoción
const updatePromotionValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('type')
    .optional()
    .isIn(['GENERAL', 'EVENT_SPECIFIC', 'CATEGORY_SPECIFIC', 'MEMBERSHIP'])
    .withMessage('Tipo de promoción inválido'),
  body('eventIds')
    .optional()
    .isArray()
    .withMessage('eventIds debe ser un arreglo'),
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('categoryIds debe ser un arreglo'),
  body('minPurchaseAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto mínimo debe ser un número positivo'),
  body('userTypes')
    .optional()
    .isArray()
    .withMessage('userTypes debe ser un arreglo'),
  body('isStackable')
    .optional()
    .isBoolean()
    .withMessage('isStackable debe ser un valor booleano'),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('La prioridad debe estar entre 0 y 100'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    })
];

// Validación para parámetros de ruta
const promotionIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la promoción debe ser un número entero positivo')
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
  query('type')
    .optional()
    .isIn(['GENERAL', 'EVENT_SPECIFIC', 'CATEGORY_SPECIFIC', 'MEMBERSHIP'])
    .withMessage('Tipo de promoción inválido'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     tags: [Promotions]
 *     summary: Listar promociones
 *     description: Obtiene una lista de promociones con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [GENERAL, EVENT_SPECIFIC, CATEGORY_SPECIFIC, MEMBERSHIP]
 *         description: Tipo de promoción
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Estado de la promoción
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Promociones obtenidas exitosamente
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
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Promotion'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticated, promotionLimiter, queryValidation, promotionController.getPromotions);

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     tags: [Promotions]
 *     summary: Crear promoción
 *     description: Crea una nueva promoción
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromotionCreateRequest'
 *     responses:
 *       201:
 *         description: Promoción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authenticated, createEditLimiter, createPromotionValidation, promotionController.createPromotion);

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     tags: [Promotions]
 *     summary: Obtener promoción
 *     description: Obtiene detalles de una promoción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la promoción
 *     responses:
 *       200:
 *         description: Promoción obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Promotion'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Promoción no encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticated, promotionLimiter, promotionIdValidation, promotionController.getPromotion);

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     tags: [Promotions]
 *     summary: Actualizar promoción
 *     description: Actualiza información de una promoción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la promoción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromotionCreateRequest'
 *     responses:
 *       200:
 *         description: Promoción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Promoción no encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authenticated, createEditLimiter, promotionIdValidation, updatePromotionValidation, promotionController.updatePromotion);

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     tags: [Promotions]
 *     summary: Eliminar promoción
 *     description: Elimina una promoción (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la promoción
 *     responses:
 *       200:
 *         description: Promoción eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Promoción no encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticated, promotionLimiter, promotionIdValidation, promotionController.deletePromotion);

/**
 * @swagger
 * /api/promotions/{id}/activate:
 *   post:
 *     tags: [Promotions]
 *     summary: Activar promoción
 *     description: Activa una promoción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la promoción
 *     responses:
 *       200:
 *         description: Promoción activada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Promoción no encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/activate', authenticated, promotionLimiter, promotionIdValidation, promotionController.activatePromotion);

/**
 * @swagger
 * /api/promotions/{id}/deactivate:
 *   post:
 *     tags: [Promotions]
 *     summary: Desactivar promoción
 *     description: Desactiva una promoción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la promoción
 *     responses:
 *       200:
 *         description: Promoción desactivada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Promoción no encontrada
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/deactivate', authenticated, promotionLimiter, promotionIdValidation, promotionController.deactivatePromotion);

export default router;
