/**
 * @fileoverview Tipos TypeScript para configuración del sistema
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de interfaces y tipos para configuración del sistema
 *
 * Archivo: backend/src/types/system.types.ts
 */

/**
 * Categorías de configuración del sistema
 */
export type SystemConfigCategory =
  | 'general'
  | 'security'
  | 'payment'
  | 'notification'
  | 'email'
  | 'integration'
  | 'ui'
  | 'performance';

/**
 * Datos de configuración del sistema
 */
export interface SystemConfigData {
  id: number;
  key: string;
  value: string;
  category: SystemConfigCategory;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  metadata?: any;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuración general del sistema
 */
export interface GeneralSystemConfig {
  language: 'es' | 'en' | 'pt';
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  country: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

/**
 * Configuración de seguridad
 */
export interface SecuritySystemConfig {
  sessionTimeout: number; // segundos
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  twoFactorRequired: boolean;
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  rateLimitEnabled: boolean;
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
}

/**
 * Configuración de pagos
 */
export interface PaymentSystemConfig {
  supportedCurrencies: string[];
  defaultCurrency: string;
  paymentMethods: string[];
  testMode: boolean;
  paypalEnabled: boolean;
  stripeEnabled: boolean;
  neonetEnabled: boolean;
  bamEnabled: boolean;
  minPaymentAmount: number;
  maxPaymentAmount: number;
  paymentTimeout: number; // minutos
}

/**
 * Configuración de notificaciones
 */
export interface NotificationSystemConfig {
  enabledTypes: ('email' | 'sms' | 'push' | 'in_app')[];
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  defaultLanguage: string;
  retryAttempts: number;
  retryDelay: number; // segundos
}

/**
 * Configuración de email
 */
export interface EmailSystemConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  templatesPath: string;
  rateLimitPerHour: number;
}

/**
 * Configuración de integraciones
 */
export interface IntegrationSystemConfig {
  googleMapsApiKey?: string;
  recaptchaEnabled: boolean;
  recaptchaSiteKey?: string;
  recaptchaSecretKey?: string;
  socialLoginEnabled: boolean;
  googleClientId?: string;
  googleClientSecret?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  webhookSecret: string;
  apiRateLimit: number;
}

/**
 * Configuración de UI
 */
export interface UISystemConfig {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
}

/**
 * Configuración de rendimiento
 */
export interface PerformanceSystemConfig {
  cacheEnabled: boolean;
  cacheTtl: number; // segundos
  compressionEnabled: boolean;
  minificationEnabled: boolean;
  cdnEnabled: boolean;
  cdnUrl?: string;
  lazyLoadingEnabled: boolean;
  imageOptimizationEnabled: boolean;
}

/**
 * Configuración completa del sistema
 */
export interface SystemConfiguration {
  general: GeneralSystemConfig;
  security: SecuritySystemConfig;
  payment: PaymentSystemConfig;
  notification: NotificationSystemConfig;
  email: EmailSystemConfig;
  integration: IntegrationSystemConfig;
  ui: UISystemConfig;
  performance: PerformanceSystemConfig;
}

/**
 * Request para crear configuración
 */
export interface CreateSystemConfigRequest {
  key: string;
  value: any;
  category: SystemConfigCategory;
  description?: string;
  isPublic?: boolean;
  metadata?: any;
}

/**
 * Request para actualizar configuración
 */
export interface UpdateSystemConfigRequest {
  value?: any;
  description?: string;
  isPublic?: boolean;
  isActive?: boolean;
  metadata?: any;
}

/**
 * Request para configuración masiva
 */
export interface BulkSystemConfigRequest {
  configs: CreateSystemConfigRequest[];
}

/**
 * Filtros para buscar configuración
 */
export interface SystemConfigFilters {
  category?: SystemConfigCategory;
  isPublic?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta de configuración del sistema
 */
export interface SystemConfigResponse {
  success: boolean;
  message: string;
  data?: {
    config?: SystemConfigData;
    configs?: SystemConfigData[];
    categories?: Record<SystemConfigCategory, SystemConfigData[]>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
  timestamp: string;
}

/**
 * Respuesta de configuración pública
 */
export interface PublicSystemConfigResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

/**
 * Estadísticas de configuración
 */
export interface SystemConfigStats {
  totalConfigs: number;
  activeConfigs: number;
  publicConfigs: number;
  categoriesCount: Record<SystemConfigCategory, number>;
  lastUpdated: Date;
  lastUpdatedBy: number;
}