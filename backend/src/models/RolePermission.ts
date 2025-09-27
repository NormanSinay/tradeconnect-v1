/**
 * @fileoverview Modelo de RolePermission para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para tabla de relación muchos-a-muchos Role ↔ Permission
 *
 * Archivo: backend/src/models/RolePermission.ts
 */

import { Op, Sequelize } from 'sequelize';
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
import { Role } from './Role';
import { Permission } from './Permission';
import { User } from './User';

/**
 * Atributos del modelo RolePermission
 */
export interface RolePermissionAttributes {
  id?: number;
  roleId: number;
  permissionId: number;
  grantedBy?: number;
  grantedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de relación rol-permiso
 */
export interface RolePermissionCreationAttributes extends Omit<RolePermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     RolePermission:
 *       type: object
 *       required:
 *         - roleId
 *         - permissionId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la asignación rol-permiso
 *           example: 1
 *         roleId:
 *           type: integer
 *           description: ID del rol
 *           example: 5
 *         permissionId:
 *           type: integer
 *           description: ID del permiso
 *           example: 12
 *         grantedBy:
 *           type: integer
 *           description: ID del usuario que otorgó el permiso
 *           example: 456
 *         grantedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se otorgó el permiso
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del permiso (opcional)
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
  tableName: 'role_permissions',
  modelName: 'RolePermission',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id']
    },
    {
      fields: ['role_id']
    },
    {
      fields: ['permission_id']
    },
    {
      fields: ['granted_by']
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
export class RolePermission extends Model<RolePermissionAttributes, RolePermissionCreationAttributes> implements RolePermissionAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Role)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del rol'
  })
  declare roleId: number;

  @ForeignKey(() => Permission)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del permiso asignado'
  })
  declare permissionId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que otorgó el permiso'
  })
  declare grantedBy?: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se otorgó el permiso'
  })
  declare grantedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del permiso (para permisos temporales)'
  })
  declare expiresAt?: Date;

  @Index
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Indica si la asignación de permiso está activa'
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

  @BelongsTo(() => Role)
  declare role: Role;

  @BelongsTo(() => Permission)
  declare permission: Permission;

  @BelongsTo(() => User, 'grantedBy')
  declare grantedByUser: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el permiso ha expirado
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
   * Desactiva la asignación de permiso
   */
  public async deactivate(): Promise<void> {
    this.isActive = false;
    await this.save();
  }

  /**
   * Reactiva la asignación de permiso
   */
  public async reactivate(): Promise<void> {
    this.isActive = true;
    await this.save();
  }

  /**
   * Extiende la expiración del permiso
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
      roleId: this.roleId,
      permissionId: this.permissionId,
      grantedBy: this.grantedBy,
      grantedAt: this.grantedAt,
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
   * Asigna un permiso a un rol
   */
  static async assignPermission(
    roleId: number,
    permissionId: number,
    grantedBy?: number,
    expiresAt?: Date
  ): Promise<RolePermission> {
    // Verificar si ya existe la asignación
    const existingAssignment = await this.findOne({
      where: { roleId, permissionId }
    });

    if (existingAssignment) {
      // Si existe pero está inactiva, reactivarla
      if (!existingAssignment.isActive) {
        existingAssignment.isActive = true;
        existingAssignment.grantedBy = grantedBy;
        existingAssignment.grantedAt = new Date();
        existingAssignment.expiresAt = expiresAt;
        await existingAssignment.save();
        return existingAssignment;
      }
      // Si ya está activa, devolver la existente
      return existingAssignment;
    }

    // Crear nueva asignación
    return this.create({
      roleId,
      permissionId,
      grantedBy,
      grantedAt: new Date(),
      expiresAt,
      isActive: true
    });
  }

  /**
   * Revoca un permiso de un rol
   */
  static async revokePermission(roleId: number, permissionId: number): Promise<boolean> {
    const assignment = await this.findOne({
      where: { roleId, permissionId, isActive: true }
    });

    if (assignment) {
      await assignment.deactivate();
      return true;
    }

    return false;
  }

  /**
   * Obtiene todos los permisos activos de un rol
   */
  static async getRoleActivePermissions(roleId: number): Promise<RolePermission[]> {
    return this.findAll({
      where: Sequelize.where(
        Sequelize.fn('COALESCE', Sequelize.col('expiresAt'), Sequelize.literal('NOW() + INTERVAL \'1 year\'')), '>', new Date()
      ),
      include: [
        {
          model: Permission,
          as: 'permission'
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene todos los roles que tienen un permiso específico
   */
  static async getRolesWithPermission(permissionId: number, activeOnly: boolean = true): Promise<RolePermission[]> {
    const where: any = { permissionId };
    if (activeOnly) {
      where.isActive = true;
      // TODO: Fix complex where clause for expiresAt
      // where[Op.or] = [
      //   { expiresAt: null },
      //   { expiresAt: { [Op.gt]: new Date() } }
      // ];
    }

    return this.findAll({
      where,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName', 'level']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Verifica si un rol tiene un permiso específico
   */
  static async roleHasPermission(roleId: number, permissionId: number): Promise<boolean> {
    const assignment = await this.findOne({
      where: {
        roleId,
        permissionId,
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
   * Obtiene permisos expirados que necesitan limpieza
   */
  static async getExpiredPermissions(): Promise<RolePermission[]> {
    return this.findAll({
      where: {
        expiresAt: { [Op.lt]: new Date() },
        isActive: true
      },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName']
        },
        {
          model: Permission,
          as: 'permission',
          attributes: ['id', 'name', 'displayName', 'resource', 'action']
        }
      ]
    });
  }

  /**
   * Limpia permisos expirados (desactiva asignaciones expiradas)
   */
  static async cleanupExpiredPermissions(): Promise<number> {
    const expiredPermissions = await this.getExpiredPermissions();

    if (expiredPermissions.length === 0) {
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
   * Copia todos los permisos de un rol a otro
   */
  static async copyRolePermissions(fromRoleId: number, toRoleId: number, copiedBy: number): Promise<number> {
    const sourcePermissions = await this.getRoleActivePermissions(fromRoleId);

    let copiedCount = 0;
    for (const sourcePerm of sourcePermissions) {
      try {
        await this.assignPermission(
          toRoleId,
          sourcePerm.permissionId,
          copiedBy,
          sourcePerm.expiresAt
        );
        copiedCount++;
      } catch (error: any) {
        // Ignorar errores de permisos duplicados
        if (!error.message?.includes('unique constraint')) {
          throw error;
        }
      }
    }

    return copiedCount;
  }

  /**
   * Obtiene estadísticas de asignación de permisos
   */
  static async getPermissionAssignmentStats(): Promise<any[]> {
    const stats = await this.findAll({
      attributes: [
        'permissionId',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'assignmentCount'],
        [this.sequelize!.fn('COUNT',
          this.sequelize!.literal('CASE WHEN is_active = true THEN 1 END')
        ), 'activeCount']
      ],
      include: [
        {
          model: Permission,
          as: 'permission',
          attributes: ['name', 'displayName', 'resource', 'action']
        }
      ],
      group: ['RolePermission.permissionId', 'permission.id', 'permission.name', 'permission.displayName', 'permission.resource', 'permission.action'],
      raw: true
    });

    return stats;
  }

  /**
   * Obtiene permisos asignados por un administrador específico
   */
  static async getPermissionsGrantedBy(grantedBy: number): Promise<RolePermission[]> {
    return this.findAll({
      where: { grantedBy },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'displayName']
        },
        {
          model: Permission,
          as: 'permission',
          attributes: ['id', 'name', 'displayName', 'resource', 'action']
        }
      ],
      order: [['grantedAt', 'DESC']]
    });
  }

  /**
   * Valida que un rol tenga todos los permisos requeridos
   */
  static async validateRolePermissions(
    roleId: number,
    requiredPermissions: string[]
  ): Promise<{ valid: boolean; missing: string[] }> {
    const rolePermissions = await this.getRoleActivePermissions(roleId);
    const assignedPermissionNames = rolePermissions.map(rp => rp.permission.name as string);

    const missing = requiredPermissions.filter(
      perm => !assignedPermissionNames.includes(perm)
    );

    return {
      valid: missing.length === 0,
      missing
    };
  }
}