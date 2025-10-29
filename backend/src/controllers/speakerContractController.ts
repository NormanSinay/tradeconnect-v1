/**
 * @fileoverview Controlador de Contratos de Speakers para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de contratos y pagos de speakers
 *
 * Archivo: backend/src/controllers/speakerContractController.ts
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { speakerService } from '../services/speakerService';
// TODO: Importar speakerContractService cuando se implemente
// import { speakerContractService } from '../services/speakerContractService';
import {
  CreateContractData,
  UpdateContractData,
  CreatePaymentData,
  UpdatePaymentData,
  ContractQueryParams,
  PaymentQueryParams
} from '../types/speaker-contract.types';
import { AuthenticatedRequest } from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Controlador para manejo de operaciones de contratos y pagos de speakers
 */
export class SpeakerContractController {

  /**
   * @swagger
   * /api/speaker-contracts:
   *   post:
   *     tags: [Speaker Contracts]
   *     summary: Crear un nuevo contrato
   *     description: Crea un contrato para un speaker y evento
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateContractData'
   *     responses:
   *       201:
   *         description: Contrato creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async createContract(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const contractData: CreateContractData = req.body;

      // TODO: Implementar cuando se cree speakerContractService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad en desarrollo',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error creando contrato:', error);
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
   * /api/speaker-contracts/{id}:
   *   get:
   *     tags: [Speaker Contracts]
   *     summary: Obtener contrato por ID
   *     description: Obtiene los detalles de un contrato específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Contrato obtenido exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Contrato no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getContract(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contractId = parseInt(id);

      if (isNaN(contractId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de contrato inválido',
          error: 'INVALID_CONTRACT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Implementar cuando se cree speakerContractService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad en desarrollo',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo contrato:', error);
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
   * /api/speaker-contracts/{id}:
   *   put:
   *     tags: [Speaker Contracts]
   *     summary: Actualizar contrato
   *     description: Actualiza la información de un contrato específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateContractData'
   *     responses:
   *       200:
   *         description: Contrato actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Contrato no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async updateContract(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const contractId = parseInt(id);

      if (isNaN(contractId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de contrato inválido',
          error: 'INVALID_CONTRACT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const updateData: UpdateContractData = req.body;

      // TODO: Implementar cuando se cree speakerContractService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad en desarrollo',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error actualizando contrato:', error);
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
   * /api/speaker-contracts/{id}/approve:
   *   post:
   *     tags: [Speaker Contracts]
   *     summary: Aprobar contrato
   *     description: Aprueba un contrato pendiente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Contrato aprobado exitosamente
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Contrato no encontrado
   *       409:
   *         description: Contrato no puede ser aprobado
   *       500:
   *         description: Error interno del servidor
   */
  async approveContract(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contractId = parseInt(id);

      if (isNaN(contractId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de contrato inválido',
          error: 'INVALID_CONTRACT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Implementar cuando se cree speakerContractService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad en desarrollo',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error aprobando contrato:', error);
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
   * /api/speaker-contracts/{id}/payment:
   *   post:
   *     tags: [Speaker Contracts]
   *     summary: Crear pago para contrato
   *     description: Registra un nuevo pago para un contrato específico
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePaymentData'
   *     responses:
   *       201:
   *         description: Pago creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Contrato no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async createPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const contractId = parseInt(id);

      if (isNaN(contractId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'ID de contrato inválido',
          error: 'INVALID_CONTRACT_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const paymentData: CreatePaymentData = {
        ...req.body,
        contractId
      };

      // TODO: Implementar cuando se cree speakerContractService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad en desarrollo',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error creando pago:', error);
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
   * /api/speaker-contracts:
   *   get:
   *     tags: [Speaker Contracts]
   *     summary: Listar contratos
   *     description: Obtiene una lista de contratos con filtros
   *     security:
   *       - bearerAuth: []
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
   *         name: status
   *         schema:
   *           type: string
   *           enum: [draft, sent, signed, rejected, cancelled]
   *     responses:
   *       200:
   *         description: Lista de contratos obtenida exitosamente
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async getContracts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Extraer parámetros de consulta
      const {
        page = 1,
        limit = 20,
        status,
        speakerId,
        eventId,
        search,
        sortBy,
        sortOrder
      } = req.query;

      const params: ContractQueryParams = {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC',
        filters: {}
      };

      // Aplicar filtros
      if (status) {
        params.filters!.status = [status as any];
      }
      if (speakerId) {
        params.filters!.speakerId = Number(speakerId);
      }
      if (eventId) {
        params.filters!.eventId = Number(eventId);
      }

      // TODO: Implementar cuando se cree speakerContractService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad en desarrollo',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo contratos:', error);
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
      case 'VALIDATION_ERROR':
        return HTTP_STATUS.BAD_REQUEST;
      case 'UNAUTHORIZED':
        return HTTP_STATUS.UNAUTHORIZED;
      case 'INSUFFICIENT_PERMISSIONS':
        return HTTP_STATUS.FORBIDDEN;
      case 'SPEAKER_NOT_FOUND':
      case 'EVENT_NOT_FOUND':
      case 'CONTRACT_NOT_FOUND':
        return HTTP_STATUS.NOT_FOUND;
      case 'CONTRACT_ALREADY_EXISTS':
      case 'PAYMENT_ALREADY_EXISTS':
        return HTTP_STATUS.CONFLICT;
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}

export const speakerContractController = new SpeakerContractController();
