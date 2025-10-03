/**
 * @fileoverview Controlador de Pagos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de pagos y transacciones
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Payment, PaymentMethod } from '../models';
import { paymentService } from '../services/paymentService';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';
import { PaymentInitiationData, PaymentConfirmationData, PaymentFilters, PaymentTransaction } from '../types/payment.types';

/**
 * Controlador para manejo de operaciones de pago
 */
export class PaymentController {

  /**
   * @swagger
   * /api/payments/process:
   *   post:
   *     tags: [Payments]
   *     summary: Iniciar procesamiento de pago
   *     description: Inicia una nueva transacción de pago para una inscripción
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - registrationId
   *               - gateway
   *               - paymentType
   *               - amount
   *               - currency
   *               - billingInfo
   *             properties:
   *               registrationId:
   *                 type: integer
   *                 example: 1
   *               gateway:
   *                 type: string
   *                 enum: [paypal, stripe, neonet, bam]
   *                 example: "stripe"
   *               paymentType:
   *                 type: string
   *                 enum: [one_time, recurring, installment, deposit]
   *                 example: "one_time"
   *               amount:
   *                 type: number
   *                 example: 100.00
   *               currency:
   *                 type: string
   *                 enum: [GTQ, USD]
   *                 example: "GTQ"
   *               description:
   *                 type: string
   *                 example: "Inscripción al evento Tech Conference 2024"
   *               billingInfo:
   *                 type: object
   *                 required:
   *                   - firstName
   *                   - lastName
   *                   - email
   *                 properties:
   *                   firstName:
   *                     type: string
   *                     example: "Juan"
   *                   lastName:
   *                     type: string
   *                     example: "Pérez"
   *                   email:
   *                     type: string
   *                     format: email
   *                     example: "juan.perez@email.com"
   *                   phone:
   *                     type: string
   *                     example: "+502 1234-5678"
   *     responses:
   *       200:
   *         description: Pago iniciado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       409:
   *         description: Conflicto (pago ya existe)
   *       500:
   *         description: Error interno del servidor
   */
  async processPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const paymentData: PaymentInitiationData = req.body;

      const result = await paymentService.initiatePayment(paymentData);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }

    } catch (error) {
      logger.error('Error processing payment:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/payments/{transactionId}/status:
   *   get:
   *     tags: [Payments]
   *     summary: Obtener estado de transacción
   *     description: Obtiene el estado actual de una transacción de pago
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: transactionId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la transacción
   *     responses:
   *       200:
   *         description: Estado obtenido exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Transacción no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getPaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      const payment = await Payment.findByTransactionId(transactionId);
      if (!payment) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Transacción no encontrada',
          error: 'PAYMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos (usuario debe ser propietario o admin)
      const userPermissions = req.user?.permissions || [];
      const canViewPayments = userPermissions.includes('view_payments');

      // Si no tiene permisos de admin, verificar que sea el propietario de la inscripción
      if (!canViewPayments) {
        const { Registration } = require('../models');
        const registration = await Registration.findByPk(payment.registrationId);
        if (!registration || registration.userId !== req.user?.id) {
          res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'No tiene permisos para ver esta transacción',
            error: 'FORBIDDEN',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      if (!canViewPayments) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'No tiene permisos para ver esta transacción',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const paymentData: PaymentTransaction = {
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

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estado de transacción obtenido exitosamente',
        data: paymentData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting payment status:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/payments/methods:
   *   get:
   *     tags: [Payments]
   *     summary: Obtener métodos de pago del usuario
   *     description: Obtiene los métodos de pago guardados del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Métodos de pago obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getPaymentMethods(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const paymentMethods = await PaymentMethod.findActiveByUserId(userId);

      const formattedMethods = paymentMethods.map(method => method.toPaymentMethodJSON());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Métodos de pago obtenidos exitosamente',
        data: formattedMethods,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting payment methods:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/payments/history:
   *   get:
   *     tags: [Payments]
   *     summary: Obtener historial de pagos
   *     description: Obtiene el historial de pagos del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Elementos por página
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded, disputed, expired]
   *         description: Filtrar por estado
   *       - in: query
   *         name: gateway
   *         schema:
   *           type: string
   *           enum: [paypal, stripe, neonet, bam]
   *         description: Filtrar por pasarela
   *     responses:
   *       200:
   *         description: Historial obtenido exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getPaymentHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 20,
        status,
        gateway
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {
        '$registration.user_id$': userId // Asumiendo que Registration tiene userId
      };

      if (status) where.status = status;
      if (gateway) where.gateway = gateway;

      const { rows: payments, count: total } = await Payment.findAndCountAll({
        where,
        include: [
          {
            model: require('../models/Registration').Registration,
            as: 'registration',
            attributes: ['id', 'eventId', 'status']
          }
        ],
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id', 'transactionId', 'gateway', 'gatewayTransactionId', 'status',
          'paymentType', 'amount', 'currency', 'fee', 'netAmount',
          'description', 'confirmedAt', 'createdAt', 'updatedAt'
        ]
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Historial de pagos obtenido exitosamente',
        data: {
          payments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting payment history:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/payments/paypal/create:
   *   post:
   *     tags: [Payments]
   *     summary: Crear orden PayPal
   *     description: Crea una nueva orden de pago en PayPal
   *     security:
   *       - bearerAuth: []
   */
  async createPayPalPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Implementación específica para PayPal
    await this.processPayment(req, res);
  }

  /**
   * @swagger
   * /api/payments/stripe/create:
   *   post:
   *     tags: [Payments]
   *     summary: Crear Payment Intent Stripe
   *     description: Crea un nuevo Payment Intent en Stripe
   *     security:
   *       - bearerAuth: []
   */
  async createStripePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Implementación específica para Stripe
    await this.processPayment(req, res);
  }

  /**
   * @swagger
   * /api/payments/neonet/create:
   *   post:
   *     tags: [Payments]
   *     summary: Crear transacción NeoNet
   *     description: Crea una nueva transacción en NeoNet
   *     security:
   *       - bearerAuth: []
   */
  async createNeoNetPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Implementación específica para NeoNet
    await this.processPayment(req, res);
  }

  /**
   * @swagger
   * /api/payments/bam/create:
   *   post:
   *     tags: [Payments]
   *     summary: Crear transacción BAM
   *     description: Crea una nueva transacción en BAM
   *     security:
   *       - bearerAuth: []
   */
  async createBamPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Implementación específica para BAM
    await this.processPayment(req, res);
  }

  /**
   * Obtiene código de estado HTTP basado en el error
   */
  private getStatusCodeFromError(error?: string): number {
    switch (error) {
      case 'VALIDATION_ERROR':
      case 'INVALID_AMOUNT':
      case 'INVALID_REFUND_AMOUNT':
        return HTTP_STATUS.BAD_REQUEST;
      case 'UNAUTHORIZED':
        return HTTP_STATUS.UNAUTHORIZED;
      case 'FORBIDDEN':
        return HTTP_STATUS.FORBIDDEN;
      case 'USER_NOT_FOUND':
      case 'PAYMENT_NOT_FOUND':
      case 'REGISTRATION_NOT_FOUND':
      case 'REFUND_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'EMAIL_ALREADY_EXISTS':
      case 'PAYMENT_ALREADY_EXISTS':
      case 'REFUND_ALREADY_EXISTS':
      case 'INVALID_REGISTRATION_STATUS':
      case 'PAYMENT_NOT_REFUNDABLE':
        return HTTP_STATUS.CONFLICT;
      case 'GATEWAY_UNAVAILABLE':
        return HTTP_STATUS.SERVICE_UNAVAILABLE;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const paymentController = new PaymentController();