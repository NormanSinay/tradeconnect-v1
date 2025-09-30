/**
 * @fileoverview Tipos TypeScript para Plantillas de Eventos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para plantillas de eventos
 */

// ====================================================================
// TIPOS BASE DE PLANTILLAS
// ====================================================================

/**
 * Información básica de plantilla de evento
 */
export interface EventTemplateInfo {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  usageCount: number;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Plantilla completa con datos
 */
export interface FullEventTemplate extends EventTemplateInfo {
  templateData: EventTemplateData;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
  };
}

// ====================================================================
// ESTRUCTURA DE DATOS DE PLANTILLA
// ====================================================================

/**
 * Datos de plantilla de evento
 */
export interface EventTemplateData {
  // Información básica del evento
  basicInfo: {
    title?: string;
    description?: string;
    shortDescription?: string;
    eventTypeId?: number;
    eventCategoryId?: number;
  };

  // Configuración de fechas y ubicación
  scheduling: {
    duration?: number; // en horas
    isVirtual?: boolean;
    defaultLocation?: string;
    defaultVirtualLocation?: string;
  };

  // Configuración económica
  pricing: {
    price?: number;
    currency?: 'GTQ' | 'USD';
    hasPayment?: boolean;
  };

  // Configuración de capacidad
  capacity: {
    capacity?: number;
    hasCapacityLimit?: boolean;
  };

  // Restricciones de edad
  ageRestrictions: {
    minAge?: number;
    maxAge?: number;
    hasAgeRestrictions?: boolean;
  };

  // Etiquetas y categorización
  tags: string[];

  // Requisitos y condiciones
  requirements?: string;

  // Agenda por defecto
  defaultAgenda?: EventAgendaItem[];

  // Metadatos adicionales
  metadata?: any;

  // Configuración de multimedia
  mediaConfig?: {
    allowImages?: boolean;
    allowVideos?: boolean;
    allowDocuments?: boolean;
    maxFiles?: number;
    maxFileSize?: number; // en MB
  };

  // Configuración de inscripciones
  registrationConfig?: {
    allowSelfRegistration?: boolean;
    requireApproval?: boolean;
    collectAdditionalData?: boolean;
    additionalFields?: CustomField[];
  };
}

/**
 * Item de agenda en plantilla
 */
export interface EventAgendaItem {
  id?: string;
  title: string;
  description?: string;
  duration?: number; // en minutos
  speaker?: string;
  type?: 'presentation' | 'workshop' | 'break' | 'networking' | 'other';
  isRequired?: boolean;
}

/**
 * Campo personalizado para formularios
 */
export interface CustomField {
  id?: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number';
  required: boolean;
  options?: string[]; // para select y radio
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// ====================================================================
// TIPOS DE CREACIÓN Y ACTUALIZACIÓN
// ====================================================================

/**
 * Datos para crear una nueva plantilla
 */
export interface CreateEventTemplateData {
  name: string;
  description?: string;
  templateData: EventTemplateData;
  thumbnailUrl?: string;
  isPublic?: boolean;
}

/**
 * Datos para actualizar una plantilla
 */
export interface UpdateEventTemplateData {
  name?: string;
  description?: string;
  templateData?: Partial<EventTemplateData>;
  thumbnailUrl?: string;
  isPublic?: boolean;
}

/**
 * Datos para usar una plantilla
 */
export interface UseEventTemplateData {
  templateId: number;
  eventData: Partial<import('./event.types').CreateEventData>;
  modifications?: Partial<import('./event.types').CreateEventData>;
}

// ====================================================================
// TIPOS DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de plantillas
 */
export interface EventTemplateFilters {
  isPublic?: boolean;
  createdBy?: number;
  eventTypeId?: number;
  eventCategoryId?: number;
  tags?: string[];
  usageCountMin?: number;
  usageCountMax?: number;
}

/**
 * Parámetros de consulta para plantillas
 */
export interface EventTemplateQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'usageCount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: EventTemplateFilters;
}

/**
 * Resultado de búsqueda de plantillas
 */
export interface EventTemplateSearchResult {
  templates: FullEventTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: EventTemplateFilters;
}

// ====================================================================
// TIPOS DE VALIDACIÓN
// ====================================================================

/**
 * Errores de validación de plantilla
 */
export interface EventTemplateValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Resultado de validación de plantilla
 */
export interface EventTemplateValidationResult {
  isValid: boolean;
  errors: EventTemplateValidationError[];
  warnings?: string[];
}

// ====================================================================
// TIPOS DE ESTADÍSTICAS
// ====================================================================

/**
 * Estadísticas de uso de plantilla
 */
export interface EventTemplateStats {
  totalUsage: number;
  eventsCreated: number;
  activeEvents: number;
  totalRevenue: number;
  averageRating?: number;
  lastUsed?: Date;
  mostUsedInCategory?: string;
  mostUsedInType?: string;
}

/**
 * Estadísticas generales de plantillas
 */
export interface EventTemplatesOverviewStats {
  totalTemplates: number;
  publicTemplates: number;
  privateTemplates: number;
  totalUsage: number;
  mostUsedTemplate?: EventTemplateInfo;
  recentlyCreated: number; // últimas 30 días
  recentlyUsed: number; // últimas 30 días
}

// ====================================================================
// TIPOS DE IMPORTACIÓN/EXPORTACIÓN
// ====================================================================

/**
 * Datos para importar plantilla
 */
export interface ImportEventTemplateData {
  name: string;
  description?: string;
  templateData: EventTemplateData;
  thumbnailUrl?: string;
  isPublic?: boolean;
  source?: 'file' | 'url' | 'json';
  sourceData?: any;
}

/**
 * Resultado de exportación de plantilla
 */
export interface ExportEventTemplateResult {
  template: FullEventTemplate;
  exportedAt: Date;
  format: 'json' | 'yaml';
  version: string;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Categorías predefinidas de plantillas
 */
export type EventTemplateCategory = 'conference' | 'workshop' | 'seminar' | 'webinar' | 'networking' | 'corporate' | 'educational' | 'social' | 'other';

/**
 * Niveles de complejidad de plantillas
 */
export type EventTemplateComplexity = 'basic' | 'intermediate' | 'advanced' | 'expert';

/**
 * Estados de plantilla
 */
export type EventTemplateStatus = 'active' | 'archived' | 'deprecated';

/**
 * Tipos de campo personalizados soportados
 */
export type CustomFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'phone' | 'url';

/**
 * Operadores de validación
 */
export type ValidationOperator = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'regex' | 'min' | 'max' | 'range';