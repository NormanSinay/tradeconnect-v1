/**
 * @fileoverview Rutas de Tipos de Acceso para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de tipos de acceso
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { accessTypeController } from '../controllers/accessTypeController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA TIPOS DE ACCESO
// ====================================================================

const accessTypeLimiter = rateLimit({
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

// Validación para crear tipo de acceso
const createAccessTypeValidation = [
  body('name')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('displayName')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de visualización debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('currency')
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero positivo'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Los beneficios deben ser un arreglo'),
  body('restrictions')
    .optional()
    .isArray()
    .withMessage('Las restricciones deben ser un arreglo'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden de visualización debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/access-types:
 *   get:
 *     tags: [Access Types]
 *     summary: Listar tipos de acceso
 *     description: Obtiene una lista de todos los tipos de acceso activos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de acceso obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticated, accessTypeLimiter, accessTypeController.getAccessTypes);

/**
 * @swagger
 * /api/access-types:
 *   post:
 *     tags: [Access Types]
 *     summary: Crear tipo de acceso
 *     description: Crea un nuevo tipo de acceso para eventos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - displayName
 *               - price
 *               - currency
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               price:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               displayOrder:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Tipo de acceso creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticated, createEditLimiter, createAccessTypeValidation, accessTypeController.createAccessType);

/**
 * @swagger
 * /api/access-types/{id}:
 *   get:
 *     tags: [Access Types]
 *     summary: Obtener tipo de acceso
 *     description: Obtiene los detalles de un tipo de acceso específico
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
 *         description: Tipo de acceso obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tipo de acceso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticated, accessTypeLimiter, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
], accessTypeController.getAccessType);

/**
 * @swagger
 * /api/access-types/{id}:
 *   put:
 *     tags: [Access Types]
 *     summary: Actualizar tipo de acceso
 *     description: Actualiza la información de un tipo de acceso específico
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               price:
 *                 type: number
 *                 minimum: 0
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               restrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               displayOrder:
 *                 type: integer
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Tipo de acceso actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tipo de acceso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authenticated, createEditLimiter, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  ...createAccessTypeValidation.slice(1) // Reutilizar validaciones sin el name requerido
], accessTypeController.updateAccessType);

/**
 * @swagger
 * /api/access-types/{id}:
 *   delete:
 *     tags: [Access Types]
 *     summary: Eliminar tipo de acceso
 *     description: Elimina un tipo de acceso (desactivación lógica)
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
 *         description: Tipo de acceso eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tipo de acceso no encontrado
 *       409:
 *         description: No se puede eliminar - tiene eventos asociados
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticated, accessTypeLimiter, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo')
], accessTypeController.deleteAccessType);

export default router;
