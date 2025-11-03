/**
 * @fileoverview Servicio de Cupones Avanzados para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicios de negocio para gestión de cupones avanzados
 *
 * Archivo: backend/src/services/advancedCouponService.ts
 */

import { Op } from 'sequelize';
import { AdvancedCoupon, AdvancedCouponUsage } from '../models';
import {
  CouponApplicationRequest,
  CouponApplicationResponse,
  CouponValidationResponse,
  CouponFilters,
  CouponSortOptions,
  CouponEvaluationContext,
  CouponStatus,
  CouponUsageStatus
} from '../types/advanced-coupon.types';
import { logger } from '../utils/logger';

/**
 * Servicio para manejo de operaciones de cupones avanzados
 */
export class AdvancedCouponService {

  // ====================================================================
  // GESTIÓN DE CUPONES AVANZADOS
  // ====================================================================

  /**
   * Crear un nuevo cupón avanzado
   */
  async createCoupon(couponData: any): Promise<{
    success: boolean;
    data?: AdvancedCoupon;
    error?: string;
    message?: string;
  }> {
    try {
      // Validar código único
      const existingCoupon = await AdvancedCoupon.findByCode(couponData.code);
      if (existingCoupon) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Ya existe un cupón con este código'
        };
      }

      // Crear el cupón
      const coupon = await AdvancedCoupon.create(couponData);

      logger.info(`Cupón avanzado creado: ${coupon.code} (ID: ${coupon.id})`);

