/**
 * @fileoverview Modelo de PermissionPolicy para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para políticas de permisos avanzadas
 *
 * Archivo: backend/src/models/PermissionPolicy.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  Index,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { User } from './User';
import { Role } from './Role';
import { Permission } from './Permission';
import { PermissionContext } from './PermissionContext';

/**
 * Atributos del modelo PermissionPolicy
 */
export interface PermissionPolicyAttributes {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  policyType: string;
  conditions: any;
  effect: 'allow' | 'deny';
  priority: number;
  contextId?: number;
  isActive: boolean;
  isSystem: boolean;
  createdBy?: number;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de política de permisos
 */
export interface PermissionPolicyCreationAttributes extends Omit<PermissionPolicyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionPolicy:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *         - policyType
 *         - conditions
 *         - effect
 *         - priority
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la política
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre técnico de la política
 *           example: "admin_time_restriction"
 *         displayName:
 *           type: string
 *           description: Nombre visible de la política
 *           example: "Restricción horaria para administradores"
 *         description:
 *           type: string
 *           description: Descripción de la política
 *         policyType:
 *           type: string
 *           enum: [time_based, location_based, role_based, context_based, custom]
 *           description: Tipo de política
 *         conditions:
 *           type: object
 *           description: Condiciones de la política
 *         effect:
 *           type: string
 *           enum: [allow, deny]
 *           description: Efecto de la política
 *         priority:
 *           type: integer
 *           description: Prioridad de evaluación (mayor número = mayor prioridad)
 *           example: 100
 *         contextId:
 *           type: integer
 *           description: ID del contexto al que aplica
 *         isActive:
 *           type: boolean
 *           description: Si la política está activa
 *           default: true
 *         isSystem:
 *           type: boolean
 *           description: Si es una política del sistema
 *           default: false
 *         createdBy:
 *           type: integer
 *           description: ID del usuario que creó la política
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración de la política
 */

@Table({
  tableName: 'permission_policies',
  modelName: 'PermissionPolicy',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['policy_type']
    },
    {
      fields: ['effect']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['context_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_system']
    },
    {
      fields: ['expires_at']
    }
  ]
})
export class PermissionPolicy extends Model<PermissionPolicyAttributes, PermissionPolicyCreationAttributes> implements PermissionPolicyAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre de la política es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre técnico único de la política'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre visible es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre visible debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre visible de la política'
  })
  declare displayName: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la política'
  })
  declare description?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['time_based', 'location_based', 'role_based', 'context_based', 'resource_based', 'custom']],
      msg: 'El tipo de política debe ser uno de los permitidos'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('time_based', 'location_based', 'role_based', 'context_based', 'resource_based', 'custom'),
    comment: 'Tipo de política de permisos'
  })
  declare policyType: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Condiciones de evaluación de la política'
  })
  declare conditions: any;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['allow', 'deny']],
      msg: 'El efecto debe ser allow o deny'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('allow', 'deny'),
    comment: 'Efecto de la política (allow/deny)'
  })
  declare effect: 'allow' | 'deny';

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La prioridad debe ser mayor o igual a 0'
    },
    max: {
      args: [1000],
      msg: 'La prioridad debe ser menor o igual a 1000'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Prioridad de evaluación (0-1000, mayor = más prioritario)'
  })
  declare priority: number;

  @ForeignKey(() => PermissionContext)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del contexto al que aplica la política'
  })
  declare contextId?: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la política está activa'
  })
  declare isActive: boolean;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es una política del sistema'
  })
  declare isSystem: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que creó la política'
  })
  declare createdBy?: number;

  @Index
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de expiración debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de la política'
  })
  declare expiresAt?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de actualización'
  })
  declare updatedAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => PermissionContext)
  declare context: PermissionContext;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la política puede ser eliminada
   */
  public get canBeDeleted(): boolean {
    return !this.isSystem;
  }

  /**
   * Verifica si la política ha expirado
   */
  public get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Evalúa si la política aplica a un usuario/rol/permiso dado
   */
  public async evaluate(user: User, role?: Role, permission?: Permission, context?: any): Promise<boolean> {
    if (!this.isActive || this.isExpired) {
      return false;
    }

    try {
      switch (this.policyType) {
        case 'time_based':
          return this.evaluateTimeBased(context);
        case 'role_based':
          return this.evaluateRoleBased(role);
        case 'context_based':
          return this.evaluateContextBased(context);
        case 'resource_based':
          return this.evaluateResourceBased(permission, context);
        case 'custom':
          return this.evaluateCustom(user, role, permission, context);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error evaluating policy ${this.name}:`, error);
      return false;
    }
  }

  private evaluateTimeBased(context: any): boolean {
    const now = new Date();
    const conditions = this.conditions;

    if (conditions.startTime && conditions.endTime) {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = this.parseTime(conditions.startTime);
      const endTime = this.parseTime(conditions.endTime);

      if (startTime <= endTime) {
        return currentTime >= startTime && currentTime <= endTime;
      } else {
        // Cruza medianoche
        return currentTime >= startTime || currentTime <= endTime;
      }
    }

    if (conditions.daysOfWeek) {
      const currentDay = now.getDay();
      return conditions.daysOfWeek.includes(currentDay);
    }

    return true;
  }

  private evaluateRoleBased(role?: Role): boolean {
    if (!role) return false;
    const conditions = this.conditions;

    if (conditions.allowedRoles) {
      return conditions.allowedRoles.includes(role.name);
    }

    if (conditions.minLevel) {
      return role.level >= conditions.minLevel;
    }

    return true;
  }

  private evaluateContextBased(context: any): boolean {
    const conditions = this.conditions;

    if (conditions.allowedContexts && context?.id) {
      return conditions.allowedContexts.includes(context.id);
    }

    return true;
  }

  private evaluateResourceBased(permission?: Permission, context?: any): boolean {
    if (!permission) return false;
    const conditions = this.conditions;

    if (conditions.allowedResources) {
      return conditions.allowedResources.includes(permission.resource);
    }

    if (conditions.allowedActions) {
      return conditions.allowedActions.includes(permission.action);
    }

    return true;
  }

  private evaluateCustom(user: User, role?: Role, permission?: Permission, context?: any): boolean {
    // Implementación personalizada - puede ser extendida
    const conditions = this.conditions;

    // Ejemplo: política basada en atributos del usuario
    if (conditions.userAttributes) {
      for (const [key, value] of Object.entries(conditions.userAttributes)) {
        if ((user as any)[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * Obtiene la representación completa de la política
   */
  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      policyType: this.policyType,
      conditions: this.conditions,
      effect: this.effect,
      priority: this.priority,
      contextId: this.contextId,
      isActive: this.isActive,
      isSystem: this.isSystem,
      createdBy: this.createdBy,
      expiresAt: this.expiresAt,
      isExpired: this.isExpired,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca política por nombre
   */
  static async findByName(name: string): Promise<PermissionPolicy | null> {
    return this.findOne({
      where: { name, isActive: true }
    });
  }

  /**
   * Obtiene políticas activas ordenadas por prioridad
   */
  static async getActivePolicies(): Promise<PermissionPolicy[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['priority', 'DESC']]
    });
  }

  /**
   * Obtiene políticas por tipo
   */
  static async getPoliciesByType(policyType: string): Promise<PermissionPolicy[]> {
    return this.findAll({
      where: { policyType, isActive: true },
      order: [['priority', 'DESC']]
    });
  }

  /**
   * Evalúa todas las políticas aplicables para una solicitud
   */
  static async evaluatePolicies(
    user: User,
    role?: Role,
    permission?: Permission,
    context?: any
  ): Promise<'allow' | 'deny' | 'neutral'> {
    const policies = await this.getActivePolicies();

    // Ordenar por prioridad (mayor primero)
    policies.sort((a, b) => b.priority - a.priority);

    for (const policy of policies) {
      const applies = await policy.evaluate(user, role, permission, context);
      if (applies) {
        return policy.effect;
      }
    }

    return 'neutral';
  }

  /**
   * Limpia políticas expiradas
   */
  static async cleanupExpiredPolicies(): Promise<number> {
    const [affectedRows] = await this.update(
      { isActive: false },
      {
        where: {
          expiresAt: { $lt: new Date() },
          isActive: true
        }
      }
    );

    return affectedRows;
  }
}