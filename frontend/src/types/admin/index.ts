// ====================================================================
// TIPOS DEL PANEL ADMINISTRATIVO - EXPORTACIONES CENTRALIZADAS
// ====================================================================
// @fileoverview Archivo central de exportaciones para todos los tipos del panel administrativo
// @version 1.0.0
// @author TradeConnect Team

// ====================================================================
// DASHBOARD
// ====================================================================
export type {
  DashboardKPI,
  PerformanceMetric,
  SystemStats as DashboardSystemStats,
  DashboardSummary,
  DashboardAlert,
  LineChartData,
  BarChartData,
  PieChartData,
  ChartConfig,
  RevenueReport,
  UserReport,
  EventReport,
  DashboardFilters,
  AnalyticsQueryParams,
  AnalyticsResult,
  TimePeriod,
  MetricType,
  ExportFormat,
  RefreshInterval,
} from './dashboard.types';

// ====================================================================
// EVENTOS
// ====================================================================
export type {
  EventTypeInfo,
  EventCategoryInfo,
  EventStatusInfo,
  EventAgendaItem,
  CreateEventData,
  UpdateEventData,
  PublishEventData,
  PublicEvent,
  DetailedEvent,
  AdminEvent,
  EventFilters,
  EventQueryParams,
  EventSearchResult,
  EventValidationError,
  EventValidationResult,
  EventStats,
  EventsOverviewStats,
  EventRegistrationInfo,
  CreateRegistrationData,
  EventMediaInfo,
  UploadMediaData,
  EventDuplicationInfo,
  DuplicateEventData,
  EventTypeName,
  EventStatusName,
  EventCategoryName,
  SupportedCurrency,
  MediaType,
  RegistrationStatus,
  PaymentStatus,
} from './event.types';

// ====================================================================
// PLANTILLAS DE EVENTOS
// ====================================================================
export type {
  EventTemplateInfo,
  FullEventTemplate,
  EventTemplateData,
  EventAgendaItem as TemplateEventAgendaItem,
  CustomField,
  CreateEventTemplateData,
  UpdateEventTemplateData,
  UseEventTemplateData,
  EventTemplateFilters,
  EventTemplateQueryParams,
  EventTemplateSearchResult,
  EventTemplateValidationError,
  EventTemplateValidationResult,
  EventTemplateStats,
  EventTemplatesOverviewStats,
  ImportEventTemplateData,
  ExportEventTemplateResult,
  EventTemplateCategory,
  EventTemplateComplexity,
  EventTemplateStatus,
  CustomFieldType,
  ValidationOperator,
} from './event-template.types';

// ====================================================================
// SESIONES DE EVENTOS
// ====================================================================
export type {
  CreateEventSessionData,
  UpdateEventSessionData,
  SessionReservationData,
  PublicEventSession,
  DetailedEventSession,
  AdminEventSession,
  EventSessionFilters,
  EventSessionQueryParams,
  EventSessionSearchResult,
  EventSessionValidationError,
  EventSessionValidationResult,
  EventSessionStats,
  EventSessionsOverviewStats,
  EventSessionType,
  SessionAvailabilityStatus,
  SessionReservationInfo,
} from './event-session.types';

// ====================================================================
// SPEAKERS
// ====================================================================
export type {
  SpecialtyInfo,
  SpeakerSpecialtyInfo,
  AvailabilityBlockInfo,
  SpeakerEvaluationInfo,
  SpeakerEvaluationStats,
  CreateSpeakerData,
  UpdateSpeakerData,
  CreateAvailabilityBlockData,
  CreateSpeakerEvaluationData,
  PublicSpeaker,
  DetailedSpeaker,
  AdminSpeaker,
  SpeakerFilters,
  SpeakerQueryParams,
  SpeakerSearchResult,
  AssignSpeakerToEventData,
  UpdateSpeakerEventData,
  SpeakerEventInfo,
  SpeakerStats,
  SpeakersOverviewStats,
  SpeakerCategory,
  RateType,
  Modality,
  SpeakerRole,
  SpeakerEventStatus,
  EvaluatorType,
  SpecialtyCategory,
  RecurrencePattern,
  EvaluationCriteria,
  SpeakerStatus,
  SupportedCurrency as SpeakerSupportedCurrency,
  PaymentMethod as SpeakerPaymentMethod,
  PaymentStatus as SpeakerPaymentStatus,
  PaymentType as SpeakerPaymentType,
} from './speaker.types';

