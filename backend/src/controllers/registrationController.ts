/**
 * @fileoverview Controlador de Inscripciones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controlador REST para gestión de inscripciones individuales
 *
 * Archivo: backend/src/controllers/registrationController.ts
 */

import { Request, Response } from 'express';
import { registrationService } from '../services/registrationService';
import {
  CreateIndividualRegistrationData,
  UpdateRegistrationData,
  RegistrationFilters,
  PaginatedResponse,
  RegistrationResponse
} from '../types/registration.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: API para gestión de inscripciones a eventos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateIndividualRegistrationRequest:
 *       type: object
 *       required:
 *         - eventId
 *         - participantType
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *           example: 1
 *         participantType:
 *           type: string
 *           enum: [individual, empresa]
 *           description: Tipo de participante
 *           example: "individual"
 *         firstName:
 *           type: string
 *           description: Nombre del participante
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           description: Apellido del participante
 *           example: "Pérez"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del participante
 *           example: "juan.perez@email.com"
 *         phone:
 *           type: string
 *           description: Teléfono del participante
 *           example: "+502 5555-1234"
 *         nit:
 *           type: string
 *           description: NIT guatemalteco
 *           example: "12345678-9"
 *         cui:
 *           type: string
 *           description: CUI guatemalteco
 *           example: "1234567890123"
 *         companyName:
 *           type: string
 *           description: Nombre de la empresa (para tipo empresa)
 *           example: "Empresa S.A."
 *         position:
 *           type: string
 *           description: Cargo del participante
 *           example: "Gerente"
 *         customFields:
 *           type: object
 *           description: Campos personalizados del evento
 *           example: {"dietary_restrictions": "vegetarian"}
 *
 *     UpdateRegistrationRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: Nombre del participante
 *         lastName:
 *           type: string
 *           description: Apellido del participante
 *         email:
 *           type: string
 *           format: email
 *           description: Email del participante
 *         phone:
 *           type: string
 *           description: Teléfono del participante
 *         nit:
 *           type: string
 *           description: NIT guatemalteco
 *         cui:
 *           type: string
 *           description: CUI guatemalteco
 *         companyName:
 *           type: string
 *           description: Nombre de la empresa
 *         position:
 *           type: string
 *           description: Cargo del participante
 *         customFields:
 *           type: object
 *           description: Campos personalizados del evento
 *
 *     RegistrationFilters:
 *       type: object
 *       properties:
 *         eventId:
 *           type: integer
 *           description: Filtrar por ID de evento
 *         status:
 *           type: array
 *           items:
 *             type: string
 *             enum: [BORRADOR, PENDIENTE_PAGO, PAGADO, CONFIRMADO, CANCELADO, EXPIRADO, REEMBOLSADO]
 *           description: Filtrar por estados
 *         userId:
 *           type: integer
 *           description: Filtrar por ID de usuario
 *         search:
 *           type: string
 *           description: Búsqueda por nombre, apellido, email o código
 *
 *     RegistrationResponse:
 *       type: object
 *       properties:
 *         registrationId:
 *           type: integer
 *           description: ID de la inscripción
 *         registrationCode:
 *           type: string
 *           description: Código único de inscripción
 *         status:
 *           type: string
 *           enum: [BORRADOR, PENDIENTE_PAGO, PAGADO, CONFIRMADO, CANCELADO, EXPIRADO, REEMBOLSADO]
 *         totalAmount:
 *           type: number
 *           description: Monto total
 *         reservationExpiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración de reserva
 *         message:
 *           type: string
 *           description: Mensaje informativo
 */

/**
 * Controlador para operaciones de inscripciones
 */
export class RegistrationController {

  /**
   * @swagger
   * /api/registrations:
   *   post:
   *     tags: [Registrations]
   *     summary: Crear inscripción individual
   *     description: Crea una nueva inscripción individual a un evento
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateIndividualRegistrationRequest'
   *     responses:
   *       201:
   *         description: Inscripción creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Inscripción individual creada exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/RegistrationResponse'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Evento no encontrado
   *       409:
   *         description: Conflicto (evento lleno, email duplicado, etc.)
   */
  async createIndividualRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHENTICATED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const registrationData: CreateIndividualRegistrationData = req.body;
      const result = await registrationService.createIndividualRegistration(registrationData, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error creando inscripción individual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/registrations:
   *   get:
   *     tags: [Registrations]
   *     summary: Listar inscripciones
   *     description: Obtiene una lista paginada de inscripciones con filtros opcionales
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Elementos por página
   *       - in: query
   *         name: eventId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de evento
   *       - in: query
   *         name: status
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [BORRADOR, PENDIENTE_PAGO, PAGADO, CONFIRMADO, CANCELADO, EXPIRADO, REEMBOLSADO]
   *         description: Filtrar por estados
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Búsqueda por nombre, apellido, email o código
   *     responses:
   *       200:
   *         description: Lista de inscripciones obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Inscripciones obtenidas exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Registration'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   *                         hasNext:
   *                           type: boolean
   *                         hasPrev:
   *                           type: boolean
   *                     meta:
   *                       type: object
   *                       properties:
   *                         filters:
   *                           $ref: '#/components/schemas/RegistrationFilters'
   */
  async getRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHENTICATED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const filters: RegistrationFilters = {
        eventId: req.query.eventId ? parseInt(req.query.eventId as string) : undefined,
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) as any : undefined,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        search: req.query.search as string
      };

