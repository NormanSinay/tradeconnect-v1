/**
 * @fileoverview Rutas de Plantillas de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de plantillas de eventos
 *
 * Archivo: backend/src/routes/event-templates.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { eventTemplateController } from '../controllers/eventTemplateController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA PLANTILLAS
// ====================================================================

// Rate limiter general para operaciones de plantillas
const templateLimiter = rateLimit({
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
  max: 5, // máximo 5 operaciones por ventana
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

// Validación para crear plantilla
const createTemplateValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('templateData')
    .isObject()
    .withMessage('Los datos de la plantilla deben ser un objeto JSON válido'),
  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('La URL de la miniatura debe ser válida'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano')
];

// Validación para actualizar plantilla
const updateTemplateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('templateData')
    .optional()
    .isObject()
    .withMessage('Los datos de la plantilla deben ser un objeto JSON válido'),
  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('La URL de la miniatura debe ser válida'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano')
];

// Validación para parámetros de ruta
const templateIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la plantilla debe ser un número entero positivo')
];

// Validación para parámetros de consulta
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe estar entre 1 y 50'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres'),
  query('isPublic')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isPublic debe ser true o false')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/event-templates:
 *   get:
 *     tags: [Event Templates]
 *     summary: Listar plantillas de eventos
 *     description: Obtiene plantillas de eventos del usuario o públicas
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticated, templateLimiter, queryValidation, eventTemplateController.getTemplates);

/**
 * @swagger
 * /api/event-templates:
 *   post:
 *     tags: [Event Templates]
 *     summary: Crear plantilla de evento
 *     description: Crea una nueva plantilla de evento
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticated, createEditLimiter, createTemplateValidation, eventTemplateController.createTemplate);

/**
 * @swagger
 * /api/event-templates/{id}:
 *   get:
 *     tags: [Event Templates]
 *     summary: Obtener plantilla
 *     description: Obtiene detalles de una plantilla específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authenticated, templateLimiter, templateIdValidation, eventTemplateController.getTemplate);

/**
 * @swagger
 * /api/event-templates/{id}:
 *   put:
 *     tags: [Event Templates]
 *     summary: Actualizar plantilla
 *     description: Actualiza información de una plantilla específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', authenticated, createEditLimiter, templateIdValidation, updateTemplateValidation, eventTemplateController.updateTemplate);

/**
 * @swagger
 * /api/event-templates/{id}:
 *   delete:
 *     tags: [Event Templates]
 *     summary: Eliminar plantilla
 *     description: Elimina una plantilla de evento (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', authenticated, templateLimiter, templateIdValidation, eventTemplateController.deleteTemplate);

/**
 * @swagger
 * /api/event-templates/{id}/use:
 *   post:
 *     tags: [Event Templates]
 *     summary: Usar plantilla
 *     description: Crea un evento basado en una plantilla
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/use', authenticated, createEditLimiter, templateIdValidation, [
  body('customizations')
    .optional()
    .isObject()
    .withMessage('Las personalizaciones deben ser un objeto JSON válido')
], eventTemplateController.useTemplate);

export default router;