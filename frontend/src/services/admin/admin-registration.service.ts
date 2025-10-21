// ====================================================================
// SERVICIO DE INSCRIPCIONES ADMINISTRATIVAS
// ====================================================================
// @fileoverview Servicio para inscripciones y control de asistencia
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  RegistrationStatus as RegistrationStatusType,
  ParticipantType,
  GroupRegistrationStatus,
  CreateIndividualRegistrationData,
  CreateGroupRegistrationData,
  GroupParticipantData,
  UpdateRegistrationData,
  AffiliationValidationData,
  RegistrationResponse,
  TaxValidationResult,
  PriceCalculationResult,
  AppliedDiscount,
  RefundPolicyResult,
  RegistrationFilters,
  PaginationOptions,
  PaginatedResponse,
  RegistrationStats,
  RegistrationTrend,
  StatusDistribution,
  EventRegistrationReport,
  RegistrationTimelineEntry,
  CancellationReport,
  CancellationReason,
  CancellationPolicy,
  CancellationRule,
  GroupDiscountConfig,
  CapacityValidationResult,
  ConflictValidationResult,
  ConflictingEvent,
  RegistrationAuditLog,
  RegistrationExportData,
  ExportOptions,
  AttendanceInfo,
  AttendanceMethod,
  AttendanceStatus,
  AttendanceStats,
  AttendanceReport,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de inscripciones administrativas
 * Incluye CRUD de registros, validaciones, asistencia y reportes
 */
export class AdminRegistrationService {
  private readonly baseUrl = '/admin/registrations'

  // ====================================================================
  // GESTIÓN DE INSCRIPCIONES INDIVIDUALES
  // ====================================================================

  /**
   * Crea una inscripción individual
   */
  async createIndividualRegistration(
    eventId: number,
    registrationData: CreateIndividualRegistrationData
  ): Promise<RegistrationResponse> {
    try {
      const response = await api.post(
        `${this.baseUrl}/individual`,
        { ...registrationData, eventId }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando inscripción individual:', error)
      throw error
    }
  }

  /**
   * Actualiza una inscripción
   */
  async updateRegistration(
    registrationId: number,
    updateData: UpdateRegistrationData
  ): Promise<RegistrationResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${registrationId}`, updateData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando inscripción:', error)
      throw error
    }
  }

  /**
   * Obtiene una inscripción por ID
   */
  async getRegistrationById(registrationId: number): Promise<RegistrationResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${registrationId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo inscripción:', error)
      throw error
    }
  }

  /**
   * Lista inscripciones con filtros y paginación
   */
  async getRegistrations(
    filters: RegistrationFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResponse<RegistrationResponse>> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo inscripciones:', error)
      throw error
    }
  }

  /**
   * Cancela una inscripción
   */
  async cancelRegistration(
    registrationId: number,
    reason: CancellationReason,
    refundAmount?: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/${registrationId}/cancel`, {
        reason,
        refundAmount,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error cancelando inscripción:', error)
      throw error
    }
  }

