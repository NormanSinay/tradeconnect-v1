// ====================================================================
// SERVICIO DE QR ADMINISTRATIVO
// ====================================================================
// @fileoverview Servicio para códigos QR, validación y sincronización offline
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  QRData,
  GenerateQRRequest,
  GenerateQRResponse,
  ValidateQRRequest,
  ValidateQRResponse,
  RegenerateQRRequest,
  InvalidateQRRequest,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  CheckoutAttendanceRequest,
  AttendanceStats as QrAttendanceStats,
  CreateAccessLogRequest,
  AccessLogStats,
  DownloadOfflineListRequest,
  DownloadOfflineListResponse,
  ValidateOfflineQRRequest,
  ValidateOfflineQRResponse,
  SyncOfflineDataRequest,
  SyncOfflineDataResponse,
  AttendanceReportRequest,
  AttendanceReport as QrAttendanceReport,
  AttendanceDashboard,
  PublicQRVerificationRequest,
  PublicQRVerificationResponse,
  AuthenticatedQRRequest,
  AdminQRRequest,
  QREncryptionType,
  QRGenerationConfig,
  QRValidationConfig,
  OfflineSyncConfig,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de códigos QR administrativos
 * Incluye generación, validación, asistencia y sincronización offline
 */
export class AdminQRService {
  private readonly baseUrl = '/admin/qr'

  // ====================================================================
  // GENERACIÓN DE CÓDIGOS QR
  // ====================================================================

