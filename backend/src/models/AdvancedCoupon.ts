/**
 * @fileoverview Modelo de Cupón Avanzado para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Cupón Avanzado con reglas complejas
 *
 * Archivo: backend/src/models/AdvancedCoupon.ts
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
import { Event } from './Event';

/**
 * Tipos de descuento para cupones avanzados
 */
export enum AdvancedDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  SPECIAL_PRICE = 'SPECIAL_PRICE',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUNDLE_DISCOUNT = 'BUNDLE_DISCOUNT'
}

/**
 * Tipos de aplicación del cupón
 */
export enum CouponApplicationType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  CONDITIONAL = 'CONDITIONAL'
}

/**
 * Estados del cupón
 */
export enum CouponStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  DEPLETED = 'DEPLETED'
}

/**
 * Interface para reglas condicionales del cupón
 */
export interface CouponCondition {
  type: 'user_type' | 'event_category' | 'purchase_amount' | 'item_quantity' | 'date_range' | 'user_segment' | 'first_purchase' | 'loyalty_points' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between' | 'contains';
  value: any;
  required?: boolean;
}

/**
 * Interface para configuración de descuento
 */
export interface DiscountConfiguration {
  type: AdvancedDiscountType;
  value: number;
  maxDiscountAmount?: number;
  applicableItems?: number[]; // IDs de items específicos
  excludedItems?: number[]; // IDs de items excluidos
  minQuantity?: number;
  maxQuantity?: number;
  buyQuantity?: number; // Para BUY_X_GET_Y
  getQuantity?: number; // Para BUY_X_GET_Y
  getDiscount?: number; // Para BUY_X_GET_Y
}

/**
 * Atributos del modelo Cupón Avanzado
 */
export interface AdvancedCouponAttributes {
  id?: number;
  code: string;
  name: string;
  description?: string;
  status: CouponStatus;
  discountConfig: DiscountConfiguration;
  conditions: CouponCondition[];
  applicationType: CouponApplicationType;
  priority: number;
  isStackable: boolean;
  startDate?: Date;
  endDate?: Date;
  maxUsesTotal?: number;
  maxUsesPerUser: number;
  currentUsesTotal: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  applicableEvents?: number[];
  applicableCategories?: number[];
  applicableUserTypes?: string[];
  applicableUserSegments?: string[];
  autoApply: boolean;
  requiresApproval: boolean;
  usageLimitWindow?: number; // en horas, para límites de tiempo
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de cupón avanzado
 */
export interface AdvancedCouponCreationAttributes extends Omit<AdvancedCouponAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'currentUsesTotal'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     AdvancedCoupon:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - discountConfig
 *         - conditions
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del cupón avanzado
 *           example: 1
 *         code:
 *           type: string
 *           description: Código único del cupón (case-insensitive)
 *           example: "AVANZADO20"
 *         name:
 *           type: string
 *           description: Nombre del cupón
 *           example: "Cupón Avanzado con Condiciones"
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, PAUSED, EXPIRED, DEPLETED]
 *           description: Estado del cupón
 *           default: DRAFT
 *         discountConfig:
 *           type: object
 *           description: Configuración del descuento
 *         conditions:
 *           type: array
 *           items:
 *             type: object
 *           description: Condiciones para aplicar el cupón
 *         applicationType:
 *           type: string
 *           enum: [AUTOMATIC, MANUAL, CONDITIONAL]
 *           description: Tipo de aplicación
 *           default: MANUAL
 *         priority:
 *           type: integer
 *           description: Prioridad para resolución de conflictos
 *           default: 0
 *         isStackable:
 *           type: boolean
 *           description: Si puede combinarse con otros descuentos
 *           default: true
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
 *         minPurchaseAmount:
 *           type: number
 *           description: Monto mínimo de compra
 *         maxDiscountAmount:
 *           type: number
 *           description: Monto máximo de descuento
 *         applicableEvents:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de eventos aplicables
 *         applicableCategories:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de categorías aplicables
 *         applicableUserTypes:
 *           type: array
 *           items:
 *             type: string
 *           description: Tipos de usuario aplicables
 *         applicableUserSegments:
 *           type: array
 *           items:
 *             type: string
 *           description: Segmentos de usuario aplicables
 *         autoApply:
 *           type: boolean
 *           description: Si se aplica automáticamente
 *           default: false
 *         requiresApproval:
 *           type: boolean
 *           description: Si requiere aprobación manual
 *           default: false
 *         usageLimitWindow:
 *           type: integer
 *           description: Ventana de tiempo para límites de uso (horas)
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 */

