/**
 * @fileoverview Rutas de Sesiones de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de sesiones de eventos
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { eventSessionController } from '../controllers/eventSessionController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA SESIONES DE EVENTOS
// ====================================================================

// Rate limiter general para operaciones de sesiones
const sessionLimiter = rateLimit({
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
  max: 20, // máximo 20 operaciones por ventana
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

// Validación para crear sesión de evento
const createEventSessionValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('sessionType')
    .isIn(['date', 'time_slot', 'workshop', 'track', 'other'])
    .withMessage('Tipo de sesión inválido'),
  body('startDate')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La fecha de inicio debe ser futura');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('La capacidad debe estar entre 1 y 100,000'),
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La ubicación no puede exceder 500 caracteres'),
  body('virtualLocation')
    .optional()
    .isURL()
    .withMessage('El enlace virtual debe ser una URL válida'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual debe ser un valor booleano'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los requisitos no pueden exceder 1000 caracteres')
];

// Validación para actualizar sesión de evento
const updateEventSessionValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('El ID de la sesión debe ser un número entero positivo'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('sessionType')
    .optional()
    .isIn(['date', 'time_slot', 'workshop', 'track', 'other'])
    .withMessage('Tipo de sesión inválido'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('La fecha de inicio debe ser futura');
      }
      return true;
    }),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (value && req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('La capacidad debe estar entre 1 y 100,000'),
  body('location')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La ubicación no puede exceder 500 caracteres'),
  body('virtualLocation')
    .optional()
    .isURL()
    .withMessage('El enlace virtual debe ser una URL válida'),
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual debe ser un valor booleano'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los requisitos no pueden exceder 1000 caracteres')
];

// Validación para parámetros de ruta
const eventIdValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
];

const sessionIdValidation = [
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('El ID de la sesión debe ser un número entero positivo')
];

// Validación para bloquear/liberar capacidad
const capacityOperationValidation = [
  ...eventIdValidation,
  ...sessionIdValidation,
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo')
];

const blockCapacityValidation = [
  ...capacityOperationValidation,
  body('blockDurationMinutes')
    .optional()
    .isInt({ min: 5, max: 60 })
    .withMessage('La duración del bloqueo debe estar entre 5 y 60 minutos')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/events/{eventId}/sessions:
 *   post:
 *     tags: [Event Sessions]
 *     summary: Crear sesión de evento
 *     description: Crea una nueva sesión para un evento específico con validación completa de datos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - sessionType
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Título descriptivo de la sesión
 *                 example: "Taller de Introducción a la IA"
 *               sessionType:
 *                 type: string
 *                 enum: [date, time_slot, workshop, track, other]
 *                 description: Tipo de sesión
 *                 example: "workshop"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio (debe ser futura)
 *                 example: "2023-12-01T09:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de fin (debe ser posterior al inicio)
 *                 example: "2023-12-01T17:00:00.000Z"
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100000
 *                 description: Capacidad máxima de participantes
 *                 example: 50
 *               location:
 *                 type: string
 *                 maxLength: 500
 *                 description: Ubicación física de la sesión
 *                 example: "Salón Principal, Centro de Convenciones"
 *               virtualLocation:
 *                 type: string
 *                 format: uri
 *                 description: URL para sesiones virtuales
 *                 example: "https://zoom.us/j/123456789"
 *               isVirtual:
 *                 type: boolean
 *                 description: Indica si la sesión es virtual
 *                 example: false
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio adicional de la sesión (opcional)
 *                 example: 25.00
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *                 description: Moneda del precio
 *                 example: "GTQ"
 *               requirements:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Requisitos previos o materiales necesarios
 *                 example: "Laptop con software de desarrollo instalado"
 *           examples:
 *             crear_sesion_presencial:
 *               summary: Crear sesión presencial
 *               value:
 *                 title: "Taller de Introducción a la IA"
 *                 sessionType: "workshop"
 *                 startDate: "2023-12-01T09:00:00.000Z"
 *                 endDate: "2023-12-01T17:00:00.000Z"
 *                 capacity: 50
 *                 location: "Salón Principal, Centro de Convenciones"
 *                 isVirtual: false
 *                 price: 25.00
 *                 currency: "GTQ"
 *                 requirements: "Laptop con software de desarrollo instalado"
 *             crear_sesion_virtual:
 *               summary: Crear sesión virtual
 *               value:
 *                 title: "Conferencia Virtual de Tecnología"
 *                 sessionType: "time_slot"
 *                 startDate: "2023-11-15T14:00:00.000Z"
 *                 endDate: "2023-11-15T16:00:00.000Z"
 *                 capacity: 200
 *                 virtualLocation: "https://zoom.us/j/123456789"
 *                 isVirtual: true
 *                 price: 0
 *                 currency: "USD"
 *     responses:
 *       201:
 *         description: Sesión creada exitosamente
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
 *                   example: "Sesión de evento creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         eventId:
 *                           type: integer
 *                           example: 123
 *                         title:
 *                           type: string
 *                           example: "Taller de Introducción a la IA"
 *                         sessionType:
 *                           type: string
 *                           example: "workshop"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T09:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T17:00:00.000Z"
 *                         capacity:
 *                           type: integer
 *                           example: 50
 *                         availableCapacity:
 *                           type: integer
 *                           example: 50
 *                         location:
 *                           type: string
 *                           example: "Salón Principal, Centro de Convenciones"
 *                         isVirtual:
 *                           type: boolean
 *                           example: false
 *                         price:
 *                           type: number
 *                           example: 25.00
 *                         currency:
 *                           type: string
 *                           example: "GTQ"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T10:00:00.000Z"
 *             examples:
 *               sesion_creada:
 *                 summary: Sesión creada exitosamente
 *                 value:
 *                   success: true
 *                   message: "Sesión de evento creada exitosamente"
 *                   data:
 *                     session:
 *                       id: 456
 *                       eventId: 123
 *                       title: "Taller de Introducción a la IA"
 *                       sessionType: "workshop"
 *                       startDate: "2023-12-01T09:00:00.000Z"
 *                       endDate: "2023-12-01T17:00:00.000Z"
 *                       capacity: 50
 *                       availableCapacity: 50
 *                       location: "Salón Principal, Centro de Convenciones"
 *                       isVirtual: false
 *                       price: 25.00
 *                       currency: "GTQ"
 *                       status: "active"
 *                       createdAt: "2023-10-01T10:00:00.000Z"
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
 *                   example: "La fecha de inicio debe ser futura"
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
 *                   example: "No tienes permisos para crear sesiones en este evento"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Evento no encontrado
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
 *                   example: "Evento no encontrado"
 *                 error:
 *                   type: string
 *                   example: "EVENT_NOT_FOUND"
 *       429:
 *         description: Demasiadas operaciones de creación
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
router.post('/:eventId/sessions',
  authenticated,
  createEditLimiter,
  createEventSessionValidation,
  eventSessionController.createEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Listar sesiones de evento
 *     description: Obtiene todas las sesiones de un evento específico con filtros y paginación
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
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
 *         description: Número de sesiones por página
 *         example: 20
 *       - in: query
 *         name: sessionType
 *         schema:
 *           type: string
 *           enum: [date, time_slot, workshop, track, other]
 *         description: Filtrar por tipo de sesión
 *         example: "workshop"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar sesiones activas/inactivas
 *         example: true
 *       - in: query
 *         name: isVirtual
 *         schema:
 *           type: boolean
 *         description: Filtrar sesiones virtuales/presenciales
 *         example: false
 *       - in: query
 *         name: hasCapacity
 *         schema:
 *           type: boolean
 *         description: Filtrar sesiones con capacidad disponible
 *         example: true
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [startDate, endDate, title, capacity, createdAt]
 *           default: startDate
 *         description: Campo para ordenar resultados
 *         example: "startDate"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden de clasificación
 *         example: "ASC"
 *     responses:
 *       200:
 *         description: Sesiones obtenidas exitosamente
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
 *                   example: "Sesiones de evento obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 456
 *                           eventId:
 *                             type: integer
 *                             example: 123
 *                           title:
 *                             type: string
 *                             example: "Taller de Introducción a la IA"
 *                           sessionType:
 *                             type: string
 *                             example: "workshop"
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-12-01T09:00:00.000Z"
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-12-01T17:00:00.000Z"
 *                           capacity:
 *                             type: integer
 *                             example: 50
 *                           availableCapacity:
 *                             type: integer
 *                             example: 35
 *                           location:
 *                             type: string
 *                             example: "Salón Principal, Centro de Convenciones"
 *                           virtualLocation:
 *                             type: string
 *                             example: "https://zoom.us/j/123456789"
 *                           isVirtual:
 *                             type: boolean
 *                             example: false
 *                           price:
 *                             type: number
 *                             example: 25.00
 *                           currency:
 *                             type: string
 *                             example: "GTQ"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           requirements:
 *                             type: string
 *                             example: "Laptop con software de desarrollo instalado"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T10:00:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-15T14:30:00.000Z"
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
 *                           example: 45
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *             examples:
 *               sesiones_listadas:
 *                 summary: Sesiones listadas exitosamente
 *                 value:
 *                   success: true
 *                   message: "Sesiones de evento obtenidas exitosamente"
 *                   data:
 *                     sessions:
 *                       - id: 456
 *                         eventId: 123
 *                         title: "Taller de Introducción a la IA"
 *                         sessionType: "workshop"
 *                         startDate: "2023-12-01T09:00:00.000Z"
 *                         endDate: "2023-12-01T17:00:00.000Z"
 *                         capacity: 50
 *                         availableCapacity: 35
 *                         location: "Salón Principal, Centro de Convenciones"
 *                         isVirtual: false
 *                         price: 25.00
 *                         currency: "GTQ"
 *                         status: "active"
 *                         requirements: "Laptop con software de desarrollo instalado"
 *                         createdAt: "2023-10-01T10:00:00.000Z"
 *                         updatedAt: "2023-10-15T14:30:00.000Z"
 *                       - id: 457
 *                         eventId: 123
 *                         title: "Conferencia de Tecnología"
 *                         sessionType: "time_slot"
 *                         startDate: "2023-12-02T10:00:00.000Z"
 *                         endDate: "2023-12-02T12:00:00.000Z"
 *                         capacity: 200
 *                         availableCapacity: 150
 *                         virtualLocation: "https://zoom.us/j/987654321"
 *                         isVirtual: true
 *                         price: 0
 *                         currency: "USD"
 *                         status: "active"
 *                         createdAt: "2023-10-02T11:00:00.000Z"
 *                         updatedAt: "2023-10-02T11:00:00.000Z"
 *                     pagination:
 *                       page: 1
 *                       limit: 20
 *                       total: 2
 *                       totalPages: 1
 *                       hasNext: false
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
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       404:
 *         description: Evento no encontrado
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
 *                   example: "Evento no encontrado"
 *                 error:
 *                   type: string
 *                   example: "EVENT_NOT_FOUND"
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
router.get('/:eventId/sessions',
  sessionLimiter,
  eventIdValidation,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
    query('sessionType').optional().isIn(['date', 'time_slot', 'workshop', 'track', 'other']).withMessage('Tipo de sesión inválido'),
    query('isActive').optional().isBoolean().withMessage('isActive debe ser un valor booleano'),
    query('isVirtual').optional().isBoolean().withMessage('isVirtual debe ser un valor booleano'),
    query('hasCapacity').optional().isBoolean().withMessage('hasCapacity debe ser un valor booleano'),
    query('sortBy').optional().isIn(['startDate', 'endDate', 'title', 'capacity', 'createdAt']).withMessage('Campo de ordenamiento inválido'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Orden inválido')
  ],
  eventSessionController.getEventSessions
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Obtener sesión específica
 *     description: Obtiene los detalles completos de una sesión específica de evento
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la sesión
 *         example: 456
 *     responses:
 *       200:
 *         description: Sesión obtenida exitosamente
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
 *                   example: "Sesión obtenida exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         eventId:
 *                           type: integer
 *                           example: 123
 *                         title:
 *                           type: string
 *                           example: "Taller de Introducción a la IA"
 *                         sessionType:
 *                           type: string
 *                           example: "workshop"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T09:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T17:00:00.000Z"
 *                         capacity:
 *                           type: integer
 *                           example: 50
 *                         availableCapacity:
 *                           type: integer
 *                           example: 35
 *                         location:
 *                           type: string
 *                           example: "Salón Principal, Centro de Convenciones"
 *                         virtualLocation:
 *                           type: string
 *                           example: "https://zoom.us/j/123456789"
 *                         isVirtual:
 *                           type: boolean
 *                           example: false
 *                         price:
 *                           type: number
 *                           example: 25.00
 *                         currency:
 *                           type: string
 *                           example: "GTQ"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         requirements:
 *                           type: string
 *                           example: "Laptop con software de desarrollo instalado"
 *                         participantsCount:
 *                           type: integer
 *                           description: Número actual de participantes inscritos
 *                           example: 15
 *                         blockedCapacity:
 *                           type: integer
 *                           description: Capacidad temporalmente bloqueada
 *                           example: 5
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T10:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T14:30:00.000Z"
 *             examples:
 *               sesion_obtenida:
 *                 summary: Sesión obtenida exitosamente
 *                 value:
 *                   success: true
 *                   message: "Sesión obtenida exitosamente"
 *                   data:
 *                     session:
 *                       id: 456
 *                       eventId: 123
 *                       title: "Taller de Introducción a la IA"
 *                       sessionType: "workshop"
 *                       startDate: "2023-12-01T09:00:00.000Z"
 *                       endDate: "2023-12-01T17:00:00.000Z"
 *                       capacity: 50
 *                       availableCapacity: 35
 *                       location: "Salón Principal, Centro de Convenciones"
 *                       isVirtual: false
 *                       price: 25.00
 *                       currency: "GTQ"
 *                       status: "active"
 *                       requirements: "Laptop con software de desarrollo instalado"
 *                       participantsCount: 15
 *                       blockedCapacity: 5
 *                       createdAt: "2023-10-01T10:00:00.000Z"
 *                       updatedAt: "2023-10-15T14:30:00.000Z"
 *       404:
 *         description: Sesión o evento no encontrado
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
 *                   example: "Sesión no encontrada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_NOT_FOUND"
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
router.get('/:eventId/sessions/:sessionId',
  sessionLimiter,
  [...eventIdValidation, ...sessionIdValidation],
  eventSessionController.getEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}:
 *   put:
 *     tags: [Event Sessions]
 *     summary: Actualizar sesión
 *     description: Actualiza la información de una sesión específica con validación de cambios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la sesión
 *         example: 456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Título descriptivo de la sesión
 *                 example: "Taller Avanzado de IA"
 *               sessionType:
 *                 type: string
 *                 enum: [date, time_slot, workshop, track, other]
 *                 description: Tipo de sesión
 *                 example: "workshop"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio (debe ser futura)
 *                 example: "2023-12-01T10:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de fin (debe ser posterior al inicio)
 *                 example: "2023-12-01T18:00:00.000Z"
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100000
 *                 description: Capacidad máxima de participantes
 *                 example: 60
 *               location:
 *                 type: string
 *                 maxLength: 500
 *                 description: Ubicación física de la sesión
 *                 example: "Auditorio Principal, Centro de Convenciones"
 *               virtualLocation:
 *                 type: string
 *                 format: uri
 *                 description: URL para sesiones virtuales
 *                 example: "https://zoom.us/j/123456789"
 *               isVirtual:
 *                 type: boolean
 *                 description: Indica si la sesión es virtual
 *                 example: false
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio adicional de la sesión
 *                 example: 30.00
 *               currency:
 *                 type: string
 *                 enum: [GTQ, USD]
 *                 description: Moneda del precio
 *                 example: "GTQ"
 *               requirements:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Requisitos previos o materiales necesarios
 *                 example: "Laptop con software de desarrollo y conocimientos básicos de Python"
 *           examples:
 *             actualizar_sesion:
 *               summary: Actualizar sesión
 *               value:
 *                 title: "Taller Avanzado de IA"
 *                 capacity: 60
 *                 location: "Auditorio Principal, Centro de Convenciones"
 *                 price: 30.00
 *                 requirements: "Laptop con software de desarrollo y conocimientos básicos de Python"
 *     responses:
 *       200:
 *         description: Sesión actualizada exitosamente
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
 *                   example: "Sesión actualizada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         eventId:
 *                           type: integer
 *                           example: 123
 *                         title:
 *                           type: string
 *                           example: "Taller Avanzado de IA"
 *                         sessionType:
 *                           type: string
 *                           example: "workshop"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T10:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T18:00:00.000Z"
 *                         capacity:
 *                           type: integer
 *                           example: 60
 *                         availableCapacity:
 *                           type: integer
 *                           example: 45
 *                         location:
 *                           type: string
 *                           example: "Auditorio Principal, Centro de Convenciones"
 *                         isVirtual:
 *                           type: boolean
 *                           example: false
 *                         price:
 *                           type: number
 *                           example: 30.00
 *                         currency:
 *                           type: string
 *                           example: "GTQ"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         requirements:
 *                           type: string
 *                           example: "Laptop con software de desarrollo y conocimientos básicos de Python"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-20T16:45:00.000Z"
 *             examples:
 *               sesion_actualizada:
 *                 summary: Sesión actualizada exitosamente
 *                 value:
 *                   success: true
 *                   message: "Sesión actualizada exitosamente"
 *                   data:
 *                     session:
 *                       id: 456
 *                       eventId: 123
 *                       title: "Taller Avanzado de IA"
 *                       sessionType: "workshop"
 *                       startDate: "2023-12-01T10:00:00.000Z"
 *                       endDate: "2023-12-01T18:00:00.000Z"
 *                       capacity: 60
 *                       availableCapacity: 45
 *                       location: "Auditorio Principal, Centro de Convenciones"
 *                       isVirtual: false
 *                       price: 30.00
 *                       currency: "GTQ"
 *                       status: "active"
 *                       requirements: "Laptop con software de desarrollo y conocimientos básicos de Python"
 *                       updatedAt: "2023-10-20T16:45:00.000Z"
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
 *                   example: "No tienes permisos para actualizar esta sesión"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Sesión o evento no encontrado
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
 *                   example: "Sesión no encontrada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_NOT_FOUND"
 *       409:
 *         description: Conflicto con capacidad existente
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
 *                   example: "No se puede reducir la capacidad por debajo de los participantes actuales"
 *                 error:
 *                   type: string
 *                   example: "CAPACITY_CONFLICT"
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
router.put('/:eventId/sessions/:sessionId',
  authenticated,
  createEditLimiter,
  updateEventSessionValidation,
  eventSessionController.updateEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}:
 *   delete:
 *     tags: [Event Sessions]
 *     summary: Eliminar sesión
 *     description: Elimina una sesión de evento (soft delete - marca como inactiva)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la sesión
 *         example: 456
 *     responses:
 *       200:
 *         description: Sesión eliminada exitosamente
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
 *                   example: "Sesión eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         eventId:
 *                           type: integer
 *                           example: 123
 *                         title:
 *                           type: string
 *                           example: "Taller de Introducción a la IA"
 *                         status:
 *                           type: string
 *                           example: "cancelled"
 *                         deletedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-25T09:15:00.000Z"
 *             examples:
 *               sesion_eliminada:
 *                 summary: Sesión eliminada exitosamente
 *                 value:
 *                   success: true
 *                   message: "Sesión eliminada exitosamente"
 *                   data:
 *                     session:
 *                       id: 456
 *                       eventId: 123
 *                       title: "Taller de Introducción a la IA"
 *                       status: "cancelled"
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
 *                   example: "No tienes permisos para eliminar esta sesión"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Sesión o evento no encontrado
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
 *                   example: "Sesión no encontrada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_NOT_FOUND"
 *       409:
 *         description: No se puede eliminar sesión con participantes
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
 *                   example: "No se puede eliminar una sesión que tiene participantes inscritos"
 *                 error:
 *                   type: string
 *                   example: "SESSION_HAS_PARTICIPANTS"
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
router.delete('/:eventId/sessions/:sessionId',
  authenticated,
  sessionLimiter,
  [...eventIdValidation, ...sessionIdValidation],
  eventSessionController.deleteEventSession
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}/availability:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Verificar disponibilidad
 *     description: Verifica la disponibilidad de capacidad para una sesión específica
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la sesión
 *         example: 456
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Cantidad de espacios a verificar
 *         example: 2
 *     responses:
 *       200:
 *         description: Disponibilidad verificada exitosamente
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
 *                   example: "Disponibilidad verificada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: integer
 *                       example: 456
 *                     availableCapacity:
 *                       type: integer
 *                       example: 35
 *                     requestedQuantity:
 *                       type: integer
 *                       example: 2
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *                     blockedCapacity:
 *                       type: integer
 *                       example: 3
 *                     totalCapacity:
 *                       type: integer
 *                       example: 50
 *             examples:
 *               disponibilidad_disponible:
 *                 summary: Espacios disponibles
 *                 value:
 *                   success: true
 *                   message: "Disponibilidad verificada exitosamente"
 *                   data:
 *                     sessionId: 456
 *                     availableCapacity: 35
 *                     requestedQuantity: 2
 *                     isAvailable: true
 *                     blockedCapacity: 3
 *                     totalCapacity: 50
 *       404:
 *         description: Sesión no encontrada
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
 *                   example: "Sesión no encontrada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_NOT_FOUND"
 *       409:
 *         description: Capacidad insuficiente
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
 *                   example: "Capacidad insuficiente para la cantidad solicitada"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_CAPACITY"
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableCapacity:
 *                       type: integer
 *                       example: 1
 *                     requestedQuantity:
 *                       type: integer
 *                       example: 2
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
router.get('/:eventId/sessions/:sessionId/availability',
  sessionLimiter,
  [...eventIdValidation, ...sessionIdValidation],
  [
    query('quantity').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo')
  ],
  eventSessionController.checkSessionAvailability
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}/block:
 *   post:
 *     tags: [Event Sessions]
 *     summary: Bloquear capacidad
 *     description: Bloquea capacidad temporalmente para una sesión durante el proceso de reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la sesión
 *         example: 456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad de espacios a bloquear
 *                 example: 2
 *               blockDurationMinutes:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 60
 *                 default: 15
 *                 description: Duración del bloqueo en minutos
 *                 example: 15
 *           examples:
 *             bloquear_capacidad:
 *               summary: Bloquear capacidad
 *               value:
 *                 quantity: 2
 *                 blockDurationMinutes: 15
 *     responses:
 *       200:
 *         description: Capacidad bloqueada exitosamente
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
 *                   example: "Capacidad bloqueada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: integer
 *                       example: 456
 *                     blockedQuantity:
 *                       type: integer
 *                       example: 2
 *                     blockId:
 *                       type: string
 *                       example: "block_789"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T12:15:00.000Z"
 *                     availableCapacity:
 *                       type: integer
 *                       example: 33
 *             examples:
 *               capacidad_bloqueada:
 *                 summary: Capacidad bloqueada exitosamente
 *                 value:
 *                   success: true
 *                   message: "Capacidad bloqueada exitosamente"
 *                   data:
 *                     sessionId: 456
 *                     blockedQuantity: 2
 *                     blockId: "block_789"
 *                     expiresAt: "2023-10-01T12:15:00.000Z"
 *                     availableCapacity: 33
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
 *                   example: "Cantidad debe ser mayor a 0"
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
 *       404:
 *         description: Sesión no encontrada
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
 *                   example: "Sesión no encontrada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_NOT_FOUND"
 *       409:
 *         description: Capacidad insuficiente
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
 *                   example: "Capacidad insuficiente para bloquear la cantidad solicitada"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_CAPACITY"
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
router.post('/:eventId/sessions/:sessionId/block',
  authenticated,
  sessionLimiter,
  blockCapacityValidation,
  eventSessionController.blockSessionCapacity
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/{sessionId}/release:
 *   post:
 *     tags: [Event Sessions]
 *     summary: Liberar capacidad
 *     description: Libera capacidad bloqueada de una sesión (usado cuando se cancela una reserva)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la sesión
 *         example: 456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad de espacios a liberar
 *                 example: 2
 *           examples:
 *             liberar_capacidad:
 *               summary: Liberar capacidad
 *               value:
 *                 quantity: 2
 *     responses:
 *       200:
 *         description: Capacidad liberada exitosamente
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
 *                   example: "Capacidad liberada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: integer
 *                       example: 456
 *                     releasedQuantity:
 *                       type: integer
 *                       example: 2
 *                     availableCapacity:
 *                       type: integer
 *                       example: 37
 *             examples:
 *               capacidad_liberada:
 *                 summary: Capacidad liberada exitosamente
 *                 value:
 *                   success: true
 *                   message: "Capacidad liberada exitosamente"
 *                   data:
 *                     sessionId: 456
 *                     releasedQuantity: 2
 *                     availableCapacity: 37
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
 *                   example: "Cantidad debe ser mayor a 0"
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
 *       404:
 *         description: Sesión no encontrada
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
 *                   example: "Sesión no encontrada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_NOT_FOUND"
 *       409:
 *         description: No hay capacidad bloqueada suficiente
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
 *                   example: "No hay suficiente capacidad bloqueada para liberar"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_BLOCKED_CAPACITY"
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
router.post('/:eventId/sessions/:sessionId/release',
  authenticated,
  sessionLimiter,
  capacityOperationValidation,
  eventSessionController.releaseBlockedCapacity
);

/**
 * @swagger
 * /api/events/{eventId}/sessions/stats:
 *   get:
 *     tags: [Event Sessions]
 *     summary: Estadísticas de sesiones
 *     description: Obtiene estadísticas detalladas de las sesiones de un evento
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento
 *         example: 123
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
 *                   example: "Estadísticas de sesiones obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                       example: 5
 *                     activeSessions:
 *                       type: integer
 *                       example: 4
 *                     cancelledSessions:
 *                       type: integer
 *                       example: 1
 *                     virtualSessions:
 *                       type: integer
 *                       example: 2
 *                     inPersonSessions:
 *                       type: integer
 *                       example: 3
 *                     totalCapacity:
 *                       type: integer
 *                       example: 250
 *                     totalParticipants:
 *                       type: integer
 *                       example: 180
 *                     averageOccupancyRate:
 *                       type: number
 *                       example: 0.72
 *                     sessionsByType:
 *                       type: object
 *                       properties:
 *                         workshop:
 *                           type: integer
 *                           example: 2
 *                         time_slot:
 *                           type: integer
 *                           example: 2
 *                         date:
 *                           type: integer
 *                           example: 1
 *                     upcomingSessions:
 *                       type: integer
 *                       example: 3
 *                     pastSessions:
 *                       type: integer
 *                       example: 2
 *             examples:
 *               estadisticas_sesiones:
 *                 summary: Estadísticas de sesiones
 *                 value:
 *                   success: true
 *                   message: "Estadísticas de sesiones obtenidas exitosamente"
 *                   data:
 *                     totalSessions: 5
 *                     activeSessions: 4
 *                     cancelledSessions: 1
 *                     virtualSessions: 2
 *                     inPersonSessions: 3
 *                     totalCapacity: 250
 *                     totalParticipants: 180
 *                     averageOccupancyRate: 0.72
 *                     sessionsByType:
 *                       workshop: 2
 *                       time_slot: 2
 *                       date: 1
 *                     upcomingSessions: 3
 *                     pastSessions: 2
 *       404:
 *         description: Evento no encontrado
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
 *                   example: "Evento no encontrado"
 *                 error:
 *                   type: string
 *                   example: "EVENT_NOT_FOUND"
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
router.get('/:eventId/sessions/stats',
  sessionLimiter,
  eventIdValidation,
  eventSessionController.getEventSessionsStats
);

export default router;