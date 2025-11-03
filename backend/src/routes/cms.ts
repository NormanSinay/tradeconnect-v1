/**
 * @fileoverview Rutas CMS para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de contenido (CMS)
 *
 * Archivo: backend/src/routes/cms.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { cmsController } from '../controllers/cmsController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA CMS
// ====================================================================

// Rate limiter para endpoints públicos de CMS (más permisivo)
const publicCmsLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max * 2, // Permitir más requests para contenido público
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para operaciones administrativas de CMS
const adminCmsLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: 200, // máximo 200 requests por usuario cada 15 minutos para admin CMS
  message: {
    success: false,
    message: 'Demasiadas operaciones administrativas. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para parámetros de página
const pageValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres')
];

// Validación para crear página estática
const createStaticPageValidation = [
  body('slug')
    .isLength({ min: 2, max: 255 })
    .withMessage('Slug debe tener entre 2 y 255 caracteres')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug solo puede contener letras minúsculas, números y guiones'),
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Título debe tener entre 1 y 255 caracteres'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Contenido es requerido'),
  body('meta_title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Meta título no puede exceder 255 caracteres'),
  body('meta_description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Meta descripción no puede exceder 500 caracteres'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published debe ser un booleano')
];

// Validación para actualizar página estática
const updateStaticPageValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createStaticPageValidation.map(v => v.optional())
];

// Validación para crear términos
const createTermsValidation = [
  body('version')
    .isLength({ min: 1, max: 20 })
    .withMessage('Versión debe tener entre 1 y 20 caracteres'),
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Título debe tener entre 1 y 255 caracteres'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Contenido es requerido'),
  body('effective_date')
    .isISO8601()
    .withMessage('Fecha efectiva debe ser una fecha válida'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un booleano')
];

// Validación para actualizar términos
const updateTermsValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createTermsValidation.map(v => v.optional())
];

// Validación para crear política
const createPolicyValidation = [
  body('type')
    .isIn(['privacy', 'cookies', 'data_processing', 'security'])
    .withMessage('Tipo debe ser uno de: privacy, cookies, data_processing, security'),
  body('version')
    .isLength({ min: 1, max: 20 })
    .withMessage('Versión debe tener entre 1 y 20 caracteres'),
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Título debe tener entre 1 y 255 caracteres'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Contenido es requerido'),
  body('effective_date')
    .isISO8601()
    .withMessage('Fecha efectiva debe ser una fecha válida'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un booleano')
];

// Validación para actualizar política
const updatePolicyValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createPolicyValidation.map(v => v.optional())
];

// Validación para crear FAQ
const createFaqValidation = [
  body('category')
    .isLength({ min: 1, max: 100 })
    .withMessage('Categoría debe tener entre 1 y 100 caracteres'),
  body('question')
    .isLength({ min: 1, max: 500 })
    .withMessage('Pregunta debe tener entre 1 y 500 caracteres'),
  body('answer')
    .isLength({ min: 1 })
    .withMessage('Respuesta es requerida'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Orden debe ser un número entero positivo'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published debe ser un booleano')
];

// Validación para actualizar FAQ
const updateFaqValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createFaqValidation.map(v => v.optional())
];

// Validación para crear banner
const createBannerValidation = [
  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título debe tener entre 3 y 255 caracteres'),
  body('imageUrl')
    .isURL()
    .withMessage('URL de imagen debe ser válida'),
  body('position')
    .isIn(['header', 'sidebar', 'footer', 'homepage', 'event-page'])
    .withMessage('Posición debe ser: header, sidebar, footer, homepage o event-page'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser una fecha válida'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser una fecha válida'),
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Prioridad debe ser un número entero positivo'),
  body('targetAudience')
    .optional()
    .isArray()
    .withMessage('Audiencia objetivo debe ser un array'),
  body('linkUrl')
    .optional()
    .isURL()
    .withMessage('URL de destino debe ser válida'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres')
];

// Validación para actualizar banner
const updateBannerValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createBannerValidation.map(v => v.optional())
];

// Validación para crear anuncio promocional
const createPromotionalAdValidation = [
  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título debe tener entre 3 y 255 caracteres'),
  body('adType')
    .isIn(['banner', 'video', 'text', 'sponsored', 'popup'])
    .withMessage('Tipo de anuncio debe ser: banner, video, text, sponsored o popup'),
  body('targetPlatform')
    .isArray({ min: 1 })
    .withMessage('Plataformas objetivo es requerida y debe ser un array'),
  body('createdBy')
    .isInt({ min: 1 })
    .withMessage('Creador debe ser un ID válido'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser una fecha válida'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser una fecha válida'),
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Prioridad debe ser un número entero positivo'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Presupuesto debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('Moneda debe ser GTQ o USD'),
  body('costPerClick')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Costo por clic debe ser un número positivo'),
  body('costPerView')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Costo por visualización debe ser un número positivo'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL de imagen debe ser válida'),
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('URL de video debe ser válida'),
  body('linkUrl')
    .optional()
    .isURL()
    .withMessage('URL de destino debe ser válida'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descripción no puede exceder 1000 caracteres'),
  body('content')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Contenido no puede exceder 5000 caracteres'),
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Ubicación no puede exceder 255 caracteres'),
  body('ageRange')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Rango de edad no puede exceder 50 caracteres'),
  body('targetAudience')
    .optional()
    .isArray()
    .withMessage('Audiencia objetivo debe ser un array'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Intereses debe ser un array')
];

// Validación para actualizar anuncio promocional
const updatePromotionalAdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createPromotionalAdValidation.map(v => v.optional())
];

// ====================================================================
// VALIDACIONES PARA ARTÍCULOS
// ====================================================================

// Validación para crear artículo
const createArticleValidation = [
  body('title')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título debe tener entre 3 y 255 caracteres'),
  body('slug')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Slug debe tener entre 3 y 100 caracteres')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug solo puede contener letras minúsculas, números y guiones'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Extracto no puede exceder 500 caracteres'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Contenido es requerido'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('URL de imagen destacada debe ser válida'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Estado debe ser: draft, published o archived'),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de publicación debe ser una fecha válida'),
  body('authorId')
    .isInt({ min: 1 })
    .withMessage('ID del autor debe ser un número entero positivo'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número entero positivo'),
  body('seoTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Título SEO no puede exceder 60 caracteres'),
  body('seoDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Descripción SEO no puede exceder 160 caracteres'),
  body('seoKeywords')
    .optional()
    .isArray()
    .withMessage('Palabras clave SEO deben ser un array'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadatos deben ser un objeto válido')
];

// Validación para actualizar artículo
const updateArticleValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createArticleValidation.map(v => v.optional())
];

// ====================================================================
// VALIDACIONES PARA CATEGORÍAS DE ARTÍCULOS
// ====================================================================

// Validación para crear categoría de artículo
const createArticleCategoryValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('slug')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Slug debe tener entre 2 y 50 caracteres')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug solo puede contener letras minúsculas, números y guiones'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color debe ser un código hexadecimal válido (ej: #FF6B6B)'),
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Icono no puede exceder 50 caracteres'),
  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID del padre debe ser un número entero positivo'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Orden debe ser un número entero positivo'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  body('seoTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Título SEO no puede exceder 60 caracteres'),
  body('seoDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Descripción SEO no puede exceder 160 caracteres'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadatos deben ser un objeto válido')
];

// Validación para actualizar categoría de artículo
const updateArticleCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createArticleCategoryValidation.map(v => v.optional())
];

// ====================================================================
// VALIDACIONES PARA TAGS
// ====================================================================

// Validación para crear tag
const createTagValidation = [
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Nombre debe tener entre 1 y 50 caracteres'),
  body('slug')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('Slug debe tener entre 1 y 30 caracteres')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug solo puede contener letras minúsculas, números y guiones'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Descripción no puede exceder 200 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color debe ser un código hexadecimal válido (ej: #4ECDC4)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  body('seoTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Título SEO no puede exceder 60 caracteres'),
  body('seoDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Descripción SEO no puede exceder 160 caracteres'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadatos deben ser un objeto válido')
];

// Validación para actualizar tag
const updateTagValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createTagValidation.map(v => v.optional())
];

// ====================================================================
// VALIDACIONES PARA COMENTARIOS
// ====================================================================

// Validación para crear comentario
const createCommentValidation = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Contenido debe tener entre 1 y 2000 caracteres'),
  body('articleId')
    .isInt({ min: 1 })
    .withMessage('ID del artículo debe ser un número entero positivo'),
  body('authorId')
    .isInt({ min: 1 })
    .withMessage('ID del autor debe ser un número entero positivo'),
  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID del comentario padre debe ser un número entero positivo'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'spam'])
    .withMessage('Estado debe ser: pending, approved, rejected o spam'),
  body('authorName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Nombre del autor no puede exceder 100 caracteres'),
  body('authorEmail')
    .optional()
    .isEmail()
    .withMessage('Email debe ser válido'),
  body('authorWebsite')
    .optional()
    .isURL()
    .withMessage('Sitio web debe ser una URL válida'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadatos deben ser un objeto válido')
];

// Validación para actualizar comentario
const updateCommentValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo'),
  ...createCommentValidation.map(v => v.optional())
];

// ====================================================================
// RUTAS PÚBLICAS PARA ARTÍCULOS
// ====================================================================

/**
 * @swagger
 * /api/cms/articles:
 *   get:
 *     tags: [CMS Public]
 *     summary: Listar artículos publicados
 *     description: Obtiene una lista de artículos publicados disponibles para el público
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           description: Slug de la categoría
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           description: Slug del tag
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Artículos obtenidos exitosamente
 */
