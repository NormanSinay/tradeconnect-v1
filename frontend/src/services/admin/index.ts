// ====================================================================
// EXPORTACIONES CENTRALIZADAS - SERVICIOS ADMINISTRATIVOS
// ====================================================================
// @fileoverview Archivo central de exportaciones para todos los servicios del panel administrativo
// @version 1.0.0
// @author TradeConnect Team

// ====================================================================
// DASHBOARD
// ====================================================================
export { adminDashboardService, AdminDashboardService } from './admin-dashboard.service'

// ====================================================================
// EVENTOS
// ====================================================================
export { adminEventService, AdminEventService } from './admin-event.service'

// ====================================================================
// SPEAKERS
// ====================================================================
export { adminSpeakerService, AdminSpeakerService } from './admin-speaker.service'

// ====================================================================
// INSCRIPCIONES
// ====================================================================
export { adminRegistrationService, AdminRegistrationService } from './admin-registration.service'

// ====================================================================
// GESTIÓN DE AFOROS
// ====================================================================
export { adminCapacityService, AdminCapacityService } from './admin-capacity.service'

// ====================================================================
// PROMOCIONES
// ====================================================================
export { adminPromotionService, AdminPromotionService } from './admin-promotion.service'

// ====================================================================
// QR Y CONTROL DE ACCESO
// ====================================================================
export { adminQRService, AdminQRService } from './admin-qr.service'

// ====================================================================
// CERTIFICADOS
// ====================================================================
export { adminCertificateService, AdminCertificateService } from './admin-certificate.service'

// ====================================================================
// REPORTES
// ====================================================================
export { adminReportService, AdminReportService } from './admin-report.service'

// ====================================================================
// PAGOS
// ====================================================================
export { adminPaymentService, AdminPaymentService } from './admin-payment.service'

// ====================================================================
// FACTURACIÓN FEL
// ====================================================================
export { adminFelService, AdminFelService } from './admin-fel.service'

// ====================================================================
// SISTEMA
// ====================================================================
export { adminSystemService, AdminSystemService } from './admin-system.service'

// ====================================================================
// IMPORTACIÓN DE INSTANCIAS PARA USO INTERNO
// ====================================================================

import { adminDashboardService } from './admin-dashboard.service'
import { adminEventService } from './admin-event.service'
import { adminSpeakerService } from './admin-speaker.service'
import { adminRegistrationService } from './admin-registration.service'
import { adminCapacityService } from './admin-capacity.service'
import { adminPromotionService } from './admin-promotion.service'
import { adminQRService } from './admin-qr.service'
import { adminCertificateService } from './admin-certificate.service'
import { adminReportService } from './admin-report.service'
import { adminPaymentService } from './admin-payment.service'
import { adminFelService } from './admin-fel.service'
import { adminSystemService } from './admin-system.service'

// ====================================================================
// RE-EXPORTACIÓN DE INSTANCIAS (ACCESO RÁPIDO)
// ====================================================================

/**
 * Instancias singleton de todos los servicios administrativos
 * Uso recomendado para la mayoría de los casos
 */
export const adminServices = {
  dashboard: adminDashboardService,
  events: adminEventService,
  speakers: adminSpeakerService,
  registrations: adminRegistrationService,
  capacity: adminCapacityService,
  promotions: adminPromotionService,
  qr: adminQRService,
  certificates: adminCertificateService,
  reports: adminReportService,
  payments: adminPaymentService,
  fel: adminFelService,
  system: adminSystemService,
} as const

// ====================================================================
// TIPOS DE EXPORTACIÓN
// ====================================================================

/**
 * Tipos de servicios disponibles
 */
export type AdminServiceType =
  | 'dashboard'
  | 'events'
  | 'speakers'
  | 'registrations'
  | 'capacity'
  | 'promotions'
  | 'qr'
  | 'certificates'
  | 'reports'
  | 'payments'
  | 'fel'
  | 'system'

/**
 * Tipo utilitario para acceder a servicios por tipo
 */
export type AdminService<T extends AdminServiceType> = typeof adminServices[T]

// ====================================================================
// FUNCIONES DE UTILIDAD
// ====================================================================

/**
 * Obtiene un servicio administrativo por nombre
 * @param serviceName - Nombre del servicio
 * @returns Instancia del servicio solicitado
 */
export function getAdminService<T extends AdminServiceType>(serviceName: T): AdminService<T> {
  return adminServices[serviceName]
}

/**
 * Verifica si un servicio está disponible
 * @param serviceName - Nombre del servicio a verificar
 * @returns true si el servicio existe
 */
export function isAdminServiceAvailable(serviceName: string): serviceName is AdminServiceType {
  return serviceName in adminServices
}

// ====================================================================
// CONFIGURACIÓN GLOBAL DE SERVICIOS
// ====================================================================

/**
 * Configuración global para servicios administrativos
 */
export interface AdminServicesConfig {
  /** URL base para todas las APIs administrativas */
  baseUrl: string
  /** Timeout por defecto para requests */
  timeout: number
  /** Reintentos automáticos */
  retryAttempts: number
  /** Configuración de caché */
  cache: {
    enabled: boolean
    ttl: number
  }
  /** Configuración de logging */
  logging: {
    enabled: boolean
    level: 'debug' | 'info' | 'warn' | 'error'
  }
}

/**
 * Configuración por defecto
 */
export const defaultAdminServicesConfig: AdminServicesConfig = {
  baseUrl: '/api/admin',
  timeout: 30000,
  retryAttempts: 3,
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutos
  },
  logging: {
    enabled: true,
    level: 'info',
  },
}

// ====================================================================
// INICIALIZACIÓN Y CONFIGURACIÓN
// ====================================================================

/**
 * Inicializa todos los servicios administrativos
 * @param config - Configuración opcional
 */
export function initializeAdminServices(config?: Partial<AdminServicesConfig>): void {
  const finalConfig = { ...defaultAdminServicesConfig, ...config }

  // Aquí se podría implementar configuración global
  // Por ejemplo: configurar timeouts, interceptores, etc.

  console.log('Servicios administrativos inicializados', finalConfig)
}

/**
 * Verifica el estado de todos los servicios
 * @returns Promise con el estado de cada servicio
 */
export async function checkAdminServicesHealth(): Promise<Record<AdminServiceType, boolean>> {
  const healthChecks = Object.entries(adminServices).map(async ([name, service]) => {
    try {
      // Cada servicio debería tener un método healthCheck
      // Por ahora retornamos true
      return [name, true] as [string, boolean]
    } catch (error) {
      console.error(`Error en health check de ${name}:`, error)
      return [name, false] as [string, boolean]
    }
  })

  const results = await Promise.all(healthChecks)
  return Object.fromEntries(results) as Record<AdminServiceType, boolean>
}

// ====================================================================
// EXPORTACIÓN FINAL
// ====================================================================

// Exportar todo por defecto para importaciones comodas
export default adminServices