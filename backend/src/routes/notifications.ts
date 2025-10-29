/**
 * @fileoverview Rutas para el sistema de notificaciones
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas REST para gestión de notificaciones
 *
 * Archivo: backend/src/routes/notifications.ts
 */

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { notificationController } from '../controllers/notificationController';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';

const router = Router();

// Middleware de validación de errores
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in notifications route:', errors.array());
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
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/v1/notifications/track/open/{token}:
 *   get:
 *     tags: [Notifications]
 *     summary: Tracking de apertura de email
 *     description: Endpoint para tracking de apertura de emails (pixel invisible)
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de tracking
 *     responses:
 *       200:
 *         description: Pixel de tracking retornado
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/track/open/:token',
  [
    param('token').isString().isLength({ min: 1 }).withMessage('Token requerido'),
    handleValidationErrors
  ],
  notificationController.trackEmailOpen
);

/**
 * @swagger
 * /api/v1/notifications/track/click/{token}/{linkId}:
 *   get:
 *     tags: [Notifications]
 *     summary: Tracking de clic en email
 *     description: Endpoint para tracking de clics en enlaces de emails
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de tracking
 *       - name: linkId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del enlace
 *     responses:
 *       302:
 *         description: Redirección al enlace original
 */
router.get('/track/click/:token/:linkId',
  [
    param('token').isString().isLength({ min: 1 }).withMessage('Token requerido'),
    param('linkId').isString().isLength({ min: 1 }).withMessage('Link ID requerido'),
    handleValidationErrors
  ],
  notificationController.trackEmailClick
);

/**
 * @swagger
 * /api/v1/notifications/unsubscribe/{token}:
 *   get:
 *     tags: [Notifications]
 *     summary: Unsubscribe de emails promocionales
 *     description: Endpoint para darse de baja de emails promocionales
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de unsubscribe
 *     responses:
 *       200:
 *         description: Página de confirmación de unsubscribe
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/unsubscribe/:token', (req, res) => {
  // Placeholder para unsubscribe - implementar después
  res.send(`
    <html>
      <body>
        <h1>Unsubscribe from TradeConnect</h1>
        <p>You have been unsubscribed from promotional emails.</p>
        <a href="/">Return to TradeConnect</a>
      </body>
    </html>
  `);
});

/**
 * @swagger
 * /api/v1/notifications/unsubscribe/{token}:
 *   post:
 *     tags: [Notifications]
 *     summary: Confirmar unsubscribe
 *     description: Confirmar la baja de emails promocionales
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de unsubscribe
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirm:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Unsubscribe confirmado
 */
router.post('/unsubscribe/:token', (req, res) => {
  // Placeholder para unsubscribe - implementar después
  res.json({
    success: true,
    message: 'Unsubscribed successfully',
    timestamp: new Date().toISOString()
  });
});

// ====================================================================
// RUTAS PROTEGIDAS (CON AUTENTICACIÓN)
// ====================================================================

// Aplicar middleware de autenticación a todas las rutas siguientes
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Listar notificaciones
 *     description: Obtiene la lista de notificaciones con filtros opcionales
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED]
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [EMAIL, POPUP, SMS, WHATSAPP]
 *       - name: channel
 *         in: query
 *         schema:
 *           type: string
 *           enum: [EMAIL, POPUP, SMS, WHATSAPP]
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
 *         description: Notificaciones obtenidas exitosamente
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /api/v1/notifications/send:
 *   post:
 *     tags: [Notifications]
 *     summary: Enviar notificación individual
 *     description: Envía una notificación a un usuario específico
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendNotificationRequest'
 *     responses:
 *       200:
 *         description: Notificación enviada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/send',
  [
    body('userId').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('type').isIn(['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']).withMessage('Tipo de notificación inválido'),
    body('channel').isIn(['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']).withMessage('Canal inválido'),
    body('message').isString().isLength({ min: 1, max: 5000 }).withMessage('Mensaje requerido (1-5000 caracteres)'),
    body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).withMessage('Prioridad inválida'),
    body('scheduledAt').optional().isISO8601().withMessage('Fecha de programación inválida'),
    handleValidationErrors
  ],
  notificationController.sendNotification
);

/**
 * @swagger
 * /api/v1/notifications/bulk-send:
 *   post:
 *     tags: [Notifications]
 *     summary: Enviar notificación masiva
 *     description: Envía la misma notificación a múltiples usuarios
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendBulkNotificationRequest'
 *     responses:
 *       200:
 *         description: Notificaciones en cola para envío
 *       400:
 *         description: Datos inválidos
 */
