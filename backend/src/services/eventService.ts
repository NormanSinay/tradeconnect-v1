/**
 * @fileoverview Servicio de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de eventos
 *
 * Archivo: backend/src/services/eventService.ts
 */

import { Event } from '../models/Event';
import { EventType } from '../models/EventType';
import { EventCategory } from '../models/EventCategory';
import { EventStatus } from '../models/EventStatus';
import { EventDuplication } from '../models/EventDuplication';
import { EventRegistration } from '../models/EventRegistration';
import { EventMedia } from '../models/EventMedia';
import { Speaker } from '../models/Speaker';
import { SpeakerEvent } from '../models/SpeakerEvent';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  CreateEventData,
  UpdateEventData,
  PublicEvent,
  DetailedEvent,
  AdminEvent,
  EventFilters,
  EventQueryParams,
  EventSearchResult,
  PublishEventData,
  EventValidationResult,
  EventStats,
  EventsOverviewStats
} from '../types/event.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';
import { EventEmitter } from 'events';
import { cacheService } from './cacheService';

/**
 * Servicio para manejo de operaciones de eventos
 */
export class EventService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // OPERACIONES CRUD BÁSICAS
  // ====================================================================

  /**
   * Crea un nuevo evento
   */
  async createEvent(
    eventData: CreateEventData,
    createdBy: number
  ): Promise<ApiResponse<DetailedEvent>> {
    try {
      // Validar datos de entrada
      const validation = await this.validateEventData(eventData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de evento inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del evento
      const eventPayload: any = {
        ...eventData,
        createdBy,
        registeredCount: 0,
        isVirtual: eventData.isVirtual ?? false,
        price: eventData.price ?? 0,
        currency: eventData.currency ?? 'GTQ',
        eventStatusId: eventData.eventStatusId || (await this.getDefaultStatusId('draft'))
      };

      // Crear evento
      const event = await Event.create(eventPayload);

      // Cargar relaciones
      const fullEvent = await this.getEventWithRelations(event.id);

      if (!fullEvent) {
        return {
          success: false,
          message: 'Error al cargar el evento creado',
          error: 'EVENT_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'event_created',
        'event',
        {
          userId: createdBy,
          resourceId: event.id.toString(),
          newValues: eventData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché de listas públicas
      await cacheService.invalidateEventListsCache();

      // Emitir evento
      this.eventEmitter.emit('EventCreated', {
        eventId: event.id,
        eventData: fullEvent,
        createdBy
      });

      return {
        success: true,
        message: 'Evento creado exitosamente',
        data: fullEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(
    eventId: number,
    updateData: UpdateEventData,
    updatedBy: number
  ): Promise<ApiResponse<DetailedEvent>> {
    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el creador o admin puede actualizar)
      if (event.createdBy !== updatedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para actualizar este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validateEventData(updateData as Partial<CreateEventData>, true);
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
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        price: event.price,
        capacity: event.capacity
      };

      // Actualizar evento
      await event.update(updateData);

      // Cargar evento actualizado
      const updatedEvent = await this.getEventWithRelations(eventId);

      if (!updatedEvent) {
        return {
          success: false,
          message: 'Error al cargar el evento actualizado',
          error: 'EVENT_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'event_updated',
        'event',
        {
          userId: updatedBy,
          resourceId: eventId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del evento específico y listas
      await cacheService.invalidateEventCache(eventId);
      await cacheService.invalidateEventListsCache();

      // Emitir evento
      this.eventEmitter.emit('EventUpdated', {
        eventId,
        oldData: oldValues,
        newData: updatedEvent,
        updatedBy
      });

      return {
        success: true,
        message: 'Evento actualizado exitosamente',
        data: updatedEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un evento (soft delete)
   */
  async deleteEvent(
    eventId: number,
    deletedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (event.createdBy !== deletedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para eliminar este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si tiene inscripciones activas
      const activeRegistrations = await EventRegistration.count({
        where: {
          eventId,
          status: { [Op.in]: ['pending', 'confirmed'] }
        }
      });

      if (activeRegistrations > 0) {
        return {
          success: false,
          message: 'No se puede eliminar un evento con inscripciones activas',
          error: 'EVENT_HAS_ACTIVE_REGISTRATIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Si no tiene inscripciones activas, hacer eliminación permanente (hard delete)
      if (activeRegistrations === 0) {
        await event.destroy({ force: true });
      } else {
        // Soft delete para eventos con inscripciones (aunque esto nunca debería suceder por la validación anterior)
        await event.destroy();
      }

      // Registrar en auditoría
      await AuditLog.log(
        'event_deleted',
        'event',
        {
          userId: deletedBy,
          resourceId: eventId.toString(),
          oldValues: {
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del evento específico y listas
      await cacheService.invalidateEventCache(eventId);
      await cacheService.invalidateEventListsCache();

      // Emitir evento
      this.eventEmitter.emit('EventDeleted', {
        eventId,
        eventData: event.toJSON(),
        deletedBy
      });

      return {
        success: true,
        message: 'Evento eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // OPERACIONES DE ESTADO
  // ====================================================================

  /**
   * Publica un evento
   */
  async publishEvent(
    eventId: number,
    publishData: PublishEventData,
    publishedBy: number
  ): Promise<ApiResponse<DetailedEvent>> {
    try {
      const event = await Event.findByPk(eventId, {
        include: [
          { model: EventType, as: 'eventType' },
          { model: EventCategory, as: 'eventCategory' },
          { model: EventStatus, as: 'eventStatus' }
        ]
      });

      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (event.createdBy !== publishedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para publicar este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el evento no esté ya publicado
      if (event.eventStatus?.name === 'published') {
        return {
          success: false,
          message: 'El evento ya está publicado o en un estado que no permite publicación.',
          error: 'EVENT_ALREADY_PUBLISHED',
          timestamp: new Date().toISOString()
        };
      }

      // Validar que el evento esté completo para publicar
      const validation = await this.validateEventForPublishing(event);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'El evento no está completo para ser publicado',
          error: 'EVENT_NOT_READY_FOR_PUBLISHING',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      const publishedStatusId = await this.getDefaultStatusId('published');

      // Actualizar estado y fecha de publicación
      await event.update({
        eventStatusId: publishedStatusId,
        publishedAt: new Date()
      });

      // Cargar evento actualizado
      const publishedEvent = await this.getEventWithRelations(eventId);

      if (!publishedEvent) {
        return {
          success: false,
          message: 'Error al cargar el evento publicado',
          error: 'EVENT_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'event_published',
        'event',
        {
          userId: publishedBy,
          resourceId: eventId.toString(),
          newValues: {
            eventStatusId: publishedStatusId,
            publishedAt: event.publishedAt
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del evento específico y listas
      await cacheService.invalidateEventCache(eventId);
      await cacheService.invalidateEventListsCache();

      // Emitir evento
      this.eventEmitter.emit('EventPublished', {
        eventId,
        eventData: publishedEvent,
        publishedBy,
        notifySubscribers: publishData.notifySubscribers || false
      });

      return {
        success: true,
        message: 'Evento publicado exitosamente',
        data: publishedEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error publicando evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cancela un evento
   */
  async cancelEvent(
    eventId: number,
    reason: string,
    cancelledBy: number
  ): Promise<ApiResponse<DetailedEvent>> {
    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (event.createdBy !== cancelledBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para cancelar este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      const cancelledStatusId = await this.getDefaultStatusId('cancelled');

      // Actualizar estado
      await event.update({
        eventStatusId: cancelledStatusId,
        cancelledAt: new Date(),
        cancellationReason: reason
      });

      // Cancelar todas las inscripciones pendientes
      await EventRegistration.update(
        {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Evento cancelado por el organizador'
        },
        {
          where: {
            eventId,
            status: { [Op.in]: ['pending', 'confirmed'] }
          }
        }
      );

      // Cargar evento actualizado
      const cancelledEvent = await this.getEventWithRelations(eventId);

      if (!cancelledEvent) {
        return {
          success: false,
          message: 'Error al cargar el evento cancelado',
          error: 'EVENT_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'event_cancelled',
        'event',
        {
          userId: cancelledBy,
          resourceId: eventId.toString(),
          newValues: {
            eventStatusId: cancelledStatusId,
            cancelledAt: event.cancelledAt,
            cancellationReason: reason
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del evento específico y listas
      await cacheService.invalidateEventCache(eventId);
      await cacheService.invalidateEventListsCache();

      // Emitir evento
      this.eventEmitter.emit('EventCancelled', {
        eventId,
        eventData: cancelledEvent,
        cancelledBy,
        reason
      });

      return {
        success: true,
        message: 'Evento cancelado exitosamente',
        data: cancelledEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error cancelando evento:', error);
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
   * Obtiene eventos publicados con filtros (con caché)
   */
  async getPublishedEvents(params: EventQueryParams = {}): Promise<ApiResponse<EventSearchResult>> {
    try {
      const cacheKey = `events:public:${JSON.stringify(params)}`;

      // Usar patrón cache-aside
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => await this.fetchPublishedEventsFromDB(params),
        300 // TTL de 5 minutos
      );

      return {
        success: true,
        message: 'Eventos obtenidos exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo eventos publicados:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Método privado para obtener eventos publicados desde la base de datos
   */
  private async fetchPublishedEventsFromDB(params: EventQueryParams): Promise<EventSearchResult> {
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
    const where: any = {
      '$eventStatus.name$': 'published',
      startDate: { [Op.gte]: new Date() }
    };

    // Aplicar filtros adicionales
    if (filters.eventTypeId) {
      where.eventTypeId = filters.eventTypeId;
    }
    if (filters.eventCategoryId) {
      where.eventCategoryId = filters.eventCategoryId;
    }
    if (filters.isVirtual !== undefined) {
      where.isVirtual = filters.isVirtual;
    }
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) where.price[Op.gte] = filters.priceMin;
      if (filters.priceMax !== undefined) where.price[Op.lte] = filters.priceMax;
    }
    if (filters.startDateFrom || filters.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) where.startDate[Op.gte] = filters.startDateFrom;
      if (filters.startDateTo) where.startDate[Op.lte] = filters.startDateTo;
    }
    // Handle featured filter for home page
    // Featured events are simply the newest events (no registration count filter)
    // This is handled by sorting by createdAt DESC in the frontend query
    // if (filters.featured) {
    //   // Future enhancement: could add a dedicated is_featured field in database
    // }

    // Búsqueda por texto
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } }
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
      case 'price':
        order.push(['price', sortOrder]);
        break;
      case 'createdAt':
        order.push(['createdAt', sortOrder]);
        break;
      default:
        order.push(['startDate', 'ASC']);
    }

    // DEBUG LOG
    console.log('🔍 DEBUG WHERE CLAUSE:', JSON.stringify(where, null, 2));
    console.log('🔍 DEBUG FEATURED PARAM:', filters.featured);

    const { rows: events, count: total } = await Event.findAndCountAll({
      where,
      include: [
        { model: EventType, as: 'eventType' },
        { model: EventCategory, as: 'eventCategory' },
        { model: EventStatus, as: 'eventStatus' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
      ],
      limit,
      offset,
      order,
      distinct: true
    });

    const formattedEvents: PublicEvent[] = events.map(event => ({
      id: event.id,
      title: event.title,
      shortDescription: event.shortDescription,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      virtualLocation: event.virtualLocation,
      isVirtual: event.isVirtual,
      price: event.price,
      currency: event.currency,
      capacity: event.capacity,
      registeredCount: event.registeredCount,
      availableSpots: event.availableSpots || undefined,
      tags: event.tags,
      eventType: {
        id: event.eventType!.id,
        name: event.eventType!.name,
        displayName: event.eventType!.displayName,
        description: event.eventType!.description,
        isActive: event.eventType!.isActive
      },
      eventCategory: {
        id: event.eventCategory!.id,
        name: event.eventCategory!.name,
        displayName: event.eventCategory!.displayName,
        description: event.eventCategory!.description,
        isActive: event.eventCategory!.isActive
      },
      eventStatus: {
        id: event.eventStatus!.id,
        name: event.eventStatus!.name,
        displayName: event.eventStatus!.displayName,
        description: event.eventStatus!.description,
        color: event.eventStatus!.color,
        isActive: event.eventStatus!.isActive
      },
      publishedAt: event.publishedAt,
      createdAt: event.createdAt
    }));

    return {
      events: formattedEvents,
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
   * Obtiene eventos del usuario autenticado
   */
  async getUserEvents(userId: number, params: EventQueryParams = {}): Promise<ApiResponse<EventSearchResult>> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        search,
        filters = {}
      } = params;

      const offset = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        createdBy: userId
      };

      // Aplicar filtros adicionales
      if (filters.eventTypeId) {
        where.eventTypeId = filters.eventTypeId;
      }
      if (filters.eventCategoryId) {
        where.eventCategoryId = filters.eventCategoryId;
      }
      if (filters.eventStatusId) {
        where.eventStatusId = filters.eventStatusId;
      }
      if (filters.isVirtual !== undefined) {
        where.isVirtual = filters.isVirtual;
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
          { description: { [Op.iLike]: `%${search}%` } },
          { shortDescription: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Ordenamiento
      const order: any[] = [];
      switch (sortBy) {
        case 'createdAt':
          order.push(['createdAt', sortOrder]);
          break;
        case 'startDate':
          order.push(['startDate', sortOrder]);
          break;
        case 'endDate':
          order.push(['endDate', sortOrder]);
          break;
        case 'title':
          order.push(['title', sortOrder]);
          break;
        case 'price':
          order.push(['price', sortOrder]);
          break;
        default:
          order.push(['createdAt', 'DESC']);
      }

      const { rows: events, count: total } = await Event.findAndCountAll({
        where,
        include: [
          { model: EventType, as: 'eventType' },
          { model: EventCategory, as: 'eventCategory' },
          { model: EventStatus, as: 'eventStatus' }
        ],
        limit,
        offset,
        order,
        distinct: true
      });

      const formattedEvents: AdminEvent[] = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        shortDescription: event.shortDescription,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        virtualLocation: event.virtualLocation,
        isVirtual: event.isVirtual,
        price: event.price,
        currency: event.currency,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        availableSpots: event.availableSpots || undefined,
        minAge: event.minAge,
        maxAge: event.maxAge,
        tags: event.tags,
        requirements: event.requirements,
        agenda: event.agenda,
        metadata: event.metadata,
        eventTypeId: event.eventTypeId,
        eventCategoryId: event.eventCategoryId,
        eventStatusId: event.eventStatusId,
        createdBy: event.createdBy,
        eventType: event.eventType ? {
          id: event.eventType.id,
          name: event.eventType.name,
          displayName: event.eventType.displayName,
          description: event.eventType.description,
          isActive: event.eventType.isActive
        } : undefined as any,
        eventCategory: event.eventCategory ? {
          id: event.eventCategory.id,
          name: event.eventCategory.name,
          displayName: event.eventCategory.displayName,
          description: event.eventCategory.description,
          isActive: event.eventCategory.isActive
        } : undefined as any,
        eventStatus: event.eventStatus ? {
          id: event.eventStatus.id,
          name: event.eventStatus.name,
          displayName: event.eventStatus.displayName,
          description: event.eventStatus.description,
          color: event.eventStatus.color,
          isActive: event.eventStatus.isActive
        } : undefined as any,
        creator: event.creator ? {
          id: event.creator.id,
          firstName: event.creator.firstName,
          lastName: event.creator.lastName,
          fullName: `${event.creator.firstName} ${event.creator.lastName}`,
          avatar: event.creator.avatar || undefined
        } : undefined as any,
        publishedAt: event.publishedAt,
        cancelledAt: event.cancelledAt,
        cancellationReason: event.cancellationReason,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }));

      return {
        success: true,
        message: 'Eventos obtenidos exitosamente',
        data: {
          events: formattedEvents,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrevious: page > 1
          },
          filters
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo eventos del usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene un evento por ID con relaciones completas
   */
  async getEventById(eventId: number, includePrivate: boolean = false): Promise<ApiResponse<DetailedEvent | PublicEvent>> {
    try {
      const event = await this.getEventWithRelations(eventId, includePrivate);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Evento obtenido exitosamente',
        data: event,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo evento por ID:', error);
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
   * Obtiene un evento con todas sus relaciones cargadas
   */
  private async getEventWithRelations(eventId: number, includePrivate: boolean = false): Promise<DetailedEvent | null> {
    const event = await Event.findByPk(eventId, {
      include: [
        { model: EventType, as: 'eventType' },
        { model: EventCategory, as: 'eventCategory' },
        { model: EventStatus, as: 'eventStatus' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
      ]
    });

    if (!event) return null;

    const baseEvent = {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      virtualLocation: event.virtualLocation,
      isVirtual: event.isVirtual,
      price: event.price,
      currency: event.currency,
      capacity: event.capacity,
      registeredCount: event.registeredCount,
      availableSpots: event.availableSpots || undefined,
      tags: event.tags,
      eventType: event.eventType ? {
        id: event.eventType.id,
        name: event.eventType.name,
        displayName: event.eventType.displayName,
        description: event.eventType.description,
        isActive: event.eventType.isActive
      } : undefined as any,
      eventCategory: event.eventCategory ? {
        id: event.eventCategory.id,
        name: event.eventCategory.name,
        displayName: event.eventCategory.displayName,
        description: event.eventCategory.description,
        isActive: event.eventCategory.isActive
      } : undefined as any,
      eventStatus: event.eventStatus ? {
        id: event.eventStatus.id,
        name: event.eventStatus.name,
        displayName: event.eventStatus.displayName,
        description: event.eventStatus.description,
        color: event.eventStatus.color,
        isActive: event.eventStatus.isActive
      } : undefined as any,
      publishedAt: event.publishedAt,
      createdAt: event.createdAt
    };

    const detailedEvent: DetailedEvent = {
      ...baseEvent,
      description: includePrivate ? event.description : undefined,
      shortDescription: includePrivate ? event.shortDescription : undefined,
      minAge: includePrivate ? event.minAge : undefined,
      maxAge: includePrivate ? event.maxAge : undefined,
      requirements: includePrivate ? event.requirements : undefined,
      agenda: includePrivate ? event.agenda : undefined,
      metadata: includePrivate ? event.metadata : undefined,
      creator: includePrivate && event.creator ? {
        id: event.creator.id,
        firstName: event.creator.firstName,
        lastName: event.creator.lastName,
        fullName: event.creator.fullName,
        avatar: event.creator.avatar || undefined
      } : undefined as any,
      cancelledAt: includePrivate ? event.cancelledAt : undefined,
      cancellationReason: includePrivate ? event.cancellationReason : undefined,
      updatedAt: event.updatedAt
    };

    return detailedEvent;
  }

  /**
   * Valida datos de evento
   */
  private async validateEventData(data: Partial<CreateEventData>, isUpdate: boolean = false): Promise<EventValidationResult> {
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

    // Validar tipos y categorías existen
    if (!isUpdate || data.eventTypeId !== undefined) {
      if (!data.eventTypeId) {
        errors.push({
          field: 'eventTypeId',
          message: 'El tipo de evento es requerido',
          value: data.eventTypeId
        });
      } else {
        const eventType = await EventType.findByPk(data.eventTypeId);
        if (!eventType || !eventType.isActive) {
          errors.push({
            field: 'eventTypeId',
            message: 'El tipo de evento no existe o no está activo',
            value: data.eventTypeId
          });
        }
      }
    }

    if (!isUpdate || data.eventCategoryId !== undefined) {
      if (!data.eventCategoryId) {
        errors.push({
          field: 'eventCategoryId',
          message: 'La categoría del evento es requerida',
          value: data.eventCategoryId
        });
      } else {
        const eventCategory = await EventCategory.findByPk(data.eventCategoryId);
        if (!eventCategory || !eventCategory.isActive) {
          errors.push({
            field: 'eventCategoryId',
            message: 'La categoría del evento no existe o no está activa',
            value: data.eventCategoryId
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida que un evento esté listo para publicar
   */
  private async validateEventForPublishing(event: Event): Promise<EventValidationResult> {
    const errors: any[] = [];

    // Verificar campos requeridos
    if (!event.description || event.description.trim().length < 10) {
      errors.push({
        field: 'description',
        message: 'La descripción debe tener al menos 10 caracteres'
      });
    }

    if (event.isVirtual && !event.virtualLocation) {
      errors.push({
        field: 'virtualLocation',
        message: 'Los eventos virtuales requieren un enlace'
      });
    }

    if (!event.isVirtual && !event.location) {
      errors.push({
        field: 'location',
        message: 'Los eventos presenciales requieren una ubicación'
      });
    }

    // Verificar que tenga al menos una imagen destacada
    const featuredImage = await EventMedia.findOne({
      where: { eventId: event.id, isFeatured: true }
    });

    if (!featuredImage) {
      errors.push({
        field: 'media',
        message: 'El evento debe tener al menos una imagen destacada'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene el ID del estado por defecto
   */
  private async getDefaultStatusId(statusName: string): Promise<number> {
    const status = await EventStatus.findByName(statusName);
    if (!status) {
      throw new Error(`Estado '${statusName}' no encontrado`);
    }
    return status.id;
  }

  // ====================================================================
  // EVENT EMITTER ACCESS
  // ====================================================================

  /**
   * Duplica un evento existente
   */
  async duplicateEvent(
    eventId: number,
    customizations: Partial<CreateEventData>,
    duplicatedBy: number
  ): Promise<ApiResponse<DetailedEvent>> {
    try {
      const originalEvent = await Event.findByPk(eventId, {
        include: [
          { model: EventType, as: 'eventType' },
          { model: EventCategory, as: 'eventCategory' },
          { model: EventStatus, as: 'eventStatus' }
        ]
      });

      if (!originalEvent) {
        return {
          success: false,
          message: 'Evento original no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el creador puede duplicar)
      if (originalEvent.createdBy !== duplicatedBy) {
        return {
          success: false,
          message: 'No tiene permisos para duplicar este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del evento duplicado
      const duplicatedData: CreateEventData = {
        title: customizations.title || `Copia - ${originalEvent.title}`,
        description: customizations.description || originalEvent.description,
        shortDescription: customizations.shortDescription || originalEvent.shortDescription,
        startDate: customizations.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Una semana después
        endDate: customizations.endDate || new Date((customizations.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).getTime() + (originalEvent.endDate.getTime() - originalEvent.startDate.getTime())),
        location: customizations.location || originalEvent.location,
        virtualLocation: customizations.virtualLocation || originalEvent.virtualLocation,
        isVirtual: customizations.isVirtual !== undefined ? customizations.isVirtual : originalEvent.isVirtual,
        price: customizations.price !== undefined ? customizations.price : originalEvent.price,
        currency: customizations.currency || originalEvent.currency,
        capacity: customizations.capacity || originalEvent.capacity,
        minAge: customizations.minAge || originalEvent.minAge,
        maxAge: customizations.maxAge || originalEvent.maxAge,
        tags: customizations.tags || originalEvent.tags,
        requirements: customizations.requirements || originalEvent.requirements,
        agenda: customizations.agenda || originalEvent.agenda,
        eventTypeId: customizations.eventTypeId || originalEvent.eventTypeId,
        eventCategoryId: customizations.eventCategoryId || originalEvent.eventCategoryId,
        eventStatusId: customizations.eventStatusId || (await this.getDefaultStatusId('draft'))
      };

      // Crear el evento duplicado
      const result = await this.createEvent(duplicatedData, duplicatedBy);

      if (result.success) {
        // Registrar la duplicación
        await EventDuplication.create({
          sourceEventId: eventId,
          duplicatedEventId: (result.data as DetailedEvent).id,
          duplicatedBy,
          modifications: customizations
        });

        // Emitir evento de duplicación
        this.eventEmitter.emit('EventDuplicated', {
          sourceEventId: eventId,
          duplicatedEventId: (result.data as DetailedEvent).id,
          duplicatedBy,
          customizations
        });
      }

      return result;

    } catch (error) {
      logger.error('Error duplicando evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Asignar speaker a evento
   */
  async assignSpeakerToEvent(
    eventId: number,
    speakerData: {
      speakerId: number;
      role: 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';
      participationStart: string | Date;
      participationEnd: string | Date;
      modality?: 'presential' | 'virtual' | 'hybrid';
      order?: number;
      notes?: string;
    },
    assignedBy: number
  ): Promise<ApiResponse<any>> {
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

      // Verificar permisos (solo el creador del evento puede asignar speakers)
      if (event.createdBy !== assignedBy) {
        return {
          success: false,
          message: 'No tiene permisos para asignar speakers a este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el speaker existe y está activo en la tabla speakers
      const speaker = await Speaker.findByPk(speakerData.speakerId);
      if (!speaker || !speaker.isActive) {
        return {
          success: false,
          message: 'Speaker no encontrado o inactivo',
          error: 'SPEAKER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si ya existe una asignación activa para este speaker y evento
      const existingAssignment = await SpeakerEvent.findOne({
        where: {
          speakerId: speakerData.speakerId,
          eventId
        }
      });

      // Si existe una asignación activa (no soft deleted), no permitir crear nueva
      if (existingAssignment) {
        return {
          success: false,
          message: 'Este speaker ya está asignado a este evento',
          error: 'SPEAKER_ALREADY_ASSIGNED',
          timestamp: new Date().toISOString()
        };
      }

      // Crear nueva asignación
      const speakerEventData = {
        speakerId: speakerData.speakerId,
        eventId,
        role: speakerData.role,
        participationStart: speakerData.participationStart ? new Date(speakerData.participationStart) : null,
        participationEnd: speakerData.participationEnd ? new Date(speakerData.participationEnd) : null,
        modality: speakerData.modality || 'presential',
        order: speakerData.order,
        status: 'tentative' as const,
        notes: speakerData.notes,
        createdBy: assignedBy
      };

      const speakerEvent = await SpeakerEvent.create(speakerEventData);

      // Registrar en auditoría - creación
      await AuditLog.log(
        'speaker_assigned_to_event',
        'speaker_event',
        {
          userId: assignedBy,
          resourceId: speakerEvent.id.toString(),
          newValues: {
            speakerId: speakerData.speakerId,
            eventId,
            role: speakerData.role
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Cargar la asignación completa con relaciones
      const fullSpeakerEvent = await SpeakerEvent.findByPk(speakerEvent.id, {
        include: [
          {
            model: Speaker,
            as: 'speaker',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate', 'endDate']
          }
        ]
      });

      // Registrar en auditoría
      await AuditLog.log(
        'speaker_assigned_to_event',
        'speaker_event',
        {
          userId: assignedBy,
          resourceId: speakerEvent.id.toString(),
          newValues: {
            speakerId: speakerData.speakerId,
            eventId,
            role: speakerData.role
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del evento
      await cacheService.delete(`event:detail:${eventId}`);

      // Emitir evento
      this.eventEmitter.emit('SpeakerAssignedToEvent', {
        speakerEventId: speakerEvent.id,
        speakerId: speakerData.speakerId,
        eventId,
        assignedBy
      });

      return {
        success: true,
        message: 'Speaker asignado exitosamente al evento',
        data: fullSpeakerEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error asignando speaker a evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtener speakers asignados a un evento
   */
  async getEventSpeakers(
    eventId: number,
    userId: number,
    status?: string[]
  ): Promise<ApiResponse<any>> {
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

      // Verificar permisos (solo el creador del evento puede ver los speakers)
      if (event.createdBy !== userId) {
        return {
          success: false,
          message: 'No tiene permisos para ver los speakers de este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      const where: any = { eventId };
      if (status && status.length > 0) {
        where.status = { [Op.in]: status };
      }

      const speakerEvents = await SpeakerEvent.findAll({
        where,
        include: [
          {
            model: Speaker,
            as: 'speaker',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ],
        order: [['order', 'ASC'], ['participationStart', 'ASC']]
      });

      return {
        success: true,
        message: 'Speakers del evento obtenidos exitosamente',
        data: speakerEvents,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo speakers del evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualizar asignación de speaker a evento
   */
  async updateSpeakerAssignment(
    eventId: number,
    speakerId: number,
    updateData: {
      role?: 'keynote_speaker' | 'panelist' | 'facilitator' | 'moderator' | 'guest';
      participationStart?: string | Date;
      participationEnd?: string | Date;
      modality?: 'presential' | 'virtual' | 'hybrid';
      order?: number;
      notes?: string;
      status?: 'tentative' | 'confirmed' | 'cancelled' | 'completed';
    },
    updatedBy: number
  ): Promise<ApiResponse<any>> {
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

      // Verificar permisos (solo el creador del evento puede actualizar asignaciones)
      if (event.createdBy !== updatedBy) {
        return {
          success: false,
          message: 'No tiene permisos para actualizar asignaciones de speakers en este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Buscar la asignación existente
      const speakerEvent = await SpeakerEvent.findOne({
        where: {
          speakerId,
          eventId
        }
      });

      if (!speakerEvent) {
        return {
          success: false,
          message: 'Asignación de speaker no encontrada',
          error: 'SPEAKER_ASSIGNMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos de actualización
      const updatePayload: any = {
        updatedBy
      };

      if (updateData.role !== undefined) updatePayload.role = updateData.role;
      if (updateData.participationStart !== undefined) {
        updatePayload.participationStart = updateData.participationStart ? new Date(updateData.participationStart) : null;
      }
      if (updateData.participationEnd !== undefined) {
        updatePayload.participationEnd = updateData.participationEnd ? new Date(updateData.participationEnd) : null;
      }
      if (updateData.modality !== undefined) updatePayload.modality = updateData.modality;
      if (updateData.order !== undefined) updatePayload.order = updateData.order;
      if (updateData.notes !== undefined) updatePayload.notes = updateData.notes;
      if (updateData.status !== undefined) updatePayload.status = updateData.status;

      // Guardar valores anteriores para auditoría
      const oldValues = {
        role: speakerEvent.role,
        participationStart: speakerEvent.participationStart,
        participationEnd: speakerEvent.participationEnd,
        modality: speakerEvent.modality,
        order: speakerEvent.order,
        notes: speakerEvent.notes,
        status: speakerEvent.status
      };

      // Actualizar asignación
      await speakerEvent.update(updatePayload);

      // Cargar asignación actualizada con relaciones
      const updatedSpeakerEvent = await SpeakerEvent.findByPk(speakerEvent.id, {
        include: [
          {
            model: Speaker,
            as: 'speaker',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate', 'endDate']
          }
        ]
      });

      // Registrar en auditoría
      await AuditLog.log(
        'speaker_assignment_updated',
        'speaker_event',
        {
          userId: updatedBy,
          resourceId: speakerEvent.id.toString(),
          oldValues,
          newValues: updatePayload,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del evento
      await cacheService.delete(`event:detail:${eventId}`);

      return {
        success: true,
        message: 'Asignación de speaker actualizada exitosamente',
        data: updatedSpeakerEvent,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando asignación de speaker:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Eliminar asignación de speaker de un evento
   */
  async removeSpeakerFromEvent(
    eventId: number,
    speakerId: number,
    removedBy: number,
    reason?: string
  ): Promise<ApiResponse<void>> {
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

      // Verificar permisos (solo el creador del evento puede eliminar asignaciones)
      if (event.createdBy !== removedBy) {
        return {
          success: false,
          message: 'No tiene permisos para eliminar asignaciones de speakers de este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Buscar la asignación existente
      const speakerEvent = await SpeakerEvent.findOne({
        where: {
          speakerId,
          eventId
        }
      });

      if (!speakerEvent) {
        return {
          success: false,
          message: 'Asignación de speaker no encontrada',
          error: 'SPEAKER_ASSIGNMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si la asignación puede ser eliminada (no completada)
      if (speakerEvent.status === 'completed') {
        return {
          success: false,
          message: 'No se puede eliminar una asignación completada',
          error: 'CANNOT_REMOVE_COMPLETED_ASSIGNMENT',
          timestamp: new Date().toISOString()
        };
      }

      // Guardar datos para auditoría antes de eliminar
      const assignmentData = {
        speakerId: speakerEvent.speakerId,
        eventId: speakerEvent.eventId,
        role: speakerEvent.role,
        status: speakerEvent.status
      };

      // Eliminar asignación (soft delete)
      await speakerEvent.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'speaker_removed_from_event',
        'speaker_event',
        {
          userId: removedBy,
          resourceId: speakerEvent.id.toString(),
          oldValues: assignmentData,
          newValues: { reason },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      // Invalidar caché del evento
      await cacheService.delete(`event:detail:${eventId}`);

      return {
        success: true,
        message: 'Speaker eliminado del evento exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando speaker del evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtener archivos multimedia del evento
   */
  async getEventMedia(
    eventId: number,
    userId: number,
    filters: {
      type?: string;
      category?: string;
    } = {}
  ): Promise<ApiResponse<any[]>> {
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

      // Verificar permisos (solo el creador del evento puede ver los archivos multimedia)
      if (event.createdBy !== userId) {
        return {
          success: false,
          message: 'No tiene permisos para ver los archivos multimedia de este evento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      const where: any = { eventId };

      // Aplicar filtros
      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.category) {
        where.category = filters.category;
      }

      const mediaFiles = await EventMedia.findAll({
        where,
        order: [
          ['isFeatured', 'DESC'],
          ['sortOrder', 'ASC'],
          ['uploadedAt', 'DESC']
        ]
      });

      // Formatear respuesta
      const formattedMedia = mediaFiles.map(media => ({
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        url: media.url,
        type: media.type,
        category: media.category,
        isPublic: media.isPublic,
        description: media.description,
        altText: media.altText,
        isFeatured: media.isFeatured,
        sortOrder: media.sortOrder,
        size: media.size,
        formattedSize: media.formattedSize,
        uploadedAt: media.uploadedAt,
        createdAt: media.createdAt
      }));

      return {
        success: true,
        message: 'Archivos multimedia obtenidos exitosamente',
        data: formattedMedia,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo archivos multimedia del evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene los tipos de acceso para un evento
   * TODO: Implementar EventAccessTypeConfig para configuración específica del evento
   */
  async getEventAccessTypes(eventId: number): Promise<ApiResponse<any[]>> {
    try {
      // Primero verificar si el evento existe y obtener su información
      const event = await Event.findByPk(eventId);

      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Si el evento es virtual, no tiene tipos de acceso
      if (event.isVirtual) {
        return {
          success: true,
          message: 'Los eventos virtuales no tienen tipos de acceso',
          data: [],
          timestamp: new Date().toISOString()
        };
      }

      // Solo eventos presenciales o híbridos tienen tipos de acceso
      const { accessTypeService } = require('./accessTypeService');

      // Por ahora, retornamos todos los tipos de acceso activos
      // En el futuro, esto debería filtrar por configuración específica del evento
      const accessTypesResult = await accessTypeService.getActiveAccessTypes();

      if (!accessTypesResult.success) {
        return accessTypesResult;
      }

      // Formatear los tipos de acceso para incluir información del evento
      const formattedAccessTypes = accessTypesResult.data.map((accessType: any) => ({
        id: accessType.id,
        eventId: eventId,
        name: accessType.name,
        displayName: accessType.displayName,
        description: accessType.description || '',
        price: 0, // TODO: Obtener precio desde EventAccessTypeConfig
        currency: 'GTQ',
        capacity: null, // TODO: Obtener capacidad desde EventAccessTypeConfig
        availableCapacity: null,
        benefits: [], // TODO: Obtener beneficios desde EventAccessTypeConfig
        restrictions: [], // TODO: Obtener restricciones desde EventAccessTypeConfig
        isActive: accessType.status === 'ACTIVE',
        priority: accessType.priority || 0
      }));

      return {
        success: true,
        message: 'Tipos de acceso del evento obtenidos exitosamente',
        data: formattedAccessTypes,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo tipos de acceso del evento:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene el event emitter para registro de listeners
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const eventService = new EventService();
