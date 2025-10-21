// ====================================================================
// SERVICIO DE PAGOS ADMINISTRATIVO
// ====================================================================
// @fileoverview Servicio para pagos, reembolsos y reconciliación
// @version 1.0.0
// @author TradeConnect Team

import { api } from '@/services/api'
import type {
  BillingInfo,
  PaymentMethodInfo,
  PaymentInitiationData,
  PaymentInitiationResponse,
  PaymentConfirmationData,
  PaymentTransaction,
  RefundData,
  RefundInfo,
  PaymentGatewayConfig,
  ReconciliationData,
  GatewayTransaction,
  ReconciliationDiscrepancy,
  ReconciliationReport,
  PaymentFilters,
  PaymentQueryParams,
  PaymentSearchResult,
  PaymentStats,
  RevenueReport as PaymentRevenueReport,
  CardValidationConfig,
  CardValidationResult,
  PaymentToken,
  CircuitBreakerConfig,
  CircuitBreakerState,
  RetryConfig,
  RetryJob,
  WebhookPayload,
  PaymentEvent,
  PaymentRateLimit,
  PaymentReport,
  PaymentDashboard,
  PaymentAlert,
  SupportedCurrency as PaymentSupportedCurrency,
  ExchangeRate,
  CurrencyConversion,
  AdminPaginatedResponse,
  AdminOperationResult,
} from '@/types/admin'

/**
 * Servicio para gestión completa de pagos administrativos
 * Incluye transacciones, reembolsos, gateways y reconciliación
 */
export class AdminPaymentService {
  private readonly baseUrl = '/admin/payments'

  // ====================================================================
  // GESTIÓN DE TRANSACCIONES
  // ====================================================================

