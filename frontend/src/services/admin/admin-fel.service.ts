// ====================================================================
// SERVICIO DE FACTURACIÓN FEL ADMINISTRATIVA
// ====================================================================
// @fileoverview Servicio para facturación electrónica FEL
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  FelOperationType,
  FelDocumentStatus,
  FelCertifier,
  FelAuthData,
  FelToken,
  NitValidationData,
  CuiValidationData,
  FelXmlData,
  FelCertificationResult,
  FelDocument,
  FelInvoice,
  FelInvoiceItem,
  FelConfig,
  FelCertifierConfig,
  FelAuditData,
  FelAuditLog,
  GenerateFelInvoiceRequest,
  GenerateFelInvoiceResponse,
  CancelFelInvoiceRequest,
  ResendFelInvoiceRequest,
  FelStats,
  FelComplianceReport,
  FelDashboard,
  FelAlert,
  FelInvoiceFilters,
  FelInvoiceQueryParams,
  FelInvoiceSearchResult,
  FelExportOptions,
  FelExportResult,
  FelCurrency,
  FelTaxType,
  FelProcessingStatus,
  FelLogLevel,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de facturación electrónica FEL administrativa
 * Incluye certificación, validación fiscal y cumplimiento normativo
 */
export class AdminFelService {
  private readonly baseUrl = '/admin/fel'

  // ====================================================================
  // AUTENTICACIÓN Y TOKENS
  // ====================================================================

