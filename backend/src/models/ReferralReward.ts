/**
 * @fileoverview Modelo de Recompensas de Referidos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para las recompensas de referidos
 *
 * Archivo: backend/src/models/ReferralReward.ts
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
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Referral } from './Referral';

/**
 * Tipos de recompensas
 */
export enum ReferralRewardType {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
  DISCOUNT = 'DISCOUNT',
  FREE_PRODUCT = 'FREE_PRODUCT',
  FREE_SERVICE = 'FREE_SERVICE',
  POINTS = 'POINTS',
  BADGE = 'BADGE',
  CUSTOM = 'CUSTOM'
}

/**
 * Estados de las recompensas
 */
export enum ReferralRewardStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

/**
 * Atributos del modelo Recompensas de Referidos
 */
export interface ReferralRewardAttributes {
  id?: number;
  referralId: number;
  userId: number; // Usuario que recibe la recompensa
  type: ReferralRewardType;
  status: ReferralRewardStatus;
  amount?: number;
  currency?: string;
  description: string;
  rewardData?: Record<string, any>; // Datos específicos de la recompensa
  approvedAt?: Date;
  processedAt?: Date;
  deliveredAt?: Date;
  expiresAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de recompensa de referido
 */
export interface ReferralRewardCreationAttributes extends Omit<ReferralRewardAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferralReward:
 *       type: object
 *       required:
 *         - referralId
 *         - userId
 *         - type
 *         - status
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la recompensa
 *           example: 1
 *         referralId:
 *           type: integer
 *           description: ID del referido
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario que recibe la recompensa
 *           example: 1
 *         type:
 *           type: string
 *           enum: [CASH, CREDIT, DISCOUNT, FREE_PRODUCT, FREE_SERVICE, POINTS, BADGE, CUSTOM]
 *           description: Tipo de recompensa
 *           example: "CASH"
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, PROCESSED, DELIVERED, CANCELLED, EXPIRED, FAILED]
 *           description: Estado de la recompensa
 *           example: "PENDING"
 *         amount:
 *           type: number
 *           description: Monto/cantidad de la recompensa
 *           example: 50.00
 *         currency:
 *           type: string
 *           description: Moneda de la recompensa
 *           example: "GTQ"
 *         description:
 *           type: string
 *           description: Descripción de la recompensa
 *           example: "Recompensa por referido exitoso"
 *         rewardData:
 *           type: object
 *           description: Datos específicos de la recompensa
 *         approvedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de aprobación
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de procesamiento
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de entrega
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'referral_rewards',
  modelName: 'ReferralReward',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['referral_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['approved_at']
    },
    {
      fields: ['processed_at']
    },
    {
      fields: ['delivered_at']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['referral_id', 'status']
    }
  ]
})
export class ReferralReward extends Model<ReferralRewardAttributes, ReferralRewardCreationAttributes> implements ReferralRewardAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Referral)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del referido'
  })
  declare referralId: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que recibe la recompensa'
  })
  declare userId: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(ReferralRewardType)),
    comment: 'Tipo de recompensa'
  })
  declare type: ReferralRewardType;

  @AllowNull(false)
  @Default(ReferralRewardStatus.PENDING)
  @Index
  @Column({
    type: DataType.ENUM(...Object.values(ReferralRewardStatus)),
    comment: 'Estado de la recompensa'
  })
  declare status: ReferralRewardStatus;

  @Validate({
    min: {
      args: [0],
      msg: 'El monto debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto/cantidad de la recompensa'
  })
  declare amount?: number;

  @Default('GTQ')
  @Column({
    type: DataType.STRING(3),
    comment: 'Moneda de la recompensa'
  })
  declare currency?: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la recompensa'
  })
  declare description: string;

  @Default({})
  @Column({
    type: DataType.JSON,
    comment: 'Datos específicos de la recompensa'
  })
  declare rewardData?: Record<string, any>;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se aprobó la recompensa'
  })
  declare approvedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se procesó la recompensa'
  })
  declare processedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se entregó la recompensa'
  })
  declare deliveredAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de la recompensa'
  })
  declare expiresAt?: Date;

  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales sobre la recompensa'
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

  @BelongsTo(() => Referral)
  declare referral: Referral;

  @BelongsTo(() => User)
  declare user: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la recompensa está pendiente
   */
  public get isPending(): boolean {
    return this.status === ReferralRewardStatus.PENDING;
  }

  /**
   * Verifica si la recompensa está aprobada
   */
  public get isApproved(): boolean {
    return this.status === ReferralRewardStatus.APPROVED;
  }

  /**
   * Verifica si la recompensa está procesada
   */
  public get isProcessed(): boolean {
    return this.status === ReferralRewardStatus.PROCESSED;
  }

  /**
   * Verifica si la recompensa está entregada
   */
  public get isDelivered(): boolean {
    return this.status === ReferralRewardStatus.DELIVERED;
  }

  /**
   * Verifica si la recompensa está cancelada
   */
  public get isCancelled(): boolean {
    return this.status === ReferralRewardStatus.CANCELLED;
  }

  /**
   * Verifica si la recompensa ha expirado
   */
  public get isExpired(): boolean {
    return this.status === ReferralRewardStatus.EXPIRED ||
           (this.expiresAt ? this.expiresAt <= new Date() : false);
  }

  /**
   * Verifica si la recompensa puede ser aprobada
   */
  public get canBeApproved(): boolean {
    return this.isPending && !this.isExpired;
  }

  /**
   * Verifica si la recompensa puede ser procesada
   */
  public get canBeProcessed(): boolean {
    return this.isApproved && !this.isExpired;
  }

  /**
   * Verifica si la recompensa puede ser entregada
   */
  public get canBeDelivered(): boolean {
    return this.isProcessed && !this.isExpired;
  }

  /**
   * Aprueba la recompensa
   */
  public async approve(approvedBy?: number): Promise<void> {
    if (!this.canBeApproved) {
      throw new Error('La recompensa no puede ser aprobada');
    }

    this.status = ReferralRewardStatus.APPROVED;
    this.approvedAt = new Date();

    if (approvedBy) {
      this.notes = (this.notes ? this.notes + '\n' : '') + `Aprobado por usuario ${approvedBy}`;
    }

    await this.save();
  }

  /**
   * Procesa la recompensa
   */
  public async process(processedBy?: number): Promise<void> {
    if (!this.canBeProcessed) {
      throw new Error('La recompensa no puede ser procesada');
    }

    this.status = ReferralRewardStatus.PROCESSED;
    this.processedAt = new Date();

    if (processedBy) {
      this.notes = (this.notes ? this.notes + '\n' : '') + `Procesado por usuario ${processedBy}`;
    }

    await this.save();
  }

  /**
   * Entrega la recompensa
   */
  public async deliver(deliveredBy?: number): Promise<void> {
    if (!this.canBeDelivered) {
      throw new Error('La recompensa no puede ser entregada');
    }

    this.status = ReferralRewardStatus.DELIVERED;
    this.deliveredAt = new Date();

    if (deliveredBy) {
      this.notes = (this.notes ? this.notes + '\n' : '') + `Entregado por usuario ${deliveredBy}`;
    }

    await this.save();
  }

  /**
   * Cancela la recompensa
   */
  public async cancel(reason?: string, cancelledBy?: number): Promise<void> {
    this.status = ReferralRewardStatus.CANCELLED;

    let cancelNote = 'Cancelado';
    if (cancelledBy) {
      cancelNote += ` por usuario ${cancelledBy}`;
    }
    if (reason) {
      cancelNote += `: ${reason}`;
    }

    this.notes = (this.notes ? this.notes + '\n' : '') + cancelNote;
    await this.save();
  }

  /**
   * Marca como expirada
   */
  public async expire(): Promise<void> {
    this.status = ReferralRewardStatus.EXPIRED;
    this.notes = (this.notes ? this.notes + '\n' : '') + 'Expirado automáticamente';
    await this.save();
  }

  /**
   * Marca como fallida
   */
  public async fail(reason?: string): Promise<void> {
    this.status = ReferralRewardStatus.FAILED;

    if (reason) {
      this.notes = (this.notes ? this.notes + '\n' : '') + `Falló: ${reason}`;
    }

    await this.save();
  }

  /**
   * Serializa la recompensa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      amount: this.amount,
      currency: this.currency,
      description: this.description,
      approvedAt: this.approvedAt,
      processedAt: this.processedAt,
      deliveredAt: this.deliveredAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa la recompensa para respuestas detalladas (admin)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      referralId: this.referralId,
      userId: this.userId,
      rewardData: this.rewardData,
      notes: this.notes,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea una nueva recompensa
   */
  static async createReward(data: ReferralRewardCreationAttributes): Promise<ReferralReward> {
    return this.create(data);
  }

  /**
   * Crea recompensa de efectivo
   */
  static async createCashReward(referralId: number, userId: number, amount: number, currency: string = 'GTQ', description?: string): Promise<ReferralReward> {
    return this.createReward({
      referralId,
      userId,
      type: ReferralRewardType.CASH,
      status: ReferralRewardStatus.PENDING,
      amount,
      currency,
      description: description || `Recompensa en efectivo de ${amount} ${currency}`
    });
  }

  /**
   * Crea recompensa de crédito
   */
  static async createCreditReward(referralId: number, userId: number, amount: number, currency: string = 'GTQ', description?: string): Promise<ReferralReward> {
    return this.createReward({
      referralId,
      userId,
      type: ReferralRewardType.CREDIT,
      status: ReferralRewardStatus.PENDING,
      amount,
      currency,
      description: description || `Crédito de ${amount} ${currency}`
    });
  }

  /**
   * Crea recompensa de descuento
   */
  static async createDiscountReward(referralId: number, userId: number, discountPercent: number, description?: string): Promise<ReferralReward> {
    return this.createReward({
      referralId,
      userId,
      type: ReferralRewardType.DISCOUNT,
      status: ReferralRewardStatus.PENDING,
      amount: discountPercent,
      description: description || `Descuento del ${discountPercent}%`,
      rewardData: { discountType: 'percentage', discountValue: discountPercent }
    });
  }

  /**
   * Busca recompensas por usuario
   */
  static async findByUser(userId: number, options: {
    status?: ReferralRewardStatus;
    type?: ReferralRewardType;
    limit?: number;
    offset?: number;
  } = {}): Promise<ReferralReward[]> {
    const where: any = { userId };

    if (options.status) {
      where.status = options.status;
    }

    if (options.type) {
      where.type = options.type;
    }

    return this.findAll({
      where,
      include: [{
        model: Referral,
        as: 'referral',
        attributes: ['id', 'type', 'status', 'commissionAmount']
      }],
      limit: options.limit || 50,
      offset: options.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca recompensas por referido
   */
  static async findByReferral(referralId: number): Promise<ReferralReward[]> {
    return this.findAll({
      where: { referralId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca recompensas pendientes de aprobación
   */
  static async findPendingApproval(limit: number = 100): Promise<ReferralReward[]> {
    return this.findAll({
      where: { status: ReferralRewardStatus.PENDING },
      include: [
        {
          model: Referral,
          as: 'referral',
          attributes: ['id', 'type', 'status']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit,
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Busca recompensas expiradas para limpieza
   */
  static async findExpiredRewards(): Promise<ReferralReward[]> {
    return this.findAll({
      where: {
        status: { $in: [ReferralRewardStatus.PENDING, ReferralRewardStatus.APPROVED, ReferralRewardStatus.PROCESSED] },
        expiresAt: { $lt: new Date() }
      }
    });
  }

  /**
   * Marca recompensas expiradas
   */
  static async markExpiredRewards(): Promise<number> {
    const [affectedRows] = await this.update(
      { status: ReferralRewardStatus.EXPIRED },
      {
        where: {
          status: { $in: [ReferralRewardStatus.PENDING, ReferralRewardStatus.APPROVED, ReferralRewardStatus.PROCESSED] },
          expiresAt: { $lt: new Date() }
        }
      }
    );
    return affectedRows;
  }

  /**
   * Obtiene estadísticas de recompensas
   */
  static async getRewardStats(userId?: number): Promise<{
    totalRewards: number;
    pendingRewards: number;
    approvedRewards: number;
    deliveredRewards: number;
    totalAmount: number;
    rewardsByType: Record<ReferralRewardType, number>;
  }> {
    const where = userId ? { userId } : {};

    const rewards = await this.findAll({
      where,
      attributes: ['status', 'type', 'amount']
    });

    const stats = {
      totalRewards: rewards.length,
      pendingRewards: rewards.filter(r => r.status === ReferralRewardStatus.PENDING).length,
      approvedRewards: rewards.filter(r => r.status === ReferralRewardStatus.APPROVED).length,
      deliveredRewards: rewards.filter(r => r.status === ReferralRewardStatus.DELIVERED).length,
      totalAmount: rewards.reduce((sum, r) => sum + (r.amount || 0), 0),
      rewardsByType: {} as Record<ReferralRewardType, number>
    };

    // Inicializar contadores por tipo
    Object.values(ReferralRewardType).forEach(type => {
      stats.rewardsByType[type] = 0;
    });

    // Contar por tipo
    rewards.forEach(reward => {
      stats.rewardsByType[reward.type]++;
    });

    return stats;
  }

  /**
   * Procesa recompensas automáticamente (para tipos simples)
   */
  static async autoProcessRewards(rewardIds: number[]): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    for (const rewardId of rewardIds) {
      try {
        const reward = await this.findByPk(rewardId);
        if (reward && reward.canBeProcessed) {
          // Para tipos simples, marcar como procesado inmediatamente
          if ([ReferralRewardType.CASH, ReferralRewardType.CREDIT, ReferralRewardType.POINTS].includes(reward.type)) {
            await reward.process();
            processed++;
          }
        }
      } catch (error) {
        console.error(`Error procesando recompensa ${rewardId}:`, error);
        failed++;
      }
    }

    return { processed, failed };
  }
}