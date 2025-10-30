/**
 * @fileoverview Servicio de Gestión Financiera para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio principal para gestión financiera, comisiones, reportes y KPIs
 */

import { Op, fn, col, literal } from 'sequelize';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { Payment, Refund, Registration, Event, PaymentReconciliation } from '../models';
import { PaymentGateway, PaymentStatus } from '../utils/constants';
import { ApiResponse } from '../types/global.types';

/**
 * Interfaces para tipos de datos financieros
 */
export interface CommissionCalculation {
  gateway: PaymentGateway;
  amount: number;
  fee: number;
  netAmount: number;
  commissionRate: number;
  fixedFee: number;
}

export interface FinancialReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    total: number;
    byGateway: Record<string, number>;
    byEvent: Record<string, number>;
    byCurrency: Record<string, number>;
  };
  expenses: {
    total: number;
    commissions: number;
    refunds: number;
    byGateway: Record<string, number>;
  };
  netProfit: number;
  transactionCount: number;
  averageTransactionValue: number;
}

export interface FinancialKPIs {
  roi: number;
  profitMargin: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  churnRate: number;
  conversionRate: number;
  averageOrderValue: number;
  monthlyRecurringRevenue: number;
}

export interface TrendData {
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  transactionCount: number;
  growthRate: number;
}

export interface RefundPolicy {
  eventId?: number;
  daysBeforeEvent: number;
  refundPercentage: number;
  reason: string;
  conditions: string[];
}

export interface BulkRefundRequest {
  payments: string[]; // transactionIds
  reason: string;
  description?: string;
  policy?: RefundPolicy;
}

/**
 * Servicio de Gestión Financiera
 */
export class FinanceService {
  private static readonly CACHE_PREFIX = 'finance';
  private static readonly CACHE_TTL = 1800; // 30 minutos

  /**
   * Calcula comisiones por pasarela de pago
   */
  static async calculateGatewayCommissions(
    gateway: PaymentGateway,
    amount: number,
    currency: string = 'GTQ'
  ): Promise<CommissionCalculation> {
    try {
      // Tasas de comisión por pasarela (basadas en el servicio de pagos existente)
      const commissionRates: Record<PaymentGateway, { percentage: number; fixed: number }> = {
        paypal: { percentage: 0.029, fixed: 0.49 },
        stripe: { percentage: 0.029, fixed: 0.30 },
        neonet: { percentage: 0.025, fixed: 0.0 },
        bam: { percentage: 0.025, fixed: 0.0 }
      };

      const rate = commissionRates[gateway];
      if (!rate) {
        throw new Error(`Pasarela no soportada: ${gateway}`);
      }

      const fee = (amount * rate.percentage) + rate.fixed;
      const netAmount = amount - fee;

      return {
        gateway,
        amount,
        fee,
        netAmount,
        commissionRate: rate.percentage,
        fixedFee: rate.fixed
      };
    } catch (error) {
      logger.error('Error calculating gateway commissions', { gateway, amount, error });
      throw error;
    }
  }

  /**
   * Calcula comisiones por evento
   */
  static async calculateEventCommissions(eventId: number): Promise<{
    totalRevenue: number;
    totalCommissions: number;
    netRevenue: number;
    commissionByGateway: Record<string, number>;
  }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:event_commissions:${eventId}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener todos los pagos exitosos del evento
      const payments = await Payment.findAll({
        where: {
          status: 'completed'
        },
        include: [{
          model: Registration,
          as: 'registration',
          where: { eventId },
          required: true
        }]
      });

      let totalRevenue = 0;
      let totalCommissions = 0;
      const commissionByGateway: Record<string, number> = {};

      for (const payment of payments) {
        totalRevenue += payment.amount;
        totalCommissions += payment.fee;

        if (!commissionByGateway[payment.gateway]) {
          commissionByGateway[payment.gateway] = 0;
        }
        commissionByGateway[payment.gateway] += payment.fee;
      }

