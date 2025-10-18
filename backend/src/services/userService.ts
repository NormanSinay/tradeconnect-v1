/**
 * @fileoverview Servicio de Usuarios para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de usuarios y perfiles
 *
 * Archivo: backend/src/services/userService.ts
 */

import { User } from '../models/User';
import { Role } from '../models/Role';
import { UserRole } from '../models/UserRole';
import { AuditLog } from '../models/AuditLog';
import { UserProfile, UserUpdateData } from '../types/auth.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { emailService } from './emailService';

/**
 * Servicio para manejo de operaciones de usuario
 */
export class UserService {

  /**
   * Obtiene el perfil completo de un usuario
   */
  async getUserProfile(userId: number): Promise<ApiResponse<UserProfile>> {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            where: { isActive: true },
            required: false
          }
        ]
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const profile: UserProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        nit: user.nit,
        cui: user.cui,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        is2faEnabled: user.is2faEnabled,
        timezone: user.timezone,
        locale: user.locale,
        roles: user.roles?.map(role => role.name) || [],
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return {
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: profile,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo perfil de usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateUserProfile(
    userId: number,
    updateData: Partial<UserUpdateData>,
    clientInfo: { ipAddress: string; userAgent: string }
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar cambios en NIT y CUI
      if (updateData.nit && updateData.nit !== user.nit) {
        const existingNit = await User.isNitTaken(updateData.nit, userId);
        if (existingNit) {
          return {
            success: false,
            message: 'El NIT ya está registrado por otro usuario',
            error: 'NIT_ALREADY_EXISTS',
            timestamp: new Date().toISOString()
          };
        }
      }

      if (updateData.cui && updateData.cui !== user.cui) {
        const existingCui = await User.findOne({
          where: { cui: updateData.cui },
          paranoid: false
        });
        if (existingCui && existingCui.id !== userId) {
          return {
            success: false,
            message: 'El CUI ya está registrado por otro usuario',
            error: 'CUI_ALREADY_EXISTS',
            timestamp: new Date().toISOString()
          };
        }
      }

      const oldValues = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        timezone: user.timezone,
        locale: user.locale
      };

      await user.update(updateData);

      // Registrar en auditoría
      await AuditLog.log(
        'user_profile_updated',
        'user',
        {
          userId,
          resourceId: userId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        }
      );

      // Obtener perfil actualizado
      const result = await this.getUserProfile(userId);
      if (result.success) {
        return {
          success: true,
          message: 'Perfil actualizado exitosamente',
          data: result.data,
          timestamp: new Date().toISOString()
        };
      }

      return result;

    } catch (error) {
      logger.error('Error actualizando perfil de usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene lista paginada de usuarios
   */
  async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    users: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        role,
        isActive
      } = options;

      const offset = (page - 1) * limit;
      const where: any = {};

      // Filtros
      if (search) {
        where.$or = [
          { firstName: { $iLike: `%${search}%` } },
          { lastName: { $iLike: `%${search}%` } },
          { email: { $iLike: `%${search}%` } }
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const include: any[] = [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          where: role ? { name: role } : undefined,
          required: !!role
        }
      ];

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id', 'email', 'firstName', 'lastName', 'phone',
          'isEmailVerified', 'isActive', 'is2faEnabled',
          'lastLoginAt', 'createdAt', 'updatedAt'
        ]
      });

      // Formatear respuesta
      const formattedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        is2faEnabled: user.is2faEnabled,
        roles: user.roles?.map((r: any) => r.name) || [],
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      return {
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: {
          users: formattedUsers,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo lista de usuarios:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role?: string;
    },
    createdBy?: number
  ): Promise<ApiResponse<any>> {
    try {
      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'El email ya está registrado',
          error: 'EMAIL_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Crear usuario
      const newUser = await User.create({
        email: userData.email.toLowerCase(),
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isEmailVerified: true, // Los usuarios creados por admin están verificados
        isActive: true,
        is2faEnabled: false,
        otpAttempts: 0,
        failedLoginAttempts: 0,
        isAccountLocked: false,
        marketingAccepted: false,
        timezone: 'America/Guatemala',
        locale: 'es'
      });

      // Asignar rol
      const roleName = userData.role || 'user';
      const role = await Role.findByName(roleName as any);
      if (role) {
        await UserRole.assignRole(newUser.id, role.id, createdBy);
      }

      // Registrar en auditoría
      await AuditLog.log(
        'user_created',
        'user',
        {
          userId: createdBy,
          resourceId: newUser.id.toString(),
          newValues: {
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: roleName
          },
          ipAddress: 'system', // TODO: Obtener de request
          userAgent: 'system'
        }
      );

      // Enviar correo de bienvenida
      try {
        await emailService.sendWelcomeEmail(newUser.email, {
          firstName: newUser.firstName,
          email: newUser.email,
          // No incluimos la contraseña en el correo por seguridad
        });
        logger.info(`Welcome email sent to ${newUser.email}`);
      } catch (emailError) {
        logger.error('Error sending welcome email:', emailError);
        // No fallar la creación del usuario si el email falla
      }

      return {
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: roleName,
          createdAt: newUser.createdAt
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(
    userId: number,
    updateData: any,
    updatedBy: number
  ): Promise<ApiResponse<any>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const oldValues = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isActive: user.isActive
      };

      await user.update(updateData);

      // Actualizar rol si se especifica
      if (updateData.role) {
        const role = await Role.findByName(updateData.role);
        if (role) {
          // Revocar roles anteriores y asignar el nuevo
          await UserRole.revokeRole(userId, role.id);
          await UserRole.assignRole(userId, role.id, updatedBy);
        }
      }

      // Registrar en auditoría
      await AuditLog.log(
        'user_updated',
        'user',
        {
          userId: updatedBy,
          resourceId: userId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: 'system', // TODO: Obtener de request
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un usuario (soft delete)
   */
  async deleteUser(
    userId: number,
    deletedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Soft delete
      await user.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'user_deleted',
        'user',
        {
          userId: deletedBy,
          resourceId: userId.toString(),
          oldValues: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          ipAddress: 'system', // TODO: Obtener de request
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Usuario eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const verifiedUsers = await User.count({ where: { isEmailVerified: true } });
      const usersWith2FA = await User.count({ where: { is2faEnabled: true } });

      // Usuarios por rol
      const roleStats = await UserRole.findAll({
        attributes: [
          [UserRole.sequelize!.fn('COUNT', UserRole.sequelize!.col('id')), 'count']
        ],
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['name', 'displayName']
          }
        ],
        where: { isActive: true },
        group: ['role.id', 'role.name', 'role.displayName'],
        raw: true
      });

      // Usuarios registrados por mes (últimos 12 meses)
      const monthlyStats = await User.findAll({
        attributes: [
          [User.sequelize!.fn('DATE_TRUNC', 'month', User.sequelize!.col('created_at')), 'month'],
          [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count']
        ],
        where: {
          createdAt: {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        },
        group: [User.sequelize!.fn('DATE_TRUNC', 'month', User.sequelize!.col('created_at'))],
        order: [[User.sequelize!.fn('DATE_TRUNC', 'month', User.sequelize!.col('created_at')), 'ASC']],
        raw: true
      });

      return {
        success: true,
        message: 'Estadísticas de usuarios obtenidas exitosamente',
        data: {
          overview: {
            total: totalUsers,
            active: activeUsers,
            verified: verifiedUsers,
            with2FA: usersWith2FA
          },
          byRole: roleStats,
          monthly: monthlyStats
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de usuarios:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene auditoría de un usuario específico
   */
  async getUserAudit(
    userId: number,
    pagination: { page?: number; limit?: number }
  ): Promise<ApiResponse<{
    logs: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where: {
          [Op.or]: [
            { userId },
            { resourceId: userId.toString() }
          ]
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id', 'action', 'resource', 'resourceId', 'oldValues',
          'newValues', 'ipAddress', 'userAgent', 'severity',
          'status', 'createdAt'
        ]
      });

      return {
        success: true,
        message: 'Auditoría de usuario obtenida exitosamente',
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo auditoría de usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Busca usuarios por criterios
   */
  async searchUsers(
    criteria: {
      query?: string;
      role?: string;
      isActive?: boolean;
      limit?: number;
    }
  ): Promise<ApiResponse<any[]>> {
    try {
      const { query, role, isActive, limit = 10 } = criteria;
      const where: any = {};

      if (query) {
        where.$or = [
          { firstName: { $iLike: `%${query}%` } },
          { lastName: { $iLike: `%${query}%` } },
          { email: { $iLike: `%${query}%` } }
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const include: any[] = [];
      if (role) {
        include.push({
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          where: { name: role },
          required: true
        });
      }

      const users = await User.findAll({
        where,
        include,
        limit,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'email', 'firstName', 'lastName', 'isActive', 'avatar']
      });

      const formattedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isActive: user.isActive,
        avatar: user.avatar
      }));

      return {
        success: true,
        message: 'Búsqueda completada exitosamente',
        data: formattedUsers,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error buscando usuarios:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const userService = new UserService();