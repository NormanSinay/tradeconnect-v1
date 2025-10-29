/**
 * @fileoverview Modelo de Notificación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Notificación con validaciones y métodos
 *
 * Archivo: backend/src/models/Notification.ts
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
  ForeignKey,
  AllowNull,
  Default
} from 'sequelize-typescript';
import { User } from './User';
import { NotificationLog } from './NotificationLog';
import {
  NotificationAttributes,
  NotificationCreationAttributes,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  NotificationChannel
} from '../types/notification.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - channel
 *         - message
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la notificación
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario destinatario
 *           example: 1
 *         type:
 *           type: string
 *           enum: [EMAIL, POPUP, SMS, WHATSAPP]
 *           description: Tipo de notificación
 *           example: "EMAIL"
 *         channel:
 *           type: string
 *           enum: [EMAIL, POPUP, SMS, WHATSAPP]
 *           description: Canal de envío
 *           example: "EMAIL"
 *         status:
 *           type: string
 *           enum: [PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED]
 *           description: Estado de la notificación
 *           example: "SENT"
 *         priority:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, CRITICAL]
 *           description: Prioridad de la notificación
 *           example: "NORMAL"
 *         subject:
 *           type: string
 *           description: Asunto (para emails)
 *           example: "Confirmación de registro"
 *         message:
 *           type: string
 *           description: Contenido del mensaje
 *           example: "Tu registro ha sido confirmado exitosamente"
 *         data:
 *           type: object
 *           description: Datos adicionales en formato JSON
 *         templateId:
 *           type: integer
 *           description: ID de la plantilla utilizada
 *         templateCode:
 *           type: string
 *           description: Código de la plantilla utilizada
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Fecha programada para envío
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de envío
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de entrega
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de lectura
 *         failedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de fallo
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos
 *           default: 0
 *         maxRetries:
 *           type: integer
 *           description: Máximo número de reintentos
 *           default: 3
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si falló
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
  tableName: 'notifications',
  modelName: 'Notification',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
      name: 'idx_notifications_user_id'
    },
    {
      fields: ['status'],
      name: 'idx_notifications_status'
    },
    {
      fields: ['type'],
      name: 'idx_notifications_type'
    },
    {
      fields: ['channel'],
      name: 'idx_notifications_channel'
    },
    {
      fields: ['priority'],
      name: 'idx_notifications_priority'
    },
    {
      fields: ['scheduled_at'],
      name: 'idx_notifications_scheduled_at'
    },
    {
      fields: ['sent_at'],
      name: 'idx_notifications_sent_at'
    },
    {
      fields: ['created_at'],
      name: 'idx_notifications_created_at'
    },
    {
      fields: ['user_id', 'status'],
      name: 'idx_notifications_user_status'
    },
    {
      fields: ['template_code'],
      name: 'idx_notifications_template_code'
    }
  ]
})
export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario destinatario'
  })
  declare userId: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    comment: 'Tipo de notificación'
  })
  declare type: NotificationType;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationChannel)),
    comment: 'Canal de envío'
  })
  declare channel: NotificationChannel;

  @Default(NotificationStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationStatus)),
    comment: 'Estado de la notificación'
  })
  declare status: NotificationStatus;

  @Default(NotificationPriority.NORMAL)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationPriority)),
    comment: 'Prioridad de la notificación'
  })
  declare priority: NotificationPriority;

  @Column({
    type: DataType.STRING(200),
    comment: 'Asunto (para emails)'
  })
  declare subject?: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'Contenido del mensaje'
  })
  declare message: string;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Datos adicionales en formato JSON'
  })
  declare data: Record<string, any>;

  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la plantilla utilizada'
  })
  declare templateId?: number;

  @Column({
    type: DataType.STRING(100),
    comment: 'Código de la plantilla utilizada'
  })
  declare templateCode?: string;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha programada para envío'
  })
  declare scheduledAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de envío'
  })
  declare sentAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de entrega'
  })
  declare deliveredAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de lectura'
  })
  declare readAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de fallo'
  })
  declare failedAt?: Date;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reintentos realizados'
  })
  declare retryCount: number;

  @Default(3)
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de reintentos permitidos'
  })
  declare maxRetries: number;

  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si la notificación falló'
  })
  declare errorMessage?: string;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales'
  })
  declare metadata?: Record<string, any>;

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

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => NotificationLog)
  declare logs: NotificationLog[];

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Marca la notificación como enviada
   */
  public async markAsSent(): Promise<void> {
    this.status = NotificationStatus.SENT;
    this.sentAt = new Date();
    await this.save();
  }

  /**
   * Marca la notificación como entregada
   */
  public async markAsDelivered(): Promise<void> {
    this.status = NotificationStatus.DELIVERED;
    this.deliveredAt = new Date();
    await this.save();
  }

  /**
   * Marca la notificación como leída
   */
  public async markAsRead(): Promise<void> {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
    await this.save();
  }

  /**
   * Marca la notificación como fallida
   */
  public async markAsFailed(errorMessage?: string): Promise<void> {
    this.status = NotificationStatus.FAILED;
    this.failedAt = new Date();
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }
    await this.save();
  }

  /**
   * Incrementa el contador de reintentos
   */
  public async incrementRetryCount(): Promise<void> {
    this.retryCount += 1;
    await this.save();
  }

  /**
   * Verifica si puede reintentarse
   */
  public canRetry(): boolean {
    return this.retryCount < this.maxRetries;
  }

  /**
   * Obtiene el tiempo de espera para el próximo reintento (backoff exponencial)
   */
  public getNextRetryDelay(): number {
    const baseDelay = 60000; // 1 minuto
    const multiplier = Math.pow(2, this.retryCount);
    return baseDelay * multiplier; // 1min, 2min, 4min, 8min...
  }

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      channel: this.channel,
      status: this.status,
      priority: this.priority,
      subject: this.subject,
      message: this.message,
      data: this.data,
      templateId: this.templateId,
      templateCode: this.templateCode,
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      readAt: this.readAt,
      failedAt: this.failedAt,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      errorMessage: this.errorMessage,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca notificaciones pendientes para envío
   */
  static async findPendingNotifications(limit: number = 100): Promise<Notification[]> {
    return this.findAll({
      where: {
        status: NotificationStatus.PENDING,
        scheduledAt: {
          [require('sequelize').Op.or]: [
            { [require('sequelize').Op.is]: null },
            { [require('sequelize').Op.lte]: new Date() }
          ]
        }
      },
      include: [{
        model: User,
        as: 'user',
        where: { isActive: true },
        required: true
      }],
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ],
      limit
    });
  }

  /**
   * Busca notificaciones fallidas que pueden reintentarse
   */
  static async findFailedNotificationsForRetry(): Promise<Notification[]> {
    const { Op } = require('sequelize');

    return this.findAll({
      where: {
        status: NotificationStatus.FAILED,
        retryCount: {
          [Op.lt]: require('sequelize').col('maxRetries')
        }
      },
      include: [{
        model: User,
        as: 'user',
        where: { isActive: true },
        required: true
      }],
      order: [['updatedAt', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas de notificaciones por usuario
   */
  static async getUserNotificationStats(userId: number): Promise<{
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }> {
    const stats = await this.findAll({
      where: { userId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result = {
      total: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0
    };

    stats.forEach((stat: any) => {
      const count = parseInt(stat.count);
      result.total += count;

      switch (stat.status) {
        case NotificationStatus.SENT:
          result.sent = count;
          break;
        case NotificationStatus.DELIVERED:
          result.delivered = count;
          break;
        case NotificationStatus.READ:
          result.read = count;
          break;
        case NotificationStatus.FAILED:
          result.failed = count;
          break;
      }
    });

    return result;
  }

  /**
   * Limpia notificaciones antiguas (más de 30 días)
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.destroy({
      where: {
        createdAt: {
          [require('sequelize').Op.lt]: cutoffDate
        },
        status: {
          [require('sequelize').Op.in]: [
            NotificationStatus.READ,
            NotificationStatus.DELIVERED,
            NotificationStatus.CANCELLED
          ]
        }
      },
      force: true // Hard delete
    });

    return result;
  }
}
