/**
 * @fileoverview Controlador de Validación Pública de Certificados para TradeConnect
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para verificación pública de certificados (sin autenticación)
 *
 * Archivo: backend/src/controllers/certificateValidationController.ts
 */

import { Request, Response } from 'express';
import { certificateService } from '../services/certificateService';
import { successResponse, errorResponse } from '../utils/common.utils';
import { logger } from '../utils/logger';
import {
  VerifyCertificateRequest,
  CertificateValidationMethod
} from '../types/certificate.types';

export class CertificateValidationController {
  // ====================================================================
  // VERIFICACIÓN PÚBLICA DE CERTIFICADOS
  // ====================================================================

  /**
   * Verifica un certificado por número (público)
   */
  static async verifyByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { certificateNumber } = req.params;
      const { captchaToken } = req.body;

      const request: VerifyCertificateRequest = {
        method: CertificateValidationMethod.NUMBER_LOOKUP,
        certificateNumber,
        captchaToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        location: req.body.location,
        deviceInfo: req.body.deviceInfo
      };

      const result = await certificateService.verifyCertificate(request);

      if (result.success) {
        res.json(successResponse(result, 'Verificación completada'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error en verificación'));
      }
    } catch (error) {
      logger.error('Error verifying certificate by number', { error, certificateNumber: req.params.certificateNumber });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Verifica un certificado por hash (público)
   */
  static async verifyByHash(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.params;
      const { captchaToken } = req.body;

      if (!hash || hash.length !== 64) {
        res.status(400).json(errorResponse('Hash de certificado inválido'));
        return;
      }

      const request: VerifyCertificateRequest = {
        method: CertificateValidationMethod.HASH_LOOKUP,
        hash,
        captchaToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        location: req.body.location,
        deviceInfo: req.body.deviceInfo
      };

      const result = await certificateService.verifyCertificate(request);

      if (result.success) {
        res.json(successResponse(result, 'Verificación completada'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error en verificación'));
      }
    } catch (error) {
      logger.error('Error verifying certificate by hash', { error, hash: req.params.hash });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Verifica un certificado por QR (público)
   */
  static async verifyByQR(req: Request, res: Response): Promise<void> {
    try {
      const { qrData } = req.body;
      const { captchaToken } = req.body;

      if (!qrData) {
        res.status(400).json(errorResponse('Datos QR requeridos'));
        return;
      }

      const request: VerifyCertificateRequest = {
        method: CertificateValidationMethod.QR_SCAN,
        qrData,
        captchaToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        location: req.body.location,
        deviceInfo: req.body.deviceInfo
      };

      const result = await certificateService.verifyCertificate(request);

      if (result.success) {
        res.json(successResponse(result, 'Verificación completada'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error en verificación'));
      }
    } catch (error) {
      logger.error('Error verifying certificate by QR', { error });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Verifica un certificado por múltiples métodos (público)
   */
  static async verifyCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { certificateNumber, hash, qrData, method, captchaToken } = req.body;

      let validationMethod: CertificateValidationMethod;
      let requestData: Partial<VerifyCertificateRequest> = {
        captchaToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        location: req.body.location,
        deviceInfo: req.body.deviceInfo
      };

      // Determinar método de validación
      if (method) {
        validationMethod = method;
        if (method === CertificateValidationMethod.NUMBER_LOOKUP && certificateNumber) {
          requestData.certificateNumber = certificateNumber;
        } else if (method === CertificateValidationMethod.HASH_LOOKUP && hash) {
          requestData.hash = hash;
        } else if (method === CertificateValidationMethod.QR_SCAN && qrData) {
          requestData.qrData = qrData;
        } else {
          res.status(400).json(errorResponse('Datos de verificación incompletos'));
          return;
        }
      } else {
        // Intentar determinar automáticamente
        if (certificateNumber) {
          validationMethod = CertificateValidationMethod.NUMBER_LOOKUP;
          requestData.certificateNumber = certificateNumber;
        } else if (hash) {
          validationMethod = CertificateValidationMethod.HASH_LOOKUP;
          requestData.hash = hash;
        } else if (qrData) {
          validationMethod = CertificateValidationMethod.QR_SCAN;
          requestData.qrData = qrData;
        } else {
          res.status(400).json(errorResponse('Debe proporcionar número de certificado, hash o datos QR'));
          return;
        }
      }

      const request: VerifyCertificateRequest = {
        method: validationMethod,
        ...requestData
      } as VerifyCertificateRequest;

      const result = await certificateService.verifyCertificate(request);

      if (result.success) {
        res.json(successResponse(result, 'Verificación completada'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error en verificación'));
      }
    } catch (error) {
      logger.error('Error verifying certificate', { error });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  // ====================================================================
  // DESCARGA PÚBLICA DE CERTIFICADOS
  // ====================================================================

  /**
   * Descarga PDF de certificado (público)
   */
  static async downloadCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { certificateNumber } = req.params;

      // TODO: Implementar descarga pública con validación
      res.status(404).json(errorResponse('Certificado no encontrado o no disponible para descarga pública'));
    } catch (error) {
      logger.error('Error downloading certificate publicly', { error, certificateNumber: req.params.certificateNumber });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  // ====================================================================
  // INFORMACIÓN PÚBLICA
  // ====================================================================

  /**
   * Obtiene información pública del sistema de certificados
   */
  static async getPublicInfo(req: Request, res: Response): Promise<void> {
    try {
      // Información básica del sistema (sin datos sensibles)
      const info = {
        systemName: 'TradeConnect Certificate System',
        version: '2.0.0',
        blockchainNetwork: 'Ethereum Sepolia Testnet',
        supportedVerificationMethods: [
          'certificate_number',
          'hash_lookup',
          'qr_scan'
        ],
        features: [
          'Blockchain verification',
          'PDF certificates',
          'QR code validation',
          'Digital signatures'
        ],
        lastUpdated: new Date().toISOString()
      };

      res.json(successResponse(info, 'Información del sistema obtenida'));
    } catch (error) {
      logger.error('Error getting public info', { error });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Health check del sistema de certificados
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implementar verificación real de salud
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok',
          redis: 'ok',
          blockchain: 'ok',
          pdf_generation: 'ok'
        }
      };

      res.json(successResponse(health, 'Sistema funcionando correctamente'));
    } catch (error) {
      logger.error('Health check failed', { error });
      res.status(500).json(errorResponse('Error en verificación de salud'));
    }
  }
}

export const certificateValidationController = CertificateValidationController;