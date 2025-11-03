/**
 * @fileoverview Modelo de Tag para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Tag (etiquetas de artículos) con validaciones y métodos
 *
 * Archivo: backend/src/models/Tag.ts
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
  BelongsToMany
} from 'sequelize-typescript';
import { Article } from './Article';

/**
 * Atributos del modelo Tag
 */
export interface TagAttributes {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usageCount: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de tag
 */
export interface TagCreationAttributes extends Omit<TagAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'usageCount'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del tag
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre del tag
 *           example: "SEO"
 *         slug:
 *           type: string
 *           description: Slug único del tag para URLs
 *           example: "seo"
 *         description:
 *           type: string
 *           description: Descripción del tag
 *         color:
 *           type: string
 *           description: Color representativo del tag (hex)
 *           example: "#4ECDC4"
 *         usageCount:
 *           type: integer
 *           description: Número de veces que se usa el tag
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Si el tag está activo
 *           default: true
 *         seoTitle:
 *           type: string
 *           description: Título SEO personalizado
 *         seoDescription:
 *           type: string
 *           description: Descripción SEO
 */

@Table({
  tableName: 'tags',
  modelName: 'Tag',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['slug'],
      unique: true
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['usage_count']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del tag es requerido'
    },
    len: {
      args: [1, 50],
      msg: 'El nombre debe tener entre 1 y 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Nombre del tag'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El slug del tag es requerido'
    },
    is: {
      args: /^[a-z0-9-]+$/,
      msg: 'El slug solo puede contener letras minúsculas, números y guiones'
    },
    len: {
      args: [1, 30],
      msg: 'El slug debe tener entre 1 y 30 caracteres'
    }
  })
  @Index
  @Column({
    type: DataType.STRING(30),
    comment: 'Slug único del tag para URLs'
  })
  declare slug: string;

  @Validate({
    len: {
      args: [0, 200],
      msg: 'La descripción no puede exceder 200 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción del tag'
  })
  declare description?: string;

  @Validate({
    is: {
      args: /^#[0-9A-F]{6}$/i,
      msg: 'El color debe ser un código hexadecimal válido (ej: #4ECDC4)'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color representativo del tag (hex)'
  })
  declare color?: string;

  @Default(0)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de veces que se usa el tag'
  })
  declare usageCount: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el tag está activo'
  })
  declare isActive: boolean;

  @Validate({
    len: {
      args: [0, 60],
      msg: 'El título SEO no puede exceder 60 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(60),
    comment: 'Título SEO personalizado'
  })
  declare seoTitle?: string;

  @Validate({
    len: {
      args: [0, 160],
      msg: 'La descripción SEO no puede exceder 160 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(160),
    comment: 'Descripción SEO del tag'
  })
  declare seoDescription?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del tag'
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
  // ASOCIACIONES
  // ====================================================================

  @BelongsToMany(() => Article, () => ArticleTag, 'tagId', 'articleId')
  declare articles: Article[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async generateSlug(tag: Tag): Promise<void> {
    if (tag.name && (!tag.slug || tag.changed('name'))) {
      let baseSlug = tag.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      let slug = baseSlug;
      let counter = 1;

      while (await this.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      tag.slug = slug;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Incrementa el contador de uso
   */
  public async incrementUsageCount(): Promise<void> {
    this.usageCount += 1;
    await this.save();
  }

  /**
   * Decrementa el contador de uso
   */
  public async decrementUsageCount(): Promise<void> {
    if (this.usageCount > 0) {
      this.usageCount -= 1;
      await this.save();
    }
  }

  /**
   * Serializa el tag para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      color: this.color,
      usageCount: this.usageCount,
      isActive: this.isActive,
      seoTitle: this.seoTitle,
      seoDescription: this.seoDescription,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el tag para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      metadata: this.metadata,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca tags activos
   */
  static async findActive(limit?: number): Promise<Tag[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['usageCount', 'DESC'], ['name', 'ASC']],
      limit
    });
  }

  /**
   * Busca tags más usados
   */
  static async findMostUsed(limit: number = 20): Promise<Tag[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['usageCount', 'DESC'], ['name', 'ASC']],
      limit
    });
  }

  /**
   * Busca tag por slug
   */
  static async findBySlug(slug: string): Promise<Tag | null> {
    return this.findOne({
      where: { slug, isActive: true }
    });
  }

  /**
   * Busca tags por nombre (búsqueda parcial)
   */
  static async searchByName(name: string, limit: number = 10): Promise<Tag[]> {
    return this.findAll({
      where: {
        name: { $iLike: `%${name}%` },
        isActive: true
      },
      order: [['usageCount', 'DESC'], ['name', 'ASC']],
      limit
    });
  }

  /**
   * Obtiene tags con conteo de artículos
   */
  static async findWithArticleCount(): Promise<Array<Tag & { articleCount: number }>> {
    const tags = await this.findAll({
      where: { isActive: true },
      include: [{
        model: Article,
        as: 'articles',
        attributes: [],
        through: { attributes: [] }
      }],
      attributes: {
        include: [
          [
            this.sequelize!.fn('COUNT', this.sequelize!.col('articles.id')),
            'articleCount'
          ]
        ]
      },
      group: ['Tag.id'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('articles.id')), 'DESC'], ['name', 'ASC']]
    });

    return tags as Array<Tag & { articleCount: number }>;
  }
}

// Importación circular para ArticleTag
import { ArticleTag } from './ArticleTag';