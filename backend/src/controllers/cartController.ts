/**
 * @fileoverview Controlador del Carrito para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controlador REST para gestión del carrito de compras
 *
 * Archivo: backend/src/controllers/cartController.ts
 */

import { Request, Response } from 'express';
import { cartService } from '../services/cartService';
import { cartAbandonmentService } from '../services/cartAbandonmentService';
import {
  CartItemData,
  CartUpdateData,
  PromoCodeData,
  CartResponse,
  CartCalculationResponse
} from '../types/cart.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API para gestión del carrito de compras
 */


/**
 * Controlador para operaciones del carrito de compras
 */
export class CartController {

  /**
   * @swagger
   * /api/cart:
   *   get:
   *     tags: [Cart]
   *     summary: Obtener carrito actual
   *     description: Obtiene el carrito de compras del usuario actual o por sesión
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-session-id
   *         schema:
   *           type: string
   *         description: ID de sesión del carrito (alternativo a autenticación)
   *         required: false
   *       - in: query
   *         name: sessionId
   *         schema:
   *           type: string
   *         description: ID de sesión alternativo como parámetro query
   *         required: false
   *     responses:
   *       200:
   *         description: Carrito obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Carrito obtenido exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/CartResponse'
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Se requiere userId o sessionId
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Se requiere userId o sessionId"
   *                 error:
   *                   type: string
   *                   example: "INVALID_REQUEST"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Carrito no encontrado
   */
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

