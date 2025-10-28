/**
 * @fileoverview Servicio de Inscripciones a Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de inscripciones a eventos
 *
 * Archivo: backend/src/services/eventRegistrationService.ts
 */

import { Transaction } from 'sequelize';
import { EventRegistration, EventRegistrationAttributes, EventRegistrationCreationAttributes } from '../models/EventRegistration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { EventStatus } from '../models/EventStatus';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { eventService } from './eventService';

export interface RegisterToEventData {
  eventId: number;
  userId: number;
  registrationData?: any;
  paymentAmount?: number;
}

export interface UpdateRegistrationData {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentReference?: string;
  cancellationReason?: string;
}

export interface CheckInData {
  registrationId: number;
  userId: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class EventRegistrationService {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly CACHE_PREFIX = 'event_registrations';

  // ====================================================================
  // GESTIÓN DE INSCRIPCIONES
  // ====================================================================

  /**
   * Registra a un usuario en un evento
   */
  static async registerToEvent(data: RegisterToEventData, transaction?: Transaction): Promise<EventRegistration> {
    try {
      logger.info('Registering user to event', { eventId: data.eventId, userId: data.userId });

      // Verificar que el evento existe y está disponible para registro
      const event = await Event.findByPk(data.eventId, {
        include: ['eventStatus']
      });

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      if (event.eventStatus.name !== 'published') {
        throw new Error('El evento no está disponible para registro');
      }

      if (event.startDate <= new Date()) {
        throw new Error('El evento ya ha comenzado o finalizado');
      }

      // Verificar capacidad del evento
      const currentRegistrations = await EventRegistration.count({
        where: { eventId: data.eventId, status: ['pending', 'confirmed'] }
      });

      if (event.capacity && currentRegistrations >= event.capacity) {
        throw new Error('El evento ha alcanzado su capacidad máxima');
      }

      // Verificar que el usuario no esté ya inscrito
      const existingRegistration = await EventRegistration.findOne({
        where: { eventId: data.eventId, userId: data.userId }
      });

      if (existingRegistration) {
        if (existingRegistration.status === 'cancelled') {
          // Reactivar inscripción cancelada
          existingRegistration.status = 'pending';
          existingRegistration.registeredAt = new Date();
          existingRegistration.cancelledAt = undefined;
          existingRegistration.cancellationReason = undefined;
          await existingRegistration.save({ transaction });
          return existingRegistration;
        } else {
          throw new Error('El usuario ya está inscrito en este evento');
        }
      }

      // Crear nueva inscripción
      const registration = await EventRegistration.create({
        eventId: data.eventId,
        userId: data.userId,
        status: 'pending',
        registrationData: data.registrationData,
        paymentStatus: event.price > 0 ? 'pending' : 'paid',
        paymentAmount: data.paymentAmount || event.price
      }, { transaction });

      // Asignar número de registro después de crear
      registration.registrationNumber = EventRegistration.generateRegistrationNumber();
      await registration.save({ transaction });

      // Limpiar caché
      await this.clearEventCache(data.eventId);

      // Emitir evento
      eventService.getEventEmitter().emit('UserRegisteredToEvent', {
        registrationId: registration.id,
        eventId: data.eventId,
        userId: data.userId,
        timestamp: new Date()
      });

      logger.info('User registered to event successfully', {
        registrationId: registration.id,
        eventId: data.eventId,
        userId: data.userId
      });

      return registration;
    } catch (error) {
      logger.error('Error registering user to event', { error, data });
      throw error;
    }
  }

  /**
   * Actualiza una inscripción
   */
  static async updateRegistration(id: number, data: UpdateRegistrationData, transaction?: Transaction): Promise<EventRegistration> {
    try {
      logger.info('Updating event registration', { id, data });

      const registration = await EventRegistration.findByPk(id, {
        include: [{ model: Event }, { model: User }]
      });

      if (!registration) {
        throw new Error('Inscripción no encontrada');
      }

      const updateData: any = { ...data };

      // Si se está cancelando, agregar timestamp y razón
      if (data.status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      await registration.update(updateData, { transaction });

      // Limpiar caché
      await this.clearEventCache(registration.eventId);

      // Emitir evento
      eventService.getEventEmitter().emit('EventRegistrationUpdated', {
        registrationId: id,
        eventId: registration.eventId,
        userId: registration.userId,
        changes: data,
        timestamp: new Date()
      });

      logger.info('Event registration updated successfully', { registrationId: id });
      return registration;
    } catch (error) {
      logger.error('Error updating event registration', { error, id, data });
      throw error;
    }
  }

  /**
   * Cancela una inscripción
   */
  static async cancelRegistration(id: number, userId: number, reason?: string, transaction?: Transaction): Promise<EventRegistration> {
    try {
      logger.info('Cancelling event registration', { id, userId, reason });

      const registration = await EventRegistration.findOne({
        where: { id, userId },
        include: [{ model: Event }]
      });

      if (!registration) {
        throw new Error('Inscripción no encontrada');
      }

      if (!['pending', 'confirmed'].includes(registration.status)) {
        throw new Error('No se puede cancelar esta inscripción');
      }

      await registration.update({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      }, { transaction });

      // Limpiar caché
      await this.clearEventCache(registration.eventId);

      // Emitir evento
      eventService.getEventEmitter().emit('EventRegistrationCancelled', {
        registrationId: id,
        eventId: registration.eventId,
        userId,
        reason,
        timestamp: new Date()
      });

      logger.info('Event registration cancelled successfully', { registrationId: id });
      return registration;
    } catch (error) {
      logger.error('Error cancelling event registration', { error, id, userId });
      throw error;
    }
  }

  /**
   * Realiza check-in de un usuario en un evento
   */
  static async checkIn(data: CheckInData, transaction?: Transaction): Promise<EventRegistration> {
    try {
      logger.info('Checking in user to event', data);

      const registration = await EventRegistration.findOne({
        where: { id: data.registrationId, userId: data.userId },
        include: [{ model: Event }]
      });

      if (!registration) {
        throw new Error('Inscripción no encontrada');
      }

      if (registration.status !== 'confirmed') {
        throw new Error('La inscripción debe estar confirmada para hacer check-in');
      }

      if (registration.checkInTime) {
        throw new Error('El usuario ya ha hecho check-in');
      }

      // Verificar que el evento esté en curso
      const now = new Date();
      if (now < registration.event.startDate || now > registration.event.endDate) {
        throw new Error('El evento no está en curso actualmente');
      }

      await registration.update({
        status: 'attended',
        checkInTime: now
      }, { transaction });

      // Emitir evento
      eventService.getEventEmitter().emit('UserCheckedIn', {
        registrationId: data.registrationId,
        eventId: registration.eventId,
        userId: data.userId,
        checkInTime: now,
        timestamp: new Date()
      });

      logger.info('User checked in successfully', data);
      return registration;
    } catch (error) {
      logger.error('Error checking in user', { error, data });
      throw error;
    }
  }

  /**
   * Realiza check-out de un usuario
   */
  static async checkOut(registrationId: number, userId: number, transaction?: Transaction): Promise<EventRegistration> {
    try {
      logger.info('Checking out user from event', { registrationId, userId });

      const registration = await EventRegistration.findOne({
        where: { id: registrationId, userId }
      });

      if (!registration) {
        throw new Error('Inscripción no encontrada');
      }

      if (!registration.checkInTime) {
        throw new Error('El usuario no ha hecho check-in');
      }

      if (registration.checkOutTime) {
        throw new Error('El usuario ya ha hecho check-out');
      }

      const now = new Date();
      await registration.update({
        checkOutTime: now
      }, { transaction });

      // Emitir evento
      eventService.getEventEmitter().emit('UserCheckedOut', {
        registrationId,
        eventId: registration.eventId,
        userId,
        checkOutTime: now,
        timestamp: new Date()
      });

      logger.info('User checked out successfully', { registrationId, userId });
      return registration;
    } catch (error) {
      logger.error('Error checking out user', { error, registrationId, userId });
      throw error;
    }
  }

  /**
   * Obtiene inscripciones de un evento
   */
  static async getEventRegistrations(eventId: number, options: PaginationOptions = {}): Promise<PaginatedResult<EventRegistration>> {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        paymentStatus,
        search
      } = options;

      const offset = (page - 1) * limit;
      const where: any = { eventId };

      if (status) {
        where.status = status;
      }

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      if (search) {
        // Buscar por nombre o email del usuario
        where.$or = [
          { '$user.firstName$': { $iLike: `%${search}%` } },
          { '$user.lastName$': { $iLike: `%${search}%` } },
          { '$user.email$': { $iLike: `%${search}%` } },
          { registrationNumber: { $iLike: `%${search}%` } }
        ];
      }

      const { rows: registrations, count: total } = await EventRegistration.findAndCountAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ],
        limit,
        offset,
        order: [['registeredAt', 'ASC']]
      });

      const pages = Math.ceil(total / limit);

      return {
        data: registrations,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error getting event registrations', { error, eventId, options });
      throw error;
    }
  }

  /**
   * Obtiene inscripciones de un usuario
   */
  static async getUserRegistrations(userId: number, options: PaginationOptions = {}): Promise<PaginatedResult<EventRegistration>> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        paymentStatus
      } = options;

      const offset = (page - 1) * limit;
      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      const { rows: registrations, count: total } = await EventRegistration.findAndCountAll({
        where,
        include: [
          {
            model: Event,
            attributes: ['id', 'title', 'startDate', 'endDate', 'location', 'price'],
            include: [
              {
                model: EventStatus,
                as: 'eventStatus',
                attributes: ['name', 'displayName']
              }
            ]
          }
        ],
        limit,
        offset,
        order: [['registeredAt', 'DESC']]
      });

      const pages = Math.ceil(total / limit);

      return {
        data: registrations,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrevious: page > 1
        }
      };
    } catch (error) {
      logger.error('Error getting user registrations', { error, userId, options });
      throw error;
    }
  }

  /**
   * Obtiene una inscripción específica
   */
  static async getRegistrationById(id: number): Promise<EventRegistration | null> {
    try {
      const registration = await EventRegistration.findByPk(id, {
        include: [
          {
            model: Event,
            attributes: ['id', 'title', 'startDate', 'endDate', 'location']
          },
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });
      return registration;
    } catch (error) {
      logger.error('Error getting registration by ID', { error, id });
      throw error;
    }
  }

  /**
   * Verifica si un usuario está inscrito en un evento
   */
  static async isUserRegistered(eventId: number, userId: number): Promise<boolean> {
    try {
      return await EventRegistration.isUserRegistered(eventId, userId);
    } catch (error) {
      logger.error('Error checking if user is registered', { error, eventId, userId });
      return false;
    }
  }

  /**
   * Obtiene estadísticas de un evento
   */
  static async getEventStats(eventId: number): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    attended: number;
    paid: number;
    revenue: number;
  }> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:stats:${eventId}`;

      // Intentar obtener del caché
      const cached = await cacheRedis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const registrations = await EventRegistration.findAll({
        where: { eventId },
        attributes: ['status', 'paymentStatus', 'paymentAmount']
      });

      const stats = {
        total: registrations.length,
        confirmed: registrations.filter(r => r.status === 'confirmed').length,
        pending: registrations.filter(r => r.status === 'pending').length,
        cancelled: registrations.filter(r => r.status === 'cancelled').length,
        attended: registrations.filter(r => r.status === 'attended').length,
        paid: registrations.filter(r => r.paymentStatus === 'paid').length,
        revenue: registrations
          .filter(r => r.paymentStatus === 'paid')
          .reduce((sum, r) => sum + (r.paymentAmount || 0), 0)
      };

      // Guardar en caché por 10 minutos
      await cacheRedis.setex(cacheKey, 600, JSON.stringify(stats));

      return stats;
    } catch (error) {
      logger.error('Error getting event stats', { error, eventId });
      throw error;
    }
  }

  // ====================================================================
  // UTILIDADES DE CACHÉ
  // ====================================================================

  /**
   * Limpia el caché de un evento
   */
  private static async clearEventCache(eventId: number): Promise<void> {
    try {
      const keys = await cacheRedis.keys(`${this.CACHE_PREFIX}:stats:${eventId}`);
      if (keys.length > 0) {
        await cacheRedis.del(keys);
      }
    } catch (error) {
      logger.error('Error clearing event cache', { error, eventId });
    }
  }
}