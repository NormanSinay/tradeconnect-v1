/**
 * @fileoverview Modelo de Reconciliación de Pagos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Reconciliación de Pagos
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { PaymentGateway } from '../utils/constants';

/**
 * Atributos del modelo Reconciliación de Pagos
 */
export interface PaymentReconciliationAttributes {
  id?: number;
  reconciliationId: string;
  gateway: PaymentGateway;
  startDate: Date;
  endDate: Date;
  totalGatewayTransactions: number;
  totalLocalTransactions: number;
  totalDiscrepancies: number;
  discrepancies: any; // JSON con detalles de discrepancias
  status: 'completed' | 'failed';
  errorMessage?: string;
  generatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de reconciliación
 */
export interface PaymentReconciliationCreationAttributes extends Omit<PaymentReconciliationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentReconciliation:
 *       type: object
 *       required:
 *         - reconciliationId
 *         - gateway
 *         - startDate
 *         - endDate
 *         - totalGatewayTransactions
 *         - totalLocalTransactions
 *         - totalDiscrepancies
 *         - status
 *         - generatedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la reconciliación
 *           example: 1
 *         reconciliationId:
 *           type: string
 *           description: ID único de reconciliación
 *           example: "rec_123456789"
 *         gateway:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *           description: Pasarela reconciliada
 *           example: "stripe"
 *         startDate:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del período
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Fecha de fin del período
 *           example: "2024-01-31"
 *         totalGatewayTransactions:
 *           type: integer
 *           description: Total de transacciones en la pasarela
 *           example: 150
 *         totalLocalTransactions:
 *           type: integer
 *           description: Total de transacciones locales
 *           example: 148
 *         totalDiscrepancies:
 *           type: integer
 *           description: Total de discrepancias encontradas
 *           example: 2
 *         discrepancies:
 *           type: array
 *           description: Detalles de las discrepancias
 *         status:
 *           type: string
 *           enum: [completed, failed]
 *           description: Estado de la reconciliación
 *           example: "completed"
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si falló
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de generación del reporte
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
  tableName: 'payment_reconciliations',
  modelName: 'PaymentReconciliation',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['reconciliation_id']
    },
    {
      fields: ['gateway']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start_date', 'end_date']
    },
    {
      fields: ['generated_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class PaymentReconciliation extends Model<PaymentReconciliationAttributes, PaymentReconciliationCreationAttributes> implements PaymentReconciliationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El ID de reconciliación es requerido'
    },
    len: {
      args: [10, 100],
      msg: 'El ID de reconciliación debe tener entre 10 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID único de reconciliación generado internamente'
  })
  declare reconciliationId: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['paypal', 'stripe', 'neonet', 'bam']],
      msg: 'La pasarela debe ser paypal, stripe, neonet o bam'
    }
  })
  @Column({
    type: DataType.ENUM('paypal', 'stripe', 'neonet', 'bam'),
    comment: 'Pasarela de pago reconciliada'
  })
  declare gateway: PaymentGateway;

  @AllowNull(false)
  @Column({
    type: DataType.DATEONLY,
    comment: 'Fecha de inicio del período de reconciliación'
  })
  declare startDate: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DATEONLY,
    comment: 'Fecha de fin del período de reconciliación'
  })
  declare endDate: Date;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El total de transacciones de pasarela no puede ser negativo'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Total de transacciones reportadas por la pasarela'
  })
  declare totalGatewayTransactions: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El total de transacciones locales no puede ser negativo'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Total de transacciones registradas localmente'
  })
  declare totalLocalTransactions: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El total de discrepancias no puede ser negativo'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Total de discrepancias encontradas'
  })
  declare totalDiscrepancies: number;

  @AllowNull(false)
  @Column({
    type: DataType.JSONB,
    comment: 'Detalles de las discrepancias encontradas'
  })
  declare discrepancies: any;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['completed', 'failed']],
      msg: 'Estado de reconciliación inválido'
    }
  })
  @Column({
    type: DataType.ENUM('completed', 'failed'),
    comment: 'Estado de la reconciliación'
  })
  declare status: 'completed' | 'failed';

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'El mensaje de error no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si la reconciliación falló'
  })
  declare errorMessage?: string;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora cuando se generó el reporte de reconciliación'
  })
  declare generatedAt: Date;

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

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la reconciliación tiene discrepancias críticas
   */
  public get hasCriticalDiscrepancies(): boolean {
    return this.totalDiscrepancies > 3; // Más de 3 discrepancias se considera crítico
  }

  /**
   * Calcula el porcentaje de discrepancias
   */
  public get discrepancyPercentage(): number {
    const total = this.totalGatewayTransactions + this.totalLocalTransactions;
    if (total === 0) return 0;
    return (this.totalDiscrepancies / total) * 100;
  }

  /**
   * Serializa la reconciliación para respuestas de API
   */
  public toReconciliationJSON(): object {
    return {
      id: this.id,
      reconciliationId: this.reconciliationId,
      gateway: this.gateway,
      startDate: this.startDate,
      endDate: this.endDate,
      totalGatewayTransactions: this.totalGatewayTransactions,
      totalLocalTransactions: this.totalLocalTransactions,
      totalDiscrepancies: this.totalDiscrepancies,
      discrepancyPercentage: this.discrepancyPercentage,
      hasCriticalDiscrepancies: this.hasCriticalDiscrepancies,
      discrepancies: this.discrepancies,
      status: this.status,
      errorMessage: this.errorMessage,
      generatedAt: this.generatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca reconciliación por reconciliation ID
   */
  static async findByReconciliationId(reconciliationId: string): Promise<PaymentReconciliation | null> {
    return this.findOne({
      where: { reconciliationId }
    });
  }

  /**
   * Obtiene reconciliaciones por período y pasarela
   */
  static async findByPeriodAndGateway(
    gateway: PaymentGateway,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentReconciliation[]> {
    return this.findAll({
      where: {
        gateway,
        startDate: {
          $gte: startDate
        },
        endDate: {
          $lte: endDate
        }
      },
      order: [['generatedAt', 'DESC']]
    });
  }

  /**
   * Obtiene estadísticas de reconciliaciones
   */
  static async getReconciliationStats(gateway?: PaymentGateway, days: number = 30) {
    const where: any = {
      generatedAt: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (gateway) {
      where.gateway = gateway;
    }

    const reconciliations = await this.findAll({
      where,
      attributes: [
        'gateway',
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('total_discrepancies')), 'avgDiscrepancies'],
        [this.sequelize!.fn('MAX', this.sequelize!.col('total_discrepancies')), 'maxDiscrepancies']
      ],
      group: ['gateway', 'status'],
      raw: true
    });

    return reconciliations;
  }
}