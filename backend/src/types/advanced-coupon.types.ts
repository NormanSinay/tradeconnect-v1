/**
 * @fileoverview Tipos TypeScript para cupones avanzados
 * @version 1.0.0
 * @author TradeConnect Team
 *
 * Archivo: backend/src/types/advanced-coupon.types.ts
 */

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
 * Estados de uso del cupón
 */
export enum CouponUsageStatus {
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
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
 * Interface para contexto de evaluación de cupones
 */
export interface CouponEvaluationContext {
  userId?: number;
  userType?: string;
  userSegment?: string;
  eventId?: number;
  eventCategory?: number;
  purchaseAmount?: number;
  itemQuantity?: number;
  isFirstPurchase?: boolean;
  loyaltyPoints?: number;
  currentDate?: Date;
  customData?: Record<string, any>;
}

/**
 * Interface para resultado de evaluación de cupón
 */
export interface CouponEvaluationResult {
  isApplicable: boolean;
  discountAmount: number;
  reason?: string;
  conditions?: {
    condition: CouponCondition;
    passed: boolean;
    reason?: string;
  }[];
}

/**
 * Interface para estadísticas de cupones
 */
export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUses: number;
  averageUsesPerCoupon: number;
  totalDiscountAmount: number;
  mostUsedCoupon?: {
    id: number;
    code: string;
    name: string;
    uses: number;
  };
}

/**
 * Interface para filtros de búsqueda de cupones
 */
export interface CouponFilters {
  status?: CouponStatus[];
  applicationType?: CouponApplicationType[];
  discountType?: AdvancedDiscountType[];
  applicableEvents?: number[];
  applicableCategories?: number[];
  applicableUserTypes?: string[];
  applicableUserSegments?: string[];
  startDate?: Date;
  endDate?: Date;
  createdBy?: number;
  isActive?: boolean;
  autoApply?: boolean;
  requiresApproval?: boolean;
}

/**
 * Interface para opciones de ordenamiento de cupones
 */
export interface CouponSortOptions {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'code' | 'name' | 'startDate' | 'endDate';
  order: 'ASC' | 'DESC';
}

/**
 * Interface para respuesta de validación de cupón
 */
export interface CouponValidationResponse {
  isValid: boolean;
  coupon?: {
    id: number;
    code: string;
    name: string;
    discountConfig: DiscountConfiguration;
    conditions: CouponCondition[];
  };
  discountAmount: number;
  finalAmount: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Interface para aplicación de cupón en checkout
 */
export interface CouponApplicationRequest {
  couponCode: string;
  userId: number;
  orderId?: string;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    categoryId?: number;
    eventId?: number;
  }>;
  subtotal: number;
  context?: CouponEvaluationContext;
}

/**
 * Interface para respuesta de aplicación de cupón
 */
export interface CouponApplicationResponse {
  success: boolean;
  coupon?: {
    id: number;
    code: string;
    name: string;
    discountAmount: number;
    finalAmount: number;
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Interface para configuración de reglas de negocio de cupones
 */
export interface CouponBusinessRules {
  maxDiscountPercentage: number;
  maxDiscountAmount: number;
  allowStacking: boolean;
  requireApprovalForHighValue: boolean;
  highValueThreshold: number;
  usageLimitWindowHours: number;
  maxUsagesPerUser: number;
  maxUsagesTotal: number;
}