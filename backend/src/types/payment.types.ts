/**
 * @fileoverview Tipos TypeScript para el módulo de pagos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Interfaces y tipos para transacciones de pago, reembolsos y reconciliación
 */

import { PaymentStatus, PaymentGateway, PaymentType } from '../utils/constants';

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

/**
 * Filtros para búsqueda de transacciones
 */
export interface PaymentFilters {
  gateway?: PaymentGateway;
  status?: PaymentStatus;
  registrationId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

/**
 * Estadísticas de pagos
 */
export interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  successRate: number;
  averageProcessingTime: number;
  byGateway: Record<PaymentGateway, {
    transactions: number;
    amount: number;
    successRate: number;
  }>;
  byStatus: Record<PaymentStatus, number>;
  byCurrency: Record<string, number>;
}

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

/**
 * Configuración de rate limiting para pagos
 */
export interface PaymentRateLimit {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

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