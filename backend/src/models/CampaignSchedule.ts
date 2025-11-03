/**
 * @fileoverview Modelo de Programación de Campaña para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para automatizar el envío de campañas de email
 *
 * Archivo: backend/src/models/CampaignSchedule.ts
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
  Default,
  Validate,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { EmailCampaign } from './EmailCampaign';

/**
 * Frecuencia de envío de campañas automatizadas
 */
export enum CampaignScheduleFrequency {
  ONCE = 'ONCE',           // Una sola vez
  DAILY = 'DAILY',         // Diario
  WEEKLY = 'WEEKLY',       // Semanal
  MONTHLY = 'MONTHLY',     // Mensual
  CUSTOM = 'CUSTOM'        // Personalizado (cron expression)
}

/**
 * Estado de la programación
 */
export enum CampaignScheduleStatus {
  ACTIVE = 'ACTIVE',       // Activa
  PAUSED = 'PAUSED',       // Pausada
  COMPLETED = 'COMPLETED', // Completada
  CANCELLED = 'CANCELLED' // Cancelada
}

/**
 * Días de la semana para envíos semanales
 */
export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

/**
 * Atributos del modelo CampaignSchedule
 */
export interface CampaignScheduleAttributes {
  id?: number;
  campaignId: number;
  name: string;
  description?: string;
  status: CampaignScheduleStatus;
  frequency: CampaignScheduleFrequency;
  startDate: Date;
  endDate?: Date;
  nextRunAt?: Date;
  lastRunAt?: Date;
  timezone: string;
  // Configuración para frecuencias específicas
  dailyTime?: string; // HH:MM para envíos diarios
  weeklyDays?: WeekDay[]; // Días de la semana
  weeklyTime?: string; // HH:MM para envíos semanales
  monthlyDay?: number; // Día del mes (1-31)
  monthlyTime?: string; // HH:MM para envíos mensuales
  cronExpression?: string; // Para frecuencias personalizadas
  // Configuración adicional
  maxExecutions?: number; // Máximo número de ejecuciones
  executionCount: number; // Número de ejecuciones realizadas
  conditions?: Record<string, any>; // Condiciones para ejecutar
  metadata?: Record<string, any>;
  createdBy: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de programación
 */
export interface CampaignScheduleCreationAttributes extends Omit<CampaignScheduleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     CampaignSchedule:
 *       type: object
 *       required:
 *         - campaignId
 *         - name
 *         - status
 *         - frequency
 *         - startDate
 *         - timezone
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la programación
 *           example: 1
 *         campaignId:
 *           type: integer
 *           description: ID de la campaña a programar
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre de la programación
 *           example: "Newsletter semanal"
 *         description:
 *           type: string
 *           description: Descripción de la programación
 *         status:
 *           type: string
 *           enum: [ACTIVE, PAUSED, COMPLETED, CANCELLED]
 *           description: Estado de la programación
 *         frequency:
 *           type: string
 *           enum: [ONCE, DAILY, WEEKLY, MONTHLY, CUSTOM]
 *           description: Frecuencia de envío
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de la programación
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin de la programación (opcional)
 *         nextRunAt:
 *           type: string
 *           format: date-time
 *           description: Próxima ejecución programada
 *         lastRunAt:
 *           type: string
 *           format: date-time
 *           description: Última ejecución realizada
 *         timezone:
 *           type: string
 *           description: Zona horaria para la programación
 *           example: "America/Guatemala"
 *         dailyTime:
 *           type: string
 *           description: Hora para envíos diarios (HH:MM)
 *           example: "09:00"
 *         weeklyDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *           description: Días de la semana para envíos semanales
 *         weeklyTime:
 *           type: string
 *           description: Hora para envíos semanales (HH:MM)
 *           example: "10:00"
 *         monthlyDay:
 *           type: integer
 *           description: Día del mes para envíos mensuales
 *           example: 15
 *         monthlyTime:
 *           type: string
 *           description: Hora para envíos mensuales (HH:MM)
 *           example: "08:00"
 *         cronExpression:
 *           type: string
 *           description: Expresión cron para frecuencias personalizadas
 *           example: "0 9 * * 1"
 *         maxExecutions:
 *           type: integer
 *           description: Máximo número de ejecuciones
 *         executionCount:
 *           type: integer
 *           description: Número de ejecuciones realizadas
 *           default: 0
 *         conditions:
 *           type: object
 *           description: Condiciones adicionales para ejecutar
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales
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
  tableName: 'campaign_schedules',
  modelName: 'CampaignSchedule',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['campaign_id'],
      name: 'idx_campaign_schedules_campaign_id'
    },
    {
      fields: ['status'],
      name: 'idx_campaign_schedules_status'
    },
    {
      fields: ['frequency'],
      name: 'idx_campaign_schedules_frequency'
    },
    {
      fields: ['next_run_at'],
      name: 'idx_campaign_schedules_next_run_at'
    },
    {
      fields: ['last_run_at'],
      name: 'idx_campaign_schedules_last_run_at'
    },
    {
      fields: ['start_date'],
      name: 'idx_campaign_schedules_start_date'
    },
    {
      fields: ['end_date'],
      name: 'idx_campaign_schedules_end_date'
    },
    {
      fields: ['created_by'],
      name: 'idx_campaign_schedules_created_by'
    },
    {
      fields: ['created_at'],
      name: 'idx_campaign_schedules_created_at'
    },
    {
      fields: ['status', 'next_run_at'],
      name: 'idx_campaign_schedules_status_next_run'
    }
  ]
})
export class CampaignSchedule extends Model<CampaignScheduleAttributes, CampaignScheduleCreationAttributes> implements CampaignScheduleAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @ForeignKey(() => EmailCampaign)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la campaña de email a programar'
  })
  declare campaignId: number;

  @AllowNull(false)
  @Validate({
    notEmpty: {
      msg: 'El nombre de la programación es requerido'
    },
    len: {
      args: [2, 255],
      msg: 'El nombre debe tener entre 2 y 255 caracteres'
    }
  })
  @Column({
    type: DataType.STRING(255),
    comment: 'Nombre descriptivo de la programación'
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    comment: 'Descripción detallada de la programación'
  })
  declare description?: string;

  @AllowNull(false)
  @Default(CampaignScheduleStatus.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(CampaignScheduleStatus)),
    comment: 'Estado actual de la programación'
  })
  declare status: CampaignScheduleStatus;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(CampaignScheduleFrequency)),
    comment: 'Frecuencia de ejecución de la campaña'
  })
  declare frequency: CampaignScheduleFrequency;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de inicio de la programación'
  })
  declare startDate: Date;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha de fin de la programación (opcional)'
  })
  declare endDate?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Próxima ejecución programada'
  })
  declare nextRunAt?: Date;

  @Index
  @Column({
    type: DataType.DATE,
    comment: 'Última ejecución realizada'
  })
  declare lastRunAt?: Date;

  @AllowNull(false)
  @Default('America/Guatemala')
  @Column({
    type: DataType.STRING(50),
    comment: 'Zona horaria para calcular las ejecuciones'
  })
  declare timezone: string;

  // Configuración para frecuencia diaria
  @Validate({
    is: {
      args: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      msg: 'La hora diaria debe tener formato HH:MM'
    }
  })
  @Column({
    type: DataType.STRING(5),
    comment: 'Hora del día para envíos diarios (HH:MM)'
  })
  declare dailyTime?: string;

  // Configuración para frecuencia semanal
  @Column({
    type: DataType.JSONB,
    comment: 'Días de la semana para envíos semanales'
  })
  declare weeklyDays?: WeekDay[];

  @Validate({
    is: {
      args: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      msg: 'La hora semanal debe tener formato HH:MM'
    }
  })
  @Column({
    type: DataType.STRING(5),
    comment: 'Hora de la semana para envíos semanales (HH:MM)'
  })
  declare weeklyTime?: string;

  // Configuración para frecuencia mensual
  @Validate({
    min: 1,
    max: 31,
    msg: 'El día del mes debe estar entre 1 y 31'
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Día del mes para envíos mensuales (1-31)'
  })
  declare monthlyDay?: number;

  @Validate({
    is: {
      args: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      msg: 'La hora mensual debe tener formato HH:MM'
    }
  })
  @Column({
    type: DataType.STRING(5),
    comment: 'Hora del mes para envíos mensuales (HH:MM)'
  })
  declare monthlyTime?: string;

  // Configuración para frecuencia personalizada
  @Column({
    type: DataType.STRING(100),
    comment: 'Expresión cron para frecuencias personalizadas'
  })
  declare cronExpression?: string;

  @Validate({
    min: 1,
    msg: 'El máximo de ejecuciones debe ser mayor a 0'
  })
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de ejecuciones permitidas'
  })
  declare maxExecutions?: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de ejecuciones realizadas'
  })
  declare executionCount: number;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Condiciones adicionales para determinar si ejecutar'
  })
  declare conditions?: Record<string, any>;

  @Default({})
  @Column({
    type: DataType.JSONB,
    comment: 'Metadatos adicionales de la programación'
  })
  declare metadata?: Record<string, any>;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que creó la programación'
  })
  declare createdBy: number;

  @Column({
    type: DataType.INTEGER,
    comment: 'ID del usuario que actualizó la programación'
  })
  declare updatedBy?: number;

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

  @BelongsTo(() => EmailCampaign)
  declare campaign: EmailCampaign;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la programación está activa
   */
  public get isActive(): boolean {
    return this.status === CampaignScheduleStatus.ACTIVE;
  }

  /**
   * Verifica si la programación puede ejecutarse
   */
  public get canExecute(): boolean {
    if (!this.isActive) return false;
    if (this.endDate && new Date() > this.endDate) return false;
    if (this.maxExecutions && this.executionCount >= this.maxExecutions) return false;
    return true;
  }

  /**
   * Verifica si debe ejecutarse ahora
   */
  public shouldExecuteNow(): boolean {
    if (!this.canExecute || !this.nextRunAt) return false;
    return new Date() >= this.nextRunAt;
  }

  /**
   * Calcula la próxima ejecución
   */
  public calculateNextRun(): Date | null {
    const now = new Date();
    let nextRun: Date | null = null;

    switch (this.frequency) {
      case CampaignScheduleFrequency.ONCE:
        // Para ejecuciones únicas, si no se ha ejecutado aún
        if (this.executionCount === 0 && this.startDate > now) {
          nextRun = new Date(this.startDate);
        }
        break;

      case CampaignScheduleFrequency.DAILY:
        if (this.dailyTime) {
          nextRun = this.calculateNextDailyRun(now);
        }
        break;

      case CampaignScheduleFrequency.WEEKLY:
        if (this.weeklyDays && this.weeklyDays.length > 0 && this.weeklyTime) {
          nextRun = this.calculateNextWeeklyRun(now);
        }
        break;

      case CampaignScheduleFrequency.MONTHLY:
        if (this.monthlyDay && this.monthlyTime) {
          nextRun = this.calculateNextMonthlyRun(now);
        }
        break;

      case CampaignScheduleFrequency.CUSTOM:
        if (this.cronExpression) {
          nextRun = this.calculateNextCronRun(now);
        }
        break;
    }

    return nextRun;
  }

  /**
   * Calcula próxima ejecución diaria
   */
  private calculateNextDailyRun(now: Date): Date {
    const [hours, minutes] = this.dailyTime!.split(':').map(Number);
    const today = new Date(now);
    today.setHours(hours, minutes, 0, 0);

    if (today > now) {
      return today; // Hoy a la hora especificada
    } else {
      // Mañana a la misma hora
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  }

  /**
   * Calcula próxima ejecución semanal
   */
  private calculateNextWeeklyRun(now: Date): Date {
    const [hours, minutes] = this.weeklyTime!.split(':').map(Number);
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const targetDays = this.weeklyDays!.map(day => {
      const dayMap: Record<WeekDay, number> = {
        [WeekDay.SUNDAY]: 0,
        [WeekDay.MONDAY]: 1,
        [WeekDay.TUESDAY]: 2,
        [WeekDay.WEDNESDAY]: 3,
        [WeekDay.THURSDAY]: 4,
        [WeekDay.FRIDAY]: 5,
        [WeekDay.SATURDAY]: 6
      };
      return dayMap[day];
    });

    // Encontrar el próximo día de la semana
    let daysToAdd = 7; // Máximo una semana
    for (const targetDay of targetDays) {
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7; // Si ya pasó esta semana, siguiente semana
      if (diff < daysToAdd) daysToAdd = diff;
    }

    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + daysToAdd);
    nextRun.setHours(hours, minutes, 0, 0);

    return nextRun;
  }

  /**
   * Calcula próxima ejecución mensual
   */
  private calculateNextMonthlyRun(now: Date): Date {
    const [hours, minutes] = this.monthlyTime!.split(':').map(Number);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let targetDate = new Date(currentYear, currentMonth, this.monthlyDay!, hours, minutes, 0, 0);

    if (targetDate <= now) {
      // Si ya pasó este mes, siguiente mes
      targetDate = new Date(currentYear, currentMonth + 1, this.monthlyDay!, hours, minutes, 0, 0);
    }

    return targetDate;
  }

  /**
   * Calcula próxima ejecución basada en cron (simplificada)
   */
  private calculateNextCronRun(now: Date): Date | null {
    // Implementación simplificada - en producción usar librería como node-cron
    // Por ahora, devolver null para frecuencias personalizadas
    return null;
  }

  /**
   * Registra una ejecución
   */
  public async recordExecution(): Promise<void> {
    this.executionCount += 1;
    this.lastRunAt = new Date();

    // Calcular próxima ejecución
    const nextRun = this.calculateNextRun();
    this.nextRunAt = nextRun || undefined;

    // Si no hay próxima ejecución o se alcanzó el máximo, marcar como completada
    if (!nextRun || (this.maxExecutions && this.executionCount >= this.maxExecutions)) {
      this.status = CampaignScheduleStatus.COMPLETED;
    }

    await this.save();
  }

  /**
   * Pausa la programación
   */
  public async pause(): Promise<void> {
    this.status = CampaignScheduleStatus.PAUSED;
    await this.save();
  }

  /**
   * Reactiva la programación
   */
  public async resume(): Promise<void> {
    this.status = CampaignScheduleStatus.ACTIVE;
    const nextRun = this.calculateNextRun();
    this.nextRunAt = nextRun || undefined;
    await this.save();
  }

  /**
   * Cancela la programación
   */
  public async cancel(): Promise<void> {
    this.status = CampaignScheduleStatus.CANCELLED;
    this.nextRunAt = undefined;
    await this.save();
  }

  /**
   * Serializa para respuesta de API
   */
  public toJSON(): object {
    return {
      id: this.id,
      campaignId: this.campaignId,
      name: this.name,
      description: this.description,
      status: this.status,
      frequency: this.frequency,
      startDate: this.startDate,
      endDate: this.endDate,
      nextRunAt: this.nextRunAt,
      lastRunAt: this.lastRunAt,
      timezone: this.timezone,
      dailyTime: this.dailyTime,
      weeklyDays: this.weeklyDays,
      weeklyTime: this.weeklyTime,
      monthlyDay: this.monthlyDay,
      monthlyTime: this.monthlyTime,
      cronExpression: this.cronExpression,
      maxExecutions: this.maxExecutions,
      executionCount: this.executionCount,
      conditions: this.conditions,
      metadata: this.metadata,
      canExecute: this.canExecute,
      shouldExecuteNow: this.shouldExecuteNow(),
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
   * Busca programaciones activas que deben ejecutarse
   */
  static async findDueSchedules(): Promise<CampaignSchedule[]> {
    const now = new Date();

    return this.findAll({
      where: {
        status: CampaignScheduleStatus.ACTIVE,
        nextRunAt: {
          [require('sequelize').Op.lte]: now
        }
      },
      include: [{
        model: EmailCampaign,
        as: 'campaign',
        where: {
          status: require('./EmailCampaign').EmailCampaignStatus.DRAFT // Solo campañas en borrador para automatización
        },
        required: true
      }],
      order: [['nextRunAt', 'ASC']]
    });
  }

  /**
   * Busca programaciones por campaña
   */
  static async findByCampaign(campaignId: number): Promise<CampaignSchedule[]> {
    return this.findAll({
      where: { campaignId },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Busca programaciones activas
   */
  static async findActiveSchedules(): Promise<CampaignSchedule[]> {
    return this.findAll({
      where: {
        status: CampaignScheduleStatus.ACTIVE,
        nextRunAt: {
          [require('sequelize').Op.not]: null
        }
      },
      order: [['nextRunAt', 'ASC']]
    });
  }

  /**
   * Obtiene estadísticas de programaciones
   */
  static async getScheduleStats(): Promise<{
    total: number;
    active: number;
    paused: number;
    completed: number;
    cancelled: number;
  }> {
    const stats = await this.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result = {
      total: 0,
      active: 0,
      paused: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach((stat: any) => {
      const count = parseInt(stat.count);
      result.total += count;

      switch (stat.status) {
        case CampaignScheduleStatus.ACTIVE:
          result.active = count;
          break;
        case CampaignScheduleStatus.PAUSED:
          result.paused = count;
          break;
        case CampaignScheduleStatus.COMPLETED:
          result.completed = count;
          break;
        case CampaignScheduleStatus.CANCELLED:
          result.cancelled = count;
          break;
      }
    });

    return result;
  }
}