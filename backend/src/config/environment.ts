/**
 * @fileoverview Configuración de variables de entorno
 * @version 1.0.0
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  
  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'tradeconnect_dev',
    user: process.env.DB_USER || 'tradeconnect_user',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },
  
  // Encriptación
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-character-key-here'
  },
  
  // FEL Guatemala
  fel: {
    baseUrl: process.env.FEL_BASE_URL || 'https://testws.ccgfel.gt/Api',
    username: process.env.FEL_USERNAME,
    password: process.env.FEL_PASSWORD
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log'
  }
};

export default config;
