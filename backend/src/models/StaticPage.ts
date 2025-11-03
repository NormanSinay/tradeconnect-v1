/**
 * @fileoverview Modelo de Página Estática para TradeConnect CMS
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para páginas estáticas del CMS
 *
 * Archivo: backend/src/models/StaticPage.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AllowNull,
  Default,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Unique
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo StaticPage
 */
export interface StaticPageAttributes {
  id?: number;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de página estática
 */
export interface StaticPageCreationAttributes extends Omit<StaticPageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     StaticPage:
 *       type: object
 *       required:
 *         - slug
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la página
 *         slug:
 *           type: string
 *           description: Slug único para la URL
 *         title:
 *           type: string
 *           description: Título de la página
 *         content:
 *           type: string
 *           description: Contenido HTML de la página
 *         metaTitle:
 *           type: string
 *           description: Meta título para SEO
 *         metaDescription:
 *           type: string
 *           description: Meta descripción para SEO
 *         isPublished:
 *           type: boolean
 *           description: Estado de publicación
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de publicación
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *         updatedBy:
 *           type: integer
 *           description: ID del usuario que actualizó
 */

@Table({
  tableName: 'static_pages',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['is_published'] },
    { fields: ['created_by'] }
  ]
})
export class StaticPage extends Model<StaticPageAttributes, StaticPageCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  slug!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  metaTitle?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  metaDescription?: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isPublished!: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  publishedAt?: Date;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  createdBy!: number;

  @ForeignKey(() => User)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  updatedBy?: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @DeletedAt
  @Column(DataType.DATE)
  deletedAt?: Date;

  // Asociaciones
  @BelongsTo(() => User, 'createdBy')
  creator?: User;

  @BelongsTo(() => User, 'updatedBy')
  updater?: User;

  /**
   * Convierte el modelo a JSON para respuesta API
   */
  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}
