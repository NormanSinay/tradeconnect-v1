/**
 * @fileoverview Modelo de Participante Virtual para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Participante Virtual con validaciones y métodos
 *
 * Archivo: backend/src/models/VirtualParticipant.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
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
import { VirtualRoom } from './VirtualRoom';
import { User } from './User';
import { VirtualParticipantStatus, VirtualParticipantRole } from '../types/hybrid.types';
import { Op } from 'sequelize';

/**
 * Atributos del modelo Participante Virtual
 */
export interface VirtualParticipantAttributes {
  id?: number;
  hybridEventId: number;
  userId: number;
  roomId?: number;
  accessToken: string;
  status: VirtualParticipantStatus;
  joinedAt?: Date;
  leftAt?: Date;
  totalTimeConnected: number;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    platform: string;
    browser: string;
  };
  connectionQuality?: {
    bitrate: number;
    latency: number;
    packetLoss: number;
  };
  lastActivity?: Date;
  isModerator: boolean;
  canChat: boolean;
  canQA: boolean;
  // Moderación avanzada
  role: VirtualParticipantRole;
  isMuted: boolean;
  isBlocked: boolean;
  moderationNotes?: string;
  // Engagement y métricas
  totalTimeActive: number;
  messagesSent: number;
  questionsAsked: number;
  pollsParticipated: number;
  lastPingAt?: Date;
  averageLatency?: number;
  // Control de acceso
  tokenExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de participante virtual
 */
export interface VirtualParticipantCreationAttributes extends Omit<VirtualParticipantAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'totalTimeConnected' | 'totalTimeActive' | 'messagesSent' | 'questionsAsked' | 'pollsParticipated' | 'role' | 'isMuted' | 'isBlocked'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     VirtualParticipant:
 *       type: object
 *       required:
 *         - hybridEventId
 *         - userId
 *         - accessToken
 *         - status
 *         - isModerator
 *         - canChat
 *         - canQA
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del participante virtual
 *           example: 1
 *         hybridEventId:
 *           type: integer
 *           description: ID del evento híbrido
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario participante
 *           example: 1
 *         roomId:
 *           type: integer
 *           description: ID de la sala virtual (opcional)
 *           example: 1
 *         accessToken:
 *           type: string
 *           description: Token único de acceso
 *           example: "abc123def456"
 *         status:
 *           type: string
 *           enum: [invited, joined, left, removed, blocked]
 *           description: Estado del participante
 *           example: joined
 *         joinedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de unión
 *         leftAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de salida
 *         totalTimeConnected:
 *           type: integer
 *           description: Tiempo total conectado en segundos
 *           example: 3600
 */

