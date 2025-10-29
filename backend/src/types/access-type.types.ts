/**
 * @fileoverview Tipos TypeScript para Tipos de Acceso
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para gestión de tipos de acceso a eventos
 */

// ====================================================================
// TIPOS BASE DE ACCESO
// ====================================================================

/**
 * Estados de tipo de acceso
 */
export type AccessTypeStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

/**
 * Tipos de restricciones de acceso
 */
export type AccessRestrictionType = 'AGE' | 'MEMBERSHIP' | 'INVITATION' | 'PAYMENT_STATUS' | 'CUSTOM';

/**
 * Tipos de beneficios
 */
export type AccessBenefitType = 'PRIORITY_ENTRY' | 'SEATING' | 'FOOD_DRINK' | 'MERCHANDISE' | 'NETWORKING' | 'SPEAKER_ACCESS' | 'CUSTOM';

// ====================================================================
// INTERFACES DE TIPO DE ACCESO
// ====================================================================

/**
 * Definición de tipo de acceso
 */
export interface AccessType {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  shortDescription?: string;
  category: string;
  color?: string;
  icon?: string;
  status: AccessTypeStatus;
  isDefault: boolean;
  priority: number;
  displayOrder: number;
  metadata?: any;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Configuración de precios por tipo de acceso
 */
export interface AccessTypePricing {
  id?: number;
  accessTypeId: number;
  eventId: number;
  basePrice: number;
  currency: string;
  discountPercentage?: number;
  finalPrice: number;
  earlyBirdDiscount?: {
    percentage: number;
    deadline: Date;
  };
  groupDiscount?: {
    minQuantity: number;
    percentage: number;
  };
  isActive: boolean;
  validFrom: Date;
  validTo?: Date;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Restricciones de acceso
 */
export interface AccessRestriction {
  id?: number;
  accessTypeId: number;
  type: AccessRestrictionType;
  name: string;
  description?: string;
  conditions: {
    minAge?: number;
    maxAge?: number;
    membershipLevel?: string;
    invitationCode?: string;
    paymentStatus?: string;
    customField?: string;
    customValue?: any;
  };
  isRequired: boolean;
  errorMessage?: string;
  priority: number;
  isActive: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Beneficios de acceso
 */
export interface AccessBenefit {
  id?: number;
  accessTypeId: number;
  type: AccessBenefitType;
  name: string;
  description?: string;
  details?: {
    priorityLevel?: number;
    seatingArea?: string;
    foodDrinkItems?: string[];
    merchandiseItems?: string[];
    networkingAccess?: string[];
    speakerAccess?: string[];
    customDetails?: any;
  };
  isActive: boolean;
  displayOrder: number;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Configuración de tipo de acceso por evento
 */
export interface EventAccessTypeConfig {
  id?: number;
  eventId: number;
  accessTypeId: number;
  capacity: number;
  availableCapacity: number;
  blockedCapacity: number;
  isEnabled: boolean;
  customPricing?: AccessTypePricing;
  customRestrictions?: AccessRestriction[];
  customBenefits?: AccessBenefit[];
  metadata?: any;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ====================================================================
// INTERFACES DE GESTIÓN DE ACCESO
// ====================================================================

/**
 * Información completa de tipo de acceso
 */
export interface AccessTypeDetails extends AccessType {
  pricing?: AccessTypePricing[];
  restrictions?: AccessRestriction[];
  benefits?: AccessBenefit[];
  eventConfigs?: EventAccessTypeConfig[];
  usageStats?: {
    totalRegistrations: number;
    activeEvents: number;
    revenue: number;
  };
}

/**
 * Validación de elegibilidad para tipo de acceso
 */
export interface AccessEligibilityCheck {
  accessTypeId: number;
  userId: number;
  eventId: number;
  isEligible: boolean;
  reasons: Array<{
    restrictionId: number;
    type: AccessRestrictionType;
    passed: boolean;
    message: string;
  }>;
  alternativeAccessTypes?: number[];
}

/**
 * Selección de tipo de acceso
 */
export interface AccessTypeSelection {
  accessTypeId: number;
  quantity: number;
  pricing: {
    basePrice: number;
    finalPrice: number;
    currency: string;
    discountsApplied: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  };
  benefits: AccessBenefit[];
  restrictions: AccessRestriction[];
}

// ====================================================================
// INTERFACES DE REPORTES Y ANALYTICS
// ====================================================================

/**
 * Estadísticas de tipo de acceso
 */
export interface AccessTypeStats {
  accessTypeId: number;
  period: {
    from: Date;
    to: Date;
  };
  registrations: {
    total: number;
    confirmed: number;
    cancelled: number;
    revenue: number;
  };
  events: {
    total: number;
    active: number;
    capacity: number;
    utilization: number;
  };
  demographics: {
    ageGroups?: { [key: string]: number };
    locations?: { [key: string]: number };
    sources?: { [key: string]: number };
  };
}

/**
 * Comparativa entre tipos de acceso
 */
export interface AccessTypeComparison {
  eventId: number;
  accessTypes: Array<{
    accessTypeId: number;
    name: string;
    capacity: number;
    registrations: number;
    utilizationPercentage: number;
    revenue: number;
    averagePrice: number;
    conversionRate: number;
  }>;
  summary: {
    totalCapacity: number;
    totalRegistrations: number;
    totalRevenue: number;
    mostPopular: number;
    highestRevenue: number;
  };
}

// ====================================================================
// INTERFACES DE REQUEST/RESPONSE API
// ====================================================================

/**
 * Datos para crear tipo de acceso
 */
export interface CreateAccessTypeData {
  name: string;
  displayName: string;
  description?: string;
  shortDescription?: string;
  category: string;
  color?: string;
  icon?: string;
  priority?: number;
  displayOrder?: number;
  isDefault?: boolean;
  metadata?: any;
}

/**
 * Datos para actualizar tipo de acceso
 */
export interface UpdateAccessTypeData extends Partial<CreateAccessTypeData> {
  status?: AccessTypeStatus;
}

/**
 * Datos para configurar tipo de acceso en evento
 */
export interface ConfigureEventAccessTypeData {
  accessTypeId: number;
  capacity: number;
  isEnabled?: boolean;
  customPricing?: {
    basePrice: number;
    currency: string;
    discountPercentage?: number;
    earlyBirdDiscount?: {
      percentage: number;
      deadline: Date;
    };
    groupDiscount?: {
      minQuantity: number;
      percentage: number;
    };
  };
  customRestrictions?: Array<{
    type: AccessRestrictionType;
    name: string;
    description?: string;
    conditions: any;
    isRequired?: boolean;
    errorMessage?: string;
  }>;
  customBenefits?: Array<{
    type: AccessBenefitType;
    name: string;
    description?: string;
    details?: any;
  }>;
  metadata?: any;
}

/**
 * Filtros para consultas de tipos de acceso
 */
export interface AccessTypeQueryFilters {
  status?: AccessTypeStatus;
  category?: string;
  isDefault?: boolean;
  eventId?: number;
  createdBy?: number;
  search?: string;
}

/**
 * Parámetros de consulta para tipos de acceso
 */
export interface AccessTypeQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'displayOrder' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: AccessTypeQueryFilters;
}

/**
 * Resultado de consulta de tipos de acceso
 */
export interface AccessTypeQueryResult {
  accessTypes: AccessTypeDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: AccessTypeQueryFilters;
}

// ====================================================================
// INTERFACES DE VALIDACIÓN
// ====================================================================

/**
 * Resultado de validación de tipo de acceso
 */
export interface AccessTypeValidationResult {
  isValid: boolean;
  accessType?: AccessTypeDetails;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

/**
 * Resultado de validación de configuración de evento
 */
export interface EventAccessTypeValidationResult {
  isValid: boolean;
  config?: EventAccessTypeConfig;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  capacityConflicts?: Array<{
    accessTypeId: number;
    requestedCapacity: number;
    availableCapacity: number;
  }>;
}

// ====================================================================
// INTERFACES DE INTEGRACIÓN
// ====================================================================

/**
 * Datos para integración con carrito de compras
 */
export interface CartAccessTypeData {
  accessTypeId: number;
  quantity: number;
  eventId: number;
  pricingSnapshot: {
    basePrice: number;
    finalPrice: number;
    currency: string;
    discounts: any[];
  };
  benefitsSnapshot: AccessBenefit[];
  restrictionsSnapshot: AccessRestriction[];
}

/**
 * Datos para integración con proceso de pago
 */
export interface PaymentAccessTypeData {
  accessTypeId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  benefits: string[];
  description: string;
}

/**
 * Callback para validación de acceso
 */
export interface AccessValidationCallback {
  userId: number;
  eventId: number;
  accessTypeId: number;
  context: 'REGISTRATION' | 'CHECK_IN' | 'ACCESS';
  result: AccessEligibilityCheck;
}