router.get('/articles', publicCmsLimiter, cmsController.getPublishedArticles);

/**
 * @swagger
 * /api/cms/articles/{slug}:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener artículo por slug
 *     description: Obtiene el contenido completo de un artículo específico por su slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artículo obtenido exitosamente
 *       404:
 *         description: Artículo no encontrado
 */
router.get('/articles/:slug', publicCmsLimiter, cmsController.getArticleBySlug);

/**
 * @swagger
 * /api/cms/articles/{id}/comments:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener comentarios de un artículo
 *     description: Obtiene los comentarios aprobados de un artículo específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Comentarios obtenidos exitosamente
 */
router.get('/articles/:id/comments', publicCmsLimiter, cmsController.getArticleComments);

/**
 * @swagger
 * /api/cms/categories:
 *   get:
 *     tags: [CMS Public]
 *     summary: Listar categorías de artículos activas
 *     description: Obtiene una lista de categorías de artículos activas
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
 */
router.get('/categories', publicCmsLimiter, cmsController.getActiveArticleCategories);

/**
 * @swagger
 * /api/cms/categories/{slug}:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener categoría por slug
 *     description: Obtiene los detalles de una categoría específica por su slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/categories/:slug', publicCmsLimiter, cmsController.getArticleCategoryBySlug);

/**
 * @swagger
 * /api/cms/tags:
 *   get:
 *     tags: [CMS Public]
 *     summary: Listar tags activos
 *     description: Obtiene una lista de tags activos ordenados por uso
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Tags obtenidos exitosamente
 */
