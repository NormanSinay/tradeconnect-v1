/**
 * @fileoverview Modelo de Log de Auditoría FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para auditoría completa de operaciones FEL
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  Index,
  AllowNull,
  Validate,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { Invoice } from './Invoice';
import { FelDocument } from './FelDocument';

/**
 * Tipos de operaciones FEL auditadas
 */
export type FelAuditOperationType =
  | 'authentication'       // Autenticación con certificador
  | 'nit_validation'       // Validación de NIT
  | 'cui_validation'       // Validación de CUI
  | 'invoice_creation'     // Creación de factura
  | 'xml_generation'       // Generación de XML
  | 'certification'        // Certificación de DTE
  | 'pdf_generation'       // Generación de PDF
  | 'email_sending'        // Envío de email
  | 'webhook_received'     // Recepción de webhook
  | 'document_consult'     // Consulta de documento
  | 'document_cancel'      // Anulación de documento
  | 'token_refresh'        // Renovación de token
  | 'error_retry'          // Reintento por error
  | 'manual_intervention'; // Intervención manual

/**
 * Resultado de la operación
 */
export type FelAuditResult =
  | 'success'              // Operación exitosa
  | 'failure'              // Operación fallida
  | 'partial'              // Operación parcialmente exitosa
  | 'timeout'              // Timeout en la operación
  | 'cancelled';           // Operación cancelada

/**
 * Atributos del modelo Log de Auditoría FEL
 */
export interface FelAuditLogAttributes {
  id?: number;
  operationType: FelAuditOperationType;
  result: FelAuditResult;
  userId?: number;
  invoiceId?: number;
  felDocumentId?: number;
  certificadorName?: string;
  operationId?: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  processingTime?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt?: Date;
}

/**
 * Interface para creación de log de auditoría FEL
 */
