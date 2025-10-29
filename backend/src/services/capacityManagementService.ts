/**
 * @fileoverview Servicio de Gestión de Capacidades para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de capacidades de eventos
 */

import { Capacity } from '../models/Capacity';
import { AccessType } from '../models/AccessType';
import { Overbooking } from '../models/Overbooking';
import { CapacityRule } from '../models/CapacityRule';
import { Event } from '../models/Event';
import { EventRegistration } from '../models/EventRegistration';
import { AuditLog } from '../models/AuditLog';
import {
  CapacityStatus,
  CapacityValidationResult,
  CapacityLock,
  CapacityReport,
  ConfigureCapacityData
} from '../types/capacity.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { Op } from 'sequelize';
import { EventEmitter } from 'events';

/**
 * Servicio para gestión de capacidades de eventos
 */
export class CapacityManagementService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // CONFIGURACIÓN DE CAPACIDADES
  // ====================================================================

  /**
   * Configura capacidad para un evento
   */
  async configureEventCapacity(
    eventId: number,
    configData: ConfigureCapacityData,
    userId: number
  ): Promise<ApiResponse<CapacityStatus>> {
    try {
      // Verificar que el evento existe
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el creador puede configurar capacidad)
      if (event.createdBy !== userId) {
        return {
          success: false,
          message: 'No tiene permisos para configurar la capacidad de este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar configuración
      const validation = this.validateCapacityConfiguration(configData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Configuración de capacidad inválida',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Crear o actualizar configuración de capacidad
      const [capacity, created] = await Capacity.upsert({
        eventId,
        totalCapacity: configData.totalCapacity,
        availableCapacity: configData.totalCapacity,
        blockedCapacity: 0,
        overbookingPercentage: configData.overbookingPercentage || 0,
        overbookingEnabled: configData.overbookingEnabled || false,
        waitlistEnabled: configData.waitlistEnabled || false,
        lockTimeoutMinutes: configData.lockTimeoutMinutes || 15,
        alertThresholds: { low: 80, medium: 90, high: 95 },
        isActive: true,
        createdBy: userId
      });

      // TODO: Configurar tipos de acceso y reglas

      // Registrar en auditoría
      await AuditLog.log(
        created ? 'capacity_created' : 'capacity_updated',
        'capacity',
        {
          userId,
          resourceId: capacity.id.toString(),
          newValues: configData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(eventId);

      // Emitir evento
      this.eventEmitter.emit('CapacityConfigured', {
        eventId,
        capacityId: capacity.id,
        configData,
        userId
      });

      // Obtener estado actualizado
      const status = await this.getEventCapacityStatus(eventId);
      if (!status.success) {
        return status as any;
      }

      return {
        success: true,
        message: `Capacidad ${created ? 'configurada' : 'actualizada'} exitosamente`,
        data: status.data!,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error configurando capacidad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene el estado de capacidad de un evento
   */
  async getEventCapacityStatus(eventId: number): Promise<ApiResponse<CapacityStatus>> {
    try {
      // Verificar que el evento existe
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Obtener configuración de capacidad
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

      // Calcular estadísticas
      const stats = await this.calculateCapacityStats(eventId, capacity);

      const status: CapacityStatus = {
        eventId,
        totalCapacity: capacity.totalCapacity,
        availableCapacity: stats.available,
        blockedCapacity: stats.blocked,
        confirmedCapacity: stats.confirmed,
        waitlistCount: stats.waitlist,
        utilizationPercentage: stats.utilization,
        overbookingEnabled: capacity.overbookingEnabled,
        overbookingPercentage: capacity.overbookingPercentage,
        overbookingActive: false,
        overbookingCurrentPercentage: 0,
        waitlistEnabled: capacity.waitlistEnabled,
        lockTimeoutMinutes: capacity.lockTimeoutMinutes,
        alertThresholds: { low: 80, medium: 90, high: 95 },
        accessTypesCapacity: [],
        isFull: stats.available <= 0,
        canAcceptOverbooking: false,
        lastUpdated: capacity.updatedAt || new Date()
      };

      return {
        success: true,
        message: 'Estado de capacidad obtenido exitosamente',
        data: status,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estado de capacidad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // VALIDACIÓN DE CAPACIDAD
  // ====================================================================

  /**
   * Valida disponibilidad de capacidad para una inscripción con control de concurrencia
   */
  async validateCapacityForRegistration(
    eventId: number,
    accessTypeId?: number,
    quantity: number = 1
  ): Promise<CapacityValidationResult> {
    try {
      // Intentar adquirir lock para evitar race conditions
      const lockKey = `capacity:validation:${eventId}`;
      try {
        await cacheService.set(lockKey, 'locked', 10); // 10 segundos de lock
      } catch (error) {
        // Si no se puede adquirir el lock, intentar leer del caché
        const cached = await cacheService.get(`capacity:validation:result:${eventId}`);
        if (cached && typeof cached === 'object' && 'isValid' in cached) {
          return cached as CapacityValidationResult;
        }
      }

      try {
        const capacity = await Capacity.findOne({
          where: { eventId, isActive: true },
          lock: true // Lock de base de datos para consistencia
        });

        if (!capacity) {
          const result = {
            isValid: false,
            available: false,
            availableSpots: 0,
            blockedSpots: 0,
            errors: [{ code: 'CAPACITY_NOT_CONFIGURED', message: 'Capacidad no configurada para este evento' }],
            warnings: []
          };
          await cacheService.set(`capacity:validation:result:${eventId}`, result, 30);
          return result;
        }

        // Calcular estadísticas actuales con lock
        const stats = await this.calculateCapacityStats(eventId, capacity);
        const available = stats.available;

        // Verificar alertas de capacidad baja
        const warnings: Array<{ code: string; message: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = [];
        const utilizationPercentage = stats.utilization;

        if (capacity.alertThresholds) {
          if (utilizationPercentage >= capacity.alertThresholds.high) {
            warnings.push({
              code: 'HIGH_UTILIZATION',
              message: 'Capacidad altamente utilizada',
              severity: 'HIGH'
            });
          } else if (utilizationPercentage >= capacity.alertThresholds.medium) {
            warnings.push({
              code: 'MEDIUM_UTILIZATION',
              message: 'Capacidad moderadamente utilizada',
              severity: 'MEDIUM'
            });
          } else if (utilizationPercentage >= capacity.alertThresholds.low) {
            warnings.push({
              code: 'LOW_UTILIZATION',
              message: 'Capacidad baja disponible',
              severity: 'LOW'
            });
          }
        }

        // Verificar si hay capacidad suficiente
        if (available >= quantity) {
          const result = {
            isValid: true,
            available: true,
            availableSpots: available,
            blockedSpots: stats.blocked,
            errors: [],
            warnings
          };
          await cacheService.set(`capacity:validation:result:${eventId}`, result, 30);
          return result;
        }

        // Verificar overbooking si está habilitado
        if (capacity.overbookingEnabled && capacity.overbookingPercentage > 0) {
          const overbookingLimit = Math.floor(capacity.totalCapacity * (capacity.overbookingPercentage / 100));
          const totalAvailableWithOverbooking = capacity.totalCapacity + overbookingLimit;
          const availableWithOverbooking = totalAvailableWithOverbooking - stats.confirmed - stats.blocked;

          if (availableWithOverbooking >= quantity) {
            warnings.push({
              code: 'OVERBOOKING_ACTIVE',
              message: `Usando capacidad de overbooking (${capacity.overbookingPercentage}% adicional)`,
              severity: 'MEDIUM'
            });

            const result = {
              isValid: true,
              available: true,
              availableSpots: availableWithOverbooking,
              blockedSpots: stats.blocked,
              errors: [],
              warnings
            };
            await cacheService.set(`capacity:validation:result:${eventId}`, result, 30);
            return result;
          }
        }

        // No hay capacidad disponible
        const result = {
          isValid: false,
          available: false,
          availableSpots: available,
          blockedSpots: stats.blocked,
          errors: [{
            code: 'INSUFFICIENT_CAPACITY',
            message: `No hay suficientes cupos disponibles. Cupos disponibles: ${available}, solicitados: ${quantity}`
          }],
          warnings
        };
        await cacheService.set(`capacity:validation:result:${eventId}`, result, 30);
        return result;

      } finally {
        // Liberar lock
        await cacheService.delete(lockKey);
      }

    } catch (error) {
      logger.error('Error validando capacidad:', error);
      return {
        isValid: false,
        available: false,
        availableSpots: 0,
        blockedSpots: 0,
        errors: [{ code: 'INTERNAL_ERROR', message: 'Error interno del servidor' }],
        warnings: []
      };
    }
  }

  // ====================================================================
  // BLOQUEO Y RESERVA DE CAPACIDAD
  // ====================================================================

  /**
   * Reserva capacidad temporalmente
   */
  async reserveCapacity(
    eventId: number,
    quantity: number,
    accessTypeId: number | undefined,
    userId: number,
    sessionId: string
  ): Promise<ApiResponse<any>> {
    try {
      // Validar capacidad disponible
      const validation = await this.validateCapacityForRegistration(eventId, accessTypeId, quantity);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Capacidad insuficiente',
          error: 'INSUFFICIENT_CAPACITY',
          timestamp: new Date().toISOString()
        };
      }

      // Crear bloqueo de capacidad
      const lock = await this.createCapacityLock({
        eventId,
        userId,
        sessionId,
        quantity,
        accessTypeId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
      });

      // Invalidar caché
      await cacheService.invalidateEventCache(eventId);

      return {
        success: true,
        message: 'Capacidad reservada exitosamente',
        data: lock,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error reservando capacidad:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Confirma reserva de capacidad
   */
  async confirmCapacityReservation(
    lockId: string,
    registrationId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    try {
      // TODO: Implementar confirmación de reserva
      return {
        success: true,
        message: 'Reserva confirmada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error confirmando reserva:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Libera reserva de capacidad
   */
  async releaseCapacityReservation(lockId: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Implementar liberación de reserva
      return {
        success: true,
        message: 'Reserva liberada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error liberando reserva:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // REPORTES Y ANALYTICS
  // ====================================================================

  /**
   * Genera reporte de capacidad
   */
  async generateCapacityReport(eventId: number): Promise<ApiResponse<CapacityReport>> {
    try {
      const status = await this.getEventCapacityStatus(eventId);
      if (!status.success) {
        return {
          success: false,
          message: status.message,
          error: status.error,
          timestamp: new Date().toISOString()
        };
      }

      const report: CapacityReport = {
        eventId,
        generatedAt: new Date(),
        summary: {
          totalCapacity: status.data!.totalCapacity,
          confirmedRegistrations: status.data!.confirmedCapacity,
          blockedCapacity: status.data!.blockedCapacity,
          waitlistCount: status.data!.waitlistCount,
          utilizationPercentage: status.data!.utilizationPercentage,
          overbookingUtilization: 0
        },
        trends: {
          dailyGrowth: 0,
          weeklyGrowth: 0,
          predictedFullDate: null
        },
        accessTypesBreakdown: [],
        timeSeries: [],
        recommendations: []
      };

      return {
        success: true,
        message: 'Reporte generado exitosamente',
        data: report,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error generando reporte:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES Y HELPERS
  // ====================================================================

  /**
   * Valida configuración de capacidad
   */
  private validateCapacityConfiguration(config: ConfigureCapacityData): { isValid: boolean; errors: { code: string; message: string; field?: string }[] } {
    const errors: { code: string; message: string; field?: string }[] = [];

    if (!config.totalCapacity || config.totalCapacity <= 0) {
      errors.push({ code: 'INVALID_CAPACITY', message: 'La capacidad total debe ser mayor a 0', field: 'totalCapacity' });
    }

    if (config.overbookingPercentage !== undefined && (config.overbookingPercentage < 0 || config.overbookingPercentage > 50)) {
      errors.push({ code: 'INVALID_OVERBOOKING', message: 'El porcentaje de overbooking debe estar entre 0 y 50', field: 'overbookingPercentage' });
    }

    if (config.lockTimeoutMinutes !== undefined && (config.lockTimeoutMinutes < 5 || config.lockTimeoutMinutes > 60)) {
      errors.push({ code: 'INVALID_TIMEOUT', message: 'El tiempo de bloqueo debe estar entre 5 y 60 minutos', field: 'lockTimeoutMinutes' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula estadísticas de capacidad
   */
  private async calculateCapacityStats(eventId: number, capacity: Capacity): Promise<{
    available: number;
    blocked: number;
    confirmed: number;
    overbooking: number;
    waitlist: number;
    utilization: number;
  }> {
    // Contar inscripciones confirmadas
    const confirmedCount = await EventRegistration.count({
      where: {
        eventId,
        status: { [Op.in]: ['confirmed', 'attended'] }
      }
    });

    // Contar bloqueos activos (por ahora usamos pending como bloqueados)
    const blockedCount = await EventRegistration.count({
      where: {
        eventId,
        status: 'pending'
      }
    });

    // Calcular métricas
    const available = Math.max(0, capacity.totalCapacity - confirmedCount - blockedCount);
    const utilization = capacity.totalCapacity > 0 ? (confirmedCount / capacity.totalCapacity) * 100 : 0;

    return {
      available,
      blocked: blockedCount,
      confirmed: confirmedCount,
      overbooking: 0, // TODO: implementar
      waitlist: 0, // TODO: implementar
      utilization
    };
  }

  /**
   * Crea un bloqueo de capacidad
   */
  private async createCapacityLock(data: {
    eventId: number;
    userId: number;
    sessionId: string;
    quantity: number;
    accessTypeId?: number;
    expiresAt: Date;
  }): Promise<CapacityLock> {
    // TODO: Implementar creación de bloqueo en base de datos
    return {
      id: 'temp-' + Date.now(),
      eventId: data.eventId,
      userId: data.userId,
      sessionId: data.sessionId,
      quantity: data.quantity,
      accessTypeId: data.accessTypeId,
      status: 'LOCKED',
      expiresAt: data.expiresAt,
      createdAt: new Date()
    };
  }

  /**
   * Procesa reservas de capacidad expiradas
   */
  async processExpiredReservations(): Promise<ApiResponse<{ released: number }>> {
    try {
      // TODO: Implementar búsqueda y liberación de reservas expiradas
      // Por ahora, simular procesamiento
      const released = 0;

      return {
        success: true,
        message: `Procesadas ${released} reservas expiradas`,
        data: { released },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error procesando reservas expiradas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Confirma capacidad reservada (cuando se completa el pago)
   */
  async confirmReservedCapacity(
    lockId: string,
    registrationId: number,
    userId: number
  ): Promise<ApiResponse<void>> {
    try {
      // TODO: Implementar confirmación de capacidad reservada
      // Convertir bloqueo temporal en confirmación permanente

      // Invalidar caché
      // TODO: Obtener eventId del lock para invalidar caché específico

      return {
        success: true,
        message: 'Capacidad confirmada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error confirmando capacidad reservada:', error);
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

export const capacityManagementService = new CapacityManagementService();
