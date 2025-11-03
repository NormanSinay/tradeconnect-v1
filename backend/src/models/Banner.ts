/**
 * @fileoverview Modelo de Banner para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Banner con validaciones y métodos
 *
 * Archivo: backend/src/models/Banner.ts
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
  Index
} from 'sequelize-typescript';

/**
 * Atributos del modelo Banner
 */
export interface BannerAttributes {
  id?: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  targetAudience?: string[];
  clickCount: number;
  viewCount: number;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de banner
 */
export interface BannerCreationAttributes extends Omit<BannerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'clickCount' | 'viewCount'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Banner:
 *       type: object
 *       required:
 *         - title
 *         - imageUrl
 *         - position
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del banner
 *           example: 1
 *         title:
 *           type: string
 *           description: Título del banner
 *           example: "Descuento Especial"
 *         description:
 *           type: string
 *           description: Descripción del banner
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL de la imagen del banner
 *         linkUrl:
 *           type: string
 *           format: uri
 *           description: URL de destino al hacer clic
 *         position:
 *           type: string
 *           enum: [header, sidebar, footer, homepage, event-page]
 *           description: Posición donde se muestra el banner
 *         isActive:
 *           type: boolean
 *           description: Si el banner está activo
 *           default: true
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de visualización
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin de visualización
 *         priority:
 *           type: integer
 *           description: Prioridad de ordenamiento (mayor = más prioritario)
 *           default: 0
 *         targetAudience:
 *           type: array
 *           items:
 *             type: string
 *           description: Audiencia objetivo (array de strings)
 *         clickCount:
 *           type: integer
 *           description: Número de clics
 *           default: 0
 *         viewCount:
 *           type: integer
 *           description: Número de visualizaciones
 *           default: 0
 */

@Table({
  tableName: 'banners',
  modelName: 'Banner',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['position']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Banner extends Model<BannerAttributes, BannerCreationAttributes> implements BannerAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El título del banner es requerido'
    },
    len: {
      args: [3, 255],
      msg: 'El título debe tener entre 3 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Título del banner'
  })
  declare title: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'La descripción no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción del banner'
  })
  declare description?: string;

  @AllowNull(false)
  @Validate({
    isUrl: {
      msg: 'La URL de la imagen debe ser válida'
    },
    notEmpty: {
      msg: 'La URL de la imagen es requerida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de la imagen del banner'
  })
  declare imageUrl: string;

  @Validate({
    isUrl: {
      msg: 'La URL de destino debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de destino al hacer clic en el banner'
  })
  declare linkUrl?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['header', 'sidebar', 'footer', 'homepage', 'event-page']],
      msg: 'La posición debe ser: header, sidebar, footer, homepage o event-page'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('header', 'sidebar', 'footer', 'homepage', 'event-page'),
    comment: 'Posición donde se muestra el banner'
  })
  declare position: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el banner está activo'
  })
  declare isActive: boolean;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio debe ser una fecha válida'
    }
  })
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de inicio de visualización del banner'
  })
  declare startDate?: Date;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de fin debe ser una fecha válida'
    }
  })
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de fin de visualización del banner'
  })
  declare endDate?: Date;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La prioridad debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Prioridad de ordenamiento (mayor = más prioritario)'
  })
  declare priority: number;

  @Column({
    type: DataType.JSON,
    comment: 'Audiencia objetivo (array de strings)'
  })
  declare targetAudience?: string[];

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de clics en el banner'
  })
  declare clickCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de visualizaciones del banner'
  })
  declare viewCount: number;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del banner'
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
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateDates(banner: Banner): Promise<void> {
    if (banner.startDate && banner.endDate && banner.endDate <= banner.startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el banner está disponible para mostrar
   */
  public get isAvailable(): boolean {
    const now = new Date();

    if (!this.isActive) return false;

    if (this.startDate && this.startDate > now) return false;
    if (this.endDate && this.endDate < now) return false;

    return true;
  }

  /**
   * Incrementa el contador de clics
   */
  public async incrementClickCount(): Promise<void> {
    this.clickCount += 1;
    await this.save();
  }

  /**
   * Incrementa el contador de visualizaciones
   */
  public async incrementViewCount(): Promise<void> {
    this.viewCount += 1;
    await this.save();
  }

  /**
   * Serializa el banner para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      linkUrl: this.linkUrl,
      position: this.position,
      priority: this.priority,
      targetAudience: this.targetAudience,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el banner para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      isActive: this.isActive,
      startDate: this.startDate,
      endDate: this.endDate,
      clickCount: this.clickCount,
      viewCount: this.viewCount,
      metadata: this.metadata,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca banners activos y disponibles
   */
  static async findActiveBanners(position?: string, limit?: number): Promise<Banner[]> {
    const where: any = {
      isActive: true
    };

    const now = new Date();
    where.startDate = { $or: [{ $lte: now }, null] };
    where.endDate = { $or: [{ $gte: now }, null] };

    if (position) {
      where.position = position;
    }

    return this.findAll({
      where,
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Busca banners por posición
   */
  static async findByPosition(position: string): Promise<Banner[]> {
    return this.findAll({
      where: { position },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
  }
}