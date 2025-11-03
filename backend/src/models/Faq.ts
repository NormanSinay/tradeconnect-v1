/**
 * @fileoverview Modelo de FAQ para TradeConnect CMS
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para preguntas frecuentes
 *
 * Archivo: backend/src/models/Faq.ts
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
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo Faq
 */
export interface FaqAttributes {
  id?: number;
  category: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de FAQ
 */
export interface FaqCreationAttributes extends Omit<FaqAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Faq:
 *       type: object
 *       required:
 *         - category
 *         - question
 *         - answer
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la FAQ
 *         category:
 *           type: string
 *           description: Categoría de la FAQ
 *         question:
 *           type: string
 *           description: Pregunta frecuente
 *         answer:
 *           type: string
 *           description: Respuesta
 *         order:
 *           type: integer
 *           description: Orden de aparición
 *         isPublished:
 *           type: boolean
 *           description: Estado de publicación
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de publicación
 */

@Table({
  tableName: 'faqs',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['is_published'] },
    { fields: ['order'] }
  ]
})
export class Faq extends Model<FaqAttributes, FaqCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  category!: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  question!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  answer!: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  order!: number;

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
