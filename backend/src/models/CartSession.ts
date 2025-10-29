/**
 * @fileoverview Modelo de CartSession para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad CartSession con validaciones y métodos
 *
 * Archivo: backend/src/models/CartSession.ts
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
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey,
  Index
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from './User';
import { Cart } from './Cart';

/**
 * Atributos del modelo CartSession
 */
export interface CartSessionAttributes {
  id?: number;
  sessionId: string;
  userId?: number;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de cart session
 */
export interface CartSessionCreationAttributes extends Omit<CartSessionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CartSession:
 *       type: object
 *       required:
 *         - sessionId
 *         - lastActivity
 *         - expiresAt
 *         - isActive
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la sesión del carrito
 *           example: 1
 *         sessionId:
 *           type: string
 *           description: ID de la sesión del carrito
 *           example: "sess_1234567890"
 *         userId:
 *           type: integer
 *           description: ID del usuario (opcional)
 *         deviceFingerprint:
 *           type: string
 *           description: Fingerprint del dispositivo
 *         ipAddress:
 *           type: string
 *           description: Dirección IP del usuario
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: Última actividad en la sesión
 *         isActive:
 *           type: boolean
 *           description: Indica si la sesión está activa
 */

@Table({
  tableName: 'cart_sessions',
  modelName: 'CartSession',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['session_id'],
      unique: true
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['device_fingerprint']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['last_activity']
    }
  ]
})
export class CartSession extends Model<CartSessionAttributes, CartSessionCreationAttributes> implements CartSessionAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El ID de sesión es requerido'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID único de sesión del carrito',
    unique: true
  })
  declare sessionId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario (opcional para usuarios no registrados)'
  })
  declare userId?: number;

  @Validate({
    len: {
      args: [0, 255],
      msg: 'El fingerprint del dispositivo no puede exceder 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Fingerprint único del dispositivo para sincronización'
  })
  declare deviceFingerprint?: string;

  @Validate({
    isIP: {
      msg: 'La dirección IP debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(45),
    comment: 'Dirección IP del usuario (soporta IPv4 e IPv6)'
  })
  declare ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    comment: 'User-Agent del navegador/dispositivo'
  })
  declare userAgent?: string;

  @AllowNull(false)
  @Default(() => new Date())
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Última actividad en la sesión'
  })
  declare lastActivity: Date;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de la sesión'
  })
  declare expiresAt: Date;

  @AllowNull(false)
  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la sesión está activa'
  })
  declare isActive: boolean;

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

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @BelongsTo(() => Cart, 'sessionId')
  declare cart: Cart;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateUniqueSessionId(instance: CartSession): Promise<void> {
    if (instance.sessionId) {
      const existing = await CartSession.findOne({
        where: {
          sessionId: instance.sessionId,
          id: { [Op.ne]: instance.id || 0 }
        }
      });
      if (existing) {
        throw new Error('Ya existe una sesión con este ID');
      }
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la sesión está expirada
   */
  public get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si la sesión está inactiva
   */
  public get isInactive(): boolean {
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutos
    return (new Date().getTime() - this.lastActivity.getTime()) > inactiveThreshold;
  }

  /**
   * Actualiza la última actividad
   */
  public updateActivity(): void {
    this.lastActivity = new Date();
  }

  /**
   * Desactiva la sesión
   */
  public deactivate(): void {
    this.isActive = false;
  }

  /**
   * Serializa la sesión para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      sessionId: this.sessionId,
      userId: this.userId,
      deviceFingerprint: this.deviceFingerprint,
      lastActivity: this.lastActivity,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Genera un ID único de sesión
   */
  static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `sess_${timestamp}_${random}`;
  }

  /**
   * Busca o crea una sesión por fingerprint de dispositivo
   */
  static async findOrCreateByFingerprint(
    deviceFingerprint: string,
    userId?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CartSession> {
    let session = await this.findOne({
      where: {
        deviceFingerprint,
        isActive: true,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!session) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      session = await this.create({
        sessionId: this.generateSessionId(),
        userId,
        deviceFingerprint,
        ipAddress,
        userAgent,
        lastActivity: new Date(),
        expiresAt,
        isActive: true
      });
    } else {
      // Actualizar información si cambió
      if (userId && !session.userId) {
        session.userId = userId;
      }
      if (ipAddress && !session.ipAddress) {
        session.ipAddress = ipAddress;
      }
      if (userAgent && !session.userAgent) {
        session.userAgent = userAgent;
      }
      session.updateActivity();
      await session.save();
    }

    return session;
  }

  /**
   * Encuentra sesiones expiradas para limpiar
   */
  static async findExpiredSessions(): Promise<CartSession[]> {
    return this.findAll({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
  }

  /**
   * Encuentra sesiones inactivas
   */
  static async findInactiveSessions(minutesInactive: number = 30): Promise<CartSession[]> {
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() - minutesInactive);

    return this.findAll({
      where: {
        isActive: true,
        lastActivity: {
          [Op.lt]: threshold
        }
      }
    });
  }

  /**
   * Limpia sesiones expiradas
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await this.update(
      { isActive: false },
      {
        where: {
          expiresAt: {
            [Op.lt]: new Date()
          },
          isActive: true
        }
      }
    );
    return result[0];
  }

  /**
   * Desactiva sesiones inactivas
   */
  static async deactivateInactiveSessions(minutesInactive: number = 60): Promise<number> {
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() - minutesInactive);

    const result = await this.update(
      { isActive: false },
      {
        where: {
          isActive: true,
          lastActivity: {
            [Op.lt]: threshold
          }
        }
      }
    );
    return result[0];
  }
}
