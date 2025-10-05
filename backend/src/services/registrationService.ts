/**
 * @fileoverview Servicio de Inscripciones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de inscripciones a eventos
 *
 * Archivo: backend/src/services/registrationService.ts
 */

import { Registration } from '../models/Registration';
import { GroupRegistration } from '../models/GroupRegistration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  CreateIndividualRegistrationData,
  CreateGroupRegistrationData,
  UpdateRegistrationData,
  RegistrationResponse,
  TaxValidationResult,
  PriceCalculationResult,
  RegistrationFilters,
  PaginatedResponse,
  RegistrationStatus,
  GroupRegistrationStatus
} from '../types/registration.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { EventEmitter } from 'events';
import { affiliationValidationService } from './affiliationValidationService';
import { cacheService } from './cacheService';
import { discountService } from './discountService';
import { capacityManagementService } from './capacityManagementService';

/**
 * Servicio para manejo de operaciones de inscripciones
 */
export class RegistrationService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // INSCRIPCIONES INDIVIDUALES
  // ====================================================================

  /**
   * Crea una inscripción individual
   */
  async createIndividualRegistration(
    data: CreateIndividualRegistrationData,
    userId: number
  ): Promise<ApiResponse<RegistrationResponse>> {
    try {
      // Validar que el evento existe y está disponible
      const event = await Event.findByPk(data.eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar y reservar capacidad temporalmente
      const capacityReservation = await capacityManagementService.reserveCapacity(
        data.eventId,
        1, // Cantidad para inscripción individual
        undefined, // Sin tipo de acceso específico
        userId,
        `registration-${Date.now()}` // Session ID único
      );

      if (!capacityReservation.success) {
        return {
          success: false,
          message: capacityReservation.message,
          error: capacityReservation.error,
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos fiscales si se proporcionan
      if (data.nit || data.cui) {
        const taxValidation = await affiliationValidationService.validateTaxData(data.nit, data.cui);
        if (!taxValidation.isValid) {
          return {
            success: false,
            message: taxValidation.message,
            error: 'INVALID_TAX_DATA',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Calcular precios
      const priceCalculation = await this.calculateRegistrationPrice(data.eventId, data.participantType, 1);

      // Generar código único
      const registrationCode = Registration.generateRegistrationCode();

      // Crear reserva temporal (15 minutos)
      const reservationExpiresAt = new Date();
      reservationExpiresAt.setMinutes(reservationExpiresAt.getMinutes() + 15);

      // Crear inscripción
      const registration = await Registration.create({
        registrationCode,
        eventId: data.eventId,
        userId,
        participantType: data.participantType,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nit: data.nit,
        cui: data.cui,
        companyName: data.companyName,
        position: data.position,
        status: 'PENDIENTE_PAGO',
        basePrice: priceCalculation.basePrice,
        discountAmount: priceCalculation.discountAmount,
        finalPrice: priceCalculation.finalPrice,
        reservationExpiresAt,
        customFields: data.customFields
      });

      // Registrar en auditoría
      await AuditLog.log(
        'registration_created',
        'registration',
        {
          userId,
          resourceId: registration.id.toString(),
          newValues: {
            registrationCode,
            eventId: data.eventId,
            status: 'PENDIENTE_PAGO'
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento
      this.eventEmitter.emit('RegistrationCreated', {
        registrationId: registration.id,
        eventId: data.eventId,
        userId,
        status: 'PENDIENTE_PAGO'
      });

      const response: RegistrationResponse = {
        registrationId: registration.id,
        registrationCode,
        status: 'PENDIENTE_PAGO',
        totalAmount: priceCalculation.finalPrice,
        reservationExpiresAt,
        capacityLockId: capacityReservation.data?.id,
        message: 'Inscripción creada exitosamente. Complete el pago antes de que expire la reserva.'
      };

      return {
        success: true,
        message: 'Inscripción individual creada exitosamente',
        data: response,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando inscripción individual:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza una inscripción
   */
  async updateRegistration(
    registrationId: number,
    updates: UpdateRegistrationData,
    userId: number
  ): Promise<ApiResponse<Registration>> {
    try {
      const registration = await Registration.findByPk(registrationId);
      if (!registration) {
        return {
          success: false,
          message: 'Inscripción no encontrada',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el propietario o admin puede actualizar)
      if (registration.userId !== userId) {
        // TODO: Verificar permisos de admin
        return {
          success: false,
          message: 'No tiene permisos para actualizar esta inscripción',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Solo permitir actualización si está en estado BORRADOR o PENDIENTE_PAGO
      if (!['BORRADOR', 'PENDIENTE_PAGO'].includes(registration.status)) {
        return {
          success: false,
          message: 'No se puede actualizar una inscripción en este estado',
          error: 'INVALID_STATUS_FOR_UPDATE',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos fiscales si se actualizan
      if (updates.nit || updates.cui) {
        const taxValidation = await affiliationValidationService.validateTaxData(
          updates.nit || registration.nit,
          updates.cui || registration.cui
        );
        if (!taxValidation.isValid) {
          return {
            success: false,
            message: taxValidation.message,
            error: 'INVALID_TAX_DATA',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Actualizar
      await registration.update(updates);

      // Registrar en auditoría
      await AuditLog.log(
        'registration_updated',
        'registration',
        {
          userId,
          resourceId: registration.id.toString(),
          oldValues: registration.previous(),
          newValues: updates,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Inscripción actualizada exitosamente',
        data: registration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando inscripción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cancela una inscripción
   */
  async cancelRegistration(
    registrationId: number,
    reason: string,
    userId: number
  ): Promise<ApiResponse<boolean>> {
    try {
      const registration = await Registration.findByPk(registrationId);
      if (!registration) {
        return {
          success: false,
          message: 'Inscripción no encontrada',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (registration.userId !== userId) {
        // TODO: Verificar permisos de admin
        return {
          success: false,
          message: 'No tiene permisos para cancelar esta inscripción',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Solo permitir cancelación si no está completada
      if (['CONFIRMADO', 'CANCELADO', 'EXPIRADO'].includes(registration.status)) {
        return {
          success: false,
          message: 'No se puede cancelar una inscripción en este estado',
          error: 'INVALID_STATUS_FOR_CANCELLATION',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular reembolso si aplica
      const refundAmount = await this.calculateRefund(registration);

      // Actualizar estado
      await registration.update({
        status: 'CANCELADO',
        paymentReference: `CANCELLED-${reason}`
      });

      // TODO: Procesar reembolso si aplica

      // Registrar en auditoría
      await AuditLog.log(
        'registration_cancelled',
        'registration',
        {
          userId,
          resourceId: registration.id.toString(),
          newValues: {
            status: 'CANCELADO',
            reason,
            refundAmount
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Emitir evento
      this.eventEmitter.emit('RegistrationCancelled', {
        registrationId,
        reason,
        refundAmount
      });

      return {
        success: true,
        message: 'Inscripción cancelada exitosamente',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error cancelando inscripción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // INSCRIPCIONES GRUPALES
  // ====================================================================

  /**
   * Crea una inscripción grupal
   */
  async createGroupRegistration(
    data: CreateGroupRegistrationData,
    organizerId: number
  ): Promise<ApiResponse<RegistrationResponse>> {
    try {
      // Validar que el evento existe
      const event = await Event.findByPk(data.eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar disponibilidad para el grupo
      const availabilityCheck = await this.checkEventAvailability(data.eventId, data.participants.length);
      if (!availabilityCheck.canAccommodate) {
        return {
          success: false,
          message: availabilityCheck.message,
          error: 'INSUFFICIENT_AVAILABILITY',
          timestamp: new Date().toISOString()
        };
      }

      // Validar NIT de la empresa si se proporciona
      if (data.nit) {
        const nitValidation = await affiliationValidationService.validateNIT(data.nit);
        if (!nitValidation.isValid) {
          return {
            success: false,
            message: nitValidation.message,
            error: 'INVALID_COMPANY_NIT',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Validar participantes
      const participantValidation = await this.validateGroupParticipants(data.participants);
      if (!participantValidation.isValid) {
        return {
          success: false,
          message: participantValidation.message,
          error: 'INVALID_PARTICIPANTS',
          timestamp: new Date().toISOString()
        };
      }

      // Calcular precios grupales
      const priceCalculation = await this.calculateGroupPrice(data.eventId, data.participants.length);

      // Generar códigos
      const groupCode = GroupRegistration.generateGroupCode();

      // Crear reserva temporal
      const reservationExpiresAt = new Date();
      reservationExpiresAt.setMinutes(reservationExpiresAt.getMinutes() + 15);

      // Crear inscripción grupal
      const groupRegistration = await GroupRegistration.create({
        groupCode,
        eventId: data.eventId,
        organizerId,
        companyName: data.companyName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        nit: data.nit,
        participantCount: data.participants.length,
        basePrice: priceCalculation.basePrice,
        groupDiscountPercent: priceCalculation.appliedDiscounts.find(d => d.type === 'group')?.percentage || 0,
        discountAmount: priceCalculation.discountAmount,
        finalPrice: priceCalculation.finalPrice,
        status: 'PENDIENTE_PAGO',
        reservationExpiresAt,
        notes: data.notes
      });

      // Crear inscripciones individuales
      const individualRegistrations = [];
      for (const participant of data.participants) {
        const registrationCode = Registration.generateRegistrationCode();
        const registration = await Registration.create({
          registrationCode,
          eventId: data.eventId,
          userId: organizerId, // Todas las individuales pertenecen al organizador
          participantType: 'individual',
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          phone: participant.phone,
          nit: participant.nit,
          cui: participant.cui,
          position: participant.position,
          status: 'PENDIENTE_PAGO',
          basePrice: priceCalculation.finalPrice / data.participants.length, // Precio individual
          discountAmount: 0,
          finalPrice: priceCalculation.finalPrice / data.participants.length,
          groupRegistrationId: groupRegistration.id,
          reservationExpiresAt
        });
        individualRegistrations.push(registration);
      }

      // Registrar en auditoría
      await AuditLog.log(
        'group_registration_created',
        'group_registration',
        {
          userId: organizerId,
          resourceId: groupRegistration.id.toString(),
          newValues: {
            groupCode,
            eventId: data.eventId,
            participantCount: data.participants.length,
            status: 'PENDIENTE_PAGO'
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      const response: RegistrationResponse = {
        groupRegistrationId: groupRegistration.id,
        groupCode,
        status: 'PENDIENTE_PAGO',
        totalAmount: priceCalculation.finalPrice,
        reservationExpiresAt,
        message: `Inscripción grupal creada exitosamente para ${data.participants.length} participantes.`
      };

      return {
        success: true,
        message: 'Inscripción grupal creada exitosamente',
        data: response,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando inscripción grupal:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // CONSULTAS Y BÚSQUEDAS
  // ====================================================================

  /**
   * Obtiene inscripciones con filtros y paginación
   */
  async getRegistrations(
    filters: RegistrationFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<PaginatedResponse<Registration>>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      // Si no hay eventId, buscar todas las inscripciones con filtros
      let where: any = {};
      if (filters.eventId) {
        where.eventId = filters.eventId;
      }
      if (filters.status && filters.status.length > 0) {
        where.status = { [Op.in]: filters.status };
      }
      if (filters.userId) {
        where.userId = filters.userId;
      }
      if (filters.search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${filters.search}%` } },
          { lastName: { [Op.iLike]: `%${filters.search}%` } },
          { email: { [Op.iLike]: `%${filters.search}%` } },
          { registrationCode: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      const result = await Registration.findAndCountAll({
        where,
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate', 'endDate', 'status']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const response: PaginatedResponse<Registration> = {
        data: result.rows,
        pagination: {
          page,
          limit,
          total: result.count,
          totalPages: Math.ceil(result.count / limit),
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        },
        meta: {
          filters
        }
      };

      return {
        success: true,
        message: 'Inscripciones obtenidas exitosamente',
        data: response,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo inscripciones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene inscripción por ID
   */
  async getRegistrationById(registrationId: number, userId: number): Promise<ApiResponse<Registration>> {
    try {
      const registration = await Registration.findByPk(registrationId, {
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate', 'endDate', 'status']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      if (!registration) {
        return {
          success: false,
          message: 'Inscripción no encontrada',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (registration.userId !== userId) {
        // TODO: Verificar permisos de admin
        return {
          success: false,
          message: 'No tiene permisos para ver esta inscripción',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Inscripción obtenida exitosamente',
        data: registration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo inscripción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // VALIDACIONES Y CÁLCULOS
  // ====================================================================

  /**
   * Verifica disponibilidad de cupos en un evento usando el servicio de capacidad
   */
  private async checkEventAvailability(eventId: number, requestedQuantity: number): Promise<{
    canAccommodate: boolean;
    availableCapacity: number;
    message: string;
  }> {
    try {
      // Usar el servicio de capacidad para validación robusta
      const capacityValidation = await capacityManagementService.validateCapacityForRegistration(
        eventId,
        undefined, // Sin tipo de acceso específico por ahora
        requestedQuantity
      );

      if (capacityValidation.isValid) {
        return {
          canAccommodate: true,
          availableCapacity: capacityValidation.availableSpots,
          message: `Capacidad disponible: ${capacityValidation.availableSpots} cupos`
        };
      }

      // No hay capacidad suficiente
      const errorMessages = capacityValidation.errors.map(e => e.message).join(', ');
      return {
        canAccommodate: false,
        availableCapacity: capacityValidation.availableSpots,
        message: `Capacidad insuficiente: ${errorMessages}`
      };

    } catch (error) {
      logger.error('Error verificando disponibilidad de capacidad:', error);
      // Fallback: asumir capacidad ilimitada si hay error
      return {
        canAccommodate: true,
        availableCapacity: -1,
        message: 'Error verificando capacidad, asumiendo ilimitada'
      };
    }
  }

  /**
   * Calcula precio de inscripción individual
   */
  private async calculateRegistrationPrice(
    eventId: number,
    participantType: string,
    quantity: number,
    registrationDate?: Date
  ): Promise<PriceCalculationResult> {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // TODO: Agregar campo price al modelo Event
    let basePrice = 0; // Precio por defecto

    const totalBase = basePrice * quantity;

    // Usar el servicio de descuentos para calcular todos los descuentos aplicables
    const discountCalculation = await discountService.calculateApplicableDiscounts({
      eventId,
      quantity,
      basePrice: totalBase,
      registrationDate: registrationDate || new Date(),
      currentDiscounts: []
    });

    if (!discountCalculation.success || !discountCalculation.data) {
      throw new Error('Error calculando descuentos aplicables');
    }

    const discountData = discountCalculation.data;

    return {
      basePrice: totalBase,
      discountAmount: discountData.totalDiscount,
      finalPrice: Math.max(event.minPrice || 0, discountData.finalPrice),
      currency: 'GTQ',
      appliedDiscounts: discountData.appliedDiscounts
    };
  }

  /**
   * Calcula precio de inscripción grupal
   */
  private async calculateGroupPrice(eventId: number, participantCount: number): Promise<PriceCalculationResult> {
    return this.calculateRegistrationPrice(eventId, 'individual', participantCount);
  }

  /**
   * Valida participantes de grupo
   */
  private async validateGroupParticipants(participants: any[]): Promise<{
    isValid: boolean;
    message: string;
  }> {
    if (participants.length < 2 || participants.length > 50) {
      return {
        isValid: false,
        message: 'El número de participantes debe estar entre 2 y 50'
      };
    }

    // Verificar emails únicos
    const emails = participants.map(p => p.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      return {
        isValid: false,
        message: 'Los emails de los participantes deben ser únicos'
      };
    }

    // Validar datos fiscales si se proporcionan
    for (const participant of participants) {
      if (participant.nit || participant.cui) {
        const taxValidation = await affiliationValidationService.validateTaxData(participant.nit, participant.cui);
        if (!taxValidation.isValid) {
          return {
            isValid: false,
            message: `Datos fiscales inválidos para ${participant.firstName} ${participant.lastName}: ${taxValidation.message}`
          };
        }
      }
    }

    return {
      isValid: true,
      message: 'Participantes válidos'
    };
  }

  /**
   * Calcula monto de reembolso
   */
  private async calculateRefund(registration: Registration): Promise<number> {
    // TODO: Implementar lógica de reembolso según políticas
    // Por ahora, devolver 0 (sin reembolso)
    return 0;
  }

  // ====================================================================
  // PROCESAMIENTO AUTOMÁTICO
  // ====================================================================

  /**
   * Procesa expiración de reservas temporales
   */
  async processExpiredReservations(): Promise<ApiResponse<{ expired: number }>> {
    try {
      const expiredReservations = await Registration.findExpiredReservations();

      let expired = 0;
      for (const registration of expiredReservations) {
        await registration.update({ status: 'EXPIRADO' });
        expired++;

        // Emitir evento
        this.eventEmitter.emit('ReservationExpired', {
          registrationId: registration.id,
          eventId: registration.eventId
        });
      }

      return {
        success: true,
        message: `Procesadas ${expired} reservas expiradas`,
        data: { expired },
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

  // ====================================================================
  // EVENT EMITTER ACCESS
  // ====================================================================

  /**
   * Obtiene el event emitter para registro de listeners
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const registrationService = new RegistrationService();