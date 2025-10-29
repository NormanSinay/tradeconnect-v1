/**
 * @fileoverview Modelo de Evento Híbrido para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Evento Híbrido con validaciones y métodos
 *
 * Archivo: backend/src/models/HybridEvent.ts
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
import { Event } from './Event';
import { User } from './User';
import { VirtualRoom } from './VirtualRoom';
import { VirtualParticipant } from './VirtualParticipant';
import { HybridModality, StreamingPlatform } from '../types/hybrid.types';

/**
 * Atributos del modelo Evento Híbrido
 */
export interface HybridEventAttributes {
  id?: number;
  eventId: number;
  modality: HybridModality;
  presentialCapacity?: number;
  virtualCapacity?: number;
  presentialPrice?: number;
  virtualPrice?: number;
  streamingPlatform: StreamingPlatform;
  zoomMeetingId?: string;
  zoomMeetingPassword?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  googleMeetUrl?: string;
  teamsMeetingUrl?: string;
  teamsMeetingId?: string;
  teamsJoinUrl?: string;
  jitsiRoomName?: string;
  jitsiDomain?: string;
  jitsiJwtToken?: string;
  jitsiModeratorPassword?: string;
  jitsiUserPassword?: string;
  customStreamUrl?: string;
  customStreamKey?: string;
  recordingEnabled: boolean;
  recordingRetentionDays: number;
  chatEnabled: boolean;
  qaEnabled: boolean;
  pollsEnabled: boolean;
  timezone: string;
  streamDelaySeconds: number;
  isActive: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de evento híbrido
 */
export interface HybridEventCreationAttributes extends Omit<HybridEventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     HybridEvent:
 *       type: object
 *       required:
 *         - eventId
 *         - modality
 *         - streamingPlatform
 *         - recordingEnabled
 *         - chatEnabled
 *         - qaEnabled
 *         - pollsEnabled
 *         - timezone
 *         - streamDelaySeconds
 *         - isActive
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del evento híbrido
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento base
 *           example: 1
 *         modality:
 *           type: string
 *           enum: [presential_only, virtual_only, hybrid]
 *           description: Modalidad del evento
 *           example: hybrid
 *         presentialCapacity:
 *           type: integer
 *           description: Capacidad para asistentes presenciales
 *           example: 100
 *         virtualCapacity:
 *           type: integer
 *           description: Capacidad para asistentes virtuales
 *           example: 500
 *         streamingPlatform:
 *           type: string
 *           enum: [zoom, google_meet, microsoft_teams, custom_streaming]
 *           description: Plataforma de streaming utilizada
 *           example: zoom
 *         recordingEnabled:
 *           type: boolean
 *           description: Si las grabaciones están habilitadas
 *           example: true
 *         chatEnabled:
 *           type: boolean
 *           description: Si el chat está habilitado
 *           example: true
 *         qaEnabled:
 *           type: boolean
 *           description: Si Q&A está habilitado
 *           example: true
 *         timezone:
 *           type: string
 *           description: Zona horaria del evento
 *           example: America/Guatemala
 */

@Table({
  tableName: 'hybrid_events',
  modelName: 'HybridEvent',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['event_id'],
      where: { deleted_at: null }
    },
    {
      fields: ['modality']
    },
    {
      fields: ['streaming_platform']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class HybridEvent extends Model<HybridEventAttributes, HybridEventCreationAttributes> implements HybridEventAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento base'
  })
  declare eventId: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['presential_only', 'virtual_only', 'hybrid']],
      msg: 'La modalidad debe ser: presential_only, virtual_only o hybrid'
    }
  })
  @Column({
    type: DataType.ENUM('presential_only', 'virtual_only', 'hybrid'),
    comment: 'Modalidad del evento híbrido'
  })
  declare modality: HybridModality;

  @Validate({
    min: {
      args: [1],
      msg: 'La capacidad presencial debe ser al menos 1'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad máxima para asistentes presenciales'
  })
  declare presentialCapacity?: number;

  @Validate({
    min: {
      args: [1],
      msg: 'La capacidad virtual debe ser al menos 1'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad máxima para asistentes virtuales'
  })
  declare virtualCapacity?: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El precio presencial no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio adicional para modalidad presencial'
  })
  declare presentialPrice?: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El precio virtual no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    comment: 'Precio adicional para modalidad virtual'
  })
  declare virtualPrice?: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['zoom', 'google_meet', 'microsoft_teams', 'jitsi', 'custom_streaming']],
      msg: 'La plataforma debe ser: zoom, google_meet, microsoft_teams, jitsi o custom_streaming'
    }
  })
  @Column({
    type: DataType.ENUM('zoom', 'google_meet', 'microsoft_teams', 'jitsi', 'custom_streaming'),
    comment: 'Plataforma de streaming utilizada'
  })
  declare streamingPlatform: StreamingPlatform;

  @Column({
    type: DataType.STRING(50),
    comment: 'ID de la reunión de Zoom'
  })
  declare zoomMeetingId?: string;

  @Column({
    type: DataType.STRING(20),
    comment: 'Contraseña de la reunión de Zoom'
  })
  declare zoomMeetingPassword?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de Zoom debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL para unirse a la reunión de Zoom'
  })
  declare zoomJoinUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de inicio de Zoom debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL para iniciar la reunión de Zoom'
  })
  declare zoomStartUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de Google Meet debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de la reunión de Google Meet'
  })
  declare googleMeetUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de Teams debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL de la reunión de Microsoft Teams'
  })
  declare teamsMeetingUrl?: string;

  @Column({
    type: DataType.STRING(100),
    comment: 'ID de la reunión de Microsoft Teams'
  })
  declare teamsMeetingId?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de Teams debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL para unirse a la reunión de Microsoft Teams'
  })
  declare teamsJoinUrl?: string;

  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre de la sala Jitsi'
  })
  declare jitsiRoomName?: string;

  @Validate({
    isUrl: {
      msg: 'El dominio de Jitsi debe ser válido'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Dominio de Jitsi'
  })
  declare jitsiDomain?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Token JWT para Jitsi'
  })
  declare jitsiJwtToken?: string;

  @Column({
    type: DataType.STRING(50),
    comment: 'Contraseña de moderador para Jitsi'
  })
  declare jitsiModeratorPassword?: string;

  @Column({
    type: DataType.STRING(50),
    comment: 'Contraseña de usuario para Jitsi'
  })
  declare jitsiUserPassword?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de streaming personalizado debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del streaming personalizado'
  })
  declare customStreamUrl?: string;

  @Column({
    type: DataType.STRING(255),
    comment: 'Clave del streaming personalizado'
  })
  declare customStreamKey?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si las grabaciones están habilitadas'
  })
  declare recordingEnabled: boolean;

  @Default(30)
  @Validate({
    min: {
      args: [1],
      msg: 'Los días de retención deben ser al menos 1'
    },
    max: {
      args: [365],
      msg: 'Los días de retención no pueden exceder 365'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Días para mantener las grabaciones'
  })
  declare recordingRetentionDays: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el chat está habilitado'
  })
  declare chatEnabled: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si Q&A está habilitado'
  })
  declare qaEnabled: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si las encuestas están habilitadas'
  })
  declare pollsEnabled: boolean;

  @Default('America/Guatemala')
  @Column({
    type: DataType.STRING(50),
    comment: 'Zona horaria del evento'
  })
  declare timezone: string;

  @Default(5)
  @Validate({
    min: {
      args: [0],
      msg: 'El delay del stream no puede ser negativo'
    },
    max: {
      args: [30],
      msg: 'El delay del stream no puede exceder 30 segundos'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Delay del stream en segundos'
  })
  declare streamDelaySeconds: number;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la configuración híbrida está activa'
  })
  declare isActive: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la configuración híbrida'
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

  @BelongsTo(() => Event)
  declare event: Event;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;

  @HasMany(() => VirtualRoom)
  declare virtualRooms: VirtualRoom[];

  @HasMany(() => VirtualParticipant)
  declare virtualParticipants: VirtualParticipant[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateHybridConfig(hybridEvent: HybridEvent): Promise<void> {
    // Validar que al menos una modalidad esté disponible
    if (hybridEvent.modality === 'presential_only' && !hybridEvent.presentialCapacity) {
      throw new Error('Los eventos presenciales requieren capacidad definida');
    }

    if (hybridEvent.modality === 'virtual_only' && !hybridEvent.virtualCapacity) {
      throw new Error('Los eventos virtuales requieren capacidad definida');
    }

    if (hybridEvent.modality === 'hybrid' && (!hybridEvent.presentialCapacity || !hybridEvent.virtualCapacity)) {
      throw new Error('Los eventos híbridos requieren capacidades presencial y virtual definidas');
    }

    // Validar URLs según plataforma
    if (hybridEvent.streamingPlatform === 'zoom' && !hybridEvent.zoomJoinUrl) {
      throw new Error('Los eventos con Zoom requieren URL de reunión');
    }

    if (hybridEvent.streamingPlatform === 'google_meet' && !hybridEvent.googleMeetUrl) {
      throw new Error('Los eventos con Google Meet requieren URL de reunión');
    }

    if (hybridEvent.streamingPlatform === 'microsoft_teams' && !hybridEvent.teamsMeetingUrl) {
      throw new Error('Los eventos con Microsoft Teams requieren URL de reunión');
    }

    if (hybridEvent.streamingPlatform === 'jitsi' && (!hybridEvent.jitsiRoomName || !hybridEvent.jitsiDomain)) {
      throw new Error('Los eventos con Jitsi requieren nombre de sala y dominio');
    }

    if (hybridEvent.streamingPlatform === 'custom_streaming' && !hybridEvent.customStreamUrl) {
      throw new Error('Los eventos con streaming personalizado requieren URL de stream');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el evento híbrido está disponible para registro
   */
  public get isAvailableForRegistration(): boolean {
    if (!this.isActive) return false;

    const event = this.event;
    if (!event || !event.isAvailableForRegistration) return false;

    // Verificar capacidades según modalidad
    if (this.modality === 'presential_only' && this.presentialCapacity) {
      return event.registeredCount < this.presentialCapacity;
    }

    if (this.modality === 'virtual_only' && this.virtualCapacity) {
      return this.getVirtualRegistrationsCount() < this.virtualCapacity;
    }

    if (this.modality === 'hybrid') {
      const presentialAvailable = this.presentialCapacity ? event.registeredCount < this.presentialCapacity : false;
      const virtualAvailable = this.virtualCapacity ? this.getVirtualRegistrationsCount() < this.virtualCapacity : false;
      return presentialAvailable || virtualAvailable;
    }

    return false;
  }

  /**
   * Obtiene el número de lugares disponibles por modalidad
   */
  public getAvailableSpots(modality: 'presential' | 'virtual'): number | null {
    if (modality === 'presential') {
      if (!this.presentialCapacity) return null;
      return Math.max(0, this.presentialCapacity - (this.event?.registeredCount || 0));
    }

    if (modality === 'virtual') {
      if (!this.virtualCapacity) return null;
      return Math.max(0, this.virtualCapacity - this.getVirtualRegistrationsCount());
    }

    return null;
  }

  /**
   * Obtiene el precio según modalidad
   */
  public getPrice(modality: 'presential' | 'virtual'): number {
    const basePrice = this.event?.price || 0;

    if (modality === 'presential') {
      return basePrice + (this.presentialPrice || 0);
    }

    if (modality === 'virtual') {
      return basePrice + (this.virtualPrice || 0);
    }

    return basePrice;
  }

  /**
   * Verifica si una plataforma específica está configurada
   */
  public isPlatformConfigured(platform: StreamingPlatform): boolean {
    switch (platform) {
      case 'zoom':
        return !!(this.zoomMeetingId && this.zoomJoinUrl);
      case 'google_meet':
        return !!this.googleMeetUrl;
      case 'microsoft_teams':
        return !!this.teamsMeetingUrl;
      case 'jitsi':
        return !!(this.jitsiRoomName && this.jitsiDomain);
      case 'custom_streaming':
        return !!(this.customStreamUrl && this.customStreamKey);
      default:
        return false;
    }
  }

  /**
   * Obtiene la URL de acceso según plataforma
   */
  public getAccessUrl(platform?: StreamingPlatform): string | null {
    const targetPlatform = platform || this.streamingPlatform;

    switch (targetPlatform) {
      case 'zoom':
        return this.zoomJoinUrl || null;
      case 'google_meet':
        return this.googleMeetUrl || null;
      case 'microsoft_teams':
        return this.teamsJoinUrl || this.teamsMeetingUrl || null;
      case 'jitsi':
        return this.jitsiDomain ? `https://${this.jitsiDomain}/${this.jitsiRoomName}` : null;
      case 'custom_streaming':
        return this.customStreamUrl || null;
      default:
        return null;
    }
  }

  /**
   * Cuenta las inscripciones virtuales activas
   */
  private getVirtualRegistrationsCount(): number {
    // Este método debería contar las inscripciones virtuales activas
    // Por ahora retorna 0, se implementará cuando tengamos las relaciones
    return 0;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      modality: this.modality,
      presentialCapacity: this.presentialCapacity,
      virtualCapacity: this.virtualCapacity,
      presentialPrice: this.presentialPrice,
      virtualPrice: this.virtualPrice,
      streamingPlatform: this.streamingPlatform,
      recordingEnabled: this.recordingEnabled,
      chatEnabled: this.chatEnabled,
      qaEnabled: this.qaEnabled,
      pollsEnabled: this.pollsEnabled,
      timezone: this.timezone,
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
      zoomMeetingId: this.zoomMeetingId,
      googleMeetUrl: this.googleMeetUrl,
      teamsMeetingUrl: this.teamsMeetingUrl,
      teamsMeetingId: this.teamsMeetingId,
      teamsJoinUrl: this.teamsJoinUrl,
      jitsiRoomName: this.jitsiRoomName,
      jitsiDomain: this.jitsiDomain,
      customStreamUrl: this.customStreamUrl,
      recordingRetentionDays: this.recordingRetentionDays,
      streamDelaySeconds: this.streamDelaySeconds,
      creator: this.creator?.toPublicJSON(),
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca configuración híbrida por evento
   */
  static async findByEventId(eventId: number): Promise<HybridEvent | null> {
    return this.findOne({
      where: { eventId, isActive: true },
      include: [
        {
          model: Event,
          as: 'event'
        },
        {
          model: User,
          as: 'creator'
        }
      ]
    });
  }

  /**
   * Busca eventos híbridos activos
   */
  static async findActiveHybridEvents(options: {
    limit?: number;
    offset?: number;
    modality?: HybridModality;
    platform?: StreamingPlatform;
  } = {}): Promise<{ rows: HybridEvent[]; count: number }> {
    const {
      limit = 20,
      offset = 0,
      modality,
      platform
    } = options;

    const where: any = { isActive: true };

    if (modality) {
      where.modality = modality;
    }

    if (platform) {
      where.streamingPlatform = platform;
    }

    return this.findAndCountAll({
      where,
      include: [
        {
          model: Event,
          as: 'event',
          where: {
            startDate: { $gte: new Date() }
          }
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }
}
