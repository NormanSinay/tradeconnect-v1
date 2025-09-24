/**
 * @fileoverview Middleware de logging personalizado para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Sistema de logging avanzado con Winston para auditoría y monitoreo
 */

import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Configuración del logger principal de Winston
 * Niveles: error, warn, info, http, verbose, debug, silly
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
      return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message} ${
        info.stack ? `\n${info.stack}` : ''
      }`;
    })
  ),
  defaultMeta: { 
    service: 'tradeconnect-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Archivo para errores únicamente
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Archivo para todos los logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Archivo específico para requests HTTP
    new winston.transports.File({
      filename: path.join(logsDir, 'requests.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// En desarrollo, también mostrar logs en consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf((info) => {
        return `${info.timestamp} [${info.level}] ${info.message}`;
      })
    )
  }));
}

/**
 * Interface para datos extendidos de logging de requests
 */
interface RequestLogData {
  method: string;
  url: string;
  userAgent: string;
  ip: string;
  userId?: number;
  statusCode?: number;
  duration?: number;
  responseSize?: number;
  timestamp: string;
  errorMessage?: string;
  stack?: string;
}

/**
 * Middleware personalizado de logging para requests HTTP
 * Registra información detallada de cada request y response
 * 
 * @param req - Request object de Express
 * @param res - Response object de Express  
 * @param next - Next function de Express
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Capturar información básica del request
  const logData: RequestLogData = {
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent') || 'Unknown',
    ip: req.ip || req.connection.remoteAddress || 'Unknown',
    userId: (req as any).user?.id, // Si hay usuario autenticado
    timestamp: new Date().toISOString()
  };

  // Interceptar el final de la respuesta para calcular duración
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override del método send
  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    
    const requestLogData: RequestLogData = {
      ...logData,
      statusCode: res.statusCode,
      duration,
      responseSize: body ? Buffer.byteLength(body, 'utf8') : 0
    };
    
    // Log con nivel apropiado según status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request Error', requestLogData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request Warning', requestLogData);
    } else {
      logger.http('HTTP Request', requestLogData);
    }
    
    return originalSend.call(this, body);
  };
  
  // Override del método json
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    const requestLogData: RequestLogData = {
      ...logData,
      statusCode: res.statusCode,
      duration,
      responseSize: body ? Buffer.byteLength(JSON.stringify(body), 'utf8') : 0
    };
    
    // Log con nivel apropiado según status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request Error', requestLogData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request Warning', requestLogData);
    } else {
      logger.http('HTTP Request', requestLogData);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * Middleware para logging de errores de aplicación
 * Registra errores detallados con stack trace
 * 
 * @param error - Error object
 * @param req - Request object de Express
 * @param res - Response object de Express
 * @param next - Next function de Express
 */
export const errorLogger = (
  error: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const errorLogData: RequestLogData = {
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent') || 'Unknown',
    ip: req.ip || req.connection.remoteAddress || 'Unknown',
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
    errorMessage: error.message,
    stack: error.stack
  };
  
  logger.error('Application Error', errorLogData);
  
  next(error);
};

/**
 * Logger para auditoría de acciones del sistema
 * Registra acciones importantes de usuarios para compliance
 * 
 * @param userId - ID del usuario que realiza la acción
 * @param action - Acción realizada
 * @param resource - Recurso afectado
 * @param resourceId - ID del recurso
 * @param details - Detalles adicionales
 * @param ip - Dirección IP del usuario
 */
export const auditLogger = (
  userId: number,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  ip?: string
): void => {
  logger.info('Audit Log', {
    userId,
    action,
    resource,
    resourceId,
    details,
    ip,
    timestamp: new Date().toISOString(),
    type: 'audit'
  });
};

/**
 * Logger para eventos del sistema
 * Registra eventos importantes del sistema como inicios, cierres, etc.
 * 
 * @param event - Nombre del evento
 * @param details - Detalles del evento
 * @param level - Nivel de log (info, warn, error)
 */
export const systemLogger = (
  event: string,
  details?: any,
  level: 'info' | 'warn' | 'error' = 'info'
): void => {
  logger[level]('System Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
    type: 'system'
  });
};

/**
 * Logger para transacciones de pago
 * Registra información sensible de pagos de forma segura
 * 
 * @param transactionId - ID de la transacción
 * @param userId - ID del usuario
 * @param amount - Monto (se registra de forma segura)
 * @param gateway - Pasarela de pago utilizada
 * @param status - Estado de la transacción
 * @param details - Detalles adicionales (sin información sensible)
 */
export const paymentLogger = (
  transactionId: string,
  userId: number,
  amount: number,
  gateway: string,
  status: string,
  details?: any
): void => {
  logger.info('Payment Transaction', {
    transactionId,
    userId,
    amount: `***${amount.toString().slice(-2)}`, // Solo últimos 2 dígitos
    gateway,
    status,
    details,
    timestamp: new Date().toISOString(),
    type: 'payment'
  });
};

// Exportar logger principal para uso directo
export { logger };
export default logger;