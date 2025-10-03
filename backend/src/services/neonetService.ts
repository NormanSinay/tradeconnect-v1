/**
 * @fileoverview Servicio de NeoNet para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para integración con NeoNet Guatemala
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { NeoNetConfig, NeoNetTransactionResponse, NeoNetWebhookPayload } from '../types/payment-gateway.types';
import { PaymentInitiationData, PaymentConfirmationData } from '../types/payment.types';
import { PaymentGateway } from '../utils/constants';

/**
 * Servicio para integración con NeoNet
 */
export class NeoNetService {
  private httpClient!: AxiosInstance;
  private config: NeoNetConfig;
  private isMockMode: boolean;

  constructor(config: NeoNetConfig) {
    this.config = config;
    this.isMockMode = process.env.NODE_ENV === 'development' || process.env.NEONET_MOCK === 'true';

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
          logger.info('NeoNet API Response', {
            status: response.status,
            url: response.config.url
          });
          return response;
        },
        (error) => {
          logger.error('NeoNet API Error', {
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
   * Obtiene la URL base de NeoNet según el entorno
   */
  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.neonet.com.gt'
      : 'https://sandbox.neonet.com.gt';
  }

  /**
   * Genera token de autenticación para NeoNet
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
   * Inicia una transacción de pago con NeoNet
   */
  async initiatePayment(data: PaymentInitiationData): Promise<NeoNetTransactionResponse> {
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

      logger.info('NeoNet transaction initiated', {
        reference: transactionData.reference,
        registrationId: data.registrationId,
        amount: data.amount
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to initiate NeoNet transaction', {
        registrationId: data.registrationId,
        error: error.response?.data || error.message
      });
      throw new Error(`NeoNet transaction initiation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para iniciar pago en modo desarrollo
   */
  private mockInitiatePayment(data: PaymentInitiationData): NeoNetTransactionResponse {
    const successRate = parseFloat(process.env.NEONET_MOCK_SUCCESS_RATE || '0.9');
    const shouldSucceed = Math.random() < successRate;

    const response: NeoNetTransactionResponse = {
      transactionId: `neonet_${crypto.randomUUID()}`,
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

    logger.info('NeoNet mock transaction initiated', {
      reference: response.reference,
      status: response.status,
      isMock: true
    });

    return response;
  }

  /**
   * Confirma una transacción de pago con NeoNet
   */
  async confirmPayment(transactionId: string): Promise<NeoNetTransactionResponse> {
    if (this.isMockMode) {
      return this.mockConfirmPayment(transactionId);
    }

    try {
      const response = await this.httpClient.post(`/api/v1/transactions/${transactionId}/confirm`);

      logger.info('NeoNet payment confirmed', {
        transactionId,
        status: response.data.status
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to confirm NeoNet payment', {
        transactionId,
        error: error.response?.data || error.message
      });
      throw new Error(`NeoNet payment confirmation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para confirmar pago en modo desarrollo
   */
  private mockConfirmPayment(transactionId: string): NeoNetTransactionResponse {
    const successRate = parseFloat(process.env.NEONET_MOCK_SUCCESS_RATE || '0.95');
    const shouldSucceed = Math.random() < successRate;

    const response: NeoNetTransactionResponse = {
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

    logger.info('NeoNet mock payment confirmed', {
      transactionId,
      status: response.status,
      isMock: true
    });

    return response;
  }

  /**
   * Obtiene el estado de una transacción de NeoNet
   */
  async getTransactionStatus(transactionId: string): Promise<NeoNetTransactionResponse> {
    if (this.isMockMode) {
      return this.mockGetTransactionStatus(transactionId);
    }

    try {
      const response = await this.httpClient.get(`/api/v1/transactions/${transactionId}/status`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get NeoNet transaction status', {
        transactionId,
        error: error.response?.data || error.message
      });
      throw new Error(`NeoNet transaction status retrieval failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para obtener estado de transacción
   */
  private mockGetTransactionStatus(transactionId: string): NeoNetTransactionResponse {
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
   * Procesa un reembolso con NeoNet
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

      logger.info('NeoNet refund processed', {
        transactionId,
        refundId: response.data.refundId,
        amount
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to process NeoNet refund', {
        transactionId,
        amount,
        error: error.response?.data || error.message
      });
      throw new Error(`NeoNet refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Mock para procesar reembolso
   */
  private mockProcessRefund(transactionId: string, amount: number, reason?: string) {
    const successRate = parseFloat(process.env.NEONET_MOCK_SUCCESS_RATE || '0.98');
    const shouldSucceed = Math.random() < successRate;

    const response = {
      refundId: `refund_neonet_${crypto.randomUUID()}`,
      transactionId,
      amount,
      status: shouldSucceed ? 'completed' : 'failed',
      reason: reason || 'Customer requested refund',
      processedAt: new Date().toISOString()
    };

    logger.info('NeoNet mock refund processed', {
      transactionId,
      refundId: response.refundId,
      status: response.status,
      isMock: true
    });

    return response;
  }

  /**
   * Procesa un webhook de NeoNet
   */
  processWebhook(payload: NeoNetWebhookPayload): {
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
        logger.info('Unhandled NeoNet webhook event', { eventType });
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
   * Verifica la salud del servicio de NeoNet
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
      gateway: 'neonet',
      status: this.isMockMode ? 'operational' : 'operational', // En producción se calcularía basado en health checks
      lastHealthCheck: null,
      responseTime: null
    };
  }
}

/**
 * Instancia singleton del servicio de NeoNet
 */
let neonetServiceInstance: NeoNetService | null = null;

/**
 * Factory para obtener instancia del servicio de NeoNet
 */
export function getNeoNetService(): NeoNetService {
  if (!neonetServiceInstance) {
    const config: NeoNetConfig = {
      merchantId: process.env.NEONET_MERCHANT_ID || '',
      apiKey: process.env.NEONET_API_KEY || '',
      apiSecret: process.env.NEONET_API_SECRET || '',
      terminalId: process.env.NEONET_TERMINAL_ID,
      environment: (process.env.NEONET_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      callbackUrl: process.env.NEONET_CALLBACK_URL,
      returnUrl: process.env.NEONET_RETURN_URL
    };

    neonetServiceInstance = new NeoNetService(config);
  }

  return neonetServiceInstance;
}

export const neonetService = getNeoNetService();