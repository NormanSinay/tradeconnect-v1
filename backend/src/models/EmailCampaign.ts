/**
 * @fileoverview Modelo de Campaña de Email para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para campañas de email marketing automatizadas
 *
 * Archivo: backend/src/models/EmailCampaign.ts
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
  Validate,
  ForeignKey,
  BelongsTo,
  HasMany,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { User } from './User';
import { EmailTemplate } from './EmailTemplate';

/**
 * Estados posibles de una campaña de email
 */
export enum EmailCampaignStatus {
  DRAFT = 'DRAFT',           // Borrador
  SCHEDULED = 'SCHEDULED',   // Programada
  SENDING = 'SENDING',       // Enviando
  SENT = 'SENT',            // Enviada
  PAUSED = 'PAUSED',        // Pausada
  CANCELLED = 'CANCELLED',  // Cancelada
  FAILED = 'FAILED'         // Fallida
}

/**
 * Tipos de campaña de email
 */
export enum EmailCampaignType {
  MARKETING = 'MARKETING',       // Marketing general
  NEWSLETTER = 'NEWSLETTER',     // Boletín informativo
  PROMOTIONAL = 'PROMOTIONAL',   // Promocional
  TRANSACTIONAL = 'TRANSACTIONAL', // Transaccional
  WELCOME = 'WELCOME',           // Bienvenida
  REENGAGEMENT = 'REENGAGEMENT', // Re-engagement
  AUTOMATED = 'AUTOMATED'        // Automatizada
}

/**
 * Atributos del modelo EmailCampaign
 */
