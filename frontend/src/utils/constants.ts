// Constants for TradeConnect Frontend

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
export const API_TIMEOUT = 30000; // 30 seconds

// Environment
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Theme Colors (Corporate Palette)
export const THEME_COLORS = {
  primary: '#6B1E22',        // Vino corporativo principal
  primaryLight: '#8B2E32',   // Vino claro para hover
  primaryDark: '#4B1518',    // Vino oscuro para sombras
  accent: '#E63946',          // Red accent (Rojo acento)
  secondary: '#F5F5F5',      // Gris claro para fondos secundarios
  textPrimary: '#333333',    // Texto principal oscuro
  textSecondary: '#666666',  // Texto secundario
  error: '#D32F2F',          // Rojo para errores
  success: '#388E3C',        // Verde para confirmaciones
  warning: '#F57C00',        // Naranja para advertencias
  info: '#1976D2',           // Azul para información
  background: '#FFFFFF',     // Fondo blanco
  surface: '#FAFAFA',        // Superficie gris claro
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    primary: "'Roboto', sans-serif",
    secondary: "'Montserrat', sans-serif",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// Breakpoints (Material UI standard)
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices (phones)
  sm: 600,    // Small devices (tablets)
  md: 900,    // Medium devices (small laptops)
  lg: 1200,   // Large devices (desktops)
  xl: 1536,   // Extra large devices (large desktops)
} as const;

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border radius
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadows
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// Animation durations
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Z-index scale
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

// Event types
export const EVENT_TYPES = {
  CONFERENCE: 1,
  WORKSHOP: 2,
  SEMINAR: 3,
  WEBINAR: 4,
  TRAINING: 5,
} as const;

// Event categories
export const EVENT_CATEGORIES = {
  BUSINESS: 1,
  TECHNOLOGY: 2,
  HEALTH: 3,
  EDUCATION: 4,
  MARKETING: 5,
  FINANCE: 6,
  LEGAL: 7,
  HR: 8,
} as const;

// Payment gateways
export const PAYMENT_GATEWAYS = {
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  NEONET: 'neonet',
  BAM: 'bam',
} as const;

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  DISPUTED: 'disputed',
  EXPIRED: 'expired',
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
} as const;

// Participant types
export const PARTICIPANT_TYPES = {
  INDIVIDUAL: 'individual',
  EMPRESA: 'empresa',
} as const;

// Currencies
export const CURRENCIES = {
  GTQ: 'GTQ',
  USD: 'USD',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'tradeconnect_auth_token',
  REFRESH_TOKEN: 'tradeconnect_refresh_token',
  USER: 'tradeconnect_user',
  CART_SESSION: 'tradeconnect_cart_session',
  THEME: 'tradeconnect_theme',
  LANGUAGE: 'tradeconnect_language',
} as const;

// Session storage keys
export const SESSION_KEYS = {
  CART_ITEMS: 'tradeconnect_cart_items',
  CHECKOUT_DATA: 'tradeconnect_checkout_data',
  SEARCH_FILTERS: 'tradeconnect_search_filters',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  CERTIFICATES: '/certificates',
  CERTIFICATE_DETAIL: '/certificates/:id',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  ADMIN: '/admin',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    ENABLE_2FA: '/auth/2fa/enable',
    DISABLE_2FA: '/auth/2fa/disable',
    VERIFY_2FA: '/auth/2fa/verify',
  },

  // Events
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    DETAIL: '/events/:id',
    UPDATE: '/events/:id',
    DELETE: '/events/:id',
    PUBLISH: '/events/:id/publish',
    DUPLICATE: '/events/:id/duplicate',
    MEDIA: '/events/:id/media',
    UPLOAD_MEDIA: '/events/:id/upload-media',
  },

  // Public Events
  PUBLIC: {
    EVENTS: '/public/events',
    EVENT_DETAIL: '/public/events/:id',
    SEARCH: '/public/events/search',
    CALENDAR: '/public/events/calendar',
    CATEGORIES: '/public/events/categories',
    CERTIFICATES: '/public/certificates',
    VERIFY_CERTIFICATE: '/public/certificates/verify/:hash',
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove/:itemId',
    CLEAR: '/cart/clear',
    APPLY_PROMO: '/cart/apply-promo',
    CALCULATE: '/cart/calculate',
  },

  // Payments
  PAYMENTS: {
    PROCESS: '/payments/process',
    PAYPAL_CREATE: '/payments/paypal/create',
    STRIPE_CREATE: '/payments/stripe/create',
    NEONET_CREATE: '/payments/neonet/create',
    BAM_CREATE: '/payments/bam/create',
    STATUS: '/payments/:transactionId/status',
    METHODS: '/payments/methods',
    HISTORY: '/payments/history',
  },

  // FEL
  FEL: {
    VALIDATE_NIT: '/fel/validate-nit',
    VALIDATE_CUI: '/fel/validate-cui',
    AUTHENTICATE: '/fel/authenticate',
    CERTIFY: '/fel/certify-dte',
    CANCEL: '/fel/cancel-dte',
    CONSULT: '/fel/consult-dte/:uuid',
    DOWNLOAD_PDF: '/fel/download-pdf/:uuid',
    AUTO_GENERATE: '/fel/auto-generate/:registrationId',
    TOKEN_STATUS: '/fel/token/status',
    TOKEN_REFRESH: '/fel/token/refresh',
  },

  // Certificates
  CERTIFICATES: {
    LIST: '/certificates',
    DETAIL: '/certificates/:id',
    DOWNLOAD: '/certificates/:id/download',
    VERIFY: '/certificates/verify/:hash',
    TEMPLATES: '/certificate-templates',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    EVENTS: '/admin/events',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  },
} as const;

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SYMBOL: true,
  },
  PHONE: {
    GUATEMALA_REGEX: /^\+502\s?\d{4}-?\d{4}$/,
  },
  NIT: {
    GUATEMALA_REGEX: /^\d{4}-\d{6}-\d{3}-\d{1}$/,
  },
  CUI: {
    GUATEMALA_REGEX: /^\d{13}$/,
  },
} as const;

// File upload limits
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
} as const;

// Supported file types
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Toast notifications
export const TOAST_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right' as const,
} as const;

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Inténtalo de nuevo más tarde.',
  UNAUTHORIZED: 'No autorizado. Inicia sesión nuevamente.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Datos inválidos.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
  REGISTER_SUCCESS: 'Registro exitoso. Verifica tu email.',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente.',
  CART_ITEM_ADDED: 'Producto agregado al carrito.',
  CART_ITEM_REMOVED: 'Producto removido del carrito.',
  PAYMENT_SUCCESS: 'Pago procesado exitosamente.',
  CERTIFICATE_GENERATED: 'Certificado generado exitosamente.',
} as const;