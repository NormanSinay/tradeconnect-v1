// ====================================================================
// SERVICIO DE SPEAKERS ADMINISTRATIVOS
// ====================================================================
// @fileoverview Servicio para gestión de speakers, contratos y pagos
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  SpecialtyInfo,
  SpeakerSpecialtyInfo,
  AvailabilityBlockInfo,
  SpeakerEvaluationInfo,
  SpeakerEvaluationStats,
  CreateSpeakerData,
  UpdateSpeakerData,
  CreateAvailabilityBlockData,
  CreateSpeakerEvaluationData,
  PublicSpeaker,
  DetailedSpeaker,
  AdminSpeaker,
  SpeakerFilters,
  SpeakerQueryParams,
  SpeakerSearchResult,
  AssignSpeakerToEventData,
  UpdateSpeakerEventData,
  SpeakerEventInfo,
  SpeakerStats,
  SpeakersOverviewStats,
  SpeakerCategory,
  RateType,
  Modality,
  SpeakerRole,
  SpeakerEventStatus,
  EvaluatorType,
  SpecialtyCategory,
  RecurrencePattern,
  EvaluationCriteria,
  SpeakerStatus,
  SupportedCurrency as SpeakerSupportedCurrency,
  PaymentMethod as SpeakerPaymentMethod,
  PaymentStatus as SpeakerPaymentStatus,
  PaymentType as SpeakerPaymentType,
  ContractInfo,
  DetailedContractInfo,
  PaymentInfo,
  CreateContractData,
  UpdateContractData,
  CreatePaymentData,
  UpdatePaymentData,
  PublicContract,
  DetailedContract,
  PublicPayment,
  DetailedPayment,
  ContractFilters,
  ContractQueryParams,
  ContractSearchResult,
  PaymentFilters,
  PaymentQueryParams,
  PaymentSearchResult,
  ContractStats,
  PaymentStats,
  SpeakerFinancialReport,
  ContractComplianceReport,
  ContractStatus,
  PaymentTerms,
  PaymentStatus as ContractPaymentStatus,
  PaymentType as ContractPaymentType,
  PaymentMethod as ContractPaymentMethod,
  SupportedCurrency as ContractSupportedCurrency,
  ComplianceStatus,
  FinancialReportType,
  ReportPeriod,
  ExportFormat as ContractExportFormat,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de speakers administrativos
 * Incluye CRUD de speakers, contratos, pagos y evaluaciones
 */
export class AdminSpeakerService {
  private readonly baseUrl = '/admin/speakers'

  // ====================================================================
  // GESTIÓN DE SPEAKERS
  // ====================================================================

  /**
   * Crea un nuevo speaker
   */
  async createSpeaker(speakerData: CreateSpeakerData): Promise<DetailedSpeaker> {
    try {
      const response = await api.post(`${this.baseUrl}`, speakerData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando speaker:', error)
      throw error
    }
  }

  /**
   * Actualiza un speaker existente
   */
  async updateSpeaker(
    speakerId: number,
    speakerData: UpdateSpeakerData
  ): Promise<DetailedSpeaker> {
    try {
      const response = await api.put(`${this.baseUrl}/${speakerId}`, speakerData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando speaker:', error)
      throw error
    }
  }

  /**
   * Obtiene un speaker por ID
   */
  async getSpeakerById(speakerId: number): Promise<DetailedSpeaker> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo speaker:', error)
      throw error
    }
  }

  /**
   * Lista speakers con filtros y paginación
   */
  async getSpeakers(
    params: SpeakerQueryParams = {}
  ): Promise<SpeakerSearchResult> {
    try {
      const response = await api.get(`${this.baseUrl}`, { params })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo speakers:', error)
      throw error
    }
  }

