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
    password: process.env.DB_PASSWORD || 'tradeconnect123'
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'c0fcd5432f88e5fae798739e84b0893e4cef17338a57a60c48be11e3a2c837d458c6c2eb326577fcd66de2068ffb0ce038eb2eba4cc5cf9abb17e325b33620ed',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '75f8318b3f1b2089fa01663ea389e741722cf7859d946f7d52189ff6417da32429aeae6c50f9198a8dbf91e27f70f88dde095ee6551f417230be7b6789466b47',
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
  
  // App
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log'
  }
};

export default config;
