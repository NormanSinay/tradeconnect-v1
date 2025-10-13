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
 *     description: Obtiene una lista paginada de speakers activos con filtros avanzados para búsqueda y selección
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de speakers por página
 *         example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: "Término de búsqueda (nombre, apellido, especialidades)"
 *         example: "Juan Pérez"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ["national", "international", "expert", "special_guest"]
 *         description: Filtrar por categoría de speaker
 *         example: "expert"
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Rating mínimo del speaker
 *         example: 4.0
 *       - in: query
 *         name: modalities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["presential", "virtual", "hybrid"]
 *         description: "Modalidades disponibles (presencial, virtual, híbrido)"
 *         example: ["virtual", "hybrid"]
 *       - in: query
 *         name: languages
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["spanish", "english", "french", "german", "italian", "portuguese", "other"]
 *         description: Idiomas hablados por el speaker
 *         example: ["spanish", "english"]
 *       - in: query
 *         name: specialties
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 1
 *         description: IDs de especialidades
 *         example: [1, 3, 5]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ["firstName", "lastName", "rating", "totalEvents", "baseRate", "createdAt", "verifiedAt"]
 *           default: rating
 *         description: Campo por el cual ordenar
 *         example: "rating"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: ["ASC", "DESC"]
 *           default: DESC
 *         description: Orden de clasificación
 *         example: "DESC"
 *     responses:
 *       200:
 *         description: Speakers obtenidos exitosamente
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
 *                   example: "Speakers obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     speakers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           firstName:
 *                             type: string
 *                             example: "María"
 *                           lastName:
 *                             type: string
 *                             example: "González"
 *                           avatar:
 *                             type: string
 *                             format: uri
 *                             example: "https://example.com/avatar.jpg"
 *                           category:
 *                             type: string
 *                             enum: ["national", "international", "expert", "special_guest"]
 *                             example: "expert"
 *                           shortBio:
 *                             type: string
 *                             example: "Experta en transformación digital con 15 años de experiencia"
 *                           modalities:
 *                             type: array
 *                             items:
 *                               type: string
 *                               enum: ["presential", "virtual", "hybrid"]
 *                             example: ["virtual", "hybrid"]
 *                           languages:
 *                             type: array
 *                             items:
 *                               type: string
 *                               enum: ["spanish", "english", "french", "german", "italian", "portuguese", "other"]
 *                             example: ["spanish", "english"]
 *                           specialties:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 name:
 *                                   type: string
 *                                   example: "Transformación Digital"
 *                             example: [{ "id": 1, "name": "Transformación Digital" }]
 *                           rating:
 *                             type: number
 *                             minimum: 0
 *                             maximum: 5
 *                             example: 4.8
 *                           totalEvents:
 *                             type: integer
 *                             example: 45
 *                           baseRate:
 *                             type: number
 *                             example: 150.00
 *                           rateType:
 *                             type: string
 *                             enum: ["hourly", "daily", "event"]
 *                             example: "hourly"
 *                           isVerified:
 *                             type: boolean
 *                             example: true
 *                           verifiedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-06-15T10:00:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *             examples:
 *               speakers_listados:
 *                 summary: Speakers listados exitosamente
 *                 value:
 *                   success: true
 *                   message: "Speakers obtenidos exitosamente"
 *                   data:
 *                     speakers:
 *                       - id: 1
 *                         firstName: "Maria"
 *                         lastName: "Gonzalez"
 *                         avatar: "https://example.com/avatar.jpg"
 *                         category: "expert"
 *                         shortBio: "Experta en transformación digital con 15 años de experiencia"
 *                         modalities: ["virtual", "hybrid"]
 *                         languages: ["spanish", "english"]
 *                         specialties:
 *                           - id: 1
 *                             name: "Transformación Digital"
 *                         rating: 4.8
 *                         totalEvents: 45
 *                         baseRate: 150.00
 *                         rateType: "hourly"
 *                         isVerified: true
 *                         verifiedAt: "2023-06-15T10:00:00.000Z"
 *                       - id: 2
 *                         firstName: "Carlos"
 *                         lastName: "Rodríguez"
 *                         category: "national"
 *                         shortBio: "Especialista en ciberseguridad empresarial"
 *                         modalities: ["presential", "virtual"]
 *                         languages: ["spanish"]
 *                         specialties:
 *                           - id: 2
 *                             name: "Ciberseguridad"
 *                         rating: 4.5
 *                         totalEvents: 28
 *                         baseRate: 120.00
 *                         rateType: "daily"
 *                         isVerified: true
 *                         verifiedAt: "2023-08-20T14:30:00.000Z"
 *                     pagination:
 *                       page: 1
 *                       limit: 20
 *                       total: 150
 *                       totalPages: 8
 *                       hasNext: true
 *                       hasPrev: false
 *       400:
 *         description: Parámetros de consulta inválidos
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
 *                   example: "Rating mínimo debe estar entre 0 y 5"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
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
 *     description: Crea un nuevo speaker con toda su información profesional y de contacto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - baseRate
 *               - rateType
 *               - modalities
 *               - languages
 *               - category
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre del speaker
 *                 example: "María"
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Apellido del speaker
 *                 example: "González"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "maria.gonzalez@ejemplo.com"
 *               phone:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 20
 *                 description: Número de teléfono
 *                 example: "+502 5555-1234"
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: País de residencia
 *                 example: "Guatemala"
 *               nit:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 20
 *                 description: Número de Identificación Tributaria
 *                 example: "12345678-9"
 *               cui:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 20
 *                 description: Código Único de Identificación
 *                 example: "1234567890123"
 *               rtu:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 50
 *                 description: Registro Tributario Unificado
 *                 example: "RTU-12345678"
 *               shortBio:
 *                 type: string
 *                 maxLength: 200
 *                 description: Biografía corta para listados
 *                 example: "Experta en transformación digital con 15 años de experiencia"
 *               fullBio:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Biografía completa detallada
 *                 example: "María González es una reconocida experta en transformación digital con más de 15 años de experiencia..."
 *               linkedinUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL del perfil de LinkedIn
 *                 example: "https://linkedin.com/in/mariagonzalez"
 *               twitterUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL del perfil de Twitter
 *                 example: "https://twitter.com/mariagonzalez"
 *               websiteUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL del sitio web personal
 *                 example: "https://mariagonzalez.com"
 *               baseRate:
 *                 type: number
 *                 minimum: 0
 *                 description: Tarifa base por el servicio
 *                 example: 150.00
 *               rateType:
 *                 type: string
 *                 enum: ["hourly", "daily", "event"]
 *                 description: "Tipo de tarifa (por hora, día o evento)"
 *                 example: "hourly"
 *               modalities:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   enum: ["presential", "virtual", "hybrid"]
 *                 description: Modalidades disponibles
 *                 example: ["virtual", "hybrid"]
 *               languages:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   enum: ["spanish", "english", "french", "german", "italian", "portuguese", "other"]
 *                 description: Idiomas hablados
 *                 example: ["spanish", "english"]
 *               category:
 *                 type: string
 *                 enum: ["national", "international", "expert", "special_guest"]
 *                 description: Categoría del speaker
 *                 example: "expert"
 *               specialtyIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 description: IDs de especialidades del speaker
 *                 example: [1, 3, 5]
 *           examples:
 *             crear_speaker_completo:
 *               summary: Crear speaker con información completa
 *               value:
 *                 firstName: "María"
 *                 lastName: "González"
 *                 email: "maria.gonzalez@ejemplo.com"
 *                 phone: "+502 5555-1234"
 *                 country: "Guatemala"
 *                 nit: "12345678-9"
 *                 cui: "1234567890123"
 *                 rtu: "RTU-12345678"
 *                 shortBio: "Experta en transformación digital con 15 años de experiencia"
 *                 fullBio: "Experta en transformación digital."
 *                 linkedinUrl: "https://linkedin.com/in/mariagonzalez"
 *                 twitterUrl: "https://twitter.com/mariagonzalez"
 *                 websiteUrl: "https://mariagonzalez.com"
 *                 baseRate: 150.00
 *                 rateType: "hourly"
 *                 modalities: ["virtual", "hybrid"]
 *                 languages: ["spanish", "english"]
 *                 category: "expert"
 *                 specialtyIds: [1, 3, 5]
 *     responses:
 *       201:
 *         description: Speaker creado exitosamente
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
 *                   example: "Speaker creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     speaker:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           example: "María"
 *                         lastName:
 *                           type: string
 *                           example: "González"
 *                         email:
 *                           type: string
 *                           example: "maria.gonzalez@ejemplo.com"
 *                         category:
 *                           type: string
 *                           example: "expert"
 *                         modalities:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["virtual", "hybrid"]
 *                         languages:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["spanish", "english"]
 *                         baseRate:
 *                           type: number
 *                           example: 150.00
 *                         rateType:
 *                           type: string
 *                           example: "hourly"
 *                         isVerified:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T10:00:00.000Z"
 *             examples:
 *               speaker_creado:
 *                 summary: Speaker creado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Speaker creado exitosamente"
 *                   data:
 *                     speaker:
 *                       id: 1
 *                       firstName: "María"
 *                       lastName: "González"
 *                       email: "maria.gonzalez@ejemplo.com"
 *                       category: "expert"
 *                       modalities: ["virtual", "hybrid"]
 *                       languages: ["spanish", "english"]
 *                       baseRate: 150.00
 *                       rateType: "hourly"
 *                       isVerified: false
 *                       createdAt: "2023-10-15T10:00:00.000Z"
 *       400:
 *         description: Datos inválidos o email ya registrado
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
 *                   example: "El email ya está registrado para otro speaker"
 *                 error:
 *                   type: string
 *                   example: "SPEAKER_EMAIL_EXISTS"
 *       401:
 *         description: Token inválido
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
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       403:
 *         description: Permisos insuficientes
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
 *                   example: "No tienes permisos para crear speakers"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       429:
 *         description: Demasiadas operaciones de creación/edición
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
 *                   example: "Demasiadas operaciones de creación/edición. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/', authenticated, createEditLimiter, createSpeakerValidation, speakerController.createSpeaker);

