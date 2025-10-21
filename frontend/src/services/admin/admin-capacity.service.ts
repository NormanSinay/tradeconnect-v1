// ====================================================================
// SERVICIO DE GESTIÓN DE AFOROS ADMINISTRATIVA
// ====================================================================
// @fileoverview Servicio para aforos, overbooking y listas de espera
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  LockStatus,
  WaitlistStatus,
  OverbookingRiskLevel,
  CapacityRuleType,
  CapacityConfig,
  AccessTypeCapacity,
  CapacityStatus,
  CapacityLock,
  CreateCapacityLockData,
  WaitlistEntry,
  AddToWaitlistData,
  OverbookingConfig,
  OverbookingHistory,
  CapacityRule,
  CapacityStats,
  RealTimeOccupancyReport,
  ConfigureCapacityData,
  UpdateCapacityData,
  CapacityQueryFilters,
  CapacityQueryParams,
  CapacityQueryResult,
  CapacityValidationResult,
  LockValidationResult,
  PaymentIntegrationData,
  RegistrationIntegrationData,
  LockReleaseCallback,
  CapacityReservation,
  CapacityReport,
  CapacityRealTimeUpdate,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de aforos administrativos
 * Incluye configuración de capacidad, overbooking, listas de espera y bloqueos
 */
export class AdminCapacityService {
  private readonly baseUrl = '/admin/capacity'

  // ====================================================================
  // CONFIGURACIÓN DE CAPACIDAD
  // ====================================================================

  /**
   * Configura la capacidad de un evento
   */
  async configureCapacity(
    eventId: number,
    configData: ConfigureCapacityData
  ): Promise<CapacityConfig> {
    try {
      const response = await api.post(`${this.baseUrl}/events/${eventId}/config`, configData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error configurando capacidad:', error)
      throw error
    }
  }

  /**
   * Actualiza la configuración de capacidad
   */
  async updateCapacity(
    eventId: number,
    updateData: UpdateCapacityData
  ): Promise<CapacityConfig> {
    try {
      const response = await api.put(`${this.baseUrl}/events/${eventId}/config`, updateData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando capacidad:', error)
      throw error
    }
  }

  /**
   * Obtiene la configuración de capacidad de un evento
   */
  async getCapacityConfig(eventId: number): Promise<CapacityConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración de capacidad:', error)
      throw error
    }
  }

