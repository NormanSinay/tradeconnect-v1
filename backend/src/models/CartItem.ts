/**
 * @fileoverview Modelo de CartItem para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad CartItem con validaciones y métodos
 *
 * Archivo: backend/src/models/CartItem.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Cart } from './Cart';
import { Event } from './Event';

/**
 * Tipos de participante para items del carrito
 */
export type CartParticipantType = 'individual' | 'empresa';

/**
 * Atributos del modelo CartItem
 */
export interface CartItemAttributes {
  id?: number;
  cartId: number;
  eventId: number;
  participantType: CartParticipantType;
  quantity: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  isGroupRegistration: boolean;
  groupData?: object;
  participantData?: object;
  customFields?: object;
  addedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de cart item
 */
export interface CartItemCreationAttributes extends Omit<CartItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - cartId
 *         - eventId
 *         - participantType
 *         - quantity
 *         - basePrice
 *         - discountAmount
 *         - finalPrice
 *         - isGroupRegistration
 *         - addedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del item del carrito
 *           example: 1
 *         cartId:
 *           type: integer
 *           description: ID del carrito
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *         participantType:
 *           type: string
 *           enum: [individual, empresa]
 *           description: Tipo de participante
 *         quantity:
 *           type: integer
 *           description: Cantidad de participantes
 *           minimum: 1
 *           maximum: 50
 */

@Table({
  tableName: 'cart_items',
  modelName: 'CartItem',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['cart_id']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['participant_type']
    },
    {
      fields: ['added_at']
    }
  ]
})
export class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Cart)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del carrito'
  })
  declare cartId: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del evento'
  })
  declare eventId: number;

  @AllowNull(false)
  @Default('individual')
  @Validate({
    isIn: {
      args: [['individual', 'empresa']],
      msg: 'El tipo de participante debe ser individual o empresa'
    }
  })
  @Column({
    type: DataType.ENUM('individual', 'empresa'),
    comment: 'Tipo de participante'
  })
  declare participantType: CartParticipantType;

  @AllowNull(false)
  @Default(1)
  @Validate({
    min: {
      args: [1],
      msg: 'La cantidad debe ser al menos 1'
    },
    max: {
      args: [50],
      msg: 'La cantidad no puede exceder 50'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Cantidad de participantes'
  })
  declare quantity: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El precio base no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio base por participante'
  })
  declare basePrice: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El descuento no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto de descuento aplicado'
  })
  declare discountAmount: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El precio final no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio final por participante'
  })
  declare finalPrice: number;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es parte de una inscripción grupal'
  })
  declare isGroupRegistration: boolean;

  @Column({
    type: DataType.JSON,
    comment: 'Datos del grupo si es inscripción grupal'
  })
  declare groupData?: object;

  @Column({
    type: DataType.JSON,
    comment: 'Datos de los participantes individuales'
  })
  declare participantData?: object;

  @Column({
    type: DataType.JSON,
    comment: 'Campos personalizados del evento'
  })
  declare customFields?: object;

  @AllowNull(false)
  @Default(() => new Date())
  @Column({
    type: DataType.DATE,
    comment: 'Fecha en que se agregó al carrito'
  })
  declare addedAt: Date;

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

  @BelongsTo(() => Cart, 'cartId')
  declare cart: Cart;

  @BelongsTo(() => Event, 'eventId')
  declare event: Event;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateEventAvailability(instance: CartItem): Promise<void> {
    // Aquí se podría agregar validación de disponibilidad del evento
    // Por ahora, solo validamos que el evento existe
    const EventModel = require('./Event').Event;
    const event = await EventModel.findByPk(instance.eventId);
    if (!event) {
      throw new Error('El evento especificado no existe');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Calcula el precio final del item
   */
  public calculateFinalPrice(): number {
    return Math.max(0, this.basePrice - this.discountAmount);
  }

  /**
   * Calcula el total del item (precio final × cantidad)
   */
  public get total(): number {
    return this.finalPrice * this.quantity;
  }

  /**
   * Verifica si el item es válido
   */
  public async isValid(): Promise<boolean> {
    try {
      const EventModel = require('./Event').Event;
      const event = await EventModel.findByPk(this.eventId);
      return !!event;
    } catch {
      return false;
    }
  }

  /**
   * Serializa el item del carrito para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      cartId: this.cartId,
      eventId: this.eventId,
      participantType: this.participantType,
      quantity: this.quantity,
      basePrice: this.basePrice,
      discountAmount: this.discountAmount,
      finalPrice: this.finalPrice,
      total: this.total,
      isGroupRegistration: this.isGroupRegistration,
      customFields: this.customFields,
      addedAt: this.addedAt
    };
  }

  /**
   * Serializa el item del carrito para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      groupData: this.groupData,
      participantData: this.participantData
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca items de un carrito
   */
  static async findByCart(cartId: number): Promise<CartItem[]> {
    return this.findAll({
      where: { cartId },
      include: [
        {
          model: require('./Event').Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate', 'status']
        }
      ],
      order: [['addedAt', 'ASC']]
    });
  }

  /**
   * Busca items por evento
   */
  static async findByEvent(eventId: number): Promise<CartItem[]> {
    return this.findAll({
      where: { eventId },
      include: [
        {
          model: Cart,
          as: 'cart',
          attributes: ['id', 'sessionId', 'userId']
        }
      ]
    });
  }

  /**
   * Elimina items expirados de carritos expirados
   */
  static async cleanupExpiredItems(): Promise<number> {
    const CartModel = require('./Cart').Cart;
    const expiredCarts = await CartModel.findExpiredCarts();
    const cartIds = expiredCarts.map((cart: any) => cart.id);

    if (cartIds.length === 0) return 0;

    const result = await this.destroy({
      where: {
        cartId: {
          [Op.in]: cartIds
        }
      }
    });

    return result;
  }
}