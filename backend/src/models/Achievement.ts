/**
 * @fileoverview Modelo de Achievement para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para logros del sistema de gamificación
 *
 * Archivo: backend/src/models/Achievement.ts
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
 * Atributos del modelo Achievement
 */
export interface AchievementAttributes {
  id?: number;
  name: string;
  title: string;
  description: string;
  iconUrl?: string;
  category: string;
  rarity: string;
  pointsValue: number;
  experienceValue: number;
  triggerType: string;
  triggerConditions: any;
  isActive: boolean;
  isHidden: boolean;
  maxUnlocks?: number;
  cooldownHours?: number;
  prerequisites?: string[];
  rewards: any;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de achievement
 */
export interface AchievementCreationAttributes extends Omit<AchievementAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Achievement:
 *       type: object
 *       required:
 *         - name
 *         - title
 *         - description
 *         - category
 *         - rarity
 *         - pointsValue
 *         - experienceValue
 *         - triggerType
 *         - triggerConditions
 *         - rewards
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del achievement
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre técnico único del achievement
 *           example: "first_event_attendance"
 *         title:
 *           type: string
 *           description: Título visible del achievement
 *           example: "¡Primer Evento!"
 *         description:
 *           type: string
 *           description: Descripción del achievement
 *         iconUrl:
 *           type: string
 *           format: uri
 *           description: URL del ícono del achievement
 *         category:
 *           type: string
 *           enum: [social, learning, commerce, engagement, milestone, special]
 *           description: Categoría del achievement
 *         rarity:
 *           type: string
 *           enum: [common, uncommon, rare, epic, legendary]
 *           description: Rareza del achievement
 *         pointsValue:
 *           type: integer
 *           description: Puntos otorgados
 *           example: 100
 *         experienceValue:
 *           type: integer
 *           description: Experiencia otorgada
 *           example: 50
 *         triggerType:
 *           type: string
 *           enum: [action, milestone, streak, collection, social, time_based]
 *           description: Tipo de trigger que activa el achievement
 *         triggerConditions:
 *           type: object
 *           description: Condiciones para activar el achievement
 *         isActive:
 *           type: boolean
 *           description: Si el achievement está activo
 *           default: true
 *         isHidden:
 *           type: boolean
 *           description: Si es un achievement oculto
 *           default: false
 *         maxUnlocks:
 *           type: integer
 *           description: Máximo número de desbloqueos por usuario
 *         cooldownHours:
 *           type: integer
 *           description: Horas de cooldown entre desbloqueos
 *         prerequisites:
 *           type: array
 *           description: Achievements requeridos
 *         rewards:
 *           type: object
 *           description: Recompensas adicionales
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 */

@Table({
  tableName: 'achievements',
  modelName: 'Achievement',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['rarity']
    },
    {
      fields: ['trigger_type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_hidden']
    }
  ]
})
export class Achievement extends Model<AchievementAttributes, AchievementCreationAttributes> implements AchievementAttributes {
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
    comment: 'Nombre técnico único del achievement'
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
    comment: 'Título visible del achievement'
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
    comment: 'Descripción del achievement'
  })
  declare description: string;

  @Validate({
    isUrl: {
      msg: 'La URL del ícono debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del ícono del achievement'
  })
  declare iconUrl?: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['social', 'learning', 'commerce', 'engagement', 'milestone', 'special']],
      msg: 'La categoría debe ser una de las permitidas'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('social', 'learning', 'commerce', 'engagement', 'milestone', 'special'),
    comment: 'Categoría del achievement'
  })
  declare category: string;

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
    comment: 'Rareza del achievement'
  })
  declare rarity: string;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'Los puntos deben ser mayores o iguales a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Puntos de lealtad otorgados'
  })
  declare pointsValue: number;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'La experiencia debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Experiencia otorgada'
  })
  declare experienceValue: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['action', 'milestone', 'streak', 'collection', 'social', 'time_based']],
      msg: 'El tipo de trigger debe ser uno de los permitidos'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('action', 'milestone', 'streak', 'collection', 'social', 'time_based'),
    comment: 'Tipo de trigger que activa el achievement'
  })
  declare triggerType: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Condiciones para activar el achievement'
  })
  declare triggerConditions: any;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el achievement está activo'
  })
  declare isActive: boolean;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es un achievement oculto'
  })
  declare isHidden: boolean;

  @Validate({
    min: {
      args: [1],
      msg: 'El máximo de desbloqueos debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de desbloqueos por usuario'
  })
  declare maxUnlocks?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El cooldown debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Horas de cooldown entre desbloqueos'
  })
  declare cooldownHours?: number;

  @Column({
    type: DataType.JSON,
    comment: 'IDs de achievements requeridos como prerrequisitos'
  })
  declare prerequisites?: string[];

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Recompensas adicionales del achievement'
  })
  declare rewards: any;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del achievement'
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

  // @HasMany(() => UserAchievement)
  // declare userAchievements: UserAchievement[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene el valor numérico de la rareza
   */
  public get rarityValue(): number {
    const values = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
    return values[this.rarity as keyof typeof values] || 1;
  }

  /**
   * Verifica si el achievement puede ser desbloqueado por un usuario
   */
  public canUnlock(userStats: any, userAchievements: any[]): boolean {
    if (!this.isActive) return false;

    // Verificar prerrequisitos
    if (this.prerequisites) {
      for (const prereq of this.prerequisites) {
        if (!userAchievements.some(ua => ua.achievementName === prereq)) {
          return false;
        }
      }
    }

    // Verificar máximo de desbloqueos
    if (this.maxUnlocks) {
      const unlockCount = userAchievements.filter(ua => ua.achievementName === this.name).length;
      if (unlockCount >= this.maxUnlocks) return false;
    }

    // Verificar cooldown
    if (this.cooldownHours) {
      const lastUnlock = userAchievements
        .filter(ua => ua.achievementName === this.name)
        .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())[0];

      if (lastUnlock) {
        const hoursSinceUnlock = (Date.now() - new Date(lastUnlock.unlockedAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceUnlock < this.cooldownHours) return false;
      }
    }

    return true;
  }

  /**
   * Evalúa si las condiciones del trigger se cumplen
   */
  public checkTrigger(userStats: any, eventData?: any): boolean {
    const conditions = this.triggerConditions;

    switch (this.triggerType) {
      case 'action':
        return this.checkActionTrigger(conditions, eventData);
      case 'milestone':
        return this.checkMilestoneTrigger(conditions, userStats);
      case 'streak':
        return this.checkStreakTrigger(conditions, userStats);
      case 'collection':
        return this.checkCollectionTrigger(conditions, userStats);
      case 'social':
        return this.checkSocialTrigger(conditions, userStats);
      case 'time_based':
        return this.checkTimeBasedTrigger(conditions, userStats);
      default:
        return false;
    }
  }

  private checkActionTrigger(conditions: any, eventData?: any): boolean {
    if (!eventData) return false;

    if (conditions.actionType && eventData.actionType !== conditions.actionType) return false;
    if (conditions.resource && eventData.resource !== conditions.resource) return false;
    if (conditions.count && eventData.count < conditions.count) return false;

    return true;
  }

  private checkMilestoneTrigger(conditions: any, userStats: any): boolean {
    if (conditions.metric && userStats[conditions.metric] < conditions.threshold) return false;
    return true;
  }

  private checkStreakTrigger(conditions: any, userStats: any): boolean {
    if (conditions.streakType && userStats.streaks?.[conditions.streakType] < conditions.days) return false;
    return true;
  }

  private checkCollectionTrigger(conditions: any, userStats: any): boolean {
    if (conditions.collection && userStats.collections?.[conditions.collection]?.length < conditions.required) return false;
    return true;
  }

  private checkSocialTrigger(conditions: any, userStats: any): boolean {
    if (conditions.friends && userStats.friends < conditions.friends) return false;
    if (conditions.referrals && userStats.referrals < conditions.referrals) return false;
    return true;
  }

  private checkTimeBasedTrigger(conditions: any, userStats: any): boolean {
    const now = new Date();
    if (conditions.registrationDays) {
      const registrationDate = new Date(userStats.registrationDate);
      const daysSinceRegistration = (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRegistration < conditions.registrationDays) return false;
    }
    return true;
  }

  /**
   * Calcula las recompensas totales del achievement
   */
  public getTotalRewards(): any {
    return {
      points: this.pointsValue,
      experience: this.experienceValue,
      ...this.rewards
    };
  }

  /**
   * Serializa el achievement para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      name: this.name,
      title: this.title,
      description: this.description,
      iconUrl: this.iconUrl,
      category: this.category,
      rarity: this.rarity,
      pointsValue: this.pointsValue,
      experienceValue: this.experienceValue,
      triggerType: this.triggerType,
      isHidden: this.isHidden,
      maxUnlocks: this.maxUnlocks,
      cooldownHours: this.cooldownHours,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el achievement para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      triggerConditions: this.triggerConditions,
      prerequisites: this.prerequisites,
      rewards: this.rewards,
      metadata: this.metadata,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca achievements activos
   */
  static async findActiveAchievements(): Promise<Achievement[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['rarity', 'DESC'], ['pointsValue', 'DESC']]
    });
  }

  /**
   * Busca achievements por categoría
   */
  static async findByCategory(category: string): Promise<Achievement[]> {
    return this.findAll({
      where: { category, isActive: true },
      order: [['rarity', 'DESC']]
    });
  }

  /**
   * Busca achievements por rareza
   */
  static async findByRarity(rarity: string): Promise<Achievement[]> {
    return this.findAll({
      where: { rarity, isActive: true },
      order: [['pointsValue', 'DESC']]
    });
  }

  /**
   * Busca achievements por tipo de trigger
   */
  static async findByTriggerType(triggerType: string): Promise<Achievement[]> {
    return this.findAll({
      where: { triggerType, isActive: true },
      order: [['rarity', 'DESC']]
    });
  }

  /**
   * Busca achievements que pueden ser desbloqueados por un usuario
   */
  static async findUnlockableAchievements(userStats: any, userAchievements: any[]): Promise<Achievement[]> {
    const achievements = await this.findActiveAchievements();
    return achievements.filter(achievement => achievement.canUnlock(userStats, userAchievements));
  }

  /**
   * Evalúa achievements para un evento específico
   */
  static async evaluateEventAchievements(eventData: any, userStats: any, userAchievements: any[]): Promise<Achievement[]> {
    const achievements = await this.findByTriggerType('action');
    const unlocked: Achievement[] = [];

    for (const achievement of achievements) {
      if (achievement.canUnlock(userStats, userAchievements) &&
          achievement.checkTrigger(userStats, eventData)) {
        unlocked.push(achievement);
      }
    }

    return unlocked;
  }
}