export interface EmailCampaignAttributes {
  id?: number;
  name: string;
  description?: string;
  status: EmailCampaignStatus;
  type: EmailCampaignType;
  templateId?: number;
  templateCode?: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  completedAt?: Date;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  complainedCount: number;
  segmentationRules?: Record<string, any>;
  variables?: Record<string, any>;
  tags?: string[];
  priority: number;
  batchSize: number;
  sendRatePerHour: number;
  trackOpens: boolean;
  trackClicks: boolean;
  respectUserPreferences: boolean;
  testRecipients?: string[];
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de campaña
 */
export interface EmailCampaignCreationAttributes extends Omit<EmailCampaignAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailCampaign:
 *       type: object
 *       required:
 *         - name
 *         - status
 *         - type
 *         - subject
 *         - fromName
 *         - fromEmail
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la campaña
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre de la campaña
 *           example: "Campaña de Navidad 2024"
 *         description:
 *           type: string
 *           description: Descripción de la campaña
 *         status:
 *           type: string
 *           enum: [DRAFT, SCHEDULED, SENDING, SENT, PAUSED, CANCELLED, FAILED]
 *           description: Estado de la campaña
 *         type:
 *           type: string
 *           enum: [MARKETING, NEWSLETTER, PROMOTIONAL, TRANSACTIONAL, WELCOME, REENGAGEMENT, AUTOMATED]
 *           description: Tipo de campaña
 *         templateId:
 *           type: integer
 *           description: ID de la plantilla utilizada
 *         templateCode:
 *           type: string
 *           description: Código de la plantilla utilizada
 *         subject:
 *           type: string
 *           description: Asunto del email
 *         previewText:
 *           type: string
 *           description: Texto de preview
 *         fromName:
 *           type: string
 *           description: Nombre del remitente
 *         fromEmail:
 *           type: string
 *           description: Email del remitente
 *         replyToEmail:
 *           type: string
 *           description: Email de respuesta
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: Fecha programada de envío
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio del envío
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de finalización
 *         totalRecipients:
 *           type: integer
 *           description: Total de destinatarios
 *           default: 0
 *         sentCount:
 *           type: integer
 *           description: Emails enviados
 *           default: 0
 *         deliveredCount:
 *           type: integer
 *           description: Emails entregados
 *           default: 0
 *         openedCount:
 *           type: integer
 *           description: Emails abiertos
 *           default: 0
 *         clickedCount:
 *           type: integer
 *           description: Clicks en enlaces
 *           default: 0
 *         bouncedCount:
 *           type: integer
 *           description: Emails rebotados
 *           default: 0
 *         unsubscribedCount:
 *           type: integer
 *           description: Desuscripciones
 *           default: 0
 *         complainedCount:
 *           type: integer
 *           description: Quejas de spam
 *           default: 0
 *         segmentationRules:
 *           type: object
 *           description: Reglas de segmentación
 *         variables:
 *           type: object
 *           description: Variables globales de la campaña
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags de la campaña
 *         priority:
 *           type: integer
 *           description: Prioridad de envío
 *           default: 1
 *         batchSize:
 *           type: integer
 *           description: Tamaño del lote de envío
 *           default: 100
 *         sendRatePerHour:
 *           type: integer
 *           description: Emails por hora
 *           default: 1000
 *         trackOpens:
 *           type: boolean
 *           description: Rastrear aperturas
 *           default: true
 *         trackClicks:
 *           type: boolean
 *           description: Rastrear clicks
 *           default: true
 *         respectUserPreferences:
 *           type: boolean
 *           description: Respetar preferencias de usuario
 *           default: true
 *         testRecipients:
 *           type: array
 *           items:
 *             type: string
 *           description: Emails de prueba
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *         updatedBy:
 *           type: integer
 *           description: ID del usuario que actualizó
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
  tableName: 'email_campaigns',
  modelName: 'EmailCampaign',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['status'],
      name: 'idx_email_campaigns_status'
    },
    {
      fields: ['type'],
      name: 'idx_email_campaigns_type'
    },
    {
      fields: ['scheduled_at'],
      name: 'idx_email_campaigns_scheduled_at'
    },
    {
      fields: ['sent_at'],
      name: 'idx_email_campaigns_sent_at'
    },
    {
      fields: ['created_by'],
      name: 'idx_email_campaigns_created_by'
    },
    {
      fields: ['template_code'],
      name: 'idx_email_campaigns_template_code'
    },
    {
      fields: ['created_at'],
      name: 'idx_email_campaigns_created_at'
    },
    {
      fields: ['status', 'scheduled_at'],
      name: 'idx_email_campaigns_status_scheduled'
    }
  ]
})
export class EmailCampaign extends Model<EmailCampaignAttributes, EmailCampaignCreationAttributes> implements EmailCampaignAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la campaña es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre de la campaña de email'
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la campaña'
  })
  declare description?: string;

  @AllowNull(false)
  @Default(EmailCampaignStatus.DRAFT)
  @Column({
    type: DataType.ENUM(...Object.values(EmailCampaignStatus)),
    comment: 'Estado actual de la campaña'
  })
  declare status: EmailCampaignStatus;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(EmailCampaignType)),
    comment: 'Tipo de campaña de email'
  })
  declare type: EmailCampaignType;

  @ForeignKey(() => EmailTemplate)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la plantilla de email utilizada'
  })
  declare templateId?: number;

  @Column({
    type: DataType.STRING(100),
    comment: 'Código de la plantilla utilizada'
  })
  declare templateCode?: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El asunto del email es requerido'
    },
    len: {
      args: [1, 200],
      msg: 'El asunto debe tener máximo 200 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(200),
    comment: 'Asunto del email de la campaña'
  })
  declare subject: string;

  @Column({
    type: DataType.STRING(255),
    comment: 'Texto de preview del email'
  })
  declare previewText?: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre del remitente es requerido'
    },
    len: {
      args: [1, 100],
      msg: 'El nombre del remitente debe tener máximo 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del remitente'
  })
  declare fromName: string;

  @AllowNull(false)
  @Validate({
    isEmail: {
      msg: 'El email del remitente debe tener un formato válido'
    },
    notEmpty: {
      msg: 'El email del remitente es requerido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email del remitente'
  })
  declare fromEmail: string;

  @Validate({
    isEmail: {
      msg: 'El email de respuesta debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email de respuesta (Reply-To)'
  })
  declare replyToEmail?: string;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha programada para el envío de la campaña'
  })
  declare scheduledAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando inició el envío'
  })
  declare sentAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se completó el envío'
  })
  declare completedAt?: Date;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Total de destinatarios de la campaña'
  })
  declare totalRecipients: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de emails enviados'
  })
  declare sentCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de emails entregados'
  })
  declare deliveredCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de emails abiertos'
  })
  declare openedCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de clicks en enlaces'
  })
  declare clickedCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de emails rebotados'
  })
  declare bouncedCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de desuscripciones'
  })
  declare unsubscribedCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de quejas de spam'
  })
  declare complainedCount: number;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Reglas de segmentación para filtrar destinatarios'
  })
  declare segmentationRules?: Record<string, any>;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Variables globales de la campaña'
  })
  declare variables?: Record<string, any>;

  @Default([])
  @Column({
    type: DataType.JSONB,
    comment: 'Tags para categorizar la campaña'
  })
  declare tags?: string[];

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    comment: 'Prioridad de envío (1-10, mayor número = mayor prioridad)'
  })
  declare priority: number;

  @Default(100)
  @Column({
    type: DataType.INTEGER,
    comment: 'Tamaño del lote para envío por lotes'
  })
  declare batchSize: number;

  @Default(1000)
  @Column({
    type: DataType.INTEGER,
    comment: 'Límite de emails por hora para evitar bloqueos'
  })
  declare sendRatePerHour: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se debe rastrear aperturas de email'
  })
  declare trackOpens: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se debe rastrear clicks en enlaces'
  })
  declare trackClicks: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si se deben respetar las preferencias de notificación del usuario'
  })
  declare respectUserPreferences: boolean;

  @Column({
    type: DataType.JSONB,
    comment: 'Lista de emails para envío de prueba'
  })
  declare testRecipients?: string[];

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que creó la campaña'
  })
  declare createdBy: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que actualizó la campaña'
  })
  declare updatedBy?: number;

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

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @BelongsTo(() => User, 'updatedBy')
  declare updater?: User;

  @BelongsTo(() => EmailTemplate)
  declare template?: EmailTemplate;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la campaña puede ser editada
   */
  public get canEdit(): boolean {
    return [EmailCampaignStatus.DRAFT, EmailCampaignStatus.PAUSED].includes(this.status);
  }

  /**
   * Verifica si la campaña puede ser enviada
   */
  public get canSend(): boolean {
    return [EmailCampaignStatus.DRAFT, EmailCampaignStatus.SCHEDULED, EmailCampaignStatus.PAUSED].includes(this.status);
  }

  /**
   * Verifica si la campaña está activa
   */
  public get isActive(): boolean {
    return [EmailCampaignStatus.SENDING, EmailCampaignStatus.SENT].includes(this.status);
  }

  /**
   * Calcula el porcentaje de progreso del envío
   */
  public get progressPercentage(): number {
    if (this.totalRecipients === 0) return 0;
    return Math.round((this.sentCount / this.totalRecipients) * 100);
  }

  /**
   * Calcula la tasa de apertura
   */
  public get openRate(): number {
    if (this.sentCount === 0) return 0;
    return Math.round((this.openedCount / this.sentCount) * 100);
  }

  /**
   * Calcula la tasa de click
   */
  public get clickRate(): number {
    if (this.sentCount === 0) return 0;
    return Math.round((this.clickedCount / this.sentCount) * 100);
  }

  /**
   * Calcula la tasa de rebote
   */
  public get bounceRate(): number {
    if (this.sentCount === 0) return 0;
    return Math.round((this.bouncedCount / this.sentCount) * 100);
  }

  /**
   * Calcula la tasa de entrega
   */
  public get deliveryRate(): number {
    if (this.sentCount === 0) return 0;
    return Math.round((this.deliveredCount / this.sentCount) * 100);
  }

  /**
   * Marca la campaña como enviando
   */
  public async markAsSending(): Promise<void> {
    this.status = EmailCampaignStatus.SENDING;
    this.sentAt = new Date();
    await this.save();
  }

  /**
   * Marca la campaña como completada
   */
  public async markAsCompleted(): Promise<void> {
    this.status = EmailCampaignStatus.SENT;
    this.completedAt = new Date();
    await this.save();
  }

  /**
   * Marca la campaña como pausada
   */
  public async markAsPaused(): Promise<void> {
    this.status = EmailCampaignStatus.PAUSED;
    await this.save();
  }

  /**
   * Marca la campaña como cancelada
   */
  public async markAsCancelled(): Promise<void> {
    this.status = EmailCampaignStatus.CANCELLED;
    await this.save();
  }

  /**
   * Marca la campaña como fallida
   */
  public async markAsFailed(): Promise<void> {
    this.status = EmailCampaignStatus.FAILED;
    await this.save();
  }

  /**
   * Incrementa el contador de emails enviados
   */
  public async incrementSentCount(count: number = 1): Promise<void> {
    this.sentCount += count;
    await this.save();
  }

  /**
   * Incrementa el contador de emails entregados
   */
  public async incrementDeliveredCount(count: number = 1): Promise<void> {
    this.deliveredCount += count;
    await this.save();
  }

  /**
   * Incrementa el contador de aperturas
   */
  public async incrementOpenedCount(count: number = 1): Promise<void> {
    this.openedCount += count;
    await this.save();
  }

  /**
   * Incrementa el contador de clicks
   */
  public async incrementClickedCount(count: number = 1): Promise<void> {
    this.clickedCount += count;
    await this.save();
  }

  /**
   * Incrementa el contador de rebotes
   */
  public async incrementBouncedCount(count: number = 1): Promise<void> {
    this.bouncedCount += count;
    await this.save();
  }

  /**
   * Incrementa el contador de desuscripciones
   */
  public async incrementUnsubscribedCount(count: number = 1): Promise<void> {
    this.unsubscribedCount += count;
    await this.save();
  }

  /**
   * Incrementa el contador de quejas
   */
  public async incrementComplainedCount(count: number = 1): Promise<void> {
    this.complainedCount += count;
    await this.save();
  }

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      type: this.type,
      templateId: this.templateId,
      templateCode: this.templateCode,
      subject: this.subject,
      previewText: this.previewText,
      fromName: this.fromName,
      fromEmail: this.fromEmail,
      replyToEmail: this.replyToEmail,
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
      completedAt: this.completedAt,
      totalRecipients: this.totalRecipients,
      sentCount: this.sentCount,
      deliveredCount: this.deliveredCount,
      openedCount: this.openedCount,
      clickedCount: this.clickedCount,
      bouncedCount: this.bouncedCount,
      unsubscribedCount: this.unsubscribedCount,
      complainedCount: this.complainedCount,
      segmentationRules: this.segmentationRules,
      variables: this.variables,
      tags: this.tags,
      priority: this.priority,
      batchSize: this.batchSize,
      sendRatePerHour: this.sendRatePerHour,
      trackOpens: this.trackOpens,
      trackClicks: this.trackClicks,
      respectUserPreferences: this.respectUserPreferences,
      testRecipients: this.testRecipients,
      canEdit: this.canEdit,
      canSend: this.canSend,
      isActive: this.isActive,
      progressPercentage: this.progressPercentage,
      openRate: this.openRate,
      clickRate: this.clickRate,
      bounceRate: this.bounceRate,
      deliveryRate: this.deliveryRate,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca campañas por estado
   */
  static async findByStatus(status: EmailCampaignStatus): Promise<EmailCampaign[]> {
    return this.findAll({
      where: { status },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca campañas programadas para envío
   */
  static async findScheduledCampaigns(): Promise<EmailCampaign[]> {
    return this.findAll({
      where: {
        status: EmailCampaignStatus.SCHEDULED,
        scheduledAt: {
          [require('sequelize').Op.lte]: new Date()
        }
      },
      order: [['scheduledAt', 'ASC']]
    });
  }

  /**
   * Busca campañas activas (enviando)
   */
  static async findActiveCampaigns(): Promise<EmailCampaign[]> {
    return this.findAll({
      where: {
        status: EmailCampaignStatus.SENDING
      },
      order: [['priority', 'DESC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * Busca campañas por usuario creador
   */
  static async findByCreator(userId: number): Promise<EmailCampaign[]> {
    return this.findAll({
      where: { createdBy: userId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Obtiene estadísticas generales de campañas
   */
  static async getCampaignStats(): Promise<{
    total: number;
    draft: number;
    scheduled: number;
    sending: number;
    sent: number;
    paused: number;
    cancelled: number;
    failed: number;
  }> {
    const stats = await this.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result = {
      total: 0,
      draft: 0,
      scheduled: 0,
      sending: 0,
      sent: 0,
      paused: 0,
      cancelled: 0,
      failed: 0
    };

    stats.forEach((stat: any) => {
      const count = parseInt(stat.count);
      result.total += count;

      switch (stat.status) {
        case EmailCampaignStatus.DRAFT:
          result.draft = count;
          break;
        case EmailCampaignStatus.SCHEDULED:
          result.scheduled = count;
          break;
        case EmailCampaignStatus.SENDING:
          result.sending = count;
          break;
        case EmailCampaignStatus.SENT:
          result.sent = count;
          break;
        case EmailCampaignStatus.PAUSED:
          result.paused = count;
          break;
        case EmailCampaignStatus.CANCELLED:
          result.cancelled = count;
          break;
        case EmailCampaignStatus.FAILED:
          result.failed = count;
          break;
      }
    });

    return result;
  }
}