/**
 * @fileoverview Modelo de Comment para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Comment (comentarios de artículos) con validaciones y métodos
 *
 * Archivo: backend/src/models/Comment.ts
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
  HasMany
} from 'sequelize-typescript';
import { User } from './User';
import { Article } from './Article';

/**
 * Atributos del modelo Comment
 */
export interface CommentAttributes {
  id?: number;
  content: string;
  articleId: number;
  authorId: number;
  parentId?: number;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  isApproved: boolean;
  likeCount: number;
  dislikeCount: number;
  reportedCount: number;
  authorName?: string;
  authorEmail?: string;
  authorWebsite?: string;
  authorIp?: string;
  userAgent?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de comentario
 */
export interface CommentCreationAttributes extends Omit<CommentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'likeCount' | 'dislikeCount' | 'reportedCount' | 'isApproved'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - articleId
 *         - authorId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del comentario
 *           example: 1
 *         content:
 *           type: string
 *           description: Contenido del comentario
 *         articleId:
 *           type: integer
 *           description: ID del artículo al que pertenece el comentario
 *         authorId:
 *           type: integer
 *           description: ID del autor del comentario
 *         parentId:
 *           type: integer
 *           description: ID del comentario padre (para respuestas anidadas)
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, spam]
 *           description: Estado del comentario
 *           default: pending
 *         isApproved:
 *           type: boolean
 *           description: Si el comentario está aprobado
 *           default: false
 *         likeCount:
 *           type: integer
 *           description: Número de likes
 *           default: 0
 *         dislikeCount:
 *           type: integer
 *           description: Número de dislikes
 *           default: 0
 *         reportedCount:
 *           type: integer
 *           description: Número de reportes
 *           default: 0
 *         authorName:
 *           type: string
 *           description: Nombre del autor (si es invitado)
 *         authorEmail:
 *           type: string
 *           description: Email del autor (si es invitado)
 *         authorWebsite:
 *           type: string
 *           description: Sitio web del autor (si es invitado)
 *         authorIp:
 *           type: string
 *           description: IP del autor
 *         userAgent:
 *           type: string
 *           description: User agent del navegador
 */

