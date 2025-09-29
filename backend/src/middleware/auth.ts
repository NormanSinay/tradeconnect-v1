/**
 * @fileoverview Middleware de Autenticación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Middleware para autenticación JWT y control de acceso basado en roles
 *
 * Archivo: backend/src/middleware/auth.ts
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthUser } from '../types/auth.types';
import { HTTP_STATUS, PERMISSIONS, UserRole, Permission as PermissionType } from '../utils/constants';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { Session } from '../models/Session';
import { securityService } from '../services/securityService';
import { config } from '../config/environment';

/**
 * Extiende la interface Request para incluir información de autenticación
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
      token?: any;
    }
  }
}

// ====================================================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ====================================================================

/**
 * Middleware para autenticar requests usando JWT
 * Verifica el token y establece la información del usuario en req.user
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Verificar si el token está en lista negra
    const isBlacklisted = await securityService.isTokenBlacklisted(decoded.sessionId);
    if (isBlacklisted) {
      await securityService.logSecurityEvent('blacklisted_token_used', {
        resource: 'auth',
        resourceId: decoded.sessionId,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        severity: 'high'
      });

      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token inválido o expirado',
        error: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verificar sesión activa
    const session = await Session.findBySessionId(decoded.sessionId);
    if (!session || !session.isValid) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Sesión expirada o inválida',
        error: 'SESSION_EXPIRED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verificar usuario activo
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user || !user.isActive) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no encontrado o inactivo',
        error: 'USER_INACTIVE',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Construir objeto AuthUser
    const roles = user.roles?.map(role => role.name) || [];
    const permissionSet = new Set<string>();

    user.roles?.forEach(role => {
      role.permissions?.forEach(permission => {
        permissionSet.add(permission.name);
      });
    });

    const permissions = Array.from(permissionSet) as PermissionType[];

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      roles,
      permissions,
      isEmailVerified: user.isEmailVerified,
      is2faEnabled: user.is2faEnabled,
      isActive: user.isActive,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };

    // Establecer información en el request
    req.user = authUser;
    req.sessionId = decoded.sessionId;
    req.token = decoded;

    // Actualizar actividad de la sesión
    await session.updateActivity();

    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.error('Error en middleware de autenticación:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// ====================================================================
// MIDDLEWARE DE AUTORIZACIÓN BASADA EN ROLES
// ====================================================================

/**
 * Middleware para verificar que el usuario tenga al menos uno de los roles especificados
 */
export const requireRole = (...requiredRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userRoles = req.user.roles;
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Permisos insuficientes - rol requerido',
        error: 'INSUFFICIENT_ROLE',
        requiredRoles,
        userRoles,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario tenga al menos uno de los permisos especificados
 */
export const requirePermission = (...requiredPermissions: PermissionType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userPermissions = req.user.permissions;
    const hasRequiredPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Permisos insuficientes - permiso requerido',
        error: 'INSUFFICIENT_PERMISSION',
        requiredPermissions,
        userPermissions,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea propietario del recurso o tenga permisos administrativos
 */
export const requireOwnershipOrAdmin = (resourceUserIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const userId = req.user.id;
    const resourceUserId = req.params[resourceUserIdParam];

    // Si es el propietario del recurso, permitir
    if (resourceUserId && userId.toString() === resourceUserId.toString()) {
      next();
      return;
    }

    // Si tiene permisos administrativos, permitir
    const userRoles = req.user.roles;
    const isAdmin = userRoles.some(role =>
      ['super_admin', 'admin', 'manager'].includes(role)
    );

    if (isAdmin) {
      next();
      return;
    }

    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso',
      error: 'ACCESS_DENIED',
      timestamp: new Date().toISOString()
    });
  };
};

// ====================================================================
// MIDDLEWARE DE VERIFICACIÓN DE EMAIL
// ====================================================================

/**
 * Middleware para verificar que el usuario haya verificado su email
 */
export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Usuario no autenticado',
      error: 'UNAUTHENTICATED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!req.user.isEmailVerified) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Email no verificado. Verifique su email antes de continuar.',
      error: 'EMAIL_NOT_VERIFIED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

// ====================================================================
// MIDDLEWARE DE VERIFICACIÓN DE 2FA
// ====================================================================

/**
 * Middleware para verificar que el usuario tenga 2FA habilitado (para rutas sensibles)
 */
export const require2FA = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Usuario no autenticado',
      error: 'UNAUTHENTICATED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!req.user.is2faEnabled) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Se requiere autenticación de dos factores para esta acción',
      error: 'TWO_FA_REQUIRED',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};

// ====================================================================
// MIDDLEWARE DE LOGGING DE ACCESO
// ====================================================================

/**
 * Middleware para registrar accesos a rutas protegidas
 */
export const logAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.user?.id;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const method = req.method;
  const path = req.path;

  // Log de acceso básico
  logger.info(`Access: ${method} ${path}`, {
    userId,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString()
  });

  // Log de seguridad para acciones sensibles
  if (['POST', 'PUT', 'DELETE'].includes(method) && userId) {
    securityService.logSecurityEvent('api_access', {
      userId,
      resource: 'api',
      resourceId: `${method}:${path}`,
      ipAddress,
      userAgent,
      metadata: {
        method,
        path,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined
      },
      severity: 'low'
    }).catch(error => {
      logger.error('Error logging access:', error);
    });
  }

  next();
};

// ====================================================================
// MIDDLEWARE DE CONTROL DE SESIÓN
// ====================================================================

/**
 * Middleware para verificar que la sesión no haya expirado por inactividad
 */
export const checkSessionActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.sessionId) {
    next();
    return;
  }

  try {
    const session = await Session.findBySessionId(req.sessionId);
    if (session) {
      const now = new Date();
      const lastActivity = session.lastActivity;
      const maxInactiveTime = 30 * 60 * 1000; // 30 minutos

      if (now.getTime() - lastActivity.getTime() > maxInactiveTime) {
        // Sesión expirada por inactividad
        await session.terminate();

        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Sesión expirada por inactividad',
          error: 'SESSION_INACTIVE',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }
  } catch (error) {
    logger.error('Error verificando actividad de sesión:', error);
  }

  next();
};

// ====================================================================
// MIDDLEWARE COMPUESTO PARA RUTAS PROTEGIDAS
// ====================================================================

/**
 * Middleware compuesto que incluye autenticación y logging
 */
export const authenticated = [
  authenticateToken,
  checkSessionActivity,
  logAccess
];

/**
 * Middleware para rutas administrativas
 */
export const adminOnly = [
  ...authenticated,
  requireRole('super_admin', 'admin')
];

/**
 * Middleware para rutas de gestión de usuarios
 */
export const userManagement = [
  ...authenticated,
  requirePermission('read_user', 'create_user', 'update_user', 'delete_user')
];

/**
 * Middleware para rutas sensibles (requiere 2FA)
 */
export const sensitiveOperation = [
  ...authenticated,
  requireEmailVerification,
  require2FA
];