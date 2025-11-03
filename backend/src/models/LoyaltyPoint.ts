/**
 * @fileoverview Modelo de Punto de Lealtad para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Punto de Lealtad con validaciones y métodos
 *
 * Archivo: backend/src/models/LoyaltyPoint.ts
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
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo LoyaltyPoint
 */
export interface LoyaltyPointAttributes {
  id?: number;
  userId: number;
  points: number;
  reason: string;
  transactionType: string;
  referenceId?: string;
  referenceType?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de punto de lealtad
 */
export interface LoyaltyPointCreationAttributes extends Omit<LoyaltyPointAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoyaltyPoint:
 *       type: object
 *       required:
 *         - userId
 *         - points
 *         - reason
 *         - transactionType
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del punto de lealtad
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario
 *           example: 123
 *         points:
 *           type: integer
 *           description: Cantidad de puntos (positivo para ganar, negativo para gastar)
 *           example: 50
 *         reason:
 *           type: string
 *           description: Razón de la transacción
 *           example: "Compra de entrada a evento"
 *         transactionType:
 *           type: string
 *           enum: [earned, spent, expired, bonus]
 *           description: Tipo de transacción
 *         referenceId:
 *           type: string
 *           description: ID de referencia (ej. ID de evento, compra, etc.)
 *         referenceType:
 *           type: string
 *           description: Tipo de referencia
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración de los puntos
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'loyalty_points',
  modelName: 'LoyaltyPoint',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['transaction_type']
    },
    {
      fields: ['reference_id']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class LoyaltyPoint extends Model<LoyaltyPointAttributes, LoyaltyPointCreationAttributes> implements LoyaltyPointAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario propietario de los puntos'
  })
  declare userId: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'Los puntos son requeridos'
    },
    min: {
      args: [-999999],
      msg: 'Los puntos deben ser mayores o iguales a -999999'
    },
    max: {
      args: [999999],
      msg: 'Los puntos deben ser menores o iguales a 999999'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Cantidad de puntos (positivo = ganado, negativo = gastado)'
  })
  declare points: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La razón es requerida'
    },
    len: {
      args: [3, 255],
      msg: 'La razón debe tener entre 3 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Razón de la transacción de puntos'
  })
  declare reason: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['earned', 'spent', 'expired', 'bonus']],
      msg: 'El tipo de transacción debe ser: earned, spent, expired o bonus'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('earned', 'spent', 'expired', 'bonus'),
    comment: 'Tipo de transacción de puntos'
  })
  declare transactionType: string;

  @Index
  @Validate({
    len: {
      args: [0, 100],
      msg: 'El ID de referencia no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID de referencia de la transacción (ej. ID de evento, compra)'
  })
  declare referenceId?: string;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El tipo de referencia no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Tipo de referencia (ej. event, purchase, referral)'
  })
  declare referenceType?: string;

  @Index
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de expiración debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de los puntos'
  })
  declare expiresAt?: Date;

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

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si los puntos han expirado
   */
  public get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si los puntos son positivos (ganados)
   */
  public get isEarned(): boolean {
    return this.points > 0;
  }

  /**
   * Verifica si los puntos son negativos (gastados)
   */
  public get isSpent(): boolean {
    return this.points < 0;
  }

  /**
   * Obtiene el valor absoluto de los puntos
   */
  public get absolutePoints(): number {
    return Math.abs(this.points);
  }

  /**
   * Serializa el punto de lealtad para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      points: this.points,
      reason: this.reason,
      transactionType: this.transactionType,
      referenceId: this.referenceId,
      referenceType: this.referenceType,
      expiresAt: this.expiresAt,
      isExpired: this.isExpired,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el punto de lealtad para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca puntos de lealtad por usuario
   */
  static async findByUser(userId: number, limit?: number, offset?: number): Promise<LoyaltyPoint[]> {
    return this.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Calcula el balance total de puntos de un usuario
   */
  static async getUserBalance(userId: number): Promise<number> {
    const result = await this.sum('points', {
      where: { userId }
    });
    return result || 0;
  }

  /**
   * Calcula el balance de puntos activos (no expirados) de un usuario
   */
  static async getActiveUserBalance(userId: number): Promise<number> {
    const result = await this.sum('points', {
      where: {
        userId,
        expiresAt: {
          $or: [null, { $gt: new Date() }]
        }
      }
    });

    return result || 0;
  }

  /**
   * Busca puntos expirados
   */
  static async findExpiredPoints(): Promise<LoyaltyPoint[]> {
    return this.findAll({
      where: {
        expiresAt: {
          $lt: new Date()
        }
      },
      order: [['expiresAt', 'ASC']]
    });
  }

  /**
   * Busca puntos por tipo de transacción
   */
  static async findByTransactionType(userId: number, transactionType: string): Promise<LoyaltyPoint[]> {
    return this.findAll({
      where: {
        userId,
        transactionType
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca puntos por referencia
   */
  static async findByReference(referenceId: string, referenceType?: string): Promise<LoyaltyPoint[]> {
    const where: any = {
      referenceId
    };

    if (referenceType) {
      where.referenceType = referenceType;
    }

    return this.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  }
}