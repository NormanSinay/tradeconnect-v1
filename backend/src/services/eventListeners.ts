/**
 * @fileoverview Servicio de Listeners de Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Listeners para eventos del dominio de eventos
 *
 * Archivo: backend/src/services/eventListeners.ts
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { AuditLog } from '../models/AuditLog';
import { cacheService } from './cacheService';
import { emailService } from './emailService';

/**
 * Servicio que maneja los listeners para eventos del dominio de eventos
 */
export class EventListenersService {
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.registerListeners();
  }

  /**
   * Registra todos los listeners de eventos
   */
  private registerListeners(): void {
    // Listener para evento creado
    this.eventEmitter.on('EventCreated', this.handleEventCreated.bind(this));

    // Listener para evento publicado
    this.eventEmitter.on('EventPublished', this.handleEventPublished.bind(this));

    // Listener para evento actualizado
    this.eventEmitter.on('EventUpdated', this.handleEventUpdated.bind(this));

    // Listener para evento eliminado
    this.eventEmitter.on('EventDeleted', this.handleEventDeleted.bind(this));

    // Listener para evento cancelado
    this.eventEmitter.on('EventCancelled', this.handleEventCancelled.bind(this));

    logger.info('Event listeners registered successfully');
  }

  /**
   * Maneja el evento EventCreated
   */
  private async handleEventCreated(data: {
    eventId: number;
    eventData: any;
    createdBy: number;
  }): Promise<void> {
    try {
      logger.info(`Event created: ${data.eventId} by user ${data.createdBy}`);

      // Registrar en auditoría adicional (el servicio ya lo hace, pero podemos agregar más detalles)
      await AuditLog.log(
        'event_created_notification',
        'event',
        {
          userId: data.createdBy,
          resourceId: data.eventId.toString(),
          metadata: {
            eventId: data.eventId,
            eventTitle: data.eventData.title,
            eventType: data.eventData.eventType?.name
          },
          ipAddress: 'system',
          userAgent: 'event-listener'
        }
      );

      // Aquí podríamos enviar notificaciones al creador confirmando la creación
      // await this.sendEventCreationConfirmation(data.eventData, data.createdBy);

    } catch (error) {
      logger.error('Error handling EventCreated:', error);
    }
  }

  /**
   * Maneja el evento EventPublished
   */
  private async handleEventPublished(data: {
    eventId: number;
    eventData: any;
    publishedBy: number;
    notifySubscribers?: boolean;
  }): Promise<void> {
    try {
      logger.info(`Event published: ${data.eventId} by user ${data.publishedBy}`);

      // Invalidar caché de eventos públicos (ya se hace en el servicio, pero aseguramos)
      await cacheService.invalidateEventListsCache();
      await cacheService.invalidateEventCache(data.eventId);

      // Registrar en auditoría
      await AuditLog.log(
        'event_published_notification',
        'event',
        {
          userId: data.publishedBy,
          resourceId: data.eventId.toString(),
          metadata: {
            eventId: data.eventId,
            eventTitle: data.eventData.title,
            notifySubscribers: data.notifySubscribers
          },
          ipAddress: 'system',
          userAgent: 'event-listener'
        }
      );

      // Enviar notificaciones si se solicita
      if (data.notifySubscribers) {
        await this.notifyEventPublication(data.eventData);
      }

      // Aquí podríamos notificar a interesados o seguidores del evento
      // await this.notifyEventSubscribers(data.eventData);

    } catch (error) {
      logger.error('Error handling EventPublished:', error);
    }
  }

  /**
   * Maneja el evento EventUpdated
   */
  private async handleEventUpdated(data: {
    eventId: number;
    oldData: any;
    newData: any;
    updatedBy: number;
  }): Promise<void> {
    try {
      logger.info(`Event updated: ${data.eventId} by user ${data.updatedBy}`);

      // Invalidar caché
      await cacheService.invalidateEventCache(data.eventId);
      await cacheService.invalidateEventListsCache();

      // Registrar cambios significativos en auditoría
      const significantChanges = this.detectSignificantChanges(data.oldData, data.newData);
      if (significantChanges.length > 0) {
        await AuditLog.log(
          'event_significant_update',
          'event',
          {
            userId: data.updatedBy,
            resourceId: data.eventId.toString(),
            metadata: {
              eventId: data.eventId,
              changes: significantChanges,
              oldData: data.oldData,
              newData: data.newData
            },
            ipAddress: 'system',
            userAgent: 'event-listener'
          }
        );

        // Notificar cambios importantes a los registrados
        await this.notifyEventChanges(data.newData, significantChanges);
      }

    } catch (error) {
      logger.error('Error handling EventUpdated:', error);
    }
  }

  /**
   * Maneja el evento EventDeleted
   */
  private async handleEventDeleted(data: {
    eventId: number;
    eventData: any;
    deletedBy: number;
  }): Promise<void> {
    try {
      logger.info(`Event deleted: ${data.eventId} by user ${data.deletedBy}`);

      // Invalidar caché
      await cacheService.invalidateEventCache(data.eventId);
      await cacheService.invalidateEventListsCache();

      // Registrar eliminación
      await AuditLog.log(
        'event_deleted_notification',
        'event',
        {
          userId: data.deletedBy,
          resourceId: data.eventId.toString(),
          metadata: {
            eventId: data.eventId,
            eventTitle: data.eventData.title
          },
          ipAddress: 'system',
          userAgent: 'event-listener'
        }
      );

      // Notificar a los registrados sobre la cancelación
      await this.notifyEventCancellation(data.eventData);

    } catch (error) {
      logger.error('Error handling EventDeleted:', error);
    }
  }

  /**
   * Maneja el evento EventCancelled
   */
  private async handleEventCancelled(data: {
    eventId: number;
    eventData: any;
    cancelledBy: number;
    reason: string;
  }): Promise<void> {
    try {
      logger.info(`Event cancelled: ${data.eventId} by user ${data.cancelledBy}, reason: ${data.reason}`);

      // Invalidar caché
      await cacheService.invalidateEventCache(data.eventId);
      await cacheService.invalidateEventListsCache();

      // Registrar cancelación
      await AuditLog.log(
        'event_cancelled_notification',
        'event',
        {
          userId: data.cancelledBy,
          resourceId: data.eventId.toString(),
          metadata: {
            eventId: data.eventId,
            eventTitle: data.eventData.title,
            cancellationReason: data.reason
          },
          ipAddress: 'system',
          userAgent: 'event-listener'
        }
      );

      // Notificar cancelación a todos los registrados
      await this.notifyEventCancellation(data.eventData, data.reason);

    } catch (error) {
      logger.error('Error handling EventCancelled:', error);
    }
  }

  /**
   * Detecta cambios significativos en un evento
   */
  private detectSignificantChanges(oldData: any, newData: any): string[] {
    const significantFields = ['title', 'startDate', 'endDate', 'location', 'price', 'capacity'];
    const changes: string[] = [];

    for (const field of significantFields) {
      if (oldData[field] !== newData[field]) {
        changes.push(field);
      }
    }

    return changes;
  }

  /**
   * Notifica la publicación de un evento
   */
  private async notifyEventPublication(eventData: any): Promise<void> {
    try {
      // Aquí implementaríamos el envío de notificaciones por email
      // Por ahora solo loggeamos
      logger.info(`Notifying subscribers about event publication: ${eventData.title}`);

      // TODO: Implementar envío de emails a interesados
      // await emailService.sendEventPublicationNotification(eventData);

    } catch (error) {
      logger.error('Error notifying event publication:', error);
    }
  }

  /**
   * Notifica cambios importantes en un evento
   */
  private async notifyEventChanges(eventData: any, changes: string[]): Promise<void> {
    try {
      logger.info(`Notifying about event changes: ${eventData.title}, changes: ${changes.join(', ')}`);

      // TODO: Implementar notificaciones de cambios
      // await emailService.sendEventUpdateNotification(eventData, changes);

    } catch (error) {
      logger.error('Error notifying event changes:', error);
    }
  }

  /**
   * Notifica la cancelación de un evento
   */
  private async notifyEventCancellation(eventData: any, reason?: string): Promise<void> {
    try {
      logger.info(`Notifying about event cancellation: ${eventData.title}`);

      // TODO: Implementar notificaciones de cancelación
      // await emailService.sendEventCancellationNotification(eventData, reason);

    } catch (error) {
      logger.error('Error notifying event cancellation:', error);
    }
  }

  /**
   * Obtiene estadísticas de eventos procesados
   */
  public getStats(): {
    listenersRegistered: number;
    eventsProcessed: { [key: string]: number };
  } {
    // TODO: Implementar tracking de estadísticas
    return {
      listenersRegistered: 5, // Número de listeners registrados
      eventsProcessed: {
        EventCreated: 0,
        EventPublished: 0,
        EventUpdated: 0,
        EventDeleted: 0,
        EventCancelled: 0
      }
    };
  }
}

export const eventListenersService = (eventEmitter: EventEmitter) =>
  new EventListenersService(eventEmitter);