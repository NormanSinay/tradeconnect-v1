/**
 * @fileoverview Rutas del Dashboard de Speakers para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas específicas para el dashboard de speakers
 *
 * Archivo: backend/src/routes/speakerDashboard.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { speakerDashboardController } from '../controllers/speakerDashboardController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import {
  speakerDashboardAccess,
  speakerProfileManagement,
  speakerAssignedEvents,
  speakerMaterialsManagement,
  speakerNotifications,
  speakerAvailabilityUpdate
} from '../middleware/speakerAuth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA DASHBOARD DE SPEAKERS
// ====================================================================

// Rate limiter general para operaciones del dashboard
const dashboardLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes al dashboard. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para operaciones de escritura
const dashboardWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 operaciones por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de escritura. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para actualizar perfil
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('El email debe tener un formato válido'),
  body('phone')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono debe tener entre 8 y 20 caracteres'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El país debe tener entre 2 y 100 caracteres'),
  body('shortBio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('La biografía corta no puede exceder 200 caracteres'),
  body('fullBio')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La biografía completa no puede exceder 2000 caracteres'),
  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('La URL de LinkedIn debe ser válida'),
  body('twitterUrl')
    .optional()
    .isURL()
    .withMessage('La URL de Twitter debe ser válida'),
  body('websiteUrl')
    .optional()
    .isURL()
    .withMessage('La URL del sitio web debe ser válida'),
  body('baseRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La tarifa base debe ser un número positivo'),
  body('rateType')
    .optional()
    .isIn(['hourly', 'daily', 'event'])
    .withMessage('El tipo de tarifa debe ser hourly, daily o event'),
  body('modalities')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos una modalidad'),
  body('modalities.*')
    .optional()
    .isIn(['presential', 'virtual', 'hybrid'])
    .withMessage('Modalidad inválida'),
  body('languages')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un idioma'),
  body('languages.*')
    .optional()
    .isIn(['spanish', 'english', 'french', 'german', 'italian', 'portuguese', 'other'])
    .withMessage('Idioma inválido'),
  body('category')
    .optional()
    .isIn(['national', 'international', 'expert', 'special_guest'])
    .withMessage('Categoría inválida'),
  body('specialtyIds')
    .optional()
    .isArray()
    .withMessage('Los IDs de especialidades deben ser un arreglo'),
  body('specialtyIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Los IDs de especialidades deben ser números enteros positivos')
];

// Validación para crear bloqueo de disponibilidad
const createAvailabilityBlockValidation = [
  body('startDate')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  body('endDate')
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La razón no puede exceder 500 caracteres'),
  body('isRecurring')
    .isBoolean()
    .withMessage('isRecurring debe ser un valor booleano'),
  body('recurrencePattern')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Patrón de recurrencia inválido')
];

// ====================================================================
// RUTAS DEL DASHBOARD DE SPEAKERS
// ====================================================================

/**
 * @swagger
 * /api/v1/speakers/dashboard/stats:
 *   get:
 *     tags: [Speaker Dashboard]
 *     summary: Obtener estadísticas del dashboard del speaker
 *     description: Obtiene estadísticas generales del speaker para mostrar en el dashboard
 *     security:
 *       - bearerAuth: []
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
 *                   $ref: '#/components/schemas/SpeakerStats'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', dashboardLimiter, speakerDashboardAccess, speakerDashboardController.getDashboardStats);

/**
 * @swagger
 * /api/v1/speakers/dashboard/events:
 *   get:
 *     tags: [Speaker Dashboard]
 *     summary: Obtener eventos asignados del speaker
 *     description: Obtiene la lista de eventos asignados al speaker con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [tentative, confirmed, cancelled, completed]
 *         description: Filtrar por estado del evento
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Mostrar solo eventos próximos
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
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Eventos obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events', dashboardLimiter, speakerAssignedEvents, speakerDashboardController.getAssignedEvents);

/**
 * @swagger
 * /api/v1/speakers/dashboard/materials:
 *   get:
 *     tags: [Speaker Dashboard]
 *     summary: Obtener materiales del speaker
 *     description: Obtiene la lista de materiales asociados al speaker
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Materiales obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/materials', dashboardLimiter, speakerMaterialsManagement, speakerDashboardController.getSpeakerMaterials);

/**
 * @swagger
 * /api/v1/speakers/dashboard/notifications:
 *   get:
 *     tags: [Speaker Dashboard]
 *     summary: Obtener notificaciones del speaker
 *     description: Obtiene las notificaciones del speaker con paginación
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
 *         description: Número de elementos por página
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Mostrar solo notificaciones no leídas
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/notifications', dashboardLimiter, speakerNotifications, speakerDashboardController.getSpeakerNotifications);

/**
 * @swagger
 * /api/v1/speakers/dashboard/profile:
 *   get:
 *     tags: [Speaker Dashboard]
 *     summary: Obtener perfil del speaker
 *     description: Obtiene la información completa del perfil del speaker
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Speaker no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/profile', dashboardLimiter, speakerProfileManagement, speakerDashboardController.getSpeakerProfile);

/**
 * @swagger
 * /api/v1/speakers/dashboard/profile:
 *   put:
 *     tags: [Speaker Dashboard]
 *     summary: Actualizar perfil del speaker
 *     description: Actualiza la información del perfil del speaker
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSpeakerData'
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Speaker no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/profile', dashboardWriteLimiter, speakerProfileManagement, updateProfileValidation, speakerDashboardController.updateSpeakerProfile);

/**
 * @swagger
 * /api/v1/speakers/dashboard/availability:
 *   get:
 *     tags: [Speaker Dashboard]
 *     summary: Obtener disponibilidad del speaker
 *     description: Obtiene los bloques de disponibilidad del speaker
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Disponibilidad obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/availability', dashboardLimiter, speakerAvailabilityUpdate, speakerDashboardController.getSpeakerAvailability);

/**
 * @swagger
 * /api/v1/speakers/dashboard/availability:
 *   post:
 *     tags: [Speaker Dashboard]
 *     summary: Crear bloqueo de disponibilidad
 *     description: Crea un nuevo bloqueo de disponibilidad para el speaker
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio del bloqueo
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de fin del bloqueo
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Razón del bloqueo de disponibilidad
 *               isRecurring:
 *                 type: boolean
 *                 description: Indica si el bloqueo se repite anualmente
 *               recurrencePattern:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *                 description: Patrón de recurrencia si isRecurring es true
 *     responses:
 *       201:
 *         description: Bloqueo creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       409:
 *         description: Conflicto de disponibilidad
 *       500:
 *         description: Error interno del servidor
 */
router.post('/availability', dashboardWriteLimiter, speakerAvailabilityUpdate, createAvailabilityBlockValidation, speakerDashboardController.createAvailabilityBlock);

export default router;