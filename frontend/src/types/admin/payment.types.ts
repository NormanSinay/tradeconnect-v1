/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Pagos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para transacciones de pago, reembolsos y reconciliación en el panel administrativo
 */

// ====================================================================
// TIPOS BASE DE PAGOS
// ====================================================================

/**
 * Información de facturación para pagos
 */
export interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nit?: string;
  cui?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Información de método de pago
 */
export interface PaymentMethodInfo {
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'paypal' | 'other';
  cardLastFour?: string;
  cardBrand?: string;
  bankName?: string;
  accountNumber?: string;
  token?: string; // Token de tokenización
}

/**
 * Estados de pago
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

/**
 * Tipos de pago
 */
export type PaymentType = 'registration' | 'addon' | 'upgrade' | 'refund';

/**
 * Métodos de pago soportados
 */
export type PaymentMethod = 'bank_transfer' | 'check' | 'cash' | 'paypal' | 'other';

/**
 * Pasarelas de pago disponibles
 */
export type PaymentGateway = 'stripe' | 'paypal' | 'bank_transfer' | 'cash' | 'other';

// ====================================================================
// INTERFACES DE DATOS DE ENTRADA
// ====================================================================

/**
 * Datos para iniciar una transacción de pago
 */
export interface PaymentInitiationData {
  registrationId: number;
  gateway: PaymentGateway;
  paymentType: PaymentType;
  amount: number;
  currency: 'GTQ' | 'USD';
  description?: string;
  billingInfo: BillingInfo;
  paymentMethod?: PaymentMethodInfo;
  metadata?: Record<string, any>;
}

/**
 * Respuesta de iniciación de pago
 */
export interface PaymentInitiationResponse {
  transactionId: string;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  paymentUrl?: string; // Para pagos que requieren redirección
  expiresAt?: Date;
  createdAt: Date;
}

/**
 * Datos de confirmación de pago
 */
export interface PaymentConfirmationData {
  transactionId: string;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  gatewayResponse?: any;
  metadata?: Record<string, any>;
}

// ====================================================================
// INTERFACES DE TRANSACCIONES
// ====================================================================

/**
 * Información completa de una transacción
 */
