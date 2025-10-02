/**
 * @fileoverview Rutas de Speakers para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de speakers
 *
 * Archivo: backend/src/routes/speakers.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { speakerController } from '../controllers/speakerController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA SPEAKERS
// ====================================================================

// Rate limiter general para operaciones de speakers
const speakerLimiter = rateLimit({
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

// Validación para crear speaker
const createSpeakerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  body('email')
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
  body('nit')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El NIT debe tener un formato válido'),
  body('cui')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El CUI debe tener un formato válido'),
  body('rtu')
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage('El RTU debe tener entre 5 y 50 caracteres'),
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
    .isFloat({ min: 0 })
    .withMessage('La tarifa base debe ser un número positivo'),
  body('rateType')
    .isIn(['hourly', 'daily', 'event'])
    .withMessage('El tipo de tarifa debe ser hourly, daily o event'),
  body('modalities')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos una modalidad'),
  body('modalities.*')
    .isIn(['presential', 'virtual', 'hybrid'])
    .withMessage('Modalidad inválida'),
  body('languages')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un idioma'),
  body('languages.*')
    .isIn(['spanish', 'english', 'french', 'german', 'italian', 'portuguese', 'other'])
    .withMessage('Idioma inválido'),
  body('category')
    .isIn(['national', 'international', 'expert', 'special_guest'])
    .withMessage('Categoría inválida'),
  body('specialtyIds')
    .optional()
    .isArray()
    .withMessage('Los IDs de especialidades deben ser un arreglo'),
  body('specialtyIds.*')
    .isInt({ min: 1 })
    .withMessage('Los IDs de especialidades deben ser números enteros positivos')
];

// Validación para actualizar speaker
const updateSpeakerValidation = [
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
  body('nit')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El NIT debe tener un formato válido'),
  body('cui')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El CUI debe tener un formato válido'),
  body('rtu')
    .optional()
    .isLength({ min: 5, max: 50 })
    .withMessage('El RTU debe tener entre 5 y 50 caracteres'),
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

// Validación para crear evaluación
const createEvaluationValidation = [
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('overallRating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('El rating general debe estar entre 1 y 5'),
  body('criteriaRatings')
    .isObject()
    .withMessage('Los ratings por criterio deben ser un objeto'),
  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los comentarios no pueden exceder 1000 caracteres'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano'),
  body('evaluationDate')
    .isISO8601()
    .withMessage('La fecha de evaluación debe ser una fecha válida')
];

// Validación para parámetros de ruta
const speakerIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del speaker debe ser un número entero positivo')
];

// Validación para parámetros de consulta
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres'),
  query('category')
    .optional()
    .isIn(['national', 'international', 'expert', 'special_guest'])
    .withMessage('Categoría inválida'),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('El rating mínimo debe estar entre 0 y 5'),
  query('modalities')
    .optional()
    .isArray()
    .withMessage('Las modalidades deben ser un arreglo'),
  query('modalities.*')
    .optional()
    .isIn(['presential', 'virtual', 'hybrid'])
    .withMessage('Modalidad inválida'),
  query('languages')
    .optional()
    .isArray()
    .withMessage('Los idiomas deben ser un arreglo'),
  query('languages.*')
    .optional()
    .isIn(['spanish', 'english', 'french', 'german', 'italian', 'portuguese', 'other'])
    .withMessage('Idioma inválido'),
  query('specialties')
    .optional()
    .isArray()
    .withMessage('Las especialidades deben ser un arreglo'),
  query('specialties.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Los IDs de especialidades deben ser números enteros positivos'),
  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'rating', 'totalEvents', 'baseRate', 'createdAt', 'verifiedAt'])
    .withMessage('Campo de ordenamiento inválido'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Orden inválido')
];

// ====================================================================
// RUTAS PÚBLICAS
// ====================================================================

/**
 * @swagger
 * /api/speakers:
 *   get:
 *     tags: [Speakers]
 *     summary: Listar speakers activos
 *     description: Obtiene una lista de speakers activos con filtros
 */
router.get('/', speakerLimiter, queryValidation, speakerController.getActiveSpeakers);

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/speakers:
 *   post:
 *     tags: [Speakers]
 *     summary: Crear speaker
 *     description: Crea un nuevo speaker
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticated, createEditLimiter, createSpeakerValidation, speakerController.createSpeaker);

/**
 * @swagger
 * /api/speakers/{id}:
 *   get:
 *     tags: [Speakers]
 *     summary: Obtener speaker
 *     description: Obtiene detalles de un speaker específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', speakerLimiter, speakerIdValidation, speakerController.getSpeaker);

/**
 * @swagger
 * /api/speakers/{id}:
 *   put:
 *     tags: [Speakers]
 *     summary: Actualizar speaker
 *     description: Actualiza información de un speaker específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', authenticated, createEditLimiter, speakerIdValidation, updateSpeakerValidation, speakerController.updateSpeaker);

/**
 * @swagger
 * /api/speakers/{id}:
 *   delete:
 *     tags: [Speakers]
 *     summary: Eliminar speaker
 *     description: Elimina un speaker (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', authenticated, speakerLimiter, speakerIdValidation, speakerController.deleteSpeaker);

/**
 * @swagger
 * /api/speakers/{id}/verify:
 *   post:
 *     tags: [Speakers]
 *     summary: Verificar speaker
 *     description: Marca un speaker como verificado administrativamente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/verify', authenticated, speakerLimiter, speakerIdValidation, speakerController.verifySpeaker);

/**
 * @swagger
 * /api/speakers/{id}/availability:
 *   post:
 *     tags: [Speakers]
 *     summary: Crear bloqueo de disponibilidad
 *     description: Crea un bloqueo de fechas no disponibles para un speaker
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/availability', authenticated, createEditLimiter, speakerIdValidation, createAvailabilityBlockValidation, speakerController.createAvailabilityBlock);

/**
 * @swagger
 * /api/speakers/{id}/evaluate:
 *   post:
 *     tags: [Speakers]
 *     summary: Evaluar speaker
 *     description: Crea una evaluación para un speaker después de un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/evaluate', authenticated, speakerLimiter, speakerIdValidation, createEvaluationValidation, speakerController.createSpeakerEvaluation);

export default router;