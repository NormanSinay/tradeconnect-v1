/**
 * @fileoverview Rutas de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de eventos
 *
 * Archivo: backend/src/routes/events.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { eventController } from '../controllers/eventController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';
import { uploadService } from '../services/uploadService';

const router = Router();

// ====================================================================
// RATE LIMITING PARA EVENTOS
// ====================================================================

// Rate limiter general para operaciones de eventos
const eventLimiter = rateLimit({
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

// Validación para crear evento
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres'),
  body('shortDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción corta no puede exceder 500 caracteres'),
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
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero positivo'),
  body('minAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad mínima debe estar entre 0 y 120'),
  body('maxAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad máxima debe estar entre 0 y 120')
    .custom((value, { req }) => {
      if (req.body.minAge && value < req.body.minAge) {
        throw new Error('La edad máxima no puede ser menor que la edad mínima');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un arreglo'),
  body('requirements')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los requisitos no pueden exceder 2000 caracteres'),
  body('eventTypeId')
    .isInt({ min: 1 })
    .withMessage('El ID del tipo de evento debe ser un número entero positivo'),
  body('eventCategoryId')
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número entero positivo'),
  body('eventStatusId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del estado debe ser un número entero positivo')
];

// Validación para actualizar evento
const updateEventValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres'),
  body('shortDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción corta no puede exceder 500 caracteres'),
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
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacidad debe ser un número entero positivo'),
  body('minAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad mínima debe estar entre 0 y 120'),
  body('maxAge')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad máxima debe estar entre 0 y 120')
    .custom((value, { req }) => {
      if (req.body.minAge && value && value < req.body.minAge) {
        throw new Error('La edad máxima no puede ser menor que la edad mínima');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un arreglo'),
  body('requirements')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los requisitos no pueden exceder 2000 caracteres'),
  body('eventTypeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del tipo de evento debe ser un número entero positivo'),
  body('eventCategoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número entero positivo'),
  body('eventStatusId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del estado debe ser un número entero positivo')
];

// Validación para publicar evento
const publishEventValidation = [
  body('notifySubscribers')
    .optional()
    .isBoolean()
    .withMessage('notifySubscribers debe ser un valor booleano'),
  body('notificationMessage')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El mensaje de notificación no puede exceder 500 caracteres')
];

// Validación para parámetros de ruta
const eventIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo')
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
  query('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Estado inválido')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Listar eventos del usuario
 *     description: Obtiene eventos creados por el usuario autenticado
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticated, eventLimiter, queryValidation, eventController.getUserEvents);

/**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Crear evento
 *     description: Crea un nuevo evento
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticated, createEditLimiter, createEventValidation, eventController.createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Obtener evento
 *     description: Obtiene detalles de un evento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authenticated, eventLimiter, eventIdValidation, eventController.getEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Actualizar evento
 *     description: Actualiza información de un evento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', authenticated, createEditLimiter, eventIdValidation, updateEventValidation, eventController.updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Eliminar evento
 *     description: Elimina un evento (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', authenticated, eventLimiter, eventIdValidation, eventController.deleteEvent);

/**
 * @swagger
 * /api/events/{id}/publish:
 *   post:
 *     tags: [Events]
 *     summary: Publicar evento
 *     description: Publica un evento para que sea visible al público
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/publish', authenticated, eventLimiter, eventIdValidation, publishEventValidation, eventController.publishEvent);

/**
 * @swagger
 * /api/events/{id}/status:
 *   put:
 *     tags: [Events]
 *     summary: Cambiar estado del evento
 *     description: Cambia el estado de un evento (cancelar, etc.)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [cancel]
 */
router.put('/:id/status', authenticated, eventLimiter, eventIdValidation, [
  query('action')
    .isIn(['cancel'])
    .withMessage('Acción inválida'),
  body('reason')
    .isLength({ min: 10, max: 500 })
    .withMessage('La razón debe tener entre 10 y 500 caracteres')
], eventController.updateEventStatus);