export interface FelAuditLogCreationAttributes extends Omit<FelAuditLogAttributes, 'id' | 'createdAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     FelAuditLog:
 *       type: object
 *       required:
 *         - operationType
 *         - result
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del log de auditoría
 *           example: 1
 *         operationType:
 *           type: string
 *           enum: [authentication, nit_validation, cui_validation, invoice_creation, xml_generation, certification, pdf_generation, email_sending, webhook_received, document_consult, document_cancel, token_refresh, error_retry, manual_intervention]
 *           description: Tipo de operación auditada
 *           example: "certification"
 *         result:
 *           type: string
 *           enum: [success, failure, partial, timeout, cancelled]
 *           description: Resultado de la operación
 *           example: "success"
 *         userId:
 *           type: integer
 *           description: ID del usuario que realizó la operación
 *           example: 1
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
 *           description: Nombre del certificador utilizado
 *           example: "Infile"
 *         operationId:
 *           type: string
 *           description: ID único de la operación
 *           example: "op_123456789"
 *         requestData:
 *           type: object
 *           description: Datos de la petición
 *         responseData:
 *           type: object
 *           description: Datos de la respuesta
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si falló
 *         processingTime:
 *           type: integer
 *           description: Tiempo de procesamiento en milisegundos
 *           example: 1500
 *         ipAddress:
 *           type: string
 *           description: Dirección IP del cliente
 *           example: "192.168.1.100"
 *         userAgent:
 *           type: string
 *           description: User agent del cliente
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'fel_audit_logs',
  modelName: 'FelAuditLog',
  timestamps: true,
  createdAt: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    {
      fields: ['operation_type']
    },
    {
      fields: ['result']
    },
    {
      fields: ['user_id']
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
      fields: ['operation_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['ip_address']
    }
  ]
})
export class FelAuditLog extends Model<FelAuditLogAttributes, FelAuditLogCreationAttributes> implements FelAuditLogAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['authentication', 'nit_validation', 'cui_validation', 'invoice_creation', 'xml_generation', 'certification', 'pdf_generation', 'email_sending', 'webhook_received', 'document_consult', 'document_cancel', 'token_refresh', 'error_retry', 'manual_intervention']],
      msg: 'Tipo de operación inválido'
    }
  })
  @Column({
    type: DataType.ENUM('authentication', 'nit_validation', 'cui_validation', 'invoice_creation', 'xml_generation', 'certification', 'pdf_generation', 'email_sending', 'webhook_received', 'document_consult', 'document_cancel', 'token_refresh', 'error_retry', 'manual_intervention'),
    comment: 'Tipo de operación FEL que se auditó'
  })
  declare operationType: FelAuditOperationType;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['success', 'failure', 'partial', 'timeout', 'cancelled']],
      msg: 'Resultado inválido'
    }
  })
  @Column({
    type: DataType.ENUM('success', 'failure', 'partial', 'timeout', 'cancelled'),
    comment: 'Resultado de la operación auditada'
  })
  declare result: FelAuditResult;

  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que realizó la operación'
  })
  declare userId?: number;

  @ForeignKey(() => Invoice)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la factura relacionada con la operación'
  })
  declare invoiceId?: number;

  @ForeignKey(() => FelDocument)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del documento FEL relacionado con la operación'
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
    comment: 'Nombre del certificador utilizado en la operación'
  })
  declare certificadorName?: string;

  @Index
  @Validate({
    len: {
      args: [0, 100],
      msg: 'El ID de operación no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID único de la operación para trazabilidad'
  })
  declare operationId?: string;

  @Column({
    type: DataType.JSONB,
    comment: 'Datos de la petición realizada'
  })
  declare requestData?: any;

  @Column({
    type: DataType.JSONB,
    comment: 'Datos de la respuesta obtenida'
  })
  declare responseData?: any;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'El mensaje de error no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si la operación falló'
  })
  declare errorMessage?: string;

  @Validate({
    min: {
      args: [0],
      msg: 'El tiempo de procesamiento no puede ser negativo'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Tiempo de procesamiento en milisegundos'
  })
  declare processingTime?: number;

  @Index
  @Validate({
    isIP: {
      msg: 'La dirección IP debe tener formato válido'
    }
  })
  @Column({
    type: DataType.INET,
    comment: 'Dirección IP del cliente que realizó la operación'
  })
  declare ipAddress?: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'El user agent no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'User agent del cliente'
  })
  declare userAgent?: string;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales de la auditoría'
  })
  declare metadata?: any;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de la operación auditada'
  })
  declare createdAt: Date;

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
   * Verifica si la operación fue exitosa
   */
  public get isSuccessful(): boolean {
    return this.result === 'success';
  }

  /**
   * Verifica si la operación falló
   */
  public get hasFailed(): boolean {
    return ['failure', 'timeout', 'cancelled'].includes(this.result);
  }

  /**
   * Serializa el log de auditoría para respuestas de API
   */
  public toFelAuditLogJSON(): object {
    return {
      id: this.id,
      operationType: this.operationType,
      result: this.result,
      userId: this.userId,
      invoiceId: this.invoiceId,
      felDocumentId: this.felDocumentId,
      certificadorName: this.certificadorName,
      operationId: this.operationId,
      requestData: this.requestData,
      responseData: this.responseData,
      errorMessage: this.errorMessage,
      processingTime: this.processingTime,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      isSuccessful: this.isSuccessful,
      hasFailed: this.hasFailed,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Registra una operación en el log de auditoría
   */
  static async logOperation(data: FelAuditLogCreationAttributes): Promise<FelAuditLog> {
    return this.create(data);
  }

  /**
   * Obtiene logs de auditoría por tipo de operación
   */
  static async getLogsByOperation(operationType: FelAuditOperationType, limit: number = 100): Promise<FelAuditLog[]> {
    return this.findAll({
      where: { operationType },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Obtiene logs de auditoría por factura
   */
  static async getLogsByInvoice(invoiceId: number): Promise<FelAuditLog[]> {
    return this.findAll({
      where: { invoiceId },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene logs de auditoría por documento FEL
   */
  static async getLogsByFelDocument(felDocumentId: number): Promise<FelAuditLog[]> {
    return this.findAll({
      where: { felDocumentId },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas de operaciones por período
   */
  static async getOperationStats(startDate: Date, endDate: Date) {
    const { Op } = require('sequelize');
    const logs = await this.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      attributes: [
        'operationType',
        'result',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('processingTime')), 'avgProcessingTime']
      ],
      group: ['operationType', 'result'],
      raw: true
    });

    return logs;
  }

  /**
   * Obtiene logs de operaciones fallidas
   */
  static async getFailedOperations(limit: number = 50): Promise<FelAuditLog[]> {
    return this.findAll({
      where: {
        result: {
          [require('sequelize').Op.in]: ['failure', 'timeout', 'cancelled']
        }
      },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Busca logs por ID de operación
   */
  static async findByOperationId(operationId: string): Promise<FelAuditLog[]> {
    return this.findAll({
      where: { operationId },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Limpia logs antiguos (más de 5 años)
   */
  static async cleanOldLogs(): Promise<number> {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    return await this.destroy({
      where: {
        createdAt: {
          [require('sequelize').Op.lt]: fiveYearsAgo
        }
      }
    });
  }
}
