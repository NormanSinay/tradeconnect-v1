/**
 * @fileoverview Modelo de Cart para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Cart con validaciones y métodos
 *
 * Archivo: backend/src/models/Cart.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey,
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from './User';
import { CartItem } from './CartItem';
import { CartSession } from './CartSession';

/**
 * Atributos del modelo Cart
 */
export interface CartAttributes {
  id?: number;
  sessionId: string;
  userId?: number;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCode?: string;
  promoDiscount: number;
  expiresAt: Date;
  lastActivity: Date;
  isAbandoned: boolean;
  abandonedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de cart
 */
export interface CartCreationAttributes extends Omit<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - sessionId
 *         - totalItems
 *         - subtotal
 *         - discountAmount
 *         - total
 *         - promoDiscount
 *         - expiresAt
 *         - lastActivity
 *         - isAbandoned
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del carrito
 *           example: 1
 *         sessionId:
 *           type: string
 *           description: ID único de sesión del carrito
 *           example: "sess_1234567890"
 *         userId:
 *           type: integer
 *           description: ID del usuario (opcional para usuarios no registrados)
 *         totalItems:
 *           type: integer
 *           description: Cantidad total de items
 *         subtotal:
 *           type: number
 *           description: Subtotal antes de descuentos
 *         total:
 *           type: number
 *           description: Total final después de descuentos
 */

@Table({
  tableName: 'carts',
  modelName: 'Cart',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['session_id'],
      unique: true
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['is_abandoned']
    },
    {
      fields: ['last_activity']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El ID de sesión es requerido'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID único de sesión del carrito',
    unique: true
  })
  declare sessionId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario (opcional para usuarios no registrados)'
  })
  declare userId?: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El total de items no puede ser negativo'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Cantidad total de items en el carrito'
  })
  declare totalItems: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El subtotal no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Subtotal antes de descuentos'
  })
  declare subtotal: number;

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
    comment: 'Monto total de descuentos aplicados'
  })
  declare discountAmount: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El total no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Total final después de descuentos'
  })
  declare total: number;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El código promocional no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Código promocional aplicado'
  })
  declare promoCode?: string;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El descuento promocional no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Descuento aplicado por código promocional'
  })
  declare promoDiscount: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del carrito (24 horas)'
  })
  declare expiresAt: Date;

  @AllowNull(false)
  @Index
  @Default(() => new Date())
  @Column({
    type: DataType.DATE,
    comment: 'Última actividad en el carrito'
  })
  declare lastActivity: Date;

  @AllowNull(false)
  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el carrito fue abandonado'
  })
  declare isAbandoned: boolean;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha en que el carrito fue marcado como abandonado'
  })
  declare abandonedAt?: Date;

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

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @HasMany(() => CartItem, 'cartId')
  declare items: CartItem[];

  @HasMany(() => CartSession, 'sessionId')
  declare sessions: CartSession[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateUniqueSessionId(instance: Cart): Promise<void> {
    if (instance.sessionId) {
      const existing = await Cart.findOne({
        where: {
          sessionId: instance.sessionId,
          id: { [Op.ne]: instance.id || 0 }
        }
      });
      if (existing) {
        throw new Error('Ya existe un carrito con este ID de sesión');
      }
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el carrito está expirado
   */
  public get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si el carrito está inactivo por mucho tiempo
   */
  public get isInactive(): boolean {
    const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 horas
    return (new Date().getTime() - this.lastActivity.getTime()) > inactiveThreshold;
  }

  /**
   * Calcula el total del carrito
   */
  public async calculateTotal(): Promise<void> {
    const items = await CartItem.findAll({
      where: { cartId: this.id }
    });

    this.totalItems = items.length;
    this.subtotal = items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    this.total = Math.max(0, this.subtotal - this.discountAmount - this.promoDiscount);
  }

  /**
   * Actualiza la última actividad
   */
  public updateActivity(): void {
    this.lastActivity = new Date();
  }

  /**
   * Marca el carrito como abandonado
   */
  public markAsAbandoned(): void {
    this.isAbandoned = true;
    this.abandonedAt = new Date();
  }

  /**
   * Serializa el carrito para respuestas públicas
   */
  public async toPublicJSON(): Promise<any> {
    const items = await CartItem.findAll({
      where: { cartId: this.id },
      include: [
        {
          model: require('./Event').Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate']
        }
      ]
    });

    return {
      id: this.id,
      sessionId: this.sessionId,
      userId: this.userId,
      totalItems: this.totalItems,
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      total: this.total,
      promoCode: this.promoCode,
      promoDiscount: this.promoDiscount,
      expiresAt: this.expiresAt,
      lastActivity: this.lastActivity,
      isAbandoned: this.isAbandoned,
      items: items.map(item => item.toPublicJSON()),
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un ID único de sesión para el carrito
   */
  static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `cart_${timestamp}_${random}`;
  }

  /**
   * Busca o crea un carrito por sesión
   */
  static async findOrCreateBySession(sessionId: string, userId?: number): Promise<Cart> {
    let cart = await this.findOne({
      where: { sessionId }
    });

    if (!cart) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      cart = await this.create({
        sessionId,
        userId,
        totalItems: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        promoDiscount: 0,
        expiresAt,
        lastActivity: new Date(),
        isAbandoned: false
      });
    } else {
      // Actualizar userId si no estaba asignado
      if (!cart.userId && userId) {
        cart.userId = userId;
        await cart.save();
      }
      // Actualizar actividad
      cart.updateActivity();
      await cart.save();
    }

    return cart;
  }

  /**
   * Encuentra carritos expirados para limpiar
   */
  static async findExpiredCarts(): Promise<Cart[]> {
    return this.findAll({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
  }

  /**
   * Encuentra carritos abandonados para recuperación
   */
  static async findAbandonedCarts(hoursInactive: number = 24): Promise<Cart[]> {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - hoursInactive);

    return this.findAll({
      where: {
        isAbandoned: false,
        lastActivity: {
          [Op.lt]: threshold
        },
        totalItems: {
          [Op.gt]: 0
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'firstName', 'lastName']
        }
      ]
    });
  }

  /**
   * Limpia carritos expirados
   */
  static async cleanupExpiredCarts(): Promise<number> {
    const result = await this.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
    return result;
  }
}