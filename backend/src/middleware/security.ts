/**
 * @fileoverview Middleware de Seguridad Adicional para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Middleware para validaciones de seguridad, sanitización y protección adicional
 *
 * Archivo: backend/src/middleware/security.ts
 */

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { securityService } from '../services/securityService';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

// ====================================================================
// MIDDLEWARE DE SANITIZACIÓN DE INPUT
// ====================================================================

/**
 * Middleware para sanitizar y validar input del usuario
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Función recursiva para sanitizar objetos
    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        // Sanitizar HTML y caracteres peligrosos
        let sanitized = validator.escape(value);
        // Remover caracteres de control excepto espacios y saltos de línea
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        return sanitized;
      } else if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      } else if (value && typeof value === 'object') {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
      }
      return value;
    };

    // Sanitizar body (query y params son readonly en Express)
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }

    // Nota: req.query y req.params son readonly en Express
    // Se validan pero no se modifican para evitar errores

    next();

  } catch (error) {
    logger.error('Error en sanitización de input:', error);
    next();
  }
};

/**
 * Middleware para validar y filtrar headers de seguridad
 */
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const suspiciousHeaders = [
      'x-forwarded-for', // Podría ser spoofed
      'x-real-ip',
      'x-client-ip',
      'x-forwarded-host',
      'x-forwarded-proto',
      'x-forwarded-port',
      'x-forwarded-scheme'
    ];

    // Log de headers sospechosos
    const foundSuspicious = suspiciousHeaders.filter(header =>
      req.headers[header.toLowerCase()]
    );

    if (foundSuspicious.length > 0) {
      securityService.logSecurityEvent('suspicious_headers', {
        resource: 'api',
        resourceId: req.path,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        metadata: {
          suspiciousHeaders: foundSuspicious,
          allHeaders: req.headers
        },
        severity: 'medium'
      }).catch(error => {
        logger.error('Error logging suspicious headers:', error);
      });
    }

    // Validar Content-Type para requests con body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Content-Type debe ser application/json',
          error: 'INVALID_CONTENT_TYPE',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    next();

  } catch (error) {
    logger.error('Error validando headers de seguridad:', error);
    next();
  }
};

// ====================================================================
// MIDDLEWARE DE VALIDACIÓN DE ORIGEN
// ====================================================================

/**
 * Lista de orígenes permitidos
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://tradeconnect.gt',
  'https://www.tradeconnect.gt',
  'https://admin.tradeconnect.gt',
  'https://api.tradeconnect.gt'
];

/**
 * Middleware para validar el origen de la solicitud
 */
export const validateOrigin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const origin = req.get('Origin') || req.get('Referer');
    const host = req.get('Host');

    if (origin) {
      // Verificar si el origen está en la lista blanca
      const isAllowed = ALLOWED_ORIGINS.some(allowedOrigin =>
        origin.startsWith(allowedOrigin)
      );

      if (!isAllowed) {
        securityService.logSecurityEvent('invalid_origin', {
          resource: 'api',
          resourceId: req.path,
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          metadata: {
            origin,
            host,
            method: req.method,
            path: req.path
          },
          severity: 'high'
        }).catch(error => {
          logger.error('Error logging invalid origin:', error);
        });

        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Origen no autorizado',
          error: 'INVALID_ORIGIN',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    next();

  } catch (error) {
    logger.error('Error validando origen:', error);
    next();
  }
};

// ====================================================================
// MIDDLEWARE DE DETECCIÓN DE ATAQUES
// ====================================================================

/**
 * Middleware para detectar inyección SQL
 */
export const detectSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\\x23)|(\%27)|(\%23))/i,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
      /(-|=|!|<|>|\|)/i,
      /(\bscript\b)/i,
      /(<|>|<|>)/i
    ];

    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return sqlPatterns.some(pattern => pattern.test(value));
      } else if (Array.isArray(value)) {
        return value.some(checkValue);
      } else if (value && typeof value === 'object') {
        return Object.values(value).some(checkValue);
      }
      return false;
    };

    const hasSQLInjection = checkValue(req.body) ||
                           checkValue(req.query) ||
                           checkValue(req.params);

    if (hasSQLInjection) {
      securityService.logSecurityEvent('sql_injection_attempt', {
        resource: 'api',
        resourceId: req.path,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        metadata: {
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query,
          params: req.params
        },
        severity: 'critical'
      }).catch(error => {
        logger.error('Error logging SQL injection attempt:', error);
      });

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Solicitud inválida',
        error: 'INVALID_REQUEST',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();

  } catch (error) {
    logger.error('Error detectando inyección SQL:', error);
    next();
  }
};

/**
 * Middleware para detectar XSS (Cross-Site Scripting)
 */
export const detectXSS = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /document\.location/gi,
      /window\.location/gi
    ];

    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return xssPatterns.some(pattern => pattern.test(value));
      } else if (Array.isArray(value)) {
        return value.some(checkValue);
      } else if (value && typeof value === 'object') {
        return Object.values(value).some(checkValue);
      }
      return false;
    };

    const hasXSS = checkValue(req.body) ||
                   checkValue(req.query) ||
                   checkValue(req.params);

    if (hasXSS) {
      securityService.logSecurityEvent('xss_attempt', {
        resource: 'api',
        resourceId: req.path,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        metadata: {
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query,
          params: req.params
        },
        severity: 'high'
      }).catch(error => {
        logger.error('Error logging XSS attempt:', error);
      });

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Solicitud inválida',
        error: 'INVALID_REQUEST',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();

  } catch (error) {
    logger.error('Error detectando XSS:', error);
    next();
  }
};

