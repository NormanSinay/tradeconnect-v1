/**
 * @fileoverview Modelo de GroupRegistration para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad GroupRegistration con validaciones y métodos
 *
 * Archivo: backend/src/models/GroupRegistration.ts
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
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey,
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from './User';
import { Event } from './Event';
import { Registration } from './Registration';

/**
 * Estados de inscripción grupal
 */
export type GroupRegistrationStatus =
  | 'BORRADOR'
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'EXPIRADO'
  | 'REEMBOLSADO';

/**
 * Atributos del modelo GroupRegistration
 */
export interface GroupRegistrationAttributes {
  id?: number;
  groupCode: string;
  eventId: number;
  organizerId: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  nit?: string;
  participantCount: number;
  basePrice: number;
  groupDiscountPercent: number;
  discountAmount: number;
  finalPrice: number;
  status: GroupRegistrationStatus;
  paymentReference?: string;
  reservationExpiresAt?: Date;
  notes?: string;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de group registration
 */
export interface GroupRegistrationCreationAttributes extends Omit<GroupRegistrationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupRegistration:
 *       type: object
 *       required:
 *         - groupCode
 *         - eventId
 *         - organizerId
 *         - companyName
 *         - contactEmail
 *         - contactPhone
 *         - participantCount
 *         - basePrice
 *         - groupDiscountPercent
 *         - discountAmount
 *         - finalPrice
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la inscripción grupal
 *           example: 1
 *         groupCode:
 *           type: string
 *           description: Código grupal maestro
 *           example: "GRP-20241201-0001"
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *         organizerId:
 *           type: integer
 *           description: ID del organizador del grupo
 *         companyName:
 *           type: string
 *           description: Nombre de la empresa
 *         participantCount:
 *           type: integer
 *           description: Cantidad total de participantes
 *         status:
 *           type: string
 *           enum: [BORRADOR, PENDIENTE_PAGO, PAGADO, CONFIRMADO, CANCELADO, EXPIRADO, REEMBOLSADO]
 *           description: Estado de la inscripción grupal
 */

@Table({
  tableName: 'group_registrations',
  modelName: 'GroupRegistration',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['group_code'],
      unique: true
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['organizer_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['reservation_expires_at']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class GroupRegistration extends Model<GroupRegistrationAttributes, GroupRegistrationCreationAttributes> implements GroupRegistrationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El código grupal es requerido'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Código grupal maestro (GRP-YYYYMMDD-XXXXX)',
    unique: true
  })
  declare groupCode: string;

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
    comment: 'ID del organizador del grupo'
  })
  declare organizerId: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la empresa es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre de la empresa debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre de la empresa'
  })
  declare companyName: string;

  @AllowNull(false)
  @Validate({
    isEmail: {
      msg: 'El email de contacto debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email de contacto'
  })
  declare contactEmail: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El teléfono de contacto es requerido'
    },
    len: {
      args: [8, 20],
      msg: 'El teléfono debe tener entre 8 y 20 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Teléfono de contacto'
  })
  declare contactPhone: string;

  @Validate({
    len: {
      args: [0, 15],
      msg: 'El NIT debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(15),
    comment: 'NIT de la empresa'
  })
  declare nit?: string;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [2],
      msg: 'Debe haber al menos 2 participantes'
    },
    max: {
      args: [50],
      msg: 'No puede haber más de 50 participantes'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Cantidad total de participantes'
  })
  declare participantCount: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El precio base no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio base por participante'
  })
  declare basePrice: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El porcentaje de descuento no puede ser negativo'
    },
    max: {
      args: [100],
      msg: 'El porcentaje de descuento no puede exceder 100%'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 2),
    comment: 'Porcentaje de descuento grupal aplicado'
  })
  declare groupDiscountPercent: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto de descuento no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto total de descuento aplicado'
  })
  declare discountAmount: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El precio final no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio final total del grupo'
  })
  declare finalPrice: number;

  @AllowNull(false)
  @Default('BORRADOR')
  @Validate({
    isIn: {
      args: [['BORRADOR', 'PENDIENTE_PAGO', 'PAGADO', 'CONFIRMADO', 'CANCELADO', 'EXPIRADO', 'REEMBOLSADO']],
      msg: 'Estado de inscripción grupal inválido'
    }
  })
  @Column({
    type: DataType.ENUM(
      'BORRADOR',
      'PENDIENTE_PAGO',
      'PAGADO',
      'CONFIRMADO',
      'CANCELADO',
      'EXPIRADO',
      'REEMBOLSADO'
    ),
    comment: 'Estado de la inscripción grupal'
  })
  declare status: GroupRegistrationStatus;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'La referencia de pago no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Referencia de pago de la pasarela'
  })
  declare paymentReference?: string;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de reserva temporal (15 min)'
  })
  declare reservationExpiresAt?: Date;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Las notas no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales'
  })
  declare notes?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el registro'
  })
  declare createdBy?: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el registro'
  })
  declare updatedBy?: number;

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

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => Event, 'eventId')
  declare event: Event;

  @BelongsTo(() => User, 'organizerId')
  declare organizer: User;

  @HasMany(() => Registration, 'groupRegistrationId')
  declare registrations: Registration[];

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateUniqueGroupCode(instance: GroupRegistration): Promise<void> {
    if (instance.groupCode) {
      const existing = await GroupRegistration.findOne({
        where: {
          groupCode: instance.groupCode,
          id: { [Op.ne]: instance.id || 0 }
        }
      });
      if (existing) {
        throw new Error('Ya existe una inscripción grupal con este código');
      }
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validateNITFormat(instance: GroupRegistration): Promise<void> {
    if (instance.nit && !/^\d{8}-\d{1}$/.test(instance.nit)) {
      throw new Error('El formato del NIT debe ser 12345678-9');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la reserva está expirada
   */
  public get isReservationExpired(): boolean {
    return this.reservationExpiresAt ? new Date() > this.reservationExpiresAt : false;
  }

  /**
   * Calcula el descuento grupal basado en la cantidad de participantes
   */
  public calculateGroupDiscount(): number {
    if (this.participantCount >= 21) return 20;
    if (this.participantCount >= 11) return 15;
    if (this.participantCount >= 6) return 10;
    if (this.participantCount >= 2) return 5;
    return 0;
  }

  /**
   * Calcula el precio final del grupo
   */
  public calculateFinalPrice(): number {
    const discountPercent = this.calculateGroupDiscount();
    const totalBase = this.basePrice * this.participantCount;
    const discountAmount = totalBase * (discountPercent / 100);
    return Math.max(0, totalBase - discountAmount);
  }

  /**
   * Serializa la inscripción grupal para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      groupCode: this.groupCode,
      eventId: this.eventId,
      organizerId: this.organizerId,
      companyName: this.companyName,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      participantCount: this.participantCount,
      basePrice: this.basePrice,
      groupDiscountPercent: this.groupDiscountPercent,
      discountAmount: this.discountAmount,
      finalPrice: this.finalPrice,
      status: this.status,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la inscripción grupal para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      nit: this.nit,
      paymentReference: this.paymentReference,
      reservationExpiresAt: this.reservationExpiresAt,
      notes: this.notes,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un código único de inscripción grupal
   */
  static generateGroupCode(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `GRP-${dateStr}-${randomNum.toString().padStart(4, '0')}`;
  }

  /**
   * Busca inscripciones grupales por evento
   */
  static async findByEvent(eventId: number, options: {
    limit?: number;
    offset?: number;
    status?: GroupRegistrationStatus;
  } = {}): Promise<{ rows: GroupRegistration[]; count: number }> {
    const { limit = 20, offset = 0, status } = options;

    const where: any = { eventId };

    if (status) {
      where.status = status;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca inscripciones grupales por organizador
   */
  static async findByOrganizer(organizerId: number, options: {
    limit?: number;
    offset?: number;
    status?: GroupRegistrationStatus;
  } = {}): Promise<{ rows: GroupRegistration[]; count: number }> {
    const { limit = 20, offset = 0, status } = options;

    const where: any = { organizerId };

    if (status) {
      where.status = status;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'startDate', 'endDate', 'status']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Encuentra reservas grupales expiradas
   */
  static async findExpiredReservations(): Promise<GroupRegistration[]> {
    return this.findAll({
      where: {
        status: 'PENDIENTE_PAGO',
        reservationExpiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
  }
}