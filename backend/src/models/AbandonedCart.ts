/**
 * @fileoverview Modelo de AbandonedCart para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad AbandonedCart con validaciones y métodos
 *
 * Archivo: backend/src/models/AbandonedCart.ts
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
  ForeignKey,
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Cart } from './Cart';
import { User } from './User';

/**
 * Métodos de recuperación de carritos abandonados
 */
export type RecoveryMethod = 'email' | 'sms' | 'push' | 'manual';

/**
 * Tipos de dispositivo
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/**
 * Atributos del modelo AbandonedCart
 */
export interface AbandonedCartAttributes {
  id?: number;
  cartId: number;
  sessionId: string;
  userId?: number;
  email?: string;
  totalItems: number;
  totalValue: number;
  cartData: object;
  abandonedAt: Date;
  lastActivity: Date;
  recoveryAttempts: number;
  lastRecoveryAttempt?: Date;
  recoveredAt?: Date;
  recoveryMethod?: RecoveryMethod;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: DeviceType;
  browser?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de abandoned cart
 */
export interface AbandonedCartCreationAttributes extends Omit<AbandonedCartAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     AbandonedCart:
 *       type: object
 *       required:
 *         - cartId
 *         - sessionId
 *         - totalItems
 *         - totalValue
 *         - cartData
 *         - abandonedAt
 *         - lastActivity
 *         - recoveryAttempts
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del carrito abandonado
 *           example: 1
 *         cartId:
 *           type: integer
 *           description: ID del carrito original
 *         sessionId:
 *           type: string
 *           description: ID de sesión del carrito
 *         userId:
 *           type: integer
 *           description: ID del usuario (si estaba logueado)
 *         email:
 *           type: string
 *           description: Email para recuperación
 *         totalItems:
 *           type: integer
 *           description: Cantidad total de items
 *         totalValue:
 *           type: number
 *           description: Valor total del carrito
 *         abandonedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha en que se abandonó el carrito
 */

@Table({
  tableName: 'abandoned_carts',
  modelName: 'AbandonedCart',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['cart_id']
    },
    {
      fields: ['session_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['email']
    },
    {
      fields: ['abandoned_at']
    },
    {
      fields: ['recovered_at']
    },
    {
      fields: ['recovery_attempts']
    },
    {
      fields: ['last_recovery_attempt']
    }
  ]
})
export class AbandonedCart extends Model<AbandonedCartAttributes, AbandonedCartCreationAttributes> implements AbandonedCartAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Cart)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del carrito original'
  })
  declare cartId: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
    comment: 'ID de sesión del carrito abandonado'
  })
  declare sessionId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario (opcional si no estaba logueado)'
  })
  declare userId?: number;

  @Validate({
    isEmail: {
      msg: 'El email debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email del usuario para recuperación'
  })
  declare email?: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Cantidad total de items en el carrito abandonado'
  })
  declare totalItems: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El valor total no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Valor total del carrito abandonado'
  })
  declare totalValue: number;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Snapshot completo del carrito abandonado'
  })
  declare cartData: object;

  @AllowNull(false)
  @Default(() => new Date())
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha en que el carrito fue marcado como abandonado'
  })
  declare abandonedAt: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    comment: 'Última actividad antes de abandonar'
  })
  declare lastActivity: Date;

  @AllowNull(false)
  @Default(0)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de intentos de recuperación realizados'
  })
  declare recoveryAttempts: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último intento de recuperación'
  })
  declare lastRecoveryAttempt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha en que se recuperó el carrito (si aplica)'
  })
  declare recoveredAt?: Date;

  @Validate({
    isIn: {
      args: [['email', 'sms', 'push', 'manual']],
      msg: 'El método de recuperación debe ser email, sms, push o manual'
    }
  })
  @Column({
    type: DataType.ENUM('email', 'sms', 'push', 'manual'),
    comment: 'Método utilizado para recuperar el carrito'
  })
  declare recoveryMethod?: RecoveryMethod;

  @Validate({
    isIP: {
      msg: 'La dirección IP debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(45),
    comment: 'Dirección IP del usuario'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User-Agent del navegador'
  })
  declare userAgent?: string;

  @Validate({
    isIn: {
      args: [['desktop', 'mobile', 'tablet', 'unknown']],
      msg: 'El tipo de dispositivo debe ser desktop, mobile, tablet o unknown'
    }
  })
  @Column({
    type: DataType.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
    comment: 'Tipo de dispositivo utilizado'
  })
  declare deviceType?: DeviceType;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El nombre del navegador no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del navegador utilizado'
  })
  declare browser?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'URL de referencia (de dónde vino el usuario)'
  })
  declare referrer?: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'La fuente UTM no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Parámetro UTM source'
  })
  declare utmSource?: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El medio UTM no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Parámetro UTM medium'
  })
  declare utmMedium?: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'La campaña UTM no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Parámetro UTM campaign'
  })
  declare utmCampaign?: string;

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

  @BelongsTo(() => User, 'userId')
  declare user: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  static async validateUniqueCart(instance: AbandonedCart): Promise<void> {
    const existing = await AbandonedCart.findOne({
      where: {
        cartId: instance.cartId
      }
    });
    if (existing) {
      throw new Error('Ya existe un registro de carrito abandonado para este carrito');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el carrito fue recuperado
   */
  public get isRecovered(): boolean {
    return !!this.recoveredAt;
  }

  /**
   * Calcula días desde que fue abandonado
   */
  public get daysSinceAbandoned(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.abandonedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si se puede intentar recuperación
   */
  public canAttemptRecovery(): boolean {
    return !this.isRecovered && this.recoveryAttempts < 3;
  }

  /**
   * Registra un intento de recuperación
   */
  public recordRecoveryAttempt(method: RecoveryMethod): void {
    this.recoveryAttempts += 1;
    this.lastRecoveryAttempt = new Date();
    this.recoveryMethod = method;
  }

  /**
   * Marca el carrito como recuperado
   */
  public markAsRecovered(method: RecoveryMethod): void {
    this.recoveredAt = new Date();
    this.recoveryMethod = method;
  }

  /**
   * Serializa el carrito abandonado para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      cartId: this.cartId,
      sessionId: this.sessionId,
      userId: this.userId,
      email: this.email,
      totalItems: this.totalItems,
      totalValue: this.totalValue,
      abandonedAt: this.abandonedAt,
      lastActivity: this.lastActivity,
      recoveryAttempts: this.recoveryAttempts,
      lastRecoveryAttempt: this.lastRecoveryAttempt,
      recoveredAt: this.recoveredAt,
      recoveryMethod: this.recoveryMethod,
      deviceType: this.deviceType,
      browser: this.browser,
      utmSource: this.utmSource,
      utmMedium: this.utmMedium,
      utmCampaign: this.utmCampaign,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea registro de carrito abandonado desde un carrito existente
   */
  static async createFromCart(cart: Cart, email?: string): Promise<AbandonedCart> {
    const items = await cart.$get('items');
    const totalItems = items?.length || 0;
    const totalValue = cart.total;

    // Extraer datos de sesión si existe
    const session = await cart.$get('sessions').then(sessions => sessions?.[0]);

    return this.create({
      cartId: cart.id,
      sessionId: cart.sessionId,
      userId: cart.userId,
      email: email || session?.user?.email,
      totalItems,
      totalValue,
      cartData: await cart.toPublicJSON(),
      abandonedAt: new Date(),
      lastActivity: cart.lastActivity,
      recoveryAttempts: 0,
      ipAddress: session?.ipAddress,
      userAgent: session?.userAgent,
      deviceType: this.detectDeviceType(session?.userAgent),
      browser: this.extractBrowser(session?.userAgent)
    });
  }

  /**
   * Detecta el tipo de dispositivo desde User-Agent
   */
  static detectDeviceType(userAgent?: string): DeviceType {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
      return 'desktop';
    }
    return 'unknown';
  }

  /**
   * Extrae el nombre del navegador desde User-Agent
   */
  static extractBrowser(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Busca carritos abandonados por email para recuperación
   */
  static async findRecoverableByEmail(email: string): Promise<AbandonedCart[]> {
    return this.findAll({
      where: {
        email,
        recoveryAttempts: {
          [Op.lt]: 3
        },
        abandonedAt: {
          [Op.gt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      },
      order: [['abandonedAt', 'DESC']]
    });
  }

  /**
   * Busca carritos abandonados para envío de recordatorios
   */
  static async findForReminder(hoursSinceAbandoned: number = 24): Promise<AbandonedCart[]> {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - hoursSinceAbandoned);

    return this.findAll({
      where: {
        recoveryAttempts: 0,
        abandonedAt: {
          [Op.lt]: threshold
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['abandonedAt', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas de carritos abandonados
   */
  static async getAbandonmentStats(days: number = 30): Promise<{
    total: number;
    recovered: number;
    recoveryRate: number;
    averageValue: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const carts = await this.findAll({
      where: {
        abandonedAt: {
          [Op.gte]: startDate
        }
      }
    });

    const total = carts.length;
    const recovered = carts.filter(cart => cart.isRecovered).length;
    const recoveryRate = total > 0 ? (recovered / total) * 100 : 0;
    const averageValue = total > 0
      ? carts.reduce((sum, cart) => sum + cart.totalValue, 0) / total
      : 0;

    return {
      total,
      recovered,
      recoveryRate: Math.round(recoveryRate * 100) / 100,
      averageValue: Math.round(averageValue * 100) / 100
    };
  }
}
