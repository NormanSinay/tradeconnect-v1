/**
 * @fileoverview Modelo de Uso de Cupón Avanzado para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Uso de Cupón Avanzado
 *
 * Archivo: backend/src/models/AdvancedCouponUsage.ts
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
  ForeignKey,
  Index,
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { AdvancedCoupon } from './AdvancedCoupon';

/**
 * Estados de uso del cupón
 */
export enum CouponUsageStatus {
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Atributos del modelo Uso de Cupón Avanzado
 */
export interface AdvancedCouponUsageAttributes {
  id?: number;
  advancedCouponId: number;
  userId: number;
  orderId?: string;
  status: CouponUsageStatus;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  context?: Record<string, any>;
  appliedAt: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de uso de cupón avanzado
 */
export interface AdvancedCouponUsageCreationAttributes extends Omit<AdvancedCouponUsageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     AdvancedCouponUsage:
 *       type: object
 *       required:
 *         - advancedCouponId
 *         - userId
 *         - status
 *         - discountAmount
 *         - originalAmount
 *         - finalAmount
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del uso del cupón
 *           example: 1
 *         advancedCouponId:
 *           type: integer
 *           description: ID del cupón avanzado usado
 *         userId:
 *           type: integer
 *           description: ID del usuario que usó el cupón
 *         orderId:
 *           type: string
 *           description: ID de la orden donde se aplicó el cupón
 *         status:
 *           type: string
 *           enum: [APPLIED, CANCELLED, REFUNDED]
 *           description: Estado del uso del cupón
 *           default: APPLIED
 *         discountAmount:
 *           type: number
 *           description: Monto del descuento aplicado
 *           example: 50.00
 *         originalAmount:
 *           type: number
 *           description: Monto original antes del descuento
 *           example: 200.00
 *         finalAmount:
 *           type: number
 *           description: Monto final después del descuento
 *           example: 150.00
 *         context:
 *           type: object
 *           description: Contexto adicional del uso del cupón
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se aplicó el cupón
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se canceló el uso
 *         refundedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se reembolsó el descuento
 *         notes:
 *           type: string
 *           description: Notas adicionales sobre el uso
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
  tableName: 'advanced_coupon_usages',
  modelName: 'AdvancedCouponUsage',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['advanced_coupon_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['applied_at']
    },
    {
      fields: ['advanced_coupon_id', 'user_id']
    },
    {
      fields: ['advanced_coupon_id', 'status']
    }
  ]
})
export class AdvancedCouponUsage extends Model<AdvancedCouponUsageAttributes, AdvancedCouponUsageCreationAttributes> implements AdvancedCouponUsageAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => AdvancedCoupon)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del cupón avanzado usado'
  })
  declare advancedCouponId: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que usó el cupón'
  })
  declare userId: number;

  @Index
  @Column({
    type: DataType.STRING(255),
    comment: 'ID de la orden donde se aplicó el cupón'
  })
  declare orderId?: string;

  @AllowNull(false)
  @Default(CouponUsageStatus.APPLIED)
  @Index
  @Validate({
    isIn: {
      args: [Object.values(CouponUsageStatus)],
      msg: 'Estado de uso inválido'
    }
  })
  @Column({
    type: DataType.ENUM(...Object.values(CouponUsageStatus)),
    comment: 'Estado del uso del cupón'
  })
  declare status: CouponUsageStatus;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto del descuento debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto del descuento aplicado'
  })
  declare discountAmount: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto original debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto original antes del descuento'
  })
  declare originalAmount: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto final debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto final después del descuento'
  })
  declare finalAmount: number;

  @Column({
    type: DataType.JSON,
    comment: 'Contexto adicional del uso del cupón'
  })
  declare context?: Record<string, any>;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se aplicó el cupón'
  })
  declare appliedAt: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se canceló el uso'
  })
  declare cancelledAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se reembolsó el descuento'
  })
  declare refundedAt?: Date;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Las notas no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales sobre el uso'
  })
  declare notes?: string;

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

  @BelongsTo(() => AdvancedCoupon, { foreignKey: 'advancedCouponId', as: 'usageAdvancedCoupon' })
  declare advancedCoupon: AdvancedCoupon;

  @BelongsTo(() => User)
  declare user: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el uso está activo
   */
  public get isActive(): boolean {
    return this.status === CouponUsageStatus.APPLIED;
  }

  /**
   * Verifica si el uso fue cancelado
   */
  public get isCancelled(): boolean {
    return this.status === CouponUsageStatus.CANCELLED;
  }

  /**
   * Verifica si el uso fue reembolsado
   */
  public get isRefunded(): boolean {
    return this.status === CouponUsageStatus.REFUNDED;
  }

  /**
   * Cancela el uso del cupón
   */
  public async cancel(reason?: string): Promise<void> {
    this.status = CouponUsageStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (reason) {
      this.notes = (this.notes ? this.notes + '\n' : '') + `Cancelado: ${reason}`;
    }
    await this.save();
  }

  /**
   * Marca el uso como reembolsado
   */
  public async refund(reason?: string): Promise<void> {
    this.status = CouponUsageStatus.REFUNDED;
    this.refundedAt = new Date();
    if (reason) {
      this.notes = (this.notes ? this.notes + '\n' : '') + `Reembolsado: ${reason}`;
    }
    await this.save();
  }

  /**
   * Serializa el uso del cupón para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      advancedCouponId: this.advancedCouponId,
      userId: this.userId,
      orderId: this.orderId,
      status: this.status,
      discountAmount: this.discountAmount,
      originalAmount: this.originalAmount,
      finalAmount: this.finalAmount,
      appliedAt: this.appliedAt,
      cancelledAt: this.cancelledAt,
      refundedAt: this.refundedAt,
      notes: this.notes,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el uso del cupón para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      context: this.context,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Registra un nuevo uso de cupón
   */
  static async recordUsage(data: {
    advancedCouponId: number;
    userId: number;
    orderId?: string;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
    context?: Record<string, any>;
    notes?: string;
  }): Promise<AdvancedCouponUsage> {
    return this.create({
      ...data,
      status: CouponUsageStatus.APPLIED,
      appliedAt: new Date()
    });
  }

  /**
   * Busca usos de cupón por usuario
   */
  static async findByUser(userId: number, limit: number = 50): Promise<AdvancedCouponUsage[]> {
    return this.findAll({
      where: { userId },
      include: [
        {
          model: AdvancedCoupon,
          as: 'advancedCoupon',
          attributes: ['id', 'code', 'name', 'status']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit
    });
  }

  /**
   * Busca usos de cupón por cupón específico
   */
  static async findByCoupon(advancedCouponId: number, limit: number = 100): Promise<AdvancedCouponUsage[]> {
    return this.findAll({
      where: { advancedCouponId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit
    });
  }

  /**
   * Obtiene estadísticas de uso de cupones
   */
  static async getUsageStats(couponId?: number): Promise<{
    totalUsages: number;
    activeUsages: number;
    cancelledUsages: number;
    refundedUsages: number;
    totalDiscountAmount: number;
  }> {
    const whereClause = couponId ? { advancedCouponId: couponId } : {};

    const [totalUsages, activeUsages, cancelledUsages, refundedUsages, totalDiscountResult] = await Promise.all([
      this.count({ where: whereClause }),
      this.count({ where: { ...whereClause, status: CouponUsageStatus.APPLIED } }),
      this.count({ where: { ...whereClause, status: CouponUsageStatus.CANCELLED } }),
      this.count({ where: { ...whereClause, status: CouponUsageStatus.REFUNDED } }),
      this.sum('discountAmount', { where: whereClause })
    ]);

    return {
      totalUsages,
      activeUsages,
      cancelledUsages,
      refundedUsages,
      totalDiscountAmount: totalDiscountResult || 0
    };
  }

  /**
   * Verifica si un usuario ya usó un cupón específico
   */
  static async hasUserUsedCoupon(userId: number, advancedCouponId: number): Promise<boolean> {
    const usage = await this.findOne({
      where: {
        userId,
        advancedCouponId,
        status: CouponUsageStatus.APPLIED
      }
    });

    return !!usage;
  }
}