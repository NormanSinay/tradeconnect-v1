/**
 * @fileoverview Servicio de Notificaciones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio principal para gestión de notificaciones multicanal
 *
 * Archivo: backend/src/services/notificationService.ts
 */

import { Notification } from '../models/Notification';
import { NotificationRule } from '../models/NotificationRule';
import { NotificationLog } from '../models/NotificationLog';
import { User } from '../models/User';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { whatsappService } from './whatsappService';
import { queueService } from './queueService';
import { userPreferencesService } from './userPreferencesService';
import {
  NotificationAttributes,
  NotificationCreationAttributes,
  NotificationStatus,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  SendNotificationData,
  BulkNotificationData,
  NotificationRuleAttributes,
  EmailTemplateType
} from '../types/notification.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export class NotificationService {
  /**
   * Envía una notificación individual
   */
  async sendNotification(data: SendNotificationData): Promise<{
    success: boolean;
    notificationId?: number;
    error?: string;
  }> {
    try {
      // Validar que el usuario existe y tiene email verificado
      const user = await User.findByPk(data.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (data.channel === NotificationChannel.EMAIL && !user.isEmailVerified) {
        throw new Error('El usuario no tiene email verificado');
      }

      // Verificar preferencias de usuario
      const allowsNotification = await userPreferencesService.userAllowsNotification(
        data.userId,
        data.channel,
        data.templateCode ? await this.getEmailTemplateType(data.templateCode) : undefined
      );

      if (!allowsNotification) {
        logger.info(`Usuario ${data.userId} no permite notificaciones del canal ${data.channel}`);
        return {
          success: true,
          notificationId: undefined // No crear notificación si no está permitida
        };
      }

      // Crear registro de notificación
      const notification = await Notification.create({
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        status: NotificationStatus.PENDING,
        priority: data.priority || NotificationPriority.NORMAL,
        subject: data.subject,
        message: data.message,
        data: data.data || {},
        templateId: data.templateId,
        templateCode: data.templateCode,
        scheduledAt: data.scheduledAt,
        retryCount: 0,
        maxRetries: 3
      });

      // Si está programada para el futuro, solo crear el registro
      if (data.scheduledAt && data.scheduledAt > new Date()) {
        return {
          success: true,
          notificationId: notification.id
        };
      }

      // Enviar inmediatamente
      await this.processNotification(notification);

      return {
        success: true,
        notificationId: notification.id
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error sending notification:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Envía notificaciones masivas
   */
  async sendBulkNotifications(data: BulkNotificationData): Promise<{
    success: boolean;
    totalSent: number;
    totalFailed: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      totalSent: 0,
      totalFailed: 0,
      errors: [] as string[]
    };

    try {
      // Procesar en lotes para evitar sobrecarga
      const batchSize = 50;

      for (let i = 0; i < data.userIds.length; i += batchSize) {
        const batch = data.userIds.slice(i, i + batchSize);

        const promises = batch.map(userId => this.sendNotification({
          userId,
          type: data.type,
          channel: data.channel,
          priority: data.priority,
          subject: data.subject,
          message: data.message,
          data: data.data,
          templateId: data.templateId,
          templateCode: data.templateCode,
          scheduledAt: data.scheduledAt
        }));

        const batchResults = await Promise.allSettled(promises);

        batchResults.forEach((promiseResult, index) => {
          if (promiseResult.status === 'fulfilled') {
            if (promiseResult.value.success) {
              result.totalSent++;
            } else {
              result.totalFailed++;
              result.errors.push(`Usuario ${batch[index]}: ${promiseResult.value.error}`);
            }
          } else {
            result.totalFailed++;
            result.errors.push(`Usuario ${batch[index]}: ${promiseResult.reason}`);
          }
        });

        // Pequeña pausa entre lotes
        if (i + batchSize < data.userIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      result.errors.push(errorMessage);
      logger.error('Error sending bulk notifications:', error);
    }

    return result;
  }

  /**
   * Procesa una notificación según su canal
   */
  private async processNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(notification);
          break;
        case NotificationChannel.POPUP:
          await this.sendPopupNotification(notification);
          break;
        case NotificationChannel.SMS:
          await this.sendSMSNotification(notification);
          break;
        case NotificationChannel.WHATSAPP:
          await this.sendWhatsAppNotification(notification);
          break;
        default:
          throw new Error(`Canal no soportado: ${notification.channel}`);
      }

      // Marcar como enviada
      await notification.markAsSent();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      await notification.markAsFailed(errorMessage);
      throw error;
    }
  }

  /**
   * Envía notificación por email
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    if (!notification.templateCode) {
      throw new Error('Se requiere código de plantilla para emails');
    }

    await emailService.sendTemplateEmail({
      to: notification.user.email,
      templateCode: notification.templateCode,
      variables: notification.data,
      priority: this.mapPriorityToEmail(notification.priority),
      notificationId: notification.id
    });
  }

  /**
   * Envía notificación popup (WebSocket)
   */
  private async sendPopupNotification(notification: Notification): Promise<void> {
    // TODO: Implementar envío por WebSocket
    // Por ahora, solo marcar como enviada
    await notification.markAsDelivered();
  }

  /**
   * Envía notificación SMS
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    const user = await User.findByPk(notification.userId);
    if (!user || !user.phone) {
      throw new Error('Usuario no encontrado o sin número de teléfono');
    }

    const result = await smsService.sendSMS({
      to: user.phone,
      message: notification.message || notification.subject || 'Notificación de TradeConnect'
    });

    if (!result.success) {
      throw new Error(result.error || 'Error enviando SMS');
    }
  }

  /**
   * Envía notificación WhatsApp
   */
  private async sendWhatsAppNotification(notification: Notification): Promise<void> {
    const user = await User.findByPk(notification.userId);
    if (!user || !user.phone) {
      throw new Error('Usuario no encontrado o sin número de teléfono');
    }

    const result = await whatsappService.sendWhatsApp({
      to: user.phone,
      message: notification.message || notification.subject || 'Notificación de TradeConnect'
    });

    if (!result.success) {
      throw new Error(result.error || 'Error enviando WhatsApp');
    }
  }

  /**
   * Mapea prioridad de notificación a prioridad de email
   */
  private mapPriorityToEmail(priority: NotificationPriority): 'HIGH' | 'NORMAL' | 'LOW' {
    switch (priority) {
      case NotificationPriority.CRITICAL:
      case NotificationPriority.HIGH:
        return 'HIGH';
      case NotificationPriority.LOW:
        return 'LOW';
      default:
        return 'NORMAL';
    }
  }

  /**
   * Procesa reglas automáticas de notificación
   */
  async processNotificationRules(eventType: string, eventData: Record<string, any>): Promise<void> {
    try {
      const rules = await NotificationRule.findActiveRulesForEvent(eventType);

      for (const rule of rules) {
        if (rule.shouldTrigger(eventData)) {
          await this.triggerRule(rule, eventData);
        }
      }
    } catch (error) {
      logger.error('Error processing notification rules:', error);
    }
  }

  /**
   * Dispara una regla de notificación
   */
  private async triggerRule(rule: NotificationRule, eventData: Record<string, any>): Promise<void> {
    try {
      // Verificar límites de usuario
      const userId = eventData.userId || eventData.usuario_id;
      if (!userId) {
        logger.warn('No se pudo determinar userId para regla de notificación');
        return;
      }

      if (!(await rule.checkDailyLimit(userId))) {
        logger.info(`Límite diario alcanzado para usuario ${userId}`);
        return;
      }

      // Crear notificaciones para cada canal
      for (const channel of rule.channels) {
        const notificationData: SendNotificationData = {
          userId,
          type: this.mapChannelToType(channel),
          channel,
          priority: rule.priority,
          message: 'Notificación automática', // Se reemplaza por plantilla
          data: rule.getTemplateVariables(eventData),
          templateCode: rule.templateCode
        };

        await this.sendNotification(notificationData);
      }

      // Registrar log de regla disparada
      await NotificationLog.logSystemEvent(
        'RULE_TRIGGERED',
        {
          ruleId: rule.id,
          eventType: rule.eventType,
          eventData
        }
      );

    } catch (error) {
      logger.error('Error triggering notification rule:', error);
    }
  }

  /**
   * Mapea canal a tipo de notificación
   */
  private mapChannelToType(channel: NotificationChannel): NotificationType {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return NotificationType.EMAIL;
      case NotificationChannel.POPUP:
        return NotificationType.POPUP;
      case NotificationChannel.SMS:
        return NotificationType.SMS;
      case NotificationChannel.WHATSAPP:
        return NotificationType.WHATSAPP;
      default:
        return NotificationType.EMAIL;
    }
  }

  /**
   * Marca notificación como leída
   */
  async markAsRead(notificationId: number, userId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        return { success: false, error: 'Notificación no encontrada' };
      }

      await notification.markAsRead();

      // Registrar log
      await NotificationLog.logRead(notificationId);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error marking notification as read:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Obtiene notificaciones de un usuario
   */
  async getUserNotifications(
    userId: number,
    options: {
      status?: NotificationStatus;
      channel?: NotificationChannel;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    const where: any = { userId };

    if (options.status) {
      where.status = options.status;
    }

    if (options.channel) {
      where.channel = options.channel;
    }

    const { rows: notifications, count: total } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: options.limit || 20,
      offset: options.offset || 0
    });

    return { notifications, total };
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getNotificationStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    const notifications = await Notification.findAll({
      where,
      attributes: ['status', 'channel', 'type']
    });

    const stats = {
      total: notifications.length,
      byStatus: {} as Record<string, number>,
      byChannel: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    notifications.forEach(notification => {
      stats.byStatus[notification.status] = (stats.byStatus[notification.status] || 0) + 1;
      stats.byChannel[notification.channel] = (stats.byChannel[notification.channel] || 0) + 1;
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Reintenta notificaciones fallidas
   */
  async retryFailedNotifications(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    const result = { processed: 0, successful: 0, failed: 0 };

    try {
      const failedNotifications = await Notification.findFailedNotificationsForRetry();

      for (const notification of failedNotifications) {
        result.processed++;

        try {
          await notification.incrementRetryCount();

          if (notification.canRetry()) {
            await this.processNotification(notification);
            result.successful++;
          } else {
            // Máximo de reintentos alcanzado
            await notification.markAsFailed('Máximo de reintentos alcanzado');
            result.failed++;
          }
        } catch (error) {
          result.failed++;
          logger.error(`Error retrying notification ${notification.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error in retry process:', error);
    }

    return result;
  }

  /**
   * Limpia notificaciones antiguas
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    return Notification.cleanupOldNotifications(daysOld);
  }

  /**
   * Registra apertura de email (tracking pixel)
   */
  async trackEmailOpen(
    notificationId: number,
    trackingData: {
      userAgent: string;
      ipAddress: string;
      timestamp: Date;
    }
  ): Promise<void> {
    try {
      // Registrar log de apertura
      await NotificationLog.logSystemEvent('EMAIL_OPENED', {
        notificationId,
        trackingData
      });

    } catch (error) {
      logger.error('Error tracking email open:', error);
    }
  }

  /**
   * Registra clic en enlace de email
   */
  async trackEmailClick(
    notificationId: number,
    linkId: string,
    trackingData: {
      userAgent: string;
      ipAddress: string;
      timestamp: Date;
    }
  ): Promise<{
    success: boolean;
    redirectUrl?: string;
  }> {
    try {
      // Registrar log de clic
      await NotificationLog.logSystemEvent('EMAIL_CLICKED', {
        notificationId,
        linkId,
        trackingData
      });

      // Por ahora, devolver éxito sin URL específica
      // En una implementación completa, se obtendría la URL desde la configuración
      return {
        success: true,
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}`
      };

    } catch (error) {
      logger.error('Error tracking email click:', error);
      return { success: false };
    }
  }

  /**
   * Cancela una notificación específica
   */
  async cancelNotification(notificationId: number, userId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        return { success: false, error: 'Notificación no encontrada' };
      }

      if (notification.status === NotificationStatus.CANCELLED) {
        return { success: false, error: 'La notificación ya está cancelada' };
      }

      if (notification.status === NotificationStatus.SENT || notification.status === NotificationStatus.DELIVERED) {
        return { success: false, error: 'No se puede cancelar una notificación ya enviada' };
      }

      await notification.update({ status: NotificationStatus.CANCELLED });

      // Registrar log
      await NotificationLog.logSystemEvent('NOTIFICATION_CANCELLED', {
        notificationId,
        cancelledBy: userId
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error canceling notification:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Reintenta envío de una notificación específica
   */
  async retryNotification(notificationId: number, userId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        return { success: false, error: 'Notificación no encontrada' };
      }

      if (notification.status !== NotificationStatus.FAILED) {
        return { success: false, error: 'Solo se pueden reintentar notificaciones fallidas' };
      }

      if (!notification.canRetry()) {
        return { success: false, error: 'Máximo de reintentos alcanzado' };
      }

      await notification.incrementRetryCount();
      await this.processNotification(notification);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error retrying notification:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Obtiene notificaciones popup pendientes para un usuario
   */
  async getPendingPopupNotifications(userId: number): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    try {
      const where: any = {
        userId,
        channel: NotificationChannel.POPUP,
        status: NotificationStatus.PENDING
      };

      const { rows: notifications, count: total } = await Notification.findAndCountAll({
        where,
        order: [['priority', 'DESC'], ['createdAt', 'DESC']],
        limit: 10 // Máximo 10 notificaciones popup pendientes
      });

      return { notifications, total };
    } catch (error) {
      logger.error('Error getting pending popup notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Obtiene el tipo de plantilla de email por código
   */
  private async getEmailTemplateType(templateCode: string): Promise<EmailTemplateType | undefined> {
    try {
      const { EmailTemplate } = await import('../models/EmailTemplate');
      const template = await EmailTemplate.findOne({
        where: { code: templateCode, active: true }
      });

      return template?.type;
    } catch (error) {
      logger.error('Error getting email template type:', error);
      return undefined;
    }
  }
}

export const notificationService = new NotificationService();