  /**
   * Genera un nuevo código QR
   */
  async generateQR(request: GenerateQRRequest): Promise<GenerateQRResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/generate`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando código QR:', error)
      throw error
    }
  }

  /**
   * Regenera un código QR existente
   */
  async regenerateQR(request: RegenerateQRRequest): Promise<GenerateQRResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/regenerate`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error regenerando código QR:', error)
      throw error
    }
  }

  /**
   * Genera múltiples códigos QR por lote
   */
  async generateQRBatch(
    requests: GenerateQRRequest[]
  ): Promise<GenerateQRResponse[]> {
    try {
      const response = await api.post(`${this.baseUrl}/generate-batch`, { requests })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error generando lote de códigos QR:', error)
      throw error
    }
  }

  /**
   * Obtiene un código QR por ID
   */
  async getQRById(qrId: string): Promise<QRData> {
    try {
      const response = await api.get(`${this.baseUrl}/${qrId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo código QR:', error)
      throw error
    }
  }

  /**
   * Lista códigos QR con filtros
   */
  async getQRCodes(
    filters: {
      eventId?: number
      userId?: number
      status?: string
      startDate?: Date
      endDate?: Date
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<QRData>> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo códigos QR:', error)
      throw error
    }
  }

  // ====================================================================
  // VALIDACIÓN DE CÓDIGOS QR
  // ====================================================================

  /**
   * Valida un código QR
   */
  async validateQR(request: ValidateQRRequest): Promise<ValidateQRResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/validate`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando código QR:', error)
      throw error
    }
  }

  /**
   * Valida múltiples códigos QR por lote
   */
  async validateQRBatch(
    requests: ValidateQRRequest[]
  ): Promise<ValidateQRResponse[]> {
    try {
      const response = await api.post(`${this.baseUrl}/validate-batch`, { requests })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error validando lote de códigos QR:', error)
      throw error
    }
  }

  /**
   * Invalida un código QR
   */
  async invalidateQR(request: InvalidateQRRequest): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/invalidate`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error invalidando código QR:', error)
      throw error
    }
  }

  // ====================================================================
  // CONTROL DE ASISTENCIA
  // ====================================================================

  /**
   * Marca asistencia usando código QR
   */
  async markAttendance(request: MarkAttendanceRequest): Promise<MarkAttendanceResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/attendance/mark`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error marcando asistencia:', error)
      throw error
    }
  }

  /**
   * Registra checkout de asistencia
   */
  async checkoutAttendance(
    request: CheckoutAttendanceRequest
  ): Promise<MarkAttendanceResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/attendance/checkout`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error registrando checkout de asistencia:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de asistencia por QR
   */
  async getAttendanceStats(
    eventId: number,
    filters: { startDate?: Date; endDate?: Date } = {}
  ): Promise<QrAttendanceStats> {
    try {
      const response = await api.get(`${this.baseUrl}/attendance/stats/${eventId}`, {
        params: filters,
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
    request: AttendanceReportRequest
  ): Promise<QrAttendanceReport> {
    try {
      const response = await api.get(`${this.baseUrl}/attendance/report`, {
        params: request,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de asistencia:', error)
      throw error
    }
  }

  /**
   * Obtiene dashboard de asistencia
   */
  async getAttendanceDashboard(eventId: number): Promise<AttendanceDashboard> {
    try {
      const response = await api.get(`${this.baseUrl}/attendance/dashboard/${eventId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo dashboard de asistencia:', error)
      throw error
    }
  }

  // ====================================================================
  // LOGS DE ACCESO
  // ====================================================================

  /**
   * Crea un log de acceso
   */
  async createAccessLog(request: CreateAccessLogRequest): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/access-logs`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando log de acceso:', error)
      throw error
    }
  }

  /**
   * Obtiene logs de acceso
   */
  async getAccessLogs(
    filters: {
      eventId?: number
      qrId?: string
      userId?: number
      startDate?: Date
      endDate?: Date
      accessResult?: string
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<any>> {
    try {
      const response = await api.get(`${this.baseUrl}/access-logs`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo logs de acceso:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de logs de acceso
   */
  async getAccessLogStats(
    filters: { startDate?: Date; endDate?: Date; eventId?: number } = {}
  ): Promise<AccessLogStats> {
    try {
      const response = await api.get(`${this.baseUrl}/access-logs/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de logs de acceso:', error)
      throw error
    }
  }

  // ====================================================================
  // FUNCIONALIDAD OFFLINE
  // ====================================================================

  /**
   * Descarga lista offline para un evento
   */
  async downloadOfflineList(
    request: DownloadOfflineListRequest
  ): Promise<DownloadOfflineListResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/offline/download`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error descargando lista offline:', error)
      throw error
    }
  }

  /**
   * Valida código QR offline
   */
  async validateOfflineQR(
    request: ValidateOfflineQRRequest
  ): Promise<ValidateOfflineQRResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/offline/validate`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando código QR offline:', error)
      throw error
    }
  }

  /**
   * Sincroniza datos offline
   */
  async syncOfflineData(
    request: SyncOfflineDataRequest
  ): Promise<SyncOfflineDataResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/offline/sync`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error sincronizando datos offline:', error)
      throw error
    }
  }

  /**
   * Obtiene estado de sincronización offline
   */
  async getOfflineSyncStatus(
    deviceId?: string,
    batchId?: string
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/offline/sync-status`, {
        params: { deviceId, batchId },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estado de sincronización offline:', error)
      throw error
    }
  }

  // ====================================================================
  // VERIFICACIÓN PÚBLICA
  // ====================================================================

  /**
   * Verifica código QR públicamente (sin autenticación)
   */
  async publicQRVerification(
    request: PublicQRVerificationRequest
  ): Promise<PublicQRVerificationResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/public/verify`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando código QR públicamente:', error)
      throw error
    }
  }

  /**
   * Verifica código QR con autenticación
   */
  async authenticatedQRVerification(
    request: AuthenticatedQRRequest
  ): Promise<ValidateQRResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/authenticated/verify`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando código QR con autenticación:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN
  // ====================================================================

  /**
   * Actualiza configuración de generación de QR
   */
  async updateQRGenerationConfig(config: QRGenerationConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/generation`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de generación:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de validación de QR
   */
  async updateQRValidationConfig(config: QRValidationConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/validation`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de validación:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de sincronización offline
   */
  async updateOfflineSyncConfig(config: OfflineSyncConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/offline-sync`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de sincronización offline:', error)
      throw error
    }
  }

  /**
   * Obtiene configuraciones actuales
   */
  async getQRConfigs(): Promise<{
    generation: QRGenerationConfig
    validation: QRValidationConfig
    offlineSync: OfflineSyncConfig
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuraciones:', error)
      throw error
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * Obtiene estadísticas generales de QR
   */
  async getQRStats(
    filters: { startDate?: Date; endDate?: Date; eventId?: number } = {}
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de QR:', error)
      throw error
    }
  }

  /**
   * Obtiene métricas de rendimiento de QR
   */
  async getQRPerformanceMetrics(
    eventId: number,
    timeRange: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/performance/${eventId}`, {
        params: {
          startDate: timeRange.start.toISOString(),
          endDate: timeRange.end.toISOString(),
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo métricas de rendimiento:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta códigos QR
   */
  async exportQRCodes(
    format: 'csv' | 'excel' | 'pdf',
    filters?: {
      eventId?: number
      status?: string
      startDate?: Date
      endDate?: Date
    }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando códigos QR:', error)
      throw error
    }
  }

  /**
   * Exporta logs de acceso
   */
  async exportAccessLogs(
    format: 'csv' | 'excel' | 'pdf',
    filters?: {
      eventId?: number
      startDate?: Date
      endDate?: Date
      accessResult?: string
    }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/access-logs/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando logs de acceso:', error)
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
      const response = await api.get(`${this.baseUrl}/attendance/export/${eventId}`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando reporte de asistencia:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminQRService = new AdminQRService()