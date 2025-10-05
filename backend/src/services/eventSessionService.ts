/**
 * @fileoverview Servicio de Sesiones de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de sesiones de eventos con capacidad independiente
 */

import { EventSession } from '../models/EventSession';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  CreateEventSessionData,
  UpdateEventSessionData,
  PublicEventSession,
  DetailedEventSession,
  EventSessionQueryParams,
  EventSessionSearchResult,
  EventSessionValidationResult,
  EventSessionsOverviewStats,
  SessionReservationData
} from '../types/event-session.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { EventEmitter } from 'events';
import { Op } from 'sequelize';

/**
 * Servicio para manejo de operaciones de sesiones de eventos
 */
export class EventSessionService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // OPERACIONES CRUD BÁSICAS
  // ====================================================================

  /**
   * Crea una nueva sesión de evento
   */
  async createEventSession(
    sessionData: CreateEventSessionData,
    createdBy: number
  ): Promise<ApiResponse<DetailedEventSession>> {
    try {
      // Validar datos de entrada
      const validation = await this.validateEventSessionData(sessionData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de sesión inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el evento existe
      const event = await Event.findByPk(sessionData.eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos de la sesión
      const sessionPayload: any = {
        ...sessionData,
        createdBy,
        availableCapacity: sessionData.capacity || 0,
        blockedCapacity: 0,
        isVirtual: sessionData.isVirtual ?? false,
        currency: sessionData.currency ?? 'GTQ'
      };

      // Crear sesión
      const session = await EventSession.create(sessionPayload);

      // Cargar sesión completa con relaciones
      const fullSession = await this.getEventSessionWithRelations(session.id);

      if (!fullSession) {
        return {
          success: false,
          message: 'Error al cargar la sesión creada',
          error: 'SESSION_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'event_session_created',
        'event_session',
        {
          userId: createdBy,
          resourceId: session.id.toString(),
          newValues: sessionData,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(sessionData.eventId);

      // Emitir evento
      this.eventEmitter.emit('EventSessionCreated', {
        sessionId: session.id,
        eventId: sessionData.eventId,
        sessionData: fullSession,
        createdBy
      });

      return {
        success: true,
        message: 'Sesión de evento creada exitosamente',
        data: fullSession,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando sesión de evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza una sesión de evento existente
   */
  async updateEventSession(
    sessionId: number,
    updateData: UpdateEventSessionData,
    updatedBy: number
  ): Promise<ApiResponse<DetailedEventSession>> {
    try {
      const session = await EventSession.findByPk(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Sesión de evento no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validateEventSessionData(updateData as Partial<CreateEventSessionData>, true);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de actualización inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      const oldValues = {
        title: session.title,
        startDate: session.startDate,
        endDate: session.endDate,
        capacity: session.capacity,
        location: session.location
      };

      // Actualizar sesión
      await session.update(updateData);

      // Cargar sesión actualizada
      const updatedSession = await this.getEventSessionWithRelations(sessionId);

      if (!updatedSession) {
        return {
          success: false,
          message: 'Error al cargar la sesión actualizada',
          error: 'SESSION_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'event_session_updated',
        'event_session',
        {
          userId: updatedBy,
          resourceId: sessionId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(session.eventId);

      // Emitir evento
      this.eventEmitter.emit('EventSessionUpdated', {
        sessionId,
        eventId: session.eventId,
        oldData: oldValues,
        newData: updatedSession,
        updatedBy
      });

      return {
        success: true,
        message: 'Sesión de evento actualizada exitosamente',
        data: updatedSession,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando sesión de evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina una sesión de evento (soft delete)
   */
  async deleteEventSession(
    sessionId: number,
    deletedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const session = await EventSession.findByPk(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Sesión de evento no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si tiene reservas activas (esto requeriría un modelo de reservas de sesión)
      // Por ahora, permitimos la eliminación

      // Soft delete
      await session.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'event_session_deleted',
        'event_session',
        {
          userId: deletedBy,
          resourceId: sessionId.toString(),
          oldValues: {
            title: session.title,
            eventId: session.eventId,
            startDate: session.startDate
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.invalidateEventCache(session.eventId);

      // Emitir evento
      this.eventEmitter.emit('EventSessionDeleted', {
        sessionId,
        eventId: session.eventId,
        sessionData: session.toJSON(),
        deletedBy
      });

      return {
        success: true,
        message: 'Sesión de evento eliminada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando sesión de evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE CAPACIDAD POR SESIÓN
  // ====================================================================

  /**
   * Verifica disponibilidad de capacidad para una sesión
   */
  async checkSessionAvailability(
    sessionId: number,
    requestedQuantity: number = 1
  ): Promise<ApiResponse<{ available: boolean; availableCapacity: number; message: string }>> {
    try {
      const session = await EventSession.findByPk(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (!session.isActive) {
        return {
          success: true,
          message: 'Sesión inactiva',
          data: {
            available: false,
            availableCapacity: 0,
            message: 'La sesión no está activa'
          },
          timestamp: new Date().toISOString()
        };
      }

      const now = new Date();
      if (session.startDate <= now) {
        return {
          success: true,
          message: 'Sesión ya comenzó o terminó',
          data: {
            available: false,
            availableCapacity: 0,
            message: 'La sesión ya comenzó o terminó'
          },
          timestamp: new Date().toISOString()
        };
      }

      const availableCapacity = session.availableCapacity;
      const available = availableCapacity >= requestedQuantity;

      return {
        success: true,
        message: available ? 'Capacidad disponible' : 'Capacidad insuficiente',
        data: {
          available,
          availableCapacity,
          message: available
            ? `Capacidad disponible para ${requestedQuantity} participante(s)`
            : `Solo ${availableCapacity} cupo(s) disponible(s) de ${requestedQuantity} solicitado(s)`
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error verificando disponibilidad de sesión:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Bloquea capacidad temporalmente para una sesión
   */
  async blockSessionCapacity(
    sessionId: number,
    quantity: number,
    blockDurationMinutes: number = 15
  ): Promise<ApiResponse<{ blocked: boolean; expiresAt: Date; message: string }>> {
    try {
      const session = await EventSession.findByPk(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar disponibilidad
      if (session.availableCapacity < quantity) {
        return {
          success: false,
          message: 'Capacidad insuficiente para bloquear',
          error: 'INSUFFICIENT_CAPACITY',
          timestamp: new Date().toISOString()
        };
      }

      // Actualizar capacidad
      await session.update({
        availableCapacity: session.availableCapacity - quantity,
        blockedCapacity: session.blockedCapacity + quantity
      });

      const expiresAt = new Date(Date.now() + blockDurationMinutes * 60 * 1000);

      // Invalidar caché
      await cacheService.invalidateEventCache(session.eventId);

      return {
        success: true,
        message: 'Capacidad bloqueada exitosamente',
        data: {
          blocked: true,
          expiresAt,
          message: `${quantity} cupo(s) bloqueado(s) por ${blockDurationMinutes} minutos`
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error bloqueando capacidad de sesión:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Libera capacidad bloqueada
   */
  async releaseBlockedCapacity(
    sessionId: number,
    quantity: number
  ): Promise<ApiResponse<{ released: boolean; message: string }>> {
    try {
      const session = await EventSession.findByPk(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (session.blockedCapacity < quantity) {
        quantity = session.blockedCapacity; // No liberar más de lo bloqueado
      }

      await session.update({
        availableCapacity: session.availableCapacity + quantity,
        blockedCapacity: session.blockedCapacity - quantity
      });

      // Invalidar caché
      await cacheService.invalidateEventCache(session.eventId);

      return {
        success: true,
        message: 'Capacidad liberada exitosamente',
        data: {
          released: true,
          message: `${quantity} cupo(s) liberado(s)`
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error liberando capacidad bloqueada:', error);
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
   * Obtiene sesiones de un evento
   */
  async getEventSessions(
    eventId: number,
    params: EventSessionQueryParams = {}
  ): Promise<ApiResponse<EventSessionSearchResult>> {
    try {
      const cacheKey = `event_sessions:${eventId}:${JSON.stringify(params)}`;

      // Usar patrón cache-aside
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => await this.fetchEventSessionsFromDB(eventId, params),
        300 // TTL de 5 minutos
      );

      return {
        success: true,
        message: 'Sesiones obtenidas exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo sesiones del evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Método privado para obtener sesiones desde la base de datos
   */
  private async fetchEventSessionsFromDB(
    eventId: number,
    params: EventSessionQueryParams
  ): Promise<EventSessionSearchResult> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'startDate',
      sortOrder = 'ASC',
      search,
      filters = {}
    } = params;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = { eventId };

    // Aplicar filtros adicionales
    if (filters.sessionType) {
      where.sessionType = filters.sessionType;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.isVirtual !== undefined) {
      where.isVirtual = filters.isVirtual;
    }
    if (filters.hasCapacity) {
      where.availableCapacity = { [Op.gt]: 0 };
    }
    if (filters.startDateFrom || filters.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) where.startDate[Op.gte] = filters.startDateFrom;
      if (filters.startDateTo) where.startDate[Op.lte] = filters.startDateTo;
    }

    // Búsqueda por texto
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Ordenamiento
    const order: any[] = [];
    switch (sortBy) {
      case 'startDate':
        order.push(['startDate', sortOrder]);
        break;
      case 'endDate':
        order.push(['endDate', sortOrder]);
        break;
      case 'title':
        order.push(['title', sortOrder]);
        break;
      case 'capacity':
        order.push(['capacity', sortOrder]);
        break;
      case 'createdAt':
        order.push(['createdAt', sortOrder]);
        break;
      default:
        order.push(['startDate', 'ASC']);
    }

    const { rows: sessions, count: total } = await EventSession.findAndCountAll({
      where,
      limit,
      offset,
      order,
      distinct: true
    });

    const formattedSessions: PublicEventSession[] = sessions.map(session => ({
      id: session.id,
      eventId: session.eventId,
      title: session.title,
      description: session.description,
      sessionType: session.sessionType,
      startDate: session.startDate,
      endDate: session.endDate,
      capacity: session.capacity,
      availableCapacity: session.availableCapacity,
      blockedCapacity: session.blockedCapacity,
      utilizationPercentage: session.utilizationPercentage,
      location: session.location,
      virtualLocation: session.virtualLocation,
      isVirtual: session.isVirtual,
      price: session.price,
      currency: session.currency,
      requirements: session.requirements,
      isActive: session.isActive,
      isAvailable: session.isAvailable,
      createdAt: session.createdAt
    }));

    return {
      sessions: formattedSessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1
      },
      filters
    };
  }

  /**
   * Obtiene una sesión específica por ID
   */
  async getEventSessionById(
    sessionId: number,
    includePrivate: boolean = false
  ): Promise<ApiResponse<DetailedEventSession | PublicEventSession>> {
    try {
      const session = await this.getEventSessionWithRelations(sessionId, includePrivate);
      if (!session) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Sesión obtenida exitosamente',
        data: session,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo sesión por ID:', error);
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
   * Obtiene una sesión con todas sus relaciones cargadas
   */
  private async getEventSessionWithRelations(
    sessionId: number,
    includePrivate: boolean = false
  ): Promise<DetailedEventSession | null> {
    const session = await EventSession.findByPk(sessionId, {
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'creator' }
      ]
    });

    if (!session) return null;

    const baseSession = {
      id: session.id,
      eventId: session.eventId,
      title: session.title,
      sessionType: session.sessionType,
      startDate: session.startDate,
      endDate: session.endDate,
      capacity: session.capacity,
      availableCapacity: session.availableCapacity,
      blockedCapacity: session.blockedCapacity,
      utilizationPercentage: session.utilizationPercentage,
      location: session.location,
      virtualLocation: session.virtualLocation,
      isVirtual: session.isVirtual,
      price: session.effectivePrice,
      currency: session.currency,
      requirements: session.requirements,
      isActive: session.isActive,
      isAvailable: session.isAvailable,
      createdAt: session.createdAt
    };

    const detailedSession: DetailedEventSession = {
      ...baseSession,
      description: includePrivate ? session.description : undefined,
      metadata: includePrivate ? session.metadata : undefined,
      createdBy: includePrivate ? session.createdBy : 0,
      updatedAt: session.updatedAt
    };

    return detailedSession;
  }

  /**
   * Valida datos de sesión de evento
   */
  private async validateEventSessionData(
    data: Partial<CreateEventSessionData>,
    isUpdate: boolean = false
  ): Promise<EventSessionValidationResult> {
    const errors: any[] = [];

    // Validaciones básicas
    if (!isUpdate || data.title !== undefined) {
      if (!data.title || data.title.trim().length < 3) {
        errors.push({
          field: 'title',
          message: 'El título debe tener al menos 3 caracteres',
          value: data.title
        });
      }
    }

    if (!isUpdate || data.startDate !== undefined) {
      if (!data.startDate) {
        errors.push({
          field: 'startDate',
          message: 'La fecha de inicio es requerida',
          value: data.startDate
        });
      } else if (data.startDate <= new Date()) {
        errors.push({
          field: 'startDate',
          message: 'La fecha de inicio debe ser futura',
          value: data.startDate
        });
      }
    }

    if (!isUpdate || data.endDate !== undefined) {
      if (!data.endDate) {
        errors.push({
          field: 'endDate',
          message: 'La fecha de fin es requerida',
          value: data.endDate
        });
      } else if (data.startDate && data.endDate <= data.startDate) {
        errors.push({
          field: 'endDate',
          message: 'La fecha de fin debe ser posterior a la fecha de inicio',
          value: data.endDate
        });
      }
    }

    if (!isUpdate || data.sessionType !== undefined) {
      const validTypes = ['date', 'time_slot', 'workshop', 'track', 'other'];
      if (!data.sessionType || !validTypes.includes(data.sessionType)) {
        errors.push({
          field: 'sessionType',
          message: 'Tipo de sesión inválido',
          value: data.sessionType
        });
      }
    }

    if (!isUpdate || data.capacity !== undefined) {
      if (data.capacity !== undefined && (data.capacity < 1 || data.capacity > 100000)) {
        errors.push({
          field: 'capacity',
          message: 'La capacidad debe estar entre 1 y 100,000',
          value: data.capacity
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene estadísticas de sesiones por evento
   */
  async getEventSessionsStats(eventId: number): Promise<ApiResponse<EventSessionsOverviewStats>> {
    try {
      const stats = await EventSession.getEventSessionsStats(eventId);

      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de sesiones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene event emitter para registro de listeners
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const eventSessionService = new EventSessionService();