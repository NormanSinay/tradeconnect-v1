/**
 * @fileoverview Constantes del sistema TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Constantes, enums y configuraciones del sistema
 */

// ====================================================================
// CÓDIGOS DE ESTADO HTTP
// ====================================================================

/**
 * Códigos de estado HTTP estándar utilizados en la API
 */
export const HTTP_STATUS = {
  // Respuestas exitosas
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirecciones
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Errores del cliente
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  LOCKED: 423,
  REQUEST_TOO_LONG: 413,

  // Errores del servidor
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// ====================================================================
// ROLES Y PERMISOS DEL SISTEMA
// ====================================================================

/**
 * Roles disponibles en el sistema TradeConnect
 */
export const USER_ROLES = {
  /** Administrador supremo con acceso total */
  SUPER_ADMIN: 'super_admin',
  /** Administrador con acceso amplio */
  ADMIN: 'admin',
  /** Gerente con permisos de gestión */
  MANAGER: 'manager',
  /** Operador con permisos limitados */
  OPERATOR: 'operator',
  /** Usuario regular del sistema */
  USER: 'user',
  /** Speaker o expositor de eventos */
  SPEAKER: 'speaker',
  /** Participante en eventos */
  PARTICIPANT: 'participant',
  /** Cliente externo */
  CLIENT: 'client'
} as const;

/**
 * Permisos granulares del sistema
 */
export const PERMISSIONS = {
  // === GESTIÓN DE USUARIOS ===
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  MANAGE_USER_ROLES: 'manage_user_roles',
  VIEW_USER_AUDIT: 'view_user_audit',
  
  // === GESTIÓN DE EVENTOS ===
  CREATE_EVENT: 'create_event',
  READ_EVENT: 'read_event',
  UPDATE_EVENT: 'update_event',
  DELETE_EVENT: 'delete_event',
  PUBLISH_EVENT: 'publish_event',
  MANAGE_EVENT_CAPACITY: 'manage_event_capacity',
  DUPLICATE_EVENT: 'duplicate_event',
  
  // === GESTIÓN DE SPEAKERS ===
  CREATE_SPEAKER: 'create_speaker',
  READ_SPEAKER: 'read_speaker',
  UPDATE_SPEAKER: 'update_speaker',
  DELETE_SPEAKER: 'delete_speaker',
  MANAGE_SPEAKER_CONTRACTS: 'manage_speaker_contracts',
  
  // === SISTEMA DE INSCRIPCIONES ===
  CREATE_REGISTRATION: 'create_registration',
  READ_REGISTRATION: 'read_registration',
  UPDATE_REGISTRATION: 'update_registration',
  DELETE_REGISTRATION: 'delete_registration',
  MANAGE_GROUP_REGISTRATION: 'manage_group_registration',
  
  // === PROCESAMIENTO DE PAGOS ===
  PROCESS_PAYMENT: 'process_payment',
  REFUND_PAYMENT: 'refund_payment',
  VIEW_PAYMENTS: 'view_payments',
  MANAGE_PAYMENT_METHODS: 'manage_payment_methods',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  
  // === FACTURACIÓN FEL ===
  GENERATE_INVOICE: 'generate_invoice',
  CANCEL_INVOICE: 'cancel_invoice',
  VIEW_INVOICES: 'view_invoices',
  MANAGE_FEL_CONFIG: 'manage_fel_config',
  RETRY_FEL_OPERATIONS: 'retry_fel_operations',
  
  // === PROMOCIONES Y DESCUENTOS ===
  CREATE_PROMOTION: 'create_promotion',
  READ_PROMOTION: 'read_promotion',
  UPDATE_PROMOTION: 'update_promotion',
  DELETE_PROMOTION: 'delete_promotion',
  APPLY_DISCOUNT: 'apply_discount',
  
  // === CÓDIGOS QR Y ACCESO ===
  GENERATE_QR: 'generate_qr',
  VALIDATE_QR: 'validate_qr',
  MANAGE_ACCESS_CONTROL: 'manage_access_control',
  VIEW_ATTENDANCE: 'view_attendance',
  
  // === CERTIFICADOS ===
  GENERATE_CERTIFICATE: 'generate_certificate',
  VIEW_CERTIFICATE: 'view_certificate',
  MANAGE_CERTIFICATE_TEMPLATES: 'manage_certificate_templates',
  VERIFY_CERTIFICATE: 'verify_certificate',
  
  // === NOTIFICACIONES ===
  SEND_NOTIFICATION: 'send_notification',
  MANAGE_EMAIL_TEMPLATES: 'manage_email_templates',
  VIEW_NOTIFICATION_LOGS: 'view_notification_logs',
  
  // === REPORTES Y ANALYTICS ===
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_DASHBOARDS: 'manage_dashboards',
  
  // === CONFIGURACIÓN SISTEMA ===
  MANAGE_SYSTEM_CONFIG: 'manage_system_config',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  
  // === WORKFLOWS ===
  CREATE_WORKFLOW: 'create_workflow',
  EXECUTE_WORKFLOW: 'execute_workflow',
  VIEW_WORKFLOW_HISTORY: 'view_workflow_history'
} as const;

// ====================================================================
// ESTADOS DE ENTIDADES DEL SISTEMA
// ====================================================================

/**
 * Estados posibles de eventos
 */
export const EVENT_STATUS = {
  /** Borrador, no visible públicamente */
  DRAFT: 'draft',
  /** Publicado y visible */
  PUBLISHED: 'published',
  /** Activo, inscripciones abiertas */
  ACTIVE: 'active',
  /** En curso */
  ONGOING: 'ongoing',
  /** Cancelado */
  CANCELLED: 'cancelled',
  /** Completado exitosamente */
  COMPLETED: 'completed',
  /** Archivado */
  ARCHIVED: 'archived',
  /** Suspendido temporalmente */
  SUSPENDED: 'suspended'
} as const;

/**
 * Tipos de eventos soportados
 */
export const EVENT_TYPES = {
  /** Conferencia magistral */
  CONFERENCE: 'conference',
  /** Taller práctico */
  WORKSHOP: 'workshop',
  /** Seminario */
  SEMINAR: 'seminar',
  /** Webinar virtual */
  WEBINAR: 'webinar',
  /** Evento de networking */
  NETWORKING: 'networking',
  /** Capacitación empresarial */
  TRAINING: 'training',
  /** Programa de certificación */
  CERTIFICATION: 'certification',
  /** Feria comercial */
  TRADE_FAIR: 'trade_fair',
  /** Evento híbrido */
  HYBRID: 'hybrid'
} as const;

/**
 * Estados de inscripciones
 */
export const REGISTRATION_STATUS = {
  /** Inscripción pendiente de pago */
  PENDING: 'pending',
  /** Confirmada y pagada */
  CONFIRMED: 'confirmed',
  /** Cancelada */
  CANCELLED: 'cancelled',
  /** En lista de espera */
  WAITLISTED: 'waitlisted',
  /** Completada (asistió al evento) */
  COMPLETED: 'completed',
  /** No asistió */
  NO_SHOW: 'no_show'
} as const;

// ====================================================================
// CONFIGURACIONES DE PAGO
// ====================================================================

/**
 * Estados de transacciones de pago
 */
export const PAYMENT_STATUS = {
  /** Pago iniciado pero no completado */
  PENDING: 'pending',
  /** En proceso de validación */
  PROCESSING: 'processing',
  /** Pago completado exitosamente */
  COMPLETED: 'completed',
  /** Pago falló */
  FAILED: 'failed',
  /** Pago cancelado por usuario */
  CANCELLED: 'cancelled',
  /** Pago reembolsado totalmente */
  REFUNDED: 'refunded',
  /** Pago parcialmente reembolsado */
  PARTIALLY_REFUNDED: 'partially_refunded',
  /** Pago en disputa */
  DISPUTED: 'disputed',
  /** Pago expirado */
  EXPIRED: 'expired'
} as const;

/**
 * Pasarelas de pago soportadas
 */
export const PAYMENT_GATEWAYS = {
  /** PayPal Internacional */
  PAYPAL: 'paypal',
  /** Stripe Internacional */
  STRIPE: 'stripe',
  /** NeoNet Guatemala */
  NEONET: 'neonet',
  /** BAM Pagos Guatemala */
  BAM: 'bam'
} as const;

/**
 * Tipos de pago
 */
export const PAYMENT_TYPES = {
  /** Pago único */
  ONE_TIME: 'one_time',
  /** Pago recurrente */
  RECURRING: 'recurring',
  /** Pago por cuotas */
  INSTALLMENT: 'installment',
  /** Depósito inicial */
  DEPOSIT: 'deposit'
} as const;

// ====================================================================
// FACTURACIÓN ELECTRÓNICA FEL GUATEMALA
// ====================================================================

/**
 * Estados de documentos FEL
 */
export const FEL_STATUS = {
  /** Pendiente de envío a SAT */
  PENDING: 'pending',
  /** Enviado, esperando respuesta */
  PROCESSING: 'processing',
  /** Certificado por SAT */
  CERTIFIED: 'certified',
  /** Error en certificación */
  FAILED: 'failed',
  /** Documento anulado */
  CANCELLED: 'cancelled',
  /** Error de comunicación */
  COMMUNICATION_ERROR: 'communication_error'
} as const;

/**
 * Tipos de documentos FEL según SAT Guatemala
 */
export const FEL_DOCUMENT_TYPES = {
  /** Factura */
  INVOICE: 'FACT',
  /** Nota de crédito */
  CREDIT_NOTE: 'NCRE',
  /** Nota de débito */
  DEBIT_NOTE: 'NDEB',
  /** Recibo */
  RECEIPT: 'RECI',
  /** Factura especial */
  SPECIAL_INVOICE: 'FESP',
  /** Factura cambiaria */
  EXCHANGE_INVOICE: 'FCAM'
} as const;

/**
 * Regímenes tributarios FEL Guatemala
 */
export const FEL_TAX_REGIMES = {
  /** Pequeño contribuyente */
  SMALL_TAXPAYER: 'pequeño_contribuyente',
  /** Régimen general */
  GENERAL: 'general',
  /** Régimen agropecuario */
  AGRICULTURAL: 'agropecuario',
  /** Régimen opcional simplificado */
  OPTIONAL_SIMPLIFIED: 'opcional_simplificado'
} as const;

// ====================================================================
// CONFIGURACIONES DE SISTEMA
// ====================================================================

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  /** Página por defecto */
  DEFAULT_PAGE: 1,
  /** Límite por defecto de elementos */
  DEFAULT_LIMIT: 20,
  /** Límite máximo de elementos por página */
  MAX_LIMIT: 100,
  /** Límite mínimo de elementos por página */
  MIN_LIMIT: 1
} as const;

