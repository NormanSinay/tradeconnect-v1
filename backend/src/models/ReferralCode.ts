/**
 * @fileoverview Modelo de Código de Referido para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Código de Referido con validaciones y métodos
 *
 * Archivo: backend/src/models/ReferralCode.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  Unique,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from './User';
import { Referral } from './Referral';

/**
 * Estados del código de referido
 */
export enum ReferralCodeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED'
}

/**
 * Tipos de código de referido
 */
export enum ReferralCodeType {
  PERSONAL = 'PERSONAL',
  CAMPAIGN = 'CAMPAIGN',
  PROMOTIONAL = 'PROMOTIONAL',
  SYSTEM = 'SYSTEM'
}

/**
 * Atributos del modelo Código de Referido
 */
export interface ReferralCodeAttributes {
  id?: number;
  code: string;
  userId: number;
  type: ReferralCodeType;
  status: ReferralCodeStatus;
  name?: string;
  description?: string;
  maxUses?: number;
  currentUses: number;
  expiresAt?: Date;
  isPublic: boolean;
  commissionRate?: number;
  rewardConfig?: Record<string, any>;
  campaignId?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de código de referido
 */
export interface ReferralCodeCreationAttributes extends Omit<ReferralCodeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferralCode:
 *       type: object
 *       required:
 *         - code
 *         - userId
 *         - type
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del código de referido
 *           example: 1
 *         code:
 *           type: string
 *           description: Código único del referido
 *           example: "REF123ABC"
 *         userId:
 *           type: integer
 *           description: ID del usuario propietario del código
 *           example: 1
 *         type:
 *           type: string
 *           enum: [PERSONAL, CAMPAIGN, PROMOTIONAL, SYSTEM]
 *           description: Tipo de código de referido
 *           example: "PERSONAL"
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, EXPIRED, SUSPENDED]
 *           description: Estado del código
 *           example: "ACTIVE"
 *         name:
 *           type: string
 *           description: Nombre del código/campaña
 *           example: "Invitación Especial"
 *         description:
 *           type: string
 *           description: Descripción del código
 *           example: "Código especial para referidos premium"
 *         maxUses:
 *           type: integer
 *           description: Máximo número de usos permitidos
 *           example: 100
 *         currentUses:
 *           type: integer
 *           description: Número actual de usos
 *           default: 0
 *           example: 5
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración
 *         isPublic:
 *           type: boolean
 *           description: Si el código es público
 *           default: false
 *         commissionRate:
 *           type: number
 *           description: Tasa de comisión para el referido
 *           example: 0.10
 *         rewardConfig:
 *           type: object
 *           description: Configuración de recompensas
 *         campaignId:
 *           type: string
 *           description: ID de campaña asociada
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
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
  tableName: 'referral_codes',
  modelName: 'ReferralCode',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['code'],
      where: { deleted_at: null }
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
      fields: ['expires_at']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['campaign_id']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class ReferralCode extends Model<ReferralCodeAttributes, ReferralCodeCreationAttributes> implements ReferralCodeAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    len: {
      args: [3, 50],
      msg: 'El código debe tener entre 3 y 50 caracteres'
    },
    notEmpty: {
      msg: 'El código es requerido'
    },
    is: {
      args: /^[A-Z0-9_-]+$/i,
      msg: 'El código solo puede contener letras, números, guiones y guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Código único del referido'
  })
  declare code: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario propietario del código'
  })
  declare userId: number;

  @AllowNull(false)
  @Default(ReferralCodeType.PERSONAL)
  @Column({
    type: DataType.ENUM(...Object.values(ReferralCodeType)),
    comment: 'Tipo de código de referido'
  })
  declare type: ReferralCodeType;

  @AllowNull(false)
  @Default(ReferralCodeStatus.ACTIVE)
  @Index
  @Column({
    type: DataType.ENUM(...Object.values(ReferralCodeStatus)),
    comment: 'Estado del código de referido'
  })
  declare status: ReferralCodeStatus;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'El nombre no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre del código/campaña'
  })
  declare name?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Descripción del código de referido'
  })
  declare description?: string;

  @Validate({
    min: {
      args: [1],
      msg: 'El máximo de usos debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de usos permitidos (null = ilimitado)'
  })
  declare maxUses?: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número actual de usos'
  })
  declare currentUses: number;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del código'
  })
  declare expiresAt?: Date;

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el código es público y puede ser usado por cualquiera'
  })
  declare isPublic: boolean;

  @Validate({
    min: {
      args: [0],
      msg: 'La tasa de comisión debe ser mayor o igual a 0'
    },
    max: {
      args: [1],
      msg: 'La tasa de comisión no puede exceder 1 (100%)'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 4),
    comment: 'Tasa de comisión para el referido (0.0000 - 1.0000)'
  })
  declare commissionRate?: number;

  @Default({})
  @Column({
    type: DataType.JSON,
    comment: 'Configuración de recompensas para el referido'
  })
  declare rewardConfig?: Record<string, any>;

  @Index
  @Column({
    type: DataType.STRING(100),
    comment: 'ID de campaña asociada'
  })
  declare campaignId?: string;

  @Default({})
  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del código'
  })
  declare metadata?: Record<string, any>;

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

  @HasMany(() => Referral)
  declare referrals: Referral[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  static async generateCode(instance: ReferralCode): Promise<void> {
    if (!instance.code) {
      // Generar código único si no se proporciona
      let code: string;
      let exists: boolean;

      do {
        code = ReferralCode.generateRandomCode();
        exists = await ReferralCode.isCodeTaken(code);
      } while (exists);

      instance.code = code;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el código está activo y no expirado
   */
  public get isActive(): boolean {
    return this.status === ReferralCodeStatus.ACTIVE &&
           (!this.expiresAt || this.expiresAt > new Date()) &&
           (!this.maxUses || this.currentUses < this.maxUses);
  }

  /**
   * Verifica si el código ha expirado
   */
  public get isExpired(): boolean {
    return this.expiresAt ? this.expiresAt <= new Date() : false;
  }

  /**
   * Verifica si el código puede ser usado más veces
   */
  public get canBeUsed(): boolean {
    return this.isActive && (!this.maxUses || this.currentUses < this.maxUses);
  }

  /**
   * Incrementa el contador de usos
   */
  public async incrementUsage(): Promise<void> {
    this.currentUses += 1;
    await this.save();
  }

  /**
   * Obtiene la URL completa del código de referido
   */
  public getReferralUrl(baseUrl?: string): string {
    const base = baseUrl || process.env.FRONTEND_URL || 'https://tradeconnect.gt';
    return `${base}/ref/${this.code}`;
  }

  /**
   * Serializa el código para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      type: this.type,
      isPublic: this.isPublic,
      commissionRate: this.commissionRate,
      expiresAt: this.expiresAt,
      currentUses: this.currentUses,
      maxUses: this.maxUses,
      referralUrl: this.getReferralUrl(),
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el código para respuestas detalladas (admin)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      status: this.status,
      rewardConfig: this.rewardConfig,
      campaignId: this.campaignId,
      metadata: this.metadata,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un código aleatorio único
   */
  static generateRandomCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Genera un código personalizado basado en el nombre del usuario
   */
  static generatePersonalCode(userName: string, userId: number): string {
    const baseName = userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${baseName}${userId}${randomPart}`;
  }

  /**
   * Verifica si un código ya está en uso
   */
  static async isCodeTaken(code: string, excludeId?: number): Promise<boolean> {
    const where: any = { code: code.toUpperCase() };

    if (excludeId) {
      where.id = { $ne: excludeId };
    }

    const existingCode = await this.findOne({ where, paranoid: false });
    return !!existingCode;
  }

  /**
   * Busca un código por su valor (case-insensitive)
   */
  static async findByCode(code: string): Promise<ReferralCode | null> {
    return this.findOne({
      where: { code: code.toUpperCase() },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
  }

  /**
   * Busca códigos activos de un usuario
   */
  static async findActiveByUser(userId: number): Promise<ReferralCode[]> {
    return this.findAll({
      where: {
        userId,
        status: ReferralCodeStatus.ACTIVE,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ] as any
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca códigos públicos activos
   */
  static async findActivePublicCodes(): Promise<ReferralCode[]> {
    return this.findAll({
      where: {
        isPublic: true,
        status: ReferralCodeStatus.ACTIVE,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ] as any
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca códigos expirados para limpieza
   */
  static async findExpiredCodes(): Promise<ReferralCode[]> {
    return this.findAll({
      where: {
        expiresAt: { [Op.lt]: new Date() },
        status: ReferralCodeStatus.ACTIVE
      }
    });
  }

  /**
   * Marca códigos expirados como expirados
   */
  static async markExpiredCodes(): Promise<number> {
    const [affectedRows] = await this.update(
      { status: ReferralCodeStatus.EXPIRED },
      {
        where: {
          expiresAt: { [Op.lt]: new Date() },
          status: ReferralCodeStatus.ACTIVE
        }
      }
    );
    return affectedRows;
  }

  /**
   * Obtiene estadísticas de uso de códigos de referido
   */
  static async getUsageStats(userId?: number): Promise<{
    totalCodes: number;
    activeCodes: number;
    totalUses: number;
    expiredCodes: number;
  }> {
    const where = userId ? { userId } : {};

    const codes = await this.findAll({
      where,
      attributes: ['status', 'currentUses']
    });

    return {
      totalCodes: codes.length,
      activeCodes: codes.filter(c => c.status === ReferralCodeStatus.ACTIVE).length,
      totalUses: codes.reduce((sum, c) => sum + c.currentUses, 0),
      expiredCodes: codes.filter(c => c.status === ReferralCodeStatus.EXPIRED).length
    };
  }
}