  /**
   * Obtiene el estado actual de capacidad de un evento
   */
  async getCapacityStatus(eventId: number): Promise<CapacityStatus> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/status`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estado de capacidad:', error)
      throw error
    }
  }

  // ====================================================================
  // GESTIÓN DE BLOQUEOS DE CAPACIDAD
  // ====================================================================

  /**
   * Crea un bloqueo de capacidad
   */
  async createCapacityLock(
    eventId: number,
    lockData: CreateCapacityLockData
  ): Promise<CapacityLock> {
    try {
      const response = await api.post(`${this.baseUrl}/events/${eventId}/locks`, lockData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando bloqueo de capacidad:', error)
      throw error
    }
  }

  /**
   * Libera un bloqueo de capacidad
   */
  async releaseCapacityLock(
    eventId: number,
    lockId: string,
    callback?: LockReleaseCallback
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/locks/${lockId}/release`,
        { callback }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error liberando bloqueo de capacidad:', error)
      throw error
    }
  }

  /**
   * Obtiene bloqueos activos de un evento
   */
  async getActiveLocks(eventId: number): Promise<CapacityLock[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/locks/active`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo bloqueos activos:', error)
      throw error
    }
  }

  /**
   * Valida si un bloqueo es válido
   */
  async validateCapacityLock(
    eventId: number,
    lockId: string
  ): Promise<LockValidationResult> {
    try {
      const response = await api.get(
        `${this.baseUrl}/events/${eventId}/locks/${lockId}/validate`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando bloqueo de capacidad:', error)
      throw error
    }
  }

  // ====================================================================
  // GESTIÓN DE LISTAS DE ESPERA
  // ====================================================================

  /**
   * Agrega una entrada a la lista de espera
   */
  async addToWaitlist(
    eventId: number,
    waitlistData: AddToWaitlistData
  ): Promise<WaitlistEntry> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/waitlist`,
        waitlistData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error agregando a lista de espera:', error)
      throw error
    }
  }

  /**
   * Remueve una entrada de la lista de espera
   */
  async removeFromWaitlist(
    eventId: number,
    waitlistId: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/events/${eventId}/waitlist/${waitlistId}`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error removiendo de lista de espera:', error)
      throw error
    }
  }

  /**
   * Obtiene la lista de espera de un evento
   */
  async getWaitlist(
    eventId: number,
    filters?: { status?: WaitlistStatus; priority?: number }
  ): Promise<WaitlistEntry[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/waitlist`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo lista de espera:', error)
      throw error
    }
  }

  /**
   * Notifica al siguiente en la lista de espera
   */
  async notifyNextInWaitlist(eventId: number): Promise<WaitlistEntry | null> {
    try {
      const response = await api.post(`${this.baseUrl}/events/${eventId}/waitlist/notify-next`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error notificando siguiente en lista de espera:', error)
      throw error
    }
  }

  /**
   * Confirma una entrada de lista de espera
   */
  async confirmWaitlistEntry(
    eventId: number,
    waitlistId: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/waitlist/${waitlistId}/confirm`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error confirmando entrada de lista de espera:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN DE OVERBOOKING
  // ====================================================================

  /**
   * Configura overbooking para un evento
   */
  async configureOverbooking(
    eventId: number,
    config: OverbookingConfig
  ): Promise<OverbookingConfig> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/overbooking`,
        config
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error configurando overbooking:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración de overbooking
   */
  async getOverbookingConfig(eventId: number): Promise<OverbookingConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/overbooking`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración de overbooking:', error)
      throw error
    }
  }

  /**
   * Obtiene historial de overbooking
   */
  async getOverbookingHistory(
    eventId: number,
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<OverbookingHistory[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/overbooking/history`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo historial de overbooking:', error)
      throw error
    }
  }

  /**
   * Evalúa el riesgo de overbooking
   */
  async assessOverbookingRisk(eventId: number): Promise<OverbookingRiskLevel> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/overbooking/risk`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error evaluando riesgo de overbooking:', error)
      throw error
    }
  }

  // ====================================================================
  // REGLAS DE CAPACIDAD
  // ====================================================================

  /**
   * Crea una regla de capacidad
   */
  async createCapacityRule(
    eventId: number,
    ruleData: Omit<CapacityRule, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>
  ): Promise<CapacityRule> {
    try {
      const response = await api.post(`${this.baseUrl}/events/${eventId}/rules`, ruleData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando regla de capacidad:', error)
      throw error
    }
  }

  /**
   * Actualiza una regla de capacidad
   */
  async updateCapacityRule(
    eventId: number,
    ruleId: number,
    ruleData: Partial<CapacityRule>
  ): Promise<CapacityRule> {
    try {
      const response = await api.put(
        `${this.baseUrl}/events/${eventId}/rules/${ruleId}`,
        ruleData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando regla de capacidad:', error)
      throw error
    }
  }

  /**
   * Obtiene reglas de capacidad activas
   */
  async getActiveCapacityRules(eventId: number): Promise<CapacityRule[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/rules/active`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo reglas de capacidad activas:', error)
      throw error
    }
  }

  /**
   * Elimina una regla de capacidad
   */
  async deleteCapacityRule(
    eventId: number,
    ruleId: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/events/${eventId}/rules/${ruleId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando regla de capacidad:', error)
      throw error
    }
  }

  // ====================================================================
  // VALIDACIONES Y RESERVAS
  // ====================================================================

  /**
   * Valida capacidad disponible
   */
  async validateCapacity(
    eventId: number,
    requestedCapacity: number,
    accessTypeId?: number
  ): Promise<CapacityValidationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/events/${eventId}/validate`, {
        requestedCapacity,
        accessTypeId,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando capacidad:', error)
      throw error
    }
  }

  /**
   * Reserva capacidad temporalmente
   */
  async reserveCapacity(
    eventId: number,
    reservationData: {
      quantity: number
      accessTypeId?: number
      expiresIn: number // minutos
      metadata?: Record<string, any>
    }
  ): Promise<CapacityReservation> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/reserve`,
        reservationData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error reservando capacidad:', error)
      throw error
    }
  }

  /**
   * Confirma una reserva de capacidad
   */
  async confirmCapacityReservation(
    eventId: number,
    reservationId: string
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/reservations/${reservationId}/confirm`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error confirmando reserva de capacidad:', error)
      throw error
    }
  }

  /**
   * Cancela una reserva de capacidad
   */
  async cancelCapacityReservation(
    eventId: number,
    reservationId: string
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/reservations/${reservationId}/cancel`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error cancelando reserva de capacidad:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES Y ESTADÍSTICAS EN TIEMPO REAL
  // ====================================================================

  /**
   * Obtiene reporte de ocupación en tiempo real
   */
  async getRealTimeOccupancyReport(eventId: number): Promise<RealTimeOccupancyReport> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/realtime/occupancy`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de ocupación en tiempo real:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de capacidad
   */
  async getCapacityStats(
    eventId?: number,
    filters?: CapacityQueryFilters
  ): Promise<CapacityStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: { eventId, ...filters },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de capacidad:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte completo de capacidad
   */
  async getCapacityReport(
    eventId: number,
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<CapacityReport> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/report`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de capacidad:', error)
      throw error
    }
  }

  // ====================================================================
  // INTEGRACIONES
  // ====================================================================

  /**
   * Integra con sistema de pagos para reservas
   */
  async integrateWithPayments(
    eventId: number,
    integrationData: PaymentIntegrationData
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/integrations/payments`,
        integrationData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error integrando con pagos:', error)
      throw error
    }
  }

  /**
   * Integra con sistema de inscripciones
   */
  async integrateWithRegistrations(
    eventId: number,
    integrationData: RegistrationIntegrationData
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/events/${eventId}/integrations/registrations`,
        integrationData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error integrando con inscripciones:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta datos de capacidad
   */
  async exportCapacityData(
    eventId: number,
    format: 'csv' | 'excel' | 'pdf',
    filters?: CapacityQueryFilters
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando datos de capacidad:', error)
      throw error
    }
  }

  /**
   * Exporta lista de espera
   */
  async exportWaitlist(
    eventId: number,
    format: 'csv' | 'excel' | 'pdf'
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/events/${eventId}/waitlist/export`, {
        params: { format },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando lista de espera:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminCapacityService = new AdminCapacityService()