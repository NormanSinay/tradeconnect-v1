/**
 * @fileoverview Modelo de Destinatario de Campaña para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para gestionar destinatarios de campañas de email
 *
 * Archivo: backend/src/models/CampaignRecipient.ts
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
import { User } from './User';
import { EmailCampaign } from './EmailCampaign';

/**
 * Estados posibles de un destinatario en una campaña
 */
export enum CampaignRecipientStatus {
  PENDING = 'PENDING',     // Pendiente de envío
  SENT = 'SENT',          // Email enviado
  DELIVERED = 'DELIVERED', // Email entregado
  OPENED = 'OPENED',      // Email abierto
  CLICKED = 'CLICKED',    // Click en enlace
  BOUNCED = 'BOUNCED',    // Email rebotado
  COMPLAINED = 'COMPLAINED', // Queja de spam
  UNSUBSCRIBED = 'UNSUBSCRIBED', // Desuscrito
  SKIPPED = 'SKIPPED'     // Omitido (por preferencias)
}

/**
 * Atributos del modelo CampaignRecipient
 */
export interface CampaignRecipientAttributes {
  id?: number;
  campaignId: number;
  userId?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  status: CampaignRecipientStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  firstOpenedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  complainedAt?: Date;
  unsubscribedAt?: Date;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de destinatario
 */
export interface CampaignRecipientCreationAttributes extends Omit<CampaignRecipientAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CampaignRecipient:
 *       type: object
 *       required:
 *         - campaignId
 *         - email
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del destinatario
 *           example: 1
 *         campaignId:
 *           type: integer
 *           description: ID de la campaña
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario (si es usuario registrado)
 *           example: 123
 *         email:
 *           type: string
 *           format: email
 *           description: Email del destinatario
 *           example: "usuario@example.com"
 *         firstName:
 *           type: string
 *           description: Nombre del destinatario
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           description: Apellido del destinatario
 *           example: "Pérez"
 *         status:
 *           type: string
 *           enum: [PENDING, SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, UNSUBSCRIBED, SKIPPED]
 *           description: Estado del destinatario en la campaña
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
 *         unsubscribedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de desuscripción
 *         variables:
 *           type: object
 *           description: Variables personalizadas para este destinatario
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si falló
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos
 *           default: 0
 *         maxRetries:
 *           type: integer
 *           description: Máximo número de reintentos
 *           default: 3
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
  tableName: 'campaign_recipients',
  modelName: 'CampaignRecipient',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['campaign_id', 'email'],
      name: 'idx_campaign_recipients_campaign_email_unique'
    },
    {
      fields: ['campaign_id'],
      name: 'idx_campaign_recipients_campaign_id'
    },
    {
      fields: ['user_id'],
      name: 'idx_campaign_recipients_user_id'
    },
    {
      fields: ['email'],
      name: 'idx_campaign_recipients_email'
    },
    {
      fields: ['status'],
      name: 'idx_campaign_recipients_status'
    },
    {
      fields: ['sent_at'],
      name: 'idx_campaign_recipients_sent_at'
    },
    {
      fields: ['opened_at'],
      name: 'idx_campaign_recipients_opened_at'
    },
    {
      fields: ['clicked_at'],
      name: 'idx_campaign_recipients_clicked_at'
    },
    {
      fields: ['campaign_id', 'status'],
      name: 'idx_campaign_recipients_campaign_status'
    },
    {
      fields: ['created_at'],
      name: 'idx_campaign_recipients_created_at'
    }
  ]
})
export class CampaignRecipient extends Model<CampaignRecipientAttributes, CampaignRecipientCreationAttributes> implements CampaignRecipientAttributes {
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

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario destinatario (opcional para emails externos)'
  })
  declare userId?: number;

  @AllowNull(false)
  @Validate({
    isEmail: {
      msg: 'El email debe tener un formato válido'
    },
    notEmpty: {
      msg: 'El email es requerido'
    }
  })
  @Index
  @Column({
    type: DataType.STRING(255),
    comment: 'Email del destinatario'
  })
  declare email: string;

  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del destinatario'
  })
  declare firstName?: string;

  @Column({
    type: DataType.STRING(100),
    comment: 'Apellido del destinatario'
  })
  declare lastName?: string;

  @AllowNull(false)
  @Default(CampaignRecipientStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(CampaignRecipientStatus)),
    comment: 'Estado del destinatario en la campaña'
  })
  declare status: CampaignRecipientStatus;

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
    comment: 'Fecha de desuscripción'
  })
  declare unsubscribedAt?: Date;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Variables personalizadas para este destinatario'
  })
  declare variables?: Record<string, any>;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del destinatario'
  })
  declare metadata?: Record<string, any>;

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

  @BelongsTo(() => User)
  declare user?: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene el nombre completo del destinatario
   */
  public get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`.trim();
    }
    if (this.firstName) return this.firstName;
    if (this.lastName) return this.lastName;
    return this.email;
  }

  /**
   * Verifica si el destinatario ha abierto el email
   */
  public get hasOpened(): boolean {
    return this.openedAt !== null && this.openedAt !== undefined;
  }

  /**
   * Verifica si el destinatario ha hecho click en enlaces
   */
  public get hasClicked(): boolean {
    return this.clickedAt !== null && this.clickedAt !== undefined;
  }

  /**
   * Verifica si el email falló
   */
  public get hasFailed(): boolean {
    return [CampaignRecipientStatus.BOUNCED, CampaignRecipientStatus.COMPLAINED].includes(this.status);
  }

  /**
   * Verifica si puede reintentarse
   */
  public canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === CampaignRecipientStatus.PENDING;
  }

  /**
   * Marca como enviado
   */
  public async markAsSent(): Promise<void> {
    this.status = CampaignRecipientStatus.SENT;
    this.sentAt = new Date();
    await this.save();
  }

  /**
   * Marca como entregado
   */
  public async markAsDelivered(): Promise<void> {
    this.status = CampaignRecipientStatus.DELIVERED;
    this.deliveredAt = new Date();
    await this.save();
  }

  /**
   * Registra una apertura
   */
  public async markAsOpened(): Promise<void> {
    const now = new Date();

    if (!this.firstOpenedAt) {
      this.firstOpenedAt = now;
    }

    this.openedAt = now;

    if (this.status === CampaignRecipientStatus.SENT || this.status === CampaignRecipientStatus.DELIVERED) {
      this.status = CampaignRecipientStatus.OPENED;
    }

    await this.save();
  }

  /**
   * Registra un click
   */
  public async markAsClicked(): Promise<void> {
    this.clickedAt = new Date();
    this.status = CampaignRecipientStatus.CLICKED;
    await this.save();
  }

  /**
   * Marca como rebotado
   */
  public async markAsBounced(errorMessage?: string): Promise<void> {
    this.status = CampaignRecipientStatus.BOUNCED;
    this.bouncedAt = new Date();
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }
    await this.save();
  }

  /**
   * Marca como queja de spam
   */
  public async markAsComplained(): Promise<void> {
    this.status = CampaignRecipientStatus.COMPLAINED;
    this.complainedAt = new Date();
    await this.save();
  }

  /**
   * Marca como desuscrito
   */
  public async markAsUnsubscribed(): Promise<void> {
    this.status = CampaignRecipientStatus.UNSUBSCRIBED;
    this.unsubscribedAt = new Date();
    await this.save();
  }

  /**
   * Marca como omitido
   */
  public async markAsSkipped(reason?: string): Promise<void> {
    this.status = CampaignRecipientStatus.SKIPPED;
    if (reason) {
      this.errorMessage = reason;
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
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      campaignId: this.campaignId,
      userId: this.userId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      status: this.status,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      openedAt: this.openedAt,
      firstOpenedAt: this.firstOpenedAt,
      clickedAt: this.clickedAt,
      bouncedAt: this.bouncedAt,
      complainedAt: this.complainedAt,
      unsubscribedAt: this.unsubscribedAt,
      variables: this.variables,
      metadata: this.metadata,
      errorMessage: this.errorMessage,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
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
   * Busca destinatarios pendientes de una campaña
   */
  static async findPendingByCampaign(campaignId: number, limit?: number): Promise<CampaignRecipient[]> {
    const options: any = {
      where: {
        campaignId,
        status: CampaignRecipientStatus.PENDING
      },
      order: [['createdAt', 'ASC']]
    };

    if (limit) {
      options.limit = limit;
    }

    return this.findAll(options);
  }

  /**
   * Busca destinatarios de una campaña por estado
   */
  static async findByCampaignAndStatus(campaignId: number, status: CampaignRecipientStatus): Promise<CampaignRecipient[]> {
    return this.findAll({
      where: {
        campaignId,
        status
      },
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Busca destinatario específico en una campaña
   */
  static async findByCampaignAndEmail(campaignId: number, email: string): Promise<CampaignRecipient | null> {
    return this.findOne({
      where: {
        campaignId,
        email: email.toLowerCase()
      }
    });
  }

  /**
   * Cuenta destinatarios por estado en una campaña
   */
  static async countByStatus(campaignId: number): Promise<Record<CampaignRecipientStatus, number>> {
    const counts = await this.findAll({
      where: { campaignId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result: Record<CampaignRecipientStatus, number> = {
      [CampaignRecipientStatus.PENDING]: 0,
      [CampaignRecipientStatus.SENT]: 0,
      [CampaignRecipientStatus.DELIVERED]: 0,
      [CampaignRecipientStatus.OPENED]: 0,
      [CampaignRecipientStatus.CLICKED]: 0,
      [CampaignRecipientStatus.BOUNCED]: 0,
      [CampaignRecipientStatus.COMPLAINED]: 0,
      [CampaignRecipientStatus.UNSUBSCRIBED]: 0,
      [CampaignRecipientStatus.SKIPPED]: 0
    };

    counts.forEach((count: any) => {
      result[count.status as CampaignRecipientStatus] = parseInt(count.count);
    });

    return result;
  }

  /**
   * Obtiene estadísticas de engagement de una campaña
   */
  static async getEngagementStats(campaignId: number): Promise<{
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
    unsubscribed: number;
    skipped: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    deliveryRate: number;
  }> {
    const counts = await this.countByStatus(campaignId);

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const sent = counts[CampaignRecipientStatus.SENT] + counts[CampaignRecipientStatus.DELIVERED] +
                 counts[CampaignRecipientStatus.OPENED] + counts[CampaignRecipientStatus.CLICKED];

    return {
      total,
      sent: counts[CampaignRecipientStatus.SENT],
      delivered: counts[CampaignRecipientStatus.DELIVERED],
      opened: counts[CampaignRecipientStatus.OPENED],
      clicked: counts[CampaignRecipientStatus.CLICKED],
      bounced: counts[CampaignRecipientStatus.BOUNCED],
      complained: counts[CampaignRecipientStatus.COMPLAINED],
      unsubscribed: counts[CampaignRecipientStatus.UNSUBSCRIBED],
      skipped: counts[CampaignRecipientStatus.SKIPPED],
      openRate: sent > 0 ? Math.round((counts[CampaignRecipientStatus.OPENED] / sent) * 100) : 0,
      clickRate: sent > 0 ? Math.round((counts[CampaignRecipientStatus.CLICKED] / sent) * 100) : 0,
      bounceRate: sent > 0 ? Math.round((counts[CampaignRecipientStatus.BOUNCED] / sent) * 100) : 0,
      deliveryRate: sent > 0 ? Math.round((counts[CampaignRecipientStatus.DELIVERED] / sent) * 100) : 0
    };
  }

  /**
   * Busca destinatarios que pueden reintentarse
   */
  static async findRetryableRecipients(campaignId: number): Promise<CampaignRecipient[]> {
    return this.findAll({
      where: {
        campaignId,
        status: CampaignRecipientStatus.PENDING,
        retryCount: {
          [require('sequelize').Op.lt]: require('sequelize').col('maxRetries')
        }
      },
      order: [['retryCount', 'ASC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * Verifica si un email ya está en una campaña
   */
  static async isEmailInCampaign(campaignId: number, email: string): Promise<boolean> {
    const recipient = await this.findOne({
      where: {
        campaignId,
        email: email.toLowerCase()
      },
      paranoid: false
    });
    return !!recipient;
  }
}