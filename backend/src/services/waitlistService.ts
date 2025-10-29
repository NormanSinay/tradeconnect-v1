/**
 * Servicio de Gestión de Listas de Espera para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de listas de espera
 */

import { Waitlist } from '../models/Waitlist';
import { Capacity } from '../models/Capacity';
import { Event } from '../models/Event';
import { AccessType } from '../models/AccessType';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { EventRegistration } from '../models/EventRegistration';
import {
  WaitlistEntry,
  AddToWaitlistData,
  WaitlistStatus
} from '../types/capacity.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { emailService } from './emailService';
import { EventEmitter } from 'events';
import { Op } from 'sequelize';

/**
 * Servicio para gestión de listas de espera
 */
export class WaitlistService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // GESTIÓN DE LISTAS DE ESPERA
  // ====================================================================

  /**
   * Agrega un usuario a la lista de espera
   */
  async addToWaitlist(data: AddToWaitlistData, userId: number): Promise<ApiResponse<WaitlistEntry>> {
    try {
      // Verificar que el evento existe y tiene lista de espera habilitada
      const capacity = await Capacity.findOne({
        where: { eventId: data.eventId, isActive: true }
      });

      if (!capacity) {
        return {
          success: false,
          message: 'Capacidad no configurada para este evento',
          error: 'CAPACITY_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      if (!capacity.waitlistEnabled) {
        return {
          success: false,
          message: 'La lista de espera no está habilitada para este evento',
          error: 'WAITLIST_DISABLED',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el usuario no esté ya registrado o en lista de espera
      const existingRegistration = await EventRegistration.findOne({
        where: {
          eventId: data.eventId,
          userId,
          status: { [Op.in]: ['pending', 'confirmed', 'attended'] }
        }
      });

      if (existingRegistration) {
        return {
          success: false,
          message: 'Ya estás registrado para este evento',
          error: 'ALREADY_REGISTERED',
          timestamp: new Date().toISOString()
        };
      }

      // Obtener la siguiente posición disponible
      const nextPosition = await Waitlist.getNextPosition(data.eventId, data.accessTypeId);

      // Crear entrada en lista de espera
      const waitlistEntry = await Waitlist.create({
        eventId: data.eventId,
        accessTypeId: data.accessTypeId,
        userId,
        status: 'ACTIVE'
      } as any);

      // Actualizar la posición después de crear
      await waitlistEntry.update({ position: nextPosition });

      // Registrar en auditoría
      await AuditLog.log(
        'waitlist_joined',
        'waitlist',
        {
          userId,
          resourceId: waitlistEntry.id.toString(),
          newValues: { ...data, position: nextPosition },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(data.eventId);

      // Emitir evento
      this.eventEmitter.emit('WaitlistJoined', {
        waitlistId: waitlistEntry.id,
        eventId: data.eventId,
        userId,
        position: nextPosition
      });

      // Enviar notificación por email
      await this.sendWaitlistConfirmationEmail(waitlistEntry.id);

      const entry: WaitlistEntry = {
        id: waitlistEntry.id,
        eventId: data.eventId,
        accessTypeId: data.accessTypeId,
        userId,
        position: nextPosition,
        status: 'ACTIVE',
        createdAt: waitlistEntry.createdAt
      };

      return {
        success: true,
        message: `Agregado a la lista de espera en posición ${nextPosition}`,
        data: entry,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error agregando a lista de espera:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Remueve un usuario de la lista de espera
   */
  async removeFromWaitlist(waitlistId: number, userId: number): Promise<ApiResponse<void>> {
    try {
      const waitlistEntry = await Waitlist.findByPk(waitlistId);

      if (!waitlistEntry) {
        return {
          success: false,
          message: 'Entrada en lista de espera no encontrada',
          error: 'WAITLIST_ENTRY_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el usuario o admin puede remover)
      if (waitlistEntry.userId !== userId) {
        return {
          success: false,
          message: 'No tienes permisos para remover esta entrada',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      const removedPosition = waitlistEntry.position;

      // Marcar como cancelada
      await waitlistEntry.update({
        status: 'CANCELLED',
        cancelledAt: new Date()
      });

      // Actualizar posiciones de los siguientes en la cola
      await Waitlist.updatePositionsAfterRemoval(
        waitlistEntry.eventId,
        removedPosition,
        waitlistEntry.accessTypeId || undefined
      );

      // Registrar en auditoría
      await AuditLog.log(
        'waitlist_left',
        'waitlist',
        {
          userId,
          resourceId: waitlistId.toString(),
          oldValues: { position: removedPosition, status: 'ACTIVE' },
          newValues: { status: 'CANCELLED' },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(waitlistEntry.eventId);

      // Emitir evento
      this.eventEmitter.emit('WaitlistLeft', {
        waitlistId,
        eventId: waitlistEntry.eventId,
        userId,
        position: removedPosition
      });

      return {
        success: true,
        message: 'Removido de la lista de espera exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error removiendo de lista de espera:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // NOTIFICACIONES Y PROCESAMIENTO
  // ====================================================================

  /**
   * Notifica al siguiente usuario en la lista de espera
   */
  async notifyNextInWaitlist(eventId: number, accessTypeId?: number): Promise<ApiResponse<WaitlistEntry | null>> {
    try {
      // Buscar la siguiente entrada activa
      const whereCondition: any = {
        eventId,
        status: 'ACTIVE'
      };

      if (accessTypeId !== undefined) {
        whereCondition.accessTypeId = accessTypeId;
      }

      const nextEntry = await Waitlist.findOne({
        where: whereCondition,
        include: [
          { model: User, as: 'user' },
          { model: Event, as: 'event' },
          { model: AccessType, as: 'accessType' }
        ],
        order: [['position', 'ASC']]
      });

      if (!nextEntry) {
        return {
          success: true,
          message: 'No hay usuarios en lista de espera',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // Calcular tiempo de expiración (24 horas por defecto)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Actualizar estado a notificado
      await nextEntry.update({
        status: 'NOTIFIED',
        notifiedAt: new Date(),
        expiresAt
      });

      // Enviar notificación por email
      await this.sendWaitlistNotificationEmail(nextEntry.id);

      // Registrar en auditoría
      await AuditLog.log(
        'waitlist_notified',
        'waitlist',
        {
          userId: nextEntry.userId,
          resourceId: nextEntry.id.toString(),
          newValues: { status: 'NOTIFIED', notifiedAt: new Date(), expiresAt },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Emitir evento
      this.eventEmitter.emit('WaitlistNotified', {
        waitlistId: nextEntry.id,
        eventId,
        userId: nextEntry.userId,
        position: nextEntry.position,
        expiresAt
      });

      const entry: WaitlistEntry = {
        id: nextEntry.id,
        eventId,
        accessTypeId,
        userId: nextEntry.userId,
        position: nextEntry.position,
        status: 'NOTIFIED',
        notifiedAt: nextEntry.notifiedAt,
        expiresAt,
        createdAt: nextEntry.createdAt
      };

      return {
        success: true,
        message: 'Usuario notificado exitosamente',
        data: entry,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error notificando siguiente en lista de espera:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Confirma una entrada de lista de espera (convierte en registro)
   */
  async confirmWaitlistEntry(waitlistId: number, userId: number): Promise<ApiResponse<any>> {
    try {
      const waitlistEntry = await Waitlist.findByPk(waitlistId, {
        include: [
          { model: Event, as: 'event' },
          { model: AccessType, as: 'accessType' }
        ]
      });

      if (!waitlistEntry) {
        return {
          success: false,
          message: 'Entrada en lista de espera no encontrada',
          error: 'WAITLIST_ENTRY_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que sea el usuario correcto
      if (waitlistEntry.userId !== userId) {
        return {
          success: false,
          message: 'No tienes permisos para confirmar esta entrada',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que esté en estado notificado y no haya expirado
      if (waitlistEntry.status !== 'NOTIFIED') {
        return {
          success: false,
          message: 'Esta entrada no puede ser confirmada',
          error: 'INVALID_WAITLIST_STATUS',
          timestamp: new Date().toISOString()
        };
      }

      if (waitlistEntry.isExpired) {
        // Marcar como expirada
        await waitlistEntry.update({ status: 'EXPIRED' });
        return {
          success: false,
          message: 'El tiempo para confirmar ha expirado',
          error: 'WAITLIST_EXPIRED',
          timestamp: new Date().toISOString()
        };
      }

      // Aquí iría la lógica para crear el registro real
      // Por ahora solo marcamos como confirmado
      await waitlistEntry.update({
        status: 'CONFIRMED',
        confirmedAt: new Date()
      });

      // Actualizar posiciones de los siguientes en la cola
      await Waitlist.updatePositionsAfterRemoval(
        waitlistEntry.eventId,
        waitlistEntry.position,
        waitlistEntry.accessTypeId || undefined
      );

      // Registrar en auditoría
      await AuditLog.log(
        'waitlist_confirmed',
        'waitlist',
        {
          userId,
          resourceId: waitlistId.toString(),
          newValues: { status: 'CONFIRMED', confirmedAt: new Date() },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(waitlistEntry.eventId);

      // Emitir evento
      this.eventEmitter.emit('WaitlistConfirmed', {
        waitlistId,
        eventId: waitlistEntry.eventId,
        userId,
        position: waitlistEntry.position
      });

      return {
        success: true,
        message: 'Entrada de lista de espera confirmada exitosamente',
        data: {
          waitlistId,
          eventId: waitlistEntry.eventId,
          confirmedAt: new Date()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error confirmando entrada de lista de espera:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // CONSULTAS Y ESTADÍSTICAS
  // ====================================================================

  /**
   * Obtiene la lista de espera de un evento
   */
  async getWaitlist(eventId: number, accessTypeId?: number): Promise<ApiResponse<WaitlistEntry[]>> {
    try {
      const entries = await Waitlist.findActiveByEvent(eventId, accessTypeId);

      const formattedEntries: WaitlistEntry[] = entries.map(entry => ({
        id: entry.id,
        eventId: entry.eventId,
        accessTypeId: entry.accessTypeId,
        userId: entry.userId,
        position: entry.position,
        status: entry.status,
        notifiedAt: entry.notifiedAt,
        expiresAt: entry.expiresAt,
        createdAt: entry.createdAt
      }));

      return {
        success: true,
        message: 'Lista de espera obtenida exitosamente',
        data: formattedEntries,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo lista de espera:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene la posición de un usuario en la lista de espera
   */
  async getUserWaitlistPosition(eventId: number, userId: number, accessTypeId?: number): Promise<ApiResponse<{ position: number; total: number; } | null>> {
    try {
      const whereCondition: any = {
        eventId,
        userId,
        status: { [Op.in]: ['ACTIVE', 'NOTIFIED'] }
      };

      if (accessTypeId !== undefined) {
        whereCondition.accessTypeId = accessTypeId;
      }

      const entry = await Waitlist.findOne({
        where: whereCondition
      });

      if (!entry) {
        return {
          success: true,
          message: 'Usuario no está en lista de espera',
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // Contar total de entradas activas
      const countWhereCondition: any = {
        eventId,
        status: { [Op.in]: ['ACTIVE', 'NOTIFIED'] }
      };

      if (accessTypeId !== undefined) {
        countWhereCondition.accessTypeId = accessTypeId;
      }

      const total = await Waitlist.count({
        where: countWhereCondition
      });

      return {
        success: true,
        message: 'Posición obtenida exitosamente',
        data: {
          position: entry.position,
          total
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo posición en lista de espera:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // PROCESAMIENTO AUTOMÁTICO
  // ====================================================================

  /**
   * Procesa entradas expiradas (job programado)
   */
  async processExpiredEntries(): Promise<ApiResponse<{ processed: number; }>> {
    try {
      const expiredEntries = await Waitlist.findExpiredEntries();
      let processed = 0;

      for (const entry of expiredEntries) {
        try {
          // Marcar como expirada
          await entry.update({ status: 'EXPIRED' });

          // Notificar al siguiente en la lista
          await this.notifyNextInWaitlist(entry.eventId, entry.accessTypeId || undefined);

          processed++;

          // Registrar en auditoría
          await AuditLog.log(
            'waitlist_expired',
            'waitlist',
            {
              userId: entry.userId,
              resourceId: entry.id.toString(),
              oldValues: { status: 'NOTIFIED' },
              newValues: { status: 'EXPIRED' },
              ipAddress: '127.0.0.1',
              userAgent: 'system'
            }
          );

        } catch (error) {
          logger.error(`Error procesando entrada expirada ${entry.id}:`, error);
        }
      }

      return {
        success: true,
        message: `Procesadas ${processed} entradas expiradas`,
        data: { processed },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error procesando entradas expiradas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES DE EMAIL
  // ====================================================================

  /**
   * Envía email de confirmación de lista de espera
   */
  private async sendWaitlistConfirmationEmail(waitlistId: number): Promise<void> {
    try {
      const waitlistEntry = await Waitlist.findByPk(waitlistId, {
        include: [
          { model: User, as: 'user' },
          { model: Event, as: 'event' }
        ]
      });

      if (!waitlistEntry || !waitlistEntry.user || !waitlistEntry.event) return;

      // Aquí iría la lógica para enviar email
      // await emailService.sendWaitlistConfirmation(waitlistEntry);

    } catch (error) {
      logger.error('Error enviando email de confirmación de lista de espera:', error);
    }
  }

  /**
   * Envía email de notificación de cupo disponible
   */
  private async sendWaitlistNotificationEmail(waitlistId: number): Promise<void> {
    try {
      const waitlistEntry = await Waitlist.findByPk(waitlistId, {
        include: [
          { model: User, as: 'user' },
          { model: Event, as: 'event' }
        ]
      });

      if (!waitlistEntry || !waitlistEntry.user || !waitlistEntry.event) return;

      // Aquí iría la lógica para enviar email
      // await emailService.sendWaitlistNotification(waitlistEntry);

    } catch (error) {
      logger.error('Error enviando email de notificación de lista de espera:', error);
    }
  }

  /**
   * Obtiene event emitter
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const waitlistService = new WaitlistService();
