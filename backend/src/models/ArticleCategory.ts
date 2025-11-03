/**
 * @fileoverview Modelo de ArticleCategory para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad ArticleCategory (categorías de artículos) con validaciones y métodos
 *
 * Archivo: backend/src/models/ArticleCategory.ts
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
  HasMany
} from 'sequelize-typescript';
import { Article } from './Article';

/**
 * Atributos del modelo ArticleCategory
 */
export interface ArticleCategoryAttributes {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: number;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de categoría de artículo
 */
export interface ArticleCategoryCreationAttributes extends Omit<ArticleCategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la categoría
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre de la categoría
 *           example: "Marketing Digital"
 *         slug:
 *           type: string
 *           description: Slug único de la categoría para URLs
 *           example: "marketing-digital"
 *         description:
 *           type: string
 *           description: Descripción de la categoría
 *         color:
 *           type: string
 *           description: Color representativo de la categoría (hex)
 *           example: "#FF6B6B"
 *         icon:
 *           type: string
 *           description: Icono de la categoría
 *           example: "fas fa-bullhorn"
 *         parentId:
 *           type: integer
 *           description: ID de la categoría padre (para jerarquía)
 *         order:
 *           type: integer
 *           description: Orden de visualización
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Si la categoría está activa
 *           default: true
 *         seoTitle:
 *           type: string
 *           description: Título SEO personalizado
 *         seoDescription:
 *           type: string
 *           description: Descripción SEO
 */

@Table({
  tableName: 'article_categories',
  modelName: 'ArticleCategory',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['slug'],
      unique: true
    },
    {
      fields: ['parent_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['order']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class ArticleCategory extends Model<ArticleCategoryAttributes, ArticleCategoryCreationAttributes> implements ArticleCategoryAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la categoría es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre de la categoría'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El slug de la categoría es requerido'
    },
    is: {
      args: /^[a-z0-9-]+$/,
      msg: 'El slug solo puede contener letras minúsculas, números y guiones'
    },
    len: {
      args: [2, 50],
      msg: 'El slug debe tener entre 2 y 50 caracteres'
    }
  })
  @Index
  @Column({
    type: DataType.STRING(50),
    comment: 'Slug único de la categoría para URLs'
  })
  declare slug: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la categoría'
  })
  declare description?: string;

  @Validate({
    is: {
      args: /^#[0-9A-F]{6}$/i,
      msg: 'El color debe ser un código hexadecimal válido (ej: #FF6B6B)'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color representativo de la categoría (hex)'
  })
  declare color?: string;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El icono no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Icono de la categoría (FontAwesome class)'
  })
  declare icon?: string;

  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la categoría padre (para jerarquía)'
  })
  declare parentId?: number;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'El orden debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Orden de visualización de la categoría'
  })
  declare order: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la categoría está activa'
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
    comment: 'Descripción SEO de la categoría'
  })
  declare seoDescription?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de la categoría'
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

  @HasMany(() => ArticleCategory, 'parentId')
  declare subcategories: ArticleCategory[];

  @HasMany(() => Article, 'categoryId')
  declare articles: Article[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async generateSlug(category: ArticleCategory): Promise<void> {
    if (category.name && (!category.slug || category.changed('name'))) {
      let baseSlug = category.name
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

      category.slug = slug;
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async validateParent(category: ArticleCategory): Promise<void> {
    if (category.parentId) {
      const parent = await this.findByPk(category.parentId);
      if (!parent) {
        throw new Error('La categoría padre especificada no existe');
      }
      if (category.id && category.parentId === category.id) {
        throw new Error('Una categoría no puede ser padre de sí misma');
      }
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene el número de artículos en esta categoría
   */
  public async getArticleCount(): Promise<number> {
    return await Article.count({
      where: { categoryId: this.id }
    });
  }

  /**
   * Serializa la categoría para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      color: this.color,
      icon: this.icon,
      parentId: this.parentId,
      order: this.order,
      isActive: this.isActive,
      seoTitle: this.seoTitle,
      seoDescription: this.seoDescription,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la categoría para respuestas completas
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
   * Busca categorías activas
   */
  static async findActive(): Promise<ArticleCategory[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Busca categorías principales (sin padre)
   */
  static async findRootCategories(): Promise<ArticleCategory[]> {
    return this.findAll({
      where: {
        parentId: { $is: null },
        isActive: true
      },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Busca subcategorías de una categoría padre
   */
  static async findSubcategories(parentId: number): Promise<ArticleCategory[]> {
    return this.findAll({
      where: {
        parentId,
        isActive: true
      },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Busca categoría por slug
   */
  static async findBySlug(slug: string): Promise<ArticleCategory | null> {
    return this.findOne({
      where: { slug, isActive: true }
    });
  }

  /**
   * Obtiene el árbol completo de categorías
   */
  static async getCategoryTree(): Promise<ArticleCategory[]> {
    const categories = await this.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    const categoryMap = new Map<number, ArticleCategory>();
    const rootCategories: ArticleCategory[] = [];

    // Crear mapa de categorías
    categories.forEach(category => {
      categoryMap.set(category.id, category);
      category.subcategories = [];
    });

    // Construir árbol
    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.subcategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }
}