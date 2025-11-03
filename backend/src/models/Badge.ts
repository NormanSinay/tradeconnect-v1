/**
 * @fileoverview Modelo de Badge para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Badge con validaciones y métodos
 *
 * Archivo: backend/src/models/Badge.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  Index,
  Unique,
  HasMany
} from 'sequelize-typescript';
import { UserBadge } from './UserBadge';

/**
 * Atributos del modelo Badge
 */
export interface BadgeAttributes {
  id?: number;
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  category: string;
  rarity: string;
  pointsRequired: number;
  isActive: boolean;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de badge
 */
export interface BadgeCreationAttributes extends Omit<BadgeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Badge:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - rarity
 *         - pointsRequired
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del badge
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre del badge
 *           example: "Primer Evento"
 *         description:
 *           type: string
 *           description: Descripción del badge
 *           example: "Badge otorgado por asistir a tu primer evento"
 *         iconUrl:
 *           type: string
 *           format: uri
 *           description: URL del ícono del badge
 *         color:
 *           type: string
 *           description: Color del badge (hexadecimal)
 *           example: "#FFD700"
 *         category:
 *           type: string
 *           enum: [achievement, milestone, loyalty, special, seasonal]
 *           description: Categoría del badge
 *         rarity:
 *           type: string
 *           enum: [common, uncommon, rare, epic, legendary]
 *           description: Rareza del badge
 *         pointsRequired:
 *           type: integer
 *           description: Puntos requeridos para obtener el badge
 *           example: 100
 *         isActive:
 *           type: boolean
 *           description: Si el badge está activo
 *           default: true
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales del badge
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'badges',
  modelName: 'Badge',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['rarity']
    },
    {
      fields: ['points_required']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    },
    {
      unique: true,
      fields: ['name'],
      where: { deleted_at: null }
    }
  ]
})
export class Badge extends Model<BadgeAttributes, BadgeCreationAttributes> implements BadgeAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del badge es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre único del badge'
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
    comment: 'Descripción del badge'
  })
  declare description?: string;

  @Validate({
    isUrl: {
      msg: 'La URL del ícono debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del ícono del badge'
  })
  declare iconUrl?: string;

  @Validate({
    is: {
      args: /^#[0-9A-Fa-f]{6}$/,
      msg: 'El color debe ser un código hexadecimal válido (ej. #FFD700)'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color del badge en formato hexadecimal'
  })
  declare color?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['achievement', 'milestone', 'loyalty', 'special', 'seasonal']],
      msg: 'La categoría debe ser: achievement, milestone, loyalty, special o seasonal'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('achievement', 'milestone', 'loyalty', 'special', 'seasonal'),
    comment: 'Categoría del badge'
  })
  declare category: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['common', 'uncommon', 'rare', 'epic', 'legendary']],
      msg: 'La rareza debe ser: common, uncommon, rare, epic o legendary'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    comment: 'Rareza del badge'
  })
  declare rarity: string;

  @AllowNull(false)
  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'Los puntos requeridos deben ser mayores o iguales a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Puntos de lealtad requeridos para obtener el badge'
  })
  declare pointsRequired: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el badge está activo y disponible'
  })
  declare isActive: boolean;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del badge'
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
  // RELACIONES
  // ====================================================================

  @HasMany(() => UserBadge)
  declare userBadges: UserBadge[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el badge está disponible
   */
  public get isAvailable(): boolean {
    return this.isActive;
  }

  /**
   * Obtiene el valor numérico de la rareza
   */
  public get rarityValue(): number {
    const rarityValues = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5
    };
    return rarityValues[this.rarity as keyof typeof rarityValues] || 1;
  }

  /**
   * Verifica si un usuario puede obtener este badge basado en puntos
   */
  public canUserEarn(userPoints: number): boolean {
    return userPoints >= this.pointsRequired;
  }

  /**
   * Serializa el badge para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      iconUrl: this.iconUrl,
      color: this.color,
      category: this.category,
      rarity: this.rarity,
      pointsRequired: this.pointsRequired,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el badge para respuestas completas
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
   * Busca badges activos
   */
  static async findActiveBadges(): Promise<Badge[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['pointsRequired', 'ASC']]
    });
  }

  /**
   * Busca badges por categoría
   */
  static async findByCategory(category: string): Promise<Badge[]> {
    return this.findAll({
      where: { category, isActive: true },
      order: [['pointsRequired', 'ASC']]
    });
  }

  /**
   * Busca badges por rareza
   */
  static async findByRarity(rarity: string): Promise<Badge[]> {
    return this.findAll({
      where: { rarity, isActive: true },
      order: [['pointsRequired', 'ASC']]
    });
  }

  /**
   * Busca badges que un usuario puede obtener
   */
  static async findEarnableBadges(userPoints: number): Promise<Badge[]> {
    return this.findAll({
      where: {
        isActive: true,
        pointsRequired: {
          $lte: userPoints
        }
      },
      order: [['pointsRequired', 'ASC']]
    });
  }

  /**
   * Busca badges por rango de puntos requeridos
   */
  static async findByPointsRange(minPoints: number, maxPoints: number): Promise<Badge[]> {
    return this.findAll({
      where: {
        isActive: true,
        pointsRequired: {
          $gte: minPoints,
          $lte: maxPoints
        }
      },
      order: [['pointsRequired', 'ASC']]
    });
  }

  /**
   * Busca badge por nombre
   */
  static async findByName(name: string): Promise<Badge | null> {
    return this.findOne({
      where: {
        name: name.toLowerCase(),
        isActive: true
      }
    });
  }
}