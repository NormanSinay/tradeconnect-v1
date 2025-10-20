/**
 * @fileoverview notificationService.ts - Servicio de notificaciones para TradeConnect
 * @description Servicio que maneja notificaciones, preferencias y entrega de mensajes a través de múltiples canales.
 *
 * Arquitectura recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @author TradeConnect Team
 * @version 1.0.0
 */
import { apiService } from './api';
import type { ApiResponse } from '@/types';

/**
 * Notification types
 */
export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'payment' | 'certificate';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  whatsappNotifications: boolean;
  eventReminders: boolean;
  paymentNotifications: boolean;
  certificateNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  eventTypes: {
    registration: boolean;
    payment: boolean;
    certificate: boolean;
    reminder: boolean;
    update: boolean;
    cancellation: boolean;
  };
}

/**
 * Notification template
 */
export interface NotificationTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

/**
 * Notifications Service
 * Handles notification management, preferences, and delivery
 */
export const notificationService = {
  /**
   * Get user notifications
   * @param params - Query parameters (pagination, filters)
   * @returns Promise<ApiResponse<Notification[]>>
   */
  getNotifications: async (params?: any): Promise<ApiResponse<Notification[]>> => {
    return apiService.get<Notification[]>('/notifications', { params });
  },

  /**
   * Get notification by ID
   * @param id - Notification ID
   * @returns Promise<ApiResponse<Notification>>
   */
  getNotification: async (id: number): Promise<ApiResponse<Notification>> => {
    return apiService.get<Notification>(`/notifications/${id}`);
  },

  /**
   * Mark notification as read
   * @param id - Notification ID
   * @returns Promise<ApiResponse<Notification>>
   */
  markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
    return apiService.patch<Notification>(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   * @returns Promise<ApiResponse<void>>
   */
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/notifications/mark-all-read');
  },

  /**
   * Delete notification
   * @param id - Notification ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteNotification: async (id: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/notifications/${id}`);
  },

  /**
   * Delete all notifications
   * @returns Promise<ApiResponse<void>>
   */
  deleteAllNotifications: async (): Promise<ApiResponse<void>> => {
    return apiService.delete<void>('/notifications');
  },

  /**
   * Get unread notifications count
   * @returns Promise<ApiResponse<{ count: number }>>
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return apiService.get<{ count: number }>('/notifications/unread/count');
  },

  /**
   * Get notification preferences
   * @returns Promise<ApiResponse<NotificationPreferences>>
   */
  getPreferences: async (): Promise<ApiResponse<NotificationPreferences>> => {
    return apiService.get<NotificationPreferences>('/notifications/preferences');
  },

  /**
   * Update notification preferences
   * @param preferences - Notification preferences
   * @returns Promise<ApiResponse<NotificationPreferences>>
   */
  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> => {
    return apiService.put<NotificationPreferences>('/notifications/preferences', preferences);
  },

  /**
   * Test notification delivery
   * @param channel - Notification channel
   * @returns Promise<ApiResponse<void>>
   */
  testNotification: async (channel: 'email' | 'sms' | 'push' | 'whatsapp'): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/notifications/test', { channel });
  },

  /**
   * Send custom notification (admin only)
   * @param data - Notification data
   * @returns Promise<ApiResponse<void>>
   */
  sendNotification: async (data: {
    userIds?: number[];
    type: string;
    title: string;
    message: string;
    channels?: string[];
    link?: string;
  }): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/notifications/send', data);
  },

  /**
   * Get notification templates (admin only)
   * @returns Promise<ApiResponse<NotificationTemplate[]>>
   */
  getTemplates: async (): Promise<ApiResponse<NotificationTemplate[]>> => {
    return apiService.get<NotificationTemplate[]>('/notification-templates');
  },

  /**
   * Create notification template (admin only)
   * @param template - Template data
   * @returns Promise<ApiResponse<NotificationTemplate>>
   */
  createTemplate: async (
    template: Omit<NotificationTemplate, 'id'>
  ): Promise<ApiResponse<NotificationTemplate>> => {
    return apiService.post<NotificationTemplate>('/notification-templates', template);
  },

  /**
   * Update notification template (admin only)
   * @param id - Template ID
   * @param template - Template data
   * @returns Promise<ApiResponse<NotificationTemplate>>
   */
  updateTemplate: async (
    id: number,
    template: Partial<NotificationTemplate>
  ): Promise<ApiResponse<NotificationTemplate>> => {
    return apiService.put<NotificationTemplate>(`/notification-templates/${id}`, template);
  },

  /**
   * Delete notification template (admin only)
   * @param id - Template ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteTemplate: async (id: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/notification-templates/${id}`);
  },

  /**
   * Get notification logs (admin only)
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any[]>>
   */
  getNotificationLogs: async (params?: any): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/notification-logs', { params });
  },

  /**
   * Subscribe to push notifications
   * @param subscription - Push subscription object
   * @returns Promise<ApiResponse<void>>
   */
  subscribeToPush: async (subscription: PushSubscription): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/notifications/push/subscribe', {
      subscription: subscription.toJSON(),
    });
  },

  /**
   * Unsubscribe from push notifications
   * @returns Promise<ApiResponse<void>>
   */
  unsubscribeFromPush: async (): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/notifications/push/unsubscribe');
  },

  /**
   * Get notification rules (admin only)
   * @returns Promise<ApiResponse<any[]>>
   */
  getNotificationRules: async (): Promise<ApiResponse<any[]>> => {
    return apiService.get<any[]>('/notification-rules');
  },

  /**
   * Create notification rule (admin only)
   * @param rule - Notification rule data
   * @returns Promise<ApiResponse<any>>
   */
  createNotificationRule: async (rule: any): Promise<ApiResponse<any>> => {
    return apiService.post<any>('/notification-rules', rule);
  },

  /**
   * Update notification rule (admin only)
   * @param id - Rule ID
   * @param rule - Notification rule data
   * @returns Promise<ApiResponse<any>>
   */
  updateNotificationRule: async (id: number, rule: any): Promise<ApiResponse<any>> => {
    return apiService.put<any>(`/notification-rules/${id}`, rule);
  },

  /**
   * Delete notification rule (admin only)
   * @param id - Rule ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteNotificationRule: async (id: number): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/notification-rules/${id}`);
  },
};

export default notificationService;
