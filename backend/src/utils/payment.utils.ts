/**
 * @fileoverview Utilidades para el módulo de pagos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Funciones utilitarias para validación, encriptación y mocks
 */

import crypto from 'crypto';
import { logger } from './logger';
import { CardValidationResult, CardValidationConfig } from '../types/payment.types';
import { GatewayMockConfig } from '../types/payment-gateway.types';
import { PaymentGateway } from './constants';

/**
 * Clase para utilidades de pagos
 */
export class PaymentUtils {

  /**
   * Valida una tarjeta de crédito usando algoritmo Luhn
   */
  static validateCard(cardData: CardValidationConfig): CardValidationResult {
    const errors: string[] = [];

    // Limpiar el número de tarjeta
    const cleanNumber = cardData.number.replace(/[\s-]/g, '');

    // Validar formato básico
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      errors.push('El número de tarjeta debe contener entre 13 y 19 dígitos');
    }

    // Validar algoritmo Luhn
    const isLuhnValid = this.luhnCheck(cleanNumber);
    if (!isLuhnValid) {
      errors.push('El número de tarjeta no es válido (falla verificación Luhn)');
    }

    // Validar fecha de expiración
    const isExpiryValid = this.validateExpiryDate(cardData.expiryMonth, cardData.expiryYear);
    if (!isExpiryValid) {
      errors.push('La fecha de expiración de la tarjeta es inválida o está vencida');
    }

    // Detectar tipo de tarjeta
    const cardBrand = this.detectCardBrand(cleanNumber);

