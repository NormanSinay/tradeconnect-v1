/**
 * @fileoverview Modelo de PermissionContext para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para contextos de permisos (organizaciones, proyectos, etc.)
 *
 * Archivo: backend/src/models/PermissionContext.ts
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
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo PermissionContext
 */
export interface PermissionContextAttributes {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  contextType: string;
  parentId?: number;
  isActive: boolean;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de contexto de permisos
 */
export interface PermissionContextCreationAttributes extends Omit<PermissionContextAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionContext:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *         - contextType
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del contexto
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre técnico del contexto
 *           example: "organization_123"
 *         displayName:
 *           type: string
 *           description: Nombre visible del contexto
 *           example: "Empresa ABC"
 *         description:
 *           type: string
 *           description: Descripción del contexto
 *         contextType:
 *           type: string
 *           enum: [global, organization, department, project, team, personal]
 *           description: Tipo de contexto
 *         parentId:
 *           type: integer
 *           description: ID del contexto padre (para jerarquías)
 *         isActive:
 *           type: boolean
 *           description: Si el contexto está activo
 *           default: true
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales del contexto
 */

@Table({
  tableName: 'permission_contexts',
  modelName: 'PermissionContext',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['context_type']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['is_active']
    }
  ]
})
export class PermissionContext extends Model<PermissionContextAttributes, PermissionContextCreationAttributes> implements PermissionContextAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre del contexto es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre técnico único del contexto'
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
    comment: 'Nombre visible del contexto'
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
    comment: 'Descripción del contexto'
  })
  declare description?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['global', 'organization', 'department', 'project', 'team', 'personal', 'event', 'group']],
      msg: 'El tipo de contexto debe ser uno de los permitidos'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('global', 'organization', 'department', 'project', 'team', 'personal', 'event', 'group'),
    comment: 'Tipo de contexto de permisos'
  })
  declare contextType: string;

  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del contexto padre para jerarquías'
  })
  declare parentId?: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el contexto está activo'
  })
  declare isActive: boolean;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del contexto'
  })
  declare metadata?: any;

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

  @BelongsTo(() => PermissionContext, 'parentId')
  declare parent: PermissionContext;

  @HasMany(() => PermissionContext, 'parentId')
  declare children: PermissionContext[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene la jerarquía completa del contexto
   */
  public async getHierarchy(): Promise<PermissionContext[]> {
    const hierarchy: PermissionContext[] = [];
    let current: PermissionContext | null = this;

    while (current) {
      hierarchy.unshift(current);
      current = await current.$get('parent');
    }

    return hierarchy;
  }

  /**
   * Verifica si este contexto es descendiente de otro
   */
  public async isDescendantOf(parentContextId: number): Promise<boolean> {
    const hierarchy = await this.getHierarchy();
    return hierarchy.some(ctx => ctx.id === parentContextId);
  }

  /**
   * Obtiene todos los descendientes del contexto
   */
  public async getDescendants(): Promise<PermissionContext[]> {
    const descendants: PermissionContext[] = [];
    const children = await this.$get('children') || [];

    for (const child of children) {
      descendants.push(child);
      const childDescendants = await child.getDescendants();
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  /**
   * Obtiene la representación completa del contexto
   */
  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      contextType: this.contextType,
      parentId: this.parentId,
      isActive: this.isActive,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca contexto por nombre
   */
  static async findByName(name: string): Promise<PermissionContext | null> {
    return this.findOne({
      where: { name, isActive: true }
    });
  }

  /**
   * Busca contextos por tipo
   */
  static async findByType(contextType: string): Promise<PermissionContext[]> {
    return this.findAll({
      where: { contextType, isActive: true },
      order: [['displayName', 'ASC']]
    });
  }

  /**
   * Obtiene contextos raíz (sin padre)
   */
  static async getRootContexts(): Promise<PermissionContext[]> {
    return this.findAll({
      where: {
        parentId: { $eq: null },
        isActive: true
      },
      order: [['displayName', 'ASC']]
    });
  }

  /**
   * Obtiene hijos directos de un contexto
   */
  static async getChildren(parentId: number): Promise<PermissionContext[]> {
    return this.findAll({
      where: { parentId, isActive: true },
      order: [['displayName', 'ASC']]
    });
  }

  /**
   * Crea el contexto global si no existe
   */
  static async ensureGlobalContext(): Promise<PermissionContext> {
    let globalContext = await this.findByName('global');
    if (!globalContext) {
      globalContext = await this.create({
        name: 'global',
        displayName: 'Global',
        description: 'Contexto global del sistema',
        contextType: 'global',
        isActive: true
      });
    }
    return globalContext;
  }

  /**
   * Obtiene la jerarquía completa de un contexto
   */
  static async getContextHierarchy(contextId: number): Promise<PermissionContext[]> {
    const context = await this.findByPk(contextId);
    if (!context) return [];

    return context.getHierarchy();
  }

  /**
   * Verifica si un contexto existe en la jerarquía de otro
   */
  static async isInHierarchy(childId: number, parentId: number): Promise<boolean> {
    const child = await this.findByPk(childId);
    if (!child) return false;

    return child.isDescendantOf(parentId);
  }
}