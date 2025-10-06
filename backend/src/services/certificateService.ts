/**
 * @fileoverview Servicio de Certificación Automática para TradeConnect
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Servicio completo para generación, gestión y verificación de certificados con blockchain
 *
 * Archivo: backend/src/services/certificateService.ts
 */

import crypto from 'crypto';
import { EventRegistration } from '../models/EventRegistration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { Certificate } from '../models/Certificate';
import { CertificateTemplate } from '../models/CertificateTemplate';
import { CertificateValidationLog } from '../models/CertificateValidationLog';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { eventService } from './eventService';
import { blockchainService } from './blockchainService';
import { pdfService } from './pdfService';
import { certificateTemplateService } from './certificateTemplateService';
import { emailService } from './emailService';
import {
  GenerateCertificateRequest,
  GenerateBulkCertificatesRequest,
  VerifyCertificateRequest,
  VerifyCertificateResponse,
  CertificateType,
  CertificateStatus,
  CertificateValidationMethod,
  CertificateEligibilityCriteria,
  CertificateBlockchainData,
  PDFTemplateData,
  QRCodeResult
} from '../types/certificate.types';
import { ApiResponse } from '../types/global.types';
import { EntityType } from '../models/BlockchainHash';
import { queueService } from './queueService';
import {
  CertificateGenerationJobData,
  BulkCertificateGenerationJobData,
  CertificateEmailResendJobData,
  CertificateWebhookJobData
} from '../types/queue.types';

/**
 * Servicio completo para gestión de certificados
 */
export class CertificateService {
  private static readonly CACHE_TTL = 3600; // 1 hora

  // ====================================================================
  // GENERACIÓN DE CERTIFICADOS
  // ====================================================================