  /**
   * Elimina un speaker
   */
  async deleteSpeaker(speakerId: number): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/${speakerId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando speaker:', error)
      throw error
    }
  }

  // ====================================================================
  // ESPECIALIDADES Y DISPONIBILIDAD
  // ====================================================================

  /**
   * Obtiene todas las especialidades disponibles
   */
  async getSpecialties(): Promise<SpecialtyInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/specialties`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo especialidades:', error)
      throw error
    }
  }

  /**
   * Asigna especialidades a un speaker
   */
  async assignSpecialties(
    speakerId: number,
    specialtyIds: number[]
  ): Promise<SpeakerSpecialtyInfo[]> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/specialties`,
        { specialtyIds }
      )
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error asignando especialidades:', error)
      throw error
    }
  }

  /**
   * Crea un bloque de disponibilidad para un speaker
   */
  async createAvailabilityBlock(
    speakerId: number,
    blockData: CreateAvailabilityBlockData
  ): Promise<AvailabilityBlockInfo> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/availability`,
        blockData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando bloque de disponibilidad:', error)
      throw error
    }
  }

  /**
   * Obtiene disponibilidad de un speaker
   */
  async getSpeakerAvailability(
    speakerId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<AvailabilityBlockInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/availability`, {
        params: { startDate, endDate },
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo disponibilidad del speaker:', error)
      throw error
    }
  }

  /**
   * Elimina un bloque de disponibilidad
   */
  async deleteAvailabilityBlock(
    speakerId: number,
    blockId: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/${speakerId}/availability/${blockId}`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando bloque de disponibilidad:', error)
      throw error
    }
  }

  // ====================================================================
  // ASIGNACIÓN A EVENTOS
  // ====================================================================

  /**
   * Asigna un speaker a un evento
   */
  async assignSpeakerToEvent(
    speakerId: number,
    eventId: number,
    assignmentData: AssignSpeakerToEventData
  ): Promise<SpeakerEventInfo> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/events/${eventId}`,
        assignmentData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error asignando speaker al evento:', error)
      throw error
    }
  }

  /**
   * Actualiza la asignación de un speaker a un evento
   */
  async updateSpeakerEvent(
    speakerId: number,
    eventId: number,
    updateData: UpdateSpeakerEventData
  ): Promise<SpeakerEventInfo> {
    try {
      const response = await api.put(
        `${this.baseUrl}/${speakerId}/events/${eventId}`,
        updateData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando asignación del speaker:', error)
      throw error
    }
  }

  /**
   * Obtiene eventos de un speaker
   */
  async getSpeakerEvents(
    speakerId: number,
    params: { status?: SpeakerEventStatus; upcoming?: boolean } = {}
  ): Promise<SpeakerEventInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/events`, {
        params,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo eventos del speaker:', error)
      throw error
    }
  }

  /**
   * Remueve un speaker de un evento
   */
  async removeSpeakerFromEvent(
    speakerId: number,
    eventId: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/${speakerId}/events/${eventId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error removiendo speaker del evento:', error)
      throw error
    }
  }

  // ====================================================================
  // EVALUACIONES
  // ====================================================================

  /**
   * Crea una evaluación para un speaker
   */
  async createSpeakerEvaluation(
    speakerId: number,
    evaluationData: CreateSpeakerEvaluationData
  ): Promise<SpeakerEvaluationInfo> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/evaluations`,
        evaluationData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando evaluación del speaker:', error)
      throw error
    }
  }

  /**
   * Obtiene evaluaciones de un speaker
   */
  async getSpeakerEvaluations(
    speakerId: number,
    params: { evaluatorType?: EvaluatorType; eventId?: number } = {}
  ): Promise<SpeakerEvaluationInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/evaluations`, {
        params,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo evaluaciones del speaker:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de evaluaciones de un speaker
   */
  async getSpeakerEvaluationStats(speakerId: number): Promise<SpeakerEvaluationStats> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/evaluations/stats`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de evaluaciones:', error)
      throw error
    }
  }

  // ====================================================================
  // CONTRATOS
  // ====================================================================

  /**
   * Crea un contrato para un speaker
   */
  async createContract(
    speakerId: number,
    contractData: CreateContractData
  ): Promise<DetailedContract> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/contracts`,
        contractData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando contrato:', error)
      throw error
    }
  }

  /**
   * Actualiza un contrato
   */
  async updateContract(
    speakerId: number,
    contractId: number,
    contractData: UpdateContractData
  ): Promise<DetailedContract> {
    try {
      const response = await api.put(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}`,
        contractData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando contrato:', error)
      throw error
    }
  }

  /**
   * Obtiene contratos de un speaker
   */
  async getSpeakerContracts(
    speakerId: number,
    params: ContractQueryParams = {}
  ): Promise<ContractSearchResult> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/contracts`, {
        params,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo contratos del speaker:', error)
      throw error
    }
  }

  /**
   * Obtiene un contrato específico
   */
  async getContract(
    speakerId: number,
    contractId: number
  ): Promise<DetailedContract> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/contracts/${contractId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo contrato:', error)
      throw error
    }
  }

  /**
   * Aprueba un contrato
   */
  async approveContract(
    speakerId: number,
    contractId: number
  ): Promise<DetailedContract> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}/approve`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error aprobando contrato:', error)
      throw error
    }
  }

  /**
   * Rechaza un contrato
   */
  async rejectContract(
    speakerId: number,
    contractId: number,
    reason: string
  ): Promise<DetailedContract> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}/reject`,
        { reason }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error rechazando contrato:', error)
      throw error
    }
  }

  // ====================================================================
  // PAGOS
  // ====================================================================

  /**
   * Crea un pago para un contrato
   */
  async createPayment(
    speakerId: number,
    contractId: number,
    paymentData: CreatePaymentData
  ): Promise<DetailedPayment> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}/payments`,
        paymentData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando pago:', error)
      throw error
    }
  }

  /**
   * Actualiza un pago
   */
  async updatePayment(
    speakerId: number,
    contractId: number,
    paymentId: number,
    paymentData: UpdatePaymentData
  ): Promise<DetailedPayment> {
    try {
      const response = await api.put(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}/payments/${paymentId}`,
        paymentData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando pago:', error)
      throw error
    }
  }

  /**
   * Obtiene pagos de un contrato
   */
  async getContractPayments(
    speakerId: number,
    contractId: number,
    params: PaymentQueryParams = {}
  ): Promise<PaymentSearchResult> {
    try {
      const response = await api.get(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}/payments`,
        { params }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo pagos del contrato:', error)
      throw error
    }
  }

  /**
   * Aprueba un pago
   */
  async approvePayment(
    speakerId: number,
    contractId: number,
    paymentId: number
  ): Promise<DetailedPayment> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}/payments/${paymentId}/approve`
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error aprobando pago:', error)
      throw error
    }
  }

  /**
   * Rechaza un pago
   */
  async rejectPayment(
    speakerId: number,
    contractId: number,
    paymentId: number,
    reason: string
  ): Promise<DetailedPayment> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${speakerId}/contracts/${contractId}/payments/${paymentId}/reject`,
        { reason }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error rechazando pago:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES FINANCIEROS
  // ====================================================================

  /**
   * Obtiene reporte financiero de un speaker
   */
  async getSpeakerFinancialReport(
    speakerId: number,
    period: ReportPeriod
  ): Promise<SpeakerFinancialReport> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/financial-report`, {
        params: { period },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte financiero del speaker:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de cumplimiento de contratos
   */
  async getContractComplianceReport(
    speakerId: number,
    contractId?: number
  ): Promise<ContractComplianceReport> {
    try {
      const response = await api.get(
        `${this.baseUrl}/${speakerId}/compliance-report`,
        {
          params: { contractId },
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de cumplimiento:', error)
      throw error
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y MÉTRICAS
  // ====================================================================

  /**
   * Obtiene estadísticas de un speaker
   */
  async getSpeakerStats(speakerId: number): Promise<SpeakerStats> {
    try {
      const response = await api.get(`${this.baseUrl}/${speakerId}/stats`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas del speaker:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas generales de speakers
   */
  async getSpeakersOverviewStats(
    filters?: SpeakerFilters
  ): Promise<SpeakersOverviewStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats/overview`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas generales de speakers:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de contratos
   */
  async getContractStats(
    filters?: ContractFilters
  ): Promise<ContractStats> {
    try {
      const response = await api.get(`${this.baseUrl}/contracts/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de contratos:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de pagos
   */
  async getPaymentStats(
    filters?: PaymentFilters
  ): Promise<PaymentStats> {
    try {
      const response = await api.get(`${this.baseUrl}/payments/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta datos de speakers
   */
  async exportSpeakers(
    format: ContractExportFormat,
    filters?: SpeakerFilters
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando speakers:', error)
      throw error
    }
  }

  /**
   * Exporta contratos de un speaker
   */
  async exportSpeakerContracts(
    speakerId: number,
    format: ContractExportFormat
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.baseUrl}/${speakerId}/contracts/export`,
        {
          params: { format },
          responseType: 'blob',
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando contratos del speaker:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminSpeakerService = new AdminSpeakerService()