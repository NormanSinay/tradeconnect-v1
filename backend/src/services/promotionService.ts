/**
 * @fileoverview Servicio de Promociones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de promociones
 *
 * Archivo: backend/src/services/promotionService.ts
 */

import { Promotion, PromotionType } from '../models/Promotion';
import { PromoCode } from '../models/PromoCode';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionResponse,
  PromotionFilters,
  PaginatedResponse
} from '../types/promotion.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Servicio para manejo de operaciones de promociones
 */
export class PromotionService {

  // ====================================================================
  // OPERACIONES CRUD BÁSICAS
  // ====================================================================

  /**
   * Crea una nueva promoción
   */
  async createPromotion(
    promotionData: CreatePromotionRequest,
    createdBy: number
  ): Promise<ApiResponse<PromotionResponse>> {
    try {
      // Validar datos de entrada
      const validation = await this.validatePromotionData(promotionData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de promoción inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos de la promoción
      const promotionPayload: any = {
        ...promotionData,
        createdBy,
        isActive: promotionData.isActive ?? true,
        isStackable: promotionData.isStackable ?? true,
        priority: promotionData.priority ?? 0
      };

      // Crear promoción
      const promotion = await Promotion.create(promotionPayload);

      // Cargar promoción completa
      const fullPromotion = await this.getPromotionWithRelations(promotion.id);

      if (!fullPromotion) {
        return {
          success: false,
          message: 'Error al cargar la promoción creada',
          error: 'PROMOTION_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'promotion_created',
        'promotion',
        {
          userId: createdBy,
          resourceId: promotion.id.toString(),
          newValues: promotionData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Promoción creada exitosamente',
        data: fullPromotion,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando promoción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza una promoción existente
   */
  async updatePromotion(
    promotionId: number,
    updateData: UpdatePromotionRequest,
    updatedBy: number
  ): Promise<ApiResponse<PromotionResponse>> {
    try {
      const promotion = await Promotion.findByPk(promotionId);
      if (!promotion) {
        return {
          success: false,
          message: 'Promoción no encontrada',
          error: 'PROMOTION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos (solo el creador puede actualizar)
      if (promotion.createdBy !== updatedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para actualizar esta promoción',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validatePromotionData(updateData as Partial<CreatePromotionRequest>, true);
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
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        isActive: promotion.isActive,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        eventIds: promotion.eventIds,
        categoryIds: promotion.categoryIds,
        minPurchaseAmount: promotion.minPurchaseAmount,
        userTypes: promotion.userTypes,
        isStackable: promotion.isStackable,
        priority: promotion.priority
      };

      // Actualizar promoción
      await promotion.update(updateData);

      // Cargar promoción actualizada
      const updatedPromotion = await this.getPromotionWithRelations(promotionId);

      if (!updatedPromotion) {
        return {
          success: false,
          message: 'Error al cargar la promoción actualizada',
          error: 'PROMOTION_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'promotion_updated',
        'promotion',
        {
          userId: updatedBy,
          resourceId: promotionId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Promoción actualizada exitosamente',
        data: updatedPromotion,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando promoción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina una promoción (soft delete)
   */
  async deletePromotion(
    promotionId: number,
    deletedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const promotion = await Promotion.findByPk(promotionId);
      if (!promotion) {
        return {
          success: false,
          message: 'Promoción no encontrada',
          error: 'PROMOTION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (promotion.createdBy !== deletedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para eliminar esta promoción',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si tiene códigos promocionales activos
      const activePromoCodes = await PromoCode.count({
        where: {
          promotionId: promotionId,
          isActive: true
        }
      });

      if (activePromoCodes > 0) {
        return {
          success: false,
          message: 'No se puede eliminar una promoción con códigos promocionales activos',
          error: 'PROMOTION_HAS_ACTIVE_PROMO_CODES',
          timestamp: new Date().toISOString()
        };
      }

      // Soft delete
      await promotion.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'promotion_deleted',
        'promotion',
        {
          userId: deletedBy,
          resourceId: promotionId.toString(),
          oldValues: {
            name: promotion.name,
            type: promotion.type,
            isActive: promotion.isActive
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Promoción eliminada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando promoción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Activa una promoción
   */
  async activatePromotion(
    promotionId: number,
    activatedBy: number
  ): Promise<ApiResponse<PromotionResponse>> {
    try {
      const promotion = await Promotion.findByPk(promotionId);
      if (!promotion) {
        return {
          success: false,
          message: 'Promoción no encontrada',
          error: 'PROMOTION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (promotion.createdBy !== activatedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para activar esta promoción',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      if (promotion.isActive) {
        return {
          success: false,
          message: 'La promoción ya está activa',
          error: 'PROMOTION_ALREADY_ACTIVE',
          timestamp: new Date().toISOString()
        };
      }

      // Activar promoción
      await promotion.update({ isActive: true });

      // Cargar promoción actualizada
      const updatedPromotion = await this.getPromotionWithRelations(promotionId);

      if (!updatedPromotion) {
        return {
          success: false,
          message: 'Error al cargar la promoción activada',
          error: 'PROMOTION_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'promotion_activated',
        'promotion',
        {
          userId: activatedBy,
          resourceId: promotionId.toString(),
          newValues: { isActive: true },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Promoción activada exitosamente',
        data: updatedPromotion,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error activando promoción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Desactiva una promoción
   */
  async deactivatePromotion(
    promotionId: number,
    deactivatedBy: number
  ): Promise<ApiResponse<PromotionResponse>> {
    try {
      const promotion = await Promotion.findByPk(promotionId);
      if (!promotion) {
        return {
          success: false,
          message: 'Promoción no encontrada',
          error: 'PROMOTION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (promotion.createdBy !== deactivatedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para desactivar esta promoción',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      if (!promotion.isActive) {
        return {
          success: false,
          message: 'La promoción ya está inactiva',
          error: 'PROMOTION_ALREADY_INACTIVE',
          timestamp: new Date().toISOString()
        };
      }

      // Desactivar promoción
      await promotion.update({ isActive: false });

      // Cargar promoción actualizada
      const updatedPromotion = await this.getPromotionWithRelations(promotionId);

      if (!updatedPromotion) {
        return {
          success: false,
          message: 'Error al cargar la promoción desactivada',
          error: 'PROMOTION_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'promotion_deactivated',
        'promotion',
        {
          userId: deactivatedBy,
          resourceId: promotionId.toString(),
          newValues: { isActive: false },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Promoción desactivada exitosamente',
        data: updatedPromotion,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error desactivando promoción:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // CONSULTAS Y BÚSQUEDAS
  // ====================================================================

  /**
   * Obtiene promociones con filtros y paginación
   */
  async getPromotions(filters: PromotionFilters = {}): Promise<ApiResponse<PaginatedResponse<PromotionResponse>>> {
    try {
      const {
        limit = 20,
        offset = 0,
        type,
        isActive,
        startDate,
        endDate,
        createdBy
      } = filters;

      // Construir filtros
      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (startDate || endDate) {
        where[Op.or] = [];
        if (startDate) {
          where[Op.or].push({
            startDate: { [Op.lte]: startDate },
            endDate: { [Op.gte]: startDate }
          });
        }
        if (endDate) {
          where[Op.or].push({
            startDate: { [Op.lte]: endDate },
            endDate: { [Op.gte]: endDate }
          });
        }
      }

      if (createdBy) {
        where.createdBy = createdBy;
      }

      const { rows: promotions, count: total } = await Promotion.findAndCountAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
          { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const formattedPromotions: PromotionResponse[] = promotions.map(promotion => ({
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        isActive: promotion.isActive,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        eventIds: promotion.eventIds,
        categoryIds: promotion.categoryIds,
        minPurchaseAmount: promotion.minPurchaseAmount,
        userTypes: promotion.userTypes,
        isStackable: promotion.isStackable,
        priority: promotion.priority,
        createdBy: promotion.createdBy,
        updatedBy: promotion.updatedBy,
        createdAt: promotion.createdAt,
        updatedAt: promotion.updatedAt,
        deletedAt: promotion.deletedAt
      }));

      return {
        success: true,
        message: 'Promociones obtenidas exitosamente',
        data: {
          data: formattedPromotions,
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo promociones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene una promoción por ID
   */
  async getPromotionById(promotionId: number): Promise<ApiResponse<PromotionResponse>> {
    try {
      const promotion = await this.getPromotionWithRelations(promotionId);
      if (!promotion) {
        return {
          success: false,
          message: 'Promoción no encontrada',
          error: 'PROMOTION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Promoción obtenida exitosamente',
        data: promotion,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo promoción por ID:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES Y HELPERS
  // ====================================================================

  /**
   * Obtiene una promoción con todas sus relaciones cargadas
   */
  private async getPromotionWithRelations(promotionId: number): Promise<PromotionResponse | null> {
    const promotion = await Promotion.findByPk(promotionId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!promotion) return null;

    return {
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      isActive: promotion.isActive,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      eventIds: promotion.eventIds,
      categoryIds: promotion.categoryIds,
      minPurchaseAmount: promotion.minPurchaseAmount,
      userTypes: promotion.userTypes,
      isStackable: promotion.isStackable,
      priority: promotion.priority,
      createdBy: promotion.createdBy,
      updatedBy: promotion.updatedBy,
      createdAt: promotion.createdAt,
      updatedAt: promotion.updatedAt,
      deletedAt: promotion.deletedAt
    };
  }

  /**
   * Valida datos de promoción
   */
  private async validatePromotionData(data: Partial<CreatePromotionRequest>, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Validaciones básicas
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.push({
          field: 'name',
          message: 'El nombre debe tener al menos 2 caracteres',
          value: data.name
        });
      }
    }

    if (!isUpdate || data.type !== undefined) {
      if (!data.type || !Object.values(PromotionType).includes(data.type)) {
        errors.push({
          field: 'type',
          message: 'Tipo de promoción inválido',
          value: data.type
        });
      }
    }

    // Validar fechas
    if (!isUpdate || data.startDate !== undefined || data.endDate !== undefined) {
      if (data.startDate && data.endDate && data.startDate >= data.endDate) {
        errors.push({
          field: 'endDate',
          message: 'La fecha de fin debe ser posterior a la fecha de inicio',
          value: data.endDate
        });
      }
    }

    // Validar restricciones según tipo
    if (data.type === PromotionType.EVENT_SPECIFIC && (!data.eventIds || data.eventIds.length === 0)) {
      errors.push({
        field: 'eventIds',
        message: 'Las promociones específicas de evento requieren al menos un evento',
        value: data.eventIds
      });
    }

    if (data.type === PromotionType.CATEGORY_SPECIFIC && (!data.categoryIds || data.categoryIds.length === 0)) {
      errors.push({
        field: 'categoryIds',
        message: 'Las promociones específicas de categoría requieren al menos una categoría',
        value: data.categoryIds
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const promotionService = new PromotionService();