/**
 * Configuración de archivos
 */
export const FILE_CONFIG = {
  /** Tamaño máximo de archivo: 10MB */
  MAX_SIZE: 10 * 1024 * 1024,
  /** Tipos de imagen permitidos */
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/svg+xml'
  ],
  /** Tipos de documento permitidos */
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  /** Tipos de video permitidos */
  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv'
  ],
  /** Directorio base de uploads */
  UPLOAD_PATH: 'uploads/',
  /** Subdirectorios por tipo */
  PATHS: {
    IMAGES: 'uploads/images/',
    DOCUMENTS: 'uploads/documents/',
    VIDEOS: 'uploads/videos/',
    CERTIFICATES: 'uploads/certificates/',
    QR_CODES: 'uploads/qr-codes/'
  }
} as const;

/**
 * Claves de caché Redis
 */
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  USER_PERMISSIONS: 'user:permissions:',
  EVENT_LIST: 'event:list',
  EVENT_DETAIL: 'event:detail:',
  EVENT_CAPACITY: 'event:capacity:',
  PAYMENT_METHODS: 'payment:methods',
  FEL_TOKEN: 'fel:token',
  PROMOTION_CODES: 'promotion:codes',
  CERTIFICATE_TEMPLATE: 'certificate:template:',
  SYSTEM_CONFIG: 'system:config'
} as const;

