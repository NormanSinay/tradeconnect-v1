/**
 * @fileoverview Modelo de Especialidad para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Especialidad con validaciones y métodos
 *
 * Archivo: backend/src/models/Specialty.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  HasMany
} from 'sequelize-typescript';

/**
 * Atributos del modelo Especialidad
 */
export interface SpecialtyAttributes {
  id?: number;
  name: string;
  description?: string;
  category: 'technology' | 'business' | 'marketing' | 'design' | 'education' | 'health' | 'other';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de especialidad
 */
export interface SpecialtyCreationAttributes extends Omit<SpecialtyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Specialty:
 *       type: object
 *       required:
 *         - name
 *         - category
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la especialidad
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre de la especialidad
 *           example: "Inteligencia Artificial"
 *         description:
 *           type: string
 *           description: Descripción de la especialidad
 *         category:
 *           type: string
 *           enum: [technology, business, marketing, design, education, health, other]
 *           description: Categoría de la especialidad
 *         isActive:
 *           type: boolean
 *           description: Indica si está activa
 *           default: true
 */

@Table({
  tableName: 'specialties',
  modelName: 'Specialty',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['name'],
      unique: true
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    }
  ]
})
export class Specialty extends Model<SpecialtyAttributes, SpecialtyCreationAttributes> implements SpecialtyAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la especialidad es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre de la especialidad'
  })
  declare name: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la especialidad'
  })
  declare description?: string;

  @AllowNull(false)
  @Default('other')
  @Validate({
    isIn: {
      args: [['technology', 'business', 'marketing', 'design', 'education', 'health', 'other']],
      msg: 'La categoría debe ser uno de los valores permitidos'
    }
  })
  @Column({
    type: DataType.ENUM('technology', 'business', 'marketing', 'design', 'education', 'health', 'other'),
    comment: 'Categoría de la especialidad'
  })
  declare category: 'technology' | 'business' | 'marketing' | 'design' | 'education' | 'health' | 'other';

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la especialidad está activa'
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

  // Relación muchos-a-muchos con Speaker a través de SpeakerSpecialty
  // Se define en el modelo SpeakerSpecialty

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Serializa la especialidad para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      isActive: this.isActive
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca especialidades activas
   */
  static async findActiveSpecialties(): Promise<Specialty[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Busca especialidades por categoría
   */
  static async findByCategory(category: string): Promise<Specialty[]> {
    return this.findAll({
      where: {
        category,
        isActive: true
      },
      order: [['name', 'ASC']]
    });
  }
}