  /**
   * Inicia una transacción de pago
   */
  async initiatePayment(
    paymentData: PaymentInitiationData
  ): Promise<PaymentInitiationResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/initiate`, paymentData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error iniciando pago:', error)
      throw error
    }
  }

  /**
   * Confirma una transacción de pago
   */
  async confirmPayment(
    confirmationData: PaymentConfirmationData
  ): Promise<PaymentTransaction> {
    try {
      const response = await api.post(`${this.baseUrl}/confirm`, confirmationData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error confirmando pago:', error)
      throw error
    }
  }

  /**
   * Obtiene una transacción por ID
   */
  async getPaymentTransaction(transactionId: string): Promise<PaymentTransaction> {
    try {
      const response = await api.get(`${this.baseUrl}/transactions/${transactionId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo transacción de pago:', error)
      throw error
    }
  }

  /**
   * Lista transacciones con filtros
   */
  async getPaymentTransactions(
    filters: PaymentFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<PaymentSearchResult> {
    try {
      const response = await api.get(`${this.baseUrl}/transactions`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo transacciones de pago:', error)
      throw error
    }
  }

  /**
   * Cancela una transacción pendiente
   */
  async cancelPayment(transactionId: string, reason: string): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/transactions/${transactionId}/cancel`, {
        reason,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error cancelando pago:', error)
      throw error
    }
  }

  // ====================================================================
  // REEMBOLSOS
  // ====================================================================

  /**
   * Procesa un reembolso
   */
  async processRefund(refundData: RefundData): Promise<RefundInfo> {
    try {
      const response = await api.post(`${this.baseUrl}/refunds`, refundData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error procesando reembolso:', error)
      throw error
    }
  }

  /**
   * Obtiene información de un reembolso
   */
  async getRefund(refundId: string): Promise<RefundInfo> {
    try {
      const response = await api.get(`${this.baseUrl}/refunds/${refundId}`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reembolso:', error)
      throw error
    }
  }

  /**
   * Lista reembolsos con filtros
   */
  async getRefunds(
    filters: {
      transactionId?: string
      status?: string
      startDate?: Date
      endDate?: Date
    } = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<AdminPaginatedResponse<RefundInfo>> {
    try {
      const response = await api.get(`${this.baseUrl}/refunds`, {
        params: { ...filters, ...pagination },
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reembolsos:', error)
      throw error
    }
  }

  /**
   * Cancela un reembolso pendiente
   */
  async cancelRefund(refundId: string, reason: string): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/refunds/${refundId}/cancel`, {
        reason,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error cancelando reembolso:', error)
      throw error
    }
  }

  // ====================================================================
  // MÉTODOS DE PAGO
  // ====================================================================

  /**
   * Obtiene métodos de pago disponibles
   */
  async getPaymentMethods(): Promise<PaymentMethodInfo[]> {
    try {
      const response = await api.get(`${this.baseUrl}/methods`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo métodos de pago:', error)
      throw error
    }
  }

  /**
   * Configura un método de pago
   */
  async configurePaymentMethod(
    methodId: string,
    config: any
  ): Promise<PaymentMethodInfo> {
    try {
      const response = await api.put(`${this.baseUrl}/methods/${methodId}`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error configurando método de pago:', error)
      throw error
    }
  }

  /**
   * Activa/desactiva un método de pago
   */
  async togglePaymentMethod(
    methodId: string,
    active: boolean
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.patch(`${this.baseUrl}/methods/${methodId}/toggle`, {
        active,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error cambiando estado del método de pago:', error)
      throw error
    }
  }

  // ====================================================================
  // VALIDACIÓN DE TARJETAS
  // ====================================================================

  /**
   * Valida información de tarjeta
   */
  async validateCard(cardData: any): Promise<CardValidationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/validate-card`, cardData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error validando tarjeta:', error)
      throw error
    }
  }

  /**
   * Crea un token de pago
   */
  async createPaymentToken(cardData: any): Promise<PaymentToken> {
    try {
      const response = await api.post(`${this.baseUrl}/tokens`, cardData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error creando token de pago:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de validación de tarjetas
   */
  async updateCardValidationConfig(config: CardValidationConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/card-validation`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de validación de tarjetas:', error)
      throw error
    }
  }

  // ====================================================================
  // RECONCILIACIÓN
  // ====================================================================

  /**
   * Ejecuta reconciliación de pagos
   */
  async reconcilePayments(
    reconciliationData: ReconciliationData
  ): Promise<ReconciliationReport> {
    try {
      const response = await api.post(`${this.baseUrl}/reconcile`, reconciliationData)
      return (response.data as any).data
    } catch (error) {
      console.error('Error reconciliando pagos:', error)
      throw error
    }
  }

  /**
   * Obtiene discrepancias de reconciliación
   */
  async getReconciliationDiscrepancies(
    filters: { startDate?: Date; endDate?: Date; resolved?: boolean } = {}
  ): Promise<ReconciliationDiscrepancy[]> {
    try {
      const response = await api.get(`${this.baseUrl}/reconciliation/discrepancies`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo discrepancias de reconciliación:', error)
      throw error
    }
  }

  /**
   * Resuelve una discrepancia de reconciliación
   */
  async resolveReconciliationDiscrepancy(
    discrepancyId: string,
    resolution: any
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/reconciliation/discrepancies/${discrepancyId}/resolve`,
        resolution
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error resolviendo discrepancia de reconciliación:', error)
      throw error
    }
  }

  // ====================================================================
  // GATEWAYS DE PAGO
  // ====================================================================

  /**
   * Obtiene transacciones del gateway
   */
  async getGatewayTransactions(
    gatewayId: string,
    filters: { startDate?: Date; endDate?: Date; status?: string } = {}
  ): Promise<GatewayTransaction[]> {
    try {
      const response = await api.get(`${this.baseUrl}/gateways/${gatewayId}/transactions`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo transacciones del gateway:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de gateway
   */
  async updateGatewayConfig(
    gatewayId: string,
    config: PaymentGatewayConfig
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/gateways/${gatewayId}/config`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de gateway:', error)
      throw error
    }
  }

  /**
   * Prueba conexión con gateway
   */
  async testGatewayConnection(gatewayId: string): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/gateways/${gatewayId}/test`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error probando conexión con gateway:', error)
      throw error
    }
  }

  // ====================================================================
  // CIRCUIT BREAKER Y RETRIES
  // ====================================================================

  /**
   * Obtiene estado del circuit breaker
   */
  async getCircuitBreakerState(gatewayId: string): Promise<CircuitBreakerState> {
    try {
      const response = await api.get(`${this.baseUrl}/gateways/${gatewayId}/circuit-breaker`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estado del circuit breaker:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración del circuit breaker
   */
  async updateCircuitBreakerConfig(
    gatewayId: string,
    config: CircuitBreakerConfig
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.put(
        `${this.baseUrl}/gateways/${gatewayId}/circuit-breaker/config`,
        config
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración del circuit breaker:', error)
      throw error
    }
  }

  /**
   * Obtiene trabajos de reintento pendientes
   */
  async getRetryJobs(
    filters: { gatewayId?: string; status?: string } = {}
  ): Promise<RetryJob[]> {
    try {
      const response = await api.get(`${this.baseUrl}/retry-jobs`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo trabajos de reintento:', error)
      throw error
    }
  }

  /**
   * Reintenta un trabajo fallido
   */
  async retryFailedJob(jobId: string): Promise<AdminOperationResult> {
    try {
      const response = await api.post(`${this.baseUrl}/retry-jobs/${jobId}/retry`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error reintentando trabajo fallido:', error)
      throw error
    }
  }

  // ====================================================================
  // WEBHOOKS
  // ====================================================================

  /**
   * Procesa webhook de pago
   */
  async processPaymentWebhook(
    gatewayId: string,
    webhookData: WebhookPayload
  ): Promise<AdminOperationResult> {
    try {
      const response = await api.post(
        `${this.baseUrl}/gateways/${gatewayId}/webhooks`,
        webhookData
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error procesando webhook de pago:', error)
      throw error
    }
  }

  /**
   * Obtiene eventos de pago
   */
  async getPaymentEvents(
    filters: { transactionId?: string; eventType?: string; startDate?: Date; endDate?: Date } = {}
  ): Promise<PaymentEvent[]> {
    try {
      const response = await api.get(`${this.baseUrl}/events`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo eventos de pago:', error)
      throw error
    }
  }

  // ====================================================================
  // CONVERSIÓN DE MONEDAS
  // ====================================================================

  /**
   * Obtiene tasas de cambio
   */
  async getExchangeRates(): Promise<ExchangeRate[]> {
    try {
      const response = await api.get(`${this.baseUrl}/exchange-rates`)
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo tasas de cambio:', error)
      throw error
    }
  }

  /**
   * Convierte cantidad entre monedas
   */
  async convertCurrency(
    amount: number,
    fromCurrency: PaymentSupportedCurrency,
    toCurrency: PaymentSupportedCurrency
  ): Promise<CurrencyConversion> {
    try {
      const response = await api.post(`${this.baseUrl}/convert-currency`, {
        amount,
        fromCurrency,
        toCurrency,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error convirtiendo moneda:', error)
      throw error
    }
  }

  // ====================================================================
  // REPORTES Y ESTADÍSTICAS
  // ====================================================================

  /**
   * Obtiene estadísticas de pagos
   */
  async getPaymentStats(
    filters: PaymentFilters = {}
  ): Promise<PaymentStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos:', error)
      throw error
    }
  }

  /**
   * Obtiene reporte de ingresos
   */
  async getRevenueReport(
    filters: { startDate?: Date; endDate?: Date; eventId?: number } = {}
  ): Promise<PaymentRevenueReport> {
    try {
      const response = await api.get(`${this.baseUrl}/reports/revenue`, {
        params: filters,
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo reporte de ingresos:', error)
      throw error
    }
  }

  /**
   * Obtiene dashboard de pagos
   */
  async getPaymentDashboard(): Promise<PaymentDashboard> {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard`)
      return (response.data as any).data
    } catch (error) {
      console.error('Error obteniendo dashboard de pagos:', error)
      throw error
    }
  }

  /**
   * Obtiene alertas de pago
   */
  async getPaymentAlerts(
    filters: { acknowledged?: boolean; severity?: string } = {}
  ): Promise<PaymentAlert[]> {
    try {
      const response = await api.get(`${this.baseUrl}/alerts`, {
        params: filters,
      })
      return (response.data as any).data || []
    } catch (error) {
      console.error('Error obteniendo alertas de pago:', error)
      throw error
    }
  }

  // ====================================================================
  // CONFIGURACIÓN GENERAL
  // ====================================================================

  /**
   * Actualiza configuración de rate limiting
   */
  async updateRateLimitConfig(config: PaymentRateLimit): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/rate-limit`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de rate limit:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de reintentos
   */
  async updateRetryConfig(config: RetryConfig): Promise<AdminOperationResult> {
    try {
      const response = await api.put(`${this.baseUrl}/config/retry`, config)
      return (response.data as any).data
    } catch (error) {
      console.error('Error actualizando configuración de reintentos:', error)
      throw error
    }
  }

  // ====================================================================
  // EXPORTACIÓN
  // ====================================================================

  /**
   * Exporta transacciones de pago
   */
  async exportPaymentTransactions(
    format: 'csv' | 'excel' | 'pdf',
    filters?: PaymentFilters
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export/transactions`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando transacciones de pago:', error)
      throw error
    }
  }

  /**
   * Exporta reembolsos
   */
  async exportRefunds(
    format: 'csv' | 'excel' | 'pdf',
    filters?: { startDate?: Date; endDate?: Date; status?: string }
  ): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export/refunds`, {
        params: { format, ...filters },
        responseType: 'blob',
      })
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando reembolsos:', error)
      throw error
    }
  }

  /**
   * Exporta reporte de reconciliación
   */
  async exportReconciliationReport(
    format: 'csv' | 'excel',
    reconciliationId: string
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.baseUrl}/export/reconciliation/${reconciliationId}`,
        {
          params: { format },
          responseType: 'blob',
        }
      )
      return (response.data as any).data
    } catch (error) {
      console.error('Error exportando reporte de reconciliación:', error)
      throw error
    }
  }
}

// Crear instancia singleton
export const adminPaymentService = new AdminPaymentService()