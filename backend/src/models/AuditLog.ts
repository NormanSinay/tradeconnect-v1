/**
 * @fileoverview Modelo de AuditLog para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para registro de auditoría y logs de seguridad
 *
 * Archivo: backend/src/models/AuditLog.ts
 */

import { Op } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  Index,
  AllowNull,
  Validate,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Atributos del modelo AuditLog
 */
export interface AuditLogAttributes {
  id?: number;
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: object;
  newValues?: object;
  ipAddress: string;
  userAgent: string;
  metadata?: object;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
  createdAt?: Date;
}

/**
 * Interface para creación de log de auditoría
 */
export interface AuditLogCreationAttributes extends Omit<AuditLogAttributes, 'id' | 'createdAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       required:
 *         - action
 *         - resource
 *         - ipAddress
 *         - userAgent
 *         - severity
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del log de auditoría
 *           example: 1
 *         userId:
 *           type: integer
 *           description: ID del usuario que realizó la acción (opcional)
 *           example: 123
 *         action:
 *           type: string
 *           description: Acción realizada
 *           example: "login_success"
 *         resource:
 *           type: string
 *           description: Recurso afectado
 *           example: "auth"
 *         resourceId:
 *           type: string
 *           description: ID del recurso específico
 *           example: "user_123"
 *         oldValues:
 *           type: object
 *           description: Valores anteriores (para updates)
 *           example: {"email": "old@email.com"}
 *         newValues:
 *           type: object
 *           description: Valores nuevos (para updates)
 *           example: {"email": "new@email.com"}
 *         ipAddress:
 *           type: string
 *           description: Dirección IP del cliente
 *           example: "192.168.1.100"
 *         userAgent:
 *           type: string
 *           description: User-Agent del navegador
 *           example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *         metadata:
 *           type: object
 *           description: Información adicional del evento
 *           example: {"attempts": 3, "reason": "invalid_password"}
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Nivel de severidad del evento
 *           example: "medium"
 *         status:
 *           type: string
 *           enum: [success, failure, warning]
 *           description: Estado del evento
 *           example: "success"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del evento
 */

