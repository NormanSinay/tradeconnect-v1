/**
 * @fileoverview Rutas de Usuarios para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de usuarios y perfiles
 *
 * Archivo: backend/src/routes/users.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { userController } from '../controllers/userController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA USUARIOS
// ====================================================================

// Rate limiter general para operaciones de usuario
const userLimiter = rateLimit({
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

// Validación para actualización de perfil
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Apellido solo puede contener letras'),
  body('phone')
    .optional()
    .matches(/^\+502\s?\d{4}-?\d{4}$/)
    .withMessage('Teléfono debe tener formato guatemalteco (+502 1234-5678)'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar debe ser una URL válida'),
  body('nit')
    .optional()
    .matches(/^\d{8}-[0-9K]$/i)
    .withMessage('NIT debe tener formato guatemalteco (12345678-9)'),
  body('cui')
    .optional()
    .isLength({ min: 13, max: 13 })
    .isNumeric()
    .withMessage('CUI debe tener 13 dígitos'),
  body('timezone')
    .optional()
    .isIn(['America/Guatemala', 'UTC'])
    .withMessage('Zona horaria inválida'),
  body('locale')
    .optional()
    .isIn(['es', 'es-GT', 'en'])
    .withMessage('Idioma inválido')
];

// Validación para creación de usuario (admin)
const createUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Contraseña debe contener mayúsculas, minúsculas y números'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Apellido solo puede contener letras'),
  body('phone')
    .optional()
    .matches(/^\+502\s?\d{4}-?\d{4}$/)
    .withMessage('Teléfono debe tener formato guatemalteco (+502 1234-5678)'),
  body('role')
    .optional()
    .isIn(['user', 'speaker', 'participant', 'client'])
    .withMessage('Rol inválido')
];

// Validación para actualización de usuario (admin)
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Apellido solo puede contener letras'),
  body('phone')
    .optional()
    .matches(/^\+502\s?\d{4}-?\d{4}$/)
    .withMessage('Teléfono debe tener formato guatemalteco (+502 1234-5678)'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  body('role')
    .optional()
    .isIn(['user', 'speaker', 'participant', 'client'])
    .withMessage('Rol inválido')
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
  query('role')
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'operator', 'user', 'speaker', 'participant', 'client'])
    .withMessage('Rol inválido'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive debe ser true o false')
];

// Validación para parámetros de ruta
const userIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Obtener perfil del usuario
 *     description: Obtiene información completa del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
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
 *                   example: "Perfil obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "usuario@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Juan"
 *                         lastName:
 *                           type: string
 *                           example: "Pérez"
 *                         phone:
 *                           type: string
 *                           example: "+502 1234-5678"
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
 *                         timezone:
 *                           type: string
 *                           enum: [America/Guatemala, UTC]
 *                           example: "America/Guatemala"
 *                         locale:
 *                           type: string
 *                           enum: [es, "es-GT", en]
 *                           example: "es-GT"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         emailVerified:
 *                           type: boolean
 *                           example: true
 *                         twoFactorEnabled:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-15T10:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T14:30:00.000Z"
 *                         lastLoginAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T09:00:00.000Z"
 *             examples:
 *               perfil_obtenido:
 *                 summary: Perfil obtenido exitosamente
 *                 value:
 *                   success: true
 *                   message: "Perfil obtenido exitosamente"
 *                   data:
 *                     user:
 *                       id: 123
 *                       email: "usuario@ejemplo.com"
 *                       firstName: "Juan"
 *                       lastName: "Pérez"
 *                       phone: "+502 1234-5678"
 *                       avatar: "https://example.com/avatar.jpg"
 *                       nit: "12345678-9"
 *                       cui: "1234567890123"
 *                       timezone: "America/Guatemala"
 *                       locale: "es-GT"
 *                       role: "user"
 *                       isActive: true
 *                       emailVerified: true
 *                       twoFactorEnabled: false
 *                       createdAt: "2023-01-15T10:00:00.000Z"
 *                       updatedAt: "2023-10-01T14:30:00.000Z"
 *                       lastLoginAt: "2023-10-15T09:00:00.000Z"
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
router.get('/profile', authenticated, userLimiter, userController.getProfile);

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     tags: [Users]
 *     summary: Obtener estadísticas del usuario
 *     description: Obtiene estadísticas personales del usuario autenticado (eventos, certificados, etc.)
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeEvents:
 *                       type: integer
 *                       example: 3
 *                     completedEvents:
 *                       type: integer
 *                       example: 8
 *                     certificates:
 *                       type: integer
 *                       example: 6
 *                     trainingHours:
 *                       type: integer
 *                       example: 42
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', authenticated, userLimiter, userController.getUserStats);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza información del perfil del usuario autenticado con validación completa
 *     security:
 *       - bearerAuth: []
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
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\\s]+$'
 *                 description: Nombre del usuario
 *                 example: "Juan Carlos"
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\\s]+$'
 *                 description: Apellido del usuario
 *                 example: "Pérez González"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                 description: Teléfono en formato guatemalteco
 *                 example: "+502 1234-5678"
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: URL del avatar del usuario
 *                 example: "https://example.com/avatar.jpg"
 *               nit:
 *                 type: string
 *                 pattern: '^\\d{8}-[0-9K]$'
 *                 description: NIT guatemalteco
 *                 example: "12345678-9"
 *               cui:
 *                 type: string
 *                 minLength: 13
 *                 maxLength: 13
 *                 pattern: '^\\d{13}$'
 *                 description: CUI guatemalteco
 *                 example: "1234567890123"
 *               timezone:
 *                 type: string
 *                 enum: [America/Guatemala, UTC]
 *                 description: Zona horaria del usuario
 *                 example: "America/Guatemala"
 *               locale:
 *                 type: string
 *                 enum: [es, "es-GT", en]
 *                 description: Idioma preferido
 *                 example: "es-GT"
 *           examples:
 *             actualizar_perfil:
 *               summary: Actualizar perfil completo
 *               value:
 *                 firstName: "Juan Carlos"
 *                 lastName: "Pérez González"
 *                 phone: "+502 1234-5678"
 *                 avatar: "https://example.com/avatar.jpg"
 *                 nit: "12345678-9"
 *                 cui: "1234567890123"
 *                 timezone: "America/Guatemala"
 *                 locale: "es-GT"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
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
 *                   example: "Perfil actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         email:
 *                           type: string
 *                           example: "usuario@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Juan Carlos"
 *                         lastName:
 *                           type: string
 *                           example: "Pérez González"
 *                         phone:
 *                           type: string
 *                           example: "+502 1234-5678"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                         nit:
 *                           type: string
 *                           example: "12345678-9"
 *                         cui:
 *                           type: string
 *                           example: "1234567890123"
 *                         timezone:
 *                           type: string
 *                           example: "America/Guatemala"
 *                         locale:
 *                           type: string
 *                           example: "es-GT"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T14:30:00.000Z"
 *             examples:
 *               perfil_actualizado:
 *                 summary: Perfil actualizado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Perfil actualizado exitosamente"
 *                   data:
 *                     user:
 *                       id: 123
 *                       email: "usuario@ejemplo.com"
 *                       firstName: "Juan Carlos"
 *                       lastName: "Pérez González"
 *                       phone: "+502 1234-5678"
 *                       avatar: "https://example.com/avatar.jpg"
 *                       nit: "12345678-9"
 *                       cui: "1234567890123"
 *                       timezone: "America/Guatemala"
 *                       locale: "es-GT"
 *                       updatedAt: "2023-10-15T14:30:00.000Z"
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
 *                   example: "Nombre debe tener entre 2 y 50 caracteres"
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
 *       409:
 *         description: Conflicto con datos existentes
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
 *                   example: "El NIT ya está registrado por otro usuario"
 *                 error:
 *                   type: string
 *                   example: "DATA_CONFLICT"
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
router.put('/profile', authenticated, userLimiter, updateProfileValidation, userController.updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios
 *     description: Obtiene lista paginada de usuarios con filtros opcionales (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
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
 *         description: Número de usuarios por página
 *         example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Término de búsqueda (nombre, apellido, email)
 *         example: "Juan Pérez"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, manager, operator, user, speaker, participant, client]
 *         description: Filtrar por rol de usuario
 *         example: "user"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar usuarios activos/inactivos
 *         example: true
 *     responses:
 *       200:
 *         description: Usuarios obtenidos exitosamente
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
 *                   example: "Usuarios obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 123
 *                           email:
 *                             type: string
 *                             example: "usuario@ejemplo.com"
 *                           firstName:
 *                             type: string
 *                             example: "Juan"
 *                           lastName:
 *                             type: string
 *                             example: "Pérez"
 *                           phone:
 *                             type: string
 *                             example: "+502 1234-5678"
 *                           avatar:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                           role:
 *                             type: string
 *                             example: "user"
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           emailVerified:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-01-15T10:00:00.000Z"
 *                           lastLoginAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-15T09:00:00.000Z"
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
 *               usuarios_listados:
 *                 summary: Usuarios listados exitosamente
 *                 value:
 *                   success: true
 *                   message: "Usuarios obtenidos exitosamente"
 *                   data:
 *                     users:
 *                       - id: 123
 *                         email: "usuario@ejemplo.com"
 *                         firstName: "Juan"
 *                         lastName: "Pérez"
 *                         phone: "+502 1234-5678"
 *                         avatar: "https://example.com/avatar.jpg"
 *                         role: "user"
 *                         isActive: true
 *                         emailVerified: true
 *                         createdAt: "2023-01-15T10:00:00.000Z"
 *                         lastLoginAt: "2023-10-15T09:00:00.000Z"
 *                       - id: 124
 *                         email: "admin@ejemplo.com"
 *                         firstName: "María"
 *                         lastName: "González"
 *                         phone: "+502 8765-4321"
 *                         role: "admin"
 *                         isActive: true
 *                         emailVerified: true
 *                         createdAt: "2023-01-01T08:00:00.000Z"
 *                         lastLoginAt: "2023-10-15T08:30:00.000Z"
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
 *                   example: "Página debe ser un número entero positivo"
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
 *                   example: "No tienes permisos para listar usuarios"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
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
router.get('/', authenticated, userLimiter, queryValidation, userController.getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario
 *     description: Crea nuevo usuario en el sistema con validación completa (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único del usuario
 *                 example: "nuevo@ejemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'
 *                 description: Contraseña con mayúsculas, minúsculas y números
 *                 example: "Contraseña123"
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\\s]+$'
 *                 description: Nombre del usuario
 *                 example: "Ana"
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\\s]+$'
 *                 description: Apellido del usuario
 *                 example: "Martínez"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                 description: Teléfono en formato guatemalteco (opcional)
 *                 example: "+502 8765-4321"
 *               role:
 *                 type: string
 *                 enum: [user, speaker, participant, client]
 *                 default: user
 *                 description: Rol asignado al usuario
 *                 example: "user"
 *           examples:
 *             crear_usuario_basico:
 *               summary: Crear usuario básico
 *               value:
 *                 email: "nuevo@ejemplo.com"
 *                 password: "Contraseña123"
 *                 firstName: "Ana"
 *                 lastName: "Martínez"
 *             crear_usuario_completo:
 *               summary: Crear usuario con datos completos
 *               value:
 *                 email: "speaker@ejemplo.com"
 *                 password: "SpeakerPass123"
 *                 firstName: "Carlos"
 *                 lastName: "Rodríguez"
 *                 phone: "+502 8765-4321"
 *                 role: "speaker"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 201
 *                         email:
 *                           type: string
 *                           example: "nuevo@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Ana"
 *                         lastName:
 *                           type: string
 *                           example: "Martínez"
 *                         phone:
 *                           type: string
 *                           example: "+502 8765-4321"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         emailVerified:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T10:00:00.000Z"
 *             examples:
 *               usuario_creado:
 *                 summary: Usuario creado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Usuario creado exitosamente"
 *                   data:
 *                     user:
 *                       id: 201
 *                       email: "nuevo@ejemplo.com"
 *                       firstName: "Ana"
 *                       lastName: "Martínez"
 *                       phone: "+502 8765-4321"
 *                       role: "user"
 *                       isActive: true
 *                       emailVerified: false
 *                       createdAt: "2023-10-15T10:00:00.000Z"
 *       400:
 *         description: Datos inválidos o usuario ya existe
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
 *                   example: "El email ya está registrado"
 *                 error:
 *                   type: string
 *                   example: "USER_ALREADY_EXISTS"
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
 *                   example: "No tienes permisos para crear usuarios"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
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
router.post('/', authenticated, userLimiter, createUserValidation, userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario
 *     description: Actualiza información de usuario específico con validación completa (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del usuario a actualizar
 *         example: 123
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
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\\s]+$'
 *                 description: Nombre del usuario
 *                 example: "Ana María"
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z\\s]+$'
 *                 description: Apellido del usuario
 *                 example: "Martínez López"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                 description: Teléfono en formato guatemalteco
 *                 example: "+502 9999-8888"
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo del usuario
 *                 example: true
 *               role:
 *                 type: string
 *                 enum: [user, speaker, participant, client]
 *                 description: Rol asignado al usuario
 *                 example: "speaker"
 *           examples:
 *             actualizar_usuario:
 *               summary: Actualizar información del usuario
 *               value:
 *                 firstName: "Ana María"
 *                 lastName: "Martínez López"
 *                 phone: "+502 9999-8888"
 *                 isActive: true
 *                 role: "speaker"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         email:
 *                           type: string
 *                           example: "usuario@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Ana María"
 *                         lastName:
 *                           type: string
 *                           example: "Martínez López"
 *                         phone:
 *                           type: string
 *                           example: "+502 9999-8888"
 *                         role:
 *                           type: string
 *                           example: "speaker"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T14:30:00.000Z"
 *             examples:
 *               usuario_actualizado:
 *                 summary: Usuario actualizado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Usuario actualizado exitosamente"
 *                   data:
 *                     user:
 *                       id: 123
 *                       email: "usuario@ejemplo.com"
 *                       firstName: "Ana María"
 *                       lastName: "Martínez López"
 *                       phone: "+502 9999-8888"
 *                       role: "speaker"
 *                       isActive: true
 *                       updatedAt: "2023-10-15T14:30:00.000Z"
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
 *                   example: "Nombre debe tener entre 2 y 50 caracteres"
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
 *                   example: "No tienes permisos para actualizar este usuario"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Usuario no encontrado
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
 *                   example: "Usuario no encontrado"
 *                 error:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
 *       409:
 *         description: Conflicto con datos existentes
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
 *                   example: "No puedes desactivar tu propia cuenta"
 *                 error:
 *                   type: string
 *                   example: "SELF_DEACTIVATION_NOT_ALLOWED"
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
router.put('/:id', authenticated, userLimiter, userIdValidation, updateUserValidation, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     description: Elimina usuario del sistema (soft delete - marca como inactivo, requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del usuario a eliminar
 *         example: 123
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
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
 *                   example: "Usuario eliminado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         email:
 *                           type: string
 *                           example: "usuario@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Juan"
 *                         lastName:
 *                           type: string
 *                           example: "Pérez"
 *                         isActive:
 *                           type: boolean
 *                           example: false
 *                         deletedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T15:00:00.000Z"
 *             examples:
 *               usuario_eliminado:
 *                 summary: Usuario eliminado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Usuario eliminado exitosamente"
 *                   data:
 *                     user:
 *                       id: 123
 *                       email: "usuario@ejemplo.com"
 *                       firstName: "Juan"
 *                       lastName: "Pérez"
 *                       isActive: false
 *                       deletedAt: "2023-10-15T15:00:00.000Z"
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
 *                   example: "No tienes permisos para eliminar usuarios"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Usuario no encontrado
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
 *                   example: "Usuario no encontrado"
 *                 error:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
 *       409:
 *         description: No se puede eliminar el usuario
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
 *                   example: "No puedes eliminar tu propia cuenta"
 *                 error:
 *                   type: string
 *                   example: "SELF_DELETION_NOT_ALLOWED"
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
router.delete('/:id', authenticated, userLimiter, userController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/audit:
 *   get:
 *     tags: [Users]
 *     summary: Obtener auditoría de usuario
 *     description: Obtiene el historial de auditoría paginado de un usuario específico (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único del usuario
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
 *         description: Número de registros por página
 *         example: 20
 *     responses:
 *       200:
 *         description: Auditoría obtenida exitosamente
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
 *                   example: "Auditoría de usuario obtenida exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 456
 *                           userId:
 *                             type: integer
 *                             example: 123
 *                           action:
 *                             type: string
 *                             enum: [login, logout, password_change, profile_update, qr_generated, qr_used, payment_made]
 *                             example: "profile_update"
 *                           description:
 *                             type: string
 *                             example: "Usuario actualizó su perfil"
 *                           ipAddress:
 *                             type: string
 *                             example: "192.168.1.100"
 *                           userAgent:
 *                             type: string
 *                             example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                           location:
 *                             type: string
 *                             example: "Guatemala City, Guatemala"
 *                           metadata:
 *                             type: object
 *                             description: Datos adicionales específicos de la acción
 *                             example: { "changedFields": ["firstName", "phone"] }
 *                           createdAt:
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
 *               auditoria_obtenida:
 *                 summary: Auditoría obtenida exitosamente
 *                 value:
 *                   success: true
 *                   message: "Auditoría de usuario obtenida exitosamente"
 *                   data:
 *                     auditLogs:
 *                       - id: 456
 *                         userId: 123
 *                         action: "profile_update"
 *                         description: "Usuario actualizó su perfil"
 *                         ipAddress: "192.168.1.100"
 *                         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                         location: "Guatemala City, Guatemala"
 *                         metadata: { "changedFields": ["firstName", "phone"] }
 *                         createdAt: "2023-10-15T14:30:00.000Z"
 *                       - id: 455
 *                         userId: 123
 *                         action: "login"
 *                         description: "Usuario inició sesión"
 *                         ipAddress: "192.168.1.100"
 *                         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                         location: "Guatemala City, Guatemala"
 *                         metadata: { "deviceType": "desktop" }
 *                         createdAt: "2023-10-15T09:00:00.000Z"
 *                     pagination:
 *                       page: 1
 *                       limit: 20
 *                       total: 150
 *                       totalPages: 8
 *                       hasNext: true
 *                       hasPrev: false
 *       400:
 *         description: Parámetros inválidos
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
 *                   example: "Página debe ser un número entero positivo"
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
 *                   example: "No tienes permisos para acceder a la auditoría de usuarios"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Usuario no encontrado
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
 *                   example: "Usuario no encontrado"
 *                 error:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
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
router.get('/:id/audit', authenticated, userLimiter, userIdValidation, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100')
], userController.getUserAudit);

export default router;