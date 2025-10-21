/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Certificación Automática
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para certificados, templates y validaciones en el panel administrativo
 */

// ====================================================================
// ENUMERACIONES
// ====================================================================

/**
 * Tipos de certificado disponibles
 */
export enum CertificateType {
  ATTENDANCE = 'attendance',
  COMPLETION = 'completion',
  ACHIEVEMENT = 'achievement'
}

/**
 * Estados posibles de un certificado
 */
export enum CertificateStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

/**
 * Métodos de validación de certificados
 */
export enum CertificateValidationMethod {
  QR_SCAN = 'qr_scan',
  NUMBER_LOOKUP = 'number_lookup',
  HASH_LOOKUP = 'hash_lookup'
}

// ====================================================================
// INTERFACES DE DATOS
// ====================================================================

/**
 * Datos del participante en un certificado
 */
export interface CertificateParticipantData {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  cui?: string;
  dpi?: string;
  phone?: string;
  organization?: string;
  position?: string;
}

/**
 * Datos del evento en un certificado
 */
export interface CertificateEventData {
  id: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  durationHours?: number;
  location?: string;
  organizer?: string;
  eventType?: string;
  category?: string;
}

/**
 * Datos adicionales del certificado
 */
export interface CertificateData {
  certificateNumber: string;
  issuedAt: Date;
  expiresAt?: Date;
  customFields?: Record<string, any>;
}

/**
 * Información de blockchain del certificado
 */
export interface CertificateBlockchainData {
  txHash?: string;
  blockNumber?: number;
  network: string;
  contractAddress?: string;
  gasUsed?: number;
  gasPrice?: string;
  totalCost?: string;
  confirmations: number;
  verified: boolean;
}

/**
 * Criterios de elegibilidad cumplidos
 */
export interface CertificateEligibilityCriteria {
  attendancePercentage?: number;
  requiredAttendancePercentage?: number;
  sessionsAttended?: number;
  totalSessions?: number;
  evaluationScore?: number;
  requiredEvaluationScore?: number;
  additionalCriteria?: Record<string, any>;
}

// ====================================================================
// INTERFACES DE MODELOS
// ====================================================================

/**
 * Atributos del modelo CertificateTemplate
 */
