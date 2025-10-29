/**
 * @fileoverview Controlador de Códigos QR para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para endpoints de códigos QR y control de acceso
 *
 * Archivo: backend/src/controllers/qrController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param } from 'express-validator';
import { qrService } from '../services/qrService';
import { blockchainService } from '../services/blockchainService';
import { BlockchainNetwork } from '../models/BlockchainHash';
import {
  GenerateQRRequest,
  ValidateQRRequest,
  RegenerateQRRequest,
  InvalidateQRRequest,
  AuthenticatedQRRequest
} from '../types/qr.types';
import { HTTP_STATUS, PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';

/**
 * Controlador para gestión de códigos QR
 */
export class QRController {

  /**
   * @swagger
   * /api/qr/generate/{registrationId}:
   *   post:
   *     tags: [QR Codes]
   *     summary: Generar código QR para inscripción
   *     description: Genera un código QR único para una inscripción aprobada
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: registrationId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la inscripción
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *                 description: Fecha de expiración opcional
   *               metadata:
   *                 type: object
   *                 description: Metadatos adicionales
   *     responses:
   *       201:
   *         description: QR generado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Inscripción no encontrada
   *       409:
   *         description: QR ya existe
   *       500:
   *         description: Error interno del servidor
   */
  async generateQR(req: AuthenticatedQRRequest, res: Response): Promise<void> {
    try {
      // Verificar validaciones
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

      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.CREATE_QR) ||
                           userPermissions.includes(PERMISSIONS.MANAGE_EVENTS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para generar códigos QR',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const registrationId = parseInt(req.params.registrationId);
      const requestData: GenerateQRRequest = {
        registrationId,
        ...req.body
      };

      const result = await qrService.generateQR(requestData, req.user!.id);

      const statusCode = result.success ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en generateQR controller:', error);
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
   * /api/qr/{registrationId}:
   *   get:
   *     tags: [QR Codes]
   *     summary: Obtener código QR de inscripción
   *     description: Obtiene información del código QR asociado a una inscripción
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: registrationId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la inscripción
   *     responses:
   *       200:
   *         description: QR encontrado
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: QR no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async getQR(req: AuthenticatedQRRequest, res: Response): Promise<void> {
    try {
      const registrationId = parseInt(req.params.registrationId);

      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.READ_QR) ||
                           userPermissions.includes(PERMISSIONS.MANAGE_EVENTS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para consultar códigos QR',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { QRCode } = await import('../models/QRCode');
      const qrCodes = await QRCode.findByRegistration(registrationId);

      if (qrCodes.length === 0) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'No se encontraron códigos QR para esta inscripción',
          error: 'QR_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Retornar el QR más reciente
      const latestQR = qrCodes[0];

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Código QR encontrado',
        data: latestQR.toDetailedJSON(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getQR controller:', error);
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
   * /api/qr/validate:
   *   post:
   *     tags: [QR Codes]
   *     summary: Validar código QR
   *     description: Valida un código QR escaneado y registra asistencia si es válido
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - qrHash
   *               - eventId
   *             properties:
   *               qrHash:
   *                 type: string
   *                 description: Hash del código QR
   *               eventId:
   *                 type: integer
   *                 description: ID del evento
   *               accessPoint:
   *                 type: string
   *                 description: Punto de acceso donde se escanea
   *               deviceInfo:
   *                 type: object
   *                 description: Información del dispositivo
   *               location:
   *                 type: object
   *                 description: Geolocalización
   *     responses:
   *       200:
   *         description: QR válido - asistencia registrada
   *       400:
   *         description: QR inválido o datos incorrectos
   *       500:
   *         description: Error interno del servidor
   */
  async validateQR(req: Request, res: Response): Promise<void> {
    try {
      // Verificar validaciones
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

      const requestData: ValidateQRRequest = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      // Obtener scanner ID del token si está autenticado
      const scannerId = (req as any).user?.id;

      const result = await qrService.validateQR(requestData, scannerId);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.data?.isValid === false ? HTTP_STATUS.BAD_REQUEST :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en validateQR controller:', error);
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
   * /api/qr/regenerate/{registrationId}:
   *   post:
   *     tags: [QR Codes]
   *     summary: Regenerar código QR
   *     description: Invalida el QR actual y genera uno nuevo para la inscripción
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: registrationId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la inscripción
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Razón de la regeneración
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *                 description: Nueva fecha de expiración
   *     responses:
   *       201:
   *         description: QR regenerado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: Inscripción no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  async regenerateQR(req: AuthenticatedQRRequest, res: Response): Promise<void> {
    try {
      // Verificar validaciones
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

      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.UPDATE_QR) ||
                           userPermissions.includes(PERMISSIONS.MANAGE_EVENTS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para regenerar códigos QR',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const registrationId = parseInt(req.params.registrationId);
      const requestData: RegenerateQRRequest = {
        registrationId,
        ...req.body
      };

      const result = await qrService.regenerateQR(requestData, req.user!.id);

      const statusCode = result.success ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en regenerateQR controller:', error);
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
   * /api/qr/blockchain-verify/{code}:
   *   get:
   *     tags: [QR Codes]
   *     summary: Verificar QR en blockchain
   *     description: Verifica la autenticidad de un código QR consultando blockchain
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema:
   *           type: string
   *         description: Hash del código QR
   *     responses:
   *       200:
   *         description: Verificación completada
   *       400:
   *         description: Hash inválido
   *       404:
   *         description: QR no encontrado en blockchain
   *       500:
   *         description: Error interno del servidor
   */
  async verifyQRBlockchain(req: Request, res: Response): Promise<void> {
    try {
      const qrHash = req.params.code;

      // Validar formato del hash
      if (!qrHash || !/^[a-f0-9]{64}$/i.test(qrHash)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Formato de hash inválido',
          error: 'INVALID_HASH_FORMAT',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await blockchainService.verifyHash({ hash: qrHash, network: BlockchainNetwork.SEPOLIA_TESTNET });

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'INVALID_HASH_FORMAT' ? HTTP_STATUS.BAD_REQUEST :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en verifyQRBlockchain controller:', error);
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
   * /api/qr/invalidate/{qrId}:
   *   post:
   *     tags: [QR Codes]
   *     summary: Invalidar código QR
   *     description: Invalida un código QR por razones de seguridad
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: qrId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del código QR
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
   *                 description: Razón de la invalidación
   *     responses:
   *       200:
   *         description: QR invalidado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       404:
   *         description: QR no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async invalidateQR(req: AuthenticatedQRRequest, res: Response): Promise<void> {
    try {
      // Verificar validaciones
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

      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.DELETE_QR) ||
                           userPermissions.includes(PERMISSIONS.MANAGE_EVENTS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para invalidar códigos QR',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const qrId = parseInt(req.params.qrId);
      const requestData: InvalidateQRRequest = {
        qrId,
        reason: req.body.reason,
        invalidatedBy: req.user!.id
      };

      const result = await qrService.invalidateQR(requestData);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en invalidateQR controller:', error);
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
   * /api/qr/stats/{eventId}:
   *   get:
   *     tags: [QR Codes]
   *     summary: Estadísticas de QR por evento
   *     description: Obtiene estadísticas de uso de códigos QR para un evento
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del evento
   *     responses:
   *       200:
   *         description: Estadísticas obtenidas
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Permisos insuficientes
   *       500:
   *         description: Error interno del servidor
   */
  async getQRStats(req: AuthenticatedQRRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.READ_QR) ||
                           userPermissions.includes(PERMISSIONS.MANAGE_EVENTS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes para consultar estadísticas',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const eventId = parseInt(req.params.eventId);
      const { QRCode } = await import('../models/QRCode');

      const stats = await QRCode.countByStatus(eventId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          eventId,
          ...stats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en getQRStats controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const qrController = new QRController();
