/**
 * @fileoverview Tipos específicos para pasarelas de pago
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Interfaces específicas para PayPal, Stripe, NeoNet y BAM
 */

import { PaymentGateway } from '../utils/constants';

/**
 * Configuración específica de PayPal
 */
export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'live';
  webhookId?: string;
  merchantId?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

/**
 * Respuesta de PayPal para crear orden
 */
export interface PayPalOrderResponse {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED';
  links: Array<{
    href: string;
    rel: 'self' | 'approve' | 'update' | 'capture';
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  }>;
  create_time: string;
  update_time: string;
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total?: { currency_code: string; value: string };
        shipping?: { currency_code: string; value: string };
        tax_total?: { currency_code: string; value: string };
        discount?: { currency_code: string; value: string };
      };
    };
    payee?: {
      email_address?: string;
      merchant_id?: string;
    };
    items?: Array<{
      name: string;
      quantity: string;
      unit_amount: { currency_code: string; value: string };
      tax?: { currency_code: string; value: string };
      description?: string;
    }>;
  }>;
}

/**
 * Webhook de PayPal
 */
export interface PayPalWebhookPayload {
  id: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: {
    id: string;
    amount: { currency_code: string; value: string };
    seller_protection?: { status: string };
    status: string;
    create_time: string;
    update_time: string;
    links: Array<{ href: string; rel: string; method: string }>;
  };
  links: Array<{ href: string; rel: string; method: string }>;
}

/**
 * Configuración específica de Stripe
 */
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  accountId?: string;
}

/**
 * Respuesta de Stripe para Payment Intent
 */
export interface StripePaymentIntentResponse {
  id: string;
  object: 'payment_intent';
  amount: number;
  amount_capturable: number;
  amount_received: number;
  application?: string;
  application_fee_amount?: number;
  automatic_payment_methods?: {
    enabled: boolean;
  };
  canceled_at?: number;
  cancellation_reason?: string;
  capture_method: 'automatic' | 'manual';
  client_secret: string;
  confirmation_method: 'automatic' | 'manual';
  created: number;
  currency: string;
  customer?: string;
  description?: string;
  invoice?: string;
  last_payment_error?: {
    code: string;
    message: string;
    type: string;
  };
  livemode: boolean;
  metadata: Record<string, string>;
  next_action?: any;
  on_behalf_of?: string;
  payment_method?: string;
  payment_method_options?: any;
  payment_method_types: string[];
  processing?: any;
  receipt_email?: string;
  review?: string;
  setup_future_usage?: 'off_session' | 'on_session';
  shipping?: any;
  source?: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  transfer_data?: any;
  transfer_group?: string;
}

/**
 * Webhook de Stripe
 */
export interface StripeWebhookPayload {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  data: {
    object: StripePaymentIntentResponse | any;
    previous_attributes?: any;
  };
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key?: string;
  };
  type: string;
}

/**
 * Configuración específica de NeoNet
 */
export interface NeoNetConfig {
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  terminalId?: string;
  environment: 'sandbox' | 'production';
  callbackUrl?: string;
  returnUrl?: string;
}

/**
 * Respuesta de NeoNet para transacción
 */
export interface NeoNetTransactionResponse {
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled' | 'expired';
  authorizationCode?: string;
  responseCode: string;
  responseMessage: string;
  timestamp: string;
  cardInfo?: {
    lastFour: string;
    brand: string;
    type: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Webhook de NeoNet
 */
export interface NeoNetWebhookPayload {
  eventType: string;
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  signature: string;
  data: Record<string, any>;
}

/**
 * Configuración específica de BAM
 */
export interface BAMConfig {
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  terminalId?: string;
  environment: 'sandbox' | 'production';
  callbackUrl?: string;
  returnUrl?: string;
}

/**
 * Respuesta de BAM para transacción
 */
export interface BAMTransactionResponse {
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'declined' | 'cancelled' | 'expired';
  authorizationCode?: string;
  responseCode: string;
  responseMessage: string;
  timestamp: string;
  cardInfo?: {
    lastFour: string;
    brand: string;
    type: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Webhook de BAM
 */
export interface BAMWebhookPayload {
  eventType: string;
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  signature: string;
  data: Record<string, any>;
}

/**
 * Unión de configuraciones de pasarelas
 */
export type GatewayConfig =
  | PayPalConfig
  | StripeConfig
  | NeoNetConfig
  | BAMConfig;

/**
 * Unión de respuestas de transacciones
 */
export type GatewayTransactionResponse =
  | PayPalOrderResponse
  | StripePaymentIntentResponse
  | NeoNetTransactionResponse
  | BAMTransactionResponse;

/**
 * Unión de payloads de webhooks
 */
export type GatewayWebhookPayload =
  | PayPalWebhookPayload
  | StripeWebhookPayload
  | NeoNetWebhookPayload
  | BAMWebhookPayload;

/**
 * Mapeo de tipos por pasarela
 */
export interface GatewayTypeMap {
  paypal: {
    config: PayPalConfig;
    response: PayPalOrderResponse;
    webhook: PayPalWebhookPayload;
  };
  stripe: {
    config: StripeConfig;
    response: StripePaymentIntentResponse;
    webhook: StripeWebhookPayload;
  };
  neonet: {
    config: NeoNetConfig;
    response: NeoNetTransactionResponse;
    webhook: NeoNetWebhookPayload;
  };
  bam: {
    config: BAMConfig;
    response: BAMTransactionResponse;
    webhook: BAMWebhookPayload;
  };
}

/**
 * Configuración de mock para desarrollo
 */
export interface GatewayMockConfig {
  enabled: boolean;
  successRate: number; // 0-1
  latency: {
    min: number; // ms
    max: number; // ms
  };
  responses: {
    success: GatewayTransactionResponse;
    failure: GatewayTransactionResponse;
    error: GatewayTransactionResponse;
  };
}

/**
 * Estado de conexión de pasarela
 */
export interface GatewayHealthStatus {
  gateway: PaymentGateway;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}

/**
 * Métricas de rendimiento de pasarela
 */
export interface GatewayMetrics {
  gateway: PaymentGateway;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptimePercentage: number;
  last24Hours: {
    requests: number;
    successRate: number;
    averageResponseTime: number;
  };
}