// ====================================================================
// CONTRATOS DE SPEAKERS
// ====================================================================
export type {
  ContractInfo as SpeakerContractInfo,
  DetailedContractInfo as SpeakerDetailedContractInfo,
  PaymentInfo as SpeakerPaymentInfo,
  CreateContractData as SpeakerCreateContractData,
  UpdateContractData as SpeakerUpdateContractData,
  CreatePaymentData as SpeakerCreatePaymentData,
  UpdatePaymentData as SpeakerUpdatePaymentData,
  PublicContract as SpeakerPublicContract,
  DetailedContract as SpeakerDetailedContract,
  PublicPayment as SpeakerPublicPayment,
  DetailedPayment as SpeakerDetailedPayment,
  ContractFilters as SpeakerContractFilters,
  ContractQueryParams as SpeakerContractQueryParams,
  ContractSearchResult as SpeakerContractSearchResult,
  PaymentFilters as SpeakerContractPaymentFilters,
  PaymentQueryParams as SpeakerContractPaymentQueryParams,
  PaymentSearchResult as SpeakerContractPaymentSearchResult,
  ContractStats as SpeakerContractStats,
  PaymentStats as SpeakerContractPaymentStats,
  SpeakerFinancialReport,
  ContractComplianceReport,
  ContractStatus as SpeakerContractStatus,
  PaymentTerms as SpeakerPaymentTerms,
  PaymentStatus as SpeakerContractPaymentStatus,
  PaymentType as SpeakerContractPaymentType,
  PaymentMethod as SpeakerContractPaymentMethod,
  SupportedCurrency as SpeakerContractSupportedCurrency,
  ComplianceStatus as SpeakerComplianceStatus,
  FinancialReportType as SpeakerFinancialReportType,
  ReportPeriod as SpeakerReportPeriod,
  ExportFormat as SpeakerExportFormat,
} from './speaker-contract.types';

// ====================================================================
// INSCRIPCIONES
// ====================================================================
export type {
  RegistrationStatus as RegistrationRegistrationStatus,
  ParticipantType,
  GroupRegistrationStatus,
  CreateIndividualRegistrationData,
  CreateGroupRegistrationData,
  GroupParticipantData,
  UpdateRegistrationData,
  AffiliationValidationData,
  RegistrationResponse,
  TaxValidationResult,
  PriceCalculationResult,
  AppliedDiscount,
  RefundPolicyResult,
  RegistrationFilters,
  PaginationOptions,
  PaginatedResponse,
  RegistrationStats,
  RegistrationTrend,
  StatusDistribution,
  EventRegistrationReport,
  RegistrationTimelineEntry,
  CancellationReport,
  CancellationReason,
  CancellationPolicy,
  CancellationRule,
  GroupDiscountConfig,
  CapacityValidationResult as RegistrationCapacityValidationResult,
  ConflictValidationResult,
  ConflictingEvent,
  RegistrationAuditLog,
  RegistrationExportData,
  ExportOptions,
  AttendanceInfo,
  AttendanceMethod,
  AttendanceStatus,
  AttendanceStats,
  AttendanceReport,
} from './registration.types';

