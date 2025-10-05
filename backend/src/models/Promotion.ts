/**
 * @fileoverview Modelo de Promoción para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Promoción
 *
 * Archivo: backend/src/models/Promotion.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey,
  Index,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Tipos de promoción
 */
export enum PromotionType {
  GENERAL = 'GENERAL',
  EVENT_SPECIFIC = 'EVENT_SPECIFIC',
  CATEGORY_SPECIFIC = 'CATEGORY_SPECIFIC',
  MEMBERSHIP = 'MEMBERSHIP'
}

/**
 * Atributos del modelo Promoción
 */
export interface PromotionAttributes {
  id?: number;
  name: string;
  description?: string;
  type: PromotionType;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  eventIds?: number[];
  categoryIds?: number[];
  minPurchaseAmount?: number;
  userTypes?: string[];
  isStackable: boolean;
  priority: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de promoción
 */
export interface PromotionCreationAttributes extends Omit<PromotionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la promoción
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre interno de la promoción
 *           example: "Descuento Verano 2024"
 *         description:
 *           type: string
 *           description: Descripción detallada de la promoción
 *         type:
 *           type: string
 *           enum: [GENERAL, EVENT_SPECIFIC, CATEGORY_SPECIFIC, MEMBERSHIP]
 *           description: Tipo de promoción
 *         isActive:
 *           type: boolean
 *           description: Estado de la promoción
 *           default: true
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de la promoción
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin de la promoción
 *         eventIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de eventos específicos (para EVENT_SPECIFIC)
 *         categoryIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de categorías permitidas (para CATEGORY_SPECIFIC)
 *         minPurchaseAmount:
 *           type: number
 *           description: Monto mínimo de compra requerido
 *         userTypes:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de usuario permitidos
 *         isStackable:
 *           type: boolean
 *           description: Si puede combinarse con otras promociones
 *           default: true
 *         priority:
 *           type: integer
 *           description: Prioridad para resolución de conflictos
 *           default: 0
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 */

@Table({
  tableName: 'promotions',
  modelName: 'Promotion',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Promotion extends Model<PromotionAttributes, PromotionCreationAttributes> implements PromotionAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la promoción es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre interno de la promoción'
  })
  declare name: string;

  @Validate({
    len: {
      args: [0, 2000],
      msg: 'La descripción no puede exceder 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada de la promoción'
  })
  declare description?: string;

  @AllowNull(false)
  @Default(PromotionType.GENERAL)
  @Index
  @Validate({
    isIn: {
      args: [Object.values(PromotionType)],
      msg: 'Tipo de promoción inválido'
    }
  })
  @Column({
    type: DataType.ENUM(...Object.values(PromotionType)),
    comment: 'Tipo de promoción'
  })
  declare type: PromotionType;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Estado de la promoción'
  })
  declare isActive: boolean;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de inicio de la promoción'
  })
  declare startDate?: Date;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de fin debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de fin de la promoción'
  })
  declare endDate?: Date;

  @Column({
    type: DataType.JSON,
    comment: 'IDs de eventos específicos (si type=EVENT_SPECIFIC)'
  })
  declare eventIds?: number[];

  @Column({
    type: DataType.JSON,
    comment: 'IDs de categorías permitidas (si type=CATEGORY_SPECIFIC)'
  })
  declare categoryIds?: number[];

  @Validate({
    min: {
      args: [0],
      msg: 'El monto mínimo no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto mínimo de compra requerido'
  })
  declare minPurchaseAmount?: number;

  @Column({
    type: DataType.JSON,
    comment: 'Tipos de usuario permitidos (individual, empresa, member)'
  })
  declare userTypes?: string[];

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si puede combinarse con otras promociones'
  })
  declare isStackable: boolean;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La prioridad debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Prioridad para resolución de conflictos (mayor = más prioritario)'
  })
  declare priority: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la promoción'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó la promoción'
  })
  declare updatedBy?: number;

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

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater?: User;

  @HasMany(() => require('./PromoCode').PromoCode)
  declare promoCodes: any[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la promoción está activa y dentro de fechas válidas
   */
  public get isCurrentlyActive(): boolean {
    if (!this.isActive) return false;

    const now = new Date();

    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;

    return true;
  }

  /**
   * Verifica si la promoción aplica a un evento específico
   */
  public appliesToEvent(eventId: number): boolean {
    if (this.type === PromotionType.GENERAL) return true;
    if (this.type === PromotionType.EVENT_SPECIFIC) {
      return this.eventIds?.includes(eventId) ?? false;
    }
    return false;
  }

  /**
   * Verifica si la promoción aplica a una categoría específica
   */
  public appliesToCategory(categoryId: number): boolean {
    if (this.type === PromotionType.GENERAL) return true;
    if (this.type === PromotionType.CATEGORY_SPECIFIC) {
      return this.categoryIds?.includes(categoryId) ?? false;
    }
    return false;
  }

  /**
   * Verifica si la promoción aplica a un tipo de usuario
   */
  public appliesToUserType(userType: string): boolean {
    if (!this.userTypes || this.userTypes.length === 0) return true;
    return this.userTypes.includes(userType);
  }

  /**
   * Serializa la promoción para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      isActive: this.isActive,
      startDate: this.startDate,
      endDate: this.endDate,
      minPurchaseAmount: this.minPurchaseAmount,
      isStackable: this.isStackable,
      priority: this.priority,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la promoción para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      eventIds: this.eventIds,
      categoryIds: this.categoryIds,
      userTypes: this.userTypes,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt
    };
  }
}