/**
 * @fileoverview Tipos y interfaces para el módulo FEL
 * @version 1.0.0
 * @author TradeConnect Team
 */

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