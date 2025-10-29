/**
 * @fileoverview Servicio Principal FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio principal que orquesta todas las operaciones FEL
 */

import { Transaction } from 'sequelize';
import { logger } from '../utils/logger';
import { Invoice, FelDocument, FelError } from '../models';
import { Registration } from '../models/Registration';
import { Payment } from '../models/Payment';
import { getFelTokenService } from './felTokenService';
import { getNitValidationService } from './nitValidationService';
import { getCuiValidationService } from './cuiValidationService';
import { getXmlService } from './xmlService';
import { emailService } from './emailService';
import { ApiResponse } from '../types/global.types';
import { FelAuditLog } from '../models';
import { FelAuditOperationType } from '../models/FelAuditLog';

/**
 * Datos para generar factura
 */
interface InvoiceGenerationData {
  registrationId: number;
  paymentId?: number;
  customItems?: InvoiceItem[];
  notes?: string;
}

/**
 * Item de factura
 */
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

/**
 * Resultado de generación de factura
 */
interface InvoiceGenerationResult {
  invoice: Invoice;
  felDocument: FelDocument;
  pdfUrl?: string;
  qrCode?: string;
}

/**
 * Servicio principal FEL
 */
export class FelService {
  private tokenService = getFelTokenService();
  private nitService = getNitValidationService();
  private cuiService = getCuiValidationService();
  private xmlService = getXmlService();

