// ====================================================================
// SERVICIO DE PROMOCIONES ADMINISTRATIVAS
// ====================================================================
// @fileoverview Servicio para promociones y códigos promocionales
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  PromotionType,
  DiscountType,
  PromoCodeUsageStatus,
  BasePromotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionResponse,
  BasePromoCode,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
  PromoCodeResponse,
  ValidatePromoCodeRequest,
  ValidatePromoCodeResponse,
  ApplyPromoCodeRequest,
  ApplyPromoCodeResponse,
  PromoCodeUsageAttributes,
  CreatePromoCodeUsageRequest,
  PromoCodeUsageResponse,
  PromoCodeStats,
  PromotionFilters,
  PromoCodeFilters,
  PaginatedResponse as PromotionPaginatedResponse,
  PromotionStats,
  PromotionPerformanceReport,
  PromotionConfig,
  PromotionRule,
  PromotionEligibilityCondition,
  PromotionEligibilityResult,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de promociones administrativas
 * Incluye promociones, códigos promocionales y reglas de elegibilidad
 */
export class AdminPromotionService {
  private readonly baseUrl = '/admin/promotions'

  // ====================================================================
  // GESTIÓN DE PROMOCIONES
  // ====================================================================

  /**
   * Crea una nueva promoción
   */
  async createPromotion(
    promotionData: CreatePromotionRequest
  ): Promise<PromotionResponse> {
    try {
      const response = await api.post(`${this.baseUrl}`, promotionData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando promoción:', error)
      throw error
    }
  }

  /**
   * Actualiza una promoción existente
   */
  async updatePromotion(
    promotionId: number,
    promotionData: UpdatePromotionRequest
  ): Promise<PromotionResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${promotionId}`, promotionData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando promoción:', error)
      throw error
    }
  }

  /**
   * Obtiene una promoción por ID
   */
  async getPromotionById(promotionId: number): Promise<PromotionResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${promotionId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo promoción:', error)
      throw error
    }
  }

  /**
   * Lista promociones con filtros y paginación
   */
  async getPromotions(
    filters: PromotionFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<PromotionPaginatedResponse<PromotionResponse>> {
    try {
      const response = await api.get(`${this.baseUrl}`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo promociones:', error)
      throw error
    }
  }

  /**
   * Elimina una promoción
   */
  async deletePromotion(promotionId: number): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/${promotionId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando promoción:', error)
      throw error
    }
  }

  /**
   * Activa una promoción
   */
  async activatePromotion(promotionId: number): Promise<PromotionResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${promotionId}/activate`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error activando promoción:', error)
      throw error
    }
  }

  /**
   * Desactiva una promoción
   */
  async deactivatePromotion(promotionId: number): Promise<PromotionResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${promotionId}/deactivate`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error desactivando promoción:', error)
      throw error
    }
  }

  /**
   * Pausa una promoción
   */
  async pausePromotion(promotionId: number): Promise<PromotionResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${promotionId}/pause`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error pausando promoción:', error)
      throw error
    }
  }

  /**
   * Reanuda una promoción pausada
   */
  async resumePromotion(promotionId: number): Promise<PromotionResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${promotionId}/resume`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error reanudando promoción:', error)
      throw error
    }
  }

  // ====================================================================
  // GESTIÓN DE CÓDIGOS PROMOCIONALES
  // ====================================================================

  /**
   * Crea un nuevo código promocional
   */
  async createPromoCode(
    promoCodeData: CreatePromoCodeRequest
  ): Promise<PromoCodeResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/codes`, promoCodeData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando código promocional:', error)
      throw error
    }
  }

  /**
   * Actualiza un código promocional
   */
  async updatePromoCode(
    promoCodeId: number,
    promoCodeData: UpdatePromoCodeRequest
  ): Promise<PromoCodeResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/codes/${promoCodeId}`, promoCodeData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando código promocional:', error)
      throw error
    }
  }

  /**
   * Obtiene un código promocional por ID
   */
  async getPromoCodeById(promoCodeId: number): Promise<PromoCodeResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/codes/${promoCodeId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo código promocional:', error)
      throw error
    }
  }

  /**
   * Lista códigos promocionales con filtros
   */
  async getPromoCodes(
    filters: PromoCodeFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<PromotionPaginatedResponse<PromoCodeResponse>> {
    try {
      const response = await api.get(`${this.baseUrl}/codes`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo códigos promocionales:', error)
      throw error
    }
  }

  /**
   * Elimina un código promocional
   */
  async deletePromoCode(promoCodeId: number): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/codes/${promoCodeId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando código promocional:', error)
      throw error
    }
  }

  /**
   * Activa un código promocional
   */
  async activatePromoCode(promoCodeId: number): Promise<PromoCodeResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/codes/${promoCodeId}/activate`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error activando código promocional:', error)
      throw error
    }
  }

  /**
   * Desactiva un código promocional
   */
  async deactivatePromoCode(promoCodeId: number): Promise<PromoCodeResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/codes/${promoCodeId}/deactivate`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error desactivando código promocional:', error)
      throw error
    }
  }

  // ====================================================================
  // VALIDACIÓN Y APLICACIÓN DE CÓDIGOS
  // ====================================================================

  /**
   * Valida un código promocional
   */
  async validatePromoCode(
    validationData: ValidatePromoCodeRequest
  ): Promise<ValidatePromoCodeResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/codes/validate`, validationData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando código promocional:', error)
      throw error
    }
  }

  /**
   * Aplica un código promocional
   */
  async applyPromoCode(
    applicationData: ApplyPromoCodeRequest
  ): Promise<ApplyPromoCodeResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/codes/apply`, applicationData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error aplicando código promocional:', error)
      throw error
    }
  }

  /**
   * Remueve un código promocional aplicado
   */
  async removeAppliedPromoCode(
    applicationId: string
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/applications/${applicationId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error removiendo código promocional aplicado:', error)
      throw error
    }
  }

  // ====================================================================
  // USO DE CÓDIGOS PROMOCIONALES
  // ====================================================================

  /**
   * Registra el uso de un código promocional
   */
  async recordPromoCodeUsage(
    usageData: CreatePromoCodeUsageRequest
  ): Promise<PromoCodeUsageResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/codes/usage`, usageData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error registrando uso de código promocional:', error)
      throw error
    }
  }

  /**
   * Obtiene usos de un código promocional
   */
  async getPromoCodeUsage(
    promoCodeId: number,
    filters: { startDate?: Date; endDate?: Date; status?: PromoCodeUsageStatus } = {}
  ): Promise<PromoCodeUsageResponse[]> {
    try {
      const response = await api.get(`${this.baseUrl}/codes/${promoCodeId}/usage`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo usos de código promocional:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de un código promocional
   */
  async getPromoCodeStats(promoCodeId: number): Promise<PromoCodeStats> {
    try {
      const response = await api.get(`${this.baseUrl}/codes/${promoCodeId}/stats`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de código promocional:', error)
      throw error
    }
  }

  // ====================================================================
  // REGLAS Y CONDICIONES DE ELEGIBILIDAD
  // ====================================================================

  /**
   * Crea una regla de promoción
   */
  async createPromotionRule(
    promotionId: number,
    ruleData: Omit<PromotionRule, 'id' | 'promotionId' | 'createdAt' | 'updatedAt'>
  ): Promise<PromotionRule> {
    try {
      const response = await api.post(`${this.baseUrl}/${promotionId}/rules`, ruleData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando regla de promoción:', error)
      throw error
    }
  }

  /**
   * Actualiza una regla de promoción
   */
  async updatePromotionRule(
    promotionId: number,
    ruleId: number,
    ruleData: Partial<PromotionRule>
  ): Promise<PromotionRule> {
    try {
      const response = await api.put(
        `${this.baseUrl}/${promotionId}/rules/${ruleId}`,
        ruleData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando regla de promoción:', error)
      throw error
    }
  }

  /**
   * Obtiene reglas de una promoción
   */
  async getPromotionRules(promotionId: number): Promise<PromotionRule[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${promotionId}/rules`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo reglas de promoción:', error)
      throw error
    }
  }

  /**
   * Elimina una regla de promoción
   */
  async deletePromotionRule(
    promotionId: number,
    ruleId: number
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.delete(`${this.baseUrl}/${promotionId}/rules/${ruleId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error eliminando regla de promoción:', error)
      throw error
    }
  }

  /**
   * Evalúa elegibilidad para una promoción
   */
  async evaluatePromotionEligibility(
    promotionId: number,
    conditions: PromotionEligibilityCondition
  ): Promise<PromotionEligibilityResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${promotionId}/evaluate-eligibility`,
        conditions
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error evaluando elegibilidad de promoción:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES Y ESTADÍSTICAS
  // ====================================================================

  /**
   * Obtiene estadísticas de promociones
   */
  async getPromotionStats(
    filters: PromotionFilters = {}
  ): Promise<PromotionStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de promociones:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de rendimiento de promociones
   */
  async getPromotionPerformanceReport(
    filters: {
      startDate?: Date
      endDate?: Date
      promotionType?: PromotionType
      status?: string
    } = {}
  ): Promise<PromotionPerformanceReport> {
    try {
      const response = await api.get(`${this.baseUrl}/performance-report`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de rendimiento:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de códigos promocionales
   */
  async getPromoCodeStatsOverview(
    filters: PromoCodeFilters = {}
  ): Promise<PromoCodeStats[]> {
    try {
      const response = await api.get(`${this.baseUrl}/codes/stats`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo estadísticas de códigos promocionales:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN
  // ====================================================================

  /**
   * Actualiza configuración de promociones
   */
  async updatePromotionConfig(config: PromotionConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de promociones:', error)
      throw error
    }
  }

  /**
   * Obtiene configuración actual de promociones
   */
  async getPromotionConfig(): Promise<PromotionConfig> {
    try {
      const response = await api.get(`${this.baseUrl}/config`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo configuración de promociones:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta datos de promociones
   */
  async exportPromotions(
    format: 'csv' | 'excel' | 'pdf',
    filters?: PromotionFilters
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando promociones:', error)
      throw error
    }
  }

  /**
   * Exporta códigos promocionales
   */
  async exportPromoCodes(
    format: 'csv' | 'excel' | 'pdf',
    filters?: PromoCodeFilters
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/codes/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando códigos promocionales:', error)
      throw error
    }
  }

  /**
   * Exporta usos de códigos promocionales
   */
  async exportPromoCodeUsage(
    promoCodeId: number,
    format: 'csv' | 'excel' | 'pdf',
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/codes/${promoCodeId}/usage/export`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando usos de códigos promocionales:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminPromotionService = new AdminPromotionService()