/**
 * @swagger
 * /api/speakers/{id}:
 *   get:
 *     tags: [Speakers]
 *     summary: Obtener speaker
 *     description: "Obtiene información completa y detallada de un speaker específico"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: "ID único del speaker"
 *         example: 1
 *     responses:
 *       200:
 *         description: Speaker obtenido exitosamente
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
 *                   example: "Speaker obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     speaker:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         firstName:
 *                           type: string
 *                           example: "María"
 *                         lastName:
 *                           type: string
 *                           example: "González"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "maria.gonzalez@ejemplo.com"
 *                         phone:
 *                           type: string
 *                           example: "+502 5555-1234"
 *                         country:
 *                           type: string
 *                           example: "Guatemala"
 *                         avatar:
 *                           type: string
 *                           format: uri
 *                           example: "https://example.com/avatar.jpg"
 *                         nit:
 *                           type: string
 *                           example: "12345678-9"
 *                         cui:
 *                           type: string
 *                           example: "1234567890123"
 *                         rtu:
 *                           type: string
 *                           example: "RTU-12345678"
 *                         shortBio:
 *                           type: string
 *                           example: "Experta en transformación digital con 15 años de experiencia"
 *                         fullBio:
 *                           type: string
 *                           example: "María González es una reconocida experta en transformación digital..."
 *                         linkedinUrl:
 *                           type: string
 *                           format: uri
 *                           example: "https://linkedin.com/in/mariagonzalez"
 *                         twitterUrl:
 *                           type: string
 *                           format: uri
 *                           example: "https://twitter.com/mariagonzalez"
 *                         websiteUrl:
 *                           type: string
 *                           format: uri
 *                           example: "https://mariagonzalez.com"
 *                         category:
 *                           type: string
 *                           enum: ["national", "international", "expert", "special_guest"]
 *                           example: "expert"
 *                         modalities:
 *                           type: array
 *                           items:
 *                             type: string
 *                             enum: ["presential", "virtual", "hybrid"]
 *                           example: ["virtual", "hybrid"]
 *                         languages:
 *                           type: array
 *                           items:
 *                             type: string
 *                             enum: ["spanish", "english", "french", "german", "italian", "portuguese", "other"]
 *                           example: ["spanish", "english"]
 *                         specialties:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               name:
 *                                 type: string
 *                                 example: "Transformación Digital"
 *                               description:
 *                                 type: string
 *                                 example: "Estrategias para modernizar procesos empresariales"
 *                           example:
 *                             - id: 1
 *                               name: "Transformación Digital"
 *                               description: "Estrategias para modernizar procesos empresariales"
 *                         baseRate:
 *                           type: number
 *                           example: 150.00
 *                         rateType:
 *                           type: string
 *                           enum: ["hourly", "daily", "event"]
 *                           example: "hourly"
 *                         rating:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 5
 *                           example: 4.8
 *                         totalEvents:
 *                           type: integer
 *                           example: 45
 *                         totalEvaluations:
 *                           type: integer
 *                           example: 38
 *                         isVerified:
 *                           type: boolean
 *                           example: true
 *                         verifiedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-06-15T10:00:00.000Z"
 *                         availabilityBlocks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2023-12-01T00:00:00.000Z"
 *                               endDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2023-12-31T23:59:59.000Z"
 *                               reason:
 *                                 type: string
 *                                 example: "Vacaciones de fin de año"
 *                               isRecurring:
 *                                 type: boolean
 *                                 example: false
 *                           example:
 *                             - id: 1
 *                               startDate: "2023-12-01T00:00:00.000Z"
 *                               endDate: "2023-12-31T23:59:59.000Z"
 *                               reason: "Vacaciones de fin de año"
 *                               isRecurring: false
 *                         recentEvaluations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               eventId:
 *                                 type: integer
 *                                 example: 123
 *                               eventTitle:
 *                                 type: string
 *                                 example: "Conferencia Tech 2023"
 *                               overallRating:
 *                                 type: number
 *                                 minimum: 1
 *                                 maximum: 5
 *                                 example: 5
 *                               comments:
 *                                 type: string
 *                                 example: "Excelente presentación, muy claro y didáctico"
 *                               evaluationDate:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2023-10-01T18:00:00.000Z"
 *                           example:
 *                             - id: 1
 *                               eventId: 123
 *                               eventTitle: "Conferencia Tech 2023"
 *                               overallRating: 5
 *                               comments: "Excelente presentación, muy claro y didáctico"
 *                               evaluationDate: "2023-10-01T18:00:00.000Z"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-15T10:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T14:30:00.000Z"
 *             examples:
 *               speaker_detallado:
 *                 summary: Speaker obtenido exitosamente
 *                 value:
 *                   success: true
 *                   message: "Speaker obtenido exitosamente"
 *                   data:
 *                     speaker:
 *                       id: 1
 *                       firstName: "María"
 *                       lastName: "González"
 *                       email: "maria.gonzalez@ejemplo.com"
 *                       phone: "+502 5555-1234"
 *                       country: "Guatemala"
 *                       avatar: "https://example.com/avatar.jpg"
 *                       shortBio: "Experta en transformación digital con 15 años de experiencia"
 *                       fullBio: "Experta en transformación digital."
 *                       linkedinUrl: "https://linkedin.com/in/mariagonzalez"
 *                       category: "expert"
 *                       modalities: ["virtual", "hybrid"]
 *                       languages: ["spanish", "english"]
 *                       specialties: [{ "id": 1, "name": "Transformación Digital", "description": "Estrategias para modernizar procesos empresariales" }]
 *                       baseRate: 150.00
 *                       rateType: "hourly"
 *                       rating: 4.8
 *                       totalEvents: 45
 *                       totalEvaluations: 38
 *                       isVerified: true
 *                       verifiedAt: "2023-06-15T10:00:00.000Z"
 *                       availabilityBlocks: [{ "id": 1, "startDate": "2023-12-01T00:00:00.000Z", "endDate": "2023-12-31T23:59:59.000Z", "reason": "Vacaciones de fin de año", "isRecurring": false }]
 *                       recentEvaluations: [{ "id": 1, "eventId": 123, "eventTitle": "Conferencia Tech 2023", "overallRating": 5, "comments": "Excelente presentación, muy claro y didáctico", "evaluationDate": "2023-10-01T18:00:00.000Z" }]
 *                       createdAt: "2023-01-15T10:00:00.000Z"
 *                       updatedAt: "2023-10-01T14:30:00.000Z"
 *       404:
 *         description: Speaker no encontrado
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
 *                   example: "Speaker no encontrado"
 *                 error:
 *                   type: string
 *                   example: "SPEAKER_NOT_FOUND"
 *       429:
 *         description: Demasiadas solicitudes
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
 *                   example: "Demasiadas solicitudes. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.get('/:id', speakerLimiter, speakerIdValidation, speakerController.getSpeaker);

/**
  * @swagger
  * /api/speakers/{id}:
  *   put:
  *     tags: [Speakers]
  *     summary: Actualizar speaker
  *     description: Actualiza información de un speaker específico con validación completa de datos
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: integer
  *           minimum: 1
  *         description: ID único del speaker
  *         example: 1
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               firstName:
  *                 type: string
  *                 minLength: 2
  *                 maxLength: 100
  *                 description: Nombre del speaker
  *                 example: "María"
  *               lastName:
  *                 type: string
  *                 minLength: 2
  *                 maxLength: 100
  *                 description: Apellido del speaker
  *                 example: "González"
  *               email:
  *                 type: string
  *                 format: email
  *                 description: Correo electrónico único
  *                 example: "maria.gonzalez@ejemplo.com"
  *               phone:
  *                 type: string
  *                 minLength: 8
  *                 maxLength: 20
  *                 description: Número de teléfono
  *                 example: "+502 5555-1234"
  *               country:
  *                 type: string
  *                 minLength: 2
  *                 maxLength: 100
  *                 description: País de residencia
  *                 example: "Guatemala"
  *               nit:
  *                 type: string
  *                 minLength: 8
  *                 maxLength: 20
  *                 description: Número de Identificación Tributaria
  *                 example: "12345678-9"
  *               cui:
  *                 type: string
  *                 minLength: 8
  *                 maxLength: 20
  *                 description: Código Único de Identificación
  *                 example: "1234567890123"
  *               rtu:
  *                 type: string
  *                 minLength: 5
  *                 maxLength: 50
  *                 description: Registro Tributario Unificado
  *                 example: "RTU-12345678"
  *               shortBio:
  *                 type: string
  *                 maxLength: 200
  *                 description: Biografía corta para listados
  *                 example: "Experta en transformación digital con 16 años de experiencia"
  *               fullBio:
  *                 type: string
  *                 maxLength: 2000
  *                 description: Biografía completa detallada
  *                 example: "María González es una reconocida experta en transformación digital con más de 16 años de experiencia..."
  *               linkedinUrl:
  *                 type: string
  *                 format: uri
  *                 description: URL del perfil de LinkedIn
  *                 example: "https://linkedin.com/in/mariagonzalez"
  *               twitterUrl:
  *                 type: string
  *                 format: uri
  *                 description: URL del perfil de Twitter
  *                 example: "https://twitter.com/mariagonzalez"
  *               websiteUrl:
  *                 type: string
  *                 format: uri
  *                 description: URL del sitio web personal
  *                 example: "https://mariagonzalez.com"
  *               baseRate:
  *                 type: number
  *                 minimum: 0
  *                 description: Tarifa base por el servicio
  *                 example: 160.00
  *               rateType:
  *                 type: string
  *                 enum: ["hourly", "daily", "event"]
  *                 description: "Tipo de tarifa (por hora, día o evento)"
  *                 example: "hourly"
  *               modalities:
  *                 type: array
  *                 minItems: 1
  *                 items:
  *                   type: string
  *                   enum: ["presential", "virtual", "hybrid"]
  *                 description: Modalidades disponibles
  *                 example: ["virtual", "hybrid"]
  *               languages:
  *                 type: array
  *                 minItems: 1
  *                 items:
  *                   type: string
  *                   enum: ["spanish", "english", "french", "german", "italian", "portuguese", "other"]
  *                 description: Idiomas hablados
  *                 example: ["spanish", "english"]
  *               category:
  *                 type: string
  *                 enum: ["national", "international", "expert", "special_guest"]
  *                 description: Categoría del speaker
  *                 example: "expert"
  *               specialtyIds:
  *                 type: array
  *                 items:
  *                   type: integer
  *                   minimum: 1
  *                 description: IDs de especialidades del speaker
  *                 example: [1, 3, 5]
  *           examples:
  *             actualizar_speaker:
  *               summary: Actualizar información del speaker
  *               value:
  *                 firstName: "María"
  *                 lastName: "González"
  *                 email: "maria.gonzalez@ejemplo.com"
  *                 phone: "+502 5555-1234"
  *                 shortBio: "Experta en transformación digital con 16 años de experiencia"
  *                 baseRate: 160.00
  *                 modalities: ["virtual", "hybrid"]
  *                 languages: ["spanish", "english"]
  *                 specialtyIds: [1, 3, 5]
  *     responses:
  *       200:
  *         description: Speaker actualizado exitosamente
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
  *                   example: "Speaker actualizado exitosamente"
  *                 data:
  *                   type: object
  *                   properties:
  *                     speaker:
  *                       type: object
  *                       properties:
  *                         id:
  *                           type: integer
  *                           example: 1
  *                         firstName:
  *                           type: string
  *                           example: "María"
  *                         lastName:
  *                           type: string
  *                           example: "González"
  *                         email:
  *                           type: string
  *                           example: "maria.gonzalez@ejemplo.com"
  *                         category:
  *                           type: string
  *                           example: "expert"
  *                         modalities:
  *                           type: array
  *                           items:
  *                             type: string
  *                           example: ["virtual", "hybrid"]
  *                         languages:
  *                           type: array
  *                           items:
  *                             type: string
  *                           example: ["spanish", "english"]
  *                         baseRate:
  *                           type: number
  *                           example: 160.00
  *                         rateType:
  *                           type: string
  *                           example: "hourly"
  *                         isVerified:
  *                           type: boolean
  *                           example: true
  *                         updatedAt:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-10-20T16:45:00.000Z"
  *             examples:
  *               speaker_actualizado:
  *                 summary: Speaker actualizado exitosamente
  *                 value:
  *                   success: true
  *                   message: "Speaker actualizado exitosamente"
  *                   data:
  *                     speaker:
  *                       id: 1
  *                       firstName: "María"
  *                       lastName: "González"
  *                       email: "maria.gonzalez@ejemplo.com"
  *                       category: "expert"
  *                       modalities: ["virtual", "hybrid"]
  *                       languages: ["spanish", "english"]
  *                       baseRate: 160.00
  *                       rateType: "hourly"
  *                       isVerified: true
  *                       updatedAt: "2023-10-20T16:45:00.000Z"
  *       400:
  *         description: Datos inválidos o email ya registrado
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
  *                   example: "El email ya está registrado para otro speaker"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_EMAIL_EXISTS"
  *       401:
  *         description: Token inválido
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
  *                   example: "Token de autenticación inválido"
  *                 error:
  *                   type: string
  *                   example: "INVALID_TOKEN"
  *       403:
  *         description: Permisos insuficientes
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
  *                   example: "No tienes permisos para actualizar este speaker"
  *                 error:
  *                   type: string
  *                   example: "INSUFFICIENT_PERMISSIONS"
  *       404:
  *         description: Speaker no encontrado
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
  *                   example: "Speaker no encontrado"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_NOT_FOUND"
  *       429:
  *         description: Demasiadas operaciones de edición
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
  *                   example: "Demasiadas operaciones de creación/edición. Intente más tarde."
  *                 error:
  *                   type: string
  *                   example: "RATE_LIMIT_EXCEEDED"
  */
