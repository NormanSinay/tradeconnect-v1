/**
 * @fileoverview Modelo de Términos y Condiciones para TradeConnect CMS
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para versiones de términos y condiciones
 *
 * Archivo: backend/src/models/Term.ts
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
 * Atributos del modelo Term
 */
export interface TermAttributes {
  id?: number;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  effectiveDate: Date;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de términos
 */
export interface TermCreationAttributes extends Omit<TermAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Term:
 *       type: object
 *       required:
 *         - version
 *         - title
 *         - content
 *         - effectiveDate
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la versión
 *         version:
 *           type: string
 *           description: Número de versión (ej. 1.0, 2.1)
 *         title:
 *           type: string
 *           description: Título de los términos
 *         content:
 *           type: string
 *           description: Contenido completo
 *         isActive:
 *           type: boolean
 *           description: Versión activa
 *         effectiveDate:
 *           type: string
 *           format: date-time
 *           description: Fecha efectiva
 */

@Table({
  tableName: 'terms',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['version'], unique: true },
    { fields: ['is_active'] },
    { fields: ['effective_date'] }
  ]
})
export class Term extends Model<TermAttributes, TermCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(20))
  version!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @AllowNull(false)
  @Column(DataType.DATE)
  effectiveDate!: Date;

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