/**
 * @swagger
 * /api/events/{id}/duplicate:
 *   post:
 *     tags: [Events]
 *     summary: Duplicar evento
 *     description: Crea una copia del evento con opción de modificar título, fechas y precio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del evento a duplicar
 *         example: 123
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 description: Nuevo título para el evento duplicado
 *                 example: "Taller de Introducción a la IA - Edición 2"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de inicio (debe ser futura)
 *                 example: "2023-12-01T09:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de fin (posterior a startDate)
 *                 example: "2023-12-01T17:00:00.000Z"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Nuevo precio para el evento duplicado
 *                 example: 150.00
 *           examples:
 *             duplicar_basico:
 *               summary: Duplicar evento sin cambios
 *               value: {}
 *             duplicar_con_cambios:
 *               summary: Duplicar con modificaciones
 *               value:
 *                 title: "Taller de Introducción a la IA - Edición 2"
 *                 startDate: "2023-12-01T09:00:00.000Z"
 *                 endDate: "2023-12-01T17:00:00.000Z"
 *                 price: 150.00
 *     responses:
 *       201:
 *         description: Evento duplicado exitosamente
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
 *                   example: "Evento duplicado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     originalEvent:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         title:
 *                           type: string
 *                           example: "Taller de Introducción a la IA"
 *                     duplicatedEvent:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 201
 *                         title:
 *                           type: string
 *                           example: "Taller de Introducción a la IA - Edición 2"
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T09:00:00.000Z"
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T17:00:00.000Z"
 *                         price:
 *                           type: number
 *                           example: 150.00
 *                         status:
 *                           type: string
 *                           example: "draft"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T10:00:00.000Z"
 *             examples:
 *               evento_duplicado:
 *                 summary: Evento duplicado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Evento duplicado exitosamente"
 *                   data:
 *                     originalEvent:
 *                       id: 123
 *                       title: "Taller de Introducción a la IA"
 *                     duplicatedEvent:
 *                       id: 201
 *                       title: "Taller de Introducción a la IA - Edición 2"
 *                       startDate: "2023-12-01T09:00:00.000Z"
 *                       endDate: "2023-12-01T17:00:00.000Z"
 *                       price: 150.00
 *                       status: "draft"
 *                       createdAt: "2023-10-15T10:00:00.000Z"
 *       400:
 *         description: Datos inválidos o conflicto en fechas
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
 *                   example: "No tienes permisos para duplicar este evento"
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
 *       409:
 *         description: Evento no puede ser duplicado
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
 *                   example: "No se puede duplicar un evento cancelado"
 *                 error:
 *                   type: string
 *                   example: "EVENT_NOT_DUPLICABLE"
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
// Ruta para duplicar eventos
router.post('/:id/duplicate', authenticated, createEditLimiter, eventIdValidation, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El título debe tener entre 3 y 255 caracteres'),
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
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
], eventController.duplicateEvent);

/**
 * @swagger
 * /api/events/{id}/upload-media:
 *   post:
 *     tags: [Events]
 *     summary: Subir archivos multimedia
 *     description: Sube imágenes, videos o documentos al evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/upload-media', authenticated, createEditLimiter, eventIdValidation, uploadService.uploadMultiple('files', 10), eventController.uploadMedia);

/**
 * @swagger
 * /api/events/{id}/media:
 *   get:
 *     tags: [Events]
 *     summary: Obtener archivos multimedia
 *     description: Obtiene la lista de archivos multimedia del evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id/media', authenticated, eventLimiter, eventIdValidation, eventController.getEventMedia);

/**
 * @swagger
 * /api/events/{id}/media/{mediaId}:
 *   delete:
 *     tags: [Events]
 *     summary: Eliminar archivo multimedia
 *     description: Elimina un archivo multimedia del evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id/media/:mediaId', authenticated, eventLimiter, [
  ...eventIdValidation,
  param('mediaId')
    .isInt({ min: 1 })
    .withMessage('El ID del archivo multimedia debe ser un número entero positivo')
], eventController.deleteMedia);

export default router;