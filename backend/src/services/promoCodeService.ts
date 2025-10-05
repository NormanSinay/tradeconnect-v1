/**
 * @fileoverview Servicio de Códigos Promocionales para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de códigos promocionales
 *
 * Archivo: backend/src/services/promoCodeService.ts
 */

import { PromoCode, DiscountType } from '../models/PromoCode';
import { PromoCodeUsage, PromoCodeUsageStatus } from '../models/PromoCodeUsage';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Registration } from '../models/Registration';
import { AuditLog } from '../models/AuditLog';
import {
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
  PromoCodeResponse,
  ValidatePromoCodeRequest,
  ValidatePromoCodeResponse,
  ApplyPromoCodeRequest,
  ApplyPromoCodeResponse,
  PromoCodeFilters,
  PromoCodeStats,
  PaginatedResponse
} from '../types/promotion.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Servicio para manejo de operaciones de códigos promocionales
 */
export class PromoCodeService {

  // ====================================================================
  // OPERACIONES CRUD BÁSICAS
  // ====================================================================

  /**
   * Crea un nuevo código promocional
   */
  async createPromoCode(
    promoCodeData: CreatePromoCodeRequest,
    createdBy: number
  ): Promise<ApiResponse<PromoCodeResponse>> {
    try {
      // Validar datos de entrada
      const validation = await this.validatePromoCodeData(promoCodeData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de código promocional inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar unicidad del código (case-insensitive)
      const existingCode = await PromoCode.findOne({
        where: {
          code: { [Op.iLike]: promoCodeData.code }
        }
      });

      if (existingCode) {
        return {
          success: false,
          message: 'El código promocional ya existe',
          error: 'PROMO_CODE_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del código promocional
      const promoCodePayload: any = {
        ...promoCodeData,
        code: promoCodeData.code.toUpperCase(), // Convertir a mayúsculas
        createdBy,
        isActive: promoCodeData.isActive ?? true,
        isStackable: promoCodeData.isStackable ?? true,
        maxUsesPerUser: promoCodeData.maxUsesPerUser ?? 1,
        currentUsesTotal: 0
      };

      // Crear código promocional
      const promoCode = await PromoCode.create(promoCodePayload);

      // Cargar código promocional completo
      const fullPromoCode = await this.getPromoCodeWithRelations(promoCode.id);

      if (!fullPromoCode) {
        return {
          success: false,
          message: 'Error al cargar el código promocional creado',
          error: 'PROMO_CODE_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'promo_code_created',
        'promo_code',
        {
          userId: createdBy,
          resourceId: promoCode.id.toString(),
          newValues: promoCodeData,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Código promocional creado exitosamente',
        data: fullPromoCode,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando código promocional:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un código promocional existente
   */
  async updatePromoCode(
    promoCodeId: number,
    updateData: UpdatePromoCodeRequest,
    updatedBy: number
  ): Promise<ApiResponse<PromoCodeResponse>> {
    try {
      const promoCode = await PromoCode.findByPk(promoCodeId);
      if (!promoCode) {
        return {
          success: false,
          message: 'Código promocional no encontrado',
          error: 'PROMO_CODE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (promoCode.createdBy !== updatedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para actualizar este código promocional',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validatePromoCodeData(updateData as Partial<CreatePromoCodeRequest>, true);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de actualización inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar unicidad si se está cambiando el código
      if (updateData.code && updateData.code.toUpperCase() !== promoCode.code) {
        const existingCode = await PromoCode.findOne({
          where: {
            code: { [Op.iLike]: updateData.code },
            id: { [Op.ne]: promoCodeId }
          }
        });

        if (existingCode) {
          return {
            success: false,
            message: 'El código promocional ya existe',
            error: 'PROMO_CODE_ALREADY_EXISTS',
            timestamp: new Date().toISOString()
          };
        }
      }

      const oldValues = {
        code: promoCode.code,
        name: promoCode.name,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        isActive: promoCode.isActive,
        maxUsesTotal: promoCode.maxUsesTotal,
        maxUsesPerUser: promoCode.maxUsesPerUser
      };

      // Preparar datos de actualización
      const updatePayload: any = {
        ...updateData
      };

      if (updateData.code) {
        updatePayload.code = updateData.code.toUpperCase();
      }

      // Actualizar código promocional
      await promoCode.update(updatePayload);

      // Cargar código promocional actualizado
      const updatedPromoCode = await this.getPromoCodeWithRelations(promoCodeId);

      if (!updatedPromoCode) {
        return {
          success: false,
          message: 'Error al cargar el código promocional actualizado',
          error: 'PROMO_CODE_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'promo_code_updated',
        'promo_code',
        {
          userId: updatedBy,
          resourceId: promoCodeId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Código promocional actualizado exitosamente',
        data: updatedPromoCode,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando código promocional:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un código promocional (soft delete)
   */
  async deletePromoCode(
    promoCodeId: number,
    deletedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const promoCode = await PromoCode.findByPk(promoCodeId);
      if (!promoCode) {
        return {
          success: false,
          message: 'Código promocional no encontrado',
          error: 'PROMO_CODE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (promoCode.createdBy !== deletedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para eliminar este código promocional',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si tiene usos activos
      const activeUsages = await PromoCodeUsage.count({
        where: {
          promoCodeId: promoCodeId,
          status: PromoCodeUsageStatus.APPLIED
        }
      });

      if (activeUsages > 0) {
        return {
          success: false,
          message: 'No se puede eliminar un código promocional con usos activos',
          error: 'PROMO_CODE_HAS_ACTIVE_USAGES',
          timestamp: new Date().toISOString()
        };
      }

      // Soft delete
      await promoCode.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'promo_code_deleted',
        'promo_code',
        {
          userId: deletedBy,
          resourceId: promoCodeId.toString(),
          oldValues: {
            code: promoCode.code,
            name: promoCode.name,
            isActive: promoCode.isActive
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Código promocional eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando código promocional:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // VALIDACIÓN Y APLICACIÓN DE CÓDIGOS
  // ====================================================================

  /**
   * Valida un código promocional
   */
  async validatePromoCode(
    request: ValidatePromoCodeRequest
  ): Promise<ValidatePromoCodeResponse> {
    try {
      const { code, eventId, userId, cartTotal } = request;

      // Buscar código promocional (case-insensitive)
      const promoCode = await PromoCode.findOne({
        where: {
          code: { [Op.iLike]: code },
          isActive: true
        },
        include: [
          {
            model: require('./promotionService').Promotion,
            as: 'promotion',
            required: false
          }
        ]
      });

      if (!promoCode) {
        return {
          valid: false,
          message: 'Código promocional no encontrado o inactivo'
        };
      }

      // Validar vigencia temporal
      const now = new Date();
      if (promoCode.startDate && now < promoCode.startDate) {
        return {
          valid: false,
          message: 'El código promocional aún no está disponible'
        };
      }

      if (promoCode.endDate && now > promoCode.endDate) {
        return {
          valid: false,
          message: 'El código promocional ha expirado'
        };
      }

      // Validar límites de uso total
      if (!promoCode.canBeUsedTotal) {
        return {
          valid: false,
          message: 'El código promocional ha alcanzado el límite máximo de usos'
        };
      }

      // Validar límites de uso por usuario
      if (userId && !(await promoCode.canBeUsedByUser(userId))) {
        return {
          valid: false,
          message: `Has alcanzado el límite de usos para este código promocional (${promoCode.maxUsesPerUser})`
        };
      }

      // Validar monto mínimo de compra
      if (promoCode.minPurchaseAmount && cartTotal && cartTotal < promoCode.minPurchaseAmount) {
        return {
          valid: false,
          message: `El monto mínimo de compra para este código es de ${promoCode.minPurchaseAmount}`
        };
      }

      // Calcular descuento
      const discountAmount = promoCode.calculateDiscount(cartTotal || 0);

      const promoCodeDetails = await this.getPromoCodeWithRelations(promoCode.id);
      if (!promoCodeDetails) {
        return {
          valid: false,
          message: 'Error al cargar los detalles del código promocional'
        };
      }

      return {
        valid: true,
        promoCode: promoCodeDetails,
        discountAmount,
        finalAmount: Math.max(0, (cartTotal || 0) - discountAmount),
        message: 'Código promocional válido'
      };

    } catch (error) {
      logger.error('Error validando código promocional:', error);
      return {
        valid: false,
        message: 'Error interno del servidor al validar el código promocional'
      };
    }
  }

  /**
   * Aplica un código promocional
   */
  async applyPromoCode(
    request: ApplyPromoCodeRequest,
    appliedBy: number,
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
      registrationId?: number;
      cartSessionId?: string;
    }
  ): Promise<ApplyPromoCodeResponse> {
    try {
      const { code, eventId, userId, quantity = 1 } = request;

      // Validar código
      const validation = await this.validatePromoCode({
        code,
        eventId,
        userId,
        cartTotal: request.cartTotal
      });

      if (!validation.valid || !validation.promoCode) {
        return {
          success: false,
          discountAmount: 0,
          finalAmount: request.cartTotal,
          message: validation.message
        };
      }

      const promoCode = validation.promoCode;

      // Calcular descuento considerando cantidad
      const basePrice = request.cartTotal / quantity;
      const discountPerUnit = promoCode.discountType === DiscountType.PERCENTAGE
        ? (basePrice * promoCode.discountValue) / 100
        : promoCode.discountType === DiscountType.FIXED_AMOUNT
        ? Math.min(promoCode.discountValue, basePrice)
        : 0; // BUY_X_GET_Y requiere lógica más compleja

      const totalDiscount = Math.min(discountPerUnit * quantity, request.cartTotal);

      // Registrar uso del código
      await PromoCodeUsage.create({
        promoCodeId: promoCode.id,
        userId: appliedBy,
        registrationId: metadata?.registrationId,
        cartSessionId: metadata?.cartSessionId,
        eventId: eventId,
        discountAmount: totalDiscount,
        originalAmount: request.cartTotal,
        finalAmount: request.cartTotal - totalDiscount,
        currency: 'GTQ', // TODO: Obtener de configuración
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        status: PromoCodeUsageStatus.APPLIED,
        appliedAt: new Date()
      });

      // Incrementar contador de usos
      await PromoCode.increment('currentUsesTotal', {
        where: { id: promoCode.id }
      });

      return {
        success: true,
        promoCode,
        discountAmount: totalDiscount,
        finalAmount: request.cartTotal - totalDiscount,
        message: 'Código promocional aplicado exitosamente',
        appliedDiscounts: [{
          type: 'promo',
          description: `Código promocional: ${promoCode.code}`,
          amount: totalDiscount,
          percentage: Math.round((totalDiscount / request.cartTotal) * 100)
        }]
      };

    } catch (error) {
      logger.error('Error aplicando código promocional:', error);
      return {
        success: false,
        discountAmount: 0,
        finalAmount: request.cartTotal,
        message: 'Error interno del servidor al aplicar el código promocional'
      };
    }
  }

  // ====================================================================
  // CONSULTAS Y BÚSQUEDAS
  // ====================================================================

  /**
   * Obtiene códigos promocionales con filtros y paginación
   */
  async getPromoCodes(filters: PromoCodeFilters = {}): Promise<ApiResponse<PaginatedResponse<PromoCodeResponse>>> {
    try {
      const {
        limit = 20,
        offset = 0,
        isActive,
        discountType,
        promotionId,
        createdBy,
        startDate,
        endDate
      } = filters;

      // Construir filtros
      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (discountType) {
        where.discountType = discountType;
      }

      if (promotionId) {
        where.promotionId = promotionId;
      }

      if (createdBy) {
        where.createdBy = createdBy;
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

      const { rows: promoCodes, count: total } = await PromoCode.findAndCountAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
          { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] },
          {
            model: require('./promotionService').Promotion,
            as: 'promotion',
            required: false,
            attributes: ['id', 'name', 'type']
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const formattedPromoCodes: PromoCodeResponse[] = promoCodes.map(promoCode => ({
        id: promoCode.id,
        code: promoCode.code,
        name: promoCode.name,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        startDate: promoCode.startDate,
        endDate: promoCode.endDate,
        maxUsesTotal: promoCode.maxUsesTotal,
        maxUsesPerUser: promoCode.maxUsesPerUser,
        currentUsesTotal: promoCode.currentUsesTotal,
        isActive: promoCode.isActive,
        minPurchaseAmount: promoCode.minPurchaseAmount,
        maxDiscountAmount: promoCode.maxDiscountAmount,
        isStackable: promoCode.isStackable,
        promotionId: promoCode.promotionId,
        createdBy: promoCode.createdBy,
        updatedBy: promoCode.updatedBy,
        createdAt: promoCode.createdAt,
        updatedAt: promoCode.updatedAt,
        deletedAt: promoCode.deletedAt
      }));

      return {
        success: true,
        message: 'Códigos promocionales obtenidos exitosamente',
        data: {
          data: formattedPromoCodes,
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo códigos promocionales:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de un código promocional
   */
  async getPromoCodeStats(promoCodeId: number): Promise<ApiResponse<PromoCodeStats>> {
    try {
      const promoCode = await PromoCode.findByPk(promoCodeId, {
        include: [{ model: PromoCodeUsage, as: 'usages' }]
      });

      if (!promoCode) {
        return {
          success: false,
          message: 'Código promocional no encontrado',
          error: 'PROMO_CODE_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const usages = promoCode.usages || [];
      const appliedUsages = usages.filter(u => u.status === PromoCodeUsageStatus.APPLIED);

      const stats: PromoCodeStats = {
        totalUses: appliedUsages.length,
        uniqueUsers: new Set(appliedUsages.map(u => u.userId)).size,
        totalDiscount: appliedUsages.reduce((sum, u) => sum + u.discountAmount, 0),
        averageDiscount: appliedUsages.length > 0
          ? appliedUsages.reduce((sum, u) => sum + u.discountAmount, 0) / appliedUsages.length
          : 0,
        conversionRate: usages.length > 0 ? (appliedUsages.length / usages.length) * 100 : 0,
        revenueImpact: appliedUsages.reduce((sum, u) => sum + (u.originalAmount - u.finalAmount), 0)
      };

      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas del código promocional:', error);
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
   * Obtiene un código promocional con todas sus relaciones cargadas
   */
  private async getPromoCodeWithRelations(promoCodeId: number): Promise<PromoCodeResponse | null> {
    const promoCode = await PromoCode.findByPk(promoCodeId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] },
        {
          model: require('./promotionService').Promotion,
          as: 'promotion',
          required: false,
          attributes: ['id', 'name', 'type']
        }
      ]
    });

    if (!promoCode) return null;

    return {
      id: promoCode.id,
      code: promoCode.code,
      name: promoCode.name,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      startDate: promoCode.startDate,
      endDate: promoCode.endDate,
      maxUsesTotal: promoCode.maxUsesTotal,
      maxUsesPerUser: promoCode.maxUsesPerUser,
      currentUsesTotal: promoCode.currentUsesTotal,
      isActive: promoCode.isActive,
      minPurchaseAmount: promoCode.minPurchaseAmount,
      maxDiscountAmount: promoCode.maxDiscountAmount,
      isStackable: promoCode.isStackable,
      promotionId: promoCode.promotionId,
      createdBy: promoCode.createdBy,
      updatedBy: promoCode.updatedBy,
      createdAt: promoCode.createdAt,
      updatedAt: promoCode.updatedAt,
      deletedAt: promoCode.deletedAt
    };
  }

  /**
   * Valida datos de código promocional
   */
  private async validatePromoCodeData(data: Partial<CreatePromoCodeRequest>, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Validaciones básicas
    if (!isUpdate || data.code !== undefined) {
      if (!data.code || data.code.trim().length < 4) {
        errors.push({
          field: 'code',
          message: 'El código debe tener al menos 4 caracteres',
          value: data.code
        });
      } else if (!/^[A-Z0-9_-]+$/i.test(data.code)) {
        errors.push({
          field: 'code',
          message: 'El código solo puede contener letras, números, guiones y guiones bajos',
          value: data.code
        });
      }
    }

    if (!isUpdate || data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.push({
          field: 'name',
          message: 'El nombre debe tener al menos 2 caracteres',
          value: data.name
        });
      }
    }

    if (!isUpdate || data.discountType !== undefined) {
      if (!data.discountType || !Object.values(DiscountType).includes(data.discountType)) {
        errors.push({
          field: 'discountType',
          message: 'Tipo de descuento inválido',
          value: data.discountType
        });
      }
    }

    if (!isUpdate || data.discountValue !== undefined) {
      if (data.discountValue === undefined || data.discountValue < 0) {
        errors.push({
          field: 'discountValue',
          message: 'El valor del descuento debe ser mayor o igual a 0',
          value: data.discountValue
        });
      }

      if (data.discountType === DiscountType.PERCENTAGE && data.discountValue !== undefined && data.discountValue > 100) {
        errors.push({
          field: 'discountValue',
          message: 'El porcentaje de descuento no puede exceder 100%',
          value: data.discountValue
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const promoCodeService = new PromoCodeService();