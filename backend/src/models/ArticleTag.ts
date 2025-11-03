/**
 * @fileoverview Modelo de ArticleTag para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la tabla de unión ArticleTag (artículos y tags) con validaciones y métodos
 *
 * Archivo: backend/src/models/ArticleTag.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  Index,
  BelongsTo
} from 'sequelize-typescript';
import { Article } from './Article';
import { Tag } from './Tag';

/**
 * Atributos del modelo ArticleTag
 */
export interface ArticleTagAttributes {
  id?: number;
  articleId: number;
  tagId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de relación artículo-tag
 */
export interface ArticleTagCreationAttributes extends Omit<ArticleTagAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleTag:
 *       type: object
 *       required:
 *         - articleId
 *         - tagId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la relación
 *           example: 1
 *         articleId:
 *           type: integer
 *           description: ID del artículo
 *         tagId:
 *           type: integer
 *           description: ID del tag
 */

@Table({
  tableName: 'article_tags',
  modelName: 'ArticleTag',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['article_id']
    },
    {
      fields: ['tag_id']
    },
    {
      fields: ['article_id', 'tag_id'],
      unique: true
    },
    {
      fields: ['created_at']
    }
  ]
})
export class ArticleTag extends Model<ArticleTagAttributes, ArticleTagCreationAttributes> implements ArticleTagAttributes {
  @PrimaryKey
  @AllowNull(false)
  @ForeignKey(() => Article)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del artículo'
  })
  declare articleId: number;

  @PrimaryKey
  @AllowNull(false)
  @ForeignKey(() => Tag)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del tag'
  })
  declare tagId: number;

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
  // ASOCIACIONES
  // ====================================================================

  @BelongsTo(() => Article, 'articleId')
  declare article: Article;

  @BelongsTo(() => Tag, 'tagId')
  declare tag: Tag;

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca tags de un artículo específico
   */
  static async findTagsByArticle(articleId: number): Promise<Tag[]> {
    const articleTags = await this.findAll({
      where: { articleId },
      include: [{ model: Tag, as: 'tag' }]
    });

    return articleTags.map(at => at.tag);
  }

  /**
   * Busca artículos de un tag específico
   */
  static async findArticlesByTag(tagId: number): Promise<Article[]> {
    const articleTags = await this.findAll({
      where: { tagId },
      include: [{ model: Article, as: 'article' }]
    });

    return articleTags.map(at => at.article);
  }

  /**
   * Verifica si existe una relación artículo-tag
   */
  static async exists(articleId: number, tagId: number): Promise<boolean> {
    const count = await this.count({
      where: { articleId, tagId }
    });
    return count > 0;
  }

  /**
   * Crea múltiples relaciones artículo-tag
   */
  static async bulkCreateRelations(articleId: number, tagIds: number[]): Promise<ArticleTag[]> {
    const relations = tagIds.map(tagId => ({
      articleId,
      tagId
    }));

    return this.bulkCreate(relations, {
      ignoreDuplicates: true
    });
  }

  /**
   * Elimina todas las relaciones de un artículo
   */
  static async removeAllTagsFromArticle(articleId: number): Promise<number> {
    return this.destroy({
      where: { articleId }
    });
  }

  /**
   * Elimina todas las relaciones de un tag
   */
  static async removeAllArticlesFromTag(tagId: number): Promise<number> {
    return this.destroy({
      where: { tagId }
    });
  }
}