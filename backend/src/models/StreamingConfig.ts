/**
 * @fileoverview Modelo de Configuración de Streaming para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Configuración de Streaming con validaciones y métodos
 *
 * Archivo: backend/src/models/StreamingConfig.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey,
  Index
} from 'sequelize-typescript';
import { HybridEvent } from './HybridEvent';
import { User } from './User';
import {
  StreamingStatus,
  StreamQuality,
  RecordingStatus
} from '../types/hybrid.types';
import {
  RTMPConfig,
  HLSConfig,
  TranscodingConfig,
  RecordingConfig,
  CDNConfig,
  StreamingSecurityConfig,
  LiveChatConfig,
  QAConfig,
  LivePollConfig,
  StreamingAnalyticsConfig
} from '../types/streaming.types';

/**
 * Atributos del modelo Configuración de Streaming
 */
export interface StreamingConfigAttributes {
  id?: number;
  hybridEventId: number;
  sessionId?: string;
  status: StreamingStatus;
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  streamUrl?: string;
  viewerUrl?: string;
  rtmpConfig?: RTMPConfig;
  hlsConfig?: HLSConfig;
  transcodingConfig?: TranscodingConfig;
  recordingConfig?: RecordingConfig;
  securityConfig?: StreamingSecurityConfig;
  chatConfig?: LiveChatConfig;
  qaConfig?: QAConfig;
  pollConfig?: LivePollConfig;
  analyticsConfig?: StreamingAnalyticsConfig;
  cdnConfig?: CDNConfig;
  metadata?: any;
  isActive: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de configuración de streaming
 */
export interface StreamingConfigCreationAttributes extends Omit<StreamingConfigAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     StreamingConfig:
 *       type: object
 *       required:
 *         - hybridEventId
 *         - status
 *         - isActive
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la configuración de streaming
 *           example: 1
 *         hybridEventId:
 *           type: integer
 *           description: ID del evento híbrido
 *           example: 1
 *         sessionId:
 *           type: string
 *           description: ID de sesión externa
 *           example: "sess_123456"
 *         status:
 *           type: string
 *           enum: [idle, starting, active, stopping, stopped, error]
 *           description: Estado del streaming
 *           example: active
 *         title:
 *           type: string
 *           description: Título de la sesión de streaming
 *           example: "Conferencia Principal"
 *         streamUrl:
 *           type: string
 *           description: URL del stream
 *           example: "rtmp://stream.example.com/live"
 *         viewerUrl:
 *           type: string
 *           description: URL para espectadores
 *           example: "https://viewer.example.com/watch/123"
 *         isActive:
 *           type: boolean
 *           description: Si la configuración está activa
 *           example: true
 */

@Table({
  tableName: 'streaming_configs',
  modelName: 'StreamingConfig',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['hybrid_event_id']
    },
    {
      fields: ['session_id'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['start_time', 'end_time']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class StreamingConfig extends Model<StreamingConfigAttributes, StreamingConfigCreationAttributes> implements StreamingConfigAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => HybridEvent)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento híbrido'
  })
  declare hybridEventId: number;

  @Index
  @Column({
    type: DataType.STRING(100),
    comment: 'ID de sesión externa (Zoom, etc.)'
  })
  declare sessionId?: string;

