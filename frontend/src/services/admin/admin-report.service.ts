// ====================================================================
// SERVICIO DE REPORTES ADMINISTRATIVO
// ====================================================================
// @fileoverview Servicio para reportes y analytics
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de reportes administrativos
 * Incluye generación, programación y distribución de reportes
 */
export class AdminReportService {
  private readonly baseUrl = '/admin/reports'

  // ====================================================================
  // GENERACIÓN DE REPORTES
  // ====================================================================

  /**
   * Genera reporte personalizado
   */
  async generateCustomReport(
    reportConfig: {
      name: string
      type: 'events' | 'registrations' | 'payments' | 'speakers' | 'certificates' | 'system'
      filters: Record<string, any>
      groupBy?: string[]
      metrics?: string[]
      dateRange: { start: Date; end: Date }
      format: 'json' | 'csv' | 'excel' | 'pdf'
    }
  ): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/generate`, reportConfig)
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando reporte personalizado:', error)
      throw error
    }
  }

  /**
   * Genera reporte estándar
   */
  async generateStandardReport(
    reportType: string,
    parameters: Record<string, any> = {}
  ): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/standard/${reportType}`, parameters)
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando reporte estándar:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES PREDEFINIDOS
  // ====================================================================

  /**
   * Reporte de eventos
   */
  async getEventsReport(
    filters: {
      startDate?: Date
      endDate?: Date
      eventType?: string
      status?: string
      organizerId?: number
    } = {}
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/events`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de eventos:', error)
      throw error
    }
  }

  /**
   * Reporte de inscripciones
   */
  async getRegistrationsReport(
    filters: {
      startDate?: Date
      endDate?: Date
      eventId?: number
      status?: string
      paymentStatus?: string
    } = {}
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/registrations`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de inscripciones:', error)
      throw error
    }
  }

  /**
   * Reporte financiero
   */
  async getFinancialReport(
    filters: {
      startDate?: Date
      endDate?: Date
      currency?: string
      includeRefunds?: boolean
    } = {}
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/financial`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte financiero:', error)
      throw error
    }
  }

  /**
   * Reporte de speakers
   */
  async getSpeakersReport(
    filters: {
      startDate?: Date
      endDate?: Date
      specialty?: string
      status?: string
    } = {}
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/speakers`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de speakers:', error)
      throw error
    }
  }

  /**
   * Reporte de certificados
   */
  async getCertificatesReport(
    filters: {
      startDate?: Date
      endDate?: Date
      eventId?: number
      status?: string
      type?: string
    } = {}
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/certificates`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de certificados:', error)
      throw error
    }
  }

  /**
   * Reporte del sistema
   */
  async getSystemReport(
    filters: {
      startDate?: Date
      endDate?: Date
      includePerformance?: boolean
      includeErrors?: boolean
    } = {}
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/system`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte del sistema:', error)
      throw error
    }
  }

  // ====================================================================
  // PROGRAMACIÓN DE REPORTES
  // ====================================================================

  /**
   * Programa un reporte recurrente
   */
  async scheduleReport(
    scheduleData: {
      name: string
      reportType: string
      parameters: Record<string, any>
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
      format: 'csv' | 'excel' | 'pdf'
      enabled: boolean
    }
  ): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/schedule`, scheduleData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error programando reporte:', error)
      throw error
    }
  }

  /**
   * Obtiene reportes programados
   */
  async getScheduledReports(
    filters: { enabled?: boolean; frequency?: string } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<any>> {
    try {
      const response = await api.get(`${this.baseUrl}/scheduled`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reportes programados:', error)
      throw error
    }
  }

  /**
   * Actualiza reporte programado
   */
  async updateScheduledReport(
    scheduleId: string,
    updateData: Partial<{
      name: string
      parameters: Record<string, any>
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
      format: 'csv' | 'excel' | 'pdf'
      enabled: boolean
    }>
  ): Promise<any> {
    try {
      const response = await api.put(`${this.baseUrl}/scheduled/${scheduleId}`, updateData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando reporte programado:', error)
      throw error
    }
  }

  /**
   * Elimina reporte programado
   */
  async deleteScheduledReport(scheduleId: string): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/scheduled/${scheduleId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando reporte programado:', error)
      throw error
    }
  }

  // ====================================================================
  // DASHBOARDS Y ANALYTICS
  // ====================================================================

  /**
   * Obtiene datos para dashboard ejecutivo
   */
  async getExecutiveDashboard(
    timeRange: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard/executive`, {
        params: {
          startDate: timeRange.start.toISOString(),
          endDate: timeRange.end.toISOString(),
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo dashboard ejecutivo:', error)
      throw error
    }
  }

  /**
   * Obtiene métricas de rendimiento
   */
  async getPerformanceMetrics(
    metrics: string[],
    timeRange: { start: Date; end: Date },
    groupBy?: string
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/metrics`, {
        params: {
          metrics: metrics.join(','),
          startDate: timeRange.start.toISOString(),
          endDate: timeRange.end.toISOString(),
          groupBy,
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo métricas de rendimiento:', error)
      throw error
    }
  }

  /**
   * Obtiene tendencias y comparativas
   */
  async getTrendsAnalysis(
    metric: string,
    periods: { current: { start: Date; end: Date }; previous: { start: Date; end: Date } }
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/trends/${metric}`, {
        params: {
          currentStart: periods.current.start.toISOString(),
          currentEnd: periods.current.end.toISOString(),
          previousStart: periods.previous.start.toISOString(),
          previousEnd: periods.previous.end.toISOString(),
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo análisis de tendencias:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN Y DISTRIBUCIÓN
  // ====================================================================

  /**
   * Exporta reporte en formato específico
   */
  async exportReport(
    reportId: string,
    format: 'csv' | 'excel' | 'pdf',
    options?: { includeCharts?: boolean; customLayout?: boolean }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${reportId}/export`, {
        params: { format, ...options },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando reporte:', error)
      throw error
    }
  }

  /**
   * Envía reporte por email
   */
  async emailReport(
    reportId: string,
    emailData: {
      recipients: string[]
      subject: string
      message?: string
      format: 'csv' | 'excel' | 'pdf'
      includeAttachment: boolean
    }
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/${reportId}/email`, emailData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error enviando reporte por email:', error)
      throw error
    }
  }

  /**
   * Comparte reporte con usuarios
   */
  async shareReport(
    reportId: string,
    shareData: {
      userIds: number[]
      permissions: ('view' | 'edit' | 'delete')[]
      expiresAt?: Date
    }
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/${reportId}/share`, shareData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error compartiendo reporte:', error)
      throw error
    }
  }

  // ====================================================================
  // HISTORIAL Y ARCHIVO
  // ====================================================================

  /**
   * Obtiene historial de reportes generados
   */
  async getReportHistory(
    filters: {
      reportType?: string
      generatedBy?: number
      startDate?: Date
      endDate?: Date
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<any>> {
    try {
      const response = await api.get(`${this.baseUrl}/history`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo historial de reportes:', error)
      throw error
    }
  }

  /**
   * Archiva reporte
   */
  async archiveReport(reportId: string): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/${reportId}/archive`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error archivando reporte:', error)
      throw error
    }
  }

  /**
   * Elimina reporte
   */
  async deleteReport(reportId: string): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/${reportId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando reporte:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN Y PLANTILLAS
  // ====================================================================

  /**
   * Crea plantilla de reporte
   */
  async createReportTemplate(
    templateData: {
      name: string
      description?: string
      reportType: string
      defaultParameters: Record<string, any>
      layout: any
      isPublic: boolean
    }
  ): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/templates`, templateData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando plantilla de reporte:', error)
      throw error
    }
  }

  /**
   * Obtiene plantillas de reporte
   */
  async getReportTemplates(
    filters: { reportType?: string; isPublic?: boolean } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<any>> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo plantillas de reporte:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de reportes
   */
  async updateReportConfig(config: {
    defaultFormat: 'csv' | 'excel' | 'pdf'
    retentionDays: number
    maxConcurrentReports: number
    enableScheduling: boolean
  }): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de reportes:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración actual de reportes
   */
  async getReportConfig(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración de reportes:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminReportService = new AdminReportService()