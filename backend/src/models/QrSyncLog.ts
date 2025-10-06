/**
 * @fileoverview Modelo de Log de Sincronización QR para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Log de Sincronización QR con validaciones y métodos
 *
 * Archivo: backend/src/models/QrSyncLog.ts
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
import { QRCode } from './QRCode';
import { User } from './User';

/**
 * Estados de sincronización
 */
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict'
}

/**
 * Resoluciones de conflicto
 */
export enum ConflictResolution {
  OFFLINE_WINS = 'offline_wins',
  ONLINE_WINS = 'online_wins',
  MANUAL_MERGE = 'manual_merge',
  DISCARDED = 'discarded'
}

/**
 * Prioridades de sincronización
 */
export enum SyncPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Atributos del modelo QrSyncLog
 */
export interface QrSyncLogAttributes {
  id?: number;
  qrCodeId: number;
  syncStatus: SyncStatus;
  blockchainTxHash?: string;
  syncedAt?: Date;
  syncAttemptCount: number;
  lastSyncError?: string;
  conflictResolution?: ConflictResolution;
  offlineData?: any;
  onlineData?: any;
  resolvedData?: any;
  deviceId?: string;
  deviceInfo?: any;
  batchId?: string;
  priority: SyncPriority;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de log de sincronización QR
 */
export interface QrSyncLogCreationAttributes extends Omit<QrSyncLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     QrSyncLog:
 *       type: object
 *       required:
 *         - qrCodeId
 *         - syncStatus
 *         - syncAttemptCount
 *         - priority
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del log de sincronización
 *           example: 1
 *         qrCodeId:
 *           type: integer
 *           description: ID del código QR sincronizado
 *           example: 123
 *         syncStatus:
 *           type: string
 *           enum: [pending, in_progress, completed, failed, conflict]
 *           description: Estado de la sincronización
 *           example: "completed"
 *         blockchainTxHash:
 *           type: string
 *           description: Hash de transacción de blockchain resultante
 *           example: "0x1234567890abcdef..."
 *         syncedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha cuando se completó la sincronización
 *         syncAttemptCount:
 *           type: integer
 *           description: Número de intentos de sincronización realizados
 *           default: 0
 *           example: 1
 *         lastSyncError:
 *           type: string
 *           description: Último error de sincronización (si aplica)
 *         conflictResolution:
 *           type: string
 *           enum: [offline_wins, online_wins, manual_merge, discarded]
 *           description: Cómo se resolvió el conflicto (si hubo)
 *         offlineData:
 *           type: object
 *           description: Datos registrados en modo offline
 *         onlineData:
 *           type: object
 *           description: Datos existentes en el servidor online
 *         resolvedData:
 *           type: object
 *           description: Datos finales después de resolución de conflicto
 *         deviceId:
 *           type: string
 *           description: Identificador único del dispositivo
 *           example: "device-uuid-123"
 *         deviceInfo:
 *           type: object
 *           description: Información del dispositivo (tipo, OS, versión app)
 *         batchId:
 *           type: string
 *           description: ID del lote de sincronización
 *           example: "batch-2024-01-01-001"
 *         priority:
 *           type: string
 *           enum: [low, normal, high, critical]
 *           description: Prioridad de sincronización
 *           default: "normal"
 *         createdBy:
 *           type: integer
 *           description: Usuario que inició la sincronización
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
  tableName: 'qr_sync_logs',
  modelName: 'QrSyncLog',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['qr_code_id']
    },
    {
      fields: ['sync_status']
    },
    {
      fields: ['synced_at']
    },
    {
      fields: ['device_id']
    },
    {
      fields: ['batch_id']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['qr_code_id', 'sync_status']
    },
    {
      fields: ['device_id', 'synced_at']
    },
    {
      fields: ['batch_id', 'sync_status']
    }
  ]
})
export class QrSyncLog extends Model<QrSyncLogAttributes, QrSyncLogCreationAttributes> implements QrSyncLogAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => QRCode)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al código QR sincronizado'
  })
  declare qrCodeId: number;

  @AllowNull(false)
  @Default(SyncStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(SyncStatus)),
    comment: 'Estado de la sincronización'
  })
  declare syncStatus: SyncStatus;

  @Validate({
    is: {
      args: /^0x[a-fA-F0-9]{64}$/,
      msg: 'El hash de transacción debe tener formato válido de Ethereum'
    }
  })
  @Column({
    type: DataType.STRING(66),
    comment: 'Hash de transacción de blockchain resultante de la sincronización'
  })
  declare blockchainTxHash?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se completó la sincronización'
  })
  declare syncedAt?: Date;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de intentos de sincronización realizados'
  })
  declare syncAttemptCount: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Último error de sincronización (si aplica)'
  })
  declare lastSyncError?: string;

  @Column({
    type: DataType.ENUM(...Object.values(ConflictResolution)),
    comment: 'Cómo se resolvió el conflicto (si hubo)'
  })
  declare conflictResolution?: ConflictResolution;

  @Column({
    type: DataType.JSON,
    comment: 'Datos registrados en modo offline'
  })
  declare offlineData?: any;

  @Column({
    type: DataType.JSON,
    comment: 'Datos existentes en el servidor online'
  })
  declare onlineData?: any;

  @Column({
    type: DataType.JSON,
    comment: 'Datos finales después de resolución de conflicto'
  })
  declare resolvedData?: any;

  @Column({
    type: DataType.STRING(255),
    comment: 'Identificador único del dispositivo que realizó la sincronización'
  })
  declare deviceId?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Información del dispositivo (tipo, OS, versión app)'
  })
  declare deviceInfo?: any;

  @Column({
    type: DataType.STRING(50),
    comment: 'ID del lote de sincronización (para agrupar registros relacionados)'
  })
  declare batchId?: string;

  @AllowNull(false)
  @Default(SyncPriority.NORMAL)
  @Column({
    type: DataType.ENUM(...Object.values(SyncPriority)),
    comment: 'Prioridad de sincronización'
  })
  declare priority: SyncPriority;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que inició la sincronización'
  })
  declare createdBy?: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que actualizó el registro de sincronización'
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

  @BelongsTo(() => QRCode, {
    foreignKey: 'qrCodeId',
    as: 'qrCode'
  })
  declare qrCode: QRCode;

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

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la sincronización está pendiente
   */
  public get isPending(): boolean {
    return this.syncStatus === SyncStatus.PENDING;
  }

  /**
   * Verifica si la sincronización está en progreso
   */
  public get isInProgress(): boolean {
    return this.syncStatus === SyncStatus.IN_PROGRESS;
  }

  /**
   * Verifica si la sincronización fue exitosa
   */
  public get isCompleted(): boolean {
    return this.syncStatus === SyncStatus.COMPLETED;
  }

  /**
   * Verifica si la sincronización falló
   */
  public get isFailed(): boolean {
    return this.syncStatus === SyncStatus.FAILED;
  }

  /**
   * Verifica si hay un conflicto en la sincronización
   */
  public get hasConflict(): boolean {
    return this.syncStatus === SyncStatus.CONFLICT;
  }

  /**
   * Incrementa el contador de intentos
   */
  public incrementAttemptCount(): void {
    this.syncAttemptCount++;
  }

  /**
   * Marca la sincronización como completada
   */
  public async markAsCompleted(txHash?: string): Promise<void> {
    this.syncStatus = SyncStatus.COMPLETED;
    this.syncedAt = new Date();
    if (txHash) {
      this.blockchainTxHash = txHash;
    }
    this.lastSyncError = undefined;
    await this.save();
  }

  /**
   * Marca la sincronización como fallida
   */
  public async markAsFailed(error: string): Promise<void> {
    this.syncStatus = SyncStatus.FAILED;
    this.lastSyncError = error;
    this.incrementAttemptCount();
    await this.save();
  }

  /**
   * Marca la sincronización como conflicto
   */
  public async markAsConflict(offlineData: any, onlineData: any): Promise<void> {
    this.syncStatus = SyncStatus.CONFLICT;
    this.offlineData = offlineData;
    this.onlineData = onlineData;
    await this.save();
  }

  /**
   * Resuelve el conflicto
   */
  public async resolveConflict(resolution: ConflictResolution, resolvedData?: any): Promise<void> {
    this.conflictResolution = resolution;
    this.resolvedData = resolvedData;
    this.syncStatus = SyncStatus.COMPLETED;
    this.syncedAt = new Date();
    await this.save();
  }

  /**
   * Serializa el log para respuestas de API
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      qrCodeId: this.qrCodeId,
      syncStatus: this.syncStatus,
      blockchainTxHash: this.blockchainTxHash,
      syncedAt: this.syncedAt,
      syncAttemptCount: this.syncAttemptCount,
      lastSyncError: this.lastSyncError,
      conflictResolution: this.conflictResolution,
      deviceId: this.deviceId,
      batchId: this.batchId,
      priority: this.priority,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa el log con datos detallados (para debugging)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      offlineData: this.offlineData,
      onlineData: this.onlineData,
      resolvedData: this.resolvedData,
      deviceInfo: this.deviceInfo,
      qrCode: this.qrCode?.toPublicJSON(),
      creator: this.creator?.toPublicJSON()
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea un nuevo log de sincronización
   */
  static async createSyncLog(data: {
    qrCodeId: number;
    deviceId?: string;
    deviceInfo?: any;
    batchId?: string;
    priority?: SyncPriority;
    createdBy?: number;
  }): Promise<QrSyncLog> {
    return this.create({
      ...data,
      syncStatus: SyncStatus.PENDING,
      syncAttemptCount: 0,
      priority: data.priority || SyncPriority.NORMAL
    });
  }

  /**
   * Busca logs pendientes de sincronización
   */
  static async findPendingSyncs(limit: number = 100): Promise<QrSyncLog[]> {
    return this.findAll({
      where: {
        syncStatus: [SyncStatus.PENDING, SyncStatus.FAILED]
      },
      include: [
        {
          model: QRCode,
          as: 'qrCode',
          where: { status: require('./QRCode').QRStatus.ACTIVE }
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ],
      limit
    });
  }

  /**
   * Busca logs por dispositivo
   */
  static async findByDevice(deviceId: string, limit: number = 50): Promise<QrSyncLog[]> {
    return this.findAll({
      where: { deviceId },
      include: [
        {
          model: QRCode,
          as: 'qrCode'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Busca logs por lote
   */
  static async findByBatch(batchId: string): Promise<QrSyncLog[]> {
    return this.findAll({
      where: { batchId },
      include: [
        {
          model: QRCode,
          as: 'qrCode'
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas de sincronización
   */
  static async getSyncStats(timeWindowHours: number = 24): Promise<{
    totalSyncs: number;
    completedSyncs: number;
    failedSyncs: number;
    pendingSyncs: number;
    conflictSyncs: number;
    averageAttempts: number;
    successRate: number;
  }> {
    const startTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    const logs = await this.findAll({
      where: {
        createdAt: { [require('sequelize').Op.gte]: startTime }
      },
      attributes: ['syncStatus', 'syncAttemptCount']
    });

    const stats = {
      totalSyncs: logs.length,
      completedSyncs: 0,
      failedSyncs: 0,
      pendingSyncs: 0,
      conflictSyncs: 0,
      totalAttempts: 0,
      successRate: 0
    };

    logs.forEach(log => {
      stats.totalAttempts += log.syncAttemptCount;

      switch (log.syncStatus) {
        case SyncStatus.COMPLETED:
          stats.completedSyncs++;
          break;
        case SyncStatus.FAILED:
          stats.failedSyncs++;
          break;
        case SyncStatus.PENDING:
          stats.pendingSyncs++;
          break;
        case SyncStatus.CONFLICT:
          stats.conflictSyncs++;
          break;
      }
    });

    stats.successRate = stats.totalSyncs > 0 ?
      (stats.completedSyncs / stats.totalSyncs) * 100 : 0;

    return {
      ...stats,
      averageAttempts: stats.totalSyncs > 0 ? stats.totalAttempts / stats.totalSyncs : 0
    };
  }

  /**
   * Limpia logs antiguos completados
   */
  static async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.destroy({
      where: {
        syncStatus: SyncStatus.COMPLETED,
        syncedAt: { [require('sequelize').Op.lt]: cutoffDate }
      }
    });

    return result;
  }
}