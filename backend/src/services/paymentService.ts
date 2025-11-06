/**
 * @fileoverview Servicio Principal de Pagos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio principal que orquesta todas las operaciones de pago
 */

import crypto from 'crypto';
import { Transaction, Op } from 'sequelize';
import { logger } from '../utils/logger';
import { Payment, PaymentMethod, Refund, PaymentReconciliation } from '../models';
import { Registration } from '../models/Registration';
import { Event } from '../models/Event';
import {
  PaymentInitiationData,
  PaymentConfirmationData,
  RefundData,
  PaymentTransaction,
  PaymentFilters,
  PaymentStats,
  CardValidationResult,
  CircuitBreakerState,
  RetryJob,
  PaymentEvent
} from '../types/payment.types';
import { PaymentGateway, PAYMENT_GATEWAYS } from '../utils/constants';
import { paypalService } from './paypalService';
import { stripeService } from './stripeService';
import { neonetService } from './neonetService';
import { bamService } from './bamService';
import { ApiResponse } from '../types/global.types';

/**
 * Servicio principal para gestión de pagos
 */
export class PaymentService {
  private circuitBreakers: Map<PaymentGateway, CircuitBreakerState> = new Map();
  private retryJobs: Map<string, RetryJob> = new Map();

  constructor() {
    // Inicializar circuit breakers
    Object.values(PAYMENT_GATEWAYS).forEach(gateway => {
      this.circuitBreakers.set(gateway, {
        gateway,
        state: 'closed',
        failures: 0,
        nextAttemptAt: undefined
      });
    });

    // Iniciar job de reintentos
    this.startRetryJob();
  }

