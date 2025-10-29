/**
 * @fileoverview Tipos TypeScript para plantillas de notificaciones
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos específicos para plantillas HTML y popup
 */

import { EmailTemplateType, PopupType } from './notification.types';

// ====================================================================
// INTERFACES PARA PLANTILLAS HTML
// ====================================================================

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: string[];
  };
}

export interface EmailTemplateLayout {
  id: string;
  name: string;
  description: string;
  htmlStructure: string;
  cssStyles: string;
  variables: TemplateVariable[];
  previewImage?: string;
}

export interface EmailTemplateValidationResult {
  isValid: boolean;
  errors: Array<{
    type: 'syntax' | 'variables' | 'structure';
    message: string;
    line?: number;
    column?: number;
  }>;
  warnings: Array<{
    type: 'accessibility' | 'performance' | 'best_practice';
    message: string;
  }>;
}

export interface EmailTemplatePreviewData {
  templateId: number;
  variables: Record<string, any>;
  renderedSubject: string;
  renderedHtml: string;
  renderedText?: string;
  validationResult: EmailTemplateValidationResult;
}

// ====================================================================
// INTERFACES PARA PLANTILLAS POPUP
// ====================================================================

export interface PopupTemplateAttributes {
  id?: number;
  code: string;
  name: string;
  title: string;
  message: string;
  type: PopupType;
  icon?: string;
  actionUrl?: string;
  actionLabel?: string;
  duration: number; // milliseconds
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  requiresAction: boolean;
  dismissible: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  theme: 'light' | 'dark' | 'auto';
  variables: Record<string, TemplateVariable>;
  active: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PopupTemplateCreationAttributes extends Omit<PopupTemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PopupTemplateValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    type: 'accessibility' | 'ux' | 'performance';
    message: string;
  }>;
}

// ====================================================================
// INTERFACES PARA RENDERIZACIÓN
// ====================================================================

export interface TemplateEngine {
  render(template: string, variables: Record<string, any>): string;
  validate(template: string): EmailTemplateValidationResult;
  extractVariables(template: string): TemplateVariable[];
}

export interface TemplateRenderer {
  renderEmail(template: EmailTemplateAttributes, variables: Record<string, any>): Promise<EmailTemplatePreviewData>;
  renderPopup(template: PopupTemplateAttributes, variables: Record<string, any>): Promise<string>;
  validateEmailTemplate(template: EmailTemplateAttributes): Promise<EmailTemplateValidationResult>;
  validatePopupTemplate(template: PopupTemplateAttributes): Promise<PopupTemplateValidationResult>;
}

// ====================================================================
// INTERFACES PARA GESTIÓN DE PLANTILLAS
// ====================================================================

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  templates: string[]; // template codes
}

export interface TemplateLibrary {
  categories: TemplateCategory[];
  layouts: EmailTemplateLayout[];
  getTemplate(code: string): EmailTemplateAttributes | PopupTemplateAttributes | null;
  getTemplatesByCategory(categoryId: string): Array<EmailTemplateAttributes | PopupTemplateAttributes>;
  searchTemplates(query: string): Array<EmailTemplateAttributes | PopupTemplateAttributes>;
}

// ====================================================================
// INTERFACES PARA PERSONALIZACIÓN
// ====================================================================

export interface TemplateCustomization {
  templateId: number;
  userId?: number; // null for global customizations
  customCss?: string;
  customVariables?: Record<string, any>;
  customLayout?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
  cssVariables: Record<string, string>;
}

// ====================================================================
// INTERFACES PARA TESTING Y PREVIEW
// ====================================================================

export interface TemplateTestData {
  templateCode: string;
  variables: Record<string, any>;
  recipientEmail?: string;
  sendTest: boolean;
}

export interface TemplateTestResult {
  success: boolean;
  templateCode: string;
  renderedContent: {
    subject?: string;
    html?: string;
    text?: string;
    title?: string;
    message?: string;
  };
  validationResult: EmailTemplateValidationResult | PopupTemplateValidationResult;
  sentTo?: string;
  error?: string;
}

// ====================================================================
// CONSTANTES Y CONFIGURACIONES
// ====================================================================

export const TEMPLATE_CONSTANTS = {
  MAX_TEMPLATE_SIZE: 1024 * 1024, // 1MB
  MAX_VARIABLES_COUNT: 50,
  MAX_SUBJECT_LENGTH: 200,
  MAX_TITLE_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 500,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  TEMPLATE_CACHE_TTL: 3600, // 1 hour
  PREVIEW_TIMEOUT: 30000, // 30 seconds
} as const;

export const TEMPLATE_VARIABLES = {
  COMMON: {
    user_name: { name: 'user_name', type: 'string' as const, required: true, description: 'Nombre del usuario' },
    user_email: { name: 'user_email', type: 'string' as const, required: true, description: 'Email del usuario' },
    user_first_name: { name: 'user_first_name', type: 'string' as const, required: true, description: 'Nombre del usuario' },
    user_last_name: { name: 'user_last_name', type: 'string' as const, required: true, description: 'Apellido del usuario' },
    event_name: { name: 'event_name', type: 'string' as const, required: false, description: 'Nombre del evento' },
    event_date: { name: 'event_date', type: 'date' as const, required: false, description: 'Fecha del evento' },
    event_location: { name: 'event_location', type: 'string' as const, required: false, description: 'Ubicación del evento' },
    registration_url: { name: 'registration_url', type: 'string' as const, required: false, description: 'URL de registro' },
    login_url: { name: 'login_url', type: 'string' as const, required: false, description: 'URL de login' },
    support_email: { name: 'support_email', type: 'string' as const, required: false, description: 'Email de soporte' },
    company_name: { name: 'company_name', type: 'string' as const, required: false, description: 'Nombre de la empresa' },
    current_year: { name: 'current_year', type: 'number' as const, required: false, description: 'Año actual' },
  },
  EMAIL_SPECIFIC: {
    unsubscribe_url: { name: 'unsubscribe_url', type: 'string' as const, required: false, description: 'URL para darse de baja' },
    tracking_pixel: { name: 'tracking_pixel', type: 'string' as const, required: false, description: 'Pixel de tracking' },
  },
  POPUP_SPECIFIC: {
    action_url: { name: 'action_url', type: 'string' as const, required: false, description: 'URL de acción del popup' },
    icon_name: { name: 'icon_name', type: 'string' as const, required: false, description: 'Nombre del icono' },
  }
} as const;

// Import the EmailTemplateAttributes from notification.types.ts to avoid circular imports
import { EmailTemplateAttributes } from './notification.types';