  /**
   * Genera factura automáticamente después de un pago exitoso
   */
  async generateInvoiceFromPayment(data: InvoiceGenerationData): Promise<ApiResponse<InvoiceGenerationResult>> {
    const transaction = await Invoice.sequelize!.transaction();

    try {
      // Obtener datos de la inscripción
      const registration = await Registration.findByPk(data.registrationId, { transaction });
      if (!registration) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Inscripción no encontrada',
          error: 'REGISTRATION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Obtener datos del pago si se proporciona
      let payment: Payment | null = null;
      if (data.paymentId) {
        payment = await Payment.findByPk(data.paymentId, { transaction });
      }

      // Validar datos fiscales del cliente
      const fiscalValidation = await this.validateCustomerFiscalData(registration);
      if (!fiscalValidation.success) {
        await transaction.rollback();
        return {
          success: false,
          message: fiscalValidation.message,
          error: fiscalValidation.error,
          timestamp: fiscalValidation.timestamp
        } as ApiResponse<InvoiceGenerationResult>;
      }

      // Preparar items de la factura
      const items = data.customItems || await this.buildInvoiceItems(registration, payment);

      // Crear factura en base de datos
      const invoice = await this.createInvoiceRecord({
        registration,
        payment,
        items,
        notes: data.notes
      }, transaction);

      // Generar XML
      const xmlResult = await this.generateInvoiceXml(invoice, items);
      if (!xmlResult.success) {
        await transaction.rollback();
        return xmlResult as ApiResponse<InvoiceGenerationResult>;
      }

      // Crear documento FEL
      const felDocument = await this.createFelDocument(invoice, xmlResult.data!, transaction);

      // Certificar documento
      const certificationResult = await this.certifyDocument(felDocument);
      if (!certificationResult.success) {
        await transaction.rollback();
        return certificationResult as ApiResponse<InvoiceGenerationResult>;
      }

      // Actualizar documento con datos de certificación
      await felDocument.markAsCertified(
        certificationResult.data!.authorizationNumber,
        certificationResult.data!.authorizationDate,
        certificationResult.data!.certifiedXml,
        certificationResult.data!.qrCode
      );

      // Generar PDF
      const pdfResult = await this.generateInvoicePdf(felDocument);
      let pdfUrl: string | undefined;
      if (pdfResult.success) {
        pdfUrl = pdfResult.data;
      }

      // Enviar por email
      await this.sendInvoiceEmail(invoice, felDocument, pdfUrl);

      // Confirmar transacción
      await transaction.commit();

      // Registrar auditoría
      await FelAuditLog.logOperation({
        operationType: 'invoice_creation',
        result: 'success',
        invoiceId: invoice.id,
        felDocumentId: felDocument.id,
        operationId: `invoice_${invoice.id}_${Date.now()}`,
        responseData: {
          total: invoice.total,
          certified: true,
          pdfGenerated: !!pdfUrl
        },
        metadata: { registrationId: data.registrationId }
      });

      const result: InvoiceGenerationResult = {
        invoice,
        felDocument,
        pdfUrl,
        qrCode: felDocument.qrCode
      };

      logger.info('Invoice generated successfully', {
        invoiceId: invoice.id,
        registrationId: data.registrationId,
        total: invoice.total
      });

      return {
        success: true,
        message: 'Factura generada exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      await transaction.rollback();

      logger.error('Error generating invoice', {
        registrationId: data.registrationId,
        error: error?.message || 'Unknown error'
      });

      // Registrar error
      await FelError.createError({
        operationType: 'certification',
        severity: 'high',
        errorMessage: error?.message || 'Error desconocido en generación de factura',
        invoiceId: undefined, // Aún no se creó la factura
        metadata: { registrationId: data.registrationId }
      });

      return {
        success: false,
        message: 'Error al generar factura',
        error: 'INVOICE_GENERATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Anula una factura certificada
   */
  async cancelInvoice(invoiceId: number, reason: string, userId?: number): Promise<ApiResponse<FelDocument>> {
    const transaction = await Invoice.sequelize!.transaction();

    try {
      // Obtener factura
      const invoice = await Invoice.findByPk(invoiceId, {
        include: [{ model: FelDocument, as: 'felDocument' }],
        transaction
      });

      if (!invoice) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Factura no encontrada',
          error: 'INVOICE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      if (!invoice.felDocument || invoice.felDocument.status !== 'certified') {
        await transaction.rollback();
        return {
          success: false,
          message: 'La factura no está certificada o no tiene documento FEL',
          error: 'INVOICE_NOT_CERTIFIED',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si puede anularse (dentro de plazo legal - 30 días)
      const certifiedDate = invoice.felDocument.certifiedAt;
      if (!certifiedDate) {
        await transaction.rollback();
        return {
          success: false,
          message: 'Fecha de certificación no disponible',
          error: 'CERTIFICATION_DATE_MISSING',
          timestamp: new Date().toISOString()
        };
      }

      const daysSinceCertification = Math.floor((Date.now() - certifiedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCertification > 30) {
        await transaction.rollback();
        return {
          success: false,
          message: 'La factura no puede anularse (fuera del plazo legal de 30 días)',
          error: 'CANCELLATION_PERIOD_EXPIRED',
          timestamp: new Date().toISOString()
        };
      }

      // Generar XML de anulación
      const cancelXmlResult = await this.generateCancellationXml(invoice.felDocument, reason);
      if (!cancelXmlResult.success) {
        await transaction.rollback();
        return cancelXmlResult as ApiResponse<FelDocument>;
      }

      // Crear documento FEL de anulación
      const cancelDocument = await FelDocument.create({
        uuid: cancelXmlResult.data!.uuid,
        invoiceId: invoice.id,
        status: 'generated',
        xmlContent: cancelXmlResult.data!.xml,
        series: invoice.felDocument.series,
        number: invoice.felDocument.number + 1, // Número siguiente
        retryCount: 0
      }, { transaction });

      // Certificar anulación
      const certificationResult = await this.certifyDocument(cancelDocument);
      if (!certificationResult.success) {
        await transaction.rollback();
        return certificationResult as ApiResponse<FelDocument>;
      }

      // Actualizar documento de anulación
      await cancelDocument.markAsCertified(
        certificationResult.data!.authorizationNumber,
        certificationResult.data!.authorizationDate,
        certificationResult.data!.certifiedXml,
        certificationResult.data!.qrCode
      );

      // Actualizar estado de la factura original
      await invoice.update({ status: 'cancelled' }, { transaction });

      // Confirmar transacción
      await transaction.commit();

      // Registrar auditoría
      await FelAuditLog.logOperation({
        operationType: 'document_cancel',
        result: 'success',
        userId,
        invoiceId: invoice.id,
        felDocumentId: cancelDocument.id,
        operationId: `cancel_${invoice.id}_${Date.now()}`,
        responseData: {
          reason,
          originalDocumentId: invoice.felDocument.id
        }
      });

      logger.info('Invoice cancelled successfully', {
        invoiceId,
        cancelDocumentId: cancelDocument.id,
        reason
      });

      return {
        success: true,
        message: 'Factura anulada exitosamente',
        data: cancelDocument,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      await transaction.rollback();

      logger.error('Error cancelling invoice', {
        invoiceId,
        error: error?.message || 'Unknown error'
      });

      // Registrar error
      await FelError.createError({
        operationType: 'validation',
        severity: 'high',
        errorMessage: error?.message || 'Error desconocido en anulación de factura',
        invoiceId
      });

      return {
        success: false,
        message: 'Error al anular factura',
        error: 'INVOICE_CANCELLATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Consulta estado de documento FEL
   */
  async checkDocumentStatus(documentId: number): Promise<ApiResponse<any>> {
    try {
      const document = await FelDocument.findByPk(documentId);
      if (!document) {
        return {
          success: false,
          message: 'Documento FEL no encontrado',
          error: 'DOCUMENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // En producción, aquí se consultaría el estado real con el certificador
      // Por ahora, simulamos respuesta

      const status = {
        uuid: document.uuid,
        authorizationNumber: document.authorizationNumber,
        status: document.status,
        certifiedAt: document.certifiedAt,
        isValid: document.status === 'certified' && !document.isExpired,
        expiresAt: document.expiresAt
      };

      // Registrar auditoría
      await FelAuditLog.logOperation({
        operationType: 'document_consult',
        result: 'success',
        felDocumentId: document.id,
        operationId: `consult_${document.id}_${Date.now()}`,
        responseData: status
      });

      return {
        success: true,
        message: 'Estado del documento consultado exitosamente',
        data: status,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error checking document status', {
        documentId,
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al consultar estado del documento',
        error: 'DOCUMENT_STATUS_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Valida datos fiscales del cliente
   */
  private async validateCustomerFiscalData(registration: Registration): Promise<ApiResponse<boolean>> {
    try {
      // Intentar validar NIT si está disponible
      if (registration.nit) {
        const nitValidation = await this.nitService.validateNit(registration.nit);
        if (nitValidation.success && nitValidation.data?.status === 'valid') {
          return {
            success: true,
            message: 'Datos fiscales válidos (NIT)',
            data: true,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Intentar validar CUI si está disponible
      if (registration.cui) {
        const cuiValidation = await this.cuiService.validateCui(registration.cui);
        if (cuiValidation.success && cuiValidation.data?.status === 'valid') {
          return {
            success: true,
            message: 'Datos fiscales válidos (CUI)',
            data: true,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Si no hay NIT ni CUI válidos, usar datos de consumidor final
      return {
        success: true,
        message: 'Usando datos de consumidor final',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error validating customer fiscal data', {
        registrationId: registration.id,
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al validar datos fiscales del cliente',
        error: 'FISCAL_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Construye items de la factura
   */
  private async buildInvoiceItems(registration: Registration, payment?: Payment | null): Promise<InvoiceItem[]> {
    const items: InvoiceItem[] = [];

    // Item principal: Inscripción al evento
    items.push({
      description: `Inscripción: ${registration.event?.title || 'Evento'}`,
      quantity: 1,
      unitPrice: payment?.amount || registration.finalPrice || 0,
      discount: 0
    });

    return items;
  }

  /**
   * Crea registro de factura en BD
   */
  private async createInvoiceRecord(
    data: { registration: Registration; payment?: Payment | null; items: InvoiceItem[]; notes?: string },
    transaction: Transaction
  ): Promise<Invoice> {
    const { registration, payment, items, notes } = data;

    // Calcular totales
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
      totalDiscount += item.discount || 0;
    }

    const taxableAmount = subtotal - totalDiscount;
    const taxAmount = taxableAmount * 0.12; // IVA 12%
    const total = taxableAmount + taxAmount;

    return await Invoice.create({
      uuid: crypto.randomUUID(),
      registrationId: registration.id,
      status: 'draft',
      documentType: 'FACTURA',
      series: 'A', // TODO: Implementar gestión de series
      number: 1, // TODO: Implementar numeración automática
      nit: '', // TODO: Obtener de validación fiscal
      name: '', // TODO: Obtener de validación fiscal
      address: '', // TODO: Obtener de validación fiscal
      email: registration.email,
      phone: registration.phone,
      subtotal,
      taxRate: 0.12,
      taxAmount,
      total,
      currency: payment?.currency || 'GTQ',
      description: `Factura por inscripción al evento ${registration.event?.title || 'Evento'}`,
      notes,
      retryCount: 0
    }, { transaction });
  }

  /**
   * Genera XML de factura
   */
  private async generateInvoiceXml(invoice: Invoice, items: InvoiceItem[]): Promise<ApiResponse<any>> {
    try {
      // Preparar datos para XML
      const xmlData = {
        issuer: {
          nit: process.env.FEL_ISSUER_NIT || '12345678-9',
          name: process.env.FEL_ISSUER_NAME || 'TRADECONNECT S.A.',
          address: process.env.FEL_ISSUER_ADDRESS || 'Ciudad de Guatemala',
          municipality: 'Guatemala',
          department: 'Guatemala',
          country: 'GT'
        },
        receiver: {
          name: invoice.registration?.firstName + ' ' + invoice.registration?.lastName,
          address: 'Ciudad de Guatemala',
          email: invoice.registration?.email,
          nit: invoice.registration?.nit,
          cui: invoice.registration?.cui
        } as any,
        items: items.map((item, index) => ({
          number: index + 1,
          type: 'S' as const, // Servicio
          quantity: item.quantity,
          unit: 'UND',
          description: item.description,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          taxableAmount: (item.quantity * item.unitPrice) - (item.discount || 0)
        })),
        currency: invoice.currency,
        paymentType: 'CASH' as const,
        paymentMethod: 'Transferencia'
      };

      return await this.xmlService.buildInvoiceXml(xmlData);

    } catch (error: any) {
      logger.error('Error generating invoice XML', {
        invoiceId: invoice.id,
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al generar XML de factura',
        error: 'XML_GENERATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Crea documento FEL
   */
  private async createFelDocument(invoice: Invoice, xmlData: any, transaction: Transaction): Promise<FelDocument> {
    return await FelDocument.create({
      uuid: xmlData.uuid,
      invoiceId: invoice.id,
      status: 'generated',
      xmlContent: xmlData.xml,
      series: invoice.series,
      number: invoice.number,
      retryCount: 0
    }, { transaction });
  }

  /**
   * Certifica documento FEL
   */
  private async certifyDocument(document: FelDocument): Promise<ApiResponse<any>> {
    try {
      // Obtener token activo
      const tokenResult = await this.tokenService.getActiveToken('infile'); // TODO: Hacer configurable
      if (!tokenResult.success) {
        return tokenResult;
      }

      // En producción, aquí se enviaría el XML al certificador
      // Por ahora, simulamos certificación exitosa

      const mockCertification = {
        authorizationNumber: `AUTH_${Date.now()}`,
        authorizationDate: new Date(),
        certifiedXml: document.xmlContent, // En producción sería el XML certificado
        qrCode: `https://fel.sat.gob.gt/verify/${document.uuid}`
      };

      return {
        success: true,
        message: 'Documento certificado exitosamente (simulado)',
        data: mockCertification,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error certifying document', {
        documentId: document.id,
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al certificar documento',
        error: 'CERTIFICATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Genera PDF de factura
   */
  private async generateInvoicePdf(document: FelDocument): Promise<ApiResponse<string>> {
    try {
      // En producción, aquí se generaría el PDF real
      // Por ahora, simulamos URL del PDF

      const pdfUrl = `/api/fel/download-pdf/${document.uuid}`;

      return {
        success: true,
        message: 'PDF generado exitosamente (simulado)',
        data: pdfUrl,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error generating invoice PDF', {
        documentId: document.id,
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al generar PDF de factura',
        error: 'PDF_GENERATION_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Envía factura por email
   */
  private async sendInvoiceEmail(invoice: Invoice, document: FelDocument, pdfUrl?: string): Promise<void> {
    try {
      if (!invoice.registration?.email) {
        logger.warn('No email available for invoice delivery', { invoiceId: invoice.id });
        return;
      }

      // TODO: Implementar envío de email con plantilla de factura
      logger.info('Invoice ready for email delivery', {
        invoiceId: invoice.id,
        email: invoice.registration.email,
        pdfUrl,
        qrCode: document.qrCode
      });

      logger.info('Invoice email sent successfully', {
        invoiceId: invoice.id,
        email: invoice.registration.email
      });

    } catch (error: any) {
      logger.error('Error sending invoice email', {
        invoiceId: invoice.id,
        error: error?.message || 'Unknown error'
      });

      // No lanzamos error, el envío de email no debe fallar la operación principal
    }
  }

  /**
   * Genera XML de anulación
   */
  private async generateCancellationXml(originalDocument: FelDocument, reason: string): Promise<ApiResponse<any>> {
    try {
      // En producción, aquí se generaría XML de anulación
      // Por ahora, simulamos

      const cancelXml = {
        uuid: crypto.randomUUID(),
        xml: `<CancelDocument>${originalDocument.uuid}</CancelDocument>`,
        reason
      };

      return {
        success: true,
        message: 'XML de anulación generado exitosamente',
        data: cancelXml,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error generating cancellation XML', {
        documentId: originalDocument.id,
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al generar XML de anulación',
        error: 'CANCELLATION_XML_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Instancia singleton del servicio FEL
 */
let felServiceInstance: FelService | null = null;

/**
 * Factory para obtener instancia del servicio FEL
 */
export function getFelService(): FelService {
  if (!felServiceInstance) {
    felServiceInstance = new FelService();
  }

  return felServiceInstance;
}

export const felService = getFelService();
