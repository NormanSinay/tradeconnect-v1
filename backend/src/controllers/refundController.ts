/**
 * @fileoverview Controlador de Reembolsos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de reembolsos
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { refundService } from '../services/refundService';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones de reembolso
 */
export class RefundController {

  /**
   * @swagger
   * /api/refunds:
   *   post:
   *     tags: [Refunds]
   *     summary: Procesar reembolso
   *     description: Procesa una solicitud de reembolso para un pago
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - transactionId
   *               - amount
   *               - reason
   *             properties:
   *               transactionId:
   *                 type: string
   *                 example: "txn_123456789"
   *               amount:
   *                 type: number
   *                 example: 100.00
   *               reason:
   *                 type: string
   *                 example: "cancelacion_evento"
   *               description:
   *                 type: string
   *                 example: "Reembolso por cancelación del evento"
   *     responses:
   *       200:
   *         description: Reembolso procesado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Pago no encontrado
   *       409:
   *         description: Reembolso no elegible
   *       500:
   *         description: Error interno del servidor
   */
  async processRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos de administrador o soporte
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('refund_payment')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para procesar reembolsos',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const refundData = req.body;

      const result = await refundService.processRefund(refundData);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }

    } catch (error) {
      logger.error('Error processing refund:', error);
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
   * /api/refunds/{refundId}:
   *   get:
   *     tags: [Refunds]
   *     summary: Obtener información de reembolso
   *     description: Obtiene los detalles de un reembolso específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: refundId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del reembolso
   *     responses:
   *       200:
   *         description: Reembolso obtenido exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Reembolso no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refundId } = req.params;

      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('view_payments')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para ver reembolsos',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await refundService.getRefund(refundId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }

    } catch (error) {
      logger.error('Error getting refund:', error);
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
   * /api/refunds/payment/{paymentId}:
   *   get:
   *     tags: [Refunds]
   *     summary: Obtener reembolsos de un pago
   *     description: Obtiene todos los reembolsos asociados a un pago específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: paymentId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del pago
   *     responses:
   *       200:
   *         description: Reembolsos obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getRefundsByPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const paymentIdNum = parseInt(paymentId);

      if (isNaN(paymentIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de pago inválido',
          error: 'INVALID_PAYMENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('view_payments')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para ver reembolsos',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await refundService.getRefundsByPayment(paymentIdNum);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }

    } catch (error) {
      logger.error('Error getting refunds by payment:', error);
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
   * /api/refunds/{refundId}/cancel:
   *   post:
   *     tags: [Refunds]
   *     summary: Cancelar reembolso
   *     description: Cancela un reembolso pendiente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: refundId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del reembolso
   *     responses:
   *       200:
   *         description: Reembolso cancelado exitosamente
   *       400:
   *         description: Reembolso no cancelable
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Reembolso no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async cancelRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refundId } = req.params;

      // Verificar permisos de administrador
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('refund_payment')) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para cancelar reembolsos',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await refundService.cancelRefund(refundId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }

    } catch (error) {
      logger.error('Error cancelling refund:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtiene código de estado HTTP basado en el error
   */
  private getStatusCodeFromError(error?: string): number {
    switch (error) {
      case 'VALIDATION_ERROR':
      case 'INVALID_REFUND_AMOUNT':
      case 'INVALID_PAYMENT_ID':
        return HTTP_STATUS.BAD_REQUEST;
      case 'UNAUTHORIZED':
        return HTTP_STATUS.UNAUTHORIZED;
      case 'FORBIDDEN':
      case 'INSUFFICIENT_PERMISSIONS':
        return HTTP_STATUS.FORBIDDEN;
      case 'PAYMENT_NOT_FOUND':
      case 'REFUND_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'REFUND_ALREADY_EXISTS':
      case 'PAYMENT_NOT_REFUNDABLE':
      case 'REFUND_NOT_CANCELLABLE':
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const refundController = new RefundController();
