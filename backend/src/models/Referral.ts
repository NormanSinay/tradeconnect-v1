/**
 * @fileoverview Modelo de Referido para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Referido con validaciones y métodos
 *
 * Archivo: backend/src/models/Referral.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from './User';
import { ReferralCode } from './ReferralCode';
import { ReferralTracking } from './ReferralTracking';
import { ReferralReward } from './ReferralReward';

/**
 * Estados del referido
 */
export enum ReferralStatus {
  PENDING = 'PENDING',
  QUALIFIED = 'QUALIFIED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

/**
 * Tipos de referido
 */
export enum ReferralType {
  REGISTRATION = 'REGISTRATION',
  PURCHASE = 'PURCHASE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  EVENT_ATTENDANCE = 'EVENT_ATTENDANCE',
  CUSTOM = 'CUSTOM'
}

/**
 * Atributos del modelo Referido
 */
export interface ReferralAttributes {
  id?: number;
  referralCodeId: number;
  referrerId: number;
  referredId: number;
  type: ReferralType;
  status: ReferralStatus;
  qualifiedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  conversionValue?: number;
  commissionAmount?: number;
  metadata?: Record<string, any>;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de referido
 */
export interface ReferralCreationAttributes extends Omit<ReferralAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Referral:
 *       type: object
 *       required:
 *         - referralCodeId
 *         - referrerId
 *         - referredId
 *         - type
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del referido
 *           example: 1
 *         referralCodeId:
 *           type: integer
 *           description: ID del código de referido usado
 *           example: 1
 *         referrerId:
 *           type: integer
 *           description: ID del usuario que refiere
 *           example: 1
 *         referredId:
 *           type: integer
 *           description: ID del usuario referido
 *           example: 2
 *         type:
 *           type: string
 *           enum: [REGISTRATION, PURCHASE, SUBSCRIPTION, EVENT_ATTENDANCE, CUSTOM]
 *           description: Tipo de referido
 *           example: "REGISTRATION"
 *         status:
 *           type: string
 *           enum: [PENDING, QUALIFIED, COMPLETED, CANCELLED, EXPIRED]
 *           description: Estado del referido
 *           example: "PENDING"
 *         qualifiedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se calificó el referido
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se completó el referido
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del referido
 *         conversionValue:
 *           type: number
 *           description: Valor de conversión (ej. monto de compra)
 *           example: 150.00
 *         commissionAmount:
 *           type: number
 *           description: Monto de comisión calculado
 *           example: 15.00
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *         notes:
 *           type: string
 *           description: Notas adicionales
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
  tableName: 'referrals',
  modelName: 'Referral',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['referral_code_id', 'referred_id'],
      where: { deleted_at: null }
    },
    {
      fields: ['referrer_id']
    },
    {
      fields: ['referred_id']
    },
    {
      fields: ['referral_code_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['qualified_at']
    },
    {
      fields: ['completed_at']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class Referral extends Model<ReferralAttributes, ReferralCreationAttributes> implements ReferralAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => ReferralCode)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del código de referido usado'
  })
  declare referralCodeId: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que refiere (referrer)'
  })
  declare referrerId: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario referido (referred)'
  })
  declare referredId: number;

  @AllowNull(false)
  @Default(ReferralType.REGISTRATION)
  @Column({
    type: DataType.ENUM(...Object.values(ReferralType)),
    comment: 'Tipo de referido'
  })
  declare type: ReferralType;

  @AllowNull(false)
  @Default(ReferralStatus.PENDING)
  @Index
  @Column({
    type: DataType.ENUM(...Object.values(ReferralStatus)),
    comment: 'Estado del referido'
  })
  declare status: ReferralStatus;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se calificó el referido'
  })
  declare qualifiedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se completó el referido'
  })
  declare completedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del referido'
  })
  declare expiresAt?: Date;

  @Validate({
    min: {
      args: [0],
      msg: 'El valor de conversión debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Valor de conversión (ej. monto de compra)'
  })
  declare conversionValue?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El monto de comisión debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto de comisión calculado'
  })
  declare commissionAmount?: number;

  @Default({})
  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del referido'
  })
  declare metadata?: Record<string, any>;

  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales sobre el referido'
  })
  declare notes?: string;

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

  @BelongsTo(() => ReferralCode)
  declare referralCode: ReferralCode;

  @BelongsTo(() => User, 'referrerId')
  declare referrer: User;

  @BelongsTo(() => User, 'referredId')
  declare referred: User;

  @HasMany(() => ReferralTracking)
  declare tracking: ReferralTracking[];

  @HasMany(() => ReferralReward)
  declare rewards: ReferralReward[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el referido está pendiente
   */
  public get isPending(): boolean {
    return this.status === ReferralStatus.PENDING;
  }

  /**
   * Verifica si el referido está calificado
   */
  public get isQualified(): boolean {
    return this.status === ReferralStatus.QUALIFIED;
  }

  /**
   * Verifica si el referido está completado
   */
  public get isCompleted(): boolean {
    return this.status === ReferralStatus.COMPLETED;
  }

  /**
   * Verifica si el referido está cancelado
   */
  public get isCancelled(): boolean {
    return this.status === ReferralStatus.CANCELLED;
  }

  /**
   * Verifica si el referido ha expirado
   */
  public get isExpired(): boolean {
    return this.status === ReferralStatus.EXPIRED ||
           (this.expiresAt ? this.expiresAt <= new Date() : false);
  }

  /**
   * Verifica si el referido puede ser calificado
   */
  public get canBeQualified(): boolean {
    return this.isPending && !this.isExpired;
  }

  /**
   * Verifica si el referido puede ser completado
   */
  public get canBeCompleted(): boolean {
    return (this.isPending || this.isQualified) && !this.isExpired;
  }

  /**
   * Califica el referido
   */
  public async qualify(): Promise<void> {
    if (!this.canBeQualified) {
      throw new Error('El referido no puede ser calificado');
    }

    this.status = ReferralStatus.QUALIFIED;
    this.qualifiedAt = new Date();
    await this.save();
  }

  /**
   * Completa el referido
   */
  public async complete(): Promise<void> {
    if (!this.canBeCompleted) {
      throw new Error('El referido no puede ser completado');
    }

    this.status = ReferralStatus.COMPLETED;
    this.completedAt = new Date();
    await this.save();
  }

  /**
   * Cancela el referido
   */
  public async cancel(reason?: string): Promise<void> {
    this.status = ReferralStatus.CANCELLED;
    if (reason) {
      this.notes = (this.notes ? this.notes + '\n' : '') + `Cancelado: ${reason}`;
    }
    await this.save();
  }

  /**
   * Marca como expirado
   */
  public async expire(): Promise<void> {
    this.status = ReferralStatus.EXPIRED;
    await this.save();
  }

  /**
   * Calcula la comisión basada en el código de referido
   */
  public async calculateCommission(): Promise<number> {
    if (!this.conversionValue || this.conversionValue <= 0) {
      return 0;
    }

    // Cargar el código de referido si no está cargado
    if (!this.referralCode) {
      await this.reload({ include: [ReferralCode] });
    }

    const commissionRate = this.referralCode.commissionRate || 0;
    const commission = this.conversionValue * commissionRate;

    this.commissionAmount = commission;
    await this.save();

    return commission;
  }

  /**
   * Serializa el referido para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      qualifiedAt: this.qualifiedAt,
      completedAt: this.completedAt,
      expiresAt: this.expiresAt,
      conversionValue: this.conversionValue,
      commissionAmount: this.commissionAmount,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el referido para respuestas detalladas (admin)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      referralCodeId: this.referralCodeId,
      referrerId: this.referrerId,
      referredId: this.referredId,
      metadata: this.metadata,
      notes: this.notes,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea un nuevo referido
   */
  static async createReferral(data: {
    referralCodeId: number;
    referrerId: number;
    referredId: number;
    type?: ReferralType;
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }): Promise<Referral> {
    // Verificar que no exista ya un referido entre estos usuarios con este código
    const existingReferral = await this.findOne({
      where: {
        referralCodeId: data.referralCodeId,
        referredId: data.referredId
      }
    });

    if (existingReferral) {
      throw new Error('Ya existe un referido para este usuario con este código');
    }

    return this.create({
      ...data,
      type: data.type || ReferralType.REGISTRATION,
      status: ReferralStatus.PENDING
    });
  }

  /**
   * Busca referidos por referrer
   */
  static async findByReferrer(referrerId: number, options: {
    status?: ReferralStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<Referral[]> {
    const where: any = { referrerId };

    if (options.status) {
      where.status = options.status;
    }

    return this.findAll({
      where,
      include: [
        {
          model: ReferralCode,
          as: 'referralCode',
          attributes: ['id', 'code', 'name', 'commissionRate']
        },
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: options.limit || 50,
      offset: options.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca referidos por referido
   */
  static async findByReferred(referredId: number): Promise<Referral[]> {
    return this.findAll({
      where: { referredId },
      include: [
        {
          model: ReferralCode,
          as: 'referralCode',
          attributes: ['id', 'code', 'name']
        },
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca referidos expirados para limpieza
   */
  static async findExpiredReferrals(): Promise<Referral[]> {
    return this.findAll({
      where: {
        status: { [Op.in]: [ReferralStatus.PENDING, ReferralStatus.QUALIFIED] },
        expiresAt: { [Op.lt]: new Date() }
      }
    });
  }

  /**
   * Marca referidos expirados
   */
  static async markExpiredReferrals(): Promise<number> {
    const [affectedRows] = await this.update(
      { status: ReferralStatus.EXPIRED },
      {
        where: {
          status: { [Op.in]: [ReferralStatus.PENDING, ReferralStatus.QUALIFIED] },
          expiresAt: { [Op.lt]: new Date() }
        }
      }
    );
    return affectedRows;
  }

  /**
   * Obtiene estadísticas de referidos
   */
  static async getReferralStats(userId?: number): Promise<{
    totalReferrals: number;
    pendingReferrals: number;
    qualifiedReferrals: number;
    completedReferrals: number;
    totalCommission: number;
    totalConversionValue: number;
  }> {
    const where = userId ? { referrerId: userId } : {};

    const referrals = await this.findAll({
      where,
      attributes: ['status', 'commissionAmount', 'conversionValue']
    });

    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === ReferralStatus.PENDING).length,
      qualifiedReferrals: referrals.filter(r => r.status === ReferralStatus.QUALIFIED).length,
      completedReferrals: referrals.filter(r => r.status === ReferralStatus.COMPLETED).length,
      totalCommission: referrals.reduce((sum, r) => sum + (r.commissionAmount || 0), 0),
      totalConversionValue: referrals.reduce((sum, r) => sum + (r.conversionValue || 0), 0)
    };

    return stats;
  }

  /**
   * Verifica si existe un referido entre dos usuarios
   */
  static async existsBetweenUsers(referrerId: number, referredId: number): Promise<boolean> {
    const referral = await this.findOne({
      where: {
        referrerId,
        referredId,
        status: { [Op.ne]: ReferralStatus.CANCELLED }
      }
    });
    return !!referral;
  }
}