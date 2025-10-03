/**
 * @fileoverview Controlador de Usuarios para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de usuarios y perfiles
 *
 * Archivo: backend/src/controllers/userController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UserRole } from '../models/UserRole';
import { AuditLog } from '../models/AuditLog';
import {
  AuthenticatedRequest,
  UserProfile,
  UserUpdateData
} from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';

/**
 * Controlador para manejo de operaciones de usuario
 */
export class UserController {

  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     tags: [Users]
   *     summary: Obtener perfil del usuario
   *     description: Obtiene la información del perfil del usuario autenticado
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
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
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
            where: { isActive: true },
            required: false
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

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: profile,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo perfil de usuario:', error);
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
   * /api/users/profile:
   *   put:
   *     tags: [Users]
   *     summary: Actualizar perfil del usuario
   *     description: Actualiza la información del perfil del usuario autenticado
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
   *                 example: "Juan"
   *               lastName:
   *                 type: string
   *                 example: "Pérez"
   *               phone:
   *                 type: string
   *                 example: "+502 1234-5678"
   *               avatar:
   *                 type: string
   *                 example: "https://example.com/avatar.jpg"
   *               timezone:
   *                 type: string
   *                 example: "America/Guatemala"
   *               locale:
   *                 type: string
   *                 example: "es"
   *     responses:
   *       200:
   *         description: Perfil actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       409:
   *         description: NIT o CUI ya registrado
   *       500:
   *         description: Error interno del servidor
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: Partial<UserUpdateData> = req.body;
      const user = await User.findByPk(userId);

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar si NIT o CUI ya están registrados (si se están actualizando)
      if (updateData.nit && updateData.nit !== user.nit) {
        const existingNit = await User.isNitTaken(updateData.nit, userId);
        if (existingNit) {
          res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: 'El NIT ya está registrado por otro usuario',
            error: 'NIT_ALREADY_EXISTS',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      if (updateData.cui && updateData.cui !== user.cui) {
        const existingCui = await User.findOne({
          where: { cui: updateData.cui },
          paranoid: false
        });
        if (existingCui && existingCui.id !== userId) {
          res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: 'El CUI ya está registrado por otro usuario',
            error: 'CUI_ALREADY_EXISTS',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      // Actualizar usuario
      await user.update(updateData);

      // Registrar en auditoría
      await AuditLog.log(
        'user_updated',
        'user',
        {
          userId,
          resourceId: userId.toString(),
          oldValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatar: user.avatar,
            timezone: user.timezone,
            locale: user.locale
          },
          newValues: updateData,
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          timezone: user.timezone,
          locale: user.locale,
          updatedAt: user.updatedAt
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error actualizando perfil de usuario:', error);
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
   * /api/users:
   *   get:
   *     tags: [Users]
   *     summary: Listar usuarios
   *     description: Obtiene una lista paginada de usuarios (requiere permisos administrativos)
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
   *         description: Búsqueda por nombre o email
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
   *     responses:
   *       200:
   *         description: Lista de usuarios obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Verificar permisos de administrador
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('read_user')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para listar usuarios',
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
        isActive
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
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
        where.isActive = isActive === 'true';
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
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id', 'email', 'firstName', 'lastName', 'phone',
          'isEmailVerified', 'isActive', 'is2faEnabled',
          'lastLoginAt', 'createdAt', 'updatedAt'
        ]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo lista de usuarios:', error);
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
   * /api/users:
   *   post:
   *     tags: [Users]
   *     summary: Crear usuario
   *     description: Crea un nuevo usuario en el sistema (requiere permisos administrativos)
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
   *               password:
   *                 type: string
   *                 minLength: 8
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               phone:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [user, speaker, participant, client]
   *     responses:
   *       201:
   *         description: Usuario creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       409:
   *         description: Email ya registrado
   *       500:
   *         description: Error interno del servidor
   */
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Verificar permisos de administrador
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('create_user')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para crear usuarios',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role = 'user'
      } = req.body;

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'El email ya está registrado',
          error: 'EMAIL_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Crear usuario
      const newUser = await User.create({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        phone,
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
      const roleModel = await Role.findByName(role as any);
      if (roleModel) {
        await UserRole.assignRole(newUser.id, roleModel.id, req.user?.id);
      }

      // Registrar en auditoría
      await AuditLog.log(
        'user_created',
        'user',
        {
          userId: req.user?.id,
          resourceId: newUser.id.toString(),
          newValues: {
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role
          },
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role,
          createdAt: newUser.createdAt
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error creando usuario:', error);
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
   * /api/users/{id}:
   *   put:
   *     tags: [Users]
   *     summary: Actualizar usuario
   *     description: Actualiza la información de un usuario específico (requiere permisos administrativos)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               phone:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *               role:
   *                 type: string
   *     responses:
   *       200:
   *         description: Usuario actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Verificar permisos de administrador
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('update_user')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para actualizar usuarios',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const updateData = req.body;
      const oldValues = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isActive: user.isActive
      };

      await user.update(updateData);

      // Actualizar rol si se especifica
      if (updateData.role) {
        const roleModel = await Role.findByName(updateData.role);
        if (roleModel) {
          // Revocar roles anteriores y asignar el nuevo
          await UserRole.revokeRole(userId, roleModel.id);
          await UserRole.assignRole(userId, roleModel.id, req.user?.id);
        }
      }

      // Registrar en auditoría
      await AuditLog.log(
        'user_updated',
        'user',
        {
          userId: req.user?.id,
          resourceId: userId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.OK).json({
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
      });

    } catch (error) {
      logger.error('Error actualizando usuario:', error);
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
   * /api/users/{id}:
   *   delete:
   *     tags: [Users]
   *     summary: Eliminar usuario
   *     description: Elimina (soft delete) un usuario del sistema (requiere permisos administrativos)
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
   *         description: Usuario eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Verificar permisos de administrador
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('delete_user')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para eliminar usuarios',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Soft delete
      await user.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'user_deleted',
        'user',
        {
          userId: req.user?.id,
          resourceId: userId.toString(),
          oldValues: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener auditoría de usuario (admin)
   */
  async getUserAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('view_user_audit')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = parseInt(req.params.id);
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { rows: auditLogs, count: total } = await AuditLog.findAndCountAll({
        where: {
          resource: 'user',
          resourceId: userId.toString()
        },
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Auditoría obtenida exitosamente',
        data: {
          auditLogs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo auditoría de usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const userController = new UserController();