export interface CertificateTemplateAttributes {
  id: string;
  name: string;
  eventTypes: string[];
  active: boolean;
  version: string;
  htmlTemplate: string;
  cssStyles?: string;
  requiredVariables: string[];
  configuration?: CertificateTemplateConfiguration;
  logoUrl?: string;
  signatureUrl?: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  createdBy?: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Configuración del template de certificado
 */
export interface CertificateTemplateConfiguration {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'Letter';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  fonts?: {
    primary: string;
    secondary?: string;
  };
  qrCode?: {
    size: number;
    position: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  };
}

/**
 * Atributos del modelo Certificate
 */
export interface CertificateAttributes {
  id: string;
  certificateNumber: string;
  eventId: number;
  userId: number;
  registrationId: number;
  templateId: string;
  certificateType: CertificateType;
  status: CertificateStatus;
  issuedAt: Date;
  expiresAt?: Date;
  pdfHash: string;
  pdfUrl?: string;
  pdfSizeBytes?: number;
  qrCode?: string;
  qrHash?: string;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  blockchainNetwork: string;
  blockchainContractAddress?: string;
  blockchainGasUsed?: number;
  blockchainGasPrice?: string;
  blockchainTotalCost?: string;
  blockchainConfirmations: number;
  participantData: CertificateParticipantData;
  eventData: CertificateEventData;
  certificateData?: CertificateData;
  eligibilityCriteria?: CertificateEligibilityCriteria;
  revokedAt?: Date;
  revokedBy?: number;
  revocationReason?: string;
  downloadCount: number;
  lastDownloadedAt?: Date;
  verificationCount: number;
  lastVerifiedAt?: Date;
  emailSent: boolean;
  emailSentAt?: Date;
  emailResendCount: number;
  createdBy?: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Atributos del modelo CertificateValidationLog
 */
export interface CertificateValidationLogAttributes {
  id: string;
  certificateId: string;
  certificateNumber: string;
  validationMethod: CertificateValidationMethod;
  isValid: boolean;
  validationResult?: CertificateValidationResult;
  ipAddress?: string;
  userAgent?: string;
  location?: any;
  deviceInfo?: any;
  captchaVerified: boolean;
  rateLimitHit: boolean;
  responseTimeMs?: number;
  errorMessage?: string;
  blockchainVerified?: boolean;
  blockchainConfirmations?: number;
  createdAt: Date;
}

/**
 * Resultado de validación de certificado
 */
export interface CertificateValidationResult {
  certificate?: {
    id: string;
    number: string;
    type: CertificateType;
    status: CertificateStatus;
    issuedAt: Date;
    expiresAt?: Date;
  };
  participant?: {
    name: string;
    email: string;
    cui?: string;
  };
  event?: {
    title: string;
    startDate: Date;
    endDate: Date;
    organizer?: string;
  };
  blockchain?: CertificateBlockchainData;
  verificationUrl?: string;
  warnings?: string[];
  errors?: string[];
}

// ====================================================================
// INTERFACES DE REQUEST/RESPONSE
// ====================================================================

/**
 * Request para generar un certificado
 */
export interface GenerateCertificateRequest {
  eventId: number;
  userId: number;
  registrationId: number;
  templateId?: string;
  certificateType?: CertificateType;
  customData?: Record<string, any>;
}

/**
 * Request para generar certificados masivos
 */
export interface GenerateBulkCertificatesRequest {
  eventId: number;
  userIds?: number[];
  templateId?: string;
  certificateType?: CertificateType;
  eligibilityCriteria?: CertificateEligibilityCriteria;
}

/**
 * Request para verificar un certificado
 */
export interface VerifyCertificateRequest {
  certificateNumber?: string;
  hash?: string;
  qrData?: string;
  method: CertificateValidationMethod;
  captchaToken?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: any;
  deviceInfo?: any;
}

/**
 * Response de verificación de certificado
 */
export interface VerifyCertificateResponse {
  success: boolean;
  isValid: boolean;
  certificate?: CertificateAttributes;
  validationResult?: CertificateValidationResult;
  error?: string;
  message: string;
  timestamp: string;
}

/**
 * Request para revocar un certificado
 */
export interface RevokeCertificateRequest {
  certificateId: string;
  reason: string;
  revokedBy: number;
}

/**
 * Request para reenvío de certificado
 */
export interface ResendCertificateRequest {
  certificateId: string;
  email?: string;
  requestedBy: number;
}

/**
 * Estadísticas de certificados
 */
export interface CertificateStats {
  totalCertificates: number;
  certificatesThisMonth: number;
  certificatesByType: Record<CertificateType, number>;
  certificatesByStatus: Record<CertificateStatus, number>;
  topEvents: Array<{
    eventId: number;
    eventTitle: string;
    certificateCount: number;
  }>;
  blockchainStats: {
    totalRegistered: number;
    confirmedCertificates: number;
    averageConfirmations: number;
    totalGasCost: string;
  };
  verificationStats: {
    totalVerifications: number;
    successfulVerifications: number;
    averageResponseTime: number;
  };
}

// ====================================================================
// INTERFACES DE CONFIGURACIÓN
// ====================================================================

/**
 * Configuración del motor de PDFs
 */
export interface PDFEngineConfig {
  defaultOrientation: 'portrait' | 'landscape';
  defaultPageSize: 'A4' | 'A3' | 'Letter';
  defaultMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  maxFileSizeMB: number;
  quality: 'low' | 'medium' | 'high';
  compressionLevel: number;
  fonts: {
    primary: string;
    secondary?: string;
    custom?: Array<{
      name: string;
      path: string;
    }>;
  };
}

/**
 * Configuración de blockchain para certificados
 */
export interface CertificateBlockchainConfig {
  enabled: boolean;
  network: string;
  contractAddress?: string;
  requiredConfirmations: number;
  maxRetries: number;
  timeoutSeconds: number;
  gasLimit: number;
  maxGasPriceGwei: number;
}

/**
 * Configuración de verificación pública
 */
export interface CertificateVerificationConfig {
  rateLimitRequests: number;
  rateLimitWindowMinutes: number;
  requireCaptcha: boolean;
  captchaSecret?: string;
  maxResponseTimeMs: number;
  cacheTTLSconds: number;
  exposeFullDPI: boolean;
  exposeFullCUI: boolean;
}

/**
 * Configuración completa del módulo de certificados
 */
export interface CertificateModuleConfig {
  pdf: PDFEngineConfig;
  blockchain: CertificateBlockchainConfig;
  verification: CertificateVerificationConfig;
  email: {
    enabled: boolean;
    maxResendCount: number;
    resendCooldownHours: number;
  };
  storage: {
    provider: 'local' | 's3' | 'cloudinary';
    retentionDays: number;
    cdnUrl?: string;
  };
  templates: {
    defaultTemplateId?: string;
    maxTemplateSizeKB: number;
    allowedFileTypes: string[];
  };
}

// ====================================================================
// PDF SERVICE TYPES
// ====================================================================

export interface PDFGenerationOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
  width?: string | number;
  height?: string | number;
  scale?: number;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  pageRanges?: string;
}

export interface PDFTemplateData {
  html: string;
  css?: string;
  variables: Record<string, any>;
  options?: PDFGenerationOptions;
}

export interface PDFGenerationResult {
  buffer: Buffer;
  hash: string;
  size: number;
  pages: number;
  metadata: {
    format: string;
    orientation: string;
    generatedAt: Date;
    generator: string;
  };
}

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
  logo?: {
    url?: string;
    width?: number;
    height?: number;
  };
}

export interface QRCodeResult {
  dataURL: string;
  hash: string;
  size: number;
}