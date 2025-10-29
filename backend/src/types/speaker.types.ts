/**
 * @fileoverview Tipos TypeScript para el módulo de Speakers
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para speakers, validaciones y respuestas API
 */

// ====================================================================
// TIPOS BASE DE SPEAKERS
// ====================================================================

/**
 * Información básica de especialidad
 */
export interface SpecialtyInfo {
  id: number;
  name: string;
  description?: string;
  category: SpecialtyCategory;
  isActive: boolean;
}

/**
 * Información de especialidad con relación a speaker
 */
export interface SpeakerSpecialtyInfo extends SpecialtyInfo {
  speakerSpecialtyId: number;
  assignedAt: Date;
}

/**
 * Información de bloqueo de disponibilidad
 */
export interface AvailabilityBlockInfo {
  id: number;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdBy: number;
  createdAt: Date;
}

/**
 * Información de evaluación de speaker
 */
export interface SpeakerEvaluationInfo {
  id: number;
  eventId: number;
  eventTitle: string;
  evaluatorType: EvaluatorType;
  evaluatorId?: number;
  overallRating: number;
  criteriaRatings: Record<string, number>;
  comments?: string;
  isPublic: boolean;
  evaluationDate: Date;
  createdAt: Date;
}

/**
 * Estadísticas de evaluaciones de speaker
 */
export interface SpeakerEvaluationStats {
  totalEvaluations: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  criteriaAverages: Record<string, number>;
  lastEvaluationDate?: Date;
}

// ====================================================================
// TIPOS DE CREACIÓN Y ACTUALIZACIÓN
// ====================================================================

/**
 * Datos para crear un nuevo speaker
 */
export interface CreateSpeakerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  nit?: string;
  cui?: string;
  rtu?: string;
  profileImage?: string;
  shortBio?: string;
  fullBio?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  baseRate: number;
  rateType: RateType;
  modalities: Modality[];
  languages: string[];
  cvFile?: string;
  category: SpeakerCategory;
  specialtyIds?: number[];
}

/**
 * Datos para actualizar un speaker
 */
export interface UpdateSpeakerData extends Partial<Omit<CreateSpeakerData, 'email'>> {
  isActive?: boolean;
  verifiedAt?: Date;
  verifiedBy?: number;
}

/**
 * Datos para crear bloqueo de disponibilidad
 */
export interface CreateAvailabilityBlockData {
  speakerId: number;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdBy: number;
}

/**
 * Datos para crear evaluación de speaker
 */
export interface CreateSpeakerEvaluationData {
  speakerId: number;
  eventId: number;
  evaluatorType: EvaluatorType;
  evaluatorId?: number;
  overallRating: number;
  criteriaRatings: Record<string, number>;
  comments?: string;
  isPublic: boolean;
  evaluationDate: Date;
}

// ====================================================================
// TIPOS DE RESPUESTA API
// ====================================================================

/**
 * Speaker en formato público
 */
export interface PublicSpeaker {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  profileImage?: string;
  shortBio?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  baseRate: number;
  rateType: RateType;
  modalities: string[];
  languages: string[];
  category: SpeakerCategory;
  rating?: number;
  totalEvents: number;
  isActive: boolean;
  verifiedAt?: Date;
  specialties: SpecialtyInfo[];
  createdAt: Date;
}

/**
 * Speaker en formato detallado
 */
export interface DetailedSpeaker extends PublicSpeaker {
  nit?: string;
  cui?: string;
  rtu?: string;
  fullBio?: string;
  cvFile?: string;
  availabilityBlocks: AvailabilityBlockInfo[];
  recentEvaluations: SpeakerEvaluationInfo[];
  evaluationStats: SpeakerEvaluationStats;
  updatedAt: Date;
}

/**
 * Speaker en formato de administración
 */
export interface AdminSpeaker extends DetailedSpeaker {
  createdBy: number;
  updatedBy?: number;
  verifiedBy?: number;
  deletedAt?: Date;
}

// ====================================================================
// TIPOS DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de speakers
 */
export interface SpeakerFilters {
  category?: SpeakerCategory;
  minRating?: number;
  maxRating?: number;
  modalities?: string[];
  languages?: string[];
  specialties?: number[];
  country?: string;
  isActive?: boolean;
  isVerified?: boolean;
  minRate?: number;
  maxRate?: number;
  rateType?: RateType;
  availableFrom?: Date;
  availableTo?: Date;
  createdBy?: number;
}

