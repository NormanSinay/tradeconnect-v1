/**
 * @fileoverview Tipos TypeScript para el panel administrativo - Contratos de Speakers
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos para contratos y pagos de speakers en el panel administrativo
 */

// ====================================================================
// TIPOS BASE DE CONTRATOS
// ====================================================================

/**
 * Información básica de contrato
 */
export interface ContractInfo {
  id: number;
  contractNumber: string;
  speakerId: number;
  speakerName: string;
  eventId: number;
  eventTitle: string;
  agreedAmount: number;
  currency: SupportedCurrency;
  paymentTerms: PaymentTerms;
  advancePercentage?: number;
  advanceAmount?: number;
  status: ContractStatus;
  signedAt?: Date;
  createdBy: number;
  createdAt: Date;
}

/**
 * Información detallada de contrato
 */
export interface DetailedContractInfo extends ContractInfo {
  termsConditions?: string;
  customClauses?: string[];
  contractFile?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  templateId?: number;
  approvedBy?: number;
  approvedAt?: Date;
  updatedAt: Date;
  payments: PaymentInfo[];
  pendingAmount: number;
}

/**
 * Información de pago
 */
export interface PaymentInfo {
  id: number;
  paymentNumber: string;
  contractId: number;
  amount: number;
  currency: SupportedCurrency;
  paymentType: PaymentType;
  scheduledDate: Date;
  actualPaymentDate?: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  status: PaymentStatus;
  isrWithheld?: number;
  isrPercentage?: number;
  netAmount?: number;
  receiptFile?: string;
  notes?: string;
  processedBy?: number;
  processedAt?: Date;
  createdBy: number;
  createdAt: Date;
}

// ====================================================================
// TIPOS DE CREACIÓN Y ACTUALIZACIÓN
// ====================================================================

/**
 * Datos para crear un nuevo contrato
 */
export interface CreateContractData {
  speakerId: number;
  eventId: number;
  agreedAmount: number;
  currency?: SupportedCurrency;
  paymentTerms: PaymentTerms;
  advancePercentage?: number;
  termsConditions?: string;
  customClauses?: string[];
  templateId?: number;
}

/**
 * Datos para actualizar contrato
 */
export interface UpdateContractData extends Partial<Omit<CreateContractData, 'speakerId' | 'eventId'>> {
  status?: ContractStatus;
  signedAt?: Date;
  contractFile?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  approvedBy?: number;
  approvedAt?: Date;
}

/**
 * Datos para crear pago
 */
export interface CreatePaymentData {
  contractId: number;
  amount: number;
  currency?: SupportedCurrency;
  paymentType: PaymentType;
  scheduledDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

/**
 * Datos para actualizar pago
 */
export interface UpdatePaymentData extends Partial<Omit<CreatePaymentData, 'contractId'>> {
  status?: PaymentStatus;
  actualPaymentDate?: Date;
  processedBy?: number;
  processedAt?: Date;
}

// ====================================================================
// TIPOS DE RESPUESTA API
// ====================================================================

/**
 * Contrato en formato público
 */
export interface PublicContract {
  id: number;
  contractNumber: string;
  speakerId: number;
  speakerName: string;
  eventId: number;
  eventTitle: string;
  agreedAmount: number;
  currency: SupportedCurrency;
  paymentTerms: PaymentTerms;
  advancePercentage?: number;
  advanceAmount?: number;
  status: ContractStatus;
  signedAt?: Date;
  createdAt: Date;
}

/**
 * Contrato en formato detallado
 */
export interface DetailedContract extends PublicContract {
  termsConditions?: string;
  customClauses?: string[];
  contractFile?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  approvedBy?: number;
  approvedAt?: Date;
  payments: PublicPayment[];
  pendingAmount: number;
  updatedAt: Date;
}

/**
 * Pago en formato público
 */
export interface PublicPayment {
  id: number;
  paymentNumber: string;
  contractId: number;
  amount: number;
  currency: SupportedCurrency;
  paymentType: PaymentType;
  scheduledDate: Date;
  actualPaymentDate?: Date;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
}

/**
 * Pago en formato detallado
 */
export interface DetailedPayment extends PublicPayment {
  referenceNumber?: string;
  isrWithheld?: number;
  isrPercentage?: number;
  netAmount?: number;
  receiptFile?: string;
  notes?: string;
  processedBy?: number;
  processedAt?: Date;
  createdBy: number;
  updatedAt: Date;
}

// ====================================================================
// TIPOS DE CONSULTAS Y FILTROS
// ====================================================================

/**
 * Filtros para búsqueda de contratos
 */
export interface ContractFilters {
  speakerId?: number;
  eventId?: number;
  status?: ContractStatus[];
  paymentTerms?: PaymentTerms[];
  minAmount?: number;
  maxAmount?: number;
  signedFrom?: Date;
  signedTo?: Date;
  createdBy?: number;
  approvedBy?: number;
}

/**
 * Parámetros de consulta para contratos
 */
export interface ContractQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'contractNumber' | 'agreedAmount' | 'signedAt' | 'createdAt' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: ContractFilters;
}

