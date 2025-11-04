/**
 * @fileoverview Modelo de Speaker para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Speaker con validaciones y métodos
 *
 * Archivo: backend/src/models/Speaker.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  BelongsToMany,
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
import { Op } from 'sequelize';
import { User } from './User';
import { Specialty } from './Specialty';
import { SpeakerSpecialty } from './SpeakerSpecialty';
import { SpeakerAvailabilityBlock } from './SpeakerAvailabilityBlock';
import { SpeakerEvent } from './SpeakerEvent';
import { Contract } from './Contract';
import { SpeakerPayment } from './SpeakerPayment';
import { SpeakerEvaluation } from './SpeakerEvaluation';

/**
 * Atributos del modelo Speaker
 */
export interface SpeakerAttributes {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  nit?: string;
  cui?: string;
  rtu?: string;
  profileImage?: string;
  shortBio?: string;
  fullBio?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  baseRate: number;
  rateType: 'hourly' | 'daily' | 'event';
  modalities: string[];
  languages: string[];
  cvFile?: string;
  category: 'national' | 'international' | 'expert' | 'special_guest';
  rating?: number;
  totalEvents: number;
  isActive: boolean;
  verifiedAt?: Date;
  verifiedBy?: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de speaker
 */
export interface SpeakerCreationAttributes extends Omit<SpeakerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'totalEvents' | 'rating'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Speaker:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - baseRate
 *         - rateType
 *         - modalities
 *         - languages
 *         - category
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del speaker
 *           example: 1
 *         firstName:
 *           type: string
 *           description: Nombre del speaker
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           description: Apellido del speaker
 *           example: "Pérez"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del speaker
 *         phone:
 *           type: string
 *           description: Teléfono del speaker
 *         baseRate:
 *           type: number
 *           description: Tarifa base
 *           default: 0
 *         rating:
 *           type: number
 *           description: Rating promedio
 *           minimum: 0
 *           maximum: 5
 */

@Table({
  tableName: 'speakers',
  modelName: 'Speaker',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['email'],
      unique: true
    },
    {
      fields: ['nit'],
      unique: true,
      where: {
        nit: {
          [Op.ne]: null
        }
      }
    },
    {
      fields: ['category']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['verified_at']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Speaker extends Model<SpeakerAttributes, SpeakerCreationAttributes> implements SpeakerAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

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
    comment: 'Nombre del speaker'
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
    comment: 'Apellido del speaker'
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
    comment: 'Email del speaker',
    unique: true
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
    comment: 'Teléfono del speaker'
  })
  declare phone?: string;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El país no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'País de origen'
  })
  declare country?: string;

  @Validate({
    len: {
      args: [0, 20],
      msg: 'El NIT debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'NIT guatemalteco',
    unique: true
  })
  declare nit?: string;

  @Validate({
    len: {
      args: [0, 20],
      msg: 'El CUI debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'CUI guatemalteco'
  })
  declare cui?: string;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El RTU no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'RTU guatemalteco'
  })
  declare rtu?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Ruta de la foto de perfil'
  })
  declare profileImage?: string;

  @Validate({
    len: {
      args: [0, 200],
      msg: 'La biografía corta no puede exceder 200 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(200),
    comment: 'Biografía corta (máx. 200 caracteres)'
  })
  declare shortBio?: string;

  @Validate({
    len: {
      args: [0, 2000],
      msg: 'La biografía completa no puede exceder 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Biografía extendida (máx. 2000 caracteres)'
  })
  declare fullBio?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de LinkedIn debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Perfil de LinkedIn'
  })
  declare linkedinUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de Twitter debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Perfil de Twitter'
  })
  declare twitterUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL del sitio web debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Sitio web personal/profesional'
  })
  declare websiteUrl?: string;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'La tarifa base no puede ser negativa'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Tarifa base por hora/evento/día en GTQ'
  })
  declare baseRate: number;

  @AllowNull(false)
  @Default('hourly')
  @Validate({
    isIn: {
      args: [['hourly', 'daily', 'event']],
      msg: 'El tipo de tarifa debe ser hourly, daily o event'
    }
  })
  @Column({
    type: DataType.ENUM('hourly', 'daily', 'event'),
    comment: 'Tipo de tarifa: por hora, día o evento completo'
  })
  declare rateType: 'hourly' | 'daily' | 'event';

  @AllowNull(false)
  @Default(['presential'])
  @Column({
    type: DataType.JSON,
    comment: 'Modalidades disponibles: presential, virtual, hybrid'
  })
  declare modalities: string[];

  @AllowNull(false)
  @Default(['spanish'])
  @Column({
    type: DataType.JSON,
    comment: 'Idiomas que maneja'
  })
  declare languages: string[];

  @Column({
    type: DataType.TEXT,
    comment: 'Ruta del archivo CV/portafolio'
  })
  declare cvFile?: string;

  @AllowNull(false)
  @Default('national')
  @Validate({
    isIn: {
      args: [['national', 'international', 'expert', 'special_guest']],
      msg: 'La categoría debe ser national, international, expert o special_guest'
    }
  })
  @Column({
    type: DataType.ENUM('national', 'international', 'expert', 'special_guest'),
    comment: 'Categoría del speaker'
  })
  declare category: 'national' | 'international' | 'expert' | 'special_guest';

  @Validate({
    min: {
      args: [0],
      msg: 'El rating no puede ser menor a 0'
    },
    max: {
      args: [5],
      msg: 'El rating no puede ser mayor a 5'
    }
  })
  @Column({
    type: DataType.DECIMAL(3, 2),
    comment: 'Rating promedio (1-5 estrellas)'
  })
  declare rating?: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Total de eventos realizados'
  })
  declare totalEvents: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el speaker está activo'
  })
  declare isActive: boolean;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de verificación administrativa'
  })
  declare verifiedAt?: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que verificó el perfil'
  })
  declare verifiedBy?: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el registro'
  })
  declare createdBy: number;

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

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User, 'verifiedBy')
  declare verifiedByUser: User;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater: User;

  @BelongsToMany(() => Specialty, () => SpeakerSpecialty)
  declare specialties: Specialty[];

  @HasMany(() => SpeakerAvailabilityBlock)
  declare availabilityBlocks: SpeakerAvailabilityBlock[];

  // @HasMany(() => SpeakerEvent)
  // declare speakerEvents: SpeakerEvent[];

  @HasMany(() => Contract)
  declare contracts: Contract[];

  @HasMany(() => SpeakerPayment)
  declare payments: SpeakerPayment[];

  @HasMany(() => SpeakerEvaluation)
  declare evaluations: SpeakerEvaluation[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateUniqueEmail(speaker: Speaker): Promise<void> {
    if (speaker.email) {
      const existing = await Speaker.findOne({
        where: {
          email: speaker.email,
          id: { [Op.ne]: speaker.id || 0 }
        }
      });
      if (existing) {
        throw new Error('Ya existe un speaker con este email');
      }
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validateUniqueNIT(speaker: Speaker): Promise<void> {
    if (speaker.nit) {
      const existing = await Speaker.findOne({
        where: {
          nit: speaker.nit,
          id: { $ne: speaker.id || 0 }
        }
      });
      if (existing) {
        throw new Error('Ya existe un speaker con este NIT');
      }
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene el nombre completo del speaker
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Verifica si el speaker está disponible en una fecha específica
   */
  public async isAvailable(startDate: Date, endDate: Date): Promise<boolean> {
    const conflicts = await SpeakerAvailabilityBlock.findAll({
      where: {
        speakerId: this.id,
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
    return conflicts.length === 0;
  }

  /**
   * Calcula el rating promedio basado en evaluaciones
   */
  public async calculateAverageRating(): Promise<number> {
    const evaluations = await SpeakerEvaluation.findAll({
      where: { speakerId: this.id },
      attributes: ['overallRating']
    });

    if (evaluations.length === 0) return 0;

    const sum = evaluations.reduce((acc, evaluation) => acc + evaluation.overallRating, 0);
    return Math.round((sum / evaluations.length) * 100) / 100;
  }

  /**
   * Serializa el speaker para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      country: this.country,
      profileImage: this.profileImage,
      shortBio: this.shortBio,
      linkedinUrl: this.linkedinUrl,
      twitterUrl: this.twitterUrl,
      websiteUrl: this.websiteUrl,
      baseRate: this.baseRate,
      rateType: this.rateType,
      modalities: this.modalities,
      languages: this.languages,
      category: this.category,
      rating: this.rating,
      totalEvents: this.totalEvents,
      isActive: this.isActive,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el speaker para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      nit: this.nit,
      cui: this.cui,
      rtu: this.rtu,
      fullBio: this.fullBio,
      cvFile: this.cvFile,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca speakers activos con paginación
   */
  static async findActiveSpeakers(options: {
    limit?: number;
    offset?: number;
    search?: string;
    category?: string;
    minRating?: number;
    modalities?: string[];
    languages?: string[];
    specialties?: number[];
  }): Promise<{ rows: Speaker[]; count: number }> {
    const {
      limit = 20,
      offset = 0,
      search,
      category,
      minRating,
      modalities,
      languages,
      specialties
    } = options;

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (minRating) {
      where.rating = { [Op.gte]: minRating };
    }

    if (modalities && modalities.length > 0) {
      where.modalities = { [Op.overlap]: modalities };
    }

    if (languages && languages.length > 0) {
      where.languages = { [Op.overlap]: languages };
    }

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { shortBio: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const include: any[] = [];

    if (specialties && specialties.length > 0) {
      include.push({
        model: Specialty,
        where: { id: { [Op.in]: specialties } },
        through: { attributes: [] }
      });
    } else {
      include.push({
        model: Specialty,
        through: { attributes: [] }
      });
    }

    return this.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['rating', 'DESC'], ['totalEvents', 'DESC']]
    });
  }

  /**
   * Busca speakers por creador
   */
  static async findByCreator(creatorId: number, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: Speaker[]; count: number }> {
    const { limit = 20, offset = 0 } = options;

    return this.findAndCountAll({
      where: { createdBy: creatorId },
      include: [
        {
          model: Specialty,
          through: { attributes: [] }
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }
}
