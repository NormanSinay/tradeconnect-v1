// ====================================================================
// SERVICIO DE CERTIFICADOS ADMINISTRATIVO
// ====================================================================
// @fileoverview Servicio para certificados y blockchain
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  CertificateType,
  CertificateStatus,
  CertificateValidationMethod,
  CertificateParticipantData,
  CertificateEventData,
  CertificateData,
  CertificateBlockchainData,
  CertificateEligibilityCriteria,
  CertificateTemplateAttributes,
  CertificateTemplateConfiguration,
  CertificateAttributes,
  CertificateValidationLogAttributes,
  CertificateValidationResult,
  GenerateCertificateRequest,
  GenerateBulkCertificatesRequest,
  VerifyCertificateRequest,
  VerifyCertificateResponse,
  RevokeCertificateRequest,
  ResendCertificateRequest,
  CertificateStats,
  PDFEngineConfig,
  CertificateBlockchainConfig,
  CertificateVerificationConfig,
  CertificateModuleConfig,
  PDFGenerationOptions,
  PDFTemplateData,
  PDFGenerationResult,
  QRCodeOptions,
  QRCodeResult,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de certificados administrativos
 * Incluye generación, blockchain, validación y plantillas
 */
export class AdminCertificateService {
  private readonly baseUrl = '/admin/certificates'

  // ====================================================================
  // GESTIÓN DE CERTIFICADOS
  // ====================================================================