/**
 * Middleware para detectar ataques de directory traversal
 */
export const detectDirectoryTraversal = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const traversalPatterns = [
      /\.\.\//g,
      /\.\\/g,
      /%2e%2e%2f/g,
      /%2e%2e\//g,
      /\.\./g
    ];

    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return traversalPatterns.some(pattern => pattern.test(value));
      } else if (Array.isArray(value)) {
        return value.some(checkValue);
      } else if (value && typeof value === 'object') {
        return Object.values(value).some(checkValue);
      }
      return false;
    };

    const hasTraversal = checkValue(req.body) ||
                        checkValue(req.query) ||
                        checkValue(req.params) ||
                        checkValue(req.path);

    if (hasTraversal) {
      securityService.logSecurityEvent('directory_traversal_attempt', {
        resource: 'api',
        resourceId: req.path,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        metadata: {
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query,
          params: req.params
        },
        severity: 'critical'
      }).catch(error => {
        logger.error('Error logging directory traversal attempt:', error);
      });

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Solicitud inválida',
        error: 'INVALID_REQUEST',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();

  } catch (error) {
    logger.error('Error detectando directory traversal:', error);
    next();
  }
};

// ====================================================================
// MIDDLEWARE DE VALIDACIÓN DE ARCHIVOS
// ====================================================================

/**
 * Middleware para validar archivos subidos
 */
export const validateFileUpload = (allowedTypes: string[], maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.file && !req.files) {
        next();
        return;
      }

      const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

      for (const file of files) {
        if (!file) continue;

        // Verificar tamaño
        if (file.size > maxSize) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `Archivo demasiado grande. Máximo permitido: ${maxSize / (1024 * 1024)}MB`,
            error: 'FILE_TOO_LARGE',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Verificar tipo MIME
        if (!allowedTypes.includes(file.mimetype)) {
          securityService.logSecurityEvent('invalid_file_type', {
            resource: 'file_upload',
            resourceId: file.filename,
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            metadata: {
              filename: file.filename,
              mimetype: file.mimetype,
              size: file.size,
              allowedTypes
            },
            severity: 'medium'
          }).catch(error => {
            logger.error('Error logging invalid file type:', error);
          });

          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Tipo de archivo no permitido',
            error: 'INVALID_FILE_TYPE',
            allowedTypes,
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Verificar contenido del archivo (básico)
        if (file.buffer) {
          const buffer = file.buffer;
          const magicBytes = buffer.slice(0, 4).toString('hex');

          // Verificar que el contenido coincida con el tipo MIME
          if (file.mimetype.startsWith('image/') && !magicBytes.match(/^(ffd8|89504e47|47494638|424d)/)) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              message: 'Contenido del archivo no coincide con el tipo declarado',
              error: 'INVALID_FILE_CONTENT',
              timestamp: new Date().toISOString()
            });
            return;
          }
        }
      }

      next();

    } catch (error) {
      logger.error('Error validando archivo:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
};

// ====================================================================
// MIDDLEWARE DE VALIDACIÓN DE REQUEST SIZE
// ====================================================================

/**
 * Middleware para validar el tamaño del request body
 */
export const validateRequestSize = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const contentLength = parseInt(req.get('Content-Length') || '0');

      if (contentLength > 0) {
        const maxSizeBytes = parseSize(maxSize);

        if (contentLength > maxSizeBytes) {
          res.status(HTTP_STATUS.REQUEST_TOO_LONG).json({
            success: false,
            message: `Request demasiado grande. Máximo permitido: ${maxSize}`,
            error: 'REQUEST_TOO_LARGE',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      next();

    } catch (error) {
      logger.error('Error validando tamaño del request:', error);
      next();
    }
  };
};

/**
 * Función auxiliar para parsear tamaños
 */
const parseSize = (size: string): number => {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  return value * units[unit];
};

// ====================================================================
// MIDDLEWARE DE LOGGING DE SEGURIDAD
// ====================================================================

/**
 * Middleware para logging de eventos de seguridad
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log de requests lentos o con errores
    if (duration > 5000 || statusCode >= 400) {
      securityService.logSecurityEvent('api_performance', {
        resource: 'api',
        resourceId: req.path,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        metadata: {
          method: req.method,
          path: req.path,
          statusCode,
          duration,
          userId: (req as any).user?.id
        },
        severity: statusCode >= 500 ? 'high' : statusCode >= 400 ? 'medium' : 'low'
      }).catch(error => {
        logger.error('Error logging API performance:', error);
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// ====================================================================
// MIDDLEWARE COMPUESTO DE SEGURIDAD
// ====================================================================

/**
 * Middleware de seguridad básico para todas las rutas
 */
export const basicSecurity = [
  validateSecurityHeaders,
  sanitizeInput,
  detectSQLInjection,
  detectXSS,
  detectDirectoryTraversal,
  securityLogger
];

/**
 * Middleware de seguridad para rutas públicas
 */
export const publicSecurity = [
  ...basicSecurity,
  validateOrigin
];

/**
 * Middleware de seguridad para rutas protegidas
 */
export const protectedSecurity = [
  ...basicSecurity,
  validateOrigin
];

/**
 * Middleware de seguridad para uploads de archivos
 */
export const fileUploadSecurity = [
  validateRequestSize('50mb'),
  validateFileUpload([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ])
];