/**
 * @fileoverview Configuración de plataformas de streaming para eventos híbridos
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Configuración segura de credenciales y APIs de plataformas de streaming
 */

import { config } from './environment';

/**
 * Configuración de Zoom API
 */
export const zoomConfig = {
  apiKey: config.streaming.zoom.apiKey || '',
  apiSecret: config.streaming.zoom.apiSecret || '',
  webhookSecret: config.streaming.zoom.webhookSecret || '',
  accountId: config.streaming.zoom.accountId || '',
  baseUrl: 'https://api.zoom.us/v2',
  webhookUrl: config.streaming.general.webhookUrl || '',
};

/**
 * Configuración de Google Meet API
 */
export const googleMeetConfig = {
  clientId: config.streaming.google.clientId || '',
  clientSecret: config.streaming.google.clientSecret || '',
  refreshToken: config.streaming.google.refreshToken || '',
  calendarId: config.streaming.google.calendarId,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/meetings',
  ],
};

/**
 * Configuración de Microsoft Teams / Graph API
 */
export const microsoftTeamsConfig = {
  clientId: config.streaming.microsoft.clientId || '',
  clientSecret: config.streaming.microsoft.clientSecret || '',
  tenantId: config.streaming.microsoft.tenantId || '',
  userId: config.streaming.microsoft.userId || '',
  scopes: [
    'https://graph.microsoft.com/OnlineMeetings.ReadWrite',
    'https://graph.microsoft.com/Calendars.ReadWrite',
    'https://graph.microsoft.com/User.Read',
  ],
  baseUrl: 'https://graph.microsoft.com/v1.0',
};

/**
 * Configuración de Jitsi
 */
export const jitsiConfig = {
  defaultDomain: config.streaming.jitsi.defaultDomain,
  appId: config.streaming.jitsi.appId || '',
  appSecret: config.streaming.jitsi.appSecret || '',
  jwtAlgorithm: 'HS256',
  jwtExpirationMinutes: 60 * 24, // 24 horas
};

/**
 * Configuración general de streaming
 */
export const streamingConfig = {
  defaultQuality: config.streaming.general.defaultQuality,
  maxDurationHours: config.streaming.general.maxDurationHours,
  recordingRetentionDays: config.streaming.general.recordingRetentionDays,
  webhookUrl: config.streaming.general.webhookUrl || '',
};

/**
 * Validación de configuración de plataformas
 */
export const validateStreamingConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validar Zoom
  if (!zoomConfig.apiKey) {
    errors.push('ZOOM_API_KEY no configurada');
  }
  if (!zoomConfig.apiSecret) {
    errors.push('ZOOM_API_SECRET no configurada');
  }

  // Validar Google Meet
  if (!googleMeetConfig.clientId) {
    errors.push('GOOGLE_CLIENT_ID no configurada');
  }
  if (!googleMeetConfig.clientSecret) {
    errors.push('GOOGLE_CLIENT_SECRET no configurada');
  }

  // Validar Microsoft Teams
  if (!microsoftTeamsConfig.clientId) {
    errors.push('MICROSOFT_CLIENT_ID no configurada');
  }
  if (!microsoftTeamsConfig.clientSecret) {
    errors.push('MICROSOFT_CLIENT_SECRET no configurada');
  }
  if (!microsoftTeamsConfig.tenantId) {
    errors.push('MICROSOFT_TENANT_ID no configurada');
  }

  // Jitsi es opcional (tiene valores por defecto)
  // Pero si se configura appId, debe tener appSecret
  if (jitsiConfig.appId && !jitsiConfig.appSecret) {
    errors.push('JITSI_APP_SECRET requerida cuando JITSI_APP_ID está configurada');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Obtener configuración de plataforma por tipo
 */
export const getPlatformConfig = (platform: string) => {
  switch (platform) {
    case 'zoom':
      return zoomConfig;
    case 'google_meet':
      return googleMeetConfig;
    case 'microsoft_teams':
      return microsoftTeamsConfig;
    case 'jitsi':
      return jitsiConfig;
    default:
      return null;
  }
};

/**
 * Verificar si una plataforma está configurada
 */
export const isPlatformConfigured = (platform: string): boolean => {
  switch (platform) {
    case 'zoom':
      return !!(zoomConfig.apiKey && zoomConfig.apiSecret);
    case 'google_meet':
      return !!(googleMeetConfig.clientId && googleMeetConfig.clientSecret);
    case 'microsoft_teams':
      return !!(microsoftTeamsConfig.clientId && microsoftTeamsConfig.clientSecret && microsoftTeamsConfig.tenantId);
    case 'jitsi':
      return true; // Siempre disponible con configuración por defecto
    default:
      return false;
  }
};
