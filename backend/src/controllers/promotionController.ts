/**
 * @fileoverview Controlador de Promociones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de promociones
 *
 * Archivo: backend/src/controllers/promotionController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { promotionService } from '../services/promotionService';
import { promoCodeService } from '../services/promoCodeService';
import {
  CreatePromotionRequest,
  UpdatePromotionRequest,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
  ValidatePromoCodeRequest,
  ApplyPromoCodeRequest,
  PromotionFilters,
  PromoCodeFilters
} from '../types/promotion.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones de promociones
 */
export class PromotionController {

  /**
   * @swagger
   * /api/promotions:
   *   post:
   *     tags: [Promotions]
   *     summary: Crear una nueva promoción
   *     description: Crea una promoción en el sistema
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePromotionRequest'
   *     responses:
   *       201:
   *         description: Promoción creada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async createPromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const promotionData: CreatePromotionRequest = req.body;

      const result = await promotionService.createPromotion(promotionData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error creando promoción:', error);
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
   * /api/promotions:
   *   get:
   *     tags: [Promotions]
   *     summary: Listar promociones
   *     description: Obtiene una lista de promociones con filtros opcionales
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [GENERAL, EVENT_SPECIFIC, CATEGORY_SPECIFIC, MEMBERSHIP]
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Lista de promociones obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getPromotions(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        type,
        isActive,
        startDate,
        endDate
      } = req.query;

      const filters: PromotionFilters = {
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
        type: type as any,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        createdBy: userId // Solo mostrar promociones del usuario
      };

      const result = await promotionService.getPromotions(filters);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo promociones:', error);
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
   * /api/promotions/{id}:
   *   get:
   *     tags: [Promotions]
   *     summary: Obtener promoción por ID
   *     description: Obtiene los detalles de una promoción específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Promoción obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Promoción no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async getPromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotionId = parseInt(id);

      if (isNaN(promotionId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de promoción inválido',
          error: 'INVALID_PROMOTION_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await promotionService.getPromotionById(promotionId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo promoción:', error);
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
   * /api/promotions/{id}:
   *   put:
   *     tags: [Promotions]
   *     summary: Actualizar promoción
   *     description: Actualiza la información de una promoción específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePromotionRequest'
   *     responses:
   *       200:
   *         description: Promoción actualizada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Promoción no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async updatePromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { id } = req.params;
      const promotionId = parseInt(id);

      if (isNaN(promotionId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de promoción inválido',
          error: 'INVALID_PROMOTION_ID',
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

      const updateData: UpdatePromotionRequest = req.body;

      const result = await promotionService.updatePromotion(promotionId, updateData, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error actualizando promoción:', error);
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
   * /api/promotions/{id}:
   *   delete:
   *     tags: [Promotions]
   *     summary: Eliminar promoción
   *     description: Elimina una promoción del sistema (soft delete)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Promoción eliminada exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Promoción no encontrada
   *       409:
   *         description: Promoción tiene códigos promocionales activos
   *       500:
   *         description: Error interno del servidor
   */
  async deletePromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotionId = parseInt(id);

      if (isNaN(promotionId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de promoción inválido',
          error: 'INVALID_PROMOTION_ID',
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

      const result = await promotionService.deletePromotion(promotionId, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error eliminando promoción:', error);
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
   * /api/promotions/{id}/activate:
   *   post:
   *     tags: [Promotions]
   *     summary: Activar promoción
   *     description: Activa una promoción específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Promoción activada exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Promoción no encontrada
   *       409:
   *         description: Promoción ya está activa
   *       500:
   *         description: Error interno del servidor
   */
  async activatePromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotionId = parseInt(id);

      if (isNaN(promotionId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de promoción inválido',
          error: 'INVALID_PROMOTION_ID',
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

      const result = await promotionService.activatePromotion(promotionId, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error activando promoción:', error);
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
   * /api/promotions/{id}/deactivate:
   *   post:
   *     tags: [Promotions]
   *     summary: Desactivar promoción
   *     description: Desactiva una promoción específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Promoción desactivada exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Promoción no encontrada
   *       409:
   *         description: Promoción ya está inactiva
   *       500:
   *         description: Error interno del servidor
   */
  async deactivatePromotion(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotionId = parseInt(id);

      if (isNaN(promotionId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de promoción inválido',
          error: 'INVALID_PROMOTION_ID',
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

      const result = await promotionService.deactivatePromotion(promotionId, userId);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error desactivando promoción:', error);
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
      case 'PROMOTION_NOT_FOUND':
      case 'PROMO_CODE_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'PROMOTION_ALREADY_ACTIVE':
      case 'PROMOTION_ALREADY_INACTIVE':
      case 'PROMOTION_HAS_ACTIVE_PROMO_CODES':
      case 'PROMO_CODE_ALREADY_EXISTS':
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const promotionController = new PromotionController();