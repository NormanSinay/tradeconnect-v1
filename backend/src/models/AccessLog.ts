/**
 * @fileoverview Modelo de Log de Acceso para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Log de Acceso con validaciones y métodos
 *
 * Archivo: backend/src/models/AccessLog.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from 'sequelize-typescript';
import { Event } from './Event';
import { User } from './User';
import { QRCode } from './QRCode';

/**
 * Tipos de acceso
 */
export enum AccessType {
  QR_SCAN = 'qr_scan',
  MANUAL_ENTRY = 'manual_entry',
  BACKUP_CODE = 'backup_code',
  FAILED_ATTEMPT = 'failed_attempt',
  API_ACCESS = 'api_access'
}

/**
 * Resultados de intento de acceso
 */
export enum AccessResult {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  DUPLICATE = 'duplicate',
  RATE_LIMITED = 'rate_limited'
}

/**
 * Niveles de severidad
 */
export enum AccessSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Atributos del modelo AccessLog
 */
export interface AccessLogAttributes {
  id?: number;
  eventId: number;
  userId?: number;
  qrCodeId?: number;
  accessType: AccessType;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  location?: any;
  result: AccessResult;
  failureReason?: string;
  scannedBy?: number;
  accessPoint?: string;
  notes?: string;
  metadata?: any;
  severity: AccessSeverity;
  isSuspicious: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de log de acceso
 */
export interface AccessLogCreationAttributes extends Omit<AccessLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     AccessLog:
 *       type: object
 *       required:
 *         - eventId
 *         - accessType
 *         - timestamp
 *         - result
 *         - severity
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del log de acceso
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *           example: 123
 *         userId:
 *           type: integer
 *           description: ID del usuario que intentó acceder (null si no identificado)
 *           example: 456
 *         qrCodeId:
 *           type: integer
 *           description: ID del código QR usado (null para acceso manual)
 *           example: 789
 *         accessType:
 *           type: string
 *           enum: [qr_scan, manual_entry, backup_code, failed_attempt, api_access]
 *           description: Tipo de intento de acceso
 *           example: "qr_scan"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp del intento de acceso
 *         ipAddress:
 *           type: string
 *           description: IP del dispositivo que realizó el intento
 *           example: "192.168.1.100"
 *         userAgent:
 *           type: string
 *           description: User agent del navegador/dispositivo
 *         deviceInfo:
 *           type: object
 *           description: Información del dispositivo (tipo, OS, browser)
 *         location:
 *           type: object
 *           description: Geolocalización aproximada (país, ciudad, región)
 *         result:
 *           type: string
 *           enum: [success, failed, blocked, expired, invalid, duplicate, rate_limited]
 *           description: Resultado del intento de acceso
 *           example: "success"
 *         failureReason:
 *           type: string
 *           description: Razón detallada del fallo (solo para result = failed)
 *         scannedBy:
 *           type: integer
 *           description: Usuario staff que realizó el escaneo/verificación
 *         accessPoint:
 *           type: string
 *           description: Nombre/identificador del punto de acceso
 *           example: "Entrada Principal"
 *         notes:
 *           type: string
 *           description: Notas adicionales del intento de acceso
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales del intento de acceso
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Nivel de severidad del evento
 *           default: "low"
 *         isSuspicious:
 *           type: boolean
 *           description: Indica si el intento parece sospechoso
 *           default: false
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
  tableName: 'access_logs',
  modelName: 'AccessLog',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['qr_code_id']
    },
    {
      fields: ['access_type']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['result']
    },
    {
      fields: ['scanned_by']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['is_suspicious']
    },
    {
      fields: ['event_id', 'timestamp']
    },
    {
      fields: ['event_id', 'result']
    },
    {
      fields: ['user_id', 'timestamp']
    },
    {
      fields: ['event_id', 'is_suspicious']
    }
  ]
})
export class AccessLog extends Model<AccessLogAttributes, AccessLogCreationAttributes> implements AccessLogAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento'
  })
  declare eventId: number;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al usuario que intentó acceder (null si no identificado)'
  })
  declare userId?: number;

  @ForeignKey(() => QRCode)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al código QR usado (null para acceso manual)'
  })
  declare qrCodeId?: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(AccessType)),
    comment: 'Tipo de intento de acceso'
  })
  declare accessType: AccessType;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    comment: 'Timestamp del intento de acceso'
  })
  declare timestamp: Date;

  @Column({
    type: DataType.INET,
    comment: 'IP del dispositivo que realizó el intento'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User agent del navegador/dispositivo'
  })
  declare userAgent?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Información del dispositivo (tipo, OS, browser)'
  })
  declare deviceInfo?: any;

  @Column({
    type: DataType.JSON,
    comment: 'Geolocalización aproximada (país, ciudad, región)'
  })
  declare location?: any;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(AccessResult)),
    comment: 'Resultado del intento de acceso'
  })
  declare result: AccessResult;

  @Column({
    type: DataType.TEXT,
    comment: 'Razón detallada del fallo (solo para result = failed)'
  })
  declare failureReason?: string;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario staff que realizó el escaneo/verificación'
  })
  declare scannedBy?: number;

  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre/identificador del punto de acceso'
  })
  declare accessPoint?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales del intento de acceso'
  })
  declare notes?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del intento de acceso'
  })
  declare metadata?: any;

  @AllowNull(false)
  @Default(AccessSeverity.LOW)
  @Column({
    type: DataType.ENUM(...Object.values(AccessSeverity)),
    comment: 'Nivel de severidad del evento'
  })
  declare severity: AccessSeverity;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el intento parece sospechoso'
  })
  declare isSuspicious: boolean;

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
  declare event: Event;

  @BelongsTo(() => User, {
    foreignKey: 'userId',
    as: 'user'
  })
  declare user?: User;

  @BelongsTo(() => QRCode, {
    foreignKey: 'qrCodeId',
    as: 'qrCode'
  })
  declare qrCode?: QRCode;

  @BelongsTo(() => User, {
    foreignKey: 'scannedBy',
    as: 'scanner'
  })
  declare scanner?: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el log representa un acceso exitoso
   */
  public get isSuccessful(): boolean {
    return this.result === AccessResult.SUCCESS;
  }

  /**
   * Verifica si el log representa un fallo de seguridad
   */
  public get isSecurityFailure(): boolean {
    return [
      AccessResult.FAILED,
      AccessResult.BLOCKED,
      AccessResult.RATE_LIMITED
    ].includes(this.result);
  }

  /**
   * Determina si el evento requiere atención inmediata
   */
  public get requiresAttention(): boolean {
    return this.severity === AccessSeverity.CRITICAL ||
           (this.severity === AccessSeverity.HIGH && this.isSuspicious);
  }

  /**
   * Serializa el log para respuestas de API
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      userId: this.userId,
      qrCodeId: this.qrCodeId,
      accessType: this.accessType,
      timestamp: this.timestamp,
      ipAddress: this.ipAddress,
      result: this.result,
      failureReason: this.failureReason,
      scannedBy: this.scannedBy,
      accessPoint: this.accessPoint,
      notes: this.notes,
      severity: this.severity,
      isSuspicious: this.isSuspicious,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el log con detalles completos (para admin)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      userAgent: this.userAgent,
      deviceInfo: this.deviceInfo,
      location: this.location,
      metadata: this.metadata,
      event: this.event?.toPublicJSON(),
      user: this.user?.toPublicJSON(),
      qrCode: this.qrCode?.toPublicJSON(),
      scanner: this.scanner?.toPublicJSON()
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea un log de acceso exitoso
   */
  static async logSuccessfulAccess(data: {
    eventId: number;
    userId?: number;
    qrCodeId?: number;
    accessType: AccessType;
    scannedBy?: number;
    accessPoint?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: any;
    location?: any;
    metadata?: any;
  }): Promise<AccessLog> {
    return this.create({
      ...data,
      result: AccessResult.SUCCESS,
      severity: AccessSeverity.LOW,
      isSuspicious: false,
      timestamp: new Date()
    });
  }

  /**
   * Crea un log de acceso fallido
   */
  static async logFailedAccess(data: {
    eventId: number;
    userId?: number;
    qrCodeId?: number;
    accessType: AccessType;
    failureReason: string;
    scannedBy?: number;
    accessPoint?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: any;
    location?: any;
    severity?: AccessSeverity;
    isSuspicious?: boolean;
    metadata?: any;
  }): Promise<AccessLog> {
    const severity = data.severity || (data.isSuspicious ? AccessSeverity.MEDIUM : AccessSeverity.LOW);

    return this.create({
      ...data,
      result: AccessResult.FAILED,
      severity,
      isSuspicious: data.isSuspicious || false,
      timestamp: new Date()
    });
  }

  /**
   * Busca logs por evento con filtros
   */
  static async findByEvent(eventId: number, filters: {
    userId?: number;
    accessType?: AccessType;
    result?: AccessResult;
    severity?: AccessSeverity;
    isSuspicious?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<AccessLog[]> {
    const where: any = { eventId };

    if (filters.userId) where.userId = filters.userId;
    if (filters.accessType) where.accessType = filters.accessType;
    if (filters.result) where.result = filters.result;
    if (filters.severity) where.severity = filters.severity;
    if (filters.isSuspicious !== undefined) where.isSuspicious = filters.isSuspicious;

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp[require('sequelize').Op.gte] = filters.startDate;
      if (filters.endDate) where.timestamp[require('sequelize').Op.lte] = filters.endDate;
    }

    return this.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'scanner',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });
  }

  /**
   * Obtiene estadísticas de acceso por evento
   */
  static async getAccessStats(eventId: number, startDate?: Date, endDate?: Date): Promise<{
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    suspiciousAttempts: number;
    attemptsByType: { [key in AccessType]?: number };
    attemptsByResult: { [key in AccessResult]?: number };
  }> {
    const where: any = { eventId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[require('sequelize').Op.gte] = startDate;
      if (endDate) where.timestamp[require('sequelize').Op.lte] = endDate;
    }

    const logs = await this.findAll({
      where,
      attributes: ['accessType', 'result', 'isSuspicious']
    });

    const stats = {
      totalAttempts: logs.length,
      successfulAttempts: 0,
      failedAttempts: 0,
      suspiciousAttempts: 0,
      attemptsByType: {} as { [key in AccessType]?: number },
      attemptsByResult: {} as { [key in AccessResult]?: number }
    };

    logs.forEach(log => {
      // Contar por tipo
      stats.attemptsByType[log.accessType] = (stats.attemptsByType[log.accessType] || 0) + 1;

      // Contar por resultado
      stats.attemptsByResult[log.result] = (stats.attemptsByResult[log.result] || 0) + 1;

      // Contar exitosos/fallidos
      if (log.result === AccessResult.SUCCESS) {
        stats.successfulAttempts++;
      } else {
        stats.failedAttempts++;
      }

      // Contar sospechosos
      if (log.isSuspicious) {
        stats.suspiciousAttempts++;
      }
    });

    return stats;
  }

  /**
   * Detecta patrones sospechosos de acceso
   */
  static async detectSuspiciousPatterns(eventId: number, timeWindowMinutes: number = 60): Promise<{
    repeatedFailures: { ip: string; count: number }[];
    rapidAttempts: { userId: number; attempts: number }[];
    unusualLocations: { ip: string; location: any }[];
  }> {
    const startTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    const logs = await this.findAll({
      where: {
        eventId,
        timestamp: { [require('sequelize').Op.gte]: startTime }
      },
      attributes: ['ipAddress', 'userId', 'result', 'location', 'timestamp']
    });

    const ipFailures: { [ip: string]: number } = {};
    const userAttempts: { [userId: number]: number } = {};
    const ipLocations: { [ip: string]: any } = {};

    logs.forEach(log => {
      if (log.ipAddress) {
        if (log.result !== AccessResult.SUCCESS) {
          ipFailures[log.ipAddress] = (ipFailures[log.ipAddress] || 0) + 1;
        }
        if (log.location) {
          ipLocations[log.ipAddress] = log.location;
        }
      }

      if (log.userId) {
        userAttempts[log.userId] = (userAttempts[log.userId] || 0) + 1;
      }
    });

    return {
      repeatedFailures: Object.entries(ipFailures)
        .filter(([, count]) => count >= 5)
        .map(([ip, count]) => ({ ip, count })),
      rapidAttempts: Object.entries(userAttempts)
        .filter(([, attempts]) => attempts >= 10)
        .map(([userId, attempts]) => ({ userId: parseInt(userId), attempts })),
      unusualLocations: Object.entries(ipLocations)
        .filter(([, location]) => location && location.country !== 'Guatemala')
        .map(([ip, location]) => ({ ip, location }))
    };
  }
}
