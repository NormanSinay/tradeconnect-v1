/**
 * @fileoverview Servidor principal de TradeConnect Platform
 * @version 1.0.0
 * @author TradeConnect Team
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { config } from './config/environment';
import { testRedisConnection } from './config/redis';
import sequelize from './config/database';
import { requestLogger, errorLogger } from './middleware/logging.middleware';
import { successResponse, errorResponse } from './utils/common.utils';

const app = express();
const PORT = config.PORT;

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ====================================================================
// MIDDLEWARES DE SEGURIDAD Y CONFIGURACIÓN
// ====================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());

// ====================================================================
// MIDDLEWARES DE PARSING
// ====================================================================
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ====================================================================
// MIDDLEWARES DE LOGGING
// ====================================================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// ====================================================================
// RUTAS PRINCIPALES
// ====================================================================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página de bienvenida de la API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información básica de la API
 */
app.get('/', (req, res) => {
  res.json(successResponse({
    name: 'TradeConnect Platform API',
    version: '1.0.0',
    description: 'Plataforma e-commerce para gestión de eventos empresariales',
    environment: config.NODE_ENV,
    endpoints: {
      health: '/health',
      documentation: '/api/docs',
      modules: [
        'Authentication & Users',
        'Events Management',
        'Registration System',
        'Payment Processing',
        'FEL Integration',
        'QR Codes & Access Control',
        'Certificate Generation',
        'Notifications',
        'Hybrid Events',
        'Reports & Analytics'
      ]
    }
  }, 'Welcome to TradeConnect Platform API'));
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del sistema
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *       503:
 *         description: Sistema no disponible
 */
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a base de datos
    await sequelize.authenticate();
    const dbStatus = 'connected';
    
    // Verificar conexión a Redis
    const redisStatus = await testRedisConnection() ? 'connected' : 'disconnected';
    
    // Determinar estado general del sistema
    const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: '1.0.0',
      services: {
        database: dbStatus,
        redis: redisStatus,
        api: 'running'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    };
    
    if (isHealthy) {
      res.status(200).json(successResponse(healthData, 'System is healthy'));
    } else {
      res.status(503).json(errorResponse('System is unhealthy', JSON.stringify(healthData)));
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json(errorResponse(
      'Health check failed', 
      error instanceof Error ? error.message : 'Unknown error'
    ));
  }
});

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Información detallada del sistema
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información del sistema
 */
app.get('/info', (req, res) => {
  res.json(successResponse({
    application: {
      name: 'TradeConnect Platform',
      version: '1.0.0',
      description: 'Plataforma completa para gestión de eventos empresariales',
      author: 'TradeConnect Team'
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      pid: process.pid
    },
    features: {
      modules: 15,
      endpoints: 167,
      paymentGateways: ['PayPal', 'Stripe', 'NeoNet', 'BAM'],
      felIntegration: true,
      blockchainSupport: true,
      qrCodes: true,
      certificates: true,
      hybridEvents: true
    }
  }, 'System information retrieved successfully'));
});

// ====================================================================
// MANEJO DE ERRORES 404
// ====================================================================
app.use((req, res, next) => {
  res.status(404).json(errorResponse(
    `Route ${req.originalUrl} not found`,
    'The requested endpoint does not exist'
  ));
});

// ====================================================================
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// ====================================================================
app.use(errorLogger);

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error('Global error handler:', error);
  
  // Error de validación JSON
  if (error.message === 'Invalid JSON') {
    res.status(400).json(errorResponse('Invalid JSON format'));
    return;
  }
  
  // Error de payload muy grande
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json(errorResponse('File too large'));
    return;
  }
  
  // Error de Sequelize (base de datos)
  if (error.name === 'SequelizeValidationError') {
    res.status(400).json(errorResponse(
      'Database validation error',
      error.errors?.map((e: any) => e.message).join(', ')
    ));
    return;
  }
  
  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json(errorResponse('Invalid token'));
    return;
  }
  
  if (error.name === 'TokenExpiredError') {
    res.status(401).json(errorResponse('Token expired'));
    return;
  }
  
  // Error genérico
  const statusCode = error.statusCode || error.status || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? error.message 
    : 'Internal server error';
    
  res.status(statusCode).json(errorResponse(message, error.stack));
  return;
});

// ====================================================================
// FUNCIÓN DE INICIALIZACIÓN DEL SERVIDOR
// ====================================================================
const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Starting TradeConnect Platform...');
    
    // Verificar conexión a base de datos
    console.log('📊 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Verificar conexión a Redis
    console.log('🔄 Connecting to Redis...');
    const redisConnected = await testRedisConnection();
    if (redisConnected) {
      console.log('✅ Redis connected successfully');
    } else {
      console.log('⚠️  Redis connection failed - some features may not work');
    }
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`
╭─────────────────────────────────────────────────────────────╮
│                                                             │
│  🚀 TradeConnect Platform Server Started Successfully!     │
│                                                             │
│  📍 Environment: ${config.NODE_ENV.padEnd(44)} │
│  🔗 URL: http://localhost:${PORT}${' '.repeat(33)} │
│  📝 Health Check: http://localhost:${PORT}/health${' '.repeat(25)} │
│  📊 System Info: http://localhost:${PORT}/info${' '.repeat(26)} │
│  📚 API Documentation: http://localhost:${PORT}/api/docs${' '.repeat(19)} │
│  ⏰ Started at: ${new Date().toISOString().padEnd(37)} │
│                                                             │
│  🎯 Ready to accept requests!                              │
│                                                             │
╰─────────────────────────────────────────────────────────────╯
      `);
    });
    
    // Manejo graceful de shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await sequelize.close();
          console.log('🗄️  Database connection closed');
          
          const { closeRedisConnections } = await import('./config/redis');
          await closeRedisConnections();
          console.log('🔄 Redis connections closed');
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };
    
    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ====================================================================
// INICIAR SERVIDOR
// ====================================================================
startServer();

export default app;