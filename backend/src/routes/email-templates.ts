/**
 * @fileoverview Rutas para gestión de plantillas de email
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas REST para gestión de plantillas de email
 *
 * Archivo: backend/src/routes/email-templates.ts
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { emailTemplateController } from '../controllers/emailTemplateController';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Middleware de validación de errores
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in email templates route:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      error: 'VALIDATION_ERROR',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// ====================================================================
// RUTAS PROTEGIDAS (CON AUTENTICACIÓN)
// ====================================================================

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/email-templates:
 *   get:
 *     tags: [Email Templates]
 *     summary: Listar plantillas de email
 *     description: Obtiene la lista de plantillas de email
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Plantillas obtenidas exitosamente
 */
router.get('/', emailTemplateController.getTemplates);

/**
 * @swagger
 * /api/v1/email-templates:
 *   post:
 *     tags: [Email Templates]
 *     summary: Crear plantilla de email
 *     description: Crea una nueva plantilla de email
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['codigo', 'nombre', 'asunto', 'contenido_html', 'tipo']
 *             properties:
 *               codigo: { type: string, minLength: 3, maxLength: 50 }
 *               nombre: { type: string, minLength: 2, maxLength: 100 }
 *               asunto: { type: string, minLength: 1, maxLength: 200 }
 *               contenido_html: { type: string, minLength: 10 }
 *               contenido_texto: { type: string }
 *               tipo: { type: string, enum: ['TRANSACCIONAL', 'PROMOCIONAL', 'OPERACIONAL'] }
 *               variables_disponibles: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Plantilla creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/',
  [
    body('codigo').isString().isLength({ min: 3, max: 50 }).withMessage('Código requerido (3-50 caracteres)'),
    body('nombre').isString().isLength({ min: 2, max: 100 }).withMessage('Nombre requerido (2-100 caracteres)'),
    body('asunto').isString().isLength({ min: 1, max: 200 }).withMessage('Asunto requerido (máx 200 caracteres)'),
    body('contenido_html').isString().isLength({ min: 10 }).withMessage('Contenido HTML requerido'),
    body('contenido_texto').optional().isString().withMessage('Contenido texto debe ser string'),
    body('tipo').isIn(['TRANSACCIONAL', 'PROMOCIONAL', 'OPERACIONAL']).withMessage('Tipo inválido'),
    body('variables_disponibles').optional().isArray().withMessage('Variables disponibles debe ser array'),
    handleValidationErrors
  ],
  emailTemplateController.createTemplate
);

/**
 * @swagger
 * /api/v1/email-templates/{id}:
 *   get:
 *     tags: [Email Templates]
 *     summary: Obtener plantilla por ID
 *     description: Obtiene los detalles de una plantilla específica
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plantilla obtenida exitosamente
 *       404:
 *         description: Plantilla no encontrada
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de plantilla inválido'),
    handleValidationErrors
  ],
  emailTemplateController.getTemplate
);

/**
 * @swagger
 * /api/v1/email-templates/{id}:
 *   put:
 *     tags: [Email Templates]
 *     summary: Actualizar plantilla de email
 *     description: Actualiza una plantilla existente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
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
 *               nombre: { type: string, minLength: 2, maxLength: 100 }
 *               asunto: { type: string, minLength: 1, maxLength: 200 }
 *               contenido_html: { type: string, minLength: 10 }
 *               contenido_texto: { type: string }
 *               tipo: { type: string, enum: ['TRANSACCIONAL', 'PROMOCIONAL', 'OPERACIONAL'] }
 *               activo: { type: boolean }
 *     responses:
 *       200:
 *         description: Plantilla actualizada exitosamente
 *       404:
 *         description: Plantilla no encontrada
 */
router.put('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de plantilla inválido'),
    body('nombre').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Nombre inválido (2-100 caracteres)'),
    body('asunto').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Asunto inválido (máx 200 caracteres)'),
    body('contenido_html').optional().isString().isLength({ min: 10 }).withMessage('Contenido HTML inválido'),
    body('contenido_texto').optional().isString().withMessage('Contenido texto debe ser string'),
    body('tipo').optional().isIn(['TRANSACCIONAL', 'PROMOCIONAL', 'OPERACIONAL']).withMessage('Tipo inválido'),
    body('activo').optional().isBoolean().withMessage('Estado activo debe ser boolean'),
    handleValidationErrors
  ],
  emailTemplateController.updateTemplate
);

/**
 * @swagger
 * /api/v1/email-templates/{id}:
 *   delete:
 *     tags: [Email Templates]
 *     summary: Eliminar plantilla de email
 *     description: Elimina una plantilla de email (soft delete)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plantilla eliminada exitosamente
 *       404:
 *         description: Plantilla no encontrada
 */
router.delete('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de plantilla inválido'),
    handleValidationErrors
  ],
  emailTemplateController.deleteTemplate
);

/**
 * @swagger
 * /api/v1/email-templates/{id}/preview:
 *   post:
 *     tags: [Email Templates]
 *     summary: Vista previa de plantilla
 *     description: Genera una vista previa de la plantilla con datos de prueba
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Variables para reemplazar en la plantilla
 *             example: { "nombre_usuario": "Juan Pérez", "evento": "Conferencia Tech" }
 *     responses:
 *       200:
 *         description: Vista previa generada exitosamente
 *       404:
 *         description: Plantilla no encontrada
 */
router.post('/:id/preview',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de plantilla inválido'),
    handleValidationErrors
  ],
  emailTemplateController.previewTemplate
);

// Rutas adicionales - placeholders para funcionalidad futura
router.post('/:id/duplicate', (req, res) => {
  res.json({
    success: false,
    message: 'Funcionalidad pendiente de implementación',
    timestamp: new Date().toISOString()
  });
});

router.get('/:id/versions', (req, res) => {
  res.json({
    success: false,
    message: 'Funcionalidad pendiente de implementación',
    timestamp: new Date().toISOString()
  });
});

export default router;