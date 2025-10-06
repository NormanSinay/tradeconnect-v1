/**
 * @fileoverview Servicio de Códigos QR para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para generación, validación y gestión de códigos QR
 *
 * Archivo: backend/src/services/qrService.ts
 */

import crypto from 'crypto';
import QRCode from 'qrcode';
import { Op } from 'sequelize';
import { QRCode as QRCodeModel, QRStatus } from '../models/QRCode';
import { Attendance, AttendanceMethod, AttendanceStatus } from '../models/Attendance';
import { AccessLog, AccessType, AccessResult, AccessSeverity } from '../models/AccessLog';
import { EventRegistration } from '../models/EventRegistration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { EntityType, BlockchainNetwork } from '../models/BlockchainHash';
import {
  GenerateQRRequest,
  GenerateQRResponse,
  ValidateQRRequest,
  ValidateQRResponse,
  RegenerateQRRequest,
  InvalidateQRRequest,
  QRData,
  QREncryptionType,
  QRGenerationConfig,
  QRValidationConfig
} from '../types/qr.types';
import { ApiResponse } from '../types/global.types';
import { config } from '../config/environment';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { blockchainService } from './blockchainService';

/**
 * Servicio para gestión de códigos QR
 */
export class QRService {
  private readonly HMAC_SECRET = config.qr?.hmacSecret || 'default-secret-change-in-production';
  private readonly ENCRYPTION_KEY = config.qr?.encryptionKey || 'default-encryption-key-change-in-production';
  private readonly CACHE_TTL = config.qr?.cacheTtl || 3600; // 1 hora por defecto

  // Configuración por defecto para generación de QR
  private readonly defaultGenerationConfig: QRGenerationConfig = {
    encryptionType: QREncryptionType.AES256,
    errorCorrectionLevel: 'H',
    version: 10,
    size: 256,
    margin: 4,
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000'
  };

  // Configuración por defecto para validación
  private readonly defaultValidationConfig: QRValidationConfig = {
    earlyToleranceMinutes: 30,
    lateToleranceMinutes: 60,
    maxUsesPerQR: 1,
    requireBlockchainVerification: false,
    cacheTTLSeconds: 3600
  };

  // ====================================================================
  // MÉTODOS DE GENERACIÓN DE QR
  // ====================================================================

