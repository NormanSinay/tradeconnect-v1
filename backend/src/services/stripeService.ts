/**
 * @fileoverview Servicio de Stripe para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para integración con Stripe Payments API
 */

import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { StripeConfig, StripePaymentIntentResponse, StripeWebhookPayload } from '../types/payment-gateway.types';
import { PaymentInitiationData, PaymentConfirmationData } from '../types/payment.types';
import { PaymentGateway } from '../utils/constants';

/**
 * Servicio para integración con Stripe
 */
export class StripeService {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2025-09-30.clover',
      timeout: 45000, // 45 segundos máximo por transacción
      maxNetworkRetries: 3
    });
  }

  /**
   * Inicia una transacción de pago con Stripe
   */
  async initiatePayment(data: PaymentInitiationData): Promise<StripePaymentIntentResponse> {
    try {
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(data.amount * 100), // Stripe usa centavos
        currency: data.currency.toLowerCase(),
        description: data.description || `Payment for registration ${data.registrationId}`,
        metadata: {
          registrationId: data.registrationId.toString(),
          userId: data.billingInfo.email
        },
        automatic_payment_methods: {
          enabled: true
        },
        receipt_email: data.billingInfo.email
      };

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentData);

      logger.info('Stripe payment intent created', {
        paymentIntentId: paymentIntent.id,
        registrationId: data.registrationId,
        amount: data.amount
      });

      return paymentIntent as StripePaymentIntentResponse;
    } catch (error: any) {
      logger.error('Failed to create Stripe payment intent', {
        registrationId: data.registrationId,
        amount: data.amount,
        error: error.message
      });
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }

  /**
   * Confirma una transacción de pago con Stripe
   */
  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<StripePaymentIntentResponse> {
    try {
      const confirmParams: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, confirmParams);

      logger.info('Stripe payment confirmed', {
        paymentIntentId,
        status: paymentIntent.status
      });

      return paymentIntent as StripePaymentIntentResponse;
    } catch (error: any) {
      logger.error('Failed to confirm Stripe payment', {
        paymentIntentId,
        error: error.message
      });
      throw new Error(`Stripe payment confirmation failed: ${error.message}`);
    }
  }

  /**
   * Obtiene el estado de un Payment Intent de Stripe
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<StripePaymentIntentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return paymentIntent as StripePaymentIntentResponse;
    } catch (error: any) {
      logger.error('Failed to get Stripe payment intent status', {
        paymentIntentId,
        error: error.message
      });
      throw new Error(`Stripe payment intent retrieval failed: ${error.message}`);
    }
  }

  /**
   * Procesa un reembolso con Stripe
   */
  async processRefund(paymentIntentId: string, amount: number, reason?: string) {
    try {
      // Primero obtener el payment intent para encontrar el charge
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // En Stripe moderno, usar latest_charge si existe
      const chargeId = paymentIntent.latest_charge as string;
      if (!chargeId) {
        throw new Error('No charge found for payment intent');
      }

      const refundParams: Stripe.RefundCreateParams = {
        charge: chargeId,
        amount: Math.round(amount * 100), // Stripe usa centavos
        reason: this.mapRefundReason(reason),
        metadata: {
          originalPaymentIntent: paymentIntentId
        }
      };

      const refund = await this.stripe.refunds.create(refundParams);

      logger.info('Stripe refund processed', {
        paymentIntentId,
        refundId: refund.id,
        amount
      });

      return refund;
    } catch (error: any) {
      logger.error('Failed to process Stripe refund', {
        paymentIntentId,
        amount,
        error: error.message
      });
      throw new Error(`Stripe refund failed: ${error.message}`);
    }
  }

  /**
   * Mapea razones de reembolso de nuestro sistema a Stripe
   */
  private mapRefundReason(reason?: string): Stripe.RefundCreateParams.Reason {
    switch (reason?.toLowerCase()) {
      case 'duplicate':
        return 'duplicate';
      case 'fraudulent':
        return 'fraudulent';
      case 'requested_by_customer':
        return 'requested_by_customer';
      default:
        return 'requested_by_customer';
    }
  }

  /**
   * Valida la firma de un webhook de Stripe
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const stripe = new Stripe(this.config.secretKey);
      stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
      return true;
    } catch (error) {
      logger.error('Stripe webhook signature validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Procesa un webhook de Stripe
   */
  processWebhook(payload: StripeWebhookPayload): {
    eventType: string;
    transactionId?: string;
    status?: string;
    amount?: number;
    currency?: string;
  } {
    const eventType = payload.type;
    let transactionId: string | undefined;
    let status: string | undefined;
    let amount: number | undefined;
    let currency: string | undefined;

    switch (eventType) {
      case 'payment_intent.succeeded':
        transactionId = payload.data.object.id;
        status = 'completed';
        amount = (payload.data.object as StripePaymentIntentResponse).amount / 100; // Convertir de centavos
        currency = (payload.data.object as StripePaymentIntentResponse).currency;
        break;

      case 'payment_intent.payment_failed':
        transactionId = payload.data.object.id;
        status = 'failed';
        break;

      case 'charge.dispute.created':
        transactionId = payload.data.object.payment_intent as string;
        status = 'disputed';
        break;

      default:
        logger.info('Unhandled Stripe webhook event', { eventType });
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
   * Tokeniza un método de pago para uso futuro
   */
  async createPaymentMethod(paymentMethodData: any) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: paymentMethodData.number,
          exp_month: paymentMethodData.expMonth,
          exp_year: paymentMethodData.expYear,
          cvc: paymentMethodData.cvc
        }
      });

      return paymentMethod;
    } catch (error: any) {
      logger.error('Failed to create Stripe payment method', {
        error: error.message
      });
      throw new Error(`Stripe payment method creation failed: ${error.message}`);
    }
  }

  /**
   * Verifica la salud del servicio de Stripe
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number; error?: string }> {
    const startTime = Date.now();

    try {
      // Intentar una operación simple para verificar conectividad
      await this.stripe.balance.retrieve();
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
      gateway: 'stripe',
      status: 'operational',
      lastHealthCheck: null,
      responseTime: null
    };
  }
}

/**
 * Instancia singleton del servicio de Stripe
 */
let stripeServiceInstance: StripeService | null = null;

/**
 * Factory para obtener instancia del servicio de Stripe
 */
export function getStripeService(): StripeService {
  if (!stripeServiceInstance) {
    const config: StripeConfig = {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    };

    // Solo requerir credenciales si no estamos usando mocks
    const useMocks = process.env.USE_PAYMENT_MOCKS === 'true' || process.env.NODE_ENV === 'test';

    if (!useMocks && (!config.secretKey || !config.webhookSecret)) {
      throw new Error('Stripe credentials not configured. Set USE_PAYMENT_MOCKS=true for development.');
    }

    stripeServiceInstance = new StripeService(config);
  }

  return stripeServiceInstance;
}

/**
 * Instancia lazy-loaded del servicio de Stripe
 * Solo se crea cuando se necesita por primera vez
 */
export const stripeService = (() => {
  // No inicializar inmediatamente, solo cuando se use
  let _stripeService: StripeService | null = null;

  return new Proxy({} as StripeService, {
    get(target, prop) {
      if (!_stripeService) {
        _stripeService = getStripeService();
      }
      const value = (_stripeService as any)[prop];
      return typeof value === 'function' ? value.bind(_stripeService) : value;
    }
  });
})();
