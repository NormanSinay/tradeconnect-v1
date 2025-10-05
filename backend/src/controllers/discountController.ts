/**
 * @fileoverview Controlador de Descuentos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de descuentos
 *
 * Archivo: backend/src/controllers/discountController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { discountService } from '../services/discountService';
import { promoCodeService } from '../services/promoCodeService';
import {
  CreateVolumeDiscountRequest,
  CreateEarlyBirdDiscountRequest,
  ApplicableDiscountsRequest
} from '../types/discount.types';
import {
  ValidatePromoCodeRequest,
  ApplyPromoCodeRequest
} from '../types/promotion.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones de descuentos
 */
export class DiscountController {

  // ====================================================================
  // DESCUESTOS POR VOLUMEN
  // ====================================================================

  /**
   * @swagger
   * /api/discounts/volume/{eventId}:
   *   get:
   *     tags: [Discounts]
   *     summary: Obtener descuentos por volumen de un evento
   *     description: Obtiene todos los descuentos por volumen configurados para un evento específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Descuentos por volumen obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getVolumeDiscountsByEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const eventIdNum = parseInt(eventId);

      if (isNaN(eventIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const result = await discountService.getVolumeDiscountsByEvent({
        eventId: eventIdNum,
        isActive: true
      });

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo descuentos por volumen:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // DESCUESTOS EARLY BIRD
  // ====================================================================

  /**
   * @swagger
   * /api/discounts/early-bird/{eventId}:
   *   get:
   *     tags: [Discounts]
   *     summary: Obtener descuentos early bird de un evento
   *     description: Obtiene todos los descuentos early bird configurados para un evento específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: registrationDate
   *         schema:
   *           type: string
   *           format: date-time
   *           description: Fecha de registro para calcular descuento aplicable
   *     responses:
   *       200:
   *         description: Descuentos early bird obtenidos exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getEarlyBirdDiscountsByEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { registrationDate } = req.query;
      const eventIdNum = parseInt(eventId);

      if (isNaN(eventIdNum)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

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

      const result = await discountService.getEarlyBirdDiscountsByEvent({
        eventId: eventIdNum,
        registrationDate: registrationDate ? new Date(registrationDate as string) : undefined,
        isActive: true
      });

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo descuentos early bird:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // VALIDACIÓN Y APLICACIÓN DE CÓDIGOS PROMOCIONALES
  // ====================================================================

  /**
   * @swagger
   * /api/discounts/validate-code:
   *   post:
   *     tags: [Discounts]
   *     summary: Validar código promocional
   *     description: Valida un código promocional antes de aplicarlo
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - eventId
   *             properties:
   *               code:
   *                 type: string
   *                 description: Código promocional a validar
   *               eventId:
   *                 type: integer
   *                 description: ID del evento
   *               userId:
   *                 type: integer
   *                 description: ID del usuario (opcional)
   *               cartTotal:
   *                 type: number
   *                 description: Total del carrito (opcional)
   *     responses:
   *       200:
   *         description: Código validado exitosamente
   *       400:
   *         description: Código inválido o datos incorrectos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async validatePromoCode(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const validationData: ValidatePromoCodeRequest = req.body;

      const result = await promoCodeService.validatePromoCode(validationData);

      // La validación siempre retorna success: true, pero con valid: true/false
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error validando código promocional:', error);
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
   * /api/discounts/apply:
   *   post:
   *     tags: [Discounts]
   *     summary: Aplicar código promocional
   *     description: Aplica un código promocional a una compra
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - eventId
   *               - cartTotal
   *             properties:
   *               code:
   *                 type: string
   *                 description: Código promocional a aplicar
   *               eventId:
   *                 type: integer
   *                 description: ID del evento
   *               cartTotal:
   *                 type: number
   *                 description: Total del carrito
   *               quantity:
   *                 type: integer
   *                 description: Cantidad de items
   *                 default: 1
   *     responses:
   *       200:
   *         description: Código aplicado exitosamente
   *       400:
   *         description: Código inválido o no se puede aplicar
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async applyPromoCode(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const applyData: ApplyPromoCodeRequest = req.body;

      const result = await promoCodeService.applyPromoCode(
        applyData,
        userId,
        {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        }
      );

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.message)).json(result);
      }

    } catch (error) {
      logger.error('Error aplicando código promocional:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // CÁLCULO DE DESCUESTOS APLICABLES
  // ====================================================================

  /**
   * @swagger
   * /api/discounts/applicable:
   *   post:
   *     tags: [Discounts]
   *     summary: Calcular descuentos aplicables
   *     description: Calcula todos los descuentos aplicables para una compra específica
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - eventId
   *               - quantity
   *               - basePrice
   *             properties:
   *               eventId:
   *                 type: integer
   *                 description: ID del evento
   *               userId:
   *                 type: integer
   *                 description: ID del usuario
   *               quantity:
   *                 type: integer
   *                 description: Cantidad de items
   *               registrationDate:
   *                 type: string
   *                 format: date-time
   *                 description: Fecha de registro
   *               basePrice:
   *                 type: number
   *                 description: Precio base
   *               currentDiscounts:
   *                 type: array
   *                 description: Descuentos ya aplicados
   *     responses:
   *       200:
   *         description: Descuentos calculados exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async calculateApplicableDiscounts(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const calculationData: ApplicableDiscountsRequest = req.body;

      const result = await discountService.calculateApplicableDiscounts(calculationData);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error calculando descuentos aplicables:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Método auxiliar para obtener código de estado HTTP desde el tipo de error
   */
  private getStatusCodeFromError(errorType?: string): number {
    switch (errorType) {
      case 'VALIDATION_ERROR':
        return HTTP_STATUS.BAD_REQUEST;
      case 'UNAUTHORIZED':
        return HTTP_STATUS.UNAUTHORIZED;
      case 'INSUFFICIENT_PERMISSIONS':
        return HTTP_STATUS.FORBIDDEN;
      case 'EVENT_NOT_FOUND':
      case 'DISCOUNT_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const discountController = new DiscountController();