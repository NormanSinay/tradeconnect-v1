/**
 * @fileoverview Modelo de Log de Validación de Certificado para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad CertificateValidationLog con validaciones y métodos
 *
 * Archivo: backend/src/models/CertificateValidationLog.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  CreatedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  ForeignKey
} from 'sequelize-typescript';
import { Certificate } from './Certificate';
import {
  CertificateValidationLogAttributes,
  CertificateValidationMethod
} from '../types/certificate.types';

/**
 * Interface para creación de log de validación de certificado
 */
export interface CertificateValidationLogCreationAttributes extends Omit<CertificateValidationLogAttributes, 'id' | 'createdAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CertificateValidationLog:
 *       type: object
 *       required:
 *         - certificateId
 *         - certificateNumber
 *         - validationMethod
 *         - isValid
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del log de validación
 *         certificateId:
 *           type: string
 *           format: uuid
 *           description: ID del certificado validado
 *         certificateNumber:
 *           type: string
 *           description: Número del certificado validado
 *         validationMethod:
 *           type: string
 *           enum: [qr_scan, number_lookup, hash_lookup]
 *           description: Método de validación usado
 *         isValid:
 *           type: boolean
 *           description: Si la validación fue exitosa
 *         validationResult:
 *           type: object
 *           description: Resultado detallado de la validación
 *         ipAddress:
 *           type: string
 *           description: Dirección IP del solicitante
 *         userAgent:
 *           type: string
 *           description: User agent del navegador/dispositivo
 *         location:
 *           type: object
 *           description: Información de ubicación geográfica
 *         deviceInfo:
 *           type: object
 *           description: Información del dispositivo
 *         captchaVerified:
 *           type: boolean
 *           description: Si se verificó CAPTCHA
 *           default: false
 *         rateLimitHit:
 *           type: boolean
 *           description: Si se alcanzó el límite de tasa
 *           default: false
 *         responseTimeMs:
 *           type: integer
 *           description: Tiempo de respuesta en milisegundos
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si falló la validación
 *         blockchainVerified:
 *           type: boolean
 *           description: Si se verificó en blockchain
 *         blockchainConfirmations:
 *           type: integer
 *           description: Número de confirmaciones en blockchain al momento de validación
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la validación
 */