router.put('/:id', authenticated, createEditLimiter, speakerIdValidation, updateSpeakerValidation, speakerController.updateSpeaker);

/**
  * @swagger
  * /api/speakers/{id}:
  *   delete:
  *     tags: [Speakers]
  *     summary: Eliminar speaker
  *     description: Elimina un speaker (soft delete - marca como inactivo)
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: integer
  *           minimum: 1
  *         description: ID único del speaker
  *         example: 1
  *     responses:
  *       200:
  *         description: Speaker eliminado exitosamente
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
  *                   example: "Speaker eliminado exitosamente"
  *                 data:
  *                   type: object
  *                   properties:
  *                     speaker:
  *                       type: object
  *                       properties:
  *                         id:
  *                           type: integer
  *                           example: 1
  *                         firstName:
  *                           type: string
  *                           example: "María"
  *                         lastName:
  *                           type: string
  *                           example: "González"
  *                         email:
  *                           type: string
  *                           example: "maria.gonzalez@ejemplo.com"
  *                         status:
  *                           type: string
  *                           example: "inactive"
  *                         deletedAt:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-10-25T09:15:00.000Z"
  *             examples:
  *               speaker_eliminado:
  *                 summary: Speaker eliminado exitosamente
  *                 value:
  *                   success: true
  *                   message: "Speaker eliminado exitosamente"
  *                   data:
  *                     speaker:
  *                       id: 1
  *                       firstName: "María"
  *                       lastName: "González"
  *                       email: "maria.gonzalez@ejemplo.com"
  *                       status: "inactive"
  *                       deletedAt: "2023-10-25T09:15:00.000Z"
  *       401:
  *         description: Token inválido
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
  *                   example: "Token de autenticación inválido"
  *                 error:
  *                   type: string
  *                   example: "INVALID_TOKEN"
  *       403:
  *         description: Permisos insuficientes
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
  *                   example: "No tienes permisos para eliminar este speaker"
  *                 error:
  *                   type: string
  *                   example: "INSUFFICIENT_PERMISSIONS"
  *       404:
  *         description: Speaker no encontrado
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
  *                   example: "Speaker no encontrado"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_NOT_FOUND"
  *       409:
  *         description: No se puede eliminar speaker con contratos activos
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
  *                   example: "No se puede eliminar un speaker que tiene contratos activos"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_HAS_ACTIVE_CONTRACTS"
  *       429:
  *         description: Demasiadas solicitudes
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
  *                   example: "Demasiadas solicitudes. Intente más tarde."
  *                 error:
  *                   type: string
  *                   example: "RATE_LIMIT_EXCEEDED"
  */
