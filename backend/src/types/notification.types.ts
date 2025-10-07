/**
 * @fileoverview Tipos TypeScript para el sistema de notificaciones
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para notificaciones, logs y reglas
 */

import { ApiResponse } from './global.types';

// ====================================================================
// ENUMERACIONES
// ====================================================================

export enum NotificationType {
  EMAIL = 'EMAIL',
  POPUP = 'POPUP',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum EmailTemplateType {
  TRANSACTIONAL = 'TRANSACTIONAL',
  PROMOTIONAL = 'PROMOTIONAL',
  OPERATIONAL = 'OPERATIONAL'
}

export enum PopupType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  POPUP = 'POPUP',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP'
}

// ====================================================================
// INTERFACES DE DATOS
// ====================================================================

export interface NotificationAttributes {
  id?: number;
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  subject?: string;
  message: string;
  data: Record<string, any>;
  templateId?: number;
  templateCode?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface NotificationCreationAttributes extends Omit<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export interface EmailTemplateAttributes {
  id?: number;
  code: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: Record<string, any>;
  type: EmailTemplateType;
  active: boolean;
  version: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface EmailTemplateCreationAttributes extends Omit<EmailTemplateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export interface NotificationLogAttributes {
  id?: number;
  notificationId: number;
  action: string;
  oldStatus?: NotificationStatus;
  newStatus?: NotificationStatus;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

export interface NotificationLogCreationAttributes extends Omit<NotificationLogAttributes, 'id' | 'createdAt'> {}

export interface NotificationRuleAttributes {
  id?: number;
  name: string;
  description?: string;
  eventType: string;
  triggerCondition: Record<string, any>;
  templateId?: number;
  templateCode?: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  active: boolean;
  cooldownMinutes?: number;
  maxPerUserPerDay?: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface NotificationRuleCreationAttributes extends Omit<NotificationRuleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export interface UserNotificationPreferencesAttributes {
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  marketingEmails: boolean;
  transactionalEmails: boolean;
  operationalEmails: boolean;
  promotionalEmails: boolean;
  eventReminders: boolean;
  paymentNotifications: boolean;
  certificateNotifications: boolean;
  systemNotifications: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  unsubscribeToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface UserNotificationPreferencesCreationAttributes extends Omit<UserNotificationPreferencesAttributes, 'createdAt' | 'updatedAt' | 'deletedAt'> {}

// ====================================================================
// INTERFACES DE REQUEST/RESPONSE
// ====================================================================

export interface SendNotificationRequest {
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  templateCode?: string;
  variables?: Record<string, any>;
  subject?: string;
  message: string;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  attachments?: NotificationAttachment[];
  metadata?: Record<string, any>;
}

export interface SendBulkNotificationRequest {
  userIds: number[];
  type: NotificationType;
  channel: NotificationChannel;
  templateCode?: string;
  variables?: Record<string, any>;
  variablesIndividual?: Record<number, Record<string, any>>;
  subject?: string;
  message: string;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  attachments?: NotificationAttachment[];
  metadata?: Record<string, any>;
}

export interface NotificationAttachment {
  filename: string;
  path: string;
  contentType: string;
  size?: number;
}

export interface CreateEmailTemplateRequest {
  code: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: Record<string, any>;
  type: EmailTemplateType;
}

export interface UpdateEmailTemplateRequest extends Partial<CreateEmailTemplateRequest> {
  active?: boolean;
}

export interface PreviewEmailTemplateRequest {
  templateCode: string;
  variables: Record<string, any>;
}

export interface CreateNotificationRuleRequest {
  name: string;
  description?: string;
  eventType: string;
  triggerCondition: Record<string, any>;
  templateCode?: string;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  cooldownMinutes?: number;
  maxPerUserPerDay?: number;
}

export interface UpdateNotificationRuleRequest extends Partial<CreateNotificationRuleRequest> {
  active?: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  marketingEmails?: boolean;
  transactionalEmails?: boolean;
  operationalEmails?: boolean;
  promotionalEmails?: boolean;
  eventReminders?: boolean;
  paymentNotifications?: boolean;
  certificateNotifications?: boolean;
  systemNotifications?: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly';
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

export interface GetNotificationsRequest {
  userId?: number;
  status?: NotificationStatus;
  type?: NotificationType;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface MarkNotificationReadRequest {
  notificationId: number;
  userId: number;
}

export interface UnsubscribeRequest {
  token: string;
  channel: NotificationChannel;
  eventType?: string;
}

// ====================================================================
// INTERFACES DE RESPONSE
// ====================================================================

export interface NotificationResponse extends ApiResponse {
  data?: {
    notification: NotificationAttributes;
    jobId?: string;
  };
}

export interface BulkNotificationResponse extends ApiResponse {
  data?: {
    totalRequested: number;
    queued: number;
    jobIds: string[];
  };
}

export interface EmailTemplateResponse extends ApiResponse {
  data?: EmailTemplateAttributes;
}

export interface EmailTemplatePreviewResponse extends ApiResponse {
  data?: {
    subject: string;
    htmlContent: string;
    textContent?: string;
  };
}

export interface NotificationRuleResponse extends ApiResponse {
  data?: NotificationRuleAttributes;
}

export interface NotificationsListResponse extends ApiResponse {
  data?: {
    notifications: NotificationAttributes[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface NotificationPreferencesResponse extends ApiResponse {
  data?: UserNotificationPreferencesAttributes;
}

export interface NotificationStatsResponse extends ApiResponse {
  data?: {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    deliveryRate: number;
    readRate: number;
    byChannel: Record<NotificationChannel, {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    }>;
    byType: Record<NotificationType, number>;
  };
}

// ====================================================================
// INTERFACES DE SERVICIOS
// ====================================================================

export interface NotificationServiceInterface {
  sendNotification(request: SendNotificationRequest): Promise<NotificationResponse>;
  sendBulkNotification(request: SendBulkNotificationRequest): Promise<BulkNotificationResponse>;
  getNotifications(filters: GetNotificationsRequest): Promise<NotificationsListResponse>;
  markAsRead(notificationId: number, userId: number): Promise<ApiResponse>;
  cancelNotification(notificationId: number): Promise<ApiResponse>;
  retryFailedNotification(notificationId: number): Promise<ApiResponse>;
  getNotificationStats(startDate?: Date, endDate?: Date): Promise<NotificationStatsResponse>;
}

export interface EmailTemplateServiceInterface {
  createTemplate(request: CreateEmailTemplateRequest, createdBy: number): Promise<EmailTemplateResponse>;
  updateTemplate(templateId: number, request: UpdateEmailTemplateRequest, updatedBy: number): Promise<EmailTemplateResponse>;
  getTemplate(templateId: number): Promise<EmailTemplateResponse>;
  getTemplateByCode(code: string): Promise<EmailTemplateResponse>;
  getTemplates(filters?: { type?: EmailTemplateType; active?: boolean }): Promise<ApiResponse>;
  deleteTemplate(templateId: number): Promise<ApiResponse>;
  previewTemplate(templateCode: string, variables: Record<string, any>): Promise<EmailTemplatePreviewResponse>;
}

export interface NotificationRuleServiceInterface {
  createRule(request: CreateNotificationRuleRequest, createdBy: number): Promise<NotificationRuleResponse>;
  updateRule(ruleId: number, request: UpdateNotificationRuleRequest, updatedBy: number): Promise<NotificationRuleResponse>;
  getRule(ruleId: number): Promise<NotificationRuleResponse>;
  getRules(filters?: { active?: boolean; eventType?: string }): Promise<ApiResponse>;
  deleteRule(ruleId: number): Promise<ApiResponse>;
  triggerRule(eventType: string, eventData: Record<string, any>): Promise<ApiResponse>;
}

// ====================================================================
// TIPOS PARA QUEUE JOBS
// ====================================================================

export interface NotificationJobData {
  notificationId: number;
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  data: Record<string, any>;
  retryCount?: number;
}

export interface EmailNotificationJobData extends NotificationJobData {
  templateId?: number;
  templateCode?: string;
  variables: Record<string, any>;
  attachments?: NotificationAttachment[];
}

export interface PopupNotificationJobData extends NotificationJobData {
  templateCode?: string;
  variables: Record<string, any>;
}

export interface ScheduledNotificationJobData {
  notificationId: number;
  scheduledAt: Date;
}

export interface NotificationJobResult {
  success: boolean;
  notificationId: number;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount?: number;
  nextRetryAt?: Date;
}

// ====================================================================
// TIPOS PARA TRACKING
// ====================================================================

export interface EmailTrackingData {
  notificationId: number;
  userId: number;
  action: 'open' | 'click';
  linkId?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
}

export interface UnsubscribeTokenData {
  userId: number;
  channel: NotificationChannel;
  eventType?: string;
  expiresAt: Date;
}

// ====================================================================
// CONSTANTES
// ====================================================================

export const NOTIFICATION_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MINUTES: [1, 5, 15], // Backoff exponencial
  MAX_BULK_SIZE: 1000,
  DEFAULT_POPUP_DURATION_MS: 5000,
  EMAIL_TRACKING_TOKEN_EXPIRY_HOURS: 24,
  UNSUBSCRIBE_TOKEN_EXPIRY_DAYS: 30,
  MAX_EMAILS_PER_HOUR_PER_USER: 10,
  MAX_POPUPS_PER_MINUTE_PER_USER: 5
} as const;

export const NOTIFICATION_EVENTS = {
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_DELIVERED: 'notification.delivered',
  NOTIFICATION_READ: 'notification.read',
  NOTIFICATION_FAILED: 'notification.failed',
  EMAIL_OPENED: 'email.opened',
  EMAIL_LINK_CLICKED: 'email.link.clicked',
  USER_UNSUBSCRIBED: 'user.unsubscribed'
} as const;

// ====================================================================
// TIPOS ADICIONALES PARA SERVICIOS
// ====================================================================

export interface SendNotificationData {
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  subject?: string;
  message: string;
  data?: Record<string, any>;
  templateId?: number;
  templateCode?: string;
  scheduledAt?: Date;
}

export interface BulkNotificationData {
  userIds: number[];
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  subject?: string;
  message: string;
  data?: Record<string, any>;
  templateId?: number;
  templateCode?: string;
  scheduledAt?: Date;
}