@Table({
  tableName: 'audit_logs',
  modelName: 'AuditLog',
  timestamps: true,
  createdAt: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['resource']
    },
    {
      fields: ['resource_id']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['status']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['action', 'created_at']
    },
    {
      fields: ['resource', 'created_at']
    }
  ]
})
export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que realizó la acción (null para acciones del sistema)'
  })
  declare userId?: number;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'La acción es requerida'
    },
    len: {
      args: [2, 100],
      msg: 'La acción debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Acción realizada por el usuario o sistema'
  })
  declare action: string;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El recurso es requerido'
    },
    len: {
      args: [2, 50],
      msg: 'El recurso debe tener entre 2 y 50 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(50),
    comment: 'Recurso o módulo afectado por la acción'
  })
  declare resource: string;

  @Index
  @Validate({
    len: {
      args: [0, 100],
      msg: 'El ID del recurso no puede exceder 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'ID específico del recurso afectado'
  })
  declare resourceId?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Valores anteriores del recurso (para operaciones de actualización)'
  })
  declare oldValues?: object;

  @Column({
    type: DataType.JSON,
    comment: 'Valores nuevos del recurso (para operaciones de creación/actualización)'
  })
  declare newValues?: object;

  @AllowNull(false)
  @Index
  @Validate({
    isIP: {
      msg: 'Debe ser una dirección IP válida'
    }
  })
  @Column({
    type: DataType.INET,
    comment: 'Dirección IP desde donde se realizó la acción'
  })
  declare ipAddress: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'User-Agent del navegador o cliente'
  })
  declare userAgent: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales del evento de auditoría'
  })
  declare metadata?: object;

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['low', 'medium', 'high', 'critical']],
      msg: 'La severidad debe ser low, medium, high o critical'
    }
  })
  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'critical'),
    comment: 'Nivel de severidad del evento'
  })
  declare severity: 'low' | 'medium' | 'high' | 'critical';

  @AllowNull(false)
  @Index
  @Validate({
    isIn: {
      args: [['success', 'failure', 'warning']],
      msg: 'El estado debe ser success, failure o warning'
    }
  })
  @Column({
    type: DataType.ENUM('success', 'failure', 'warning'),
    comment: 'Estado resultante de la acción'
  })
  declare status: 'success' | 'failure' | 'warning';

  @CreatedAt
  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha y hora exacta del evento'
  })
  declare createdAt: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User, 'userId')
  declare user: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene una descripción legible del evento
   */
  public get description(): string {
    const descriptions: Record<string, string> = {
      // Autenticación
      'login_success': 'Inicio de sesión exitoso',
      'login_failed': 'Intento de inicio de sesión fallido',
      'login_blocked': 'Inicio de sesión bloqueado por intentos fallidos',
      'logout': 'Cierre de sesión',
      'password_change': 'Cambio de contraseña',
      'password_reset_request': 'Solicitud de reseteo de contraseña',
      'password_reset_complete': 'Reseteo de contraseña completado',
      '2fa_enabled': 'Autenticación de dos factores habilitada',
      '2fa_disabled': 'Autenticación de dos factores deshabilitada',
      '2fa_verification_failed': 'Verificación 2FA fallida',
      'email_verification': 'Verificación de email completada',
      'account_locked': 'Cuenta bloqueada',
      'account_unlocked': 'Cuenta desbloqueada',
      'token_refresh': 'Refresco de token de acceso',

      // Usuarios
      'user_created': 'Usuario creado',
      'user_updated': 'Usuario actualizado',
      'user_deleted': 'Usuario eliminado',
      'user_role_assigned': 'Rol asignado a usuario',
      'user_role_revoked': 'Rol revocado de usuario',

      // Roles y permisos
      'role_created': 'Rol creado',
      'role_updated': 'Rol actualizado',
      'role_deleted': 'Rol eliminado',
      'permission_assigned': 'Permiso asignado',
      'permission_revoked': 'Permiso revocado',

      // Eventos
      'event_created': 'Evento creado',
      'event_updated': 'Evento actualizado',
      'event_deleted': 'Evento eliminado',
      'event_published': 'Evento publicado',

      // Pagos
      'payment_processed': 'Pago procesado',
      'payment_failed': 'Pago fallido',
      'payment_refunded': 'Pago reembolsado',

      // Sistema
      'system_config_updated': 'Configuración del sistema actualizada',
      'security_alert': 'Alerta de seguridad',
      'suspicious_activity': 'Actividad sospechosa'
    };

    return descriptions[this.action] || `${this.action} en ${this.resource}`;
  }

  /**
   * Verifica si el evento es crítico
   */
  public get isCritical(): boolean {
    return this.severity === 'critical' ||
           (this.severity === 'high' && this.status === 'failure');
  }

  /**
   * Obtiene información resumida del evento
   */
  public toSummary(): object {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      resource: this.resource,
      resourceId: this.resourceId,
      severity: this.severity,
      status: this.status,
      description: this.description,
      createdAt: this.createdAt,
      isCritical: this.isCritical
    };
  }

  /**
   * Serializa para respuestas de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      resource: this.resource,
      resourceId: this.resourceId,
      oldValues: this.oldValues,
      newValues: this.newValues,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      metadata: this.metadata,
      severity: this.severity,
      status: this.status,
      description: this.description,
      createdAt: this.createdAt,
      isCritical: this.isCritical
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Registra un evento de auditoría
   */
  static async log(
    action: string,
    resource: string,
    data: {
      userId?: number;
      resourceId?: string;
      oldValues?: object;
      newValues?: object;
      ipAddress: string;
      userAgent: string;
      metadata?: object;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      status?: 'success' | 'failure' | 'warning';
    }
  ): Promise<AuditLog> {
    const {
      userId,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      metadata,
      severity = 'low',
      status = 'success'
    } = data;

    return this.create({
      userId,
      action,
      resource,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      metadata,
      severity,
      status
    });
  }

  /**
   * Obtiene logs de auditoría para un usuario específico
   */
  static async getUserAuditLogs(
    userId: number,
    options: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      actions?: string[];
      resources?: string[];
      severity?: string[];
    } = {}
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const {
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      actions,
      resources,
      severity
    } = options;

    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    if (actions && actions.length > 0) {
      where.action = { [Op.in]: actions };
    }

    if (resources && resources.length > 0) {
      where.resource = { [Op.in]: resources };
    }

    if (severity && severity.length > 0) {
      where.severity = { [Op.in]: severity };
    }

    const { rows: logs, count: total } = await this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });

    return { logs, total };
  }

  /**
   * Obtiene logs de auditoría por recurso
   */
  static async getResourceAuditLogs(
    resource: string,
    resourceId?: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const { limit = 50, offset = 0, startDate, endDate } = options;

    const where: any = { resource };
    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    const { rows: logs, count: total } = await this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });

    return { logs, total };
  }

  /**
   * Obtiene eventos críticos recientes
   */
  static async getCriticalEvents(
    hours: number = 24,
    limit: number = 100
  ): Promise<AuditLog[]> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.findAll({
      where: {
        createdAt: { $gte: startDate },
        [Op.or]: [
          { severity: 'critical' },
          { severity: 'high', status: 'failure' }
        ]
      },
      limit,
      order: [['createdAt', 'DESC']],
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
   * Obtiene estadísticas de auditoría por período
   */
  static async getAuditStats(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const stats = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'date'],
        'severity',
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      group: [
        this.sequelize!.fn('DATE', this.sequelize!.col('created_at')),
        'severity',
        'status'
      ],
      order: [[this.sequelize!.fn('DATE', this.sequelize!.col('created_at')), 'ASC']],
      raw: true
    });

    return stats;
  }

  /**
   * Limpia logs antiguos (más de X días)
   */
  static async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    return this.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
        severity: { [Op.ne]: 'critical' } // Mantener logs críticos indefinidamente
      }
    });
  }

  /**
   * Detecta patrones de actividad sospechosa
   */
  static async detectSuspiciousActivity(
    userId: number,
    hours: number = 1
  ): Promise<{
    failedLogins: number;
    differentIPs: number;
    criticalEvents: number;
    isSuspicious: boolean;
  }> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await this.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['action', 'ipAddress', 'severity', 'status']
    });

    const failedLogins = logs.filter(log =>
      log.action === 'login_failed' || log.action === '2fa_verification_failed'
    ).length;

    const uniqueIPs = new Set(logs.map(log => log.ipAddress)).size;

    const criticalEvents = logs.filter(log =>
      log.severity === 'critical' ||
      (log.severity === 'high' && log.status === 'failure')
    ).length;

    // Algoritmo simple de detección de actividad sospechosa
    const isSuspicious = (
      failedLogins > 5 ||
      uniqueIPs > 3 ||
      criticalEvents > 2 ||
      (failedLogins > 2 && uniqueIPs > 1)
    );

    return {
      failedLogins,
      differentIPs: uniqueIPs,
      criticalEvents,
      isSuspicious
    };
  }
}
