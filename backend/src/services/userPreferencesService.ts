/**
 * @fileoverview Servicio de Preferencias de Notificaciones de Usuario para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión de preferencias de notificaciones por usuario
 *
 * Archivo: backend/src/services/userPreferencesService.ts
 */

import { UserNotificationPreferences } from '../models/UserNotificationPreferences';
import { User } from '../models/User';
import {
  UserNotificationPreferencesAttributes,
  UserNotificationPreferencesCreationAttributes,
  UpdateNotificationPreferencesRequest,
  NotificationChannel,
  EmailTemplateType
} from '../types/notification.types';
import { logger } from '../utils/logger';

export class UserPreferencesService {

  /**
   * Obtiene las preferencias de notificaciones de un usuario
   */
  async getUserPreferences(userId: number): Promise<{
    success: boolean;
    preferences?: UserNotificationPreferencesAttributes;
    error?: string;
  }> {
    try {
      const preferences = await UserNotificationPreferences.getOrCreateDefault(userId);
      return {
        success: true,
        preferences: preferences.toJSON() as UserNotificationPreferencesAttributes
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error getting user preferences:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Actualiza las preferencias de notificaciones de un usuario
   */
  async updateUserPreferences(
    userId: number,
    updates: UpdateNotificationPreferencesRequest
  ): Promise<{
    success: boolean;
    preferences?: UserNotificationPreferencesAttributes;
    error?: string;
  }> {
    try {
      let preferences = await UserNotificationPreferences.findByPk(userId);

      if (!preferences) {
        // Crear preferencias por defecto si no existen
        const defaultPrefs: UserNotificationPreferencesCreationAttributes = {
          userId,
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          marketingEmails: true,
          transactionalEmails: true,
          operationalEmails: true,
          promotionalEmails: true,
          eventReminders: true,
          paymentNotifications: true,
          certificateNotifications: true,
          systemNotifications: true,
          frequency: 'immediate',
          timezone: 'America/Guatemala',
          ...updates
        };
        preferences = await UserNotificationPreferences.create(defaultPrefs);
      } else {
        // Actualizar preferencias existentes
        await preferences.update(updates);
      }

      return {
        success: true,
        preferences: preferences.toJSON() as UserNotificationPreferencesAttributes
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error updating user preferences:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Verifica si un usuario permite un tipo específico de notificación
   */
  async userAllowsNotification(
    userId: number,
    channel: NotificationChannel,
    emailType?: EmailTemplateType
  ): Promise<boolean> {
    try {
      const preferences = await UserNotificationPreferences.findByPk(userId);

      if (!preferences) {
        // Si no hay preferencias, permitir por defecto
        return true;
      }

      // Verificar si el canal está habilitado
      const channelAllowed = preferences.allowsNotification(channel.toLowerCase() as 'email' | 'sms' | 'push');
      if (!channelAllowed) {
        return false;
      }

      // Para emails, verificar el tipo específico
      if (channel === NotificationChannel.EMAIL && emailType) {
        const emailTypeAllowed = preferences.allowsEmailType(
          emailType.toLowerCase() as 'marketing' | 'transactional' | 'operational' | 'promotional'
        );
        if (!emailTypeAllowed) {
          return false;
        }
      }

      // Verificar horas silenciosas
      if (preferences.isInQuietHours()) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error checking user notification permissions:', error);
      // En caso de error, permitir la notificación para no bloquear comunicaciones importantes
      return true;
    }
  }

  /**
   * Desuscribe a un usuario de emails promocionales usando token
   */
  async unsubscribeWithToken(token: string): Promise<{
    success: boolean;
    message: string;
    userId?: number;
  }> {
    try {
      const preferences = await UserNotificationPreferences.findByUnsubscribeToken(token);

      if (!preferences) {
        return {
          success: false,
          message: 'Token de desuscripción inválido o expirado'
        };
      }

      // Desactivar emails promocionales
      await preferences.update({
        promotionalEmails: false,
        marketingEmails: false
      });

      // Limpiar el token
      await preferences.update({ unsubscribeToken: undefined });

      return {
        success: true,
        message: 'Te has desuscrito exitosamente de los emails promocionales',
        userId: preferences.userId
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error unsubscribing user:', error);
      return {
        success: false,
        message: `Error al procesar la desuscripción: ${errorMessage}`
      };
    }
  }

  /**
   * Genera un token de desuscripción para un usuario
   */
  async generateUnsubscribeToken(userId: number): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      const preferences = await UserNotificationPreferences.getOrCreateDefault(userId);
      const token = preferences.generateUnsubscribeToken();

      await preferences.save();

      return {
        success: true,
        token
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error generating unsubscribe token:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Obtiene estadísticas de preferencias de usuarios
   */
  async getPreferencesStats(): Promise<{
    success: boolean;
    stats?: {
      totalUsers: number;
      emailEnabled: number;
      smsEnabled: number;
      pushEnabled: number;
      marketingEmailsDisabled: number;
      promotionalEmailsDisabled: number;
      unsubscribedUsers: number;
    };
    error?: string;
  }> {
    try {
      const totalUsers = await UserNotificationPreferences.count();

      const emailEnabled = await UserNotificationPreferences.count({
        where: { emailEnabled: true }
      });

      const smsEnabled = await UserNotificationPreferences.count({
        where: { smsEnabled: true }
      });

      const pushEnabled = await UserNotificationPreferences.count({
        where: { pushEnabled: true }
      });

      const marketingEmailsDisabled = await UserNotificationPreferences.count({
        where: { marketingEmails: false }
      });

      const promotionalEmailsDisabled = await UserNotificationPreferences.count({
        where: { promotionalEmails: false }
      });

      const unsubscribedUsers = await UserNotificationPreferences.count({
        where: {
          promotionalEmails: false,
          marketingEmails: false
        }
      });

      return {
        success: true,
        stats: {
          totalUsers,
          emailEnabled,
          smsEnabled,
          pushEnabled,
          marketingEmailsDisabled,
          promotionalEmailsDisabled,
          unsubscribedUsers
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error getting preferences stats:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Restablece las preferencias de un usuario a valores por defecto
   */
  async resetUserPreferences(userId: number): Promise<{
    success: boolean;
    preferences?: UserNotificationPreferencesAttributes;
    error?: string;
  }> {
    try {
      const defaultPreferences: Partial<UserNotificationPreferencesCreationAttributes> = {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        marketingEmails: true,
        transactionalEmails: true,
        operationalEmails: true,
        promotionalEmails: true,
        eventReminders: true,
        paymentNotifications: true,
        certificateNotifications: true,
        systemNotifications: true,
        frequency: 'immediate',
        timezone: 'America/Guatemala',
        quietHoursStart: undefined,
        quietHoursEnd: undefined,
        unsubscribeToken: undefined
      };

      const result = await this.updateUserPreferences(userId, defaultPreferences);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error resetting user preferences:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export const userPreferencesService = new UserPreferencesService();