router.get('/tags', publicCmsLimiter, cmsController.getActiveTags);

// ====================================================================
// RUTAS PÚBLICAS
// ====================================================================

/**
 * @swagger
 * /api/cms/pages:
 *   get:
 *     tags: [CMS Public]
 *     summary: Listar páginas estáticas publicadas
 *     description: Obtiene una lista de páginas estáticas publicadas disponibles para el público
 *     responses:
 *       200:
 *         description: Páginas obtenidas exitosamente
 */
router.get('/pages', publicCmsLimiter, cmsController.getPublicStaticPages);

/**
 * @swagger
 * /api/cms/pages/{slug}:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener página estática por slug
 *     description: Obtiene el contenido de una página estática específica por su slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Página obtenida exitosamente
 *       404:
 *         description: Página no encontrada
 */
router.get('/pages/:slug', publicCmsLimiter, cmsController.getPublicStaticPage);

/**
 * @swagger
 * /api/cms/terms:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener términos y condiciones activos
 *     description: Obtiene la versión activa de términos y condiciones
 *     responses:
 *       200:
 *         description: Términos obtenidos exitosamente
 *       404:
 *         description: No hay términos activos
 */
router.get('/terms', publicCmsLimiter, cmsController.getActiveTerms);

/**
 * @swagger
 * /api/cms/policies/{type}:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener política activa por tipo
 *     description: Obtiene la versión activa de una política específica (privacidad, cookies, etc.)
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [privacy, cookies, data_processing, security]
 *     responses:
 *       200:
 *         description: Política obtenida exitosamente
 *       404:
 *         description: Política no encontrada
 */
