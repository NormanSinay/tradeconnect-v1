/**
 * @fileoverview Rutas para gestión de reglas de notificación
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas REST para gestión de reglas de notificación
 *
 * Archivo: backend/src/routes/notification-rules.ts
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { notificationRuleController } from '../controllers/notificationRuleController';
import { logger } from '../utils/logger';

const router = Router();

// Middleware de validación de errores
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in notification rules route:', errors.array());
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      error: 'VALIDATION_ERROR',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
    return;
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
 * /api/v1/notification-rules:
 *   get:
 *     tags: [Notification Rules]
 *     summary: Listar reglas de notificación
 *     description: Obtiene la lista de reglas de notificación con filtros opcionales
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: eventType
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de evento
 *       - name: active
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de resultados
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de resultados a omitir
 *     responses:
 *       200:
 *         description: Reglas obtenidas exitosamente
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
 *                   example: "Reglas de notificación obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rules:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NotificationRule'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', notificationRuleController.getNotificationRules.bind(notificationRuleController));

/**
 * @swagger
 * /api/v1/notification-rules:
 *   post:
 *     tags: [Notification Rules]
 *     summary: Crear regla de notificación
 *     description: Crea una nueva regla de notificación automática
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['name', 'eventType', 'triggerCondition', 'channels']
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Nombre descriptivo de la regla
 *                 example: "Confirmación de Inscripción"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción detallada
 *                 example: "Envía notificación cuando un usuario se inscribe a un evento"
 *               eventType:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Tipo de evento que dispara la regla
 *                 example: "INSCRIPCION_CONFIRMADA"
 *               triggerCondition:
 *                 type: object
 *                 description: Condiciones para disparar la regla
 *                 example: { "evento.activo": true }
 *               templateCode:
 *                 type: string
 *                 description: Código de plantilla de email
 *                 example: "inscripcion_confirmada"
 *               channels:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   enum: ['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']
 *                 description: Canales por donde enviar
 *                 example: ["EMAIL", "POPUP"]
 *               priority:
 *                 type: string
 *                 enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL']
 *                 default: 'NORMAL'
 *                 description: Prioridad de la notificación
 *               cooldownMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 description: Minutos de cooldown entre notificaciones
 *                 example: 60
 *               maxPerUserPerDay:
 *                 type: integer
 *                 minimum: 1
 *                 description: Máximo de notificaciones por usuario al día
 *                 example: 5
 *     responses:
 *       201:
 *         description: Regla creada exitosamente
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
 *                   example: "Regla de notificación creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rule:
 *                       $ref: '#/components/schemas/NotificationRule'
 *       400:
 *         description: Datos inválidos o regla duplicada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.post('/',
  [
    body('name').isString().isLength({ min: 2, max: 255 }).withMessage('Nombre requerido (2-255 caracteres)'),
    body('eventType').isString().isLength({ min: 2, max: 100 }).withMessage('Tipo de evento requerido (2-100 caracteres)'),
    body('triggerCondition').isObject().withMessage('Condición de disparo requerida'),
    body('channels').isArray({ min: 1 }).withMessage('Canales requeridos'),
    body('channels.*').isIn(['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']).withMessage('Canal inválido'),
    body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).withMessage('Prioridad inválida'),
    body('cooldownMinutes').optional().isInt({ min: 0 }).withMessage('Cooldown debe ser un número entero positivo'),
    body('maxPerUserPerDay').optional().isInt({ min: 1 }).withMessage('Máximo por usuario debe ser mayor a 0'),
    handleValidationErrors
  ],
  notificationRuleController.createNotificationRule.bind(notificationRuleController)
);

/**
 * @swagger
 * /api/v1/notification-rules/{id}:
 *   get:
 *     tags: [Notification Rules]
 *     summary: Obtener regla por ID
 *     description: Obtiene los detalles de una regla de notificación específica
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la regla
 *         example: 1
 *     responses:
 *       200:
 *         description: Regla obtenida exitosamente
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
 *                   example: "Regla de notificación obtenida exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rule:
 *                       $ref: '#/components/schemas/NotificationRule'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Regla no encontrada
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de regla inválido'),
    handleValidationErrors
  ],
  notificationRuleController.getNotificationRule.bind(notificationRuleController)
);

/**
 * @swagger
 * /api/v1/notification-rules/{id}:
 *   put:
 *     tags: [Notification Rules]
 *     summary: Actualizar regla de notificación
 *     description: Actualiza una regla de notificación existente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la regla
 *         example: 1
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
 *                 description: Nombre descriptivo de la regla
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción detallada
 *               eventType:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Tipo de evento que dispara la regla
 *               triggerCondition:
 *                 type: object
 *                 description: Condiciones para disparar la regla
 *               templateCode:
 *                 type: string
 *                 description: Código de plantilla de email
 *               channels:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   enum: ['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']
 *                 description: Canales por donde enviar
 *               priority:
 *                 type: string
 *                 enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL']
 *                 description: Prioridad de la notificación
 *               active:
 *                 type: boolean
 *                 description: Si la regla está activa
 *               cooldownMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 description: Minutos de cooldown entre notificaciones
 *               maxPerUserPerDay:
 *                 type: integer
 *                 minimum: 1
 *                 description: Máximo de notificaciones por usuario al día
 *     responses:
 *       200:
 *         description: Regla actualizada exitosamente
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
 *                   example: "Regla de notificación actualizada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rule:
 *                       $ref: '#/components/schemas/NotificationRule'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Regla no encontrada
 */
router.put('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de regla inválido'),
    body('name').optional().isString().isLength({ min: 2, max: 255 }).withMessage('Nombre inválido (2-255 caracteres)'),
    body('eventType').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Tipo de evento inválido (2-100 caracteres)'),
    body('triggerCondition').optional().isObject().withMessage('Condición de disparo debe ser un objeto'),
    body('channels').optional().isArray({ min: 1 }).withMessage('Canales requeridos'),
    body('channels.*').optional().isIn(['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']).withMessage('Canal inválido'),
    body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).withMessage('Prioridad inválida'),
    body('active').optional().isBoolean().withMessage('Estado activo debe ser boolean'),
    body('cooldownMinutes').optional().isInt({ min: 0 }).withMessage('Cooldown debe ser un número entero positivo'),
    body('maxPerUserPerDay').optional().isInt({ min: 1 }).withMessage('Máximo por usuario debe ser mayor a 0'),
    handleValidationErrors
  ],
  notificationRuleController.updateNotificationRule.bind(notificationRuleController)
);

/**
 * @swagger
 * /api/v1/notification-rules/{id}:
 *   delete:
 *     tags: [Notification Rules]
 *     summary: Eliminar regla de notificación
 *     description: Elimina una regla de notificación (soft delete)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la regla
 *         example: 1
 *     responses:
 *       200:
 *         description: Regla eliminada exitosamente
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
 *                   example: "Regla de notificación eliminada exitosamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Regla no encontrada
 */
router.delete('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de regla inválido'),
    handleValidationErrors
  ],
  notificationRuleController.deleteNotificationRule.bind(notificationRuleController)
);

export default router;