@Table({
  tableName: 'certificate_validation_logs',
  modelName: 'CertificateValidationLog',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['certificate_id']
    },
    {
      fields: ['certificate_number']
    },
    {
      fields: ['validation_method']
    },
    {
      fields: ['is_valid']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['rate_limit_hit']
    },
    {
      fields: ['certificate_id', 'created_at']
    },
    {
      fields: ['ip_address', 'created_at']
    }
  ]
})
export class CertificateValidationLog extends Model<CertificateValidationLogAttributes, CertificateValidationLogCreationAttributes> implements CertificateValidationLogAttributes {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    comment: 'ID único del log de validación'
  })
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Certificate)
  @Index
  @Column({
    type: DataType.UUID,
    comment: 'ID del certificado validado'
  })
  declare certificateId: string;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING(50),
    comment: 'Número del certificado validado'
  })
  declare certificateNumber: string;

  @AllowNull(false)
  @Default(CertificateValidationMethod.NUMBER_LOOKUP)
  @Column({
    type: DataType.ENUM(...Object.values(CertificateValidationMethod)),
    comment: 'Método de validación usado'
  })
  declare validationMethod: CertificateValidationMethod;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la validación fue exitosa'
  })
  declare isValid: boolean;

  @Column({
    type: DataType.JSON,
    comment: 'Resultado detallado de la validación'
  })
  declare validationResult?: any;

  @Validate({
    isIP: {
      msg: 'La dirección IP debe ser válida (IPv4 o IPv6)'
    }
  })
  @Column({
    type: DataType.STRING(45),
    comment: 'Dirección IP del solicitante'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User agent del navegador/dispositivo'
  })
  declare userAgent?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Información de ubicación geográfica'
  })
  declare location?: any;

  @Column({
    type: DataType.JSON,
    comment: 'Información del dispositivo'
  })
  declare deviceInfo?: any;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se verificó CAPTCHA'
  })
  declare captchaVerified: boolean;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se alcanzó el límite de tasa'
  })
  declare rateLimitHit: boolean;

  @Column({
    type: DataType.INTEGER,
    comment: 'Tiempo de respuesta en milisegundos'
  })
  declare responseTimeMs?: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si falló la validación'
  })
  declare errorMessage?: string;

  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se verificó en blockchain'
  })
  declare blockchainVerified?: boolean;

  @Column({
    type: DataType.INTEGER,
    comment: 'Número de confirmaciones en blockchain al momento de validación'
  })
  declare blockchainConfirmations?: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de la validación'
  })
  declare createdAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => Certificate, {
    foreignKey: 'certificateId',
    as: 'certificate'
  })
  declare certificate?: Certificate;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la validación fue exitosa
   */
  public get isSuccessful(): boolean {
    return this.isValid && !this.rateLimitHit;
  }

  /**
   * Verifica si fue una validación sospechosa
   */
  public get isSuspicious(): boolean {
    return this.rateLimitHit || (!this.captchaVerified && this.validationMethod === CertificateValidationMethod.QR_SCAN);
  }

  /**
   * Obtiene información de ubicación formateada
   */
  public getFormattedLocation(): string | null {
    if (!this.location) return null;

    const { country, region, city } = this.location;
    const parts = [city, region, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }

  /**
   * Serializa el log para respuestas de API
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      certificateId: this.certificateId,
      certificateNumber: this.certificateNumber,
      validationMethod: this.validationMethod,
      isValid: this.isValid,
      ipAddress: this.ipAddress,
      location: this.getFormattedLocation(),
      captchaVerified: this.captchaVerified,
      rateLimitHit: this.rateLimitHit,
      responseTimeMs: this.responseTimeMs,
      blockchainVerified: this.blockchainVerified,
      blockchainConfirmations: this.blockchainConfirmations,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa con datos completos para debugging/admin
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      validationResult: this.validationResult,
      userAgent: this.userAgent,
      deviceInfo: this.deviceInfo,
      errorMessage: this.errorMessage,
      certificate: this.certificate?.toPublicJSON()
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea un log de validación exitosa
   */
  static async logSuccessfulValidation(data: {
    certificateId: string;
    certificateNumber: string;
    validationMethod: CertificateValidationMethod;
    validationResult?: any;
    ipAddress?: string;
    userAgent?: string;
    location?: any;
    deviceInfo?: any;
    captchaVerified?: boolean;
    responseTimeMs?: number;
    blockchainVerified?: boolean;
    blockchainConfirmations?: number;
  }): Promise<CertificateValidationLog> {
    return this.create({
      ...data,
      isValid: true,
      rateLimitHit: false,
      captchaVerified: data.captchaVerified || false
    });
  }

  /**
   * Crea un log de validación fallida
   */
  static async logFailedValidation(data: {
    certificateId?: string;
    certificateNumber: string;
    validationMethod: CertificateValidationMethod;
    errorMessage: string;
    ipAddress?: string;
    userAgent?: string;
    location?: any;
    deviceInfo?: any;
    rateLimitHit?: boolean;
    responseTimeMs?: number;
  }): Promise<CertificateValidationLog> {
    return this.create({
      certificateId: data.certificateId || '',
      certificateNumber: data.certificateNumber,
      validationMethod: data.validationMethod,
      isValid: false,
      errorMessage: data.errorMessage,
      rateLimitHit: data.rateLimitHit || false,
      captchaVerified: false,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
      deviceInfo: data.deviceInfo,
      responseTimeMs: data.responseTimeMs
    });
  }

  /**
   * Busca logs de validación de un certificado
   */
  static async findByCertificateId(certificateId: string, limit: number = 50): Promise<CertificateValidationLog[]> {
    return this.findAll({
      where: { certificateId },
      order: [['createdAt', 'DESC']],
      limit,
      include: [
        {
          model: Certificate,
          as: 'certificate',
          attributes: ['certificateNumber', 'status', 'issuedAt']
        }
      ]
    });
  }

  /**
   * Busca logs de validación por IP
   */
  static async findByIPAddress(ipAddress: string, limit: number = 100): Promise<CertificateValidationLog[]> {
    return this.findAll({
      where: { ipAddress },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Obtiene estadísticas de validación por período
   */
  static async getValidationStats(hours: number = 24): Promise<{
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    rateLimitedRequests: number;
    averageResponseTime: number;
    validationsByMethod: Record<CertificateValidationMethod, number>;
    topIPs: Array<{ ip: string; count: number }>;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await this.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: since
        }
      },
      attributes: [
        'validationMethod',
        'isValid',
        'rateLimitHit',
        'responseTimeMs',
        'ipAddress'
      ]
    });

    const stats = {
      totalValidations: logs.length,
      successfulValidations: 0,
      failedValidations: 0,
      rateLimitedRequests: 0,
      totalResponseTime: 0,
      responseTimeCount: 0,
      validationsByMethod: {} as Record<CertificateValidationMethod, number>,
      ipCounts: new Map<string, number>()
    };

    logs.forEach(log => {
      // Conteo por resultado
      if (log.isValid && !log.rateLimitHit) {
        stats.successfulValidations++;
      } else {
        stats.failedValidations++;
      }

      if (log.rateLimitHit) {
        stats.rateLimitedRequests++;
      }

      // Conteo por método
      stats.validationsByMethod[log.validationMethod] = (stats.validationsByMethod[log.validationMethod] || 0) + 1;

      // Conteo por IP
      if (log.ipAddress) {
        stats.ipCounts.set(log.ipAddress, (stats.ipCounts.get(log.ipAddress) || 0) + 1);
      }

      // Tiempos de respuesta
      if (log.responseTimeMs) {
        stats.totalResponseTime += log.responseTimeMs;
        stats.responseTimeCount++;
      }
    });

    // Top IPs
    const topIPs = Array.from(stats.ipCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return {
      totalValidations: stats.totalValidations,
      successfulValidations: stats.successfulValidations,
      failedValidations: stats.failedValidations,
      rateLimitedRequests: stats.rateLimitedRequests,
      averageResponseTime: stats.responseTimeCount > 0 ? stats.totalResponseTime / stats.responseTimeCount : 0,
      validationsByMethod: stats.validationsByMethod,
      topIPs
    };
  }

  /**
   * Limpia logs antiguos (más de 90 días)
   */
  static async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const affectedRows = await this.destroy({
      where: {
        createdAt: {
          [require('sequelize').Op.lt]: cutoffDate
        }
      }
    });

    return affectedRows;
  }
}