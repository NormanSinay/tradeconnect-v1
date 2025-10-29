/**
 * @fileoverview Modelo de Uso de Código Promocional para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Uso de Código Promocional
 *
 * Archivo: backend/src/models/PromoCodeUsage.ts
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
  ForeignKey,
  Index,
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { PromoCode } from './PromoCode';
import { Registration } from './Registration';
import { Event } from './Event';

/**
 * Estados de uso del código promocional
 */
export enum PromoCodeUsageStatus {
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Atributos del modelo Uso de Código Promocional
 */
export interface PromoCodeUsageAttributes {
  id?: number;
  promoCodeId: number;
  userId: number;
  registrationId?: number;
  cartSessionId?: string;
  eventId: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  currency: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: any;
  status: PromoCodeUsageStatus;
  appliedAt: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de uso de código promocional
 */
export interface PromoCodeUsageCreationAttributes extends Omit<PromoCodeUsageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PromoCodeUsage:
 *       type: object
 *       required:
 *         - promoCodeId
 *         - userId
 *         - eventId
 *         - discountAmount
 *         - originalAmount
 *         - finalAmount
 *         - currency
 *         - status
 *         - appliedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del uso
 *           example: 1
 *         promoCodeId:
 *           type: integer
 *           description: Código promocional usado
 *         userId:
 *           type: integer
 *           description: Usuario que usó el código
 *         registrationId:
 *           type: integer
 *           description: Inscripción donde se aplicó el descuento
 *         cartSessionId:
 *           type: string
 *           description: ID de sesión del carrito (si aplica antes de registro)
 *         eventId:
 *           type: integer
 *           description: Evento al que se aplicó el descuento
 *         discountAmount:
 *           type: number
 *           description: Monto del descuento aplicado
 *         originalAmount:
 *           type: number
 *           description: Monto original antes del descuento
 *         finalAmount:
 *           type: number
 *           description: Monto final después del descuento
 *         currency:
 *           type: string
 *           description: Moneda del descuento
 *           default: GTQ
 *         userAgent:
 *           type: string
 *           description: User agent del navegador
 *         ipAddress:
 *           type: string
 *           description: Dirección IP del usuario
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales del uso
 *         status:
 *           type: string
 *           enum: [APPLIED, CANCELLED, REFUNDED]
 *           description: Estado del uso del código
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de aplicación
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de cancelación (si aplica)
 */

@Table({
  tableName: 'promo_code_usage',
  modelName: 'PromoCodeUsage',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['promo_code_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['registration_id']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['applied_at']
    },
    {
      fields: ['user_id', 'promo_code_id']
    },
    {
      fields: ['event_id', 'applied_at']
    }
  ]
})
export class PromoCodeUsage extends Model<PromoCodeUsageAttributes, PromoCodeUsageCreationAttributes> implements PromoCodeUsageAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => PromoCode)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Código promocional usado'
  })
  declare promoCodeId: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que usó el código'
  })
  declare userId: number;

  @ForeignKey(() => Registration)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Inscripción donde se aplicó el descuento'
  })
  declare registrationId?: number;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'El ID de sesión no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'ID de sesión del carrito (si aplica antes de registro)'
  })
  declare cartSessionId?: string;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Evento al que se aplicó el descuento'
  })
  declare eventId: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto de descuento no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto del descuento aplicado'
  })
  declare discountAmount: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto original no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto original antes del descuento'
  })
  declare originalAmount: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto final no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto final después del descuento'
  })
  declare finalAmount: number;

  @Default('GTQ')
  @Validate({
    isIn: {
      args: [['GTQ', 'USD']],
      msg: 'La moneda debe ser GTQ o USD'
    }
  })
  @Column({
    type: DataType.STRING(3),
    comment: 'Moneda del descuento'
  })
  declare currency: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'El user agent no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'User agent del navegador'
  })
  declare userAgent?: string;

  @Validate({
    isIP: {
      msg: 'La dirección IP debe ser válida'
    }
  })
  @Column({
    type: DataType.STRING(45),
    comment: 'Dirección IP del usuario'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del uso'
  })
  declare metadata?: any;

  @AllowNull(false)
  @Default(PromoCodeUsageStatus.APPLIED)
  @Index
  @Validate({
    isIn: {
      args: [Object.values(PromoCodeUsageStatus)],
      msg: 'Estado de uso inválido'
    }
  })
  @Column({
    type: DataType.ENUM(...Object.values(PromoCodeUsageStatus)),
    comment: 'Estado del uso del código'
  })
  declare status: PromoCodeUsageStatus;

  @AllowNull(false)
  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de aplicación debe ser una fecha válida'
    }
  })
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de aplicación'
  })
  declare appliedAt: Date;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de cancelación debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de cancelación (si aplica)'
  })
  declare cancelledAt?: Date;

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

  @BelongsTo(() => PromoCode)
  declare promoCode: PromoCode;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Registration)
  declare registration?: Registration;

  @BelongsTo(() => Event)
  declare event: Event;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el uso está activo
   */
  public get isActive(): boolean {
    return this.status === PromoCodeUsageStatus.APPLIED;
  }

  /**
   * Cancela el uso del código promocional
   */
  public cancel(): void {
    this.status = PromoCodeUsageStatus.CANCELLED;
    this.cancelledAt = new Date();
  }

  /**
   * Marca el uso como reembolsado
   */
  public refund(): void {
    this.status = PromoCodeUsageStatus.REFUNDED;
    this.cancelledAt = new Date();
  }

  /**
   * Serializa el uso para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      promoCodeId: this.promoCodeId,
      userId: this.userId,
      registrationId: this.registrationId,
      eventId: this.eventId,
      discountAmount: this.discountAmount,
      originalAmount: this.originalAmount,
      finalAmount: this.finalAmount,
      currency: this.currency,
      status: this.status,
      appliedAt: this.appliedAt,
      cancelledAt: this.cancelledAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el uso para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      cartSessionId: this.cartSessionId,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress,
      metadata: this.metadata,
      updatedAt: this.updatedAt
    };
  }
}
