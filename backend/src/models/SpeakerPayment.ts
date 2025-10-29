/**
 * @fileoverview Modelo de Pago de Speaker para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para pagos realizados a speakers
 *
 * Archivo: backend/src/models/SpeakerPayment.ts
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
  BelongsTo
} from 'sequelize-typescript';
import { Contract } from './Contract';
import { Speaker } from './Speaker';
import { User } from './User';

/**
 * Atributos del modelo SpeakerPayment
 */
export interface SpeakerPaymentAttributes {
  id?: number;
  paymentNumber: string;
  contractId: number;
  speakerId: number;
  amount: number;
  currency: string;
  paymentType: 'advance' | 'final' | 'installment';
  scheduledDate: Date;
  actualPaymentDate?: Date;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'paypal' | 'other';
  referenceNumber?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  isrWithheld?: number;
  isrPercentage?: number;
  netAmount?: number;
  receiptFile?: string;
  notes?: string;
  processedBy?: number;
  processedAt?: Date;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de pago
 */
export interface SpeakerPaymentCreationAttributes extends Omit<SpeakerPaymentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

@Table({
  tableName: 'speaker_payments',
  modelName: 'SpeakerPayment',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['payment_number'],
      unique: true
    },
    {
      fields: ['contract_id']
    },
    {
      fields: ['speaker_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['scheduled_date']
    },
    {
      fields: ['actual_payment_date']
    },
    {
      fields: ['payment_method']
    },
    {
      fields: ['processed_by']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class SpeakerPayment extends Model<SpeakerPaymentAttributes, SpeakerPaymentCreationAttributes> implements SpeakerPaymentAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El número de pago es requerido'
    },
    len: {
      args: [10, 20],
      msg: 'El número de pago debe tener entre 10 y 20 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Número único del pago (PAY-YYYY-NNNN)',
    unique: true
  })
  declare paymentNumber: string;

  @ForeignKey(() => Contract)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al contrato'
  })
  declare contractId: number;

  @ForeignKey(() => Speaker)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al speaker (redundante pero útil para queries)'
  })
  declare speakerId: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto del pago no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto del pago en Quetzales'
  })
  declare amount: number;

  @AllowNull(false)
  @Default('GTQ')
  @Validate({
    isIn: {
      args: [['GTQ', 'USD']],
      msg: 'La moneda debe ser GTQ o USD'
    }
  })
  @Column({
    type: DataType.STRING(3),
    comment: 'Moneda del pago'
  })
  declare currency: string;

  @AllowNull(false)
  @Default('final')
  @Validate({
    isIn: {
      args: [['advance', 'final', 'installment']],
      msg: 'El tipo de pago debe ser advance, final o installment'
    }
  })
  @Column({
    type: DataType.ENUM('advance', 'final', 'installment'),
    comment: 'Tipo de pago'
  })
  declare paymentType: 'advance' | 'final' | 'installment';

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha programada debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha programada del pago'
  })
  declare scheduledDate: Date;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha real del pago debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha real del pago'
  })
  declare actualPaymentDate?: Date;

  @AllowNull(false)
  @Default('bank_transfer')
  @Validate({
    isIn: {
      args: [['bank_transfer', 'check', 'cash', 'paypal', 'other']],
      msg: 'El método de pago debe ser bank_transfer, check, cash, paypal u other'
    }
  })
  @Column({
    type: DataType.ENUM('bank_transfer', 'check', 'cash', 'paypal', 'other'),
    comment: 'Método de pago'
  })
  declare paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'paypal' | 'other';

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El número de referencia no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Referencia bancaria o número de transacción'
  })
  declare referenceNumber?: string;

  @AllowNull(false)
  @Default('pending')
  @Validate({
    isIn: {
      args: [['pending', 'processing', 'completed', 'rejected', 'cancelled']],
      msg: 'El estado debe ser pending, processing, completed, rejected o cancelled'
    }
  })
  @Column({
    type: DataType.ENUM('pending', 'processing', 'completed', 'rejected', 'cancelled'),
    comment: 'Estado del pago'
  })
  declare status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

  @Validate({
    min: {
      args: [0],
      msg: 'El ISR retenido debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto de ISR retenido'
  })
  declare isrWithheld?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El porcentaje de ISR debe ser mayor o igual a 0'
    },
    max: {
      args: [100],
      msg: 'El porcentaje de ISR no puede exceder 100'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 2),
    comment: 'Porcentaje de ISR aplicado (5% o 7%)'
  })
  declare isrPercentage?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El monto neto debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto neto después de retenciones'
  })
  declare netAmount?: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Ruta del comprobante de pago'
  })
  declare receiptFile?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'Las notas no pueden exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales del pago'
  })
  declare notes?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que procesó el pago'
  })
  declare processedBy?: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de procesamiento'
  })
  declare processedAt?: Date;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el registro de pago'
  })
  declare createdBy: number;

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

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => Contract)
  declare contract: Contract;

  @BelongsTo(() => Speaker)
  declare speaker: Speaker;

  @BelongsTo(() => User, 'processedBy')
  declare processor: User;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  // Calcular retenciones ISR automáticamente
  static async calculateISR(payment: SpeakerPayment): Promise<void> {
    if (payment.status === 'completed' && payment.amount > 0) {
      // Lógica simplificada: 5% para nacionales, 7% para internacionales
      // En producción, esto debería basarse en reglas fiscales específicas
      const speaker = await Speaker.findByPk(payment.speakerId);
      if (speaker) {
        const isrRate = speaker.category === 'international' ? 7 : 5;
        payment.isrPercentage = isrRate;
        payment.isrWithheld = (payment.amount * isrRate) / 100;
        payment.netAmount = payment.amount - (payment.isrWithheld || 0);
      }
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Procesa el pago
   */
  public async process(processedBy: number): Promise<void> {
    this.status = 'processing';
    this.processedBy = processedBy;
    this.processedAt = new Date();
    await this.save();
  }

  /**
   * Completa el pago
   */
  public async complete(actualPaymentDate?: Date): Promise<void> {
    this.status = 'completed';
    this.actualPaymentDate = actualPaymentDate || new Date();
    await this.save();
  }

  /**
   * Rechaza el pago
   */
  public async reject(): Promise<void> {
    this.status = 'rejected';
    await this.save();
  }

  /**
   * Cancela el pago
   */
  public async cancel(): Promise<void> {
    this.status = 'cancelled';
    await this.save();
  }

  /**
   * Verifica si el pago está completado
   */
  public get isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Serializa el pago para respuestas
   */
  public toJSON(): object {
    return {
      id: this.id,
      paymentNumber: this.paymentNumber,
      contractId: this.contractId,
      speakerId: this.speakerId,
      amount: this.amount,
      currency: this.currency,
      paymentType: this.paymentType,
      scheduledDate: this.scheduledDate,
      actualPaymentDate: this.actualPaymentDate,
      paymentMethod: this.paymentMethod,
      referenceNumber: this.referenceNumber,
      status: this.status,
      isrWithheld: this.isrWithheld,
      isrPercentage: this.isrPercentage,
      netAmount: this.netAmount,
      receiptFile: this.receiptFile,
      notes: this.notes,
      processedBy: this.processedBy,
      processedAt: this.processedAt,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un número único de pago
   */
  static async generatePaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastPayment = await SpeakerPayment.findOne({
      where: {
        paymentNumber: {
          [Symbol.for('like')]: `PAY-${year}-%`
        }
      },
      order: [['paymentNumber', 'DESC']]
    });

    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.paymentNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `PAY-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Busca pagos por contrato
   */
  static async findByContract(contractId: number, options: {
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: SpeakerPayment[]; count: number }> {
    const { status, limit = 20, offset = 0 } = options;

    const where: any = { contractId };
    if (status && status.length > 0) {
      where.status = { [Symbol.for('in')]: status };
    }

    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['scheduledDate', 'ASC']]
    });
  }

  /**
   * Busca pagos por speaker
   */
  static async findBySpeaker(speakerId: number, options: {
    status?: string[];
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ rows: SpeakerPayment[]; count: number }> {
    const { status, limit = 20, offset = 0, startDate, endDate } = options;

    const where: any = { speakerId };
    if (status && status.length > 0) {
      where.status = { [Symbol.for('in')]: status };
    }

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate[Symbol.for('gte')] = startDate;
      if (endDate) where.scheduledDate[Symbol.for('lte')] = endDate;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Contract,
          as: 'contract',
          attributes: ['id', 'contractNumber', 'eventId']
        }
      ],
      limit,
      offset,
      order: [['scheduledDate', 'DESC']]
    });
  }
}
