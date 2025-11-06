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
router.get('/', authenticated, eventLimiter, queryValidation, eventController.getUserEvents.bind(eventController));

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
router.post('/', authenticated, createEditLimiter, createEventValidation, eventController.createEvent.bind(eventController));

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
router.get('/:id', authenticated, eventLimiter, eventIdValidation, eventController.getEvent.bind(eventController));

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
router.put('/:id', authenticated, createEditLimiter, eventIdValidation, updateEventValidation, eventController.updateEvent.bind(eventController));

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
router.delete('/:id', authenticated, eventLimiter, eventIdValidation, eventController.deleteEvent.bind(eventController));

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
 *     responses:
 *       200:
 *         description: Evento publicado exitosamente
 *       400:
 *         description: Evento no listo para publicar
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Evento no encontrado
 *       409:
 *         description: Evento ya publicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/publish', authenticated, eventLimiter, eventIdValidation, publishEventValidation, eventController.publishEvent.bind(eventController));

/**
 * @swagger
 * /api/events/{id}/speakers:
 *   post:
 *     tags: [Events]
 *     summary: Asignar speaker a evento
 *     description: Asigna un speaker existente a un evento con rol específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - speakerId
 *               - role
 *               - participationStart
 *               - participationEnd
 *             properties:
 *               speakerId:
 *                 type: integer
 *                 description: ID del speaker a asignar
 *               role:
 *                 type: string
 *                 enum: ["keynote_speaker", "panelist", "facilitator", "moderator", "guest"]
 *                 description: Rol del speaker en el evento
 *               participationStart:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio de participación
 *               participationEnd:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de fin de participación
 *               modality:
 *                 type: string
 *                 enum: ["presential", "virtual", "hybrid"]
 *                 description: Modalidad de participación
 *               order:
 *                 type: integer
 *                 description: Orden de aparición
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Notas internas sobre la participación
 *     responses:
 *       201:
 *         description: Speaker asignado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Evento o speaker no encontrado
 *       409:
 *         description: Conflicto de disponibilidad
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/speakers', authenticated, createEditLimiter, eventIdValidation, [
  body('speakerId')
    .isInt({ min: 1 })
    .withMessage('El ID del speaker debe ser un número entero positivo'),
  body('role')
    .isIn(['keynote_speaker', 'panelist', 'facilitator', 'moderator', 'guest'])
    .withMessage('Rol inválido'),
  body('participationStart')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  body('participationEnd')
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.participationStart)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('modality')
    .optional()
    .isIn(['presential', 'virtual', 'hybrid'])
    .withMessage('Modalidad inválida'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El orden debe ser un número entero positivo'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres')
], eventController.assignSpeakerToEvent.bind(eventController));

/**
 * @swagger
 * /api/events/{id}/speakers:
 *   get:
 *     tags: [Events]
 *     summary: Obtener speakers del evento
 *     description: Obtiene la lista de speakers asignados a un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del evento
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["tentative", "confirmed", "cancelled", "completed"]
 *           description: Filtrar por estado de asignación
 *     responses:
 *       200:
 *         description: Speakers obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/speakers', authenticated, eventLimiter, eventIdValidation, [
  query('status')
    .optional()
    .isArray()
    .withMessage('El estado debe ser un arreglo'),
  query('status.*')
    .optional()
    .isIn(['tentative', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Estado inválido')
], eventController.getEventSpeakers.bind(eventController));

/**
 * @swagger
 * /api/events/{id}/speakers/{speakerId}:
 *   put:
 *     tags: [Events]
 *     summary: Actualizar asignación de speaker
 *     description: Actualiza la información de asignación de un speaker a un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del evento
 *       - in: path
 *         name: speakerId
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del speaker
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: ["keynote_speaker", "panelist", "facilitator", "moderator", "guest"]
 *               participationStart:
 *                 type: string
 *                 format: date-time
 *               participationEnd:
 *                 type: string
 *                 format: date-time
 *               modality:
 *                 type: string
 *                 enum: ["presential", "virtual", "hybrid"]
 *               order:
 *                 type: integer
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: ["tentative", "confirmed", "cancelled", "completed"]
 *     responses:
 *       200:
 *         description: Asignación actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/speakers/:speakerId', authenticated, createEditLimiter, [
  ...eventIdValidation,
  param('speakerId')
    .isInt({ min: 1 })
    .withMessage('El ID del speaker debe ser un número entero positivo')
], [
  body('role')
    .optional()
    .isIn(['keynote_speaker', 'panelist', 'facilitator', 'moderator', 'guest'])
    .withMessage('Rol inválido'),
  body('participationStart')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  body('participationEnd')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (value && req.body.participationStart && new Date(value) <= new Date(req.body.participationStart)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('modality')
    .optional()
    .isIn(['presential', 'virtual', 'hybrid'])
    .withMessage('Modalidad inválida'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El orden debe ser un número entero positivo'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  body('status')
    .optional()
    .isIn(['tentative', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Estado inválido')
], eventController.updateSpeakerAssignment.bind(eventController));

/**
 * @swagger
 * /api/events/{id}/speakers/{speakerId}:
 *   delete:
 *     tags: [Events]
 *     summary: Eliminar asignación de speaker
 *     description: Elimina la asignación de un speaker de un evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del evento
 *       - in: path
 *         name: speakerId
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del speaker
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Razón de la eliminación
 *     responses:
 *       200:
 *         description: Asignación eliminada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Asignación no encontrada
 *       409:
 *         description: No se puede eliminar asignación completada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/speakers/:speakerId', authenticated, eventLimiter, [
  ...eventIdValidation,
  param('speakerId')
    .isInt({ min: 1 })
    .withMessage('El ID del speaker debe ser un número entero positivo')
], [
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La razón no puede exceder 500 caracteres')
], eventController.removeSpeakerFromEvent.bind(eventController));

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
], eventController.updateEventStatus.bind(eventController));

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
], eventController.duplicateEvent.bind(eventController));

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
router.post('/:id/upload-media', authenticated, createEditLimiter, eventIdValidation, uploadService.uploadMultiple('files', 10), eventController.uploadMedia.bind(eventController));

/**
 * @swagger
 * /api/events/{id}/media:
 *   get:
 *     tags: [Events]
 *     summary: Obtener archivos multimedia del evento
 *     description: Obtiene la lista de archivos multimedia asociados al evento, incluyendo material didáctico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del evento
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["image", "video", "document", "audio", "other"]
 *           description: Filtrar por tipo de medio
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ["presentation", "handout", "exercise", "resource", "other"]
 *           description: Filtrar por categoría de material didáctico
 *     responses:
 *       200:
 *         description: Archivos multimedia obtenidos exitosamente
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
 *                   example: "Archivos multimedia obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       filename:
 *                         type: string
 *                         example: "presentation.pdf"
 *                       originalName:
 *                         type: string
 *                         example: "Presentación del Taller.pdf"
 *                       url:
 *                         type: string
 *                         example: "https://example.com/uploads/presentation.pdf"
 *                       type:
 *                         type: string
 *                         enum: ["image", "video", "document", "audio", "other"]
 *                         example: "document"
 *                       category:
 *                         type: string
 *                         enum: ["presentation", "handout", "exercise", "resource", "other"]
 *                         example: "presentation"
 *                       description:
 *                         type: string
 *                         example: "Presentación principal del taller"
 *                       isPublic:
 *                         type: boolean
 *                         example: true
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-10-01T10:00:00.000Z"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/media', authenticated, eventLimiter, eventIdValidation, [
  query('type')
    .optional()
    .isIn(['image', 'video', 'document', 'audio', 'other'])
    .withMessage('Tipo de medio inválido'),
  query('category')
    .optional()
    .isIn(['presentation', 'handout', 'exercise', 'resource', 'other'])
    .withMessage('Categoría inválida')
], eventController.getEventMedia.bind(eventController));

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
], eventController.deleteMedia.bind(eventController));

/**
 * @swagger
 * /api/events/{id}/access-types:
 *   get:
 *     tags: [Events]
 *     summary: Obtener tipos de acceso del evento
 *     description: |
 *       Obtiene la lista de tipos de acceso disponibles para un evento específico.
 *       NOTA: Los eventos virtuales (isVirtual=true) no tienen tipos de acceso y retornarán un array vacío.
 *       Solo eventos presenciales o híbridos tienen tipos de acceso.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Tipos de acceso obtenidos exitosamente (o array vacío si es evento virtual)
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
 *                   example: "Tipos de acceso del evento obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       eventId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       capacity:
 *                         type: integer
 *                       availableCapacity:
 *                         type: integer
 *                       benefits:
 *                         type: array
 *                         items:
 *                           type: string
 *                       restrictions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       isActive:
 *                         type: boolean
 *                       priority:
 *                         type: integer
 *       400:
 *         description: ID de evento inválido
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/access-types', eventLimiter, [
  ...eventIdValidation
], eventController.getEventAccessTypes.bind(eventController));

export default router;
