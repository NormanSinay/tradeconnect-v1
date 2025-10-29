/**
 * @fileoverview Modelo de Tipo de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Tipo de Evento
 *
 * Archivo: backend/src/models/EventType.ts
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
 * Atributos del modelo Tipo de Evento
 */
export interface EventTypeAttributes {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de tipo de evento
 */
export interface EventTypeCreationAttributes extends Omit<EventTypeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventType:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del tipo de evento
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre único del tipo de evento
 *           example: "conference"
 *         displayName:
 *           type: string
 *           description: Nombre para mostrar del tipo de evento
 *           example: "Conferencia"
 *         description:
 *           type: string
 *           description: Descripción del tipo de evento
 *           example: "Evento de conferencias y ponencias"
 *         isActive:
 *           type: boolean
 *           description: Indica si el tipo está activo
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
  tableName: 'event_types',
  modelName: 'EventType',
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
export class EventType extends Model<EventTypeAttributes, EventTypeCreationAttributes> implements EventTypeAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre del tipo de evento es requerido'
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
    comment: 'Nombre único del tipo de evento'
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
    comment: 'Nombre para mostrar del tipo de evento'
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
    comment: 'Descripción del tipo de evento'
  })
  declare description?: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el tipo está activo'
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
   * Busca tipo de evento por nombre
   */
  static async findByName(name: string): Promise<EventType | null> {
    return this.findOne({
      where: { name: name.toLowerCase(), isActive: true }
    });
  }

  /**
   * Obtiene todos los tipos activos
   */
  static async findActiveTypes(): Promise<EventType[]> {
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

    const type = await this.findOne({ where });
    return !!type;
  }
}
