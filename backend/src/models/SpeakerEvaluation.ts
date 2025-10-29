/**
 * @fileoverview Modelo de Evaluación de Speaker para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para evaluaciones y ratings de speakers
 *
 * Archivo: backend/src/models/SpeakerEvaluation.ts
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
import { Speaker } from './Speaker';
import { Event } from './Event';
import { User } from './User';

/**
 * Atributos del modelo SpeakerEvaluation
 */
export interface SpeakerEvaluationAttributes {
  id?: number;
  speakerId: number;
  eventId: number;
  evaluatorType: 'organizer' | 'attendee' | 'both';
  evaluatorId?: number;
  overallRating: number;
  criteriaRatings: Record<string, number>;
  comments?: string;
  isPublic: boolean;
  evaluationDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de evaluación
 */
export interface SpeakerEvaluationCreationAttributes extends Omit<SpeakerEvaluationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  tableName: 'speaker_evaluations',
  modelName: 'SpeakerEvaluation',
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
      fields: ['evaluator_id']
    },
    {
      fields: ['overall_rating']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['evaluation_date']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['speaker_id', 'event_id', 'evaluator_id'],
      unique: true,
      where: {
        evaluator_id: {
          $ne: null
        }
      }
    }
  ]
})
export class SpeakerEvaluation extends Model<SpeakerEvaluationAttributes, SpeakerEvaluationCreationAttributes> implements SpeakerEvaluationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Speaker)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al speaker evaluado'
  })
  declare speakerId: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento donde participó'
  })
  declare eventId: number;

  @AllowNull(false)
  @Default('organizer')
  @Validate({
    isIn: {
      args: [['organizer', 'attendee', 'both']],
      msg: 'El tipo de evaluador debe ser organizer, attendee o both'
    }
  })
  @Column({
    type: DataType.ENUM('organizer', 'attendee', 'both'),
    comment: 'Tipo de evaluador'
  })
  declare evaluatorType: 'organizer' | 'attendee' | 'both';

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que realizó la evaluación (si aplica)'
  })
  declare evaluatorId?: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'El rating general debe ser al menos 1'
    },
    max: {
      args: [5],
      msg: 'El rating general no puede exceder 5'
    }
  })
  @Column({
    type: DataType.DECIMAL(3, 2),
    comment: 'Rating general (1-5 estrellas)'
  })
  declare overallRating: number;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Ratings por criterio específico (JSON con dominio_tema, comunicacion, puntualidad, etc.)'
  })
  declare criteriaRatings: Record<string, number>;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Los comentarios no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Comentarios cualitativos (máx. 1000 caracteres)'
  })
  declare comments?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la evaluación es pública'
  })
  declare isPublic: boolean;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de evaluación debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de la evaluación'
  })
  declare evaluationDate: Date;

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

  @BelongsTo(() => Event)
  declare event: Event;

  @BelongsTo(() => User, 'evaluatorId')
  declare evaluator: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  // Actualizar rating promedio del speaker después de crear evaluación
  static async updateSpeakerRating(evaluation: SpeakerEvaluation): Promise<void> {
    const speaker = await Speaker.findByPk(evaluation.speakerId);
    if (speaker) {
      const newRating = await speaker.calculateAverageRating();
      await speaker.update({ rating: newRating });
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Calcula el rating promedio de criterios
   */
  public get averageCriteriaRating(): number {
    const ratings = Object.values(this.criteriaRatings);
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc: number, rating: number) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 100) / 100;
  }

  /**
   * Verifica si la evaluación es positiva
   */
  public get isPositive(): boolean {
    return this.overallRating >= 4;
  }

  /**
   * Serializa la evaluación para respuestas
   */
  public toJSON(): object {
    return {
      id: this.id,
      speakerId: this.speakerId,
      eventId: this.eventId,
      evaluatorType: this.evaluatorType,
      evaluatorId: this.evaluatorId,
      overallRating: this.overallRating,
      criteriaRatings: this.criteriaRatings,
      averageCriteriaRating: this.averageCriteriaRating,
      comments: this.comments,
      isPublic: this.isPublic,
      evaluationDate: this.evaluationDate,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la evaluación para respuestas públicas
   */
  public toPublicJSON(): object | null {
    if (!this.isPublic) return null;

    return {
      speakerId: this.speakerId,
      eventId: this.eventId,
      overallRating: this.overallRating,
      comments: this.comments,
      evaluationDate: this.evaluationDate
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca evaluaciones por speaker
   */
  static async findBySpeaker(speakerId: number, options: {
    isPublic?: boolean;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ rows: SpeakerEvaluation[]; count: number }> {
    const { isPublic, limit = 20, offset = 0, startDate, endDate } = options;

    const where: any = { speakerId };
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (startDate || endDate) {
      where.evaluationDate = {};
      if (startDate) where.evaluationDate[Symbol.for('gte')] = startDate;
      if (endDate) where.evaluationDate[Symbol.for('lte')] = endDate;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate']
        }
      ],
      limit,
      offset,
      order: [['evaluationDate', 'DESC']]
    });
  }

  /**
   * Busca evaluaciones por evento
   */
  static async findByEvent(eventId: number, options: {
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: SpeakerEvaluation[]; count: number }> {
    const { isPublic, limit = 20, offset = 0 } = options;

    const where: any = { eventId };
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Speaker,
          as: 'speaker',
          attributes: ['id', 'firstName', 'lastName', 'category', 'rating']
        }
      ],
      limit,
      offset,
      order: [['overallRating', 'DESC']]
    });
  }

  /**
   * Calcula estadísticas de evaluaciones por speaker
   */
  static async getSpeakerStats(speakerId: number): Promise<{
    totalEvaluations: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    criteriaAverages: Record<string, number>;
  }> {
    const evaluations = await this.findAll({
      where: { speakerId },
      attributes: ['overallRating', 'criteriaRatings']
    });

    const totalEvaluations = evaluations.length;
    const averageRating = totalEvaluations > 0
      ? evaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / totalEvaluations
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const criteriaSums: Record<string, { sum: number; count: number }> = {};

    evaluations.forEach(evaluation => {
      const rating = Math.floor(evaluation.overallRating);
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;

      Object.entries(evaluation.criteriaRatings).forEach(([criterion, rating]) => {
        if (!criteriaSums[criterion]) {
          criteriaSums[criterion] = { sum: 0, count: 0 };
        }
        criteriaSums[criterion].sum += rating;
        criteriaSums[criterion].count += 1;
      });
    });

    const criteriaAverages: Record<string, number> = {};
    Object.entries(criteriaSums).forEach(([criterion, { sum, count }]) => {
      criteriaAverages[criterion] = Math.round((sum / count) * 100) / 100;
    });

    return {
      totalEvaluations,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      criteriaAverages
    };
  }
}
