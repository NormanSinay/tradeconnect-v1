/**
 * @fileoverview Modelo de Factura para TradeConnect FEL
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Factura con integración FEL
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
import { Registration } from './Registration';
import { FelDocument } from './FelDocument';

/**
 * Estados de factura
 */
export type InvoiceStatus =
  | 'draft'           // Borrador
  | 'pending'         // Pendiente de certificación
  | 'certified'       // Certificada por SAT
  | 'sent'            // Enviada al cliente
  | 'cancelled'       // Anulada
  | 'expired';        // Expirada

/**
 * Tipos de documento FEL
 */
export type FelDocumentType =
  | 'FACTURA'         // Factura
  | 'NOTA_CREDITO'    // Nota de crédito
  | 'NOTA_DEBITO';    // Nota de débito

/**
 * Atributos del modelo Factura
 */
export interface InvoiceAttributes {
  id?: number;
  uuid: string;
  registrationId: number;
  felDocumentId?: number;
  status: InvoiceStatus;
  documentType: FelDocumentType;
  series: string;
  number: number;
  authorizationNumber?: string;
  authorizationDate?: Date;
  nit: string;
  name: string;
  address: string;
  email?: string;
  phone?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  description?: string;
  notes?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  qrCode?: string;
  retryCount: number;
  lastRetryAt?: Date;
  errorMessage?: string;
  certifiedAt?: Date;
  sentAt?: Date;
  cancelledAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de factura
 */
export interface InvoiceCreationAttributes extends Omit<InvoiceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       required:
 *         - uuid
 *         - registrationId
 *         - status
 *         - documentType
 *         - series
 *         - number
 *         - nit
 *         - name
 *         - address
 *         - subtotal
 *         - taxRate
 *         - taxAmount
 *         - total
 *         - currency
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la factura
 *           example: 1
 *         uuid:
 *           type: string
 *           description: UUID único de la factura
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         registrationId:
 *           type: integer
 *           description: ID de la inscripción asociada
 *           example: 1
 *         felDocumentId:
 *           type: integer
 *           description: ID del documento FEL asociado
 *           example: 1
 *         status:
 *           type: string
 *           enum: [draft, pending, certified, sent, cancelled, expired]
 *           description: Estado de la factura
 *           example: "certified"
 *         documentType:
 *           type: string
 *           enum: [FACTURA, NOTA_CREDITO, NOTA_DEBITO]
 *           description: Tipo de documento FEL
 *           example: "FACTURA"
 *         series:
 *           type: string
 *           description: Serie de la factura
 *           example: "A"
 *         number:
 *           type: integer
 *           description: Número de la factura
 *           example: 1
 *         authorizationNumber:
 *           type: string
 *           description: Número de autorización SAT
 *           example: "123456789"
 *         authorizationDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de autorización SAT
 *         nit:
 *           type: string
 *           description: NIT del cliente
 *           example: "12345678-9"
 *         name:
 *           type: string
 *           description: Nombre del cliente
 *           example: "Juan Pérez"
 *         address:
 *           type: string
 *           description: Dirección del cliente
 *           example: "Ciudad de Guatemala"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cliente
 *           example: "cliente@email.com"
 *         phone:
 *           type: string
 *           description: Teléfono del cliente
 *           example: "+502 1234-5678"
 *         subtotal:
 *           type: number
 *           description: Subtotal antes de impuestos
 *           example: 87.59
 *         taxRate:
 *           type: number
 *           description: Tasa de IVA
 *           example: 0.12
 *         taxAmount:
 *           type: number
 *           description: Monto de IVA
 *           example: 10.51
 *         total:
 *           type: number
 *           description: Total de la factura
 *           example: 98.10
 *         currency:
 *           type: string
 *           description: Moneda
 *           example: "GTQ"
 *         description:
 *           type: string
 *           description: Descripción de la factura
 *           example: "Inscripción al evento Tech Conference 2024"
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         pdfUrl:
 *           type: string
 *           description: URL del PDF de la factura
 *           example: "/uploads/fel/pdfs/550e8400-e29b-41d4-a716-446655440000.pdf"
 *         xmlUrl:
 *           type: string
 *           description: URL del XML de la factura
 *           example: "/uploads/fel/xml/550e8400-e29b-41d4-a716-446655440000.xml"
 *         qrCode:
 *           type: string
 *           description: Código QR de verificación SAT
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos
 *           example: 0
 *         lastRetryAt:
 *           type: string
 *           format: date-time
 *           description: Último reintento
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si falló
 *         certifiedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de certificación
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de envío
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de anulación
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
  tableName: 'invoices',
  modelName: 'Invoice',
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
      fields: ['registration_id']
    },
    {
      fields: ['fel_document_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['document_type']
    },
    {
      fields: ['nit']
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
export class Invoice extends Model<InvoiceAttributes, InvoiceCreationAttributes> implements InvoiceAttributes {
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
    comment: 'UUID único de la factura'
  })
  declare uuid: string;

  @ForeignKey(() => Registration)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la inscripción asociada'
  })
  declare registrationId: number;

  @ForeignKey(() => FelDocument)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del documento FEL asociado'
  })
  declare felDocumentId?: number;

  @AllowNull(false)
  @Default('draft')
  @Index
  @Validate({
    isIn: {
      args: [['draft', 'pending', 'certified', 'sent', 'cancelled', 'expired']],
      msg: 'Estado de factura inválido'
    }
  })
  @Column({
    type: DataType.ENUM('draft', 'pending', 'certified', 'sent', 'cancelled', 'expired'),
    comment: 'Estado actual de la factura'
  })
  declare status: InvoiceStatus;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO']],
      msg: 'Tipo de documento inválido'
    }
  })
  @Column({
    type: DataType.ENUM('FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO'),
    comment: 'Tipo de documento FEL'
  })
  declare documentType: FelDocumentType;

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
    comment: 'Serie de la factura (ej: A, B, etc.)'
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
    comment: 'Número secuencial de la factura'
  })
  declare number: number;

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

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de autorización por SAT'
  })
  declare authorizationDate?: Date;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El NIT es requerido'
    },
    len: {
      args: [8, 15],
      msg: 'El NIT debe tener entre 8 y 15 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(15),
    comment: 'NIT del cliente'
  })
  declare nit: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre completo del cliente'
  })
  declare name: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La dirección es requerida'
    },
    len: {
      args: [5, 500],
      msg: 'La dirección debe tener entre 5 y 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Dirección completa del cliente'
  })
  declare address: string;

  @Validate({
    isEmail: {
      msg: 'El email debe tener formato válido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email del cliente para envío de factura'
  })
  declare email?: string;

  @Validate({
    len: {
      args: [0, 20],
      msg: 'El teléfono no puede exceder 20 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Teléfono del cliente'
  })
  declare phone?: string;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El subtotal no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(12, 2),
    comment: 'Subtotal antes de impuestos'
  })
  declare subtotal: number;

  @AllowNull(false)
  @Default(0.12)
  @Validate({
    min: {
      args: [0],
      msg: 'La tasa de impuesto no puede ser negativa'
    },
    max: {
      args: [1],
      msg: 'La tasa de impuesto no puede exceder 100%'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 4),
    comment: 'Tasa de IVA (ej: 0.12 para 12%)'
  })
  declare taxRate: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El monto de impuesto no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Monto de IVA calculado'
  })
  declare taxAmount: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El total no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(12, 2),
    comment: 'Total de la factura incluyendo impuestos'
  })
  declare total: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['GTQ', 'USD']],
      msg: 'La moneda debe ser GTQ o USD'
    }
  })
  @Column({
    type: DataType.ENUM('GTQ', 'USD'),
    comment: 'Moneda de la factura'
  })
  declare currency: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'La descripción no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de los productos/servicios'
  })
  declare description?: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Las notas no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales de la factura'
  })
  declare notes?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La URL del PDF no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'URL del archivo PDF generado'
  })
  declare pdfUrl?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La URL del XML no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'URL del archivo XML certificado'
  })
  declare xmlUrl?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Código QR de verificación SAT'
  })
  declare qrCode?: string;

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

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'El mensaje de error no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si la certificación falló'
  })
  declare errorMessage?: string;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando la factura fue certificada por SAT'
  })
  declare certifiedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando la factura fue enviada al cliente'
  })
  declare sentAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando la factura fue anulada'
  })
  declare cancelledAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de la factura'
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

  @BelongsTo(() => Registration)
  declare registration: Registration;

  @BelongsTo(() => FelDocument)
  declare felDocument: FelDocument;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la factura está expirada
   */
  public get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si la factura puede ser anulada
   */
  public get isCancellable(): boolean {
    return this.status === 'certified' &&
           !this.isExpired &&
           !!this.certifiedAt &&
           (new Date().getTime() - this.certifiedAt.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 días
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
   * Marca la factura como certificada
   */
  public async markAsCertified(authorizationNumber: string, authorizationDate: Date): Promise<void> {
    this.status = 'certified';
    this.authorizationNumber = authorizationNumber;
    this.authorizationDate = authorizationDate;
    this.certifiedAt = new Date();
    await this.save();
  }

  /**
   * Marca la factura como enviada
   */
  public async markAsSent(): Promise<void> {
    this.status = 'sent';
    this.sentAt = new Date();
    await this.save();
  }

  /**
   * Serializa la factura para respuestas de API
   */
  public toInvoiceJSON(): object {
    return {
      id: this.id,
      uuid: this.uuid,
      registrationId: this.registrationId,
      felDocumentId: this.felDocumentId,
      status: this.status,
      documentType: this.documentType,
      series: this.series,
      number: this.number,
      authorizationNumber: this.authorizationNumber,
      authorizationDate: this.authorizationDate,
      nit: this.nit,
      name: this.name,
      address: this.address,
      email: this.email,
      phone: this.phone,
      subtotal: this.subtotal,
      taxRate: this.taxRate,
      taxAmount: this.taxAmount,
      total: this.total,
      currency: this.currency,
      description: this.description,
      notes: this.notes,
      pdfUrl: this.pdfUrl,
      xmlUrl: this.xmlUrl,
      qrCode: this.qrCode,
      retryCount: this.retryCount,
      certifiedAt: this.certifiedAt,
      sentAt: this.sentAt,
      cancelledAt: this.cancelledAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca factura por UUID
   */
  static async findByUuid(uuid: string): Promise<Invoice | null> {
    return this.findOne({
      where: { uuid },
      include: [{ model: Registration, as: 'registration' }]
    });
  }

  /**
   * Busca factura por serie y número
   */
  static async findBySeriesAndNumber(series: string, number: number): Promise<Invoice | null> {
    return this.findOne({
      where: { series, number }
    });
  }

  /**
   * Busca factura por número de autorización
   */
  static async findByAuthorizationNumber(authorizationNumber: string): Promise<Invoice | null> {
    return this.findOne({
      where: { authorizationNumber }
    });
  }

  /**
   * Obtiene facturas expiradas
   */
  static async findExpiredInvoices(): Promise<Invoice[]> {
    return this.findAll({
      where: {
        status: 'pending',
        expiresAt: {
          [require('sequelize').Op.lt]: new Date()
        }
      }
    });
  }

  /**
   * Obtiene estadísticas de facturación por período
   */
  static async getInvoiceStats(startDate: Date, endDate: Date) {
    const { Op } = require('sequelize');
    const invoices = await this.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      attributes: [
        'status',
        'documentType',
        'currency',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('total')), 'totalAmount'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('taxAmount')), 'totalTax']
      ],
      group: ['status', 'documentType', 'currency'],
      raw: true
    });

    return invoices;
  }
}