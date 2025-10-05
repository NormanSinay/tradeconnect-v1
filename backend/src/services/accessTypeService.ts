/**
 * Servicio de Gestión de Tipos de Acceso para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de tipos de acceso
 */

import { AccessType } from '../models/AccessType';
import { AuditLog } from '../models/AuditLog';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { EventEmitter } from 'events';
import { Op } from 'sequelize';

/**
 * Servicio para gestión de tipos de acceso
 */
export class AccessTypeService {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  // ====================================================================
  // OPERACIONES CRUD BÁSICAS
  // ====================================================================

  /**
   * Crea un nuevo tipo de acceso
   */
  async createAccessType(data: any, userId: number): Promise<ApiResponse<AccessType>> {
    try {
      // Validar datos de entrada
      const validation = await this.validateAccessTypeData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de tipo de acceso inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del tipo de acceso
      const accessTypeData = {
        ...data,
        status: data.status || 'ACTIVE',
        isDefault: data.isDefault || false,
        priority: data.priority || 0,
        displayOrder: data.displayOrder || 0,
        createdBy: userId
      };

      // Crear tipo de acceso
      const accessType = await AccessType.create(accessTypeData);

      // Registrar en auditoría
      await AuditLog.log(
        'access_type_created',
        'access_type',
        {
          userId,
          resourceId: accessType.id.toString(),
          newValues: accessTypeData,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.deleteByPattern('access_types:*');

      // Emitir evento
      this.eventEmitter.emit('AccessTypeCreated', {
        accessTypeId: accessType.id,
        accessTypeData: accessType,
        createdBy: userId
      });

      return {
        success: true,
        message: 'Tipo de acceso creado exitosamente',
        data: accessType,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando tipo de acceso:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un tipo de acceso existente
   */
  async updateAccessType(accessTypeId: number, data: any, userId: number): Promise<ApiResponse<AccessType>> {
    try {
      const accessType = await AccessType.findByPk(accessTypeId);
      if (!accessType) {
        return {
          success: false,
          message: 'Tipo de acceso no encontrado',
          error: 'ACCESS_TYPE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validateAccessTypeData(data, true);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de actualización inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      const oldValues = {
        name: accessType.name,
        displayName: accessType.displayName,
        description: accessType.description,
        category: accessType.category,
        color: accessType.color,
        icon: accessType.icon,
        status: accessType.status,
        isDefault: accessType.isDefault,
        priority: accessType.priority,
        displayOrder: accessType.displayOrder
      };

      // Actualizar tipo de acceso
      await accessType.update(data);

      // Registrar en auditoría
      await AuditLog.log(
        'access_type_updated',
        'access_type',
        {
          userId,
          resourceId: accessTypeId.toString(),
          oldValues,
          newValues: data,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.deleteByPattern('access_types:*');

      // Emitir evento
      this.eventEmitter.emit('AccessTypeUpdated', {
        accessTypeId,
        oldData: oldValues,
        newData: accessType,
        updatedBy: userId
      });

      return {
        success: true,
        message: 'Tipo de acceso actualizado exitosamente',
        data: accessType,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando tipo de acceso:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un tipo de acceso (soft delete)
   */
  async deleteAccessType(accessTypeId: number, userId: number): Promise<ApiResponse<void>> {
    try {
      const accessType = await AccessType.findByPk(accessTypeId);
      if (!accessType) {
        return {
          success: false,
          message: 'Tipo de acceso no encontrado',
          error: 'ACCESS_TYPE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si es el tipo por defecto (no se puede eliminar)
      if (accessType.isDefault) {
        return {
          success: false,
          message: 'No se puede eliminar el tipo de acceso por defecto',
          error: 'CANNOT_DELETE_DEFAULT',
          timestamp: new Date().toISOString()
        };
      }

      // Soft delete
      await accessType.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'access_type_deleted',
        'access_type',
        {
          userId,
          resourceId: accessTypeId.toString(),
          oldValues: {
            name: accessType.name,
            displayName: accessType.displayName,
            category: accessType.category
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      // Invalidar caché
      await cacheService.deleteByPattern('access_types:*');

      // Emitir evento
      this.eventEmitter.emit('AccessTypeDeleted', {
        accessTypeId,
        accessTypeData: accessType.toJSON(),
        deletedBy: userId
      });

      return {
        success: true,
        message: 'Tipo de acceso eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando tipo de acceso:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // OPERACIONES DE CONSULTA
  // ====================================================================

  /**
   * Obtiene un tipo de acceso por ID
   */
  async getAccessTypeById(accessTypeId: number): Promise<ApiResponse<AccessType>> {
    try {
      const accessType = await AccessType.findByPk(accessTypeId);

      if (!accessType) {
        return {
          success: false,
          message: 'Tipo de acceso no encontrado',
          error: 'ACCESS_TYPE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Tipo de acceso obtenido exitosamente',
        data: accessType,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo tipo de acceso:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene todos los tipos de acceso activos (con caché)
   */
  async getActiveAccessTypes(): Promise<ApiResponse<AccessType[]>> {
    try {
      const cacheKey = 'access_types:active';

      // Usar patrón cache-aside
      const result = await cacheService.getOrSet(
        cacheKey,
        async () => await this.fetchActiveAccessTypesFromDB(),
        3600 // TTL de 1 hora
      );

      return {
        success: true,
        message: 'Tipos de acceso obtenidos exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo tipos de acceso:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Método privado para obtener tipos de acceso activos desde la BD
   */
  private async fetchActiveAccessTypesFromDB(): Promise<AccessType[]> {
    return await AccessType.findAll({
      where: { status: 'ACTIVE' },
      order: [
        ['displayOrder', 'ASC'],
        ['priority', 'DESC'],
        ['createdAt', 'ASC']
      ]
    });
  }

  /**
   * Obtiene tipos de acceso por categoría
   */
  async getAccessTypesByCategory(category: string, includeInactive: boolean = false): Promise<ApiResponse<AccessType[]>> {
    try {
      const where: any = { category };

      if (!includeInactive) {
        where.status = 'ACTIVE';
      }

      const accessTypes = await AccessType.findAll({
        where,
        order: [
          ['displayOrder', 'ASC'],
          ['priority', 'DESC']
        ]
      });

      return {
        success: true,
        message: 'Tipos de acceso obtenidos exitosamente',
        data: accessTypes,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo tipos de acceso por categoría:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene el tipo de acceso por defecto en una categoría
   */
  async getDefaultAccessType(category: string): Promise<ApiResponse<AccessType | null>> {
    try {
      const accessType = await AccessType.findOne({
        where: {
          category,
          isDefault: true,
          status: 'ACTIVE'
        }
      });

      return {
        success: true,
        message: 'Tipo de acceso por defecto obtenido exitosamente',
        data: accessType,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo tipo de acceso por defecto:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES Y VALIDACIONES
  // ====================================================================

  /**
   * Valida datos de tipo de acceso
   */
  private async validateAccessTypeData(data: any, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validaciones básicas
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      }
    }

    if (!isUpdate || data.displayName !== undefined) {
      if (!data.displayName || data.displayName.trim().length < 2) {
        errors.push('El nombre para mostrar debe tener al menos 2 caracteres');
      }
    }

    if (!isUpdate || data.category !== undefined) {
      if (!data.category || data.category.trim().length < 2) {
        errors.push('La categoría es requerida');
      }
    }

    // Validar unicidad del nombre
    if (!isUpdate || data.name !== undefined) {
      if (data.name) {
        const existing = await AccessType.findOne({
          where: {
            name: data.name,
            id: { [Op.ne]: data.id || 0 }
          }
        });

        if (existing) {
          errors.push(`Ya existe un tipo de acceso con el nombre '${data.name}'`);
        }
      }
    }

    // Validar unicidad del tipo por defecto por categoría
    if (data.isDefault && data.category) {
      const existingDefault = await AccessType.findOne({
        where: {
          category: data.category,
          isDefault: true,
          id: { [Op.ne]: data.id || 0 }
        }
      });

      if (existingDefault) {
        errors.push(`Ya existe un tipo de acceso por defecto en la categoría '${data.category}'`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene estadísticas de uso por tipo de acceso
   */
  async getUsageStats(): Promise<ApiResponse<any[]>> {
    try {
      // Esta implementación requeriría joins con tablas de eventos y registros
      // Por ahora retornamos un array vacío con estructura esperada
      const stats: any[] = [
        // Ejemplo de estructura esperada
        // {
        //   accessTypeId: 1,
        //   name: 'VIP',
        //   category: 'premium',
        //   totalEvents: 5,
        //   totalRegistrations: 150,
        //   averagePrice: 150.00
        // }
      ];

      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene event emitter
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

export const accessTypeService = new AccessTypeService();