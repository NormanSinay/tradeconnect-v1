/**
 * @fileoverview Tipos TypeScript para el módulo de Inscripciones
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Interfaces y tipos para el sistema de inscripciones
 *
 * Archivo: backend/src/types/registration.types.ts
 */

// ====================================================================
// TIPOS BÁSICOS
// ====================================================================

export type RegistrationStatus =
  | 'BORRADOR'
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'EXPIRADO'
  | 'REEMBOLSADO';

export type ParticipantType = 'individual' | 'empresa';

export type GroupRegistrationStatus =
  | 'BORRADOR'
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'EXPIRADO'
  | 'REEMBOLSADO';

// ====================================================================
// INTERFACES DE DATOS DE ENTRADA
// ====================================================================

/**
 * Datos para crear una inscripción individual
 */
export interface CreateIndividualRegistrationData {
  eventId: number;
  participantType: ParticipantType;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nit?: string;
  cui?: string;
  companyName?: string;
  position?: string;
  customFields?: Record<string, any>;
}

/**
 * Datos para crear una inscripción grupal
 */
export interface CreateGroupRegistrationData {
  eventId: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  nit?: string;
  participants: GroupParticipantData[];
  notes?: string;
}

/**
 * Datos de un participante en inscripción grupal
 */
export interface GroupParticipantData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nit?: string;
  cui?: string;
  position?: string;
}

/**
 * Datos para actualizar una inscripción
 */
export interface UpdateRegistrationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nit?: string;
  cui?: string;
  companyName?: string;
  position?: string;
  customFields?: Record<string, any>;
}

/**
 * Datos para validar afiliación
 */
export interface AffiliationValidationData {
  nit?: string;
  cui?: string;
  companyName?: string;
}

// ====================================================================
// INTERFACES DE RESPUESTAS
// ====================================================================

/**
 * Respuesta de creación de inscripción
 */
export interface RegistrationResponse {
  registrationId?: number;
  groupRegistrationId?: number;
  groupCode?: string;
  registrationCode?: string;
  status: RegistrationStatus;
  totalAmount: number;
  reservationExpiresAt?: Date;
  capacityLockId?: string;
  message: string;
  registration?: any;
  isExisting?: boolean;
}

/**
 * Respuesta de validación de NIT/CUI
 */
export interface TaxValidationResult {
  isValid: boolean;
  message: string;
  details: {
    nitValid?: boolean;
    cuiValid?: boolean;
    [key: string]: any;
  };
}

/**
 * Respuesta de cálculo de precios
 */
export interface PriceCalculationResult {
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  appliedDiscounts: AppliedDiscount[];
}

/**
 * Descuento aplicado
 */
export interface AppliedDiscount {
  type: 'group' | 'promo' | 'early_bird' | 'loyalty';
  description: string;
  amount: number;
  percentage?: number;
}

/**
 * Respuesta de política de reembolso
 */
export interface RefundPolicyResult {
  refundPercentage: number;
  refundAmount: number;
  policy: string;
  conditions: string[];
}

// ====================================================================
// INTERFACES DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de inscripciones
 */
export interface RegistrationFilters {
  eventId?: number;
  userId?: number;
  status?: RegistrationStatus[];
  participantType?: ParticipantType[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    filters?: RegistrationFilters;
    [key: string]: any;
  };
}

/**
 * Estadísticas de inscripciones
 */
export interface RegistrationStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  pendingPayments: number;
  cancelledRegistrations: number;
  totalRevenue: number;
  averageRevenuePerRegistration: number;
  registrationTrends: RegistrationTrend[];
  statusDistribution: StatusDistribution[];
}

/**
 * Tendencia de inscripciones
 */
export interface RegistrationTrend {
  date: string;
  registrations: number;
  revenue: number;
}

/**
 * Distribución por estado
 */
export interface StatusDistribution {
  status: RegistrationStatus;
  count: number;
  percentage: number;
}

// ====================================================================
// INTERFACES DE REPORTES
// ====================================================================

/**
 * Reporte de inscripciones por evento
 */
export interface EventRegistrationReport {
  eventId: number;
  eventTitle: string;
  totalCapacity: number;
  registeredCount: number;
  availableSpots: number;
  occupancyRate: number;
  revenue: number;
  statusBreakdown: StatusDistribution[];
  registrationTimeline: RegistrationTimelineEntry[];
}

/**
 * Entrada en línea de tiempo de inscripciones
 */
export interface RegistrationTimelineEntry {
  date: string;
  registrations: number;
  cumulativeTotal: number;
}

/**
 * Reporte de cancelaciones
 */
export interface CancellationReport {
  totalCancellations: number;
  cancellationRate: number;
  reasonsBreakdown: CancellationReason[];
  refundAmount: number;
  averageProcessingTime: number;
}

/**
 * Razón de cancelación
 */
export interface CancellationReason {
  reason: string;
  count: number;
  percentage: number;
}

// ====================================================================
// INTERFACES DE CONFIGURACIÓN
// ====================================================================

/**
 * Configuración de políticas de cancelación
 */
export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  rules: CancellationRule[];
  isActive: boolean;
}

/**
 * Regla de cancelación
 */
export interface CancellationRule {
  daysBeforeEvent: number;
  refundPercentage: number;
  conditions?: string[];
}

/**
 * Configuración de descuentos grupales
 */
export interface GroupDiscountConfig {
  minParticipants: number;
  maxParticipants?: number;
  discountPercentage: number;
  description: string;
}

// ====================================================================
// INTERFACES DE VALIDACIÓN
// ====================================================================

/**
 * Resultado de validación de capacidad
 */
export interface CapacityValidationResult {
  canAccommodate: boolean;
  availableCapacity: number;
  requestedCapacity: number;
  message: string;
  suggestions?: string[];
}

/**
 * Resultado de validación de conflictos
 */
export interface ConflictValidationResult {
  hasConflicts: boolean;
  conflictingEvents: ConflictingEvent[];
  message: string;
  canProceed: boolean;
}

/**
 * Evento conflictivo
 */
export interface ConflictingEvent {
  eventId: number;
  eventTitle: string;
  startDate: Date;
  endDate: Date;
  conflictType: 'overlap' | 'adjacent';
}

// ====================================================================
// INTERFACES DE AUDITORÍA
// ====================================================================

/**
 * Registro de auditoría de inscripción
 */
export interface RegistrationAuditLog {
  id: number;
  registrationId: number;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ====================================================================
// INTERFACES PARA EXPORTACIÓN
// ====================================================================

/**
 * Datos para exportación de inscripciones
 */
export interface RegistrationExportData {
  registrationCode: string;
  eventTitle: string;
  participantType: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  nit?: string;
  cui?: string;
  companyName?: string;
  position?: string;
  status: RegistrationStatus;
  registrationDate: Date;
  paymentDate?: Date;
  totalAmount: number;
  discountAmount: number;
  finalPrice: number;
  customFields?: Record<string, any>;
}

/**
 * Opciones de exportación
 */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  fields?: string[];
  filters?: RegistrationFilters;
  includeCustomFields?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
