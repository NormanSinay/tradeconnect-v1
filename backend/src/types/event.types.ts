/**
 * @fileoverview Tipos TypeScript para el módulo de Eventos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para eventos, validaciones y respuestas API
 */

// ====================================================================
// TIPOS BASE DE EVENTOS
// ====================================================================

/**
 * Información básica de tipo de evento
 */
export interface EventTypeInfo {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
}

/**
 * Información básica de categoría de evento
 */
export interface EventCategoryInfo {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
}

/**
 * Información básica de estado de evento
 */
export interface EventStatusInfo {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

/**
 * Información de agenda de evento
 */
export interface EventAgendaItem {
  id?: string;
  title: string;
  description?: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  speaker?: string;
  location?: string;
}

/**
 * Información de etiquetas de evento
 */
export interface EventTag {
  id?: string;
  name: string;
  color?: string;
}

// ====================================================================
// TIPOS DE CREACIÓN Y ACTUALIZACIÓN
// ====================================================================

/**
 * Datos para crear un nuevo evento
 */
export interface CreateEventData {
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  virtualLocation?: string;
  isVirtual?: boolean;
  price?: number;
  currency?: string;
  capacity?: number;
  minAge?: number;
  maxAge?: number;
  tags?: string[];
  requirements?: string;
  agenda?: EventAgendaItem[];
  metadata?: any;
  eventTypeId: number;
  eventCategoryId: number;
  eventStatusId?: number; // Default: draft
}

/**
 * Datos para actualizar un evento
 */
export interface UpdateEventData extends Partial<Omit<CreateEventData, 'eventTypeId' | 'eventCategoryId'>> {
  eventTypeId?: number;
  eventCategoryId?: number;
  eventStatusId?: number;
}

/**
 * Datos para publicar un evento
 */
export interface PublishEventData {
  notifySubscribers?: boolean;
  notificationMessage?: string;
}

// ====================================================================
// TIPOS DE RESPUESTA API
// ====================================================================

/**
 * Evento en formato público (para listados y vistas públicas)
 */
export interface PublicEvent {
  id: number;
  title: string;
  shortDescription?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  virtualLocation?: string;
  isVirtual: boolean;
  price: number;
  currency: string;
  capacity?: number;
  registeredCount: number;
  availableSpots?: number;
  tags?: string[];
  eventType: EventTypeInfo;
  eventCategory: EventCategoryInfo;
  eventStatus: EventStatusInfo;
  publishedAt?: Date;
  createdAt: Date;
}

/**
 * Evento en formato detallado (para vista completa)
 */
export interface DetailedEvent extends PublicEvent {
  description?: string;
  minAge?: number;
  maxAge?: number;
  requirements?: string;
  agenda?: EventAgendaItem[];
  metadata?: any;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
  };
  cancelledAt?: Date;
  cancellationReason?: string;
  updatedAt: Date;
}

/**
 * Evento en formato de administración
 */
export interface AdminEvent extends DetailedEvent {
  createdBy: number;
  eventTypeId: number;
  eventCategoryId: number;
  eventStatusId: number;
  deletedAt?: Date;
}

// ====================================================================
// TIPOS DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de eventos
 */
export interface EventFilters {
  eventTypeId?: number;
  eventCategoryId?: number;
  eventStatusId?: number;
  isVirtual?: boolean;
  priceMin?: number;
  priceMax?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  tags?: string[];
  location?: string;
  creatorId?: number;
  publishedOnly?: boolean;
}

/**
 * Parámetros de consulta para eventos
 */
export interface EventQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'startDate' | 'endDate' | 'title' | 'price' | 'createdAt' | 'publishedAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: EventFilters;
}

/**
 * Resultado de búsqueda de eventos
 */
export interface EventSearchResult {
  events: PublicEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: EventFilters;
}

// ====================================================================
// TIPOS DE VALIDACIÓN Y ERRORES
// ====================================================================

/**
 * Errores de validación de evento
 */
export interface EventValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Resultado de validación de evento
 */
export interface EventValidationResult {
  isValid: boolean;
  errors: EventValidationError[];
  warnings?: string[];
}

// ====================================================================
// TIPOS DE ESTADÍSTICAS
// ====================================================================

/**
 * Estadísticas de un evento
 */
export interface EventStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  cancelledRegistrations: number;
  attendedCount: number;
  noShowCount: number;
  revenue: number;
  capacityUtilization: number; // percentage
  averageRating?: number;
  feedbackCount?: number;
}

/**
 * Estadísticas generales de eventos
 */
export interface EventsOverviewStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  averagePrice: number;
  mostPopularCategory?: EventCategoryInfo;
  mostPopularType?: EventTypeInfo;
}

// ====================================================================
// TIPOS DE INSCRIPCIONES
// ====================================================================

/**
 * Información de inscripción a evento
 */
export interface EventRegistrationInfo {
  id: number;
  eventId: number;
  userId: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  registrationData?: any;
  registrationNumber?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentAmount?: number;
  paymentReference?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  registeredAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

/**
 * Datos para crear inscripción
 */
export interface CreateRegistrationData {
  eventId: number;
  userId: number;
  registrationData?: any;
  paymentAmount?: number;
  paymentReference?: string;
}

// ====================================================================
// TIPOS DE MULTIMEDIA
// ====================================================================

/**
 * Información de archivo multimedia
 */
export interface EventMediaInfo {
  id: number;
  eventId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  formattedSize: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  altText?: string;
  description?: string;
  isFeatured: boolean;
  sortOrder: number;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
  uploadedBy: number;
  uploadedAt: Date;
}

/**
 * Datos para subir archivo multimedia
 */
export interface UploadMediaData {
  eventId: number;
  file: Express.Multer.File;
  type?: 'image' | 'video' | 'document' | 'audio' | 'other';
  altText?: string;
  description?: string;
  isFeatured?: boolean;
  sortOrder?: number;
}

// ====================================================================
// TIPOS DE DUPLICACIÓN
// ====================================================================

/**
 * Información de duplicación de evento
 */
export interface EventDuplicationInfo {
  id: number;
  sourceEventId: number;
  duplicatedEventId: number;
  duplicatedBy: number;
  duplicatedAt: Date;
  modifications?: any;
}

/**
 * Datos para duplicar evento
 */
export interface DuplicateEventData {
  sourceEventId: number;
  modifications?: Partial<CreateEventData>;
  keepRegistrations?: boolean;
  keepMedia?: boolean;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Tipos de evento disponibles
 */
export type EventTypeName = 'conference' | 'workshop' | 'seminar' | 'webinar' | 'networking' | 'social' | 'other';

/**
 * Estados de evento disponibles
 */
export type EventStatusName = 'draft' | 'published' | 'cancelled' | 'completed';

/**
 * Categorías de evento disponibles
 */
export type EventCategoryName = 'business' | 'technology' | 'education' | 'health' | 'entertainment' | 'sports' | 'other';

/**
 * Monedas soportadas
 */
export type SupportedCurrency = 'GTQ' | 'USD';

/**
 * Tipos de medio soportados
 */
export type MediaType = 'image' | 'video' | 'document' | 'audio' | 'other';

/**
 * Estados de inscripción
 */
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';

/**
 * Estados de pago
 */
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';