// ====================================================================
// GESTIÓN DE AFOROS
// ====================================================================
export type {
  LockStatus,
  WaitlistStatus,
  OverbookingRiskLevel,
  CapacityRuleType,
  CapacityConfig,
  AccessTypeCapacity,
  CapacityStatus,
  CapacityLock,
  CreateCapacityLockData,
  WaitlistEntry,
  AddToWaitlistData,
  OverbookingConfig,
  OverbookingHistory,
  CapacityRule,
  CapacityStats,
  RealTimeOccupancyReport,
  ConfigureCapacityData,
  UpdateCapacityData,
  CapacityQueryFilters,
  CapacityQueryParams,
  CapacityQueryResult,
  CapacityValidationResult as CapacityCapacityValidationResult,
  LockValidationResult,
  PaymentIntegrationData,
  RegistrationIntegrationData,
  LockReleaseCallback,
  CapacityReservation,
  CapacityReport,
  CapacityRealTimeUpdate,
} from './capacity.types';

// ====================================================================
// PROMOCIONES
// ====================================================================
export type {
  PromotionType,
  DiscountType,
  PromoCodeUsageStatus,
  BasePromotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionResponse,
  BasePromoCode,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
  PromoCodeResponse,
  ValidatePromoCodeRequest,
  ValidatePromoCodeResponse,
  ApplyPromoCodeRequest,
  ApplyPromoCodeResponse,
  PromoCodeUsageAttributes,
  CreatePromoCodeUsageRequest,
  PromoCodeUsageResponse,
  PromoCodeStats,
  PromotionFilters,
  PromoCodeFilters,
  PaginatedResponse as PromotionPaginatedResponse,
  PromotionStats,
  PromotionPerformanceReport,
  PromotionConfig,
  PromotionRule,
  PromotionEligibilityCondition,
  PromotionEligibilityResult,
} from './promotion.types';

// ====================================================================
// QR Y CONTROL DE ACCESO
// ====================================================================
export type {
  QRData,
  GenerateQRRequest,
  GenerateQRResponse,
  ValidateQRRequest,
  ValidateQRResponse,
  RegenerateQRRequest,
  InvalidateQRRequest,
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  CheckoutAttendanceRequest,
  AttendanceStats as QrAttendanceStats,
  CreateAccessLogRequest,
  AccessLogStats,
  DownloadOfflineListRequest,
  DownloadOfflineListResponse,
  ValidateOfflineQRRequest,
  ValidateOfflineQRResponse,
  SyncOfflineDataRequest,
  SyncOfflineDataResponse,
  AttendanceReportRequest,
  AttendanceReport as QrAttendanceReport,
  AttendanceDashboard,
  PublicQRVerificationRequest,
  PublicQRVerificationResponse,
  AuthenticatedQRRequest,
  AdminQRRequest,
  QREncryptionType,
  QRGenerationConfig,
  QRValidationConfig,
  OfflineSyncConfig,
} from './qr.types';

// ====================================================================
// CERTIFICADOS
// ====================================================================
export type {
  CertificateType,
  CertificateStatus,
  CertificateValidationMethod,
  CertificateParticipantData,
  CertificateEventData,
  CertificateData,
  CertificateBlockchainData,
  CertificateEligibilityCriteria,
  CertificateTemplateAttributes,
  CertificateTemplateConfiguration,
  CertificateAttributes,
  CertificateValidationLogAttributes,
  CertificateValidationResult,
  GenerateCertificateRequest,
  GenerateBulkCertificatesRequest,
  VerifyCertificateRequest,
  VerifyCertificateResponse,
  RevokeCertificateRequest,
  ResendCertificateRequest,
  CertificateStats,
  PDFEngineConfig,
  CertificateBlockchainConfig,
  CertificateVerificationConfig,
  CertificateModuleConfig,
  PDFGenerationOptions,
  PDFTemplateData,
  PDFGenerationResult,
  QRCodeOptions,
  QRCodeResult,
} from './certificate.types';

