/**
 * @fileoverview Modelo de Multimedia de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Multimedia de Evento
 *
 * Archivo: backend/src/models/EventMedia.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
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

/**
 * Atributos del modelo Multimedia de Evento
 */
export interface EventMediaAttributes {
  id?: number;
  eventId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  category: 'presentation' | 'handout' | 'exercise' | 'resource' | 'other';
  isPublic: boolean;
  altText?: string;
  description?: string;
  isFeatured: boolean;
  sortOrder: number;
  dimensions?: any;
  thumbnails?: any;
  uploadedBy: number;
  uploadedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de multimedia de evento
 */
export interface EventMediaCreationAttributes extends Omit<EventMediaAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'uploadedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventMedia:
 *       type: object
 *       required:
 *         - eventId
 *         - filename
 *         - originalName
 *         - mimetype
 *         - size
 *         - path
 *         - url
 *         - type
 *         - uploadedBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del archivo multimedia
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento asociado
 *         filename:
 *           type: string
 *           description: Nombre del archivo en el servidor
 *         originalName:
 *           type: string
 *           description: Nombre original del archivo
 *         mimetype:
 *           type: string
 *           description: Tipo MIME del archivo
 *         size:
 *           type: integer
 *           description: Tamaño del archivo en bytes
 *         url:
 *           type: string
 *           description: URL pública del archivo
 *         type:
 *           type: string
 *           enum: [image, video, document, audio, other]
 *           description: Tipo de medio
 *         isFeatured:
 *           type: boolean
 *           description: Indica si es la imagen destacada
 *           default: false
 *         uploadedBy:
 *           type: integer
 *           description: ID del usuario que subió el archivo
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de subida
 */

@Table({
  tableName: 'event_media',
  modelName: 'EventMedia',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['uploaded_by']
    },
    {
      fields: ['uploaded_at']
    },
    {
      fields: ['sort_order']
    }
  ]
})
export class EventMedia extends Model<EventMediaAttributes, EventMediaCreationAttributes> implements EventMediaAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del evento asociado'
  })
  declare eventId: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del archivo es requerido'
    },
    len: {
      args: [1, 255],
      msg: 'El nombre del archivo no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre del archivo en el servidor'
  })
  declare filename: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre original es requerido'
    },
    len: {
      args: [1, 255],
      msg: 'El nombre original no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre original del archivo'
  })
  declare originalName: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El tipo MIME es requerido'
    },
    len: {
      args: [1, 100],
      msg: 'El tipo MIME no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Tipo MIME del archivo'
  })
  declare mimetype: string;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'El tamaño del archivo debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Tamaño del archivo en bytes'
  })
  declare size: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La ruta del archivo es requerida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Ruta completa del archivo en el servidor'
  })
  declare path: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La URL del archivo es requerida'
    },
    isUrl: {
      msg: 'La URL debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL pública del archivo'
  })
  declare url: string;

  @Default('image')
  @Index
  @Validate({
    isIn: {
      args: [['image', 'video', 'document', 'audio', 'other']],
      msg: 'Tipo de medio inválido'
    }
  })
  @Column({
    type: DataType.ENUM('image', 'video', 'document', 'audio', 'other'),
    comment: 'Tipo de medio'
  })
  declare type: 'image' | 'video' | 'document' | 'audio' | 'other';

  @Default('other')
  @Validate({
    isIn: {
      args: [['presentation', 'handout', 'exercise', 'resource', 'other']],
      msg: 'Categoría inválida'
    }
  })
  @Column({
    type: DataType.ENUM('presentation', 'handout', 'exercise', 'resource', 'other'),
    comment: 'Categoría del material didáctico'
  })
  declare category: 'presentation' | 'handout' | 'exercise' | 'resource' | 'other';

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el material es público para los participantes'
  })
  declare isPublic: boolean;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'El texto alternativo no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Texto alternativo para accesibilidad'
  })
  declare altText?: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'La descripción no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción del archivo'
  })
  declare description?: string;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es la imagen destacada del evento'
  })
  declare isFeatured: boolean;

  @Default(0)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Orden de visualización'
  })
  declare sortOrder: number;

  @Column({
    type: DataType.JSON,
    comment: 'Dimensiones del archivo (ancho, alto para imágenes)'
  })
  declare dimensions?: any;

  @Column({
    type: DataType.JSON,
    comment: 'URLs de thumbnails generadas'
  })
  declare thumbnails?: any;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que subió el archivo'
  })
  declare uploadedBy: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    comment: 'Fecha y hora de subida'
  })
  declare uploadedAt: Date;

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

  @BelongsTo(() => User, 'uploadedBy')
  declare uploader: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si es una imagen
   */
  public get isImage(): boolean {
    return this.type === 'image';
  }

  /**
   * Verifica si es un video
   */
  public get isVideo(): boolean {
    return this.type === 'video';
  }

  /**
   * Obtiene el tamaño formateado
   */
  public get formattedSize(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Serializa para respuesta pública
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      filename: this.filename,
      originalName: this.originalName,
      mimetype: this.mimetype,
      size: this.size,
      formattedSize: this.formattedSize,
      url: this.url,
      type: this.type,
      category: this.category,
      isPublic: this.isPublic,
      altText: this.altText,
      description: this.description,
      isFeatured: this.isFeatured,
      sortOrder: this.sortOrder,
      dimensions: this.dimensions,
      thumbnails: this.thumbnails,
      uploadedAt: this.uploadedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca archivos multimedia por evento
   */
  static async findByEvent(eventId: number, options: {
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: EventMedia[]; count: number }> {
    const { type, limit = 50, offset = 0 } = options;

    const where: any = { eventId };
    if (type) {
      where.type = type;
    }

    return this.findAndCountAll({
      where,
      order: [
        ['isFeatured', 'DESC'],
        ['sortOrder', 'ASC'],
        ['uploadedAt', 'DESC']
      ],
      limit,
      offset
    });
  }

  /**
   * Obtiene la imagen destacada de un evento
   */
  static async getFeaturedImage(eventId: number): Promise<EventMedia | null> {
    return this.findOne({
      where: { eventId, isFeatured: true }
    });
  }

  /**
   * Busca archivos por usuario
   */
  static async findByUser(userId: number, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ rows: EventMedia[]; count: number }> {
    const { limit = 20, offset = 0 } = options;

    return this.findAndCountAll({
      where: { uploadedBy: userId },
      include: [
        {
          model: Event,
          attributes: ['id', 'title']
        }
      ],
      limit,
      offset,
      order: [['uploadedAt', 'DESC']]
    });
  }

  /**
   * Valida tipo MIME permitido
   */
  static isAllowedMimeType(mimetype: string, type: 'image' | 'video' | 'document' | 'audio' | 'other'): boolean {
    const allowedTypes: Record<string, string[]> = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
    };

    return allowedTypes[type]?.includes(mimetype) || false;
  }

  /**
   * Obtiene tamaño máximo por tipo
   */
  static getMaxSizeForType(type: 'image' | 'video' | 'document' | 'audio' | 'other'): number {
    const maxSizes: Record<string, number> = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      document: 25 * 1024 * 1024, // 25MB
      audio: 50 * 1024 * 1024, // 50MB
      other: 10 * 1024 * 1024 // 10MB
    };

    return maxSizes[type] || maxSizes.other;
  }
}