@Table({
  tableName: 'comments',
  modelName: 'Comment',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['article_id']
    },
    {
      fields: ['author_id']
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_approved']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El contenido del comentario es requerido'
    },
    len: {
      args: [1, 2000],
      msg: 'El comentario debe tener entre 1 y 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Contenido del comentario'
  })
  declare content: string;

  @AllowNull(false)
  @ForeignKey(() => Article)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del artículo al que pertenece el comentario'
  })
  declare articleId: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del autor del comentario'
  })
  declare authorId: number;

  @ForeignKey(() => Comment)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del comentario padre (para respuestas anidadas)'
  })
  declare parentId?: number;

  @Default('pending')
  @Validate({
    isIn: {
      args: [['pending', 'approved', 'rejected', 'spam']],
      msg: 'El estado debe ser: pending, approved, rejected o spam'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected', 'spam'),
    comment: 'Estado del comentario'
  })
  declare status: 'pending' | 'approved' | 'rejected' | 'spam';

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el comentario está aprobado'
  })
  declare isApproved: boolean;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de likes del comentario'
  })
  declare likeCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de dislikes del comentario'
  })
  declare dislikeCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reportes del comentario'
  })
  declare reportedCount: number;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El nombre del autor no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del autor (si es invitado)'
  })
  declare authorName?: string;

  @Validate({
    isEmail: {
      msg: 'El email debe ser válido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email del autor (si es invitado)'
  })
  declare authorEmail?: string;

  @Validate({
    isUrl: {
      msg: 'El sitio web debe ser una URL válida'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Sitio web del autor (si es invitado)'
  })
  declare authorWebsite?: string;

  @Column({
    type: DataType.STRING(45),
    comment: 'IP del autor del comentario'
  })
  declare authorIp?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User agent del navegador del autor'
  })
  declare userAgent?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del comentario'
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

  @BelongsTo(() => Article, 'articleId')
  declare article: Article;

  @BelongsTo(() => User, 'authorId')
  declare author: User;

  @BelongsTo(() => Comment, 'parentId')
  declare parent: Comment;

  @HasMany(() => Comment, 'parentId')
  declare replies: Comment[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateParent(comment: Comment): Promise<void> {
    if (comment.parentId) {
      const parent = await this.findByPk(comment.parentId);
      if (!parent) {
        throw new Error('El comentario padre especificado no existe');
      }
      if (comment.id && comment.parentId === comment.id) {
        throw new Error('Un comentario no puede ser padre de sí mismo');
      }
    }
  }

  @BeforeUpdate
  static async updateApprovedStatus(comment: Comment): Promise<void> {
    if (comment.status === 'approved' && !comment.isApproved) {
      comment.isApproved = true;
    } else if (comment.status !== 'approved' && comment.isApproved) {
      comment.isApproved = false;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el comentario está aprobado
   */
  public get isVisible(): boolean {
    return this.status === 'approved' && this.isApproved;
  }

  /**
   * Incrementa el contador de likes
   */
  public async incrementLikeCount(): Promise<void> {
    this.likeCount += 1;
    await this.save();
  }

  /**
   * Incrementa el contador de dislikes
   */
  public async incrementDislikeCount(): Promise<void> {
    this.dislikeCount += 1;
    await this.save();
  }

  /**
   * Incrementa el contador de reportes
   */
  public async incrementReportedCount(): Promise<void> {
    this.reportedCount += 1;
    await this.save();
  }

  /**
   * Aprueba el comentario
   */
  public async approve(): Promise<void> {
    this.status = 'approved';
    this.isApproved = true;
    await this.save();
  }

  /**
   * Rechaza el comentario
   */
  public async reject(): Promise<void> {
    this.status = 'rejected';
    this.isApproved = false;
    await this.save();
  }

  /**
   * Marca como spam
   */
  public async markAsSpam(): Promise<void> {
    this.status = 'spam';
    this.isApproved = false;
    await this.save();
  }

  /**
   * Serializa el comentario para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      content: this.content,
      articleId: this.articleId,
      authorId: this.authorId,
      parentId: this.parentId,
      status: this.status,
      isApproved: this.isApproved,
      likeCount: this.likeCount,
      dislikeCount: this.dislikeCount,
      authorName: this.authorName,
      authorEmail: this.authorEmail,
      authorWebsite: this.authorWebsite,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa el comentario para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      reportedCount: this.reportedCount,
      authorIp: this.authorIp,
      userAgent: this.userAgent,
      metadata: this.metadata
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca comentarios aprobados de un artículo
   */
  static async findApprovedByArticle(articleId: number, limit?: number, offset?: number): Promise<Comment[]> {
    return this.findAll({
      where: {
        articleId,
        status: 'approved',
        isApproved: true
      },
      include: [
        { model: User, as: 'author' },
        {
          model: Comment,
          as: 'replies',
          where: {
            status: 'approved',
            isApproved: true
          },
          required: false,
          include: [{ model: User, as: 'author' }]
        }
      ],
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });
  }

  /**
   * Busca comentarios pendientes de moderación
   */
  static async findPendingModeration(limit?: number, offset?: number): Promise<Comment[]> {
    return this.findAll({
      where: {
        status: 'pending'
      },
      include: [
        { model: User, as: 'author' },
        { model: Article, as: 'article' }
      ],
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });
  }

  /**
   * Busca comentarios por autor
   */
  static async findByAuthor(authorId: number, limit?: number, offset?: number): Promise<Comment[]> {
    return this.findAll({
      where: { authorId },
      include: [
        { model: Article, as: 'article' },
        {
          model: Comment,
          as: 'replies',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Obtiene el conteo de comentarios por artículo
   */
  static async getCommentCountByArticle(articleId: number): Promise<number> {
    return this.count({
      where: {
        articleId,
        status: 'approved',
        isApproved: true
      }
    });
  }

  /**
   * Busca comentarios reportados
   */
  static async findReported(limit?: number, offset?: number): Promise<Comment[]> {
    return this.findAll({
      where: {
        reportedCount: { $gt: 0 }
      },
      include: [
        { model: User, as: 'author' },
        { model: Article, as: 'article' }
      ],
      order: [['reportedCount', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });
  }
}