/**
 * @fileoverview Modelo de Anuncio Promocional para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Anuncio Promocional con validaciones y métodos
 *
 * Archivo: backend/src/models/PromotionalAd.ts
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
  Index,
  ForeignKey
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo PromotionalAd
 */
export interface PromotionalAdAttributes {
  id?: number;
  title: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  adType: string;
  targetPlatform: string[];
  budget?: number;
  currency: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  targetAudience?: string[];
  location?: string;
  ageRange?: string;
  interests?: string[];
  clickCount: number;
  viewCount: number;
  conversionCount: number;
  costPerClick?: number;
  costPerView?: number;
  totalSpent: number;
  metadata?: any;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de anuncio promocional
 */
export interface PromotionalAdCreationAttributes extends Omit<PromotionalAdAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'clickCount' | 'viewCount' | 'conversionCount' | 'totalSpent'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PromotionalAd:
 *       type: object
 *       required:
 *         - title
 *         - adType
 *         - targetPlatform
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del anuncio promocional
 *           example: 1
 *         title:
 *           type: string
 *           description: Título del anuncio
 *           example: "Descuento en Eventos Empresariales"
 *         description:
 *           type: string
 *           description: Descripción del anuncio
 *         content:
 *           type: string
 *           description: Contenido completo del anuncio
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL de la imagen del anuncio
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: URL del video del anuncio
 *         linkUrl:
 *           type: string
 *           format: uri
 *           description: URL de destino
 *         adType:
 *           type: string
 *           enum: [banner, video, text, sponsored, popup]
 *           description: Tipo de anuncio
 *         targetPlatform:
 *           type: array
 *           items:
 *             type: string
 *           description: Plataformas objetivo
 *         budget:
 *           type: number
 *           description: Presupuesto del anuncio
 *         currency:
 *           type: string
 *           description: Moneda del presupuesto
 *           default: GTQ
 *         isActive:
 *           type: boolean
 *           description: Si el anuncio está activo
 *           default: true
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin
 *         priority:
 *           type: integer
 *           description: Prioridad de ordenamiento
 *           default: 0
 *         targetAudience:
 *           type: array
 *           items:
 *             type: string
 *           description: Audiencia objetivo
 *         location:
 *           type: string
 *           description: Ubicación geográfica objetivo
 *         ageRange:
 *           type: string
 *           description: Rango de edad objetivo
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           description: Intereses objetivo
 *         clickCount:
 *           type: integer
 *           description: Número de clics
 *           default: 0
 *         viewCount:
 *           type: integer
 *           description: Número de visualizaciones
 *           default: 0
 *         conversionCount:
 *           type: integer
 *           description: Número de conversiones
 *           default: 0
 *         costPerClick:
 *           type: number
 *           description: Costo por clic
 *         costPerView:
 *           type: number
 *           description: Costo por visualización
 *         totalSpent:
 *           type: number
 *           description: Total gastado
 *           default: 0
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 */

@Table({
  tableName: 'promotional_ads',
  modelName: 'PromotionalAd',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ad_type']
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
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class PromotionalAd extends Model<PromotionalAdAttributes, PromotionalAdCreationAttributes> implements PromotionalAdAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El título del anuncio es requerido'
    },
    len: {
      args: [3, 255],
      msg: 'El título debe tener entre 3 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Título del anuncio promocional'
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
    comment: 'Descripción del anuncio promocional'
  })
  declare description?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Contenido completo del anuncio promocional'
  })
  declare content?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de la imagen debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de la imagen del anuncio'
  })
  declare imageUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL del video debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del video del anuncio'
  })
  declare videoUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de destino debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de destino del anuncio'
  })
  declare linkUrl?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['banner', 'video', 'text', 'sponsored', 'popup']],
      msg: 'El tipo de anuncio debe ser: banner, video, text, sponsored o popup'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('banner', 'video', 'text', 'sponsored', 'popup'),
    comment: 'Tipo de anuncio promocional'
  })
  declare adType: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Plataformas objetivo (array de strings)'
  })
  declare targetPlatform: string[];

  @Validate({
    min: {
      args: [0],
      msg: 'El presupuesto debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Presupuesto del anuncio promocional'
  })
  declare budget?: number;

  @Default('GTQ')
  @Validate({
    isIn: {
      args: [['GTQ', 'USD']],
      msg: 'La moneda debe ser GTQ o USD'
    }
  })
  @Column({
    type: DataType.STRING(3),
    comment: 'Moneda del presupuesto'
  })
  declare currency: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el anuncio está activo'
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
    comment: 'Fecha de inicio de la campaña'
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
    comment: 'Fecha de fin de la campaña'
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
    comment: 'Prioridad de ordenamiento'
  })
  declare priority: number;

  @Column({
    type: DataType.JSON,
    comment: 'Audiencia objetivo (array de strings)'
  })
  declare targetAudience?: string[];

  @Validate({
    len: {
      args: [0, 255],
      msg: 'La ubicación no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Ubicación geográfica objetivo'
  })
  declare location?: string;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El rango de edad no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Rango de edad objetivo (ej: "18-35")'
  })
  declare ageRange?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Intereses objetivo (array de strings)'
  })
  declare interests?: string[];

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de clics en el anuncio'
  })
  declare clickCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de visualizaciones del anuncio'
  })
  declare viewCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de conversiones del anuncio'
  })
  declare conversionCount: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El costo por clic debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Costo por clic'
  })
  declare costPerClick?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El costo por visualización debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Costo por visualización'
  })
  declare costPerView?: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Total gastado en la campaña'
  })
  declare totalSpent: number;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del anuncio'
  })
  declare metadata?: any;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el anuncio'
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

  // @BelongsTo(() => User, 'createdBy')
  // declare creator: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateDates(ad: PromotionalAd): Promise<void> {
    if (ad.startDate && ad.endDate && ad.endDate <= ad.startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el anuncio está disponible para mostrar
   */
  public get isAvailable(): boolean {
    const now = new Date();

    if (!this.isActive) return false;

    if (this.startDate && this.startDate > now) return false;
    if (this.endDate && this.endDate < now) return false;

    // Verificar presupuesto si existe
    if (this.budget && this.totalSpent >= this.budget) return false;

    return true;
  }

  /**
   * Calcula el CTR (Click Through Rate)
   */
  public get ctr(): number {
    if (this.viewCount === 0) return 0;
    return (this.clickCount / this.viewCount) * 100;
  }

  /**
   * Calcula la tasa de conversión
   */
  public get conversionRate(): number {
    if (this.clickCount === 0) return 0;
    return (this.conversionCount / this.clickCount) * 100;
  }

  /**
   * Incrementa el contador de clics
   */
  public async incrementClickCount(): Promise<void> {
    this.clickCount += 1;
    if (this.costPerClick) {
      this.totalSpent += this.costPerClick;
    }
    await this.save();
  }

  /**
   * Incrementa el contador de visualizaciones
   */
  public async incrementViewCount(): Promise<void> {
    this.viewCount += 1;
    if (this.costPerView) {
      this.totalSpent += this.costPerView;
    }
    await this.save();
  }

  /**
   * Incrementa el contador de conversiones
   */
  public async incrementConversionCount(): Promise<void> {
    this.conversionCount += 1;
    await this.save();
  }

  /**
   * Serializa el anuncio para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      content: this.content,
      imageUrl: this.imageUrl,
      videoUrl: this.videoUrl,
      linkUrl: this.linkUrl,
      adType: this.adType,
      targetPlatform: this.targetPlatform,
      priority: this.priority,
      targetAudience: this.targetAudience,
      location: this.location,
      ageRange: this.ageRange,
      interests: this.interests,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el anuncio para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      budget: this.budget,
      currency: this.currency,
      isActive: this.isActive,
      startDate: this.startDate,
      endDate: this.endDate,
      clickCount: this.clickCount,
      viewCount: this.viewCount,
      conversionCount: this.conversionCount,
      ctr: this.ctr,
      conversionRate: this.conversionRate,
      costPerClick: this.costPerClick,
      costPerView: this.costPerView,
      totalSpent: this.totalSpent,
      metadata: this.metadata,
      createdBy: this.createdBy,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca anuncios activos y disponibles
   */
  static async findActiveAds(platform?: string, adType?: string, limit?: number): Promise<PromotionalAd[]> {
    const where: any = {
      isActive: true
    };

    const now = new Date();
    where.startDate = { $or: [{ $lte: now }, null] };
    where.endDate = { $or: [{ $gte: now }, null] };

    if (platform) {
      where.targetPlatform = { $contains: [platform] };
    }

    if (adType) {
      where.adType = adType;
    }

    return this.findAll({
      where,
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Busca anuncios por tipo
   */
  static async findByType(adType: string): Promise<PromotionalAd[]> {
    return this.findAll({
      where: { adType },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  /**
   * Busca anuncios por creador
   */
  static async findByCreator(creatorId: number): Promise<PromotionalAd[]> {
    return this.findAll({
      where: { createdBy: creatorId },
      order: [['createdAt', 'DESC']]
    });
  }
}