router.get('/policies/:type', publicCmsLimiter, cmsController.getActivePolicy);

/**
 * @swagger
 * /api/cms/faqs:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener FAQs publicadas
 *     description: Obtiene las preguntas frecuentes publicadas
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: FAQs obtenidas exitosamente
 */
router.get('/faqs', publicCmsLimiter, cmsController.getPublicFaqs);

/**
 * @swagger
 * /api/cms/faqs/categories:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener categorías de FAQ
 *     description: Obtiene la lista de categorías disponibles para FAQs
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
 */
router.get('/faqs/categories', publicCmsLimiter, cmsController.getFaqCategories);

// ====================================================================
// RUTAS ADMINISTRATIVAS PARA ARTÍCULOS
// ====================================================================

/**
 * @swagger
 * /api/cms/admin/articles:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar todos los artículos (admin)
 *     description: Obtiene una lista paginada de todos los artículos para administración
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artículos obtenidos exitosamente
 *       403:
 *         description: No tiene permisos
 */
router.get('/admin/articles',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllArticles
);

/**
 * @swagger
 * /api/cms/admin/articles:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear artículo
 *     description: Crea un nuevo artículo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - authorId
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               authorId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               seoKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Artículo creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 */
router.post('/admin/articles',
  authenticated,
  adminCmsLimiter,
  createArticleValidation,
  cmsController.createArticle
);

/**
 * @swagger
 * /api/cms/admin/articles/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar artículo
 *     description: Actualiza un artículo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               authorId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               seoKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Artículo actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Artículo no encontrado
 */
router.put('/admin/articles/:id',
  authenticated,
  adminCmsLimiter,
  updateArticleValidation,
  cmsController.updateArticle
);

/**
 * @swagger
 * /api/cms/admin/articles/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar artículo
 *     description: Elimina un artículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artículo eliminado exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Artículo no encontrado
 */
router.delete('/admin/articles/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteArticle
);

// ====================================================================
// RUTAS ADMINISTRATIVAS PARA CATEGORÍAS DE ARTÍCULOS
// ====================================================================

/**
 * @swagger
 * /api/cms/admin/categories:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar todas las categorías de artículos (admin)
 *     description: Obtiene una lista paginada de todas las categorías de artículos para administración
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
 *       403:
 *         description: No tiene permisos
 */
router.get('/admin/categories',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllArticleCategories
);

/**
 * @swagger
 * /api/cms/admin/categories:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear categoría de artículo
 *     description: Crea una nueva categoría de artículo
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
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               parentId:
 *                 type: integer
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 */
router.post('/admin/categories',
  authenticated,
  adminCmsLimiter,
  createArticleCategoryValidation,
  cmsController.createArticleCategory
);

/**
 * @swagger
 * /api/cms/admin/categories/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar categoría de artículo
 *     description: Actualiza una categoría de artículo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               parentId:
 *                 type: integer
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/admin/categories/:id',
  authenticated,
  adminCmsLimiter,
  updateArticleCategoryValidation,
  cmsController.updateArticleCategory
);

/**
 * @swagger
 * /api/cms/admin/categories/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar categoría de artículo
 *     description: Elimina una categoría de artículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/admin/categories/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteArticleCategory
);

// ====================================================================
// RUTAS ADMINISTRATIVAS PARA TAGS
// ====================================================================

/**
 * @swagger
 * /api/cms/admin/tags:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar todos los tags (admin)
 *     description: Obtiene una lista paginada de todos los tags para administración
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tags obtenidos exitosamente
 *       403:
 *         description: No tiene permisos
 */
