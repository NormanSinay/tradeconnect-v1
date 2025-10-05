/**
 * @fileoverview Modelo de Tipo de Acceso para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Tipo de Acceso
 *
 * Archivo: backend/src/models/AccessType.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from './User';
import { AccessType as AccessTypeInterface } from '../types/access-type.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     AccessType:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *         - category
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del tipo de acceso
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre interno del tipo de acceso
 *           example: "vip_access"
 *         displayName:
 *           type: string
 *           description: Nombre para mostrar
 *           example: "Acceso VIP"
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         category:
 *           type: string
 *           description: Categoría del tipo de acceso
 *           example: "premium"
 *         color:
 *           type: string
 *           description: Color para identificación visual
 *           example: "#FFD700"
 *         icon:
 *           type: string
 *           description: Icono del tipo de acceso
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ARCHIVED]
 *           description: Estado del tipo de acceso
 *           example: "ACTIVE"
 *         isDefault:
 *           type: boolean
 *           description: Si es el tipo de acceso por defecto
 *           example: false
 *         priority:
 *           type: integer
 *           description: Prioridad del tipo de acceso
 *           example: 10
 *         displayOrder:
 *           type: integer
 *           description: Orden de visualización
 *           example: 1
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *           example: 1
 */

@Table({
  tableName: 'access_types',
  modelName: 'AccessType',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_default']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['display_order']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    },
    {
      unique: true,
      fields: ['name']
    }
  ]
})
export class AccessType extends Model<AccessTypeInterface, Omit<AccessTypeInterface, 'id' | 'createdAt' | 'updatedAt'>> implements AccessTypeInterface {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del tipo de acceso es requerido'
    },
    len: {
      args: [2, 50],
      msg: 'El nombre debe tener entre 2 y 50 caracteres'
    }
  })
  @Index
  @Column({
    type: DataType.STRING(50),
    comment: 'Nombre interno único del tipo de acceso'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre para mostrar es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre para mostrar debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre para mostrar en la interfaz'
  })
  declare displayName: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'La descripción no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada del tipo de acceso'
  })
  declare description?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción corta no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'Descripción corta para listados'
  })
  declare shortDescription?: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La categoría es requerida'
    },
    len: {
      args: [2, 50],
      msg: 'La categoría debe tener entre 2 y 50 caracteres'
    }
  })
  @Index
  @Column({
    type: DataType.STRING(50),
    comment: 'Categoría del tipo de acceso (premium, standard, etc.)'
  })
  declare category: string;

  @Validate({
    len: {
      args: [0, 7],
      msg: 'El color debe tener máximo 7 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color para identificación visual (formato #RRGGBB)'
  })
  declare color?: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El icono no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Icono del tipo de acceso (nombre de clase CSS o URL)'
  })
  declare icon?: string;

  @Default('ACTIVE')
  @Index
  @Column({
    type: DataType.ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED'),
    comment: 'Estado del tipo de acceso'
  })
  declare status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si es el tipo de acceso por defecto para nuevos eventos'
  })
  declare isDefault: boolean;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La prioridad debe ser mayor o igual a 0'
    },
    max: {
      args: [100],
      msg: 'La prioridad no puede exceder 100'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Prioridad del tipo de acceso (mayor número = mayor prioridad)'
  })
  declare priority: number;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'El orden de visualización debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Orden de visualización en listas'
  })
  declare displayOrder: number;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del tipo de acceso'
  })
  declare metadata?: any;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el tipo de acceso'
  })
  declare createdBy: number;

  @CreatedAt
  @Index
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

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  // Relación con el creador
  // @BelongsTo(() => User, 'createdBy')
  // declare creator: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateAccessType(accessType: AccessType): Promise<void> {
    // Validar que no haya otro tipo de acceso por defecto si este lo es
    if (accessType.isDefault) {
      const existingDefault = await AccessType.findOne({
        where: {
          isDefault: true,
          category: accessType.category,
          id: { [Op.ne]: accessType.id || 0 }
        }
      });

      if (existingDefault) {
        throw new Error(`Ya existe un tipo de acceso por defecto en la categoría '${accessType.category}'`);
      }
    }

    // Validar unicidad del nombre
    if (accessType.name) {
      const existingName = await AccessType.findOne({
        where: {
          name: accessType.name,
          id: { [Op.ne]: accessType.id || 0 }
        }
      });

      if (existingName) {
        throw new Error(`Ya existe un tipo de acceso con el nombre '${accessType.name}'`);
      }
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el tipo de acceso está activo
   */
  public get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * Verifica si el tipo de acceso es premium
   */
  public get isPremium(): boolean {
    return ['premium', 'vip', 'platinum', 'gold'].includes(this.category.toLowerCase());
  }

  /**
   * Obtiene el nombre completo para display
   */
  public get fullDisplayName(): string {
    return this.displayName;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      shortDescription: this.shortDescription,
      category: this.category,
      color: this.color,
      icon: this.icon,
      status: this.status,
      isDefault: this.isDefault,
      priority: this.priority,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      isPremium: this.isPremium,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas administrativas
   */
  public toAdminJSON(): object {
    return {
      ...this.toPublicJSON(),
      metadata: this.metadata,
      createdBy: this.createdBy,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca tipos de acceso activos
   */
  static async findActive(options: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: AccessType[]; count: number }> {
    const { category, limit = 50, offset = 0 } = options;

    const where: any = {
      status: 'ACTIVE'
    };

    if (category) {
      where.category = category;
    }

    return this.findAndCountAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });
  }

  /**
   * Busca tipo de acceso por defecto en una categoría
   */
  static async findDefaultInCategory(category: string): Promise<AccessType | null> {
    return this.findOne({
      where: {
        category,
        isDefault: true,
        status: 'ACTIVE'
      }
    });
  }

  /**
   * Busca tipos de acceso por categoría
   */
  static async findByCategory(category: string, includeInactive: boolean = false): Promise<AccessType[]> {
    const where: any = {
      category
    };

    if (!includeInactive) {
      where.status = 'ACTIVE';
    }

    return this.findAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['priority', 'DESC']
      ]
    });
  }

  /**
   * Obtiene estadísticas de uso por tipo de acceso
   */
  static async getUsageStats(): Promise<Array<{
    accessTypeId: number;
    name: string;
    category: string;
    totalEvents: number;
    totalRegistrations: number;
    averagePrice: number;
  }>> {
    // Esta implementación requeriría joins con tablas de eventos y registros
    // Por ahora retornamos un array vacío
    return [];
  }
}