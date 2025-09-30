/**
 * @fileoverview Servicio de Certificados Blockchain para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de certificados usando blockchain
 *
 * Archivo: backend/src/services/certificateService.ts
 */

import crypto from 'crypto';
import { EventRegistration } from '../models/EventRegistration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { eventService } from './eventService';

export interface CertificateData {
  eventId: number;
  userId: number;
  registrationId: number;
  certificateType: 'attendance' | 'completion' | 'achievement';
  issuedAt: Date;
  metadata?: any;
}

export interface Certificate {
  id: string;
  hash: string;
  eventId: number;
  userId: number;
  registrationId: number;
  certificateType: string;
  issuedAt: Date;
  blockNumber: number;
  transactionHash: string;
  ipfsHash?: string;
  metadata: any;
  qrCode: string;
  verificationUrl: string;
}

export interface CertificateVerification {
  isValid: boolean;
  certificate?: Certificate;
  event?: {
    id: number;
    title: string;
    startDate: Date;
    endDate: Date;
  };
  participant?: {
    id: number;
    name: string;
    email: string;
  };
  verificationDetails: {
    hash: string;
    blockNumber: number;
    transactionHash: string;
    verifiedAt: Date;
  };
}

export class CertificateService {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly CACHE_PREFIX = 'certificates';

  // Simulación de blockchain
  private static currentBlockNumber = 1000000;
  private static blockchainLedger: Certificate[] = [];

  // ====================================================================
  // GENERACIÓN DE CERTIFICADOS
  // ====================================================================

  /**
   * Genera un certificado de asistencia para un participante
   */
  static async generateAttendanceCertificate(
    eventId: number,
    userId: number,
    registrationId: number
  ): Promise<Certificate> {
    try {
      logger.info('Generating attendance certificate', { eventId, userId, registrationId });

      // Verificar que la inscripción existe y el usuario asistió
      const registration = await EventRegistration.findOne({
        where: { id: registrationId, eventId, userId, status: 'attended' },
        include: [
          { model: Event },
          { model: User }
        ]
      });

      if (!registration) {
        throw new Error('Inscripción no encontrada o usuario no asistió al evento');
      }

      // Verificar que el evento ya terminó
      if (registration.event!.endDate > new Date()) {
        throw new Error('El evento aún no ha finalizado');
      }

      // Verificar si ya existe un certificado
      const existingCertificate = await this.getCertificateByRegistration(registrationId);
      if (existingCertificate) {
        return existingCertificate;
      }

      // Generar datos del certificado
      const certificateData: CertificateData = {
        eventId,
        userId,
        registrationId,
        certificateType: 'attendance',
        issuedAt: new Date(),
        metadata: {
          eventTitle: registration.event!.title,
          participantName: `${registration.user!.firstName} ${registration.user!.lastName}`,
          participantEmail: registration.user!.email,
          attendanceTime: registration.checkInTime,
          duration: registration.checkOutTime && registration.checkInTime
            ? registration.checkOutTime.getTime() - registration.checkInTime.getTime()
            : null
        }
      };

      // Generar certificado
      const certificate = await this.createCertificate(certificateData);

      // Emitir evento
      eventService.getEventEmitter().emit('CertificateGenerated', {
        certificateId: certificate.id,
        eventId,
        userId,
        certificateType: 'attendance',
        timestamp: new Date()
      });

      logger.info('Attendance certificate generated successfully', {
        certificateId: certificate.id,
        eventId,
        userId
      });

      return certificate;
    } catch (error) {
      logger.error('Error generating attendance certificate', { error, eventId, userId, registrationId });
      throw error;
    }
  }

