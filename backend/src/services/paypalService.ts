/**
 * @fileoverview Servicio de PayPal para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para integración con PayPal Payments API
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { PayPalConfig, PayPalOrderResponse, PayPalWebhookPayload } from '../types/payment-gateway.types';
import { PaymentInitiationData, PaymentConfirmationData } from '../types/payment.types';
import { PaymentGateway } from '../utils/constants';

/**
 * Servicio para integración con PayPal
 */
export class PayPalService {
  private httpClient: AxiosInstance;
  private config: PayPalConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(config: PayPalConfig) {
    this.config = config;

    this.httpClient = axios.create({
      baseURL: this.getBaseUrl(),
      timeout: 45000, // 45 segundos máximo por transacción
      headers: {
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID()
      }
    });

    // Interceptor para agregar token de acceso
    this.httpClient.interceptors.request.use(async (config) => {
      if (!this.accessToken || this.isTokenExpired()) {
        await this.authenticate();
      }
      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });

    // Interceptor para logging
    this.httpClient.interceptors.response.use(
      (response) => {
        logger.info('PayPal API Response', {
          status: response.status,
          url: response.config.url,
          method: response.config.method?.toUpperCase()
        });
        return response;
      },
      (error) => {
        logger.error('PayPal API Error', {
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          error: error.response?.data || error.message
        });
        throw error;
      }
    );
  }

  /**
   * Obtiene la URL base de PayPal según el entorno
   */
  private getBaseUrl(): string {
    return this.config.environment === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  /**
   * Verifica si el token de acceso ha expirado
   */
  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return true;
    // Renovar 5 minutos antes de expirar
    return new Date() > new Date(this.tokenExpiresAt.getTime() - 5 * 60 * 1000);
  }

