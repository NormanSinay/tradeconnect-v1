/**
 * @fileoverview Modelo de Duplicación de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Duplicación de Evento
 *
 * Archivo: backend/src/models/EventDuplication.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Unique,
  Index,
  ForeignKey
} from 'sequelize-typescript';
import { User } from './User';
import { Event } from './Event';

/**
 * Atributos del modelo Duplicación de Evento
 */
export interface EventDuplicationAttributes {
  id?: number;
  sourceEventId: number;
  duplicatedEventId: number;
  duplicatedBy: number;
  duplicatedAt: Date;
  modifications?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de duplicación de evento
 */
export interface EventDuplicationCreationAttributes extends Omit<EventDuplicationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'duplicatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventDuplication:
 *       type: object
 *       required:
 *         - sourceEventId
 *         - duplicatedEventId
 *         - duplicatedBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la duplicación
 *           example: 1
 *         sourceEventId:
 *           type: integer
 *           description: ID del evento original
 *         duplicatedEventId:
 *           type: integer
 *           description: ID del evento duplicado
 *         duplicatedBy:
 *           type: integer
 *           description: ID del usuario que realizó la duplicación
 *         duplicatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la duplicación
 *         modifications:
 *           type: object
 *           description: Modificaciones realizadas al evento duplicado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'event_duplications',
  modelName: 'EventDuplication',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['source_event_id']
    },
    {
      unique: true,
      fields: ['duplicated_event_id']
    },
    {
      fields: ['duplicated_by']
    },
    {
      fields: ['duplicated_at']
    }
  ]
})
export class EventDuplication extends Model<EventDuplicationAttributes, EventDuplicationCreationAttributes> implements EventDuplicationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del evento original'
  })
  declare sourceEventId: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Unique
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del evento duplicado'
  })
  declare duplicatedEventId: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que realizó la duplicación'
  })
  declare duplicatedBy: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    comment: 'Fecha y hora de la duplicación'
  })
  declare duplicatedAt: Date;

  @Column({
    type: DataType.JSON,
    comment: 'Modificaciones realizadas al evento duplicado'
  })
  declare modifications?: any;

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

  @BelongsTo(() => Event, 'sourceEventId')
  declare sourceEvent: Event;

  @BelongsTo(() => Event, 'duplicatedEventId')
  declare duplicatedEvent: Event;

  @BelongsTo(() => User, 'duplicatedBy')
  declare duplicator: User;

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca duplicaciones por evento original
   */
  static async findBySourceEvent(sourceEventId: number): Promise<EventDuplication[]> {
    return this.findAll({
      where: { sourceEventId },
      include: [
        { model: Event, as: 'duplicatedEvent' },
        { model: User, as: 'duplicator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['duplicatedAt', 'DESC']]
    });
  }

  /**
   * Busca duplicaciones por usuario
   */
  static async findByUser(userId: number, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: EventDuplication[]; count: number }> {
    const { limit = 20, offset = 0 } = options;

    return this.findAndCountAll({
      where: { duplicatedBy: userId },
      include: [
        { model: Event, as: 'sourceEvent', attributes: ['id', 'title'] },
        { model: Event, as: 'duplicatedEvent', attributes: ['id', 'title'] }
      ],
      limit,
      offset,
      order: [['duplicatedAt', 'DESC']]
    });
  }

  /**
   * Verifica si un evento es una duplicación
   */
  static async isDuplication(eventId: number): Promise<boolean> {
    const duplication = await this.findOne({
      where: { duplicatedEventId: eventId }
    });
    return !!duplication;
  }

  /**
   * Obtiene el evento original de una duplicación
   */
  static async getOriginalEvent(duplicatedEventId: number): Promise<Event | null> {
    const duplication = await this.findOne({
      where: { duplicatedEventId },
      include: [{ model: Event, as: 'sourceEvent' }]
    });
    return duplication?.sourceEvent || null;
  }
}
