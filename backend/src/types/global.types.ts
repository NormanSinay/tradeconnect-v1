/**
 * @fileoverview Tipos globales del sistema TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos TypeScript para toda la aplicación
 */

// ====================================================================
// TIPOS DE RESPUESTA API ESTANDARIZADAS
// ====================================================================

/**
 * Interface base para todas las respuestas de la API
 * Proporciona estructura consistente para respuestas exitosas y de error
 */
export interface ApiResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Mensaje descriptivo de la respuesta */
  message: string;
  /** Datos de la respuesta (solo en respuestas exitosas) */
  data?: T;
  /** Mensaje de error (solo en respuestas de error) */
  error?: string;
  /** Timestamp ISO de cuando se generó la respuesta */
  timestamp: string;
}

/**
 * Interface para respuestas paginadas de la API
 * Extiende ApiResponse para incluir metadatos de paginación
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Metadatos de paginación */
  pagination: {
    /** Página actual */
    page: number;
    /** Elementos por página */
    limit: number;
    /** Total de elementos */
    total: number;
    /** Total de páginas */
    totalPages: number;
    /** Indica si hay página siguiente */
    hasNext: boolean;
    /** Indica si hay página anterior */
    hasPrevious: boolean;
  };
}

// ====================================================================
// TIPOS DE ERROR Y VALIDACIÓN
// ====================================================================

/**
 * Interface para errores estructurados de la API
 */
export interface ApiError {
  /** Código único del error */
  code: string;
  /** Mensaje descriptivo del error */
  message: string;
  /** Campo específico donde ocurrió el error (opcional) */
  field?: string;
  /** Detalles adicionales del error */
  details?: any;
}

/**
 * Interface para errores de validación de campos
 */
export interface ValidationError extends ApiError {
  /** Campo que falló la validación */
  field: string;
  /** Valor que causó el error */
  value: any;
  /** Regla de validación que falló */
  rule?: string;
}

/**
 * Interface para errores de FEL (Facturación Electrónica)
 */
export interface FelError {
  /** Código de error FEL */
  codigoError: string;
  /** Descripción del error FEL */
  descripcionError: string;
  /** Campo específico del error */
  campo?: string;
}

// ====================================================================
// TIPOS DE CONFIGURACIÓN DEL SISTEMA
// ====================================================================

/**
 * Configuración de conexión a base de datos
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  dialect: 'postgres' | 'mysql' | 'sqlite' | 'mariadb';
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

/**
 * Configuración de conexión a Redis
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * Configuración JWT para autenticación
 */
export interface JwtConfig {
  secret: string;
  expire: string;
  refreshSecret: string;
  refreshExpire: string;
}

// ====================================================================
// TIPOS DE AUDITORÍA Y LOGGING
// ====================================================================

/**
 * Registro de auditoría para compliance y trazabilidad
 */
export interface AuditLog {
  /** ID único del registro de auditoría */
  id?: number;
  /** ID del usuario que realizó la acción */
  userId: number;
  /** Acción realizada */
  action: string;
  /** Tipo de recurso afectado */
  resource: string;
  /** ID específico del recurso */
  resourceId?: string;
  /** Valores anteriores (para updates) */
  oldValues?: any;
  /** Valores nuevos (para creates/updates) */
  newValues?: any;
  /** Dirección IP del usuario */
  ipAddress: string;
  /** User Agent del navegador */
  userAgent: string;
  /** Timestamp de la acción */
  timestamp: Date;
  /** Información adicional */
  metadata?: any;
}

/**
 * Registro de transacciones para auditoría financiera
 */
export interface TransactionLog {
  /** ID único de la transacción */
  transactionId: string;
  /** ID del usuario */
  userId: number;
  /** Tipo de transacción */
  type: 'payment' | 'refund' | 'fee';
  /** Monto de la transacción */
  amount: number;
  /** Moneda */
  currency: string;
  /** Pasarela de pago utilizada */
  gateway: string;
  /** Estado de la transacción */
  status: string;
  /** Referencia externa */
  externalReference?: string;
  /** Metadatos adicionales */
  metadata?: any;
  /** Timestamp de la transacción */
  timestamp: Date;
}

// ====================================================================
// TIPOS DE PAGINACIÓN Y FILTROS
// ====================================================================

/**
 * Parámetros estándar de paginación
 */
export interface PaginationParams {
  /** Página a mostrar (default: 1) */
  page?: number;
  /** Elementos por página (default: 20) */
  limit?: number;
  /** Campo por el cual ordenar */
  sortBy?: string;
  /** Dirección del ordenamiento */
  sortOrder?: 'ASC' | 'DESC';
  /** Término de búsqueda general */
  search?: string;
}