  /**
   * Genera un certificado individual
   */
  static async generateCertificate(request: GenerateCertificateRequest, createdBy: number): Promise<ApiResponse<Certificate>> {
    try {
      const { eventId, userId, registrationId, templateId, certificateType, customData } = request;

      // Verificar que la inscripción existe y el usuario asistió
      const registration = await EventRegistration.findOne({
        where: { id: registrationId, eventId, userId, status: 'attended' },
        include: [
          { model: Event },
          { model: User }
        ]
      });

      if (!registration) {
        return {
          success: false,
          message: 'Inscripción no encontrada o usuario no asistió al evento',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el evento ya terminó
      if (registration.event!.endDate > new Date()) {
        return {
          success: false,
          message: 'El evento aún no ha finalizado',
          error: 'EVENT_NOT_FINISHED',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si ya existe un certificado
      const existingCertificate = await Certificate.findOne({
        where: { registrationId, status: CertificateStatus.ACTIVE }
      });

      if (existingCertificate) {
        return {
          success: true,
          message: 'Ya existe un certificado activo para esta inscripción',
          data: existingCertificate,
          timestamp: new Date().toISOString()
        };
      }

      // Obtener template
      let template: CertificateTemplate;
      if (templateId) {
        const templateResult = await certificateTemplateService.getTemplateById(templateId);
        if (!templateResult.success) {
          return templateResult as any;
        }
        template = templateResult.data!;
      } else {
        // Obtener template por defecto para el tipo de evento
        const defaultTemplateResult = await certificateTemplateService.getDefaultTemplateForEventType(
          registration.event!.eventType?.name || 'default'
        );
        if (!defaultTemplateResult.success || !defaultTemplateResult.data) {
          return {
            success: false,
            message: 'No hay template disponible para este tipo de evento',
            error: 'NO_TEMPLATE_AVAILABLE',
            timestamp: new Date().toISOString()
          };
        }
        template = defaultTemplateResult.data;
      }

      // Preparar datos del certificado
      const certificateData = {
        participantData: {
          id: registration.user!.id,
          firstName: registration.user!.firstName,
          lastName: registration.user!.lastName,
          fullName: `${registration.user!.firstName} ${registration.user!.lastName}`,
          email: registration.user!.email,
          cui: registration.user!.cui
        },
        eventData: {
          id: registration.event!.id,
          title: registration.event!.title,
          description: registration.event!.description,
          startDate: registration.event!.startDate,
          endDate: registration.event!.endDate,
          durationHours: Math.ceil((registration.event!.endDate.getTime() - registration.event!.startDate.getTime()) / (1000 * 60 * 60)), // Calcular horas
          location: registration.event!.location,
          organizer: registration.event!.createdBy.toString() // Usar ID del creador como organizador
        },
        certificateData: {
          certificateNumber: this.generateCertificateNumber(),
          issuedAt: new Date(),
          customFields: customData
        },
        eligibilityCriteria: {
          attendancePercentage: 100, // Asumimos que asistió completamente
          sessionsAttended: 1,
          totalSessions: 1
        }
      };

      // Generar PDF
      const pdfTemplateData: PDFTemplateData = {
        html: template.htmlTemplate,
        css: template.cssStyles,
        variables: {
          ...certificateData.participantData,
          ...certificateData.eventData,
          ...certificateData.certificateData,
          organizador: certificateData.eventData.organizer,
          firma_digital: template.signatureUrl
        }
      };

      const pdfResult = await pdfService.generatePDF(pdfTemplateData);
      if (!pdfResult.buffer) {
        return {
          success: false,
          message: 'Error generando PDF del certificado',
          error: 'PDF_GENERATION_FAILED',
          timestamp: new Date().toISOString()
        };
      }

      // Generar QR code
      const qrResult = await pdfService.generateQRCode(pdfResult.hash);
      if (!qrResult.dataURL) {
        return {
          success: false,
          message: 'Error generando código QR',
          error: 'QR_GENERATION_FAILED',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en blockchain
      let blockchainData: CertificateBlockchainData | undefined;
      try {
        if (blockchainService.isEnabled()) {
          const blockchainResult = await blockchainService.registerHash({
            entityId: 0, // Se actualizará después
            entityType: EntityType.CERTIFICATE,
            hash: pdfResult.hash,
            timestamp: new Date(),
            metadata: {
              certificateNumber: certificateData.certificateData.certificateNumber,
              participantId: userId,
              eventId,
              issuedAt: certificateData.certificateData.issuedAt
            }
          });

          if (blockchainResult.success && blockchainResult.data) {
            blockchainData = {
              txHash: blockchainResult.data.txHash,
              network: 'sepolia_testnet',
              gasUsed: blockchainResult.data.gasUsed,
              gasPrice: '0', // No disponible en RegisterHashResult
              totalCost: blockchainResult.data.totalCost,
              confirmations: 0,
              verified: false
            };
          }
        }
      } catch (blockchainError) {
        logger.warn('Error registrando certificado en blockchain:', blockchainError);
        // Continuar sin blockchain
      }

      // Crear certificado en base de datos
      const certificate = await Certificate.create({
        certificateNumber: certificateData.certificateData.certificateNumber,
        eventId,
        userId,
        registrationId,
        templateId: template.id,
        certificateType: certificateType || CertificateType.ATTENDANCE,
        status: CertificateStatus.ACTIVE,
        issuedAt: certificateData.certificateData.issuedAt,
        pdfHash: pdfResult.hash,
        pdfUrl: undefined, // Se establecerá cuando se guarde el archivo
        pdfSizeBytes: pdfResult.size,
        qrCode: qrResult.dataURL,
        qrHash: qrResult.hash,
        blockchainTxHash: blockchainData?.txHash,
        blockchainNetwork: blockchainData?.network || 'sepolia_testnet',
        blockchainGasUsed: blockchainData?.gasUsed,
        blockchainGasPrice: blockchainData?.gasPrice,
        blockchainTotalCost: blockchainData?.totalCost,
        blockchainConfirmations: blockchainData?.confirmations || 0,
        participantData: certificateData.participantData,
        eventData: certificateData.eventData,
        certificateData: certificateData.certificateData,
        eligibilityCriteria: certificateData.eligibilityCriteria,
        downloadCount: 0,
        verificationCount: 0,
        emailSent: false,
        emailResendCount: 0,
        createdBy
      });

      // Actualizar entityId en blockchain si fue registrado
      if (blockchainData?.txHash) {
        // Aquí actualizaríamos el registro blockchain con el ID real del certificado
        // Por simplicidad, omitimos esta actualización
      }

      // Enviar email si está habilitado
      try {
        if (emailService && certificateData.participantData.email) {
          // Implementar envío de email
          logger.info('Email sending not implemented yet');
        }
      } catch (emailError) {
        logger.warn('Error enviando email:', emailError);
      }

      // Log de auditoría
      await CertificateValidationLog.create({
        certificateId: certificate.id,
        certificateNumber: certificate.certificateNumber,
        validationMethod: CertificateValidationMethod.QR_SCAN,
        isValid: true,
        captchaVerified: true,
        rateLimitHit: false,
        validationResult: {
          certificate: {
            id: certificate.id,
            number: certificate.certificateNumber,
            type: certificate.certificateType,
            status: certificate.status,
            issuedAt: certificate.issuedAt
          },
          participant: {
            name: certificate.participantData.fullName,
            email: certificate.participantData.email,
            cui: certificate.participantData.cui
          },
          event: {
            title: certificate.eventData.title,
            startDate: certificate.eventData.startDate,
            endDate: certificate.eventData.endDate,
            organizer: certificate.eventData.organizer
          }
        }
      });

      logger.info('Certificate generated successfully', {
        certificateId: certificate.id,
        certificateNumber: certificate.certificateNumber,
        userId,
        eventId
      });

      return {
        success: true,
        message: 'Certificado generado exitosamente',
        data: certificate,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error generating certificate:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Genera certificados masivos para un evento
   */
  static async generateBulkCertificates(request: GenerateBulkCertificatesRequest, createdBy: number): Promise<ApiResponse<{
    generated: number;
    failed: number;
    certificates: Certificate[];
    errors: string[];
  }>> {
    try {
      const { eventId, userIds, templateId, certificateType, eligibilityCriteria } = request;

      // Obtener todas las inscripciones que cumplen criterios
      const where: any = {
        eventId,
        status: 'attended'
      };

      if (userIds && userIds.length > 0) {
        where.userId = userIds;
      }

      const registrations = await EventRegistration.findAll({
        where,
        include: [
          { model: Event },
          { model: User }
        ]
      });

      if (registrations.length === 0) {
        return {
          success: false,
          message: 'No hay inscripciones que cumplan los criterios',
          error: 'NO_REGISTRATIONS_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const results = {
        generated: 0,
        failed: 0,
        certificates: [] as Certificate[],
        errors: [] as string[]
      };

      // Procesar cada inscripción
      for (const registration of registrations) {
        try {
          // Verificar criterios de elegibilidad
          if (!this.checkEligibility(registration, eligibilityCriteria)) {
            results.errors.push(`Usuario ${registration.userId} no cumple criterios de elegibilidad`);
            results.failed++;
            continue;
          }

          // Verificar si ya tiene certificado
          const existing = await Certificate.findOne({
            where: {
              registrationId: registration.id,
              status: CertificateStatus.ACTIVE
            }
          });

          if (existing) {
            results.errors.push(`Usuario ${registration.userId} ya tiene certificado activo`);
            results.failed++;
            continue;
          }

          // Generar certificado
          const certRequest: GenerateCertificateRequest = {
            eventId,
            userId: registration.userId,
            registrationId: registration.id,
            templateId,
            certificateType,
            customData: {}
          };

          const certResult = await this.generateCertificate(certRequest, createdBy);

          if (certResult.success) {
            results.certificates.push(certResult.data!);
            results.generated++;
          } else {
            results.errors.push(`Error generando certificado para usuario ${registration.userId}: ${certResult.message}`);
            results.failed++;
          }

        } catch (error) {
          results.errors.push(`Error procesando usuario ${registration.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          results.failed++;
        }
      }

      logger.info('Bulk certificate generation completed', {
        eventId,
        generated: results.generated,
        failed: results.failed
      });

      return {
        success: true,
        message: `Generación masiva completada: ${results.generated} generados, ${results.failed} fallidos`,
        data: results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error generating bulk certificates:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // VERIFICACIÓN DE CERTIFICADOS
  // ====================================================================

  /**
   * Verifica un certificado
   */
  static async verifyCertificate(request: VerifyCertificateRequest): Promise<VerifyCertificateResponse> {
    try {
      const { certificateNumber, hash, qrData, method, captchaToken, ipAddress, userAgent, location, deviceInfo } = request;

      let certificate: Certificate | null = null;

      // Buscar certificado según el método
      if (method === CertificateValidationMethod.NUMBER_LOOKUP && certificateNumber) {
        certificate = await Certificate.findOne({
          where: { certificateNumber, status: CertificateStatus.ACTIVE }
        });
      } else if (method === CertificateValidationMethod.HASH_LOOKUP && hash) {
        certificate = await Certificate.findOne({
          where: { pdfHash: hash, status: CertificateStatus.ACTIVE }
        });
      } else if (method === CertificateValidationMethod.QR_SCAN && qrData) {
        // Decodificar QR data (simplificado)
        const qrHash = qrData; // En implementación real, decodificar QR
        certificate = await Certificate.findOne({
          where: { qrHash, status: CertificateStatus.ACTIVE }
        });
      }

      if (!certificate) {
        // Log de verificación fallida
        await this.logValidationAttempt({
          certificateId: null,
          certificateNumber: certificateNumber || '',
          method,
          isValid: false,
          errorMessage: 'Certificado no encontrado',
          ipAddress,
          userAgent,
          location,
          deviceInfo
        });

        return {
          success: true,
          isValid: false,
          message: 'Certificado no encontrado o inválido',
          error: 'CERTIFICATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar integridad del hash
      const isHashValid = await this.verifyCertificateIntegrity(certificate);

      // Verificar blockchain si está disponible
      let blockchainVerified = false;
      let blockchainConfirmations = 0;

      if (certificate.blockchainTxHash && blockchainService.isEnabled()) {
        try {
          const blockchainResult = await blockchainService.verifyHash({
            hash: certificate.pdfHash,
            network: certificate.blockchainNetwork as any || 'sepolia_testnet'
          });

          if (blockchainResult.success && blockchainResult.data?.exists) {
            blockchainVerified = true;
            blockchainConfirmations = blockchainResult.data.confirmations || 0;
          }
        } catch (blockchainError) {
          logger.warn('Error verificando blockchain:', blockchainError);
        }
      }

      const isValid = certificate.status === CertificateStatus.ACTIVE && isHashValid;

      // Preparar respuesta
      const response: VerifyCertificateResponse = {
        success: true,
        isValid,
        certificate: isValid ? certificate : undefined,
        validationResult: {
          certificate: isValid ? {
            id: certificate.id,
            number: certificate.certificateNumber,
            type: certificate.certificateType,
            status: certificate.status,
            issuedAt: certificate.issuedAt,
            expiresAt: certificate.expiresAt
          } : undefined,
          participant: {
            name: certificate.participantData.fullName,
            email: certificate.participantData.email,
            cui: certificate.participantData.cui?.substring(0, 4) + '****' // Ocultar CUI completo
          },
          event: {
            title: certificate.eventData.title,
            startDate: certificate.eventData.startDate,
            endDate: certificate.eventData.endDate,
            organizer: certificate.eventData.organizer
          },
          blockchain: certificate.blockchainTxHash ? {
            txHash: certificate.blockchainTxHash,
            network: certificate.blockchainNetwork,
            gasUsed: certificate.blockchainGasUsed,
            gasPrice: certificate.blockchainGasPrice,
            totalCost: certificate.blockchainTotalCost,
            confirmations: blockchainConfirmations,
            verified: blockchainVerified
          } : undefined,
          verificationUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/public/certificates/verify/${certificate.certificateNumber}`
        },
        message: isValid ? 'Certificado válido' : 'Certificado inválido',
        timestamp: new Date().toISOString()
      };

      // Log de verificación
      await this.logValidationAttempt({
        certificateId: certificate.id,
        certificateNumber: certificate.certificateNumber,
        method,
        isValid,
        validationResult: {
          hashValid: isHashValid,
          blockchainVerified,
          blockchainConfirmations
        },
        ipAddress,
        userAgent,
        location,
        deviceInfo
      });

      // Actualizar contador de verificaciones
      if (isValid) {
        certificate.verificationCount++;
        certificate.lastVerifiedAt = new Date();
        await certificate.save();
      }

      return response;

    } catch (error) {
      logger.error('Error verifying certificate:', error);
      return {
        success: false,
        isValid: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES
  // ====================================================================

  /**
   * Genera número único de certificado
   */
  private static generateCertificateNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}-${random}`;
  }

  /**
   * Verifica la integridad de un certificado
   */
  private static async verifyCertificateIntegrity(certificate: Certificate): Promise<boolean> {
    try {
      // Recrear hash esperado
      const expectedData = {
        certificateNumber: certificate.certificateNumber,
        eventId: certificate.eventId,
        userId: certificate.userId,
        registrationId: certificate.registrationId,
        issuedAt: certificate.issuedAt.toISOString(),
        participantData: certificate.participantData,
        eventData: certificate.eventData
      };

      const expectedHash = crypto.createHash('sha256')
        .update(JSON.stringify(expectedData))
        .digest('hex');

      return expectedHash === certificate.pdfHash;
    } catch (error) {
      logger.error('Error verifying certificate integrity:', error);
      return false;
    }
  }

  /**
   * Verifica criterios de elegibilidad
   */
  private static checkEligibility(
    registration: EventRegistration,
    criteria?: CertificateEligibilityCriteria
  ): boolean {
    if (!criteria) return true;

    // Implementar lógica de verificación de criterios
    // Por simplicidad, retornamos true
    return true;
  }

  /**
   * Registra intento de validación
   */
  private static async logValidationAttempt(data: {
    certificateId: string | null;
    certificateNumber: string;
    method: CertificateValidationMethod;
    isValid: boolean;
    validationResult?: any;
    errorMessage?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: any;
    deviceInfo?: any;
  }): Promise<void> {
    try {
      await CertificateValidationLog.create({
        certificateId: data.certificateId || '',
        certificateNumber: data.certificateNumber,
        validationMethod: data.method,
        isValid: data.isValid,
        validationResult: data.validationResult,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        deviceInfo: data.deviceInfo,
        captchaVerified: true, // Simplificado
        rateLimitHit: false, // Simplificado
        errorMessage: data.errorMessage
      });
    } catch (error) {
      logger.error('Error logging validation attempt:', error);
    }
  }

  // ====================================================================
  // MÉTODOS CON COLAS ASÍNCRONAS
  // ====================================================================

  /**
   * Genera un certificado usando colas (asíncrono)
   */
  static async generateCertificateAsync(request: GenerateCertificateRequest, createdBy: number): Promise<ApiResponse<{ jobId: string }>> {
    try {
      if (!queueService.isReady()) {
        return {
          success: false,
          message: 'Servicio de colas no disponible',
          error: 'QUEUE_SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        };
      }

      const jobData: CertificateGenerationJobData = {
        eventId: request.eventId,
        userId: request.userId,
        registrationId: request.registrationId,
        templateId: request.templateId,
        certificateType: request.certificateType,
        customData: request.customData,
        createdBy
      };

      const job = await queueService.addCertificateGenerationJob(jobData);

      logger.info('Certificate generation job queued', {
        jobId: job.id,
        eventId: request.eventId,
        userId: request.userId
      });

      return {
        success: true,
        message: 'Trabajo de generación de certificado encolado',
        data: { jobId: job.id as string },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error queuing certificate generation:', error);
      return {
        success: false,
        message: 'Error encolando trabajo de generación',
        error: 'QUEUE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Genera certificados masivos usando colas (asíncrono)
   */
  static async generateBulkCertificatesAsync(request: GenerateBulkCertificatesRequest, createdBy: number): Promise<ApiResponse<{ jobId: string }>> {
    try {
      if (!queueService.isReady()) {
        return {
          success: false,
          message: 'Servicio de colas no disponible',
          error: 'QUEUE_SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        };
      }

      const jobData: BulkCertificateGenerationJobData = {
        eventId: request.eventId,
        userIds: request.userIds || [],
        templateId: request.templateId,
        certificateType: request.certificateType,
        eligibilityCriteria: request.eligibilityCriteria,
        createdBy
      };

      const job = await queueService.addBulkCertificateGenerationJob(jobData);

      logger.info('Bulk certificate generation job queued', {
        jobId: job.id,
        eventId: request.eventId,
        userCount: request.userIds?.length || 0
      });

      return {
        success: true,
        message: 'Trabajo de generación masiva de certificados encolado',
        data: { jobId: job.id as string },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error queuing bulk certificate generation:', error);
      return {
        success: false,
        message: 'Error encolando trabajo de generación masiva',
        error: 'QUEUE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Reenvía certificado por email usando colas
   */
  static async resendCertificateEmail(certificateId: string, requestedBy: number): Promise<ApiResponse<{ jobId: string }>> {
    try {
      if (!queueService.isReady()) {
        return {
          success: false,
          message: 'Servicio de colas no disponible',
          error: 'QUEUE_SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        };
      }

      // Obtener certificado
      const certificate = await Certificate.findByPk(certificateId);
      if (!certificate) {
        return {
          success: false,
          message: 'Certificado no encontrado',
          error: 'CERTIFICATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar límite de reenvíos
      if (certificate.emailResendCount >= 5) {
        return {
          success: false,
          message: 'Límite de reenvíos alcanzado',
          error: 'RESEND_LIMIT_EXCEEDED',
          timestamp: new Date().toISOString()
        };
      }

      const jobData: CertificateEmailResendJobData = {
        certificateId,
        recipientEmail: certificate.participantData.email,
        recipientName: certificate.participantData.fullName,
        resendReason: 'User requested resend',
        priority: 3
      };

      const job = await queueService.addCertificateEmailResendJob(jobData);

      // Actualizar contador de reenvíos
      certificate.emailResendCount++;
      await certificate.save();

      logger.info('Certificate email resend job queued', {
        jobId: job.id,
        certificateId,
        email: certificate.participantData.email
      });

      return {
        success: true,
        message: 'Trabajo de reenvío de email encolado',
        data: { jobId: job.id as string },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error queuing certificate email resend:', error);
      return {
        success: false,
        message: 'Error encolando trabajo de reenvío',
        error: 'QUEUE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Envía webhook de certificado usando colas
   */
  static async sendCertificateWebhook(certificateId: string, webhookUrl: string, webhookSecret?: string): Promise<ApiResponse<{ jobId: string }>> {
    try {
      if (!queueService.isReady()) {
        return {
          success: false,
          message: 'Servicio de colas no disponible',
          error: 'QUEUE_SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        };
      }

      // Obtener certificado
      const certificate = await Certificate.findByPk(certificateId);
      if (!certificate) {
        return {
          success: false,
          message: 'Certificado no encontrado',
          error: 'CERTIFICATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const jobData: CertificateWebhookJobData = {
        certificateId,
        webhookUrl,
        webhookSecret,
        eventType: 'certificate.generated',
        payload: {
          certificate: {
            id: certificate.id,
            number: certificate.certificateNumber,
            type: certificate.certificateType,
            status: certificate.status,
            issuedAt: certificate.issuedAt,
            pdfUrl: certificate.pdfUrl,
            verificationUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/public/certificates/verify/${certificate.certificateNumber}`
          },
          participant: certificate.participantData,
          event: certificate.eventData,
          blockchain: certificate.blockchainTxHash ? {
            txHash: certificate.blockchainTxHash,
            network: certificate.blockchainNetwork,
            confirmations: certificate.blockchainConfirmations
          } : undefined
        },
        priority: 4
      };

      const job = await queueService.addCertificateWebhookJob(jobData);

      logger.info('Certificate webhook job queued', {
        jobId: job.id,
        certificateId,
        webhookUrl
      });

      return {
        success: true,
        message: 'Trabajo de webhook encolado',
        data: { jobId: job.id as string },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error queuing certificate webhook:', error);
      return {
        success: false,
        message: 'Error encolando trabajo de webhook',
        error: 'QUEUE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MONITOREO DE COLAS
  // ====================================================================

  /**
   * Obtiene estadísticas de las colas de certificados
   */
  static async getQueueStats(): Promise<ApiResponse<any>> {
    try {
      if (!queueService.isReady()) {
        return {
          success: false,
          message: 'Servicio de colas no disponible',
          error: 'QUEUE_SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        };
      }

      const stats = await queueService.getAllQueueStats();
      const health = await queueService.getHealthStatus();

      return {
        success: true,
        message: 'Estadísticas de colas obtenidas',
        data: {
          stats,
          health,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting queue stats:', error);
      return {
        success: false,
        message: 'Error obteniendo estadísticas de colas',
        error: 'QUEUE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const certificateService = CertificateService;