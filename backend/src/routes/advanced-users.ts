/**
 * @fileoverview Rutas Avanzadas de Usuarios para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión avanzada de usuarios, roles, permisos y auditoría
 *
 * Archivo: backend/src/routes/advanced-users.ts
 */

import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { AdvancedUserController } from '../controllers/advancedUserController';

const advancedUserController = new AdvancedUserController();
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS, HTTP_STATUS } from '../utils/constants';
import { authenticated } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Extraer información del dispositivo del User-Agent
 */
function extractDeviceInfo(userAgent?: string): any {
  if (!userAgent) return { browser: 'Desconocido', os: 'Desconocido', device: 'Desconocido' };

  // Lógica simplificada para extraer info del dispositivo
  const browser = userAgent.includes('Chrome') ? 'Chrome' :
                  userAgent.includes('Firefox') ? 'Firefox' :
                  userAgent.includes('Safari') ? 'Safari' :
                  userAgent.includes('Edge') ? 'Edge' : 'Otro';

  const os = userAgent.includes('Windows') ? 'Windows' :
             userAgent.includes('Mac') ? 'macOS' :
             userAgent.includes('Linux') ? 'Linux' :
             userAgent.includes('Android') ? 'Android' :
             userAgent.includes('iOS') ? 'iOS' : 'Otro';

  const device = userAgent.includes('Mobile') ? 'Móvil' : 'Desktop';

  return { browser, os, device };
}

const router = Router();

// ====================================================================
// RATE LIMITING PARA USUARIOS AVANZADOS
// ====================================================================

