/**
 * @fileoverview Modelo de Configuración del Sistema para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Configuración del Sistema
 *
 * Archivo: backend/src/models/SystemConfig.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Validate,
  Default,
  ForeignKey,
  Index,
  Unique
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { User } from './User';
import { SystemConfigData } from '../types/system.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     SystemConfig:
 *       type: object
 *       required:
 *         - key
 *         - value
 *         - category
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la configuración
 *           example: 1
 *         key:
 *           type: string
 *           description: Clave única de configuración
 *           example: "system.language"
 *         value:
 *           type: string
 *           description: Valor de la configuración (JSON string)
 *           example: "\"es\""
 *         category:
 *           type: string
 *           description: Categoría de configuración
 *           example: "general"
 *         description:
 *           type: string
 *           description: Descripción de la configuración
 *           example: "Idioma por defecto del sistema"
 *         isPublic:
 *           type: boolean
 *           description: Si la configuración es pública
 *           example: true
 *         isActive:
 *           type: boolean
 *           description: Si la configuración está activa
 *           example: true
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *           example: 1
 */

@Table({
  tableName: 'system_configs',
  modelName: 'SystemConfig',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['key'],
      where: {
        deleted_at: null
      }
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_public']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class SystemConfig extends Model<SystemConfigData, Omit<SystemConfigData, 'id' | 'createdAt' | 'updatedAt'>> implements SystemConfigData {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'La clave de configuración no puede estar vacía'
    },
    len: {
      args: [1, 100],
      msg: 'La clave debe tener entre 1 y 100 caracteres'
    }
  })
  @Index
  @Column({
    type: DataType.STRING(100),
    comment: 'Clave única de configuración'
  })
  declare key: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'Valor de la configuración (JSON string)'
  })
  declare value: string;

  @AllowNull(false)
  @Validate({
    isIn: {
      args: [['general', 'security', 'payment', 'notification', 'email', 'integration', 'ui', 'performance']],
      msg: 'Categoría inválida'
    }
  })
  @Index
  @Column({
    type: DataType.ENUM('general', 'security', 'payment', 'notification', 'email', 'integration', 'ui', 'performance'),
    comment: 'Categoría de configuración'
  })
  declare category: 'general' | 'security' | 'payment' | 'notification' | 'email' | 'integration' | 'ui' | 'performance';

  @Column({
    type: DataType.STRING(255),
    comment: 'Descripción de la configuración'
  })
  declare description?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la configuración es pública (visible para usuarios no admin)'
  })
  declare isPublic: boolean;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la configuración está activa'
  })
  declare isActive: boolean;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales'
  })
  declare metadata?: any;

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

  // ====================================================================
  // RELACIONES
  // ====================================================================

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateSystemConfig(config: SystemConfig): Promise<void> {
    // Validar formato JSON del valor
    try {
      JSON.parse(config.value);
    } catch (error) {
      throw new Error('El valor de configuración debe ser un JSON válido');
    }

    // Validaciones específicas por categoría
    switch (config.category) {
      case 'general':
        await this.validateGeneralConfig(config);
        break;
      case 'security':
        await this.validateSecurityConfig(config);
        break;
      case 'payment':
        await this.validatePaymentConfig(config);
        break;
      case 'notification':
        await this.validateNotificationConfig(config);
        break;
      case 'email':
        await this.validateEmailConfig(config);
        break;
      default:
        // Otras categorías no requieren validación específica
        break;
    }
  }

  private static async validateGeneralConfig(config: SystemConfig): Promise<void> {
    const value = JSON.parse(config.value);

    // Validar idioma
    if (config.key === 'system.language') {
      const validLanguages = ['es', 'en', 'pt'];
      if (!validLanguages.includes(value)) {
        throw new Error('Idioma no válido. Valores permitidos: es, en, pt');
      }
    }

    // Validar zona horaria
    if (config.key === 'system.timezone') {
      // Validar formato de zona horaria (ej: America/Guatemala)
      if (!value.includes('/')) {
        throw new Error('Formato de zona horaria inválido');
      }
    }
  }

  private static async validateSecurityConfig(config: SystemConfig): Promise<void> {
    const value = JSON.parse(config.value);

    // Validar tiempo de sesión
    if (config.key === 'security.session_timeout') {
      if (value < 300 || value > 86400) { // 5 min a 24 horas
        throw new Error('Tiempo de sesión debe estar entre 300 y 86400 segundos');
      }
    }

    // Validar intentos de login
    if (config.key === 'security.max_login_attempts') {
      if (value < 3 || value > 10) {
        throw new Error('Intentos de login deben estar entre 3 y 10');
      }
    }
  }

  private static async validatePaymentConfig(config: SystemConfig): Promise<void> {
    const value = JSON.parse(config.value);

    // Validar monedas
    if (config.key === 'payment.supported_currencies') {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Debe especificar al menos una moneda');
      }
      const validCurrencies = ['GTQ', 'USD', 'EUR'];
      for (const currency of value) {
        if (!validCurrencies.includes(currency)) {
          throw new Error(`Moneda no válida: ${currency}`);
        }
      }
    }
  }

  private static async validateNotificationConfig(config: SystemConfig): Promise<void> {
    const value = JSON.parse(config.value);

    // Validar tipos de notificación
    if (config.key === 'notification.enabled_types') {
      if (!Array.isArray(value)) {
        throw new Error('Los tipos de notificación deben ser un array');
      }
      const validTypes = ['email', 'sms', 'push', 'in_app'];
      for (const type of value) {
        if (!validTypes.includes(type)) {
          throw new Error(`Tipo de notificación no válido: ${type}`);
        }
      }
    }
  }

  private static async validateEmailConfig(config: SystemConfig): Promise<void> {
    const value = JSON.parse(config.value);

    // Validar configuración SMTP
    if (config.key === 'email.smtp_host') {
      if (!value || value.length < 3) {
        throw new Error('Host SMTP inválido');
      }
    }

    if (config.key === 'email.smtp_port') {
      if (value < 1 || value > 65535) {
        throw new Error('Puerto SMTP inválido');
      }
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Obtiene el valor parseado como objeto
   */
  public get parsedValue(): any {
    try {
      return JSON.parse(this.value);
    } catch (error) {
      return null;
    }
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      key: this.key,
      value: this.parsedValue,
      category: this.category,
      description: this.description,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas administrativas
   */
  public toAdminJSON(): object {
    return {
      id: this.id,
      key: this.key,
      value: this.parsedValue,
      category: this.category,
      description: this.description,
      isPublic: this.isPublic,
      isActive: this.isActive,
      metadata: this.metadata,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca configuración por clave
   */
  static async findByKey(key: string, includeInactive: boolean = false): Promise<SystemConfig | null> {
    const where: any = { key };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.findOne({ where });
  }

  /**
   * Busca configuraciones por categoría
   */
  static async findByCategory(category: string, includeInactive: boolean = false): Promise<SystemConfig[]> {
    const where: any = { category };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.findAll({
      where,
      order: [['key', 'ASC']]
    });
  }

  /**
   * Busca configuraciones públicas
   */
  static async findPublicConfigs(): Promise<SystemConfig[]> {
    return this.findAll({
      where: {
        isPublic: true,
        isActive: true
      },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
  }

  /**
   * Obtiene configuración como objeto plano
   */
  static async getConfigAsObject(includeInactive: boolean = false): Promise<Record<string, any>> {
    const configs = await this.findAll({
      where: includeInactive ? {} : { isActive: true },
      attributes: ['key', 'value']
    });

    const configObject: Record<string, any> = {};
    for (const config of configs) {
      configObject[config.key] = config.parsedValue;
    }

    return configObject;
  }

  /**
   * Actualiza o crea configuración
   */
  static async upsertConfig(
    key: string,
    value: any,
    category: string,
    userId: number,
    options: {
      description?: string;
      isPublic?: boolean;
      metadata?: any;
    } = {}
  ): Promise<SystemConfig> {
    const stringValue = JSON.stringify(value);

    const [config, created] = await this.upsert({
      key,
      value: stringValue,
      category: category as any,
      description: options.description,
      isPublic: options.isPublic || false,
      isActive: true,
      metadata: options.metadata,
      createdBy: userId,
      updatedAt: new Date()
    });

    return config;
  }
}