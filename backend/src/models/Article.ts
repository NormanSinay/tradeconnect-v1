/**
 * @fileoverview Modelo de Article para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Article (artículos de blog) con validaciones y métodos
 *
 * Archivo: backend/src/models/Article.ts
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
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany
} from 'sequelize-typescript';
import { User } from './User';
import { ArticleCategory } from './ArticleCategory';
import { Tag } from './Tag';
import { Comment } from './Comment';

/**
 * Atributos del modelo Article
 */
export interface ArticleAttributes {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  authorId: number;
  categoryId?: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de artículo
 */
export interface ArticleCreationAttributes extends Omit<ArticleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'viewCount' | 'likeCount' | 'shareCount'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - authorId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del artículo
 *           example: 1
 *         title:
 *           type: string
 *           description: Título del artículo
 *           example: "Cómo mejorar tu estrategia de marketing digital"
 *         slug:
 *           type: string
 *           description: Slug único del artículo para URLs
 *           example: "como-mejorar-tu-estrategia-de-marketing-digital"
 *         excerpt:
 *           type: string
 *           description: Extracto breve del artículo
 *         content:
 *           type: string
 *           description: Contenido completo del artículo en formato HTML/Markdown
 *         featuredImage:
 *           type: string
 *           format: uri
 *           description: URL de la imagen destacada
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: Estado del artículo
 *           default: draft
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de publicación
 *         authorId:
 *           type: integer
 *           description: ID del autor del artículo
 *         categoryId:
 *           type: integer
 *           description: ID de la categoría del artículo
 *         viewCount:
 *           type: integer
 *           description: Número de visualizaciones
 *           default: 0
 *         likeCount:
 *           type: integer
 *           description: Número de likes
 *           default: 0
 *         shareCount:
 *           type: integer
 *           description: Número de compartidos
 *           default: 0
 *         seoTitle:
 *           type: string
 *           description: Título SEO personalizado
 *         seoDescription:
 *           type: string
 *           description: Descripción SEO
 *         seoKeywords:
 *           type: array
 *           items:
 *             type: string
 *           description: Palabras clave SEO
 */

@Table({
  tableName: 'articles',
  modelName: 'Article',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['slug'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['author_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['published_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El título del artículo es requerido'
    },
    len: {
      args: [3, 255],
      msg: 'El título debe tener entre 3 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Título del artículo'
  })
  declare title: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El slug del artículo es requerido'
    },
    is: {
      args: /^[a-z0-9-]+$/,
      msg: 'El slug solo puede contener letras minúsculas, números y guiones'
    },
    len: {
      args: [3, 100],
      msg: 'El slug debe tener entre 3 y 100 caracteres'
    }
  })
  @Index
  @Column({
    type: DataType.STRING(100),
    comment: 'Slug único del artículo para URLs'
  })
  declare slug: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'El extracto no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Extracto breve del artículo'
  })
  declare excerpt?: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El contenido del artículo es requerido'
    }
  })
  @Column({
    type: DataType.TEXT('long'),
    comment: 'Contenido completo del artículo en formato HTML/Markdown'
  })
  declare content: string;

  @Validate({
    isUrl: {
      msg: 'La URL de la imagen destacada debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de la imagen destacada del artículo'
  })
  declare featuredImage?: string;

  @Default('draft')
  @Validate({
    isIn: {
      args: [['draft', 'published', 'archived']],
      msg: 'El estado debe ser: draft, published o archived'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('draft', 'published', 'archived'),
    comment: 'Estado del artículo'
  })
  declare status: 'draft' | 'published' | 'archived';

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de publicación debe ser una fecha válida'
    }
  })
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de publicación del artículo'
  })
  declare publishedAt?: Date;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del autor del artículo'
  })
  declare authorId: number;

  @ForeignKey(() => ArticleCategory)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la categoría del artículo'
  })
  declare categoryId?: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de visualizaciones del artículo'
  })
  declare viewCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de likes del artículo'
  })
  declare likeCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de compartidos del artículo'
  })
  declare shareCount: number;

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
    comment: 'Descripción SEO del artículo'
  })
  declare seoDescription?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Palabras clave SEO (array de strings)'
  })
  declare seoKeywords?: string[];

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del artículo'
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

  @BelongsTo(() => User, 'authorId')
  declare author: User;

  @BelongsTo(() => ArticleCategory, 'categoryId')
  declare category: ArticleCategory;

  @BelongsToMany(() => Tag, () => ArticleTag, 'articleId', 'tagId')
  declare tags: Tag[];

  @HasMany(() => Comment, 'articleId')
  declare comments: Comment[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async generateSlug(article: Article): Promise<void> {
    if (article.title && (!article.slug || article.changed('title'))) {
      let baseSlug = article.title
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

      article.slug = slug;
    }
  }

  @BeforeUpdate
  static async setPublishedAt(article: Article): Promise<void> {
    if (article.status === 'published' && article.previous('status') !== 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el artículo está publicado
   */
  public get isPublished(): boolean {
    return this.status === 'published' && (!this.publishedAt || this.publishedAt <= new Date());
  }

  /**
   * Incrementa el contador de visualizaciones
   */
  public async incrementViewCount(): Promise<void> {
    this.viewCount += 1;
    await this.save();
  }

  /**
   * Incrementa el contador de likes
   */
  public async incrementLikeCount(): Promise<void> {
    this.likeCount += 1;
    await this.save();
  }

  /**
   * Incrementa el contador de compartidos
   */
  public async incrementShareCount(): Promise<void> {
    this.shareCount += 1;
    await this.save();
  }

  /**
   * Serializa el artículo para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      excerpt: this.excerpt,
      featuredImage: this.featuredImage,
      status: this.status,
      publishedAt: this.publishedAt,
      author: this.author?.toPublicJSON(),
      category: this.category?.toPublicJSON(),
      tags: this.tags?.map(tag => tag.toPublicJSON()),
      viewCount: this.viewCount,
      likeCount: this.likeCount,
      shareCount: this.shareCount,
      seoTitle: this.seoTitle,
      seoDescription: this.seoDescription,
      seoKeywords: this.seoKeywords,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa el artículo para respuestas completas (con contenido)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      content: this.content,
      metadata: this.metadata
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca artículos publicados
   */
  static async findPublished(limit?: number, offset?: number): Promise<Article[]> {
    return this.findAll({
      where: {
        status: 'published',
        publishedAt: { $lte: new Date() }
      },
      include: [
        { model: User, as: 'author' },
        { model: ArticleCategory, as: 'category' },
        { model: Tag, as: 'tags' }
      ],
      order: [['publishedAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Busca artículos por categoría
   */
  static async findByCategory(categoryId: number, limit?: number, offset?: number): Promise<Article[]> {
    return this.findAll({
      where: {
        categoryId,
        status: 'published',
        publishedAt: { $lte: new Date() }
      },
      include: [
        { model: User, as: 'author' },
        { model: ArticleCategory, as: 'category' },
        { model: Tag, as: 'tags' }
      ],
      order: [['publishedAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Busca artículos por autor
   */
  static async findByAuthor(authorId: number, limit?: number, offset?: number): Promise<Article[]> {
    return this.findAll({
      where: {
        authorId,
        status: 'published',
        publishedAt: { $lte: new Date() }
      },
      include: [
        { model: User, as: 'author' },
        { model: ArticleCategory, as: 'category' },
        { model: Tag, as: 'tags' }
      ],
      order: [['publishedAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Busca artículos por slug
   */
  static async findBySlug(slug: string): Promise<Article | null> {
    return this.findOne({
      where: { slug, status: 'published' },
      include: [
        { model: User, as: 'author' },
        { model: ArticleCategory, as: 'category' },
        { model: Tag, as: 'tags' },
        { model: Comment, as: 'comments', include: [{ model: User, as: 'author' }] }
      ]
    });
  }
}

// Importación circular para ArticleTag
import { ArticleTag } from './ArticleTag';