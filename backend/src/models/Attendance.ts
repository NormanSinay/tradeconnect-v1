/**
 * @fileoverview Modelo de Asistencia para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Asistencia con validaciones y métodos
 *
 * Archivo: backend/src/models/Attendance.ts
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
  AutoIncrement,
  ForeignKey,
  Unique
} from 'sequelize-typescript';
import { Event } from './Event';
import { User } from './User';
import { QRCode } from './QRCode';
import { AccessLog } from './AccessLog';

/**
 * Métodos de registro de asistencia
 */
export enum AttendanceMethod {
  QR = 'qr',
  MANUAL = 'manual',
  BACKUP = 'backup',
  OFFLINE = 'offline'
}

/**
 * Estados de asistencia
 */
export enum AttendanceStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

/**
 * Atributos del modelo Attendance
 */
export interface AttendanceAttributes {
  id?: number;
  eventId: number;
  userId: number;
  qrCodeId?: number;
  checkInTime: Date;
  checkOutTime?: Date;
  accessPoint?: string;
  scannedBy?: number;
  deviceInfo?: any;
  ipAddress?: string;
  location?: any;
  method: AttendanceMethod;
  status: AttendanceStatus;
  notes?: string;
  isOfflineSync: boolean;
  syncedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de asistencia
 */
export interface AttendanceCreationAttributes extends Omit<AttendanceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - eventId
 *         - userId
 *         - checkInTime
 *         - method
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del registro de asistencia
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *           example: 123
 *         userId:
 *           type: integer
 *           description: ID del participante
 *           example: 456
 *         qrCodeId:
 *           type: integer
 *           description: ID del código QR usado (null para asistencia manual)
 *           example: 789
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: Timestamp de entrada al evento
 *         checkOutTime:
 *           type: string
 *           format: date-time
 *           description: Timestamp de salida del evento
 *         accessPoint:
 *           type: string
 *           description: Nombre/identificador del punto de acceso
 *           example: "Entrada Principal"
 *         scannedBy:
 *           type: integer
 *           description: Usuario staff que realizó el escaneo
 *         deviceInfo:
 *           type: object
 *           description: Información del dispositivo que realizó el escaneo
 *         ipAddress:
 *           type: string
 *           description: IP del dispositivo que realizó el escaneo
 *         location:
 *           type: object
 *           description: Geolocalización del punto de acceso
 *         method:
 *           type: string
 *           enum: [qr, manual, backup, offline]
 *           description: Método de registro de asistencia
 *           example: "qr"
 *         status:
 *           type: string
 *           enum: [checked_in, checked_out, cancelled]
 *           description: Estado de la asistencia
 *           example: "checked_in"
 *         notes:
 *           type: string
 *           description: Notas adicionales sobre la asistencia
 *         isOfflineSync:
 *           type: boolean
 *           description: Indica si el registro fue sincronizado desde modo offline
 *           default: false
 *         syncedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de sincronización offline
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
  tableName: 'attendances',
  modelName: 'Attendance',
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
      fields: ['check_in_time']
    },
    {
      fields: ['scanned_by']
    },
    {
      fields: ['method']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_offline_sync']
    },
    {
      unique: true,
      fields: ['event_id', 'user_id'],
      where: { deleted_at: null }
    },
    {
      fields: ['event_id', 'check_in_time']
    },
    {
      fields: ['event_id', 'status']
    }
  ]
})
export class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
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
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al participante'
  })
  declare userId: number;

  @ForeignKey(() => QRCode)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al código QR usado (null para asistencia manual)'
  })
  declare qrCodeId?: number;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    comment: 'Timestamp de entrada al evento'
  })
  declare checkInTime: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Timestamp de salida del evento (opcional)'
  })
  declare checkOutTime?: Date;

  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre/identificador del punto de acceso'
  })
  declare accessPoint?: string;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario staff que realizó el escaneo'
  })
  declare scannedBy?: number;

  @Column({
    type: DataType.JSON,
    comment: 'Información del dispositivo que realizó el escaneo'
  })
  declare deviceInfo?: any;

  @Column({
    type: DataType.INET,
    comment: 'IP del dispositivo que realizó el escaneo'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Geolocalización del punto de acceso (lat, lng, accuracy)'
  })
  declare location?: any;

  @AllowNull(false)
  @Default(AttendanceMethod.QR)
  @Column({
    type: DataType.ENUM(...Object.values(AttendanceMethod)),
    comment: 'Método de registro de asistencia'
  })
  declare method: AttendanceMethod;

  @AllowNull(false)
  @Default(AttendanceStatus.CHECKED_IN)
  @Column({
    type: DataType.ENUM(...Object.values(AttendanceStatus)),
    comment: 'Estado de la asistencia'
  })
  declare status: AttendanceStatus;

  @Column({
    type: DataType.TEXT,
    comment: 'Notas adicionales sobre la asistencia'
  })
  declare notes?: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el registro fue sincronizado desde modo offline'
  })
  declare isOfflineSync: boolean;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de sincronización offline'
  })
  declare syncedAt?: Date;

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
  declare user: User;

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

  @HasMany(() => AccessLog, {
    foreignKey: 'userId',
    as: 'accessLogs'
  })
  declare accessLogs: AccessLog[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la asistencia está activa
   */
  public get isActive(): boolean {
    return this.status === AttendanceStatus.CHECKED_IN && !this.deletedAt;
  }

  /**
   * Calcula la duración de la asistencia
   */
  public get duration(): number | null {
    if (!this.checkOutTime) return null;
    return this.checkOutTime.getTime() - this.checkInTime.getTime();
  }

  /**
   * Registra la salida del evento
   */
  public async checkOut(accessPoint?: string, notes?: string): Promise<void> {
    this.status = AttendanceStatus.CHECKED_OUT;
    this.checkOutTime = new Date();
    if (accessPoint) {
      this.accessPoint = accessPoint;
    }
    if (notes) {
      this.notes = notes;
    }
    await this.save();
  }

  /**
   * Cancela el registro de asistencia
   */
  public async cancel(reason?: string): Promise<void> {
    this.status = AttendanceStatus.CANCELLED;
    if (reason) {
      this.notes = reason;
    }
    await this.save();
  }

  /**
   * Serializa la asistencia para respuestas de API
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      userId: this.userId,
      qrCodeId: this.qrCodeId,
      checkInTime: this.checkInTime,
      checkOutTime: this.checkOutTime,
      accessPoint: this.accessPoint,
      scannedBy: this.scannedBy,
      method: this.method,
      status: this.status,
      notes: this.notes,
      isOfflineSync: this.isOfflineSync,
      syncedAt: this.syncedAt,
      duration: this.duration,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa la asistencia con detalles completos
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
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
   * Busca asistencia por evento y usuario
   */
  static async findByEventAndUser(eventId: number, userId: number): Promise<Attendance | null> {
    return this.findOne({
      where: { eventId, userId }
    });
  }

  /**
   * Busca asistencias activas por evento
   */
  static async findActiveByEvent(eventId: number): Promise<Attendance[]> {
    return this.findAll({
      where: {
        eventId,
        status: AttendanceStatus.CHECKED_IN
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['checkInTime', 'DESC']]
    });
  }

  /**
   * Cuenta asistencias por evento
   */
  static async countByEvent(eventId: number): Promise<{
    total: number;
    checkedIn: number;
    checkedOut: number;
    cancelled: number;
  }> {
    const attendances = await this.findAll({
      where: { eventId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result = {
      total: 0,
      checkedIn: 0,
      checkedOut: 0,
      cancelled: 0
    };

    attendances.forEach((att: any) => {
      const count = parseInt(att.count);
      result.total += count;

      switch (att.status) {
        case AttendanceStatus.CHECKED_IN:
          result.checkedIn = count;
          break;
        case AttendanceStatus.CHECKED_OUT:
          result.checkedOut = count;
          break;
        case AttendanceStatus.CANCELLED:
          result.cancelled = count;
          break;
      }
    });

    return result;
  }

  /**
   * Obtiene estadísticas de asistencia por período
   */
  static async getAttendanceStats(eventId: number, startDate?: Date, endDate?: Date): Promise<{
    totalAttendees: number;
    averageDuration: number;
    peakHours: { hour: number; count: number }[];
  }> {
    const where: any = { eventId };
    if (startDate || endDate) {
      where.checkInTime = {};
      if (startDate) where.checkInTime[require('sequelize').Op.gte] = startDate;
      if (endDate) where.checkInTime[require('sequelize').Op.lte] = endDate;
    }

    const attendances = await this.findAll({
      where,
      attributes: ['checkInTime', 'checkOutTime']
    });

    const totalAttendees = attendances.length;
    let totalDuration = 0;
    let completedAttendances = 0;
    const hourCounts: { [hour: number]: number } = {};

    attendances.forEach(attendance => {
      // Contar por hora
      const hour = attendance.checkInTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;

      // Calcular duración
      if (attendance.checkOutTime) {
        const duration = attendance.checkOutTime.getTime() - attendance.checkInTime.getTime();
        totalDuration += duration;
        completedAttendances++;
      }
    });

    const averageDuration = completedAttendances > 0 ? totalDuration / completedAttendances : 0;

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAttendees,
      averageDuration,
      peakHours
    };
  }

  /**
   * Verifica si un usuario ya tiene asistencia registrada para un evento
   */
  static async hasAttendance(eventId: number, userId: number): Promise<boolean> {
    const attendance = await this.findOne({
      where: { eventId, userId }
    });
    return !!attendance;
  }
}