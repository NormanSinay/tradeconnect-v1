/**
 * @fileoverview Modelo de TwoFactorAuth para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para gestión de autenticación de dos factores
 *
 * Archivo: backend/src/models/TwoFactorAuth.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  BeforeCreate
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo TwoFactorAuth
 */
export interface TwoFactorAuthAttributes {
  id?: number;
  userId: number;
  secret: string;
  backupCodes: string[];
  isEnabled: boolean;
  method: 'totp' | 'sms' | 'email';
  phoneNumber?: string;
  emailAddress?: string;
  lastUsedAt?: Date;
  failedAttempts: number;
  lockedUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de 2FA
 */
export interface TwoFactorAuthCreationAttributes extends Omit<TwoFactorAuthAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     TwoFactorAuth:
 *       type: object
 *       required:
 *         - userId
 *         - secret
 *         - method
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del registro 2FA
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario
 *           example: 123
 *         secret:
 *           type: string
 *           description: Secret para generar códigos TOTP
 *           example: "JBSWY3DPEHPK3PXP"
 *         backupCodes:
 *           type: array
 *           items:
 *             type: string
 *           description: Códigos de respaldo de emergencia
 *           example: ["12345678", "87654321"]
 *         isEnabled:
 *           type: boolean
 *           description: Si 2FA está habilitado
 *           default: false
 *         method:
 *           type: string
 *           enum: [totp, sms, email]
 *           description: Método de 2FA utilizado
 *           example: "totp"
 *         phoneNumber:
 *           type: string
 *           description: Número de teléfono para SMS 2FA
 *           example: "+502 1234-5678"
 *         emailAddress:
 *           type: string
 *           description: Email alternativo para 2FA
 *           example: "backup@email.com"
 *         lastUsedAt:
 *           type: string
 *           format: date-time
 *           description: Última vez que se usó 2FA
 *         failedAttempts:
 *           type: integer
 *           description: Intentos fallidos consecutivos
 *           default: 0
 *         lockedUntil:
 *           type: string
 *           format: date-time
 *           description: Hasta cuándo está bloqueado el 2FA
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
  tableName: 'two_factor_auth',
  modelName: 'TwoFactorAuth',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['is_enabled']
    },
    {
      fields: ['method']
    },
    {
      fields: ['last_used_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class TwoFactorAuth extends Model<TwoFactorAuthAttributes, TwoFactorAuthCreationAttributes> implements TwoFactorAuthAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index({ unique: true })
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario propietario del 2FA'
  })
  declare userId: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(32),
    comment: 'Secret para generar códigos TOTP (base32)'
  })
  declare secret: string;

  @Default([])
  @Column({
    type: DataType.JSON,
    comment: 'Códigos de respaldo de emergencia (hasheados)'
  })
  declare backupCodes: string[];

  @Default(false)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si 2FA está habilitado para el usuario'
  })
  declare isEnabled: boolean;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['totp', 'sms', 'email']],
      msg: 'El método debe ser totp, sms o email'
    }
  })
  @Column({
    type: DataType.STRING(10),
    comment: 'Método de autenticación 2FA'
  })
  declare method: 'totp' | 'sms' | 'email';

  @Validate({
    is: {
      args: /^\+502\s?\d{4}-?\d{4}$/,
      msg: 'El teléfono debe tener formato guatemalteco válido (+502 1234-5678)'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Número de teléfono para SMS 2FA'
  })
  declare phoneNumber?: string;

  @Validate({
    isEmail: {
      msg: 'El email debe tener un formato válido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email alternativo para 2FA'
  })
  declare emailAddress?: string;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Última vez que se utilizó exitosamente el 2FA'
  })
  declare lastUsedAt?: Date;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de intentos fallidos consecutivos'
  })
  declare failedAttempts: number;

  @Column({
    type: DataType.DATE,
    comment: 'Hasta cuándo está temporalmente bloqueado el 2FA'
  })
  declare lockedUntil?: Date;

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación del registro 2FA'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de última actualización'
  })
  declare updatedAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User)
  declare user: User;

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  static async generateSecret(twoFactorAuth: TwoFactorAuth): Promise<void> {
    if (!twoFactorAuth.secret) {
      // Generar secret base32 de 32 caracteres
      const crypto = require('crypto');
      twoFactorAuth.secret = crypto.randomBytes(20).toString('base32').toUpperCase();
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el 2FA está temporalmente bloqueado
   */
  public get isLocked(): boolean {
    if (!this.lockedUntil) {
      return false;
    }
    return new Date() < this.lockedUntil;
  }

  /**
   * Incrementa los intentos fallidos y bloquea si es necesario
   */
  public async incrementFailedAttempts(): Promise<void> {
    this.failedAttempts += 1;

    // Bloquear después de 5 intentos fallidos por 30 minutos
    if (this.failedAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }

    await this.save();
  }

  /**
   * Resetea los intentos fallidos después de un éxito
   */
  public async resetFailedAttempts(): Promise<void> {
    if (this.failedAttempts > 0) {
      this.failedAttempts = 0;
      this.lockedUntil = undefined;
      this.lastUsedAt = new Date();
      await this.save();
    }
  }

  /**
   * Genera códigos de respaldo de emergencia
   */
  public generateBackupCodes(count: number = 10): string[] {
    const crypto = require('crypto');
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generar código de 8 dígitos
      const code = crypto.randomInt(10000000, 99999999).toString();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Hashea códigos de respaldo para almacenamiento seguro
   */
  public hashBackupCodes(codes: string[]): string[] {
    const bcrypt = require('bcryptjs');
    return codes.map(code => bcrypt.hashSync(code, 12));
  }

  /**
   * Verifica si un código de respaldo es válido
   */
  public async verifyBackupCode(code: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');

    for (let i = 0; i < this.backupCodes.length; i++) {
      const isValid = await bcrypt.compare(code, this.backupCodes[i]);
      if (isValid) {
        // Remover el código usado
        this.backupCodes.splice(i, 1);
        await this.resetFailedAttempts();
        await this.save();
        return true;
      }
    }

    await this.incrementFailedAttempts();
    return false;
  }

  /**
   * Regenera códigos de respaldo
   */
  public async regenerateBackupCodes(): Promise<string[]> {
    const newCodes = this.generateBackupCodes();
    this.backupCodes = this.hashBackupCodes(newCodes);
    await this.save();
    return newCodes;
  }

  /**
   * Habilita 2FA para el usuario
   */
  public async enable(): Promise<void> {
    this.isEnabled = true;
    this.failedAttempts = 0;
    this.lockedUntil = undefined;
    await this.save();
  }

  /**
   * Deshabilita 2FA para el usuario
   */
  public async disable(): Promise<void> {
    this.isEnabled = false;
    this.secret = '';
    this.backupCodes = [];
    this.failedAttempts = 0;
    this.lockedUntil = undefined;
    await this.save();
  }

  /**
   * Obtiene información del método 2FA
   */
  public get methodInfo(): object {
    const info: any = {
      method: this.method,
      isEnabled: this.isEnabled,
      lastUsedAt: this.lastUsedAt
    };

    switch (this.method) {
      case 'sms':
        info.phoneNumber = this.phoneNumber;
        break;
      case 'email':
        info.emailAddress = this.emailAddress;
        break;
      case 'totp':
        // No incluir información adicional para TOTP por seguridad
        break;
    }

    return info;
  }

  /**
   * Serializa para respuestas de API (sin datos sensibles)
   */
  public toJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      isEnabled: this.isEnabled,
      method: this.method,
      methodInfo: this.methodInfo,
      lastUsedAt: this.lastUsedAt,
      failedAttempts: this.failedAttempts,
      isLocked: this.isLocked,
      lockedUntil: this.lockedUntil,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca configuración 2FA por userId
   */
  static async findByUserId(userId: number): Promise<TwoFactorAuth | null> {
    return this.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
  }

  /**
   * Crea o actualiza configuración 2FA para un usuario
   */
  static async upsertForUser(userId: number, data: Partial<TwoFactorAuthCreationAttributes>): Promise<TwoFactorAuth> {
    const upsertData: any = { userId };

    // Only include defined values
    if (data.secret !== undefined) upsertData.secret = data.secret;
    if (data.backupCodes !== undefined) upsertData.backupCodes = data.backupCodes;
    if (data.isEnabled !== undefined) upsertData.isEnabled = data.isEnabled;
    if (data.method !== undefined) upsertData.method = data.method;
    if (data.phoneNumber !== undefined) upsertData.phoneNumber = data.phoneNumber;
    if (data.emailAddress !== undefined) upsertData.emailAddress = data.emailAddress;
    if (data.lastUsedAt !== undefined) upsertData.lastUsedAt = data.lastUsedAt;
    if (data.failedAttempts !== undefined) upsertData.failedAttempts = data.failedAttempts;
    if (data.lockedUntil !== undefined) upsertData.lockedUntil = data.lockedUntil;

    const [twoFactorAuth, created] = await this.upsert(upsertData);

    return twoFactorAuth;
  }

  /**
   * Obtiene estadísticas de uso de 2FA
   */
  static async get2FAStats(): Promise<any> {
    const stats = await this.findAll({
      attributes: [
        'method',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM',
          this.sequelize!.literal('CASE WHEN is_enabled = true THEN 1 ELSE 0 END')
        ), 'enabledCount']
      ],
      group: ['method'],
      raw: true
    });

    return stats;
  }

  /**
   * Obtiene usuarios con 2FA habilitado
   */
  static async getUsersWith2FAEnabled(): Promise<TwoFactorAuth[]> {
    return this.findAll({
      where: { isEnabled: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });
  }

  /**
   * Limpia configuraciones 2FA expiradas o bloqueadas
   */
  static async cleanupExpiredLocks(): Promise<number> {
    const now = new Date();

    const [affectedRows] = await this.update(
      {
        lockedUntil: undefined,
        failedAttempts: 0
      },
      {
        where: {
          lockedUntil: { $lt: now }
        }
      }
    );

    return affectedRows;
  }

  /**
   * Verifica código TOTP
   */
  static verifyTOTPCode(secret: string, code: string): boolean {
    try {
      const speakeasy = require('speakeasy');
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2 // Permitir 30 segundos de tolerancia
      });
    } catch (error) {
      console.error('Error verifying TOTP code:', error);
      return false;
    }
  }

  /**
   * Genera URL para QR code de TOTP
   */
  static generateTOTPUrl(secret: string, email: string, issuer: string = 'TradeConnect'): string {
    const speakeasy = require('speakeasy');
    return speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      label: `${issuer}:${email}`,
      issuer: issuer
    });
  }
}