router.delete('/:id', authenticated, speakerLimiter, speakerIdValidation, speakerController.deleteSpeaker);

/**
  * @swagger
  * /api/speakers/{id}/verify:
  *   post:
  *     tags: [Speakers]
  *     summary: Verificar speaker
  *     description: Marca un speaker como verificado administrativamente después de validar su información y credenciales
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: integer
  *           minimum: 1
  *         description: ID único del speaker
  *         example: 1
  *     responses:
  *       200:
  *         description: Speaker verificado exitosamente
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
  *                   example: "Speaker verificado exitosamente"
  *                 data:
  *                   type: object
  *                   properties:
  *                     speaker:
  *                       type: object
  *                       properties:
  *                         id:
  *                           type: integer
  *                           example: 1
  *                         firstName:
  *                           type: string
  *                           example: "María"
  *                         lastName:
  *                           type: string
  *                           example: "González"
  *                         email:
  *                           type: string
  *                           example: "maria.gonzalez@ejemplo.com"
  *                         isVerified:
  *                           type: boolean
  *                           example: true
  *                         verifiedAt:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-10-15T10:00:00.000Z"
  *                         verifiedBy:
  *                           type: integer
  *                           example: 5
  *             examples:
  *               speaker_verificado:
  *                 summary: Speaker verificado exitosamente
  *                 value:
  *                   success: true
  *                   message: "Speaker verificado exitosamente"
  *                   data:
  *                     speaker:
  *                       id: 1
  *                       firstName: "María"
  *                       lastName: "González"
  *                       email: "maria.gonzalez@ejemplo.com"
  *                       isVerified: true
  *                       verifiedAt: "2023-10-15T10:00:00.000Z"
  *                       verifiedBy: 5
  *       401:
  *         description: Token inválido
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
  *                   example: "Token de autenticación inválido"
  *                 error:
  *                   type: string
  *                   example: "INVALID_TOKEN"
  *       403:
  *         description: Permisos insuficientes
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
  *                   example: "Solo administradores pueden verificar speakers"
  *                 error:
  *                   type: string
  *                   example: "INSUFFICIENT_PERMISSIONS"
  *       404:
  *         description: Speaker no encontrado
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
  *                   example: "Speaker no encontrado"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_NOT_FOUND"
  *       409:
  *         description: Speaker ya verificado
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
  *                   example: "El speaker ya está verificado"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_ALREADY_VERIFIED"
  *       429:
  *         description: Demasiadas solicitudes
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
  *                   example: "Demasiadas solicitudes. Intente más tarde."
  *                 error:
  *                   type: string
  *                   example: "RATE_LIMIT_EXCEEDED"
  */