router.get('/admin/tags',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllTags
);

/**
 * @swagger
 * /api/cms/admin/tags:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear tag
 *     description: Crea un nuevo tag
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
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Tag creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 */
router.post('/admin/tags',
  authenticated,
  adminCmsLimiter,
  createTagValidation,
  cmsController.createTag
);

/**
 * @swagger
 * /api/cms/admin/tags/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar tag
 *     description: Actualiza un tag existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tag actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Tag no encontrado
 */
router.put('/admin/tags/:id',
  authenticated,
  adminCmsLimiter,
  updateTagValidation,
  cmsController.updateTag
);

/**
 * @swagger
 * /api/cms/admin/tags/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar tag
 *     description: Elimina un tag
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag eliminado exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Tag no encontrado
 */
router.delete('/admin/tags/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteTag
);

// ====================================================================
// RUTAS ADMINISTRATIVAS PARA COMENTARIOS
// ====================================================================

/**
 * @swagger
 * /api/cms/admin/comments:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar todos los comentarios (admin)
 *     description: Obtiene una lista paginada de todos los comentarios para moderación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, spam]
 *       - in: query
 *         name: articleId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentarios obtenidos exitosamente
 *       403:
 *         description: No tiene permisos
 */
router.get('/admin/comments',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllComments
);

/**
 * @swagger
 * /api/cms/admin/comments/{id}/approve:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Aprobar comentario
 *     description: Aprueba un comentario pendiente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario aprobado exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Comentario no encontrado
 */
router.put('/admin/comments/:id/approve',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.approveComment
);

/**
 * @swagger
 * /api/cms/admin/comments/{id}/reject:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Rechazar comentario
 *     description: Rechaza un comentario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario rechazado exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Comentario no encontrado
 */
router.put('/admin/comments/:id/reject',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.rejectComment
);

/**
 * @swagger
 * /api/cms/admin/comments/{id}/spam:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Marcar comentario como spam
 *     description: Marca un comentario como spam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario marcado como spam exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Comentario no encontrado
 */
router.put('/admin/comments/:id/spam',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.markCommentAsSpam
);

/**
 * @swagger
 * /api/cms/admin/comments/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar comentario
 *     description: Elimina un comentario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Comentario no encontrado
 */
router.delete('/admin/comments/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteComment
);

// ====================================================================
// RUTAS PÚBLICAS PARA COMENTARIOS
// ====================================================================

/**
 * @swagger
 * /api/cms/comments:
 *   post:
 *     tags: [CMS Public]
 *     summary: Crear comentario
 *     description: Crea un nuevo comentario en un artículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - articleId
 *               - authorId
 *             properties:
 *               content:
 *                 type: string
 *               articleId:
 *                 type: integer
 *               authorId:
 *                 type: integer
 *               parentId:
 *                 type: integer
 *               authorName:
 *                 type: string
 *               authorEmail:
 *                 type: string
 *               authorWebsite:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/comments',
  publicCmsLimiter,
  createCommentValidation,
  cmsController.createComment
);

/**
 * @swagger
 * /api/cms/comments/{id}/like:
 *   post:
 *     tags: [CMS Public]
 *     summary: Dar like a comentario
 *     description: Incrementa el contador de likes de un comentario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Like registrado exitosamente
 */
router.post('/comments/:id/like',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.likeComment
);

/**
 * @swagger
 * /api/cms/comments/{id}/dislike:
 *   post:
 *     tags: [CMS Public]
 *     summary: Dar dislike a comentario
 *     description: Incrementa el contador de dislikes de un comentario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dislike registrado exitosamente
 */
router.post('/comments/:id/dislike',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.dislikeComment
);

