/**
 * @fileoverview Modelo de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Evento con validaciones y métodos
 *
 * Archivo: backend/src/models/Event.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  BelongsTo,
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
import { User } from './User';
import { EventType } from './EventType';
import { EventCategory } from './EventCategory';
import { EventStatus } from './EventStatus';
import { EventRegistration } from './EventRegistration';
import { EventMedia } from './EventMedia';
import { EventDuplication } from './EventDuplication';
import { EventTemplate } from './EventTemplate';

/**
 * Atributos del modelo Evento
 */
export interface EventAttributes {
  id?: number;
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  virtualLocation?: string;
  isVirtual: boolean;
  price: number;
  currency: string;
  capacity?: number;
  registeredCount: number;
  minAge?: number;
  maxAge?: number;
  tags?: string[];
  requirements?: string;
  agenda?: any;
  metadata?: any;
  eventTypeId: number;
  eventCategoryId: number;
  eventStatusId: number;
  eventTemplateId?: number;
  minPrice?: number;
  createdBy: number;
  publishedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de evento
 */
export interface EventCreationAttributes extends Omit<EventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'registeredCount'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - startDate
 *         - endDate
 *         - eventTypeId
 *         - eventCategoryId
 *         - eventStatusId
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del evento
 *           example: 1
 *         title:
 *           type: string
 *           description: Título del evento
 *           example: "Conferencia de Tecnología 2024"
 *         description:
 *           type: string
 *           description: Descripción detallada del evento
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inicio
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de fin
 *         location:
 *           type: string
 *           description: Ubicación física del evento
 *         isVirtual:
 *           type: boolean
 *           description: Indica si es un evento virtual
 *         price:
 *           type: number
 *           description: Precio del evento
 *           default: 0
 *         capacity:
 *           type: integer
 *           description: Capacidad máxima
 *         registeredCount:
 *           type: integer
 *           description: Número actual de registrados
 *           default: 0
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de publicación
 */

@Table({
  tableName: 'events',
  modelName: 'Event',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['event_type_id']
    },
    {
      fields: ['event_category_id']
    },
    {
      fields: ['event_status_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['is_virtual']
    },
    {
      fields: ['price']
    },
    {
      fields: ['published_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El título del evento es requerido'
    },
    len: {
      args: [3, 255],
      msg: 'El título debe tener entre 3 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Título del evento'
  })
  declare title: string;

  @Validate({
    len: {
      args: [0, 5000],
      msg: 'La descripción no puede exceder 5000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada del evento'
  })
  declare description?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción corta no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'Descripción corta para listados'
  })
  declare shortDescription?: string;

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de inicio del evento'
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
    comment: 'Fecha y hora de fin del evento'
  })
  declare endDate: Date;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La ubicación no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Ubicación del evento (dirección, sala, etc.)'
  })
  declare location?: string;

  @Validate({
    isUrl: {
      msg: 'La ubicación virtual debe ser una URL válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Enlace para eventos virtuales'
  })
  declare virtualLocation?: string;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es un evento virtual'
  })
  declare isVirtual: boolean;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'El precio no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio del evento (0 = gratuito)'
  })
  declare price: number;

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
    min: {
      args: [1],
      msg: 'La capacidad debe ser al menos 1'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad máxima del evento'
  })
  declare capacity?: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número actual de registrados'
  })
  declare registeredCount: number;

  @Validate({
    min: {
      args: [0],
      msg: 'La edad mínima debe ser mayor o igual a 0'
    },
    max: {
      args: [120],
      msg: 'La edad mínima no puede exceder 120 años'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Edad mínima requerida'
  })
  declare minAge?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'La edad máxima debe ser mayor o igual a 0'
    },
    max: {
      args: [120],
      msg: 'La edad máxima no puede exceder 120 años'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Edad máxima permitida'
  })
  declare maxAge?: number;

  @Column({
    type: DataType.JSON,
    comment: 'Etiquetas del evento (array de strings)'
  })
  declare tags?: string[];

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Los requisitos no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Requisitos para participar'
  })
  declare requirements?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Agenda del evento (array de sesiones)'
  })
  declare agenda?: any;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del evento'
  })
  declare metadata?: any;

  @ForeignKey(() => EventType)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al tipo de evento'
  })
  declare eventTypeId: number;

  @ForeignKey(() => EventCategory)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia a la categoría del evento'
  })
  declare eventCategoryId: number;

  @ForeignKey(() => EventStatus)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al estado del evento'
  })
  declare eventStatusId: number;

  @ForeignKey(() => EventTemplate)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia a la plantilla usada para crear el evento (opcional)'
  })
  declare eventTemplateId?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El precio mínimo no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio mínimo del evento (floor price para descuentos)'
  })
  declare minPrice?: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el evento'
  })
  declare createdBy: number;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de publicación del evento'
  })
  declare publishedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de cancelación del evento'
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

  @BelongsTo(() => EventType)
  declare eventType: EventType;

  @BelongsTo(() => EventCategory)
  declare eventCategory: EventCategory;

  @BelongsTo(() => EventStatus)
  declare eventStatus: EventStatus;

  @BelongsTo(() => EventTemplate)
  declare eventTemplate: EventTemplate;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @HasMany(() => EventRegistration)
  declare registrations: EventRegistration[];

  @HasMany(() => EventMedia)
  declare media: EventMedia[];

  @HasMany(() => EventDuplication, 'sourceEventId')
  declare duplications: EventDuplication[];

  @HasMany(() => EventDuplication, 'duplicatedEventId')
  declare sourceDuplications: EventDuplication[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateDates(event: Event): Promise<void> {
    if (event.endDate <= event.startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validateVirtualEvent(event: Event): Promise<void> {
    if (event.isVirtual && !event.virtualLocation) {
      throw new Error('Los eventos virtuales requieren una ubicación virtual (URL)');
    }
    if (!event.isVirtual && !event.location) {
      throw new Error('Los eventos presenciales requieren una ubicación física');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el evento está disponible para registro
   */
  public get isAvailableForRegistration(): boolean {
    const now = new Date();
    return this.eventStatus.name === 'published' &&
           this.startDate > now &&
           (this.capacity === undefined || this.registeredCount < this.capacity);
  }

  /**
   * Obtiene el número de lugares disponibles
   */
  public get availableSpots(): number | null {
    if (this.capacity === undefined) return null;
    return Math.max(0, this.capacity - this.registeredCount);
  }

  /**
   * Verifica si el evento ha terminado
   */
  public get isFinished(): boolean {
    return new Date() > this.endDate;
  }

  /**
   * Verifica si el evento está activo
   */
  public get isActive(): boolean {
    return this.eventStatus.name !== 'cancelled' && !this.isFinished;
  }

  /**
   * Serializa el evento para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      title: this.title,
      shortDescription: this.shortDescription,
      startDate: this.startDate,
      endDate: this.endDate,
      location: this.location,
      virtualLocation: this.virtualLocation,
      isVirtual: this.isVirtual,
      price: this.price,
      currency: this.currency,
      capacity: this.capacity,
      registeredCount: this.registeredCount,
      availableSpots: this.availableSpots,
      tags: this.tags,
      eventType: this.eventType?.toJSON(),
      eventCategory: this.eventCategory?.toJSON(),
      eventStatus: this.eventStatus?.toJSON(),
      publishedAt: this.publishedAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el evento para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      description: this.description,
      minAge: this.minAge,
      maxAge: this.maxAge,
      requirements: this.requirements,
      agenda: this.agenda,
      metadata: this.metadata,
      creator: this.creator?.toPublicJSON(),
      cancelledAt: this.cancelledAt,
      cancellationReason: this.cancellationReason,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca eventos publicados y activos
   */
  static async findPublishedEvents(options: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    typeId?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }): Promise<{ rows: Event[]; count: number }> {
    const {
      limit = 20,
      offset = 0,
      categoryId,
      typeId,
      startDate,
      endDate,
      search
    } = options;

    const where: any = {
      '$eventStatus.name$': 'published',
      startDate: { $gte: new Date() }
    };

    if (categoryId) {
      where.eventCategoryId = categoryId;
    }

    if (typeId) {
      where.eventTypeId = typeId;
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.$gte = startDate;
      if (endDate) where.startDate.$lte = endDate;
    }

    if (search) {
      where.$or = [
        { title: { $iLike: `%${search}%` } },
        { description: { $iLike: `%${search}%` } },
        { shortDescription: { $iLike: `%${search}%` } }
      ];
    }

    return this.findAndCountAll({
      where,
      include: [
        { model: EventType, as: 'eventType' },
        { model: EventCategory, as: 'eventCategory' },
        { model: EventStatus, as: 'eventStatus' }
      ],
      limit,
      offset,
      order: [['startDate', 'ASC']]
    });
  }

  /**
   * Busca eventos por creador
   */
  static async findByCreator(creatorId: number, options: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}): Promise<{ rows: Event[]; count: number }> {
    const { limit = 20, offset = 0, status } = options;

    const where: any = { createdBy: creatorId };

    if (status) {
      where.eventStatusId = status;
    }

    return this.findAndCountAll({
      where,
      include: [
        { model: EventType, as: 'eventType' },
        { model: EventCategory, as: 'eventCategory' },
        { model: EventStatus, as: 'eventStatus' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }
}
