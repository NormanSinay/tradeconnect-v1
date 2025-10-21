/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Facturación FEL
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para facturación electrónica FEL en el panel administrativo
 */

// ====================================================================
// TIPOS BASE DE FEL
// ====================================================================

/**
 * Tipos de operación FEL para auditoría
 */
export type FelOperationType =
  | 'token_authentication'
  | 'document_certification'
  | 'document_cancellation'
  | 'document_consultation'
  | 'nit_validation'
  | 'cui_validation'
  | 'xml_generation'
  | 'pdf_generation'
  | 'email_delivery';

/**
 * Estados de documento FEL
 */
export type FelDocumentStatus =
  | 'generated'      // XML generado
  | 'sent'          // Enviado al certificador
  | 'certified'     // Certificado por SAT
  | 'cancelled'     // Anulado
  | 'expired'       // Expirado
  | 'failed';       // Fallido

/**
 * Tipos de certificador FEL
 */
export type FelCertifier =
  | 'infile'
  | 'dimexa';

/**
 * Estados de factura FEL
 */
export type FelInvoiceStatus =
  | 'draft'
  | 'generated'
  | 'sent'
  | 'certified'
  | 'cancelled'
  | 'error';

/**
 * Tipos de documento FEL
 */
export type FelDocumentType =
  | 'FACTURA'
  | 'NOTA_DE_CREDITO'
  | 'NOTA_DE_DEBITO'
  | 'RECIBO';

// ====================================================================
// INTERFACES DE AUTENTICACIÓN FEL
// ====================================================================

/**
 * Datos para autenticación FEL
 */
export interface FelAuthData {
  certifier: FelCertifier;
  username?: string;
  password?: string;
  apiKey?: string;
  environment?: 'production' | 'testing';
}

/**
 * Token FEL
 */