/**
 * Tiempos de vida del caché (en segundos)
 */
export const CACHE_TTL = {
  /** 5 minutos */
  SHORT: 300,
  /** 30 minutos */
  MEDIUM: 1800,
  /** 1 hora */
  LONG: 3600,
  /** 6 horas */
  EXTENDED: 21600,
  /** 24 horas */
  VERY_LONG: 86400,
  /** 7 días */
  WEEK: 604800
} as const;

// ====================================================================
// CONFIGURACIONES DE RATE LIMITING
// ====================================================================

/**
 * Límites de tasa por tipo de operación (requests por ventana de tiempo)
 */
export const RATE_LIMITS = {
  /** Límite global general - 1000 requests por 15 minutos */
  GLOBAL: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000
  },
  /** Autenticación - 5 intentos por 15 minutos */
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5
  },
  /** Recuperación de contraseña - 3 intentos por hora */
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3
  },
  /** Pagos - 10 intentos por hora */
  PAYMENT: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10
  },
  /** Facturación FEL - 100 requests por hora */
  FEL: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 100
  },
  /** Generación de certificados - 50 por hora */
  CERTIFICATES: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 50
  },
  /** Envío de notificaciones - 100 por hora */
  NOTIFICATIONS: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 100
  }
} as const;

// ====================================================================
// MENSAJES DEL SISTEMA
// ====================================================================

