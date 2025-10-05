/**
 * @fileoverview Modelo de Sesión de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para sesiones específicas dentro de eventos
 *
 * Archivo: backend/src/models/EventSession.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey,
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Event } from './Event';
import { User } from './User';

/**
 * Atributos del modelo EventSession
 */
export interface EventSessionAttributes {
  id?: number;
  eventId: number;
  title: string;
  description?: string;
  sessionType: 'date' | 'time_slot' | 'workshop' | 'track' | 'other';
  startDate: Date;
  endDate: Date;
  capacity?: number;
  availableCapacity: number;
  blockedCapacity: number;
  location?: string;
  virtualLocation?: string;
  isVirtual: boolean;
  price?: number;
  currency: string;
  requirements?: string;
  metadata?: any;
  isActive: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de sesión de evento
 */
export interface EventSessionCreationAttributes extends Omit<EventSessionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'availableCapacity' | 'blockedCapacity'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventSession:
 *       type: object
 *       required:
 *         - eventId
 *         - title
 *         - sessionType
 *         - startDate
 *         - endDate
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la sesión
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento padre
 *           example: 1
 *         title:
 *           type: string
 *           description: Título de la sesión
 *           example: "Día 1 - Mañana"
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         sessionType:
 *           type: string
 *           enum: [date, time_slot, workshop, track, other]
 *           description: Tipo de sesión
 *           example: "date"
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inicio
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de fin
 *         capacity:
 *           type: integer
 *           description: Capacidad máxima de la sesión
 *           example: 100
 *         availableCapacity:
 *           type: integer
 *           description: Capacidad disponible actual
 *           example: 80
 *         blockedCapacity:
 *           type: integer
 *           description: Capacidad bloqueada temporalmente
 *           example: 5
 *         location:
 *           type: string
 *           description: Ubicación física
 *         virtualLocation:
 *           type: string
 *           description: Enlace virtual
 *         isVirtual:
 *           type: boolean
 *           description: Si es virtual
 *           example: false
 *         price:
 *           type: number
 *           description: Precio específico de la sesión
 *         currency:
 *           type: string
 *           description: Moneda
 *           example: "GTQ"
 *         requirements:
 *           type: string
 *           description: Requisitos específicos
 *         isActive:
 *           type: boolean
 *           description: Si está activa
 *           example: true
 *         createdBy:
 *           type: integer
 *           description: Usuario creador
 *           example: 1
 */

@Table({
  tableName: 'event_sessions',
  modelName: 'EventSession',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['session_type']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    },
    {
      unique: true,
      fields: ['event_id', 'title'],
      where: {
        deleted_at: null
      }
    }
  ]
})
export class EventSession extends Model<EventSessionAttributes, EventSessionCreationAttributes> implements EventSessionAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento padre'
  })
  declare eventId: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El título de la sesión es requerido'
    },
    len: {
      args: [3, 255],
      msg: 'El título debe tener entre 3 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Título de la sesión'
  })
  declare title: string;

  @Validate({
    len: {
      args: [0, 2000],
      msg: 'La descripción no puede exceder 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada de la sesión'
  })
  declare description?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['date', 'time_slot', 'workshop', 'track', 'other']],
      msg: 'Tipo de sesión inválido'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('date', 'time_slot', 'workshop', 'track', 'other'),
    comment: 'Tipo de sesión'
  })
  declare sessionType: 'date' | 'time_slot' | 'workshop' | 'track' | 'other';

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio debe ser una fecha válida'
    }
  })
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de inicio de la sesión'
  })
  declare startDate: Date;

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de fin debe ser una fecha válida'
    }
  })
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de fin de la sesión'
  })
  declare endDate: Date;

  @Validate({
    min: {
      args: [1],
      msg: 'La capacidad debe ser al menos 1'
    },
    max: {
      args: [100000],
      msg: 'La capacidad no puede exceder 100,000'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad máxima de la sesión'
  })
  declare capacity?: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'La capacidad disponible no puede ser negativa'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad disponible actual (calculada)'
  })
  declare availableCapacity: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'La capacidad bloqueada no puede ser negativa'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad bloqueada temporalmente'
  })
  declare blockedCapacity: number;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La ubicación no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Ubicación física de la sesión'
  })
  declare location?: string;

  @Validate({
    isUrl: {
      msg: 'La ubicación virtual debe ser una URL válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Enlace para sesiones virtuales'
  })
  declare virtualLocation?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la sesión es virtual'
  })
  declare isVirtual: boolean;

  @Validate({
    min: {
      args: [0],
      msg: 'El precio no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio específico de la sesión (null = precio del evento)'
  })
  declare price?: number;

  @Default('GTQ')
  @Validate({
    isIn: {
      args: [['GTQ', 'USD']],
      msg: 'La moneda debe ser GTQ o USD'
    }
  })
  @Column({
    type: DataType.STRING(3),
    comment: 'Moneda del precio'
  })
  declare currency: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Los requisitos no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Requisitos específicos de la sesión'
  })
  declare requirements?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de la sesión'
  })
  declare metadata?: any;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la sesión está activa'
  })
  declare isActive: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la sesión'
  })
  declare createdBy: number;

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

  @BelongsTo(() => Event, { foreignKey: 'eventId', as: 'sessionParentEventRef' })
  declare sessionParentEventRef: Event;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateDates(session: EventSession): Promise<void> {
    if (session.endDate <= session.startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validateVirtualSession(session: EventSession): Promise<void> {
    if (session.isVirtual && !session.virtualLocation) {
      throw new Error('Las sesiones virtuales requieren una ubicación virtual (URL)');
    }
    if (!session.isVirtual && !session.location) {
      throw new Error('Las sesiones presenciales requieren una ubicación física');
    }
  }

  @BeforeCreate
  static async initializeAvailableCapacity(session: EventSession): Promise<void> {
    // Si no se especifica capacidad disponible, inicializar con capacidad total
    if (session.availableCapacity === undefined || session.availableCapacity === null) {
      session.availableCapacity = session.capacity || 0;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la sesión tiene capacidad disponible
   */
  public get hasAvailableCapacity(): boolean {
    return this.availableCapacity > 0;
  }

  /**
   * Calcula el porcentaje de ocupación actual
   */
  public get utilizationPercentage(): number {
    if (!this.capacity || this.capacity === 0) return 0;
    const occupied = this.capacity - this.availableCapacity;
    return Math.round((occupied / this.capacity) * 100);
  }

  /**
   * Verifica si la sesión está llena
   */
  public get isFull(): boolean {
    return this.availableCapacity === 0;
  }

  /**
   * Verifica si puede bloquear capacidad adicional
   */
  public canBlockCapacity(requestedAmount: number): boolean {
    if (!this.capacity) return false;
    const currentlyOccupied = this.capacity - this.availableCapacity;
    return (currentlyOccupied + this.blockedCapacity + requestedAmount) <= this.capacity;
  }

  /**
   * Obtiene el precio efectivo (sesión o evento)
   */
  public get effectivePrice(): number {
    return this.price || this.sessionParentEventRef?.price || 0;
  }

  /**
   * Verifica si la sesión está activa y disponible
   */
  public get isAvailable(): boolean {
    const now = new Date();
    return this.isActive &&
           this.startDate > now &&
           this.hasAvailableCapacity;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      title: this.title,
      description: this.description,
      sessionType: this.sessionType,
      startDate: this.startDate,
      endDate: this.endDate,
      capacity: this.capacity,
      availableCapacity: this.availableCapacity,
      blockedCapacity: this.blockedCapacity,
      utilizationPercentage: this.utilizationPercentage,
      location: this.location,
      virtualLocation: this.virtualLocation,
      isVirtual: this.isVirtual,
      price: this.effectivePrice,
      currency: this.currency,
      requirements: this.requirements,
      isActive: this.isActive,
      isAvailable: this.isAvailable,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas administrativas
   */
  public toAdminJSON(): object {
    return {
      ...this.toPublicJSON(),
      metadata: this.metadata,
      createdBy: this.createdBy,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca sesiones por evento
   */
  static async findByEventId(eventId: number, includeInactive: boolean = false): Promise<EventSession[]> {
    const where: any = { eventId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.findAll({
      where,
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'creator' }
      ],
      order: [
        ['startDate', 'ASC'],
        ['title', 'ASC']
      ]
    });
  }

  /**
   * Busca sesiones disponibles para un evento
   */
  static async findAvailableSessions(eventId: number): Promise<EventSession[]> {
    const now = new Date();

    return this.findAll({
      where: {
        eventId,
        isActive: true,
        startDate: { [Op.gt]: now },
        availableCapacity: { [Op.gt]: 0 }
      },
      include: [
        { model: Event, as: 'event' }
      ],
      order: [
        ['startDate', 'ASC'],
        ['title', 'ASC']
      ]
    });
  }

  /**
   * Busca sesiones por tipo
   */
  static async findByType(eventId: number, sessionType: string, includeInactive: boolean = false): Promise<EventSession[]> {
    const where: any = {
      eventId,
      sessionType
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    return this.findAll({
      where,
      include: [
        { model: Event, as: 'event' }
      ],
      order: [
        ['startDate', 'ASC'],
        ['title', 'ASC']
      ]
    });
  }

  /**
   * Obtiene estadísticas de sesiones por evento
   */
  static async getEventSessionsStats(eventId: number): Promise<any> {
    const sessions = await this.findAll({
      where: { eventId, isActive: true },
      attributes: [
        'sessionType',
        'capacity',
        'availableCapacity',
        'blockedCapacity'
      ]
    });

    const stats = {
      totalSessions: sessions.length,
      sessionsByType: {} as any,
      totalCapacity: 0,
      totalAvailable: 0,
      totalBlocked: 0,
      averageUtilization: 0
    };

    for (const session of sessions) {
      // Estadísticas por tipo
      if (!stats.sessionsByType[session.sessionType]) {
        stats.sessionsByType[session.sessionType] = {
          count: 0,
          totalCapacity: 0,
          totalAvailable: 0,
          totalBlocked: 0
        };
      }

      stats.sessionsByType[session.sessionType].count++;
      stats.sessionsByType[session.sessionType].totalCapacity += session.capacity || 0;
      stats.sessionsByType[session.sessionType].totalAvailable += session.availableCapacity;
      stats.sessionsByType[session.sessionType].totalBlocked += session.blockedCapacity;

      // Estadísticas totales
      stats.totalCapacity += session.capacity || 0;
      stats.totalAvailable += session.availableCapacity;
      stats.totalBlocked += session.blockedCapacity;
    }

    // Calcular utilización promedio
    if (stats.totalSessions > 0) {
      const totalUtilization = sessions.reduce((sum, session) => {
        return sum + session.utilizationPercentage;
      }, 0);
      stats.averageUtilization = Math.round(totalUtilization / stats.totalSessions);
    }

    return stats;
  }
}