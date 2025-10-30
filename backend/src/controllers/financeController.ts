/**
 * @fileoverview Controlador de Gestión Financiera para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión financiera, reportes y KPIs
 *
 * Archivo: backend/src/controllers/financeController.ts
 */

import { Request, Response } from 'express';
import { FinanceService, CommissionCalculation, FinancialReport, FinancialKPIs, TrendData, RefundPolicy, BulkRefundRequest } from '../services/financeService';
import { successResponse, errorResponse } from '../utils/common.utils';
import { logger } from '../utils/logger';
import { PaymentGateway } from '../utils/constants';
import { Op } from 'sequelize';
import { Payment, Registration, Event } from '../models';

export class FinanceController {
  // ====================================================================
  // COMISIONES
  // ====================================================================

  /**
   * Calcula comisiones por pasarela de pago
   */
  static async getGatewayCommissions(req: Request, res: Response): Promise<void> {
    try {
      const { gateway, amount, currency } = req.query;

      // Validaciones
      if (!gateway || !['paypal', 'stripe', 'neonet', 'bam'].includes(gateway as string)) {
        res.status(400).json(errorResponse('Pasarela de pago inválida'));
        return;
      }

      const amountNum = parseFloat(amount as string);
      if (!amount || isNaN(amountNum) || amountNum <= 0) {
        res.status(400).json(errorResponse('Monto inválido'));
        return;
      }

      const result = await FinanceService.calculateGatewayCommissions(
        gateway as PaymentGateway,
        amountNum,
        currency as string || 'GTQ'
      );

      res.json(successResponse(result, 'Comisiones calculadas exitosamente'));
    } catch (error) {
      logger.error('Error calculating gateway commissions', { error, query: req.query });
      res.status(500).json(errorResponse('Error al calcular comisiones'));
    }
  }

  /**
   * Obtiene comisiones por evento
   */
  static async getEventCommissions(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId || isNaN(parseInt(eventId, 10))) {
        res.status(400).json(errorResponse('ID de evento inválido'));
        return;
      }

      const result = await FinanceService.calculateEventCommissions(parseInt(eventId, 10));

