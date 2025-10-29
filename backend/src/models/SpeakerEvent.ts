/**
 * @fileoverview Modelo de asignación Speaker-Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para asignaciones de speakers a eventos
 *
 * Archivo: backend/src/models/SpeakerEvent.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
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
import { Op } from 'sequelize';
import { Speaker } from './Speaker';
import { Event } from './Event';
import { User } from './User';
import { SpeakerAvailabilityBlock } from './SpeakerAvailabilityBlock';

/**
 * Atributos del modelo SpeakerEvent
 */
export interface SpeakerEventAttributes {
  id?: number;
  speakerId: number;
  eventId: number;
  role: 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';
  participationStart: Date;
  participationEnd: Date;
  durationMinutes?: number;
  modality: 'presential' | 'virtual' | 'hybrid';
  order?: number;
  status: 'tentative' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de asignación speaker-evento
 */
export interface SpeakerEventCreationAttributes extends Omit<SpeakerEventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

@Table({
  tableName: 'speaker_events',
  modelName: 'SpeakerEvent',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['speaker_id']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    },
    {
      fields: ['participation_start']
    },
    {
      fields: ['participation_end']
    },
    {
      fields: ['modality']
    },
    {
      fields: ['confirmed_at']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['speaker_id', 'event_id'],
      unique: true,
      where: {
        deleted_at: null
      }
    }
  ]
})
export class SpeakerEvent extends Model<SpeakerEventAttributes, SpeakerEventCreationAttributes> implements SpeakerEventAttributes {
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

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento'
  })
  declare eventId: number;

  @AllowNull(false)
  @Default('guest')
  @Validate({
    isIn: {
      args: [['keynote_speaker', 'panelist', 'facilitator', 'moderator', 'guest']],
      msg: 'El rol debe ser keynote_speaker, panelist, facilitator, moderator o guest'
    }
  })
  @Column({
    type: DataType.ENUM('keynote_speaker', 'panelist', 'facilitator', 'moderator', 'guest'),
    comment: 'Rol del speaker en el evento'
  })
  declare role: 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio de participación debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de inicio de participación'
  })
  declare participationStart: Date;

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de fin de participación debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de fin de participación'
  })
  declare participationEnd: Date;

  @Validate({
    min: {
      args: [1],
      msg: 'La duración debe ser al menos 1 minuto'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Duración en minutos de la participación'
  })
  declare durationMinutes?: number;

  @AllowNull(false)
  @Default('presential')
  @Validate({
    isIn: {
      args: [['presential', 'virtual', 'hybrid']],
      msg: 'La modalidad debe ser presential, virtual o hybrid'
    }
  })
  @Column({
    type: DataType.ENUM('presential', 'virtual', 'hybrid'),
    comment: 'Modalidad de participación'
  })
  declare modality: 'presential' | 'virtual' | 'hybrid';

  @Validate({
    min: {
      args: [1],
      msg: 'El orden debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Orden de aparición si hay múltiples speakers'
  })
  declare order?: number;

  @AllowNull(false)
  @Default('tentative')
  @Validate({
    isIn: {
      args: [['tentative', 'confirmed', 'cancelled', 'completed']],
      msg: 'El estado debe ser tentative, confirmed, cancelled o completed'
    }
  })
  @Column({
    type: DataType.ENUM('tentative', 'confirmed', 'cancelled', 'completed'),
    comment: 'Estado de la asignación'
  })
  declare status: 'tentative' | 'confirmed' | 'cancelled' | 'completed';

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Las notas no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Notas internas sobre la participación'
  })
  declare notes?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de confirmación del speaker'
  })
  declare confirmedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de cancelación'
  })
  declare cancelledAt?: Date;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La razón de cancelación no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Razón de cancelación'
  })
  declare cancellationReason?: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la asignación'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó la asignación'
  })
  declare updatedBy?: number;

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

  @BelongsTo(() => User, 'updatedBy')
  declare updater: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateDates(speakerEvent: SpeakerEvent): Promise<void> {
    if (speakerEvent.participationEnd <= speakerEvent.participationStart) {
      throw new Error('La fecha de fin de participación debe ser posterior a la fecha de inicio');
    }
  }

  @BeforeCreate
  static async validateAvailability(speakerEvent: SpeakerEvent): Promise<void> {
    // Verificar conflictos de disponibilidad del speaker
    const conflicts = await SpeakerAvailabilityBlock.findAll({
      where: {
        speakerId: speakerEvent.speakerId,
        [Op.or]: [
          {
            startDate: { [Op.lte]: speakerEvent.participationStart },
            endDate: { [Op.gte]: speakerEvent.participationStart }
          },
          {
            startDate: { [Op.lte]: speakerEvent.participationEnd },
            endDate: { [Op.gte]: speakerEvent.participationEnd }
          },
          {
            startDate: { [Op.gte]: speakerEvent.participationStart },
            endDate: { [Op.lte]: speakerEvent.participationEnd }
          }
        ]
      }
    });

    if (conflicts.length > 0) {
      throw new Error('El speaker tiene conflictos de disponibilidad en las fechas seleccionadas');
    }

    // Verificar conflictos con otros eventos asignados
    const eventConflicts = await SpeakerEvent.findAll({
      where: {
        speakerId: speakerEvent.speakerId,
        eventId: { [Op.ne]: speakerEvent.eventId || 0 },
        status: { [Op.in]: ['confirmed', 'tentative'] },
        [Op.or]: [
          {
            participationStart: { [Op.lte]: speakerEvent.participationStart },
            participationEnd: { [Op.gte]: speakerEvent.participationStart }
          },
          {
            participationStart: { [Op.lte]: speakerEvent.participationEnd },
            participationEnd: { [Op.gte]: speakerEvent.participationEnd }
          },
          {
            participationStart: { [Op.gte]: speakerEvent.participationStart },
            participationEnd: { [Op.lte]: speakerEvent.participationEnd }
          }
        ]
      }
    });

    if (eventConflicts.length > 0) {
      throw new Error('El speaker tiene conflictos de agenda con otros eventos asignados');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Confirma la asignación del speaker
   */
  public async confirm(): Promise<void> {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    await this.save();
  }

  /**
   * Cancela la asignación del speaker
   */
  public async cancel(reason?: string): Promise<void> {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
    await this.save();
  }

  /**
   * Marca la participación como completada
   */
  public async complete(): Promise<void> {
    this.status = 'completed';
    await this.save();
  }

  /**
   * Verifica si la asignación está activa
   */
  public get isActive(): boolean {
    return ['tentative', 'confirmed'].includes(this.status);
  }

  /**
   * Serializa la asignación para respuestas
   */
  public toJSON(): object {
    return {
      id: this.id,
      speakerId: this.speakerId,
      eventId: this.eventId,
      role: this.role,
      participationStart: this.participationStart,
      participationEnd: this.participationEnd,
      durationMinutes: this.durationMinutes,
      modality: this.modality,
      order: this.order,
      status: this.status,
      notes: this.notes,
      confirmedAt: this.confirmedAt,
      cancelledAt: this.cancelledAt,
      cancellationReason: this.cancellationReason,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca asignaciones por evento
   */
  static async findByEvent(eventId: number, options: {
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: SpeakerEvent[]; count: number }> {
    const { status, limit = 20, offset = 0 } = options;

    const where: any = { eventId };
    if (status && status.length > 0) {
      where.status = { [Op.in]: status };
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Speaker,
          as: 'speaker',
          attributes: ['id', 'firstName', 'lastName', 'email', 'category', 'rating']
        }
      ],
      limit,
      offset,
      order: [['order', 'ASC'], ['participationStart', 'ASC']]
    });
  }

  /**
   * Busca asignaciones por speaker
   */
  static async findBySpeaker(speakerId: number, options: {
    status?: string[];
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ rows: SpeakerEvent[]; count: number }> {
    const { status, limit = 20, offset = 0, startDate, endDate } = options;

    const where: any = { speakerId };
    if (status && status.length > 0) {
      where.status = { [Op.in]: status };
    }

    if (startDate || endDate) {
      where.participationStart = {};
      if (startDate) where.participationStart[Op.gte] = startDate;
      if (endDate) where.participationStart[Op.lte] = endDate;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate', 'location', 'isVirtual']
        }
      ],
      limit,
      offset,
      order: [['participationStart', 'DESC']]
    });
  }
}
