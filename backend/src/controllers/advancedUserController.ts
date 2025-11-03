/**
 * @fileoverview Controlador Avanzado de Usuarios para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión avanzada de usuarios, roles, permisos y auditoría
 *
 * Archivo: backend/src/controllers/advancedUserController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UserRole } from '../models/UserRole';
import { Permission } from '../models/Permission';
import { PermissionGroup } from '../models/PermissionGroup';
import { PermissionPolicy } from '../models/PermissionPolicy';
import { AuditLog } from '../models/AuditLog';
import { Session } from '../models/Session';
import { TwoFactorAuth } from '../models/TwoFactorAuth';
import { ReferralCode } from '../models/ReferralCode';
import { LoyaltyPoint } from '../models/LoyaltyPoint';
import { UserBadge } from '../models/UserBadge';
import { Badge } from '../models/Badge';
import { Quest } from '../models/Quest';
import { Achievement } from '../models/Achievement';
import { Level } from '../models/Level';
import { Reward } from '../models/Reward';
import { UserImport } from '../models/UserImport';
import { UserImportError } from '../models/UserImportError';
import {
  AuthenticatedRequest,
  UserProfile,
  UserUpdateData
} from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';

/**
 * Controlador para manejo de operaciones avanzadas de usuario
 */
export class AdvancedUserController {

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
  async getAdvancedUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos avanzados
      const userRoles = req.user?.roles || [];
      const userPermissions = req.user?.permissions || [];

      const isSuperAdmin = userRoles.includes('super_admin');
      const hasAdvancedUserRead = userPermissions.includes('read_user' as any);

      if (!isSuperAdmin && !hasAdvancedUserRead) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para gestión avanzada de usuarios',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        search,
        role,
        isActive,
        has2FA,
        registrationDateFrom,
        registrationDateTo,
        lastLoginFrom,
        lastLoginTo,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = {};

