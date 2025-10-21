/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Promociones
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para promociones y códigos promocionales en el panel administrativo
 */

import type { AppliedDiscount } from './registration.types';

/**
 * Tipos de promoción
 */
export enum PromotionType {
  GENERAL = 'GENERAL',
  EVENT_SPECIFIC = 'EVENT_SPECIFIC',
  CATEGORY_SPECIFIC = 'CATEGORY_SPECIFIC',
  MEMBERSHIP = 'MEMBERSHIP'
}

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
 * Estados de uso del código promocional
 */
export enum PromoCodeUsageStatus {
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Interface base para promociones
 */
export interface BasePromotion {
  id?: number;
  name: string;
  description?: string;
  type: PromotionType;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  eventIds?: number[];
  categoryIds?: number[];
  minPurchaseAmount?: number;
  userTypes?: string[];
  isStackable: boolean;
  priority: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de promociones
 */
export interface CreatePromotionRequest extends Omit<BasePromotion, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * Interface para actualización de promociones
 */
export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {}

/**
 * Interface para respuesta de promociones
 */
export interface PromotionResponse extends BasePromotion {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface base para códigos promocionales
 */
export interface BasePromoCode {
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
 * Interface para creación de códigos promocionales
 */
export interface CreatePromoCodeRequest extends Omit<BasePromoCode, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'currentUsesTotal'> {}

/**
 * Interface para actualización de códigos promocionales
 */
export interface UpdatePromoCodeRequest extends Partial<CreatePromoCodeRequest> {}

/**
 * Interface para respuesta de códigos promocionales
 */
export interface PromoCodeResponse extends BasePromoCode {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para validación de códigos promocionales
 */
export interface ValidatePromoCodeRequest {
  code: string;
  eventId?: number;
  userId?: number;
  cartTotal?: number;
}

/**
 * Interface para respuesta de validación de códigos
 */
export interface ValidatePromoCodeResponse {
  valid: boolean;
  promoCode?: PromoCodeResponse;
  discountAmount?: number;
  finalAmount?: number;
  message: string;
  errors?: string[];
}

/**
 * Interface para aplicación de códigos promocionales
 */
export interface ApplyPromoCodeRequest {
  code: string;
  eventId: number;
  userId?: number;
  cartTotal: number;
  quantity?: number;
}

/**
 * Interface para respuesta de aplicación de códigos
 */
export interface ApplyPromoCodeResponse {
  success: boolean;
  promoCode?: PromoCodeResponse;
  discountAmount: number;
  finalAmount: number;
  message: string;
  appliedDiscounts?: AppliedDiscount[];
}

/**
 * Interface para uso de códigos promocionales
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
 * Interface para creación de uso de códigos
 */
export interface CreatePromoCodeUsageRequest extends Omit<PromoCodeUsageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Interface para respuesta de uso de códigos
 */
export interface PromoCodeUsageResponse extends PromoCodeUsageAttributes {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para estadísticas de códigos promocionales
 */
export interface PromoCodeStats {
  totalUses: number;
  uniqueUsers: number;
  totalDiscount: number;
  averageDiscount: number;
  conversionRate: number;
  revenueImpact: number;
}

/**
 * Interface para filtros de búsqueda de promociones
 */
export interface PromotionFilters {
  type?: PromotionType;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

/**
 * Interface para filtros de búsqueda de códigos promocionales
 */
export interface PromoCodeFilters {
  isActive?: boolean;
  discountType?: DiscountType;
  promotionId?: number;
  createdBy?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Interface para respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Estadísticas de promociones
 */
export interface PromotionStats {
  totalPromotions: number;
  activePromotions: number;
  totalPromoCodes: number;
  activePromoCodes: number;
  totalUses: number;
  totalDiscountGiven: number;
  averageDiscountPerUse: number;
  mostUsedPromotion?: PromotionResponse;
  mostUsedPromoCode?: PromoCodeResponse;
  promotionsByType: Record<PromotionType, number>;
  promoCodesByType: Record<DiscountType, number>;
  usageTrends: Array<{
    date: string;
    uses: number;
    discount: number;
  }>;
}

/**
 * Reporte de rendimiento de promociones
 */
export interface PromotionPerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: PromotionStats;
  topPromotions: Array<{
    promotion: PromotionResponse;
    uses: number;
    discount: number;
    revenue: number;
    conversionRate: number;
  }>;
  topPromoCodes: Array<{
    promoCode: PromoCodeResponse;
    uses: number;
    discount: number;
    revenue: number;
    uniqueUsers: number;
  }>;
  categoryPerformance: Array<{
    categoryId: number;
    categoryName: string;
    promotions: number;
    uses: number;
    discount: number;
  }>;
  eventPerformance: Array<{
    eventId: number;
    eventTitle: string;
    promotions: number;
    uses: number;
    discount: number;
  }>;
}

/**
 * Configuración de promociones
 */
export interface PromotionConfig {
  maxDiscountPercentage: number;
  maxDiscountAmount: number;
  allowStacking: boolean;
  maxStackingLevel: number;
  requireMinimumPurchase: boolean;
  defaultMinimumPurchase: number;
  autoGenerateCodes: boolean;
  codeLength: number;
  codePrefix?: string;
  expirationDays: number;
  allowMultipleUses: boolean;
  maxUsesPerUser: number;
  maxTotalUses: number;
}

/**
 * Regla de promoción
 */
export interface PromotionRule {
  id?: number;
  promotionId: number;
  type: 'cart_total' | 'item_count' | 'user_type' | 'event_category' | 'date_range' | 'first_time' | 'loyalty_tier';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  isActive: boolean;
  priority: number;
}

/**
 * Condición de elegibilidad para promoción
 */
export interface PromotionEligibilityCondition {
  type: 'user_type' | 'purchase_history' | 'event_attendance' | 'membership_level' | 'geographic_location';
  operator: 'equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  required: boolean;
}

/**
 * Resultado de validación de elegibilidad
 */
export interface PromotionEligibilityResult {
  eligible: boolean;
  promotionId: number;
  userId: number;
  conditions: Array<{
    condition: PromotionEligibilityCondition;
    met: boolean;
    reason?: string;
  }>;
  canApply: boolean;
  message: string;
}