// ====================================================================
// PAGOS
// ====================================================================
export type {
  BillingInfo,
  PaymentMethodInfo,
  PaymentInitiationData,
  PaymentInitiationResponse,
  PaymentConfirmationData,
  PaymentTransaction,
  RefundData,
  RefundInfo,
  PaymentGatewayConfig,
  ReconciliationData,
  GatewayTransaction,
  ReconciliationDiscrepancy,
  ReconciliationReport,
  PaymentFilters as PaymentGatewayFilters,
  PaymentQueryParams as PaymentGatewayQueryParams,
  PaymentSearchResult as PaymentGatewaySearchResult,
  PaymentStats as PaymentGatewayStats,
  RevenueReport as PaymentRevenueReport,
  CardValidationConfig,
  CardValidationResult,
  PaymentToken,
  CircuitBreakerConfig,
  CircuitBreakerState,
  RetryConfig,
  RetryJob,
  WebhookPayload,
  PaymentEvent,
  PaymentRateLimit,
  PaymentReport,
  PaymentDashboard,
  PaymentAlert,
  SupportedCurrency as PaymentSupportedCurrency,
  ExchangeRate,
  CurrencyConversion,
} from './payment.types';

// ====================================================================
// FACTURACIÓN FEL
// ====================================================================
export type {
  FelOperationType,
  FelDocumentStatus,
  FelCertifier,
  FelAuthData,
  FelToken,
  NitValidationData,
  CuiValidationData,
  FelXmlData,
  FelCertificationResult,
  FelDocument,
  FelInvoice,
  FelInvoiceItem,
  FelConfig,
  FelCertifierConfig,
  FelAuditData,
  FelAuditLog,
  GenerateFelInvoiceRequest,
  GenerateFelInvoiceResponse,
  CancelFelInvoiceRequest,
  ResendFelInvoiceRequest,
  FelStats,
  FelComplianceReport,
  FelDashboard,
  FelAlert,
  FelInvoiceFilters,
  FelInvoiceQueryParams,
  FelInvoiceSearchResult,
  FelExportOptions,
  FelExportResult,
  FelCurrency,
  FelTaxType,
  FelProcessingStatus,
  FelLogLevel,
} from './fel.types';

// ====================================================================
// SISTEMA
// ====================================================================
export type {
  UserRole,
  UserStatus,
  UserProfile,
  UserUpdateData,
  UserCreateData,
  Permission,
  RoleDefinition,
  RoleAssignment,
  RoleRevocation,
  UserRoleHistory,
  AuditAction,
  AuditSeverity,
  AuditLog,
  AuditFilters,
  AuditQueryParams,
  AuditSearchResult,
  SystemConfig,
  BackupConfig,
  SystemStats as SystemSystemStats,
  PerformanceMetrics,
  SystemNotificationType,
  SystemNotification,
  SystemExportOptions,
  SystemExportResult,
  SystemImportOptions,
  SystemImportResult,
  MaintenanceTask,
  MaintenanceWindow,
  UserContext,
  UserAction,
  SessionStatus,
  SessionInfo,
} from './system.types';

// ====================================================================
// RE-EXPORTACIONES DE TIPOS COMUNES
// ====================================================================

// Re-exportar tipos comunes que pueden ser usados en múltiples módulos
export type {
  // Tipos de acceso
  AccessType,
  AccessResult,
  AccessSeverity,

  // Sincronización
  SyncStatus,
  ConflictResolution,
  SyncPriority,
} from './qr.types';

// ====================================================================
// CONSTANTES Y ENUMERACIONES
// ====================================================================

// Exportar enumeraciones como constantes para fácil acceso
export {
  CertificateType as CERTIFICATE_TYPES,
  CertificateStatus as CERTIFICATE_STATUSES,
  CertificateValidationMethod as CERTIFICATE_VALIDATION_METHODS,
} from './certificate.types';

export {
  PromotionType as PROMOTION_TYPES,
  DiscountType as DISCOUNT_TYPES,
} from './promotion.types';

// ====================================================================
// UTILIDADES DE TIPOS
// ====================================================================

/**
 * Tipo utilitario para respuestas API paginadas
 */
