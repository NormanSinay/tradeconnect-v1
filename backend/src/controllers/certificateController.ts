/**
 * @fileoverview Controlador de Certificados para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de certificados blockchain
 *
 * Archivo: backend/src/controllers/certificateController.ts
 */

import { Request, Response } from 'express';
import { CertificateService } from '../services/certificateService';
import { successResponse, errorResponse } from '../utils/common.utils';
import { logger } from '../utils/logger';

export class CertificateController {
  // ====================================================================
  // GESTIÓN DE CERTIFICADOS
  // ====================================================================

  /**
   * Genera un certificado de asistencia para un participante
   */
  static async generateAttendanceCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, userId, registrationId } = req.params;

      const certificate = await CertificateService.generateAttendanceCertificate(
        parseInt(eventId, 10),
        parseInt(userId, 10),
        parseInt(registrationId, 10)
      );

      res.status(201).json(successResponse(certificate, 'Certificado de asistencia generado exitosamente'));
    } catch (error) {
      logger.error('Error generating attendance certificate', { error, ...req.params });

      if (error instanceof Error) {
        if (error.message.includes('no encontrada') || error.message.includes('no asistió')) {
          res.status(404).json(errorResponse(error.message));
          return;
        }
        if (error.message.includes('no ha finalizado') || error.message.includes('ya existe')) {
          res.status(400).json(errorResponse(error.message));
          return;
        }
      }

      res.status(500).json(errorResponse('Error al generar certificado de asistencia'));
    }
  }

  /**
   * Genera certificados masivos para todos los asistentes de un evento
   */
  static async generateBulkCertificates(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      const certificates = await CertificateService.generateBulkCertificates(parseInt(eventId, 10));

      res.json(successResponse({
        generated: certificates.length,
        certificates
      }, `${certificates.length} certificados generados exitosamente`));
    } catch (error) {
      logger.error('Error generating bulk certificates', { error, eventId: req.params.eventId });

      if (error instanceof Error && error.message.includes('No hay asistentes')) {
        res.status(400).json(errorResponse(error.message));
        return;
      }

      res.status(500).json(errorResponse('Error al generar certificados masivos'));
    }
  }

  // ====================================================================
  // CONSULTAS DE CERTIFICADOS
  // ====================================================================

  /**
   * Obtiene certificados de un usuario
   */
  static async getUserCertificates(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userIdNum = parseInt(userId, 10);

      if (isNaN(userIdNum)) {
        res.status(400).json(errorResponse('ID de usuario inválido'));
        return;
      }

      const certificates = await CertificateService.getUserCertificates(userIdNum);

      res.json(successResponse(certificates, 'Certificados obtenidos exitosamente'));
    } catch (error) {
      logger.error('Error getting user certificates', { error, userId: req.params.userId });
      res.status(500).json(errorResponse('Error al obtener certificados del usuario'));
    }
  }

  /**
   * Obtiene certificados de un evento
   */
  static async getEventCertificates(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const eventIdNum = parseInt(eventId, 10);

      if (isNaN(eventIdNum)) {
        res.status(400).json(errorResponse('ID de evento inválido'));
        return;
      }

      const certificates = await CertificateService.getEventCertificates(eventIdNum);

      res.json(successResponse(certificates, 'Certificados del evento obtenidos exitosamente'));
    } catch (error) {
      logger.error('Error getting event certificates', { error, eventId: req.params.eventId });
      res.status(500).json(errorResponse('Error al obtener certificados del evento'));
    }
  }

  /**
   * Obtiene un certificado por ID de registro
   */
  static async getCertificateByRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { registrationId } = req.params;
      const registrationIdNum = parseInt(registrationId, 10);

      if (isNaN(registrationIdNum)) {
        res.status(400).json(errorResponse('ID de registro inválido'));
        return;
      }

      const certificate = await CertificateService.getCertificateByRegistration(registrationIdNum);

      if (!certificate) {
        res.status(404).json(errorResponse('Certificado no encontrado'));
        return;
      }

      res.json(successResponse(certificate, 'Certificado obtenido exitosamente'));
    } catch (error) {
      logger.error('Error getting certificate by registration', { error, registrationId: req.params.registrationId });
      res.status(500).json(errorResponse('Error al obtener certificado'));
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * Obtiene estadísticas de certificados
   */
  static async getCertificateStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await CertificateService.getCertificateStats();

      res.json(successResponse(stats, 'Estadísticas de certificados obtenidas exitosamente'));
    } catch (error) {
      logger.error('Error getting certificate stats', { error });
      res.status(500).json(errorResponse('Error al obtener estadísticas de certificados'));
    }
  }

  // ====================================================================
  // VERIFICACIÓN DE CERTIFICADOS (DUPLICADO DEL PÚBLICO PARA ADMIN)
  // ====================================================================

  /**
   * Verifica un certificado por hash (endpoint administrativo)
   */
  static async verifyCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.params;

      if (!hash || hash.length !== 64) {
        res.status(400).json(errorResponse('Hash de certificado inválido'));
        return;
      }

      const verification = await CertificateService.verifyCertificate(hash);

      res.json(successResponse(verification, 'Verificación de certificado completada'));
    } catch (error) {
      logger.error('Error verifying certificate (admin)', { error, hash: req.params.hash });
      res.status(500).json(errorResponse('Error al verificar certificado'));
    }
  }
}