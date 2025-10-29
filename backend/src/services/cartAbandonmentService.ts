/**
 * @fileoverview Servicio de Recuperación de Carritos Abandonados para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para recuperación de carritos abandonados
 *
 * Archivo: backend/src/services/cartAbandonmentService.ts
 */

import { AbandonedCart } from '../models/AbandonedCart';
import { Cart } from '../models/Cart';
import { User } from '../models/User';
import {
  AbandonedCartFilters,
  AbandonedCartStats,
  RecoveryConfig,
  RecoveryAttemptResult
} from '../types/cart.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

/**
 * Servicio para manejo de recuperación de carritos abandonados
 */
export class CartAbandonmentService {

  /**
   * Marca carritos como abandonados
   */
  async markCartsAsAbandoned(hoursInactive: number = 24): Promise<ApiResponse<{ marked: number }>> {
    try {
      const threshold = new Date();
      threshold.setHours(threshold.getHours() - hoursInactive);

      const cartsToMark = await Cart.findAll({
        where: {
          isAbandoned: false,
          lastActivity: {
            [Op.lt]: threshold
          },
          totalItems: {
            [Op.gt]: 0
          }
        }
      });

      let marked = 0;
      for (const cart of cartsToMark) {
        // Crear registro de carrito abandonado
        await AbandonedCart.create({
          cartId: cart.id,
          sessionId: cart.sessionId,
          userId: cart.userId,
          email: cart.userId ? (await User.findByPk(cart.userId))?.email : undefined,
          totalItems: cart.totalItems,
          totalValue: cart.total,
          cartData: {
            items: await cart.items || [],
            subtotal: cart.subtotal,
            discountAmount: cart.discountAmount,
            total: cart.total,
            promoCode: cart.promoCode
          },
          abandonedAt: new Date(),
          lastActivity: cart.lastActivity,
          recoveryAttempts: 0
        });

        // Marcar carrito como abandonado
        cart.markAsAbandoned();
        await cart.save();
        marked++;
      }

      return {
        success: true,
        message: `${marked} carritos marcados como abandonados`,
        data: { marked },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error marcando carritos como abandonados:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene carritos abandonados con filtros
   */
  async getAbandonedCarts(filters: AbandonedCartFilters = {}): Promise<ApiResponse<AbandonedCart[]>> {
    try {
      const {
        daysSinceAbandoned = 30,
        minValue = 0,
        maxValue,
        hasEmail = false,
        userId
      } = filters;

      const abandonedAtThreshold = new Date();
      abandonedAtThreshold.setDate(abandonedAtThreshold.getDate() - daysSinceAbandoned);

      const where: any = {
        abandonedAt: {
          [Op.gte]: abandonedAtThreshold
        },
        totalValue: {
          [Op.gte]: minValue
        }
      };

      if (maxValue !== undefined) {
        where.totalValue[Op.lte] = maxValue;
      }

      if (hasEmail) {
        where.email = {
          [Op.ne]: null
        };
      }

      if (userId) {
        where.userId = userId;
      }

      const abandonedCarts = await AbandonedCart.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ],
        order: [['abandonedAt', 'DESC']]
      });

      return {
        success: true,
        message: 'Carritos abandonados obtenidos exitosamente',
        data: abandonedCarts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo carritos abandonados:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Intenta recuperar un carrito abandonado
   */
  async attemptRecovery(abandonedCartId: number, config: RecoveryConfig): Promise<ApiResponse<RecoveryAttemptResult>> {
    try {
      const abandonedCart = await AbandonedCart.findByPk(abandonedCartId);
      if (!abandonedCart) {
        return {
          success: false,
          message: 'Carrito abandonado no encontrado',
          error: 'ABANDONED_CART_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar límite de intentos
      if (abandonedCart.recoveryAttempts >= config.maxAttempts) {
        return {
          success: false,
          message: 'Se alcanzó el límite máximo de intentos de recuperación',
          error: 'MAX_ATTEMPTS_EXCEEDED',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar cooldown
      if (abandonedCart.lastRecoveryAttempt) {
        const cooldownEnd = new Date(abandonedCart.lastRecoveryAttempt);
        cooldownEnd.setHours(cooldownEnd.getHours() + config.cooldownHours);

        if (new Date() < cooldownEnd) {
          return {
            success: false,
            message: 'Aún no se puede intentar recuperación (cooldown activo)',
            error: 'COOLDOWN_ACTIVE',
            timestamp: new Date().toISOString()
          };
        }
      }

      // TODO: Implementar envío real de email/SMS
      // Por ahora, simular envío exitoso
      const recoveryResult: RecoveryAttemptResult = {
        success: true,
        method: 'email',
        messageId: `msg_${Date.now()}`,
        nextAttemptAt: new Date(Date.now() + config.cooldownHours * 60 * 60 * 1000)
      };

      // Actualizar contador de intentos
      abandonedCart.recoveryAttempts += 1;
      abandonedCart.lastRecoveryAttempt = new Date();
      await abandonedCart.save();

      return {
        success: true,
        message: 'Intento de recuperación procesado exitosamente',
        data: recoveryResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error intentando recuperación:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Marca un carrito abandonado como recuperado
   */
  async markAsRecovered(abandonedCartId: number): Promise<ApiResponse<boolean>> {
    try {
      const abandonedCart = await AbandonedCart.findByPk(abandonedCartId);
      if (!abandonedCart) {
        return {
          success: false,
          message: 'Carrito abandonado no encontrado',
          error: 'ABANDONED_CART_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      abandonedCart.recoveredAt = new Date();
      await abandonedCart.save();

      return {
        success: true,
        message: 'Carrito marcado como recuperado exitosamente',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error marcando carrito como recuperado:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de recuperación
   */
  async getRecoveryStats(days: number = 30): Promise<ApiResponse<AbandonedCartStats>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const abandonedCarts = await AbandonedCart.findAll({
        where: {
          abandonedAt: {
            [Op.gte]: startDate
          }
        }
      });

      const total = abandonedCarts.length;
      const recovered = abandonedCarts.filter(cart => cart.recoveredAt).length;
      const totalValue = abandonedCarts.reduce((sum, cart) => sum + cart.totalValue, 0);
      const recoveredValue = abandonedCarts
        .filter(cart => cart.recoveredAt)
        .reduce((sum, cart) => sum + cart.totalValue, 0);

      const stats: AbandonedCartStats = {
        total,
        recovered,
        recoveryRate: total > 0 ? (recovered / total) * 100 : 0,
        averageValue: total > 0 ? totalValue / total : 0,
        totalValue,
        period: {
          start: startDate,
          end: new Date()
        }
      };

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
   * Limpia registros antiguos de carritos abandonados
   */
  async cleanupOldRecords(daysToKeep: number = 90): Promise<ApiResponse<{ deleted: number }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const oldRecoveredCarts = await AbandonedCart.findAll({
        where: {
          recoveredAt: {
            [Op.lt]: cutoffDate
          }
        }
      });

      const idsToDelete = oldRecoveredCarts.map(cart => cart.id);
      let deletedCount = 0;

      if (idsToDelete.length > 0) {
        deletedCount = await AbandonedCart.destroy({
          where: {
            id: idsToDelete
          }
        });
      }

      return {
        success: true,
        message: `Eliminados ${deletedCount} registros antiguos de carritos abandonados`,
        data: { deleted: deletedCount },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error limpiando registros antiguos:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const cartAbandonmentService = new CartAbandonmentService();