      res.json(successResponse(result, 'Comisiones del evento obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting event commissions', { error, eventId: req.params.eventId });

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al obtener comisiones del evento'));
    }
  }

  /**
   * Obtiene comisiones por período
   */
  static async getPeriodCommissions(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, gateway } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Fechas de inicio y fin son requeridas'));
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json(errorResponse('Fechas inválidas'));
        return;
      }

      if (start > end) {
        res.status(400).json(errorResponse('La fecha de inicio no puede ser posterior a la fecha de fin'));
        return;
      }

      if (gateway && !['paypal', 'stripe', 'neonet', 'bam'].includes(gateway as string)) {
        res.status(400).json(errorResponse('Pasarela de pago inválida'));
        return;
      }

      const result = await FinanceService.calculatePeriodCommissions(
        start,
        end,
        gateway as PaymentGateway
      );

      res.json(successResponse(result, 'Comisiones del período obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting period commissions', { error, query: req.query });
      res.status(500).json(errorResponse('Error al obtener comisiones del período'));
    }
  }

  // ====================================================================
  // REPORTES FINANCIEROS
  // ====================================================================

  /**
   * Genera reporte financiero completo
   */
  static async getFinancialReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Fechas de inicio y fin son requeridas'));
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json(errorResponse('Fechas inválidas'));
        return;
      }

      if (start > end) {
        res.status(400).json(errorResponse('La fecha de inicio no puede ser posterior a la fecha de fin'));
        return;
      }

      const report = await FinanceService.generateFinancialReport(start, end);

      res.json(successResponse(report, 'Reporte financiero generado exitosamente'));
    } catch (error) {
      logger.error('Error generating financial report', { error, query: req.query });
      res.status(500).json(errorResponse('Error al generar reporte financiero'));
    }
  }

  // ====================================================================
  // KPIs FINANCIEROS
  // ====================================================================

  /**
   * Calcula KPIs financieros
   */
  static async getFinancialKPIs(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json(errorResponse('Fechas de inicio y fin son requeridas'));
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json(errorResponse('Fechas inválidas'));
        return;
      }

      if (start > end) {
        res.status(400).json(errorResponse('La fecha de inicio no puede ser posterior a la fecha de fin'));
        return;
      }

      const kpis = await FinanceService.calculateFinancialKPIs(start, end);

      res.json(successResponse(kpis, 'KPIs financieros calculados exitosamente'));
    } catch (error) {
      logger.error('Error calculating financial KPIs', { error, query: req.query });
      res.status(500).json(errorResponse('Error al calcular KPIs financieros'));
    }
  }

  // ====================================================================
  // ANÁLISIS DE TENDENCIAS
  // ====================================================================

  /**
   * Analiza tendencias financieras
   */
  static async getFinancialTrends(req: Request, res: Response): Promise<void> {
    try {
      const { periods, periodType } = req.query;

      const periodsNum = periods ? parseInt(periods as string, 10) : 12;
      const type = (periodType as string) || 'month';

      if (periodsNum < 1 || periodsNum > 24) {
        res.status(400).json(errorResponse('El número de períodos debe estar entre 1 y 24'));
        return;
      }

      if (!['month', 'week', 'day'].includes(type)) {
        res.status(400).json(errorResponse('Tipo de período inválido. Use: month, week, day'));
        return;
      }

      const trends = await FinanceService.analyzeFinancialTrends(
        periodsNum,
        type as 'month' | 'week' | 'day'
      );

      res.json(successResponse(trends, 'Tendencias financieras analizadas exitosamente'));
    } catch (error) {
      logger.error('Error analyzing financial trends', { error, query: req.query });
      res.status(500).json(errorResponse('Error al analizar tendencias financieras'));
    }
  }

  // ====================================================================
  // REEMBOLSOS
  // ====================================================================

  /**
   * Procesa reembolso automático
   */
  static async processAutomaticRefund(req: Request, res: Response): Promise<void> {
    try {
      const { registrationId } = req.params;
      const { daysBeforeEvent, refundPercentage, reason, conditions } = req.body;

      if (!registrationId || isNaN(parseInt(registrationId, 10))) {
        res.status(400).json(errorResponse('ID de registro inválido'));
        return;
      }

      if (!daysBeforeEvent || typeof daysBeforeEvent !== 'number' || daysBeforeEvent < 0) {
        res.status(400).json(errorResponse('Días antes del evento inválidos'));
        return;
      }

      if (!refundPercentage || typeof refundPercentage !== 'number' || refundPercentage < 0 || refundPercentage > 100) {
        res.status(400).json(errorResponse('Porcentaje de reembolso inválido (0-100)'));
        return;
      }

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        res.status(400).json(errorResponse('Razón del reembolso requerida'));
        return;
      }

      const policy: RefundPolicy = {
        eventId: parseInt(registrationId, 10),
        daysBeforeEvent,
        refundPercentage,
        reason: reason.trim(),
        conditions: Array.isArray(conditions) ? conditions : []
      };

      const result = await FinanceService.processAutomaticRefund(parseInt(registrationId, 10), policy);

      if (result.success) {
        res.json(successResponse(result.data, result.message));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error al procesar reembolso automático'));
      }
    } catch (error) {
      logger.error('Error processing automatic refund', { error, registrationId: req.params.registrationId, body: req.body });
      res.status(500).json(errorResponse('Error interno al procesar reembolso automático'));
    }
  }

  /**
   * Procesa reembolsos masivos
   */
  static async processBulkRefunds(req: Request, res: Response): Promise<void> {
    try {
      const { payments, reason, description, policy } = req.body;

      if (!Array.isArray(payments) || payments.length === 0) {
        res.status(400).json(errorResponse('Lista de pagos requerida'));
        return;
      }

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        res.status(400).json(errorResponse('Razón del reembolso requerida'));
        return;
      }

      // Validar IDs de transacción
      for (const transactionId of payments) {
        if (typeof transactionId !== 'string' || transactionId.trim().length === 0) {
          res.status(400).json(errorResponse('IDs de transacción inválidos'));
          return;
        }
      }

      const request: BulkRefundRequest = {
        payments: payments.map((id: string) => id.trim()),
        reason: reason.trim(),
        description: description?.trim(),
        policy
      };

      const result = await FinanceService.processBulkRefunds(request);

      if (result.success) {
        res.json(successResponse(result.data, result.message));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error al procesar reembolsos masivos'));
      }
    } catch (error) {
      logger.error('Error processing bulk refunds', { error, body: req.body });
      res.status(500).json(errorResponse('Error interno al procesar reembolsos masivos'));
    }
  }

  // ====================================================================
  // TRANSACCIONES
  // ====================================================================

  /**
   * Lista transacciones con filtros y paginación
   */
  static async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [DEBUG] getTransactions called');
      console.log('🔍 [DEBUG] Query params:', req.query);
      console.log('🔍 [DEBUG] User:', req.user);

      const {
        page = 1,
        limit = 50,
        startDate,
        endDate,
        gateway,
        status,
        eventId,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (pageNum < 1 || limitNum < 1 || limitNum > 200) {
        res.status(400).json(errorResponse('Parámetros de paginación inválidos'));
        return;
      }

      if (!['createdAt', 'amount', 'gateway', 'status'].includes(sortBy as string)) {
        res.status(400).json(errorResponse('Campo de ordenamiento inválido'));
        return;
      }

      if (!['ASC', 'DESC'].includes((sortOrder as string).toUpperCase())) {
        res.status(400).json(errorResponse('Orden de ordenamiento inválido'));
        return;
      }

      // Construir filtros
      const filters: any = {
        status: 'completed' // Solo transacciones completadas por defecto
      };

      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt[Op.gte] = new Date(startDate as string);
        if (endDate) filters.createdAt[Op.lte] = new Date(endDate as string);
      }

      if (gateway) filters.gateway = gateway;
      if (status) filters.status = status;

      // Obtener transacciones con paginación
      const { rows: transactions, count: total } = await Payment.findAndCountAll({
        where: filters,
        include: [{
          model: Registration,
          as: 'registration',
          required: false,
          include: [{
            model: Event,
            as: 'event',
            required: false,
            attributes: ['id', 'title']
          }]
        }],
        order: [[sortBy as string, sortOrder as string]],
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });

      // Transformar datos para respuesta
      const transformedTransactions = transactions.map(payment => ({
        id: payment.transactionId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        fee: payment.fee,
        netAmount: payment.netAmount,
        currency: payment.currency,
        gateway: payment.gateway,
        status: payment.status,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        registration: payment.registration ? {
          id: payment.registration.id,
          event: payment.registration.event ? {
            id: payment.registration.event.id,
            title: payment.registration.event.title
          } : undefined,
          user: payment.registration.user ? {
            id: payment.registration.user.id,
            firstName: payment.registration.user.firstName,
            lastName: payment.registration.user.lastName
          } : undefined
        } : undefined
      }));

      const result = {
        transactions: transformedTransactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        },
        filters: {
          startDate,
          endDate,
          gateway,
          status,
          eventId
        }
      };

      console.log('✅ [DEBUG] Transactions retrieved successfully:', { total, transactionCount: transformedTransactions.length });
      res.json(successResponse(result, 'Transacciones obtenidas exitosamente'));
    } catch (error) {
      console.error('❌ [DEBUG] Error in getTransactions:', error);
      logger.error('Error getting transactions', { error, query: req.query });
      res.status(500).json(errorResponse('Error al obtener transacciones'));
    }
  }

  // ====================================================================
  // ESTADÍSTICAS GENERALES
  // ====================================================================

  /**
   * Obtiene estadísticas financieras generales
   */
  static async getFinancialStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [DEBUG] getFinancialStats called');
      console.log('🔍 [DEBUG] User:', req.user);
      const stats = await FinanceService.getFinancialStats();
      console.log('✅ [DEBUG] Stats retrieved successfully:', stats);

      res.json(successResponse(stats, 'Estadísticas financieras obtenidas exitosamente'));
    } catch (error) {
      console.error('❌ [DEBUG] Error in getFinancialStats:', error);
      logger.error('Error getting financial stats', { error });
      res.status(500).json(errorResponse('Error al obtener estadísticas financieras'));
    }
  }
}