    return {
      isValid: errors.length === 0,
      cardBrand,
      isLuhnValid,
      isExpiryValid,
      errors
    };
  }

  /**
   * Implementa el algoritmo Luhn para validar números de tarjeta
   */
  private static luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    // Procesar dígitos de derecha a izquierda
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  /**
   * Valida fecha de expiración de tarjeta
   */
  private static validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() retorna 0-11

    // Validar rango básico
    if (month < 1 || month > 12) return false;
    if (year < currentYear || year > currentYear + 20) return false;

    // Validar que no esté expirada
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  }

  /**
   * Detecta la marca de la tarjeta basado en el número
   */
  private static detectCardBrand(cardNumber: string): string | undefined {
    const patterns: Record<string, RegExp> = {
      visa: /^4/,
      mastercard: /^(5[1-5]|2[2-7])/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3[0689]/,
      jcb: /^35/,
      unionpay: /^62/
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand;
      }
    }

    return undefined;
  }

  /**
   * Encripta datos sensibles usando AES-256
   */
  static encryptData(data: string, key?: string): string {
    const encryptionKey = key || process.env.PAYMENT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Payment encryption key not configured');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retornar IV + datos encriptados
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta datos sensibles
   */
  static decryptData(encryptedData: string, key?: string): string {
    const encryptionKey = key || process.env.PAYMENT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Payment encryption key not configured');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Genera respuesta mock para una pasarela
   */
  static generateMockResponse(gateway: string, config: GatewayMockConfig): Promise<any> {
    const shouldSucceed = Math.random() < config.successRate;

    // Simular latencia
    const latency = Math.random() * (config.latency.max - config.latency.min) + config.latency.min;

    return new Promise((resolve) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve(config.responses.success);
        } else {
          // Elegir aleatoriamente entre failure y error
          const responses = [config.responses.failure, config.responses.error];
          resolve(responses[Math.floor(Math.random() * responses.length)]);
        }
      }, latency);
    });
  }

  /**
   * Configuraciones de mock por defecto para cada pasarela
   */
  static getDefaultMockConfig(gateway: string): GatewayMockConfig {
    const baseConfig: GatewayMockConfig = {
      enabled: true,
      successRate: 0.9,
      latency: { min: 500, max: 2000 },
      responses: {
        success: {
          id: 'mock_success',
          status: 'APPROVED',
          create_time: new Date().toISOString(),
          update_time: new Date().toISOString(),
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: 'default',
            amount: { currency_code: 'USD', value: '100.00' }
          }],
          links: [{
            href: 'https://mock.paypal.com',
            rel: 'self',
            method: 'GET'
          }]
        } as any,
        failure: {
          id: 'mock_failure',
          status: 'DECLINED',
          create_time: new Date().toISOString(),
          update_time: new Date().toISOString(),
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: 'default',
            amount: { currency_code: 'USD', value: '100.00' }
          }],
          links: [{
            href: 'https://mock.paypal.com',
            rel: 'self',
            method: 'GET'
          }]
        } as any,
        error: {
          id: 'mock_error',
          status: 'FAILED',
          create_time: new Date().toISOString(),
          update_time: new Date().toISOString(),
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: 'default',
            amount: { currency_code: 'USD', value: '100.00' }
          }],
          links: [{
            href: 'https://mock.paypal.com',
            rel: 'self',
            method: 'GET'
          }]
        } as any
      }
    };

    switch (gateway) {
      case 'paypal':
        return {
          ...baseConfig,
          responses: {
            success: {
              id: `PAYID-${crypto.randomUUID()}`,
              status: 'APPROVED',
              create_time: new Date().toISOString(),
              update_time: new Date().toISOString(),
              intent: 'CAPTURE',
              purchase_units: [{
                reference_id: 'default',
                amount: { currency_code: 'USD', value: '100.00' }
              }],
              links: [{
                href: 'https://api.paypal.com/v2/checkout/orders/PAYID-123',
                rel: 'self',
                method: 'GET'
              }]
            } as any,
            failure: {
              id: `PAYID-${crypto.randomUUID()}`,
              status: 'DECLINED',
              create_time: new Date().toISOString(),
              update_time: new Date().toISOString(),
              intent: 'CAPTURE',
              purchase_units: [{
                reference_id: 'default',
                amount: { currency_code: 'USD', value: '100.00' }
              }],
              links: [{
                href: 'https://api.paypal.com/v2/checkout/orders/PAYID-123',
                rel: 'self',
                method: 'GET'
              }]
            } as any,
            error: {
              id: `PAYID-${crypto.randomUUID()}`,
              status: 'FAILED',
              create_time: new Date().toISOString(),
              update_time: new Date().toISOString(),
              intent: 'CAPTURE',
              purchase_units: [{
                reference_id: 'default',
                amount: { currency_code: 'USD', value: '100.00' }
              }],
              links: [{
                href: 'https://api.paypal.com/v2/checkout/orders/PAYID-123',
                rel: 'self',
                method: 'GET'
              }]
            } as any
          }
        };

      case 'stripe':
        return {
          ...baseConfig,
          responses: {
            success: {
              id: `pi_${crypto.randomUUID()}`,
              object: 'payment_intent',
              amount: 10000, // centavos
              amount_capturable: 10000,
              amount_received: 10000,
              currency: 'usd',
              status: 'succeeded',
              client_secret: `pi_${crypto.randomUUID()}_secret_${crypto.randomUUID()}`,
              created: Math.floor(Date.now() / 1000),
              capture_method: 'automatic',
              confirmation_method: 'automatic',
              payment_method_types: ['card']
            } as any,
            failure: {
              id: `pi_${crypto.randomUUID()}`,
              object: 'payment_intent',
              amount: 10000,
              amount_capturable: 0,
              amount_received: 0,
              currency: 'usd',
              status: 'requires_payment_method',
              created: Math.floor(Date.now() / 1000),
              capture_method: 'automatic',
              confirmation_method: 'automatic',
              payment_method_types: ['card'],
              last_payment_error: {
                code: 'card_declined',
                message: 'Your card was declined.',
                type: 'card_error'
              }
            } as any,
            error: {
              id: `pi_${crypto.randomUUID()}`,
              object: 'payment_intent',
              amount: 10000,
              amount_capturable: 0,
              amount_received: 0,
              currency: 'usd',
              status: 'canceled',
              created: Math.floor(Date.now() / 1000),
              capture_method: 'automatic',
              confirmation_method: 'automatic',
              payment_method_types: ['card']
            } as any
          }
        };

      case 'neonet':
      case 'bam':
        return {
          ...baseConfig,
          responses: {
            success: {
              transactionId: `txn_${crypto.randomUUID()}`,
              reference: `REF_${Date.now()}`,
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
            },
            failure: {
              transactionId: `txn_${crypto.randomUUID()}`,
              reference: `REF_${Date.now()}`,
              amount: 100.00,
              currency: 'GTQ',
              status: 'declined',
              responseCode: '05',
              responseMessage: 'Transaction declined',
              timestamp: new Date().toISOString()
            },
            error: {
              transactionId: `txn_${crypto.randomUUID()}`,
              reference: `REF_${Date.now()}`,
              amount: 100.00,
              currency: 'GTQ',
              status: 'failed',
              responseCode: '99',
              responseMessage: 'Internal processing error',
              timestamp: new Date().toISOString()
            } as any
          }
        };

      default:
        return baseConfig;
    }
  }

  /**
   * Genera un ID único para transacciones
   */
  static generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex');
    return `txn_${timestamp}_${random}`;
  }

  /**
   * Genera un ID único para reembolsos
   */
  static generateRefundId(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex');
    return `ref_${timestamp}_${random}`;
  }

  /**
   * Calcula comisiones por pasarela
   */
  static calculateFee(amount: number, gateway: PaymentGateway): number {
    const feeRates: Record<PaymentGateway, { percentage: number; fixed: number }> = {
      paypal: { percentage: 0.029, fixed: 0.49 },
      stripe: { percentage: 0.029, fixed: 0.30 },
      neonet: { percentage: 0.025, fixed: 0.0 },
      bam: { percentage: 0.025, fixed: 0.0 }
    };

    const rate = feeRates[gateway];
    return (amount * rate.percentage) + rate.fixed;
  }

  /**
   * Valida límites de monto por pasarela y moneda
   */
  static validateAmountLimits(amount: number, currency: string, gateway: PaymentGateway): boolean {
    const limits: Record<string, Record<PaymentGateway, { min: number; max: number }>> = {
      GTQ: {
        paypal: { min: 50, max: 50000 },
        stripe: { min: 50, max: 50000 },
        neonet: { min: 50, max: 25000 },
        bam: { min: 50, max: 25000 }
      },
      USD: {
        paypal: { min: 10, max: 10000 },
        stripe: { min: 10, max: 10000 },
        neonet: { min: 10, max: 5000 },
        bam: { min: 10, max: 5000 }
      }
    };

    const currencyLimits = limits[currency];
    if (!currencyLimits) return false;

    const gatewayLimits = currencyLimits[gateway];
    if (!gatewayLimits) return false;

    return amount >= gatewayLimits.min && amount <= gatewayLimits.max;
  }

  /**
   * Formatea monto para display
   */
  static formatAmount(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });

    return formatter.format(amount);
  }

  /**
   * Convierte monto a centavos para pasarelas que lo requieren
   */
  static toSmallestUnit(amount: number, currency: string): number {
    // Para monedas que usan centavos (USD, EUR, etc.)
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
      return Math.round(amount * 100);
    }

    // Para monedas que no usan centavos (GTQ, etc.)
    return Math.round(amount);
  }

  /**
   * Convierte de unidad más pequeña a monto normal
   */
  static fromSmallestUnit(amount: number, currency: string): number {
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
      return amount / 100;
    }

    return amount;
  }
}

/**
 * Instancia singleton de utilidades de pago
 */
export const paymentUtils = PaymentUtils;
