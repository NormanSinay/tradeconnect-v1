/**
 * @fileoverview Modelo de Log de Notificación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para logs de auditoría de notificaciones
 *
 * Archivo: backend/src/models/NotificationLog.ts
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
  AllowNull
} from 'sequelize-typescript';
import { Notification } from './Notification';
import { User } from './User';
import {
  NotificationLogAttributes,
  NotificationLogCreationAttributes,
  NotificationStatus
} from '../types/notification.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationLog:
 *       type: object
 *       required:
 *         - notificationId
 *         - action
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del log
 *           example: 1
 *         notificationId:
 *           type: integer
 *           description: ID de la notificación
 *           example: 1
 *         action:
 *           type: string
 *           description: Acción realizada
 *           example: "STATUS_CHANGE"
 *         oldStatus:
 *           type: string
 *           enum: [PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED]
 *           description: Estado anterior
 *         newStatus:
 *           type: string
 *           enum: [PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED]
 *           description: Estado nuevo
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *         ipAddress:
 *           type: string
 *           description: Dirección IP del cliente
 *         userAgent:
 *           type: string
 *           description: User agent del cliente
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del log
 */

@Table({
  tableName: 'notification_logs',
  modelName: 'NotificationLog',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false, // No necesitamos updated_at para logs
  indexes: [
    {
      fields: ['notification_id'],
      name: 'idx_notification_logs_notification_id'
    },
    {
      fields: ['action'],
      name: 'idx_notification_logs_action'
    },
    {
      fields: ['created_at'],
      name: 'idx_notification_logs_created_at'
    },
    {
      fields: ['notification_id', 'created_at'],
      name: 'idx_notification_logs_notification_created'
    }
  ]
})
export class NotificationLog extends Model<NotificationLogAttributes, NotificationLogCreationAttributes> implements NotificationLogAttributes {
  @AllowNull(false)
  @ForeignKey(() => Notification)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la notificación relacionada'
  })
  declare notificationId: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
    comment: 'Acción realizada en la notificación'
  })
  declare action: string;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationStatus)),
    comment: 'Estado anterior de la notificación'
  })
  declare oldStatus?: NotificationStatus;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationStatus)),
    comment: 'Estado nuevo de la notificación'
  })
  declare newStatus?: NotificationStatus;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del evento'
  })
  declare metadata?: Record<string, any>;

  @Column({
    type: DataType.INET,
    comment: 'Dirección IP del cliente que realizó la acción'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User agent del cliente'
  })
  declare userAgent?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora del evento'
  })
  declare createdAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => Notification)
  declare notification: Notification;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      notificationId: this.notificationId,
      action: this.action,
      oldStatus: this.oldStatus,
      newStatus: this.newStatus,
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Registra un cambio de estado
   */
  static async logStatusChange(
    notificationId: number,
    oldStatus: NotificationStatus,
    newStatus: NotificationStatus,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<NotificationLog> {
    return this.create({
      notificationId,
      action: 'STATUS_CHANGE',
      oldStatus,
      newStatus,
      metadata,
      ipAddress,
      userAgent
    });
  }

  /**
   * Registra un envío de notificación
   */
  static async logSendAttempt(
    notificationId: number,
    success: boolean,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<NotificationLog> {
    return this.create({
      notificationId,
      action: success ? 'SEND_SUCCESS' : 'SEND_FAILED',
      metadata,
      ipAddress,
      userAgent
    });
  }

  /**
   * Registra una lectura de notificación
   */
  static async logRead(
    notificationId: number,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<NotificationLog> {
    return this.create({
      notificationId,
      action: 'NOTIFICATION_READ',
      metadata,
      ipAddress,
      userAgent
    });
  }

  /**
   * Registra un reintento
   */
  static async logRetry(
    notificationId: number,
    attemptNumber: number,
    metadata?: Record<string, any>
  ): Promise<NotificationLog> {
    return this.create({
      notificationId,
      action: 'RETRY_ATTEMPT',
      metadata: {
        attemptNumber,
        ...metadata
      }
    });
  }

  /**
   * Obtiene logs de una notificación específica
   */
  static async getNotificationLogs(
    notificationId: number,
    limit: number = 50
  ): Promise<NotificationLog[]> {
    return this.findAll({
      where: { notificationId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Obtiene estadísticas de logs por período
   */
  static async getLogStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalLogs: number;
    actions: Record<string, number>;
    statusChanges: Record<string, number>;
  }> {
    const logs = await this.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'action',
        'oldStatus',
        'newStatus',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['action', 'oldStatus', 'newStatus'],
      raw: true
    });

    const stats = {
      totalLogs: 0,
      actions: {} as Record<string, number>,
      statusChanges: {} as Record<string, number>
    };

    logs.forEach((log: any) => {
      const count = parseInt(log.count);
      stats.totalLogs += count;

      // Contar por acción
      stats.actions[log.action] = (stats.actions[log.action] || 0) + count;

      // Contar cambios de estado
      if (log.oldStatus && log.newStatus) {
        const changeKey = `${log.oldStatus}_TO_${log.newStatus}`;
        stats.statusChanges[changeKey] = (stats.statusChanges[changeKey] || 0) + count;
      }
    });

    return stats;
  }

  /**
   * Registra un evento general del sistema de notificaciones
   */
  static async logSystemEvent(
    action: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<NotificationLog> {
    // Para eventos del sistema sin notificación específica, usamos un ID especial
    return this.create({
      notificationId: -1, // ID especial para eventos del sistema
      action,
      metadata,
      ipAddress,
      userAgent
    });
  }

  /**
   * Limpia logs antiguos (más de 90 días)
   */
  static async cleanupOldLogs(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.destroy({
      where: {
        createdAt: {
          [require('sequelize').Op.lt]: cutoffDate
        }
      },
      force: true // Hard delete para logs
    });

    return result;
  }
}