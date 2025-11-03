/**
 * @fileoverview Modelo de Level para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para niveles del sistema de gamificación
 *
 * Archivo: backend/src/models/Level.ts
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
 * Atributos del modelo Level
 */
export interface LevelAttributes {
  id?: number;
  level: number;
  name: string;
  description?: string;
  experienceRequired: number;
  totalExperienceRequired: number;
  rewards: any;
  bonuses: any;
  isActive: boolean;
  color?: string;
  iconUrl?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de level
 */
export interface LevelCreationAttributes extends Omit<LevelAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Level:
 *       type: object
 *       required:
 *         - level
 *         - name
 *         - experienceRequired
 *         - totalExperienceRequired
 *         - rewards
 *         - bonuses
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del nivel
 *           example: 1
 *         level:
 *           type: integer
 *           description: Número del nivel
 *           example: 5
 *         name:
 *           type: string
 *           description: Nombre del nivel
 *           example: "Experto"
 *         description:
 *           type: string
 *           description: Descripción del nivel
 *         experienceRequired:
 *           type: integer
 *           description: Experiencia requerida para este nivel
 *           example: 1000
 *         totalExperienceRequired:
 *           type: integer
 *           description: Experiencia total acumulada requerida
 *           example: 5000
 *         rewards:
 *           type: object
 *           description: Recompensas al alcanzar el nivel
 *         bonuses:
 *           type: object
 *           description: Bonificaciones permanentes del nivel
 *         isActive:
 *           type: boolean
 *           description: Si el nivel está activo
 *           default: true
 *         color:
 *           type: string
 *           description: Color del nivel
 *         iconUrl:
 *           type: string
 *           format: uri
 *           description: URL del ícono del nivel
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 */

@Table({
  tableName: 'levels',
  modelName: 'Level',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['level']
    },
    {
      fields: ['experience_required']
    },
    {
      fields: ['total_experience_required']
    },
    {
      fields: ['is_active']
    }
  ]
})
export class Level extends Model<LevelAttributes, LevelCreationAttributes> implements LevelAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [1],
      msg: 'El nivel debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Número del nivel'
  })
  declare level: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del nivel'
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
    comment: 'Descripción del nivel'
  })
  declare description?: string;

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La experiencia requerida debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Experiencia requerida para alcanzar este nivel'
  })
  declare experienceRequired: number;

  @AllowNull(false)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La experiencia total requerida debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Experiencia total acumulada requerida para este nivel'
  })
  declare totalExperienceRequired: number;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Recompensas otorgadas al alcanzar el nivel'
  })
  declare rewards: any;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Bonificaciones permanentes del nivel'
  })
  declare bonuses: any;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el nivel está activo'
  })
  declare isActive: boolean;

  @Validate({
    is: {
      args: /^#[0-9A-F]{6}$/i,
      msg: 'El color debe ser un código hexadecimal válido (#RRGGBB)'
    }
  })
  @Column({
    type: DataType.STRING(7),
    comment: 'Color del nivel en formato hexadecimal'
  })
  declare color?: string;

  @Validate({
    isUrl: {
      msg: 'La URL del ícono debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del ícono del nivel'
  })
  declare iconUrl?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del nivel'
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

  // @HasMany(() => UserLevel)
  // declare userLevels: UserLevel[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si un usuario puede alcanzar este nivel
   */
  public canUserReach(experience: number): boolean {
    return experience >= this.totalExperienceRequired;
  }

  /**
   * Calcula el progreso hacia este nivel
   */
  public getProgress(experience: number, previousLevelTotal?: number): { current: number; required: number; percentage: number } {
    const previousTotal = previousLevelTotal || 0;
    const current = Math.max(0, experience - previousTotal);
    const required = this.totalExperienceRequired - previousTotal;
    const percentage = required > 0 ? Math.min(100, (current / required) * 100) : 100;

    return { current, required, percentage };
  }

  /**
   * Obtiene las bonificaciones activas del nivel
   */
  public getActiveBonuses(): any {
    return {
      ...this.bonuses,
      level: this.level,
      name: this.name
    };
  }

  /**
   * Verifica si este es el nivel máximo
   */
  public get isMaxLevel(): boolean {
    // Esto se determina consultando si existe un nivel superior
    return false; // Implementar lógica para determinar nivel máximo
  }

  /**
   * Serializa el nivel para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      level: this.level,
      name: this.name,
      description: this.description,
      experienceRequired: this.experienceRequired,
      totalExperienceRequired: this.totalExperienceRequired,
      rewards: this.rewards,
      bonuses: this.bonuses,
      isActive: this.isActive,
      color: this.color,
      iconUrl: this.iconUrl,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el nivel para respuestas completas
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
   * Busca niveles activos ordenados
   */
  static async findActiveLevels(): Promise<Level[]> {
    return this.findAll({
      where: { isActive: true },
      order: [['level', 'ASC']]
    });
  }

  /**
   * Obtiene el nivel por número
   */
  static async findByLevelNumber(levelNumber: number): Promise<Level | null> {
    return this.findOne({
      where: { level: levelNumber, isActive: true }
    });
  }

  /**
   * Obtiene el nivel que corresponde a una cantidad de experiencia
   */
  static async getLevelForExperience(experience: number): Promise<Level | null> {
    return this.findOne({
      where: {
        isActive: true,
        totalExperienceRequired: {
          $lte: experience
        }
      },
      order: [['level', 'DESC']]
    });
  }

  /**
   * Obtiene el siguiente nivel
   */
  static async getNextLevel(currentLevel: number): Promise<Level | null> {
    return this.findOne({
      where: {
        level: currentLevel + 1,
        isActive: true
      }
    });
  }

  /**
   * Obtiene el nivel máximo disponible
   */
  static async getMaxLevel(): Promise<Level | null> {
    return this.findOne({
      where: { isActive: true },
      order: [['level', 'DESC']]
    });
  }

  /**
   * Calcula el progreso completo hacia el siguiente nivel
   */
  static async calculateLevelProgress(experience: number): Promise<{
    currentLevel: Level | null;
    nextLevel: Level | null;
    progress: { current: number; required: number; percentage: number };
    experienceToNext: number;
  }> {
    const currentLevel = await this.getLevelForExperience(experience);
    const nextLevel = currentLevel ? await this.getNextLevel(currentLevel.level) : await this.findByLevelNumber(1);

    let progress = { current: 0, required: 0, percentage: 0 };
    let experienceToNext = 0;

    if (nextLevel) {
      const previousTotal = currentLevel ? currentLevel.totalExperienceRequired : 0;
      progress = nextLevel.getProgress(experience, previousTotal);
      experienceToNext = nextLevel.totalExperienceRequired - experience;
    }

    return {
      currentLevel,
      nextLevel,
      progress,
      experienceToNext
    };
  }

  /**
   * Crea niveles por defecto
   */
  static async seedDefaultLevels(): Promise<void> {
    const defaultLevels = [
      {
        level: 1,
        name: 'Principiante',
        description: 'Comenzando tu viaje',
        experienceRequired: 0,
        totalExperienceRequired: 0,
        rewards: { points: 0 },
        bonuses: { multiplier: 1.0 },
        color: '#9E9E9E',
        isActive: true
      },
      {
        level: 2,
        name: 'Aprendiz',
        description: 'Primeros pasos',
        experienceRequired: 100,
        totalExperienceRequired: 100,
        rewards: { points: 50 },
        bonuses: { multiplier: 1.05 },
        color: '#4CAF50',
        isActive: true
      },
      {
        level: 3,
        name: 'Explorador',
        description: 'Descubriendo nuevas posibilidades',
        experienceRequired: 250,
        totalExperienceRequired: 350,
        rewards: { points: 100 },
        bonuses: { multiplier: 1.1 },
        color: '#2196F3',
        isActive: true
      },
      {
        level: 4,
        name: 'Aventurero',
        description: 'Ganando confianza',
        experienceRequired: 500,
        totalExperienceRequired: 850,
        rewards: { points: 200 },
        bonuses: { multiplier: 1.15 },
        color: '#FF9800',
        isActive: true
      },
      {
        level: 5,
        name: 'Experto',
        description: 'Dominando las habilidades',
        experienceRequired: 750,
        totalExperienceRequired: 1600,
        rewards: { points: 300 },
        bonuses: { multiplier: 1.2 },
        color: '#9C27B0',
        isActive: true
      },
      {
        level: 6,
        name: 'Maestro',
        description: 'Alto nivel de expertise',
        experienceRequired: 1000,
        totalExperienceRequired: 2600,
        rewards: { points: 500 },
        bonuses: { multiplier: 1.25 },
        color: '#D32F2F',
        isActive: true
      },
      {
        level: 7,
        name: 'Leyenda',
        description: 'Referencia en la comunidad',
        experienceRequired: 1500,
        totalExperienceRequired: 4100,
        rewards: { points: 750 },
        bonuses: { multiplier: 1.3 },
        color: '#FFD700',
        isActive: true
      }
    ];

    for (const levelData of defaultLevels) {
      const existingLevel = await this.findByLevelNumber(levelData.level);
      if (!existingLevel) {
        await this.create(levelData);
      }
    }
  }
}