// Rate limiter general para operaciones avanzadas de usuario
const advancedUserLimiter = rateLimit({
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

// Rate limiter específico para analytics
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de analytics. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para acciones masivas
const bulkActionValidation = [
  body('action')
    .isIn(['activate', 'deactivate', 'delete', 'reset_password', 'send_email', 'assign_role', 'remove_role', 'add_badge', 'remove_badge'])
    .withMessage('Acción no válida'),
  body('userIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Debe proporcionar entre 1 y 100 IDs de usuario'),
  body('userIds.*')
    .isInt({ min: 1 })
    .withMessage('Los IDs de usuario deben ser números enteros positivos'),
  body('roleId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('roleId debe ser un número entero positivo'),
  body('badgeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('badgeId debe ser un número entero positivo'),
  body('emailTemplate')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('emailTemplate debe ser una cadena de 1-100 caracteres'),
  body('emailData')
    .optional()
    .isObject()
    .withMessage('emailData debe ser un objeto')
];

// Validación para ID de usuario
const userIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número entero positivo')
];

// ====================================================================
// RUTAS
// ====================================================================

/**
 * @swagger
 * /api/v1/advanced-users:
 *   get:
 *     tags: [Advanced Users]
 *     summary: Listar usuarios con filtros avanzados
 *     description: Obtiene lista paginada de usuarios con filtros avanzados, búsqueda y ordenamiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, apellido o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: has2FA
 *         schema:
 *           type: boolean
 *         description: Filtrar por usuarios con 2FA
 *       - in: query
 *         name: registrationDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de registro desde
 *       - in: query
 *         name: registrationDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de registro hasta
 *       - in: query
 *         name: lastLoginFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Último login desde
 *       - in: query
 *         name: lastLoginTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Último login hasta
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, lastLoginAt, firstName, email]
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Usuarios obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticated, advancedUserLimiter, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('search').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Búsqueda debe ser una cadena de 1-255 caracteres'),
  query('role').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Rol debe ser una cadena de 1-50 caracteres'),
  query('isActive').optional().isBoolean().withMessage('isActive debe ser un booleano'),
  query('has2FA').optional().isBoolean().withMessage('has2FA debe ser un booleano'),
  query('registrationDateFrom').optional().isISO8601().withMessage('Fecha de registro desde debe ser una fecha ISO válida'),
  query('registrationDateTo').optional().isISO8601().withMessage('Fecha de registro hasta debe ser una fecha ISO válida'),
  query('lastLoginFrom').optional().isISO8601().withMessage('Último login desde debe ser una fecha ISO válida'),
  query('lastLoginTo').optional().isISO8601().withMessage('Último login hasta debe ser una fecha ISO válida'),
  query('sortBy').optional().isIn(['createdAt', 'lastLoginAt', 'firstName', 'email']).withMessage('Campo de ordenamiento no válido'),
  query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('Orden de clasificación no válido')
], advancedUserController.getAdvancedUsers);

/**
 * @swagger
 * /api/v1/advanced-users/{id}/profile:
 *   get:
 *     tags: [Advanced Users]
 *     summary: Obtener perfil avanzado de usuario
 *     description: Obtiene información completa y detallada de un usuario específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Perfil avanzado obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/profile', authenticated, advancedUserLimiter, userIdValidation, advancedUserController.getAdvancedUserProfile);

/**
 * @swagger
 * /api/v1/advanced-users/bulk-actions:
 *   post:
 *     tags: [Advanced Users]
 *     summary: Acciones masivas sobre usuarios
 *     description: Ejecuta acciones masivas sobre múltiples usuarios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - userIds
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate, delete, reset_password, send_email, assign_role, remove_role, add_badge, remove_badge]
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               roleId:
 *                 type: integer
 *                 description: ID del rol (para assign_role/remove_role)
 *               badgeId:
 *                 type: integer
 *                 description: ID del badge (para add_badge/remove_badge)
 *               emailTemplate:
 *                 type: string
 *                 description: Plantilla de email (para send_email)
 *               emailData:
 *                 type: object
 *                 description: Datos adicionales para el email
 *     responses:
 *       200:
 *         description: Acción masiva ejecutada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/bulk-actions', authenticated, advancedUserLimiter, bulkActionValidation, advancedUserController.bulkUserActions);

/**
 * @swagger
 * /api/v1/advanced-users/analytics:
 *   get:
 *     tags: [Advanced Users]
 *     summary: Analytics avanzados de usuarios
 *     description: Obtiene métricas y estadísticas avanzadas de usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *           default: 30d
 *         description: Período para las estadísticas
 *     responses:
 *       200:
 *         description: Analytics obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/analytics', authenticated, analyticsLimiter, [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']).withMessage('Período no válido')
], advancedUserController.getAdvancedUserAnalytics);

/**
 * @swagger
 * /api/v1/advanced-users/{id}/gamification:
 *   get:
 *     tags: [Advanced Users]
 *     summary: Información de gamificación de usuario
 *     description: Obtiene detalles completos de gamificación para un usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Información de gamificación obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/gamification', authenticated, advancedUserLimiter, userIdValidation, advancedUserController.getUserGamification);

/**
 * @swagger
 * /api/v1/advanced-users/{id}/security-log:
 *   get:
 *     tags: [Advanced Users]
 *     summary: Log de seguridad de usuario
 *     description: Obtiene el historial de eventos de seguridad de un usuario
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
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [login, logout, password_change, failed_login, account_locked, account_unlocked, suspicious_activity]
 *         description: Tipo de evento a filtrar
 *     responses:
 *       200:
 *         description: Log de seguridad obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/security-log', authenticated, advancedUserLimiter, userIdValidation, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('eventType').optional().isIn(['login', 'logout', 'password_change', 'failed_login', 'account_locked', 'account_unlocked', 'suspicious_activity']).withMessage('Tipo de evento no válido')
], advancedUserController.getUserSecurityLog);

/**
 * @swagger
 * /api/v1/advanced-users/roles:
 *   post:
 *     tags: [Advanced Users]
 *     summary: Crear un nuevo rol
 *     description: Crea un nuevo rol en el sistema con sus permisos asociados
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
 *                 description: Nombre único del rol
 *                 example: "event_manager"
 *               displayName:
 *                 type: string
 *                 description: Nombre para mostrar del rol
 *                 example: "Gestor de Eventos"
 *               description:
 *                 type: string
 *                 description: Descripción del rol
 *                 example: "Usuario con permisos para gestionar eventos"
 *               isActive:
 *                 type: boolean
 *                 description: Estado del rol
 *                 default: true
 *                 example: true
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los permisos a asignar al rol
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       409:
 *         description: Rol ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/roles', authenticated, advancedUserLimiter, [
  body('name')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z_]+$/)
    .withMessage('Nombre del rol debe ser una cadena de 2-50 caracteres en minúsculas con guiones bajos'),
  body('displayName')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre para mostrar debe ser una cadena de 2-100 caracteres'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Descripción debe ser una cadena de máximo 500 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser un booleano'),
  body('permissionIds')
    .optional()
    .isArray()
    .withMessage('permissionIds debe ser un array'),
  body('permissionIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cada ID de permiso debe ser un número entero positivo')
], advancedUserController.createRole);

/**
 * @swagger
 * /api/v1/advanced-users/groups:
 *   get:
 *     tags: [Advanced Users]
 *     summary: Listar grupos de usuarios
 *     description: Obtiene lista de grupos de usuarios para gestión avanzada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre de grupo
 *     responses:
 *       200:
 *         description: Grupos obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/groups', authenticated, advancedUserLimiter, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('search').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Búsqueda debe ser una cadena de 1-255 caracteres')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    // Verificar permisos
    const userRoles = req.user?.roles || [];
    const isSuperAdmin = userRoles.includes('super_admin');
    const isAdmin = userRoles.includes('admin');

    if (!isSuperAdmin && !isAdmin) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Permisos insuficientes para ver grupos de usuarios',
        error: 'INSUFFICIENT_PERMISSIONS',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Mock data para grupos de usuarios - será reemplazado con lógica real
    const mockGroups = [
      {
        id: 1,
        name: 'Administradores',
        description: 'Grupo de administradores del sistema',
        userCount: 5,
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 2,
        name: 'Usuarios Premium',
        description: 'Usuarios con acceso premium',
        userCount: 25,
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: 3,
        name: 'Participantes Activos',
        description: 'Participantes en eventos activos',
        userCount: 150,
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];

    // Filtrar por búsqueda si se proporciona
    let filteredGroups = mockGroups;
    if (search) {
      filteredGroups = mockGroups.filter(group =>
        group.name.toLowerCase().includes(search.toString().toLowerCase()) ||
        group.description.toLowerCase().includes(search.toString().toLowerCase())
      );
    }

    // Paginación
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedGroups = filteredGroups.slice(offset, offset + parseInt(limit as string));

    const totalPages = Math.ceil(filteredGroups.length / parseInt(limit as string));
    const hasNext = parseInt(page as string) < totalPages;
    const hasPrev = parseInt(page as string) > 1;

    res.json({
      success: true,
      message: 'Grupos de usuarios obtenidos exitosamente',
      data: {
        groups: paginatedGroups,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: filteredGroups.length,
          totalPages,
          hasNext,
          hasPrev
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo grupos de usuarios:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al obtener grupos',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/v1/advanced-users/sessions:
 *   get:
 *     tags: [Advanced Users]
 *     summary: Listar sesiones activas de usuarios
 *     description: Obtiene lista de sesiones activas de usuarios para gestión avanzada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar por sesiones activas
 *     responses:
 *       200:
 *         description: Sesiones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/sessions', authenticated, advancedUserLimiter, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
  query('userId').optional().isInt({ min: 1 }).withMessage('userId debe ser un número entero positivo'),
  query('isActive').optional().isBoolean().withMessage('isActive debe ser un booleano')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, userId, isActive = true } = req.query;

    // Verificar permisos
    const userRoles = req.user?.roles || [];
    const isSuperAdmin = userRoles.includes('super_admin');
    const isAdmin = userRoles.includes('admin');

    if (!isSuperAdmin && !isAdmin) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Permisos insuficientes para ver sesiones de usuarios',
        error: 'INSUFFICIENT_PERMISSIONS',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Importar modelos dinámicamente para evitar dependencias circulares
    const { Session, User } = await import('../models');

    // Construir consulta base
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Obtener sesiones con paginación
    const { rows: sessions, count: total } = await Session.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      attributes: [
        'id', 'userId', 'sessionId', 'ipAddress', 'userAgent',
        'deviceType', 'deviceOS', 'deviceBrowser',
        'isActive', 'lastActivity', 'createdAt', 'expiresAt'
      ],
      order: [['lastActivity', 'DESC']],
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string)
    });

    // Transformar sesiones con información adicional
    const transformedSessions = sessions.map(session => {
      const sessionData = session.toJSON() as any;
      return {
        id: sessionData.id,
        userId: sessionData.userId,
        userEmail: sessionData.user?.email || 'N/A',
        userName: sessionData.user ?
          `${sessionData.user.firstName} ${sessionData.user.lastName}`.trim() :
          'Usuario desconocido',
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        deviceInfo: {
          browser: sessionData.deviceBrowser || 'Desconocido',
          os: sessionData.deviceOS || 'Desconocido',
          device: sessionData.deviceType || 'Desconocido'
        },
        location: `${sessionData.locationCity || 'Desconocida'}, ${sessionData.locationCountry || 'Desconocido'}`,
        isActive: sessionData.isActive,
        lastActivity: sessionData.lastActivity,
        createdAt: sessionData.createdAt,
        expiresAt: sessionData.expiresAt,
        timeRemaining: Math.max(0, new Date(sessionData.expiresAt).getTime() - Date.now())
      };
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(total / parseInt(limit as string));
    const hasNext = parseInt(page as string) < totalPages;
    const hasPrev = parseInt(page as string) > 1;

    // Calcular estadísticas
    const activeSessions = transformedSessions.filter(s => s.isActive).length;
    const expiredSessions = transformedSessions.filter(s => !s.isActive).length;

    res.json({
      success: true,
      message: 'Sesiones de usuarios obtenidas exitosamente',
      data: {
        sessions: transformedSessions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages,
          hasNext,
          hasPrev
        },
        summary: {
          totalSessions: total,
          activeSessions,
          expiredSessions
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo sesiones de usuarios:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al obtener sesiones',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;