      if (!userId && !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await cartService.getCart(userId || 0, sessionId || '');

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error obteniendo carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/cart/add:
   *   post:
   *     tags: [Cart]
   *     summary: Agregar item al carrito
   *     description: Agrega un nuevo item al carrito de compras
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-session-id
   *         schema:
   *           type: string
   *         description: ID de sesión del carrito (alternativo a autenticación)
   *         required: false
   *       - in: query
   *         name: sessionId
   *         schema:
   *           type: string
   *         description: ID de sesión alternativo como parámetro query
   *         required: false
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CartItemRequest'
   *     responses:
   *       201:
   *         description: Item agregado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Item agregado al carrito exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/CartResponse'
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Datos inválidos o se requiere userId/sessionId
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Se requiere userId o sessionId"
   *                 error:
   *                   type: string
   *                   example: "INVALID_REQUEST"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Evento no encontrado
   *       409:
   *         description: Evento sin disponibilidad
   */
  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

      if (!userId && !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const itemData: CartItemData = req.body;
      const result = await cartService.addItem(userId || 0, sessionId || '', itemData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error agregando item al carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
    * @swagger
    * /api/cart/update:
    *   put:
    *     tags: [Cart]
    *     summary: Actualizar item del carrito
    *     description: Actualiza la cantidad o datos de un item en el carrito
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: header
    *         name: x-session-id
    *         schema:
    *           type: string
    *         description: ID de sesión del carrito (alternativo a autenticación)
    *         required: false
    *       - in: query
    *         name: sessionId
    *         schema:
    *           type: string
    *         description: ID de sesión alternativo como parámetro query
    *         required: false
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/CartUpdateRequest'
    *     responses:
    *       200:
    *         description: Item actualizado exitosamente
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: true
    *                 message:
    *                   type: string
    *                   example: "Item actualizado exitosamente"
    *                 data:
    *                   $ref: '#/components/schemas/CartResponse'
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       400:
    *         description: Datos inválidos o se requiere userId/sessionId
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: false
    *                 message:
    *                   type: string
    *                   example: "Se requiere userId o sessionId"
    *                 error:
    *                   type: string
    *                   example: "INVALID_REQUEST"
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       401:
    *         description: No autorizado
    *       404:
    *         description: Item no encontrado
    */
  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

      if (!userId && !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: CartUpdateData = req.body;
      const result = await cartService.updateItem(userId || 0, sessionId || '', updateData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error actualizando item del carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
    * @swagger
    * /api/cart/remove/{itemId}:
    *   delete:
    *     tags: [Cart]
    *     summary: Remover item del carrito
    *     description: Elimina un item específico del carrito
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: header
    *         name: x-session-id
    *         schema:
    *           type: string
    *         description: ID de sesión del carrito (alternativo a autenticación)
    *         required: false
    *       - in: query
    *         name: sessionId
    *         schema:
    *           type: string
    *         description: ID de sesión alternativo como parámetro query
    *         required: false
    *       - in: path
    *         name: itemId
    *         required: true
    *         schema:
    *           type: integer
    *         description: ID del item a remover
    *     responses:
    *       200:
    *         description: Item removido exitosamente
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: true
    *                 message:
    *                   type: string
    *                   example: "Item removido del carrito exitosamente"
    *                 data:
    *                   $ref: '#/components/schemas/CartResponse'
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       400:
    *         description: Datos inválidos o se requiere userId/sessionId
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: false
    *                 message:
    *                   type: string
    *                   example: "Se requiere userId o sessionId"
    *                 error:
    *                   type: string
    *                   example: "INVALID_REQUEST"
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       401:
    *         description: No autorizado
    *       404:
    *         description: Item no encontrado
    */
  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

      if (!userId && !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const itemId = parseInt(req.params.itemId);
      const result = await cartService.removeItem(userId || 0, sessionId || '', itemId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error removiendo item del carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
    * @swagger
    * /api/cart/clear:
    *   delete:
    *     tags: [Cart]
    *     summary: Limpiar carrito
    *     description: Elimina todos los items del carrito
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: header
    *         name: x-session-id
    *         schema:
    *           type: string
    *         description: ID de sesión del carrito (alternativo a autenticación)
    *         required: false
    *       - in: query
    *         name: sessionId
    *         schema:
    *           type: string
    *         description: ID de sesión alternativo como parámetro query
    *         required: false
    *     responses:
    *       200:
    *         description: Carrito limpiado exitosamente
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: true
    *                 message:
    *                   type: string
    *                   example: "Carrito limpiado exitosamente"
    *                 data:
    *                   type: boolean
    *                   example: true
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       400:
    *         description: Se requiere userId o sessionId
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: false
    *                 message:
    *                   type: string
    *                   example: "Se requiere userId o sessionId"
    *                 error:
    *                   type: string
    *                   example: "INVALID_REQUEST"
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       401:
    *         description: No autorizado
    */
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

      if (!userId && !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await cartService.clearCart(userId || 0, sessionId || '');

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error limpiando carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
    * @swagger
    * /api/cart/apply-promo:
    *   post:
    *     tags: [Cart]
    *     summary: Aplicar código promocional
    *     description: Aplica un código promocional al carrito
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: header
    *         name: x-session-id
    *         schema:
    *           type: string
    *         description: ID de sesión del carrito (alternativo a autenticación)
    *         required: false
    *       - in: query
    *         name: sessionId
    *         schema:
    *           type: string
    *         description: ID de sesión alternativo como parámetro query
    *         required: false
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/PromoCodeRequest'
    *     responses:
    *       200:
    *         description: Código promocional aplicado exitosamente
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: true
    *                 message:
    *                   type: string
    *                   example: "Código promocional aplicado exitosamente"
    *                 data:
    *                   $ref: '#/components/schemas/CartResponse'
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       400:
    *         description: Código promocional inválido o se requiere userId/sessionId
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: false
    *                 message:
    *                   type: string
    *                   example: "Código promocional inválido"
    *                 error:
    *                   type: string
    *                   example: "INVALID_PROMO_CODE"
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       401:
    *         description: No autorizado
    */
  async applyPromoCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

      if (!userId && !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const promoData: PromoCodeData = req.body;
      const result = await cartService.applyPromoCode(userId || 0, sessionId || '', promoData.code);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error aplicando código promocional:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
    * @swagger
    * /api/cart/calculate:
    *   get:
    *     tags: [Cart]
    *     summary: Calcular totales del carrito
    *     description: Recalcula los totales del carrito sin modificarlo
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: header
    *         name: x-session-id
    *         schema:
    *           type: string
    *         description: ID de sesión del carrito (alternativo a autenticación)
    *         required: false
    *       - in: query
    *         name: sessionId
    *         schema:
    *           type: string
    *         description: ID de sesión alternativo como parámetro query
    *         required: false
    *     responses:
    *       200:
    *         description: Cálculo completado exitosamente
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: true
    *                 message:
    *                   type: string
    *                   example: "Cálculo completado exitosamente"
    *                 data:
    *                   type: object
    *                   properties:
    *                     subtotal:
    *                       type: number
    *                       example: 150.00
    *                     discountAmount:
    *                       type: number
    *                       example: 15.00
    *                     total:
    *                       type: number
    *                       example: 135.00
    *                     currency:
    *                       type: string
    *                       example: "GTQ"
    *                     appliedDiscounts:
    *                       type: array
    *                       items:
    *                         type: object
    *                         properties:
    *                           type:
    *                             type: string
    *                             example: "promo"
    *                           description:
    *                             type: string
    *                             example: "Código promocional: DESCUENTO20"
    *                           amount:
    *                             type: number
    *                             example: 15.00
    *                           percentage:
    *                             type: number
    *                             example: 10
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       400:
    *         description: Se requiere userId o sessionId
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 success:
    *                   type: boolean
    *                   example: false
    *                 message:
    *                   type: string
    *                   example: "Se requiere userId o sessionId"
    *                 error:
    *                   type: string
    *                   example: "INVALID_REQUEST"
    *                 timestamp:
    *                   type: string
    *                   format: date-time
    *       401:
    *         description: No autorizado
    */
  async calculateCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const sessionId = req.headers['x-session-id'] as string || req.query.sessionId as string;

      if (!userId && !sessionId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await cartService.calculateCart(userId || 0, sessionId || '');

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error calculando carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Convierte códigos de error a códigos HTTP
   */
  private getStatusCodeFromError(error?: string): number {
    switch (error) {
      case 'UNAUTHENTICATED':
        return 401;
      case 'INSUFFICIENT_PERMISSIONS':
        return 403;
      case 'NOT_FOUND':
      case 'CART_NOT_FOUND':
      case 'ITEM_NOT_FOUND':
        return 404;
      case 'INVALID_REQUEST':
      case 'INVALID_PROMO_CODE':
        return 400;
      case 'INSUFFICIENT_AVAILABILITY':
        return 409;
      default:
        return 500;
    }
  }
}

export const cartController = new CartController();
