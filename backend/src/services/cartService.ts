/**
 * @fileoverview Servicio del Carrito para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión del carrito de compras
 *
 * Archivo: backend/src/services/cartService.ts
 */

import { Cart } from '../models/Cart';
import { CartItem } from '../models/CartItem';
import { CartSession } from '../models/CartSession';
import { Event } from '../models/Event';
import {
  CartItemData,
  CartUpdateData,
  CartResponse,
  CartCalculationResponse,
  CartItemValidation
} from '../types/cart.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Servicio para manejo de operaciones del carrito de compras
 */
export class CartService {

  /**
   * Obtiene el carrito de un usuario o sesión
   */
  async getCart(userId?: number, sessionId?: string): Promise<ApiResponse<CartResponse>> {
    try {
      if (!userId && !sessionId) {
        return {
          success: false,
          message: 'Se requiere userId o sessionId',
          error: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        };
      }

      let cart: Cart | null = null;

      if (userId) {
        // Buscar carrito activo del usuario
        cart = await Cart.findOne({
          where: {
            userId,
            expiresAt: { [Op.gt]: new Date() }
          }
        });
      }

      if (!cart && sessionId) {
        // Buscar carrito por sesión
        cart = await Cart.findOne({
          where: {
            sessionId,
            expiresAt: { [Op.gt]: new Date() }
          }
        });
      }

      if (!cart) {
        return {
          success: false,
          message: 'Carrito no encontrado',
          error: 'CART_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const cartResponse = await cart.toPublicJSON();

      return {
        success: true,
        message: 'Carrito obtenido exitosamente',
        data: cartResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo carrito:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Agrega un item al carrito
   */
  async addItem(userId: number | undefined, sessionId: string | undefined, itemData: CartItemData): Promise<ApiResponse<CartResponse>> {
    try {
      // Obtener o crear carrito
      const cart = await this.getOrCreateCart(userId, sessionId);

      // Validar disponibilidad del evento
      const validation = await this.validateCartItem(itemData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', '),
          error: 'INVALID_ITEM',
          timestamp: new Date().toISOString()
        };
      }

      // Crear item del carrito
      await CartItem.create({
        cartId: cart.id,
        eventId: itemData.eventId,
        participantType: itemData.participantType,
        quantity: itemData.quantity,
        basePrice: 0, // TODO: Calcular precio del evento
        discountAmount: 0,
        finalPrice: 0, // TODO: Calcular precio final
        isGroupRegistration: false,
        customFields: itemData.customFields,
        participantData: itemData.participantData,
        addedAt: new Date()
      });

      // Recalcular totales del carrito
      await cart.calculateTotal();
      await cart.save();

      const cartResponse = await cart.toPublicJSON();

      return {
        success: true,
        message: 'Item agregado al carrito exitosamente',
        data: cartResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error agregando item al carrito:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualiza un item del carrito
   */
  async updateItem(userId: number | undefined, sessionId: string | undefined, updateData: CartUpdateData): Promise<ApiResponse<CartResponse>> {
    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      const item = await CartItem.findOne({
        where: {
          id: updateData.itemId,
          cartId: cart.id
        }
      });

      if (!item) {
        return {
          success: false,
          message: 'Item no encontrado en el carrito',
          error: 'ITEM_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Actualizar campos
      if (updateData.quantity !== undefined) {
        item.quantity = updateData.quantity;
      }
      if (updateData.customFields !== undefined) {
        item.customFields = updateData.customFields;
      }
      if (updateData.participantData !== undefined) {
        item.participantData = updateData.participantData;
      }

      await item.save();

      // Recalcular totales del carrito
      await cart.calculateTotal();
      await cart.save();

      const cartResponse = await cart.toPublicJSON();

      return {
        success: true,
        message: 'Item actualizado exitosamente',
        data: cartResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error actualizando item del carrito:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Remueve un item del carrito
   */
  async removeItem(userId: number | undefined, sessionId: string | undefined, itemId: number): Promise<ApiResponse<CartResponse>> {
    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      const item = await CartItem.findOne({
        where: {
          id: itemId,
          cartId: cart.id
        }
      });

      if (!item) {
        return {
          success: false,
          message: 'Item no encontrado en el carrito',
          error: 'ITEM_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await item.destroy();

      // Recalcular totales del carrito
      await cart.calculateTotal();
      await cart.save();

      const cartResponse = await cart.toPublicJSON();

      return {
        success: true,
        message: 'Item removido del carrito exitosamente',
        data: cartResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error removiendo item del carrito:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Limpia todo el carrito
   */
  async clearCart(userId: number | undefined, sessionId: string | undefined): Promise<ApiResponse<boolean>> {
    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      await CartItem.destroy({
        where: { cartId: cart.id }
      });

      // Resetear totales del carrito
      cart.totalItems = 0;
      cart.subtotal = 0;
      cart.discountAmount = 0;
      cart.total = 0;
      cart.promoCode = undefined;
      cart.promoDiscount = 0;

      await cart.save();

      return {
        success: true,
        message: 'Carrito limpiado exitosamente',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error limpiando carrito:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Aplica un código promocional
   */
  async applyPromoCode(userId: number | undefined, sessionId: string | undefined, promoCode: string): Promise<ApiResponse<CartResponse>> {
    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      // TODO: Validar código promocional
      // Por ahora, aplicar descuento fijo del 10%
      const discountPercent = 10;
      const discountAmount = cart.subtotal * (discountPercent / 100);

      cart.promoCode = promoCode;
      cart.promoDiscount = discountAmount;
      cart.total = Math.max(0, cart.subtotal - cart.discountAmount - discountAmount);

      await cart.save();

      const cartResponse = await cart.toPublicJSON();

      return {
        success: true,
        message: 'Código promocional aplicado exitosamente',
        data: cartResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error aplicando código promocional:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calcula los totales del carrito
   */
  async calculateCart(userId: number | undefined, sessionId: string | undefined): Promise<ApiResponse<CartCalculationResponse>> {
    try {
      const cart = await this.getOrCreateCart(userId, sessionId);

      await cart.calculateTotal();

      const calculation: CartCalculationResponse = {
        subtotal: cart.subtotal,
        discountAmount: cart.discountAmount + cart.promoDiscount,
        total: cart.total,
        currency: 'GTQ',
        appliedDiscounts: []
      };

      // Agregar descuentos aplicados
      if (cart.discountAmount > 0) {
        calculation.appliedDiscounts.push({
          type: 'group',
          description: 'Descuento grupal',
          amount: cart.discountAmount,
          percentage: Math.round((cart.discountAmount / cart.subtotal) * 100)
        });
      }

      if (cart.promoDiscount > 0) {
        calculation.appliedDiscounts.push({
          type: 'promo',
          description: `Código promocional: ${cart.promoCode}`,
          amount: cart.promoDiscount,
          percentage: Math.round((cart.promoDiscount / cart.subtotal) * 100)
        });
      }

      return {
        success: true,
        message: 'Cálculo completado exitosamente',
        data: calculation,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error calculando carrito:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene o crea un carrito para el usuario/sesión
   */
  private async getOrCreateCart(userId?: number, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      cart = await Cart.findOne({
        where: {
          userId,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
    }

    if (!cart && sessionId) {
      cart = await Cart.findOne({
        where: {
          sessionId,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
    }

    if (!cart) {
      const newSessionId = sessionId || Cart.generateSessionId();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      cart = await Cart.create({
        sessionId: newSessionId,
        userId,
        totalItems: 0,
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        promoDiscount: 0,
        expiresAt,
        lastActivity: new Date(),
        isAbandoned: false
      });
    }

    return cart;
  }

  /**
   * Valida un item antes de agregarlo al carrito
   */
  private async validateCartItem(itemData: CartItemData): Promise<CartItemValidation> {
    const validation: CartItemValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      availability: {
        available: -1,
        requested: itemData.quantity,
        canAccommodate: true
      }
    };

    // Verificar que el evento existe
    const event = await Event.findByPk(itemData.eventId);
    if (!event) {
      validation.isValid = false;
      validation.errors.push('Evento no encontrado');
      return validation;
    }

    // TODO: Verificar disponibilidad de cupos
    // Por ahora, asumir disponibilidad ilimitada

    // Validar cantidad
    if (itemData.quantity < 1 || itemData.quantity > 50) {
      validation.isValid = false;
      validation.errors.push('La cantidad debe estar entre 1 y 50');
    }

    // Validar tipo de participante
    if (!['individual', 'empresa'].includes(itemData.participantType)) {
      validation.isValid = false;
      validation.errors.push('Tipo de participante inválido');
    }

    return validation;
  }
}

export const cartService = new CartService();