      const pagination = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await registrationService.getRegistrations(filters, pagination);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error obteniendo inscripciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/registrations/{id}:
   *   get:
   *     tags: [Registrations]
   *     summary: Obtener inscripción por ID
   *     description: Obtiene los detalles de una inscripción específica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la inscripción
   *     responses:
   *       200:
   *         description: Inscripción obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Inscripción obtenida exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/Registration'
   *       401:
   *         description: No autorizado
   *       403:
   *         description: No tiene permisos para ver esta inscripción
   *       404:
   *         description: Inscripción no encontrada
   */
  async getRegistrationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHENTICATED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const registrationId = parseInt(req.params.id);
      const result = await registrationService.getRegistrationById(registrationId, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error obteniendo inscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/registrations/{id}:
   *   put:
   *     tags: [Registrations]
   *     summary: Actualizar inscripción
   *     description: Actualiza los datos de una inscripción existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la inscripción
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateRegistrationRequest'
   *     responses:
   *       200:
   *         description: Inscripción actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Inscripción actualizada exitosamente"
   *                 data:
   *                   $ref: '#/components/schemas/Registration'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: No tiene permisos para actualizar esta inscripción
   *       404:
   *         description: Inscripción no encontrada
   *       409:
   *         description: Estado no permite actualización
   */
  async updateRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHENTICATED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const registrationId = parseInt(req.params.id);
      const updateData: UpdateRegistrationData = req.body;
      const result = await registrationService.updateRegistration(registrationId, updateData, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error actualizando inscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/registrations/{id}/cancel:
   *   post:
   *     tags: [Registrations]
   *     summary: Cancelar inscripción
   *     description: Cancela una inscripción y procesa reembolso si aplica
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la inscripción
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reason
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Razón de la cancelación
   *                 example: "Cambio de planes"
   *     responses:
   *       200:
   *         description: Inscripción cancelada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Inscripción cancelada exitosamente"
   *                 data:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: No tiene permisos para cancelar esta inscripción
   *       404:
   *         description: Inscripción no encontrada
   *       409:
   *         description: Estado no permite cancelación
   */
  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHENTICATED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const registrationId = parseInt(req.params.id);
      const { reason } = req.body;

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'La razón de cancelación es requerida',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await registrationService.cancelRegistration(registrationId, reason.trim(), userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode = this.getStatusCodeFromError(result.error);
        res.status(statusCode).json(result);
      }
    } catch (error) {
      logger.error('Error cancelando inscripción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/registrations/validate-affiliation:
   *   post:
   *     tags: [Registrations]
   *     summary: Validar datos de afiliación
   *     description: Valida NIT, CUI y otros datos fiscales guatemaltecos
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nit:
   *                 type: string
   *                 description: NIT a validar
   *                 example: "12345678-9"
   *               cui:
   *                 type: string
   *                 description: CUI a validar
   *                 example: "1234567890123"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email a validar
   *                 example: "usuario@email.com"
   *               phone:
   *                 type: string
   *                 description: Teléfono a validar
   *                 example: "+502 5555-1234"
   *     responses:
   *       200:
   *         description: Validación completada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Validación completada"
   *                 data:
   *                   type: object
   *                   properties:
   *                     isValid:
   *                       type: boolean
   *                     message:
   *                       type: string
   *                     details:
   *                       type: object
   *                       properties:
   *                         nitValid:
   *                           type: boolean
   *                         cuiValid:
   *                           type: boolean
   *                         emailValid:
   *                           type: boolean
   *                         phoneValid:
   *                           type: boolean
   */
  async validateAffiliation(req: Request, res: Response): Promise<void> {
    try {
      const { nit, cui, email, phone } = req.body;

      const { affiliationValidationService } = await import('../services/affiliationValidationService');

      let validationResult: any = { isValid: true, message: 'Sin datos para validar', details: {} };

      if (nit || cui) {
        validationResult = await affiliationValidationService.validateTaxData(nit, cui);
      }

      // Validar email si se proporciona
      if (email) {
        const emailValidation = await affiliationValidationService.validateEmail(email);
        validationResult.details = {
          ...validationResult.details,
          emailValid: emailValidation.isValid
        };
        if (!emailValidation.isValid) {
          validationResult.isValid = false;
          validationResult.message += '; ' + emailValidation.message;
        }
      }

      // Validar teléfono si se proporciona
      if (phone) {
        const phoneValidation = await affiliationValidationService.validatePhone(phone);
        validationResult.details = {
          ...validationResult.details,
          phoneValid: phoneValidation.isValid
        };
        if (!phoneValidation.isValid) {
          validationResult.isValid = false;
          validationResult.message += '; ' + phoneValidation.message;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Validación completada',
        data: validationResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error validando datos de afiliación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Convierte códigos de error a códigos HTTP
   */
  private getStatusCodeFromError(error?: string): number {
    switch (error) {
      case 'UNAUTHENTICATED':
        return 401;
      case 'INSUFFICIENT_PERMISSIONS':
        return 403;
      case 'NOT_FOUND':
      case 'EVENT_NOT_FOUND':
      case 'REGISTRATION_NOT_FOUND':
        return 404;
      case 'INVALID_REQUEST':
      case 'INVALID_TAX_DATA':
        return 400;
      case 'INSUFFICIENT_AVAILABILITY':
      case 'INVALID_STATUS_FOR_UPDATE':
      case 'INVALID_STATUS_FOR_CANCELLATION':
        return 409;
      default:
        return 500;
    }
  }
}

export const registrationController = new RegistrationController();