  /**
   * Genera un código QR para una inscripción
   */
  async generateQR(request: GenerateQRRequest, createdBy: number): Promise<ApiResponse<GenerateQRResponse>> {
    try {
      const { registrationId, expiresAt, metadata } = request;

      // Verificar que la inscripción existe y está aprobada
      const registration = await EventRegistration.findByPk(registrationId, {
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'startDate', 'endDate', 'status']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!registration) {
        return {
          success: false,
          message: 'Inscripción no encontrada',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (registration.status !== 'confirmed') {
        return {
          success: false,
          message: 'La inscripción no está confirmada',
          error: 'REGISTRATION_NOT_CONFIRMED',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si ya existe un QR activo para esta inscripción
      const existingQR = await QRCodeModel.findOne({
        where: {
          eventRegistrationId: registrationId,
          status: QRStatus.ACTIVE
        }
      });

      if (existingQR) {
        return {
          success: false,
          message: 'Ya existe un código QR activo para esta inscripción',
          error: 'ACTIVE_QR_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del QR
      const qrData: QRData = {
        registrationId,
        eventId: registration.eventId,
        participantId: registration.userId,
        hash: '',
        timestamp: new Date(),
        metadata
      };

      // Generar hash del contenido
      const dataString = JSON.stringify(qrData);
      qrData.hash = crypto.createHash('sha256').update(dataString).digest('hex');

      // Encriptar datos
      const encryptedData = this.encryptQRData(qrData);

      // Crear registro en base de datos
      const qrCode = await QRCodeModel.create({
        eventRegistrationId: registrationId,
        qrData: encryptedData,
        qrHash: qrData.hash,
        status: QRStatus.ACTIVE,
        generatedAt: new Date(),
        expiresAt: expiresAt || this.calculateExpiryDate(registration.event),
        createdBy
      });

      // Registrar en blockchain (si está habilitado)
      let blockchainTxHash: string | undefined;
      try {
        if (config.blockchain?.enabled) {
          const blockchainResult = await blockchainService.registerHash({
            entityId: qrCode.id,
            entityType: EntityType.QR_CODE,
            hash: qrData.hash,
            timestamp: new Date(),
            metadata: {
              registrationId,
              eventId: registration.eventId,
              participantId: registration.userId,
              generatedAt: qrCode.generatedAt
            }
          });

          if (blockchainResult.success && blockchainResult.data) {
            blockchainTxHash = blockchainResult.data.txHash;
            qrCode.blockchainTxHash = blockchainTxHash;
            await qrCode.save();
          }
        }
      } catch (blockchainError) {
        logger.warn('Error registrando QR en blockchain:', blockchainError);
        // No fallar la generación del QR por error de blockchain
      }

      // Generar imagen QR
      const qrUrl = await this.generateQRImage(qrData.hash);

      // Cachear el QR activo
      await this.cacheActiveQR(qrCode);

      // Log de auditoría
      await AccessLog.logSuccessfulAccess({
        eventId: registration.eventId,
        userId: registration.userId,
        qrCodeId: qrCode.id,
        accessType: AccessType.QR_SCAN,
        scannedBy: createdBy,
        metadata: {
          action: 'qr_generated',
          registrationId,
          qrHash: qrData.hash
        }
      });

      return {
        success: true,
        message: 'Código QR generado exitosamente',
        data: {
          qrId: qrCode.id,
          qrHash: qrData.hash,
          qrUrl,
          qrData,
          status: QRStatus.ACTIVE,
          expiresAt: qrCode.expiresAt,
          blockchainTxHash
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error generando QR:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Regenera un código QR existente
   */
  async regenerateQR(request: RegenerateQRRequest, updatedBy: number): Promise<ApiResponse<GenerateQRResponse>> {
    try {
      const { registrationId, reason, expiresAt } = request;

      // Invalidar QR anterior
      const existingQR = await QRCodeModel.findOne({
        where: {
          eventRegistrationId: registrationId,
          status: QRStatus.ACTIVE
        }
      });

      if (existingQR) {
        await existingQR.invalidate(reason || 'Regenerado');
      }

      // Generar nuevo QR
      return this.generateQR({ registrationId, expiresAt }, updatedBy);

    } catch (error) {
      logger.error('Error regenerando QR:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS DE VALIDACIÓN DE QR
  // ====================================================================

  /**
   * Valida un código QR escaneado
   */
  async validateQR(request: ValidateQRRequest, scannerId?: number): Promise<ApiResponse<ValidateQRResponse>> {
    try {
      const { qrHash, eventId, accessPoint, deviceInfo, location } = request;

      // Buscar QR en cache primero
      let qrCode = await this.getCachedQR(qrHash);

      if (!qrCode) {
        // Buscar en base de datos
        qrCode = await QRCodeModel.findByHash(qrHash);

        if (!qrCode) {
          await this.logAccessAttempt({
            eventId,
            accessType: AccessType.QR_SCAN,
            result: AccessResult.INVALID,
            failureReason: 'Código QR no encontrado',
            scannedBy: scannerId,
            accessPoint,
            deviceInfo,
            location,
            qrHash
          });

          return {
            success: false,
            message: 'Código QR inválido',
            data: {
              isValid: false,
              status: QRStatus.INVALIDATED,
              failureReason: 'Código QR no encontrado',
              message: 'Este código QR no existe en el sistema'
            },
            timestamp: new Date().toISOString()
          };
        }

        // Cachear para futuras validaciones
        await this.cacheActiveQR(qrCode);
      }

      // Verificar estado del QR
      if (!qrCode.isValid) {
        const failureReason = qrCode.status === QRStatus.USED ? 'Código QR ya utilizado' :
                             qrCode.status === QRStatus.EXPIRED ? 'Código QR expirado' :
                             qrCode.status === QRStatus.INVALIDATED ? 'Código QR invalidado' :
                             'Estado inválido del código QR';

        await this.logAccessAttempt({
          eventId,
          userId: qrCode.eventRegistration?.userId,
          qrCodeId: qrCode.id,
          accessType: AccessType.QR_SCAN,
          result: AccessResult.INVALID,
          failureReason,
          scannedBy: scannerId,
          accessPoint,
          deviceInfo,
          location,
          qrHash
        });

        return {
          success: false,
          message: failureReason,
          data: {
            isValid: false,
            status: qrCode.status,
            failureReason,
            message: failureReason
          },
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que corresponde al evento correcto
      if (qrCode.eventRegistration?.eventId !== eventId) {
        await this.logAccessAttempt({
          eventId,
          userId: qrCode.eventRegistration?.userId,
          qrCodeId: qrCode.id,
          accessType: AccessType.QR_SCAN,
          result: AccessResult.INVALID,
          failureReason: 'QR no corresponde a este evento',
          scannedBy: scannerId,
          accessPoint,
          deviceInfo,
          location,
          qrHash
        });

        return {
          success: false,
          message: 'Este código QR no corresponde a este evento',
          data: {
            isValid: false,
            status: qrCode.status,
            failureReason: 'QR no corresponde a este evento',
            message: 'Código QR para evento incorrecto'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Verificar límites de tiempo del evento
      const event = qrCode.eventRegistration?.event;
      if (event) {
        const now = new Date();
        const earlyLimit = new Date(event.startDate.getTime() - this.defaultValidationConfig.earlyToleranceMinutes * 60000);
        const lateLimit = new Date(event.endDate.getTime() + this.defaultValidationConfig.lateToleranceMinutes * 60000);

        if (now < earlyLimit) {
          await this.logAccessAttempt({
            eventId,
            userId: qrCode.eventRegistration?.userId,
            qrCodeId: qrCode.id,
            accessType: AccessType.QR_SCAN,
            result: AccessResult.INVALID,
            failureReason: 'Acceso anticipado no permitido',
            scannedBy: scannerId,
            accessPoint,
            deviceInfo,
            location,
            qrHash
          });

          return {
            success: false,
            message: 'Acceso anticipado no permitido',
            data: {
              isValid: false,
              status: qrCode.status,
              failureReason: 'Acceso anticipado no permitido',
              message: `El evento comienza en ${event.startDate.toLocaleString()}`
            },
            timestamp: new Date().toISOString()
          };
        }

        if (now > lateLimit) {
          await this.logAccessAttempt({
            eventId,
            userId: qrCode.eventRegistration?.userId,
            qrCodeId: qrCode.id,
            accessType: AccessType.QR_SCAN,
            result: AccessResult.INVALID,
            failureReason: 'Evento ya finalizó',
            scannedBy: scannerId,
            accessPoint,
            deviceInfo,
            location,
            qrHash
          });

          return {
            success: false,
            message: 'El evento ya finalizó',
            data: {
              isValid: false,
              status: qrCode.status,
              failureReason: 'Evento ya finalizó',
              message: `El evento finalizó en ${event.endDate.toLocaleString()}`
            },
            timestamp: new Date().toISOString()
          };
        }
      }

      // Verificar asistencia duplicada
      const existingAttendance = await Attendance.findOne({
        where: {
          eventId,
          userId: qrCode.eventRegistration!.userId,
          status: { [Op.ne]: 'cancelled' }
        }
      });

      if (existingAttendance) {
        await this.logAccessAttempt({
          eventId,
          userId: qrCode.eventRegistration?.userId,
          qrCodeId: qrCode.id,
          accessType: AccessType.QR_SCAN,
          result: AccessResult.DUPLICATE,
          failureReason: 'Asistencia ya registrada',
          scannedBy: scannerId,
          accessPoint,
          deviceInfo,
          location,
          qrHash
        });

        return {
          success: false,
          message: 'Asistencia ya registrada para este participante',
          data: {
            isValid: false,
            status: qrCode.status,
            failureReason: 'Asistencia ya registrada',
            message: 'Este participante ya tiene asistencia registrada'
          },
          timestamp: new Date().toISOString()
        };
      }

      // Verificación de blockchain (opcional)
      if (this.defaultValidationConfig.requireBlockchainVerification && qrCode.blockchainTxHash) {
        try {
          const blockchainVerification = await blockchainService.verifyHash({
            hash: qrCode.qrHash,
            network: BlockchainNetwork.SEPOLIA_TESTNET
          });
          if (!blockchainVerification.success || !blockchainVerification.data?.exists) {
            await this.logAccessAttempt({
              eventId,
              userId: qrCode.eventRegistration?.userId,
              qrCodeId: qrCode.id,
              accessType: AccessType.QR_SCAN,
              result: AccessResult.INVALID,
              failureReason: 'Verificación blockchain fallida',
              scannedBy: scannerId,
              accessPoint,
              deviceInfo,
              location,
              qrHash
            });

            return {
              success: false,
              message: 'Verificación de seguridad fallida',
              data: {
                isValid: false,
                status: qrCode.status,
                failureReason: 'Verificación blockchain fallida',
                message: 'No se pudo verificar la autenticidad del código QR'
              },
              timestamp: new Date().toISOString()
            };
          }
        } catch (blockchainError) {
          logger.warn('Error verificando QR en blockchain:', blockchainError);
          // Continuar sin verificación blockchain si falla
        }
      }

      // QR válido - registrar asistencia
      const attendance = await Attendance.create({
        eventId,
        userId: qrCode.eventRegistration!.userId,
        qrCodeId: qrCode.id,
        checkInTime: new Date(),
        accessPoint,
        scannedBy: scannerId,
        deviceInfo,
        ipAddress: undefined, // Se obtiene del request
        location,
        method: AttendanceMethod.QR,
        status: AttendanceStatus.CHECKED_IN,
        isOfflineSync: false
      });

      // Marcar QR como usado
      await qrCode.markAsUsed();

      // Limpiar cache
      await this.invalidateQRCache(qrHash);

      // Log de acceso exitoso
      await this.logAccessAttempt({
        eventId,
        userId: qrCode.eventRegistration?.userId,
        qrCodeId: qrCode.id,
        accessType: AccessType.QR_SCAN,
        result: AccessResult.SUCCESS,
        scannedBy: scannerId,
        accessPoint,
        deviceInfo,
        location,
        qrHash
      });

      return {
        success: true,
        message: 'Acceso concedido',
        data: {
          isValid: true,
          status: QRStatus.USED,
          participantId: qrCode.eventRegistration!.userId,
          registrationId: qrCode.eventRegistration!.id,
          eventId,
          attendanceRecorded: true,
          attendanceId: attendance.id,
          message: 'Acceso concedido exitosamente'
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error validando QR:', error);

      // Log de error
      await this.logAccessAttempt({
        eventId: request.eventId,
        accessType: AccessType.QR_SCAN,
        result: AccessResult.FAILED,
        failureReason: 'Error interno del sistema',
        scannedBy: scannerId,
        accessPoint: request.accessPoint,
        deviceInfo: request.deviceInfo,
        location: request.location,
        qrHash: request.qrHash
      });

      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        data: {
          isValid: false,
          status: QRStatus.INVALIDATED,
          failureReason: 'Error interno del sistema',
          message: 'Error procesando el código QR'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS DE GESTIÓN DE QR
  // ====================================================================

  /**
   * Invalida un código QR
   */
  async invalidateQR(request: InvalidateQRRequest): Promise<ApiResponse<void>> {
    try {
      const { qrId, reason } = request;

      const qrCode = await QRCodeModel.findByPk(qrId);
      if (!qrCode) {
        return {
          success: false,
          message: 'Código QR no encontrado',
          error: 'QR_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await qrCode.invalidate(reason);

      // Limpiar cache
      await this.invalidateQRCache(qrCode.qrHash);

      // Log de auditoría
      await AccessLog.create({
        eventId: qrCode.eventRegistration?.eventId || 0,
        userId: qrCode.eventRegistration?.userId,
        qrCodeId: qrCode.id,
        accessType: AccessType.API_ACCESS,
        timestamp: new Date(),
        result: AccessResult.SUCCESS,
        severity: AccessSeverity.MEDIUM,
        isSuspicious: false,
        metadata: {
          action: 'qr_invalidated',
          reason,
          qrHash: qrCode.qrHash
        }
      });

      return {
        success: true,
        message: 'Código QR invalidado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error invalidando QR:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Encripta los datos del QR
   */
  private encryptQRData(data: QRData): any {
    try {
      const dataString = JSON.stringify(data);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.ENCRYPTION_KEY, 'hex'), iv);
      let encrypted = cipher.update(dataString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Agregar firma HMAC
      const hmac = crypto.createHmac('sha256', this.HMAC_SECRET);
      hmac.update(encrypted);
      const signature = hmac.digest('hex');

      return {
        encrypted,
        iv: iv.toString('hex'),
        signature,
        algorithm: 'aes-256-cbc',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error encriptando datos QR:', error);
      throw error;
    }
  }

  /**
   * Desencripta los datos del QR
   */
  private decryptQRData(encryptedData: any): QRData | null {
    try {
      const { encrypted, iv, signature } = encryptedData;

      // Verificar firma HMAC
      const hmac = crypto.createHmac('sha256', this.HMAC_SECRET);
      hmac.update(encrypted);
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Firma HMAC inválida');
      }

      // Desencriptar
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Error desencriptando datos QR:', error);
      return null;
    }
  }

  /**
   * Genera imagen QR
   */
  private async generateQRImage(hash: string): Promise<string> {
    try {
      const qrOptions = {
        errorCorrectionLevel: this.defaultGenerationConfig.errorCorrectionLevel,
        quality: 0.92,
        margin: this.defaultGenerationConfig.margin,
        color: {
          dark: this.defaultGenerationConfig.foregroundColor,
          light: this.defaultGenerationConfig.backgroundColor
        },
        width: this.defaultGenerationConfig.size
      };

      // En una implementación real, esto debería generar una URL o guardar el archivo
      // Por ahora retornamos un placeholder
      return `data:image/png;base64,${await QRCode.toDataURL(hash, qrOptions)}`;
    } catch (error) {
      logger.error('Error generando imagen QR:', error);
      throw error;
    }
  }

  /**
   * Calcula fecha de expiración del QR
   */
  private calculateExpiryDate(event: Event): Date {
    // Por defecto, expira 24 horas después del fin del evento
    return new Date(event.endDate.getTime() + 24 * 60 * 60 * 1000);
  }

  /**
   * Cachea QR activo
   */
  private async cacheActiveQR(qrCode: QRCodeModel): Promise<void> {
    try {
      const cacheKey = `qr:active:${qrCode.qrHash}`;
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(qrCode.toJSON()));
    } catch (error) {
      logger.warn('Error cacheando QR:', error);
    }
  }

  /**
   * Obtiene QR del cache
   */
  private async getCachedQR(hash: string): Promise<QRCodeModel | null> {
    try {
      const cacheKey = `qr:active:${hash}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        const qrData = JSON.parse(cached);
        return QRCodeModel.build(qrData);
      }

      return null;
    } catch (error) {
      logger.warn('Error obteniendo QR del cache:', error);
      return null;
    }
  }

  /**
   * Invalida cache de QR
   */
  private async invalidateQRCache(hash: string): Promise<void> {
    try {
      const cacheKey = `qr:active:${hash}`;
      await redis.del(cacheKey);
    } catch (error) {
      logger.warn('Error invalidando cache QR:', error);
    }
  }

  /**
   * Registra intento de acceso
   */
  private async logAccessAttempt(data: {
    eventId: number;
    userId?: number;
    qrCodeId?: number;
    accessType: AccessType;
    result: AccessResult;
    failureReason?: string;
    scannedBy?: number;
    accessPoint?: string;
    deviceInfo?: any;
    location?: any;
    qrHash?: string;
  }): Promise<void> {
    try {
      const severity = data.result === AccessResult.SUCCESS ? AccessSeverity.LOW :
                      data.result === AccessResult.FAILED ? AccessSeverity.MEDIUM :
                      AccessSeverity.HIGH;

      await AccessLog.create({
        eventId: data.eventId,
        userId: data.userId,
        qrCodeId: data.qrCodeId,
        accessType: data.accessType,
        timestamp: new Date(),
        ipAddress: undefined, // Se obtiene del request HTTP
        userAgent: undefined,
        deviceInfo: data.deviceInfo,
        location: data.location,
        result: data.result,
        failureReason: data.failureReason,
        scannedBy: data.scannedBy,
        accessPoint: data.accessPoint,
        severity,
        isSuspicious: data.result === AccessResult.FAILED || data.result === AccessResult.RATE_LIMITED,
        metadata: {
          qrHash: data.qrHash
        }
      });
    } catch (error) {
      logger.error('Error registrando acceso:', error);
    }
  }
}

export const qrService = new QRService();