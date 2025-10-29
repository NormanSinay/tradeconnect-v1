/**
 * @fileoverview Servicio de BAM para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para integración con BAM Pagos Guatemala
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { BAMConfig, BAMTransactionResponse, BAMWebhookPayload } from '../types/payment-gateway.types';
import { PaymentInitiationData, PaymentConfirmationData } from '../types/payment.types';
import { PaymentGateway } from '../utils/constants';

/**
 * Servicio para integración con BAM
 */
export class BAMService {
  private httpClient!: AxiosInstance;
  private config: BAMConfig;
  private isMockMode: boolean;

  constructor(config: BAMConfig) {
    this.config = config;
    this.isMockMode = process.env.NODE_ENV === 'development' || process.env.BAM_MOCK === 'true';

    if (!this.isMockMode) {
      this.httpClient = axios.create({
        baseURL: this.getBaseUrl(),
        timeout: 45000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.generateAuthToken()}`
        }
      });

      // Interceptor para logging
      this.httpClient.interceptors.response.use(
        (response) => {
          logger.info('BAM API Response', {
            status: response.status,
            url: response.config.url
          });
          return response;
        },
        (error) => {
          logger.error('BAM API Error', {
            status: error.response?.status,
            url: error.config?.url,
            error: error.response?.data || error.message
          });
          throw error;
        }
      );
    }
  }

  /**
   * Obtiene la URL base de BAM según el entorno
   */
  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.bam.com.gt'
      : 'https://sandbox.bam.com.gt';
  }

  /**
   * Genera token de autenticación para BAM
   */
  private generateAuthToken(): string {
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(`${this.config.apiKey}${timestamp}`)
      .digest('hex');

    return `${this.config.apiKey}:${timestamp}:${signature}`;
  }

  /**
   * Inicia una transacción de pago con BAM
   */
  async initiatePayment(data: PaymentInitiationData): Promise<BAMTransactionResponse> {
    if (this.isMockMode) {
      return this.mockInitiatePayment(data);
    }

    try {
      const transactionData = {
        merchantId: this.config.merchantId,
        amount: data.amount,
        currency: data.currency,
        description: data.description || `Payment for registration ${data.registrationId}`,
        reference: `TC-${data.registrationId}-${Date.now()}`,
        customer: {
          name: `${data.billingInfo.firstName} ${data.billingInfo.lastName}`,
          email: data.billingInfo.email,
          phone: data.billingInfo.phone
        },
        returnUrl: this.config.returnUrl,
        callbackUrl: this.config.callbackUrl
      };

      const response = await this.httpClient.post('/api/v1/transactions/initiate', transactionData);

      logger.info('BAM transaction initiated', {
        reference: transactionData.reference,
        registrationId: data.registrationId,
        amount: data.amount
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to initiate BAM transaction', {
        registrationId: data.registrationId,
        error: error.response?.data || error.message
      });
      throw new Error(`BAM transaction initiation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para iniciar pago en modo desarrollo
   */
  private mockInitiatePayment(data: PaymentInitiationData): BAMTransactionResponse {
    const successRate = parseFloat(process.env.BAM_MOCK_SUCCESS_RATE || '0.9');
    const shouldSucceed = Math.random() < successRate;

    const response: BAMTransactionResponse = {
      transactionId: `bam_${crypto.randomUUID()}`,
      reference: `TC-${data.registrationId}-${Date.now()}`,
      amount: data.amount,
      currency: data.currency,
      status: shouldSucceed ? 'pending' : 'declined',
      authorizationCode: shouldSucceed ? `AUTH${Math.random().toString().substr(2, 6)}` : undefined,
      responseCode: shouldSucceed ? '00' : '05',
      responseMessage: shouldSucceed ? 'Transaction approved' : 'Transaction declined',
      timestamp: new Date().toISOString(),
      cardInfo: shouldSucceed ? {
        lastFour: '4242',
        brand: 'visa',
        type: 'credit'
      } : undefined
    };

    logger.info('BAM mock transaction initiated', {
      reference: response.reference,
      status: response.status,
      isMock: true
    });

    return response;
  }

  /**
   * Confirma una transacción de pago con BAM
   */
  async confirmPayment(transactionId: string): Promise<BAMTransactionResponse> {
    if (this.isMockMode) {
      return this.mockConfirmPayment(transactionId);
    }

    try {
      const response = await this.httpClient.post(`/api/v1/transactions/${transactionId}/confirm`);

      logger.info('BAM payment confirmed', {
        transactionId,
        status: response.data.status
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to confirm BAM payment', {
        transactionId,
        error: error.response?.data || error.message
      });
      throw new Error(`BAM payment confirmation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para confirmar pago en modo desarrollo
   */
  private mockConfirmPayment(transactionId: string): BAMTransactionResponse {
    const successRate = parseFloat(process.env.BAM_MOCK_SUCCESS_RATE || '0.95');
    const shouldSucceed = Math.random() < successRate;

    const response: BAMTransactionResponse = {
      transactionId,
      reference: `REF_${transactionId}`,
      amount: 100.00, // En mock real se debería obtener de la DB
      currency: 'GTQ',
      status: shouldSucceed ? 'approved' : 'declined',
      authorizationCode: shouldSucceed ? `AUTH${Math.random().toString().substr(2, 6)}` : undefined,
      responseCode: shouldSucceed ? '00' : '05',
      responseMessage: shouldSucceed ? 'Payment approved' : 'Payment declined',
      timestamp: new Date().toISOString(),
      cardInfo: shouldSucceed ? {
        lastFour: '4242',
        brand: 'visa',
        type: 'credit'
      } : undefined
    };

    logger.info('BAM mock payment confirmed', {
      transactionId,
      status: response.status,
      isMock: true
    });

    return response;
  }

  /**
   * Obtiene el estado de una transacción de BAM
   */
  async getTransactionStatus(transactionId: string): Promise<BAMTransactionResponse> {
    if (this.isMockMode) {
      return this.mockGetTransactionStatus(transactionId);
    }

    try {
      const response = await this.httpClient.get(`/api/v1/transactions/${transactionId}/status`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get BAM transaction status', {
        transactionId,
        error: error.response?.data || error.message
      });
      throw new Error(`BAM transaction status retrieval failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para obtener estado de transacción
   */
  private mockGetTransactionStatus(transactionId: string): BAMTransactionResponse {
    return {
      transactionId,
      reference: `REF_${transactionId}`,
      amount: 100.00,
      currency: 'GTQ',
      status: 'approved',
      authorizationCode: `AUTH${Math.random().toString().substr(2, 6)}`,
      responseCode: '00',
      responseMessage: 'Transaction approved',
      timestamp: new Date().toISOString(),
      cardInfo: {
        lastFour: '4242',
        brand: 'visa',
        type: 'credit'
      }
    };
  }

  /**
   * Procesa un reembolso con BAM
   */
  async processRefund(transactionId: string, amount: number, reason?: string) {
    if (this.isMockMode) {
      return this.mockProcessRefund(transactionId, amount, reason);
    }

    try {
      const refundData = {
        amount,
        reason: reason || 'Customer requested refund'
      };

      const response = await this.httpClient.post(`/api/v1/transactions/${transactionId}/refund`, refundData);

      logger.info('BAM refund processed', {
        transactionId,
        refundId: response.data.refundId,
        amount
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to process BAM refund', {
        transactionId,
        amount,
        error: error.response?.data || error.message
      });
      throw new Error(`BAM refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para procesar reembolso
   */
  private mockProcessRefund(transactionId: string, amount: number, reason?: string) {
    const successRate = parseFloat(process.env.BAM_MOCK_SUCCESS_RATE || '0.98');
    const shouldSucceed = Math.random() < successRate;

    const response = {
      refundId: `refund_bam_${crypto.randomUUID()}`,
      transactionId,
      amount,
      status: shouldSucceed ? 'completed' : 'failed',
      reason: reason || 'Customer requested refund',
      processedAt: new Date().toISOString()
    };

    logger.info('BAM mock refund processed', {
      transactionId,
      refundId: response.refundId,
      status: response.status,
      isMock: true
    });

    return response;
  }

  /**
   * Procesa un webhook de BAM
   */
  processWebhook(payload: BAMWebhookPayload): {
    eventType: string;
    transactionId?: string;
    status?: string;
    amount?: number;
    currency?: string;
  } {
    const eventType = payload.eventType;
    let transactionId: string | undefined;
    let status: string | undefined;
    let amount: number | undefined;
    let currency: string | undefined;

    switch (eventType) {
      case 'transaction.approved':
        transactionId = payload.transactionId;
        status = 'completed';
        amount = payload.amount;
        currency = payload.currency;
        break;

      case 'transaction.declined':
        transactionId = payload.transactionId;
        status = 'failed';
        break;

      case 'transaction.expired':
        transactionId = payload.transactionId;
        status = 'expired';
        break;

      default:
        logger.info('Unhandled BAM webhook event', { eventType });
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
   * Verifica la salud del servicio de BAM
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number; error?: string }> {
    const startTime = Date.now();

    try {
      if (this.isMockMode) {
        // Simular latencia de red
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        return {
          status: 'healthy',
          responseTime: Date.now() - startTime
        };
      }

      // Intentar una operación simple para verificar conectividad
      await this.httpClient.get('/api/v1/health');
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
    return {
      gateway: 'bam',
      status: this.isMockMode ? 'operational' : 'operational',
      lastHealthCheck: null,
      responseTime: null
    };
  }
}

/**
 * Instancia singleton del servicio de BAM
 */
let bamServiceInstance: BAMService | null = null;

/**
 * Factory para obtener instancia del servicio de BAM
 */
export function getBAMService(): BAMService {
  if (!bamServiceInstance) {
    const config: BAMConfig = {
      merchantId: process.env.BAM_MERCHANT_ID || '',
      apiKey: process.env.BAM_API_KEY || '',
      apiSecret: process.env.BAM_API_SECRET || '',
      terminalId: process.env.BAM_TERMINAL_ID,
      environment: (process.env.BAM_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      callbackUrl: process.env.BAM_CALLBACK_URL,
      returnUrl: process.env.BAM_RETURN_URL
    };

    bamServiceInstance = new BAMService(config);
  }

  return bamServiceInstance;
}

export const bamService = getBAMService();