@Table({
  tableName: 'virtual_participants',
  modelName: 'VirtualParticipant',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['hybrid_event_id', 'user_id'],
      where: { deleted_at: null }
    },
    {
      fields: ['access_token'],
      unique: true
    },
    {
      fields: ['hybrid_event_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['room_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['joined_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class VirtualParticipant extends Model<VirtualParticipantAttributes, VirtualParticipantCreationAttributes> implements VirtualParticipantAttributes {
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

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al usuario participante'
  })
  declare userId: number;

  @ForeignKey(() => VirtualRoom)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia a la sala virtual (opcional)'
  })
  declare roomId?: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El token de acceso es requerido'
    },
    len: {
      args: [32, 128],
      msg: 'El token de acceso debe tener entre 32 y 128 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(128),
    comment: 'Token único para acceso al evento virtual'
  })
  declare accessToken: string;

  @AllowNull(false)
  @Default('invited')
  @Validate({
    isIn: {
      args: [['invited', 'joined', 'left', 'removed', 'blocked']],
      msg: 'El estado debe ser: invited, joined, left, removed o blocked'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('invited', 'joined', 'left', 'removed', 'blocked'),
    comment: 'Estado actual del participante'
  })
  declare status: VirtualParticipantStatus;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora cuando se unió al evento'
  })
  declare joinedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora cuando salió del evento'
  })
  declare leftAt?: Date;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Tiempo total conectado en segundos'
  })
  declare totalTimeConnected: number;

  @Column({
    type: DataType.JSON,
    comment: 'Información del dispositivo usado'
  })
  declare deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    platform: string;
    browser: string;
  };

  @Column({
    type: DataType.JSON,
    comment: 'Calidad de conexión del participante'
  })
  declare connectionQuality?: {
    bitrate: number;
    latency: number;
    packetLoss: number;
  };

  @Column({
    type: DataType.DATE,
    comment: 'Última actividad registrada'
  })
  declare lastActivity?: Date;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el participante es moderador'
  })
  declare isModerator: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si puede usar el chat'
  })
  declare canChat: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si puede hacer preguntas Q&A'
  })
  declare canQA: boolean;

  // Moderación avanzada
  @Default('attendee')
  @Validate({
    isIn: {
      args: [['attendee', 'presenter', 'moderator', 'organizer']],
      msg: 'El rol debe ser: attendee, presenter, moderator u organizer'
    }
  })
  @Column({
    type: DataType.ENUM('attendee', 'presenter', 'moderator', 'organizer'),
    comment: 'Rol del participante en el evento'
  })
  declare role: VirtualParticipantRole;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el participante está silenciado'
  })
  declare isMuted: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el participante está bloqueado'
  })
  declare isBlocked: boolean;

  @Column({
    type: DataType.TEXT,
    comment: 'Notas de moderación'
  })
  declare moderationNotes?: string;

  // Engagement y métricas
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Tiempo total activo en segundos'
  })
  declare totalTimeActive: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de mensajes enviados'
  })
  declare messagesSent: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de preguntas realizadas'
  })
  declare questionsAsked: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de encuestas en las que participó'
  })
  declare pollsParticipated: number;

  @Column({
    type: DataType.DATE,
    comment: 'Último ping recibido'
  })
  declare lastPingAt?: Date;

  @Column({
    type: DataType.DECIMAL(8, 2),
    comment: 'Latencia promedio en ms'
  })
  declare averageLatency?: number;

  // Control de acceso
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del token de acceso'
  })
  declare tokenExpiresAt?: Date;

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

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => VirtualRoom)
  declare room: VirtualRoom;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateParticipant(participant: VirtualParticipant): Promise<void> {
    // Validar que el usuario no esté ya registrado en el evento
    if (participant.isNewRecord) {
      const existing = await VirtualParticipant.findOne({
        where: {
          hybridEventId: participant.hybridEventId,
          userId: participant.userId
        },
        paranoid: false
      });

      if (existing) {
        throw new Error('El usuario ya está registrado como participante virtual en este evento');
      }
    }

    // Validar lógica de tiempos
    if (participant.joinedAt && participant.leftAt && participant.leftAt <= participant.joinedAt) {
      throw new Error('La fecha de salida debe ser posterior a la fecha de unión');
    }

    // Calcular tiempo total si hay joinedAt y leftAt
    if (participant.joinedAt && participant.leftAt) {
      const timeDiff = participant.leftAt.getTime() - participant.joinedAt.getTime();
      participant.totalTimeConnected = Math.floor(timeDiff / 1000); // convertir a segundos
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Marca al participante como unido al evento
   */
  public async markAsJoined(roomId?: number, deviceInfo?: any): Promise<void> {
    this.status = VirtualParticipantStatus.JOINED;
    this.joinedAt = new Date();
    this.lastActivity = new Date();

    if (roomId) {
      this.roomId = roomId;
    }

    if (deviceInfo) {
      this.deviceInfo = deviceInfo;
    }

    await this.save();
  }

  /**
   * Marca al participante como salido del evento
   */
  public async markAsLeft(): Promise<void> {
    this.status = VirtualParticipantStatus.LEFT;
    this.leftAt = new Date();

    // Calcular tiempo total conectado
    if (this.joinedAt) {
      const timeDiff = this.leftAt.getTime() - this.joinedAt.getTime();
      this.totalTimeConnected = Math.floor(timeDiff / 1000);
    }

    await this.save();
  }

  /**
   * Actualiza la última actividad del participante
   */
  public async updateActivity(connectionQuality?: any): Promise<void> {
    this.lastActivity = new Date();

    if (connectionQuality) {
      this.connectionQuality = connectionQuality;
    }

    await this.save();
  }

  /**
   * Verifica si el participante está actualmente conectado
   */
  public get isCurrentlyConnected(): boolean {
    return this.status === 'joined' && !this.leftAt;
  }

  /**
   * Obtiene el tiempo conectado actual
   */
  public get currentConnectedTime(): number {
    if (!this.joinedAt) return 0;

    const endTime = this.leftAt || new Date();
    const timeDiff = endTime.getTime() - this.joinedAt.getTime();

    return Math.floor(timeDiff / 1000);
  }

  /**
   * Verifica si el token de acceso es válido
   */
  public isAccessTokenValid(): boolean {
    // Token válido por 2 horas desde la creación
    const tokenExpiry = new Date(this.createdAt.getTime() + (2 * 60 * 60 * 1000));
    return new Date() < tokenExpiry;
  }

  /**
   * Genera un nuevo token de acceso
   */
  public async regenerateAccessToken(): Promise<string> {
    const crypto = await import('crypto');
    this.accessToken = crypto.randomBytes(32).toString('hex');
    await this.save();
    return this.accessToken;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      hybridEventId: this.hybridEventId,
      userId: this.userId,
      roomId: this.roomId,
      status: this.status,
      joinedAt: this.joinedAt,
      leftAt: this.leftAt,
      totalTimeConnected: this.totalTimeConnected,
      lastActivity: this.lastActivity,
      isModerator: this.isModerator,
      canChat: this.canChat,
      canQA: this.canQA,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas completas
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      deviceInfo: this.deviceInfo,
      connectionQuality: this.connectionQuality,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca participante por token de acceso
   */
  static async findByAccessToken(token: string): Promise<VirtualParticipant | null> {
    return this.findOne({
      where: { accessToken: token },
      include: [
        {
          model: HybridEvent,
          as: 'hybridEvent'
        },
        {
          model: User,
          as: 'user'
        },
        {
          model: VirtualRoom,
          as: 'room'
        }
      ]
    });
  }

  /**
   * Busca participantes activos en un evento
   */
  static async findActiveParticipants(hybridEventId: number): Promise<VirtualParticipant[]> {
    return this.findAll({
      where: {
        hybridEventId,
        status: 'joined'
      },
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: VirtualRoom,
          as: 'room'
        }
      ],
      order: [['joinedAt', 'ASC']]
    });
  }

  /**
   * Busca participantes por sala virtual
   */
  static async findByRoomId(roomId: number): Promise<VirtualParticipant[]> {
    return this.findAll({
      where: { roomId },
      include: [
        {
          model: User,
          as: 'user'
        }
      ],
      order: [['joinedAt', 'ASC']]
    });
  }

  /**
   * Cuenta participantes por evento
   */
  static async countByEvent(hybridEventId: number): Promise<{
    total: number;
    active: number;
    joined: number;
    invited: number;
  }> {
    const [total, active, joined, invited] = await Promise.all([
      this.count({ where: { hybridEventId } }),
      this.count({ where: { hybridEventId, status: 'joined' } }),
      this.count({ where: { hybridEventId, status: 'joined' } }),
      this.count({ where: { hybridEventId, status: 'invited' } })
    ]);

    return { total, active, joined, invited };
  }
}
