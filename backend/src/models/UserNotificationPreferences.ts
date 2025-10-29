/**
 * @fileoverview Modelo de Preferencias de Notificaciones de Usuario para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para gestionar las preferencias de notificaciones por usuario
 *
 * Archivo: backend/src/models/UserNotificationPreferences.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  PrimaryKey
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo UserNotificationPreferences
 */
export interface UserNotificationPreferencesAttributes {
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  marketingEmails: boolean;
  transactionalEmails: boolean;
  operationalEmails: boolean;
  promotionalEmails: boolean;
  eventReminders: boolean;
  paymentNotifications: boolean;
  certificateNotifications: boolean;
  systemNotifications: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  timezone: string;
  unsubscribeToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de preferencias
 */
export interface UserNotificationPreferencesCreationAttributes extends Omit<UserNotificationPreferencesAttributes, 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserNotificationPreferences:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: integer
 *           description: ID del usuario
 *           example: 1
 *         emailEnabled:
 *           type: boolean
 *           description: Si el usuario permite notificaciones por email
 *           default: true
 *         smsEnabled:
 *           type: boolean
 *           description: Si el usuario permite notificaciones por SMS
 *           default: false
 *         pushEnabled:
 *           type: boolean
 *           description: Si el usuario permite notificaciones push
 *           default: true
 *         marketingEmails:
 *           type: boolean
 *           description: Si permite emails de marketing
 *           default: true
 *         transactionalEmails:
 *           type: boolean
 *           description: Si permite emails transaccionales (siempre true por defecto)
 *           default: true
 *         operationalEmails:
 *           type: boolean
 *           description: Si permite emails operacionales
 *           default: true
 *         promotionalEmails:
 *           type: boolean
 *           description: Si permite emails promocionales
 *           default: true
 *         eventReminders:
 *           type: boolean
 *           description: Si permite recordatorios de eventos
 *           default: true
 *         paymentNotifications:
 *           type: boolean
 *           description: Si permite notificaciones de pagos
 *           default: true
 *         certificateNotifications:
 *           type: boolean
 *           description: Si permite notificaciones de certificados
 *           default: true
 *         systemNotifications:
 *           type: boolean
 *           description: Si permite notificaciones del sistema
 *           default: true
 *         frequency:
 *           type: string
 *           enum: [immediate, daily, weekly]
 *           description: Frecuencia de notificaciones
 *           default: immediate
 *         quietHoursStart:
 *           type: string
 *           description: Hora de inicio de horas silenciosas (HH:MM)
 *           example: "22:00"
 *         quietHoursEnd:
 *           type: string
 *           description: Hora de fin de horas silenciosas (HH:MM)
 *           example: "08:00"
 *         timezone:
 *           type: string
 *           description: Zona horaria del usuario
 *           default: "America/Guatemala"
 *         unsubscribeToken:
 *           type: string
 *           description: Token único para unsubscribe
 */

@Table({
  tableName: 'user_notification_preferences',
  modelName: 'UserNotificationPreferences',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id'],
      name: 'idx_user_notification_preferences_user_id_unique'
    },
    {
      fields: ['email_enabled'],
      name: 'idx_user_notification_preferences_email_enabled'
    },
    {
      fields: ['marketing_emails'],
      name: 'idx_user_notification_preferences_marketing_emails'
    },
    {
      fields: ['created_at'],
      name: 'idx_user_notification_preferences_created_at'
    }
  ]
})
export class UserNotificationPreferences extends Model<UserNotificationPreferencesAttributes, UserNotificationPreferencesCreationAttributes> implements UserNotificationPreferencesAttributes {

  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario (clave primaria y foránea)'
  })
  declare userId: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el usuario permite notificaciones por email'
  })
  declare emailEnabled: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el usuario permite notificaciones por SMS'
  })
  declare smsEnabled: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el usuario permite notificaciones push'
  })
  declare pushEnabled: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite emails de marketing'
  })
  declare marketingEmails: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite emails transaccionales (siempre true por defecto)'
  })
  declare transactionalEmails: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite emails operacionales'
  })
  declare operationalEmails: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite emails promocionales'
  })
  declare promotionalEmails: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite recordatorios de eventos'
  })
  declare eventReminders: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite notificaciones de pagos'
  })
  declare paymentNotifications: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite notificaciones de certificados'
  })
  declare certificateNotifications: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si permite notificaciones del sistema'
  })
  declare systemNotifications: boolean;

  @Default('immediate')
  @Column({
    type: DataType.ENUM('immediate', 'daily', 'weekly'),
    comment: 'Frecuencia de notificaciones'
  })
  declare frequency: 'immediate' | 'daily' | 'weekly';

  @Column({
    type: DataType.STRING(5),
    comment: 'Hora de inicio de horas silenciosas (HH:MM)'
  })
  declare quietHoursStart?: string;

  @Column({
    type: DataType.STRING(5),
    comment: 'Hora de fin de horas silenciosas (HH:MM)'
  })
  declare quietHoursEnd?: string;

  @Default('America/Guatemala')
  @Column({
    type: DataType.STRING(50),
    comment: 'Zona horaria del usuario'
  })
  declare timezone: string;

  @Column({
    type: DataType.STRING(255),
    comment: 'Token único para unsubscribe de emails'
  })
  declare unsubscribeToken?: string;

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

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el usuario permite un tipo específico de notificación
   */
  public allowsNotification(type: 'email' | 'sms' | 'push'): boolean {
    switch (type) {
      case 'email':
        return this.emailEnabled;
      case 'sms':
        return this.smsEnabled;
      case 'push':
        return this.pushEnabled;
      default:
        return false;
    }
  }

  /**
   * Verifica si el usuario permite un tipo específico de email
   */
  public allowsEmailType(emailType: 'marketing' | 'transactional' | 'operational' | 'promotional'): boolean {
    switch (emailType) {
      case 'marketing':
        return this.marketingEmails;
      case 'transactional':
        return this.transactionalEmails; // Siempre true para transaccionales
      case 'operational':
        return this.operationalEmails;
      case 'promotional':
        return this.promotionalEmails;
      default:
        return false;
    }
  }

  /**
   * Verifica si está dentro de las horas silenciosas
   */
  public isInQuietHours(): boolean {
    if (!this.quietHoursStart || !this.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: this.timezone
    }).substring(0, 5); // HH:MM

    const start = this.quietHoursStart;
    const end = this.quietHoursEnd;

    // Si las horas silenciosas cruzan la medianoche
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }

  /**
   * Genera un token único para unsubscribe
   */
  public generateUnsubscribeToken(): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    this.unsubscribeToken = crypto.createHash('sha256').update(token).digest('hex');
    return token; // Retorna el token plano para enviar por email
  }

  /**
   * Verifica si un token de unsubscribe es válido
   */
  public verifyUnsubscribeToken(token: string): boolean {
    if (!this.unsubscribeToken) return false;
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
    return this.unsubscribeToken === hashedToken;
  }

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      userId: this.userId,
      emailEnabled: this.emailEnabled,
      smsEnabled: this.smsEnabled,
      pushEnabled: this.pushEnabled,
      marketingEmails: this.marketingEmails,
      transactionalEmails: this.transactionalEmails,
      operationalEmails: this.operationalEmails,
      promotionalEmails: this.promotionalEmails,
      eventReminders: this.eventReminders,
      paymentNotifications: this.paymentNotifications,
      certificateNotifications: this.certificateNotifications,
      systemNotifications: this.systemNotifications,
      frequency: this.frequency,
      quietHoursStart: this.quietHoursStart,
      quietHoursEnd: this.quietHoursEnd,
      timezone: this.timezone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Obtiene o crea las preferencias por defecto para un usuario
   */
  static async getOrCreateDefault(userId: number): Promise<UserNotificationPreferences> {
    let preferences = await this.findByPk(userId);

    if (!preferences) {
      preferences = await this.create({
        userId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        marketingEmails: true,
        transactionalEmails: true,
        operationalEmails: true,
        promotionalEmails: true,
        eventReminders: true,
        paymentNotifications: true,
        certificateNotifications: true,
        systemNotifications: true,
        frequency: 'immediate',
        timezone: 'America/Guatemala'
      });
    }

    return preferences;
  }

  /**
   * Busca preferencias por token de unsubscribe
   */
  static async findByUnsubscribeToken(token: string): Promise<UserNotificationPreferences | null> {
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
    return this.findOne({
      where: { unsubscribeToken: hashedToken }
    });
  }
}
