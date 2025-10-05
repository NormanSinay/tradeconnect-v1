/**
 * @fileoverview Tipos TypeScript para descuentos por volumen y early bird
 * @version 1.0.0
 * @author TradeConnect Team
 *
 * Archivo: backend/src/types/discount.types.ts
 */

import { AppliedDiscount } from './registration.types';

/**
 * Interface base para descuentos por volumen
 */
export interface BaseVolumeDiscount {
  id?: number;
  eventId: number;
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
  description?: string;
  isActive: boolean;
  priority: number;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de descuentos por volumen
 */
export interface CreateVolumeDiscountRequest extends Omit<BaseVolumeDiscount, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * Interface para actualización de descuentos por volumen
 */
export interface UpdateVolumeDiscountRequest extends Partial<CreateVolumeDiscountRequest> {}

/**
 * Interface para respuesta de descuentos por volumen
 */
export interface VolumeDiscountResponse extends BaseVolumeDiscount {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface base para descuentos early bird
 */
export interface BaseEarlyBirdDiscount {
  id?: number;
  eventId: number;
  daysBeforeEvent: number;
  discountPercentage: number;
  description?: string;
  isActive: boolean;
  priority: number;
  autoApply: boolean;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de descuentos early bird
 */
export interface CreateEarlyBirdDiscountRequest extends Omit<BaseEarlyBirdDiscount, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * Interface para actualización de descuentos early bird
 */
export interface UpdateEarlyBirdDiscountRequest extends Partial<CreateEarlyBirdDiscountRequest> {}

/**
 * Interface para respuesta de descuentos early bird
 */
export interface EarlyBirdDiscountResponse extends BaseEarlyBirdDiscount {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para cálculo de descuentos aplicables
 */
export interface ApplicableDiscountsRequest {
  eventId: number;
  userId?: number;
  quantity: number;
  registrationDate: Date;
  basePrice: number;
  currentDiscounts?: AppliedDiscount[];
}

/**
 * Interface para respuesta de descuentos aplicables
 */
export interface ApplicableDiscountsResponse {
  volumeDiscount?: VolumeDiscountResponse;
  earlyBirdDiscount?: EarlyBirdDiscountResponse;
  totalDiscount: number;
  finalPrice: number;
  appliedDiscounts: AppliedDiscount[];
  nextVolumeTier?: {
    minQuantity: number;
    discountPercentage: number;
    additionalSavings: number;
  };
}

/**
 * Interface para obtener descuentos por volumen de un evento
 */
export interface GetVolumeDiscountsRequest {
  eventId: number;
  isActive?: boolean;
}

/**
 * Interface para respuesta de descuentos por volumen de un evento
 */
export interface GetVolumeDiscountsResponse {
  discounts: VolumeDiscountResponse[];
  nextTier?: {
    minQuantity: number;
    discountPercentage: number;
  };
}

/**
 * Interface para obtener descuentos early bird de un evento
 */
export interface GetEarlyBirdDiscountsRequest {
  eventId: number;
  registrationDate?: Date;
  isActive?: boolean;
}

/**
 * Interface para respuesta de descuentos early bird de un evento
 */
export interface GetEarlyBirdDiscountsResponse {
  discounts: EarlyBirdDiscountResponse[];
  applicableDiscount?: EarlyBirdDiscountResponse;
  daysUntilEvent?: number;
}

/**
 * Interface para filtros de búsqueda de descuentos por volumen
 */
export interface VolumeDiscountFilters {
  eventId?: number;
  isActive?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

/**
 * Interface para filtros de búsqueda de descuentos early bird
 */
export interface EarlyBirdDiscountFilters {
  eventId?: number;
  isActive?: boolean;
  daysBeforeEvent?: number;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

/**
 * Interface para estadísticas de descuentos
 */
export interface DiscountStats {
  totalVolumeDiscounts: number;
  totalEarlyBirdDiscounts: number;
  activeVolumeDiscounts: number;
  activeEarlyBirdDiscounts: number;
  totalEventsWithDiscounts: number;
  averageVolumeDiscount: number;
  averageEarlyBirdDiscount: number;
}

/**
 * Interface para configuración de descuentos de evento
 */
export interface EventDiscountsConfig {
  eventId: number;
  volumeDiscounts: VolumeDiscountResponse[];
  earlyBirdDiscounts: EarlyBirdDiscountResponse[];
  minPrice?: number;
  hasActiveDiscounts: boolean;
}

/**
 * Interface para cálculo de precio con descuentos
 */
export interface PriceCalculationWithDiscounts {
  basePrice: number;
  quantity: number;
  volumeDiscount?: {
    discount: VolumeDiscountResponse;
    amount: number;
  };
  earlyBirdDiscount?: {
    discount: EarlyBirdDiscountResponse;
    amount: number;
  };
  promoDiscount?: {
    amount: number;
    description: string;
  };
  subtotal: number;
  totalDiscount: number;
  finalPrice: number;
  appliedDiscounts: AppliedDiscount[];
  currency: string;
}