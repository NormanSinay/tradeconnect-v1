/**
 * @fileoverview Controlador de Validación FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controlador para validación de NIT y CUI
 */

import { Request, Response } from 'express';
import { getNitValidationService } from '../services/nitValidationService';
import { getCuiValidationService } from '../services/cuiValidationService';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';

/**
 * Controlador de validación FEL
 */
export class FelValidationController {
  private nitService = getNitValidationService();
  private cuiService = getCuiValidationService();

  /**
   * Valida un NIT
   */
  async validateNit(req: Request, res: Response): Promise<void> {
    try {
      const { nit } = req.body;

      if (!nit) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'NIT es requerido',
          error: 'MISSING_NIT',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.nitService.validateNit(nit);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      logger.error('Error validating NIT', {
        nit: req.body.nit,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al validar NIT',
        error: 'NIT_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Valida un CUI
   */
  async validateCui(req: Request, res: Response): Promise<void> {
    try {
      const { cui } = req.body;

      if (!cui) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'CUI es requerido',
          error: 'MISSING_CUI',
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.cuiService.validateCui(cui);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      logger.error('Error validating CUI', {
        cui: req.body.cui,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al validar CUI',
        error: 'CUI_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtiene estadísticas de validaciones
   */
  async getValidationStats(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implementar estadísticas de validaciones
      const result: ApiResponse<any> = {
        success: true,
        message: 'Estadísticas de validaciones obtenidas (simulado)',
        data: {
          nit: { total: 150, success: 140, failed: 10 },
          cui: { total: 75, success: 70, failed: 5 }
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error getting validation stats', {
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al obtener estadísticas de validaciones',
        error: 'VALIDATION_STATS_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }
}

/**
 * Instancia singleton del controlador de validación FEL
 */
let felValidationControllerInstance: FelValidationController | null = null;

/**
 * Factory para obtener instancia del controlador de validación FEL
 */
export function getFelValidationController(): FelValidationController {
  if (!felValidationControllerInstance) {
    felValidationControllerInstance = new FelValidationController();
  }

  return felValidationControllerInstance;
}

export const felValidationController = getFelValidationController();