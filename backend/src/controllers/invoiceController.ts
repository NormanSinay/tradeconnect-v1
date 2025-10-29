/**
 * @fileoverview Controlador de Facturas FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controlador para gestión de facturas FEL
 */

import { Request, Response } from 'express';
import { Invoice } from '../models';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';

/**
 * Controlador de facturas
 */
export class InvoiceController {
  /**
   * Obtiene todas las facturas con filtros opcionales
   */
  async getInvoices(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        documentType,
        startDate,
        endDate,
        search
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Construir filtros
      const where: any = {};

      if (status) where.status = status;
      if (documentType) where.documentType = documentType;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = new Date(startDate as string);
        if (endDate) where.createdAt.$lte = new Date(endDate as string);
      }
      if (search) {
        where.$or = [
          { nit: { $iLike: `%${search}%` } },
          { name: { $iLike: `%${search}%` } },
          { series: { $iLike: `%${search}%` } },
          { authorizationNumber: { $iLike: `%${search}%` } }
        ];
      }

      const { rows: invoices, count } = await Invoice.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: ['registration', 'felDocument']
      });

      const result: ApiResponse<any> = {
        success: true,
        message: 'Facturas obtenidas exitosamente',
        data: {
          invoices: invoices.map(inv => inv.toInvoiceJSON()),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count,
            pages: Math.ceil(count / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error getting invoices', {
        error: error?.message || 'Unknown error',
        filters: req.query
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al obtener facturas',
        error: 'GET_INVOICES_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtiene una factura por ID
   */
  async getInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findByPk(id, {
        include: ['registration', 'felDocument']
      });

      if (!invoice) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Factura no encontrada',
          error: 'INVOICE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const result: ApiResponse<any> = {
        success: true,
        message: 'Factura obtenida exitosamente',
        data: invoice.toInvoiceJSON(),
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error getting invoice by ID', {
        id: req.params.id,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al obtener factura',
        error: 'GET_INVOICE_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtiene facturas por ID de registro
   */
  async getInvoicesByRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { regId } = req.params;

      const invoices = await Invoice.findAll({
        where: { registrationId: regId },
        include: ['felDocument'],
        order: [['createdAt', 'DESC']]
      });

      const result: ApiResponse<any> = {
        success: true,
        message: 'Facturas del registro obtenidas exitosamente',
        data: invoices.map(inv => inv.toInvoiceJSON()),
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error getting invoices by registration', {
        registrationId: req.params.regId,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al obtener facturas del registro',
        error: 'GET_INVOICES_BY_REGISTRATION_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Genera una nueva factura
   */
  async generateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { registrationId, customItems, notes } = req.body;

      // TODO: Implementar generación de factura
      const result: ApiResponse<any> = {
        success: true,
        message: 'Factura generada exitosamente (simulado)',
        data: {
          id: 'inv_123456',
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          status: 'draft',
          total: 100.00
        },
        timestamp: new Date().toISOString()
      };

      res.status(201).json(result);
    } catch (error: any) {
      logger.error('Error generating invoice', {
        registrationId: req.body.registrationId,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al generar factura',
        error: 'GENERATE_INVOICE_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Actualiza el estado de una factura
   */
  async updateInvoiceStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Factura no encontrada',
          error: 'INVOICE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      // Actualizar estado
      await invoice.update({ status });

      // Agregar notas si se proporcionan
      if (notes) {
        await invoice.update({ notes });
      }

      const result: ApiResponse<any> = {
        success: true,
        message: 'Estado de factura actualizado exitosamente',
        data: invoice.toInvoiceJSON(),
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error updating invoice status', {
        id: req.params.id,
        status: req.body.status,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al actualizar estado de factura',
        error: 'UPDATE_INVOICE_STATUS_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtiene estadísticas de facturación
   */
  async getInvoiceStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const stats = await Invoice.getInvoiceStats(start, end);

      const result: ApiResponse<any> = {
        success: true,
        message: 'Estadísticas de facturación obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error getting invoice stats', {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al obtener estadísticas de facturación',
        error: 'GET_INVOICE_STATS_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Descarga PDF de factura
   */
  async downloadPdf(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Factura no encontrada',
          error: 'INVOICE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      if (!invoice.pdfUrl) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'PDF no disponible para esta factura',
          error: 'PDF_NOT_AVAILABLE',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      // TODO: Implementar descarga real del PDF
      const result: ApiResponse<any> = {
        success: true,
        message: 'PDF de factura disponible',
        data: {
          downloadUrl: invoice.pdfUrl,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error downloading invoice PDF', {
        id: req.params.id,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al descargar PDF de factura',
        error: 'DOWNLOAD_PDF_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Descarga XML de factura
   */
  async downloadXml(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findByPk(id);
      if (!invoice) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'Factura no encontrada',
          error: 'INVOICE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      if (!invoice.xmlUrl) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'XML no disponible para esta factura',
          error: 'XML_NOT_AVAILABLE',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      // TODO: Implementar descarga real del XML
      const result: ApiResponse<any> = {
        success: true,
        message: 'XML de factura disponible',
        data: {
          downloadUrl: invoice.xmlUrl,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error downloading invoice XML', {
        id: req.params.id,
        error: error?.message || 'Unknown error'
      });

      const response: ApiResponse<null> = {
        success: false,
        message: 'Error al descargar XML de factura',
        error: 'DOWNLOAD_XML_ERROR',
        timestamp: new Date().toISOString()
      };

      res.status(500).json(response);
    }
  }
}

/**
 * Instancia singleton del controlador de facturas
 */
let invoiceControllerInstance: InvoiceController | null = null;

/**
 * Factory para obtener instancia del controlador de facturas
 */
export function getInvoiceController(): InvoiceController {
  if (!invoiceControllerInstance) {
    invoiceControllerInstance = new InvoiceController();
  }

  return invoiceControllerInstance;
}

export const invoiceController = getInvoiceController();