/**
 * Filtro de rango de fechas
 */
export interface DateFilter {
  /** Fecha inicial (inclusive) */
  from?: Date;
  /** Fecha final (inclusive) */
  to?: Date;
}

/**
 * Filtros base aplicables a la mayoría de entidades
 */
export interface BaseFilter {
  /** Filtro por fecha de creación */
  createdAt?: DateFilter;
  /** Filtro por fecha de actualización */
  updatedAt?: DateFilter;
  /** Filtro por estado activo/inactivo */
  isActive?: boolean;
  /** IDs específicos a incluir */
  ids?: number[];
}

// ====================================================================
// TIPOS DE AUTENTICACIÓN Y AUTORIZACIÓN
// ====================================================================

/**
 * Payload de JWT para autenticación
 */
export interface JwtPayload {
  /** ID único del usuario */
  userId: number;
  /** Email del usuario */
  email: string;
  /** Roles asignados al usuario */
  roles: string[];
  /** Permisos específicos del usuario */
  permissions: string[];
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** Token ID para revocación */
  jti?: string;
}

/**
 * Payload de refresh token
 */
export interface RefreshTokenPayload {
  /** ID del usuario */
  userId: number;
  /** ID único del token para revocación */
  tokenId: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
}

/**
 * Información de sesión de usuario
 */
export interface UserSession {
  /** ID de la sesión */
  sessionId: string;
  /** ID del usuario */
  userId: number;
  /** Información del dispositivo */
  device: {
    userAgent: string;
    ip: string;
    platform?: string;
    browser?: string;
  };
  /** Timestamp de inicio de sesión */
  createdAt: Date;
  /** Timestamp de última actividad */
  lastActivity: Date;
  /** Indica si la sesión está activa */
  isActive: boolean;
}

// ====================================================================
// TIPOS ESPECÍFICOS DE TRADECONNECT
// ====================================================================

/**
 * Información de ubicación y localización para Guatemala
 */
export interface GuatemalaLocation {
  /** Departamento de Guatemala */
  departamento: string;
  /** Municipio */
  municipio: string;
  /** Zona (para Ciudad de Guatemala) */
  zona?: number;
  /** Dirección completa */
  direccion: string;
  /** Código postal */
  codigoPostal?: string;
}

/**
 * Información fiscal guatemalteca
 */
export interface GuatemalaFiscalInfo {
  /** NIT del contribuyente */
  nit: string;
  /** CUI (Código Único de Identificación) */
  cui?: string;
  /** Nombre o razón social */
  nombre: string;
  /** Régimen tributario */
  regimen: 'pequeño_contribuyente' | 'general' | 'agropecuario' | 'opcional_simplificado';
  /** Ubicación fiscal */
  ubicacion: GuatemalaLocation;
}

/**
 * Configuración de moneda para Guatemala
 */
export interface CurrencyConfig {
  /** Código de moneda (GTQ para Guatemala) */
  code: 'GTQ' | 'USD';
  /** Símbolo de la moneda */
  symbol: 'Q' | '$';
  /** Nombre de la moneda */
  name: string;
  /** Decimales a mostrar */
  decimals: number;
}

// ====================================================================
// TIPOS DE ARCHIVOS Y MULTIMEDIA
// ====================================================================

/**
 * Información de archivo subido
 */
export interface UploadedFile {
  /** Nombre original del archivo */
  originalName: string;
  /** Nombre del archivo en el servidor */
  filename: string;
  /** Ruta completa del archivo */
  path: string;
  /** Tipo MIME del archivo */
  mimetype: string;
  /** Tamaño en bytes */
  size: number;
  /** Hash MD5 del archivo */
  hash: string;
  /** URL pública del archivo */
  url: string;
  /** Timestamp de subida */
  uploadedAt: Date;
  /** ID del usuario que subió el archivo */
  uploadedBy: number;
}

/**
 * Configuración de imagen procesada
 */
export interface ProcessedImage extends UploadedFile {
  /** Ancho en píxeles */
  width: number;
  /** Alto en píxeles */
  height: number;
  /** Versiones redimensionadas */
  variants?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Tipo para hacer opcional todas las propiedades de una interface
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Tipo para hacer requeridas todas las propiedades opcionales
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Tipo para omitir propiedades específicas de una interface
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Tipo para seleccionar solo ciertas propiedades de una interface
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Tipo para valores que pueden ser null
 */
export type Nullable<T> = T | null;

/**
 * Tipo para valores opcionales o null
 */
export type Optional<T> = T | null | undefined;