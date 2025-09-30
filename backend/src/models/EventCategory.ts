/**
 * @fileoverview Modelo de Categoría de Evento para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Categoría de Evento
 *
 * Archivo: backend/src/models/EventCategory.ts
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
 * Atributos del modelo Categoría de Evento
 */
export interface EventCategoryAttributes {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de categoría de evento
 */
export interface EventCategoryCreationAttributes extends Omit<EventCategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EventCategory:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la categoría
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre único de la categoría
 *           example: "business"
 *         displayName:
 *           type: string
 *           description: Nombre para mostrar de la categoría
 *           example: "Negocios"
 *         description:
 *           type: string
 *           description: Descripción de la categoría
 *           example: "Eventos relacionados con negocios y emprendimiento"
 *         isActive:
 *           type: boolean
 *           description: Indica si la categoría está activa
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
  tableName: 'event_categories',
  modelName: 'EventCategory',
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
export class EventCategory extends Model<EventCategoryAttributes, EventCategoryCreationAttributes> implements EventCategoryAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre de la categoría es requerido'
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
    comment: 'Nombre único de la categoría'
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
    comment: 'Nombre para mostrar de la categoría'
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
    comment: 'Descripción de la categoría'
  })
  declare description?: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la categoría está activa'
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
   * Busca categoría por nombre
   */
  static async findByName(name: string): Promise<EventCategory | null> {
    return this.findOne({
      where: { name: name.toLowerCase(), isActive: true }
    });
  }

  /**
   * Obtiene todas las categorías activas
   */
  static async findActiveCategories(): Promise<EventCategory[]> {
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

    const category = await this.findOne({ where });
    return !!category;
  }
}