/**
 * Mensajes estandarizados del sistema
 */
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Recurso creado exitosamente',
    UPDATED: 'Recurso actualizado exitosamente',
    DELETED: 'Recurso eliminado exitosamente',
    OPERATION_COMPLETED: 'Operación completada exitosamente',
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGOUT_SUCCESS: 'Cierre de sesión exitoso',
    PAYMENT_PROCESSED: 'Pago procesado exitosamente',
    EMAIL_SENT: 'Correo electrónico enviado',
    CERTIFICATE_GENERATED: 'Certificado generado exitosamente',
    QR_GENERATED: 'Código QR generado exitosamente'
  },
  ERROR: {
    NOT_FOUND: 'Recurso no encontrado',
    UNAUTHORIZED: 'No autorizado para realizar esta acción',
    FORBIDDEN: 'Acceso denegado',
    VALIDATION_FAILED: 'Error de validación en los datos enviados',
    INTERNAL_ERROR: 'Error interno del servidor',
    BAD_REQUEST: 'Solicitud incorrecta',
    DUPLICATE_ENTRY: 'Ya existe un registro con estos datos',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    TOKEN_EXPIRED: 'Token de acceso expirado',
    INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
    PAYMENT_FAILED: 'Error en el procesamiento del pago',
    FEL_ERROR: 'Error en facturación electrónica',
    EMAIL_FAILED: 'Error al enviar correo electrónico',
    FILE_TOO_LARGE: 'Archivo demasiado grande',
    INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
    RATE_LIMIT_EXCEEDED: 'Límite de solicitudes excedido'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo es requerido',
    INVALID_EMAIL: 'Formato de correo electrónico inválido',
    INVALID_NIT: 'Formato de NIT guatemalteco inválido',
    INVALID_CUI: 'Formato de CUI guatemalteco inválido',
    INVALID_PHONE: 'Formato de teléfono inválido',
    INVALID_DATE: 'Formato de fecha inválido',
    INVALID_URL: 'Formato de URL inválido',
    PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
    PASSWORD_TOO_WEAK: 'La contraseña debe contener mayúsculas, minúsculas y números',
    INVALID_RANGE: 'Valor fuera del rango permitido',
    INVALID_LENGTH: 'Longitud de texto inválida'
  }
} as const;

