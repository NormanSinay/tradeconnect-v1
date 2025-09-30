/**
 * @fileoverview Modelo de Inscripción a Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Inscripción a Evento
 *
 * Archivo: backend/src/models/EventRegistration.ts
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
  Index,
  Default,
  ForeignKey
} from 'sequelize-typescript';
import { User } from './User';
import { Event } from './Event';
import { EventStatus } from './EventStatus';

/**
 * Atributos del modelo Inscripción a Evento
 */
export interface EventRegistrationAttributes {
  id?: number;
  eventId: number;
  userId: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  registrationData?: any;
  registrationNumber?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentAmount?: number;
  paymentReference?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  registeredAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de inscripción a evento
 */
export interface EventRegistrationCreationAttributes extends Omit<EventRegistrationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'registeredAt' | 'registrationNumber'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventRegistration:
 *       type: object
 *       required:
 *         - eventId
 *         - userId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la inscripción
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *         userId:
 *           type: integer
 *           description: ID del usuario inscrito
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, attended, no_show]
 *           description: Estado de la inscripción
 *           default: pending
 *         registrationData:
 *           type: object
 *           description: Datos adicionales de la inscripción
 *         registrationNumber:
 *           type: string
 *           description: Número único de inscripción
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, refunded, cancelled]
 *           description: Estado del pago
 *         paymentAmount:
 *           type: number
 *           description: Monto pagado
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: Hora de check-in
 *         registeredAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inscripción
 */

@Table({
  tableName: 'event_registrations',
  modelName: 'EventRegistration',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['registration_number']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['registered_at']
    },
    {
      fields: ['check_in_time']
    },
    {
      unique: true,
      fields: ['event_id', 'user_id']
    }
  ]
})
export class EventRegistration extends Model<EventRegistrationAttributes, EventRegistrationCreationAttributes> implements EventRegistrationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del evento'
  })
  declare eventId: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario inscrito'
  })
  declare userId: number;

  @Default('pending')
  @Index
  @Validate({
    isIn: {
      args: [['pending', 'confirmed', 'cancelled', 'attended', 'no_show']],
      msg: 'Estado de inscripción inválido'
    }
  })
  @Column({
    type: DataType.ENUM('pending', 'confirmed', 'cancelled', 'attended', 'no_show'),
    comment: 'Estado de la inscripción'
  })
  declare status: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';

  @Column({
    type: DataType.JSON,
    comment: 'Datos adicionales de la inscripción'
  })
  declare registrationData?: any;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El número de inscripción no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Número único de inscripción'
  })
  declare registrationNumber?: string;

  @Validate({
    isIn: {
      args: [['pending', 'paid', 'refunded', 'cancelled']],
      msg: 'Estado de pago inválido'
    }
  })
  @Column({
    type: DataType.ENUM('pending', 'paid', 'refunded', 'cancelled'),
    comment: 'Estado del pago (si aplica)'
  })
  declare paymentStatus?: 'pending' | 'paid' | 'refunded' | 'cancelled';

  @Validate({
    min: {
      args: [0],
      msg: 'El monto de pago no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto pagado'
  })
  declare paymentAmount?: number;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'La referencia de pago no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Referencia del pago'
  })
  declare paymentReference?: string;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Hora de check-in al evento'
  })
  declare checkInTime?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Hora de check-out del evento'
  })
  declare checkOutTime?: Date;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    comment: 'Fecha y hora de inscripción'
  })
  declare registeredAt: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de cancelación'
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

  @BelongsTo(() => Event)
  declare event: Event;

  @BelongsTo(() => User)
  declare user: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la inscripción está activa
   */
  public get isActive(): boolean {
    return ['pending', 'confirmed'].includes(this.status);
  }

  /**
   * Verifica si el pago está completado
   */
  public get isPaymentCompleted(): boolean {
    return this.paymentStatus === 'paid';
  }

  /**
   * Verifica si el usuario asistió al evento
   */
  public get hasAttended(): boolean {
    return this.status === 'attended' && !!this.checkInTime;
  }

  /**
   * Calcula la duración de asistencia
   */
  public get attendanceDuration(): number | null {
    if (!this.checkInTime || !this.checkOutTime) return null;
    return this.checkOutTime.getTime() - this.checkInTime.getTime();
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca inscripciones por evento
   */
  static async findByEvent(eventId: number, options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: EventRegistration[]; count: number }> {
    const { status, limit = 50, offset = 0 } = options;

    const where: any = { eventId };
    if (status) {
      where.status = status;
    }

    return this.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit,
      offset,
      order: [['registeredAt', 'ASC']]
    });
  }

  /**
   * Busca inscripciones por usuario
   */
  static async findByUser(userId: number, options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: EventRegistration[]; count: number }> {
    const { status, limit = 20, offset = 0 } = options;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'startDate', 'endDate', 'location'],
          include: [
            { model: EventStatus, as: 'eventStatus', attributes: ['name', 'displayName'] }
          ]
        }
      ],
      limit,
      offset,
      order: [['registeredAt', 'DESC']]
    });
  }

  /**
   * Verifica si un usuario está inscrito en un evento
   */
  static async isUserRegistered(eventId: number, userId: number): Promise<boolean> {
    const registration = await this.findOne({
      where: { eventId, userId }
    });
    return !!registration;
  }

  /**
   * Genera un número único de inscripción
   */
  static generateRegistrationNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REG${timestamp}${random}`;
  }
}