      return {
        success: true,
        data: coupon,
        message: 'Cupón avanzado creado exitosamente'
      };

    } catch (error) {
      logger.error('Error creando cupón avanzado:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Obtener cupón por ID
   */
  async getCouponById(couponId: number): Promise<{
    success: boolean;
    data?: AdvancedCoupon;
    error?: string;
    message?: string;
  }> {
    try {
      const coupon = await AdvancedCoupon.findByPk(couponId, {
        include: [
          {
            model: require('../models/User').User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: require('../models/User').User,
            as: 'updater',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!coupon) {
        return {
          success: false,
          error: 'COUPON_NOT_FOUND',
          message: 'Cupón no encontrado'
        };
      }

      return {
        success: true,
        data: coupon,
        message: 'Cupón obtenido exitosamente'
      };

    } catch (error) {
      logger.error('Error obteniendo cupón por ID:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Listar cupones con filtros y paginación
   */
  async getCoupons(options: {
    page: number;
    limit: number;
    filters?: CouponFilters;
    sortOptions?: CouponSortOptions;
  }): Promise<{
    success: boolean;
    data?: {
      coupons: AdvancedCoupon[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    error?: string;
    message?: string;
  }> {
    try {
      const { page, limit, filters, sortOptions } = options;
      const offset = (page - 1) * limit;

      // Construir where clause
      const whereClause: any = {};

      if (filters) {
        if (filters.status && filters.status.length > 0) {
          whereClause.status = { [Op.in]: filters.status };
        }

        if (filters.applicationType && filters.applicationType.length > 0) {
          whereClause.applicationType = { [Op.in]: filters.applicationType };
        }

        if (filters.discountType && filters.discountType.length > 0) {
          whereClause.discountConfig = {
            type: { [Op.in]: filters.discountType }
          };
        }

        if (filters.applicableEvents && filters.applicableEvents.length > 0) {
          whereClause.applicableEvents = { [Op.overlap]: filters.applicableEvents };
        }

        if (filters.applicableCategories && filters.applicableCategories.length > 0) {
          whereClause.applicableCategories = { [Op.overlap]: filters.applicableCategories };
        }

        if (filters.applicableUserTypes && filters.applicableUserTypes.length > 0) {
          whereClause.applicableUserTypes = { [Op.overlap]: filters.applicableUserTypes };
        }

        if (filters.applicableUserSegments && filters.applicableUserSegments.length > 0) {
          whereClause.applicableUserSegments = { [Op.overlap]: filters.applicableUserSegments };
        }

        if (filters.startDate || filters.endDate) {
          whereClause[Op.or] = [];
          if (filters.startDate) {
            whereClause[Op.or].push({
              startDate: { [Op.lte]: filters.startDate }
            });
          }
          if (filters.endDate) {
            whereClause[Op.or].push({
              endDate: { [Op.gte]: filters.endDate }
            });
          }
        }

        if (filters.createdBy) {
          whereClause.createdBy = filters.createdBy;
        }

        if (filters.isActive !== undefined) {
          whereClause.status = filters.isActive ? CouponStatus.ACTIVE : { [Op.ne]: CouponStatus.ACTIVE };
        }

        if (filters.autoApply !== undefined) {
          whereClause.autoApply = filters.autoApply;
        }

        if (filters.requiresApproval !== undefined) {
          whereClause.requiresApproval = filters.requiresApproval;
        }
      }

      // Construir order clause
      const orderClause: any[] = [];
      if (sortOptions) {
        orderClause.push([sortOptions.field, sortOptions.order]);
      } else {
        orderClause.push(['createdAt', 'DESC']);
      }

      // Ejecutar consulta
      const { rows: coupons, count: total } = await AdvancedCoupon.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: orderClause,
        include: [
          {
            model: require('../models/User').User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          coupons,
          total,
          page,
          limit,
          totalPages
        },
        message: 'Cupones obtenidos exitosamente'
      };

    } catch (error) {
      logger.error('Error obteniendo cupones:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Actualizar cupón avanzado
   */
  async updateCoupon(couponId: number, updateData: any): Promise<{
    success: boolean;
    data?: AdvancedCoupon;
    error?: string;
    message?: string;
  }> {
    try {
      const coupon = await AdvancedCoupon.findByPk(couponId);

      if (!coupon) {
        return {
          success: false,
          error: 'COUPON_NOT_FOUND',
          message: 'Cupón no encontrado'
        };
      }

      // Validar código único si se está cambiando
      if (updateData.code && updateData.code !== coupon.code) {
        const existingCoupon = await AdvancedCoupon.findByCode(updateData.code);
        if (existingCoupon) {
          return {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Ya existe un cupón con este código'
          };
        }
      }

      // Actualizar el cupón
      await coupon.update(updateData);

      logger.info(`Cupón avanzado actualizado: ${coupon.code} (ID: ${coupon.id})`);

      return {
        success: true,
        data: coupon,
        message: 'Cupón avanzado actualizado exitosamente'
      };

    } catch (error) {
      logger.error('Error actualizando cupón avanzado:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Eliminar cupón avanzado (soft delete)
   */
  async deleteCoupon(couponId: number): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      const coupon = await AdvancedCoupon.findByPk(couponId);

      if (!coupon) {
        return {
          success: false,
          error: 'COUPON_NOT_FOUND',
          message: 'Cupón no encontrado'
        };
      }

      // Verificar si el cupón tiene usos activos
      const activeUsages = await AdvancedCouponUsage.count({
        where: {
          advancedCouponId: couponId,
          status: CouponUsageStatus.APPLIED
        }
      });

      if (activeUsages > 0) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'No se puede eliminar un cupón que tiene usos activos'
        };
      }

      // Soft delete
      await coupon.destroy();

      logger.info(`Cupón avanzado eliminado: ${coupon.code} (ID: ${coupon.id})`);

      return {
        success: true,
        message: 'Cupón avanzado eliminado exitosamente'
      };

    } catch (error) {
      logger.error('Error eliminando cupón avanzado:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  // ====================================================================
  // VALIDACIÓN Y APLICACIÓN DE CUPONES
  // ====================================================================

  /**
   * Validar cupón avanzado
   */
  async validateCoupon(
    applicationData: CouponApplicationRequest,
    userId: number
  ): Promise<CouponValidationResponse> {
    try {
      // Buscar el cupón por código
      const coupon = await AdvancedCoupon.findByCode(applicationData.couponCode);

      if (!coupon) {
        return {
          isValid: false,
          errors: ['Cupón no encontrado'],
          discountAmount: 0,
          finalAmount: applicationData.subtotal
        };
      }

      // Construir contexto de evaluación
      const context: CouponEvaluationContext = {
        userId,
        ...applicationData.context,
        currentDate: new Date()
      };

      // Calcular subtotal de items aplicables
      const applicableSubtotal = this.calculateApplicableSubtotal(
        applicationData.items,
        coupon
      );

      context.purchaseAmount = applicableSubtotal;
      context.itemQuantity = applicationData.items.reduce((sum, item) => sum + item.quantity, 0);

      // Validar condiciones del cupón
      const evaluationResult = coupon.evaluateConditions(context);

      if (!evaluationResult) {
        return {
          isValid: false,
          errors: ['El cupón no cumple con las condiciones requeridas'],
          discountAmount: 0,
          finalAmount: applicationData.subtotal
        };
      }

      // Verificar límites de uso
      if (!coupon.canBeUsedTotal) {
        return {
          isValid: false,
          errors: ['El cupón ha alcanzado su límite total de usos'],
          discountAmount: 0,
          finalAmount: applicationData.subtotal
        };
      }

      const canBeUsedByUser = await coupon.canBeUsedByUser(userId);
      if (!canBeUsedByUser) {
        return {
          isValid: false,
          errors: ['Has alcanzado el límite de usos de este cupón'],
          discountAmount: 0,
          finalAmount: applicationData.subtotal
        };
      }

      // Verificar vigencia
      if (!coupon.isCurrentlyValid) {
        return {
          isValid: false,
          errors: ['El cupón no está vigente'],
          discountAmount: 0,
          finalAmount: applicationData.subtotal
        };
      }

      // Calcular descuento
      const discountAmount = coupon.calculateDiscount(applicableSubtotal, context);

      if (discountAmount <= 0) {
        return {
          isValid: false,
          errors: ['El cupón no genera descuento para esta compra'],
          discountAmount: 0,
          finalAmount: applicationData.subtotal
        };
      }

      const finalAmount = Math.max(0, applicationData.subtotal - discountAmount);

      return {
        isValid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discountConfig: coupon.discountConfig,
          conditions: coupon.conditions
        },
        discountAmount,
        finalAmount
      };

    } catch (error) {
      logger.error('Error validando cupón avanzado:', error);
      return {
        isValid: false,
        errors: ['Error interno del servidor'],
        discountAmount: 0,
        finalAmount: applicationData.subtotal
      };
    }
  }

  /**
   * Aplicar cupón avanzado
   */
  async applyCoupon(
    applicationData: CouponApplicationRequest,
    userId: number
  ): Promise<CouponApplicationResponse> {
    try {
      // Primero validar el cupón
      const validation = await this.validateCoupon(applicationData, userId);

      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Obtener el cupón
      const coupon = await AdvancedCoupon.findByCode(applicationData.couponCode);
      if (!coupon) {
        return {
          success: false,
          errors: ['Cupón no encontrado']
        };
      }

      // Registrar el uso
      const usage = await AdvancedCouponUsage.recordUsage({
        advancedCouponId: coupon.id,
        userId,
        orderId: applicationData.orderId,
        discountAmount: validation.discountAmount!,
        originalAmount: applicationData.subtotal,
        finalAmount: validation.finalAmount!,
        context: applicationData.context
      });

      // Incrementar contador de usos del cupón
      coupon.incrementUsage();
      await coupon.save();

      logger.info(`Cupón aplicado: ${coupon.code} por usuario ${userId}, descuento: ${validation.discountAmount}`);

      return {
        success: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discountAmount: validation.discountAmount!,
          finalAmount: validation.finalAmount!
        }
      };

    } catch (error) {
      logger.error('Error aplicando cupón avanzado:', error);
      return {
        success: false,
        errors: ['Error interno del servidor']
      };
    }
  }

  // ====================================================================
  // ESTADÍSTICAS Y REPORTES
  // ====================================================================

  /**
   * Obtener estadísticas de un cupón específico
   */
  async getCouponStats(couponId: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
  }> {
    try {
      const coupon = await AdvancedCoupon.findByPk(couponId);

      if (!coupon) {
        return {
          success: false,
          error: 'COUPON_NOT_FOUND',
          message: 'Cupón no encontrado'
        };
      }

      const usageStats = await AdvancedCouponUsage.getUsageStats(couponId);

      const stats = {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          status: coupon.status,
          createdAt: coupon.createdAt
        },
        usage: usageStats
      };

      return {
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de cupón:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Obtener estadísticas generales de cupones
   */
  async getGeneralStats(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
  }> {
    try {
      const couponStats = await AdvancedCoupon.getUsageStats();
      const usageStats = await AdvancedCouponUsage.getUsageStats();

      const stats = {
        coupons: couponStats,
        usages: usageStats
      };

      return {
        success: true,
        data: stats,
        message: 'Estadísticas generales obtenidas exitosamente'
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas generales:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  // ====================================================================
  // CUPONES AUTOMÁTICOS
  // ====================================================================

  /**
   * Obtener cupones aplicables automáticamente
   */
  async getAutoApplicableCoupons(context: Record<string, any>, userId: number): Promise<{
    success: boolean;
    data?: AdvancedCoupon[];
    error?: string;
    message?: string;
  }> {
    try {
      const evaluationContext: CouponEvaluationContext = {
        userId,
        ...context,
        currentDate: new Date()
      };

      const applicableCoupons = await AdvancedCoupon.findApplicableForUser(userId, evaluationContext);

      // Filtrar solo cupones automáticos
      const autoCoupons = applicableCoupons.filter(coupon => coupon.autoApply);

      return {
        success: true,
        data: autoCoupons,
        message: 'Cupones automáticos obtenidos exitosamente'
      };

    } catch (error) {
      logger.error('Error obteniendo cupones automáticos:', error);
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      };
    }
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Calcular subtotal aplicable para un cupón
   */
  private calculateApplicableSubtotal(items: CouponApplicationRequest['items'], coupon: AdvancedCoupon): number {
    let subtotal = 0;

    for (const item of items) {
      // Verificar si el item aplica según configuración del cupón
      if (coupon.discountConfig.applicableItems && coupon.discountConfig.applicableItems.length > 0) {
        if (!coupon.discountConfig.applicableItems.includes(item.id)) continue;
      }

      if (coupon.discountConfig.excludedItems && coupon.discountConfig.excludedItems.includes(item.id)) {
        continue;
      }

      // Verificar cantidad mínima/máxima
      if (coupon.discountConfig.minQuantity && item.quantity < coupon.discountConfig.minQuantity) continue;
      if (coupon.discountConfig.maxQuantity && item.quantity > coupon.discountConfig.maxQuantity) continue;

      subtotal += item.price * item.quantity;
    }

    return subtotal;
  }
}

export const advancedCouponService = new AdvancedCouponService();