/**
 * @fileoverview Modelo de Sala Virtual para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Sala Virtual con validaciones y métodos
 *
 * Archivo: backend/src/models/VirtualRoom.ts
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
import { User } from './User';
import { VirtualParticipant } from './VirtualParticipant';
import { VirtualRoomStatus, StreamingPlatform } from '../types/hybrid.types';
import { Op } from 'sequelize';

/**
 * Atributos del modelo Sala Virtual
 */
export interface VirtualRoomAttributes {
  id?: number;
  hybridEventId: number;
  name: string;
  description?: string;
  capacity: number;
  platform: StreamingPlatform;
  meetingId?: string;
  meetingPassword?: string;
  joinUrl?: string;
  startUrl?: string;
  streamUrl?: string;
  streamKey?: string;
  status: VirtualRoomStatus;
  moderators: number[];
  startTime?: Date;
  endTime?: Date;
  isPrivate: boolean;
  password?: string;
  settings?: any;
  isActive: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de sala virtual
 */
export interface VirtualRoomCreationAttributes extends Omit<VirtualRoomAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     VirtualRoom:
 *       type: object
 *       required:
 *         - hybridEventId
 *         - name
 *         - capacity
 *         - platform
 *         - status
 *         - moderators
 *         - isPrivate
 *         - isActive
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la sala virtual
 *           example: 1
 *         hybridEventId:
 *           type: integer
 *           description: ID del evento híbrido
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre de la sala
 *           example: "Sala Principal"
 *         capacity:
 *           type: integer
 *           description: Capacidad máxima de participantes
 *           example: 100
 *         platform:
 *           type: string
 *           enum: [zoom, google_meet, microsoft_teams, custom_streaming]
 *           description: Plataforma utilizada
 *           example: zoom
 *         status:
 *           type: string
 *           enum: [inactive, active, full, closed]
 *           description: Estado de la sala
 *           example: active
 *         isPrivate:
 *           type: boolean
 *           description: Si la sala es privada
 *           example: false
 */

@Table({
  tableName: 'virtual_rooms',
  modelName: 'VirtualRoom',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['hybrid_event_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['platform']
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
export class VirtualRoom extends Model<VirtualRoomAttributes, VirtualRoomCreationAttributes> implements VirtualRoomAttributes {
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

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la sala es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre de la sala virtual'
  })
  declare name: string;

  @Validate({
    len: {
      args: [0, 500],
      msg: 'La descripción no puede exceder 500 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Descripción de la sala virtual'
  })
  declare description?: string;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'La capacidad debe ser al menos 1'
    },
    max: {
      args: [1000],
      msg: 'La capacidad no puede exceder 1000'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad máxima de participantes'
  })
  declare capacity: number;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['zoom', 'google_meet', 'microsoft_teams', 'custom_streaming']],
      msg: 'La plataforma debe ser: zoom, google_meet, microsoft_teams o custom_streaming'
    }
  })
  @Column({
    type: DataType.ENUM('zoom', 'google_meet', 'microsoft_teams', 'custom_streaming'),
    comment: 'Plataforma de videoconferencia utilizada'
  })
  declare platform: StreamingPlatform;

  @Column({
    type: DataType.STRING(50),
    comment: 'ID de la reunión/meeting'
  })
  declare meetingId?: string;

  @Column({
    type: DataType.STRING(20),
    comment: 'Contraseña de la reunión'
  })
  declare meetingPassword?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de unión debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL para unirse a la sala'
  })
  declare joinUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL de inicio debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL para iniciar la reunión (solo moderadores)'
  })
  declare startUrl?: string;

  @Validate({
    isUrl: {
      msg: 'La URL del stream debe ser válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del streaming personalizado'
  })
  declare streamUrl?: string;

  @Column({
    type: DataType.STRING(255),
    comment: 'Clave del streaming personalizado'
  })
  declare streamKey?: string;

  @AllowNull(false)
  @Default('inactive')
  @Validate({
    isIn: {
      args: [['inactive', 'active', 'full', 'closed']],
      msg: 'El estado debe ser: inactive, active, full o closed'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('inactive', 'active', 'full', 'closed'),
    comment: 'Estado actual de la sala virtual'
  })
  declare status: VirtualRoomStatus;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    comment: 'Array de IDs de moderadores'
  })
  declare moderators: number[];

  @Column({
    type: DataType.DATE,
    comment: 'Hora programada de inicio'
  })
  declare startTime?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Hora programada de fin'
  })
  declare endTime?: Date;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la sala es privada (requiere invitación)'
  })
  declare isPrivate: boolean;

  @Validate({
    len: {
      args: [4, 20],
      msg: 'La contraseña debe tener entre 4 y 20 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Contraseña para acceder a sala privada'
  })
  declare password?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Configuraciones adicionales de la sala'
  })
  declare settings?: any;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la sala está activa'
  })
  declare isActive: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la sala'
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

  @HasMany(() => VirtualParticipant)
  declare participants: VirtualParticipant[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateRoomConfig(room: VirtualRoom): Promise<void> {
    // Validar URLs según plataforma
    if (room.platform === 'zoom' && !room.joinUrl) {
      throw new Error('Las salas Zoom requieren URL de reunión');
    }

    if (room.platform === 'google_meet' && !room.joinUrl) {
      throw new Error('Las salas Google Meet requieren URL de reunión');
    }

    if (room.platform === 'custom_streaming' && !room.streamUrl) {
      throw new Error('Las salas de streaming personalizado requieren URL de stream');
    }

    // Validar horarios
    if (room.startTime && room.endTime && room.endTime <= room.startTime) {
      throw new Error('La hora de fin debe ser posterior a la hora de inicio');
    }

    // Validar moderadores
    if (!room.moderators || room.moderators.length === 0) {
      throw new Error('La sala debe tener al menos un moderador');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la sala está disponible para unirse
   */
  public get isAvailableToJoin(): boolean {
    if (!this.isActive || this.status === 'closed') return false;

    const now = new Date();
    const hasStarted = !this.startTime || now >= this.startTime;
    const hasEnded = this.endTime && now > this.endTime;

    return hasStarted && !hasEnded && this.status !== 'full';
  }

  /**
   * Verifica si un usuario es moderador
   */
  public isModerator(userId: number): boolean {
    return this.moderators.includes(userId);
  }

  /**
   * Obtiene el número de participantes activos
   */
  public async getActiveParticipantsCount(): Promise<number> {
    // Este método debería contar los participantes activos
    // Por ahora retorna 0, se implementará cuando tengamos las relaciones
    return 0;
  }

  /**
   * Verifica si la sala tiene capacidad disponible
   */
  public async hasAvailableCapacity(): Promise<boolean> {
    const activeCount = await this.getActiveParticipantsCount();
    return activeCount < this.capacity;
  }

  /**
   * Actualiza el estado de la sala basado en capacidad
   */
  public async updateStatusBasedOnCapacity(): Promise<void> {
    const activeCount = await this.getActiveParticipantsCount();

    let newStatus: VirtualRoomStatus = VirtualRoomStatus.ACTIVE;

    if (activeCount >= this.capacity) {
      newStatus = VirtualRoomStatus.FULL;
    } else if (activeCount === 0) {
      newStatus = VirtualRoomStatus.INACTIVE;
    }

    if (this.status !== newStatus) {
      this.status = newStatus;
      await this.save();
    }
  }

  /**
   * Genera URL de acceso para un participante
   */
  public generateAccessUrl(participantId: number): string {
    const baseUrl = this.joinUrl || this.streamUrl;
    if (!baseUrl) return '';

    // Agregar parámetros de acceso
    const params = new URLSearchParams({
      roomId: this.id.toString(),
      participantId: participantId.toString(),
      timestamp: Date.now().toString()
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Verifica si la contraseña es correcta
   */
  public verifyPassword(password: string): boolean {
    if (!this.isPrivate || !this.password) return true;
    return this.password === password;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      hybridEventId: this.hybridEventId,
      name: this.name,
      description: this.description,
      capacity: this.capacity,
      platform: this.platform,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      isPrivate: this.isPrivate,
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
      meetingId: this.meetingId,
      joinUrl: this.joinUrl,
      moderators: this.moderators,
      settings: this.settings,
      creator: this.creator?.toPublicJSON(),
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca salas por evento híbrido
   */
  static async findByHybridEventId(hybridEventId: number, activeOnly: boolean = true): Promise<VirtualRoom[]> {
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
      order: [['createdAt', 'ASC']]
    });
  }

  /**
   * Busca salas activas disponibles
   */
  static async findAvailableRooms(hybridEventId: number): Promise<VirtualRoom[]> {
    return this.findAll({
      where: {
        hybridEventId,
        isActive: true,
        status: [VirtualRoomStatus.INACTIVE, VirtualRoomStatus.ACTIVE]
      },
      include: [
        {
          model: User,
          as: 'creator'
        }
      ],
      order: [['name', 'ASC']]
    });
  }

  /**
   * Busca sala por ID de reunión externa
   */
  static async findByMeetingId(meetingId: string): Promise<VirtualRoom | null> {
    return this.findOne({
      where: { meetingId }
    });
  }
}