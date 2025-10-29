/**
 * @fileoverview Modelo de Descuento por Volumen para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Descuento por Volumen
 *
 * Archivo: backend/src/models/VolumeDiscount.ts
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
  BelongsTo
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from './User';
import { Event } from './Event';

/**
 * Atributos del modelo Descuento por Volumen
 */
export interface VolumeDiscountAttributes {
  id?: number;
  eventId: number;
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
  description?: string;
  isActive: boolean;
  priority: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de descuento por volumen
 */
export interface VolumeDiscountCreationAttributes extends Omit<VolumeDiscountAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     VolumeDiscount:
 *       type: object
 *       required:
 *         - eventId
 *         - minQuantity
 *         - discountPercentage
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del descuento por volumen
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: Evento al que aplica el descuento por volumen
 *         minQuantity:
 *           type: integer
 *           description: Cantidad mínima para aplicar el descuento
 *           example: 5
 *         maxQuantity:
 *           type: integer
 *           description: Cantidad máxima para este nivel (null = sin límite superior)
 *           example: 10
 *         discountPercentage:
 *           type: number
 *           description: Porcentaje de descuento (0-100)
 *           example: 10.00
 *         description:
 *           type: string
 *           description: Descripción del nivel de descuento
 *           example: "Descuento del 10% para grupos de 5-10 personas"
 *         isActive:
 *           type: boolean
 *           description: Estado del descuento por volumen
 *           default: true
 *         priority:
 *           type: integer
 *           description: Prioridad si hay múltiples niveles aplicables
 *           default: 0
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 */

@Table({
  tableName: 'volume_discounts',
  modelName: 'VolumeDiscount',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['min_quantity']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['event_id', 'is_active', 'min_quantity']
    }
  ]
})
export class VolumeDiscount extends Model<VolumeDiscountAttributes, VolumeDiscountCreationAttributes> implements VolumeDiscountAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Evento al que aplica el descuento por volumen'
  })
  declare eventId: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'La cantidad mínima debe ser mayor o igual a 1'
    }
  })
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Cantidad mínima para aplicar el descuento'
  })
  declare minQuantity: number;

  @Validate({
    min: {
      args: [1],
      msg: 'La cantidad máxima debe ser mayor o igual a 1'
    },
    custom: function(value: number) {
      if (value && value < (this as any).minQuantity) {
        throw new Error('La cantidad máxima debe ser mayor o igual a la cantidad mínima');
      }
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Cantidad máxima para este nivel (null = sin límite superior)'
  })
  declare maxQuantity?: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El porcentaje de descuento debe ser mayor o igual a 0'
    },
    max: {
      args: [100],
      msg: 'El porcentaje de descuento no puede exceder 100'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 2),
    comment: 'Porcentaje de descuento (0-100)'
  })
  declare discountPercentage: number;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'La descripción no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Descripción del nivel de descuento'
  })
  declare description?: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Estado del descuento por volumen'
  })
  declare isActive: boolean;

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
    comment: 'Prioridad si hay múltiples niveles aplicables'
  })
  declare priority: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el descuento'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el descuento'
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

  @BelongsTo(() => Event)
  declare event: Event;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater?: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el descuento aplica a una cantidad específica
   */
  public appliesToQuantity(quantity: number): boolean {
    return quantity >= this.minQuantity &&
           (this.maxQuantity === null || this.maxQuantity === undefined || quantity <= this.maxQuantity);
  }

  /**
   * Calcula el descuento para una cantidad específica
   */
  public calculateDiscount(basePrice: number, quantity: number): number {
    if (!this.appliesToQuantity(quantity)) return 0;

    const totalBase = basePrice * quantity;
    return (totalBase * this.discountPercentage) / 100;
  }

  /**
   * Obtiene el precio final por unidad después del descuento
   */
  public getDiscountedPricePerUnit(basePrice: number, quantity: number): number {
    if (!this.appliesToQuantity(quantity)) return basePrice;

    const discountAmount = this.calculateDiscount(basePrice, quantity);
    const totalAfterDiscount = (basePrice * quantity) - discountAmount;
    return totalAfterDiscount / quantity;
  }

  /**
   * Serializa el descuento por volumen para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      minQuantity: this.minQuantity,
      maxQuantity: this.maxQuantity,
      discountPercentage: this.discountPercentage,
      description: this.description,
      isActive: this.isActive,
      priority: this.priority,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el descuento por volumen para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca el descuento por volumen aplicable para un evento y cantidad específicos
   */
  static async findApplicableDiscount(eventId: number, quantity: number): Promise<VolumeDiscount | null> {
    const applicableDiscounts = await this.findAll({
      where: {
        eventId: eventId,
        isActive: true,
        minQuantity: { [Op.lte]: quantity }
      },
      order: [['priority', 'DESC'], ['minQuantity', 'DESC']]
    });

    // Encuentra el descuento con mayor prioridad que aplique a la cantidad
    for (const discount of applicableDiscounts) {
      if (discount.appliesToQuantity(quantity)) {
        return discount;
      }
    }

    return null;
  }

  /**
   * Obtiene todos los descuentos por volumen de un evento ordenados por prioridad
   */
  static async findByEvent(eventId: number): Promise<VolumeDiscount[]> {
    return this.findAll({
      where: {
        eventId: eventId,
        isActive: true
      },
      order: [['priority', 'DESC'], ['minQuantity', 'ASC']]
    });
  }
}