/**
 * @swagger
 * /api/cms/comments/{id}/report:
 *   post:
 *     tags: [CMS Public]
 *     summary: Reportar comentario
 *     description: Incrementa el contador de reportes de un comentario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reporte registrado exitosamente
 */
router.post('/comments/:id/report',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.reportComment
);

// ====================================================================
// RUTAS ADMINISTRATIVAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/cms/admin/pages:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar todas las páginas estáticas (admin)
 *     description: Obtiene una lista paginada de todas las páginas estáticas para administración
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_published
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Páginas obtenidas exitosamente
 *       403:
 *         description: No tiene permisos
 */
router.get('/admin/pages',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllStaticPages
);

/**
 * @swagger
 * /api/cms/admin/pages:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear página estática
 *     description: Crea una nueva página estática
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - title
 *               - content
 *             properties:
 *               slug:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               meta_title:
 *                 type: string
 *               meta_description:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Página creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 */
router.post('/admin/pages',
  authenticated,
  adminCmsLimiter,
  createStaticPageValidation,
  cmsController.createStaticPage
);

/**
 * @swagger
 * /api/cms/admin/pages/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar página estática
 *     description: Actualiza una página estática existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               slug:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               meta_title:
 *                 type: string
 *               meta_description:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Página actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Página no encontrada
 */
router.put('/admin/pages/:id',
  authenticated,
  adminCmsLimiter,
  updateStaticPageValidation,
  cmsController.updateStaticPage
);

/**
 * @swagger
 * /api/cms/admin/pages/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar página estática
 *     description: Elimina una página estática
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Página eliminada exitosamente
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Página no encontrada
 */
router.delete('/admin/pages/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteStaticPage
);

/**
 * @swagger
 * /api/cms/admin/terms:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar versiones de términos (admin)
 *     description: Obtiene una lista paginada de todas las versiones de términos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Versiones obtenidas exitosamente
 */
router.get('/admin/terms',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllTerms
);

/**
 * @swagger
 * /api/cms/admin/terms:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear versión de términos
 *     description: Crea una nueva versión de términos y condiciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - version
 *               - title
 *               - content
 *               - effective_date
 *             properties:
 *               version:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               effective_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Versión creada exitosamente
 */
router.post('/admin/terms',
  authenticated,
  adminCmsLimiter,
  createTermsValidation,
  cmsController.createTerms
);

/**
 * @swagger
 * /api/cms/admin/terms/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar versión de términos
 *     description: Actualiza una versión existente de términos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               version:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               effective_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Versión actualizada exitosamente
 */
router.put('/admin/terms/:id',
  authenticated,
  adminCmsLimiter,
  updateTermsValidation,
  cmsController.updateTerms
);

/**
 * @swagger
 * /api/cms/admin/terms/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar versión de términos
 *     description: Elimina una versión de términos (no puede eliminar términos activos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Versión eliminada exitosamente
 *       400:
 *         description: No se puede eliminar términos activos
 */
router.delete('/admin/terms/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteTerms
);

/**
 * @swagger
 * /api/cms/admin/policies:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar políticas (admin)
 *     description: Obtiene una lista paginada de todas las políticas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [privacy, cookies, data_processing, security]
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Políticas obtenidas exitosamente
 */
router.get('/admin/policies',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllPolicies
);

/**
 * @swagger
 * /api/cms/admin/policies:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear versión de política
 *     description: Crea una nueva versión de política
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - version
 *               - title
 *               - content
 *               - effective_date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [privacy, cookies, data_processing, security]
 *               version:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               effective_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Versión creada exitosamente
 */
router.post('/admin/policies',
  authenticated,
  adminCmsLimiter,
  createPolicyValidation,
  cmsController.createPolicy
);

/**
 * @swagger
 * /api/cms/admin/policies/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar versión de política
 *     description: Actualiza una versión existente de política
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               type:
 *                 type: string
 *                 enum: [privacy, cookies, data_processing, security]
 *               version:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               effective_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Versión actualizada exitosamente
 */
