/**
 * @fileoverview Controlador de Overbooking para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de overbooking
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { overbookingService } from '../services/overbookingService';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones de overbooking
 */
export class OverbookingController {

  /**
   * Configura overbooking para un evento
   */
  async configureOverbooking(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { eventId } = req.params;
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

      const result = await overbookingService.configureOverbooking(
        parseInt(eventId),
        req.body,
        userId
      );

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);
      }

    } catch (error) {
      logger.error('Error configurando overbooking:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtiene estado de overbooking
   */
  async getOverbookingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const result = await overbookingService.getOverbookingStatus(eventIdNum);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo estado de overbooking:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Ajusta configuración de overbooking
   */
  async adjustOverbooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Implementar lógica de ajuste
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Funcionalidad en desarrollo',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error ajustando overbooking:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Método auxiliar para obtener código de estado HTTP
   */
  private getStatusCodeFromError(errorType?: string): number {
    switch (errorType) {
      case 'OVERBOOKING_NOT_CONFIGURED':
        return HTTP_STATUS.NOT_FOUND;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const overbookingController = new OverbookingController();