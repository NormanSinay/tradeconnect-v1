/**
 * @fileoverview Modelo de Error FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para errores de operaciones FEL
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { Invoice } from './Invoice';
import { FelDocument } from './FelDocument';

/**
 * Tipos de operaciones FEL que pueden fallar
 */
export type FelOperationType =
  | 'authentication'    // Error de autenticación
  | 'xml_generation'    // Error al generar XML
  | 'certification'     // Error al certificar
  | 'pdf_generation'    // Error al generar PDF
  | 'email_sending'     // Error al enviar email
  | 'webhook'          // Error en webhook
  | 'validation';      // Error de validación

/**
 * Severidad del error
 */
export type FelErrorSeverity =
  | 'low'              // Error menor, no bloqueante
  | 'medium'           // Error moderado, requiere atención
  | 'high'             // Error grave, bloquea operación
  | 'critical';        // Error crítico, requiere intervención inmediata

/**
 * Atributos del modelo Error FEL
 */
export interface FelErrorAttributes {
  id?: number;
  operationType: FelOperationType;
  severity: FelErrorSeverity;
  errorCode?: string;
  errorMessage: string;
  stackTrace?: string;
  invoiceId?: number;
  felDocumentId?: number;
  certificadorName?: string;
  requestData?: any;
  responseData?: any;
  retryCount: number;
  maxRetries: number;
  resolved: boolean;
  resolvedAt?: Date;
  resolutionNotes?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de error FEL
 */
export interface FelErrorCreationAttributes extends Omit<FelErrorAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     FelError:
 *       type: object
 *       required:
 *         - operationType
 *         - severity
 *         - errorMessage
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del error
 *           example: 1
 *         operationType:
 *           type: string
 *           enum: [authentication, xml_generation, certification, pdf_generation, email_sending, webhook, validation]
 *           description: Tipo de operación que falló
 *           example: "certification"
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Severidad del error
 *           example: "high"
 *         errorCode:
 *           type: string
 *           description: Código de error del certificador
 *           example: "CERT_001"
 *         errorMessage:
 *           type: string
 *           description: Mensaje descriptivo del error
 *           example: "Error de conexión con el certificador SAT"
 *         stackTrace:
 *           type: string
 *           description: Stack trace completo del error
 *         invoiceId:
 *           type: integer
 *           description: ID de la factura relacionada
 *           example: 1
 *         felDocumentId:
 *           type: integer
 *           description: ID del documento FEL relacionado
 *           example: 1
 *         certificadorName:
 *           type: string
 *           description: Nombre del certificador donde ocurrió el error
 *           example: "Infile"
 *         requestData:
 *           type: object
 *           description: Datos de la petición que causó el error
 *         responseData:
 *           type: object
 *           description: Datos de la respuesta del certificador
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos realizados
 *           example: 0
 *         maxRetries:
 *           type: integer
 *           description: Máximo número de reintentos permitidos
 *           example: 3
 *         resolved:
 *           type: boolean
 *           description: Si el error fue resuelto
 *           example: false
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se resolvió el error
 *         resolutionNotes:
 *           type: string
 *           description: Notas sobre la resolución del error
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
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
  tableName: 'fel_errors',
  modelName: 'FelError',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['operation_type']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['invoice_id']
    },
    {
      fields: ['fel_document_id']
    },
    {
      fields: ['certificador_name']
    },
    {
      fields: ['resolved']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['resolved_at']
    }
  ]
})
export class FelError extends Model<FelErrorAttributes, FelErrorCreationAttributes> implements FelErrorAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['authentication', 'xml_generation', 'certification', 'pdf_generation', 'email_sending', 'webhook', 'validation']],
      msg: 'Tipo de operación inválido'
    }
  })
  @Column({
    type: DataType.ENUM('authentication', 'xml_generation', 'certification', 'pdf_generation', 'email_sending', 'webhook', 'validation'),
    comment: 'Tipo de operación FEL que generó el error'
  })
  declare operationType: FelOperationType;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['low', 'medium', 'high', 'critical']],
      msg: 'Severidad inválida'
    }
  })
  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'critical'),
    comment: 'Severidad del error'
  })
  declare severity: FelErrorSeverity;

  @Validate({
    len: {
      args: [0, 50],
      msg: 'El código de error no puede exceder 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Código de error retornado por el certificador'
  })
  declare errorCode?: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El mensaje de error es requerido'
    },
    len: {
      args: [1, 1000],
      msg: 'El mensaje de error debe tener entre 1 y 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje descriptivo del error'
  })
  declare errorMessage: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Stack trace completo del error para debugging'
  })
  declare stackTrace?: string;

  @ForeignKey(() => Invoice)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la factura relacionada con el error'
  })
  declare invoiceId?: number;

  @ForeignKey(() => FelDocument)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del documento FEL relacionado con el error'
  })
  declare felDocumentId?: number;

  @Index
  @Validate({
    len: {
      args: [0, 100],
      msg: 'El nombre del certificador no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del certificador donde ocurrió el error'
  })
  declare certificadorName?: string;

  @Column({
    type: DataType.JSONB,
    comment: 'Datos de la petición que causó el error'
  })
  declare requestData?: any;

  @Column({
    type: DataType.JSONB,
    comment: 'Datos de la respuesta del certificador'
  })
  declare responseData?: any;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El contador de reintentos no puede ser negativo'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reintentos realizados'
  })
  declare retryCount: number;

  @AllowNull(false)
  @Validate({
    min: {
      args: [0],
      msg: 'El máximo de reintentos debe ser mayor a 0'
    },
    max: {
      args: [10],
      msg: 'El máximo de reintentos no puede exceder 10'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de reintentos permitidos'
  })
  declare maxRetries: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si el error fue resuelto'
  })
  declare resolved: boolean;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando el error fue resuelto'
  })
  declare resolvedAt?: Date;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'Las notas de resolución no pueden exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Notas sobre cómo se resolvió el error'
  })
  declare resolutionNotes?: string;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del error'
  })
  declare metadata?: any;

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

  @BelongsTo(() => FelDocument)
  declare felDocument: FelDocument;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el error puede ser reintentado
   */
  public get canRetry(): boolean {
    return !this.resolved && this.retryCount < this.maxRetries;
  }

  /**
   * Verifica si es un error crítico
   */
  public get isCritical(): boolean {
    return this.severity === 'critical';
  }

  /**
   * Incrementa el contador de reintentos
   */
  public async incrementRetryCount(): Promise<void> {
    this.retryCount += 1;
    await this.save();
  }

  /**
   * Marca el error como resuelto
   */
  public async markAsResolved(notes?: string): Promise<void> {
    this.resolved = true;
    this.resolvedAt = new Date();
    if (notes) {
      this.resolutionNotes = notes;
    }
    await this.save();
  }

  /**
   * Serializa el error FEL para respuestas de API
   */
  public toFelErrorJSON(): object {
    return {
      id: this.id,
      operationType: this.operationType,
      severity: this.severity,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      stackTrace: this.stackTrace,
      invoiceId: this.invoiceId,
      felDocumentId: this.felDocumentId,
      certificadorName: this.certificadorName,
      requestData: this.requestData,
      responseData: this.responseData,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      resolved: this.resolved,
      resolvedAt: this.resolvedAt,
      resolutionNotes: this.resolutionNotes,
      canRetry: this.canRetry,
      isCritical: this.isCritical,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea un nuevo error FEL
   */
  static async createError(data: Omit<FelErrorCreationAttributes, 'retryCount' | 'maxRetries' | 'resolved'> & {
    maxRetries?: number;
  }): Promise<FelError> {
    return this.create({
      ...data,
      retryCount: 0,
      maxRetries: data.maxRetries || 3,
      resolved: false
    });
  }

  /**
   * Obtiene errores no resueltos por severidad
   */
  static async getUnresolvedErrors(severity?: FelErrorSeverity): Promise<FelError[]> {
    const where: any = { resolved: false };
    if (severity) {
      where.severity = severity;
    }

    return this.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Obtiene errores por tipo de operación
   */
  static async getErrorsByOperation(operationType: FelOperationType, resolved?: boolean): Promise<FelError[]> {
    const where: any = { operationType };
    if (resolved !== undefined) {
      where.resolved = resolved;
    }

    return this.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Obtiene estadísticas de errores
   */
  static async getErrorStats(startDate?: Date, endDate?: Date) {
    const { Op } = require('sequelize');
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      };
    }

    const errors = await this.findAll({
      where,
      attributes: [
        'operationType',
        'severity',
        'resolved',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['operationType', 'severity', 'resolved'],
      raw: true
    });

    return errors;
  }

  /**
   * Limpia errores resueltos antiguos (más de 30 días)
   */
  static async cleanResolvedErrors(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.destroy({
      where: {
        resolved: true,
        resolvedAt: {
          [require('sequelize').Op.lt]: thirtyDaysAgo
        }
      }
    });
  }
}
