# ====================================================================
# ARCHIVOS FALTANTES Y CORRECCIONES - TRADECONNECT
# Archivo: scripts/complete-missing-files.sh
# ====================================================================

#!/bin/bash
echo "🔧 Completando archivos faltantes y correcciones..."

# Ir al directorio backend
cd backend

# ====================================================================
# 1. CREAR ARCHIVO REDIS.TS FALTANTE
# ====================================================================
cat > src/config/redis.ts << 'EOF'
/**
 * @fileoverview Configuración de Redis para caché y sesiones
 * @version 1.0.0
 * @author TradeConnect Team
 */

import Redis from 'ioredis';
import { config } from './environment';

/**
 * Configuración de Redis
 */
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4, // IPv4
  keyPrefix: 'tradeconnect:',
  db: 0
};

/**
 * Instancia principal de Redis
 */
export const redis = new Redis(redisConfig);

/**
 * Instancia de Redis para sesiones
 */
export const sessionRedis = new Redis({
  ...redisConfig,
  db: 1,
  keyPrefix: 'tradeconnect:session:'
});

/**
 * Instancia de Redis para caché
 */
export const cacheRedis = new Redis({
  ...redisConfig,
  db: 2,
  keyPrefix: 'tradeconnect:cache:'
});

/**
 * Instancia de Redis para colas de trabajo
 */
export const queueRedis = new Redis({
  ...redisConfig,
  db: 3,
  keyPrefix: 'tradeconnect:queue:'
});

// Event handlers para logging
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  console.log('🚀 Redis is ready to accept commands');
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

/**
 * Función para testear la conexión de Redis
 */
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis ping failed:', error);
    return false;
  }
};

/**
 * Función para cerrar todas las conexiones de Redis
 */
export const closeRedisConnections = async (): Promise<void> => {
  try {
    await Promise.all([
      redis.disconnect(),
      sessionRedis.disconnect(),
      cacheRedis.disconnect(),
      queueRedis.disconnect()
    ]);
    console.log('✅ All Redis connections closed');
  } catch (error) {
    console.error('Error closing Redis connections:', error);
  }
};

export default redis;
EOF

# ====================================================================
