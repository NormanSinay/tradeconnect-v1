/**
 * @fileoverview Modelo de Pago para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Pago con validaciones y métodos
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  Unique
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { PaymentStatus, PaymentGateway, PaymentType } from '../utils/constants';
import { Registration } from './Registration';
import { Refund } from './Refund';

/**
 * Atributos del modelo Pago
 */
export interface PaymentAttributes {
  id?: number;
  transactionId: string;
  registrationId: number;
  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  description?: string;
  billingInfo: any; // JSON con información de facturación
  paymentMethod?: any; // JSON con información del método de pago
  gatewayResponse?: any; // JSON con respuesta de la pasarela
  metadata?: any; // JSON con metadatos adicionales
  retryCount: number;
  lastRetryAt?: Date;
  confirmedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de pago
 */
export interface PaymentCreationAttributes extends Omit<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - transactionId
 *         - registrationId
 *         - gateway
 *         - status
 *         - paymentType
 *         - amount
 *         - currency
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pago
 *           example: 1
 *         transactionId:
 *           type: string
 *           description: ID único de transacción
 *           example: "txn_123456789"
 *         registrationId:
 *           type: integer
 *           description: ID de la inscripción asociada
 *           example: 1
 *         gateway:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *           description: Pasarela de pago utilizada
 *           example: "stripe"
 *         gatewayTransactionId:
 *           type: string
 *           description: ID de transacción en la pasarela
 *           example: "pi_123456789"
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded, disputed, expired]
 *           description: Estado del pago
 *           example: "completed"
 *         paymentType:
 *           type: string
 *           enum: [one_time, recurring, installment, deposit]
 *           description: Tipo de pago
 *           example: "one_time"
 *         amount:
 *           type: number
 *           description: Monto del pago
 *           example: 100.00
 *         currency:
 *           type: string
 *           description: Moneda del pago
 *           example: "GTQ"
 *         fee:
 *           type: number
 *           description: Comisión de la pasarela
 *           example: 3.50
 *         netAmount:
 *           type: number
 *           description: Monto neto después de comisiones
 *           example: 96.50
 *         description:
 *           type: string
 *           description: Descripción del pago
 *           example: "Inscripción al evento Tech Conference 2024"
 *         billingInfo:
 *           type: object
 *           description: Información de facturación
 *         paymentMethod:
 *           type: object
 *           description: Información del método de pago
 *         gatewayResponse:
 *           type: object
 *           description: Respuesta completa de la pasarela
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos
 *           example: 0
 *         lastRetryAt:
 *           type: string
 *           format: date-time
 *           description: Último reintento
 *         confirmedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de confirmación
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del pago
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
  tableName: 'payments',
  modelName: 'Payment',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['transaction_id'],
      where: { deleted_at: null }
    },
    {
      unique: true,
      fields: ['gateway', 'gateway_transaction_id'],
      where: {
        gateway_transaction_id: { [Op.ne]: null },
        deleted_at: null
      }
    },
    {
      fields: ['registration_id']
    },
    {
      fields: ['gateway']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_type']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['confirmed_at']
    },
    {
      fields: ['expires_at']
    }
  ]
})
export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El ID de transacción es requerido'
    },
    len: {
      args: [10, 100],
      msg: 'El ID de transacción debe tener entre 10 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID único de transacción generado internamente'
  })
  declare transactionId: string;

  @ForeignKey(() => Registration)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la inscripción asociada al pago'
  })
  declare registrationId: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['paypal', 'stripe', 'neonet', 'bam']],
      msg: 'La pasarela debe ser paypal, stripe, neonet o bam'
    }
  })
  @Column({
    type: DataType.ENUM('paypal', 'stripe', 'neonet', 'bam'),
    comment: 'Pasarela de pago utilizada'
  })
  declare gateway: PaymentGateway;

  @Index
  @Validate({
    len: {
      args: [0, 255],
      msg: 'El ID de transacción de la pasarela no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'ID de transacción en la pasarela externa'
  })
  declare gatewayTransactionId?: string;

  @AllowNull(false)
  @Default('pending')
  @Index
  @Validate({
    isIn: {
      args: [['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed', 'expired']],
      msg: 'Estado de pago inválido'
    }
  })
  @Column({
    type: DataType.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed', 'expired'),
    comment: 'Estado actual del pago'
  })
  declare status: PaymentStatus;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['one_time', 'recurring', 'installment', 'deposit']],
      msg: 'Tipo de pago inválido'
    }
  })
  @Column({
    type: DataType.ENUM('one_time', 'recurring', 'installment', 'deposit'),
    comment: 'Tipo de pago (único, recurrente, cuotas, depósito)'
  })
  declare paymentType: PaymentType;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0.01],
      msg: 'El monto debe ser mayor a 0'
    },
    max: {
      args: [50000],
      msg: 'El monto no puede exceder Q50,000'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto del pago en la moneda especificada'
  })
  declare amount: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['GTQ', 'USD']],
      msg: 'La moneda debe ser GTQ o USD'
    }
  })
  @Column({
    type: DataType.ENUM('GTQ', 'USD'),
    comment: 'Moneda del pago'
  })
  declare currency: string;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'La comisión no puede ser negativa'
    }
  })
  @Column({
    type: DataType.DECIMAL(8, 2),
    comment: 'Comisión cobrada por la pasarela'
  })
  declare fee: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto neto no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto neto después de deducir comisiones'
  })
  declare netAmount: number;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'Descripción del pago'
  })
  declare description?: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSONB,
    comment: 'Información de facturación en formato JSON'
  })
  declare billingInfo: any;

  @Column({
    type: DataType.JSONB,
    comment: 'Información del método de pago (tokenizada, sin datos sensibles)'
  })
  declare paymentMethod?: any;

  @Column({
    type: DataType.JSONB,
    comment: 'Respuesta completa de la pasarela de pago'
  })
  declare gatewayResponse?: any;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del pago'
  })
  declare metadata?: any;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El contador de reintentos no puede ser negativo'
    },
    max: {
      args: [10],
      msg: 'No se permiten más de 10 reintentos'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reintentos realizados'
  })
  declare retryCount: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último reintento'
  })
  declare lastRetryAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando el pago fue confirmado'
  })
  declare confirmedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del pago (para pagos pendientes)'
  })
  declare expiresAt?: Date;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación del registro'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de última actualización'
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

  @BelongsTo(() => Registration)
  declare registration: Registration;

  @HasMany(() => Refund)
  declare refunds: Refund[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el pago está expirado
   */
  public get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si el pago puede ser reembolsado
   */
  public get isRefundable(): boolean {
    return this.status === 'completed' &&
           !this.isExpired &&
           !!this.confirmedAt &&
           (new Date().getTime() - this.confirmedAt.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 días
  }

  /**
   * Calcula el tiempo de procesamiento en segundos
   */
  public get processingTime(): number | null {
    if (!this.confirmedAt || !this.createdAt) return null;
    return Math.floor((this.confirmedAt.getTime() - this.createdAt.getTime()) / 1000);
  }

  /**
   * Incrementa el contador de reintentos
   */
  public async incrementRetryCount(): Promise<void> {
    this.retryCount += 1;
    this.lastRetryAt = new Date();
    await this.save();
  }

  /**
   * Marca el pago como confirmado
   */
  public async markAsConfirmed(): Promise<void> {
    this.status = 'completed';
    this.confirmedAt = new Date();
    await this.save();
  }

  /**
   * Serializa el pago para respuestas de API (excluye datos sensibles)
   */
  public toPaymentJSON(): object {
    return {
      id: this.id,
      transactionId: this.transactionId,
      registrationId: this.registrationId,
      gateway: this.gateway,
      gatewayTransactionId: this.gatewayTransactionId,
      status: this.status,
      paymentType: this.paymentType,
      amount: this.amount,
      currency: this.currency,
      fee: this.fee,
      netAmount: this.netAmount,
      description: this.description,
      billingInfo: this.billingInfo,
      paymentMethod: this.paymentMethod ? {
        type: this.paymentMethod.type,
        cardLastFour: this.paymentMethod.cardLastFour,
        cardBrand: this.paymentMethod.cardBrand
      } : undefined,
      retryCount: this.retryCount,
      confirmedAt: this.confirmedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca pago por transaction ID
   */
  static async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.findOne({
      where: { transactionId },
      include: [{ model: Registration, as: 'registration' }]
    });
  }

  /**
   * Busca pago por gateway transaction ID
   */
  static async findByGatewayTransactionId(gateway: PaymentGateway, gatewayTransactionId: string): Promise<Payment | null> {
    return this.findOne({
      where: { gateway, gatewayTransactionId }
    });
  }

  /**
   * Obtiene pagos pendientes expirados
   */
  static async findExpiredPayments(): Promise<Payment[]> {
    return this.findAll({
      where: {
        status: 'pending',
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
  }

  /**
   * Obtiene estadísticas de pagos por período
   */
  static async getPaymentStats(startDate: Date, endDate: Date) {
    const payments = await this.findAll({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      },
      attributes: [
        'status',
        'gateway',
        'currency',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('amount')), 'totalAmount'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('fee')), 'totalFees']
      ],
      group: ['status', 'gateway', 'currency'],
      raw: true
    });

    return payments;
  }
}
