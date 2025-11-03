/**
 * @fileoverview Modelo de UserBadge para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad UserBadge (relación muchos a muchos entre User y Badge)
 *
 * Archivo: backend/src/models/UserBadge.ts
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
  Index,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Badge } from './Badge';

/**
 * Atributos del modelo UserBadge
 */
export interface UserBadgeAttributes {
  id?: number;
  userId: number;
  badgeId: number;
  earnedAt: Date;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de user badge
 */
export interface UserBadgeCreationAttributes extends Omit<UserBadgeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserBadge:
 *       type: object
 *       required:
 *         - userId
 *         - badgeId
 *         - earnedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la relación user-badge
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario
 *           example: 123
 *         badgeId:
 *           type: integer
 *           description: ID del badge
 *           example: 5
 *         earnedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se ganó el badge
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales de la obtención del badge
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'user_badges',
  modelName: 'UserBadge',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'badge_id'],
      where: { deleted_at: null }
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['badge_id']
    },
    {
      fields: ['earned_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class UserBadge extends Model<UserBadgeAttributes, UserBadgeCreationAttributes> implements UserBadgeAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que ganó el badge'
  })
  declare userId: number;

  @ForeignKey(() => Badge)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del badge ganado'
  })
  declare badgeId: number;

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de obtención debe ser una fecha válida'
    }
  })
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando el usuario ganó el badge'
  })
  declare earnedAt: Date;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de la obtención del badge'
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

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Badge)
  declare badge: Badge;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Serializa la relación user-badge para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      badgeId: this.badgeId,
      earnedAt: this.earnedAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la relación user-badge para respuestas completas
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
   * Busca badges de un usuario
   */
  static async findByUser(userId: number, limit?: number, offset?: number): Promise<UserBadge[]> {
    return this.findAll({
      where: { userId },
      include: [
        {
          model: Badge,
          as: 'badge'
        }
      ],
      order: [['earnedAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Busca usuarios que tienen un badge específico
   */
  static async findByBadge(badgeId: number, limit?: number, offset?: number): Promise<UserBadge[]> {
    return this.findAll({
      where: { badgeId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['earnedAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Verifica si un usuario ya tiene un badge específico
   */
  static async userHasBadge(userId: number, badgeId: number): Promise<boolean> {
    const userBadge = await this.findOne({
      where: { userId, badgeId }
    });
    return !!userBadge;
  }

  /**
   * Cuenta badges de un usuario
   */
  static async countUserBadges(userId: number): Promise<number> {
    return this.count({
      where: { userId }
    });
  }

  /**
   * Busca badges ganados en un período
   */
  static async findEarnedInPeriod(startDate: Date, endDate: Date): Promise<UserBadge[]> {
    return this.findAll({
      where: {
        earnedAt: {
          $gte: startDate,
          $lte: endDate
        }
      },
      include: [
        {
          model: Badge,
          as: 'badge'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['earnedAt', 'DESC']]
    });
  }

  /**
   * Busca badges más populares (más ganados)
   */
  static async findMostPopularBadges(limit: number = 10): Promise<UserBadge[]> {
    // Esta consulta requiere una agregación más compleja
    // Por ahora retornamos badges ordenados por fecha de creación
    return this.findAll({
      include: [
        {
          model: Badge,
          as: 'badge'
        }
      ],
      order: [['earnedAt', 'DESC']],
      limit
    });
  }
}