router.post('/:id/verify', authenticated, speakerLimiter, speakerIdValidation, speakerController.verifySpeaker);

/**
  * @swagger
  * /api/speakers/{id}/availability:
  *   post:
  *     tags: [Speakers]
  *     summary: Crear bloqueo de disponibilidad
  *     description: Crea un bloqueo de fechas no disponibles para un speaker, impidiendo que sea contratado en esas fechas
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: integer
  *           minimum: 1
  *         description: ID único del speaker
  *         example: 1
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
  *                 example: "2023-12-01T00:00:00.000Z"
  *               endDate:
  *                 type: string
  *                 format: date-time
  *                 description: Fecha y hora de fin del bloqueo
  *                 example: "2023-12-31T23:59:59.000Z"
  *               reason:
  *                 type: string
  *                 maxLength: 500
  *                 description: Razón del bloqueo de disponibilidad
  *                 example: "Vacaciones de fin de año"
  *               isRecurring:
  *                 type: boolean
  *                 description: Indica si el bloqueo se repite anualmente
  *                 example: false
  *               recurrencePattern:
  *                 type: string
  *                 enum: ["daily", "weekly", "monthly", "yearly"]
  *                 description: Patrón de recurrencia si isRecurring es true
  *                 example: "yearly"
  *           examples:
  *             crear_bloqueo_vacaciones:
  *               summary: Crear bloqueo por vacaciones
  *               value:
  *                 startDate: "2023-12-01T00:00:00.000Z"
  *                 endDate: "2023-12-31T23:59:59.000Z"
  *                 reason: "Vacaciones de fin de año"
  *                 isRecurring: false
  *             crear_bloqueo_recurring:
  *               summary: Crear bloqueo recurrente
  *               value:
  *                 startDate: "2023-12-24T00:00:00.000Z"
  *                 endDate: "2023-12-26T23:59:59.000Z"
  *                 reason: "Navidad"
  *                 isRecurring: true
  *                 recurrencePattern: "yearly"
  *     responses:
  *       201:
  *         description: Bloqueo de disponibilidad creado exitosamente
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
  *                   example: "Bloqueo de disponibilidad creado exitosamente"
  *                 data:
  *                   type: object
  *                   properties:
  *                     availabilityBlock:
  *                       type: object
  *                       properties:
  *                         id:
  *                           type: integer
  *                           example: 1
  *                         speakerId:
  *                           type: integer
  *                           example: 1
  *                         startDate:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-12-01T00:00:00.000Z"
  *                         endDate:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-12-31T23:59:59.000Z"
  *                         reason:
  *                           type: string
  *                           example: "Vacaciones de fin de año"
  *                         isRecurring:
  *                           type: boolean
  *                           example: false
  *                         recurrencePattern:
  *                           type: string
  *                           example: null
  *                         createdAt:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-10-15T10:00:00.000Z"
  *             examples:
  *               bloqueo_creado:
  *                 summary: Bloqueo creado exitosamente
  *                 value:
  *                   success: true
  *                   message: "Bloqueo de disponibilidad creado exitosamente"
  *                   data:
  *                     availabilityBlock:
  *                       id: 1
  *                       speakerId: 1
  *                       startDate: "2023-12-01T00:00:00.000Z"
  *                       endDate: "2023-12-31T23:59:59.000Z"
  *                       reason: "Vacaciones de fin de año"
  *                       isRecurring: false
  *                       recurrencePattern: null
  *                       createdAt: "2023-10-15T10:00:00.000Z"
  *       400:
  *         description: Datos inválidos o conflicto de fechas
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
  *                   example: "La fecha de fin debe ser posterior a la fecha de inicio"
  *                 error:
  *                   type: string
  *                   example: "VALIDATION_ERROR"
  *       401:
  *         description: Token inválido
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
  *                   example: "Token de autenticación inválido"
  *                 error:
  *                   type: string
  *                   example: "INVALID_TOKEN"
  *       403:
  *         description: Permisos insuficientes
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
  *                   example: "No tienes permisos para gestionar la disponibilidad de este speaker"
  *                 error:
  *                   type: string
  *                   example: "INSUFFICIENT_PERMISSIONS"
  *       404:
  *         description: Speaker no encontrado
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
  *                   example: "Speaker no encontrado"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_NOT_FOUND"
  *       409:
  *         description: Conflicto con bloqueos existentes
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
  *                   example: "Ya existe un bloqueo de disponibilidad en estas fechas"
  *                 error:
  *                   type: string
  *                   example: "AVAILABILITY_CONFLICT"
  *       429:
  *         description: Demasiadas operaciones de edición
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
  *                   example: "Demasiadas operaciones de creación/edición. Intente más tarde."
  *                 error:
  *                   type: string
  *                   example: "RATE_LIMIT_EXCEEDED"
  */