  @AllowNull(false)
  @Default('idle')
  @Validate({
    isIn: {
      args: [['idle', 'starting', 'active', 'stopping', 'stopped', 'error']],
      msg: 'El estado debe ser: idle, starting, active, stopping, stopped o error'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('idle', 'starting', 'active', 'stopping', 'stopped', 'error'),
    comment: 'Estado actual del streaming'
  })
  declare status: StreamingStatus;

  @Validate({
    len: {
      args: [0, 200],
      msg: 'El título no puede exceder 200 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(200),
    comment: 'Título de la sesión de streaming'
  })
  declare title?: string;

  @Validate({
    len: {
      args: [0, 1000],
      msg: 'La descripción no puede exceder 1000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la sesión de streaming'
  })
  declare description?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de inicio del streaming'
  })
  declare startTime?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de fin del streaming'
  })
  declare endTime?: Date;

  @Column({
    type: DataType.INTEGER,
    comment: 'Duración en segundos'
  })
  declare duration?: number;

  @Validate({
    isUrl: {
      msg: 'La URL del stream debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del stream RTMP'
  })
  declare streamUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL del viewer debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL para espectadores (HLS, etc.)'
  })
  declare viewerUrl?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración RTMP'
  })
  declare rtmpConfig?: RTMPConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración HLS'
  })
  declare hlsConfig?: HLSConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de transcodificación'
  })
  declare transcodingConfig?: TranscodingConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de grabación'
  })
  declare recordingConfig?: RecordingConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de seguridad'
  })
  declare securityConfig?: StreamingSecurityConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de chat en vivo'
  })
  declare chatConfig?: LiveChatConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de Q&A'
  })
  declare qaConfig?: QAConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de encuestas en vivo'
  })
  declare pollConfig?: LivePollConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de analytics'
  })
  declare analyticsConfig?: StreamingAnalyticsConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Configuración de CDN'
  })
  declare cdnConfig?: CDNConfig;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales'
  })
  declare metadata?: any;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la configuración está activa'
  })
  declare isActive: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la configuración'
  })
  declare createdBy: number;

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

  @BelongsTo(() => HybridEvent)
  declare hybridEvent: HybridEvent;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateStreamingConfig(config: StreamingConfig): Promise<void> {
    // Validar tiempos
    if (config.startTime && config.endTime && config.endTime <= config.startTime) {
      throw new Error('La hora de fin debe ser posterior a la hora de inicio');
    }

    // Calcular duración si hay startTime y endTime
    if (config.startTime && config.endTime) {
      const timeDiff = config.endTime.getTime() - config.startTime.getTime();
      config.duration = Math.floor(timeDiff / 1000);
    }

    // Validar configuración de RTMP si está presente
    if (config.rtmpConfig) {
      if (!config.rtmpConfig.serverUrl) {
        throw new Error('La configuración RTMP requiere serverUrl');
      }
      if (!config.rtmpConfig.streamKey) {
        throw new Error('La configuración RTMP requiere streamKey');
      }
    }

    // Validar configuración de HLS si está presente
    if (config.hlsConfig && !config.hlsConfig.playlistUrl) {
      throw new Error('La configuración HLS requiere playlistUrl');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el streaming está activo
   */
  public get isStreamingActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Verifica si el streaming está programado para el futuro
   */
  public get isScheduled(): boolean {
    if (!this.startTime) return false;
    return new Date() < this.startTime;
  }

  /**
   * Verifica si el streaming ha terminado
   */
  public get isFinished(): boolean {
    if (!this.endTime) return false;
    return new Date() > this.endTime;
  }

  /**
   * Obtiene el tiempo restante hasta el inicio
   */
  public get timeUntilStart(): number | null {
    if (!this.startTime) return null;
    const now = new Date();
    if (now >= this.startTime) return 0;
    return Math.floor((this.startTime.getTime() - now.getTime()) / 1000);
  }

  /**
   * Obtiene el tiempo transcurrido desde el inicio
   */
  public get elapsedTime(): number | null {
    if (!this.startTime) return null;
    const now = new Date();
    if (now <= this.startTime) return 0;
    return Math.floor((now.getTime() - this.startTime.getTime()) / 1000);
  }

  /**
   * Actualiza el estado del streaming
   */
  public async updateStatus(newStatus: StreamingStatus): Promise<void> {
    const oldStatus = this.status;
    this.status = newStatus;

    // Actualizar timestamps según el estado
    if (newStatus === 'active' && oldStatus !== 'active') {
      if (!this.startTime) {
        this.startTime = new Date();
      }
    } else if ((newStatus === 'stopped' || newStatus === 'error') && oldStatus === 'active') {
      if (!this.endTime) {
        this.endTime = new Date();
      }
      // Recalcular duración
      if (this.startTime) {
        const timeDiff = this.endTime.getTime() - this.startTime.getTime();
        this.duration = Math.floor(timeDiff / 1000);
      }
    }

    await this.save();
  }

  /**
   * Verifica si la grabación está habilitada
   */
  public get isRecordingEnabled(): boolean {
    return this.recordingConfig?.enabled || false;
  }

  /**
   * Verifica si el chat está habilitado
   */
  public get isChatEnabled(): boolean {
    return this.chatConfig?.enabled !== false;
  }

  /**
   * Verifica si Q&A está habilitado
   */
  public get isQAEnabled(): boolean {
    return this.qaConfig?.enabled !== false;
  }

  /**
   * Genera URL de visualización
   */
  public generateViewerUrl(token?: string): string {
    if (!this.viewerUrl) return '';

    if (token) {
      return `${this.viewerUrl}?token=${token}`;
    }

    return this.viewerUrl;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      hybridEventId: this.hybridEventId,
      sessionId: this.sessionId,
      status: this.status,
      title: this.title,
      description: this.description,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      viewerUrl: this.viewerUrl,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      streamUrl: this.streamUrl,
      rtmpConfig: this.rtmpConfig,
      hlsConfig: this.hlsConfig,
      transcodingConfig: this.transcodingConfig,
      recordingConfig: this.recordingConfig,
      securityConfig: this.securityConfig,
      chatConfig: this.chatConfig,
      qaConfig: this.qaConfig,
      pollConfig: this.pollConfig,
      analyticsConfig: this.analyticsConfig,
      cdnConfig: this.cdnConfig,
      metadata: this.metadata,
      creator: this.creator?.toPublicJSON(),
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca configuraciones por evento híbrido
   */
  static async findByHybridEventId(hybridEventId: number, activeOnly: boolean = true): Promise<StreamingConfig[]> {
    const where: any = { hybridEventId };

    if (activeOnly) {
      where.isActive = true;
    }

    return this.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca configuraciones activas de streaming
   */
  static async findActiveStreaming(): Promise<StreamingConfig[]> {
    return this.findAll({
      where: {
        isActive: true,
        status: 'active'
      },
      include: [
        {
          model: HybridEvent,
          as: 'hybridEvent'
        },
        {
          model: User,
          as: 'creator'
        }
      ],
      order: [['startTime', 'ASC']]
    });
  }

  /**
   * Busca configuración por session ID
   */
  static async findBySessionId(sessionId: string): Promise<StreamingConfig | null> {
    return this.findOne({
      where: { sessionId }
    });
  }
}
