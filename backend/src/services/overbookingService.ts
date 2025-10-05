/**
 * Servicio de Gestión de Overbooking para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para control de overbooking
 */

import { Overbooking } from '../models/Overbooking';
import { Capacity } from '../models/Capacity';
import { Event } from '../models/Event';
import { EventRegistration } from '../models/EventRegistration';
import { OverbookingConfig, OverbookingRiskLevel } from '../types/capacity.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { EventEmitter } from 'events';
import { Op } from 'sequelize';

/**
 * Servicio para gestión de overbooking
 */
export class OverbookingService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Configura overbooking para un evento
   */
  async configureOverbooking(eventId: number, config: any, userId: number): Promise<ApiResponse<Overbooking>> {
    try {
      const [overbooking, created] = await Overbooking.upsert({
        eventId,
        maxPercentage: config.maxPercentage || 0,
        currentPercentage: 0,
        riskLevel: 'LOW',
        autoActions: config.autoActions || {
          alertAdmins: true,
          notifyUsers: false,
          offerAlternatives: false
        },
        isActive: config.isActive !== false,
        createdBy: userId
      });

      return {
        success: true,
        message: `Overbooking ${created ? 'configurado' : 'actualizado'} exitosamente`,
        data: overbooking,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error configurando overbooking:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estado de overbooking
   */
  async getOverbookingStatus(eventId: number): Promise<ApiResponse<any>> {
    try {
      const overbooking = await Overbooking.findOne({
        where: { eventId, isActive: true }
      });

      if (!overbooking) {
        return {
          success: false,
          message: 'Overbooking no configurado',
          error: 'OVERBOOKING_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular estadísticas actuales
      const capacity = await Capacity.findOne({
        where: { eventId, isActive: true }
      });

      if (!capacity) {
        return {
          success: false,
          message: 'Capacidad no configurada para este evento',
          error: 'CAPACITY_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      const confirmedCount = await EventRegistration.count({
        where: {
          eventId,
          status: { [Op.in]: ['confirmed', 'attended'] }
        }
      });

      const currentOverbookingPercentage = capacity.totalCapacity > 0
        ? ((confirmedCount - capacity.totalCapacity) / capacity.totalCapacity) * 100
        : 0;

      // Determinar nivel de riesgo basado en configuración
      let riskLevel: OverbookingRiskLevel = 'LOW';
      if (currentOverbookingPercentage > overbooking.maxPercentage) {
        riskLevel = 'CRITICAL';
      } else if (currentOverbookingPercentage > overbooking.maxPercentage * 0.8) {
        riskLevel = 'HIGH';
      } else if (currentOverbookingPercentage > overbooking.maxPercentage * 0.5) {
        riskLevel = 'MEDIUM';
      }

      return {
        success: true,
        message: 'Estado de overbooking obtenido exitosamente',
        data: {
          ...overbooking.toJSON(),
          currentPercentage: currentOverbookingPercentage,
          riskLevel,
          isAtRisk: riskLevel !== 'LOW',
          lastUpdated: new Date()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estado de overbooking:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene alertas activas de overbooking
   */
  async getActiveAlerts(eventId: number): Promise<ApiResponse<any[]>> {
    try {
      const status = await this.getOverbookingStatus(eventId);
      if (!status.success) {
        return {
          success: false,
          message: status.message,
          error: status.error,
          timestamp: new Date().toISOString()
        };
      }

      const alerts: any[] = [];

      if (status.data.isAtRisk) {
        alerts.push({
          id: `overbooking-${eventId}-${Date.now()}`,
          eventId,
          type: 'OVERBOOKING_RISK',
          severity: status.data.riskLevel === 'CRITICAL' ? 'HIGH' :
                   status.data.riskLevel === 'HIGH' ? 'MEDIUM' : 'LOW',
          message: `Overbooking actual: ${status.data.currentPercentage.toFixed(1)}% (máximo permitido: ${status.data.maxPercentage}%)`,
          triggeredAt: new Date(),
          acknowledged: false
        });
      }

      return {
        success: true,
        message: 'Alertas activas obtenidas exitosamente',
        data: alerts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo alertas activas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene event emitter
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const overbookingService = new OverbookingService();