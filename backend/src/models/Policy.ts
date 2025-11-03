/**
 * @fileoverview Modelo de Políticas para TradeConnect CMS
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para políticas (privacidad, cookies, etc.)
 *
 * Archivo: backend/src/models/Policy.ts
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
 * Tipos de políticas disponibles
 */
export enum PolicyType {
  PRIVACY = 'privacy',
  COOKIES = 'cookies',
  DATA_PROCESSING = 'data_processing',
  SECURITY = 'security'
}

/**
 * Atributos del modelo Policy
 */
export interface PolicyAttributes {
  id?: number;
  type: PolicyType;
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
 * Interface para creación de política
 */
export interface PolicyCreationAttributes extends Omit<PolicyAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Policy:
 *       type: object
 *       required:
 *         - type
 *         - version
 *         - title
 *         - content
 *         - effectiveDate
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la política
 *         type:
 *           type: string
 *           enum: [privacy, cookies, data_processing, security]
 *           description: Tipo de política
 *         version:
 *           type: string
 *           description: Número de versión
 *         title:
 *           type: string
 *           description: Título de la política
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
  tableName: 'policies',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['is_active'] },
    { fields: ['type', 'version'], unique: true },
    { fields: ['effective_date'] }
  ]
})
export class Policy extends Model<PolicyAttributes, PolicyCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.ENUM('privacy', 'cookies', 'data_processing', 'security'))
  type!: PolicyType;

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
