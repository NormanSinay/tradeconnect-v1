/**
 * @fileoverview Rutas de Configuración del Sistema para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para configuración del sistema
 *
 * Archivo: backend/src/routes/system.ts
 */

import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { systemController } from '../controllers/systemController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';
import { SystemConfigCategory } from '../types/system.types';

const router = Router();

// ====================================================================
// RATE LIMITING PARA CONFIGURACIÓN DEL SISTEMA
// ====================================================================

// Rate limiter para operaciones de configuración (restrictivo)
const configLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: 50, // máximo 50 requests por usuario cada 15 minutos para configuración
  message: {
    success: false,
    message: 'Demasiadas operaciones de configuración. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter más permisivo para lecturas públicas
const publicConfigLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: 200, // máximo 200 requests por usuario cada 15 minutos para configuración pública
  message: {
    success: false,
    message: 'Demasiadas solicitudes de configuración. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para crear configuración
const createConfigValidation = [
  body('key')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('La clave debe tener entre 1 y 100 caracteres'),
  body('value')
    .exists()
    .withMessage('El valor es requerido'),
  body('category')
    .isIn(['general', 'security', 'payment', 'notification', 'email', 'integration', 'ui', 'performance'])
    .withMessage('Categoría inválida'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('La descripción debe tener máximo 255 caracteres'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano')
];

// Validación para actualizar configuración
const updateConfigValidation = [
  body('value')
    .optional(),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('La descripción debe tener máximo 255 caracteres'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano')
];

// Validación para parámetros de clave
const keyParamValidation = [
  param('key')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('La clave debe tener entre 1 y 100 caracteres')
];

// Validación para parámetros de categoría
const categoryParamValidation = [
  param('category')
    .isIn(['general', 'security', 'payment', 'notification', 'email', 'integration', 'ui', 'performance'])
    .withMessage('Categoría inválida')
];

// Validación para creación masiva
const bulkCreateValidation = [
  body('configs')
    .isArray({ min: 1, max: 50 })
    .withMessage('Debe proporcionar entre 1 y 50 configuraciones'),
  body('configs.*.key')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Cada clave debe tener entre 1 y 100 caracteres'),
  body('configs.*.value')
    .exists()
    .withMessage('Cada configuración debe tener un valor'),
  body('configs.*.category')
    .isIn(['general', 'security', 'payment', 'notification', 'email', 'integration', 'ui', 'performance'])
    .withMessage('Cada configuración debe tener una categoría válida')
];

// Validación para filtros de lista
const listFiltersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  query('category')
    .optional()
    .isIn(['general', 'security', 'payment', 'notification', 'email', 'integration', 'ui', 'performance'])
    .withMessage('Categoría inválida'),
  query('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic debe ser un valor booleano'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un valor booleano'),
  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('La búsqueda debe tener máximo 100 caracteres')
];

// ====================================================================
// RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/system/config/public:
 *   get:
 *     tags: [System Configuration]
 *     summary: Obtener configuración pública
 *     description: Obtiene la configuración pública del sistema (no requiere autenticación)
 *     responses:
 *       200:
 *         description: Configuración pública obtenida exitosamente
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
 *                   example: "Configuraciones públicas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   example: {"system.language": "es", "system.timezone": "America/Guatemala"}
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/config/public',
  publicConfigLimiter,
  systemController.getPublicConfig
);

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN Y PERMISOS)
// ====================================================================

/**
 * @swagger
 * /api/system/config:
 *   get:
 *     tags: [System Configuration]
 *     summary: Obtener configuración completa del sistema
 *     description: Obtiene la configuración completa del sistema organizada por categorías
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 *       403:
 *         description: No tienes permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/config',
  authenticated,
  configLimiter,
  systemController.getSystemConfig
);

/**
 * @swagger
 * /api/system/config/{key}:
 *   get:
 *     tags: [System Configuration]
 *     summary: Obtener configuración por clave
 *     description: Obtiene una configuración específica por su clave
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de configuración
 *         example: "system.language"
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Incluir configuraciones inactivas
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 *       403:
 *         description: No tienes permisos
 *       404:
 *         description: Configuración no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/config/:key',
  authenticated,
  configLimiter,
  keyParamValidation,
  systemController.getConfigByKey
);

/**
 * @swagger
 * /api/system/config/category/{category}:
 *   get:
 *     tags: [System Configuration]
 *     summary: Obtener configuración por categoría
 *     description: Obtiene todas las configuraciones de una categoría específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [general, security, payment, notification, email, integration, ui, performance]
 *         description: Categoría de configuración
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Incluir configuraciones inactivas
 *     responses:
 *       200:
 *         description: Configuraciones obtenidas exitosamente
 *       403:
 *         description: No tienes permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/config/category/:category',
  authenticated,
  configLimiter,
  categoryParamValidation,
  systemController.getConfigByCategory
);

/**
 * @swagger
 * /api/system/config:
 *   post:
 *     tags: [System Configuration]
 *     summary: Crear configuración
 *     description: Crea una nueva configuración del sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSystemConfigRequest'
 *     responses:
 *       201:
 *         description: Configuración creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos
 *       409:
 *         description: Configuración ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/config',
  authenticated,
  configLimiter,
  createConfigValidation,
  systemController.createConfig
);

/**
 * @swagger
 * /api/system/config/{key}:
 *   put:
 *     tags: [System Configuration]
 *     summary: Actualizar configuración
 *     description: Actualiza una configuración existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de configuración
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSystemConfigRequest'
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       403:
 *         description: No tienes permisos
 *       404:
 *         description: Configuración no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/config/:key',
  authenticated,
  configLimiter,
  keyParamValidation,
  updateConfigValidation,
  systemController.updateConfig
);

/**
 * @swagger
 * /api/system/config/{key}:
 *   delete:
 *     tags: [System Configuration]
 *     summary: Eliminar configuración
 *     description: Elimina una configuración del sistema (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de configuración
 *     responses:
 *       200:
 *         description: Configuración eliminada exitosamente
 *       403:
 *         description: No tienes permisos
 *       404:
 *         description: Configuración no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/config/:key',
  authenticated,
  configLimiter,
  keyParamValidation,
  systemController.deleteConfig
);

/**
 * @swagger
 * /api/system/config/bulk:
 *   post:
 *     tags: [System Configuration]
 *     summary: Crear configuraciones masivamente
 *     description: Crea múltiples configuraciones del sistema en una sola operación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkSystemConfigRequest'
 *     responses:
 *       200:
 *         description: Configuraciones procesadas exitosamente
 *       403:
 *         description: No tienes permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/config/bulk',
  authenticated,
  configLimiter,
  bulkCreateValidation,
  systemController.bulkCreateConfigs
);

/**
 * @swagger
 * /api/system/config/list:
 *   get:
 *     tags: [System Configuration]
 *     summary: Listar configuraciones
 *     description: Obtiene una lista paginada de configuraciones con filtros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Registros por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [general, security, payment, notification, email, integration, ui, performance]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por clave o descripción
 *     responses:
 *       200:
 *         description: Configuraciones listadas exitosamente
 *       403:
 *         description: No tienes permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/config/list',
  authenticated,
  configLimiter,
  listFiltersValidation,
  systemController.listConfigs
);

/**
 * @swagger
 * /api/system/config/stats:
 *   get:
 *     tags: [System Configuration]
 *     summary: Obtener estadísticas
 *     description: Obtiene estadísticas de la configuración del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       403:
 *         description: No tienes permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/config/stats',
  authenticated,
  configLimiter,
  systemController.getConfigStats
);

/**
 * @swagger
 * /api/system/config/initialize:
 *   post:
 *     tags: [System Configuration]
 *     summary: Inicializar configuración por defecto
 *     description: Crea la configuración por defecto del sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración inicializada exitosamente
 *       403:
 *         description: No tienes permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/config/initialize',
  authenticated,
  configLimiter,
  systemController.initializeDefaultConfig
);

/**
 * @swagger
 * /api/system/config/full:
 *   get:
 *     tags: [System Configuration]
 *     summary: Obtener configuración completa organizada
 *     description: Obtiene toda la configuración del sistema organizada por categorías
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración completa obtenida exitosamente
 *       403:
 *         description: No tienes permisos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/config/full',
  authenticated,
  configLimiter,
  systemController.getFullConfig
);

export default router;