  /**
   * Confirma una inscripción pendiente
   */
  async confirmRegistration(registrationId: number): Promise<RegistrationResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${registrationId}/confirm`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error confirmando inscripción:', error)
      throw error
    }
  }

  // ====================================================================
  // GESTIÓN DE INSCRIPCIONES GRUPALES
  // ====================================================================

  /**
   * Crea una inscripción grupal
   */
  async createGroupRegistration(
    eventId: number,
    groupData: CreateGroupRegistrationData
  ): Promise<RegistrationResponse> {
    try {
      const response = await api.post(
        `${this.baseUrl}/group`,
        { ...groupData, eventId }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando inscripción grupal:', error)
      throw error
    }
  }

  /**
   * Agrega participantes a una inscripción grupal
   */
  async addGroupParticipants(
    registrationId: number,
    participants: GroupParticipantData[]
  ): Promise<RegistrationResponse> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${registrationId}/participants`,
        { participants }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error agregando participantes al grupo:', error)
      throw error
    }
  }

  /**
   * Remueve un participante de una inscripción grupal
   */
  async removeGroupParticipant(
    registrationId: number,
    participantId: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/${registrationId}/participants/${participantId}`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error removiendo participante del grupo:', error)
      throw error
    }
  }

  // ====================================================================
  // VALIDACIONES
  // ====================================================================

  /**
   * Valida datos fiscales para una inscripción
   */
  async validateTaxData(
    registrationId: number,
    taxData: AffiliationValidationData
  ): Promise<TaxValidationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${registrationId}/validate-tax`,
        taxData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando datos fiscales:', error)
      throw error
    }
  }

  /**
   * Calcula precio con descuentos aplicados
   */
  async calculatePrice(
    eventId: number,
    participantType: ParticipantType,
    promoCode?: string,
    additionalDiscounts?: AppliedDiscount[]
  ): Promise<PriceCalculationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/calculate-price`, {
        eventId,
        participantType,
        promoCode,
        additionalDiscounts,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error calculando precio:', error)
      throw error
    }
  }

  /**
   * Valida capacidad disponible para una inscripción
   */
  async validateCapacity(
    eventId: number,
    quantity: number = 1
  ): Promise<CapacityValidationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/validate-capacity`, {
        eventId,
        quantity,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando capacidad:', error)
      throw error
    }
  }

  /**
   * Valida conflictos de horario con otras inscripciones
   */
  async validateConflicts(
    userId: number,
    eventId: number,
    participantEmails?: string[]
  ): Promise<ConflictValidationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/validate-conflicts`, {
        userId,
        eventId,
        participantEmails,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando conflictos:', error)
      throw error
    }
  }

  // ====================================================================
  // POLÍTICAS Y REEMBOLSOS
  // ====================================================================

  /**
   * Obtiene política de reembolso para una inscripción
   */
  async getRefundPolicy(registrationId: number): Promise<RefundPolicyResult> {
    try {
      const response = await api.get(`${this.baseUrl}/${registrationId}/refund-policy`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo política de reembolso:', error)
      throw error
    }
  }

  /**
   * Procesa reembolso para una inscripción
   */
  async processRefund(
    registrationId: number,
    amount: number,
    reason: string
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/${registrationId}/refund`, {
        amount,
        reason,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error procesando reembolso:', error)
      throw error
    }
  }

  /**
   * Obtiene política de cancelación
   */
  async getCancellationPolicy(eventId: number): Promise<CancellationPolicy> {
    try {
      const response = await api.get(`${this.baseUrl}/cancellation-policy/${eventId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo política de cancelación:', error)
      throw error
    }
  }

  // ====================================================================
  // CONTROL DE ASISTENCIA
  // ====================================================================

  /**
   * Registra asistencia manual
   */
  async markAttendance(
    registrationId: number,
    attendanceData: {
      method: AttendanceMethod
      location?: string
      notes?: string
    }
  ): Promise<AttendanceInfo> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${registrationId}/attendance`,
        attendanceData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error registrando asistencia:', error)
      throw error
    }
  }

  /**
   * Obtiene información de asistencia
   */
  async getAttendanceInfo(registrationId: number): Promise<AttendanceInfo> {
    try {
      const response = await api.get(`${this.baseUrl}/${registrationId}/attendance`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo información de asistencia:', error)
      throw error
    }
  }

  /**
   * Actualiza estado de asistencia
   */
  async updateAttendanceStatus(
    registrationId: number,
    status: AttendanceStatus,
    notes?: string
  ): Promise<AttendanceInfo> {
    try {
      const response = await api.put(`${this.baseUrl}/${registrationId}/attendance`, {
        status,
        notes,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando estado de asistencia:', error)
      throw error
    }
  }

  /**
   * Registra checkout de asistencia
   */
  async checkoutAttendance(
    registrationId: number,
    checkoutData: {
      location?: string
      notes?: string
    }
  ): Promise<AttendanceInfo> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${registrationId}/attendance/checkout`,
        checkoutData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error registrando checkout de asistencia:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES Y ESTADÍSTICAS
  // ====================================================================

  /**
   * Obtiene estadísticas de inscripciones
   */
  async getRegistrationStats(
    filters: RegistrationFilters = {}
  ): Promise<RegistrationStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de inscripciones:', error)
      throw error
    }
  }

  /**
   * Obtiene tendencias de inscripciones
   */
  async getRegistrationTrends(
    period: { start: Date; end: Date },
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<RegistrationTrend[]> {
    try {
      const response = await api.get(`${this.baseUrl}/trends`, {
        params: {
          startDate: period.start.toISOString(),
          endDate: period.end.toISOString(),
          groupBy,
        },
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo tendencias de inscripciones:', error)
      throw error
    }
  }

  /**
   * Obtiene distribución por estados
   */
  async getStatusDistribution(
    eventId?: number
  ): Promise<StatusDistribution> {
    try {
      const response = await api.get(`${this.baseUrl}/status-distribution`, {
        params: { eventId },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo distribución por estados:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de inscripciones por evento
   */
  async getEventRegistrationReport(
    eventId: number,
    filters?: RegistrationFilters
  ): Promise<EventRegistrationReport> {
    try {
      const response = await api.get(`${this.baseUrl}/reports/event/${eventId}`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de inscripciones por evento:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de asistencia
   */
  async getAttendanceStats(
    eventId?: number,
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<AttendanceStats> {
    try {
      const response = await api.get(`${this.baseUrl}/attendance/stats`, {
        params: {
          eventId,
          ...filters,
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de asistencia:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de asistencia
   */
  async getAttendanceReport(
    eventId: number,
    filters?: { startDate?: Date; endDate?: Date; status?: AttendanceStatus }
  ): Promise<AttendanceReport> {
    try {
      const response = await api.get(`${this.baseUrl}/attendance/report/${eventId}`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de asistencia:', error)
      throw error
    }
  }

  // ====================================================================
  // AUDITORÍA Y LOGS
  // ====================================================================

  /**
   * Obtiene timeline de una inscripción
   */
  async getRegistrationTimeline(
    registrationId: number
  ): Promise<RegistrationTimelineEntry[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${registrationId}/timeline`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo timeline de inscripción:', error)
      throw error
    }
  }

  /**
   * Obtiene logs de auditoría de inscripciones
   */
  async getRegistrationAuditLogs(
    registrationId?: number,
    filters?: {
      action?: string
      userId?: number
      startDate?: Date
      endDate?: Date
    }
  ): Promise<RegistrationAuditLog[]> {
    try {
      const response = await api.get(`${this.baseUrl}/audit-logs`, {
        params: { registrationId, ...filters },
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta datos de inscripciones
   */
  async exportRegistrations(
    format: 'csv' | 'excel' | 'pdf',
    filters?: RegistrationFilters,
    options?: ExportOptions
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters, ...options },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando inscripciones:', error)
      throw error
    }
  }

  /**
   * Exporta reporte de asistencia
   */
  async exportAttendanceReport(
    eventId: number,
    format: 'csv' | 'excel' | 'pdf',
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.baseUrl}/attendance/export/${eventId}`,
        {
          params: { format, ...filters },
          responseType: 'blob',
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando reporte de asistencia:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminRegistrationService = new AdminRegistrationService()