/**
 * @fileoverview Servicio de Gestión de Reglas de Capacidad para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para reglas específicas de capacidad
 */

import { CapacityRule } from '../models/CapacityRule';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';

/**
 * Servicio para gestión de reglas de capacidad
 */
export class CapacityRuleService {

  /**
   * Crea una regla de capacidad
   */
  async createCapacityRule(eventId: number, ruleData: any, userId: number): Promise<ApiResponse<CapacityRule>> {
    try {
      const rule = await CapacityRule.create({
        eventId,
        ...ruleData,
        createdBy: userId
      });

      return {
        success: true,
        message: 'Regla de capacidad creada exitosamente',
        data: rule,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error creando regla de capacidad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene reglas activas para un evento
   */
  async getActiveRules(eventId: number): Promise<ApiResponse<CapacityRule[]>> {
    try {
      const rules = await CapacityRule.findAll({
        where: { eventId, isActive: true },
        order: [['priority', 'DESC']]
      });

      return {
        success: true,
        message: 'Reglas obtenidas exitosamente',
        data: rules,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error obteniendo reglas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const capacityRuleService = new CapacityRuleService();
