/**
 * @fileoverview Modelo de Token FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para tokens de autenticación FEL
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
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';

/**
 * Estados del token FEL
 */
export type FelTokenStatus =
  | 'active'          // Token activo y válido
  | 'expired'         // Token expirado
  | 'revoked'         // Token revocado
  | 'refreshing';     // Token siendo renovado

/**
 * Atributos del modelo Token FEL
 */
export interface FelTokenAttributes {
  id?: number;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: Date;
  status: FelTokenStatus;
  certificadorUrl: string;
  certificadorName: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de token FEL
 */
export interface FelTokenCreationAttributes extends Omit<FelTokenAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     FelToken:
 *       type: object
 *       required:
 *         - accessToken
 *         - tokenType
 *         - expiresIn
 *         - expiresAt
 *         - status
 *         - certificadorUrl
 *         - certificadorName
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del token FEL
 *           example: 1
 *         accessToken:
 *           type: string
 *           description: Token de acceso JWT del certificador
 *         refreshToken:
 *           type: string
 *           description: Token de refresco para renovar el access token
 *         tokenType:
 *           type: string
 *           description: Tipo de token (Bearer, etc.)
 *           example: "Bearer"
 *         expiresIn:
 *           type: integer
 *           description: Segundos hasta expiración
 *           example: 3600
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de expiración del token
 *         status:
 *           type: string
 *           enum: [active, expired, revoked, refreshing]
 *           description: Estado del token
 *           example: "active"
 *         certificadorUrl:
 *           type: string
 *           description: URL del certificador SAT
 *           example: "https://certificador.feel.com.gt"
 *         certificadorName:
 *           type: string
 *           description: Nombre del certificador
 *           example: "Infile"
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales del token
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
  tableName: 'fel_tokens',
  modelName: 'FelToken',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['access_token'],
      where: { deleted_at: null }
    },
    {
      fields: ['status']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['certificador_name']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class FelToken extends Model<FelTokenAttributes, FelTokenCreationAttributes> implements FelTokenAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El token de acceso es requerido'
    },
    len: {
      args: [10, 2000],
      msg: 'El token de acceso debe tener entre 10 y 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Token de acceso JWT proporcionado por el certificador'
  })
  declare accessToken: string;

  @Validate({
    len: {
      args: [0, 2000],
      msg: 'El token de refresco no puede exceder 2000 caracteres'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'Token de refresco para renovar el access token'
  })
  declare refreshToken?: string;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El tipo de token es requerido'
    },
    len: {
      args: [1, 50],
      msg: 'El tipo de token debe tener entre 1 y 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Tipo de token (Bearer, etc.)'
  })
  declare tokenType: string;

  @AllowNull(false)
  @Validate({
    min: {
      args: [1],
      msg: 'El tiempo de expiración debe ser mayor a 0'
    },
    max: {
      args: [86400], // 24 horas máximo
      msg: 'El tiempo de expiración no puede exceder 24 horas'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Segundos hasta que el token expire'
  })
  declare expiresIn: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora de expiración del token'
  })
  declare expiresAt: Date;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['active', 'expired', 'revoked', 'refreshing']],
      msg: 'Estado de token inválido'
    }
  })
  @Column({
    type: DataType.ENUM('active', 'expired', 'revoked', 'refreshing'),
    comment: 'Estado actual del token'
  })
  declare status: FelTokenStatus;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La URL del certificador es requerida'
    },
    isUrl: {
      msg: 'La URL del certificador debe tener formato válido'
    }
  })
  @Column({
    type: DataType.STRING(500),
    comment: 'URL base del certificador SAT'
  })
  declare certificadorUrl: string;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El nombre del certificador es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre del certificador debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre del certificador autorizado'
  })
  declare certificadorName: string;

  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales del token (scopes, permisos, etc.)'
  })
  declare metadata?: any;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación del registro'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de última actualización'
  })
  declare updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el token está expirado
   */
  public get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si el token está activo
   */
  public get isActive(): boolean {
    return this.status === 'active' && !this.isExpired;
  }

  /**
   * Calcula los segundos restantes hasta expiración
   */
  public get secondsUntilExpiration(): number {
    const now = new Date().getTime();
    const expires = this.expiresAt.getTime();
    const diff = expires - now;
    return Math.max(0, Math.floor(diff / 1000));
  }

  /**
   * Verifica si el token necesita ser renovado (menos de 5 minutos restantes)
   */
  public get needsRefresh(): boolean {
    return this.isActive && this.secondsUntilExpiration < 300; // 5 minutos
  }

  /**
   * Marca el token como expirado
   */
  public async markAsExpired(): Promise<void> {
    this.status = 'expired';
    await this.save();
  }

  /**
   * Marca el token como revocado
   */
  public async markAsRevoked(): Promise<void> {
    this.status = 'revoked';
    await this.save();
  }

  /**
   * Actualiza el token con nuevos valores
   */
  public async updateToken(accessToken: string, refreshToken: string | undefined, expiresIn: number): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.expiresAt = new Date(Date.now() + (expiresIn * 1000));
    this.status = 'active';
    await this.save();
  }

  /**
   * Serializa el token FEL para respuestas de API (sin datos sensibles)
   */
  public toFelTokenJSON(): object {
    return {
      id: this.id,
      tokenType: this.tokenType,
      expiresIn: this.expiresIn,
      expiresAt: this.expiresAt,
      status: this.status,
      certificadorUrl: this.certificadorUrl,
      certificadorName: this.certificadorName,
      metadata: this.metadata,
      secondsUntilExpiration: this.secondsUntilExpiration,
      needsRefresh: this.needsRefresh,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Obtiene el token activo más reciente
   */
  static async getActiveToken(certificadorName?: string): Promise<FelToken | null> {
    const where: any = {
      status: 'active',
      expiresAt: {
        [require('sequelize').Op.gt]: new Date()
      }
    };

    if (certificadorName) {
      where.certificadorName = certificadorName;
    }

    return this.findOne({
      where,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Obtiene tokens expirados para limpieza
   */
  static async getExpiredTokens(): Promise<FelToken[]> {
    return this.findAll({
      where: {
        status: 'active',
        expiresAt: {
          [require('sequelize').Op.lt]: new Date()
        }
      }
    });
  }

  /**
   * Revoca todos los tokens de un certificador
   */
  static async revokeAllTokens(certificadorName: string): Promise<number> {
    const [affectedRows] = await this.update(
      { status: 'revoked' },
      {
        where: {
          certificadorName,
          status: 'active'
        }
      }
    );

    return affectedRows;
  }

  /**
   * Obtiene estadísticas de tokens por certificador
   */
  static async getTokenStats(certificadorName?: string) {
    const { Op } = require('sequelize');
    const where: any = {};

    if (certificadorName) {
      where.certificadorName = certificadorName;
    }

    const tokens = await this.findAll({
      where,
      attributes: [
        'status',
        'certificadorName',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status', 'certificadorName'],
      raw: true
    });

    return tokens;
  }
}