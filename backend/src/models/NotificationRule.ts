/**
 * @fileoverview Modelo de Regla de Notificación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para reglas automáticas de notificaciones
 *
 * Archivo: backend/src/models/NotificationRule.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Default,
  Validate,
  ForeignKey
} from 'sequelize-typescript';
import { EmailTemplate } from './EmailTemplate';
import {
  NotificationRuleAttributes,
  NotificationRuleCreationAttributes,
  NotificationChannel,
  NotificationPriority
} from '../types/notification.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationRule:
 *       type: object
 *       required:
 *         - name
 *         - eventType
 *         - triggerCondition
 *         - channels
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la regla
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre descriptivo de la regla
 *           example: "Confirmación de Inscripción"
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         eventType:
 *           type: string
 *           description: Tipo de evento que dispara la regla
 *           example: "INSCRIPCION_CONFIRMADA"
 *         triggerCondition:
 *           type: object
 *           description: Condiciones para disparar la regla
 *         templateId:
 *           type: integer
 *           description: ID de plantilla de email asociada
 *         templateCode:
 *           type: string
 *           description: Código de plantilla de email
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [EMAIL, POPUP, SMS, WHATSAPP]
 *           description: Canales por donde enviar
 *         priority:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, CRITICAL]
 *           description: Prioridad de la notificación
 *         active:
 *           type: boolean
 *           description: Si la regla está activa
 *           default: true
 *         cooldownMinutes:
 *           type: integer
 *           description: Minutos de cooldown entre notificaciones
 *         maxPerUserPerDay:
 *           type: integer
 *           description: Máximo de notificaciones por usuario al día
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *         updatedBy:
 *           type: integer
 *           description: ID del usuario que actualizó
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
  tableName: 'notification_rules',
  modelName: 'NotificationRule',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_type'],
      name: 'idx_notification_rules_event_type'
    },
    {
      fields: ['active'],
      name: 'idx_notification_rules_active'
    },
    {
      fields: ['template_code'],
      name: 'idx_notification_rules_template_code'
    },
    {
      fields: ['created_at'],
      name: 'idx_notification_rules_created_at'
    },
    {
      fields: ['event_type', 'active'],
      name: 'idx_notification_rules_event_active'
    }
  ]
})
export class NotificationRule extends Model<NotificationRuleAttributes, NotificationRuleCreationAttributes> implements NotificationRuleAttributes {
  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la regla es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre descriptivo de la regla de notificación'
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada de la regla'
  })
  declare description?: string;

  @AllowNull(false)
  @Index
  @Validate({
    notEmpty: {
      msg: 'El tipo de evento es requerido'
    },
    is: {
      args: /^[A-Z_]+$/,
      msg: 'El tipo de evento debe estar en mayúsculas con guiones bajos'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Tipo de evento que dispara la regla (ej: INSCRIPCION_CONFIRMADA)'
  })
  declare eventType: string;

  @AllowNull(false)
  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Condiciones específicas para disparar la regla'
  })
  declare triggerCondition: Record<string, any>;

  @ForeignKey(() => EmailTemplate)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la plantilla de email asociada'
  })
  declare templateId?: number;

  @Column({
    type: DataType.STRING(100),
    comment: 'Código de la plantilla de email'
  })
  declare templateCode?: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSONB,
    comment: 'Canales por donde se enviarán las notificaciones'
  })
  declare channels: NotificationChannel[];

  @Default(NotificationPriority.NORMAL)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationPriority)),
    comment: 'Prioridad de las notificaciones generadas'
  })
  declare priority: NotificationPriority;

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Indica si la regla está activa'
  })
  declare active: boolean;

  @Column({
    type: DataType.INTEGER,
    comment: 'Minutos de cooldown entre notificaciones del mismo tipo'
  })
  declare cooldownMinutes?: number;

  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo de notificaciones por usuario en 24 horas'
  })
  declare maxPerUserPerDay?: number;

  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que creó la regla'
  })
  declare createdBy?: number;

  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que actualizó la regla'
  })
  declare updatedBy?: number;

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

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => EmailTemplate)
  declare template: EmailTemplate;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la regla debe dispararse para un evento dado
   */
  public shouldTrigger(eventData: Record<string, any>): boolean {
    if (!this.active) {
      return false;
    }

    // Verificar condiciones del trigger
    return this.evaluateTriggerCondition(eventData);
  }

  /**
   * Evalúa las condiciones del trigger
   */
  private evaluateTriggerCondition(eventData: Record<string, any>): boolean {
    const conditions = this.triggerCondition;

    // Si no hay condiciones específicas, siempre disparar
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Evaluar cada condición
    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = eventData[key];

      // Si la condición es un objeto con operadores
      if (typeof expectedValue === 'object' && expectedValue !== null) {
        if (!this.evaluateConditionOperators(actualValue, expectedValue)) {
          return false;
        }
      } else {
        // Comparación simple
        if (actualValue !== expectedValue) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evalúa operadores de condición avanzados
   */
  private evaluateConditionOperators(actualValue: any, operators: Record<string, any>): boolean {
    for (const [operator, expectedValue] of Object.entries(operators)) {
      switch (operator) {
        case '$eq':
          if (actualValue !== expectedValue) return false;
          break;
        case '$ne':
          if (actualValue === expectedValue) return false;
          break;
        case '$gt':
          if (!(actualValue > expectedValue)) return false;
          break;
        case '$gte':
          if (!(actualValue >= expectedValue)) return false;
          break;
        case '$lt':
          if (!(actualValue < expectedValue)) return false;
          break;
        case '$lte':
          if (!(actualValue <= expectedValue)) return false;
          break;
        case '$in':
          if (!Array.isArray(expectedValue) || !expectedValue.includes(actualValue)) return false;
          break;
        case '$nin':
          if (!Array.isArray(expectedValue) || expectedValue.includes(actualValue)) return false;
          break;
        case '$exists':
          if (expectedValue && actualValue == null) return false;
          if (!expectedValue && actualValue != null) return false;
          break;
        case '$regex':
          if (!new RegExp(expectedValue).test(actualValue)) return false;
          break;
        default:
          // Operador desconocido, comparación directa
          if (actualValue !== expectedValue) return false;
      }
    }
    return true;
  }

  /**
   * Obtiene las variables para la plantilla basadas en los datos del evento
   */
  public getTemplateVariables(eventData: Record<string, any>): Record<string, any> {
    // Mapear datos del evento a variables de plantilla
    const variables: Record<string, any> = { ...eventData };

    // Agregar variables comunes
    variables.current_year = new Date().getFullYear();
    variables.current_date = new Date().toISOString().split('T')[0];

    return variables;
  }

  /**
   * Verifica si se puede enviar notificación considerando cooldown
   */
  public async canSendToUser(userId: number): Promise<boolean> {
    if (!this.cooldownMinutes) {
      return true;
    }

    // TODO: Implementar verificación de cooldown usando logs de notificaciones
    // Por ahora, siempre permitir
    return true;
  }

  /**
   * Verifica límite diario por usuario
   */
  public async checkDailyLimit(userId: number): Promise<boolean> {
    if (!this.maxPerUserPerDay) {
      return true;
    }

    // TODO: Implementar verificación de límite diario
    // Por ahora, siempre permitir
    return true;
  }

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      eventType: this.eventType,
      triggerCondition: this.triggerCondition,
      templateId: this.templateId,
      templateCode: this.templateCode,
      channels: this.channels,
      priority: this.priority,
      active: this.active,
      cooldownMinutes: this.cooldownMinutes,
      maxPerUserPerDay: this.maxPerUserPerDay,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca reglas activas para un tipo de evento
   */
  static async findActiveRulesForEvent(eventType: string): Promise<NotificationRule[]> {
    return this.findAll({
      where: {
        eventType,
        active: true
      },
      include: [{
        model: EmailTemplate,
        as: 'template',
        where: { active: true },
        required: false
      }],
      order: [['priority', 'DESC'], ['createdAt', 'ASC']]
    });
  }

  /**
   * Obtiene todas las reglas activas
   */
  static async findActiveRules(): Promise<NotificationRule[]> {
    return this.findAll({
      where: { active: true },
      include: [{
        model: EmailTemplate,
        as: 'template',
        required: false
      }],
      order: [['eventType', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Busca reglas por tipo de evento
   */
  static async findRulesByEventType(eventType: string): Promise<NotificationRule[]> {
    return this.findAll({
      where: { eventType },
      include: [{
        model: EmailTemplate,
        as: 'template',
        required: false
      }],
      order: [['active', 'DESC'], ['name', 'ASC']]
    });
  }

  /**
   * Valida si ya existe una regla para el mismo evento y canales
   */
  static async isRuleDuplicate(
    eventType: string,
    channels: NotificationChannel[],
    excludeId?: number
  ): Promise<boolean> {
    const where: any = {
      eventType,
      active: true
    };

    if (excludeId) {
      where.id = { [require('sequelize').Op.ne]: excludeId };
    }

    const existingRules = await this.findAll({ where });

    // Verificar si algún canal se solapa
    for (const rule of existingRules) {
      const overlappingChannels = rule.channels.filter(channel =>
        channels.includes(channel)
      );

      if (overlappingChannels.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Obtiene estadísticas de uso de reglas
   */
  static async getUsageStats(startDate?: Date, endDate?: Date): Promise<Array<{
    ruleId: number;
    name: string;
    eventType: string;
    triggerCount: number;
  }>> {
    // Esta consulta requeriría JOIN con logs de notificaciones
    // Por simplicidad, retornamos estructura básica
    const rules = await this.findAll({
      where: { active: true },
      attributes: ['id', 'name', 'eventType'],
      order: [['eventType', 'ASC'], ['name', 'ASC']]
    });

    // En implementación real, contar triggers desde notification_logs
    return rules.map(rule => ({
      ruleId: rule.id,
      name: rule.name,
      eventType: rule.eventType,
      triggerCount: 0 // TODO: Implementar conteo real
    }));
  }

  /**
   * Desactiva reglas conflictivas
   */
  static async deactivateConflictingRules(eventType: string, channels: NotificationChannel[]): Promise<number> {
    const conflictingRules = await this.findAll({
      where: {
        eventType,
        active: true
      }
    });

    let deactivatedCount = 0;

    for (const rule of conflictingRules) {
      const hasConflict = rule.channels.some(channel => channels.includes(channel));

      if (hasConflict) {
        await rule.update({ active: false });
        deactivatedCount++;
      }
    }

    return deactivatedCount;
  }
}
