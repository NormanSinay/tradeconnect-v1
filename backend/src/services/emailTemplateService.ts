/**
 * @fileoverview Servicio de Plantillas de Email para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión de plantillas de email con variables dinámicas
 */

import { EmailTemplate } from '../models/EmailTemplate';
import { logger } from '../utils/logger';

class EmailTemplateService {

  async createTemplate(templateData: any, createdBy: number): Promise<any> {
    try {
      const existingTemplate = await EmailTemplate.findOne({
        where: { code: templateData.code },
        paranoid: false
      });

      if (existingTemplate) {
        return {
          success: false,
          error: 'TEMPLATE_CODE_EXISTS',
          message: 'Ya existe una plantilla con este código',
          timestamp: new Date().toISOString()
        };
      }

      const template = await EmailTemplate.create({
        ...templateData,
        version: 1,
        active: true,
        createdBy,
        updatedBy: createdBy
      });

      logger.info(`Email template created: ${template.code} by user ${createdBy}`);

      return {
        success: true,
        message: 'Plantilla creada exitosamente',
        data: template.toJSON(),
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error creating email template:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al crear la plantilla',
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateTemplate(templateId: number, updateData: any, updatedBy: number): Promise<any> {
    try {
      const template = await EmailTemplate.findByPk(templateId);
      if (!template) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      await template.update({
        ...updateData,
        version: template.version + 1,
        updatedBy
      });

      return {
        success: true,
        message: 'Plantilla actualizada exitosamente',
        data: template.toJSON(),
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Error updating email template:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al actualizar la plantilla',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getTemplate(templateId: number): Promise<any> {
    try {
      const template = await EmailTemplate.findByPk(templateId);
      if (!template) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Plantilla obtenida exitosamente',
        data: template.toJSON(),
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Error getting email template:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al obtener la plantilla',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getTemplateByCode(code: string): Promise<any> {
    try {
      const template = await EmailTemplate.findOne({
        where: { code, active: true }
      });

      if (!template) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Plantilla obtenida exitosamente',
        data: template.toJSON(),
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Error getting email template by code:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al obtener la plantilla',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getTemplates(filters?: any): Promise<any> {
    try {
      const where: any = {};
      if (filters?.type) where.type = filters.type;
      if (filters?.active !== undefined) where.active = filters.active;

      const { count, rows } = await EmailTemplate.findAndCountAll({
        where,
        limit: filters?.limit || 20,
        offset: filters?.offset || 0,
        order: [['createdAt', 'DESC']]
      });

      return {
        templates: rows.map((t: any) => t.toJSON()),
        total: count,
        limit: filters?.limit || 20,
        offset: filters?.offset || 0
      };
    } catch (error: any) {
      logger.error('Error getting email templates:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al obtener las plantillas',
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteTemplate(templateId: number): Promise<any> {
    try {
      const template = await EmailTemplate.findByPk(templateId);
      if (!template) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      await template.destroy();
      return {
        success: true,
        message: 'Plantilla eliminada exitosamente',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Error deleting email template:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al eliminar la plantilla',
        timestamp: new Date().toISOString()
      };
    }
  }

  async previewTemplate(templateId: number, variables: any): Promise<any> {
    try {
      const template = await EmailTemplate.findByPk(templateId);
      if (!template) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      const renderedContent = this.renderTemplate(template.htmlContent, variables);
      const renderedSubject = this.renderTemplate(template.subject, variables);

      return {
        success: true,
        message: 'Vista previa generada exitosamente',
        data: {
          subject: renderedSubject,
          htmlContent: renderedContent,
          textContent: template.textContent ? this.renderTemplate(template.textContent, variables) : undefined
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Error previewing email template:', error);
      return {
        success: false,
        error: 'RENDER_ERROR',
        message: 'Error al generar la vista previa',
        timestamp: new Date().toISOString()
      };
    }
  }

  async previewTemplateByCode(code: string, variables: any): Promise<any> {
    try {
      const template = await EmailTemplate.findOne({
        where: { code, active: true }
      });

      if (!template) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      return this.previewTemplate(template.id, variables);
    } catch (error: any) {
      logger.error('Error previewing email template by code:', error);
      return {
        success: false,
        error: 'RENDER_ERROR',
        message: 'Error al generar la vista previa',
        timestamp: new Date().toISOString()
      };
    }
  }

  async duplicateTemplate(templateId: number, duplicateData: any, duplicatedBy: number): Promise<any> {
    try {
      const originalTemplate = await EmailTemplate.findByPk(templateId);
      if (!originalTemplate) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla original no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si el código ya existe (si se proporciona uno nuevo)
      if (duplicateData.code) {
        const existingTemplate = await EmailTemplate.findOne({
          where: { code: duplicateData.code },
          paranoid: false
        });

        if (existingTemplate) {
          return {
            success: false,
            error: 'TEMPLATE_CODE_EXISTS',
            message: 'Ya existe una plantilla con este código',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Crear la plantilla duplicada
      const duplicatedTemplate = await EmailTemplate.create({
        code: duplicateData.code || `${originalTemplate.code}_COPY`,
        name: duplicateData.name || `${originalTemplate.name} (Copia)`,
        subject: duplicateData.subject || originalTemplate.subject,
        htmlContent: originalTemplate.htmlContent,
        textContent: originalTemplate.textContent,
        type: duplicateData.type || originalTemplate.type,
        variables: originalTemplate.variables,
        version: 1,
        active: true,
        createdBy: duplicatedBy,
        updatedBy: duplicatedBy
      });

      logger.info(`Email template duplicated: ${originalTemplate.code} -> ${duplicatedTemplate.code} by user ${duplicatedBy}`);

      return {
        success: true,
        message: 'Plantilla duplicada exitosamente',
        data: {
          originalTemplate: originalTemplate.toJSON(),
          duplicatedTemplate: duplicatedTemplate.toJSON()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error duplicating email template:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al duplicar la plantilla',
        timestamp: new Date().toISOString()
      };
    }
  }

  private renderTemplate(template: string, variables: any): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }
    return rendered;
  }

  async getTemplateVersions(templateId: number, filters?: any): Promise<any> {
    try {
      const template = await EmailTemplate.findByPk(templateId);
      if (!template) {
        return {
          success: false,
          error: 'TEMPLATE_NOT_FOUND',
          message: 'Plantilla no encontrada',
          timestamp: new Date().toISOString()
        };
      }

      // Por ahora, retornamos solo la versión actual
      // En una implementación completa, habría una tabla de versiones
      const versions = [{
        version: template.version,
        name: template.name,
        subject: template.subject,
        changes: 'Versión actual',
        createdBy: template.createdBy,
        createdAt: template.createdAt
      }];

      // Aplicar filtros de paginación
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      const paginatedVersions = versions.slice(offset, offset + limit);

      return {
        success: true,
        message: 'Versiones de plantilla obtenidas exitosamente',
        data: {
          templateId,
          versions: paginatedVersions,
          pagination: {
            page: Math.floor(offset / limit) + 1,
            limit,
            total: versions.length,
            totalPages: Math.ceil(versions.length / limit),
            hasNext: offset + limit < versions.length,
            hasPrev: offset > 0
          }
        },
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error getting template versions:', error);
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al obtener las versiones de la plantilla',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const emailTemplateService = new EmailTemplateService();
