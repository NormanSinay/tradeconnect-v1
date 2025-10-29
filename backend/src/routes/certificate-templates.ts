/**
 * @fileoverview Rutas de Templates de Certificados para TradeConnect
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de templates de certificados
 *
 * Archivo: backend/src/routes/certificate-templates.ts
 */

import { Router } from 'express';
import { param, body } from 'express-validator';
import { certificateTemplateController } from '../controllers/certificateTemplateController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS, USER_ROLES } from '../utils/constants';
import { authenticated, requireRole } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA TEMPLATES
// ====================================================================

const templateLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de templates. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

const templateIdValidation = [
  param('templateId')
    .isUUID()
    .withMessage('ID de template debe ser un UUID válido')
];

const eventTypeValidation = [
  param('eventType')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tipo de evento inválido')
];

const createTemplateValidation = [
  body('name')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre del template es requerido'),
  body('eventTypes')
    .isArray()
    .withMessage('Tipos de evento deben ser un arreglo'),
  body('htmlTemplate')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Template HTML es requerido'),
  body('requiredVariables')
    .isArray()
    .withMessage('Variables requeridas deben ser un arreglo')
];

const updateTemplateValidation = [
  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Nombre del template inválido'),
  body('eventTypes')
    .optional()
    .isArray()
    .withMessage('Tipos de evento deben ser un arreglo'),
  body('htmlTemplate')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Template HTML inválido'),
  body('requiredVariables')
    .optional()
    .isArray()
    .withMessage('Variables requeridas deben ser un arreglo')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN Y ROLES)
// ====================================================================

// ====================================================================
// GESTIÓN DE TEMPLATES
// ====================================================================

/**
 * @swagger
 * /api/certificate-templates:
 *   post:
 *     tags: [Certificate Templates]
 *     summary: Crear template de certificado
 *     description: Crea un nuevo template de certificado
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
 *               - eventTypes
 *               - htmlTemplate
 *               - requiredVariables
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del template
 *               eventTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tipos de evento para los que aplica
 *               htmlTemplate:
 *                 type: string
 *                 description: Template HTML
 *               cssStyles:
 *                 type: string
 *                 description: Estilos CSS
 *               requiredVariables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Variables requeridas
 *               configuration:
 *                 type: object
 *                 description: Configuración adicional
 */
router.post('/',
  authenticated,
  requireRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  templateLimiter,
  createTemplateValidation,
  certificateTemplateController.createTemplate
);

/**
 * @swagger
 * /api/certificate-templates:
 *   get:
 *     tags: [Certificate Templates]
 *     summary: Obtener templates
 *     description: Obtiene lista de templates de certificados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite por página
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de evento
 */
router.get('/',
  authenticated,
  templateLimiter,
  certificateTemplateController.getAllTemplates
);

/**
 * @swagger
 * /api/certificate-templates/{templateId}:
 *   get:
 *     tags: [Certificate Templates]
 *     summary: Obtener template por ID
 *     description: Obtiene un template específico por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 */
router.get('/:templateId',
  authenticated,
  templateLimiter,
  templateIdValidation,
  certificateTemplateController.getTemplateById
);

/**
 * @swagger
 * /api/certificate-templates/{templateId}:
 *   put:
 *     tags: [Certificate Templates]
 *     summary: Actualizar template
 *     description: Actualiza un template de certificado existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del template
 *               eventTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tipos de evento
 *               htmlTemplate:
 *                 type: string
 *                 description: Template HTML
 *               cssStyles:
 *                 type: string
 *                 description: Estilos CSS
 *               requiredVariables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Variables requeridas
 *               active:
 *                 type: boolean
 *                 description: Estado del template
 */
router.put('/:templateId',
  authenticated,
  requireRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  templateLimiter,
  templateIdValidation,
  updateTemplateValidation,
  certificateTemplateController.updateTemplate
);

/**
 * @swagger
 * /api/certificate-templates/{templateId}:
 *   delete:
 *     tags: [Certificate Templates]
 *     summary: Eliminar template
 *     description: Elimina un template de certificado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 */
router.delete('/:templateId',
  authenticated,
  requireRole(USER_ROLES.ADMIN),
  templateLimiter,
  templateIdValidation,
  certificateTemplateController.deleteTemplate
);

// ====================================================================
// FUNCIONES ESPECIALES
// ====================================================================

/**
 * @swagger
 * /api/certificate-templates/default/{eventType}:
 *   get:
 *     tags: [Certificate Templates]
 *     summary: Obtener template por defecto
 *     description: Obtiene el template por defecto para un tipo de evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventType
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de evento
 */
router.get('/default/:eventType',
  authenticated,
  templateLimiter,
  eventTypeValidation,
  certificateTemplateController.getDefaultTemplateForEventType
);

/**
 * @swagger
 * /api/certificate-templates/{templateId}/preview:
 *   post:
 *     tags: [Certificate Templates]
 *     summary: Previsualizar template
 *     description: Genera una previsualización del template con datos de ejemplo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Datos de previsualización
 */
router.post('/:templateId/preview',
  authenticated,
  templateLimiter,
  templateIdValidation,
  certificateTemplateController.previewTemplate
);

/**
 * @swagger
 * /api/certificate-templates/{templateId}/clone:
 *   post:
 *     tags: [Certificate Templates]
 *     summary: Clonar template
 *     description: Crea una copia de un template existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del template a clonar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del nuevo template
 *               version:
 *                 type: string
 *                 description: Versión del nuevo template
 */
router.post('/:templateId/clone',
  authenticated,
  requireRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  templateLimiter,
  templateIdValidation,
  certificateTemplateController.cloneTemplate
);

// ====================================================================
// ESTADÍSTICAS
// ====================================================================

/**
 * @swagger
 * /api/certificate-templates/stats:
 *   get:
 *     tags: [Certificate Templates]
 *     summary: Estadísticas de templates
 *     description: Obtiene estadísticas de los templates de certificados
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats',
  authenticated,
  templateLimiter,
  certificateTemplateController.getTemplateStats
);

export default router;
