/**
 * @fileoverview Servicio de Descuentos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de descuentos por volumen y early bird
 *
 * Archivo: backend/src/services/discountService.ts
 */

import { VolumeDiscount } from '../models/VolumeDiscount';
import { EarlyBirdDiscount } from '../models/EarlyBirdDiscount';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import {
  CreateVolumeDiscountRequest,
  UpdateVolumeDiscountRequest,
  VolumeDiscountResponse,
  CreateEarlyBirdDiscountRequest,
  UpdateEarlyBirdDiscountRequest,
  EarlyBirdDiscountResponse,
  ApplicableDiscountsRequest,
  ApplicableDiscountsResponse,
  GetVolumeDiscountsRequest,
  GetVolumeDiscountsResponse,
  GetEarlyBirdDiscountsRequest,
  GetEarlyBirdDiscountsResponse,
  VolumeDiscountFilters
} from '../types/discount.types';
import { ApiResponse, PaginatedResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Servicio para manejo de operaciones de descuentos
 */
export class DiscountService {

  // ====================================================================
  // DESCUESTOS POR VOLUMEN
  // ====================================================================

  /**
   * Crea un descuento por volumen
   */
  async createVolumeDiscount(
    discountData: CreateVolumeDiscountRequest,
    createdBy: number
  ): Promise<ApiResponse<VolumeDiscountResponse>> {
    try {
      // Validar datos de entrada
      const validation = await this.validateVolumeDiscountData(discountData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de descuento por volumen inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el evento existe
      const event = await Event.findByPk(discountData.eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del descuento
      const discountPayload: any = {
        ...discountData,
        createdBy,
        isActive: discountData.isActive ?? true,
        priority: discountData.priority ?? 0
      };

      // Crear descuento
      const discount = await VolumeDiscount.create(discountPayload);

      // Cargar descuento completo
      const fullDiscount = await this.getVolumeDiscountWithRelations(discount.id);

      if (!fullDiscount) {
        return {
          success: false,
          message: 'Error al cargar el descuento por volumen creado',
          error: 'DISCOUNT_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'volume_discount_created',
        'volume_discount',
        {
          userId: createdBy,
          resourceId: discount.id.toString(),
          newValues: discountData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Descuento por volumen creado exitosamente',
        data: fullDiscount,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando descuento por volumen:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un descuento por volumen
   */
  async updateVolumeDiscount(
    discountId: number,
    updateData: UpdateVolumeDiscountRequest,
    updatedBy: number
  ): Promise<ApiResponse<VolumeDiscountResponse>> {
    try {
      const discount = await VolumeDiscount.findByPk(discountId);
      if (!discount) {
        return {
          success: false,
          message: 'Descuento por volumen no encontrado',
          error: 'DISCOUNT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (discount.createdBy !== updatedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para actualizar este descuento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Validar datos de actualización
      const validation = await this.validateVolumeDiscountData(updateData as Partial<CreateVolumeDiscountRequest>, true);
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
        eventId: discount.eventId,
        minQuantity: discount.minQuantity,
        maxQuantity: discount.maxQuantity,
        discountPercentage: discount.discountPercentage,
        isActive: discount.isActive,
        priority: discount.priority
      };

      // Actualizar descuento
      await discount.update(updateData);

      // Cargar descuento actualizado
      const updatedDiscount = await this.getVolumeDiscountWithRelations(discountId);

      if (!updatedDiscount) {
        return {
          success: false,
          message: 'Error al cargar el descuento actualizado',
          error: 'DISCOUNT_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'volume_discount_updated',
        'volume_discount',
        {
          userId: updatedBy,
          resourceId: discountId.toString(),
          oldValues,
          newValues: updateData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Descuento por volumen actualizado exitosamente',
        data: updatedDiscount,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando descuento por volumen:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Elimina un descuento por volumen
   */
  async deleteVolumeDiscount(
    discountId: number,
    deletedBy: number
  ): Promise<ApiResponse<void>> {
    try {
      const discount = await VolumeDiscount.findByPk(discountId);
      if (!discount) {
        return {
          success: false,
          message: 'Descuento por volumen no encontrado',
          error: 'DISCOUNT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar permisos
      if (discount.createdBy !== deletedBy) {
        // TODO: Verificar permisos de administrador
        return {
          success: false,
          message: 'No tiene permisos para eliminar este descuento',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        };
      }

      // Soft delete
      await discount.destroy();

      // Registrar en auditoría
      await AuditLog.log(
        'volume_discount_deleted',
        'volume_discount',
        {
          userId: deletedBy,
          resourceId: discountId.toString(),
          oldValues: {
            eventId: discount.eventId,
            minQuantity: discount.minQuantity,
            discountPercentage: discount.discountPercentage
          },
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Descuento por volumen eliminado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error eliminando descuento por volumen:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene descuentos por volumen de un evento
   */
  async getVolumeDiscountsByEvent(
    request: GetVolumeDiscountsRequest
  ): Promise<ApiResponse<GetVolumeDiscountsResponse>> {
    try {
      const { eventId, isActive = true } = request;

      // Verificar que el evento existe
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const discounts = await VolumeDiscount.findAll({
        where: {
          eventId,
          isActive
        },
        order: [['priority', 'DESC'], ['minQuantity', 'ASC']],
        include: [
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });

      const formattedDiscounts: VolumeDiscountResponse[] = discounts.map(discount => ({
        id: discount.id,
        eventId: discount.eventId,
        minQuantity: discount.minQuantity,
        maxQuantity: discount.maxQuantity,
        discountPercentage: discount.discountPercentage,
        description: discount.description,
        isActive: discount.isActive,
        priority: discount.priority,
        createdBy: discount.createdBy,
        updatedBy: discount.updatedBy,
        createdAt: discount.createdAt,
        updatedAt: discount.updatedAt,
        deletedAt: discount.deletedAt
      }));

      // Encontrar el siguiente nivel disponible
      const nextTier = formattedDiscounts.length > 0
        ? {
            minQuantity: Math.max(...formattedDiscounts.map(d => d.maxQuantity || d.minQuantity)) + 1,
            discountPercentage: 0 // Se puede calcular basado en reglas de negocio
          }
        : null;

      return {
        success: true,
        message: 'Descuentos por volumen obtenidos exitosamente',
        data: {
          discounts: formattedDiscounts,
          nextTier: nextTier || undefined
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo descuentos por volumen:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // DESCUESTOS EARLY BIRD
  // ====================================================================

  /**
   * Crea un descuento early bird
   */
  async createEarlyBirdDiscount(
    discountData: CreateEarlyBirdDiscountRequest,
    createdBy: number
  ): Promise<ApiResponse<EarlyBirdDiscountResponse>> {
    try {
      // Validar datos de entrada
      const validation = await this.validateEarlyBirdDiscountData(discountData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Datos de descuento early bird inválidos',
          error: 'VALIDATION_ERROR',
          details: validation.errors,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el evento existe
      const event = await Event.findByPk(discountData.eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Preparar datos del descuento
      const discountPayload: any = {
        ...discountData,
        createdBy,
        isActive: discountData.isActive ?? true,
        priority: discountData.priority ?? 0,
        autoApply: discountData.autoApply ?? true
      };

      // Crear descuento
      const discount = await EarlyBirdDiscount.create(discountPayload);

      // Cargar descuento completo
      const fullDiscount = await this.getEarlyBirdDiscountWithRelations(discount.id);

      if (!fullDiscount) {
        return {
          success: false,
          message: 'Error al cargar el descuento early bird creado',
          error: 'DISCOUNT_LOAD_ERROR',
          timestamp: new Date().toISOString()
        };
      }

      // Registrar en auditoría
      await AuditLog.log(
        'early_bird_discount_created',
        'early_bird_discount',
        {
          userId: createdBy,
          resourceId: discount.id.toString(),
          newValues: discountData,
          ipAddress: '127.0.0.1',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: 'Descuento early bird creado exitosamente',
        data: fullDiscount,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error creando descuento early bird:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene descuentos early bird de un evento
   */
  async getEarlyBirdDiscountsByEvent(
    request: GetEarlyBirdDiscountsRequest
  ): Promise<ApiResponse<GetEarlyBirdDiscountsResponse>> {
    try {
      const { eventId, registrationDate, isActive = true } = request;

      // Verificar que el evento existe
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const discounts = await EarlyBirdDiscount.findAll({
        where: {
          eventId,
          isActive
        },
        order: [['priority', 'DESC'], ['daysBeforeEvent', 'ASC']],
        include: [
          { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });

      const formattedDiscounts: EarlyBirdDiscountResponse[] = discounts.map(discount => ({
        id: discount.id,
        eventId: discount.eventId,
        daysBeforeEvent: discount.daysBeforeEvent,
        discountPercentage: discount.discountPercentage,
        description: discount.description,
        isActive: discount.isActive,
        priority: discount.priority,
        autoApply: discount.autoApply,
        createdBy: discount.createdBy,
        updatedBy: discount.updatedBy,
        createdAt: discount.createdAt,
        updatedAt: discount.updatedAt,
        deletedAt: discount.deletedAt
      }));

      // Encontrar descuento aplicable
      let applicableDiscount: EarlyBirdDiscountResponse | undefined;
      if (registrationDate) {
        // Buscar en la base de datos el descuento aplicable
        const applicableModel = await EarlyBirdDiscount.findApplicableDiscount(eventId, registrationDate, event.startDate);
        if (applicableModel) {
          applicableDiscount = formattedDiscounts.find(d => d.id === applicableModel.id);
        }
      }

      // Calcular días hasta el evento
      const daysUntilEvent = registrationDate
        ? Math.ceil((event.startDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      return {
        success: true,
        message: 'Descuentos early bird obtenidos exitosamente',
        data: {
          discounts: formattedDiscounts,
          applicableDiscount,
          daysUntilEvent
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo descuentos early bird:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // CÁLCULO DE DESCUESTOS APLICABLES
  // ====================================================================

  /**
   * Calcula todos los descuentos aplicables para una compra
   */
  async calculateApplicableDiscounts(
    request: ApplicableDiscountsRequest
  ): Promise<ApiResponse<ApplicableDiscountsResponse>> {
    try {
      const { eventId, userId, quantity, registrationDate, basePrice, currentDiscounts = [] } = request;

      // Verificar que el evento existe
      const event = await Event.findByPk(eventId);
      if (!event) {
        return {
          success: false,
          message: 'Evento no encontrado',
          error: 'EVENT_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      let totalDiscount = 0;
      const appliedDiscounts: any[] = [...currentDiscounts];

      // Calcular descuento por volumen
      const volumeDiscount = await VolumeDiscount.findApplicableDiscount(eventId, quantity);
      let volumeDiscountAmount = 0;
      if (volumeDiscount) {
        volumeDiscountAmount = volumeDiscount.calculateDiscount(basePrice, quantity);
        totalDiscount += volumeDiscountAmount;
        appliedDiscounts.push({
          type: 'volume',
          description: `Descuento por volumen (${quantity} participantes)`,
          amount: volumeDiscountAmount,
          percentage: volumeDiscount.discountPercentage
        });
      }

      // Calcular descuento early bird
      const earlyBirdDiscount = await EarlyBirdDiscount.findApplicableDiscount(eventId, registrationDate, event.startDate);
      let earlyBirdDiscountAmount = 0;
      if (earlyBirdDiscount) {
        earlyBirdDiscountAmount = earlyBirdDiscount.calculateDiscount(basePrice);
        totalDiscount += earlyBirdDiscountAmount;
        appliedDiscounts.push({
          type: 'early_bird',
          description: `Descuento early bird (${earlyBirdDiscount.daysBeforeEvent} días antes)`,
          amount: earlyBirdDiscountAmount,
          percentage: earlyBirdDiscount.discountPercentage
        });
      }

      // Calcular precio final
      const finalPrice = Math.max(event.minPrice || 0, basePrice - totalDiscount);

      // Encontrar siguiente nivel de descuento por volumen
      const allVolumeDiscounts = await VolumeDiscount.findAll({
        where: { eventId, isActive: true },
        order: [['minQuantity', 'ASC']]
      });

      const nextVolumeTier = allVolumeDiscounts
        .filter(d => d.minQuantity > quantity)
        .sort((a, b) => a.minQuantity - b.minQuantity)[0];

      let nextTierInfo;
      if (nextVolumeTier) {
        const additionalNeeded = nextVolumeTier.minQuantity - quantity;
        const potentialDiscount = nextVolumeTier.calculateDiscount(basePrice, nextVolumeTier.minQuantity);
        const currentDiscount = volumeDiscount ? volumeDiscount.calculateDiscount(basePrice, quantity) : 0;
        const additionalSavings = potentialDiscount - currentDiscount;

        nextTierInfo = {
          minQuantity: nextVolumeTier.minQuantity,
          discountPercentage: nextVolumeTier.discountPercentage,
          additionalSavings
        };
      }

      return {
        success: true,
        message: 'Descuentos calculados exitosamente',
        data: {
          volumeDiscount: volumeDiscount ? await this.getVolumeDiscountWithRelations(volumeDiscount.id) || undefined : undefined,
          earlyBirdDiscount: earlyBirdDiscount ? await this.getEarlyBirdDiscountWithRelations(earlyBirdDiscount.id) || undefined : undefined,
          totalDiscount,
          finalPrice,
          appliedDiscounts,
          nextVolumeTier: nextTierInfo
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error calculando descuentos aplicables:', error);
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
   * Obtiene un descuento por volumen con todas sus relaciones cargadas
   */
  private async getVolumeDiscountWithRelations(discountId: number): Promise<VolumeDiscountResponse | null> {
    const discount = await VolumeDiscount.findByPk(discountId, {
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!discount) return null;

    return {
      id: discount.id,
      eventId: discount.eventId,
      minQuantity: discount.minQuantity,
      maxQuantity: discount.maxQuantity,
      discountPercentage: discount.discountPercentage,
      description: discount.description,
      isActive: discount.isActive,
      priority: discount.priority,
      createdBy: discount.createdBy,
      updatedBy: discount.updatedBy,
      createdAt: discount.createdAt,
      updatedAt: discount.updatedAt,
      deletedAt: discount.deletedAt
    };
  }

  /**
   * Obtiene un descuento early bird con todas sus relaciones cargadas
   */
  private async getEarlyBirdDiscountWithRelations(discountId: number): Promise<EarlyBirdDiscountResponse | null> {
    const discount = await EarlyBirdDiscount.findByPk(discountId, {
      include: [
        { model: Event, as: 'event', attributes: ['id', 'title', 'startDate'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'updater', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!discount) return null;

    return {
      id: discount.id,
      eventId: discount.eventId,
      daysBeforeEvent: discount.daysBeforeEvent,
      discountPercentage: discount.discountPercentage,
      description: discount.description,
      isActive: discount.isActive,
      priority: discount.priority,
      autoApply: discount.autoApply,
      createdBy: discount.createdBy,
      updatedBy: discount.updatedBy,
      createdAt: discount.createdAt,
      updatedAt: discount.updatedAt,
      deletedAt: discount.deletedAt
    };
  }

  /**
   * Valida datos de descuento por volumen
   */
  private async validateVolumeDiscountData(data: Partial<CreateVolumeDiscountRequest>, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Validaciones básicas
    if (!isUpdate || data.minQuantity !== undefined) {
      if (!data.minQuantity || data.minQuantity < 1) {
        errors.push({
          field: 'minQuantity',
          message: 'La cantidad mínima debe ser mayor o igual a 1',
          value: data.minQuantity
        });
      }
    }

    if (!isUpdate || data.discountPercentage !== undefined) {
      if (data.discountPercentage === undefined || data.discountPercentage < 0 || data.discountPercentage > 100) {
        errors.push({
          field: 'discountPercentage',
          message: 'El porcentaje de descuento debe estar entre 0 y 100',
          value: data.discountPercentage
        });
      }
    }

    // Validar que no haya solapamiento con otros descuentos del mismo evento
    if (data.eventId && data.minQuantity) {
      const existingDiscounts = await VolumeDiscount.findAll({
        where: {
          eventId: data.eventId,
          isActive: true,
          [Op.or]: [
            {
              minQuantity: { [Op.lte]: data.minQuantity },
              maxQuantity: { [Op.gte]: data.minQuantity }
            },
            {
              minQuantity: { [Op.lte]: data.maxQuantity || data.minQuantity },
              maxQuantity: { [Op.gte]: data.maxQuantity || data.minQuantity }
            }
          ]
        }
      });

      if (existingDiscounts.length > 0) {
        errors.push({
          field: 'quantityRange',
          message: 'Ya existe un descuento que cubre este rango de cantidades',
          value: { minQuantity: data.minQuantity, maxQuantity: data.maxQuantity }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida datos de descuento early bird
   */
  private async validateEarlyBirdDiscountData(data: Partial<CreateEarlyBirdDiscountRequest>, isUpdate: boolean = false): Promise<{ isValid: boolean; errors: any[] }> {
    const errors: any[] = [];

    // Validaciones básicas
    if (!isUpdate || data.daysBeforeEvent !== undefined) {
      if (!data.daysBeforeEvent || data.daysBeforeEvent < 1 || data.daysBeforeEvent > 365) {
        errors.push({
          field: 'daysBeforeEvent',
          message: 'Los días antes del evento deben estar entre 1 y 365',
          value: data.daysBeforeEvent
        });
      }
    }

    if (!isUpdate || data.discountPercentage !== undefined) {
      if (data.discountPercentage === undefined || data.discountPercentage < 0 || data.discountPercentage > 100) {
        errors.push({
          field: 'discountPercentage',
          message: 'El porcentaje de descuento debe estar entre 0 y 100',
          value: data.discountPercentage
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const discountService = new DiscountService();