@Table({
  tableName: 'advanced_coupons',
  modelName: 'AdvancedCoupon',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['code'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['application_type']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['end_date']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['auto_apply']
    }
  ]
})
export class AdvancedCoupon extends Model<AdvancedCouponAttributes, AdvancedCouponCreationAttributes> implements AdvancedCouponAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El código del cupón es requerido'
    },
    len: {
      args: [3, 50],
      msg: 'El código debe tener entre 3 y 50 caracteres'
    },
    is: {
      args: /^[A-Z0-9_-]+$/i,
      msg: 'El código solo puede contener letras, números, guiones y guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(50),
    unique: true,
    comment: 'Código único del cupón (case-insensitive)'
  })
  declare code: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del cupón es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre del cupón'
  })
  declare name: string;

  @Validate({
    len: {
      args: [0, 2000],
      msg: 'La descripción no puede exceder 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada del cupón'
  })
  declare description?: string;

  @AllowNull(false)
  @Default(CouponStatus.DRAFT)
  @Index
  @Validate({
    isIn: {
      args: [Object.values(CouponStatus)],
      msg: 'Estado de cupón inválido'
    }
  })
  @Column({
    type: DataType.ENUM(...Object.values(CouponStatus)),
    comment: 'Estado del cupón'
  })
  declare status: CouponStatus;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Configuración del descuento'
  })
  declare discountConfig: DiscountConfiguration;

  @AllowNull(false)
  @Default([])
  @Column({
    type: DataType.JSON,
    comment: 'Condiciones para aplicar el cupón'
  })
  declare conditions: CouponCondition[];

  @AllowNull(false)
  @Default(CouponApplicationType.MANUAL)
  @Index
  @Validate({
    isIn: {
      args: [Object.values(CouponApplicationType)],
      msg: 'Tipo de aplicación inválido'
    }
  })
  @Column({
    type: DataType.ENUM(...Object.values(CouponApplicationType)),
    comment: 'Tipo de aplicación del cupón'
  })
  declare applicationType: CouponApplicationType;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La prioridad debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Prioridad para resolución de conflictos (mayor = más prioritario)'
  })
  declare priority: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si puede combinarse con otros descuentos'
  })
  declare isStackable: boolean;

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
    comment: 'Monto máximo de descuento'
  })
  declare maxDiscountAmount?: number;

  @Column({
    type: DataType.JSON,
    comment: 'IDs de eventos aplicables'
  })
  declare applicableEvents?: number[];

  @Column({
    type: DataType.JSON,
    comment: 'IDs de categorías aplicables'
  })
  declare applicableCategories?: number[];

  @Column({
    type: DataType.JSON,
    comment: 'Tipos de usuario aplicables'
  })
  declare applicableUserTypes?: string[];

  @Column({
    type: DataType.JSON,
    comment: 'Segmentos de usuario aplicables'
  })
  declare applicableUserSegments?: string[];

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se aplica automáticamente'
  })
  declare autoApply: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si requiere aprobación manual'
  })
  declare requiresApproval: boolean;

  @Validate({
    min: {
      args: [1],
      msg: 'La ventana de límite debe ser mayor o igual a 1 hora'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Ventana de tiempo para límites de uso (horas)'
  })
  declare usageLimitWindow?: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el cupón'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el cupón'
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

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater?: User;

  @HasMany(() => require('./AdvancedCouponUsage').AdvancedCouponUsage)
  declare usages: any[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el cupón está activo y dentro de fechas válidas
   */
  public get isCurrentlyValid(): boolean {
    if (this.status !== CouponStatus.ACTIVE) return false;

    const now = new Date();

    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;

    return true;
  }

  /**
   * Verifica si el cupón puede ser usado más veces (total)
   */
  public get canBeUsedTotal(): boolean {
    if (this.maxUsesTotal === null || this.maxUsesTotal === undefined) return true;
    return this.currentUsesTotal < this.maxUsesTotal;
  }

  /**
   * Verifica si el cupón puede ser usado por un usuario específico
   */
  public async canBeUsedByUser(userId: number): Promise<boolean> {
    const AdvancedCouponUsage = require('./AdvancedCouponUsage').AdvancedCouponUsage;
    const userUsages = await AdvancedCouponUsage.count({
      where: {
        advancedCouponId: this.id,
        userId: userId,
        status: 'APPLIED'
      }
    });

    return userUsages < this.maxUsesPerUser;
  }

  /**
   * Evalúa si las condiciones del cupón se cumplen para un contexto dado
   */
  public evaluateConditions(context: Record<string, any>): boolean {
    if (!this.conditions || this.conditions.length === 0) return true;

    return this.conditions.every(condition => {
      return this.evaluateCondition(condition, context);
    });
  }

  /**
   * Evalúa una condición individual
   */
  private evaluateCondition(condition: CouponCondition, context: Record<string, any>): boolean {
    const actualValue = context[condition.type];
    const expectedValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'greater_than':
        return actualValue > expectedValue;
      case 'less_than':
        return actualValue < expectedValue;
      case 'in':
        return Array.isArray(expectedValue) ? expectedValue.includes(actualValue) : false;
      case 'not_in':
        return Array.isArray(expectedValue) ? !expectedValue.includes(actualValue) : true;
      case 'between':
        return Array.isArray(expectedValue) && expectedValue.length === 2
          ? actualValue >= expectedValue[0] && actualValue <= expectedValue[1]
          : false;
      case 'contains':
        return typeof actualValue === 'string' && typeof expectedValue === 'string'
          ? actualValue.includes(expectedValue)
          : false;
      default:
        return false;
    }
  }

  /**
   * Calcula el descuento basado en la configuración y monto base
   */
  public calculateDiscount(baseAmount: number, context: Record<string, any> = {}): number {
    if (!this.evaluateConditions(context)) return 0;

    let discount = 0;

    switch (this.discountConfig.type) {
      case AdvancedDiscountType.PERCENTAGE:
        discount = (baseAmount * this.discountConfig.value) / 100;
        if (this.discountConfig.maxDiscountAmount) {
          discount = Math.min(discount, this.discountConfig.maxDiscountAmount);
        }
        break;

      case AdvancedDiscountType.FIXED_AMOUNT:
        discount = Math.min(this.discountConfig.value, baseAmount);
        break;

      case AdvancedDiscountType.SPECIAL_PRICE:
        discount = Math.max(0, baseAmount - this.discountConfig.value);
        break;

      case AdvancedDiscountType.BUY_X_GET_Y:
        // Lógica más compleja - por ahora devolver 0
        // Se implementará según reglas específicas del negocio
        discount = 0;
        break;

      case AdvancedDiscountType.FREE_SHIPPING:
        // El descuento de envío se maneja por separado
        discount = 0;
        break;

      case AdvancedDiscountType.BUNDLE_DISCOUNT:
        // Descuento por bundle - lógica específica
        discount = 0;
        break;

      default:
        discount = 0;
    }

    // Aplicar límite máximo global si existe
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }

    return discount;
  }

  /**
   * Incrementa el contador de usos
   */
  public incrementUsage(): void {
    this.currentUsesTotal += 1;
  }

  /**
   * Verifica si el cupón aplica a un evento específico
   */
  public appliesToEvent(eventId: number): boolean {
    if (!this.applicableEvents || this.applicableEvents.length === 0) return true;
    return this.applicableEvents.includes(eventId);
  }

  /**
   * Verifica si el cupón aplica a una categoría específica
   */
  public appliesToCategory(categoryId: number): boolean {
    if (!this.applicableCategories || this.applicableCategories.length === 0) return true;
    return this.applicableCategories.includes(categoryId);
  }

  /**
   * Verifica si el cupón aplica a un tipo de usuario
   */
  public appliesToUserType(userType: string): boolean {
    if (!this.applicableUserTypes || this.applicableUserTypes.length === 0) return true;
    return this.applicableUserTypes.includes(userType);
  }

  /**
   * Serializa el cupón avanzado para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      status: this.status,
      discountConfig: this.discountConfig,
      applicationType: this.applicationType,
      priority: this.priority,
      isStackable: this.isStackable,
      startDate: this.startDate,
      endDate: this.endDate,
      maxUsesTotal: this.maxUsesTotal,
      maxUsesPerUser: this.maxUsesPerUser,
      currentUsesTotal: this.currentUsesTotal,
      minPurchaseAmount: this.minPurchaseAmount,
      maxDiscountAmount: this.maxDiscountAmount,
      autoApply: this.autoApply,
      requiresApproval: this.requiresApproval,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el cupón avanzado para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      conditions: this.conditions,
      applicableEvents: this.applicableEvents,
      applicableCategories: this.applicableCategories,
      applicableUserTypes: this.applicableUserTypes,
      applicableUserSegments: this.applicableUserSegments,
      usageLimitWindow: this.usageLimitWindow,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca cupones aplicables automáticamente para un contexto dado
   */
  static async findAutoApplicableCoupons(context: Record<string, any>): Promise<AdvancedCoupon[]> {
    const coupons = await this.findAll({
      where: {
        status: CouponStatus.ACTIVE,
        autoApply: true
      },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    return coupons.filter(coupon => {
      return coupon.isCurrentlyValid &&
             coupon.canBeUsedTotal &&
             coupon.evaluateConditions(context);
    });
  }

  /**
   * Busca un cupón por código
   */
  static async findByCode(code: string): Promise<AdvancedCoupon | null> {
    return this.findOne({
      where: {
        code: code.toUpperCase()
      }
    });
  }

  /**
   * Busca cupones aplicables para un usuario y contexto específicos
   */
  static async findApplicableForUser(userId: number, context: Record<string, any>): Promise<AdvancedCoupon[]> {
    const coupons = await this.findAll({
      where: {
        status: CouponStatus.ACTIVE
      },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    const applicableCoupons: AdvancedCoupon[] = [];

    for (const coupon of coupons) {
      if (!coupon.isCurrentlyValid || !coupon.canBeUsedTotal) continue;
      if (!(await coupon.canBeUsedByUser(userId))) continue;
      if (!coupon.evaluateConditions(context)) continue;

      applicableCoupons.push(coupon);
    }

    return applicableCoupons;
  }

  /**
   * Obtiene estadísticas de uso de cupones
   */
  static async getUsageStats(): Promise<{
    totalCoupons: number;
    activeCoupons: number;
    totalUses: number;
    averageUsesPerCoupon: number;
  }> {
    const [totalCoupons, activeCoupons, totalUsesResult] = await Promise.all([
      this.count(),
      this.count({ where: { status: CouponStatus.ACTIVE } }),
      this.sum('currentUsesTotal')
    ]);

    return {
      totalCoupons,
      activeCoupons,
      totalUses: totalUsesResult || 0,
      averageUsesPerCoupon: totalCoupons > 0 ? (totalUsesResult || 0) / totalCoupons : 0
    };
  }
}