      const result = {
        totalRevenue,
        totalCommissions,
        netRevenue: totalRevenue - totalCommissions,
        commissionByGateway
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error calculating event commissions', { eventId, error });
      throw error;
    }
  }

  /**
   * Calcula comisiones por período
   */
  static async calculatePeriodCommissions(
    startDate: Date,
    endDate: Date,
    gateway?: PaymentGateway
  ): Promise<{
    totalRevenue: number;
    totalCommissions: number;
    netRevenue: number;
    commissionByGateway: Record<string, number>;
    commissionByEvent: Record<string, number>;
  }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:period_commissions:${startDate.toISOString()}:${endDate.toISOString()}:${gateway || 'all'}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const whereClause: any = {
        status: 'completed',
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      };

      if (gateway) {
        whereClause.gateway = gateway;
      }

      const payments = await Payment.findAll({
        where: whereClause,
        include: [{
          model: Registration,
          as: 'registration',
          include: [{
            model: Event,
            as: 'event'
          }]
        }]
      });

      let totalRevenue = 0;
      let totalCommissions = 0;
      const commissionByGateway: Record<string, number> = {};
      const commissionByEvent: Record<string, number> = {};

      for (const payment of payments) {
        totalRevenue += payment.amount;
        totalCommissions += payment.fee;

        // Por pasarela
        if (!commissionByGateway[payment.gateway]) {
          commissionByGateway[payment.gateway] = 0;
        }
        commissionByGateway[payment.gateway] += payment.fee;

        // Por evento
        const eventId = payment.registration?.eventId;
        if (eventId) {
          if (!commissionByEvent[eventId]) {
            commissionByEvent[eventId] = 0;
          }
          commissionByEvent[eventId] += payment.fee;
        }
      }

      const result = {
        totalRevenue,
        totalCommissions,
        netRevenue: totalRevenue - totalCommissions,
        commissionByGateway,
        commissionByEvent
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error calculating period commissions', { startDate, endDate, gateway, error });
      throw error;
    }
  }

  /**
   * Genera reporte financiero completo
   */
  static async generateFinancialReport(
    startDate: Date,
    endDate: Date
  ): Promise<FinancialReport> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:report:${startDate.toISOString()}:${endDate.toISOString()}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener ingresos (pagos completados)
      const revenueData = await Payment.findAll({
        attributes: [
          'gateway',
          'currency',
          [fn('SUM', col('amount')), 'totalAmount'],
          [fn('COUNT', col('id')), 'transactionCount']
        ],
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [{
          model: Registration,
          as: 'registration',
          include: [{
            model: Event,
            as: 'event'
          }]
        }],
        group: ['gateway', 'currency', 'registration.event.id'],
        raw: true
      });

      // Procesar datos de ingresos
      const revenue = {
        total: 0,
        byGateway: {} as Record<string, number>,
        byEvent: {} as Record<string, number>,
        byCurrency: {} as Record<string, number>
      };

      revenueData.forEach((item: any) => {
        const amount = parseFloat(item.totalAmount) || 0;
        revenue.total += amount;

        // Por pasarela
        if (!revenue.byGateway[item.gateway]) {
          revenue.byGateway[item.gateway] = 0;
        }
        revenue.byGateway[item.gateway] += amount;

        // Por evento
        const eventId = item['registration.event.id'];
        if (eventId) {
          if (!revenue.byEvent[eventId]) {
            revenue.byEvent[eventId] = 0;
          }
          revenue.byEvent[eventId] += amount;
        }

        // Por moneda
        if (!revenue.byCurrency[item.currency]) {
          revenue.byCurrency[item.currency] = 0;
        }
        revenue.byCurrency[item.currency] += amount;
      });

      // Obtener gastos (comisiones y reembolsos)
      const commissionData = await Payment.findAll({
        attributes: [
          'gateway',
          [fn('SUM', col('fee')), 'totalFees']
        ],
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        group: ['gateway'],
        raw: true
      });

      const refundData = await Refund.findAll({
        attributes: [
          [fn('SUM', col('amount')), 'totalRefunds'],
          [fn('SUM', col('fee')), 'refundFees']
        ],
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        raw: true
      });

      // Procesar datos de gastos
      const expenses = {
        total: 0,
        commissions: 0,
        refunds: 0,
        byGateway: {} as Record<string, number>
      };

      commissionData.forEach((item: any) => {
        const fee = parseFloat(item.totalFees) || 0;
        expenses.commissions += fee;
        expenses.byGateway[item.gateway] = fee;
      });

      refundData.forEach((item: any) => {
        const refundAmount = parseFloat(item.totalRefunds) || 0;
        const refundFee = parseFloat(item.refundFees) || 0;
        expenses.refunds += refundAmount + refundFee;
      });

      expenses.total = expenses.commissions + expenses.refunds;

      // Calcular estadísticas generales
      const transactionCount = await Payment.count({
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      });

      const averageTransactionValue = transactionCount > 0 ? revenue.total / transactionCount : 0;
      const netProfit = revenue.total - expenses.total;

      const report: FinancialReport = {
        period: { startDate, endDate },
        revenue,
        expenses,
        netProfit,
        transactionCount,
        averageTransactionValue
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(report));

      return report;
    } catch (error) {
      logger.error('Error generating financial report', { startDate, endDate, error });
      throw error;
    }
  }

  /**
   * Calcula KPIs financieros
   */
  static async calculateFinancialKPIs(
    startDate: Date,
    endDate: Date
  ): Promise<FinancialKPIs> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:kpis:${startDate.toISOString()}:${endDate.toISOString()}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener datos para KPIs
      const payments = await Payment.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [{
          model: Registration,
          as: 'registration'
        }]
      });

      const refunds = await Refund.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      });

      // Calcular métricas básicas
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalCommissions = payments.reduce((sum, p) => sum + p.fee, 0);
      const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);

      const netRevenue = totalRevenue - totalCommissions - totalRefunds;
      const totalExpenses = totalCommissions + totalRefunds; // Simplificado

      // ROI (Return on Investment) - simplificado como margen de ganancia
      const roi = totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0;

      // Margen de ganancia
      const profitMargin = totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0;

      // Tasa de conversión (pagos completados vs total de registros)
      const totalRegistrations = await Registration.count({
        where: {
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      });

      const conversionRate = totalRegistrations > 0 ? (payments.length / totalRegistrations) * 100 : 0;

      // Valor promedio de pedido
      const averageOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0;

      // Tasa de abandono (reembolsos vs pagos)
      const churnRate = payments.length > 0 ? (refunds.length / payments.length) * 100 : 0;

      // CAC y LTV simplificados (requerirían más datos de marketing)
      const customerAcquisitionCost = 0; // Placeholder
      const lifetimeValue = averageOrderValue * (1 - churnRate / 100);

      // MRR simplificado (ingresos mensuales recurrentes)
      const monthlyRecurringRevenue = netRevenue / 12; // Promedio mensual

      const kpis: FinancialKPIs = {
        roi,
        profitMargin,
        customerAcquisitionCost,
        lifetimeValue,
        churnRate,
        conversionRate,
        averageOrderValue,
        monthlyRecurringRevenue
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(kpis));

      return kpis;
    } catch (error) {
      logger.error('Error calculating financial KPIs', { startDate, endDate, error });
      throw error;
    }
  }

  /**
   * Analiza tendencias financieras
   */
  static async analyzeFinancialTrends(
    periods: number = 12,
    periodType: 'month' | 'week' | 'day' = 'month'
  ): Promise<TrendData[]> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:trends:${periods}:${periodType}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const trends: TrendData[] = [];
      const now = new Date();

      for (let i = periods - 1; i >= 0; i--) {
        let startDate: Date;
        let endDate: Date;
        let periodLabel: string;

        switch (periodType) {
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            periodLabel = startDate.toLocaleDateString('es-GT', { year: 'numeric', month: 'short' });
            break;
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
            startDate = new Date(weekStart);
            endDate = new Date(weekStart);
            endDate.setDate(startDate.getDate() + 6);
            periodLabel = `Sem ${Math.ceil(startDate.getDate() / 7)}`;
            break;
          case 'day':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - i);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            periodLabel = startDate.toLocaleDateString('es-GT', { month: 'short', day: 'numeric' });
            break;
        }

        // Obtener datos del período
        const periodData = await this.getPeriodFinancialData(startDate, endDate);

        // Calcular tasa de crecimiento
        const previousPeriod = trends.length > 0 ? trends[trends.length - 1] : null;
        const growthRate = previousPeriod && previousPeriod.revenue > 0
          ? ((periodData.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100
          : 0;

        trends.push({
          period: periodLabel,
          revenue: periodData.revenue,
          expenses: periodData.expenses,
          netProfit: periodData.netProfit,
          transactionCount: periodData.transactionCount,
          growthRate
        });
      }

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(trends));

      return trends;
    } catch (error) {
      logger.error('Error analyzing financial trends', { periods, periodType, error });
      throw error;
    }
  }

  /**
   * Obtiene datos financieros de un período específico
   */
  private static async getPeriodFinancialData(startDate: Date, endDate: Date): Promise<{
    revenue: number;
    expenses: number;
    netProfit: number;
    transactionCount: number;
  }> {
    const payments = await Payment.findAll({
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    });

    const refunds = await Refund.findAll({
      where: {
        status: 'completed',
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    });

    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const commissions = payments.reduce((sum, p) => sum + p.fee, 0);
    const refundAmount = refunds.reduce((sum, r) => sum + r.amount + r.fee, 0);
    const expenses = commissions + refundAmount;
    const netProfit = revenue - expenses;
    const transactionCount = payments.length;

    return { revenue, expenses, netProfit, transactionCount };
  }

  /**
   * Procesa reembolso automático basado en políticas
   */
  static async processAutomaticRefund(
    registrationId: number,
    policy: RefundPolicy
  ): Promise<ApiResponse<any>> {
    try {
      // Obtener registro e información del evento
      const registration = await Registration.findByPk(registrationId, {
        include: [Event]
      });

      if (!registration) {
        return {
          success: false,
          message: 'Registro no encontrado',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar elegibilidad para reembolso automático
      const event = registration.event;
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular días hasta el evento
      const daysUntilEvent = Math.floor(
        (event.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Verificar política de reembolso
      if (daysUntilEvent > policy.daysBeforeEvent) {
        return {
          success: false,
          message: `No elegible para reembolso automático. Días requeridos: ${policy.daysBeforeEvent}, días restantes: ${daysUntilEvent}`,
          error: 'NOT_ELIGIBLE_FOR_REFUND',
          timestamp: new Date().toISOString()
        };
      }

      // Encontrar pago completado
      const payment = await Payment.findOne({
        where: {
          registrationId: registrationId,
          status: 'completed'
        }
      });
      if (!payment) {
        return {
          success: false,
          message: 'No se encontró pago completado para este registro',
          error: 'PAYMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular monto del reembolso
      const refundAmount = (payment.netAmount * policy.refundPercentage) / 100;

      // Procesar reembolso usando el servicio de reembolsos
      const { refundService } = await import('./refundService');

      const refundResult = await refundService.processRefund({
        transactionId: payment.transactionId,
        amount: refundAmount,
        reason: policy.reason,
        description: `Reembolso automático: ${policy.conditions.join(', ')}`
      });

      if (refundResult.success) {
        // Actualizar estado del registro
        await registration.update({
          status: 'CANCELADO'
        });

        return {
          success: true,
          message: 'Reembolso automático procesado exitosamente',
          data: refundResult.data,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          message: refundResult.message || 'Error al procesar reembolso automático',
          error: refundResult.error || 'REFUND_FAILED',
          timestamp: new Date().toISOString()
        };
      }

    } catch (error: any) {
      logger.error('Error processing automatic refund', { registrationId, error: error.message });
      return {
        success: false,
        message: 'Error interno al procesar reembolso automático',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Procesa reembolsos masivos
   */
  static async processBulkRefunds(
    request: BulkRefundRequest
  ): Promise<ApiResponse<{
    successful: string[];
    failed: { transactionId: string; error: string }[];
    summary: {
      totalRequested: number;
      successfulCount: number;
      failedCount: number;
      totalRefunded: number;
    };
  }>> {
    try {
      const { refundService } = await import('./refundService');

      const successful: string[] = [];
      const failed: { transactionId: string; error: string }[] = [];
      let totalRefunded = 0;

      // Procesar cada reembolso
      for (const transactionId of request.payments) {
        try {
          // Obtener información del pago
          const payment = await Payment.findOne({ where: { transactionId } });
          if (!payment) {
            failed.push({
              transactionId,
              error: 'Pago no encontrado'
            });
            continue;
          }

          // Verificar elegibilidad (solo pagos completados pueden ser reembolsados)
          if (payment.status !== 'completed') {
            failed.push({
              transactionId,
              error: 'Pago no elegible para reembolso'
            });
            continue;
          }

          // Calcular monto del reembolso (usar monto completo si no se especifica política)
          const refundAmount = request.policy
            ? (payment.netAmount * request.policy.refundPercentage) / 100
            : payment.netAmount;

          // Procesar reembolso
          const refundResult = await refundService.processRefund({
            transactionId,
            amount: refundAmount,
            reason: request.reason,
            description: request.description
          });

          if (refundResult.success) {
            successful.push(transactionId);
            totalRefunded += refundAmount;
          } else {
            failed.push({
              transactionId,
              error: refundResult.message || 'Error desconocido'
            });
          }

        } catch (error: any) {
          failed.push({
            transactionId,
            error: error.message || 'Error interno'
          });
        }
      }

      const summary = {
        totalRequested: request.payments.length,
        successfulCount: successful.length,
        failedCount: failed.length,
        totalRefunded
      };

      return {
        success: true,
        message: `Procesamiento masivo completado: ${successful.length} exitosos, ${failed.length} fallidos`,
        data: {
          successful,
          failed,
          summary
        },
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error processing bulk refunds', { error: error.message });
      return {
        success: false,
        message: 'Error interno al procesar reembolsos masivos',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas financieras generales
   */
  static async getFinancialStats(): Promise<{
    totalRevenue: number;
    totalCommissions: number;
    totalRefunds: number;
    netProfit: number;
    transactionCount: number;
    averageTransactionValue: number;
    topGateways: Array<{
      gateway: string;
      revenue: number;
      percentage: number;
    }>;
    topEvents: Array<{
      eventId: number;
      eventTitle: string;
      revenue: number;
    }>;
    monthlyGrowth: number;
  }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:stats`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Obtener datos de los últimos 30 días
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      // Pagos completados
      const payments = await Payment.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [{
          model: Registration,
          as: 'registration',
          attributes: ['id', 'eventId'],
          include: [{
            model: Event,
            as: 'event',
            attributes: ['id', 'title']
          }]
        }]
      });

      // Reembolsos completados
      const refunds = await Refund.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        }
      });

      // Calcular estadísticas básicas
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalCommissions = payments.reduce((sum, p) => sum + p.fee, 0);
      const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
      const netProfit = totalRevenue - totalCommissions - totalRefunds;
      const transactionCount = payments.length;
      const averageTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      // Top pasarelas
      const gatewayStats: Record<string, number> = {};
      payments.forEach(payment => {
        if (!gatewayStats[payment.gateway]) {
          gatewayStats[payment.gateway] = 0;
        }
        gatewayStats[payment.gateway] += payment.amount;
      });

      const topGateways = Object.entries(gatewayStats)
        .map(([gateway, revenue]) => ({
          gateway,
          revenue,
          percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Top eventos
      const eventStats: Record<number, { title: string; revenue: number }> = {};
      payments.forEach(payment => {
        const event = payment.registration?.event;
        if (event) {
          if (!eventStats[event.id]) {
            eventStats[event.id] = { title: event.title, revenue: 0 };
          }
          eventStats[event.id].revenue += payment.amount;
        }
      });

      const topEvents = Object.entries(eventStats)
        .map(([eventId, data]) => ({
          eventId: parseInt(eventId),
          eventTitle: data.title,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Crecimiento mensual (comparar con mes anterior)
      const lastMonthStart = new Date(startDate);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      const lastMonthEnd = new Date(startDate);
      lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);

      const lastMonthPayments = await Payment.findAll({
        where: {
          status: 'completed',
          createdAt: {
            [Op.gte]: lastMonthStart,
            [Op.lte]: lastMonthEnd
          }
        }
      });

      const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const monthlyGrowth = lastMonthRevenue > 0
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      const stats = {
        totalRevenue,
        totalCommissions,
        totalRefunds,
        netProfit,
        transactionCount,
        averageTransactionValue,
        topGateways,
        topEvents,
        monthlyGrowth
      };

      // Guardar en caché
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(stats));

      return stats;
    } catch (error) {
      logger.error('Error getting financial stats', { error });
      throw error;
    }
  }

  /**
   * Valida parámetros de entrada
   */
  private static validateInput(params: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params.startDate && params.endDate) {
      if (params.startDate > params.endDate) {
        errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }

    if (params.amount && params.amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (params.gateway && !['paypal', 'stripe', 'neonet', 'bam'].includes(params.gateway)) {
      errors.push('Pasarela de pago no válida');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Instancia singleton del servicio financiero
 */
let financeServiceInstance: FinanceService | null = null;

/**
 * Factory para obtener instancia del servicio financiero
 */
export function getFinanceService(): FinanceService {
  if (!financeServiceInstance) {
    financeServiceInstance = new FinanceService();
  }

  return financeServiceInstance;
}

export const financeService = getFinanceService();