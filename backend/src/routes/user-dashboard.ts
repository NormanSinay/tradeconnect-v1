/**
 * @fileoverview Rutas del Dashboard de Usuario para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para el dashboard de usuario
 *
 * Archivo: backend/src/routes/user-dashboard.ts
 */

import { Router } from 'express';
import { param, query, body } from 'express-validator';
import { userDashboardController } from '../controllers/userDashboardController';
import { authenticated } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';

const router = Router();

// Rate limiter para dashboard de usuario
const dashboardLimiter = rateLimit({
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

// ====================================================================
// VALIDACIONES
// ====================================================================

const queryValidation = [
  query('category').optional().isString().withMessage('Categoría inválida'),
  query('modality').optional().isIn(['virtual', 'presencial', 'hibrido']).withMessage('Modalidad inválida'),
  query('dateFrom').optional().isISO8601().withMessage('Fecha desde inválida'),
  query('dateTo').optional().isISO8601().withMessage('Fecha hasta inválida'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100')
];

const evaluationValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Calificación debe estar entre 1 y 5'),
  body('comments').optional().isString().isLength({ max: 1000 }).withMessage('Comentarios demasiado largos')
];

const paramIdValidation = [
  param('eventId').isInt({ min: 1 }).withMessage('ID de evento inválido')
];

const qrIdValidation = [
  param('qrId').isInt({ min: 1 }).withMessage('ID de QR inválido')
];

const certificateIdValidation = [
  param('certificateId').isInt({ min: 1 }).withMessage('ID de certificado inválido')
];

const evaluationIdValidation = [
  param('evaluationId').isInt({ min: 1 }).withMessage('ID de evaluación inválido')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/v1/user/events:
 *   get:
 *     tags: [User Dashboard]
 *     summary: Obtener eventos disponibles
 *     description: Obtiene lista de eventos disponibles para inscripción con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: modality
 *         schema:
 *           type: string
 *           enum: [virtual, presencial, hibrido]
 *         description: Filtrar por modalidad
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
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
 *           default: 12
 *         description: Eventos por página
 *     responses:
 *       200:
 *         description: Eventos obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events', authenticated, dashboardLimiter, queryValidation, userDashboardController.getAvailableEvents);

/**
 * @swagger
 * /api/v1/user/registrations:
 *   get:
 *     tags: [User Dashboard]
 *     summary: Obtener inscripciones del usuario
 *     description: Obtiene todas las inscripciones del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inscripciones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/registrations', authenticated, dashboardLimiter, userDashboardController.getUserRegistrations);

/**
 * @swagger
 * /api/v1/user/certificates:
 *   get:
 *     tags: [User Dashboard]
 *     summary: Obtener certificados del usuario
 *     description: Obtiene todos los certificados del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificados obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/certificates', authenticated, dashboardLimiter, userDashboardController.getUserCertificates);

/**
 * @swagger
 * /api/v1/user/qr-codes:
 *   get:
 *     tags: [User Dashboard]
 *     summary: Obtener códigos QR del usuario
 *     description: Obtiene todos los códigos QR del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Códigos QR obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/qr-codes', authenticated, dashboardLimiter, userDashboardController.getUserQrCodes);

/**
 * @swagger
 * /api/v1/user/evaluations:
 *   get:
 *     tags: [User Dashboard]
 *     summary: Obtener evaluaciones del usuario
 *     description: Obtiene todas las evaluaciones pendientes y completadas del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evaluaciones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/evaluations', authenticated, dashboardLimiter, userDashboardController.getUserEvaluations);

/**
 * @swagger
 * /api/v1/user/events/{eventId}/register:
 *   post:
 *     tags: [User Dashboard]
 *     summary: Inscribirse a un evento
 *     description: Inscribe al usuario autenticado en el evento especificado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       201:
 *         description: Inscripción realizada exitosamente
 *       400:
 *         description: Ya está inscrito o evento lleno
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:eventId/register', authenticated, dashboardLimiter, paramIdValidation, userDashboardController.registerForEvent);

/**
 * @swagger
 * /api/v1/user/evaluations/{evaluationId}:
 *   post:
 *     tags: [User Dashboard]
 *     summary: Enviar evaluación de evento
 *     description: Envía la evaluación de un evento completado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la evaluación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación del evento (1-5)
 *               comments:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Comentarios adicionales
 *     responses:
 *       200:
 *         description: Evaluación enviada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Evaluación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/evaluations/:evaluationId', authenticated, dashboardLimiter, evaluationIdValidation, evaluationValidation, userDashboardController.submitEvaluation);

/**
 * @swagger
 * /api/v1/user/qr-codes/{qrId}/download:
 *   get:
 *     tags: [User Dashboard]
 *     summary: Descargar código QR
 *     description: Descarga el código QR del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del código QR
 *     responses:
 *       200:
 *         description: Código QR obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Código QR no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/qr-codes/:qrId/download', authenticated, dashboardLimiter, qrIdValidation, userDashboardController.downloadQrCode);

/**
 * @swagger
 * /api/v1/user/certificates/{certificateId}/download:
 *   get:
 *     tags: [User Dashboard]
 *     summary: Descargar certificado
 *     description: Descarga el certificado del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del certificado
 *     responses:
 *       200:
 *         description: Certificado obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Certificado no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/certificates/:certificateId/download', authenticated, dashboardLimiter, certificateIdValidation, userDashboardController.downloadCertificate);

export default router;