router.put('/admin/policies/:id',
  authenticated,
  adminCmsLimiter,
  updatePolicyValidation,
  cmsController.updatePolicy
);

/**
 * @swagger
 * /api/cms/admin/policies/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar versión de política
 *     description: Elimina una versión de política (no puede eliminar políticas activas)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Versión eliminada exitosamente
 *       400:
 *         description: No se puede eliminar políticas activas
 */
router.delete('/admin/policies/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deletePolicy
);

/**
 * @swagger
 * /api/cms/admin/faqs:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar FAQs (admin)
 *     description: Obtiene una lista paginada de todas las FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_published
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQs obtenidas exitosamente
 */
router.get('/admin/faqs',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllFaqs
);

/**
 * @swagger
 * /api/cms/admin/faqs:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear FAQ
 *     description: Crea una nueva pregunta frecuente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - question
 *               - answer
 *             properties:
 *               category:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               order:
 *                 type: integer
 *               is_published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: FAQ creada exitosamente
 */
router.post('/admin/faqs',
  authenticated,
  adminCmsLimiter,
  createFaqValidation,
  cmsController.createFaq
);

/**
 * @swagger
 * /api/cms/admin/faqs/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar FAQ
 *     description: Actualiza una FAQ existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               category:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               order:
 *                 type: integer
 *               is_published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: FAQ actualizada exitosamente
 */
router.put('/admin/faqs/:id',
  authenticated,
  adminCmsLimiter,
  updateFaqValidation,
  cmsController.updateFaq
);

/**
 * @swagger
 * /api/cms/admin/faqs/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar FAQ
 *     description: Elimina una FAQ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: FAQ eliminada exitosamente
 */
router.delete('/admin/faqs/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteFaq
);

// ====================================================================
// RUTAS PARA BANNERS
// ====================================================================

/**
 * @swagger
 * /api/cms/banners:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener banners activos
 *     description: Obtiene banners activos disponibles para mostrar
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [header, sidebar, footer, homepage, event-page]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Banners obtenidos exitosamente
 */
router.get('/banners', publicCmsLimiter, cmsController.getActiveBanners);

/**
 * @swagger
 * /api/cms/admin/banners:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar todos los banners (admin)
 *     description: Obtiene una lista paginada de todos los banners para administración
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banners obtenidos exitosamente
 */
router.get('/admin/banners',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllBanners
);

/**
 * @swagger
 * /api/cms/admin/banners:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear banner
 *     description: Crea un nuevo banner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - imageUrl
 *               - position
 *             properties:
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [header, sidebar, footer, homepage, event-page]
 *               linkUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: integer
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Banner creado exitosamente
 */
router.post('/admin/banners',
  authenticated,
  adminCmsLimiter,
  createBannerValidation,
  cmsController.createBanner
);

/**
 * @swagger
 * /api/cms/admin/banners/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar banner
 *     description: Actualiza un banner existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [header, sidebar, footer, homepage, event-page]
 *               linkUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: integer
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Banner actualizado exitosamente
 */
router.put('/admin/banners/:id',
  authenticated,
  adminCmsLimiter,
  updateBannerValidation,
  cmsController.updateBanner
);

/**
 * @swagger
 * /api/cms/admin/banners/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar banner
 *     description: Elimina un banner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Banner eliminado exitosamente
 */
router.delete('/admin/banners/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deleteBanner
);

/**
 * @swagger
 * /api/cms/banners/{id}/click:
 *   post:
 *     tags: [CMS Public]
 *     summary: Incrementar contador de clics del banner
 *     description: Registra un clic en el banner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Clic registrado exitosamente
 */
router.post('/banners/:id/click',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.incrementBannerClick
);

/**
 * @swagger
 * /api/cms/banners/{id}/view:
 *   post:
 *     tags: [CMS Public]
 *     summary: Incrementar contador de visualizaciones del banner
 *     description: Registra una visualización del banner
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Visualización registrada exitosamente
 */
router.post('/banners/:id/view',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.incrementBannerView
);

