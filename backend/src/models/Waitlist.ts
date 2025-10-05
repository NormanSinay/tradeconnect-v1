/**
 * @fileoverview Modelo de Lista de Espera para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Lista de Espera
 *
 * Archivo: backend/src/models/Waitlist.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Event } from './Event';
import { AccessType } from './AccessType';
import { User } from './User';

/**
 * Estados de lista de espera
 */
export type WaitlistStatus = 'ACTIVE' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

/**
 * Atributos del modelo Waitlist
 */
export interface WaitlistAttributes {
  id?: number;
  eventId: number;
  accessTypeId?: number;
  userId: number;
  position: number;
  status: WaitlistStatus;
  notifiedAt?: Date;
  expiresAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de entrada en lista de espera
 */
export interface WaitlistCreationAttributes extends Omit<WaitlistAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'position'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Waitlist:
 *       type: object
 *       required:
 *         - eventId
 *         - userId
 *         - position
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la entrada en lista de espera
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *           example: 1
 *         accessTypeId:
 *           type: integer
 *           description: ID del tipo de acceso (opcional)
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario
 *           example: 1
 *         position:
 *           type: integer
 *           description: Posición en la cola
 *           example: 1
 *         status:
 *           type: string
 *           enum: [ACTIVE, NOTIFIED, CONFIRMED, EXPIRED, CANCELLED]
 *           description: Estado de la entrada
 *           example: "ACTIVE"
 *         notifiedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de notificación
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración
 *         confirmedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de confirmación
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de cancelación
 */

@Table({
  tableName: 'waitlists',
  modelName: 'Waitlist',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['access_type_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['position']
    },
    {
      fields: ['event_id', 'status']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Waitlist extends Model<WaitlistAttributes, WaitlistCreationAttributes> implements WaitlistAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento'
  })
  declare eventId: number;

  @ForeignKey(() => AccessType)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Tipo de acceso específico (opcional)'
  })
  declare accessTypeId?: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario en lista de espera'
  })
  declare userId: number;

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [1],
      msg: 'La posición debe ser mayor o igual a 1'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Posición en la cola (1 = primero)'
  })
  declare position: number;

  @AllowNull(false)
  @Index
  @Default('ACTIVE')
  @Column({
    type: DataType.ENUM('ACTIVE', 'NOTIFIED', 'CONFIRMED', 'EXPIRED', 'CANCELLED'),
    comment: 'Estado de la entrada en lista de espera'
  })
  declare status: WaitlistStatus;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de notificación de disponibilidad'
  })
  declare notifiedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de la oferta'
  })
  declare expiresAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de confirmación'
  })
  declare confirmedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de cancelación'
  })
  declare cancelledAt?: Date;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales (preferencias, notas, etc.)'
  })
  declare metadata?: any;

  @CreatedAt
  @Index
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

  @BelongsTo(() => Event)
  declare event: Event;

  @BelongsTo(() => AccessType)
  declare accessType?: AccessType;

  @BelongsTo(() => User)
  declare user: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateWaitlist(waitlist: Waitlist): Promise<void> {
    // Validar que el usuario no esté ya en la lista de espera para el mismo evento/tipo
    if (waitlist.eventId && waitlist.userId) {
      const whereCondition: any = {
        eventId: waitlist.eventId,
        userId: waitlist.userId,
        status: { [Op.in]: ['ACTIVE', 'NOTIFIED'] },
        id: { [Op.ne]: waitlist.id || 0 }
      };

      if (waitlist.accessTypeId !== undefined) {
        whereCondition.accessTypeId = waitlist.accessTypeId;
      } else {
        whereCondition.accessTypeId = null;
      }

      const existingEntry = await Waitlist.findOne({
        where: whereCondition
      });

      if (existingEntry) {
        throw new Error('El usuario ya está en la lista de espera para este evento/tipo de acceso');
      }
    }

    // Validar fechas
    if (waitlist.expiresAt && waitlist.notifiedAt && waitlist.expiresAt <= waitlist.notifiedAt) {
      throw new Error('La fecha de expiración debe ser posterior a la fecha de notificación');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la entrada está activa
   */
  public get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * Verifica si la entrada ha expirado
   */
  public get isExpired(): boolean {
    return this.status === 'EXPIRED' ||
           (this.expiresAt !== undefined && new Date() > this.expiresAt && this.status === 'NOTIFIED');
  }

  /**
   * Verifica si puede ser notificada
   */
  public get canBeNotified(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * Obtiene tiempo restante para confirmar (en horas)
   */
  public get hoursToExpire(): number | null {
    if (!this.expiresAt || this.status !== 'NOTIFIED') return null;

    const now = new Date();
    const diffMs = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      accessTypeId: this.accessTypeId,
      position: this.position,
      status: this.status,
      notifiedAt: this.notifiedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      isActive: this.isActive,
      isExpired: this.isExpired,
      hoursToExpire: this.hoursToExpire
    };
  }

  /**
   * Serializa para respuestas administrativas
   */
  public toAdminJSON(): object {
    return {
      ...this.toPublicJSON(),
      userId: this.userId,
      confirmedAt: this.confirmedAt,
      cancelledAt: this.cancelledAt,
      metadata: this.metadata,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca entradas activas por evento
   */
  static async findActiveByEvent(eventId: number, accessTypeId?: number): Promise<Waitlist[]> {
    const where: any = {
      eventId,
      status: 'ACTIVE'
    };

    if (accessTypeId) {
      where.accessTypeId = accessTypeId;
    }

    return this.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: AccessType, as: 'accessType', attributes: ['id', 'name', 'displayName'] }
      ],
      order: [['position', 'ASC']]
    });
  }

  /**
   * Obtiene la siguiente posición disponible para un evento
   */
  static async getNextPosition(eventId: number, accessTypeId?: number): Promise<number> {
    const where: any = {
      eventId,
      status: { [Op.in]: ['ACTIVE', 'NOTIFIED'] }
    };

    if (accessTypeId) {
      where.accessTypeId = accessTypeId;
    }

    const lastEntry = await this.findOne({
      where,
      order: [['position', 'DESC']]
    });

    return lastEntry ? lastEntry.position + 1 : 1;
  }

  /**
   * Busca entradas expiradas para procesar
   */
  static async findExpiredEntries(): Promise<Waitlist[]> {
    return this.findAll({
      where: {
        status: 'NOTIFIED',
        expiresAt: { [Op.lt]: new Date() }
      },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'user' }
      ]
    });
  }

  /**
   * Actualiza posiciones después de remover una entrada
   */
  static async updatePositionsAfterRemoval(eventId: number, removedPosition: number, accessTypeId?: number): Promise<void> {
    const where: any = {
      eventId,
      position: { [Op.gt]: removedPosition },
      status: { [Op.in]: ['ACTIVE', 'NOTIFIED'] }
    };

    if (accessTypeId) {
      where.accessTypeId = accessTypeId;
    }

    await this.decrement('position', {
      where,
      by: 1
    });
  }

  /**
   * Obtiene estadísticas de lista de espera por evento
   */
  static async getWaitlistStats(eventId: number): Promise<{
    total: number;
    active: number;
    notified: number;
    confirmed: number;
    expired: number;
    cancelled: number;
  }> {
    const allEntries = await this.findAll({
      where: { eventId },
      attributes: ['status'],
      raw: true
    });

    const result = {
      total: allEntries.length,
      active: 0,
      notified: 0,
      confirmed: 0,
      expired: 0,
      cancelled: 0
    };

    allEntries.forEach((entry: any) => {
      switch (entry.status) {
        case 'ACTIVE':
          result.active++;
          break;
        case 'NOTIFIED':
          result.notified++;
          break;
        case 'CONFIRMED':
          result.confirmed++;
          break;
        case 'EXPIRED':
          result.expired++;
          break;
        case 'CANCELLED':
          result.cancelled++;
          break;
      }
    });

    return result;
  }
}