  /**
   * Autentica con certificador FEL
   */
  async authenticateFel(certifierName: FelCertifier): Promise<FelToken> {
    try {
      const response = await api.post(`${this.baseUrl}/auth/${certifierName}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error autenticando con FEL:', error)
      throw error
    }
  }

  /**
   * Refresca token de certificador FEL
   */
  async refreshFelToken(certifierName: FelCertifier): Promise<FelToken> {
    try {
      const response = await api.post(`${this.baseUrl}/auth/${certifierName}/refresh`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error refrescando token FEL:', error)
      throw error
    }
  }

  /**
   * Obtiene token activo de certificador
   */
  async getActiveFelToken(certifierName: FelCertifier): Promise<FelToken | null> {
    try {
      const response = await api.get(`${this.baseUrl}/auth/${certifierName}/token`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo token activo FEL:', error)
      throw error
    }
  }

  /**
   * Revoca token de certificador
   */
  async revokeFelToken(certifierName: FelCertifier): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/auth/${certifierName}/revoke`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error revocando token FEL:', error)
      throw error
    }
  }

  // ====================================================================
  // VALIDACIÓN FISCAL
  // ====================================================================

  /**
   * Valida NIT
   */
  async validateNit(validationData: NitValidationData): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/validate/nit`, validationData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando NIT:', error)
      throw error
    }
  }

  /**
   * Valida CUI
   */
  async validateCui(validationData: CuiValidationData): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/validate/cui`, validationData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando CUI:', error)
      throw error
    }
  }

  /**
   * Valida datos fiscales combinados
   */
  async validateFiscalData(fiscalData: {
    nit?: string
    cui?: string
    name?: string
    address?: string
  }): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/validate/fiscal`, fiscalData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando datos fiscales:', error)
      throw error
    }
  }

  // ====================================================================
  // GENERACIÓN DE FACTURAS
  // ====================================================================

  /**
   * Genera factura FEL
   */
  async generateFelInvoice(
    request: GenerateFelInvoiceRequest
  ): Promise<GenerateFelInvoiceResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/invoices`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando factura FEL:', error)
      throw error
    }
  }

  /**
   * Genera factura FEL desde pago
   */
  async generateFelInvoiceFromPayment(
    paymentId: number,
    invoiceData?: Partial<GenerateFelInvoiceRequest>
  ): Promise<GenerateFelInvoiceResponse> {
    try {
      const response = await api.post(
        `${this.baseUrl}/invoices/from-payment/${paymentId}`,
        invoiceData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando factura FEL desde pago:', error)
      throw error
    }
  }

  /**
   * Obtiene factura FEL por ID
   */
  async getFelInvoice(invoiceId: string): Promise<FelInvoice> {
    try {
      const response = await api.get(`${this.baseUrl}/invoices/${invoiceId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo factura FEL:', error)
      throw error
    }
  }

  /**
   * Lista facturas FEL con filtros
   */
  async getFelInvoices(
    filters: FelInvoiceFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<FelInvoiceSearchResult> {
    try {
      const response = await api.get(`${this.baseUrl}/invoices`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo facturas FEL:', error)
      throw error
    }
  }

  // ====================================================================
  // CERTIFICACIÓN Y PROCESAMIENTO
  // ====================================================================

  /**
   * Certifica documento FEL
   */
  async certifyFelDocument(documentId: string): Promise<FelCertificationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/documents/${documentId}/certify`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error certificando documento FEL:', error)
      throw error
    }
  }

  /**
   * Verifica estado de certificación
   */
  async checkFelCertificationStatus(documentId: string): Promise<FelDocument> {
    try {
      const response = await api.get(`${this.baseUrl}/documents/${documentId}/status`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando estado de certificación:', error)
      throw error
    }
  }

  /**
   * Reintenta certificación fallida
   */
  async retryFelCertification(documentId: string): Promise<FelCertificationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/documents/${documentId}/retry`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error reintentando certificación:', error)
      throw error
    }
  }

  // ====================================================================
  // CANCELACIÓN DE FACTURAS
  // ====================================================================

  /**
   * Cancela factura FEL
   */
  async cancelFelInvoice(
    request: CancelFelInvoiceRequest
  ): Promise<FelDocument> {
    try {
      const response = await api.post(`${this.baseUrl}/invoices/cancel`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error cancelando factura FEL:', error)
      throw error
    }
  }

  /**
   * Genera nota de crédito FEL
   */
  async generateFelCreditNote(
    originalInvoiceId: string,
    creditNoteData: {
      reason: string
      amount: number
      description?: string
    }
  ): Promise<FelDocument> {
    try {
      const response = await api.post(
        `${this.baseUrl}/invoices/${originalInvoiceId}/credit-note`,
        creditNoteData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando nota de crédito FEL:', error)
      throw error
    }
  }

  // ====================================================================
  // REENVÍO Y DESCARGA
  // ====================================================================

  /**
   * Reenvía factura FEL por email
   */
  async resendFelInvoice(
    request: ResendFelInvoiceRequest
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/invoices/resend`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error reenviando factura FEL:', error)
      throw error
    }
  }

  /**
   * Descarga PDF de factura FEL
   */
  async downloadFelInvoicePDF(invoiceId: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error descargando PDF de factura FEL:', error)
      throw error
    }
  }

  /**
   * Descarga XML de factura FEL
   */
  async downloadFelInvoiceXML(invoiceId: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/invoices/${invoiceId}/xml`, {
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error descargando XML de factura FEL:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN DE CERTIFICADORES
  // ====================================================================

  /**
   * Actualiza configuración de certificador
   */
  async updateFelCertifierConfig(
    certifierName: FelCertifier,
    config: FelCertifierConfig
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/certifiers/${certifierName}/config`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de certificador:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración de certificador
   */
  async getFelCertifierConfig(certifierName: FelCertifier): Promise<FelCertifierConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/certifiers/${certifierName}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración de certificador:', error)
      throw error
    }
  }

  /**
   * Prueba conexión con certificador
   */
  async testFelCertifierConnection(certifierName: FelCertifier): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/certifiers/${certifierName}/test`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error probando conexión con certificador:', error)
      throw error
    }
  }

  // ====================================================================
  // AUDITORÍA Y LOGS
  // ====================================================================

  /**
   * Obtiene logs de auditoría FEL
   */
  async getFelAuditLogs(
    filters: {
      documentId?: string
      operation?: FelOperationType
      certifier?: FelCertifier
      startDate?: Date
      endDate?: Date
      level?: FelLogLevel
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<FelAuditLog>> {
    try {
      const response = await api.get(`${this.baseUrl}/audit`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo logs de auditoría FEL:', error)
      throw error
    }
  }

  /**
   * Crea entrada de auditoría manual
   */
  async createFelAuditEntry(
    auditData: Omit<FelAuditData, 'id' | 'timestamp'>
  ): Promise<FelAuditLog> {
    try {
      const response = await api.post(`${this.baseUrl}/audit`, auditData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando entrada de auditoría:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES Y ESTADÍSTICAS
  // ====================================================================

  /**
   * Obtiene estadísticas FEL
   */
  async getFelStats(
    filters: { startDate?: Date; endDate?: Date; certifier?: FelCertifier } = {}
  ): Promise<FelStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas FEL:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de cumplimiento FEL
   */
  async getFelComplianceReport(
    period: { start: Date; end: Date },
    certifier?: FelCertifier
  ): Promise<FelComplianceReport> {
    try {
      const response = await api.get(`${this.baseUrl}/compliance-report`, {
        params: {
          startDate: period.start.toISOString(),
          endDate: period.end.toISOString(),
          certifier,
        },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de cumplimiento FEL:', error)
      throw error
    }
  }

  /**
   * Obtiene dashboard FEL
   */
  async getFelDashboard(): Promise<FelDashboard> {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo dashboard FEL:', error)
      throw error
    }
  }

  /**
   * Obtiene alertas FEL
   */
  async getFelAlerts(
    filters: { acknowledged?: boolean; severity?: string } = {}
  ): Promise<FelAlert[]> {
    try {
      const response = await api.get(`${this.baseUrl}/alerts`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo alertas FEL:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN GENERAL
  // ====================================================================

  /**
   * Actualiza configuración general FEL
   */
  async updateFelConfig(config: FelConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración FEL:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración actual FEL
   */
  async getFelConfig(): Promise<FelConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración FEL:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta facturas FEL
   */
  async exportFelInvoices(
    format: 'csv' | 'excel' | 'pdf',
    filters?: FelInvoiceFilters,
    options?: FelExportOptions
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export/invoices`, {
        params: { format, ...filters, ...options },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando facturas FEL:', error)
      throw error
    }
  }

  /**
   * Exporta logs de auditoría
   */
  async exportFelAuditLogs(
    format: 'csv' | 'excel',
    filters?: {
      startDate?: Date
      endDate?: Date
      operation?: FelOperationType
      certifier?: FelCertifier
    }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export/audit`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando logs de auditoría FEL:', error)
      throw error
    }
  }

  /**
   * Exporta reporte de cumplimiento
   */
  async exportFelComplianceReport(
    format: 'pdf' | 'excel',
    period: { start: Date; end: Date },
    certifier?: FelCertifier
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export/compliance`, {
        params: {
          format,
          startDate: period.start.toISOString(),
          endDate: period.end.toISOString(),
          certifier,
        },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando reporte de cumplimiento FEL:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminFelService = new AdminFelService()