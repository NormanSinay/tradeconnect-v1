/**
 * @fileoverview Modelo de Regla de Capacidad para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Regla de Capacidad
 *
 * Archivo: backend/src/models/CapacityRule.ts
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
import { CapacityRule as CapacityRuleInterface } from '../types/capacity.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     CapacityRule:
 *       type: object
 *       required:
 *         - eventId
 *         - type
 *         - name
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la regla de capacidad
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *           example: 1
 *         type:
 *           type: string
 *           enum: [GLOBAL, DATE_SPECIFIC, SESSION_SPECIFIC, ACCESS_TYPE_SPECIFIC]
 *           description: Tipo de regla
 *           example: "DATE_SPECIFIC"
 *         name:
 *           type: string
 *           description: Nombre de la regla
 *           example: "Regla de fin de semana"
 *         description:
 *           type: string
 *           description: Descripción de la regla
 *         conditions:
 *           type: object
 *           description: Condiciones de aplicación
 *         actions:
 *           type: object
 *           description: Acciones a ejecutar
 *         isActive:
 *           type: boolean
 *           description: Si la regla está activa
 *           example: true
 *         priority:
 *           type: integer
 *           description: Prioridad de la regla
 *           example: 10
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *           example: 1
 */

@Table({
  tableName: 'capacity_rules',
  modelName: 'CapacityRule',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    }
  ]
})
export class CapacityRule extends Model<CapacityRuleInterface, Omit<CapacityRuleInterface, 'id' | 'createdAt' | 'updatedAt'>> implements CapacityRuleInterface {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Event)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al evento'
  })
  declare eventId: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.ENUM('GLOBAL', 'DATE_SPECIFIC', 'SESSION_SPECIFIC', 'ACCESS_TYPE_SPECIFIC'),
    comment: 'Tipo de regla de capacidad'
  })
  declare type: 'GLOBAL' | 'DATE_SPECIFIC' | 'SESSION_SPECIFIC' | 'ACCESS_TYPE_SPECIFIC';

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la regla es requerido'
    },
    len: {
      args: [2, 100],
      msg: 'El nombre debe tener entre 2 y 100 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(100),
    comment: 'Nombre descriptivo de la regla'
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
    comment: 'Descripción detallada de la regla'
  })
  declare description?: string;

  @Default({})
  @Column({
    type: DataType.JSON,
    comment: 'Condiciones para aplicar la regla'
  })
  declare conditions: {
    dateFrom?: Date;
    dateTo?: Date;
    sessionId?: number;
    accessTypeId?: number;
    minPurchase?: number;
    userType?: string;
  };

  @Default({})
  @Column({
    type: DataType.JSON,
    comment: 'Acciones a ejecutar cuando se cumple la regla'
  })
  declare actions: {
    capacityLimit?: number;
    overbookingAllowed?: boolean;
    priority?: number;
    priceAdjustment?: number;
  };

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la regla está activa'
  })
  declare isActive: boolean;

  @Default(0)
  @Index
  @Validate({
    min: {
      args: [0],
      msg: 'La prioridad debe ser mayor o igual a 0'
    },
    max: {
      args: [100],
      msg: 'La prioridad no puede exceder 100'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Prioridad de la regla (mayor número = mayor prioridad)'
  })
  declare priority: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que creó la regla'
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

  // ====================================================================
  // HOOKS DE SEQUELIZE
  // ====================================================================

  @BeforeCreate
  @BeforeUpdate
  static async validateCapacityRule(rule: CapacityRule): Promise<void> {
    // Validar condiciones según el tipo de regla
    switch (rule.type) {
      case 'DATE_SPECIFIC':
        if (!rule.conditions.dateFrom || !rule.conditions.dateTo) {
          throw new Error('Las reglas de fecha específica requieren dateFrom y dateTo');
        }
        if (rule.conditions.dateFrom >= rule.conditions.dateTo) {
          throw new Error('dateFrom debe ser anterior a dateTo');
        }
        break;

      case 'SESSION_SPECIFIC':
        if (!rule.conditions.sessionId) {
          throw new Error('Las reglas de sesión específica requieren sessionId');
        }
        break;

      case 'ACCESS_TYPE_SPECIFIC':
        if (!rule.conditions.accessTypeId) {
          throw new Error('Las reglas de tipo de acceso específico requieren accessTypeId');
        }
        break;

      case 'GLOBAL':
        // Las reglas globales no requieren condiciones específicas
        break;
    }

    // Validar acciones
    if (rule.actions.capacityLimit !== undefined && rule.actions.capacityLimit <= 0) {
      throw new Error('El límite de capacidad debe ser mayor a 0');
    }

    if (rule.actions.priceAdjustment !== undefined &&
        (rule.actions.priceAdjustment < -100 || rule.actions.priceAdjustment > 1000)) {
      throw new Error('El ajuste de precio debe estar entre -100% y +1000%');
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la regla se aplica a las condiciones dadas
   */
  public appliesTo(conditions: {
    date?: Date;
    sessionId?: number;
    accessTypeId?: number;
    userType?: string;
    purchaseAmount?: number;
  }): boolean {
    // Verificar condiciones de fecha
    if (this.conditions.dateFrom && this.conditions.dateTo && conditions.date) {
      if (conditions.date < this.conditions.dateFrom || conditions.date > this.conditions.dateTo) {
        return false;
      }
    }

    // Verificar condición de sesión
    if (this.conditions.sessionId && conditions.sessionId !== undefined) {
      if (this.conditions.sessionId !== conditions.sessionId) {
        return false;
      }
    }

    // Verificar condición de tipo de acceso
    if (this.conditions.accessTypeId && conditions.accessTypeId !== undefined) {
      if (this.conditions.accessTypeId !== conditions.accessTypeId) {
        return false;
      }
    }

    // Verificar condición de tipo de usuario
    if (this.conditions.userType && conditions.userType) {
      if (this.conditions.userType !== conditions.userType) {
        return false;
      }
    }

    // Verificar condición de monto mínimo de compra
    if (this.conditions.minPurchase && conditions.purchaseAmount !== undefined) {
      if (conditions.purchaseAmount < this.conditions.minPurchase) {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtiene las acciones a aplicar
   */
  public getApplicableActions(): CapacityRuleInterface['actions'] {
    return this.actions;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      type: this.type,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      priority: this.priority,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas administrativas
   */
  public toAdminJSON(): object {
    return {
      ...this.toPublicJSON(),
      conditions: this.conditions,
      actions: this.actions,
      createdBy: this.createdBy,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca reglas aplicables para un evento y condiciones
   */
  static async findApplicableRules(
    eventId: number,
    conditions: {
      date?: Date;
      sessionId?: number;
      accessTypeId?: number;
      userType?: string;
      purchaseAmount?: number;
    }
  ): Promise<CapacityRule[]> {
    const rules = await this.findAll({
      where: {
        eventId,
        isActive: true
      },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    // Filtrar reglas que se aplican a las condiciones
    return rules.filter(rule => rule.appliesTo(conditions));
  }

  /**
   * Busca reglas por tipo
   */
  static async findByType(eventId: number, type: CapacityRuleInterface['type']): Promise<CapacityRule[]> {
    return this.findAll({
      where: {
        eventId,
        type,
        isActive: true
      },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  /**
   * Busca reglas activas de un evento
   */
  static async findActiveByEvent(eventId: number): Promise<CapacityRule[]> {
    return this.findAll({
      where: {
        eventId,
        isActive: true
      },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'creator' }
      ],
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
  }
}
