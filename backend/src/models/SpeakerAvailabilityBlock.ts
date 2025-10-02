/**
 * @fileoverview Modelo de bloqueo de disponibilidad de Speaker para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para bloques de fechas no disponibles de speakers
 *
 * Archivo: backend/src/models/SpeakerAvailabilityBlock.ts
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
  BelongsTo
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Speaker } from './Speaker';
import { User } from './User';

/**
 * Atributos del modelo SpeakerAvailabilityBlock
 */
export interface SpeakerAvailabilityBlockAttributes {
  id?: number;
  speakerId: number;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de bloqueo de disponibilidad
 */
export interface SpeakerAvailabilityBlockCreationAttributes extends Omit<SpeakerAvailabilityBlockAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  tableName: 'speaker_availability_blocks',
  modelName: 'SpeakerAvailabilityBlock',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['speaker_id']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['is_recurring']
    },
    {
      fields: ['created_by']
    }
  ]
})
export class SpeakerAvailabilityBlock extends Model<SpeakerAvailabilityBlockAttributes, SpeakerAvailabilityBlockCreationAttributes> implements SpeakerAvailabilityBlockAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Speaker)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al speaker'
  })
  declare speakerId: number;

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de inicio del bloqueo'
  })
  declare startDate: Date;

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de fin debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de fin del bloqueo'
  })
  declare endDate: Date;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La razón no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Razón del bloqueo (vacaciones, otro evento, etc.)'
  })
  declare reason?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es un bloqueo recurrente'
  })
  declare isRecurring: boolean;

  @Validate({
    isIn: {
      args: [['daily', 'weekly', 'monthly', 'yearly']],
      msg: 'El patrón de recurrencia debe ser daily, weekly, monthly o yearly'
    }
  })
  @Column({
    type: DataType.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    comment: 'Patrón de recurrencia si aplica'
  })
  declare recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el bloqueo'
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

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => Speaker)
  declare speaker: Speaker;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  // Validar que endDate sea posterior a startDate
  static async validateDates(block: SpeakerAvailabilityBlock): Promise<void> {
    if (block.endDate <= block.startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si este bloqueo se superpone con un rango de fechas dado
   */
  public overlapsWith(startDate: Date, endDate: Date): boolean {
    return (
      (this.startDate <= startDate && this.endDate >= startDate) ||
      (this.startDate <= endDate && this.endDate >= endDate) ||
      (this.startDate >= startDate && this.endDate <= endDate)
    );
  }

  /**
   * Serializa el bloqueo para respuestas
   */
  public toJSON(): object {
    return {
      id: this.id,
      speakerId: this.speakerId,
      startDate: this.startDate,
      endDate: this.endDate,
      reason: this.reason,
      isRecurring: this.isRecurring,
      recurrencePattern: this.recurrencePattern,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca bloqueos que se superponen con un rango de fechas
   */
  static async findOverlappingBlocks(speakerId: number, startDate: Date, endDate: Date): Promise<SpeakerAvailabilityBlock[]> {
    return this.findAll({
      where: {
        speakerId,
        [Op.or]: [
          {
            startDate: { [Op.lte]: startDate },
            endDate: { [Op.gte]: startDate }
          },
          {
            startDate: { [Op.lte]: endDate },
            endDate: { [Op.gte]: endDate }
          },
          {
            startDate: { [Op.gte]: startDate },
            endDate: { [Op.lte]: endDate }
          }
        ]
      }
    });
  }

  /**
   * Busca bloqueos por speaker
   */
  static async findBySpeaker(speakerId: number, options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ rows: SpeakerAvailabilityBlock[]; count: number }> {
    const { limit = 20, offset = 0, startDate, endDate } = options;

    const where: any = { speakerId };

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.$gte = startDate;
      if (endDate) where.startDate.$lte = endDate;
    }

    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['startDate', 'ASC']]
    });
  }
}