  /**
   * Inicia una transacción de pago
   */
  async initiatePayment(data: PaymentInitiationData): Promise<ApiResponse<PaymentTransaction>> {
    try {
      // Validar que la inscripción existe y está en estado correcto
      const registration = await Registration.findByPk(data.registrationId);
      if (!registration) {
        return {
          success: false,
          message: 'Inscripción no encontrada',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (registration.status !== 'PENDIENTE_PAGO') {
        return {
          success: false,
          message: 'La inscripción no está en estado pendiente de pago',
          error: 'INVALID_REGISTRATION_STATUS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que no existe un pago activo para esta inscripción
      const existingPayment = await Payment.findOne({
        where: {
          registrationId: data.registrationId,
          status: ['pending', 'processing']
        }
      });

      if (existingPayment) {
        return {
          success: false,
          message: 'Ya existe un pago pendiente para esta inscripción',
          error: 'PAYMENT_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar límites de monto
      if (!this.validateAmount(data.amount, data.currency, data.gateway)) {
        return {
          success: false,
          message: 'Monto fuera de los límites permitidos',
          error: 'INVALID_AMOUNT',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular comisiones
      const fee = this.calculateFee(data.amount, data.gateway);
      const netAmount = data.amount - fee;

      // Generar ID único de transacción
      const transactionId = this.generateTransactionId();

      // Verificar circuit breaker
      if (!this.canProcessPayment(data.gateway)) {
        return {
          success: false,
          message: `La pasarela ${data.gateway} no está disponible temporalmente`,
          error: 'GATEWAY_UNAVAILABLE',
          timestamp: new Date().toISOString()
        };
      }

      // Crear registro de pago en base de datos
      const payment = await Payment.create({
        transactionId,
        registrationId: data.registrationId,
        gateway: data.gateway,
        status: 'pending',
        paymentType: data.paymentType,
        amount: data.amount,
        currency: data.currency,
        fee,
        netAmount,
        description: data.description,
        billingInfo: data.billingInfo,
        paymentMethod: data.paymentMethod,
        retryCount: 0,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      });

      try {
        // Iniciar pago en la pasarela correspondiente
        const gatewayResponse = await this.callGatewayInitiate(data.gateway, {
          ...data,
          transactionId
        });

        // Actualizar con respuesta de la pasarela
        await payment.update({
          gatewayTransactionId: (gatewayResponse as any).transactionId || (gatewayResponse as any).id,
          gatewayResponse,
          status: 'processing'
        });

        // Disparar evento de pago iniciado
        await this.emitPaymentEvent('payment.initiated', {
          transactionId,
          registrationId: data.registrationId,
          amount: data.amount,
          currency: data.currency,
          gateway: data.gateway
        });

        const paymentData = await this.getPaymentByTransactionId(transactionId);

        return {
          success: true,
          message: 'Pago iniciado exitosamente',
          data: paymentData!,
          timestamp: new Date().toISOString()
        };

      } catch (gatewayError: any) {
        // Actualizar estado de fallo
        await payment.update({
          status: 'failed',
          gatewayResponse: { error: gatewayError.message }
        });

        // Registrar fallo en circuit breaker
        this.recordGatewayFailure(data.gateway);

        return {
          success: false,
          message: 'Error al procesar el pago con la pasarela',
          error: 'GATEWAY_ERROR',
          timestamp: new Date().toISOString()
        };
      }

    } catch (error: any) {
      logger.error('Error initiating payment', {
        registrationId: data.registrationId,
        gateway: data.gateway,
        error: error.message
      });

      return {
        success: false,
        message: 'Error interno al iniciar el pago',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Confirma una transacción de pago
   */
  async confirmPayment(data: PaymentConfirmationData): Promise<ApiResponse<PaymentTransaction>> {
    try {
      const payment = await Payment.findByTransactionId(data.transactionId);
      if (!payment) {
        return {
          success: false,
          message: 'Transacción no encontrada',
          error: 'PAYMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (payment.status !== 'pending' && payment.status !== 'processing') {
        return {
          success: false,
          message: 'La transacción no puede ser confirmada en su estado actual',
          error: 'INVALID_PAYMENT_STATUS',
          timestamp: new Date().toISOString()
        };
      }

      try {
        // Confirmar con la pasarela
        const gatewayResponse = await this.callGatewayConfirm(payment.gateway, data);

        // Actualizar estado del pago
        const newStatus = this.mapGatewayStatusToPaymentStatus(gatewayResponse.status, payment.gateway);
        await payment.markAsConfirmed();

        // Actualizar estado de la inscripción si el pago fue exitoso
        if (newStatus === 'completed') {
          await Registration.update(
            { status: 'CONFIRMADO' },
            { where: { id: payment.registrationId } }
          );

          // Incrementar contador de participantes del evento
          const registration = await Registration.findByPk(payment.registrationId);
          if (registration) {
            const event = await Event.findByPk(registration.eventId);
            if (event) {
              await event.increment('registeredCount', { by: 1 });
            }
          }
        }

        // Disparar evento correspondiente
        const eventType = newStatus === 'completed' ? 'payment.completed' : 'payment.failed';
        await this.emitPaymentEvent(eventType, {
          transactionId: data.transactionId,
          registrationId: payment.registrationId,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway
        });

        const updatedPayment = await this.getPaymentByTransactionId(data.transactionId);

        return {
          success: true,
          message: 'Pago confirmado exitosamente',
          data: updatedPayment!,
          timestamp: new Date().toISOString()
        };

      } catch (gatewayError: any) {
        await payment.update({
          status: 'failed',
          gatewayResponse: { error: gatewayError.message }
        });

        this.recordGatewayFailure(payment.gateway);

        return {
          success: false,
          message: 'Error al confirmar el pago con la pasarela',
          error: 'GATEWAY_ERROR',
          timestamp: new Date().toISOString()
        };
      }

    } catch (error: any) {
      logger.error('Error confirming payment', {
        transactionId: data.transactionId,
        error: error.message
      });

      return {
        success: false,
        message: 'Error interno al confirmar el pago',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Procesa un reembolso
   */
  async processRefund(data: RefundData): Promise<ApiResponse<any>> {
    try {
      const payment = await Payment.findByTransactionId(data.transactionId);
      if (!payment) {
        return {
          success: false,
          message: 'Pago no encontrado',
          error: 'PAYMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (!payment.isRefundable) {
        return {
          success: false,
          message: 'El pago no es elegible para reembolso',
          error: 'PAYMENT_NOT_REFUNDABLE',
          timestamp: new Date().toISOString()
        };
      }

      if (data.amount > payment.netAmount) {
        return {
          success: false,
          message: 'El monto del reembolso no puede exceder el monto pagado',
          error: 'INVALID_REFUND_AMOUNT',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular comisiones del reembolso
      const refundFee = this.calculateRefundFee(data.amount, payment.gateway);
      const refundNetAmount = data.amount - refundFee;

      // Crear registro de reembolso
      const refund = await Refund.create({
        refundId: this.generateRefundId(),
        paymentId: payment.id,
        amount: data.amount,
        fee: refundFee,
        netAmount: refundNetAmount,
        reason: data.reason,
        description: data.description,
        status: 'pending'
      });

      try {
        // Procesar reembolso en la pasarela
        const gatewayResponse = await this.callGatewayRefund(
          payment.gateway,
          payment.gatewayTransactionId!,
          data.amount,
          data.reason
        );

        // Actualizar reembolso como completado
        await refund.markAsProcessed();

        // Actualizar estado del pago
        await payment.update({
          status: data.amount === payment.amount ? 'refunded' : 'partially_refunded'
        });

        // Disparar evento de reembolso
        await this.emitPaymentEvent('payment.refunded', {
          transactionId: data.transactionId,
          registrationId: payment.registrationId,
          amount: data.amount,
          currency: payment.currency,
          gateway: payment.gateway
        });

        return {
          success: true,
          message: 'Reembolso procesado exitosamente',
          data: {
            refundId: refund.refundId,
            amount: refund.amount,
            status: refund.status
          },
          timestamp: new Date().toISOString()
        };

      } catch (gatewayError: any) {
        await refund.update({
          status: 'failed',
          gatewayResponse: { error: gatewayError.message }
        });

        this.recordGatewayFailure(payment.gateway);

        return {
          success: false,
          message: 'Error al procesar el reembolso con la pasarela',
          error: 'GATEWAY_ERROR',
          timestamp: new Date().toISOString()
        };
      }

    } catch (error: any) {
      logger.error('Error processing refund', {
        transactionId: data.transactionId,
        error: error.message
      });

      return {
        success: false,
        message: 'Error interno al procesar el reembolso',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Valida una tarjeta de crédito usando algoritmo Luhn
   */
  validateCard(cardNumber: string): CardValidationResult {
    const errors: string[] = [];

    // Remover espacios y guiones
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');

    // Validar formato básico
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      errors.push('El número de tarjeta debe contener entre 13 y 19 dígitos');
    }

    // Validar algoritmo Luhn
    const isLuhnValid = this.luhnCheck(cleanNumber);
    if (!isLuhnValid) {
      errors.push('El número de tarjeta no es válido (falla verificación Luhn)');
    }

    // Detectar tipo de tarjeta
    const cardBrand = this.detectCardBrand(cleanNumber);

    return {
      isValid: errors.length === 0,
      cardBrand,
      isLuhnValid,
      isExpiryValid: true, // Se valida por separado
      errors
    };
  }

  /**
   * Verifica algoritmo Luhn
   */
  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;

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
   * Detecta la marca de la tarjeta
   */
  private detectCardBrand(cardNumber: string): string | undefined {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3[0689]/,
      jcb: /^35/
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand;
      }
    }

    return undefined;
  }

  /**
   * Calcula la comisión de una pasarela
   */
  private calculateFee(amount: number, gateway: PaymentGateway): number {
    // Comisiones aproximadas (en producción se configurarían por pasarela)
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
   * Calcula la comisión de reembolso
   */
  private calculateRefundFee(amount: number, gateway: PaymentGateway): number {
    // Comisiones de reembolso (generalmente menores)
    return this.calculateFee(amount, gateway) * 0.5;
  }

  /**
   * Valida límites de monto
   */
  private validateAmount(amount: number, currency: string, gateway: PaymentGateway): boolean {
    const limits: Record<string, { min: number; max: number }> = {
      GTQ: { min: 50, max: 50000 },
      USD: { min: 10, max: 10000 }
    };

    const limit = limits[currency];
    if (!limit) return false;

    return amount >= limit.min && amount <= limit.max;
  }

  /**
   * Genera ID único de transacción
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex');
    return `txn_${timestamp}_${random}`;
  }

  /**
   * Genera ID único de reembolso
   */
  private generateRefundId(): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex');
    return `ref_${timestamp}_${random}`;
  }

  /**
   * Llama al método initiate de la pasarela correspondiente
   */
  private async callGatewayInitiate(gateway: PaymentGateway, data: PaymentInitiationData & { transactionId: string }) {
    switch (gateway) {
      case PAYMENT_GATEWAYS.PAYPAL:
        return await paypalService.initiatePayment(data);
      case PAYMENT_GATEWAYS.STRIPE:
        return await stripeService.initiatePayment(data);
      case PAYMENT_GATEWAYS.NEONET:
        return await neonetService.initiatePayment(data);
      case PAYMENT_GATEWAYS.BAM:
        return await bamService.initiatePayment(data);
      default:
        throw new Error(`Pasarela no soportada: ${gateway}`);
    }
  }

  /**
   * Llama al método confirm de la pasarela correspondiente
   */
  private async callGatewayConfirm(gateway: PaymentGateway, data: PaymentConfirmationData) {
    switch (gateway) {
      case PAYMENT_GATEWAYS.PAYPAL:
        return await paypalService.confirmPayment(data.transactionId);
      case PAYMENT_GATEWAYS.STRIPE:
        return await stripeService.confirmPayment(data.transactionId);
      case PAYMENT_GATEWAYS.NEONET:
        return await neonetService.confirmPayment(data.transactionId);
      case PAYMENT_GATEWAYS.BAM:
        return await bamService.confirmPayment(data.transactionId);
      default:
        throw new Error(`Pasarela no soportada: ${gateway}`);
    }
  }

  /**
   * Llama al método refund de la pasarela correspondiente
   */
  private async callGatewayRefund(gateway: PaymentGateway, transactionId: string, amount: number, reason?: string) {
    switch (gateway) {
      case PAYMENT_GATEWAYS.PAYPAL:
        return await paypalService.processRefund(transactionId, amount, reason);
      case PAYMENT_GATEWAYS.STRIPE:
        return await stripeService.processRefund(transactionId, amount, reason);
      case PAYMENT_GATEWAYS.NEONET:
        return await neonetService.processRefund(transactionId, amount, reason);
      case PAYMENT_GATEWAYS.BAM:
        return await bamService.processRefund(transactionId, amount, reason);
      default:
        throw new Error(`Pasarela no soportada: ${gateway}`);
    }
  }

  /**
   * Mapea estado de pasarela a estado de pago interno
   */
  private mapGatewayStatusToPaymentStatus(gatewayStatus: string, gateway: PaymentGateway): string {
    // Mapeos específicos por pasarela
    const statusMaps: Record<string, Record<string, string>> = {
      paypal: {
        'APPROVED': 'completed',
        'COMPLETED': 'completed',
        'DECLINED': 'failed',
        'FAILED': 'failed'
      },
      stripe: {
        'succeeded': 'completed',
        'failed': 'failed',
        'canceled': 'cancelled'
      },
      neonet: {
        'approved': 'completed',
        'declined': 'failed',
        'cancelled': 'cancelled',
        'expired': 'expired'
      },
      bam: {
        'approved': 'completed',
        'declined': 'failed',
        'cancelled': 'cancelled',
        'expired': 'expired'
      }
    };

    return statusMaps[gateway]?.[gatewayStatus] || 'failed';
  }

  /**
   * Verifica si se puede procesar pagos con una pasarela (circuit breaker)
   */
  private canProcessPayment(gateway: PaymentGateway): boolean {
    const breaker = this.circuitBreakers.get(gateway);
    if (!breaker) return true;

    if (breaker.state === 'open') {
      if (breaker.nextAttemptAt && new Date() > breaker.nextAttemptAt) {
        breaker.state = 'half_open';
        return true;
      }
      return false;
    }

    return true;
  }

  /**
   * Registra un fallo en el circuit breaker
   */
  private recordGatewayFailure(gateway: PaymentGateway): void {
    const breaker = this.circuitBreakers.get(gateway);
    if (!breaker) return;

    breaker.failures++;
    breaker.lastFailureAt = new Date();

    if (breaker.failures >= 5) { // Umbral de fallos
      breaker.state = 'open';
      breaker.nextAttemptAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
      logger.warn(`Circuit breaker opened for gateway ${gateway}`);
    }
  }

  /**
   * Inicia el job de reintentos automáticos
   */
  private startRetryJob(): void {
    setInterval(async () => {
      try {
        await this.processRetryJobs();
      } catch (error) {
        logger.error('Error processing retry jobs', error);
      }
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  /**
   * Procesa jobs de reintentos pendientes
   */
  private async processRetryJobs(): Promise<void> {
    const where: any = {
      status: 'failed',
      retryCount: { [Op.lt]: 3 }
    };

    // Agregar condición OR para lastRetryAt
    where[Op.or] = [
      { lastRetryAt: null },
      { lastRetryAt: { [Op.lt]: new Date(Date.now() - 2 * 60 * 1000) } } // 2 minutos desde último reintento
    ];

    const pendingPayments = await Payment.findAll({ where });

    for (const payment of pendingPayments) {
      try {
        // Reintentar pago
        const result = await this.confirmPayment({
          transactionId: payment.transactionId,
          status: 'completed'
        });

        if (result.success) {
          logger.info(`Payment retry successful for ${payment.transactionId}`);
        } else {
          await payment.incrementRetryCount();
        }
      } catch (error) {
        await payment.incrementRetryCount();
        logger.error(`Payment retry failed for ${payment.transactionId}`, error);
      }
    }
  }

  /**
   * Emite eventos de pago (para integración con otros módulos)
   */
  private async emitPaymentEvent(eventType: PaymentEvent['type'], data: Omit<PaymentEvent, 'type' | 'timestamp'>): Promise<void> {
    const event: PaymentEvent = {
      type: eventType,
      ...data,
      timestamp: new Date()
    };

    // Aquí se integraría con un sistema de eventos (Redis pub/sub, RabbitMQ, etc.)
    logger.info('Payment event emitted', event);

    // TODO: Integrar con event listeners de otros módulos
  }

  /**
   * Obtiene un pago por transaction ID con relaciones
   */
  private async getPaymentByTransactionId(transactionId: string): Promise<PaymentTransaction | null> {
    const payment = await Payment.findByTransactionId(transactionId);
    if (!payment) return null;

    return {
      id: payment.transactionId,
      registrationId: payment.registrationId,
      gateway: payment.gateway,
      gatewayTransactionId: payment.gatewayTransactionId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      fee: payment.fee,
      netAmount: payment.netAmount,
      description: payment.description,
      billingInfo: payment.billingInfo,
      paymentMethod: payment.paymentMethod,
      gatewayResponse: payment.gatewayResponse,
      metadata: payment.metadata,
      retryCount: payment.retryCount,
      lastRetryAt: payment.lastRetryAt,
      confirmedAt: payment.confirmedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    };
  }

  /**
   * Obtiene estadísticas de pagos
   */
  async getPaymentStats(filters?: PaymentFilters): Promise<PaymentStats> {
    // Implementación simplificada - en producción usaría queries optimizadas
    const where: any = {};

    if (filters?.gateway) where.gateway = filters.gateway;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate) where.createdAt = { $gte: filters.startDate };
    if (filters?.endDate) where.createdAt = { ...where.createdAt, $lte: filters.endDate };

    const payments = await Payment.findAll({ where });

    const stats: PaymentStats = {
      totalTransactions: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      totalFees: payments.reduce((sum, p) => sum + p.fee, 0),
      successRate: payments.length > 0 ?
        (payments.filter(p => p.status === 'completed').length / payments.length) * 100 : 0,
      averageProcessingTime: 0, // TODO: calcular
      byGateway: {
        paypal: { transactions: 0, amount: 0, successRate: 0 },
        stripe: { transactions: 0, amount: 0, successRate: 0 },
        neonet: { transactions: 0, amount: 0, successRate: 0 },
        bam: { transactions: 0, amount: 0, successRate: 0 }
      },
      byStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        refunded: 0,
        partially_refunded: 0,
        disputed: 0,
        expired: 0
      },
      byCurrency: {}
    };

    // Calcular estadísticas por gateway
    const gateways = [...new Set(payments.map(p => p.gateway))];
    gateways.forEach(gateway => {
      const gatewayPayments = payments.filter(p => p.gateway === gateway);
      stats.byGateway[gateway] = {
        transactions: gatewayPayments.length,
        amount: gatewayPayments.reduce((sum, p) => sum + p.amount, 0),
        successRate: gatewayPayments.length > 0 ?
          (gatewayPayments.filter(p => p.status === 'completed').length / gatewayPayments.length) * 100 : 0
      };
    });

    return stats;
  }
}

/**
 * Instancia singleton del servicio de pagos
 */
let paymentServiceInstance: PaymentService | null = null;

/**
 * Factory para obtener instancia del servicio de pagos
 */
export function getPaymentService(): PaymentService {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService();
  }

  return paymentServiceInstance;
}

export const paymentService = getPaymentService();
