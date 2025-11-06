/**
 * @fileoverview Modelo de Registration para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Registration con validaciones y métodos
 *
 * Archivo: backend/src/models/Registration.ts
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
import { GroupRegistration } from './GroupRegistration';

/**
 * Estados de inscripción
 */
export type RegistrationStatus =
  | 'BORRADOR'
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'EXPIRADO'
  | 'REEMBOLSADO';

/**
 * Tipos de participante
 */
export type ParticipantType = 'individual' | 'empresa';

/**
 * Atributos del modelo Registration
 */
export interface RegistrationAttributes {
  id?: number;
  registrationCode: string;
  eventId: number;
  userId: number;
  participantType: ParticipantType;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nit?: string;
  cui?: string;
  companyName?: string;
  position?: string;
  status: RegistrationStatus;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentReference?: string;
  reservationExpiresAt?: Date;
  customFields?: object;
  groupRegistrationId?: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de registration
 */
export interface RegistrationCreationAttributes extends Omit<RegistrationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       required:
 *         - registrationCode
 *         - eventId
 *         - userId
 *         - participantType
 *         - firstName
 *         - lastName
 *         - email
 *         - status
 *         - basePrice
 *         - discountAmount
 *         - finalPrice
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la inscripción
 *           example: 1
 *         registrationCode:
 *           type: string
 *           description: Código único de inscripción
 *           example: "INS-20241201-0001"
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *         userId:
 *           type: integer
 *           description: ID del usuario que se inscribe
 *         participantType:
 *           type: string
 *           enum: [individual, empresa]
 *           description: Tipo de participante
 *         status:
 *           type: string
 *           enum: [BORRADOR, PENDIENTE_PAGO, PAGADO, CONFIRMADO, CANCELADO, EXPIRADO, REEMBOLSADO]
 *           description: Estado de la inscripción
 */

@Table({
  tableName: 'registrations',
  modelName: 'Registration',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['registration_code'],
      unique: true
    },
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
      fields: ['email']
    },
    {
      fields: ['reservation_expires_at']
    },
    {
      fields: ['group_registration_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes> implements RegistrationAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El código de inscripción es requerido'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Código único de inscripción (INS-YYYYMMDD-XXXXX)',
    unique: true
  })
  declare registrationCode: string;

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
    comment: 'ID del usuario que se inscribe'
  })
  declare userId: number;

  @AllowNull(false)
  @Default('individual')
  @Validate({
    isIn: {
      args: [['individual', 'empresa']],
      msg: 'El tipo de participante debe ser individual o empresa'
    }
  })
  @Column({
    type: DataType.ENUM('individual', 'empresa'),
    comment: 'Tipo de participante'
  })
  declare participantType: ParticipantType;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del participante'
  })
  declare firstName: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El apellido es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El apellido debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Apellido del participante'
  })
  declare lastName: string;

  @AllowNull(false)
  @Validate({
    isEmail: {
      msg: 'El email debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email del participante'
  })
  declare email: string;

  @Validate({
    len: {
      args: [0, 20],
      msg: 'El teléfono no puede exceder 20 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Teléfono del participante'
  })
  declare phone?: string;

  @Validate({
    len: {
      args: [0, 15],
      msg: 'El NIT debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(15),
    comment: 'NIT guatemalteco'
  })
  declare nit?: string;

  @Validate({
    len: {
      args: [0, 13],
      msg: 'El CUI debe tener 13 dígitos'
    }
  })
  @Column({
    type: DataType.STRING(13),
    comment: 'CUI guatemalteco'
  })
  declare cui?: string;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'El nombre de la empresa no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre de la empresa (para tipo empresa)'
  })
  declare companyName?: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El cargo no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Cargo del participante'
  })
  declare position?: string;

  @AllowNull(false)
  @Default('BORRADOR')
  @Validate({
    isIn: {
      args: [['BORRADOR', 'PENDIENTE_PAGO', 'PAGADO', 'CONFIRMADO', 'CANCELADO', 'EXPIRADO', 'REEMBOLSADO']],
      msg: 'Estado de inscripción inválido'
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
    comment: 'Estado de la inscripción'
  })
  declare status: RegistrationStatus;

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
    comment: 'Precio base del evento'
  })
  declare basePrice: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El descuento no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto de descuento aplicado'
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
    comment: 'Precio final después de descuentos'
  })
  declare finalPrice: number;

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

  @Column({
    type: DataType.JSON,
    comment: 'Campos personalizados del evento'
  })
  declare customFields?: object;

  @ForeignKey(() => GroupRegistration)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la inscripción grupal (si aplica)'
  })
  declare groupRegistrationId?: number;

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

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @BelongsTo(() => GroupRegistration, 'groupRegistrationId')
  declare groupRegistration: GroupRegistration;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateUniqueEmail(instance: Registration): Promise<void> {
    if (instance.email && instance.eventId) {
      const existing = await Registration.findOne({
        where: {
          email: instance.email,
          eventId: instance.eventId,
          id: { [Op.ne]: instance.id || 0 },
          status: { [Op.notIn]: ['CANCELADO', 'EXPIRADO', 'REEMBOLSADO'] }
        }
      });
      if (existing) {
        throw new Error('Ya existe una inscripción con este email para este evento');
      }
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validateNITFormat(instance: Registration): Promise<void> {
    if (instance.nit && !/^\d{8}-\d{1}$/.test(instance.nit)) {
      throw new Error('El formato del NIT debe ser 12345678-9');
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validateCUIFormat(instance: Registration): Promise<void> {
    if (instance.cui && !/^\d{13}$/.test(instance.cui)) {
      throw new Error('El CUI debe tener exactamente 13 dígitos');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene el nombre completo del participante
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Verifica si la reserva está expirada
   */
  public get isReservationExpired(): boolean {
    return this.reservationExpiresAt ? new Date() > this.reservationExpiresAt : false;
  }

  /**
   * Calcula el precio final
   */
  public calculateFinalPrice(): number {
    return Math.max(0, this.basePrice - this.discountAmount);
  }

  /**
   * Serializa la inscripción para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      registrationCode: this.registrationCode,
      eventId: this.eventId,
      participantType: this.participantType,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      companyName: this.companyName,
      position: this.position,
      status: this.status,
      basePrice: this.basePrice,
      discountAmount: this.discountAmount,
      finalPrice: this.finalPrice,
      customFields: this.customFields,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la inscripción para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      nit: this.nit,
      cui: this.cui,
      paymentReference: this.paymentReference,
      reservationExpiresAt: this.reservationExpiresAt,
      groupRegistrationId: this.groupRegistrationId,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un código único de inscripción
   */
  static generateRegistrationCode(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `INS-${dateStr}-${randomNum.toString().padStart(4, '0')}`;
  }

  /**
   * Busca inscripciones por evento con paginación
   */
  static async findByEvent(eventId: number, options: {
    limit?: number;
    offset?: number;
    status?: RegistrationStatus;
    search?: string;
  } = {}): Promise<{ rows: Registration[]; count: number }> {
    const { limit = 20, offset = 0, status, search } = options;

    const where: any = { eventId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { registrationCode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca inscripciones por usuario
   */
  static async findByUser(userId: number, options: {
    limit?: number;
    offset?: number;
    status?: RegistrationStatus;
  } = {}): Promise<{ rows: Registration[]; count: number }> {
    const { limit = 20, offset = 0, status } = options;

    const where: any = { userId };

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
   * Encuentra reservas expiradas para cancelar
   */
  static async findExpiredReservations(): Promise<Registration[]> {
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
