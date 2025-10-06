/**
 * @fileoverview Modelo de Certificado para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Certificate con validaciones y métodos
 *
 * Archivo: backend/src/models/Certificate.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  ForeignKey
} from 'sequelize-typescript';
import { User } from './User';
import { Event } from './Event';
import { EventRegistration } from './EventRegistration';
import { CertificateTemplate } from './CertificateTemplate';
import { CertificateValidationLog } from './CertificateValidationLog';
import {
  CertificateAttributes,
  CertificateType,
  CertificateStatus
} from '../types/certificate.types';

/**
 * Interface para creación de certificado
 */
export interface CertificateCreationAttributes extends Omit<CertificateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       required:
 *         - certificateNumber
 *         - eventId
 *         - userId
 *         - registrationId
 *         - templateId
 *         - certificateType
 *         - issuedAt
 *         - pdfHash
 *         - participantData
 *         - eventData
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del certificado
 *         certificateNumber:
 *           type: string
 *           description: Número único del certificado
 *           example: "CERT-2025-001234"
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *         userId:
 *           type: integer
 *           description: ID del usuario/participante
 *         registrationId:
 *           type: integer
 *           description: ID de la inscripción
 *         templateId:
 *           type: string
 *           format: uuid
 *           description: ID del template usado
 *         certificateType:
 *           type: string
 *           enum: [attendance, completion, achievement]
 *           description: Tipo de certificado
 *         status:
 *           type: string
 *           enum: [active, revoked, expired]
 *           description: Estado del certificado
 *         issuedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de emisión
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración
 *         pdfHash:
 *           type: string
 *           description: Hash SHA-256 del PDF
 *         pdfUrl:
 *           type: string
 *           description: URL del archivo PDF
 *         qrCode:
 *           type: string
 *           description: Código QR en base64
 *         qrHash:
 *           type: string
 *           description: Hash del código QR
 *         blockchainTxHash:
 *           type: string
 *           description: Hash de transacción blockchain
 *         blockchainConfirmations:
 *           type: integer
 *           description: Número de confirmaciones blockchain
 *         participantData:
 *           type: object
 *           description: Datos del participante
 *         eventData:
 *           type: object
 *           description: Datos del evento
 *         downloadCount:
 *           type: integer
 *           description: Número de descargas
 *         verificationCount:
 *           type: integer
 *           description: Número de verificaciones
 */