// ====================================================================
// CONFIGURACIONES DE SEGURIDAD
// ====================================================================

/**
 * Configuraciones de contraseñas y seguridad
 */
export const SECURITY_CONFIG = {
  /** Longitud mínima de contraseña */
  MIN_PASSWORD_LENGTH: 8,
  /** Longitud máxima de contraseña */
  MAX_PASSWORD_LENGTH: 128,
  /** Intentos de login antes de bloqueo */
  MAX_LOGIN_ATTEMPTS: 5,
  /** Duración de bloqueo de cuenta en minutos */
  ACCOUNT_LOCK_DURATION: 30,
  /** Duración de sesión en horas */
  SESSION_DURATION: 8,
  /** Tiempo de vida del token 2FA en minutos */
  TWO_FA_TOKEN_DURATION: 5,
  /** Longitud del código 2FA */
  TWO_FA_CODE_LENGTH: 6
} as const;

// ====================================================================
// CONFIGURACIONES DE LOCALIZACIÓN GUATEMALA
// ====================================================================

/**
 * Configuraciones específicas de Guatemala
 */
export const GUATEMALA_CONFIG = {
  /** Zona horaria oficial */
  TIMEZONE: 'America/Guatemala',
  /** Código de país */
  COUNTRY_CODE: 'GT',
  /** Código de moneda */
  CURRENCY_CODE: 'GTQ',
  /** Símbolo de moneda */
  CURRENCY_SYMBOL: 'Q',
  /** Prefijo telefónico internacional */
  PHONE_PREFIX: '+502',
  /** Formato de fecha estándar */
  DATE_FORMAT: 'DD/MM/YYYY',
  /** Formato de hora estándar */
  TIME_FORMAT: 'HH:mm:ss',
  /** Idioma predeterminado */
  DEFAULT_LANGUAGE: 'es-GT',
  /** Departamentos de Guatemala */
  DEPARTMENTS: [
    'Guatemala',
    'El Progreso',
    'Sacatepéquez',
    'Chimaltenango',
    'Escuintla',
    'Santa Rosa',
    'Sololá',
    'Totonicapán',
    'Quetzaltenango',
    'Suchitepéquez',
    'Retalhuleu',
    'San Marcos',
    'Huehuetenango',
    'Quiché',
    'Baja Verapaz',
    'Alta Verapaz',
    'Petén',
    'Izabal',
    'Zacapa',
    'Chiquimula',
    'Jalapa',
    'Jutiapa'
  ]
} as const;

// ====================================================================
// CONFIGURACIONES DE NOTIFICACIONES
// ====================================================================

/**
 * Tipos de notificaciones del sistema
 */
export const NOTIFICATION_TYPES = {
  /** Notificación informativa */
  INFO: 'info',
  /** Advertencia */
  WARNING: 'warning',
  /** Error */
  ERROR: 'error',
  /** Éxito */
  SUCCESS: 'success',
  /** Recordatorio */
  REMINDER: 'reminder'
} as const;

/**
 * Canales de notificación
 */
export const NOTIFICATION_CHANNELS = {
  /** Correo electrónico */
  EMAIL: 'email',
  /** SMS */
  SMS: 'sms',
  /** WhatsApp */
  WHATSAPP: 'whatsapp',
  /** Push notification */
  PUSH: 'push',
  /** Notificación en sistema */
  IN_APP: 'in_app'
} as const;

// ====================================================================
// CONFIGURACIONES DE EVENTOS HÍBRIDOS
// ====================================================================

