/**
 * @fileoverview Tipos para el módulo de Carrito de TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos TypeScript para el sistema de carrito
 *
 * Archivo: backend/src/types/cart.types.ts
 */

/**
 * Tipos de participante para items del carrito
 */
export type CartParticipantType = 'individual' | 'empresa';

/**
 * Datos para agregar un item al carrito
 */
export interface CartItemData {
  eventId: number;
  participantType: CartParticipantType;
  quantity: number;
  customFields?: object;
  participantData?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nit?: string;
    cui?: string;
    position?: string;
  }>;
}

/**
 * Datos para actualizar un item del carrito
 */
export interface CartUpdateData {
  itemId: number;
  quantity?: number;
  customFields?: object;
  participantData?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nit?: string;
    cui?: string;
    position?: string;
  }>;
}

/**
 * Datos para aplicar código promocional
 */
export interface PromoCodeData {
  code: string;
}

/**
 * Respuesta de carrito
 */
export interface CartResponse {
  id: number;
  sessionId: string;
  userId?: number;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCode?: string;
  promoDiscount: number;
  expiresAt: Date;
  lastActivity: Date;
  isAbandoned: boolean;
  items: CartItemResponse[];
  createdAt: Date;
}

/**
 * Respuesta de item del carrito
 */
export interface CartItemResponse {
  id: number;
  cartId: number;
  eventId: number;
  participantType: CartParticipantType;
  quantity: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  total: number;
  isGroupRegistration: boolean;
  customFields?: object;
  addedAt: Date;
}

/**
 * Resultado de cálculo del carrito
 */
export interface CartCalculationResponse {
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  appliedDiscounts: Array<{
    type: string;
    description: string;
    amount: number;
    percentage: number;
  }>;
}

/**
 * Filtros para recuperación de carritos abandonados
 */
export interface AbandonedCartFilters {
  daysSinceAbandoned?: number;
  minValue?: number;
  maxValue?: number;
  hasEmail?: boolean;
  userId?: number;
}

/**
 * Estadísticas de carritos abandonados
 */
export interface AbandonedCartStats {
  total: number;
  recovered: number;
  recoveryRate: number;
  averageValue: number;
  totalValue: number;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Configuración de recuperación
 */
export interface RecoveryConfig {
  emailTemplate?: string;
  smsTemplate?: string;
  maxAttempts: number;
  cooldownHours: number;
  priorityThreshold: number;
}

/**
 * Resultado de intento de recuperación
 */
export interface RecoveryAttemptResult {
  success: boolean;
  method: 'email' | 'sms' | 'push' | 'manual';
  messageId?: string;
  error?: string;
  nextAttemptAt?: Date;
}

/**
 * Datos de sesión del carrito
 */
export interface CartSessionData {
  sessionId: string;
  userId?: number;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

/**
 * Configuración del carrito
 */
export interface CartConfig {
  defaultExpirationHours: number;
  maxItemsPerCart: number;
  maxQuantityPerItem: number;
  allowMultipleEvents: boolean;
  enablePromoCodes: boolean;
  enableAbandonmentRecovery: boolean;
  abandonmentThresholdHours: number;
  cleanupIntervalHours: number;
}

/**
 * Validación de item del carrito
 */
export interface CartItemValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  availability: {
    available: number;
    requested: number;
    canAccommodate: boolean;
  };
}

/**
 * Resumen del carrito para checkout
 */
export interface CartCheckoutSummary {
  cartId: number;
  sessionId: string;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  items: Array<{
    eventId: number;
    eventTitle: string;
    quantity: number;
    unitPrice: number;
    total: number;
    participantType: CartParticipantType;
  }>;
  appliedDiscounts: Array<{
    type: string;
    description: string;
    amount: number;
  }>;
  validUntil: Date;
}
