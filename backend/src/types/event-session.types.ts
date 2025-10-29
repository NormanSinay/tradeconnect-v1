/**
 * @fileoverview Tipos TypeScript para Sesiones de Eventos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para sesiones de eventos y validaciones
 */

// ====================================================================
// TIPOS DE CREACIÓN Y ACTUALIZACIÓN
// ====================================================================

/**
 * Datos para crear una nueva sesión de evento
 */
export interface CreateEventSessionData {
  eventId: number;
  title: string;
  description?: string;
  sessionType: 'date' | 'time_slot' | 'workshop' | 'track' | 'other';
  startDate: Date;
  endDate: Date;
  capacity?: number;
  location?: string;
  virtualLocation?: string;
  isVirtual?: boolean;
  price?: number;
  currency?: string;
  requirements?: string;
  metadata?: any;
}

/**
 * Datos para actualizar una sesión de evento
 */
export interface UpdateEventSessionData extends Partial<Omit<CreateEventSessionData, 'eventId'>> {}

/**
 * Datos para reservar una sesión
 */
export interface SessionReservationData {
  sessionId: number;
  userId: number;
  accessTypeId?: number;
  quantity?: number;
}

// ====================================================================
// TIPOS DE RESPUESTA API
// ====================================================================

/**
 * Sesión de evento en formato público
 */
export interface PublicEventSession {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  sessionType: 'date' | 'time_slot' | 'workshop' | 'track' | 'other';
  startDate: Date;
  endDate: Date;
  capacity?: number;
  availableCapacity: number;
  blockedCapacity: number;
  utilizationPercentage: number;
  location?: string;
  virtualLocation?: string;
  isVirtual: boolean;
  price?: number;
  currency: string;
  requirements?: string;
  isActive: boolean;
  isAvailable: boolean;
  createdAt: Date;
}

/**
 * Sesión de evento en formato detallado
 */
export interface DetailedEventSession extends PublicEventSession {
  metadata?: any;
  createdBy: number;
  updatedAt: Date;
}

/**
 * Sesión de evento en formato administrativo
 */
export interface AdminEventSession extends DetailedEventSession {
  deletedAt?: Date;
}

// ====================================================================
// TIPOS DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de sesiones
 */
export interface EventSessionFilters {
  sessionType?: string;
  isActive?: boolean;
  isVirtual?: boolean;
  hasCapacity?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
}

/**
 * Parámetros de consulta para sesiones
 */
export interface EventSessionQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'startDate' | 'endDate' | 'title' | 'capacity' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: EventSessionFilters;
}

/**
 * Resultado de búsqueda de sesiones
 */
export interface EventSessionSearchResult {
  sessions: PublicEventSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: EventSessionFilters;
}

// ====================================================================
// TIPOS DE VALIDACIÓN Y ERRORES
// ====================================================================

/**
 * Errores de validación de sesión
 */
export interface EventSessionValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Resultado de validación de sesión
 */
export interface EventSessionValidationResult {
  isValid: boolean;
  errors: EventSessionValidationError[];
  warnings?: string[];
}

// ====================================================================
// TIPOS DE ESTADÍSTICAS
// ====================================================================

/**
 * Estadísticas de una sesión
 */
export interface EventSessionStats {
  totalCapacity?: number;
  availableCapacity: number;
  blockedCapacity: number;
  confirmedReservations: number;
  pendingReservations: number;
  utilizationPercentage: number;
  revenue: number;
}

/**
 * Estadísticas generales de sesiones por evento
 */
export interface EventSessionsOverviewStats {
  totalSessions: number;
  activeSessions: number;
  totalCapacity: number;
  totalAvailableCapacity: number;
  totalBlockedCapacity: number;
  averageUtilization: number;
  sessionsByType: { [type: string]: number };
  upcomingSessions: number;
  ongoingSessions: number;
  completedSessions: number;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Tipos de sesión disponibles
 */
export type EventSessionType = 'date' | 'time_slot' | 'workshop' | 'track' | 'other';

/**
 * Estados de disponibilidad de sesión
 */
export type SessionAvailabilityStatus = 'available' | 'limited' | 'full' | 'expired' | 'inactive';

/**
 * Información de reserva de sesión
 */
export interface SessionReservationInfo {
  id: string;
  sessionId: number;
  userId: number;
  accessTypeId?: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  reservedAt: Date;
  expiresAt?: Date;
  confirmedAt?: Date;
}
