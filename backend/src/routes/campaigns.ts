/**
 * @fileoverview Rutas de Campañas de Email para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas HTTP para gestión de campañas de email marketing automatizadas
 *
 * Archivo: backend/src/routes/campaigns.ts
 */

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { emailCampaignController } from '../controllers/emailCampaignController';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

// Middleware de validación de errores
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in campaigns route:', errors.array());
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

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/campaigns:
 *   get:
 *     tags: [Email Campaigns]
 *     summary: Obtener campañas de email
 *     description: Obtiene la lista de campañas de email con filtros opcionales
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DRAFT, SCHEDULED, SENDING, SENT, PAUSED, CANCELLED, FAILED]
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [MARKETING, NEWSLETTER, PROMOTIONAL, TRANSACTIONAL, WELCOME, REENGAGEMENT, AUTOMATED]
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Campañas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/',
  [
    query('status').optional().isIn(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED', 'FAILED']),
    query('type').optional().isIn(['MARKETING', 'NEWSLETTER', 'PROMOTIONAL', 'TRANSACTIONAL', 'WELCOME', 'REENGAGEMENT', 'AUTOMATED']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    handleValidationErrors
  ],
  emailCampaignController.getCampaigns
);

/**
 * @swagger
 * /api/v1/campaigns:
 *   post:
 *     tags: [Email Campaigns]
 *     summary: Crear campaña de email
 *     description: Crea una nueva campaña de email
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subject
 *               - fromName
 *               - fromEmail
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *               subject:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               fromName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               fromEmail:
 *                 type: string
 *                 format: email
 *               type:
 *                 type: string
 *                 enum: [MARKETING, NEWSLETTER, PROMOTIONAL, TRANSACTIONAL, WELCOME, REENGAGEMENT, AUTOMATED]
 *               templateId:
 *                 type: integer
 *               templateCode:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Campaña creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  [
    body('name').isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('subject').isLength({ min: 1, max: 200 }).withMessage('El asunto debe tener máximo 200 caracteres'),
    body('fromName').isLength({ min: 1, max: 100 }).withMessage('El nombre del remitente debe tener máximo 100 caracteres'),
    body('fromEmail').isEmail().withMessage('El email del remitente debe tener un formato válido'),
    body('type').optional().isIn(['MARKETING', 'NEWSLETTER', 'PROMOTIONAL', 'TRANSACTIONAL', 'WELCOME', 'REENGAGEMENT', 'AUTOMATED']),
    body('templateId').optional().isInt({ min: 1 }),
    body('templateCode').optional().isString(),
    body('scheduledAt').optional().isISO8601(),
    handleValidationErrors
  ],
  emailCampaignController.createCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   get:
 *     tags: [Email Campaigns]
 *     summary: Obtener campaña por ID
 *     description: Obtiene los detalles de una campaña específica
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaña obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    handleValidationErrors
  ],
  emailCampaignController.getCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   put:
 *     tags: [Email Campaigns]
 *     summary: Actualizar campaña de email
 *     description: Actualiza una campaña de email existente
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
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *               subject:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Campaña actualizada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    body('name').optional().isLength({ min: 2, max: 255 }).withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('subject').optional().isLength({ min: 1, max: 200 }).withMessage('El asunto debe tener máximo 200 caracteres'),
    body('scheduledAt').optional().isISO8601(),
    handleValidationErrors
  ],
  emailCampaignController.updateCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   delete:
 *     tags: [Email Campaigns]
 *     summary: Eliminar campaña de email
 *     description: Elimina una campaña de email (soft delete)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaña eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    handleValidationErrors
  ],
  emailCampaignController.deleteCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/send:
 *   post:
 *     tags: [Email Campaigns]
 *     summary: Enviar campaña de email
 *     description: Inicia el envío de una campaña de email
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
 *             properties:
 *               batchSize:
 *                 type: integer
 *                 default: 50
 *               delayBetweenBatches:
 *                 type: integer
 *                 default: 1000
 *     responses:
 *       200:
 *         description: Campaña enviada exitosamente
 *       400:
 *         description: Campaña no puede ser enviada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/:id/send',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    body('batchSize').optional().isInt({ min: 1, max: 1000 }),
    body('delayBetweenBatches').optional().isInt({ min: 0, max: 60000 }),
    handleValidationErrors
  ],
  emailCampaignController.sendCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/pause:
 *   post:
 *     tags: [Email Campaigns]
 *     summary: Pausar campaña de email
 *     description: Pausa el envío de una campaña de email
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaña pausada exitosamente
 *       400:
 *         description: Campaña no puede ser pausada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/:id/pause',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    handleValidationErrors
  ],
  emailCampaignController.pauseCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/cancel:
 *   post:
 *     tags: [Email Campaigns]
 *     summary: Cancelar campaña de email
 *     description: Cancela el envío de una campaña de email
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaña cancelada exitosamente
 *       400:
 *         description: Campaña no puede ser cancelada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/:id/cancel',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    handleValidationErrors
  ],
  emailCampaignController.cancelCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/recipients:
 *   get:
 *     tags: [Email Campaigns]
 *     summary: Obtener destinatarios de campaña
 *     description: Obtiene la lista de destinatarios de una campaña
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, UNSUBSCRIBED, SKIPPED]
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Destinatarios obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id/recipients',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    query('status').optional().isIn(['PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'SKIPPED']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    handleValidationErrors
  ],
  emailCampaignController.getCampaignRecipients
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/recipients:
 *   post:
 *     tags: [Email Campaigns]
 *     summary: Agregar destinatarios a campaña
 *     description: Agrega destinatarios a una campaña de email
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
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - email
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     variables:
 *                       type: object
 *     responses:
 *       200:
 *         description: Destinatarios agregados exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/:id/recipients',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    body('recipients').isArray({ min: 1 }).withMessage('Debe proporcionar al menos un destinatario'),
    body('recipients.*.email').isEmail().withMessage('Email inválido'),
    body('recipients.*.firstName').optional().isString(),
    body('recipients.*.lastName').optional().isString(),
    body('recipients.*.variables').optional().isObject(),
    handleValidationErrors
  ],
  emailCampaignController.addCampaignRecipients
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/stats:
 *   get:
 *     tags: [Email Campaigns]
 *     summary: Obtener estadísticas de campaña
 *     description: Obtiene estadísticas detalladas de una campaña de email
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id/stats',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    handleValidationErrors
  ],
  emailCampaignController.getCampaignStats
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/test:
 *   post:
 *     tags: [Email Campaigns]
 *     summary: Enviar email de prueba
 *     description: Envía un email de prueba de la campaña
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
 *             required:
 *               - testEmails
 *             properties:
 *               testEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *     responses:
 *       200:
 *         description: Email de prueba enviado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/:id/test',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    body('testEmails').isArray({ min: 1, max: 10 }).withMessage('Debe proporcionar entre 1 y 10 emails de prueba'),
    body('testEmails.*').isEmail().withMessage('Email de prueba inválido'),
    handleValidationErrors
  ],
  emailCampaignController.sendTestEmail
);

/**
 * @swagger
 * /api/v1/campaigns/{id}/schedule:
 *   post:
 *     tags: [Email Campaigns]
 *     summary: Programar campaña
 *     description: Crea una programación automática para la campaña
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
 *             required:
 *               - frequency
 *               - startDate
 *             properties:
 *               frequency:
 *                 type: string
 *                 enum: [ONCE, DAILY, WEEKLY, MONTHLY, CUSTOM]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               timezone:
 *                 type: string
 *                 default: "America/Guatemala"
 *     responses:
 *       201:
 *         description: Programación creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Campaña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/:id/schedule',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de campaña inválido'),
    body('frequency').isIn(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).withMessage('Frecuencia inválida'),
    body('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    body('endDate').optional().isISO8601().withMessage('Fecha de fin inválida'),
    body('timezone').optional().isString(),
    handleValidationErrors
  ],
  emailCampaignController.scheduleCampaign
);

/**
 * @swagger
 * /api/v1/campaigns/stats:
 *   get:
 *     tags: [Email Campaigns]
 *     summary: Obtener estadísticas generales
 *     description: Obtiene estadísticas generales de todas las campañas
 *     security: [{ bearerAuth: [] }]
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
  emailCampaignController.getGeneralStats
);

export default router;