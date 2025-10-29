/**
 * @fileoverview Modelo de Descuento Early Bird para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Descuento Early Bird
 *
 * Archivo: backend/src/models/EarlyBirdDiscount.ts
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
import { User } from './User';
import { Event } from './Event';

/**
 * Atributos del modelo Descuento Early Bird
 */
export interface EarlyBirdDiscountAttributes {
  id?: number;
  eventId: number;
  daysBeforeEvent: number;
  discountPercentage: number;
  description?: string;
  isActive: boolean;
  priority: number;
  autoApply: boolean;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de descuento early bird
 */
export interface EarlyBirdDiscountCreationAttributes extends Omit<EarlyBirdDiscountAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EarlyBirdDiscount:
 *       type: object
 *       required:
 *         - eventId
 *         - daysBeforeEvent
 *         - discountPercentage
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del descuento early bird
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: Evento al que aplica el descuento early bird
 *         daysBeforeEvent:
 *           type: integer
 *           description: Días antes del evento para aplicar el descuento
 *           example: 30
 *         discountPercentage:
 *           type: number
 *           description: Porcentaje de descuento (0-100)
 *           example: 15.00
 *         description:
 *           type: string
 *           description: Descripción del descuento early bird
 *           example: "Descuento del 15% para inscripciones con 30 días de anticipación"
 *         isActive:
 *           type: boolean
 *           description: Estado del descuento early bird
 *           default: true
 *         priority:
 *           type: integer
 *           description: Prioridad si hay múltiples niveles aplicables
 *           default: 0
 *         autoApply:
 *           type: boolean
 *           description: Si se aplica automáticamente en el checkout
 *           default: true
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 */

@Table({
  tableName: 'early_bird_discounts',
  modelName: 'EarlyBirdDiscount',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['days_before_event']
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
      fields: ['event_id', 'is_active', 'days_before_event']
    }
  ]
})
export class EarlyBirdDiscount extends Model<EarlyBirdDiscountAttributes, EarlyBirdDiscountCreationAttributes> implements EarlyBirdDiscountAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Evento al que aplica el descuento early bird'
  })
  declare eventId: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'Los días antes del evento deben ser mayor o igual a 1'
    },
    max: {
      args: [365],
      msg: 'Los días antes del evento no pueden exceder 365'
    }
  })
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Días antes del evento para aplicar el descuento'
  })
  declare daysBeforeEvent: number;

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
    comment: 'Descripción del descuento early bird'
  })
  declare description?: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Estado del descuento early bird'
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

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se aplica automáticamente en el checkout'
  })
  declare autoApply: boolean;

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
   * Verifica si el descuento early bird está disponible para una fecha específica
   */
  public isAvailableForDate(registrationDate: Date, eventStartDate: Date): boolean {
    if (!this.isActive) return false;

    const daysDifference = Math.ceil((eventStartDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference >= this.daysBeforeEvent;
  }

  /**
   * Calcula el descuento para un precio base
   */
  public calculateDiscount(basePrice: number): number {
    return (basePrice * this.discountPercentage) / 100;
  }

  /**
   * Obtiene el precio final después del descuento
   */
  public getDiscountedPrice(basePrice: number): number {
    return Math.max(0, basePrice - this.calculateDiscount(basePrice));
  }

  /**
   * Verifica si este descuento tiene mayor prioridad que otro
   */
  public hasHigherPriority(other: EarlyBirdDiscount): boolean {
    return this.priority > other.priority;
  }

  /**
   * Serializa el descuento early bird para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      daysBeforeEvent: this.daysBeforeEvent,
      discountPercentage: this.discountPercentage,
      description: this.description,
      isActive: this.isActive,
      priority: this.priority,
      autoApply: this.autoApply,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el descuento early bird para respuestas completas
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
   * Busca el descuento early bird aplicable para un evento y fecha específicos
   */
  static async findApplicableDiscount(eventId: number, registrationDate: Date, eventStartDate: Date): Promise<EarlyBirdDiscount | null> {
    const applicableDiscounts = await this.findAll({
      where: {
        eventId: eventId,
        isActive: true
      },
      order: [['priority', 'DESC'], ['daysBeforeEvent', 'ASC']]
    });

    // Encuentra el descuento con mayor prioridad que esté disponible
    for (const discount of applicableDiscounts) {
      if (discount.isAvailableForDate(registrationDate, eventStartDate)) {
        return discount;
      }
    }

    return null;
  }

  /**
   * Obtiene todos los descuentos early bird de un evento ordenados por prioridad
   */
  static async findByEvent(eventId: number): Promise<EarlyBirdDiscount[]> {
    return this.findAll({
      where: {
        eventId: eventId,
        isActive: true
      },
      order: [['priority', 'DESC'], ['daysBeforeEvent', 'ASC']]
    });
  }
}