/**
 * Parámetros de consulta para speakers
 */
export interface SpeakerQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'rating' | 'totalEvents' | 'baseRate' | 'createdAt' | 'verifiedAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: SpeakerFilters;
}

/**
 * Resultado de búsqueda de speakers
 */
export interface SpeakerSearchResult {
  speakers: PublicSpeaker[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: SpeakerFilters;
}

// ====================================================================
// TIPOS DE ASIGNACIÓN A EVENTOS
// ====================================================================

/**
 * Datos para asignar speaker a evento
 */
export interface AssignSpeakerToEventData {
  speakerId: number;
  eventId: number;
  role: SpeakerRole;
  participationStart: Date;
  participationEnd: Date;
  durationMinutes?: number;
  modality: Modality;
  order?: number;
  notes?: string;
}

/**
 * Datos para actualizar asignación
 */
export interface UpdateSpeakerEventData extends Partial<Omit<AssignSpeakerToEventData, 'speakerId' | 'eventId'>> {
  status?: SpeakerEventStatus;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

/**
 * Información de asignación speaker-evento
 */
export interface SpeakerEventInfo {
  id: number;
  speakerId: number;
  eventId: number;
  eventTitle: string;
  eventStartDate: Date;
  eventEndDate: Date;
  role: SpeakerRole;
  participationStart: Date;
  participationEnd: Date;
  durationMinutes?: number;
  modality: Modality;
  order?: number;
  status: SpeakerEventStatus;
  notes?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdBy: number;
  createdAt: Date;
}

// ====================================================================
// TIPOS DE ESTADÍSTICAS
// ====================================================================

/**
 * Estadísticas de un speaker
 */
export interface SpeakerStats {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  cancelledEvents: number;
  totalEarnings: number;
  averageRating: number;
  totalEvaluations: number;
  ratingDistribution: Record<number, number>;
  mostUsedModality: Modality;
  mostCommonRole: SpeakerRole;
  specialtiesCount: number;
  yearsOfExperience: number;
  lastEventDate?: Date;
  nextEventDate?: Date;
}

/**
 * Estadísticas generales de speakers
 */
export interface SpeakersOverviewStats {
  totalSpeakers: number;
  activeSpeakers: number;
  verifiedSpeakers: number;
  totalEvents: number;
  averageRating: number;
  totalEarnings: number;
  topCategories: Array<{
    category: SpeakerCategory;
    count: number;
    averageRating: number;
  }>;
  topSpecialties: Array<{
    specialty: SpecialtyInfo;
    speakerCount: number;
    averageRating: number;
  }>;
  modalityUsage: Record<Modality, number>;
  monthlyGrowth: Array<{
    month: string;
    newSpeakers: number;
    totalEvents: number;
  }>;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Categorías de speaker disponibles
 */
export type SpeakerCategory = 'national' | 'international' | 'expert' | 'special_guest';

/**
 * Tipos de tarifa disponibles
 */
export type RateType = 'hourly' | 'daily' | 'event';

/**
 * Modalidades disponibles
 */
export type Modality = 'presential' | 'virtual' | 'hybrid';

/**
 * Roles de speaker en eventos
 */
export type SpeakerRole = 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';

/**
 * Estados de asignación speaker-evento
 */
export type SpeakerEventStatus = 'tentative' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Tipos de evaluador
 */
export type EvaluatorType = 'organizer' | 'attendee' | 'both';

/**
 * Categorías de especialidad
 */
export type SpecialtyCategory = 'technology' | 'business' | 'marketing' | 'design' | 'education' | 'health' | 'other';

/**
 * Patrones de recurrencia
 */
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Criterios de evaluación estándar
 */
export type EvaluationCriteria = 'domain_knowledge' | 'communication' | 'punctuality' | 'qa_handling' | 'engagement' | 'content_quality';

/**
 * Estados de speaker
 */
export type SpeakerStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

/**
 * Monedas soportadas para pagos
 */
export type SupportedCurrency = 'GTQ' | 'USD';

/**
 * Métodos de pago soportados
 */
export type PaymentMethod = 'bank_transfer' | 'check' | 'cash' | 'paypal' | 'other';

/**
 * Estados de pago
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

/**
 * Tipos de pago
 */
export type PaymentType = 'advance' | 'final' | 'installment';
