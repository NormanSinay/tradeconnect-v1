/**
 * @fileoverview Modelo de Reembolso para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Reembolso con validaciones y métodos
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { Payment } from './Payment';

/**
 * Atributos del modelo Reembolso
 */
export interface RefundAttributes {
  id?: number;
  refundId: string;
  paymentId: number;
  gatewayRefundId?: string;
  amount: number;
  fee: number;
  netAmount: number;
  reason: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gatewayResponse?: any;
  metadata?: any;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de reembolso
 */
export interface RefundCreationAttributes extends Omit<RefundAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Refund:
 *       type: object
 *       required:
 *         - refundId
 *         - paymentId
 *         - amount
 *         - reason
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del reembolso
 *           example: 1
 *         refundId:
 *           type: string
 *           description: ID único de reembolso
 *           example: "ref_123456789"
 *         paymentId:
 *           type: integer
 *           description: ID del pago asociado
 *           example: 1
 *         gatewayRefundId:
 *           type: string
 *           description: ID de reembolso en la pasarela
 *           example: "re_123456789"
 *         amount:
 *           type: number
 *           description: Monto del reembolso
 *           example: 100.00
 *         fee:
 *           type: number
 *           description: Comisión del reembolso
 *           example: 2.50
 *         netAmount:
 *           type: number
 *           description: Monto neto del reembolso
 *           example: 97.50
 *         reason:
 *           type: string
 *           description: Razón del reembolso
 *           example: "cancelacion_evento"
 *         description:
 *           type: string
 *           description: Descripción detallada
 *           example: "Reembolso por cancelación del evento"
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
 *           description: Estado del reembolso
 *           example: "completed"
 *         gatewayResponse:
 *           type: object
 *           description: Respuesta de la pasarela
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de procesamiento
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
  tableName: 'refunds',
  modelName: 'Refund',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['refund_id'],
      where: { deleted_at: null }
    },
    {
      unique: true,
      fields: ['payment_id', 'gateway_refund_id'],
      where: {
        gateway_refund_id: { $ne: null },
        deleted_at: null
      }
    },
    {
      fields: ['payment_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['processed_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Refund extends Model<RefundAttributes, RefundCreationAttributes> implements RefundAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El ID de reembolso es requerido'
    },
    len: {
      args: [10, 100],
      msg: 'El ID de reembolso debe tener entre 10 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID único de reembolso generado internamente'
  })
  declare refundId: string;

  @ForeignKey(() => Payment)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del pago asociado al reembolso'
  })
  declare paymentId: number;

  @Index
  @Validate({
    len: {
      args: [0, 255],
      msg: 'El ID de reembolso de la pasarela no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'ID de reembolso en la pasarela externa'
  })
  declare gatewayRefundId?: string;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0.01],
      msg: 'El monto del reembolso debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto del reembolso'
  })
  declare amount: number;

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
    comment: 'Comisión cobrada por el reembolso'
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
    comment: 'Monto neto del reembolso después de deducir comisiones'
  })
  declare netAmount: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La razón del reembolso es requerida'
    },
    len: {
      args: [3, 100],
      msg: 'La razón debe tener entre 3 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Razón del reembolso'
  })
  declare reason: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'Descripción detallada del reembolso'
  })
  declare description?: string;

  @AllowNull(false)
  @Default('pending')
  @Index
  @Validate({
    isIn: {
      args: [['pending', 'processing', 'completed', 'failed', 'cancelled']],
      msg: 'Estado de reembolso inválido'
    }
  })
  @Column({
    type: DataType.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    comment: 'Estado actual del reembolso'
  })
  declare status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  @Column({
    type: DataType.JSONB,
    comment: 'Respuesta completa de la pasarela de pago'
  })
  declare gatewayResponse?: any;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del reembolso'
  })
  declare metadata?: any;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando el reembolso fue procesado'
  })
  declare processedAt?: Date;

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

  @BelongsTo(() => Payment)
  declare payment: Payment;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el reembolso puede ser procesado
   */
  public get canBeProcessed(): boolean {
    return ['pending', 'failed'].includes(this.status);
  }

  /**
   * Calcula el tiempo de procesamiento en segundos
   */
  public get processingTime(): number | null {
    if (!this.processedAt || !this.createdAt) return null;
    return Math.floor((this.processedAt.getTime() - this.createdAt.getTime()) / 1000);
  }

  /**
   * Marca el reembolso como procesado
   */
  public async markAsProcessed(): Promise<void> {
    this.status = 'completed';
    this.processedAt = new Date();
    await this.save();
  }

  /**
   * Serializa el reembolso para respuestas de API
   */
  public toRefundJSON(): object {
    return {
      id: this.id,
      refundId: this.refundId,
      paymentId: this.paymentId,
      gatewayRefundId: this.gatewayRefundId,
      amount: this.amount,
      fee: this.fee,
      netAmount: this.netAmount,
      reason: this.reason,
      description: this.description,
      status: this.status,
      gatewayResponse: this.gatewayResponse,
      metadata: this.metadata,
      processedAt: this.processedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca reembolso por refund ID
   */
  static async findByRefundId(refundId: string): Promise<Refund | null> {
    return this.findOne({
      where: { refundId },
      include: [{ model: Payment, as: 'payment' }]
    });
  }

  /**
   * Busca reembolso por gateway refund ID
   */
  static async findByGatewayRefundId(gatewayRefundId: string): Promise<Refund | null> {
    return this.findOne({
      where: { gatewayRefundId }
    });
  }

  /**
   * Obtiene reembolsos pendientes
   */
  static async findPendingRefunds(): Promise<Refund[]> {
    return this.findAll({
      where: { status: 'pending' },
      include: [{ model: Payment, as: 'payment' }],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas de reembolsos por período
   */
  static async getRefundStats(startDate: Date, endDate: Date) {
    const refunds = await this.findAll({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      },
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('amount')), 'totalAmount'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('fee')), 'totalFees']
      ],
      group: ['status'],
      raw: true
    });

    return refunds;
  }
}
