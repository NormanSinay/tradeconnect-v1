/**
 * @fileoverview Servicio de Caché para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio de caché Redis con patrón cache-aside
 *
 * Archivo: backend/src/services/cacheService.ts
 */

import { cacheRedis } from '../config/redis';
import { logger } from '../utils/logger';
import { metricsService } from './metricsService';

/**
 * Servicio de caché con patrón cache-aside
 */
export class CacheService {
  private readonly defaultTTL = 300; // 5 minutos por defecto

  /**
   * Obtiene un valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const cached = await cacheRedis.get(key);
      const responseTime = Date.now() - startTime;

      if (!cached) {
        metricsService.recordCacheRequest(false, responseTime);
        return null;
      }

      metricsService.recordCacheRequest(true, responseTime);
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('Error getting from cache:', error);
      metricsService.recordCacheError();
      return null;
    }
  }

  /**
   * Establece un valor en el caché
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const ttl = ttlSeconds || this.defaultTTL;

      await cacheRedis.setex(key, ttl, serialized);
    } catch (error) {
      logger.error('Error setting cache:', error);
    }
  }

  /**
   * Elimina un valor del caché
   */
  async delete(key: string): Promise<void> {
    try {
      await cacheRedis.del(key);
    } catch (error) {
      logger.error('Error deleting from cache:', error);
    }
  }

  /**
   * Elimina múltiples claves por patrón
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await cacheRedis.keys(pattern);
      if (keys.length > 0) {
        await cacheRedis.del(...keys);
      }
    } catch (error) {
      logger.error('Error deleting by pattern from cache:', error);
    }
  }

  /**
   * Verifica si una clave existe en el caché
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await cacheRedis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Error checking cache existence:', error);
      return false;
    }
  }

  /**
   * Incrementa un contador en el caché
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await cacheRedis.incrby(key, amount);
    } catch (error) {
      logger.error('Error incrementing cache:', error);
      return 0;
    }
  }

  /**
   * Establece la expiración de una clave
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await cacheRedis.expire(key, ttlSeconds);
    } catch (error) {
      logger.error('Error setting cache expiration:', error);
    }
  }

  /**
   * Obtiene o establece (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Intentar obtener del caché
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Si no está en caché, obtener de la fuente
      const fetchStartTime = Date.now();
      const data = await fetcher();
      const fetchTime = Date.now() - fetchStartTime;

      // Registrar tiempo de consulta a BD
      metricsService.recordDatabaseQuery(fetchTime);

      // Guardar en caché
      await this.set(key, data, ttlSeconds);

      const totalTime = Date.now() - startTime;
      logger.debug(`Cache miss for key ${key}, fetched in ${fetchTime}ms, total ${totalTime}ms`);

      return data;
    } catch (error) {
      logger.error('Error in getOrSet:', error);
      metricsService.recordCacheError();

      // En caso de error, intentar obtener directamente de la fuente
      const fetchStartTime = Date.now();
      const data = await fetcher();
      const fetchTime = Date.now() - fetchStartTime;
      metricsService.recordDatabaseQuery(fetchTime);

      return data;
    }
  }

  // ====================================================================
  // MÉTODOS ESPECÍFICOS PARA EVENTOS
  // ====================================================================

  /**
   * Claves de caché para eventos
   */
  private getEventKeys(eventId?: number) {
    return {
      eventDetail: (id: number) => `event:detail:${id}`,
      eventList: (params: any) => `event:list:${JSON.stringify(params)}`,
      publicEvents: (params: any) => `event:public:${JSON.stringify(params)}`,
      eventStats: (id: number) => `event:stats:${id}`,
      eventAvailability: (id: number) => `event:availability:${id}`,
      eventCategories: 'event:categories',
      eventTypes: 'event:types'
    };
  }

  /**
   * Invalida caché de evento específico
   */
  async invalidateEventCache(eventId: number): Promise<void> {
    const keys = this.getEventKeys();
    await Promise.all([
      this.delete(keys.eventDetail(eventId)),
      this.delete(keys.eventStats(eventId)),
      this.delete(keys.eventAvailability(eventId)),
      // Invalidar listas que podrían contener este evento
      this.deleteByPattern('event:list:*'),
      this.deleteByPattern('event:public:*')
    ]);
  }

  /**
   * Invalida caché de listas de eventos
   */
  async invalidateEventListsCache(): Promise<void> {
    await Promise.all([
      this.deleteByPattern('event:list:*'),
      this.deleteByPattern('event:public:*')
    ]);
  }

  /**
   * Invalida todo el caché de eventos
   */
  async invalidateAllEventCache(): Promise<void> {
    await this.deleteByPattern('event:*');
  }

  /**
   * Invalida caché de categorías y tipos
   */
  async invalidateCategoriesAndTypesCache(): Promise<void> {
    const keys = this.getEventKeys();
    await Promise.all([
      this.delete(keys.eventCategories),
      this.delete(keys.eventTypes)
    ]);
  }

  /**
   * Obtiene estadísticas del caché
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
    uptime: number;
  }> {
    try {
      const info = await cacheRedis.info('memory');
      const keys = await cacheRedis.dbsize();
      const metrics = metricsService.getCacheMetrics();

      return {
        totalKeys: keys,
        memoryUsage: info,
        hitRate: metrics.hitRate,
        uptime: Date.now() - (this as any).startTime || 0
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'unknown',
        hitRate: 0,
        uptime: 0
      };
    }
  }
}

export const cacheService = new CacheService();
