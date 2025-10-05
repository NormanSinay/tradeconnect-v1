/**
 * @fileoverview Tests unitarios para FelService
 * @version 1.0.0
 * @author TradeConnect Team
 */

import { FelService, getFelService } from '../../backend/src/services/felService';
import { Invoice } from '../../backend/src/models/Invoice';
import { FelDocument } from '../../backend/src/models/FelDocument';
import { Registration } from '../../backend/src/models/Registration';
import { Payment } from '../../backend/src/models/Payment';

describe('FelService', () => {
  let felService: FelService;

  beforeAll(() => {
    felService = getFelService();
  });

  describe('generateInvoiceFromPayment', () => {
    it('should generate invoice successfully', async () => {
      // Mock data
      const mockRegistration = {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        nit: '12345678-9',
        cui: '1234567890123'
      } as Registration;

      const mockPayment = {
        id: 1,
        amount: 100,
        currency: 'GTQ',
        registrationId: 1
      } as Payment;

      // Mock Invoice.create
      const mockInvoice = {
        id: 1,
        uuid: 'test-uuid',
        total: 112, // 100 + 12% IVA
        status: 'draft'
      } as Invoice;

      jest.spyOn(Invoice, 'create').mockResolvedValue(mockInvoice);

      // Mock FelDocument.create
      const mockFelDocument = {
        id: 1,
        uuid: 'doc-uuid',
        status: 'generated'
      } as FelDocument;

      jest.spyOn(FelDocument, 'create').mockResolvedValue(mockFelDocument);

      const result = await felService.generateInvoiceFromPayment({
        registrationId: 1,
        paymentId: 1
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.invoice).toEqual(mockInvoice);
      expect(result.data?.felDocument).toEqual(mockFelDocument);
    });

    it('should handle registration not found', async () => {
      // Mock Registration.findByPk to return null
      jest.spyOn(Registration, 'findByPk').mockResolvedValue(null);

      const result = await felService.generateInvoiceFromPayment({
        registrationId: 999
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('REGISTRATION_NOT_FOUND');
    });
  });

  describe('cancelInvoice', () => {
    it('should cancel invoice successfully', async () => {
      const mockInvoice = {
        id: 1,
        status: 'certified',
        felDocument: {
          id: 1,
          uuid: 'doc-uuid',
          status: 'certified',
          certifiedAt: new Date(),
          series: 'A',
          number: 1
        }
      } as Invoice;

      const mockCancelDocument = {
        id: 2,
        uuid: 'cancel-uuid',
        status: 'certified'
      } as FelDocument;

      jest.spyOn(Invoice, 'findByPk').mockResolvedValue(mockInvoice);
      jest.spyOn(FelDocument, 'create').mockResolvedValue(mockCancelDocument);

      const result = await felService.cancelInvoice(1, 'Cliente solicitó cancelación');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCancelDocument);
    });

    it('should handle invoice not found', async () => {
      jest.spyOn(Invoice, 'findByPk').mockResolvedValue(null);

      const result = await felService.cancelInvoice(999, 'Test reason');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVOICE_NOT_FOUND');
    });
  });

  describe('checkDocumentStatus', () => {
    it('should return document status', async () => {
      const mockDocument = {
        id: 1,
        uuid: 'doc-uuid',
        authorizationNumber: 'AUTH123',
        status: 'certified',
        certifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      } as FelDocument;

      jest.spyOn(FelDocument, 'findByPk').mockResolvedValue(mockDocument);

      const result = await felService.checkDocumentStatus(1);

      expect(result.success).toBe(true);
      expect(result.data?.uuid).toBe('doc-uuid');
      expect(result.data?.isValid).toBe(true);
    });

    it('should handle document not found', async () => {
      jest.spyOn(FelDocument, 'findByPk').mockResolvedValue(null);

      const result = await felService.checkDocumentStatus(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('DOCUMENT_NOT_FOUND');
    });
  });

});