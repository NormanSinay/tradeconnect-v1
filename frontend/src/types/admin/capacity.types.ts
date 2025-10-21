/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Gestión de Aforos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para capacidad de eventos, reglas y overbooking en el panel administrativo
 */

// ====================================================================
// TIPOS BASE DE CAPACIDAD
// ====================================================================

/**
 * Estados de bloqueo temporal
 */
export type LockStatus = 'LOCKED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

/**
 * Estados de lista de espera
 */
export type WaitlistStatus = 'ACTIVE' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

/**
 * Niveles de riesgo de overbooking
 */
export type OverbookingRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Tipos de reglas de capacidad
 */
export type CapacityRuleType = 'GLOBAL' | 'DATE_SPECIFIC' | 'SESSION_SPECIFIC' | 'ACCESS_TYPE_SPECIFIC';

// ====================================================================
// INTERFACES DE CAPACIDAD
// ====================================================================

/**
 * Configuración de capacidad de evento
 */
export interface CapacityConfig {
  id?: number;
  eventId: number;
  totalCapacity: number;
  availableCapacity: number;
  blockedCapacity: number;
  overbookingPercentage: number;
  overbookingEnabled: boolean;
  waitlistEnabled: boolean;
  lockTimeoutMinutes: number;
  alertThresholds: {
    low: number;    // porcentaje (ej: 80)
    medium: number; // porcentaje (ej: 90)
    high: number;   // porcentaje (ej: 95)
  };
  isActive: boolean;
  metadata?: any;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Información de capacidad por tipo de acceso
 */
export interface AccessTypeCapacity {
  accessTypeId: number;
  capacity: number;
  availableCapacity: number;
  blockedCapacity: number;
  price: number;
  currency: string;
  priority: number;
}

/**
 * Estado actual de capacidad de evento
 */
export interface CapacityStatus {
  eventId: number;
  totalCapacity: number;
  availableCapacity: number;
  blockedCapacity: number;
  confirmedCapacity: number;
  waitlistCount: number;
  utilizationPercentage: number;
  overbookingEnabled: boolean;
  overbookingPercentage: number;
  overbookingActive: boolean;
  overbookingCurrentPercentage: number;
  waitlistEnabled: boolean;
  lockTimeoutMinutes: number;
  alertThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  accessTypesCapacity: AccessTypeCapacity[];
  isFull: boolean;
  canAcceptOverbooking: boolean;
  lastUpdated: Date;
}

// ====================================================================
// INTERFACES DE BLOQUEO TEMPORAL
// ====================================================================

/**
 * Información de bloqueo temporal
 */
export interface CapacityLock {
  id?: string;
  eventId: number;
  accessTypeId?: number;
  userId: number;
  sessionId: string;
  quantity: number;
  status: LockStatus;
  expiresAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  metadata?: any;
  createdAt?: Date;
}

/**
 * Datos para crear un bloqueo
 */
export interface CreateCapacityLockData {
  eventId: number;
  accessTypeId?: number;
  userId: number;
  sessionId: string;
  quantity: number;
  customTimeoutMinutes?: number;
}

// ====================================================================
// INTERFACES DE LISTA DE ESPERA
// ====================================================================

/**
 * Entrada en lista de espera
 */
export interface WaitlistEntry {
  id?: number;
  eventId: number;
  accessTypeId?: number;
  userId: number;
  position: number;
  status: WaitlistStatus;
  notifiedAt?: Date;
  expiresAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  metadata?: any;
  createdAt?: Date;
}

/**
 * Datos para agregar a lista de espera
 */
export interface AddToWaitlistData {
  eventId: number;
  accessTypeId?: number;
  userId: number;
  priority?: number;
}

// ====================================================================
// INTERFACES DE OVERBOOKING
// ====================================================================

/**
 * Configuración de overbooking
 */
export interface OverbookingConfig {
  id?: number;
  eventId: number;
  maxPercentage: number;
  currentPercentage: number;
  riskLevel: OverbookingRiskLevel;
  autoActions: {
    alertAdmins: boolean;
    notifyUsers: boolean;
    offerAlternatives: boolean;
  };
  isActive: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  metadata?: any;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Historial de overbooking
 */
export interface OverbookingHistory {
  id?: number;
  eventId: number;
  activatedAt: Date;
  deactivatedAt?: Date;
  maxPercentage: number;
  actualPercentage: number;
  registrationsAffected: number;
  revenueImpact: number;
  reason: string;
  createdBy: number;
}

// ====================================================================
// INTERFACES DE REGLAS DE CAPACIDAD
// ====================================================================

/**
 * Regla de capacidad
 */
export interface CapacityRule {
  id?: number;
  eventId: number;
  type: CapacityRuleType;
  name: string;
  description?: string;
  conditions: {
    dateFrom?: Date;
    dateTo?: Date;
    sessionId?: number;
    accessTypeId?: number;
    minPurchase?: number;
    userType?: string;
  };
  actions: {
    capacityLimit?: number;
    overbookingAllowed?: boolean;
    priority?: number;
    priceAdjustment?: number;
  };
  isActive: boolean;
  priority: number;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ====================================================================
// INTERFACES DE REPORTES Y ESTADÍSTICAS
// ====================================================================

/**
 * Estadísticas de capacidad
 */
export interface CapacityStats {
  eventId: number;
  period: {
    from: Date;
    to: Date;
  };
  capacity: {
    total: number;
    available: number;
    blocked: number;
    confirmed: number;
    utilized: number;
  };
  waitlist: {
    total: number;
    active: number;
    notified: number;
    confirmed: number;
  };
  overbooking: {
    activated: boolean;
    currentPercentage: number;
    maxPercentage: number;
    riskLevel: OverbookingRiskLevel;
  };
  trends: {
    utilizationGrowth: number;
    waitlistGrowth: number;
    conversionRate: number;
  };
}

/**
 * Reporte de ocupación en tiempo real
 */
export interface RealTimeOccupancyReport {
  eventId: number;
  timestamp: Date;
  totalCapacity: number;
  currentOccupancy: number;
  availableSpots: number;
  blockedSpots: number;
  waitlistCount: number;
  utilizationPercentage: number;
  accessTypesBreakdown: Array<{
    accessTypeId: number;
    name: string;
    capacity: number;
    occupied: number;
    available: number;
    blocked: number;
  }>;
  alerts: Array<{
    type: 'LOW_CAPACITY' | 'HIGH_UTILIZATION' | 'OVERBOOKING_ACTIVE' | 'WAITLIST_GROWING';
    message: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
  }>;
}

// ====================================================================
// INTERFACES DE REQUEST/RESPONSE API
// ====================================================================

/**
 * Datos para configurar capacidad de evento
 */
export interface ConfigureCapacityData {
  totalCapacity: number;
  accessTypeCapacities?: AccessTypeCapacity[];
  overbookingPercentage?: number;
  overbookingEnabled?: boolean;
  waitlistEnabled?: boolean;
  lockTimeoutMinutes?: number;
  alertThresholds?: {
    low?: number;
    medium?: number;
    high?: number;
  };
  metadata?: any;
}

/**
 * Datos para actualizar capacidad
 */
export interface UpdateCapacityData extends Partial<ConfigureCapacityData> {
  isActive?: boolean;
}

// ====================================================================
// INTERFACES DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para consultas de capacidad
 */
export interface CapacityQueryFilters {
  eventId?: number;
  accessTypeId?: number;
  status?: LockStatus | WaitlistStatus;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: number;
}

/**
 * Parámetros de consulta para capacidad
 */
export interface CapacityQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'expiresAt' | 'position' | 'priority';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: CapacityQueryFilters;
}

/**
 * Resultado de consulta de capacidad
 */
export interface CapacityQueryResult {
  items: CapacityLock[] | WaitlistEntry[] | CapacityRule[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: CapacityQueryFilters;
}

// ====================================================================
// INTERFACES DE VALIDACIÓN
// ====================================================================

/**
 * Resultado de validación de capacidad
 */
export interface CapacityValidationResult {
  isValid: boolean;
  available: boolean;
  availableSpots: number;
  blockedSpots: number;
  waitlistPosition?: number;
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  warnings: Array<{
    code: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

/**
 * Resultado de validación de bloqueo
 */
export interface LockValidationResult {
  canLock: boolean;
  lockId?: string;
  expiresAt?: Date;
  errors: Array<{
    code: string;
    message: string;
  }>;
}

// ====================================================================
// INTERFACES DE INTEGRACIÓN
// ====================================================================

/**
 * Datos para integración con módulo de pagos
 */
export interface PaymentIntegrationData {
  lockId: string;
  eventId: number;
  userId: number;
  amount: number;
  currency: string;
  paymentReference: string;
}

/**
 * Datos para integración con módulo de inscripciones
 */
export interface RegistrationIntegrationData {
  eventId: number;
  userId: number;
  accessTypeId?: number;
  quantity: number;
  lockId?: string;
  paymentConfirmed: boolean;
}

/**
 * Callback para liberar bloqueo
 */
export interface LockReleaseCallback {
  lockId: string;
  reason: 'PAYMENT_CONFIRMED' | 'PAYMENT_FAILED' | 'TIMEOUT' | 'USER_CANCELLED' | 'ADMIN_RELEASE';
  metadata?: any;
}

// ====================================================================
// INTERFACES ADICIONALES PARA SERVICIOS
// ====================================================================

/**
 * Reserva de capacidad
 */
export interface CapacityReservation {
  lockId: string;
  eventId: number;
  accessTypeId?: number;
  quantity: number;
  expiresAt: Date;
  requiresOverbooking: boolean;
}

/**
 * Reporte de capacidad
 */
export interface CapacityReport {
  eventId: number;
  generatedAt: Date;
  summary: {
    totalCapacity: number;
    confirmedRegistrations: number;
    blockedCapacity: number;
    waitlistCount: number;
    utilizationPercentage: number;
    overbookingUtilization: number;
  };
  trends: {
    dailyGrowth: number;
    weeklyGrowth: number;
    predictedFullDate: Date | null;
  };
  accessTypesBreakdown: Array<{
    accessTypeId: number;
    name: string;
    capacity: number;
    occupied: number;
    available: number;
  }>;
  timeSeries: Array<{
    timestamp: Date;
    utilization: number;
    blocked: number;
    waitlist: number;
  }>;
  recommendations: string[];
}

/**
 * Actualización en tiempo real de capacidad
 */
export interface CapacityRealTimeUpdate {
  eventId: number;
  type: 'CAPACITY_CHANGED' | 'BLOCK_ADDED' | 'BLOCK_RELEASED' | 'REGISTRATION_CONFIRMED' | 'WAITLIST_UPDATED';
  data: {
    totalCapacity: number;
    availableCapacity: number;
    blockedCapacity: number;
    confirmedCapacity: number;
    waitlistCount: number;
    utilizationPercentage: number;
  };
  timestamp: Date;
  triggeredBy: {
    userId?: number;
    sessionId?: string;
    action: string;
  };
}