  /**
   * Autentica con PayPal y obtiene token de acceso
   */
  private async authenticate(): Promise<void> {
    try {
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

      const response = await axios.post(`${this.getBaseUrl()}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      this.accessToken = response.data.access_token;
      // El token expira en el tiempo especificado por PayPal (generalmente 9 horas)
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in * 1000));

      logger.info('PayPal authentication successful');
    } catch (error) {
      logger.error('PayPal authentication failed', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  /**
   * Inicia una transacción de pago con PayPal
   */
  async initiatePayment(data: PaymentInitiationData): Promise<PayPalOrderResponse> {
    try {
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: data.registrationId.toString(),
            amount: {
              currency_code: data.currency,
              value: data.amount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: data.currency,
                  value: data.amount.toFixed(2)
                }
              }
            },
            description: data.description || `Payment for registration ${data.registrationId}`,
            items: [
              {
                name: data.description || 'Event Registration',
                quantity: '1',
                unit_amount: {
                  currency_code: data.currency,
                  value: data.amount.toFixed(2)
                },
                description: data.description || 'Event registration payment'
              }
            ]
          }
        ],
        application_context: {
          return_url: this.config.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: this.config.cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
          user_action: 'PAY_NOW',
          brand_name: 'TradeConnect'
        }
      };

      const response = await this.httpClient.post('/v2/checkout/orders', orderData);

      logger.info('PayPal order created', {
        orderId: response.data.id,
        registrationId: data.registrationId,
        amount: data.amount
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to create PayPal order', {
        registrationId: data.registrationId,
        amount: data.amount,
        error: error.response?.data || error.message
      });
      throw new Error(`PayPal order creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Confirma una transacción de pago con PayPal
   */
  async confirmPayment(orderId: string): Promise<PayPalOrderResponse> {
    try {
      const response = await this.httpClient.post(`/v2/checkout/orders/${orderId}/capture`);

      logger.info('PayPal payment captured', {
        orderId,
        status: response.data.status
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to capture PayPal payment', {
        orderId,
        error: error.response?.data || error.message
      });
      throw new Error(`PayPal payment capture failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtiene el estado de una orden de PayPal
   */
  async getOrderStatus(orderId: string): Promise<PayPalOrderResponse> {
    try {
      const response = await this.httpClient.get(`/v2/checkout/orders/${orderId}`);

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get PayPal order status', {
        orderId,
        error: error.response?.data || error.message
      });
      throw new Error(`PayPal order status retrieval failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Procesa un reembolso con PayPal
   */
  async processRefund(captureId: string, amount: number, reason?: string) {
    try {
      const refundData = {
        amount: {
          value: amount.toFixed(2),
          currency_code: 'USD' // PayPal usa USD para reembolsos
        },
        reason: reason || 'Customer requested refund'
      };

      const response = await this.httpClient.post(`/v2/payments/captures/${captureId}/refund`, refundData);

      logger.info('PayPal refund processed', {
        captureId,
        refundId: response.data.id,
        amount
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to process PayPal refund', {
        captureId,
        amount,
        error: error.response?.data || error.message
      });
      throw new Error(`PayPal refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Valida la firma de un webhook de PayPal
   */
  async validateWebhookSignature(payload: string, signature: string, webhookId: string): Promise<boolean> {
    try {
      const verificationData = {
        auth_algo: 'SHA256withRSA',
        cert_url: signature.split(',')[0].split('=')[1],
        transmission_id: signature.split(',')[1].split('=')[1],
        transmission_sig: signature.split(',')[2].split('=')[1],
        transmission_time: signature.split(',')[3].split('=')[1],
        webhook_id: webhookId,
        webhook_event: payload
      };

      const response = await this.httpClient.post('/v1/notifications/verify-webhook-signature', verificationData);

      return response.data.verification_status === 'SUCCESS';
    } catch (error: any) {
      logger.error('PayPal webhook signature validation failed', {
        error: error.response?.data || error.message
      });
      return false;
    }
  }

  /**
   * Procesa un webhook de PayPal
   */
  processWebhook(payload: PayPalWebhookPayload): {
    eventType: string;
    transactionId?: string;
    status?: string;
    amount?: number;
    currency?: string;
  } {
    const eventType = payload.event_type;
    let transactionId: string | undefined;
    let status: string | undefined;
    let amount: number | undefined;
    let currency: string | undefined;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        transactionId = payload.resource.id;
        status = 'completed';
        amount = parseFloat(payload.resource.amount.value);
        currency = payload.resource.amount.currency_code;
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        transactionId = payload.resource.id;
        status = 'failed';
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        transactionId = payload.resource.id;
        status = 'refunded';
        break;

      default:
        logger.info('Unhandled PayPal webhook event', { eventType });
    }

    return {
      eventType,
      transactionId,
      status,
      amount,
      currency
    };
  }

  /**
   * Verifica la salud del servicio de PayPal
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number; error?: string }> {
    const startTime = Date.now();

    try {
      await this.authenticate();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        responseTime,
        error: error.message
      };
    }
  }

  /**
   * Obtiene métricas de rendimiento
   */
  getMetrics(): {
    gateway: PaymentGateway;
    status: 'operational' | 'degraded' | 'down';
    lastHealthCheck: Date | null;
    responseTime: number | null;
  } {
    // En una implementación real, esto debería mantener métricas en memoria o Redis
    return {
      gateway: 'paypal',
      status: 'operational', // Esto debería calcularse basado en health checks recientes
      lastHealthCheck: null,
      responseTime: null
    };
  }
}

/**
 * Instancia singleton del servicio de PayPal
 */
let paypalServiceInstance: PayPalService | null = null;

/**
 * Factory para obtener instancia del servicio de PayPal
 */
export function getPayPalService(): PayPalService {
  if (!paypalServiceInstance) {
    const config: PayPalConfig = {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      environment: (process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
      webhookId: process.env.PAYPAL_WEBHOOK_ID,
      returnUrl: process.env.PAYPAL_RETURN_URL,
      cancelUrl: process.env.PAYPAL_CANCEL_URL
    };

    // Solo requerir credenciales si no estamos usando mocks
    const useMocks = process.env.USE_PAYMENT_MOCKS === 'true' || process.env.NODE_ENV === 'test';

    if (!useMocks && (!config.clientId || !config.clientSecret)) {
      throw new Error('PayPal credentials not configured. Set USE_PAYMENT_MOCKS=true for development.');
    }

    paypalServiceInstance = new PayPalService(config);
  }

  return paypalServiceInstance;
}

/**
 * Instancia lazy-loaded del servicio de PayPal
 * Solo se crea cuando se necesita por primera vez
 */
export const paypalService = (() => {
  // No inicializar inmediatamente, solo cuando se use
  let _paypalService: PayPalService | null = null;

  return new Proxy({} as PayPalService, {
    get(target, prop) {
      if (!_paypalService) {
        _paypalService = getPayPalService();
      }
      const value = (_paypalService as any)[prop];
      return typeof value === 'function' ? value.bind(_paypalService) : value;
    }
  });
})();