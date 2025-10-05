/**
 * @fileoverview Modelo de Código Promocional para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Código Promocional
 *
 * Archivo: backend/src/models/PromoCode.ts
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
  ForeignKey,
  Index,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { User } from './User';
import { Promotion } from './Promotion';
import { PromoCodeUsage } from './PromoCodeUsage';

/**
 * Tipos de descuento para códigos promocionales
 */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  SPECIAL_PRICE = 'SPECIAL_PRICE'
}

/**
 * Atributos del modelo Código Promocional
 */
export interface PromoCodeAttributes {
  id?: number;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate?: Date;
  endDate?: Date;
  maxUsesTotal?: number;
  maxUsesPerUser: number;
  currentUsesTotal: number;
  isActive: boolean;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  isStackable: boolean;
  promotionId?: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de código promocional
 */
export interface PromoCodeCreationAttributes extends Omit<PromoCodeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'currentUsesTotal'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     PromoCode:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - discountType
 *         - discountValue
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del código promocional
 *           example: 1
 *         code:
 *           type: string
 *           description: Código promocional único (case-insensitive)
 *           example: "DESCUENTO20"
 *         name:
 *           type: string
 *           description: Nombre/descripción del código
 *           example: "Descuento del 20%"
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         discountType:
 *           type: string
 *           enum: [PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y, SPECIAL_PRICE]
 *           description: Tipo de descuento
 *         discountValue:
 *           type: number
 *           description: Valor del descuento
 *           example: 20
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de vigencia
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin de vigencia
 *         maxUsesTotal:
 *           type: integer
 *           description: Máximo de usos totales (null = ilimitado)
 *         maxUsesPerUser:
 *           type: integer
 *           description: Máximo de usos por usuario
 *           default: 1
 *         currentUsesTotal:
 *           type: integer
 *           description: Usos actuales totales
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Estado del código
 *           default: true
 *         minPurchaseAmount:
 *           type: number
 *           description: Monto mínimo de compra
 *         maxDiscountAmount:
 *           type: number
 *           description: Monto máximo de descuento (para porcentajes)
 *         isStackable:
 *           type: boolean
 *           description: Si puede combinarse con otros descuentos
 *           default: true
 *         promotionId:
 *           type: integer
 *           description: Promoción padre (opcional)
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 */

@Table({
  tableName: 'promo_codes',
  modelName: 'PromoCode',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['code'],
      unique: true
    },
    {
      fields: ['discount_type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['promotion_id']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class PromoCode extends Model<PromoCodeAttributes, PromoCodeCreationAttributes> implements PromoCodeAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El código promocional es requerido'
    },
    len: {
      args: [4, 50],
      msg: 'El código debe tener entre 4 y 50 caracteres'
    },
    is: {
      args: /^[A-Z0-9_-]+$/i,
      msg: 'El código solo puede contener letras, números, guiones y guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(50),
    unique: true,
    comment: 'Código promocional único (case-insensitive)'
  })
  declare code: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del código es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre/descripción del código'
  })
  declare name: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'La descripción no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada'
  })
  declare description?: string;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [Object.values(DiscountType)],
      msg: 'Tipo de descuento inválido'
    }
  })
  @Column({
    type: DataType.ENUM(...Object.values(DiscountType)),
    comment: 'Tipo de descuento'
  })
  declare discountType: DiscountType;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El valor del descuento debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Valor del descuento (porcentaje, monto fijo, etc.)'
  })
  declare discountValue: number;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de inicio debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de inicio de vigencia'
  })
  declare startDate?: Date;

  @Validate({
    isDate: {
      args: true,
      msg: 'La fecha de fin debe ser una fecha válida'
    }
  })
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de fin de vigencia'
  })
  declare endDate?: Date;

  @Validate({
    min: {
      args: [1],
      msg: 'El máximo de usos totales debe ser mayor o igual a 1'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo de usos totales (null = ilimitado)'
  })
  declare maxUsesTotal?: number;

  @Default(1)
  @Validate({
    min: {
      args: [1],
      msg: 'El máximo de usos por usuario debe ser mayor o igual a 1'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo de usos por usuario'
  })
  declare maxUsesPerUser: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'Los usos actuales no pueden ser negativos'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Usos actuales totales'
  })
  declare currentUsesTotal: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Estado del código'
  })
  declare isActive: boolean;

  @Validate({
    min: {
      args: [0],
      msg: 'El monto mínimo no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto mínimo de compra'
  })
  declare minPurchaseAmount?: number;

  @Validate({
    min: {
      args: [0],
      msg: 'El monto máximo de descuento no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto máximo de descuento (para porcentajes)'
  })
  declare maxDiscountAmount?: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si puede combinarse con otros descuentos'
  })
  declare isStackable: boolean;

  @ForeignKey(() => Promotion)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Promoción padre (si pertenece a una campaña)'
  })
  declare promotionId?: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el código'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el código'
  })
  declare updatedBy?: number;

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

  @BelongsTo(() => Promotion)
  declare promotion?: Promotion;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater?: User;

  @HasMany(() => PromoCodeUsage)
  declare usages: PromoCodeUsage[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el código está activo y dentro de fechas válidas
   */
  public get isCurrentlyValid(): boolean {
    if (!this.isActive) return false;

    const now = new Date();

    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;

    return true;
  }

  /**
   * Verifica si el código puede ser usado más veces (total)
   */
  public get canBeUsedTotal(): boolean {
    if (this.maxUsesTotal === null || this.maxUsesTotal === undefined) return true;
    return this.currentUsesTotal < this.maxUsesTotal;
  }

  /**
   * Verifica si un usuario puede usar el código más veces
   */
  public async canBeUsedByUser(userId: number): Promise<boolean> {
    const userUsages = await PromoCodeUsage.count({
      where: {
        promoCodeId: this.id,
        userId: userId,
        status: 'APPLIED'
      }
    });

    return userUsages < this.maxUsesPerUser;
  }

  /**
   * Calcula el descuento basado en el tipo y monto base
   */
  public calculateDiscount(baseAmount: number): number {
    switch (this.discountType) {
      case DiscountType.PERCENTAGE:
        const percentageDiscount = (baseAmount * this.discountValue) / 100;
        return this.maxDiscountAmount
          ? Math.min(percentageDiscount, this.maxDiscountAmount)
          : percentageDiscount;

      case DiscountType.FIXED_AMOUNT:
        return Math.min(this.discountValue, baseAmount);

      case DiscountType.SPECIAL_PRICE:
        return Math.max(0, baseAmount - this.discountValue);

      case DiscountType.BUY_X_GET_Y:
        // Lógica más compleja - por ahora devolver 0
        // Se implementará según reglas específicas del negocio
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Incrementa el contador de usos
   */
  public incrementUsage(): void {
    this.currentUsesTotal += 1;
  }

  /**
   * Serializa el código promocional para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      discountType: this.discountType,
      discountValue: this.discountValue,
      startDate: this.startDate,
      endDate: this.endDate,
      maxUsesTotal: this.maxUsesTotal,
      maxUsesPerUser: this.maxUsesPerUser,
      currentUsesTotal: this.currentUsesTotal,
      isActive: this.isActive,
      minPurchaseAmount: this.minPurchaseAmount,
      maxDiscountAmount: this.maxDiscountAmount,
      isStackable: this.isStackable,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el código promocional para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      promotionId: this.promotionId,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt
    };
  }
}