/**
 * @fileoverview Rutas de Categorías y Tipos de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de categorías y tipos de eventos
 *
 * Archivo: backend/src/routes/event-categories.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { EventCategoryController } from '../controllers/eventCategoryController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA CATEGORÍAS Y TIPOS
// ====================================================================

// Rate limiter general para operaciones de categorías/tipos
const categoryLimiter = rateLimit({
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

// Validación para crear categoría
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-z_]+$/)
    .withMessage('El nombre solo puede contener letras minúsculas y guiones bajos'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre para mostrar debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
];

// Validación para actualizar categoría
const updateCategoryValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre para mostrar debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano')
];

// Validación para crear tipo
const createTypeValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-z_]+$/)
    .withMessage('El nombre solo puede contener letras minúsculas y guiones bajos'),
  body('displayName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre para mostrar debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
];

// Validación para actualizar tipo
const updateTypeValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre para mostrar debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano')
];

// Validación para parámetros de consulta
const queryValidation = [
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
    .withMessage('Búsqueda debe tener entre 2 y 100 caracteres'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive debe ser true o false')
];

// Validación para parámetros de ruta
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

// ====================================================================
// GESTIÓN DE CATEGORÍAS DE EVENTOS
// ====================================================================

/**
 * @swagger
 * /api/event-categories:
 *   get:
 *     tags: [Event Categories]
 *     summary: Listar categorías de eventos
 *     description: Obtiene lista paginada de categorías de eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 */
router.get('/',
  authenticated,
  categoryLimiter,
  queryValidation,
  EventCategoryController.getCategories
);

/**
 * @swagger
 * /api/event-categories/active:
 *   get:
 *     tags: [Event Categories]
 *     summary: Obtener categorías activas
 *     description: Obtiene todas las categorías activas (con caché)
 *     security:
 *       - bearerAuth: []
 */
router.get('/active',
  authenticated,
  categoryLimiter,
  EventCategoryController.getActiveCategories
);

/**
 * @swagger
 * /api/event-categories/{id}:
 *   get:
 *     tags: [Event Categories]
 *     summary: Obtener categoría por ID
 *     description: Obtiene una categoría específica por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 */
router.get('/:id',
  authenticated,
  categoryLimiter,
  idValidation,
  EventCategoryController.getCategoryById
);

/**
 * @swagger
 * /api/event-categories:
 *   post:
 *     tags: [Event Categories]
 *     summary: Crear categoría
 *     description: Crea una nueva categoría de eventos
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
 *               - displayName
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre único de la categoría
 *                 example: "business"
 *               displayName:
 *                 type: string
 *                 description: Nombre para mostrar
 *                 example: "Negocios"
 *               description:
 *                 type: string
 *                 description: Descripción de la categoría
 *                 example: "Eventos relacionados con negocios"
 */
router.post('/',
  authenticated,
  categoryLimiter,
  createCategoryValidation,
  EventCategoryController.createCategory
);

/**
 * @swagger
 * /api/event-categories/{id}:
 *   put:
 *     tags: [Event Categories]
 *     summary: Actualizar categoría
 *     description: Actualiza una categoría existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: Nuevo nombre para mostrar
 *               description:
 *                 type: string
 *                 description: Nueva descripción
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo
 */
router.put('/:id',
  authenticated,
  categoryLimiter,
  idValidation,
  updateCategoryValidation,
  EventCategoryController.updateCategory
);

/**
 * @swagger
 * /api/event-categories/{id}:
 *   delete:
 *     tags: [Event Categories]
 *     summary: Eliminar categoría
 *     description: Elimina una categoría (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 */
router.delete('/:id',
  authenticated,
  categoryLimiter,
  idValidation,
  EventCategoryController.deleteCategory
);

// ====================================================================
// GESTIÓN DE TIPOS DE EVENTOS
// ====================================================================

/**
 * @swagger
 * /api/event-categories/types:
 *   get:
 *     tags: [Event Types]
 *     summary: Listar tipos de eventos
 *     description: Obtiene lista paginada de tipos de eventos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 */
router.get('/types',
  authenticated,
  categoryLimiter,
  queryValidation,
  EventCategoryController.getTypes
);

/**
 * @swagger
 * /api/event-categories/types/active:
 *   get:
 *     tags: [Event Types]
 *     summary: Obtener tipos activos
 *     description: Obtiene todos los tipos activos (con caché)
 *     security:
 *       - bearerAuth: []
 */
router.get('/types/active',
  authenticated,
  categoryLimiter,
  EventCategoryController.getActiveTypes
);

/**
 * @swagger
 * /api/event-categories/types/{id}:
 *   get:
 *     tags: [Event Types]
 *     summary: Obtener tipo por ID
 *     description: Obtiene un tipo específico por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 */
router.get('/types/:id',
  authenticated,
  categoryLimiter,
  idValidation,
  EventCategoryController.getTypeById
);

/**
 * @swagger
 * /api/event-categories/types:
 *   post:
 *     tags: [Event Types]
 *     summary: Crear tipo de evento
 *     description: Crea un nuevo tipo de eventos
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
 *               - displayName
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre único del tipo
 *                 example: "conference"
 *               displayName:
 *                 type: string
 *                 description: Nombre para mostrar
 *                 example: "Conferencia"
 *               description:
 *                 type: string
 *                 description: Descripción del tipo
 *                 example: "Evento de conferencias y ponencias"
 */
router.post('/types',
  authenticated,
  categoryLimiter,
  createTypeValidation,
  EventCategoryController.createType
);

/**
 * @swagger
 * /api/event-categories/types/{id}:
 *   put:
 *     tags: [Event Types]
 *     summary: Actualizar tipo de evento
 *     description: Actualiza un tipo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: Nuevo nombre para mostrar
 *               description:
 *                 type: string
 *                 description: Nueva descripción
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo
 */
router.put('/types/:id',
  authenticated,
  categoryLimiter,
  idValidation,
  updateTypeValidation,
  EventCategoryController.updateType
);

/**
 * @swagger
 * /api/event-categories/types/{id}:
 *   delete:
 *     tags: [Event Types]
 *     summary: Eliminar tipo de evento
 *     description: Elimina un tipo (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo
 */
router.delete('/types/:id',
  authenticated,
  categoryLimiter,
  idValidation,
  EventCategoryController.deleteType
);

export default router;
