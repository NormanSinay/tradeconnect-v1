/**
 * @fileoverview Modelo de Documento FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para documentos FEL certificados
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  HasMany,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  Unique
} from 'sequelize-typescript';
import { Invoice } from './Invoice';

/**
 * Estados del documento FEL
 */
export type FelDocumentStatus =
  | 'generated'       // XML generado
  | 'sent'           // Enviado al certificador
  | 'certified'      // Certificado por SAT
  | 'rejected'       // Rechazado por SAT
  | 'cancelled'      // Anulado
  | 'expired';       // Expirado

/**
 * Atributos del modelo Documento FEL
 */
export interface FelDocumentAttributes {
  id?: number;
  uuid: string;
  invoiceId: number;
  status: FelDocumentStatus;
  xmlContent: string;
  certifiedXmlContent?: string;
  authorizationNumber?: string;
  authorizationDate?: Date;
  series: string;
  number: number;
  qrCode?: string;
  certificateHash?: string;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  lastRetryAt?: Date;
  certifiedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de documento FEL
 */
export interface FelDocumentCreationAttributes extends Omit<FelDocumentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     FelDocument:
 *       type: object
 *       required:
 *         - uuid
 *         - invoiceId
 *         - status
 *         - xmlContent
 *         - series
 *         - number
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del documento FEL
 *           example: 1
 *         uuid:
 *           type: string
 *           description: UUID único del documento FEL
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         invoiceId:
 *           type: integer
 *           description: ID de la factura asociada
 *           example: 1
 *         status:
 *           type: string
 *           enum: [generated, sent, certified, rejected, cancelled, expired]
 *           description: Estado del documento FEL
 *           example: "certified"
 *         xmlContent:
 *           type: string
 *           description: Contenido XML original del DTE
 *         certifiedXmlContent:
 *           type: string
 *           description: Contenido XML certificado por SAT
 *         authorizationNumber:
 *           type: string
 *           description: Número de autorización SAT
 *           example: "123456789"
 *         authorizationDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de autorización SAT
 *         series:
 *           type: string
 *           description: Serie del documento
 *           example: "A"
 *         number:
 *           type: integer
 *           description: Número del documento
 *           example: 1
 *         qrCode:
 *           type: string
 *           description: Código QR de verificación SAT
 *         certificateHash:
 *           type: string
 *           description: Hash del certificado para integridad
 *         errorCode:
 *           type: string
 *           description: Código de error si fue rechazado
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error detallado
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos
 *           example: 0
 *         lastRetryAt:
 *           type: string
 *           format: date-time
 *           description: Último reintento
 *         certifiedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de certificación
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

@Table({
  tableName: 'fel_documents',
  modelName: 'FelDocument',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['uuid'],
      where: { deleted_at: null }
    },
    {
      unique: true,
      fields: ['series', 'number'],
      where: { deleted_at: null }
    },
    {
      fields: ['invoice_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['authorization_number']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['certified_at']
    },
    {
      fields: ['expires_at']
    }
  ]
})
export class FelDocument extends Model<FelDocumentAttributes, FelDocumentCreationAttributes> implements FelDocumentAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El UUID es requerido'
    },
    isUUID: {
      args: 4,
      msg: 'El UUID debe tener formato válido'
    }
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    comment: 'UUID único del documento FEL'
  })
  declare uuid: string;

  @ForeignKey(() => Invoice)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la factura asociada'
  })
  declare invoiceId: number;

  @AllowNull(false)
  @Default('generated')
  @Index
  @Validate({
    isIn: {
      args: [['generated', 'sent', 'certified', 'rejected', 'cancelled', 'expired']],
      msg: 'Estado de documento FEL inválido'
    }
  })
  @Column({
    type: DataType.ENUM('generated', 'sent', 'certified', 'rejected', 'cancelled', 'expired'),
    comment: 'Estado actual del documento FEL'
  })
  declare status: FelDocumentStatus;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT('long'),
    comment: 'Contenido XML original del DTE'
  })
  declare xmlContent: string;

  @Column({
    type: DataType.TEXT('long'),
    comment: 'Contenido XML certificado por SAT'
  })
  declare certifiedXmlContent?: string;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El número de autorización no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Número de autorización asignado por SAT'
  })
  declare authorizationNumber?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de autorización por SAT'
  })
  declare authorizationDate?: Date;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La serie es requerida'
    },
    len: {
      args: [1, 10],
      msg: 'La serie debe tener entre 1 y 10 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(10),
    comment: 'Serie del documento FEL'
  })
  declare series: string;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'El número debe ser mayor a 0'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Número secuencial del documento FEL'
  })
  declare number: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Código QR de verificación SAT'
  })
  declare qrCode?: string;

  @Validate({
    len: {
      args: [0, 128],
      msg: 'El hash del certificado no puede exceder 128 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(128),
    comment: 'Hash SHA-256 del certificado para verificación de integridad'
  })
  declare certificateHash?: string;

  @Validate({
    len: {
      args: [0, 20],
      msg: 'El código de error no puede exceder 20 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Código de error retornado por SAT'
  })
  declare errorCode?: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'El mensaje de error no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error detallado del certificador SAT'
  })
  declare errorMessage?: string;

  @AllowNull(false)
  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El contador de reintentos no puede ser negativo'
    },
    max: {
      args: [10],
      msg: 'No se permiten más de 10 reintentos'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reintentos realizados'
  })
  declare retryCount: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último reintento'
  })
  declare lastRetryAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando el documento fue certificado por SAT'
  })
  declare certifiedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del documento FEL'
  })
  declare expiresAt?: Date;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación del registro'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de última actualización'
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

  @BelongsTo(() => Invoice)
  declare invoice: Invoice;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el documento está expirado
   */
  public get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si el documento puede ser certificado
   */
  public get isCertifiable(): boolean {
    return ['generated', 'sent', 'rejected'].includes(this.status) && !this.isExpired;
  }

  /**
   * Calcula el tiempo de procesamiento en segundos
   */
  public get processingTime(): number | null {
    if (!this.certifiedAt || !this.createdAt) return null;
    return Math.floor((this.certifiedAt.getTime() - this.createdAt.getTime()) / 1000);
  }

  /**
   * Incrementa el contador de reintentos
   */
  public async incrementRetryCount(): Promise<void> {
    this.retryCount += 1;
    this.lastRetryAt = new Date();
    await this.save();
  }

  /**
   * Marca el documento como certificado
   */
  public async markAsCertified(authorizationNumber: string, authorizationDate: Date, certifiedXml: string, qrCode: string): Promise<void> {
    this.status = 'certified';
    this.authorizationNumber = authorizationNumber;
    this.authorizationDate = authorizationDate;
    this.certifiedXmlContent = certifiedXml;
    this.qrCode = qrCode;
    this.certifiedAt = new Date();
    await this.save();
  }

  /**
   * Marca el documento como rechazado
   */
  public async markAsRejected(errorCode: string, errorMessage: string): Promise<void> {
    this.status = 'rejected';
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    await this.save();
  }

  /**
   * Serializa el documento FEL para respuestas de API
   */
  public toFelDocumentJSON(): object {
    return {
      id: this.id,
      uuid: this.uuid,
      invoiceId: this.invoiceId,
      status: this.status,
      authorizationNumber: this.authorizationNumber,
      authorizationDate: this.authorizationDate,
      series: this.series,
      number: this.number,
      qrCode: this.qrCode,
      certificateHash: this.certificateHash,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      retryCount: this.retryCount,
      certifiedAt: this.certifiedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca documento FEL por UUID
   */
  static async findByUuid(uuid: string): Promise<FelDocument | null> {
    return this.findOne({
      where: { uuid },
      include: [{ model: Invoice, as: 'invoice' }]
    });
  }

  /**
   * Busca documento FEL por serie y número
   */
  static async findBySeriesAndNumber(series: string, number: number): Promise<FelDocument | null> {
    return this.findOne({
      where: { series, number }
    });
  }

  /**
   * Busca documento FEL por número de autorización
   */
  static async findByAuthorizationNumber(authorizationNumber: string): Promise<FelDocument | null> {
    return this.findOne({
      where: { authorizationNumber }
    });
  }

  /**
   * Obtiene documentos FEL expirados
   */
  static async findExpiredDocuments(): Promise<FelDocument[]> {
    return this.findAll({
      where: {
        status: { [require('sequelize').Op.in]: ['generated', 'sent', 'certified'] },
        expiresAt: {
          [require('sequelize').Op.lt]: new Date()
        }
      }
    });
  }

  /**
   * Obtiene estadísticas de documentos FEL por período
   */
  static async getFelDocumentStats(startDate: Date, endDate: Date) {
    const { Op } = require('sequelize');
    const documents = await this.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    return documents;
  }
}