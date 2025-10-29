/**
 * @fileoverview Modelo de UserRole para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para tabla de relación muchos-a-muchos User ↔ Role
 *
 * Archivo: backend/src/models/UserRole.ts
 */

import { Op } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  Index,
  AllowNull,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { User } from './User';
import { Role } from './Role';

/**
 * Atributos del modelo UserRole
 */
export interface UserRoleAttributes {
  id?: number;
  userId: number;
  roleId: number;
  assignedBy?: number;
  assignedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de relación usuario-rol
 */
export interface UserRoleCreationAttributes extends Omit<UserRoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       required:
 *         - userId
 *         - roleId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la asignación usuario-rol
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario
 *           example: 123
 *         roleId:
 *           type: integer
 *           description: ID del rol
 *           example: 5
 *         assignedBy:
 *           type: integer
 *           description: ID del usuario que asignó el rol
 *           example: 456
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se asignó el rol
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del rol (opcional)
 *         isActive:
 *           type: boolean
 *           description: Si la asignación está activa
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

@Table({
  tableName: 'user_roles',
  modelName: 'UserRole',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['role_id']
    },
    {
      fields: ['assigned_by']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario'
  })
  declare userId: number;

  @ForeignKey(() => Role)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del rol asignado'
  })
  declare roleId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que asignó el rol'
  })
  declare assignedBy?: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se asignó el rol'
  })
  declare assignedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del rol (para roles temporales)'
  })
  declare expiresAt?: Date;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Indica si la asignación de rol está activa'
  })
  declare isActive: boolean;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación de la asignación'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de última actualización'
  })
  declare updatedAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @BelongsTo(() => Role)
  declare role: Role;

  @BelongsTo(() => User, 'assignedBy')
  declare assignedByUser: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el rol ha expirado
   */
  public get isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si la asignación está vigente
   */
  public get isValid(): boolean {
    return this.isActive && !this.isExpired;
  }

  /**
   * Obtiene el tiempo restante antes de expirar (en días)
   */
  public get daysUntilExpiration(): number | null {
    if (!this.expiresAt) {
      return null;
    }
    const diffTime = this.expiresAt.getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Desactiva la asignación de rol
   */
  public async deactivate(): Promise<void> {
    this.isActive = false;
    await this.save();
  }

  /**
   * Reactiva la asignación de rol
   */
  public async reactivate(): Promise<void> {
    this.isActive = true;
    await this.save();
  }

  /**
   * Extiende la expiración del rol
   */
  public async extendExpiration(days: number): Promise<void> {
    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + days);
    this.expiresAt = newExpiration;
    await this.save();
  }

  /**
   * Serializa para respuestas de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      roleId: this.roleId,
      assignedBy: this.assignedBy,
      assignedAt: this.assignedAt,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      isExpired: this.isExpired,
      isValid: this.isValid,
      daysUntilExpiration: this.daysUntilExpiration,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Asigna un rol a un usuario
   */
  static async assignRole(
    userId: number,
    roleId: number,
    assignedBy?: number,
    expiresAt?: Date
  ): Promise<UserRole> {
    // Verificar si ya existe la asignación
    const existingAssignment = await this.findOne({
      where: { userId, roleId }
    });

    if (existingAssignment) {
      // Si existe pero está inactiva, reactivarla
      if (!existingAssignment.isActive) {
        existingAssignment.isActive = true;
        existingAssignment.assignedBy = assignedBy;
        existingAssignment.assignedAt = new Date();
        existingAssignment.expiresAt = expiresAt;
        await existingAssignment.save();
        return existingAssignment;
      }
      // Si ya está activa, devolver la existente
      return existingAssignment;
    }

    // Crear nueva asignación
    return this.create({
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt,
      isActive: true
    });
  }

  /**
   * Revoca un rol de un usuario
   */
  static async revokeRole(userId: number, roleId: number): Promise<boolean> {
    const assignment = await this.findOne({
      where: { userId, roleId, isActive: true }
    });

    if (assignment) {
      await assignment.deactivate();
      return true;
    }

    return false;
  }

  /**
   * Obtiene todos los roles activos de un usuario
   */
  static async getUserActiveRoles(userId: number): Promise<UserRole[]> {
    return this.findAll({
      where: {
        userId,
        isActive: true
        // TODO: Add expiresAt condition
        // [Op.or]: [
        //   { expiresAt: null },
        //   { expiresAt: { [Op.gt]: new Date() } }
        // ]
      },
      include: [
        {
          model: Role,
          as: 'role'
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene todos los usuarios con un rol específico
   */
  static async getUsersWithRole(roleId: number, activeOnly: boolean = true): Promise<UserRole[]> {
    const where: any = { roleId };
    if (activeOnly) {
      where.isActive = true;
      // TODO: Add expiresAt condition
      // where[Op.or] = [
      //   { expiresAt: null },
      //   { expiresAt: { [Op.gt]: new Date() } }
      // ];
    }

    return this.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'isActive']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Verifica si un usuario tiene un rol específico
   */
  static async userHasRole(userId: number, roleId: number): Promise<boolean> {
    const assignment = await this.findOne({
      where: {
        userId,
        roleId,
        isActive: true
        // TODO: Add expiresAt condition
        // [Op.or]: [
        //   { expiresAt: null },
        //   { expiresAt: { [Op.gt]: new Date() } }
        // ]
      }
    });

    return !!assignment;
  }

  /**
   * Obtiene roles expirados que necesitan limpieza
   */
  static async getExpiredRoles(): Promise<UserRole[]> {
    return this.findAll({
      where: {
        expiresAt: { [Op.lt]: new Date() },
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName']
        }
      ]
    });
  }

  /**
   * Limpia roles expirados (desactiva asignaciones expiradas)
   */
  static async cleanupExpiredRoles(): Promise<number> {
    const expiredRoles = await this.getExpiredRoles();

    if (expiredRoles.length === 0) {
      return 0;
    }

    const [affectedRows] = await this.update(
      { isActive: false },
      {
        where: {
          expiresAt: { [Op.lt]: new Date() },
          isActive: true
        }
      }
    );

    return affectedRows;
  }

  /**
   * Transfiere todos los roles de un usuario a otro
   */
  static async transferUserRoles(fromUserId: number, toUserId: number, transferredBy: number): Promise<number> {
    const [affectedRows] = await this.update(
      {
        userId: toUserId,
        assignedBy: transferredBy,
        assignedAt: new Date()
      },
      {
        where: { userId: fromUserId, isActive: true }
      }
    );

    return affectedRows;
  }

  /**
   * Obtiene estadísticas de asignación de roles
   */
  static async getRoleAssignmentStats(): Promise<any[]> {
    const stats = await this.findAll({
      attributes: [
        'roleId',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'assignmentCount'],
        [this.sequelize!.fn('COUNT',
          this.sequelize!.literal('CASE WHEN is_active = true THEN 1 END')
        ), 'activeCount']
      ],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name', 'displayName']
        }
      ],
      group: ['UserRole.roleId', 'role.id', 'role.name', 'role.displayName'],
      raw: true
    });

    return stats;
  }

  /**
   * Obtiene roles asignados por un administrador específico
   */
  static async getRolesAssignedBy(assignedBy: number): Promise<UserRole[]> {
    return this.findAll({
      where: { assignedBy },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Role,
          as: 'role'
        }
      ],
      order: [['assignedAt', 'DESC']]
    });
  }
}
