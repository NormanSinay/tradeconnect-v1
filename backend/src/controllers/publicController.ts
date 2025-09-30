/**
 * @fileoverview Controlador Público para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para endpoints públicos de eventos
 *
 * Archivo: backend/src/controllers/publicController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { eventService } from '../services/eventService';
import { CertificateService } from '../services/certificateService';
import { EventQueryParams } from '../types/event.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones públicas de eventos
 */
export class PublicController {

  /**
   * @swagger
   * /api/public/events:
   *   get:
   *     tags: [Public Events]
   *     summary: Listar eventos públicos
   *     description: Obtiene una lista de eventos publicados disponibles para el público
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: eventTypeId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: eventCategoryId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: isVirtual
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: startDateFrom
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: startDateTo
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Lista de eventos obtenida exitosamente
   *       400:
   *         description: Parámetros inválidos
   *       500:
   *         description: Error interno del servidor
   */
  async getPublicEvents(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const params: EventQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: (req.query.sortBy as any) || 'startDate',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC',
        search: req.query.search as string,
        filters: {
          eventTypeId: req.query.eventTypeId ? parseInt(req.query.eventTypeId as string) : undefined,
          eventCategoryId: req.query.eventCategoryId ? parseInt(req.query.eventCategoryId as string) : undefined,
          isVirtual: req.query.isVirtual ? req.query.isVirtual === 'true' : undefined,
          startDateFrom: req.query.startDateFrom ? new Date(req.query.startDateFrom as string) : undefined,
          startDateTo: req.query.startDateTo ? new Date(req.query.startDateTo as string) : undefined,
          publishedOnly: true
        }
      };

      const result = await eventService.getPublishedEvents(params);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo eventos públicos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/public/events/{id}:
   *   get:
   *     tags: [Public Events]
   *     summary: Obtener evento público por ID
   *     description: Obtiene los detalles públicos de un evento específico
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Evento obtenido exitosamente
   *       404:
   *         description: Evento no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getPublicEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);

      if (isNaN(eventId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de evento inválido',
          error: 'INVALID_EVENT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await eventService.getEventById(eventId, false);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(this.getStatusCodeFromError(result.error)).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo evento público:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/public/events/search:
   *   get:
   *     tags: [Public Events]
   *     summary: Buscar eventos públicos
   *     description: Realiza una búsqueda avanzada de eventos publicados
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *           description: Término de búsqueda
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *           description: Ubicación del evento
   *       - in: query
   *         name: dateFrom
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: dateTo
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: priceMin
   *         schema:
   *           type: number
   *       - in: query
   *         name: priceMax
   *         schema:
   *           type: number
   *       - in: query
   *         name: isVirtual
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *     responses:
   *       200:
   *         description: Resultados de búsqueda obtenidos exitosamente
   *       400:
   *         description: Parámetros de búsqueda inválidos
   *       500:
   *         description: Error interno del servidor
   */
  async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const {
        q: search,
        location,
        dateFrom,
        dateTo,
        priceMin,
        priceMax,
        isVirtual,
        page = 1,
        limit = 20
      } = req.query;

      const params: EventQueryParams = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        filters: {
          startDateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          startDateTo: dateTo ? new Date(dateTo as string) : undefined,
          priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
          priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
          isVirtual: isVirtual ? isVirtual === 'true' : undefined,
          publishedOnly: true
        }
      };

      // Agregar filtro de ubicación si se proporciona
      if (location) {
        params.filters!.location = location as string;
      }

      const result = await eventService.getPublishedEvents(params);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json(result);
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);
      }

    } catch (error) {
      logger.error('Error buscando eventos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/public/events/calendar:
   *   get:
   *     tags: [Public Events]
   *     summary: Obtener eventos para calendario
   *     description: Obtiene eventos en formato optimizado para calendarios
   *     parameters:
   *       - in: query
   *         name: month
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 12
   *       - in: query
   *         name: year
   *         schema:
   *           type: integer
   *           minimum: 2020
   *           maximum: 2030
   *     responses:
   *       200:
   *         description: Eventos de calendario obtenidos exitosamente
   *       400:
   *         description: Parámetros inválidos
   *       500:
   *         description: Error interno del servidor
   */
  async getCalendarEvents(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Se requieren los parámetros month y year',
          error: 'MISSING_PARAMETERS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);

      if (monthNum < 1 || monthNum > 12 || yearNum < 2020 || yearNum > 2030) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Parámetros de fecha inválidos',
          error: 'INVALID_DATE_PARAMETERS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Calcular fechas del mes
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

      const params: EventQueryParams = {
        page: 1,
        limit: 1000, // Obtener todos los eventos del mes
        filters: {
          startDateFrom: startDate,
          startDateTo: endDate,
          publishedOnly: true
        }
      };

      const result = await eventService.getPublishedEvents(params);

      if (result.success && result.data) {
        // Formatear respuesta para calendario
        const calendarEvents = result.data.events.map(event => ({
          id: event.id,
          title: event.title,
          start: event.startDate,
          end: event.endDate,
          location: event.location,
          isVirtual: event.isVirtual,
          price: event.price,
          eventType: event.eventType.displayName,
          eventCategory: event.eventCategory.displayName
        }));

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Eventos de calendario obtenidos exitosamente',
          data: {
            events: calendarEvents,
            month: monthNum,
            year: yearNum
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);
      }

    } catch (error) {
      logger.error('Error obteniendo eventos de calendario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/public/events/categories:
   *   get:
   *     tags: [Public Events]
   *     summary: Obtener categorías de eventos
   *     description: Obtiene la lista de categorías de eventos disponibles
   *     responses:
   *       200:
   *         description: Categorías obtenidas exitosamente
   *       500:
   *         description: Error interno del servidor
   */
  async getEventCategories(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implementar servicio para obtener categorías activas
      // Por ahora retornamos una respuesta básica
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: [],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo categorías de eventos:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/public/certificates/verify/{hash}:
   *   get:
   *     tags: [Public Certificates]
   *     summary: Verificar certificado
   *     description: Verifica la validez de un certificado por su hash
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Certificado válido
   *       404:
   *         description: Certificado no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async verifyCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.params;

      if (!hash || hash.length !== 64) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Hash de certificado inválido',
          error: 'INVALID_CERTIFICATE_HASH',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const verification = await CertificateService.verifyCertificate(hash);

      if (verification.isValid) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Certificado válido',
          data: {
            isValid: verification.isValid,
            certificate: verification.certificate,
            event: verification.event,
            participant: verification.participant,
            verificationDetails: verification.verificationDetails
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Certificado no encontrado o inválido',
          data: {
            isValid: verification.isValid,
            verificationDetails: verification.verificationDetails
          },
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      logger.error('Error verificando certificado:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Método auxiliar para obtener código de estado HTTP desde el tipo de error
   */
  private getStatusCodeFromError(errorType?: string): number {
    switch (errorType) {
      case 'EVENT_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const publicController = new PublicController();