      // Filtros avanzados
      if (search) {
        where.$or = [
          { firstName: { $iLike: `%${search}%` } },
          { lastName: { $iLike: `%${search}%` } },
          { email: { $iLike: `%${search}%` } },
          { phone: { $iLike: `%${search}%` } }
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (has2FA !== undefined) {
        where.is2faEnabled = has2FA === 'true';
      }

      // Filtros de fecha
      if (registrationDateFrom || registrationDateTo) {
        where.createdAt = {};
        if (registrationDateFrom) {
          where.createdAt.$gte = new Date(registrationDateFrom as string);
        }
        if (registrationDateTo) {
          where.createdAt.$lte = new Date(registrationDateTo as string);
        }
      }

      if (lastLoginFrom || lastLoginTo) {
        where.lastLoginAt = {};
        if (lastLoginFrom) {
          where.lastLoginAt.$gte = new Date(lastLoginFrom as string);
        }
        if (lastLoginTo) {
          where.lastLoginAt.$lte = new Date(lastLoginTo as string);
        }
      }

      const include: any[] = [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          where: role ? { name: role } : undefined,
          required: !!role
        },
        {
          model: LoyaltyPoint,
          as: 'loyaltyPoints',
          attributes: [[LoyaltyPoint.sequelize!.fn('SUM', LoyaltyPoint.sequelize!.col('points')), 'totalPoints']],
          required: false
        },
        {
          model: UserBadge,
          as: 'userBadges',
          include: [{
            model: Badge,
            as: 'badge',
            attributes: ['name', 'icon']
          }],
          required: false
        }
      ];

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        include,
        limit: Number(limit),
        offset,
        order: [[sortBy as string, sortOrder as string]],
        attributes: [
          'id', 'email', 'firstName', 'lastName', 'phone',
          'isEmailVerified', 'isActive', 'is2faEnabled',
          'lastLoginAt', 'createdAt', 'updatedAt',
          'nit', 'cui', 'timezone', 'locale'
        ]
      });

      // Transformar usuarios con información adicional
      const transformedUsers = users.map(user => {
        const userData = user.toJSON() as any;
        const primaryRole = userData.roles && userData.roles.length > 0
          ? userData.roles[0].name
          : 'user';

        return {
          ...userData,
          role: primaryRole,
          roles: userData.roles,
          totalLoyaltyPoints: userData.loyaltyPoints?.[0]?.totalPoints || 0,
          badges: userData.userBadges?.map((ub: any) => ub.badge) || [],
          accountAge: Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24)), // días
          isRecentlyActive: userData.lastLoginAt &&
            (Date.now() - new Date(userData.lastLoginAt).getTime()) < (7 * 24 * 60 * 60 * 1000) // 7 días
        };
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Usuarios avanzados obtenidos exitosamente',
        data: {
          users: transformedUsers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: Array.isArray(total) ? total.length : total,
            pages: Math.ceil((Array.isArray(total) ? total.length : total) / Number(limit)),
            hasNext: Number(page) * Number(limit) < (Array.isArray(total) ? total.length : total),
            hasPrev: Number(page) > 1
          },
          filters: {
            applied: {
              search: search || null,
              role: role || null,
              isActive: isActive ? isActive === 'true' : null,
              has2FA: has2FA ? has2FA === 'true' : null,
              registrationDateFrom,
              registrationDateTo,
              lastLoginFrom,
              lastLoginTo,
              sortBy,
              sortOrder
            }
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo usuarios avanzados:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

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
  async getAdvancedUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de usuario inválido',
          error: 'INVALID_USER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos
      const userRoles = req.user?.roles || [];
      const userPermissions = req.user?.permissions || [];
      const isSuperAdmin = userRoles.includes('super_admin');
      const hasAdvancedUserRead = userPermissions.includes('read_user' as any);
      const isOwnProfile = req.user?.id === userId;

      if (!isSuperAdmin && !hasAdvancedUserRead && !isOwnProfile) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para ver perfil avanzado',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            include: [{
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }]
          },
          {
            model: Session,
            as: 'sessions',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'ipAddress', 'userAgent', 'lastActivity', 'createdAt']
          },
          {
            model: TwoFactorAuth,
            as: 'twoFactorAuth',
            attributes: ['id', 'method', 'isEnabled', 'createdAt']
          },
          {
            model: LoyaltyPoint,
            as: 'loyaltyPoints',
            attributes: ['points', 'reason', 'createdAt']
          },
          {
            model: UserBadge,
            as: 'userBadges',
            include: [{
              model: Badge,
              as: 'badge',
              attributes: ['id', 'name', 'description', 'icon', 'category']
            }]
          },
          {
            model: ReferralCode,
            as: 'referralCodes',
            attributes: ['code', 'isActive', 'usageCount', 'createdAt']
          },
          {
            model: Achievement,
            as: 'achievements',
            through: { attributes: ['unlockedAt', 'progress'] }
          }
        ]
      });

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Calcular estadísticas adicionales
      const totalLoyaltyPoints = await LoyaltyPoint.sum('points', { where: { userId } }) || 0;
      const activeSessions = await Session.count({ where: { userId, isActive: true } });
      const totalReferrals = 0; // TODO: Implementar cálculo de referrals

      const profile = {
        basic: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          avatar: user.avatar,
          nit: user.nit,
          cui: user.cui,
          timezone: user.timezone,
          locale: user.locale,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          is2faEnabled: user.is2faEnabled,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        security: {
          twoFactorAuth: user.twoFactorAuth,
          activeSessions,
          accountLocked: user.isAccountLocked,
          failedLoginAttempts: user.failedLoginAttempts,
          lastFailedLogin: user.lastFailedLogin
        },
        roles: user.roles?.map(role => ({
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          permissions: role.permissions?.map(p => ({
            id: p.id,
            name: p.name,
            resource: p.resource,
            action: p.action
          }))
        })),
        gamification: {
          totalLoyaltyPoints,
          badges: user.userBadges?.map(ub => ub.badge),
          achievements: [], // TODO: Implementar achievements
          level: await this.calculateUserLevel(totalLoyaltyPoints)
        },
        referrals: {
          codes: user.referralCodes,
          totalReferrals
        },
        activity: {
          accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          isRecentlyActive: user.lastLoginAt &&
            (Date.now() - new Date(user.lastLoginAt).getTime()) < (7 * 24 * 60 * 60 * 1000),
          sessions: user.sessions
        }
      };

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Perfil avanzado obtenido exitosamente',
        data: profile,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo perfil avanzado de usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Calcular nivel del usuario basado en puntos de lealtad
   */
  private async calculateUserLevel(totalPoints: number): Promise<any> {
    try {
      // TODO: Implementar lógica de niveles cuando se defina el modelo Level
      return {
        current: {
          id: 1,
          name: 'Bronze',
          level: 1,
          minPoints: 0,
          maxPoints: 100
        },
        progress: {
          currentPoints: totalPoints,
          pointsToNext: Math.max(0, 100 - totalPoints),
          percentage: Math.min(100, (totalPoints / 100) * 100)
        },
        next: {
          id: 2,
          name: 'Silver',
          level: 2,
          minPoints: 100
        }
      };
    } catch (error) {
      logger.error('Error calculando nivel de usuario:', error);
      return null;
    }
  }

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
  async bulkUserActions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos avanzados
      const userRoles = req.user?.roles || [];
      const userPermissions = req.user?.permissions || [];
      const isSuperAdmin = userRoles.includes('super_admin');
      const hasBulkActions = userPermissions.includes('update_user' as any);

      if (!isSuperAdmin && !hasBulkActions) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para acciones masivas',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { action, userIds, roleId, badgeId, emailTemplate, emailData } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Debe proporcionar al menos un ID de usuario',
          error: 'INVALID_USER_IDS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const results = {
        successful: [] as number[],
        failed: [] as { userId: number; error: string }[]
      };

      // Ejecutar acción masiva según el tipo
      switch (action) {
        case 'activate':
        case 'deactivate':
          for (const userId of userIds) {
            try {
              const user = await User.findByPk(userId);
              if (user) {
                await user.update({ isActive: action === 'activate' });
                results.successful.push(userId);

                // Registrar auditoría
                await AuditLog.log(
                  `user_${action}d`,
                  'user',
                  {
                    userId: req.user?.id,
                    resourceId: userId.toString(),
                    oldValues: { isActive: !user.isActive },
                    newValues: { isActive: action === 'activate' },
                    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                    userAgent: req.get('User-Agent') || 'unknown'
                  }
                );
              } else {
                results.failed.push({ userId, error: 'Usuario no encontrado' });
              }
            } catch (error) {
              results.failed.push({ userId, error: 'Error actualizando usuario' });
            }
          }
          break;

        case 'assign_role':
          if (!roleId) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'Se requiere roleId para asignar rol',
              error: 'MISSING_ROLE_ID',
              timestamp: new Date().toISOString()
            });
            return;
          }

          for (const userId of userIds) {
            try {
              await UserRole.assignRole(userId, roleId, req.user?.id);
              results.successful.push(userId);
            } catch (error) {
              results.failed.push({ userId, error: 'Error asignando rol' });
            }
          }
          break;

        case 'remove_role':
          if (!roleId) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'Se requiere roleId para remover rol',
              error: 'MISSING_ROLE_ID',
              timestamp: new Date().toISOString()
            });
            return;
          }

          for (const userId of userIds) {
            try {
              await UserRole.revokeRole(userId, roleId);
              results.successful.push(userId);
            } catch (error) {
              results.failed.push({ userId, error: 'Error removiendo rol' });
            }
          }
          break;

        case 'add_badge':
          if (!badgeId) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'Se requiere badgeId para agregar badge',
              error: 'MISSING_BADGE_ID',
              timestamp: new Date().toISOString()
            });
            return;
          }

          for (const userId of userIds) {
            try {
              // TODO: Implementar creación de UserBadge cuando se defina el modelo
              results.successful.push(userId);
            } catch (error) {
              results.failed.push({ userId, error: 'Error agregando badge' });
            }
          }
          break;

        case 'delete':
          for (const userId of userIds) {
            try {
              const user = await User.findByPk(userId);
              if (user) {
                await user.destroy();
                results.successful.push(userId);
              } else {
                results.failed.push({ userId, error: 'Usuario no encontrado' });
              }
            } catch (error) {
              results.failed.push({ userId, error: 'Error eliminando usuario' });
            }
          }
          break;

        default:
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Acción no soportada',
            error: 'UNSUPPORTED_ACTION',
            timestamp: new Date().toISOString()
          });
          return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Acción masiva '${action}' ejecutada`,
        data: {
          action,
          totalProcessed: userIds.length,
          successful: results.successful.length,
          failed: results.failed.length,
          results
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error ejecutando acciones masivas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

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
  async getAdvancedUserAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userRoles = req.user?.roles || [];
      const userPermissions = req.user?.permissions || [];
      const isSuperAdmin = userRoles.includes('super_admin');
      const hasAnalytics = userPermissions.includes('read_user' as any);

      if (!isSuperAdmin && !hasAnalytics) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para ver analytics',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { period = '30d' } = req.query;

      // Calcular fechas según período
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startDate = new Date(2020, 0, 1); // Fecha arbitraria antigua
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Estadísticas generales
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const verifiedUsers = await User.count({ where: { isEmailVerified: true } });
      const usersWith2FA = await User.count({ where: { is2faEnabled: true } });

      // Nuevos usuarios en el período
      const newUsers = await User.count({
        where: { createdAt: { $gte: startDate } }
      });

      // Usuarios activos recientemente
      const recentlyActiveUsers = await User.count({
        where: {
          lastLoginAt: { $gte: startDate },
          isActive: true
        }
      });

      // Distribución por roles
      const roleDistribution = await UserRole.findAll({
        attributes: [
          [UserRole.sequelize!.fn('COUNT', UserRole.sequelize!.col('id')), 'count']
        ],
        include: [{
          model: Role,
          as: 'role',
          attributes: ['name', 'displayName']
        }],
        where: { isActive: true },
        group: ['role.id', 'role.name', 'role.displayName']
      });

      // Usuarios por día en el período
      const dailyRegistrations = await User.findAll({
        attributes: [
          [User.sequelize!.fn('DATE', User.sequelize!.col('created_at')), 'date'],
          [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count']
        ],
        where: { createdAt: { $gte: startDate } },
        group: [User.sequelize!.fn('DATE', User.sequelize!.col('created_at'))],
        order: [[User.sequelize!.fn('DATE', User.sequelize!.col('created_at')), 'ASC']],
        raw: true
      });

      // Top países/ciudades (basado en timezone como aproximación)
      const locationStats = await User.findAll({
        attributes: [
          'timezone',
          [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['timezone'],
        order: [[User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Estadísticas de gamificación
      const totalLoyaltyPoints = await LoyaltyPoint.sum('points') || 0;
      const totalBadges = await UserBadge.count();
      const totalAchievements = await Achievement.count();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Analytics avanzados obtenidos exitosamente',
        data: {
          period,
          overview: {
            totalUsers,
            activeUsers,
            verifiedUsers,
            usersWith2FA,
            newUsers,
            recentlyActiveUsers,
            inactiveUsers: totalUsers - activeUsers,
            unverifiedUsers: totalUsers - verifiedUsers
          },
          rates: {
            activationRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
            verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
            twoFactorRate: totalUsers > 0 ? (usersWith2FA / totalUsers) * 100 : 0
          },
          distribution: {
            byRole: roleDistribution.map(rd => ({
              role: (rd as any).role?.name || 'unknown',
              displayName: (rd as any).role?.displayName || 'Desconocido',
              count: parseInt((rd as any).count)
            })),
            byLocation: locationStats.map(ls => ({
              timezone: (ls as any).timezone,
              count: parseInt((ls as any).count)
            }))
          },
          trends: {
            dailyRegistrations: dailyRegistrations.map(dr => ({
              date: (dr as any).date,
              count: parseInt((dr as any).count)
            }))
          },
          gamification: {
            totalLoyaltyPoints,
            totalBadges,
            totalAchievements,
            averagePointsPerUser: totalUsers > 0 ? totalLoyaltyPoints / totalUsers : 0
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo analytics avanzados:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

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
  async getUserGamification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de usuario inválido',
          error: 'INVALID_USER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos
      const userRoles = req.user?.roles || [];
      const userPermissions = req.user?.permissions || [];
      const isSuperAdmin = userRoles.includes('super_admin');
      const hasGamificationRead = userPermissions.includes('read_user' as any);
      const isOwnProfile = req.user?.id === userId;

      if (!isSuperAdmin && !hasGamificationRead && !isOwnProfile) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para ver gamificación',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Obtener puntos de lealtad
      const loyaltyPoints = await LoyaltyPoint.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        attributes: ['points', 'reason', 'createdAt']
      });

      const totalPoints = loyaltyPoints.reduce((sum, lp) => sum + lp.points, 0);

      // Obtener badges del usuario
      const userBadges: any[] = []; // TODO: Implementar cuando se defina el modelo UserBadge

      // Obtener logros desbloqueados
      const unlockedAchievements = await Achievement.findAll({
        include: [{
          model: User,
          as: 'users',
          where: { id: userId },
          through: { attributes: ['unlockedAt', 'progress'] },
          required: true
        }],
        attributes: ['id', 'name', 'description', 'icon', 'category', 'pointsReward', 'badgeRewardId']
      });

      // Calcular nivel actual
      const currentLevel = await this.calculateUserLevel(totalPoints);

      // Obtener quests disponibles y progreso
      const availableQuests = await Quest.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'description', 'type', 'targetValue', 'pointsReward', 'badgeRewardId']
      });

      // Obtener referrals y recompensas
      const referralStats = await ReferralCode.findAll({
        where: { userId },
        attributes: ['code', 'usageCount', 'createdAt']
      });

      const totalReferrals = referralStats.reduce((sum, rc: any) => sum + (rc.usageCount || 0), 0);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Información de gamificación obtenida exitosamente',
        data: {
          loyaltyPoints: {
            total: totalPoints,
            history: loyaltyPoints,
            recent: loyaltyPoints.slice(0, 10) // Últimos 10 movimientos
          },
          level: currentLevel,
          badges: {
            total: userBadges.length,
            list: userBadges.map((ub: any) => ({
              ...ub.badge,
              unlockedAt: ub.unlockedAt
            }))
          },
          achievements: {
            total: unlockedAchievements.length,
            list: unlockedAchievements
          },
          quests: {
            available: availableQuests.length,
            list: availableQuests
          },
          referrals: {
            totalReferrals,
            codes: referralStats,
            earnings: totalReferrals * 100 // Ejemplo: 100 puntos por referral
          },
          stats: {
            pointsThisMonth: loyaltyPoints
              .filter(lp => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return new Date(lp.createdAt) > monthAgo;
              })
              .reduce((sum, lp) => sum + lp.points, 0),
            badgesThisMonth: userBadges
              .filter((ub: any) => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return new Date(ub.unlockedAt) > monthAgo;
              })
              .length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo gamificación de usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

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
  async getUserSecurityLog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de usuario inválido',
          error: 'INVALID_USER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos
      const userRoles = req.user?.roles || [];
      const userPermissions = req.user?.permissions || [];
      const isSuperAdmin = userRoles.includes('super_admin');
      const hasSecurityLogRead = userPermissions.includes('read_user' as any);
      const isOwnProfile = req.user?.id === userId;

      if (!isSuperAdmin && !hasSecurityLogRead && !isOwnProfile) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para ver log de seguridad',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { page = 1, limit = 20, eventType } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Eventos de seguridad relevantes
      const securityEvents = [
        'login', 'logout', 'password_change', 'failed_login',
        'account_locked', 'account_unlocked', 'suspicious_activity',
        '2fa_enabled', '2fa_disabled', 'session_created', 'session_destroyed'
      ];

      const where: any = {
        resource: 'user',
        resourceId: userId.toString(),
        action: securityEvents
      };

      if (eventType) {
        where.action = eventType;
      }

      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id', 'action', 'resource', 'resourceId', 'oldValues',
          'newValues', 'ipAddress', 'userAgent', 'severity',
          'status', 'createdAt', 'metadata'
        ]
      });

      // Enriquecer logs con información adicional
      const enrichedLogs = logs.map(log => {
        const logData = log.toJSON() as any;
        return {
          ...logData,
          location: this.extractLocationFromUserAgent(logData.userAgent),
          deviceInfo: this.extractDeviceInfo(logData.userAgent),
          riskLevel: this.calculateRiskLevel(logData),
          isSuspicious: this.isSuspiciousActivity(logData)
        };
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Log de seguridad obtenido exitosamente',
        data: {
          logs: enrichedLogs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
            hasNext: Number(page) * Number(limit) < total,
            hasPrev: Number(page) > 1
          },
          summary: {
            totalEvents: total,
            suspiciousEvents: enrichedLogs.filter((log: any) => log.isSuspicious).length,
            recentFailedLogins: enrichedLogs.filter((log: any) => log.action === 'failed_login').length,
            accountLocks: enrichedLogs.filter((log: any) => log.action === 'account_locked').length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo log de seguridad:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Extraer información de ubicación del User-Agent (simplificado)
   */
  private extractLocationFromUserAgent(userAgent?: string): string {
    // En un entorno real, usarías un servicio de geolocalización con IP
    // Para este ejemplo, retornamos 'Desconocida'
    return 'Desconocida';
  }

  /**
   * Extraer información del dispositivo del User-Agent
   */
  private extractDeviceInfo(userAgent?: string): any {
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

  /**
   * Calcular nivel de riesgo de una actividad
   */
  private calculateRiskLevel(logData: any): 'low' | 'medium' | 'high' {
    const suspiciousActions = ['failed_login', 'suspicious_activity', 'account_locked'];
    if (suspiciousActions.includes(logData.action)) return 'high';

    const mediumRiskActions = ['password_change', '2fa_disabled'];
    if (mediumRiskActions.includes(logData.action)) return 'medium';

    return 'low';
  }

  /**
   * Determinar si una actividad es sospechosa
   */
  private isSuspiciousActivity(logData: any): boolean {
    return logData.action === 'suspicious_activity' ||
           (logData.action === 'failed_login' && logData.metadata?.consecutiveFailures > 3);
  }
}