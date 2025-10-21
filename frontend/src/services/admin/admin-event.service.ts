// ====================================================================
// SERVICIO DE EVENTOS ADMINISTRATIVOS
// ====================================================================
// @fileoverview Servicio para gestión completa de eventos (CRUD, templates, sesiones)
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  EventTypeInfo,
  EventCategoryInfo,
  EventStatusInfo,
  EventAgendaItem,
  CreateEventData,
  UpdateEventData,
  PublishEventData,
  PublicEvent,
  DetailedEvent,
  AdminEvent,
  EventFilters,
  EventQueryParams,
  EventSearchResult,
  EventValidationError,
  EventValidationResult,
  EventStats,
  EventsOverviewStats,
  EventRegistrationInfo,
  CreateRegistrationData,
  EventMediaInfo,
  UploadMediaData,
  EventDuplicationInfo,
  DuplicateEventData,
  EventTypeName,
  EventStatusName,
  EventCategoryName,
  SupportedCurrency,
  MediaType,
  RegistrationStatus,
  PaymentStatus,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de eventos administrativos
 * Incluye CRUD de eventos, plantillas, sesiones y medios
 */
export class AdminEventService {
  private readonly baseUrl = '/admin/events'

  // ====================================================================
  // GESTIÓN DE TIPOS, CATEGORÍAS Y ESTADOS
  // ====================================================================

  /**
   * Obtiene todos los tipos de evento disponibles
   */
  async getEventTypes(): Promise<EventTypeInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/types`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo tipos de evento:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las categorías de evento disponibles
   */
  async getEventCategories(): Promise<EventCategoryInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/categories`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo categorías de evento:', error)
      throw error
    }
  }

  /**
   * Obtiene todos los estados de evento disponibles
   */
  async getEventStatuses(): Promise<EventStatusInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/statuses`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo estados de evento:', error)
      throw error
    }
  }

  // ====================================================================
  // CRUD DE EVENTOS
  // ====================================================================

  /**
   * Crea un nuevo evento
   */
  async createEvent(eventData: CreateEventData): Promise<DetailedEvent> {
    try {
      const response = await api.post(`${this.baseUrl}`, eventData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando evento:', error)
      throw error
    }
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(
    eventId: number,
    eventData: UpdateEventData
  ): Promise<DetailedEvent> {
    try {
      const response = await api.put(`${this.baseUrl}/${eventId}`, eventData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando evento:', error)
      throw error
    }
  }

  /**
   * Obtiene un evento por ID
   */
  async getEventById(eventId: number): Promise<DetailedEvent> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo evento:', error)
      throw error
    }
  }

  /**
   * Lista eventos con filtros y paginación
   */
  async getEvents(
    params: EventQueryParams = {}
  ): Promise<EventSearchResult> {
    try {
      const response = await api.get(`${this.baseUrl}`, { params })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo eventos:', error)
      throw error
    }
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(eventId: number): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/${eventId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando evento:', error)
      throw error
    }
  }

  // ====================================================================
  // PUBLICACIÓN Y ESTADOS
  // ====================================================================

  /**
   * Publica un evento
   */
  async publishEvent(
    eventId: number,
    publishData: PublishEventData
  ): Promise<DetailedEvent> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/publish`,
        publishData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error publicando evento:', error)
      throw error
    }
  }

  /**
   * Cancela un evento
   */
  async cancelEvent(
    eventId: number,
    reason: string
  ): Promise<DetailedEvent> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/cancel`, {
        reason,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error cancelando evento:', error)
      throw error
    }
  }

  /**
   * Pausa un evento
   */
  async pauseEvent(eventId: number, reason: string): Promise<DetailedEvent> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/pause`, {
        reason,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error pausando evento:', error)
      throw error
    }
  }

  /**
   * Reanuda un evento pausado
   */
  async resumeEvent(eventId: number): Promise<DetailedEvent> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/resume`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error reanudando evento:', error)
      throw error
    }
  }

  // ====================================================================
  // DUPLICACIÓN Y PLANTILLAS
  // ====================================================================

  /**
   * Duplica un evento existente
   */
  async duplicateEvent(
    eventId: number,
    duplicateData: DuplicateEventData
  ): Promise<DetailedEvent> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/duplicate`,
        duplicateData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error duplicando evento:', error)
      throw error
    }
  }

  /**
   * Obtiene información de duplicación para un evento
   */
  async getDuplicationInfo(eventId: number): Promise<EventDuplicationInfo> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}/duplication-info`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo información de duplicación:', error)
      throw error
    }
  }

  // ====================================================================
  // GESTIÓN DE MEDIOS
  // ====================================================================

  /**
   * Sube un archivo multimedia para un evento
   */
  async uploadMedia(
    eventId: number,
    mediaData: UploadMediaData,
    file: File
  ): Promise<EventMediaInfo> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('data', JSON.stringify(mediaData))

      const response = await api.post(
        `${this.baseUrl}/${eventId}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error subiendo medio:', error)
      throw error
    }
  }

  /**
   * Obtiene medios de un evento
   */
  async getEventMedia(eventId: number): Promise<EventMediaInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}/media`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo medios del evento:', error)
      throw error
    }
  }

  /**
   * Elimina un medio de un evento
   */
  async deleteMedia(eventId: number, mediaId: number): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/${eventId}/media/${mediaId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando medio:', error)
      throw error
    }
  }

  // ====================================================================
  // REGISTROS E INSCRIPCIONES
  // ====================================================================

  /**
   * Obtiene registros de un evento
   */
  async getEventRegistrations(
    eventId: number,
    params: { page?: number; limit?: number; status?: RegistrationStatus } = {}
  ): Promise<AdminPaginatedResponse<EventRegistrationInfo>> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}/registrations`, {
        params,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo registros del evento:', error)
      throw error
    }
  }

  /**
   * Crea una inscripción manual para un evento
   */
  async createRegistration(
    eventId: number,
    registrationData: CreateRegistrationData
  ): Promise<EventRegistrationInfo> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/registrations`,
        registrationData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando inscripción:', error)
      throw error
    }
  }

  /**
   * Cancela una inscripción
   */
  async cancelRegistration(
    eventId: number,
    registrationId: number,
    reason: string
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/registrations/${registrationId}/cancel`,
        { reason }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error cancelando inscripción:', error)
      throw error
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * Obtiene estadísticas de un evento
   */
  async getEventStats(eventId: number): Promise<EventStats> {
    try {
      const response = await api.get(`${this.baseUrl}/${eventId}/stats`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas del evento:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas generales de eventos
   */
  async getEventsOverviewStats(
    filters?: EventFilters
  ): Promise<EventsOverviewStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats/overview`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error)
      throw error
    }
  }

  // ====================================================================
  // VALIDACIÓN
  // ====================================================================

  /**
   * Valida los datos de un evento
   */
  async validateEventData(
    eventData: CreateEventData | UpdateEventData
  ): Promise<EventValidationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/validate`, eventData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando datos del evento:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta datos de eventos
   */
  async exportEvents(
    format: 'csv' | 'excel' | 'pdf',
    filters?: EventFilters
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando eventos:', error)
      throw error
    }
  }

  /**
   * Exporta registros de un evento específico
   */
  async exportEventRegistrations(
    eventId: number,
    format: 'csv' | 'excel' | 'pdf'
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.baseUrl}/${eventId}/registrations/export`,
        {
          params: { format },
          responseType: 'blob',
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando registros del evento:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminEventService = new AdminEventService()