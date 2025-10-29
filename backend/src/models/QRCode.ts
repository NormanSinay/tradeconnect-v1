/**
 * @fileoverview Modelo de Código QR para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Código QR con validaciones y métodos
 *
 * Archivo: backend/src/models/QRCode.ts
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
  Unique,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  ForeignKey
} from 'sequelize-typescript';
import { EventRegistration } from './EventRegistration';
import { Attendance } from './Attendance';
import { AccessLog } from './AccessLog';
import { QrSyncLog } from './QrSyncLog';
import { User } from './User';

/**
 * Estados posibles de un código QR
 */
export enum QRStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  INVALIDATED = 'invalidated'
}

/**
 * Atributos del modelo QRCode
 */
export interface QRCodeAttributes {
  id?: number;
  eventRegistrationId: number;
  qrData: any; // JSON con datos encriptados
  qrHash: string;
  status: QRStatus;
  generatedAt: Date;
  expiresAt?: Date;
  usedAt?: Date;
  invalidatedAt?: Date;
  blockchainTxHash?: string;
  invalidationReason?: string;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de QR
 */
export interface QRCodeCreationAttributes extends Omit<QRCodeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     QRCode:
 *       type: object
 *       required:
 *         - eventRegistrationId
 *         - qrData
 *         - qrHash
 *         - status
 *         - generatedAt
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del código QR
 *           example: 1
 *         eventRegistrationId:
 *           type: integer
 *           description: ID de la inscripción del evento
 *           example: 123
 *         qrData:
 *           type: object
 *           description: Datos encriptados del QR
 *         qrHash:
 *           type: string
 *           description: Hash SHA-256 del contenido del QR
 *           example: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
 *         status:
 *           type: string
 *           enum: [active, used, expired, invalidated]
 *           description: Estado del código QR
 *           example: "active"
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de generación del QR
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del QR
 *         usedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se usó el QR
 *         invalidatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de invalidación del QR
 *         blockchainTxHash:
 *           type: string
 *           description: Hash de transacción de blockchain
 *         invalidationReason:
 *           type: string
 *           description: Razón de invalidación del QR
 *         createdBy:
 *           type: integer
 *           description: Usuario que generó el QR
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
  tableName: 'qr_codes',
  modelName: 'QRCode',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['qr_hash'],
      where: { deleted_at: null }
    },
    {
      fields: ['event_registration_id', 'status'],
      where: { deleted_at: null }
    },
    {
      fields: ['status']
    },
    {
      fields: ['generated_at']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['created_by']
    }
  ]
})
export class QRCode extends Model<QRCodeAttributes, QRCodeCreationAttributes> implements QRCodeAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => EventRegistration)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia a la inscripción del evento'
  })
  declare eventRegistrationId: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'Los datos del QR son requeridos'
    }
  })
  @Column({
    type: DataType.JSON,
    comment: 'Datos encriptados del QR (registrationId, eventId, participantId, hash, timestamp)'
  })
  declare qrData: any;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    isLength: {
      args: [64, 64],
      msg: 'El hash del QR debe tener exactamente 64 caracteres (SHA-256)'
    },
    is: {
      args: /^[a-f0-9]+$/i,
      msg: 'El hash del QR debe contener solo caracteres hexadecimales'
    },
    notEmpty: {
      msg: 'El hash del QR es requerido'
    }
  })
  @Column({
    type: DataType.STRING(64),
    comment: 'Hash SHA-256 del contenido del QR para verificación'
  })
  declare qrHash: string;

  @AllowNull(false)
  @Default(QRStatus.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(QRStatus)),
    comment: 'Estado del código QR'
  })
  declare status: QRStatus;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    comment: 'Fecha de generación del QR'
  })
  declare generatedAt: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del QR'
  })
  declare expiresAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se usó el QR'
  })
  declare usedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de invalidación del QR'
  })
  declare invalidatedAt?: Date;

  @Validate({
    is: {
      args: /^0x[a-fA-F0-9]{64}$/,
      msg: 'El hash de transacción debe tener formato válido de Ethereum'
    }
  })
  @Column({
    type: DataType.STRING(66),
    comment: 'Hash de transacción de blockchain donde se registró el QR'
  })
  declare blockchainTxHash?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Razón de invalidación del QR'
  })
  declare invalidationReason?: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que generó el QR'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el QR'
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

  @BelongsTo(() => EventRegistration, {
    foreignKey: 'eventRegistrationId',
    as: 'eventRegistration'
  })
  declare eventRegistration: EventRegistration;

  @BelongsTo(() => User, {
    foreignKey: 'createdBy',
    as: 'creator'
  })
  declare creator: User;

  @BelongsTo(() => User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  })
  declare updater?: User;

  @HasMany(() => Attendance, {
    foreignKey: 'qrCodeId',
    as: 'attendances'
  })
  declare attendances: Attendance[];

  @HasMany(() => AccessLog, {
    foreignKey: 'qrCodeId',
    as: 'accessLogs'
  })
  declare accessLogs: AccessLog[];

  @HasMany(() => QrSyncLog, {
    foreignKey: 'qrCodeId',
    as: 'syncLogs'
  })
  declare syncLogs: QrSyncLog[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el QR está activo y válido
   */
  public get isValid(): boolean {
    return this.status === QRStatus.ACTIVE &&
           (!this.expiresAt || new Date() < this.expiresAt) &&
           !this.deletedAt;
  }

  /**
   * Verifica si el QR ha expirado
   */
  public get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  /**
   * Marca el QR como usado
   */
  public async markAsUsed(): Promise<void> {
    this.status = QRStatus.USED;
    this.usedAt = new Date();
    await this.save();
  }

  /**
   * Invalida el QR
   */
  public async invalidate(reason?: string): Promise<void> {
    this.status = QRStatus.INVALIDATED;
    this.invalidatedAt = new Date();
    if (reason) {
      this.invalidationReason = reason;
    }
    await this.save();
  }

  /**
   * Serializa el QR para respuestas de API (excluye datos sensibles)
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventRegistrationId: this.eventRegistrationId,
      qrHash: this.qrHash,
      status: this.status,
      generatedAt: this.generatedAt,
      expiresAt: this.expiresAt,
      usedAt: this.usedAt,
      invalidatedAt: this.invalidatedAt,
      blockchainTxHash: this.blockchainTxHash,
      invalidationReason: this.invalidationReason,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa el QR para respuestas completas (incluye relaciones)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      eventRegistration: this.eventRegistration ? {
        id: this.eventRegistration.id,
        eventId: this.eventRegistration.eventId,
        userId: this.eventRegistration.userId,
        status: this.eventRegistration.status,
        registeredAt: this.eventRegistration.registeredAt
      } : null,
      creator: this.creator?.toPublicJSON(),
      attendancesCount: this.attendances?.length || 0
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca QR por hash
   */
  static async findByHash(hash: string, includeDeleted: boolean = false): Promise<QRCode | null> {
    const options: any = {
      where: { qrHash: hash }
    };

    if (includeDeleted) {
      options.paranoid = false;
    }

    return this.findOne(options);
  }

  /**
   * Busca QRs activos por evento
   */
  static async findActiveByEvent(eventId: number): Promise<QRCode[]> {
    return this.findAll({
      where: {
        status: QRStatus.ACTIVE
      },
      include: [
        {
          model: EventRegistration,
          as: 'eventRegistration',
          where: { eventId },
          required: true
        }
      ]
    });
  }

  /**
   * Busca QRs por inscripción
   */
  static async findByRegistration(registrationId: number): Promise<QRCode[]> {
    return this.findAll({
      where: { eventRegistrationId: registrationId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Cuenta QRs por estado
   */
  static async countByStatus(eventId?: number): Promise<Record<QRStatus, number>> {
    const where: any = {};
    if (eventId) {
      const { EventRegistration } = await import('./EventRegistration');
      const registrations = await EventRegistration.findAll({
        where: { eventId },
        attributes: ['id']
      });
      where.eventRegistrationId = {
        [require('sequelize').Op.in]: registrations.map((r: any) => r.id)
      };
    }

    const counts = await this.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result: Record<QRStatus, number> = {
      [QRStatus.ACTIVE]: 0,
      [QRStatus.USED]: 0,
      [QRStatus.EXPIRED]: 0,
      [QRStatus.INVALIDATED]: 0
    };

    counts.forEach((count: any) => {
      result[count.status as QRStatus] = parseInt(count.count);
    });

    return result;
  }

  /**
   * Valida formato de hash SHA-256
   */
  static validateHashFormat(hash: string): boolean {
    return /^[a-f0-9]{64}$/i.test(hash);
  }

  /**
   * Genera hash único para QR (combinación de datos)
   */
  static generateQRHash(data: any): string {
    const crypto = require('crypto');
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
}
