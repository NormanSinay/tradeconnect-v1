/**
 * @fileoverview Modelo de Capacidad para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Capacidad de eventos
 *
 * Archivo: backend/src/models/Capacity.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  HasMany,
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
import { Op } from 'sequelize';
import { Event } from './Event';
import { User } from './User';
import { CapacityConfig } from '../types/capacity.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     Capacity:
 *       type: object
 *       required:
 *         - eventId
 *         - totalCapacity
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la configuración de capacidad
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *           example: 1
 *         totalCapacity:
 *           type: integer
 *           description: Capacidad total del evento
 *           example: 500
 *         availableCapacity:
 *           type: integer
 *           description: Capacidad disponible actual
 *           example: 450
 *         blockedCapacity:
 *           type: integer
 *           description: Capacidad bloqueada temporalmente
 *           example: 20
 *         overbookingPercentage:
 *           type: number
 *           description: Porcentaje de overbooking permitido
 *           example: 10
 *         overbookingEnabled:
 *           type: boolean
 *           description: Si el overbooking está habilitado
 *           example: true
 *         waitlistEnabled:
 *           type: boolean
 *           description: Si la lista de espera está habilitada
 *           example: true
 *         lockTimeoutMinutes:
 *           type: integer
 *           description: Tiempo de bloqueo en minutos
 *           example: 15
 *         alertThresholds:
 *           type: object
 *           description: Umbrales de alerta de ocupación
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
  tableName: 'capacities',
  modelName: 'Capacity',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['created_at']
    },
    {
      unique: true,
      fields: ['event_id'],
      where: {
        deleted_at: null
      }
    }
  ]
})
export class Capacity extends Model<CapacityConfig, Omit<CapacityConfig, 'id' | 'createdAt' | 'updatedAt'>> implements CapacityConfig {
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
  @Validate({
    min: {
      args: [1],
      msg: 'La capacidad total debe ser al menos 1'
    },
    max: {
      args: [100000],
      msg: 'La capacidad total no puede exceder 100,000'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad total del evento'
  })
  declare totalCapacity: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'La capacidad disponible no puede ser negativa'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad disponible actual (calculada)'
  })
  declare availableCapacity: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'La capacidad bloqueada no puede ser negativa'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Capacidad bloqueada temporalmente'
  })
  declare blockedCapacity: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El porcentaje de overbooking no puede ser negativo'
    },
    max: {
      args: [50],
      msg: 'El porcentaje de overbooking no puede exceder 50%'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 2),
    comment: 'Porcentaje de overbooking permitido (0-50%)'
  })
  declare overbookingPercentage: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si el overbooking está habilitado'
  })
  declare overbookingEnabled: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la lista de espera está habilitada'
  })
  declare waitlistEnabled: boolean;

  @Default(15)
  @Validate({
    min: {
      args: [5],
      msg: 'El tiempo de bloqueo debe ser al menos 5 minutos'
    },
    max: {
      args: [60],
      msg: 'El tiempo de bloqueo no puede exceder 60 minutos'
    }
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Tiempo de bloqueo temporal en minutos (5-60)'
  })
  declare lockTimeoutMinutes: number;

  @Default({
    low: 80,
    medium: 90,
    high: 95
  })
  @Column({
    type: DataType.JSON,
    comment: 'Umbrales de alerta de ocupación (%)'
  })
  declare alertThresholds: {
    low: number;
    medium: number;
    high: number;
  };

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la configuración está activa'
  })
  declare isActive: boolean;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de configuración'
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
  static async validateCapacity(capacity: Capacity): Promise<void> {
    // Validar que la capacidad disponible no sea negativa
    if (capacity.availableCapacity < 0) {
      throw new Error('La capacidad disponible no puede ser negativa');
    }

    // Validar que la capacidad bloqueada no exceda la capacidad total
    if (capacity.blockedCapacity > capacity.totalCapacity) {
      throw new Error('La capacidad bloqueada no puede exceder la capacidad total');
    }

    // Validar umbrales de alerta
    const thresholds = capacity.alertThresholds;
    if (thresholds.low >= thresholds.medium || thresholds.medium >= thresholds.high) {
      throw new Error('Los umbrales de alerta deben ser progresivos: low < medium < high');
    }

    if (thresholds.low < 0 || thresholds.low > 100 ||
        thresholds.medium < 0 || thresholds.medium > 100 ||
        thresholds.high < 0 || thresholds.high > 100) {
      throw new Error('Los umbrales de alerta deben estar entre 0 y 100');
    }
  }

  @BeforeCreate
  static async initializeAvailableCapacity(capacity: Capacity): Promise<void> {
    // Si no se especifica capacidad disponible, inicializar con capacidad total
    if (capacity.availableCapacity === undefined || capacity.availableCapacity === null) {
      capacity.availableCapacity = capacity.totalCapacity;
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el evento tiene capacidad disponible
   */
  public get hasAvailableCapacity(): boolean {
    return this.availableCapacity > 0;
  }

  /**
   * Calcula el porcentaje de ocupación actual
   */
  public get utilizationPercentage(): number {
    if (this.totalCapacity === 0) return 0;
    const occupied = this.totalCapacity - this.availableCapacity;
    return Math.round((occupied / this.totalCapacity) * 100);
  }

  /**
   * Verifica si se debe activar overbooking
   */
  public get shouldActivateOverbooking(): boolean {
    if (!this.overbookingEnabled) return false;
    return this.utilizationPercentage >= 100;
  }

  /**
   * Obtiene el nivel de alerta actual
   */
  public get currentAlertLevel(): 'none' | 'low' | 'medium' | 'high' {
    const utilization = this.utilizationPercentage;

    if (utilization >= this.alertThresholds.high) return 'high';
    if (utilization >= this.alertThresholds.medium) return 'medium';
    if (utilization >= this.alertThresholds.low) return 'low';
    return 'none';
  }

  /**
   * Calcula capacidad máxima con overbooking
   */
  public get maxCapacityWithOverbooking(): number {
    if (!this.overbookingEnabled) return this.totalCapacity;
    const overbookingAmount = Math.floor(this.totalCapacity * (this.overbookingPercentage / 100));
    return this.totalCapacity + overbookingAmount;
  }

  /**
   * Verifica si se puede bloquear capacidad adicional
   */
  public canBlockCapacity(requestedAmount: number): boolean {
    const maxAllowed = this.maxCapacityWithOverbooking;
    const currentlyOccupied = this.totalCapacity - this.availableCapacity;
    return (currentlyOccupied + this.blockedCapacity + requestedAmount) <= maxAllowed;
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      totalCapacity: this.totalCapacity,
      availableCapacity: this.availableCapacity,
      blockedCapacity: this.blockedCapacity,
      utilizationPercentage: this.utilizationPercentage,
      overbookingEnabled: this.overbookingEnabled,
      waitlistEnabled: this.waitlistEnabled,
      currentAlertLevel: this.currentAlertLevel,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas administrativas
   */
  public toAdminJSON(): object {
    return {
      ...this.toPublicJSON(),
      overbookingPercentage: this.overbookingPercentage,
      lockTimeoutMinutes: this.lockTimeoutMinutes,
      alertThresholds: this.alertThresholds,
      maxCapacityWithOverbooking: this.maxCapacityWithOverbooking,
      shouldActivateOverbooking: this.shouldActivateOverbooking,
      metadata: this.metadata,
      createdBy: this.createdBy,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca configuración de capacidad por evento
   */
  static async findByEventId(eventId: number, includeDeleted: boolean = false): Promise<Capacity | null> {
    return this.findOne({
      where: { eventId },
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'creator' }
      ],
      paranoid: !includeDeleted
    });
  }

  /**
   * Busca configuraciones activas
   */
  static async findActiveCapacities(options: {
    limit?: number;
    offset?: number;
    eventIds?: number[];
  } = {}): Promise<{ rows: Capacity[]; count: number }> {
    const { limit = 20, offset = 0, eventIds } = options;

    const where: any = {
      isActive: true
    };

    if (eventIds && eventIds.length > 0) {
      where.eventId = eventIds;
    }

    return this.findAndCountAll({
      where,
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'creator' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca configuraciones que requieren atención (alertas)
   */
  static async findCapacitiesRequiringAttention(): Promise<Capacity[]> {
    // Esta consulta encontraría capacidades con alta utilización
    // Implementación simplificada - en producción usaría una consulta más compleja
    return this.findAll({
      where: {
        isActive: true
      },
      include: [
        { model: Event, as: 'event' }
      ]
    });
  }
}