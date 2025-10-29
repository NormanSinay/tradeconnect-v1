/**
 * @fileoverview Controlador de Templates de Certificados para TradeConnect
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para gestión de templates de certificados
 *
 * Archivo: backend/src/controllers/certificateTemplateController.ts
 */

import { Request, Response } from 'express';
import { certificateTemplateService } from '../services/certificateTemplateService';
import { successResponse, errorResponse } from '../utils/common.utils';
import { logger } from '../utils/logger';

export class CertificateTemplateController {
  // ====================================================================
  // GESTIÓN DE TEMPLATES
  // ====================================================================

  /**
   * Crea un nuevo template de certificado
   */
  static async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateData = req.body;
      const createdBy = req.user?.id || 1;

      const result = await certificateTemplateService.createTemplate(templateData, createdBy);

      if (result.success) {
        res.status(201).json(successResponse(result.data, 'Template creado exitosamente'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error creando template'));
      }
    } catch (error) {
      logger.error('Error creating certificate template', { error });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtiene todos los templates
   */
  static async getAllTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, active, eventType, search } = req.query;

      const result = await certificateTemplateService.listTemplates({
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        active: active === 'true' ? true : active === 'false' ? false : undefined,
        eventType: eventType as string,
        search: search as string
      });

      if (result.success) {
        res.json(successResponse(result.data, 'Templates obtenidos exitosamente'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error obteniendo templates'));
      }
    } catch (error) {
      logger.error('Error getting certificate templates', { error });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtiene un template por ID
   */
  static async getTemplateById(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;

      const result = await certificateTemplateService.getTemplateById(templateId);

      if (result.success) {
        res.json(successResponse(result.data, 'Template obtenido exitosamente'));
      } else {
        res.status(404).json(errorResponse(result.message || 'Template no encontrado'));
      }
    } catch (error) {
      logger.error('Error getting certificate template by ID', { error, templateId: req.params.templateId });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Actualiza un template
   */
  static async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id || 1;

      const result = await certificateTemplateService.updateTemplate(templateId, updateData, updatedBy);

      if (result.success) {
        res.json(successResponse(result.data, 'Template actualizado exitosamente'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error actualizando template'));
      }
    } catch (error) {
      logger.error('Error updating certificate template', { error, templateId: req.params.templateId });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Elimina un template
   */
  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const deletedBy = req.user?.id || 1;

      const result = await certificateTemplateService.deleteTemplate(templateId, deletedBy);

      if (result.success) {
        res.json(successResponse(null, 'Template eliminado exitosamente'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error eliminando template'));
      }
    } catch (error) {
      logger.error('Error deleting certificate template', { error, templateId: req.params.templateId });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtiene template por defecto para un tipo de evento
   */
  static async getDefaultTemplateForEventType(req: Request, res: Response): Promise<void> {
    try {
      const { eventType } = req.params;

      const result = await certificateTemplateService.getDefaultTemplateForEventType(eventType);

      if (result.success) {
        res.json(successResponse(result.data, 'Template por defecto obtenido exitosamente'));
      } else {
        res.status(404).json(errorResponse(result.message || 'Template por defecto no encontrado'));
      }
    } catch (error) {
      logger.error('Error getting default template for event type', { error, eventType: req.params.eventType });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }


  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * Previsualiza un template con datos de ejemplo
   */
  static async previewTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const { sampleData } = req.body || {};

      const result = await certificateTemplateService.previewTemplate(templateId, sampleData);

      if (result.success) {
        res.json(successResponse(result.data, 'Previsualización generada exitosamente'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error generando previsualización'));
      }
    } catch (error) {
      logger.error('Error previewing template', { error, templateId: req.params.templateId });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Clona un template existente
   */
  static async cloneTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const { name, version } = req.body;
      const createdBy = req.user?.id || 1;

      const result = await certificateTemplateService.cloneTemplate(templateId, { name, version }, createdBy);

      if (result.success) {
        res.status(201).json(successResponse(result.data, 'Template clonado exitosamente'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error clonando template'));
      }
    } catch (error) {
      logger.error('Error cloning template', { error, templateId: req.params.templateId });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtiene estadísticas de templates
   */
  static async getTemplateStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await certificateTemplateService.getTemplatesStats();

      if (result.success) {
        res.json(successResponse(result.data, 'Estadísticas de templates obtenidas exitosamente'));
      } else {
        res.status(400).json(errorResponse(result.message || 'Error obteniendo estadísticas'));
      }
    } catch (error) {
      logger.error('Error getting template stats', { error });
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }
}

export const certificateTemplateController = CertificateTemplateController;
