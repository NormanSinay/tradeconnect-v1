/**
 * @fileoverview Modelo de Email de Campaña para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para tracking individual de emails enviados en campañas
 *
 * Archivo: backend/src/models/CampaignEmail.ts
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
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { EmailCampaign } from './EmailCampaign';
import { CampaignRecipient } from './CampaignRecipient';

/**
 * Estados posibles de un email de campaña
 */
export enum CampaignEmailStatus {
  QUEUED = 'QUEUED',      // En cola para envío
  SENT = 'SENT',          // Email enviado
  DELIVERED = 'DELIVERED', // Email entregado
  OPENED = 'OPENED',      // Email abierto
  CLICKED = 'CLICKED',    // Click en enlace
  BOUNCED = 'BOUNCED',    // Email rebotado
  COMPLAINED = 'COMPLAINED', // Queja de spam
  FAILED = 'FAILED'       // Falló el envío
}

/**
 * Tipos de eventos de tracking
 */
export enum CampaignEmailEventType {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  BOUNCED = 'BOUNCED',
  COMPLAINED = 'COMPLAINED',
  UNSUBSCRIBED = 'UNSUBSCRIBED'
}

/**
 * Atributos del modelo CampaignEmail
 */
export interface CampaignEmailAttributes {
  id?: number;
  campaignId: number;
  recipientId: number;
  messageId?: string; // ID único del mensaje para tracking
  status: CampaignEmailStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  firstOpenedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  complainedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  ipAddress?: string;
  userAgent?: string;
  openCount: number;
  clickCount: number;
  lastActivityAt?: Date;
  events?: CampaignEmailEvent[];
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para evento de email
 */
export interface CampaignEmailEvent {
  type: CampaignEmailEventType;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  linkId?: string;
  linkUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface para creación de email de campaña
 */
export interface CampaignEmailCreationAttributes extends Omit<CampaignEmailAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CampaignEmail:
 *       type: object
 *       required:
 *         - campaignId
 *         - recipientId
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del email de campaña
 *           example: 1
 *         campaignId:
 *           type: integer
 *           description: ID de la campaña
 *           example: 1
 *         recipientId:
 *           type: integer
 *           description: ID del destinatario
 *           example: 1
 *         messageId:
 *           type: string
 *           description: ID único del mensaje para tracking
 *           example: "msg_1234567890@example.com"
 *         status:
 *           type: string
 *           enum: [QUEUED, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, FAILED]
 *           description: Estado del email
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de envío
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de entrega
 *         openedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última apertura
 *         firstOpenedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de primera apertura
 *         clickedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha del último click
 *         bouncedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha del rebote
 *         complainedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de la queja
 *         failedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha del fallo
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos
 *           default: 0
 *         maxRetries:
 *           type: integer
 *           description: Máximo número de reintentos
 *           default: 3
 *         ipAddress:
 *           type: string
 *           description: IP del destinatario
 *         userAgent:
 *           type: string
 *           description: User agent del destinatario
 *         openCount:
 *           type: integer
 *           description: Número de aperturas
 *           default: 0
 *         clickCount:
 *           type: integer
 *           description: Número de clicks
 *           default: 0
 *         lastActivityAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actividad
 *         events:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, UNSUBSCRIBED]
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               ipAddress:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               linkId:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               metadata:
 *                 type: object
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
  tableName: 'campaign_emails',
  modelName: 'CampaignEmail',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['campaign_id', 'recipient_id'],
      name: 'idx_campaign_emails_campaign_recipient_unique'
    },
    {
      fields: ['campaign_id'],
      name: 'idx_campaign_emails_campaign_id'
    },
    {
      fields: ['recipient_id'],
      name: 'idx_campaign_emails_recipient_id'
    },
    {
      fields: ['message_id'],
      name: 'idx_campaign_emails_message_id'
    },
    {
      fields: ['status'],
      name: 'idx_campaign_emails_status'
    },
    {
      fields: ['sent_at'],
      name: 'idx_campaign_emails_sent_at'
    },
    {
      fields: ['opened_at'],
      name: 'idx_campaign_emails_opened_at'
    },
    {
      fields: ['clicked_at'],
      name: 'idx_campaign_emails_clicked_at'
    },
    {
      fields: ['last_activity_at'],
      name: 'idx_campaign_emails_last_activity_at'
    },
    {
      fields: ['campaign_id', 'status'],
      name: 'idx_campaign_emails_campaign_status'
    },
    {
      fields: ['created_at'],
      name: 'idx_campaign_emails_created_at'
    }
  ]
})
export class CampaignEmail extends Model<CampaignEmailAttributes, CampaignEmailCreationAttributes> implements CampaignEmailAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @ForeignKey(() => EmailCampaign)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la campaña de email'
  })
  declare campaignId: number;

  @AllowNull(false)
  @ForeignKey(() => CampaignRecipient)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del destinatario de la campaña'
  })
  declare recipientId: number;

  @Index
  @Column({
    type: DataType.STRING(255),
    comment: 'ID único del mensaje para tracking SMTP'
  })
  declare messageId?: string;

  @AllowNull(false)
  @Default(CampaignEmailStatus.QUEUED)
  @Column({
    type: DataType.ENUM(...Object.values(CampaignEmailStatus)),
    comment: 'Estado actual del email en la campaña'
  })
  declare status: CampaignEmailStatus;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se envió el email'
  })
  declare sentAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se entregó el email'
  })
  declare deliveredAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de la última apertura del email'
  })
  declare openedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de la primera apertura del email'
  })
  declare firstOpenedAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último click en enlace'
  })
  declare clickedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del rebote del email'
  })
  declare bouncedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de la queja de spam'
  })
  declare complainedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del fallo de envío'
  })
  declare failedAt?: Date;

  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si el envío falló'
  })
  declare errorMessage?: string;

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
    type: DataType.INET,
    comment: 'IP del destinatario que realizó la actividad'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User agent del destinatario'
  })
  declare userAgent?: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número total de aperturas del email'
  })
  declare openCount: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número total de clicks en enlaces'
  })
  declare clickCount: number;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de la última actividad (apertura/click)'
  })
  declare lastActivityAt?: Date;

  @Default([])
  @Column({
    type: DataType.JSONB,
    comment: 'Historial de eventos del email (aperturas, clicks, etc.)'
  })
  declare events?: CampaignEmailEvent[];

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del email'
  })
  declare metadata?: Record<string, any>;

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

  @BelongsTo(() => EmailCampaign)
  declare campaign: EmailCampaign;

  @BelongsTo(() => CampaignRecipient)
  declare recipient: CampaignRecipient;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el email ha sido abierto
   */
  public get hasOpened(): boolean {
    return this.openCount > 0;
  }

  /**
   * Verifica si el email ha recibido clicks
   */
  public get hasClicked(): boolean {
    return this.clickCount > 0;
  }

  /**
   * Verifica si el email falló
   */
  public get hasFailed(): boolean {
    return [CampaignEmailStatus.BOUNCED, CampaignEmailStatus.COMPLAINED, CampaignEmailStatus.FAILED].includes(this.status);
  }

  /**
   * Verifica si puede reintentarse
   */
  public canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === CampaignEmailStatus.QUEUED;
  }

  /**
   * Marca como enviado
   */
  public async markAsSent(messageId?: string): Promise<void> {
    this.status = CampaignEmailStatus.SENT;
    this.sentAt = new Date();
    if (messageId) {
      this.messageId = messageId;
    }
    await this.save();
  }

  /**
   * Marca como entregado
   */
  public async markAsDelivered(): Promise<void> {
    this.status = CampaignEmailStatus.DELIVERED;
    this.deliveredAt = new Date();
    await this.save();
  }

  /**
   * Registra una apertura
   */
  public async recordOpen(ipAddress?: string, userAgent?: string): Promise<void> {
    const now = new Date();

    if (!this.firstOpenedAt) {
      this.firstOpenedAt = now;
    }

    this.openedAt = now;
    this.openCount += 1;
    this.lastActivityAt = now;

    if (ipAddress) this.ipAddress = ipAddress;
    if (userAgent) this.userAgent = userAgent;

    if (this.status === CampaignEmailStatus.SENT || this.status === CampaignEmailStatus.DELIVERED) {
      this.status = CampaignEmailStatus.OPENED;
    }

    // Agregar evento
    this.addEvent(CampaignEmailEventType.OPENED, now, ipAddress, userAgent);

    await this.save();
  }

  /**
   * Registra un click
   */
  public async recordClick(linkId: string, linkUrl: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const now = new Date();

    this.clickedAt = now;
    this.clickCount += 1;
    this.lastActivityAt = now;

    if (ipAddress) this.ipAddress = ipAddress;
    if (userAgent) this.userAgent = userAgent;

    this.status = CampaignEmailStatus.CLICKED;

    // Agregar evento
    this.addEvent(CampaignEmailEventType.CLICKED, now, ipAddress, userAgent, linkId, linkUrl);

    await this.save();
  }

  /**
   * Marca como rebotado
   */
  public async markAsBounced(errorMessage?: string): Promise<void> {
    this.status = CampaignEmailStatus.BOUNCED;
    this.bouncedAt = new Date();
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }

    // Agregar evento
    this.addEvent(CampaignEmailEventType.BOUNCED, this.bouncedAt);

    await this.save();
  }

  /**
   * Marca como queja de spam
   */
  public async markAsComplained(): Promise<void> {
    this.status = CampaignEmailStatus.COMPLAINED;
    this.complainedAt = new Date();

    // Agregar evento
    this.addEvent(CampaignEmailEventType.COMPLAINED, this.complainedAt);

    await this.save();
  }

  /**
   * Marca como fallido
   */
  public async markAsFailed(errorMessage?: string): Promise<void> {
    this.status = CampaignEmailStatus.FAILED;
    this.failedAt = new Date();
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }
    await this.save();
  }

  /**
   * Incrementa contador de reintentos
   */
  public async incrementRetryCount(): Promise<void> {
    this.retryCount += 1;
    await this.save();
  }

  /**
   * Agrega un evento al historial
   */
  private addEvent(
    type: CampaignEmailEventType,
    timestamp: Date,
    ipAddress?: string,
    userAgent?: string,
    linkId?: string,
    linkUrl?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.events) {
      this.events = [];
    }

    const event: CampaignEmailEvent = {
      type,
      timestamp,
      ipAddress,
      userAgent,
      linkId,
      linkUrl,
      metadata
    };

    this.events.push(event);
  }

  /**
   * Obtiene eventos de un tipo específico
   */
  public getEventsByType(type: CampaignEmailEventType): CampaignEmailEvent[] {
    return this.events?.filter(event => event.type === type) || [];
  }

  /**
   * Obtiene el último evento de un tipo
   */
  public getLastEvent(type: CampaignEmailEventType): CampaignEmailEvent | undefined {
    const events = this.getEventsByType(type);
    return events.length > 0 ? events[events.length - 1] : undefined;
  }

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      campaignId: this.campaignId,
      recipientId: this.recipientId,
      messageId: this.messageId,
      status: this.status,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      openedAt: this.openedAt,
      firstOpenedAt: this.firstOpenedAt,
      clickedAt: this.clickedAt,
      bouncedAt: this.bouncedAt,
      complainedAt: this.complainedAt,
      failedAt: this.failedAt,
      errorMessage: this.errorMessage,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      openCount: this.openCount,
      clickCount: this.clickCount,
      lastActivityAt: this.lastActivityAt,
      events: this.events,
      metadata: this.metadata,
      hasOpened: this.hasOpened,
      hasClicked: this.hasClicked,
      hasFailed: this.hasFailed,
      canRetry: this.canRetry(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca emails pendientes de envío en una campaña
   */
  static async findQueuedByCampaign(campaignId: number, limit?: number): Promise<CampaignEmail[]> {
    const options: any = {
      where: {
        campaignId,
        status: CampaignEmailStatus.QUEUED
      },
      order: [['createdAt', 'ASC']]
    };

    if (limit) {
      options.limit = limit;
    }

    return this.findAll(options);
  }

  /**
   * Busca email por messageId
   */
  static async findByMessageId(messageId: string): Promise<CampaignEmail | null> {
    return this.findOne({
      where: { messageId }
    });
  }

  /**
   * Busca emails de una campaña por estado
   */
  static async findByCampaignAndStatus(campaignId: number, status: CampaignEmailStatus): Promise<CampaignEmail[]> {
    return this.findAll({
      where: {
        campaignId,
        status
      },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Cuenta emails por estado en una campaña
   */
  static async countByStatus(campaignId: number): Promise<Record<CampaignEmailStatus, number>> {
    const counts = await this.findAll({
      where: { campaignId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result: Record<CampaignEmailStatus, number> = {
      [CampaignEmailStatus.QUEUED]: 0,
      [CampaignEmailStatus.SENT]: 0,
      [CampaignEmailStatus.DELIVERED]: 0,
      [CampaignEmailStatus.OPENED]: 0,
      [CampaignEmailStatus.CLICKED]: 0,
      [CampaignEmailStatus.BOUNCED]: 0,
      [CampaignEmailStatus.COMPLAINED]: 0,
      [CampaignEmailStatus.FAILED]: 0
    };

    counts.forEach((count: any) => {
      result[count.status as CampaignEmailStatus] = parseInt(count.count);
    });

    return result;
  }

  /**
   * Obtiene estadísticas detalladas de una campaña
   */
  static async getDetailedStats(campaignId: number): Promise<{
    total: number;
    queued: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
    failed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    deliveryRate: number;
    totalOpens: number;
    totalClicks: number;
  }> {
    const counts = await this.countByStatus(campaignId);

    // Obtener totales de aperturas y clicks
    const aggregates = await this.sequelize?.query(
      `SELECT
        SUM(open_count) as total_opens,
        SUM(click_count) as total_clicks
       FROM campaign_emails
       WHERE campaign_id = $1`,
      {
        bind: [campaignId],
        type: require('sequelize').QueryTypes.SELECT
      }
    ) as any[];

    const totalOpens = parseInt(aggregates[0]?.total_opens || '0');
    const totalClicks = parseInt(aggregates[0]?.total_clicks || '0');

    const sent = counts[CampaignEmailStatus.SENT] + counts[CampaignEmailStatus.DELIVERED] +
                 counts[CampaignEmailStatus.OPENED] + counts[CampaignEmailStatus.CLICKED];

    return {
      total: Object.values(counts).reduce((sum, count) => sum + count, 0),
      queued: counts[CampaignEmailStatus.QUEUED],
      sent: counts[CampaignEmailStatus.SENT],
      delivered: counts[CampaignEmailStatus.DELIVERED],
      opened: counts[CampaignEmailStatus.OPENED],
      clicked: counts[CampaignEmailStatus.CLICKED],
      bounced: counts[CampaignEmailStatus.BOUNCED],
      complained: counts[CampaignEmailStatus.COMPLAINED],
      failed: counts[CampaignEmailStatus.FAILED],
      openRate: sent > 0 ? Math.round((counts[CampaignEmailStatus.OPENED] / sent) * 100) : 0,
      clickRate: sent > 0 ? Math.round((counts[CampaignEmailStatus.CLICKED] / sent) * 100) : 0,
      bounceRate: sent > 0 ? Math.round((counts[CampaignEmailStatus.BOUNCED] / sent) * 100) : 0,
      deliveryRate: sent > 0 ? Math.round((counts[CampaignEmailStatus.DELIVERED] / sent) * 100) : 0,
      totalOpens,
      totalClicks
    };
  }

  /**
   * Busca emails que pueden reintentarse
   */
  static async findRetryableEmails(campaignId: number): Promise<CampaignEmail[]> {
    return this.findAll({
      where: {
        campaignId,
        status: CampaignEmailStatus.QUEUED,
        retryCount: {
          [require('sequelize').Op.lt]: require('sequelize').col('maxRetries')
        }
      },
      order: [['retryCount', 'ASC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene actividad reciente de una campaña
   */
  static async getRecentActivity(campaignId: number, limit: number = 50): Promise<CampaignEmail[]> {
    return this.findAll({
      where: { campaignId },
      order: [['lastActivityAt', 'DESC'], ['updatedAt', 'DESC']],
      limit
    });
  }
}