/**
 * Servicio de Reservas Grupales Atómicas para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para reservas grupales con atomicidad
 */

import sequelize from '../config/database';
import { Capacity } from '../models/Capacity';
import { AccessType } from '../models/AccessType';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { EventEmitter } from 'events';
import { Transaction } from 'sequelize';

/**
 * Datos para reserva grupal
 */
export interface GroupReservationData {
  eventId: number;
  groupLeaderId: number;
  participants: GroupParticipant[];
  allowPartialReservation?: boolean; // Por defecto false para atomicidad
}

/**
 * Participante del grupo
 */
export interface GroupParticipant {
  userId: number;
  accessTypeId?: number;
  customData?: any;
}

/**
 * Resultado de reserva grupal
 */
export interface GroupReservationResult {
  success: boolean;
  reservationId?: string;
  blockedSlots: BlockedSlot[];
  failedParticipants: GroupParticipant[];
  message: string;
}

/**
 * Cupo bloqueado
 */
export interface BlockedSlot {
  participant: GroupParticipant;
  accessTypeId: number;
  blockedAt: Date;
  expiresAt: Date;
}

/**
 * Servicio para reservas grupales atómicas
 */
export class GroupReservationService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // RESERVAS GRUPALES ATÓMICAS
  // ====================================================================

  /**
   * Realiza una reserva grupal atómica
   */
  async createGroupReservation(data: GroupReservationData, userId: number): Promise<ApiResponse<GroupReservationResult>> {
    const transaction = await sequelize.transaction();

    try {
      // Validar datos de entrada
      const validation = await this.validateGroupReservationData(data);
      if (!validation.isValid) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Datos de reserva grupal inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar configuración de capacidad del evento
      const capacity = await Capacity.findOne({
        where: { eventId: data.eventId, isActive: true },
        transaction
      });

      if (!capacity) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Capacidad no configurada para este evento',
          error: 'CAPACITY_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar participantes con tipos de acceso por defecto
      const participantsWithAccessTypes = await this.prepareParticipantsWithAccessTypes(
        data.participants,
        capacity,
        transaction
      );

      // Verificar disponibilidad para todos los participantes
      const availabilityCheck = await this.checkGroupAvailability(
        data.eventId,
        participantsWithAccessTypes,
        transaction
      );

      if (!availabilityCheck.available) {
        await transaction.rollback();
        return {
          success: false,
          message: availabilityCheck.message,
          error: 'INSUFFICIENT_CAPACITY',
          details: {
            available: availabilityCheck.availableSlots,
            required: availabilityCheck.requiredSlots,
            failedParticipants: availabilityCheck.failedParticipants
          },
          timestamp: new Date().toISOString()
        };
      }

      // Si no permite reservas parciales y no todos están disponibles, fallar
      if (!data.allowPartialReservation && availabilityCheck.failedParticipants.length > 0) {
        await transaction.rollback();
        return {
          success: false,
          message: 'No hay capacidad suficiente para todos los participantes del grupo',
          error: 'GROUP_RESERVATION_FAILED',
          details: {
            failedParticipants: availabilityCheck.failedParticipants,
            availableSlots: availabilityCheck.availableSlots
          },
          timestamp: new Date().toISOString()
        };
      }

      // Bloquear cupos para participantes disponibles
      const blockedSlots = await this.blockSlotsForParticipants(
        data.eventId,
        availabilityCheck.availableParticipants,
        capacity.lockTimeoutMinutes || 15,
        transaction
      );

      // Generar ID de reserva grupal
      const reservationId = this.generateGroupReservationId();

      // Registrar reserva grupal en auditoría
      await AuditLog.log(
        'group_reservation_created',
        'group_reservation',
        {
          userId,
          resourceId: reservationId,
          newValues: {
            eventId: data.eventId,
            groupLeaderId: data.groupLeaderId,
            participantCount: blockedSlots.length,
            blockedSlots: blockedSlots.map(slot => ({
              userId: slot.participant.userId,
              accessTypeId: slot.accessTypeId
            }))
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      await transaction.commit();

      // Invalidar caché
      await cacheService.invalidateEventCache(data.eventId);

      // Emitir evento
      this.eventEmitter.emit('GroupReservationCreated', {
        reservationId,
        eventId: data.eventId,
        groupLeaderId: data.groupLeaderId,
        blockedSlots,
        failedParticipants: availabilityCheck.failedParticipants,
        createdBy: userId
      });

      const result: GroupReservationResult = {
        success: true,
        reservationId,
        blockedSlots,
        failedParticipants: availabilityCheck.failedParticipants,
        message: `Reserva grupal creada exitosamente. ${blockedSlots.length} cupos bloqueados.`
      };

      return {
        success: true,
        message: 'Reserva grupal procesada exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      await transaction.rollback();
      logger.error('Error creando reserva grupal:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cancela una reserva grupal y libera todos los cupos
   */
  async cancelGroupReservation(reservationId: string, cancelledBy: number): Promise<ApiResponse<void>> {
    const transaction = await sequelize.transaction();

    try {
      // Aquí iría la lógica para encontrar y liberar todos los cupos de la reserva grupal
      // Por ahora, solo registramos la cancelación

      // Registrar cancelación en auditoría
      await AuditLog.log(
        'group_reservation_cancelled',
        'group_reservation',
        {
          userId: cancelledBy,
          resourceId: reservationId,
          oldValues: { status: 'ACTIVE' },
          newValues: { status: 'CANCELLED' },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      await transaction.commit();

      // Emitir evento
      this.eventEmitter.emit('GroupReservationCancelled', {
        reservationId,
        cancelledBy
      });

      return {
        success: true,
        message: 'Reserva grupal cancelada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      await transaction.rollback();
      logger.error('Error cancelando reserva grupal:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES Y VALIDACIONES
  // ====================================================================

  /**
   * Valida datos de reserva grupal
   */
  private async validateGroupReservationData(data: GroupReservationData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validar evento existe
    const event = await Event.findByPk(data.eventId);
    if (!event) {
      errors.push('Evento no encontrado');
    }

    // Validar líder del grupo
    const groupLeader = await User.findByPk(data.groupLeaderId);
    if (!groupLeader) {
      errors.push('Líder del grupo no encontrado');
    }

    // Validar participantes
    if (!data.participants || data.participants.length === 0) {
      errors.push('Debe incluir al menos un participante');
    } else if (data.participants.length > 50) {
      errors.push('No puede incluir más de 50 participantes');
    }

    // Validar que no haya participantes duplicados
    const userIds = data.participants.map(p => p.userId);
    const uniqueUserIds = new Set(userIds);
    if (userIds.length !== uniqueUserIds.size) {
      errors.push('No puede incluir el mismo participante múltiples veces');
    }

    // Validar que cada participante existe
    for (const participant of data.participants) {
      const user = await User.findByPk(participant.userId);
      if (!user) {
        errors.push(`Participante con ID ${participant.userId} no encontrado`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepara participantes con tipos de acceso por defecto
   */
  private async prepareParticipantsWithAccessTypes(
    participants: GroupParticipant[],
    capacity: Capacity,
    transaction: Transaction
  ): Promise<GroupParticipant[]> {
    // Obtener el tipo de acceso por defecto para eventos generales
    const defaultAccessType = await AccessType.findOne({
      where: {
        category: 'general',
        isDefault: true,
        status: 'ACTIVE'
      },
      transaction
    });

    return participants.map(participant => ({
      ...participant,
      accessTypeId: participant.accessTypeId || defaultAccessType?.id || 1
    }));
  }

  /**
   * Verifica disponibilidad para todo el grupo
   */
  private async checkGroupAvailability(
    eventId: number,
    participants: GroupParticipant[],
    transaction: Transaction
  ): Promise<{
    available: boolean;
    availableSlots: { [accessTypeId: number]: number };
    requiredSlots: { [accessTypeId: number]: number };
    availableParticipants: GroupParticipant[];
    failedParticipants: GroupParticipant[];
    message: string;
  }> {
    // Contar participantes por tipo de acceso
    const requiredSlots: { [accessTypeId: number]: number } = {};
    for (const participant of participants) {
      const accessTypeId = participant.accessTypeId || 1;
      requiredSlots[accessTypeId] = (requiredSlots[accessTypeId] || 0) + 1;
    }

    // Verificar disponibilidad por tipo de acceso
    const availableSlots: { [accessTypeId: number]: number } = {};
    const availableParticipants: GroupParticipant[] = [];
    const failedParticipants: GroupParticipant[] = [];

    for (const participant of participants) {
      const accessTypeId = participant.accessTypeId || 1;

      if (availableSlots[accessTypeId] === undefined) {
        // Calcular disponibilidad para este tipo de acceso
        const availability = await this.getAvailableSlotsForAccessType(eventId, accessTypeId, transaction);
        availableSlots[accessTypeId] = availability;
      }

      if (availableSlots[accessTypeId] > 0) {
        availableParticipants.push(participant);
        availableSlots[accessTypeId]--;
      } else {
        failedParticipants.push(participant);
      }
    }

    const available = failedParticipants.length === 0;
    const message = available
      ? 'Capacidad disponible para todos los participantes'
      : `Capacidad insuficiente para ${failedParticipants.length} participante(s)`;

    return {
      available,
      availableSlots,
      requiredSlots,
      availableParticipants,
      failedParticipants,
      message
    };
  }

  /**
   * Obtiene cupos disponibles para un tipo de acceso
   */
  private async getAvailableSlotsForAccessType(
    eventId: number,
    accessTypeId: number,
    transaction: Transaction
  ): Promise<number> {
    // Esta implementación dependería de cómo se almacenen los cupos disponibles
    // Por ahora retornamos un valor simulado
    // En una implementación real, esto consultaría las tablas de capacidad y bloqueos

    const capacity = await Capacity.findOne({
      where: { eventId, isActive: true },
      transaction
    });

    if (!capacity) return 0;

    // Lógica simplificada - en producción esto sería más compleja
    const totalCapacity = capacity.totalCapacity || 100;
    const usedCapacity = Math.floor(Math.random() * totalCapacity * 0.8); // Simulación

    return Math.max(0, totalCapacity - usedCapacity);
  }

  /**
   * Bloquea cupos para participantes
   */
  private async blockSlotsForParticipants(
    eventId: number,
    participants: GroupParticipant[],
    blockDurationMinutes: number,
    transaction: Transaction
  ): Promise<BlockedSlot[]> {
    const blockedSlots: BlockedSlot[] = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + blockDurationMinutes * 60 * 1000);

    for (const participant of participants) {
      const blockedSlot: BlockedSlot = {
        participant,
        accessTypeId: participant.accessTypeId || 1,
        blockedAt: now,
        expiresAt
      };

      blockedSlots.push(blockedSlot);

      // Aquí iría la lógica para registrar el bloqueo en la base de datos
      // Por ejemplo, insertar en una tabla de bloqueos temporales
    }

    return blockedSlots;
  }

  /**
   * Genera ID único para reserva grupal
   */
  private generateGroupReservationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `grp_${timestamp}_${random}`;
  }

  /**
   * Obtiene event emitter
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const groupReservationService = new GroupReservationService();