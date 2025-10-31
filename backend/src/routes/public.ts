/**
 * @fileoverview Rutas Públicas para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas públicas para eventos
 *
 * Archivo: backend/src/routes/public.ts
 */

import { Router } from 'express';
import { param, query } from 'express-validator';
import { publicController } from '../controllers/publicController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';

const router = Router();

// ====================================================================
// RATE LIMITING PARA ENDPOINTS PÚBLICOS
// ====================================================================

// Rate limiter para endpoints públicos (más permisivo)
const publicLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max * 2, // Permitir más requests para público
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para búsquedas
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máximo 30 búsquedas por minuto
  message: {
    success: false,
    message: 'Demasiadas búsquedas. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para parámetros de evento
const eventIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
];

// Validación para parámetros de consulta de eventos
const eventsQueryValidation = [
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
    .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres'),
  query('eventTypeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del tipo de evento debe ser un número entero positivo'),
  query('eventCategoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número entero positivo'),
  query('isVirtual')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isVirtual debe ser true o false'),
  query('startDateFrom')
    .optional()
    .isISO8601()
    .withMessage('startDateFrom debe ser una fecha válida'),
  query('startDateTo')
    .optional()
    .isISO8601()
    .withMessage('startDateTo debe ser una fecha válida'),
  query('priceMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('priceMin debe ser un número positivo'),
  query('priceMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('priceMax debe ser un número positivo'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'startDate', 'endDate', 'title', 'price'])
    .withMessage('sortBy debe ser uno de: createdAt, startDate, endDate, title, price'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('sortOrder debe ser ASC o DESC'),
  query('featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('featured debe ser true o false')
];

// Validación para búsqueda de eventos
const searchValidation = [
  query('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 2 y 100 caracteres'),
  query('location')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('La ubicación debe tener entre 2 y 200 caracteres'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom debe ser una fecha válida'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo debe ser una fecha válida'),
  query('priceMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('priceMin debe ser un número positivo'),
  query('priceMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('priceMax debe ser un número positivo'),
  query('isVirtual')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isVirtual debe ser true o false'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe estar entre 1 y 50')
];

// Validación para calendario
const calendarValidation = [
  query('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('El mes debe estar entre 1 y 12'),
  query('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('El año debe estar entre 2020 y 2030')
];

// Validación para hash de certificado
const certificateValidation = [
  param('hash')
    .isLength({ min: 64, max: 64 })
    .withMessage('El hash debe tener exactamente 64 caracteres')
    .isAlphanumeric()
    .withMessage('El hash debe contener solo caracteres alfanuméricos')
];

// ====================================================================
// RUTAS PÚBLICAS
// ====================================================================

/**
 * @swagger
 * /api/public/events:
 *   get:
 *     tags: [Public Events]
 *     summary: Listar eventos públicos
 *     description: Obtiene una lista de eventos publicados disponibles para el público
 */
router.get('/events', publicLimiter, eventsQueryValidation, publicController.getPublicEvents);

/**
 * @swagger
 * /api/public/events/{id}:
 *   get:
 *     tags: [Public Events]
 *     summary: Obtener evento público
 *     description: Obtiene los detalles públicos de un evento específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/events/:id', publicLimiter, eventIdValidation, publicController.getPublicEvent);

/**
 * @swagger
 * /api/public/events/search:
 *   get:
 *     tags: [Public Events]
 *     summary: Buscar eventos públicos
 *     description: Realiza una búsqueda avanzada de eventos publicados
 */
router.get('/events/search', searchLimiter, searchValidation, publicController.searchEvents);

/**
 * @swagger
 * /api/public/events/calendar:
 *   get:
 *     tags: [Public Events]
 *     summary: Eventos para calendario
 *     description: Obtiene eventos en formato optimizado para calendarios
 */
router.get('/events/calendar', publicLimiter, calendarValidation, publicController.getCalendarEvents);

/**
 * @swagger
 * /api/public/events/categories:
 *   get:
 *     tags: [Public Events]
 *     summary: Categorías de eventos
 *     description: Obtiene la lista de categorías de eventos disponibles
 */
router.get('/events/categories', publicLimiter, publicController.getEventCategories);

/**
 * @swagger
 * /api/public/certificates/verify/{hash}:
 *   get:
 *     tags: [Public Certificates]
 *     summary: Verificar certificado
 *     description: Verifica la validez de un certificado por su hash
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/certificates/verify/:hash', publicLimiter, certificateValidation, publicController.verifyCertificate);

export default router;
