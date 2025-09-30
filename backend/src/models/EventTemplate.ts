/**
 * @fileoverview Modelo de Plantilla de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Plantilla de Evento
 *
 * Archivo: backend/src/models/EventTemplate.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasMany,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Unique,
  Index,
  Default,
  ForeignKey
} from 'sequelize-typescript';
import { User } from './User';
import { Event } from './Event';

/**
 * Atributos del modelo Plantilla de Evento
 */
export interface EventTemplateAttributes {
  id?: number;
  name: string;
  description?: string;
  templateData: any;
  thumbnailUrl?: string;
  isPublic: boolean;
  usageCount: number;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de plantilla de evento
 */
export interface EventTemplateCreationAttributes extends Omit<EventTemplateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'usageCount'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventTemplate:
 *       type: object
 *       required:
 *         - name
 *         - templateData
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la plantilla
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre de la plantilla
 *           example: "Conferencia Básica"
 *         description:
 *           type: string
 *           description: Descripción de la plantilla
 *         templateData:
 *           type: object
 *           description: Datos de la plantilla en formato JSON
 *         thumbnailUrl:
 *           type: string
 *           description: URL de la imagen miniatura
 *         isPublic:
 *           type: boolean
 *           description: Indica si la plantilla es pública
 *           default: false
 *         usageCount:
 *           type: integer
 *           description: Número de veces que se ha usado
 *           default: 0
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'event_templates',
  modelName: 'EventTemplate',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['usage_count']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class EventTemplate extends Model<EventTemplateAttributes, EventTemplateCreationAttributes> implements EventTemplateAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la plantilla es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre de la plantilla'
  })
  declare name: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'La descripción no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la plantilla'
  })
  declare description?: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Datos de la plantilla en formato JSON'
  })
  declare templateData: any;

  @Validate({
    isUrl: {
      msg: 'La URL de la miniatura debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de la imagen miniatura'
  })
  declare thumbnailUrl?: string;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la plantilla es pública'
  })
  declare isPublic: boolean;

  @Default(0)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de veces que se ha usado la plantilla'
  })
  declare usageCount: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la plantilla'
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

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @HasMany(() => Event)
  declare events: Event[];

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca plantillas públicas
   */
  static async findPublicTemplates(options: {
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{ rows: EventTemplate[]; count: number }> {
    const { limit = 20, offset = 0, search } = options;

    const where: any = { isPublic: true };

    if (search) {
      where.$or = [
        { name: { $iLike: `%${search}%` } },
        { description: { $iLike: `%${search}%` } }
      ];
    }

    return this.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      limit,
      offset,
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  /**
   * Busca plantillas por creador
   */
  static async findByCreator(creatorId: number, options: {
    limit?: number;
    offset?: number;
    includePrivate?: boolean;
  } = {}): Promise<{ rows: EventTemplate[]; count: number }> {
    const { limit = 20, offset = 0, includePrivate = true } = options;

    const where: any = { createdBy: creatorId };

    if (!includePrivate) {
      where.isPublic = true;
    }

    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Incrementa el contador de uso
   */
  static async incrementUsage(templateId: number): Promise<void> {
    const template = await this.findByPk(templateId);
    if (template) {
      await template.increment('usageCount', { by: 1 });
    }
  }

  /**
   * Valida si un nombre ya existe para el usuario
   */
  static async isNameTakenForUser(name: string, userId: number, excludeId?: number): Promise<boolean> {
    const where: any = { name, createdBy: userId };

    if (excludeId) {
      where.id = { $ne: excludeId };
    }

    const template = await this.findOne({ where });
    return !!template;
  }
}