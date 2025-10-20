/**
 * @fileoverview index.ts - Punto central de exportación de servicios para TradeConnect
 * @description Archivo que centraliza todas las exportaciones de servicios para facilitar su importación.
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
/**
 * TradeConnect Services Index
 * Central export point for all service modules
 */

// Core API service
export { default as api, apiService } from './api';

// Authentication & User services
export { authService } from './api';
export { userService } from './userService';
export { usersService } from './api';
export type {
  UserProfileUpdate,
  PasswordChangeData,
  TwoFactorSetup,
} from './userService';

// Event services
export { eventsService } from './eventsService';
export { publicEventsService, eventsService as eventsServiceLegacy } from './api';

// Cart service
export { cartService } from './cartService';
export { cartServiceLegacy } from './api'; // Legacy export

// Payment services
export { paymentService } from './paymentService';
export { paymentsService } from './api'; // Backward compatibility
export type {
  PaymentGatewayResponse,
  PaymentMethod,
  PaymentProcessData,
} from './paymentService';

// FEL service (Guatemala electronic invoicing)
export { felService } from './felService';
export { felServiceLegacy } from './api'; // Legacy export

// Certificate services
export { certificateService } from './certificateService';
export { certificatesService } from './api'; // Backward compatibility
export type { CertificateVerification } from './certificateService';

// Admin services
export { adminService } from './adminService';
export type {
  DashboardStats,
  ReportType,
  ReportParams,
} from './adminService';

// Speaker services
export { speakerService } from './speakerService';
export type {
  SpeakerData,
  SpeakerAvailability,
  SpeakerContract,
} from './speakerService';

// Analytics services
export { analyticsService } from './analyticsService';
export type {
  AnalyticsEvent,
  PageView,
  ConversionData,
  EventAnalytics,
  UserAnalytics,
} from './analyticsService';

// Notification services
export { notificationService } from './notificationService';
export type {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
} from './notificationService';

// Re-import everything for the services object
import { apiService } from './api';
import { authService } from './api';
import { userService } from './userService';
import { usersService } from './api';
import { eventsService } from './eventsService';
import { publicEventsService } from './api';
import { cartService } from './cartService';
import { paymentService } from './paymentService';
import { paymentsService } from './api';
import { felService } from './felService';
import { certificateService } from './certificateService';
import { certificatesService } from './api';
import { adminService } from './adminService';
import { speakerService } from './speakerService';
import { analyticsService } from './analyticsService';
import { notificationService } from './notificationService';

/**
 * All services bundled as a single object for convenience
 */
export const services = {
  api: apiService,
  auth: authService,
  user: userService,
  users: usersService,
  events: eventsService,
  publicEvents: publicEventsService,
  cart: cartService,
  payment: paymentService,
  payments: paymentsService,
  fel: felService,
  certificate: certificateService,
  certificates: certificatesService,
  admin: adminService,
  speaker: speakerService,
  analytics: analyticsService,
  notification: notificationService,
};

export default services;
