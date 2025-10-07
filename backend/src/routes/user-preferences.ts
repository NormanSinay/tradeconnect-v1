/**
 * @fileoverview Rutas para gestión de preferencias de notificaciones de usuario
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas REST para gestión de preferencias de notificaciones
 *
 * Archivo: backend/src/routes/user-preferences.ts
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { userPreferencesController } from '../controllers/userPreferencesController';

const router = Router();

// Middleware de validación de errores
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in user preferences route:', errors.array());
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
 * /api/v1/user/preferences:
 *   get:
 *     tags: [User Preferences]
 *     summary: Obtener preferencias de notificaciones
 *     description: Obtiene las preferencias de notificaciones del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Preferencias obtenidas exitosamente
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
 *                   example: "Preferencias obtenidas exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/UserNotificationPreferences'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', userPreferencesController.getUserPreferences);

/**
 * @swagger
 * /api/v1/user/preferences:
 *   put:
 *     tags: [User Preferences]
 *     summary: Actualizar preferencias de notificaciones
 *     description: Actualiza las preferencias de notificaciones del usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailEnabled:
 *                 type: boolean
 *                 description: Habilitar notificaciones por email
 *               smsEnabled:
 *                 type: boolean
 *                 description: Habilitar notificaciones por SMS
 *               pushEnabled:
 *                 type: boolean
 *                 description: Habilitar notificaciones push
 *               marketingEmails:
 *                 type: boolean
 *                 description: Permitir emails de marketing
 *               transactionalEmails:
 *                 type: boolean
 *                 description: Permitir emails transaccionales
 *               operationalEmails:
 *                 type: boolean
 *                 description: Permitir emails operacionales
 *               promotionalEmails:
 *                 type: boolean
 *                 description: Permitir emails promocionales
 *               eventReminders:
 *                 type: boolean
 *                 description: Permitir recordatorios de eventos
 *               paymentNotifications:
 *                 type: boolean
 *                 description: Permitir notificaciones de pagos
 *               certificateNotifications:
 *                 type: boolean
 *                 description: Permitir notificaciones de certificados
 *               systemNotifications:
 *                 type: boolean
 *                 description: Permitir notificaciones del sistema
 *               frequency:
 *                 type: string
 *                 enum: [immediate, daily, weekly]
 *                 description: Frecuencia de notificaciones
 *               quietHoursStart:
 *                 type: string
 *                 description: Hora de inicio de horas silenciosas (HH:MM)
 *               quietHoursEnd:
 *                 type: string
 *                 description: Hora de fin de horas silenciosas (HH:MM)
 *               timezone:
 *                 type: string
 *                 description: Zona horaria del usuario
 *     responses:
 *       200:
 *         description: Preferencias actualizadas exitosamente
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
 *                   example: "Preferencias actualizadas exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/UserNotificationPreferences'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.put('/',
  [
    body('emailEnabled').optional().isBoolean().withMessage('emailEnabled debe ser boolean'),
    body('smsEnabled').optional().isBoolean().withMessage('smsEnabled debe ser boolean'),
    body('pushEnabled').optional().isBoolean().withMessage('pushEnabled debe ser boolean'),
    body('marketingEmails').optional().isBoolean().withMessage('marketingEmails debe ser boolean'),
    body('transactionalEmails').optional().isBoolean().withMessage('transactionalEmails debe ser boolean'),
    body('operationalEmails').optional().isBoolean().withMessage('operationalEmails debe ser boolean'),
    body('promotionalEmails').optional().isBoolean().withMessage('promotionalEmails debe ser boolean'),
    body('eventReminders').optional().isBoolean().withMessage('eventReminders debe ser boolean'),
    body('paymentNotifications').optional().isBoolean().withMessage('paymentNotifications debe ser boolean'),
    body('certificateNotifications').optional().isBoolean().withMessage('certificateNotifications debe ser boolean'),
    body('systemNotifications').optional().isBoolean().withMessage('systemNotifications debe ser boolean'),
    body('frequency').optional().isIn(['immediate', 'daily', 'weekly']).withMessage('frequency debe ser immediate, daily o weekly'),
    body('quietHoursStart').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('quietHoursStart debe tener formato HH:MM'),
    body('quietHoursEnd').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('quietHoursEnd debe tener formato HH:MM'),
    body('timezone').optional().isString().isLength({ min: 1, max: 50 }).withMessage('timezone inválido'),
    handleValidationErrors
  ],
  userPreferencesController.updateUserPreferences
);

/**
 * @swagger
 * /api/v1/user/preferences/reset:
 *   post:
 *     tags: [User Preferences]
 *     summary: Restablecer preferencias por defecto
 *     description: Restablece las preferencias de notificaciones a valores por defecto
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Preferencias restablecidas exitosamente
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
 *                   example: "Preferencias restablecidas exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/UserNotificationPreferences'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 */
router.post('/reset', userPreferencesController.resetUserPreferences);

/**
 * @swagger
 * /api/v1/user/unsubscribe/{token}:
 *   post:
 *     tags: [User Preferences]
 *     summary: Desuscribir de emails promocionales
 *     description: Desuscribe al usuario de emails promocionales usando un token único
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de desuscripción
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [confirm]
 *             properties:
 *               confirm:
 *                 type: boolean
 *                 description: Confirmación de desuscripción
 *                 example: true
 *     responses:
 *       200:
 *         description: Desuscripción exitosa
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
 *                   example: "Te has desuscrito exitosamente de los emails promocionales"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Token inválido o confirmación faltante
 *       500:
 *         description: Error interno del servidor
 */
router.post('/unsubscribe/:token',
  [
    param('token').isString().isLength({ min: 1 }).withMessage('Token de desuscripción requerido'),
    body('confirm').isBoolean().equals('true').withMessage('Debe confirmar la desuscripción'),
    handleValidationErrors
  ],
  userPreferencesController.unsubscribeWithToken
);

/**
 * @swagger
 * /api/v1/admin/user-preferences/stats:
 *   get:
 *     tags: [Admin - User Preferences]
 *     summary: Estadísticas de preferencias (Admin)
 *     description: Obtiene estadísticas globales de preferencias de usuarios (solo administradores)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 1000
 *                     emailEnabled:
 *                       type: integer
 *                       example: 850
 *                     smsEnabled:
 *                       type: integer
 *                       example: 150
 *                     pushEnabled:
 *                       type: integer
 *                       example: 900
 *                     marketingEmailsDisabled:
 *                       type: integer
 *                       example: 200
 *                     promotionalEmailsDisabled:
 *                       type: integer
 *                       example: 150
 *                     unsubscribedUsers:
 *                       type: integer
 *                       example: 120
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/admin/stats', userPreferencesController.getPreferencesStats);

export default router;