@Table({
  tableName: 'certificates',
  modelName: 'Certificate',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['certificate_number']
    },
    {
      fields: ['event_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['registration_id']
    },
    {
      fields: ['template_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['pdf_hash']
    },
    {
      fields: ['blockchain_tx_hash']
    },
    {
      fields: ['issued_at']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['event_id', 'user_id']
    },
    {
      fields: ['status', 'issued_at']
    }
  ]
})
export class Certificate extends Model<CertificateAttributes, CertificateCreationAttributes> implements CertificateAttributes {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    comment: 'ID único del certificado'
  })
  declare id: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El número de certificado es requerido'
    },
    is: {
      args: /^CERT-\d{4}-\d{6}$/,
      msg: 'El formato del número de certificado debe ser CERT-YYYY-NNNNNN'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Número único del certificado (ej: CERT-2025-001234)'
  })
  declare certificateNumber: string;

  @AllowNull(false)
  @ForeignKey(() => Event)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del evento'
  })
  declare eventId: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario/participante'
  })
  declare userId: number;

  @AllowNull(false)
  @ForeignKey(() => EventRegistration)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la inscripción'
  })
  declare registrationId: number;

  @AllowNull(false)
  @ForeignKey(() => CertificateTemplate)
  @Index
  @Column({
    type: DataType.UUID,
    comment: 'ID del template usado'
  })
  declare templateId: string;

  @AllowNull(false)
  @Default(CertificateType.ATTENDANCE)
  @Column({
    type: DataType.ENUM(...Object.values(CertificateType)),
    comment: 'Tipo de certificado'
  })
  declare certificateType: CertificateType;

  @AllowNull(false)
  @Default(CertificateStatus.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(CertificateStatus)),
    comment: 'Estado del certificado'
  })
  declare status: CertificateStatus;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de emisión del certificado'
  })
  declare issuedAt: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del certificado'
  })
  declare expiresAt?: Date;

  @AllowNull(false)
  @Validate({
    isLength: {
      args: [64, 64],
      msg: 'El hash PDF debe tener exactamente 64 caracteres (SHA-256)'
    },
    is: {
      args: /^[a-f0-9]+$/i,
      msg: 'El hash PDF debe contener solo caracteres hexadecimales'
    }
  })
  @Column({
    type: DataType.STRING(64),
    comment: 'Hash SHA-256 del archivo PDF'
  })
  declare pdfHash: string;

  @Validate({
    isUrl: {
      msg: 'La URL del PDF debe ser válida'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'URL del archivo PDF'
  })
  declare pdfUrl?: string;

  @Column({
    type: DataType.INTEGER,
    comment: 'Tamaño del archivo PDF en bytes'
  })
  declare pdfSizeBytes?: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Código QR en formato base64 o URL'
  })
  declare qrCode?: string;

  @Validate({
    isLength: {
      args: [64, 64],
      msg: 'El hash QR debe tener exactamente 64 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(64),
    comment: 'Hash del código QR para verificación'
  })
  declare qrHash?: string;

  @Validate({
    is: {
      args: /^0x[a-fA-F0-9]{64}$/,
      msg: 'El hash de transacción debe tener formato válido de Ethereum'
    }
  })
  @Column({
    type: DataType.STRING(66),
    comment: 'Hash de transacción de blockchain'
  })
  declare blockchainTxHash?: string;

  @Column({
    type: DataType.BIGINT,
    comment: 'Número del bloque donde se registró'
  })
  declare blockchainBlockNumber?: number;

  @AllowNull(false)
  @Default('sepolia_testnet')
  @Column({
    type: DataType.STRING(50),
    comment: 'Red blockchain usada'
  })
  declare blockchainNetwork: string;

  @Validate({
    is: {
      args: /^0x[a-fA-F0-9]{40}$/,
      msg: 'La dirección del contrato debe tener formato válido de Ethereum'
    }
  })
  @Column({
    type: DataType.STRING(42),
    comment: 'Dirección del contrato inteligente'
  })
  declare blockchainContractAddress?: string;

  @Column({
    type: DataType.BIGINT,
    comment: 'Gas utilizado en la transacción'
  })
  declare blockchainGasUsed?: number;

  @Column({
    type: DataType.DECIMAL(36, 18),
    comment: 'Precio del gas en wei/gwei'
  })
  declare blockchainGasPrice?: string;

  @Column({
    type: DataType.DECIMAL(36, 18),
    comment: 'Costo total de gas en ETH'
  })
  declare blockchainTotalCost?: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de confirmaciones en blockchain'
  })
  declare blockchainConfirmations: number;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Datos del participante (nombre, DPI, email, etc.)'
  })
  declare participantData: any; // CertificateParticipantData

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Datos del evento (nombre, fecha, duración, etc.)'
  })
  declare eventData: any; // CertificateEventData

  @Column({
    type: DataType.JSON,
    comment: 'Datos adicionales del certificado'
  })
  declare certificateData?: any; // CertificateData

  @Column({
    type: DataType.JSON,
    comment: 'Criterios de elegibilidad cumplidos'
  })
  declare eligibilityCriteria?: any; // CertificateEligibilityCriteria

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de revocación'
  })
  declare revokedAt?: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que revocó el certificado'
  })
  declare revokedBy?: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Motivo de la revocación'
  })
  declare revocationReason?: string;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de veces descargado'
  })
  declare downloadCount: number;

  @Column({
    type: DataType.DATE,
    comment: 'Última fecha de descarga'
  })
  declare lastDownloadedAt?: Date;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de verificaciones realizadas'
  })
  declare verificationCount: number;

  @Column({
    type: DataType.DATE,
    comment: 'Última fecha de verificación'
  })
  declare lastVerifiedAt?: Date;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se envió por email'
  })
  declare emailSent: boolean;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de envío por email'
  })
  declare emailSentAt?: Date;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reenvíos por email'
  })
  declare emailResendCount: number;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó el certificado'
  })
  declare createdBy?: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el certificado'
  })
  declare updatedBy?: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de actualización'
  })
  declare updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => Event, {
    foreignKey: 'eventId',
    as: 'event'
  })
  declare event?: Event;

  @BelongsTo(() => User, {
    foreignKey: 'userId',
    as: 'participant'
  })
  declare participant?: User;

  @BelongsTo(() => EventRegistration, {
    foreignKey: 'registrationId',
    as: 'registration'
  })
  declare registration?: EventRegistration;

  @BelongsTo(() => CertificateTemplate, {
    foreignKey: 'templateId',
    as: 'template'
  })
  declare template?: CertificateTemplate;

  @BelongsTo(() => User, {
    foreignKey: 'createdBy',
    as: 'creator'
  })
  declare creator?: User;

  @BelongsTo(() => User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  })
  declare updater?: User;

  @BelongsTo(() => User, {
    foreignKey: 'revokedBy',
    as: 'revoker'
  })
  declare revoker?: User;

  @HasMany(() => CertificateValidationLog, {
    foreignKey: 'certificateId',
    as: 'validationLogs'
  })
  declare validationLogs?: CertificateValidationLog[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el certificado está activo
   */
  public get isActive(): boolean {
    return this.status === CertificateStatus.ACTIVE && !this.deletedAt;
  }

  /**
   * Verifica si el certificado está revocado
   */
  public get isRevoked(): boolean {
    return this.status === CertificateStatus.REVOKED;
  }

  /**
   * Verifica si el certificado ha expirado
   */
  public get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  /**
   * Verifica si el certificado está verificado en blockchain
   */
  public get isBlockchainVerified(): boolean {
    return !!(this.blockchainTxHash && this.blockchainConfirmations > 0);
  }

  /**
   * Obtiene el costo total de gas formateado
   */
  public get formattedGasCost(): string {
    if (!this.blockchainTotalCost) return '0';
    return `${parseFloat(this.blockchainTotalCost).toFixed(6)} ETH`;
  }

  /**
   * Incrementa el contador de descargas
   */
  public async incrementDownloadCount(): Promise<void> {
    this.downloadCount++;
    this.lastDownloadedAt = new Date();
    await this.save();
  }

  /**
   * Incrementa el contador de verificaciones
   */
  public async incrementVerificationCount(): Promise<void> {
    this.verificationCount++;
    this.lastVerifiedAt = new Date();
    await this.save();
  }

  /**
   * Marca el certificado como enviado por email
   */
  public async markAsEmailSent(): Promise<void> {
    this.emailSent = true;
    this.emailSentAt = new Date();
    await this.save();
  }

  /**
   * Incrementa el contador de reenvíos por email
   */
  public async incrementEmailResendCount(): Promise<void> {
    this.emailResendCount++;
    await this.save();
  }

  /**
   * Revoca el certificado
   */
  public async revoke(reason: string, revokedBy: number): Promise<void> {
    this.status = CertificateStatus.REVOKED;
    this.revokedAt = new Date();
    this.revokedBy = revokedBy;
    this.revocationReason = reason;
    await this.save();
  }

  /**
   * Verifica si puede ser descargado
   */
  public canBeDownloaded(): boolean {
    return this.isActive && !this.isExpired;
  }

  /**
   * Genera URL de verificación pública
   */
  public getVerificationUrl(baseUrl?: string): string {
    const base = baseUrl || process.env.BASE_URL || 'http://localhost:3000';
    return `${base}/api/public/certificates/verify/${this.certificateNumber}`;
  }

  /**
   * Serializa el certificado para respuestas de API
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      certificateNumber: this.certificateNumber,
      certificateType: this.certificateType,
      status: this.status,
      issuedAt: this.issuedAt,
      expiresAt: this.expiresAt,
      pdfUrl: this.pdfUrl,
      qrCode: this.qrCode,
      blockchainTxHash: this.blockchainTxHash,
      blockchainConfirmations: this.blockchainConfirmations,
      blockchainNetwork: this.blockchainNetwork,
      downloadCount: this.downloadCount,
      verificationCount: this.verificationCount,
      verificationUrl: this.getVerificationUrl(),
      participantData: this.participantData,
      eventData: this.eventData,
      certificateData: this.certificateData,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa con datos completos para administración
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      pdfHash: this.pdfHash,
      pdfSizeBytes: this.pdfSizeBytes,
      qrHash: this.qrHash,
      blockchainBlockNumber: this.blockchainBlockNumber,
      blockchainContractAddress: this.blockchainContractAddress,
      blockchainGasUsed: this.blockchainGasUsed,
      blockchainGasPrice: this.blockchainGasPrice,
      blockchainTotalCost: this.blockchainTotalCost,
      eligibilityCriteria: this.eligibilityCriteria,
      revokedAt: this.revokedAt,
      revocationReason: this.revocationReason,
      emailSent: this.emailSent,
      emailSentAt: this.emailSentAt,
      emailResendCount: this.emailResendCount,
      lastDownloadedAt: this.lastDownloadedAt,
      lastVerifiedAt: this.lastVerifiedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt,
      event: this.event?.toPublicJSON(),
      participant: this.participant?.toPublicJSON(),
      template: this.template?.toPublicJSON(),
      creator: this.creator?.toPublicJSON()
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un número único de certificado
   */
  static generateCertificateNumber(year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    return `CERT-${currentYear}-${timestamp}`;
  }

  /**
   * Busca certificado por número
   */
  static async findByCertificateNumber(certificateNumber: string): Promise<Certificate | null> {
    return this.findOne({
      where: { certificateNumber },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'participant' },
        { model: CertificateTemplate, as: 'template' }
      ]
    });
  }

  /**
   * Busca certificados de un usuario
   */
  static async findByUserId(userId: number, includeExpired: boolean = false): Promise<Certificate[]> {
    const where: any = { userId };
    if (!includeExpired) {
      where.status = CertificateStatus.ACTIVE;
      where[require('sequelize').Op.or] = [
        { expiresAt: null },
        { expiresAt: { [require('sequelize').Op.gt]: new Date() } }
      ];
    }

    return this.findAll({
      where,
      include: [
        { model: Event, as: 'event' },
        { model: CertificateTemplate, as: 'template' }
      ],
      order: [['issuedAt', 'DESC']]
    });
  }

  /**
   * Busca certificados de un evento
   */
  static async findByEventId(eventId: number): Promise<Certificate[]> {
    return this.findAll({
      where: { eventId },
      include: [
        { model: User, as: 'participant' },
        { model: CertificateTemplate, as: 'template' }
      ],
      order: [['issuedAt', 'DESC']]
    });
  }

  /**
   * Busca certificados expirados
   */
  static async findExpiredCertificates(): Promise<Certificate[]> {
    return this.findAll({
      where: {
        expiresAt: { [require('sequelize').Op.lt]: new Date() },
        status: CertificateStatus.ACTIVE
      }
    });
  }

  /**
   * Marca certificados expirados
   */
  static async markExpiredCertificates(): Promise<number> {
    const [affectedRows] = await this.update(
      { status: CertificateStatus.EXPIRED },
      {
        where: {
          expiresAt: { [require('sequelize').Op.lt]: new Date() },
          status: CertificateStatus.ACTIVE
        }
      }
    );
    return affectedRows;
  }

  /**
   * Obtiene estadísticas de certificados
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    revoked: number;
    expired: number;
    byType: Record<CertificateType, number>;
    thisMonth: number;
    blockchainVerified: number;
  }> {
    const certificates = await this.findAll({
      attributes: ['status', 'certificateType', 'blockchainTxHash', 'issuedAt']
    });

    const stats = {
      total: certificates.length,
      active: 0,
      revoked: 0,
      expired: 0,
      byType: {} as Record<CertificateType, number>,
      thisMonth: 0,
      blockchainVerified: 0
    };

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    certificates.forEach(cert => {
      // Conteo por estado
      switch (cert.status) {
        case CertificateStatus.ACTIVE:
          stats.active++;
          break;
        case CertificateStatus.REVOKED:
          stats.revoked++;
          break;
        case CertificateStatus.EXPIRED:
          stats.expired++;
          break;
      }

      // Conteo por tipo
      stats.byType[cert.certificateType] = (stats.byType[cert.certificateType] || 0) + 1;

      // Conteo este mes
      if (cert.issuedAt >= thisMonth) {
        stats.thisMonth++;
      }

      // Conteo verificados en blockchain
      if (cert.blockchainTxHash) {
        stats.blockchainVerified++;
      }
    });

    return stats;
  }

  /**
   * Valida formato de número de certificado
   */
  static validateCertificateNumberFormat(certificateNumber: string): boolean {
    return /^CERT-\d{4}-\d{6}$/.test(certificateNumber);
  }
}