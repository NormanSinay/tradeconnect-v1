/**
 * @fileoverview Controlador de Inscripciones a Eventos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de inscripciones a eventos
 *
 * Archivo: backend/src/controllers/eventRegistrationController.ts
 */

import { Request, Response } from 'express';
import { EventRegistrationService } from '../services/eventRegistrationService';
import { successResponse, errorResponse } from '../utils/common.utils';
import { logger } from '../utils/logger';

export class EventRegistrationController {
  // ====================================================================
  // GESTIÓN DE INSCRIPCIONES
  // ====================================================================

  /**
   * Registra a un usuario en un evento
   */
  static async registerToEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse('Usuario no autenticado'));
        return;
      }

      const { registrationData, paymentAmount } = req.body;

      const registration = await EventRegistrationService.registerToEvent({
        eventId: parseInt(eventId, 10),
        userId,
        registrationData,
        paymentAmount
      });

      res.status(201).json(successResponse(registration, 'Inscripción realizada exitosamente'));
    } catch (error) {
      logger.error('Error registering to event', { error, eventId: req.params.eventId, userId: req.user?.id });

      if (error instanceof Error) {
        if (error.message.includes('no encontrado')) {
          res.status(404).json(errorResponse(error.message));
          return;
        }
        if (error.message.includes('ya está inscrito') || error.message.includes('capacidad máxima')) {
          res.status(409).json(errorResponse(error.message));
          return;
        }
        if (error.message.includes('no está disponible') || error.message.includes('comenzado')) {
          res.status(400).json(errorResponse(error.message));
          return;
        }
      }

      res.status(500).json(errorResponse('Error al realizar la inscripción'));
    }
  }

  /**
   * Cancela una inscripción
   */
  static async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse('Usuario no autenticado'));
        return;
      }

      const { reason } = req.body;

      const registration = await EventRegistrationService.cancelRegistration(
        parseInt(id, 10),
        userId,
        reason
      );

      res.json(successResponse(registration, 'Inscripción cancelada exitosamente'));
    } catch (error) {
      logger.error('Error cancelling registration', { error, id: req.params.id, userId: req.user?.id });

      if (error instanceof Error && error.message.includes('no encontrada')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      if (error instanceof Error && error.message.includes('no se puede cancelar')) {
        res.status(400).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al cancelar la inscripción'));
    }
  }

  /**
   * Realiza check-in de un usuario
   */
  static async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse('Usuario no autenticado'));
        return;
      }

      const registration = await EventRegistrationService.checkIn({
        registrationId: parseInt(id, 10),
        userId
      });

      res.json(successResponse(registration, 'Check-in realizado exitosamente'));
    } catch (error) {
      logger.error('Error checking in', { error, id: req.params.id, userId: req.user?.id });

      if (error instanceof Error) {
        if (error.message.includes('no encontrada')) {
          res.status(404).json(errorResponse(error.message));
          return;
        }
        if (error.message.includes('debe estar confirmada') || error.message.includes('ya ha hecho') || error.message.includes('no está en curso')) {
          res.status(400).json(errorResponse(error.message));
          return;
        }
      }

      res.status(500).json(errorResponse('Error al realizar check-in'));
    }
  }

  /**
   * Realiza check-out de un usuario
   */
  static async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse('Usuario no autenticado'));
        return;
      }

      const registration = await EventRegistrationService.checkOut(
        parseInt(id, 10),
        userId
      );

      res.json(successResponse(registration, 'Check-out realizado exitosamente'));
    } catch (error) {
      logger.error('Error checking out', { error, id: req.params.id, userId: req.user?.id });

      if (error instanceof Error) {
        if (error.message.includes('no encontrada')) {
          res.status(404).json(errorResponse(error.message));
          return;
        }
        if (error.message.includes('no ha hecho check-in') || error.message.includes('ya ha hecho check-out')) {
          res.status(400).json(errorResponse(error.message));
          return;
        }
      }

      res.status(500).json(errorResponse('Error al realizar check-out'));
    }
  }

  /**
   * Actualiza una inscripción (admin/organizador)
   */
  static async updateRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, paymentStatus, paymentReference, cancellationReason } = req.body;

      const registration = await EventRegistrationService.updateRegistration(
        parseInt(id, 10),
        {
          status,
          paymentStatus,
          paymentReference,
          cancellationReason
        }
      );

      res.json(successResponse(registration, 'Inscripción actualizada exitosamente'));
    } catch (error) {
      logger.error('Error updating registration', { error, id: req.params.id, body: req.body });

      if (error instanceof Error && error.message.includes('no encontrada')) {
        res.status(404).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al actualizar la inscripción'));
    }
  }

  // ====================================================================
  // CONSULTAS DE INSCRIPCIONES
  // ====================================================================

  /**
   * Obtiene inscripciones de un evento (admin/organizador)
   */
  static async getEventRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const {
        page = '1',
        limit = '50',
        status,
        paymentStatus,
        search
      } = req.query;

      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as string,
        paymentStatus: paymentStatus as string,
        search: search as string
      };

      const result = await EventRegistrationService.getEventRegistrations(
        parseInt(eventId, 10),
        options
      );

      res.json(successResponse(result, 'Inscripciones obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting event registrations', { error, eventId: req.params.eventId, query: req.query });
      res.status(500).json(errorResponse('Error al obtener inscripciones'));
    }
  }

  /**
   * Obtiene inscripciones del usuario actual
   */
  static async getUserRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse('Usuario no autenticado'));
        return;
      }

      const {
        page = '1',
        limit = '20',
        status,
        paymentStatus
      } = req.query;

      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as string,
        paymentStatus: paymentStatus as string
      };

      const result = await EventRegistrationService.getUserRegistrations(userId, options);

      res.json(successResponse(result, 'Inscripciones obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting user registrations', { error, userId: req.user?.id, query: req.query });
      res.status(500).json(errorResponse('Error al obtener inscripciones'));
    }
  }

  /**
   * Obtiene una inscripción específica
   */
  static async getRegistrationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const registrationId = parseInt(id, 10);

      if (isNaN(registrationId)) {
        res.status(400).json(errorResponse('ID de inscripción inválido'));
        return;
      }

      const registration = await EventRegistrationService.getRegistrationById(registrationId);

      if (!registration) {
        res.status(404).json(errorResponse('Inscripción no encontrada'));
        return;
      }

      res.json(successResponse(registration, 'Inscripción obtenida exitosamente'));
    } catch (error) {
      logger.error('Error getting registration by ID', { error, id: req.params.id });
      res.status(500).json(errorResponse('Error al obtener inscripción'));
    }
  }

  /**
   * Verifica si un usuario está inscrito en un evento
   */
  static async checkUserRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(errorResponse('Usuario no autenticado'));
        return;
      }

      const isRegistered = await EventRegistrationService.isUserRegistered(
        parseInt(eventId, 10),
        userId
      );

      res.json(successResponse({ isRegistered }, 'Estado de inscripción verificado'));
    } catch (error) {
      logger.error('Error checking user registration', { error, eventId: req.params.eventId, userId: req.user?.id });
      res.status(500).json(errorResponse('Error al verificar inscripción'));
    }
  }

  /**
   * Obtiene estadísticas de un evento
   */
  static async getEventStats(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const stats = await EventRegistrationService.getEventStats(parseInt(eventId, 10));

      res.json(successResponse(stats, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting event stats', { error, eventId: req.params.eventId });
      res.status(500).json(errorResponse('Error al obtener estadísticas'));
    }
  }
}