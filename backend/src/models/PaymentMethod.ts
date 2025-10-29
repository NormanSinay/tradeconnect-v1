/**
 * @fileoverview Modelo de Método de Pago para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para métodos de pago tokenizados (PCI DSS compliant)
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { PaymentGateway } from '../utils/constants';
import { User } from './User';

/**
 * Atributos del modelo Método de Pago
 */
export interface PaymentMethodAttributes {
  id?: number;
  userId: number;
  gateway: PaymentGateway;
  gatewayTokenId: string;
  type: 'credit_card' | 'debit_card' | 'bank_account';
  cardLastFour?: string;
  cardBrand?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  bankName?: string;
  accountLastFour?: string;
  isDefault: boolean;
  isActive: boolean;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de método de pago
 */
export interface PaymentMethodCreationAttributes extends Omit<PaymentMethodAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       required:
 *         - userId
 *         - gateway
 *         - gatewayTokenId
 *         - type
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del método de pago
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario propietario
 *           example: 1
 *         gateway:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *           description: Pasarela de pago
 *           example: "stripe"
 *         gatewayTokenId:
 *           type: string
 *           description: Token de la pasarela (nunca mostrar)
 *           example: "tok_123456789"
 *         type:
 *           type: string
 *           enum: [credit_card, debit_card, bank_account]
 *           description: Tipo de método de pago
 *           example: "credit_card"
 *         cardLastFour:
 *           type: string
 *           description: Últimos 4 dígitos de la tarjeta
 *           example: "4242"
 *         cardBrand:
 *           type: string
 *           description: Marca de la tarjeta
 *           example: "visa"
 *         cardExpiryMonth:
 *           type: integer
 *           description: Mes de expiración
 *           example: 12
 *         cardExpiryYear:
 *           type: integer
 *           description: Año de expiración
 *           example: 2025
 *         bankName:
 *           type: string
 *           description: Nombre del banco
 *           example: "Banco Industrial"
 *         accountLastFour:
 *           type: string
 *           description: Últimos 4 dígitos de la cuenta
 *           example: "1234"
 *         isDefault:
 *           type: boolean
 *           description: Es el método por defecto
 *           example: true
 *         isActive:
 *           type: boolean
 *           description: Está activo
 *           example: true
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
  tableName: 'payment_methods',
  modelName: 'PaymentMethod',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['gateway', 'gateway_token_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['gateway']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_default']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class PaymentMethod extends Model<PaymentMethodAttributes, PaymentMethodCreationAttributes> implements PaymentMethodAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario propietario del método de pago'
  })
  declare userId: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['paypal', 'stripe', 'neonet', 'bam']],
      msg: 'La pasarela debe ser paypal, stripe, neonet o bam'
    }
  })
  @Column({
    type: DataType.ENUM('paypal', 'stripe', 'neonet', 'bam'),
    comment: 'Pasarela de pago que tokenizó el método'
  })
  declare gateway: PaymentGateway;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El token de la pasarela es requerido'
    },
    len: {
      args: [10, 255],
      msg: 'El token debe tener entre 10 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Token único de la pasarela (NUNCA mostrar en logs o respuestas)'
  })
  declare gatewayTokenId: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['credit_card', 'debit_card', 'bank_account']],
      msg: 'Tipo de método de pago inválido'
    }
  })
  @Column({
    type: DataType.ENUM('credit_card', 'debit_card', 'bank_account'),
    comment: 'Tipo de método de pago'
  })
  declare type: 'credit_card' | 'debit_card' | 'bank_account';

  @Validate({
    len: {
      args: [4, 4],
      msg: 'Los últimos 4 dígitos deben ser exactamente 4 caracteres'
    },
    isNumeric: {
      msg: 'Los últimos 4 dígitos deben ser numéricos'
    }
  })
  @Column({
    type: DataType.STRING(4),
    comment: 'Últimos 4 dígitos de la tarjeta (para mostrar al usuario)'
  })
  declare cardLastFour?: string;

  @Validate({
    isIn: {
      args: [['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb']],
      msg: 'Marca de tarjeta inválida'
    }
  })
  @Column({
    type: DataType.ENUM('visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb'),
    comment: 'Marca de la tarjeta de crédito'
  })
  declare cardBrand?: string;

  @Validate({
    min: {
      args: [1],
      msg: 'El mes de expiración debe estar entre 1 y 12'
    },
    max: {
      args: [12],
      msg: 'El mes de expiración debe estar entre 1 y 12'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Mes de expiración de la tarjeta (1-12)'
  })
  declare cardExpiryMonth?: number;

  @Validate({
    min: {
      args: [2024],
      msg: 'El año de expiración debe ser válido'
    },
    max: {
      args: [2040],
      msg: 'El año de expiración debe ser válido'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Año de expiración de la tarjeta (4 dígitos)'
  })
  declare cardExpiryYear?: number;

  @Validate({
    len: {
      args: [2, 100],
      msg: 'El nombre del banco debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del banco para cuentas bancarias'
  })
  declare bankName?: string;

  @Validate({
    len: {
      args: [4, 4],
      msg: 'Los últimos 4 dígitos de la cuenta deben ser exactamente 4 caracteres'
    },
    isNumeric: {
      msg: 'Los últimos 4 dígitos de la cuenta deben ser numéricos'
    }
  })
  @Column({
    type: DataType.STRING(4),
    comment: 'Últimos 4 dígitos de la cuenta bancaria'
  })
  declare accountLastFour?: string;

  @AllowNull(false)
  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si este es el método de pago por defecto del usuario'
  })
  declare isDefault: boolean;

  @AllowNull(false)
  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el método de pago está activo'
  })
  declare isActive: boolean;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del método de pago'
  })
  declare metadata?: any;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación del método de pago'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de última actualización'
  })
  declare updatedAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User)
  declare user: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la tarjeta está expirada
   */
  public get isExpired(): boolean {
    if (!this.cardExpiryYear || !this.cardExpiryMonth) return false;

    const now = new Date();
    const expiryDate = new Date(this.cardExpiryYear, this.cardExpiryMonth - 1);

    return expiryDate < now;
  }

  /**
   * Verifica si expira pronto (en los próximos 3 meses)
   */
  public get expiresSoon(): boolean {
    if (!this.cardExpiryYear || !this.cardExpiryMonth) return false;

    const now = new Date();
    const expiryDate = new Date(this.cardExpiryYear, this.cardExpiryMonth - 1);
    const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

    return expiryDate <= threeMonthsFromNow && expiryDate >= now;
  }

  /**
   * Obtiene la máscara de la tarjeta para mostrar
   */
  public get cardMask(): string {
    if (!this.cardLastFour) return '**** **** **** ****';
    return `**** **** **** ${this.cardLastFour}`;
  }

  /**
   * Serializa el método de pago para respuestas de API (sin datos sensibles)
   */
  public toPaymentMethodJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      gateway: this.gateway,
      type: this.type,
      cardLastFour: this.cardLastFour,
      cardBrand: this.cardBrand,
      cardExpiryMonth: this.cardExpiryMonth,
      cardExpiryYear: this.cardExpiryYear,
      bankName: this.bankName,
      accountLastFour: this.accountLastFour,
      isDefault: this.isDefault,
      isActive: this.isActive,
      isExpired: this.isExpired,
      expiresSoon: this.expiresSoon,
      cardMask: this.cardMask,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca método de pago por gateway token ID
   */
  static async findByGatewayToken(gateway: PaymentGateway, gatewayTokenId: string): Promise<PaymentMethod | null> {
    return this.findOne({
      where: { gateway, gatewayTokenId, isActive: true }
    });
  }

  /**
   * Obtiene métodos de pago activos de un usuario
   */
  static async findActiveByUserId(userId: number): Promise<PaymentMethod[]> {
    return this.findAll({
      where: { userId, isActive: true },
      order: [
        ['isDefault', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
  }

  /**
   * Obtiene el método de pago por defecto de un usuario
   */
  static async findDefaultByUserId(userId: number): Promise<PaymentMethod | null> {
    return this.findOne({
      where: { userId, isDefault: true, isActive: true }
    });
  }

  /**
   * Desactiva todos los métodos de pago por defecto de un usuario
   */
  static async clearDefaultForUser(userId: number): Promise<void> {
    await this.update(
      { isDefault: false },
      { where: { userId } }
    );
  }

  /**
   * Obtiene métodos de pago expirados
   */
  static async findExpiredCards(): Promise<PaymentMethod[]> {
    const now = new Date();
    return this.findAll({
      where: {
        type: 'credit_card',
        isActive: true,
        cardExpiryYear: {
          $lt: now.getFullYear()
        }
      }
    });
  }
}