export type AdminPaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  meta?: Record<string, any>;
};

/**
 * Tipo utilitario para filtros de búsqueda
 */
export type AdminFilters = {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  search?: string;
  [key: string]: any;
};

/**
 * Tipo utilitario para opciones de ordenamiento
 */
export type AdminSortOptions = {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

/**
 * Tipo utilitario para resultados de validación
 */
export type AdminValidationResult = {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
};

/**
 * Tipo utilitario para respuestas de operaciones
 */
export type AdminOperationResult<T = any> = {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
};

// ====================================================================
// MÉTRICAS Y ANALYTICS COMUNES
// ====================================================================

/**
 * Métrica común para dashboards
 */
export interface CommonMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  format: 'number' | 'currency' | 'percentage';
  trend: 'up' | 'down' | 'stable';
  period: string;
}

/**
 * Resumen de métricas por período
 */
export interface MetricsSummary {
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  metrics: CommonMetric[];
  comparisons: {
    previousPeriod?: MetricsSummary;
    yearOverYear?: MetricsSummary;
  };
}

// ====================================================================
// CONFIGURACIONES GLOBALES
// ====================================================================

/**
 * Configuración global de módulos administrativos
 */
export interface AdminModuleConfig {
  dashboard: {
    refreshInterval: number;
    defaultTimeRange: string;
    enabledCharts: string[];
  };
  events: {
    defaultCapacity: number;
    maxCapacity: number;
    allowOverbooking: boolean;
  };
  payments: {
    defaultCurrency: string;
    supportedCurrencies: string[];
    autoReconcile: boolean;
  };
  certificates: {
    autoGenerate: boolean;
    blockchainEnabled: boolean;
    defaultValidityDays: number;
  };
  qr: {
    defaultExpirationHours: number;
    offlineSyncEnabled: boolean;
    maxUsesPerQR: number;
  };
  fel: {
    enabled: boolean;
    certifier: string;
    autoGenerateInvoices: boolean;
  };
}

// ====================================================================
// NOTIFICACIONES Y ALERTAS
// ====================================================================

/**
 * Alerta administrativa genérica
 */
export interface AdminAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  module: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  actionRequired?: boolean;
  actionUrl?: string;
  dismissed?: boolean;
  dismissedAt?: Date;
  dismissedBy?: number;
}

/**
 * Centro de notificaciones administrativas
 */
export interface AdminNotificationCenter {
  alerts: AdminAlert[];
  unreadCount: number;
  lastUpdated: Date;
  settings: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    smsNotifications: boolean;
  };
}

// ====================================================================
// EXPORTACIÓN FINAL
// ====================================================================

// Exportar módulos específicos para evitar conflictos de nombres
export * from './dashboard.types';
export * from './event.types';
export * from './event-template.types';
export * from './event-session.types';
export * from './speaker.types';
export * from './speaker-contract.types';
export type { RegistrationStatus as EventRegistrationStatus } from './registration.types';
export * from './registration.types';
export * from './capacity.types';
export * from './promotion.types';
export * from './qr.types';
export * from './certificate.types';
export * from './payment.types';
export * from './fel.types';
export * from './system.types';

// Exportaciones explícitas para resolver ambigüedades
export type { CapacityValidationResult } from './capacity.types';
export type { PaymentMethod, PaymentType } from './speaker.types';
export type { PaymentFilters, PaymentQueryParams, PaymentSearchResult, PaymentStats } from './payment.types';
export type { SystemStats } from './system.types';

// Agregar propiedades faltantes a SystemStats
export interface ExtendedSystemStats {
  totalUsers?: number;
  totalEvents?: number;
  totalRevenue?: number;
  conversionRate?: number;
  totalRequests?: number;
  activeUsers?: number;
  systemLoad?: number;
  uptime?: number;
  memoryUsage?: number;
  diskUsage?: number;
  databaseConnections?: number;
  errorRate?: number;
  responseTime?: number;
}