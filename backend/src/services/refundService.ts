/**
 * @fileoverview Servicio de Reembolsos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión de reembolsos y devoluciones
 */

import { logger } from '../utils/logger';
import { Payment, Refund } from '../models';
import { RefundData, RefundInfo } from '../types/payment.types';
import { PaymentGateway } from '../utils/constants';
import { paymentService } from './paymentService';
import { ApiResponse } from '../types/global.types';

/**
 * Servicio para gestión de reembolsos
 */
export class RefundService {

  /**
   * Procesa una solicitud de reembolso
   */
  async processRefund(data: RefundData): Promise<ApiResponse<RefundInfo>> {
    try {
      // Validar que el pago existe y es reembolsable
      const payment = await Payment.findByTransactionId(data.transactionId);
      if (!payment) {
        return {
          success: false,
          message: 'Pago no encontrado',
          error: 'PAYMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar elegibilidad para reembolso
      if (!payment.isRefundable) {
        return {
          success: false,
          message: 'El pago no es elegible para reembolso',
          error: 'PAYMENT_NOT_REFUNDABLE',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que no existe un reembolso pendiente para este pago
      const existingRefund = await Refund.findOne({
        where: {
          paymentId: payment.id,
          status: ['pending', 'processing']
        }
      });

      if (existingRefund) {
        return {
          success: false,
          message: 'Ya existe un reembolso pendiente para este pago',
          error: 'REFUND_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar monto del reembolso
      const validation = await this.validateRefundAmount(payment, data.amount);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message || 'Error de validación',
          error: 'INVALID_REFUND_AMOUNT',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular comisiones del reembolso
      const refundFee = this.calculateRefundFee(data.amount, payment.gateway);
      const netAmount = data.amount - refundFee;

      // Crear registro de reembolso
      const refund = await Refund.create({
        refundId: this.generateRefundId(),
        paymentId: payment.id,
        amount: data.amount,
        fee: refundFee,
        netAmount,
        reason: data.reason,
        description: data.description,
        status: 'pending'
      });

      // Procesar reembolso usando el servicio principal de pagos
      const result = await paymentService.processRefund(data);

      if (result.success) {
        // Obtener reembolso actualizado
        const updatedRefund = await Refund.findByRefundId(refund.refundId);

        return {
          success: true,
          message: 'Reembolso procesado exitosamente',
          data: await this.formatRefundInfo(updatedRefund!),
          timestamp: new Date().toISOString()
        };
      } else {
        // Actualizar estado de fallo
        await refund.update({
          status: 'failed',
          gatewayResponse: { error: result.error }
        });

        return {
          success: false,
          message: result.message || 'Error al procesar el reembolso',
          error: result.error || 'REFUND_FAILED',
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
   * Obtiene información de un reembolso
   */
  async getRefund(refundId: string): Promise<ApiResponse<RefundInfo>> {
    try {
      const refund = await Refund.findByRefundId(refundId);
      if (!refund) {
        return {
          success: false,
          message: 'Reembolso no encontrado',
          error: 'REFUND_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Reembolso encontrado',
        data: await this.formatRefundInfo(refund),
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error getting refund', {
        refundId,
        error: error.message
      });

      return {
        success: false,
        message: 'Error interno al obtener el reembolso',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene reembolsos de un pago
   */
  async getRefundsByPayment(paymentId: number): Promise<ApiResponse<RefundInfo[]>> {
    try {
      const refunds = await Refund.findAll({
        where: { paymentId },
        order: [['createdAt', 'DESC']]
      });

      const formattedRefunds = await Promise.all(
        refunds.map(refund => this.formatRefundInfo(refund))
      );

      return {
        success: true,
        message: 'Reembolsos obtenidos exitosamente',
        data: formattedRefunds,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error getting refunds by payment', {
        paymentId,
        error: error.message
      });

      return {
        success: false,
        message: 'Error interno al obtener los reembolsos',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cancela un reembolso pendiente
   */
  async cancelRefund(refundId: string): Promise<ApiResponse<void>> {
    try {
      const refund = await Refund.findByRefundId(refundId);
      if (!refund) {
        return {
          success: false,
          message: 'Reembolso no encontrado',
          error: 'REFUND_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (refund.status !== 'pending') {
        return {
          success: false,
          message: 'Solo se pueden cancelar reembolsos pendientes',
          error: 'REFUND_NOT_CANCELLABLE',
          timestamp: new Date().toISOString()
        };
      }

      await refund.update({ status: 'cancelled' });

      return {
        success: true,
        message: 'Reembolso cancelado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error cancelling refund', {
        refundId,
        error: error.message
      });

      return {
        success: false,
        message: 'Error interno al cancelar el reembolso',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de reembolsos
   */
  async getRefundStats(startDate?: Date, endDate?: Date): Promise<ApiResponse<any>> {
    try {
      const where: any = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = startDate;
        if (endDate) where.createdAt.$lte = endDate;
      }

      const refunds = await Refund.findAll({ where });

      const stats = {
        totalRefunds: refunds.length,
        totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0),
        totalFees: refunds.reduce((sum, r) => sum + r.fee, 0),
        successRate: refunds.length > 0 ?
          (refunds.filter(r => r.status === 'completed').length / refunds.length) * 100 : 0,
        byStatus: refunds.reduce((acc, refund) => {
          acc[refund.status] = (acc[refund.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byReason: refunds.reduce((acc, refund) => {
          acc[refund.reason] = (acc[refund.reason] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return {
        success: true,
        message: 'Estadísticas de reembolsos obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error getting refund stats', { error: error.message });

      return {
        success: false,
        message: 'Error interno al obtener estadísticas',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Valida el monto del reembolso
   */
  private async validateRefundAmount(payment: Payment, refundAmount: number): Promise<{ valid: boolean; message?: string }> {
    // Verificar que el monto no exceda el pago original
    if (refundAmount > payment.netAmount) {
      return {
        valid: false,
        message: 'El monto del reembolso no puede exceder el monto pagado'
      };
    }

    // Verificar que no exceda el monto disponible para reembolso
    const existingRefunds = await Refund.findAll({
      where: {
        paymentId: payment.id,
        status: 'completed'
      }
    });

    const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);
    const availableForRefund = payment.netAmount - totalRefunded;

    if (refundAmount > availableForRefund) {
      return {
        valid: false,
        message: `El monto disponible para reembolso es de ${availableForRefund} ${payment.currency}`
      };
    }

    return { valid: true };
  }

  /**
   * Calcula la comisión de reembolso
   */
  private calculateRefundFee(amount: number, gateway: PaymentGateway): number {
    // Comisiones de reembolso (generalmente la mitad de la comisión original)
    const feeRates: Record<PaymentGateway, { percentage: number; fixed: number }> = {
      paypal: { percentage: 0.015, fixed: 0.25 }, // Mitad de la comisión normal
      stripe: { percentage: 0.015, fixed: 0.15 },
      neonet: { percentage: 0.012, fixed: 0.0 },
      bam: { percentage: 0.012, fixed: 0.0 }
    };

    const rate = feeRates[gateway];
    return (amount * rate.percentage) + rate.fixed;
  }

  /**
   * Genera ID único de reembolso
   */
  private generateRefundId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6);
    return `ref_${timestamp}_${random}`;
  }

  /**
   * Formatea información de reembolso para respuesta
   */
  private async formatRefundInfo(refund: Refund): Promise<RefundInfo> {
    return {
      id: refund.refundId,
      transactionId: (await refund.$get('payment'))?.transactionId || '',
      gatewayRefundId: refund.gatewayRefundId,
      amount: refund.amount,
      fee: refund.fee,
      netAmount: refund.netAmount,
      reason: refund.reason,
      description: refund.description,
      status: refund.status,
      gatewayResponse: refund.gatewayResponse,
      processedAt: refund.processedAt,
      createdAt: refund.createdAt,
      updatedAt: refund.updatedAt
    };
  }

  /**
   * Procesa reembolsos pendientes (job automático)
   */
  async processPendingRefunds(): Promise<void> {
    try {
      const pendingRefunds = await Refund.findPendingRefunds();

      for (const refund of pendingRefunds) {
        try {
          // Intentar procesar reembolso
          const payment = await refund.$get('payment');
          if (!payment) continue;

          const result = await paymentService.processRefund({
            transactionId: payment.transactionId,
            amount: refund.amount,
            reason: refund.reason,
            description: refund.description
          });

          if (!result.success) {
            logger.warn(`Refund processing failed for ${refund.refundId}`, {
              error: result.error
            });
          }
        } catch (error) {
          logger.error(`Error processing pending refund ${refund.refundId}`, error);
        }
      }
    } catch (error) {
      logger.error('Error processing pending refunds', error);
    }
  }
}

/**
 * Instancia singleton del servicio de reembolsos
 */
let refundServiceInstance: RefundService | null = null;

/**
 * Factory para obtener instancia del servicio de reembolsos
 */
export function getRefundService(): RefundService {
  if (!refundServiceInstance) {
    refundServiceInstance = new RefundService();
  }

  return refundServiceInstance;
}

export const refundService = getRefundService();