/**
 * @fileoverview Modelo de Role para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para gestión de roles de usuario
 * 
 * Archivo: backend/src/models/Role.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  HasMany,
  CreatedAt,
  UpdatedAt,
  Index,
  Unique,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { UserRole } from '../utils/constants';
import { User } from './User';
import { UserRole as UserRoleModel } from './UserRole';
import { Permission } from './Permission';
import { RolePermission } from './RolePermission';

/**
 * Atributos del modelo Role
 */
export interface RoleAttributes {
  id?: number;
  name: UserRole;
  displayName: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  level: number;
  color?: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de rol
 */
export interface RoleCreationAttributes extends Omit<RoleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *         - level
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del rol
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre técnico del rol
 *           enum: [super_admin, admin, manager, operator, user, speaker, participant, client]
 *           example: admin
 *         displayName:
 *           type: string
 *           description: Nombre visible del rol
 *           example: Administrador
 *         description:
 *           type: string
 *           description: Descripción del rol
 *           example: Administrador con acceso completo al sistema
 *         isActive:
 *           type: boolean
 *           description: Si el rol está activo
 *           default: true
 *         isSystem:
 *           type: boolean
 *           description: Si es un rol del sistema (no eliminable)
 *           default: false
 *         level:
 *           type: integer
 *           description: Nivel jerárquico del rol (1-10)
 *           minimum: 1
 *           maximum: 10
 *           example: 5
 *         color:
 *           type: string
 *           description: Color hexadecimal para UI
 *           example: "#FF5722"
 *         icon:
 *           type: string
 *           description: Icono para UI
 *           example: "admin-panel"
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
  tableName: 'roles',
  modelName: 'Role',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['level']
    },
    {
      fields: ['is_system']
    }
  ]
})
export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre del rol es requerido'
    },
    isIn: {
      args: [['super_admin', 'admin', 'manager', 'operator', 'user', 'speaker', 'participant', 'client']],
      msg: 'El nombre del rol debe ser uno de los valores permitidos'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Nombre técnico del rol'
  })
  declare name: UserRole;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre visible es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre visible debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre visible del rol'
  })
  declare displayName: string;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'La descripción no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Descripción del rol'
  })
  declare description?: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el rol está activo'
  })
  declare isActive: boolean;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es un rol del sistema (no eliminable)'
  })
  declare isSystem: boolean;

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [1],
      msg: 'El nivel mínimo es 1'
    },
    max: {
      args: [10],
      msg: 'El nivel máximo es 10'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Nivel jerárquico del rol (1-10, donde 10 es el más alto)'
  })
  declare level: number;

  @Validate({
    is: {
      args: /^#[0-9A-F]{6}$/i,
      msg: 'El color debe ser un código hexadecimal válido (#RRGGBB)'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color hexadecimal para la interfaz'
  })
  declare color?: string;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El icono no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Icono para la interfaz'
  })
  declare icon?: string;

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

  @BelongsToMany(() => User, () => UserRoleModel)
  declare users: User[];

  @BelongsToMany(() => Permission, () => RolePermission)
  declare permissions: Permission[];

  @HasMany(() => UserRoleModel)
  declare userRoles: UserRoleModel[];

  @HasMany(() => RolePermission)
  declare rolePermissions: RolePermission[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el rol tiene un nivel superior o igual al especificado
   */
  public hasLevelOrHigher(requiredLevel: number): boolean {
    return this.level >= requiredLevel;
  }

  /**
   * Verifica si el rol puede ser eliminado
   */
  public get canBeDeleted(): boolean {
    return !this.isSystem;
  }

  /**
   * Obtiene la representación completa del rol con permisos
   */
  public async getFullRoleData(): Promise<any> {
    const permissions = await this.$get('permissions') || [];

    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      isActive: this.isActive,
      isSystem: this.isSystem,
      level: this.level,
      color: this.color,
      icon: this.icon,
      permissions: permissions.map((p: Permission) => ({
        id: p.id,
        name: p.name,
        displayName: p.displayName,
        resource: p.resource,
        action: p.action
      })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa el rol para respuestas de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      isActive: this.isActive,
      isSystem: this.isSystem,
      level: this.level,
      color: this.color,
      icon: this.icon,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Obtiene todos los roles del sistema ordenados por nivel
   */
  static async getSystemRoles(): Promise<Role[]> {
    return this.findAll({
      where: { isSystem: true },
      order: [['level', 'DESC']]
    });
  }

  /**
   * Obtiene todos los roles activos ordenados por nivel
   */
  static async getActiveRoles(): Promise<Role[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['level', 'DESC']]
    });
  }

  /**
   * Busca rol por nombre
   */
  static async findByName(name: UserRole): Promise<Role | null> {
    return this.findOne({
      where: { name },
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });
  }

  /**
   * Obtiene roles por nivel mínimo
   */
  static async getRolesByMinLevel(minLevel: number): Promise<Role[]> {
    return this.findAll({
      where: {
        level: { $gte: minLevel },
        isActive: true
      },
      order: [['level', 'DESC']]
    });
  }

  /**
   * Verifica si un nombre de rol ya existe
   */
  static async isNameTaken(name: string, excludeRoleId?: number): Promise<boolean> {
    const where: any = { name };
    
    if (excludeRoleId) {
      where.id = { $ne: excludeRoleId };
    }
    
    const role = await this.findOne({ where });
    return !!role;
  }

  /**
   * Crea roles del sistema si no existen
   */
  static async seedSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: 'super_admin' as UserRole,
        displayName: 'Super Administrador',
        description: 'Acceso total al sistema, incluyendo configuración de infraestructura',
        level: 10,
        color: '#D32F2F',
        icon: 'shield-crown',
        isSystem: true,
        isActive: true
      },
      {
        name: 'admin' as UserRole,
        displayName: 'Administrador',
        description: 'Administrador del sistema con acceso amplio',
        level: 9,
        color: '#FF5722',
        icon: 'shield-admin',
        isSystem: true,
        isActive: true
      },
      {
        name: 'manager' as UserRole,
        displayName: 'Gerente',
        description: 'Gerente con permisos de gestión de eventos y usuarios',
        level: 7,
        color: '#FF9800',
        icon: 'briefcase',
        isSystem: true,
        isActive: true
      },
      {
        name: 'operator' as UserRole,
        displayName: 'Operador',
        description: 'Operador con permisos limitados de gestión',
        level: 5,
        color: '#2196F3',
        icon: 'settings',
        isSystem: true,
        isActive: true
      },
      {
        name: 'user' as UserRole,
        displayName: 'Usuario',
        description: 'Usuario regular del sistema',
        level: 3,
        color: '#4CAF50',
        icon: 'user',
        isSystem: true,
        isActive: true
      },
      {
        name: 'speaker' as UserRole,
        displayName: 'Speaker',
        description: 'Expositor o conferencista de eventos',
        level: 4,
        color: '#9C27B0',
        icon: 'microphone',
        isSystem: true,
        isActive: true
      },
      {
        name: 'participant' as UserRole,
        displayName: 'Participante',
        description: 'Participante en eventos',
        level: 2,
        color: '#607D8B',
        icon: 'user-group',
        isSystem: true,
        isActive: true
      },
      {
        name: 'client' as UserRole,
        displayName: 'Cliente',
        description: 'Cliente externo',
        level: 1,
        color: '#795548',
        icon: 'user-tie',
        isSystem: true,
        isActive: true
      }
    ];

    for (const roleData of systemRoles) {
      const existingRole = await this.findByName(roleData.name);
      if (!existingRole) {
        await this.create(roleData);
      }
    }
  }

  /**
   * Obtiene el rol por defecto para nuevos usuarios
   */
  static async getDefaultRole(): Promise<Role | null> {
    return this.findByName('user');
  }

  /**
   * Obtiene estadísticas de distribución de roles
   */
  static async getRoleDistributionStats(): Promise<any[]> {
    const stats = await this.findAll({
      attributes: [
        'name',
        'displayName',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('users.id')), 'userCount']
      ],
      include: [
        {
          model: User,
          as: 'users',
          attributes: [],
          required: false
        }
      ],
      group: ['Role.id', 'Role.name', 'Role.displayName'],
      raw: true
    });

    return stats;
  }
}