/**
 * Resultado de búsqueda de contratos
 */
export interface ContractSearchResult {
  contracts: PublicContract[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: ContractFilters;
}

/**
 * Filtros para búsqueda de pagos
 */
export interface PaymentFilters {
  contractId?: number;
  speakerId?: number;
  status?: PaymentStatus[];
  paymentType?: PaymentType[];
  paymentMethod?: PaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
  scheduledFrom?: Date;
  scheduledTo?: Date;
  actualFrom?: Date;
  actualTo?: Date;
  processedBy?: number;
  createdBy?: number;
}

/**
 * Parámetros de consulta para pagos
 */
export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'paymentNumber' | 'amount' | 'scheduledDate' | 'actualPaymentDate' | 'status' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: PaymentFilters;
}

/**
 * Resultado de búsqueda de pagos
 */
export interface PaymentSearchResult {
  payments: PublicPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters?: PaymentFilters;
}

// ====================================================================
// TIPOS DE ESTADÍSTICAS Y REPORTES
// ====================================================================

/**
 * Estadísticas de contratos
 */
export interface ContractStats {
  totalContracts: number;
  signedContracts: number;
  pendingContracts: number;
  cancelledContracts: number;
  totalValue: number;
  averageValue: number;
  paymentTermsDistribution: Record<PaymentTerms, number>;
  monthlyContracts: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

/**
 * Estadísticas de pagos
 */
export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  rejectedPayments: number;
  totalAmount: number;
  totalISRWithheld: number;
  averagePaymentAmount: number;
  paymentMethodDistribution: Record<PaymentMethod, number>;
  paymentTypeDistribution: Record<PaymentType, number>;
  monthlyPayments: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}

/**
 * Reporte financiero de speaker
 */
export interface SpeakerFinancialReport {
  speakerId: number;
  speakerName: string;
  totalContracts: number;
  totalEarnings: number;
  totalPaid: number;
  pendingPayments: number;
  totalISRWithheld: number;
  contracts: Array<{
    contractNumber: string;
    eventTitle: string;
    agreedAmount: number;
    status: ContractStatus;
    signedAt?: Date;
    payments: PaymentInfo[];
  }>;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    payments: number;
  }>;
}

/**
 * Reporte de cumplimiento de contratos
 */
export interface ContractComplianceReport {
  contractId: number;
  contractNumber: string;
  speakerName: string;
  eventTitle: string;
  agreedAmount: number;
  paymentTerms: PaymentTerms;
  signedAt?: Date;
  expectedPayments: Array<{
    type: PaymentType;
    amount: number;
    scheduledDate: Date;
    status: 'on_time' | 'delayed' | 'completed' | 'pending';
  }>;
  actualPayments: PaymentInfo[];
  complianceStatus: 'compliant' | 'delayed' | 'breached';
  daysDelayed?: number;
  notes?: string;
}

// ====================================================================
// TIPOS UTILITARIOS
// ====================================================================

/**
 * Estados de contrato
 */
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'rejected' | 'cancelled';

/**
 * Términos de pago
 */
export type PaymentTerms = 'full_payment' | 'advance_payment' | 'installments';

/**
 * Estados de pago
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

/**
 * Tipos de pago
 */
export type PaymentType = 'advance' | 'final' | 'installment';

/**
 * Métodos de pago
 */
export type PaymentMethod = 'bank_transfer' | 'check' | 'cash' | 'paypal' | 'other';

/**
 * Monedas soportadas
 */
export type SupportedCurrency = 'GTQ' | 'USD';

/**
 * Estados de cumplimiento
 */
export type ComplianceStatus = 'compliant' | 'delayed' | 'breached';

/**
 * Tipos de reporte financiero
 */
export type FinancialReportType = 'speaker_summary' | 'contract_detail' | 'payment_history' | 'tax_report';

/**
 * Períodos de reporte
 */
export type ReportPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom';

/**
 * Formatos de exportación
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';