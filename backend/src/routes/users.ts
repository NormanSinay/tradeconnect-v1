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
 *     description: Obtiene información del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticated, userLimiter, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza información del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', authenticated, userLimiter, updateProfileValidation, userController.updateProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios
 *     description: Obtiene lista paginada de usuarios (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticated, userLimiter, queryValidation, userController.getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario
 *     description: Crea nuevo usuario en el sistema (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticated, userLimiter, createUserValidation, userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario
 *     description: Actualiza información de usuario específico (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 */
router.put('/:id', authenticated, userLimiter, userIdValidation, updateUserValidation, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     description: Elimina usuario del sistema (soft delete, requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 */
router.delete('/:id', authenticated, userLimiter, userIdValidation, userController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/audit:
 *   get:
 *     tags: [Users]
 *     summary: Obtener auditoría de usuario
 *     description: Obtiene el historial de auditoría de un usuario específico (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
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
 */
router.get('/:id/audit', authenticated, userLimiter, userIdValidation, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100')
], userController.getUserAudit);

export default router;