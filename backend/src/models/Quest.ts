/**
 * @fileoverview Modelo de Quest para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para misiones/quests del sistema de gamificación
 *
 * Archivo: backend/src/models/Quest.ts
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
  HasMany,
  BelongsToMany
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo Quest
 */
export interface QuestAttributes {
  id?: number;
  title: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  pointsReward: number;
  experienceReward: number;
  badgeReward?: string;
  requirements: any;
  objectives: any[];
  timeLimit?: number;
  maxAttempts: number;
  isActive: boolean;
  isRepeatable: boolean;
  startDate?: Date;
  endDate?: Date;
  prerequisites?: string[];
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de quest
 */
export interface QuestCreationAttributes extends Omit<QuestAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Quest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - category
 *         - difficulty
 *         - pointsReward
 *         - experienceReward
 *         - requirements
 *         - objectives
 *         - maxAttempts
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la quest
 *           example: 1
 *         title:
 *           type: string
 *           description: Título de la quest
 *           example: "Primer Evento Asistido"
 *         description:
 *           type: string
 *           description: Descripción detallada de la quest
 *         type:
 *           type: string
 *           enum: [achievement, challenge, daily, weekly, event, social]
 *           description: Tipo de quest
 *         category:
 *           type: string
 *           enum: [learning, social, commerce, engagement, loyalty]
 *           description: Categoría de la quest
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *           description: Dificultad de la quest
 *         pointsReward:
 *           type: integer
 *           description: Puntos de lealtad otorgados
 *           example: 100
 *         experienceReward:
 *           type: integer
 *           description: Experiencia otorgada
 *           example: 50
 *         badgeReward:
 *           type: string
 *           description: Badge otorgado al completar
 *         requirements:
 *           type: object
 *           description: Requisitos para desbloquear la quest
 *         objectives:
 *           type: array
 *           description: Lista de objetivos a completar
 *         timeLimit:
 *           type: integer
 *           description: Límite de tiempo en minutos
 *         maxAttempts:
 *           type: integer
 *           description: Máximo número de intentos
 *           example: 3
 *         isActive:
 *           type: boolean
 *           description: Si la quest está activa
 *           default: true
 *         isRepeatable:
 *           type: boolean
 *           description: Si la quest puede repetirse
 *           default: false
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de disponibilidad
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin de disponibilidad
 *         prerequisites:
 *           type: array
 *           description: IDs de quests requeridas
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 */

@Table({
  tableName: 'quests',
  modelName: 'Quest',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['difficulty']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_repeatable']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    }
  ]
})
export class Quest extends Model<QuestAttributes, QuestCreationAttributes> implements QuestAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El título es requerido'
    },
    len: {
      args: [3, 200],
      msg: 'El título debe tener entre 3 y 200 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(200),
    comment: 'Título de la quest'
  })
  declare title: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La descripción es requerida'
    },
    len: {
      args: [10, 1000],
      msg: 'La descripción debe tener entre 10 y 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada de la quest'
  })
  declare description: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['achievement', 'challenge', 'daily', 'weekly', 'event', 'social']],
      msg: 'El tipo debe ser uno de los permitidos'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('achievement', 'challenge', 'daily', 'weekly', 'event', 'social'),
    comment: 'Tipo de quest'
  })
  declare type: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['learning', 'social', 'commerce', 'engagement', 'loyalty']],
      msg: 'La categoría debe ser una de las permitidas'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('learning', 'social', 'commerce', 'engagement', 'loyalty'),
    comment: 'Categoría de la quest'
  })
  declare category: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['easy', 'medium', 'hard', 'expert']],
      msg: 'La dificultad debe ser easy, medium, hard o expert'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('easy', 'medium', 'hard', 'expert'),
    comment: 'Dificultad de la quest'
  })
  declare difficulty: string;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'Los puntos de recompensa deben ser mayores o iguales a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Puntos de lealtad otorgados al completar'
  })
  declare pointsReward: number;

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
    comment: 'Experiencia otorgada al completar'
  })
  declare experienceReward: number;

  @Validate({
    len: {
      args: [0, 100],
      msg: 'El badge de recompensa no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del badge otorgado al completar'
  })
  declare badgeReward?: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Requisitos para desbloquear la quest'
  })
  declare requirements: any;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Lista de objetivos a completar'
  })
  declare objectives: any[];

  @Validate({
    min: {
      args: [1],
      msg: 'El límite de tiempo debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Límite de tiempo en minutos'
  })
  declare timeLimit?: number;

  @AllowNull(false)
  @Default(1)
  @Validate({
    min: {
      args: [1],
      msg: 'El máximo de intentos debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de intentos permitidos'
  })
  declare maxAttempts: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la quest está activa'
  })
  declare isActive: boolean;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la quest puede repetirse'
  })
  declare isRepeatable: boolean;

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
    comment: 'IDs de quests requeridas como prerrequisitos'
  })
  declare prerequisites?: string[];

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de la quest'
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

  // @HasMany(() => UserQuest)
  // declare userQuests: UserQuest[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la quest está disponible actualmente
   */
  public get isAvailable(): boolean {
    if (!this.isActive) return false;

    const now = new Date();

    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;

    return true;
  }

  /**
   * Obtiene el valor numérico de la dificultad
   */
  public get difficultyValue(): number {
    const values = { easy: 1, medium: 2, hard: 3, expert: 4 };
    return values[this.difficulty as keyof typeof values] || 1;
  }

  /**
   * Verifica si un usuario cumple con los requisitos
   */
  public checkRequirements(userStats: any): boolean {
    const req = this.requirements;

    if (req.minLevel && userStats.level < req.minLevel) return false;
    if (req.minPoints && userStats.points < req.minPoints) return false;
    if (req.completedQuests) {
      for (const questId of req.completedQuests) {
        if (!userStats.completedQuests?.includes(questId)) return false;
      }
    }

    return true;
  }

  /**
   * Calcula el progreso de un usuario en esta quest
   */
  public calculateProgress(userProgress: any): { completed: number; total: number; percentage: number } {
    let completed = 0;
    const total = this.objectives.length;

    for (const objective of this.objectives) {
      const progress = userProgress[objective.id] || 0;
      if (progress >= objective.target) completed++;
    }

    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  }

  /**
   * Verifica si la quest está completada
   */
  public isCompleted(userProgress: any): boolean {
    const progress = this.calculateProgress(userProgress);
    return progress.completed === progress.total;
  }

  /**
   * Serializa la quest para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      category: this.category,
      difficulty: this.difficulty,
      pointsReward: this.pointsReward,
      experienceReward: this.experienceReward,
      badgeReward: this.badgeReward,
      objectives: this.objectives,
      timeLimit: this.timeLimit,
      maxAttempts: this.maxAttempts,
      isRepeatable: this.isRepeatable,
      startDate: this.startDate,
      endDate: this.endDate,
      isAvailable: this.isAvailable,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la quest para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      requirements: this.requirements,
      prerequisites: this.prerequisites,
      metadata: this.metadata,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca quests activas disponibles
   */
  static async findAvailableQuests(): Promise<Quest[]> {
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
      order: [['difficulty', 'ASC'], ['pointsReward', 'DESC']]
    });
  }

  /**
   * Busca quests por tipo
   */
  static async findByType(type: string): Promise<Quest[]> {
    return this.findAll({
      where: { type, isActive: true },
      order: [['difficulty', 'ASC']]
    });
  }

  /**
   * Busca quests por categoría
   */
  static async findByCategory(category: string): Promise<Quest[]> {
    return this.findAll({
      where: { category, isActive: true },
      order: [['difficulty', 'ASC']]
    });
  }

  /**
   * Busca quests por dificultad
   */
  static async findByDifficulty(difficulty: string): Promise<Quest[]> {
    return this.findAll({
      where: { difficulty, isActive: true },
      order: [['pointsReward', 'DESC']]
    });
  }

  /**
   * Obtiene quests diarias activas
   */
  static async getDailyQuests(): Promise<Quest[]> {
    return this.findAll({
      where: {
        type: 'daily',
        isActive: true
      },
      order: [['pointsReward', 'DESC']]
    });
  }

  /**
   * Obtiene quests semanales activas
   */
  static async getWeeklyQuests(): Promise<Quest[]> {
    return this.findAll({
      where: {
        type: 'weekly',
        isActive: true
      },
      order: [['pointsReward', 'DESC']]
    });
  }

  /**
   * Busca quests que un usuario puede desbloquear
   */
  static async findUnlockableQuests(userStats: any): Promise<Quest[]> {
    const allQuests = await this.findAll({
      where: { isActive: true }
    });

    return allQuests.filter(quest => quest.checkRequirements(userStats));
  }
}