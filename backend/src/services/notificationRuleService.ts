/**
 * @fileoverview Servicio de Reglas de Notificación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión de reglas automáticas de notificaciones
 *
 * Archivo: backend/src/services/notificationRuleService.ts
 */

import { NotificationRule } from '../models/NotificationRule';
import { EmailTemplate } from '../models/EmailTemplate';
import {
  NotificationRuleAttributes,
  NotificationRuleCreationAttributes,
  NotificationChannel,
  NotificationPriority
} from '../types/notification.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export class NotificationRuleService {
  /**
   * Obtiene todas las reglas de notificación
   */
  async getNotificationRules(options: {
    eventType?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    rules: NotificationRule[];
    total: number;
  }> {
    try {
      const where: any = {};

      if (options.eventType) {
        where.eventType = options.eventType;
      }

      if (options.active !== undefined) {
        where.active = options.active;
      }

      const { rows: rules, count: total } = await NotificationRule.findAndCountAll({
        where,
        include: [{
          model: EmailTemplate,
          as: 'template',
          required: false
        }],
        order: [['eventType', 'ASC'], ['name', 'ASC']],
        limit: options.limit || 50,
        offset: options.offset || 0
      });

      return { rules, total };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error getting notification rules:', error);
      throw new Error(`Error obteniendo reglas de notificación: ${errorMessage}`);
    }
  }

  /**
   * Obtiene una regla específica por ID
   */
  async getNotificationRuleById(id: number): Promise<NotificationRule | null> {
    try {
      const rule = await NotificationRule.findByPk(id, {
        include: [{
          model: EmailTemplate,
          as: 'template',
          required: false
        }]
      });

      return rule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error getting notification rule by ID:', error);
      throw new Error(`Error obteniendo regla de notificación: ${errorMessage}`);
    }
  }

  /**
   * Crea una nueva regla de notificación
   */
  async createNotificationRule(
    data: any, // Using any to accept CreateNotificationRuleRequest
    createdBy?: number
  ): Promise<{
    success: boolean;
    rule?: NotificationRule;
    error?: string;
  }> {
    try {
      // Verificar si ya existe una regla duplicada
      const isDuplicate = await NotificationRule.isRuleDuplicate(
        data.eventType,
        data.channels
      );

      if (isDuplicate) {
        return {
          success: false,
          error: 'Ya existe una regla activa para este tipo de evento con canales solapados'
        };
      }

      // Verificar que la plantilla existe si se especifica
      if (data.templateId) {
        const template = await EmailTemplate.findByPk(data.templateId);
        if (!template) {
          return {
            success: false,
            error: 'La plantilla de email especificada no existe'
          };
        }
      }

      // Crear la regla con valores por defecto
      const ruleData: any = {
        ...data,
        active: data.active !== undefined ? data.active : true,
        priority: data.priority || 'NORMAL',
        createdBy,
        updatedBy: createdBy
      };

      const rule = await NotificationRule.create(ruleData);

      // Recargar con relaciones
      await rule.reload({
        include: [{
          model: EmailTemplate,
          as: 'template',
          required: false
        }]
      });

      return {
        success: true,
        rule
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error creating notification rule:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Actualiza una regla de notificación existente
   */
  async updateNotificationRule(
    id: number,
    data: Partial<NotificationRuleAttributes>,
    updatedBy?: number
  ): Promise<{
    success: boolean;
    rule?: NotificationRule;
    error?: string;
  }> {
    try {
      const rule = await NotificationRule.findByPk(id);
      if (!rule) {
        return {
          success: false,
          error: 'Regla de notificación no encontrada'
        };
      }

      // Verificar duplicados si se cambian eventType o channels
      if (data.eventType || data.channels) {
        const newEventType = data.eventType || rule.eventType;
        const newChannels = data.channels || rule.channels;

        const isDuplicate = await NotificationRule.isRuleDuplicate(
          newEventType,
          newChannels,
          id
        );

        if (isDuplicate) {
          return {
            success: false,
            error: 'Ya existe una regla activa para este tipo de evento con canales solapados'
          };
        }
      }

      // Verificar que la plantilla existe si se especifica
      if (data.templateId) {
        const template = await EmailTemplate.findByPk(data.templateId);
        if (!template) {
          return {
            success: false,
            error: 'La plantilla de email especificada no existe'
          };
        }
      }

      // Actualizar la regla
      await rule.update({
        ...data,
        updatedBy
      });

      // Recargar con relaciones
      await rule.reload({
        include: [{
          model: EmailTemplate,
          as: 'template',
          required: false
        }]
      });

      return {
        success: true,
        rule
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error updating notification rule:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Elimina una regla de notificación
   */
  async deleteNotificationRule(id: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const rule = await NotificationRule.findByPk(id);
      if (!rule) {
        return {
          success: false,
          error: 'Regla de notificación no encontrada'
        };
      }

      // Soft delete
      await rule.destroy();

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error deleting notification rule:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Activa/desactiva una regla
   */
  async toggleRuleActive(id: number, active: boolean, updatedBy?: number): Promise<{
    success: boolean;
    rule?: NotificationRule;
    error?: string;
  }> {
    try {
      const rule = await NotificationRule.findByPk(id);
      if (!rule) {
        return {
          success: false,
          error: 'Regla de notificación no encontrada'
        };
      }

      await rule.update({
        active,
        updatedBy
      });

      return {
        success: true,
        rule
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error toggling rule active status:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Obtiene estadísticas de reglas
   */
  async getRuleStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byEventType: Record<string, number>;
  }> {
    try {
      const rules = await NotificationRule.findAll({
        attributes: ['active', 'eventType']
      });

      const stats = {
        total: rules.length,
        active: 0,
        inactive: 0,
        byEventType: {} as Record<string, number>
      };

      rules.forEach(rule => {
        if (rule.active) {
          stats.active++;
        } else {
          stats.inactive++;
        }

        stats.byEventType[rule.eventType] = (stats.byEventType[rule.eventType] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting rule stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byEventType: {}
      };
    }
  }
}

export const notificationRuleService = new NotificationRuleService();