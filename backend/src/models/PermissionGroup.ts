/**
 * @fileoverview Modelo de PermissionGroup para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para agrupar permisos en categorías lógicas
 *
 * Archivo: backend/src/models/PermissionGroup.ts
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
  Unique,
  HasMany,
  BelongsToMany
} from 'sequelize-typescript';
import { Permission } from './Permission';

/**
 * Atributos del modelo PermissionGroup
 */
export interface PermissionGroupAttributes {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  isActive: boolean;
  isSystem: boolean;
  order: number;
  icon?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de grupo de permisos
 */
export interface PermissionGroupCreationAttributes extends Omit<PermissionGroupAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionGroup:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *         - category
 *         - order
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del grupo de permisos
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre técnico del grupo
 *           example: "user_management"
 *         displayName:
 *           type: string
 *           description: Nombre visible del grupo
 *           example: "Gestión de Usuarios"
 *         description:
 *           type: string
 *           description: Descripción del grupo
 *         category:
 *           type: string
 *           enum: [system, security, content, commerce, analytics, communication]
 *           description: Categoría del grupo
 *         isActive:
 *           type: boolean
 *           description: Si el grupo está activo
 *           default: true
 *         isSystem:
 *           type: boolean
 *           description: Si es un grupo del sistema
 *           default: false
 *         order:
 *           type: integer
 *           description: Orden de visualización
 *           example: 1
 *         icon:
 *           type: string
 *           description: Icono del grupo
 *         color:
 *           type: string
 *           description: Color del grupo
 */

@Table({
  tableName: 'permission_groups',
  modelName: 'PermissionGroup',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_system']
    },
    {
      fields: ['order']
    }
  ]
})
export class PermissionGroup extends Model<PermissionGroupAttributes, PermissionGroupCreationAttributes> implements PermissionGroupAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre del grupo es requerido'
    },
    len: {
      args: [2, 50],
      msg: 'El nombre debe tener entre 2 y 50 caracteres'
    },
    is: {
      args: /^[a-z_]+$/,
      msg: 'El nombre solo puede contener letras minúsculas y guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Nombre técnico único del grupo de permisos'
  })
  declare name: string;

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
    comment: 'Nombre visible del grupo de permisos'
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
    comment: 'Descripción del grupo de permisos'
  })
  declare description?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['system', 'security', 'content', 'commerce', 'analytics', 'communication', 'events', 'users', 'reports']],
      msg: 'La categoría debe ser una de las permitidas'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('system', 'security', 'content', 'commerce', 'analytics', 'communication', 'events', 'users', 'reports'),
    comment: 'Categoría del grupo de permisos'
  })
  declare category: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el grupo está activo'
  })
  declare isActive: boolean;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es un grupo del sistema (no eliminable)'
  })
  declare isSystem: boolean;

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'El orden debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Orden de visualización del grupo'
  })
  declare order: number;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El icono no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Icono del grupo para UI'
  })
  declare icon?: string;

  @Validate({
    is: {
      args: /^#[0-9A-F]{6}$/i,
      msg: 'El color debe ser un código hexadecimal válido (#RRGGBB)'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color del grupo en formato hexadecimal'
  })
  declare color?: string;

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

  @BelongsToMany(() => Permission, {
    through: 'permission_group_permissions',
    foreignKey: 'groupId',
    otherKey: 'permissionId'
  })
  declare permissions: Permission[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el grupo puede ser eliminado
   */
  public get canBeDeleted(): boolean {
    return !this.isSystem;
  }

  /**
   * Obtiene la representación completa del grupo
   */
  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      category: this.category,
      isActive: this.isActive,
      isSystem: this.isSystem,
      order: this.order,
      icon: this.icon,
      color: this.color,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca grupo por nombre
   */
  static async findByName(name: string): Promise<PermissionGroup | null> {
    return this.findOne({
      where: { name, isActive: true }
    });
  }

  /**
   * Busca grupos por categoría
   */
  static async findByCategory(category: string): Promise<PermissionGroup[]> {
    return this.findAll({
      where: { category, isActive: true },
      order: [['order', 'ASC']]
    });
  }

  /**
   * Obtiene todos los grupos activos ordenados
   */
  static async getActiveGroups(): Promise<PermissionGroup[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    });
  }

  /**
   * Obtiene todos los grupos del sistema
   */
  static async getSystemGroups(): Promise<PermissionGroup[]> {
    return this.findAll({
      where: { isSystem: true },
      order: [['order', 'ASC']]
    });
  }

  /**
   * Crea grupos del sistema si no existen
   */
  static async seedSystemGroups(): Promise<void> {
    const systemGroups = [
      {
        name: 'system',
        displayName: 'Sistema',
        description: 'Permisos del sistema y configuración',
        category: 'system',
        order: 1,
        icon: 'settings',
        color: '#FF5722',
        isSystem: true,
        isActive: true
      },
      {
        name: 'security',
        displayName: 'Seguridad',
        description: 'Permisos de seguridad y autenticación',
        category: 'security',
        order: 2,
        icon: 'shield',
        color: '#F44336',
        isSystem: true,
        isActive: true
      },
      {
        name: 'users',
        displayName: 'Usuarios',
        description: 'Gestión de usuarios y roles',
        category: 'users',
        order: 3,
        icon: 'users',
        color: '#2196F3',
        isSystem: true,
        isActive: true
      },
      {
        name: 'events',
        displayName: 'Eventos',
        description: 'Gestión de eventos y actividades',
        category: 'events',
        order: 4,
        icon: 'calendar',
        color: '#4CAF50',
        isSystem: true,
        isActive: true
      },
      {
        name: 'content',
        displayName: 'Contenido',
        description: 'Gestión de contenido y publicaciones',
        category: 'content',
        order: 5,
        icon: 'file-text',
        color: '#FF9800',
        isSystem: true,
        isActive: true
      },
      {
        name: 'commerce',
        displayName: 'Comercio',
        description: 'Permisos de comercio y pagos',
        category: 'commerce',
        order: 6,
        icon: 'credit-card',
        color: '#9C27B0',
        isSystem: true,
        isActive: true
      },
      {
        name: 'analytics',
        displayName: 'Analíticas',
        description: 'Permisos de reportes y analíticas',
        category: 'analytics',
        order: 7,
        icon: 'bar-chart',
        color: '#607D8B',
        isSystem: true,
        isActive: true
      },
      {
        name: 'communication',
        displayName: 'Comunicación',
        description: 'Permisos de comunicación y notificaciones',
        category: 'communication',
        order: 8,
        icon: 'mail',
        color: '#00BCD4',
        isSystem: true,
        isActive: true
      },
      {
        name: 'reports',
        displayName: 'Reportes',
        description: 'Permisos de generación de reportes',
        category: 'reports',
        order: 9,
        icon: 'file-chart',
        color: '#795548',
        isSystem: true,
        isActive: true
      }
    ];

    for (const groupData of systemGroups) {
      const existingGroup = await this.findByName(groupData.name);
      if (!existingGroup) {
        await this.create(groupData);
      }
    }
  }
}