router.post('/:id/availability', authenticated, createEditLimiter, speakerIdValidation, createAvailabilityBlockValidation, speakerController.createAvailabilityBlock);

/**
  * @swagger
  * /api/speakers/{id}/evaluate:
  *   post:
  *     tags: [Speakers]
  *     summary: Evaluar speaker
  *     description: Crea una evaluación para un speaker después de un evento, permitiendo calificar su desempeño y dejar comentarios
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: integer
  *           minimum: 1
  *         description: ID único del speaker
  *         example: 1
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             required:
  *               - eventId
  *               - overallRating
  *               - criteriaRatings
  *               - isPublic
  *               - evaluationDate
  *             properties:
  *               eventId:
  *                 type: integer
  *                 minimum: 1
  *                 description: ID del evento donde participó el speaker
  *                 example: 123
  *               overallRating:
  *                 type: number
  *                 minimum: 1
  *                 maximum: 5
  *                 description: Rating general del 1 al 5
  *                 example: 5
  *               criteriaRatings:
  *                 type: object
  *                 description: Ratings por criterios específicos
  *                 properties:
  *                   content:
  *                     type: number
  *                     minimum: 1
  *                     maximum: 5
  *                     description: Calidad del contenido
  *                     example: 5
  *                   delivery:
  *                     type: number
  *                     minimum: 1
  *                     maximum: 5
  *                     description: Calidad de la presentación
  *                     example: 5
  *                   engagement:
  *                     type: number
  *                     minimum: 1
  *                     maximum: 5
  *                     description: Nivel de engagement con la audiencia
  *                     example: 4
  *                   punctuality:
  *                     type: number
  *                     minimum: 1
  *                     maximum: 5
  *                     description: Puntualidad
  *                     example: 5
  *                   professionalism:
  *                     type: number
  *                     minimum: 1
  *                     maximum: 5
  *                     description: Profesionalismo
  *                     example: 5
  *               comments:
  *                 type: string
  *                 maxLength: 1000
  *                 description: Comentarios adicionales sobre la presentación
  *                 example: "Excelente presentación, muy claro y didáctico. La audiencia quedó muy satisfecha con el contenido y la manera de transmitir los conceptos."
  *               isPublic:
  *                 type: boolean
  *                 description: Indica si la evaluación es pública
  *                 example: true
  *               evaluationDate:
  *                 type: string
  *                 format: date-time
  *                 description: Fecha cuando se realizó la evaluación
  *                 example: "2023-10-01T18:00:00.000Z"
  *           examples:
  *             crear_evaluacion_completa:
  *               summary: Crear evaluación completa
  *               value:
  *                 eventId: 123
  *                 overallRating: 5
  *                 criteriaRatings:
  *                   content: 5
  *                   delivery: 5
  *                   engagement: 4
  *                   punctuality: 5
  *                   professionalism: 5
  *                 comments: "Excelente presentación, muy claro y didáctico. La audiencia quedó muy satisfecha con el contenido y la manera de transmitir los conceptos."
  *                 isPublic: true
  *                 evaluationDate: "2023-10-01T18:00:00.000Z"
  *     responses:
  *       201:
  *         description: Evaluación creada exitosamente
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
  *                   example: "Evaluación creada exitosamente"
  *                 data:
  *                   type: object
  *                   properties:
  *                     evaluation:
  *                       type: object
  *                       properties:
  *                         id:
  *                           type: integer
  *                           example: 1
  *                         speakerId:
  *                           type: integer
  *                           example: 1
  *                         eventId:
  *                           type: integer
  *                           example: 123
  *                         evaluatorId:
  *                           type: integer
  *                           example: 45
  *                         overallRating:
  *                           type: number
  *                           example: 5
  *                         criteriaRatings:
  *                           type: object
  *                           example:
  *                             content: 5
  *                             delivery: 5
  *                             engagement: 4
  *                             punctuality: 5
  *                             professionalism: 5
  *                         comments:
  *                           type: string
  *                           example: "Excelente presentación, muy claro y didáctico."
  *                         isPublic:
  *                           type: boolean
  *                           example: true
  *                         evaluationDate:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-10-01T18:00:00.000Z"
  *                         createdAt:
  *                           type: string
  *                           format: date-time
  *                           example: "2023-10-01T18:30:00.000Z"
  *             examples:
  *               evaluacion_creada:
  *                 summary: Evaluación creada exitosamente
  *                 value:
  *                   success: true
  *                   message: "Evaluación creada exitosamente"
  *                   data:
  *                     evaluation:
  *                       id: 1
  *                       speakerId: 1
  *                       eventId: 123
  *                       evaluatorId: 45
  *                       overallRating: 5
  *                       criteriaRatings:
  *                         content: 5
  *                         delivery: 5
  *                         engagement: 4
  *                         punctuality: 5
  *                         professionalism: 5
  *                       comments: "Excelente presentación, muy claro y didáctico."
  *                       isPublic: true
  *                       evaluationDate: "2023-10-01T18:00:00.000Z"
  *                       createdAt: "2023-10-01T18:30:00.000Z"
  *       400:
  *         description: Datos inválidos
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
  *                   example: "El rating general debe estar entre 1 y 5"
  *                 error:
  *                   type: string
  *                   example: "VALIDATION_ERROR"
  *       401:
  *         description: Token inválido
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
  *                   example: "Token de autenticación inválido"
  *                 error:
  *                   type: string
  *                   example: "INVALID_TOKEN"
  *       403:
  *         description: Permisos insuficientes
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
  *                   example: "No tienes permisos para evaluar este speaker"
  *                 error:
  *                   type: string
  *                   example: "INSUFFICIENT_PERMISSIONS"
  *       404:
  *         description: Speaker o evento no encontrado
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
  *                   example: "Speaker no encontrado"
  *                 error:
  *                   type: string
  *                   example: "SPEAKER_NOT_FOUND"
  *       409:
  *         description: Ya existe evaluación para este evento
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
  *                   example: "Ya existe una evaluación para este speaker en este evento"
  *                 error:
  *                   type: string
  *                   example: "EVALUATION_ALREADY_EXISTS"
  *       429:
  *         description: Demasiadas solicitudes
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
  *                   example: "Demasiadas solicitudes. Intente más tarde."
  *                 error:
  *                   type: string
  *                   example: "RATE_LIMIT_EXCEEDED"
  */
router.post('/:id/evaluate', authenticated, speakerLimiter, speakerIdValidation, createEvaluationValidation, speakerController.createSpeakerEvaluation);

export default router;