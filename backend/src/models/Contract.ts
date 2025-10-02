/**
 * @fileoverview Modelo de Contrato para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para contratos de speakers
 *
 * Archivo: backend/src/models/Contract.ts
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
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { Speaker } from './Speaker';
import { Event } from './Event';
import { User } from './User';
import { SpeakerPayment } from './SpeakerPayment';

/**
 * Atributos del modelo Contract
 */
export interface ContractAttributes {
  id?: number;
  contractNumber: string;
  speakerId: number;
  eventId: number;
  agreedAmount: number;
  currency: string;
  paymentTerms: 'full_payment' | 'advance_payment' | 'installments';
  advancePercentage?: number;
  advanceAmount?: number;
  termsConditions?: string;
  customClauses?: string[];
  status: 'draft' | 'sent' | 'signed' | 'rejected' | 'cancelled';
  signedAt?: Date;
  contractFile?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  templateId?: number;
  createdBy: number;
  approvedBy?: number;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de contrato
 */
export interface ContractCreationAttributes extends Omit<ContractAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

@Table({
  tableName: 'contracts',
  modelName: 'Contract',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['contract_number'],
      unique: true
    },
    {
      fields: ['speaker_id']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['signed_at']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['approved_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Contract extends Model<ContractAttributes, ContractCreationAttributes> implements ContractAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El número de contrato es requerido'
    },
    len: {
      args: [10, 20],
      msg: 'El número de contrato debe tener entre 10 y 20 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Número único del contrato (CTR-YYYY-NNNN)',
    unique: true
  })
  declare contractNumber: string;

  @ForeignKey(() => Speaker)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al speaker'
  })
  declare speakerId: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento'
  })
  declare eventId: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto acordado no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto acordado en Quetzales'
  })
  declare agreedAmount: number;

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
    comment: 'Moneda del contrato'
  })
  declare currency: string;

  @AllowNull(false)
  @Default('full_payment')
  @Validate({
    isIn: {
      args: [['full_payment', 'advance_payment', 'installments']],
      msg: 'Los términos de pago deben ser full_payment, advance_payment o installments'
    }
  })
  @Column({
    type: DataType.ENUM('full_payment', 'advance_payment', 'installments'),
    comment: 'Forma de pago'
  })
  declare paymentTerms: 'full_payment' | 'advance_payment' | 'installments';

  @Validate({
    min: {
      args: [0],
      msg: 'El porcentaje de anticipo debe ser mayor o igual a 0'
    },
    max: {
      args: [100],
      msg: 'El porcentaje de anticipo no puede exceder 100'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 2),
    comment: 'Porcentaje de anticipo si aplica'
  })
  declare advancePercentage?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El monto del anticipo debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto del anticipo calculado'
  })
  declare advanceAmount?: number;

  @Validate({
    len: {
      args: [0, 2000],
      msg: 'Los términos y condiciones no pueden exceder 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Términos y condiciones específicos'
  })
  declare termsConditions?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Cláusulas personalizadas (array de strings)'
  })
  declare customClauses?: string[];

  @AllowNull(false)
  @Default('draft')
  @Validate({
    isIn: {
      args: [['draft', 'sent', 'signed', 'rejected', 'cancelled']],
      msg: 'El estado debe ser draft, sent, signed, rejected o cancelled'
    }
  })
  @Column({
    type: DataType.ENUM('draft', 'sent', 'signed', 'rejected', 'cancelled'),
    comment: 'Estado del contrato'
  })
  declare status: 'draft' | 'sent' | 'signed' | 'rejected' | 'cancelled';

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de firma del contrato'
  })
  declare signedAt?: Date;

  @Column({
    type: DataType.TEXT,
    comment: 'Ruta del archivo PDF del contrato firmado'
  })
  declare contractFile?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La razón de rechazo no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Razón de rechazo si aplica'
  })
  declare rejectionReason?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La razón de cancelación no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Razón de cancelación si aplica'
  })
  declare cancellationReason?: string;

  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia a la plantilla usada (si se implementa)'
  })
  declare templateId?: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el contrato'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que aprobó el contrato'
  })
  declare approvedBy?: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de aprobación'
  })
  declare approvedAt?: Date;

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

  @BelongsTo(() => Speaker)
  declare speaker: Speaker;

  @BelongsTo(() => Event)
  declare event: Event;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'approvedBy')
  declare approver: User;

  @HasMany(() => SpeakerPayment)
  declare payments: SpeakerPayment[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  // Calcular monto de anticipo automáticamente
  static async calculateAdvanceAmount(contract: Contract): Promise<void> {
    if (contract.paymentTerms === 'advance_payment' && contract.advancePercentage) {
      contract.advanceAmount = (contract.agreedAmount * contract.advancePercentage) / 100;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Envía el contrato al speaker
   */
  public async send(): Promise<void> {
    this.status = 'sent';
    await this.save();
  }

  /**
   * Firma el contrato
   */
  public async sign(): Promise<void> {
    this.status = 'signed';
    this.signedAt = new Date();
    await this.save();
  }

  /**
   * Aprueba el contrato
   */
  public async approve(approvedBy: number): Promise<void> {
    this.status = 'signed';
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    await this.save();
  }

  /**
   * Rechaza el contrato
   */
  public async reject(reason?: string): Promise<void> {
    this.status = 'rejected';
    this.rejectionReason = reason;
    await this.save();
  }

  /**
   * Cancela el contrato
   */
  public async cancel(reason?: string): Promise<void> {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    await this.save();
  }

  /**
   * Calcula el monto pendiente de pago
   */
  public async getPendingAmount(): Promise<number> {
    const payments = await SpeakerPayment.findAll({
      where: { contractId: this.id, status: 'completed' }
    });

    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return this.agreedAmount - paidAmount;
  }

  /**
   * Verifica si el contrato está activo
   */
  public get isActive(): boolean {
    return this.status === 'signed';
  }

  /**
   * Serializa el contrato para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      contractNumber: this.contractNumber,
      speakerId: this.speakerId,
      eventId: this.eventId,
      agreedAmount: this.agreedAmount,
      currency: this.currency,
      paymentTerms: this.paymentTerms,
      advancePercentage: this.advancePercentage,
      advanceAmount: this.advanceAmount,
      status: this.status,
      signedAt: this.signedAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el contrato para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      termsConditions: this.termsConditions,
      customClauses: this.customClauses,
      contractFile: this.contractFile,
      rejectionReason: this.rejectionReason,
      cancellationReason: this.cancellationReason,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un número único de contrato
   */
  static async generateContractNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastContract = await Contract.findOne({
      where: {
        contractNumber: {
          [Symbol.for('like')]: `CTR-${year}-%`
        }
      },
      order: [['contractNumber', 'DESC']]
    });

    let sequence = 1;
    if (lastContract) {
      const lastSequence = parseInt(lastContract.contractNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `CTR-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Busca contratos por speaker
   */
  static async findBySpeaker(speakerId: number, options: {
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: Contract[]; count: number }> {
    const { status, limit = 20, offset = 0 } = options;

    const where: any = { speakerId };
    if (status && status.length > 0) {
      where.status = { [Symbol.for('in')]: status };
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca contratos por evento
   */
  static async findByEvent(eventId: number, options: {
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: Contract[]; count: number }> {
    const { status, limit = 20, offset = 0 } = options;

    const where: any = { eventId };
    if (status && status.length > 0) {
      where.status = { [Symbol.for('in')]: status };
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Speaker,
          as: 'speaker',
          attributes: ['id', 'firstName', 'lastName', 'email', 'category']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }
}