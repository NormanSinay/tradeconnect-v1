/**
 * @fileoverview Modelo de Session para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para gestión de sesiones de usuario
 * 
 * Archivo: backend/src/models/Session.ts
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
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

/**
 * Atributos del modelo Session
 */
export interface SessionAttributes {
  id?: number;
  sessionId: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceOS: string;
  deviceBrowser: string;
  locationCountry?: string;
  locationCity?: string;
  locationRegion?: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActivity: Date;
  expiresAt: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  loginMethod: 'password' | '2fa' | 'social' | 'token';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de sesión
 */
export interface SessionCreationAttributes extends Omit<SessionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Index({ unique: true })
  @Column({
    type: DataType.UUID,
    comment: 'Identificador único de la sesión'
  })
  declare sessionId: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario propietario de la sesión'
  })
  declare userId: number;

  @AllowNull(false)
  @Index
  @Validate({
    isIP: {
      msg: 'Debe ser una dirección IP válida'
    }
  })
  @Column({
    type: DataType.INET,
    comment: 'Dirección IP del cliente'
  })
  declare ipAddress: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'User-Agent del navegador'
  })
  declare userAgent: string;

  @Default('unknown')
  @Validate({
    isIn: {
      args: [['desktop', 'mobile', 'tablet', 'unknown']],
      msg: 'Tipo de dispositivo inválido'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Tipo de dispositivo detectado'
  })
  declare deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';

  @Default('Unknown OS')
  @Column({
    type: DataType.STRING(100),
    comment: 'Sistema operativo detectado'
  })
  declare deviceOS: string;

  @Default('Unknown Browser')
  @Column({
    type: DataType.STRING(100),
    comment: 'Navegador detectado'
  })
  declare deviceBrowser: string;

  @Column({
    type: DataType.STRING(100),
    comment: 'País detectado por geolocalización IP'
  })
  declare locationCountry?: string;

  @Column({
    type: DataType.STRING(100),
    comment: 'Ciudad detectada por geolocalización IP'
  })
  declare locationCity?: string;

  @Column({
    type: DataType.STRING(100),
    comment: 'Región detectada por geolocalización IP'
  })
  declare locationRegion?: string;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la sesión está activa'
  })
  declare isActive: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si es la sesión actual del request'
  })
  declare isCurrent: boolean;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Última actividad registrada'
  })
  declare lastActivity: Date;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración de la sesión'
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.TEXT,
    comment: 'Token de refresco para la sesión'
  })
  declare refreshToken?: string;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de expiración del refresh token'
  })
  declare refreshTokenExpires?: Date;

  @Default('password')
  @Validate({
    isIn: {
      args: [['password', '2fa', 'social', 'token']],
      msg: 'Método de login inválido'
    }
  })
  @Column({
    type: DataType.STRING(20),
    comment: 'Método de autenticación utilizado'
  })
  declare loginMethod: 'password' | '2fa' | 'social' | 'token';

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación de la sesión'
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
  static async generateSessionId(session: Session): Promise<void> {
    if (!session.sessionId) {
      session.sessionId = uuidv4();
    }
  }

  @BeforeCreate
  static async setDefaultExpiration(session: Session): Promise<void> {
    if (!session.expiresAt) {
      // Sesión válida por 7 días por defecto
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    
    if (!session.lastActivity) {
      session.lastActivity = new Date();
    }
  }

  @BeforeCreate
  static async parseUserAgent(session: Session): Promise<void> {
    if (session.userAgent) {
      const deviceInfo = Session.parseUserAgentString(session.userAgent);
      session.deviceType = deviceInfo.deviceType;
      session.deviceOS = deviceInfo.os;
      session.deviceBrowser = deviceInfo.browser;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la sesión ha expirado
   */
  public get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Verifica si la sesión está válida (activa y no expirada)
   */
  public get isValid(): boolean {
    return this.isActive && !this.isExpired;
  }

  /**
   * Calcula el tiempo restante antes de expirar (en milisegundos)
   */
  public get timeUntilExpiration(): number {
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }

  /**
   * Obtiene información resumida del dispositivo
   */
  public get deviceInfo(): object {
    return {
      type: this.deviceType,
      os: this.deviceOS,
      browser: this.deviceBrowser,
      userAgent: this.userAgent
    };
  }

  /**
   * Obtiene información de ubicación
   */
  public get locationInfo(): object {
    return {
      country: this.locationCountry,
      city: this.locationCity,
      region: this.locationRegion,
      ipAddress: this.ipAddress
    };
  }

  /**
   * Actualiza la actividad de la sesión
   */
  public async updateActivity(): Promise<void> {
    this.lastActivity = new Date();
    await this.save();
  }

  /**
   * Extiende la expiración de la sesión
   */
  public async extendSession(additionalHours: number = 24): Promise<void> {
    const newExpiration = new Date(Date.now() + additionalHours * 60 * 60 * 1000);
    this.expiresAt = newExpiration;
    this.lastActivity = new Date();
    await this.save();
  }

  /**
   * Termina la sesión (la marca como inactiva)
   */
  public async terminate(): Promise<void> {
    this.isActive = false;
    this.isCurrent = false;
    await this.save();
  }

  /**
   * Establece token de refresco
   */
  public async setRefreshToken(token: string, expiresInDays: number = 30): Promise<void> {
    this.refreshToken = token;
    this.refreshTokenExpires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await this.save();
  }

  /**
   * Limpia el token de refresco
   */
  public async clearRefreshToken(): Promise<void> {
    this.refreshToken = undefined;
    this.refreshTokenExpires = undefined;
    await this.save();
  }

  /**
   * Verifica si el refresh token es válido
   */
  public get isRefreshTokenValid(): boolean {
    return !!(this.refreshToken && 
             this.refreshTokenExpires && 
             new Date() < this.refreshTokenExpires);
  }

  /**
   * Serializa la sesión para respuestas de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      sessionId: this.sessionId,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      isActive: this.isActive,
      isCurrent: this.isCurrent,
      lastActivity: this.lastActivity,
      expiresAt: this.expiresAt,
      loginMethod: this.loginMethod,
      createdAt: this.createdAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca sesión por sessionId
   */
  static async findBySessionId(sessionId: string): Promise<Session | null> {
    return this.findOne({
      where: { sessionId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'isActive']
        }
      ]
    });
  }

  /**
   * Obtiene sesiones activas de un usuario
   */
  static async getActiveUserSessions(userId: number): Promise<Session[]> {
    return this.findAll({
      where: {
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      },
      order: [['lastActivity', 'DESC']]
    });
  }

  /**
   * Termina todas las sesiones de un usuario excepto la actual
   */
  static async terminateUserSessions(userId: number, excludeSessionId?: string): Promise<number> {
    const where: any = {
      userId,
      isActive: true
    };

    if (excludeSessionId) {
      where.sessionId = { $ne: excludeSessionId };
    }

    const [affectedRows] = await this.update(
      { isActive: false, isCurrent: false },
      { where }
    );

    return affectedRows;
  }

  /**
   * Limpia sesiones expiradas del sistema
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const expiredCount = await this.count({
      where: {
        expiresAt: { $lt: new Date() }
      }
    });

    await this.destroy({
      where: {
        expiresAt: { $lt: new Date() }
      },
      force: true
    });

    return expiredCount;
  }

  /**
   * Parsea string de User-Agent para extraer información del dispositivo
   */
  static parseUserAgentString(userAgent: string): {
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os: string;
    browser: string;
  } {
    const ua = userAgent.toLowerCase();
    
    // Detectar tipo de dispositivo
    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
    if (ua.includes('mobile')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    } else if (ua.includes('desktop') || ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
      deviceType = 'desktop';
    }

    // Detectar OS
    let os = 'Unknown OS';
    if (ua.includes('windows nt 10.0')) os = 'Windows 10';
    else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
    else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
    else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
    else if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os x')) os = 'macOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('linux')) os = 'Linux';

    // Detectar navegador
    let browser = 'Unknown Browser';
    if (ua.includes('edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('chrome/')) browser = 'Google Chrome';
    else if (ua.includes('firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('opera/')) browser = 'Opera';

    return { deviceType, os, browser };
  }

  /**
   * Obtiene estadísticas de sesiones por período
   */
  static async getSessionStats(startDate: Date, endDate: Date): Promise<any> {
    const stats = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'date'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'sessionCount'],
        [this.sequelize!.fn('COUNT', this.sequelize!.fn('DISTINCT', this.sequelize!.col('user_id'))), 'uniqueUsers']
      ],
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      },
      group: [this.sequelize!.fn('DATE', this.sequelize!.col('created_at'))],
      order: [[this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'ASC']],
      raw: true
    });

    return stats;
  }

  /**
   * Obtiene distribución por tipo de dispositivo
   */
  static async getDeviceTypeDistribution(): Promise<any[]> {
    const stats = await this.findAll({
      attributes: [
        'deviceType',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('COUNT', this.sequelize!.fn('DISTINCT', this.sequelize!.col('user_id'))), 'uniqueUsers']
      ],
      where: {
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      },
      group: ['deviceType'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      raw: true
    });

    return stats;
  }

  /**
   * Detecta posibles sesiones sospechosas para un usuario
   */
  static async detectSuspiciousSessions(userId: number): Promise<Session[]> {
    const userSessions = await this.getActiveUserSessions(userId);
    
    if (userSessions.length < 2) {
      return [];
    }

    // Agrupar por IP para detectar múltiples ubicaciones
    const ipGroups = userSessions.reduce((groups: any, session) => {
      const ip = session.ipAddress;
      if (!groups[ip]) {
        groups[ip] = [];
      }
      groups[ip].push(session);
      return groups;
    }, {});

    // Si hay más de 3 IPs diferentes en sesiones activas, marcar como sospechoso
    const suspiciousSessions: Session[] = [];
    const uniqueIPs = Object.keys(ipGroups);
    
    if (uniqueIPs.length > 3) {
      // Agregar sesiones de IPs menos frecuentes
      const sortedIPs = uniqueIPs.sort((a, b) => ipGroups[a].length - ipGroups[b].length);
      const suspiciousIPs = sortedIPs.slice(0, Math.ceil(sortedIPs.length / 2));
      
      suspiciousIPs.forEach(ip => {
        suspiciousSessions.push(...ipGroups[ip]);
      });
    }

    return suspiciousSessions;
  }
}