router.post('/bulk-send',
  [
    body('userIds').isArray({ min: 1, max: 1000 }).withMessage('Lista de usuarios requerida (1-1000)'),
    body('userIds.*').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('type').isIn(['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']).withMessage('Tipo de notificación inválido'),
    body('channel').isIn(['EMAIL', 'POPUP', 'SMS', 'WHATSAPP']).withMessage('Canal inválido'),
    body('message').isString().isLength({ min: 1, max: 5000 }).withMessage('Mensaje requerido (1-5000 caracteres)'),
    body('priority').optional().isIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).withMessage('Prioridad inválida'),
    body('scheduledAt').optional().isISO8601().withMessage('Fecha de programación inválida'),
    handleValidationErrors
  ],
  notificationController.sendBulkNotification
);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     tags: [Notifications]
 *     summary: Obtener notificación por ID
 *     description: Obtiene los detalles de una notificación específica
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación obtenida exitosamente
 *       404:
 *         description: Notificación no encontrada
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de notificación inválido'),
    handleValidationErrors
  ],
  notificationController.getNotification
);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Marcar notificación como leída
 *     description: Marca una notificación como leída por el usuario
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 */
router.put('/:id/read',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de notificación inválido'),
    handleValidationErrors
  ],
  notificationController.markAsRead
);

/**
 * @swagger
 * /api/v1/notifications/{id}/cancel:
 *   put:
 *     tags: [Notifications]
 *     summary: Cancelar notificación
 *     description: Cancela una notificación pendiente antes de que sea enviada
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación a cancelar
 *     responses:
 *       200:
 *         description: Notificación cancelada exitosamente
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
 *                   example: "Notificación cancelada exitosamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error en la solicitud o notificación no puede ser cancelada
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
 *                   example: "La notificación ya está cancelada"
 *                 error:
 *                   type: string
 *                   example: "NOTIFICATION_ALREADY_CANCELLED"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/cancel',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de notificación inválido'),
    handleValidationErrors
  ],
  notificationController.cancelNotification.bind(notificationController)
);

/**
 * @swagger
 * /api/v1/notifications/{id}/retry:
 *   post:
 *     tags: [Notifications]
 *     summary: Reintentar envío de notificación
 *     description: Reintenta el envío de una notificación que falló anteriormente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación a reintentar
 *     responses:
 *       200:
 *         description: Reintento programado exitosamente
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
 *                   example: "Reintento de notificación programado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error en la solicitud o notificación no puede ser reintentada
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
 *                   example: "Solo se pueden reintentar notificaciones fallidas"
 *                 error:
 *                   type: string
 *                   example: "NOTIFICATION_CANNOT_RETRY"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/retry',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de notificación inválido'),
    handleValidationErrors
  ],
  notificationController.retryNotification.bind(notificationController)
);

/**
 * @swagger
 * /api/v1/notifications/user/{userId}:
 *   get:
 *     tags: [Notifications]
 *     summary: Notificaciones de un usuario
 *     description: Obtiene todas las notificaciones de un usuario específico
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED]
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
 *         description: Notificaciones obtenidas exitosamente
 */
router.get('/user/:userId',
  [
    param('userId').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe ser entre 1 y 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset debe ser mayor o igual a 0'),
    handleValidationErrors
  ],
  notificationController.getUserNotifications
);

/**
 * @swagger
 * /api/v1/notifications/popup/pending:
 *   get:
 *     tags: [Notifications]
 *     summary: Notificaciones Pop-up pendientes
 *     description: Obtiene las notificaciones de tipo popup que están pendientes para el usuario actual
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Notificaciones popup pendientes obtenidas exitosamente
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
 *                   example: "Notificaciones popup pendientes obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 123
 *                           type:
 *                             type: string
 *                             example: "POPUP"
 *                           channel:
 *                             type: string
 *                             example: "POPUP"
 *                           subject:
 *                             type: string
 *                             example: "Notificación importante"
 *                           message:
 *                             type: string
 *                             example: "Tienes una nueva actualización disponible"
 *                           priority:
 *                             type: string
 *                             enum: [LOW, NORMAL, HIGH, CRITICAL]
 *                             example: "HIGH"
 *                           data:
 *                             type: object
 *                             example: { "actionUrl": "/update" }
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 3
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/popup/pending', notificationController.getPendingPopupNotifications.bind(notificationController));

/**
 * @swagger
 * /api/v1/notifications/stats:
 *   get:
 *     tags: [Notifications]
 *     summary: Estadísticas de notificaciones
 *     description: Obtiene métricas y estadísticas del sistema de notificaciones
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats', notificationController.getNotificationStats);

export default router;
