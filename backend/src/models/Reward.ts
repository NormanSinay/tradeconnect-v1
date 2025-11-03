/**
 * @fileoverview Modelo de Reward para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para recompensas del sistema de gamificación
 *
 * Archivo: backend/src/models/Reward.ts
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
  Index,
  HasMany
} from 'sequelize-typescript';

/**
 * Atributos del modelo Reward
 */
export interface RewardAttributes {
  id?: number;
  name: string;
  title: string;
  description: string;
  type: string;
  category: string;
  value: any;
  cost: number;
  rarity: string;
  isActive: boolean;
  isLimited: boolean;
  maxClaims?: number;
  claimsCount: number;
  startDate?: Date;
  endDate?: Date;
  conditions?: any;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de reward
 */
export interface RewardCreationAttributes extends Omit<RewardAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Reward:
 *       type: object
 *       required:
 *         - name
 *         - title
 *         - description
 *         - type
 *         - category
 *         - value
 *         - cost
 *         - rarity
 *         - claimsCount
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la recompensa
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre técnico único de la recompensa
 *           example: "discount_20_percent"
 *         title:
 *           type: string
 *           description: Título visible de la recompensa
 *           example: "Descuento 20%"
 *         description:
 *           type: string
 *           description: Descripción detallada de la recompensa
 *         type:
 *           type: string
 *           enum: [discount, badge, title, access, physical, digital, experience]
 *           description: Tipo de recompensa
 *         category:
 *           type: string
 *           enum: [loyalty, achievement, seasonal, promotional, special]
 *           description: Categoría de la recompensa
 *         value:
 *           type: object
 *           description: Valor específico de la recompensa
 *         cost:
 *           type: integer
 *           description: Costo en puntos de lealtad
 *           example: 500
 *         rarity:
 *           type: string
 *           enum: [common, uncommon, rare, epic, legendary]
 *           description: Rareza de la recompensa
 *         isActive:
 *           type: boolean
 *           description: Si la recompensa está activa
 *           default: true
 *         isLimited:
 *           type: boolean
 *           description: Si la recompensa tiene límite de canjes
 *           default: false
 *         maxClaims:
 *           type: integer
 *           description: Máximo número de canjes permitidos
 *         claimsCount:
 *           type: integer
 *           description: Número actual de canjes
 *           default: 0
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de disponibilidad
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin de disponibilidad
 *         conditions:
 *           type: object
 *           description: Condiciones para canjear la recompensa
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 */

@Table({
  tableName: 'rewards',
  modelName: 'Reward',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['rarity']
    },
    {
      fields: ['cost']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_limited']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    }
  ]
})
export class Reward extends Model<RewardAttributes, RewardCreationAttributes> implements RewardAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    },
    is: {
      args: /^[a-z_]+$/,
      msg: 'El nombre solo puede contener letras minúsculas y guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre técnico único de la recompensa'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El título es requerido'
    },
    len: {
      args: [2, 200],
      msg: 'El título debe tener entre 2 y 200 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(200),
    comment: 'Título visible de la recompensa'
  })
  declare title: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La descripción es requerida'
    },
    len: {
      args: [10, 500],
      msg: 'La descripción debe tener entre 10 y 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada de la recompensa'
  })
  declare description: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['discount', 'badge', 'title', 'access', 'physical', 'digital', 'experience']],
      msg: 'El tipo debe ser uno de los permitidos'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('discount', 'badge', 'title', 'access', 'physical', 'digital', 'experience'),
    comment: 'Tipo de recompensa'
  })
  declare type: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['loyalty', 'achievement', 'seasonal', 'promotional', 'special']],
      msg: 'La categoría debe ser una de las permitidas'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('loyalty', 'achievement', 'seasonal', 'promotional', 'special'),
    comment: 'Categoría de la recompensa'
  })
  declare category: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Valor específico de la recompensa'
  })
  declare value: any;

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'El costo debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Costo en puntos de lealtad para canjear'
  })
  declare cost: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['common', 'uncommon', 'rare', 'epic', 'legendary']],
      msg: 'La rareza debe ser common, uncommon, rare, epic o legendary'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    comment: 'Rareza de la recompensa'
  })
  declare rarity: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la recompensa está activa'
  })
  declare isActive: boolean;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la recompensa tiene límite de canjes'
  })
  declare isLimited: boolean;

  @Validate({
    min: {
      args: [1],
      msg: 'El máximo de canjes debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de canjes permitidos'
  })
  declare maxClaims?: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número actual de canjes realizados'
  })
  declare claimsCount: number;

  @Index
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de inicio de disponibilidad'
  })
  declare startDate?: Date;

  @Index
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de fin debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de fin de disponibilidad'
  })
  declare endDate?: Date;

  @Column({
    type: DataType.JSON,
    comment: 'Condiciones adicionales para canjear'
  })
  declare conditions?: any;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de la recompensa'
  })
  declare metadata?: any;

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

  // @HasMany(() => UserReward)
  // declare userRewards: UserReward[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la recompensa está disponible
   */
  public get isAvailable(): boolean {
    if (!this.isActive) return false;

    const now = new Date();

    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;

    if (this.isLimited && this.maxClaims && this.claimsCount >= this.maxClaims) return false;

    return true;
  }

  /**
   * Verifica si un usuario puede canjear esta recompensa
   */
  public canUserClaim(userPoints: number, userStats?: any): boolean {
    if (!this.isAvailable) return false;
    if (userPoints < this.cost) return false;

    // Verificar condiciones adicionales
    if (this.conditions) {
      if (this.conditions.minLevel && userStats?.level < this.conditions.minLevel) return false;
      if (this.conditions.requiredBadges) {
        for (const badge of this.conditions.requiredBadges) {
          if (!userStats?.badges?.includes(badge)) return false;
        }
      }
      if (this.conditions.maxClaimsPerUser && userStats?.claimsCount >= this.conditions.maxClaimsPerUser) return false;
    }

    return true;
  }

  /**
   * Obtiene el valor numérico de la rareza
   */
  public get rarityValue(): number {
    const values = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    return values[this.rarity as keyof typeof values] || 1;
  }

  /**
   * Incrementa el contador de canjes
   */
  public async incrementClaims(): Promise<void> {
    this.claimsCount += 1;
    await this.save();
  }

  /**
   * Calcula el valor efectivo de la recompensa
   */
  public getEffectiveValue(): any {
    switch (this.type) {
      case 'discount':
        return {
          type: 'percentage',
          amount: this.value.percentage || this.value.amount || 0
        };
      case 'badge':
        return {
          type: 'badge',
          badgeName: this.value.badgeName,
          badgeTitle: this.value.badgeTitle
        };
      case 'title':
        return {
          type: 'title',
          title: this.value.title,
          color: this.value.color
        };
      case 'access':
        return {
          type: 'access',
          feature: this.value.feature,
          duration: this.value.duration
        };
      default:
        return this.value;
    }
  }

  /**
   * Serializa la recompensa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      title: this.title,
      description: this.description,
      type: this.type,
      category: this.category,
      cost: this.cost,
      rarity: this.rarity,
      isLimited: this.isLimited,
      maxClaims: this.maxClaims,
      claimsCount: this.claimsCount,
      startDate: this.startDate,
      endDate: this.endDate,
      isAvailable: this.isAvailable,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la recompensa para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      value: this.value,
      conditions: this.conditions,
      metadata: this.metadata,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca recompensas activas disponibles
   */
  static async findAvailableRewards(): Promise<Reward[]> {
    const now = new Date();

    return this.findAll({
      where: {
        isActive: true,
        startDate: {
          $or: [null, { $lte: now }]
        },
        endDate: {
          $or: [null, { $gte: now }]
        }
      },
      order: [['cost', 'ASC'], ['rarity', 'DESC']]
    });
  }

  /**
   * Busca recompensas por tipo
   */
  static async findByType(type: string): Promise<Reward[]> {
    return this.findAll({
      where: { type, isActive: true },
      order: [['cost', 'ASC']]
    });
  }

  /**
   * Busca recompensas por categoría
   */
  static async findByCategory(category: string): Promise<Reward[]> {
    return this.findAll({
      where: { category, isActive: true },
      order: [['cost', 'ASC']]
    });
  }

  /**
   * Busca recompensas por rareza
   */
  static async findByRarity(rarity: string): Promise<Reward[]> {
    return this.findAll({
      where: { rarity, isActive: true },
      order: [['cost', 'ASC']]
    });
  }

  /**
   * Busca recompensas que un usuario puede canjear
   */
  static async findClaimableRewards(userPoints: number, userStats?: any): Promise<Reward[]> {
    const rewards = await this.findAvailableRewards();
    return rewards.filter(reward => reward.canUserClaim(userPoints, userStats));
  }

  /**
   * Busca recompensas por rango de costo
   */
  static async findByCostRange(minCost: number, maxCost: number): Promise<Reward[]> {
    return this.findAll({
      where: {
        isActive: true,
        cost: {
          $gte: minCost,
          $lte: maxCost
        }
      },
      order: [['cost', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas de canjes
   */
  static async getClaimStats(): Promise<any[]> {
    const stats = await this.findAll({
      attributes: [
        'type',
        'category',
        'rarity',
        [this.sequelize!.fn('SUM', this.sequelize!.col('claims_count')), 'totalClaims']
      ],
      where: { isActive: true },
      group: ['type', 'category', 'rarity'],
      raw: true
    });

    return stats;
  }
}