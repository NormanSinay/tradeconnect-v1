/**
 * @fileoverview Modelo de Overbooking para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Overbooking
 *
 * Archivo: backend/src/models/Overbooking.ts
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
import { OverbookingConfig } from '../types/capacity.types';

/**
 * @swagger
 * components:
 *   schemas:
 *     Overbooking:
 *       type: object
 *       required:
 *         - eventId
 *         - maxPercentage
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la configuración de overbooking
 *           example: 1
 *         eventId:
 *           type: integer
 *           description: ID del evento
 *           example: 1
 *         maxPercentage:
 *           type: number
 *           description: Porcentaje máximo de overbooking
 *           example: 15
 *         currentPercentage:
 *           type: number
 *           description: Porcentaje actual de overbooking
 *           example: 5
 *         riskLevel:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *           description: Nivel de riesgo
 *           example: "LOW"
 *         autoActions:
 *           type: object
 *           description: Acciones automáticas configuradas
 *         isActive:
 *           type: boolean
 *           description: Si la configuración está activa
 *           example: true
 *         activatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de activación
 *         deactivatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de desactivación
 *         createdBy:
 *           type: integer
 *           description: ID del usuario creador
 *           example: 1
 */

@Table({
  tableName: 'overbookings',
  modelName: 'Overbooking',
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
      fields: ['risk_level']
    },
    {
      fields: ['activated_at']
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
export class Overbooking extends Model<OverbookingConfig, Omit<OverbookingConfig, 'id' | 'createdAt' | 'updatedAt'>> implements OverbookingConfig {
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
      args: [0],
      msg: 'El porcentaje máximo debe ser mayor o igual a 0'
    },
    max: {
      args: [100],
      msg: 'El porcentaje máximo no puede exceder 100%'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 2),
    comment: 'Porcentaje máximo de overbooking permitido (0-100%)'
  })
  declare maxPercentage: number;

  @Default(0)
  @Validate({
    min: {
      args: [0],
      msg: 'El porcentaje actual no puede ser negativo'
    }
  })
  @Column({
    type: DataType.DECIMAL(5, 2),
    comment: 'Porcentaje actual de overbooking'
  })
  declare currentPercentage: number;

  @Default('LOW')
  @Index
  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    comment: 'Nivel de riesgo del overbooking'
  })
  declare riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Default({
    alertAdmins: true,
    notifyUsers: false,
    offerAlternatives: false
  })
  @Column({
    type: DataType.JSON,
    comment: 'Acciones automáticas cuando se activa overbooking'
  })
  declare autoActions: {
    alertAdmins: boolean;
    notifyUsers: boolean;
    offerAlternatives: boolean;
  };

  @Default(true)
  @Index
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Si la configuración de overbooking está activa'
  })
  declare isActive: boolean;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se activó el overbooking'
  })
  declare activatedAt?: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha cuando se desactivó el overbooking'
  })
  declare deactivatedAt?: Date;

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
  static async validateOverbooking(overbooking: Overbooking): Promise<void> {
    // Validar que el porcentaje actual no exceda el máximo
    if (overbooking.currentPercentage > overbooking.maxPercentage) {
      throw new Error('El porcentaje actual no puede exceder el porcentaje máximo');
    }

    // Validar niveles de riesgo
    const riskThresholds = {
      LOW: 25,
      MEDIUM: 50,
      HIGH: 75,
      CRITICAL: 100
    };

    const currentThreshold = riskThresholds[overbooking.riskLevel];
    if (overbooking.currentPercentage > currentThreshold) {
      // Auto-ajustar nivel de riesgo si es necesario
      if (overbooking.currentPercentage >= riskThresholds.CRITICAL) {
        overbooking.riskLevel = 'CRITICAL';
      } else if (overbooking.currentPercentage >= riskThresholds.HIGH) {
        overbooking.riskLevel = 'HIGH';
      } else if (overbooking.currentPercentage >= riskThresholds.MEDIUM) {
        overbooking.riskLevel = 'MEDIUM';
      }
    }
  }

  @BeforeUpdate
  static async handleActivation(overbooking: Overbooking): Promise<void> {
    // Si se está activando, registrar fecha de activación
    if (overbooking.changed('isActive') && overbooking.isActive && !overbooking.activatedAt) {
      overbooking.activatedAt = new Date();
    }

    // Si se está desactivando, registrar fecha de desactivación
    if (overbooking.changed('isActive') && !overbooking.isActive && !overbooking.deactivatedAt) {
      overbooking.deactivatedAt = new Date();
    }
  }

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si el overbooking está activo
   */
  public get isCurrentlyActive(): boolean {
    return this.isActive && this.currentPercentage > 0;
  }

  /**
   * Calcula el porcentaje disponible para overbooking
   */
  public get availableOverbookingPercentage(): number {
    return Math.max(0, this.maxPercentage - this.currentPercentage);
  }

  /**
   * Verifica si se puede incrementar el overbooking
   */
  public canIncrementOverbooking(requestedPercentage: number): boolean {
    return (this.currentPercentage + requestedPercentage) <= this.maxPercentage;
  }

  /**
   * Obtiene el color del nivel de riesgo
   */
  public get riskColor(): string {
    switch (this.riskLevel) {
      case 'LOW': return '#28a745';      // verde
      case 'MEDIUM': return '#ffc107';   // amarillo
      case 'HIGH': return '#fd7e14';     // naranja
      case 'CRITICAL': return '#dc3545'; // rojo
      default: return '#6c757d';         // gris
    }
  }

  /**
   * Serializa para respuestas públicas
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      eventId: this.eventId,
      maxPercentage: this.maxPercentage,
      currentPercentage: this.currentPercentage,
      riskLevel: this.riskLevel,
      riskColor: this.riskColor,
      isActive: this.isActive,
      isCurrentlyActive: this.isCurrentlyActive,
      activatedAt: this.activatedAt,
      createdAt: this.createdAt
    };
  }

  /**
   * Serializa para respuestas administrativas
   */
  public toAdminJSON(): object {
    return {
      ...this.toPublicJSON(),
      autoActions: this.autoActions,
      availableOverbookingPercentage: this.availableOverbookingPercentage,
      metadata: this.metadata,
      createdBy: this.createdBy,
      deactivatedAt: this.deactivatedAt,
      updatedAt: this.updatedAt
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Busca configuración de overbooking por evento
   */
  static async findByEventId(eventId: number, includeDeleted: boolean = false): Promise<Overbooking | null> {
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
   * Busca configuraciones activas con alto riesgo
   */
  static async findHighRiskOverbookings(): Promise<Overbooking[]> {
    return this.findAll({
      where: {
        isActive: true,
        riskLevel: ['HIGH', 'CRITICAL']
      },
      include: [
        { model: Event, as: 'event' }
      ],
      order: [['currentPercentage', 'DESC']]
    });
  }

  /**
   * Busca configuraciones que requieren atención
   */
  static async findRequiringAttention(): Promise<Overbooking[]> {
    return this.findAll({
      where: {
        isActive: true,
        currentPercentage: {
          [Symbol.for('gte')]: 50 // mayor o igual al 50%
        }
      },
      include: [
        { model: Event, as: 'event' }
      ],
      order: [['currentPercentage', 'DESC']]
    });
  }
}
