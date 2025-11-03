/**
 * @fileoverview Modelo de Seguimiento de Referidos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para el seguimiento de acciones de referidos
 *
 * Archivo: backend/src/models/ReferralTracking.ts
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
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Referral } from './Referral';

/**
 * Tipos de eventos de seguimiento
 */
export enum ReferralTrackingEvent {
  CODE_VIEWED = 'CODE_VIEWED',
  LINK_CLICKED = 'LINK_CLICKED',
  REGISTRATION_STARTED = 'REGISTRATION_STARTED',
  REGISTRATION_COMPLETED = 'REGISTRATION_COMPLETED',
  PURCHASE_MADE = 'PURCHASE_MADE',
  SUBSCRIPTION_STARTED = 'SUBSCRIPTION_STARTED',
  EVENT_REGISTERED = 'EVENT_REGISTERED',
  EVENT_ATTENDED = 'EVENT_ATTENDED',
  QUALIFICATION_TRIGGERED = 'QUALIFICATION_TRIGGERED',
  REWARD_EARNED = 'REWARD_EARNED',
  CUSTOM_EVENT = 'CUSTOM_EVENT'
}

/**
 * Atributos del modelo Seguimiento de Referidos
 */
export interface ReferralTrackingAttributes {
  id?: number;
  referralId: number;
  event: ReferralTrackingEvent;
  userId?: number; // Usuario que realizó la acción (opcional)
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  eventValue?: number; // Valor asociado al evento (ej. monto de compra)
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de seguimiento de referido
 */
export interface ReferralTrackingCreationAttributes extends Omit<ReferralTrackingAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferralTracking:
 *       type: object
 *       required:
 *         - referralId
 *         - event
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del seguimiento
 *           example: 1
 *         referralId:
 *           type: integer
 *           description: ID del referido
 *           example: 1
 *         event:
 *           type: string
 *           enum: [CODE_VIEWED, LINK_CLICKED, REGISTRATION_STARTED, REGISTRATION_COMPLETED, PURCHASE_MADE, SUBSCRIPTION_STARTED, EVENT_REGISTERED, EVENT_ATTENDED, QUALIFICATION_TRIGGERED, REWARD_EARNED, CUSTOM_EVENT]
 *           description: Tipo de evento de seguimiento
 *           example: "LINK_CLICKED"
 *         userId:
 *           type: integer
 *           description: ID del usuario que realizó la acción
 *           example: 2
 *         ipAddress:
 *           type: string
 *           description: Dirección IP del usuario
 *           example: "192.168.1.1"
 *         userAgent:
 *           type: string
 *           description: User agent del navegador
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales del evento
 *         eventValue:
 *           type: number
 *           description: Valor asociado al evento
 *           example: 150.00
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 */

@Table({
  tableName: 'referral_tracking',
  modelName: 'ReferralTracking',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['referral_id']
    },
    {
      fields: ['event']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['referral_id', 'event']
    },
    {
      fields: ['referral_id', 'created_at']
    }
  ]
})
export class ReferralTracking extends Model<ReferralTrackingAttributes, ReferralTrackingCreationAttributes> implements ReferralTrackingAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Referral)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del referido'
  })
  declare referralId: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(ReferralTrackingEvent)),
    comment: 'Tipo de evento de seguimiento'
  })
  declare event: ReferralTrackingEvent;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que realizó la acción (opcional)'
  })
  declare userId?: number;

  @Column({
    type: DataType.INET,
    comment: 'Dirección IP del usuario'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User agent del navegador/dispositivo'
  })
  declare userAgent?: string;

  @Default({})
  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del evento'
  })
  declare metadata?: Record<string, any>;

  @Validate({
    min: {
      args: [0],
      msg: 'El valor del evento debe ser mayor o igual a 0'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Valor asociado al evento (ej. monto de compra)'
  })
  declare eventValue?: number;

  @CreatedAt
  @Index
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

  @BelongsTo(() => Referral)
  declare referral: Referral;

  @BelongsTo(() => User)
  declare user: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el evento es de conversión
   */
  public get isConversionEvent(): boolean {
    return [
      ReferralTrackingEvent.REGISTRATION_COMPLETED,
      ReferralTrackingEvent.PURCHASE_MADE,
      ReferralTrackingEvent.SUBSCRIPTION_STARTED,
      ReferralTrackingEvent.EVENT_ATTENDED
    ].includes(this.event);
  }

  /**
   * Verifica si el evento es de engagement
   */
  public get isEngagementEvent(): boolean {
    return [
      ReferralTrackingEvent.CODE_VIEWED,
      ReferralTrackingEvent.LINK_CLICKED,
      ReferralTrackingEvent.REGISTRATION_STARTED,
      ReferralTrackingEvent.EVENT_REGISTERED
    ].includes(this.event);
  }

  /**
   * Serializa el seguimiento para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      event: this.event,
      eventValue: this.eventValue,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa el seguimiento para respuestas detalladas (admin)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      referralId: this.referralId,
      userId: this.userId,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      metadata: this.metadata,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Registra un evento de seguimiento
   */
  static async trackEvent(data: ReferralTrackingCreationAttributes): Promise<ReferralTracking> {
    return this.create(data);
  }

  /**
   * Registra visualización de código
   */
  static async trackCodeViewed(referralId: number, ipAddress?: string, userAgent?: string, metadata?: Record<string, any>): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.CODE_VIEWED,
      ipAddress,
      userAgent,
      metadata
    });
  }

  /**
   * Registra click en enlace
   */
  static async trackLinkClicked(referralId: number, userId?: number, ipAddress?: string, userAgent?: string, metadata?: Record<string, any>): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.LINK_CLICKED,
      userId,
      ipAddress,
      userAgent,
      metadata
    });
  }

  /**
   * Registra inicio de registro
   */
  static async trackRegistrationStarted(referralId: number, userId?: number, ipAddress?: string, userAgent?: string): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.REGISTRATION_STARTED,
      userId,
      ipAddress,
      userAgent
    });
  }

  /**
   * Registra registro completado
   */
  static async trackRegistrationCompleted(referralId: number, userId: number): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.REGISTRATION_COMPLETED,
      userId
    });
  }

  /**
   * Registra compra realizada
   */
  static async trackPurchase(referralId: number, userId: number, purchaseAmount: number, metadata?: Record<string, any>): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.PURCHASE_MADE,
      userId,
      eventValue: purchaseAmount,
      metadata
    });
  }

  /**
   * Registra suscripción iniciada
   */
  static async trackSubscriptionStarted(referralId: number, userId: number, subscriptionValue?: number): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.SUBSCRIPTION_STARTED,
      userId,
      eventValue: subscriptionValue
    });
  }

  /**
   * Registra registro a evento
   */
  static async trackEventRegistration(referralId: number, userId: number, eventId: number): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.EVENT_REGISTERED,
      userId,
      metadata: { eventId }
    });
  }

  /**
   * Registra asistencia a evento
   */
  static async trackEventAttendance(referralId: number, userId: number, eventId: number): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.EVENT_ATTENDED,
      userId,
      metadata: { eventId }
    });
  }

  /**
   * Registra calificación del referido
   */
  static async trackQualificationTriggered(referralId: number, userId: number): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.QUALIFICATION_TRIGGERED,
      userId
    });
  }

  /**
   * Registra recompensa ganada
   */
  static async trackRewardEarned(referralId: number, userId: number, rewardAmount: number, metadata?: Record<string, any>): Promise<ReferralTracking> {
    return this.trackEvent({
      referralId,
      event: ReferralTrackingEvent.REWARD_EARNED,
      userId,
      eventValue: rewardAmount,
      metadata
    });
  }

  /**
   * Busca eventos de seguimiento por referido
   */
  static async findByReferral(referralId: number, limit: number = 100): Promise<ReferralTracking[]> {
    return this.findAll({
      where: { referralId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Busca eventos de seguimiento por usuario
   */
  static async findByUser(userId: number, limit: number = 100): Promise<ReferralTracking[]> {
    return this.findAll({
      where: { userId },
      include: [{
        model: Referral,
        as: 'referral',
        attributes: ['id', 'type', 'status']
      }],
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * Obtiene estadísticas de eventos por referido
   */
  static async getEventStatsByReferral(referralId: number): Promise<Record<ReferralTrackingEvent, number>> {
    const events = await this.findAll({
      where: { referralId },
      attributes: ['event']
    });

    const stats: Record<ReferralTrackingEvent, number> = {} as Record<ReferralTrackingEvent, number>;

    // Inicializar todos los eventos en 0
    Object.values(ReferralTrackingEvent).forEach(event => {
      stats[event] = 0;
    });

    // Contar eventos
    events.forEach(event => {
      stats[event.event]++;
    });

    return stats;
  }

  /**
   * Obtiene estadísticas generales de eventos
   */
  static async getGlobalEventStats(startDate?: Date, endDate?: Date): Promise<{
    totalEvents: number;
    eventsByType: Record<ReferralTrackingEvent, number>;
    conversionEvents: number;
    engagementEvents: number;
  }> {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.$gte = startDate;
      if (endDate) where.createdAt.$lte = endDate;
    }

    const events = await this.findAll({
      where,
      attributes: ['event']
    });

    const stats = {
      totalEvents: events.length,
      eventsByType: {} as Record<ReferralTrackingEvent, number>,
      conversionEvents: 0,
      engagementEvents: 0
    };

    // Inicializar contadores
    Object.values(ReferralTrackingEvent).forEach(event => {
      stats.eventsByType[event] = 0;
    });

    // Contar eventos
    events.forEach(event => {
      stats.eventsByType[event.event]++;

      if ([
        ReferralTrackingEvent.REGISTRATION_COMPLETED,
        ReferralTrackingEvent.PURCHASE_MADE,
        ReferralTrackingEvent.SUBSCRIPTION_STARTED,
        ReferralTrackingEvent.EVENT_ATTENDED
      ].includes(event.event)) {
        stats.conversionEvents++;
      }

      if ([
        ReferralTrackingEvent.CODE_VIEWED,
        ReferralTrackingEvent.LINK_CLICKED,
        ReferralTrackingEvent.REGISTRATION_STARTED,
        ReferralTrackingEvent.EVENT_REGISTERED
      ].includes(event.event)) {
        stats.engagementEvents++;
      }
    });

    return stats;
  }

  /**
   * Limpia eventos antiguos
   */
  static async cleanupOldEvents(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await this.destroy({
      where: {
        createdAt: { $lt: cutoffDate }
      }
    });

    return deletedCount;
  }
}