export interface FelToken {
  id: number;
  certifier: FelCertifier;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// INTERFACES DE VALIDACIÓN
// ====================================================================

/**
 * Datos de validación NIT
 */
export interface NitValidationData {
  nit: string;
  name?: string;
  status: 'valid' | 'invalid' | 'not_found';
  address?: string;
  municipality?: string;
  department?: string;
  lastUpdated?: Date;
  cachedAt?: Date;
}

/**
 * Datos de validación CUI
 */
export interface CuiValidationData {
  cui: string;
  name?: string;
  status: 'valid' | 'invalid' | 'not_found';
  birthDate?: Date;
  gender?: string;
  lastUpdated?: Date;
  cachedAt?: Date;
}

// ====================================================================
// INTERFACES DE DOCUMENTOS FEL
// ====================================================================

/**
 * Datos para generación de XML
 */
export interface FelXmlData {
  uuid: string;
  issuer: {
    nit: string;
    name: string;
    address: string;
    municipality: string;
    department: string;
    country: string;
    email?: string;
    phone?: string;
  };
  receiver: {
    name: string;
    address?: string;
    email?: string;
    nit?: string;
    cui?: string;
  };
  items: Array<{
    number: number;
    type: 'B' | 'S'; // Bien o Servicio
    quantity: number;
    unit: string;
    description: string;
    unitPrice: number;
    discount: number;
    taxableAmount: number;
  }>;
  currency: string;
  paymentType: 'CASH' | 'CARD' | 'TRANSFER';
  paymentMethod: string;
}

/**
 * Resultado de certificación FEL
 */
export interface FelCertificationResult {
  authorizationNumber: string;
  authorizationDate: Date;
  certifiedXml: string;
  qrCode: string;
  series?: string;
  number?: number;
}

/**
 * Documento FEL
 */
export interface FelDocument {
  id: number;
  uuid: string;
  documentType: FelDocumentType;
  series?: string;
  number?: number;
  status: FelDocumentStatus;
  xmlData: FelXmlData;
  certifiedXml?: string;
  authorizationNumber?: string;
  authorizationDate?: Date;
  qrCode?: string;
  pdfUrl?: string;
  errorMessage?: string;
  retryCount: number;
  lastRetryAt?: Date;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// INTERFACES DE FACTURAS
// ====================================================================

/**
 * Factura FEL
 */
export interface FelInvoice {
  id: number;
  invoiceNumber: string;
  felDocumentId?: number;
  paymentId: number;
  eventId: number;
  userId: number;
  status: FelInvoiceStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  issuedAt?: Date;
  dueDate?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  notes?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  emailSent: boolean;
  emailSentAt?: Date;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item de factura
 */
export interface FelInvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  metadata?: any;
}

// ====================================================================
// INTERFACES DE CONFIGURACIÓN FEL
// ====================================================================

/**
 * Configuración FEL
 */
export interface FelConfig {
  certifier: FelCertifier;
  environment: 'production' | 'testing';
  issuer: {
    nit: string;
    name: string;
    address: string;
    municipality: string;
    department: string;
    country: string;
    email: string;
    phone: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  series: {
    default: string;
    ranges: Array<{
      series: string;
      min: number;
      max: number;
      current: number;
    }>;
  };
  taxes: {
    iva: number; // 0.12 para 12%
  };
}

/**
 * Configuración de certificador
 */
export interface FelCertifierConfig {
  certifier: FelCertifier;
  name: string;
  apiUrl: string;
  testApiUrl: string;
  supportedDocumentTypes: FelDocumentType[];
  maxRetries: number;
  timeoutSeconds: number;
  rateLimit: {
    requests: number;
    period: number; // en segundos
  };
}

// ====================================================================
// INTERFACES DE AUDITORÍA FEL
// ====================================================================

/**
 * Datos de auditoría FEL
 */
export interface FelAuditData {
  operationType: FelOperationType;
  result: 'success' | 'failure' | 'partial';
  userId?: number;
  invoiceId?: number;
  felDocumentId?: number;
  operationId: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  processingTime?: number;
  metadata?: any;
}

/**
 * Log de auditoría FEL
 */
export interface FelAuditLog {
  id: number;
  operationType: FelOperationType;
  result: 'success' | 'failure' | 'partial';
  userId?: number;
  invoiceId?: number;
  felDocumentId?: number;
  operationId: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  processingTime?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: Date;
}

// ====================================================================
// INTERFACES DE REQUEST/RESPONSE
// ====================================================================

/**
 * Request para generar factura FEL
 */
export interface GenerateFelInvoiceRequest {
  paymentId: number;
  eventId: number;
  userId: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  notes?: string;
}

/**
 * Response de generación de factura FEL
 */
export interface GenerateFelInvoiceResponse {
  invoiceId: number;
  invoiceNumber: string;
  status: FelInvoiceStatus;
  felDocumentId?: number;
  pdfUrl?: string;
  xmlUrl?: string;
  qrCode?: string;
  authorizationNumber?: string;
  message: string;
}

/**
 * Request para cancelar factura FEL
 */
export interface CancelFelInvoiceRequest {
  invoiceId: number;
  reason: string;
  cancelledBy: number;
}

/**
 * Request para reenviar factura FEL
 */
export interface ResendFelInvoiceRequest {
  invoiceId: number;
  email?: string;
  requestedBy: number;
}

// ====================================================================
// INTERFACES DE ESTADÍSTICAS Y REPORTES
// ====================================================================

/**
 * Estadísticas FEL
 */
export interface FelStats {
  totalInvoices: number;
  certifiedInvoices: number;
  failedInvoices: number;
  cancelledInvoices: number;
  totalAmount: number;
  totalTaxAmount: number;
  successRate: number;
  averageProcessingTime: number;
  byStatus: Record<FelInvoiceStatus, number>;
  byCertifier: Record<FelCertifier, number>;
  monthlyStats: Array<{
    month: string;
    invoices: number;
    amount: number;
    certified: number;
  }>;
}

/**
 * Reporte de cumplimiento FEL
 */
export interface FelComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: FelStats;
  issues: Array<{
    invoiceId: number;
    invoiceNumber: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: FelInvoiceStatus;
    createdAt: Date;
  }>;
  recommendations: string[];
  generatedAt: Date;
}

/**
 * Dashboard FEL
 */
export interface FelDashboard {
  todayStats: FelStats;
  weekStats: FelStats;
  monthStats: FelStats;
  recentInvoices: FelInvoice[];
  pendingInvoices: number;
  failedInvoices: number;
  alerts: FelAlert[];
  certifierStatus: Record<FelCertifier, {
    status: 'operational' | 'degraded' | 'down';
    lastCheck: Date;
    responseTime?: number;
  }>;
}

/**
 * Alerta FEL
 */
export interface FelAlert {
  id: string;
  type: 'certification_failed' | 'high_failure_rate' | 'certifier_down' | 'manual_review_required';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  invoiceId?: number;
  certifier?: FelCertifier;
  createdAt: Date;
  resolvedAt?: Date;
}

// ====================================================================
// INTERFACES DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de facturas FEL
 */
export interface FelInvoiceFilters {
  status?: FelInvoiceStatus[];
  certifier?: FelCertifier;
  eventId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  hasFelDocument?: boolean;
}

/**
 * Parámetros de consulta para facturas FEL
 */
export interface FelInvoiceQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'issuedAt' | 'total' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: FelInvoiceFilters;
}

/**
 * Resultado de búsqueda de facturas FEL
 */
export interface FelInvoiceSearchResult {
  invoices: FelInvoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: FelInvoiceFilters;
}

// ====================================================================
// INTERFACES DE EXPORTACIÓN
// ====================================================================

/**
 * Opciones de exportación FEL
 */
export interface FelExportOptions {
  format: 'pdf' | 'xml' | 'excel' | 'csv';
  includeXml: boolean;
  includePdf: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: FelInvoiceFilters;
}

/**
 * Resultado de exportación FEL
 */
export interface FelExportResult {
  fileUrl: string;
  fileName: string;
  recordCount: number;
  generatedAt: Date;
  expiresAt: Date;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Monedas soportadas para FEL
 */
export type FelCurrency = 'GTQ' | 'USD';

/**
 * Tipos de impuesto FEL
 */
export type FelTaxType = 'IVA' | 'PETROLEO' | 'TURISMO' | 'CEMENTO' | 'BEBIDAS' | 'TABACO';

/**
 * Estados de procesamiento FEL
 */
export type FelProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

/**
 * Niveles de severidad para logs
 */
export type FelLogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';