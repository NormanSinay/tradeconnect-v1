/**
 * @fileoverview Servicio de Configuración del Sistema para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio que maneja la lógica de negocio para configuración del sistema
 *
 * Archivo: backend/src/services/systemConfigService.ts
 */

import { SystemConfig } from '../models/SystemConfig';
import { logger } from '../utils/logger';
import { cacheRedis } from '../config/redis';
import {
  SystemConfigData,
  SystemConfigCategory,
  CreateSystemConfigRequest,
  UpdateSystemConfigRequest,
  BulkSystemConfigRequest,
  SystemConfigFilters,
  SystemConfigResponse,
  PublicSystemConfigResponse,
  SystemConfigStats,
  SystemConfiguration
} from '../types/system.types';
import { ApiResponse } from '../types/global.types';

export class SystemConfigService {
  private readonly CACHE_KEY_PREFIX = 'system:config:';
  private readonly CACHE_TTL = 3600; // 1 hora

  /**
   * Obtiene configuración por clave
   */
  async getConfigByKey(key: string, includeInactive: boolean = false): Promise<ApiResponse<SystemConfigData>> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}key:${key}`;
      const cached = await cacheRedis.get(cacheKey);

      if (cached) {
        return {
          success: true,
          message: 'Configuración obtenida del caché',
          data: JSON.parse(cached)
        };
      }

      const config = await SystemConfig.findByKey(key, includeInactive);
      if (!config) {
        return {
          success: false,
          message: 'Configuración no encontrada',
          error: 'CONFIG_NOT_FOUND'
        };
      }

      const configData = config.toAdminJSON() as SystemConfigData;

      // Cachear resultado
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(configData));

      return {
        success: true,
        message: 'Configuración obtenida exitosamente',
        data: configData
      };
    } catch (error) {
      logger.error('Error obteniendo configuración por clave:', error);
      return {
        success: false,
        message: 'Error obteniendo configuración',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Obtiene configuraciones por categoría
   */
  async getConfigsByCategory(
    category: SystemConfigCategory,
    includeInactive: boolean = false
  ): Promise<ApiResponse<SystemConfigData[]>> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}category:${category}`;
      const cached = await cacheRedis.get(cacheKey);

      if (cached) {
        return {
          success: true,
          message: 'Configuraciones obtenidas del caché',
          data: JSON.parse(cached)
        };
      }

      const configs = await SystemConfig.findByCategory(category, includeInactive);
      const configData = configs.map(config => config.toAdminJSON() as SystemConfigData);

      // Cachear resultado
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(configData));

      return {
        success: true,
        message: `Configuraciones de ${category} obtenidas exitosamente`,
        data: configData
      };
    } catch (error) {
      logger.error('Error obteniendo configuraciones por categoría:', error);
      return {
        success: false,
        message: 'Error obteniendo configuraciones',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Obtiene todas las configuraciones con filtros
   */
  async getAllConfigs(filters: SystemConfigFilters = {}): Promise<ApiResponse<{
    configs: SystemConfigData[];
    pagination: any;
  }>> {
    try {
      const {
        category,
        isPublic,
        isActive = true,
        search,
        page = 1,
        limit = 50
      } = filters;

      const where: any = {};

      if (category) where.category = category;
      if (isPublic !== undefined) where.isPublic = isPublic;
      if (isActive !== undefined) where.isActive = isActive;

      if (search) {
        where[Op.or] = [
          { key: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { rows: configs, count: total } = await SystemConfig.findAndCountAll({
        where,
        limit,
        offset,
        order: [['category', 'ASC'], ['key', 'ASC']]
      });

      const configData = configs.map(config => config.toAdminJSON() as SystemConfigData);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Configuraciones obtenidas exitosamente',
        data: {
          configs: configData,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };
    } catch (error) {
      logger.error('Error obteniendo todas las configuraciones:', error);
      return {
        success: false,
        message: 'Error obteniendo configuraciones',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Obtiene configuraciones públicas
   */
  async getPublicConfigs(): Promise<PublicSystemConfigResponse> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}public`;
      const cached = await cacheRedis.get(cacheKey);

      if (cached) {
        return {
          success: true,
          message: 'Configuraciones públicas obtenidas del caché',
          data: JSON.parse(cached),
          timestamp: new Date().toISOString()
        };
      }

      const configs = await SystemConfig.findPublicConfigs();
      const publicConfig: Record<string, any> = {};

      for (const config of configs) {
        publicConfig[config.key] = config.parsedValue;
      }

      // Cachear resultado
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(publicConfig));

      return {
        success: true,
        message: 'Configuraciones públicas obtenidas exitosamente',
        data: publicConfig,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error obteniendo configuraciones públicas:', error);
      return {
        success: false,
        message: 'Error obteniendo configuraciones públicas',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Crea nueva configuración
   */
  async createConfig(
    configData: CreateSystemConfigRequest,
    userId: number
  ): Promise<ApiResponse<SystemConfigData>> {
    try {
      // Verificar si ya existe
      const existing = await SystemConfig.findByKey(configData.key);
      if (existing) {
        return {
          success: false,
          message: 'Ya existe una configuración con esta clave',
          error: 'CONFIG_ALREADY_EXISTS'
        };
      }

      const config = await SystemConfig.upsertConfig(
        configData.key,
        configData.value,
        configData.category,
        userId,
        {
          description: configData.description,
          isPublic: configData.isPublic,
          metadata: configData.metadata
        }
      );

      // Limpiar caché
      await this.clearConfigCache();

      // Log de auditoría
      logger.info('Configuración creada', {
        key: configData.key,
        category: configData.category,
        userId
      });

      return {
        success: true,
        message: 'Configuración creada exitosamente',
        data: config.toAdminJSON() as SystemConfigData
      };
    } catch (error) {
      logger.error('Error creando configuración:', error);
      return {
        success: false,
        message: 'Error creando configuración',
        error: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Actualiza configuración existente
   */
  async updateConfig(
    key: string,
    updateData: UpdateSystemConfigRequest,
    userId: number
  ): Promise<ApiResponse<SystemConfigData>> {
    try {
      const config = await SystemConfig.findByKey(key, true);
      if (!config) {
        return {
          success: false,
          message: 'Configuración no encontrada',
          error: 'CONFIG_NOT_FOUND'
        };
      }

      // Actualizar campos
      if (updateData.value !== undefined) {
        config.value = JSON.stringify(updateData.value);
      }
      if (updateData.description !== undefined) {
        config.description = updateData.description;
      }
      if (updateData.isPublic !== undefined) {
        config.isPublic = updateData.isPublic;
      }
      if (updateData.isActive !== undefined) {
        config.isActive = updateData.isActive;
      }
      if (updateData.metadata !== undefined) {
        config.metadata = updateData.metadata;
      }

      await config.save();

      // Limpiar caché
      await this.clearConfigCache();

      // Log de auditoría
      logger.info('Configuración actualizada', {
        key,
        userId,
        changes: Object.keys(updateData)
      });

      return {
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: config.toAdminJSON() as SystemConfigData
      };
    } catch (error) {
      logger.error('Error actualizando configuración:', error);
      return {
        success: false,
        message: 'Error actualizando configuración',
        error: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Elimina configuración (soft delete)
   */
  async deleteConfig(key: string, userId: number): Promise<ApiResponse<void>> {
    try {
      const config = await SystemConfig.findByKey(key, true);
      if (!config) {
        return {
          success: false,
          message: 'Configuración no encontrada',
          error: 'CONFIG_NOT_FOUND'
        };
      }

      await config.destroy();

      // Limpiar caché
      await this.clearConfigCache();

      // Log de auditoría
      logger.info('Configuración eliminada', { key, userId });

      return {
        success: true,
        message: 'Configuración eliminada exitosamente'
      };
    } catch (error) {
      logger.error('Error eliminando configuración:', error);
      return {
        success: false,
        message: 'Error eliminando configuración',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Crea configuraciones de forma masiva
   */
  async bulkCreateConfigs(
    bulkData: BulkSystemConfigRequest,
    userId: number
  ): Promise<ApiResponse<SystemConfigData[]>> {
    try {
      const createdConfigs: SystemConfigData[] = [];
      const errors: string[] = [];

      for (const configData of bulkData.configs) {
        try {
          const result = await this.createConfig(configData, userId);
          if (result.success && result.data) {
            createdConfigs.push(result.data);
          } else {
            errors.push(`${configData.key}: ${result.message}`);
          }
        } catch (error) {
          errors.push(`${configData.key}: Error interno`);
        }
      }

      // Limpiar caché
      await this.clearConfigCache();

      return {
        success: true,
        message: `Configuraciones procesadas: ${createdConfigs.length} creadas, ${errors.length} errores`,
        data: createdConfigs
      };
    } catch (error) {
      logger.error('Error en creación masiva de configuraciones:', error);
      return {
        success: false,
        message: 'Error en creación masiva',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Obtiene configuración completa del sistema
   */
  async getFullSystemConfig(): Promise<ApiResponse<SystemConfiguration>> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}full`;
      const cached = await cacheRedis.get(cacheKey);

      if (cached) {
        return {
          success: true,
          message: 'Configuración completa obtenida del caché',
          data: JSON.parse(cached)
        };
      }

      const allConfigs = await SystemConfig.getConfigAsObject();

      // Organizar por categorías
      const systemConfig: SystemConfiguration = {
        general: this.extractCategoryConfig(allConfigs, 'general'),
        security: this.extractCategoryConfig(allConfigs, 'security'),
        payment: this.extractCategoryConfig(allConfigs, 'payment'),
        notification: this.extractCategoryConfig(allConfigs, 'notification'),
        email: this.extractCategoryConfig(allConfigs, 'email'),
        integration: this.extractCategoryConfig(allConfigs, 'integration'),
        ui: this.extractCategoryConfig(allConfigs, 'ui'),
        performance: this.extractCategoryConfig(allConfigs, 'performance')
      };

      // Cachear resultado
      await cacheRedis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(systemConfig));

      return {
        success: true,
        message: 'Configuración completa del sistema obtenida exitosamente',
        data: systemConfig
      };
    } catch (error) {
      logger.error('Error obteniendo configuración completa:', error);
      return {
        success: false,
        message: 'Error obteniendo configuración completa',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Obtiene estadísticas de configuración
   */
  async getConfigStats(): Promise<ApiResponse<SystemConfigStats>> {
    try {
      const [
        totalConfigs,
        activeConfigs,
        publicConfigs,
        categoriesCount
      ] = await Promise.all([
        SystemConfig.count(),
        SystemConfig.count({ where: { isActive: true } }),
        SystemConfig.count({ where: { isPublic: true } }),
        this.getCategoriesCount()
      ]);

      const lastConfig = await SystemConfig.findOne({
        order: [['updatedAt', 'DESC']]
      });

      const stats: SystemConfigStats = {
        totalConfigs,
        activeConfigs,
        publicConfigs,
        categoriesCount,
        lastUpdated: lastConfig?.updatedAt || new Date(),
        lastUpdatedBy: lastConfig?.createdBy || 0
      };

      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        message: 'Error obteniendo estadísticas',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Inicializa configuración por defecto
   */
  async initializeDefaultConfig(userId: number): Promise<ApiResponse<void>> {
    try {
      const defaultConfigs: CreateSystemConfigRequest[] = [
        // Configuración general
        {
          key: 'system.language',
          value: 'es',
          category: 'general',
          description: 'Idioma por defecto del sistema',
          isPublic: true
        },
        {
          key: 'system.timezone',
          value: 'America/Guatemala',
          category: 'general',
          description: 'Zona horaria por defecto',
          isPublic: true
        },
        {
          key: 'system.currency',
          value: 'GTQ',
          category: 'general',
          description: 'Moneda por defecto',
          isPublic: true
        },
        // Configuración de seguridad
        {
          key: 'security.session_timeout',
          value: 3600,
          category: 'security',
          description: 'Tiempo de expiración de sesión en segundos'
        },
        {
          key: 'security.max_login_attempts',
          value: 5,
          category: 'security',
          description: 'Máximo número de intentos de login fallidos'
        },
        // Configuración de pagos
        {
          key: 'payment.supported_currencies',
          value: ['GTQ', 'USD'],
          category: 'payment',
          description: 'Monedas soportadas para pagos',
          isPublic: true
        },
        // Configuración de notificaciones
        {
          key: 'notification.enabled_types',
          value: ['email', 'in_app'],
          category: 'notification',
          description: 'Tipos de notificaciones habilitadas'
        }
      ];

      await this.bulkCreateConfigs({ configs: defaultConfigs }, userId);

      return {
        success: true,
        message: 'Configuración por defecto inicializada exitosamente'
      };
    } catch (error) {
      logger.error('Error inicializando configuración por defecto:', error);
      return {
        success: false,
        message: 'Error inicializando configuración por defecto',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // ====================================================================
  // MÉTODOS PRIVADOS
  // ====================================================================

  private async clearConfigCache(): Promise<void> {
    try {
      const keys = await cacheRedis.keys(`${this.CACHE_KEY_PREFIX}*`);
      if (keys.length > 0) {
        await cacheRedis.del(keys);
      }
    } catch (error) {
      logger.warn('Error limpiando caché de configuración:', error);
    }
  }

  private extractCategoryConfig(allConfigs: Record<string, any>, category: string): any {
    const categoryConfigs: Record<string, any> = {};

    for (const [key, value] of Object.entries(allConfigs)) {
      if (key.startsWith(`${category}.`)) {
        const configKey = key.replace(`${category}.`, '');
        categoryConfigs[configKey] = value;
      }
    }

    return categoryConfigs;
  }

  private async getCategoriesCount(): Promise<Record<SystemConfigCategory, number>> {
    const categories: SystemConfigCategory[] = [
      'general', 'security', 'payment', 'notification',
      'email', 'integration', 'ui', 'performance'
    ];

    const counts: Record<string, number> = {};

    for (const category of categories) {
      counts[category] = await SystemConfig.count({
        where: { category, isActive: true }
      });
    }

    return counts as Record<SystemConfigCategory, number>;
  }
}