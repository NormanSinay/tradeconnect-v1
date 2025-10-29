/**
 * @fileoverview Servicio de Métricas y Performance para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para monitoreo de performance y métricas del sistema
 *
 * Archivo: backend/src/services/metricsService.ts
 */

import { logger } from '../utils/logger';

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
  errors: number;
}

export interface DatabaseMetrics {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  connectionPoolSize: number;
  activeConnections: number;
}

export interface EventMetrics {
  totalEvents: number;
  eventsByType: { [key: string]: number };
  processingTime: number;
  errors: number;
}

export interface SystemMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
}

/**
 * Servicio para recopilar y gestionar métricas de performance
 */
export class MetricsService {
  private cacheMetrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    errors: 0
  };

  private databaseMetrics: DatabaseMetrics = {
    totalQueries: 0,
    slowQueries: 0,
    averageQueryTime: 0,
    connectionPoolSize: 0,
    activeConnections: 0
  };

  private eventMetrics: EventMetrics = {
    totalEvents: 0,
    eventsByType: {},
    processingTime: 0,
    errors: 0
  };

  private systemMetrics: SystemMetrics = {
    uptime: 0,
    memoryUsage: process.memoryUsage(),
    cpuUsage: 0,
    activeUsers: 0,
    totalRequests: 0,
    errorRate: 0
  };

  private startTime: number = Date.now();
  private responseTimes: number[] = [];

  /**
   * Registra una petición de caché
   */
  recordCacheRequest(hit: boolean, responseTime?: number): void {
    this.cacheMetrics.totalRequests++;

    if (hit) {
      this.cacheMetrics.hits++;
    } else {
      this.cacheMetrics.misses++;
    }

    this.cacheMetrics.hitRate = this.cacheMetrics.hits / this.cacheMetrics.totalRequests;

    if (responseTime !== undefined) {
      this.responseTimes.push(responseTime);
      if (this.responseTimes.length > 1000) {
        this.responseTimes.shift(); // Mantener solo las últimas 1000 mediciones
      }
      this.cacheMetrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }
  }

  /**
   * Registra un error de caché
   */
  recordCacheError(): void {
    this.cacheMetrics.errors++;
  }

  /**
   * Registra una consulta de base de datos
   */
  recordDatabaseQuery(queryTime: number, isSlow: boolean = false): void {
    this.databaseMetrics.totalQueries++;
    this.databaseMetrics.averageQueryTime =
      (this.databaseMetrics.averageQueryTime * (this.databaseMetrics.totalQueries - 1) + queryTime) / this.databaseMetrics.totalQueries;

    if (isSlow) {
      this.databaseMetrics.slowQueries++;
    }
  }

  /**
   * Registra métricas de pool de conexiones
   */
  updateConnectionPoolMetrics(poolSize: number, activeConnections: number): void {
    this.databaseMetrics.connectionPoolSize = poolSize;
    this.databaseMetrics.activeConnections = activeConnections;
  }

  /**
   * Registra un evento procesado
   */
  recordEventProcessed(eventType: string, processingTime: number, hasError: boolean = false): void {
    this.eventMetrics.totalEvents++;
    this.eventMetrics.eventsByType[eventType] = (this.eventMetrics.eventsByType[eventType] || 0) + 1;
    this.eventMetrics.processingTime += processingTime;

    if (hasError) {
      this.eventMetrics.errors++;
    }
  }

  /**
   * Registra una petición HTTP
   */
  recordHttpRequest(hasError: boolean = false): void {
    this.systemMetrics.totalRequests++;
    if (hasError) {
      this.systemMetrics.errorRate = (this.systemMetrics.errorRate * (this.systemMetrics.totalRequests - 1) + 1) / this.systemMetrics.totalRequests;
    } else {
      this.systemMetrics.errorRate = (this.systemMetrics.errorRate * (this.systemMetrics.totalRequests - 1)) / this.systemMetrics.totalRequests;
    }
  }

  /**
   * Actualiza métricas del sistema
   */
  updateSystemMetrics(): void {
    this.systemMetrics.uptime = Date.now() - this.startTime;
    this.systemMetrics.memoryUsage = process.memoryUsage();

    // Calcular uso de CPU (simplificado)
    const cpuUsage = process.cpuUsage();
    this.systemMetrics.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convertir a segundos
  }

  /**
   * Obtiene todas las métricas
   */
  getAllMetrics(): {
    cache: CacheMetrics;
    database: DatabaseMetrics;
    events: EventMetrics;
    system: SystemMetrics;
    timestamp: string;
  } {
    this.updateSystemMetrics();

    return {
      cache: { ...this.cacheMetrics },
      database: { ...this.databaseMetrics },
      events: { ...this.eventMetrics },
      system: { ...this.systemMetrics },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtiene métricas de caché
   */
  getCacheMetrics(): CacheMetrics {
    return { ...this.cacheMetrics };
  }

  /**
   * Obtiene métricas de base de datos
   */
  getDatabaseMetrics(): DatabaseMetrics {
    return { ...this.databaseMetrics };
  }

  /**
   * Obtiene métricas de eventos
   */
  getEventMetrics(): EventMetrics {
    return { ...this.eventMetrics };
  }

  /**
   * Obtiene métricas del sistema
   */
  getSystemMetrics(): SystemMetrics {
    this.updateSystemMetrics();
    return { ...this.systemMetrics };
  }

  /**
   * Resetea todas las métricas
   */
  resetMetrics(): void {
    this.cacheMetrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      errors: 0
    };

    this.databaseMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      connectionPoolSize: 0,
      activeConnections: 0
    };

    this.eventMetrics = {
      totalEvents: 0,
      eventsByType: {},
      processingTime: 0,
      errors: 0
    };

    this.responseTimes = [];
    this.startTime = Date.now();

    logger.info('All metrics have been reset');
  }

  /**
   * Genera un reporte de performance
   */
  generatePerformanceReport(): string {
    const metrics = this.getAllMetrics();

    return `
=== TradeConnect Performance Report ===
Generated at: ${metrics.timestamp}

CACHE PERFORMANCE:
- Hit Rate: ${(metrics.cache.hitRate * 100).toFixed(2)}%
- Total Requests: ${metrics.cache.totalRequests}
- Hits: ${metrics.cache.hits}
- Misses: ${metrics.cache.misses}
- Average Response Time: ${metrics.cache.averageResponseTime.toFixed(2)}ms
- Errors: ${metrics.cache.errors}

DATABASE PERFORMANCE:
- Total Queries: ${metrics.database.totalQueries}
- Slow Queries: ${metrics.database.slowQueries}
- Average Query Time: ${metrics.database.averageQueryTime.toFixed(2)}ms
- Connection Pool Size: ${metrics.database.connectionPoolSize}
- Active Connections: ${metrics.database.activeConnections}

EVENT PROCESSING:
- Total Events: ${metrics.events.totalEvents}
- Events by Type: ${JSON.stringify(metrics.events.eventsByType, null, 2)}
- Average Processing Time: ${(metrics.events.processingTime / Math.max(metrics.events.totalEvents, 1)).toFixed(2)}ms
- Errors: ${metrics.events.errors}

SYSTEM HEALTH:
- Uptime: ${(metrics.system.uptime / 1000 / 60 / 60).toFixed(2)} hours
- Memory Usage: ${(metrics.system.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
- CPU Usage: ${metrics.system.cpuUsage.toFixed(2)}s
- Total Requests: ${metrics.system.totalRequests}
- Error Rate: ${(metrics.system.errorRate * 100).toFixed(2)}%
=====================================
    `.trim();
  }

  /**
   * Loggea métricas críticas si superan umbrales
   */
  checkThresholds(): void {
    const metrics = this.getAllMetrics();

    // Verificar hit rate de caché baja
    if (metrics.cache.hitRate < 0.7 && metrics.cache.totalRequests > 100) {
      logger.warn(`Low cache hit rate: ${(metrics.cache.hitRate * 100).toFixed(2)}%`);
    }

    // Verificar alto número de errores
    if (metrics.system.errorRate > 0.05) {
      logger.error(`High error rate detected: ${(metrics.system.errorRate * 100).toFixed(2)}%`);
    }

    // Verificar queries lentas
    if (metrics.database.averageQueryTime > 1000) {
      logger.warn(`Slow database queries detected: ${metrics.database.averageQueryTime.toFixed(2)}ms average`);
    }

    // Verificar uso alto de memoria
    const memoryUsageMB = metrics.system.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) {
      logger.warn(`High memory usage: ${memoryUsageMB.toFixed(2)} MB`);
    }
  }
}

export const metricsService = new MetricsService();
