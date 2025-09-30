/**
 * @fileoverview Modelo de Estado de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Estado de Evento
 *
 * Archivo: backend/src/models/EventStatus.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Unique,
  Index,
  Default
} from 'sequelize-typescript';
import { Event } from './Event';

/**
 * Atributos del modelo Estado de Evento
 */
export interface EventStatusAttributes {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de estado de evento
 */
export interface EventStatusCreationAttributes extends Omit<EventStatusAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventStatus:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del estado
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre único del estado
 *           example: "published"
 *         displayName:
 *           type: string
 *           description: Nombre para mostrar del estado
 *           example: "Publicado"
 *         description:
 *           type: string
 *           description: Descripción del estado
 *           example: "El evento está publicado y visible para los usuarios"
 *         color:
 *           type: string
 *           description: Color hexadecimal para UI
 *           example: "#28a745"
 *         isActive:
 *           type: boolean
 *           description: Indica si el estado está activo
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

@Table({
  tableName: 'event_statuses',
  modelName: 'EventStatus',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name'],
      where: { is_active: true }
    },
    {
      fields: ['is_active']
    }
  ]
})
export class EventStatus extends Model<EventStatusAttributes, EventStatusCreationAttributes> implements EventStatusAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre del estado es requerido'
    },
    len: {
      args: [2, 50],
      msg: 'El nombre debe tener entre 2 y 50 caracteres'
    },
    is: {
      args: /^[a-z_]+$/,
      msg: 'El nombre solo puede contener letras minúsculas y guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Nombre único del estado'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre para mostrar es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre para mostrar debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre para mostrar del estado'
  })
  declare displayName: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción del estado'
  })
  declare description?: string;

  @Validate({
    is: {
      args: /^#[0-9A-Fa-f]{6}$/,
      msg: 'El color debe ser un código hexadecimal válido (#RRGGBB)'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color hexadecimal para UI (#FF0000)'
  })
  declare color?: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el estado está activo'
  })
  declare isActive: boolean;

  @CreatedAt
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
  // RELACIONES
  // ====================================================================

  @HasMany(() => Event)
  declare events: Event[];

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca estado por nombre
   */
  static async findByName(name: string): Promise<EventStatus | null> {
    return this.findOne({
      where: { name: name.toLowerCase(), isActive: true }
    });
  }

  /**
   * Obtiene todos los estados activos
   */
  static async findActiveStatuses(): Promise<EventStatus[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['displayName', 'ASC']]
    });
  }

  /**
   * Valida si un nombre ya existe
   */
  static async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    const where: any = { name: name.toLowerCase() };

    if (excludeId) {
      where.id = { $ne: excludeId };
    }

    const status = await this.findOne({ where });
    return !!status;
  }
}