/**
 * @fileoverview Modelo de Usuario para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Usuario con validaciones y métodos
 * 
 * Archivo: backend/src/models/User.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  Unique,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { UserRole } from '../utils/constants';
import { Role } from './Role';
import { UserRole as UserRoleModel } from './UserRole';
import { Session } from './Session';
import { TwoFactorAuth } from './TwoFactorAuth';
import { AuditLog } from './AuditLog';
import { ReferralCode } from './ReferralCode';
import { Referral } from './Referral';
import { LoyaltyPoint } from './LoyaltyPoint';
import { UserBadge } from './UserBadge';

/**
 * Atributos del modelo Usuario
 */
export interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  nit?: string;
  cui?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  is2faEnabled: boolean;
  otpCode?: string;
  otpExpires?: Date;
  otpAttempts: number;
  failedLoginAttempts: number;
  lastFailedLogin?: Date;
  isAccountLocked: boolean;
  accountLockedAt?: Date;
  lockExpiresAt?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  passwordChangedAt?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  marketingAccepted: boolean;
  termsAcceptedAt?: Date;
  timezone: string;
  locale: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de usuario
 */
export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           description: Email único del usuario
 *           example: usuario@tradeconnect.gt
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *           example: Juan
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *           example: Pérez
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *           example: +502 1234-5678
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL del avatar del usuario
 *         nit:
 *           type: string
 *           description: NIT guatemalteco
 *           example: 123456789
 *         cui:
 *           type: string
 *           description: CUI guatemalteco
 *           example: 1234567890101
 *         isEmailVerified:
 *           type: boolean
 *           description: Si el email está verificado
 *           default: false
 *         isActive:
 *           type: boolean
 *           description: Si la cuenta está activa
 *           default: true
 *         is2faEnabled:
 *           type: boolean
 *           description: Si 2FA está habilitado
 *           default: false
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Último login
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
  tableName: 'users',
  modelName: 'User',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email'],
      where: { deleted_at: null }
    },
    {
      fields: ['nit'],
      where: { nit: { $ne: null } }
    },
    {
      fields: ['cui'],
      where: { cui: { $ne: null } }
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['last_login_at']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Index
  @Validate({
    isEmail: {
      msg: 'El email debe tener un formato válido'
    },
    notEmpty: {
      msg: 'El email es requerido'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Email único del usuario'
  })
  declare email: string;

  @AllowNull(false)
  @Validate({
    len: {
      args: [8, 255],
      msg: 'La contraseña debe tener al menos 8 caracteres'
    },
    notEmpty: {
      msg: 'La contraseña es requerida'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Contraseña hasheada'
  })
  declare password: string;

  @AllowNull(false)
  @Validate({
    len: {
      args: [2, 50],
      msg: 'El nombre debe tener entre 2 y 50 caracteres'
    },
    notEmpty: {
      msg: 'El nombre es requerido'
    },
    is: {
      args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      msg: 'El nombre solo puede contener letras y espacios'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Nombre del usuario'
  })
  declare firstName: string;

  @AllowNull(false)
  @Validate({
    len: {
      args: [2, 50],
      msg: 'El apellido debe tener entre 2 y 50 caracteres'
    },
    notEmpty: {
      msg: 'El apellido es requerido'
    },
    is: {
      args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      msg: 'El apellido solo puede contener letras y espacios'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Apellido del usuario'
  })
  declare lastName: string;

  @Validate({
    is: {
      args: /^\+502\s?\d{4}-?\d{4}$/,
      msg: 'El teléfono debe tener formato guatemalteco válido (+502 1234-5678)'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Teléfono del usuario (formato Guatemala)'
  })
  declare phone?: string;

  @Validate({
    isUrl: {
      msg: 'El avatar debe ser una URL válida'
    }
  })
  @Column({
    type: DataType.TEXT,
    comment: 'URL del avatar del usuario'
  })
  declare avatar?: string;

  @Index
  @Validate({
    is: {
      args: /^\d{8}[0-9A-Z]?$/i,
      msg: 'El NIT debe tener formato guatemalteco válido (123456789 o 12345678K)'
    }
  })
  @Column({
    type: DataType.STRING(15),
    comment: 'NIT guatemalteco'
  })
  declare nit?: string;

  @Index
  @Validate({
    is: {
      args: /^\d{13}$/,
      msg: 'El CUI debe tener 13 dígitos'
    }
  })
  @Column({
    type: DataType.STRING(13),
    comment: 'CUI guatemalteco'
  })
  declare cui?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si el email está verificado'
  })
  declare isEmailVerified: boolean;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la cuenta está activa'
  })
  declare isActive: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: "is_2fa_enabled",
    comment: 'Indica si 2FA está habilitado'
  })
  declare is2faEnabled: boolean;

  @Column({
    type: DataType.STRING(6),
    comment: 'Código OTP actual para 2FA'
  })
  declare otpCode?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Expiración del código OTP'
  })
  declare otpExpires?: Date;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de intentos fallidos de OTP'
  })
  declare otpAttempts: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de intentos fallidos de login'
  })
  declare failedLoginAttempts: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último intento fallido de login'
  })
  declare lastFailedLogin?: Date;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la cuenta está bloqueada'
  })
  declare isAccountLocked: boolean;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se bloqueó la cuenta'
  })
  declare accountLockedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando expira el bloqueo'
  })
  declare lockExpiresAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último login exitoso'
  })
  declare lastLoginAt?: Date;

  @Column({
    type: DataType.INET,
    comment: 'IP del último login'
  })
  declare lastLoginIp?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último cambio de contraseña'
  })
  declare passwordChangedAt?: Date;

  @Column({
    type: DataType.STRING(255),
    comment: 'Token para verificación de email'
  })
  declare emailVerificationToken?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Expiración del token de verificación de email'
  })
  declare emailVerificationExpires?: Date;

  @Column({
    type: DataType.STRING(255),
    comment: 'Token para reset de contraseña'
  })
  declare passwordResetToken?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Expiración del token de reset de contraseña'
  })
  declare passwordResetExpires?: Date;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Aceptó emails de marketing'
  })
  declare marketingAccepted: boolean;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de aceptación de términos y condiciones'
  })
  declare termsAcceptedAt?: Date;

  @Default('America/Guatemala')
  @Column({
    type: DataType.STRING(50),
    comment: 'Zona horaria del usuario'
  })
  declare timezone: string;

  @Default('es')
  @Column({
    type: DataType.STRING(5),
    comment: 'Idioma preferido'
  })
  declare locale: string;

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

  @BelongsToMany(() => Role, () => UserRoleModel)
  declare roles: Role[];

  @HasMany(() => Session)
  declare sessions: Session[];

  @HasMany(() => TwoFactorAuth)
  declare twoFactorAuth: TwoFactorAuth[];

  @HasMany(() => AuditLog, 'userId')
  declare auditLogs: AuditLog[];

  @HasMany(() => ReferralCode)
  declare referralCodes: ReferralCode[];

  @HasMany(() => Referral, 'referrerId')
  declare referralsGiven: Referral[];

  @HasMany(() => Referral, 'referredId')
  declare referralsReceived: Referral[];

  @HasMany(() => LoyaltyPoint)
  declare loyaltyPoints: LoyaltyPoint[];

  @HasMany(() => UserBadge)
  declare userBadges: UserBadge[];

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User): Promise<void> {
    if (user.changed('password')) {
      const saltRounds = 12;
      user.password = await bcrypt.hash(user.password, saltRounds);
      user.passwordChangedAt = new Date();
    }
  }

  @BeforeCreate
  static async setDefaultValues(user: User): Promise<void> {
    if (!user.timezone) {
      user.timezone = 'America/Guatemala';
    }
    if (!user.locale) {
      user.locale = 'es';
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la contraseña proporcionada coincide con la hasheada
   */
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Verifica si la cuenta está bloqueada por intentos fallidos
   */
  public get isTemporarilyLocked(): boolean {
    if (!this.isAccountLocked || !this.lockExpiresAt) {
      return false;
    }
    return new Date() < this.lockExpiresAt;
  }

  /**
   * Incrementa los intentos fallidos de login
   */
  public async incrementFailedLoginAttempts(): Promise<void> {
    this.failedLoginAttempts += 1;
    this.lastFailedLogin = new Date();

    // Bloquear cuenta después de 5 intentos fallidos
    if (this.failedLoginAttempts >= 5) {
      this.isAccountLocked = true;
      this.accountLockedAt = new Date();
      // Bloquear por 30 minutos
      this.lockExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    }

    await this.save();
  }

  /**
   * Resetea los intentos fallidos de login después de login exitoso
   */
  public async resetFailedLoginAttempts(): Promise<void> {
    if (this.failedLoginAttempts > 0) {
      this.failedLoginAttempts = 0;
      this.lastFailedLogin = undefined;
      this.isAccountLocked = false;
      this.accountLockedAt = undefined;
      this.lockExpiresAt = undefined;
      await this.save();
    }
  }

  /**
   * Actualiza información de último login
   */
  public async updateLastLogin(ipAddress?: string): Promise<void> {
    this.lastLoginAt = new Date();
    if (ipAddress) {
      this.lastLoginIp = ipAddress;
    }
    await this.save();
  }

  /**
   * Genera un token de verificación de email
   * Guarda el hash en DB, retorna el token plano para enviarlo al usuario
   */
  public async setEmailVerificationToken(): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    this.emailVerificationToken = hashedToken;
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await this.save();

    return rawToken; // este se manda por correo, NO se guarda
  }

  /**
   * Marca email como verificado
   */
  public async markEmailAsVerified(): Promise<void> {
    this.isEmailVerified = true;
    this.emailVerificationToken = undefined;
    this.emailVerificationExpires = undefined;
    await this.save();
  }

  /**
   * Establece token de reset de contraseña
   * Guarda el hash en DB, retorna el token plano para enviarlo al usuario
   */
  public async setPasswordResetToken(): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    
    this.passwordResetToken = hashedToken;
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // Token válido por 1 hora
    await this.save();
    
    return rawToken; // este se manda por correo, NO se guarda
  }

  /**
   * Limpia tokens de reset de contraseña
   */
  public async clearPasswordResetToken(): Promise<void> {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
    await this.save();
  }

  /**
   * Serializa el usuario para respuestas de API (excluye campos sensibles)
   */
  public toAuthJSON(): object {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      phone: this.phone,
      avatar: this.avatar,
      nit: this.nit,
      cui: this.cui,
      isEmailVerified: this.isEmailVerified,
      isActive: this.isActive,
      is2faEnabled: this.is2faEnabled,
      lastLoginAt: this.lastLoginAt,
      timezone: this.timezone,
      locale: this.locale,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa el usuario para respuestas públicas (información mínima)
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      avatar: this.avatar
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca usuario por email (incluyendo eliminados)
   */
  static async findByEmail(email: string, includeDeleted: boolean = false): Promise<User | null> {
    const options: any = {
      where: { email: email.toLowerCase() }
    };
    
    if (includeDeleted) {
      options.paranoid = false;
    }
    
    return this.findOne(options);
  }

   /**
   * Busca un usuario por token de verificación de email (seguro con hash)
   */
  static async findByEmailVerificationToken(token: string): Promise<User | null> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    return this.findOne({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
          [Op.gt]: new Date() // que no haya expirado
        }
      }
    });
  }

  /**
   * Busca usuario por token de reset de contraseña (seguro con hash)
   */
  static async findByPasswordResetToken(token: string): Promise<User | null> {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    return this.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });
  }

  /**
   * Busca usuarios activos
   */
  static async findActiveUsers(): Promise<User[]> {
    return this.findAll({
      where: {
        isActive: true,
        isEmailVerified: true
      },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Cuenta usuarios registrados en un período
   */
  static async countUsersByPeriod(startDate: Date, endDate: Date): Promise<number> {
    return this.count({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
  }

  /**
   * Valida si un email ya está registrado
   */
  static async isEmailTaken(email: string, excludeUserId?: number): Promise<boolean> {
    const where: any = { email: email.toLowerCase() };
    
    if (excludeUserId) {
      where.id = { $ne: excludeUserId };
    }
    
    const user = await this.findOne({ where, paranoid: false });
    return !!user;
  }

  /**
   * Valida si un NIT ya está registrado
   */
  static async isNitTaken(nit: string, excludeUserId?: number): Promise<boolean> {
    if (!nit) return false;
    
    const where: any = { nit };
    
    if (excludeUserId) {
      where.id = { $ne: excludeUserId };
    }
    
    const user = await this.findOne({ where });
    return !!user;
  }

  /**
   * Valida formato de email guatemalteco
   */
  static validateGuatemalaEmail(email: string): boolean {
    const guatemalaEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(gt|com|org|net|edu)$/i;
    return guatemalaEmailRegex.test(email);
  }

  /**
   * Valida formato de NIT guatemalteco
   */
  static validateGuatemalaNit(nit: string): boolean {
    if (!nit) return true; // NIT es opcional
    const nitRegex = /^\d{8}[0-9A-Z]?$/i;
    return nitRegex.test(nit);
  }

  /**
   * Valida formato de CUI guatemalteco
   */
  static validateGuatemalaCui(cui: string): boolean {
    if (!cui) return true; // CUI es opcional
    const cuiRegex = /^\d{13}$/;
    return cuiRegex.test(cui);
  }
}