  /**
   * Genera certificados masivos para todos los asistentes de un evento
   */
  static async generateBulkCertificates(eventId: number): Promise<Certificate[]> {
    try {
      logger.info('Generating bulk certificates for event', { eventId });

      // Obtener todas las inscripciones de asistentes confirmados
      const registrations = await EventRegistration.findAll({
        where: { eventId, status: 'attended' },
        include: [
          { model: Event },
          { model: User }
        ]
      });

      if (registrations.length === 0) {
        throw new Error('No hay asistentes confirmados para este evento');
      }

      const certificates: Certificate[] = [];

      for (const registration of registrations) {
        try {
          // Verificar si ya tiene certificado
          const existing = await this.getCertificateByRegistration(registration.id);
          if (!existing) {
            const certificate = await this.generateAttendanceCertificate(
              eventId,
              registration.userId,
              registration.id
            );
            certificates.push(certificate);
          }
        } catch (error) {
          logger.warn('Failed to generate certificate for registration', {
            registrationId: registration.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      logger.info('Bulk certificates generation completed', {
        eventId,
        totalCertificates: certificates.length
      });

      return certificates;
    } catch (error) {
      logger.error('Error generating bulk certificates', { error, eventId });
      throw error;
    }
  }

  /**
   * Crea un certificado en la blockchain simulada
   */
  private static async createCertificate(data: CertificateData): Promise<Certificate> {
    // Generar hash único del certificado
    const certificateString = JSON.stringify({
      ...data,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    });

    const hash = crypto.createHash('sha256').update(certificateString).digest('hex');

    // Simular transacción blockchain
    const blockNumber = ++this.currentBlockNumber;
    const transactionHash = crypto.createHash('sha256')
      .update(hash + blockNumber.toString())
      .digest('hex');

    // Generar IPFS hash simulado
    const ipfsHash = crypto.createHash('sha256')
      .update('ipfs:' + certificateString)
      .digest('hex')
      .substring(0, 46); // IPFS hash length

    // Crear certificado
    const certificate: Certificate = {
      id: crypto.randomUUID(),
      hash,
      eventId: data.eventId,
      userId: data.userId,
      registrationId: data.registrationId,
      certificateType: data.certificateType,
      issuedAt: data.issuedAt,
      blockNumber,
      transactionHash,
      ipfsHash: `ipfs://${ipfsHash}`,
      metadata: data.metadata || {},
      qrCode: this.generateQRCode(hash),
      verificationUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/public/certificates/verify/${hash}`
    };

    // Agregar a ledger simulado
    this.blockchainLedger.push(certificate);

    // Guardar en caché
    await cacheRedis.setex(
      `${this.CACHE_PREFIX}:${hash}`,
      this.CACHE_TTL,
      JSON.stringify(certificate)
    );

    return certificate;
  }

  // ====================================================================
  // VERIFICACIÓN DE CERTIFICADOS
  // ====================================================================

  /**
   * Verifica un certificado por su hash
   */
  static async verifyCertificate(hash: string): Promise<CertificateVerification> {
    try {
      logger.info('Verifying certificate', { hash });

      // Buscar en caché primero
      const cached = await cacheRedis.get(`${this.CACHE_PREFIX}:${hash}`);
      let certificate: Certificate | undefined;

      if (cached) {
        certificate = JSON.parse(cached);
      } else {
        // Buscar en ledger simulado
        certificate = this.blockchainLedger.find(cert => cert.hash === hash);
      }

      if (!certificate) {
        return {
          isValid: false,
          verificationDetails: {
            hash,
            blockNumber: 0,
            transactionHash: '',
            verifiedAt: new Date()
          }
        };
      }

      // Obtener datos adicionales
      const event = await Event.findByPk(certificate.eventId, {
        attributes: ['id', 'title', 'startDate', 'endDate']
      });

      const user = await User.findByPk(certificate.userId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      // Verificar integridad del hash
      const isValid = await this.verifyCertificateIntegrity(certificate);

      const verification: CertificateVerification = {
        isValid,
        certificate,
        event: event ? {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate
        } : undefined,
        participant: user ? {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        } : undefined,
        verificationDetails: {
          hash: certificate.hash,
          blockNumber: certificate.blockNumber,
          transactionHash: certificate.transactionHash,
          verifiedAt: new Date()
        }
      };

      logger.info('Certificate verification completed', { hash, isValid });
      return verification;
    } catch (error) {
      logger.error('Error verifying certificate', { error, hash });
      throw error;
    }
  }

  /**
   * Verifica la integridad de un certificado
   */
  private static async verifyCertificateIntegrity(certificate: Certificate): Promise<boolean> {
    try {
      // Recrear el hash original
      const originalData = {
        eventId: certificate.eventId,
        userId: certificate.userId,
        registrationId: certificate.registrationId,
        certificateType: certificate.certificateType,
        issuedAt: certificate.issuedAt.toISOString(),
        metadata: certificate.metadata
      };

      const certificateString = JSON.stringify(originalData);
      const recalculatedHash = crypto.createHash('sha256').update(certificateString).digest('hex');

      // Verificar que el hash coincida
      return recalculatedHash === certificate.hash;
    } catch (error) {
      logger.error('Error verifying certificate integrity', { error, certificateId: certificate.id });
      return false;
    }
  }

  // ====================================================================
  // CONSULTAS DE CERTIFICADOS
  // ====================================================================

  /**
   * Obtiene certificados de un usuario
   */
  static async getUserCertificates(userId: number): Promise<Certificate[]> {
    try {
      const certificates = this.blockchainLedger.filter(cert => cert.userId === userId);
      return certificates.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
    } catch (error) {
      logger.error('Error getting user certificates', { error, userId });
      throw error;
    }
  }

  /**
   * Obtiene certificados de un evento
   */
  static async getEventCertificates(eventId: number): Promise<Certificate[]> {
    try {
      const certificates = this.blockchainLedger.filter(cert => cert.eventId === eventId);
      return certificates.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
    } catch (error) {
      logger.error('Error getting event certificates', { error, eventId });
      throw error;
    }
  }

  /**
   * Obtiene un certificado por ID de registro
   */
  static async getCertificateByRegistration(registrationId: number): Promise<Certificate | null> {
    try {
      const certificate = this.blockchainLedger.find(cert => cert.registrationId === registrationId);
      return certificate || null;
    } catch (error) {
      logger.error('Error getting certificate by registration', { error, registrationId });
      throw error;
    }
  }

  // ====================================================================
  // UTILIDADES
  // ====================================================================

  /**
   * Genera código QR para un certificado
   */
  private static generateQRCode(hash: string): string {
    // En un sistema real, aquí se generaría una imagen QR
    // Por ahora retornamos una URL de datos simulada
    const qrData = `CERT:${hash}`;
    return `data:image/png;base64,${Buffer.from(qrData).toString('base64')}`;
  }

  /**
   * Obtiene estadísticas de certificados
   */
  static async getCertificateStats(): Promise<{
    totalCertificates: number;
    certificatesThisMonth: number;
    certificatesByType: Record<string, number>;
    recentCertificates: Certificate[];
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const certificatesThisMonth = this.blockchainLedger.filter(
        cert => cert.issuedAt >= startOfMonth
      ).length;

      const certificatesByType = this.blockchainLedger.reduce((acc, cert) => {
        acc[cert.certificateType] = (acc[cert.certificateType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentCertificates = this.blockchainLedger
        .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
        .slice(0, 10);

      return {
        totalCertificates: this.blockchainLedger.length,
        certificatesThisMonth,
        certificatesByType,
        recentCertificates
      };
    } catch (error) {
      logger.error('Error getting certificate stats', { error });
      throw error;
    }
  }

  /**
   * Limpia el caché de certificados
   */
  static async clearCertificatesCache(): Promise<void> {
    try {
      const keys = await cacheRedis.keys(`${this.CACHE_PREFIX}:*`);
      if (keys.length > 0) {
        await cacheRedis.del(keys);
      }
    } catch (error) {
      logger.error('Error clearing certificates cache', { error });
    }
  }
}