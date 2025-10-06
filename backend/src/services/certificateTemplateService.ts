/**
 * @fileoverview Servicio de Templates de Certificado para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión de templates dinámicos de certificados
 *
 * Archivo: backend/src/services/certificateTemplateService.ts
 */

import { CertificateTemplate } from '../models/CertificateTemplate';
import { User } from '../models/User';
import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import {
  CertificateTemplateAttributes,
  CertificateTemplateConfiguration
} from '../types/certificate.types';
import { ApiResponse } from '../types/global.types';

/**
 * Servicio para gestión de templates de certificados
 */
export class CertificateTemplateService {
  private static readonly CACHE_TTL = 3600; // 1 hora
  private static readonly CACHE_PREFIX = 'certificate_templates';

  // ====================================================================
  // CREACIÓN Y GESTIÓN DE TEMPLATES
  // ====================================================================

  /**
   * Crea un nuevo template de certificado
   */
  static async createTemplate(
    data: Omit<CertificateTemplateAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
    createdBy: number
  ): Promise<ApiResponse<CertificateTemplate>> {
    try {
      // Validar datos
      const validation = await this.validateTemplateData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos del template inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Crear template
      const template = await CertificateTemplate.create({
        ...data,
        createdBy,
        updatedBy: createdBy
      });

      // Limpiar caché
      await this.clearTemplatesCache();

      logger.info('Certificate template created successfully', {
        templateId: template.id,
        name: template.name,
        createdBy
      });

      return {
        success: true,
        message: 'Template de certificado creado exitosamente',
        data: template,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creating certificate template:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un template existente
   */
  static async updateTemplate(
    templateId: string,
    data: Partial<CertificateTemplateAttributes>,
    updatedBy: number
  ): Promise<ApiResponse<CertificateTemplate>> {
    try {
      const template = await CertificateTemplate.findByPk(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template no encontrado',
          error: 'TEMPLATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos si se están actualizando campos críticos
      if (data.htmlTemplate || data.requiredVariables || data.configuration) {
        const validation = await this.validateTemplateData({
          ...template.toJSON(),
          ...data
        } as any);

        if (!validation.isValid) {
          return {
            success: false,
            message: 'Datos del template inválidos',
            error: 'VALIDATION_ERROR',
            details: validation.errors,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Actualizar template
      await template.update({
        ...data,
        updatedBy,
        version: data.htmlTemplate || data.cssStyles ? this.incrementVersion(template.version) : template.version
      });

      // Limpiar caché
      await this.clearTemplateCache(templateId);

      logger.info('Certificate template updated successfully', {
        templateId,
        name: template.name,
        updatedBy
      });

      return {
        success: true,
        message: 'Template de certificado actualizado exitosamente',
        data: template,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error updating certificate template:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un template (soft delete)
   */
  static async deleteTemplate(templateId: string, deletedBy: number): Promise<ApiResponse<void>> {
    try {
      const template = await CertificateTemplate.findByPk(templateId);
      if (!template) {
        return {
          success: false,
          message: 'Template no encontrado',
          error: 'TEMPLATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si el template está siendo usado
      const { Certificate } = await import('../models/Certificate');
      const usageCount = await Certificate.count({
        where: { templateId: templateId }
      });
      if (usageCount > 0) {
        return {
          success: false,
          message: `No se puede eliminar el template porque está siendo usado por ${usageCount} certificado(s)`,
          error: 'TEMPLATE_IN_USE',
          timestamp: new Date().toISOString()
        };
      }

      await template.destroy();

      // Limpiar caché
      await this.clearTemplateCache(templateId);

      logger.info('Certificate template deleted successfully', {
        templateId,
        name: template.name,
        deletedBy
      });

      return {
        success: true,
        message: 'Template de certificado eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error deleting certificate template:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // CONSULTAS DE TEMPLATES
  // ====================================================================

  /**
   * Obtiene un template por ID
   */
  static async getTemplateById(templateId: string): Promise<ApiResponse<CertificateTemplate>> {
    try {
      // Buscar en caché primero
      const cacheKey = `${this.CACHE_PREFIX}:${templateId}`;
      const cached = await cacheRedis.get(cacheKey);

      if (cached) {
        const templateData = JSON.parse(cached);
        const template = CertificateTemplate.build(templateData);
        return {
          success: true,
          message: 'Template obtenido exitosamente (caché)',
          data: template,
          timestamp: new Date().toISOString()
        };
      }

      // Buscar en base de datos
      const template = await CertificateTemplate.findByPk(templateId, {
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'updater' }
        ]
      });

      if (!template) {
        return {
          success: false,
          message: 'Template no encontrado',
          error: 'TEMPLATE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Cachear resultado
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(template.toJSON()));

      return {
        success: true,
        message: 'Template obtenido exitosamente',
        data: template,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting certificate template:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene templates activos para un tipo de evento
   */
  static async getTemplatesForEventType(eventType: string): Promise<ApiResponse<CertificateTemplate[]>> {
    try {
      const templates = await CertificateTemplate.findActiveForEventType(eventType);

      return {
        success: true,
        message: `${templates.length} template(s) encontrado(s) para el tipo de evento ${eventType}`,
        data: templates,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting templates for event type:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene el template por defecto para un tipo de evento
   */
  static async getDefaultTemplateForEventType(eventType: string): Promise<ApiResponse<CertificateTemplate | null>> {
    try {
      const template = await CertificateTemplate.findDefaultForEventType(eventType);

      return {
        success: true,
        message: template ? 'Template por defecto encontrado' : 'No hay template por defecto para este tipo de evento',
        data: template,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting default template for event type:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Lista todos los templates con paginación
   */
  static async listTemplates(options: {
    page?: number;
    limit?: number;
    active?: boolean;
    eventType?: string;
    search?: string;
  } = {}): Promise<ApiResponse<{
    templates: CertificateTemplate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const {
        page = 1,
        limit = 10,
        active,
        eventType,
        search
      } = options;

      const offset = (page - 1) * limit;
      const where: any = {};

      if (active !== undefined) {
        where.active = active;
      }

      if (eventType) {
        where.eventTypes = {
          [require('sequelize').Op.contains]: [eventType]
        };
      }

      if (search) {
        where.name = {
          [require('sequelize').Op.iLike]: `%${search}%`
        };
      }

      const { rows: templates, count: total } = await CertificateTemplate.findAndCountAll({
        where,
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'updater' }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: `${templates.length} template(s) obtenido(s)`,
        data: {
          templates,
          total,
          page,
          limit,
          totalPages
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error listing certificate templates:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // VALIDACIÓN Y UTILIDADES
  // ====================================================================

  /**
   * Valida los datos de un template
   */
  static async validateTemplateData(data: Partial<CertificateTemplateAttributes>): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validar nombre
    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre del template es requerido');
    } else if (data.name.length > 255) {
      errors.push('El nombre no puede exceder 255 caracteres');
    }

    // Validar tipos de evento
    if (!data.eventTypes || data.eventTypes.length === 0) {
      errors.push('Al menos un tipo de evento es requerido');
    }

    // Validar HTML template
    if (!data.htmlTemplate || data.htmlTemplate.trim().length === 0) {
      errors.push('El template HTML es requerido');
    }

    // Validar variables requeridas
    if (!data.requiredVariables || data.requiredVariables.length === 0) {
      errors.push('Al menos una variable requerida debe ser especificada');
    }

    // Validar configuración
    if (data.configuration) {
      const configErrors = this.validateConfiguration(data.configuration);
      errors.push(...configErrors);
    }

    // Validar colores
    if (data.backgroundColor && !CertificateTemplate.validateHexColor(data.backgroundColor)) {
      errors.push('El color de fondo debe ser un código hexadecimal válido');
    }

    if (data.textColor && !CertificateTemplate.validateHexColor(data.textColor)) {
      errors.push('El color del texto debe ser un código hexadecimal válido');
    }

    if (data.borderColor && !CertificateTemplate.validateHexColor(data.borderColor)) {
      errors.push('El color del borde debe ser un código hexadecimal válido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida la configuración del template
   */
  private static validateConfiguration(config: CertificateTemplateConfiguration): string[] {
    const errors: string[] = [];

    if (config.margins) {
      const { top, bottom, left, right } = config.margins;
      if (top < 0 || bottom < 0 || left < 0 || right < 0) {
        errors.push('Los márgenes no pueden ser negativos');
      }
    }

    if (config.qrCode) {
      const { size, position } = config.qrCode;
      if (size && (size < 50 || size > 500)) {
        errors.push('El tamaño del QR debe estar entre 50 y 500 pixeles');
      }

      const validPositions = ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
      if (position && !validPositions.includes(position)) {
        errors.push('La posición del QR debe ser una de: ' + validPositions.join(', '));
      }
    }

    return errors;
  }

  /**
   * Incrementa la versión del template
   */
  private static incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  // ====================================================================
  // GESTIÓN DE CACHÉ
  // ====================================================================

  /**
   * Limpia el caché de un template específico
   */
  private static async clearTemplateCache(templateId: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${templateId}`;
      await cacheRedis.del(cacheKey);
    } catch (error) {
      logger.warn('Error clearing template cache:', error);
    }
  }

  /**
   * Limpia todo el caché de templates
   */
  private static async clearTemplatesCache(): Promise<void> {
    try {
      const keys = await cacheRedis.keys(`${this.CACHE_PREFIX}:*`);
      if (keys.length > 0) {
        await cacheRedis.del(keys);
      }
    } catch (error) {
      logger.warn('Error clearing templates cache:', error);
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * Previsualiza un template con datos de ejemplo
   */
  static async previewTemplate(templateId: string, sampleData?: any): Promise<ApiResponse<{
    html: string;
    pdfPreview?: string;
    variables: Record<string, any>;
  }>> {
    try {
      const templateResult = await this.getTemplateById(templateId);
      if (!templateResult.success || !templateResult.data) {
        return templateResult as any;
      }

      const template = templateResult.data;

      // Datos de ejemplo por defecto
      const defaultSampleData = {
        participante: {
          nombre_completo: 'Juan Pérez García',
          cui_dpi: '1234567890123',
          email: 'juan.perez@email.com'
        },
        evento: {
          nombre: 'Curso de Desarrollo Web Avanzado',
          fecha_inicio: '2025-10-01',
          fecha_fin: '2025-10-05',
          duracion_horas: 40
        },
        certificado: {
          numero: 'CERT-2025-001234',
          fecha_emision: new Date().toLocaleDateString('es-GT'),
          hash_blockchain: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
        },
        organizador: {
          nombre: 'TradeConnect Academy',
          firma_digital: '[Firma Digital]'
        }
      };

      const mergedData = { ...defaultSampleData, ...sampleData };

      // Renderizar HTML con datos
      let html = template.htmlTemplate;
      template.requiredVariables.forEach((variable: string) => {
        const value = this.getNestedValue(mergedData, variable);
        const regex = new RegExp(`{{${variable}}}`, 'g');
        html = html.replace(regex, value || `[${variable}]`);
      });

      // Agregar estilos CSS si existen
      if (template.cssStyles) {
        html = html.replace('</head>', `<style>${template.cssStyles}</style></head>`);
      }

      return {
        success: true,
        message: 'Previsualización generada exitosamente',
        data: {
          html,
          variables: mergedData
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error previewing template:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clona un template existente
   */
  static async cloneTemplate(
    templateId: string,
    cloneData: { name: string; version?: string },
    createdBy: number
  ): Promise<ApiResponse<CertificateTemplate>> {
    try {
      const templateResult = await this.getTemplateById(templateId);
      if (!templateResult.success || !templateResult.data) {
        return templateResult as any;
      }

      const originalTemplate = templateResult.data;

      // Crear nuevo template basado en el original
      const newTemplateData = {
        name: cloneData.name,
        eventTypes: [...originalTemplate.eventTypes],
        active: false, // Los clones empiezan inactivos
        version: cloneData.version || '1.0.0',
        htmlTemplate: originalTemplate.htmlTemplate,
        cssStyles: originalTemplate.cssStyles,
        requiredVariables: [...originalTemplate.requiredVariables],
        configuration: originalTemplate.configuration,
        logoUrl: originalTemplate.logoUrl,
        signatureUrl: originalTemplate.signatureUrl,
        backgroundColor: originalTemplate.backgroundColor,
        textColor: originalTemplate.textColor,
        borderColor: originalTemplate.borderColor
      };

      return this.createTemplate(newTemplateData, createdBy);

    } catch (error) {
      logger.error('Error cloning template:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de templates
   */
  static async getTemplatesStats(): Promise<ApiResponse<{
    totalTemplates: number;
    activeTemplates: number;
    templatesByEventType: Record<string, number>;
    mostUsedTemplates: Array<{
      templateId: string;
      name: string;
      usageCount: number;
    }>;
  }>> {
    try {
      const templates = await CertificateTemplate.findAll({
        include: [
          { model: CertificateTemplate, as: 'certificates' }
        ]
      });

      const stats = {
        totalTemplates: templates.length,
        activeTemplates: templates.filter(t => t.active).length,
        templatesByEventType: {} as Record<string, number>,
        mostUsedTemplates: [] as Array<{
          templateId: string;
          name: string;
          usageCount: number;
        }>
      };

      // Contar por tipo de evento
      templates.forEach(template => {
        template.eventTypes.forEach(eventType => {
          stats.templatesByEventType[eventType] = (stats.templatesByEventType[eventType] || 0) + 1;
        });
      });

      // Templates más usados
      stats.mostUsedTemplates = templates
        .map(template => ({
          templateId: template.id,
          name: template.name,
          usageCount: template.certificates?.length || 0
        }))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10);

      return {
        success: true,
        message: 'Estadísticas de templates obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting templates stats:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene un valor anidado de un objeto usando notación de puntos
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export const certificateTemplateService = CertificateTemplateService;