/**
 * Tipos de modalidad de eventos
 */
export const EVENT_MODALITIES = {
  /** Evento presencial únicamente */
  IN_PERSON: 'in_person',
  /** Evento virtual únicamente */
  VIRTUAL: 'virtual',
  /** Evento híbrido (presencial + virtual) */
  HYBRID: 'hybrid'
} as const;

/**
 * Plataformas de streaming soportadas
 */
export const STREAMING_PLATFORMS = {
  /** Zoom */
  ZOOM: 'zoom',
  /** Microsoft Teams */
  TEAMS: 'teams',
  /** Google Meet */
  MEET: 'meet',
  /** YouTube Live */
  YOUTUBE: 'youtube',
  /** Facebook Live */
  FACEBOOK: 'facebook',
  /** Plataforma personalizada */
  CUSTOM: 'custom'
} as const;

// ====================================================================
// CONFIGURACIONES DE BLOCKCHAIN
// ====================================================================

/**
 * Redes blockchain soportadas
 */
export const BLOCKCHAIN_NETWORKS = {
  /** Ethereum Mainnet */
  ETHEREUM_MAINNET: 'ethereum_mainnet',
  /** Ethereum Testnet (Goerli) */
  ETHEREUM_TESTNET: 'ethereum_testnet',
  /** Polygon */
  POLYGON: 'polygon',
  /** Binance Smart Chain */
  BSC: 'bsc'
} as const;

/**
 * Tipos de transacciones blockchain
 */
export const BLOCKCHAIN_TRANSACTION_TYPES = {
  /** Generación de certificado */
  CERTIFICATE_MINT: 'certificate_mint',
  /** Validación de QR */
  QR_VALIDATION: 'qr_validation',
  /** Verificación de asistencia */
  ATTENDANCE_VERIFICATION: 'attendance_verification'
} as const;

// ====================================================================
// TIPOS TYPESCRIPT DERIVADOS
// ====================================================================

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];
export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
export type RegistrationStatus = typeof REGISTRATION_STATUS[keyof typeof REGISTRATION_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type PaymentGateway = typeof PAYMENT_GATEWAYS[keyof typeof PAYMENT_GATEWAYS];
export type PaymentType = typeof PAYMENT_TYPES[keyof typeof PAYMENT_TYPES];
export type FelStatus = typeof FEL_STATUS[keyof typeof FEL_STATUS];
export type FelDocumentType = typeof FEL_DOCUMENT_TYPES[keyof typeof FEL_DOCUMENT_TYPES];
export type FelTaxRegime = typeof FEL_TAX_REGIMES[keyof typeof FEL_TAX_REGIMES];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];
export type EventModality = typeof EVENT_MODALITIES[keyof typeof EVENT_MODALITIES];
export type StreamingPlatform = typeof STREAMING_PLATFORMS[keyof typeof STREAMING_PLATFORMS];
export type BlockchainNetwork = typeof BLOCKCHAIN_NETWORKS[keyof typeof BLOCKCHAIN_NETWORKS];
export type BlockchainTransactionType = typeof BLOCKCHAIN_TRANSACTION_TYPES[keyof typeof BLOCKCHAIN_TRANSACTION_TYPES];

// ====================================================================
// CONFIGURACIONES DE DESARROLLO Y TESTING
// ====================================================================

/**
 * Configuraciones específicas para entornos de desarrollo
 */
export const DEV_CONFIG = {
  /** Datos de prueba habilitados */
  ENABLE_TEST_DATA: process.env.NODE_ENV === 'development',
  /** Logging detallado */
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  /** Bypass de autenticación para testing */
  BYPASS_AUTH: process.env.NODE_ENV === 'test',
  /** Email de desarrollo */
  DEV_EMAIL: 'desarrollo@tradeconnect.gt',
  /** Teléfono de desarrollo */
  DEV_PHONE: '+502 1234-5678'
} as const;