export interface PaymentTransaction {
  id: string;
  registrationId: number;
  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  description?: string;
  billingInfo: BillingInfo;
  paymentMethod?: PaymentMethodInfo;
  gatewayResponse?: any;
  metadata?: Record<string, any>;
  retryCount: number;
  lastRetryAt?: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para procesar un reembolso
 */
export interface RefundData {
  transactionId: string;
  amount: number;
  reason: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Información de un reembolso
 */
export interface RefundInfo {
  id: string;
  transactionId: string;
  gatewayRefundId?: string;
  amount: number;
  fee: number;
  netAmount: number;
  reason: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gatewayResponse?: any;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// INTERFACES DE CONFIGURACIÓN
// ====================================================================

/**
 * Configuración de una pasarela de pago
 */
export interface PaymentGatewayConfig {
  id: number;
  gateway: PaymentGateway;
  name: string;
  isActive: boolean;
  isSandbox: boolean;
  apiKey?: string; // Encriptado
  apiSecret?: string; // Encriptado
  merchantId?: string; // Encriptado
  webhookUrl?: string;
  webhookSecret?: string; // Encriptado
  supportedCurrencies: string[];
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  feeFixed: number;
  testMode: boolean;
  config: Record<string, any>; // Configuración adicional específica de la pasarela
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// INTERFACES DE RECONCILIACIÓN
// ====================================================================

/**
 * Datos de reconciliación
 */
export interface ReconciliationData {
  gateway: PaymentGateway;
  startDate: Date;
  endDate: Date;
  gatewayTransactions: GatewayTransaction[];
  localTransactions: PaymentTransaction[];
  discrepancies: ReconciliationDiscrepancy[];
}

/**
 * Transacción de pasarela externa
 */
export interface GatewayTransaction {
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Discrepancia encontrada en reconciliación
 */
export interface ReconciliationDiscrepancy {
  type: 'missing_local' | 'missing_gateway' | 'amount_mismatch' | 'status_mismatch';
  gatewayTransactionId?: string;
  localTransactionId?: string;
  gatewayAmount?: number;
  localAmount?: number;
  gatewayStatus?: string;
  localStatus?: string;
  description: string;
}

/**
 * Reporte de reconciliación
 */
export interface ReconciliationReport {
  id: string;
  gateway: PaymentGateway;
  startDate: Date;
  endDate: Date;
  totalGatewayTransactions: number;
  totalLocalTransactions: number;
  totalDiscrepancies: number;
  discrepancies: ReconciliationDiscrepancy[];
  status: 'completed' | 'failed';
  generatedAt: Date;
}

// ====================================================================
// INTERFACES DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de transacciones
 */
export interface PaymentFilters {
  gateway?: PaymentGateway;
  status?: PaymentStatus[];
  registrationId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

/**
 * Filtros para búsqueda de transacciones (versión alternativa para evitar conflictos)
 */
export interface PaymentGatewayFilters {
  gateway?: PaymentGateway;
  status?: PaymentStatus[];
  registrationId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

/**
 * Parámetros de consulta para pagos
 */
export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'status' | 'confirmedAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: PaymentFilters;
}

/**
 * Resultado de búsqueda de pagos
 */
export interface PaymentSearchResult {
  transactions: PaymentTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: PaymentFilters;
}

// ====================================================================
// INTERFACES DE ESTADÍSTICAS
// ====================================================================

/**
 * Estadísticas de pagos
 */
export interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  successRate: number;
  averageProcessingTime: number;
  totalFeesPaid: number;
  byGateway: Record<PaymentGateway, {
    transactions: number;
    amount: number;
    successRate: number;
  }>;
  byStatus: Record<PaymentStatus, number>;
  byCurrency: Record<string, number>;
}

/**
 * Reporte de ingresos
 */
export interface RevenueReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  revenueByPaymentMethod: Record<string, number>;
  revenueByEvent: Array<{
    eventId: number;
    eventTitle: string;
    revenue: number;
    transactions: number;
  }>;
  trends: {
    daily: Array<{ date: string; revenue: number; transactions: number }>;
    weekly: Array<{ week: string; revenue: number; transactions: number }>;
    monthly: Array<{ month: string; revenue: number; transactions: number }>;
  };
}

// ====================================================================
// INTERFACES DE VALIDACIÓN
// ====================================================================

/**
 * Configuración de validación de tarjeta
 */
export interface CardValidationConfig {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvv?: string; // No almacenar
  holderName: string;
}

/**
 * Resultado de validación de tarjeta
 */
export interface CardValidationResult {
  isValid: boolean;
  cardBrand?: string;
  isLuhnValid: boolean;
  isExpiryValid: boolean;
  errors: string[];
}

/**
 * Token de pago para PCI DSS
 */
export interface PaymentToken {
  token: string;
  gateway: PaymentGateway;
  gatewayTokenId: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// INTERFACES DE CIRCUIT BREAKER Y RETRY
// ====================================================================

/**
 * Configuración de circuit breaker
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

/**
 * Estado del circuit breaker
 */
export interface CircuitBreakerState {
  gateway: PaymentGateway;
  state: 'closed' | 'open' | 'half_open';
  failures: number;
  lastFailureAt?: Date;
  nextAttemptAt?: Date;
}

/**
 * Configuración de retry
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Trabajo de retry pendiente
 */
export interface RetryJob {
  id: string;
  transactionId: string;
  attempt: number;
  nextAttemptAt: Date;
  lastError?: string;
  createdAt: Date;
}

// ====================================================================
// INTERFACES DE WEBHOOKS
// ====================================================================

/**
 * Payload de webhook
 */
export interface WebhookPayload {
  gateway: PaymentGateway;
  eventType: string;
  transactionId?: string;
  gatewayTransactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  rawPayload: any;
  signature?: string;
  headers?: Record<string, string>;
}

// ====================================================================
// INTERFACES DE EVENTOS E INTEGRACIÓN
// ====================================================================

/**
 * Evento de pago para integración con otros módulos
 */
export interface PaymentEvent {
  type: 'payment.initiated' | 'payment.completed' | 'payment.failed' | 'payment.refunded' | 'payment.cancelled';
  transactionId: string;
  registrationId?: number;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ====================================================================
// INTERFACES DE RATE LIMITING
// ====================================================================

/**
 * Configuración de rate limiting para pagos
 */
export interface PaymentRateLimit {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// ====================================================================
// INTERFACES DE REPORTES Y DASHBOARD
// ====================================================================

/**
 * Reporte de transacciones
 */
export interface PaymentReport {
  filters: PaymentFilters;
  summary: PaymentStats;
  transactions: PaymentTransaction[];
  generatedAt: Date;
  format: 'json' | 'csv' | 'excel' | 'pdf';
}

/**
 * Dashboard de pagos
 */
export interface PaymentDashboard {
  todayStats: PaymentStats;
  weekStats: PaymentStats;
  monthStats: PaymentStats;
  recentTransactions: PaymentTransaction[];
  gatewayStatus: Record<PaymentGateway, {
    status: 'operational' | 'degraded' | 'down';
    lastCheck: Date;
    responseTime?: number;
  }>;
  alerts: PaymentAlert[];
}

/**
 * Alerta de pago
 */
export interface PaymentAlert {
  id: string;
  type: 'high_failure_rate' | 'gateway_down' | 'reconciliation_discrepancy' | 'manual_review_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  gateway?: PaymentGateway;
  transactionId?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// ====================================================================
// MONEDAS Y CONVERSIONES
// ====================================================================

/**
 * Monedas soportadas
 */
export type SupportedCurrency = 'GTQ' | 'USD';

/**
 * Tasa de cambio
 */
export interface ExchangeRate {
  from: SupportedCurrency;
  to: SupportedCurrency;
  rate: number;
  lastUpdated: Date;
  source: string;
}

/**
 * Conversión de moneda
 */
export interface CurrencyConversion {
  amount: number;
  from: SupportedCurrency;
  to: SupportedCurrency;
  rate: number;
  convertedAmount: number;
  fee?: number;
  finalAmount: number;
}