  /**
   * Genera un certificado individual
   */
  async generateCertificate(
    request: GenerateCertificateRequest
  ): Promise<CertificateData> {
    try {
      const response = await api.post(`${this.baseUrl}/generate`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando certificado:', error)
      throw error
    }
  }

  /**
   * Genera certificados por lote
   */
  async generateBulkCertificates(
    request: GenerateBulkCertificatesRequest
  ): Promise<{ generated: number; failed: number; certificates: CertificateData[] }> {
    try {
      const response = await api.post(`${this.baseUrl}/generate-bulk`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando certificados por lote:', error)
      throw error
    }
  }

  /**
   * Obtiene un certificado por ID
   */
  async getCertificateById(certificateId: string): Promise<CertificateData> {
    try {
      const response = await api.get(`${this.baseUrl}/${certificateId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo certificado:', error)
      throw error
    }
  }

  /**
   * Lista certificados con filtros
   */
  async getCertificates(
    filters: {
      eventId?: number
      participantId?: number
      status?: CertificateStatus
      type?: CertificateType
      startDate?: Date
      endDate?: Date
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<CertificateData>> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo certificados:', error)
      throw error
    }
  }

  /**
   * Revoca un certificado
   */
  async revokeCertificate(
    request: RevokeCertificateRequest
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/revoke`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error revocando certificado:', error)
      throw error
    }
  }

  /**
   * Reenvía un certificado por email
   */
  async resendCertificate(
    request: ResendCertificateRequest
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/resend`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error reenviando certificado:', error)
      throw error
    }
  }

  // ====================================================================
  // VERIFICACIÓN DE CERTIFICADOS
  // ====================================================================

  /**
   * Verifica un certificado
   */
  async verifyCertificate(
    request: VerifyCertificateRequest
  ): Promise<VerifyCertificateResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/verify`, request)
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando certificado:', error)
      throw error
    }
  }

  /**
   * Verifica certificado por hash de blockchain
   */
  async verifyCertificateByBlockchain(
    blockchainHash: string
  ): Promise<CertificateBlockchainData> {
    try {
      const response = await api.get(`${this.baseUrl}/verify/blockchain/${blockchainHash}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando certificado por blockchain:', error)
      throw error
    }
  }

  /**
   * Obtiene logs de validación de un certificado
   */
  async getCertificateValidationLogs(
    certificateId: string
  ): Promise<CertificateValidationLogAttributes[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${certificateId}/validation-logs`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo logs de validación:', error)
      throw error
    }
  }

  // ====================================================================
  // PLANTILLAS DE CERTIFICADOS
  // ====================================================================

  /**
   * Crea una plantilla de certificado
   */
  async createCertificateTemplate(
    templateData: Omit<CertificateTemplateAttributes, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CertificateTemplateAttributes> {
    try {
      const response = await api.post(`${this.baseUrl}/templates`, templateData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando plantilla de certificado:', error)
      throw error
    }
  }

  /**
   * Actualiza una plantilla de certificado
   */
  async updateCertificateTemplate(
    templateId: string,
    templateData: Partial<CertificateTemplateAttributes>
  ): Promise<CertificateTemplateAttributes> {
    try {
      const response = await api.put(`${this.baseUrl}/templates/${templateId}`, templateData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando plantilla de certificado:', error)
      throw error
    }
  }

  /**
   * Obtiene una plantilla de certificado
   */
  async getCertificateTemplate(templateId: string): Promise<CertificateTemplateAttributes> {
    try {
      const response = await api.get(`${this.baseUrl}/templates/${templateId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo plantilla de certificado:', error)
      throw error
    }
  }

  /**
   * Lista plantillas de certificados
   */
  async getCertificateTemplates(
    filters: { eventType?: string; active?: boolean } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<CertificateTemplateAttributes>> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo plantillas de certificados:', error)
      throw error
    }
  }

  /**
   * Elimina una plantilla de certificado
   */
  async deleteCertificateTemplate(templateId: string): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/templates/${templateId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando plantilla de certificado:', error)
      throw error
    }
  }

  /**
   * Previsualiza una plantilla de certificado
   */
  async previewCertificateTemplate(
    templateId: string,
    sampleData?: any
  ): Promise<{ html: string; pdf?: Buffer }> {
    try {
      const response = await api.post(`${this.baseUrl}/templates/${templateId}/preview`, {
        sampleData,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error previsualizando plantilla de certificado:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN DE PDF Y QR
  // ====================================================================

  /**
   * Genera PDF de certificado
   */
  async generateCertificatePDF(
    certificateId: string,
    options?: PDFGenerationOptions
  ): Promise<PDFGenerationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/${certificateId}/pdf`, options || {})
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando PDF de certificado:', error)
      throw error
    }
  }

  /**
   * Genera código QR para certificado
   */
  async generateCertificateQR(
    certificateId: string,
    options?: QRCodeOptions
  ): Promise<QRCodeResult> {
    try {
      const response = await api.post(`${this.baseUrl}/${certificateId}/qr`, options || {})
      return (response.data as any).data
    } catch (error) {
      console.error('Error generando código QR de certificado:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración del motor PDF
   */
  async updatePDFEngineConfig(config: PDFEngineConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/pdf-engine`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración del motor PDF:', error)
      throw error
    }
  }

  // ====================================================================
  // BLOCKCHAIN
  // ====================================================================

  /**
   * Registra certificado en blockchain
   */
  async registerCertificateInBlockchain(
    certificateId: string
  ): Promise<CertificateBlockchainData> {
    try {
      const response = await api.post(`${this.baseUrl}/${certificateId}/blockchain/register`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error registrando certificado en blockchain:', error)
      throw error
    }
  }

  /**
   * Verifica certificado en blockchain
   */
  async verifyCertificateInBlockchain(
    certificateId: string
  ): Promise<CertificateBlockchainData> {
    try {
      const response = await api.get(`${this.baseUrl}/${certificateId}/blockchain/verify`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando certificado en blockchain:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de blockchain
   */
  async updateBlockchainConfig(config: CertificateBlockchainConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/blockchain`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de blockchain:', error)
      throw error
    }
  }

  // ====================================================================
  // ELEGIBILIDAD Y VALIDACIÓN
  // ====================================================================

  /**
   * Verifica elegibilidad para certificado
   */
  async checkCertificateEligibility(
    participantData: CertificateParticipantData,
    eventData: CertificateEventData,
    criteria?: CertificateEligibilityCriteria
  ): Promise<CertificateValidationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/eligibility/check`, {
        participantData,
        eventData,
        criteria,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error verificando elegibilidad para certificado:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de verificación
   */
  async updateVerificationConfig(config: CertificateVerificationConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/verification`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de verificación:', error)
      throw error
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * Obtiene estadísticas de certificados
   */
  async getCertificateStats(
    filters: { eventId?: number; startDate?: Date; endDate?: Date } = {}
  ): Promise<CertificateStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de certificados:', error)
      throw error
    }
  }

  /**
   * Obtiene métricas de rendimiento del módulo
   */
  async getCertificatePerformanceMetrics(
    timeRange: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/performance`, {
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
  // CONFIGURACIÓN GENERAL
  // ====================================================================

  /**
   * Actualiza configuración del módulo de certificados
   */
  async updateModuleConfig(config: CertificateModuleConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/module`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración del módulo:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración actual del módulo
   */
  async getModuleConfig(): Promise<CertificateModuleConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración del módulo:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta certificados
   */
  async exportCertificates(
    format: 'csv' | 'excel' | 'pdf',
    filters?: {
      eventId?: number
      status?: CertificateStatus
      type?: CertificateType
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
      console.error('Error exportando certificados:', error)
      throw error
    }
  }

  /**
   * Exporta plantillas de certificados
   */
  async exportCertificateTemplates(
    format: 'json' | 'zip',
    filters?: { eventType?: string; active?: boolean }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/templates/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando plantillas de certificados:', error)
      throw error
    }
  }

  /**
   * Exporta reporte de blockchain
   */
  async exportBlockchainReport(
    format: 'csv' | 'excel',
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/blockchain/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando reporte de blockchain:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminCertificateService = new AdminCertificateService()