// ====================================================================
// RUTAS PARA ANUNCIOS PROMOCIONALES
// ====================================================================

/**
 * @swagger
 * /api/cms/ads:
 *   get:
 *     tags: [CMS Public]
 *     summary: Obtener anuncios promocionales activos
 *     description: Obtiene anuncios promocionales activos disponibles para mostrar
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *       - in: query
 *         name: adType
 *         schema:
 *           type: string
 *           enum: [banner, video, text, sponsored, popup]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anuncios obtenidos exitosamente
 */
router.get('/ads', publicCmsLimiter, cmsController.getActivePromotionalAds);

/**
 * @swagger
 * /api/cms/admin/ads:
 *   get:
 *     tags: [CMS Admin]
 *     summary: Listar todos los anuncios promocionales (admin)
 *     description: Obtiene una lista paginada de todos los anuncios promocionales para administración
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: adType
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Anuncios obtenidos exitosamente
 */
router.get('/admin/ads',
  authenticated,
  adminCmsLimiter,
  pageValidation,
  cmsController.getAllPromotionalAds
);

/**
 * @swagger
 * /api/cms/admin/ads:
 *   post:
 *     tags: [CMS Admin]
 *     summary: Crear anuncio promocional
 *     description: Crea un nuevo anuncio promocional
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - adType
 *               - targetPlatform
 *             properties:
 *               title:
 *                 type: string
 *               adType:
 *                 type: string
 *                 enum: [banner, video, text, sponsored, popup]
 *               targetPlatform:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               budget:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: integer
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               ageRange:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               costPerClick:
 *                 type: number
 *               costPerView:
 *                 type: number
 *     responses:
 *       201:
 *         description: Anuncio creado exitosamente
 */
router.post('/admin/ads',
  authenticated,
  adminCmsLimiter,
  createPromotionalAdValidation,
  cmsController.createPromotionalAd
);

/**
 * @swagger
 * /api/cms/admin/ads/{id}:
 *   put:
 *     tags: [CMS Admin]
 *     summary: Actualizar anuncio promocional
 *     description: Actualiza un anuncio promocional existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               adType:
 *                 type: string
 *                 enum: [banner, video, text, sponsored, popup]
 *               targetPlatform:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               budget:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: integer
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               ageRange:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               costPerClick:
 *                 type: number
 *               costPerView:
 *                 type: number
 *     responses:
 *       200:
 *         description: Anuncio actualizado exitosamente
 */
router.put('/admin/ads/:id',
  authenticated,
  adminCmsLimiter,
  updatePromotionalAdValidation,
  cmsController.updatePromotionalAd
);

/**
 * @swagger
 * /api/cms/admin/ads/{id}:
 *   delete:
 *     tags: [CMS Admin]
 *     summary: Eliminar anuncio promocional
 *     description: Elimina un anuncio promocional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Anuncio eliminado exitosamente
 */
router.delete('/admin/ads/:id',
  authenticated,
  adminCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.deletePromotionalAd
);

/**
 * @swagger
 * /api/cms/ads/{id}/click:
 *   post:
 *     tags: [CMS Public]
 *     summary: Incrementar contador de clics del anuncio
 *     description: Registra un clic en el anuncio promocional
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Clic registrado exitosamente
 */
router.post('/ads/:id/click',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.incrementAdClick
);

/**
 * @swagger
 * /api/cms/ads/{id}/view:
 *   post:
 *     tags: [CMS Public]
 *     summary: Incrementar contador de visualizaciones del anuncio
 *     description: Registra una visualización del anuncio promocional
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Visualización registrada exitosamente
 */
router.post('/ads/:id/view',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.incrementAdView
);

/**
 * @swagger
 * /api/cms/ads/{id}/conversion:
 *   post:
 *     tags: [CMS Public]
 *     summary: Incrementar contador de conversiones del anuncio
 *     description: Registra una conversión del anuncio promocional
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversión registrada exitosamente
 */
router.post('/ads/:id/conversion',
  publicCmsLimiter,
  param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  cmsController.incrementAdConversion
);

export default router;