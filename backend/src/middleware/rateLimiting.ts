/**
 * @fileoverview Middleware de Rate Limiting para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Middleware para control de tasa de requests y protección contra abuso
 *
 * Archivo: backend/src/middleware/rateLimiting.ts
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimit, RateLimitRequestHandler, ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis';
import { RATE_LIMITS, HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { securityService } from '../services/securityService';

// ====================================================================
// CONFIGURACIONES DE RATE LIMITING
// ====================================================================

/**
 * Rate limiter general para todas las rutas
 */
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.GLOBAL.windowMs / 1000),
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:global:'
  }),
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown'),
  handler: async (req: Request, res: Response) => {
    // Log de rate limit excedido
    await securityService.logSecurityEvent('rate_limit_exceeded', {
      resource: 'api',
      resourceId: req.path,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      metadata: {
        path: req.path,
        method: req.method,
        userId: (req as any).user?.id
      },
      severity: 'medium'
    });

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Demasiadas solicitudes. Intente más tarde.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(RATE_LIMITS.GLOBAL.windowMs / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter específico para autenticación
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intente más tarde.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.AUTH.windowMs / 1000),
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:auth:'
  }),
  keyGenerator: (req: Request) => {
    // Para login, usar email + IP para evitar bloqueo de usuarios legítimos
    const email = req.body?.email;
    const ip = ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown');
    return email ? `${email}:${ip}` : ip;
  },
  handler: async (req: Request, res: Response) => {
    // Log de rate limit de autenticación (potencial ataque de fuerza bruta)
    await securityService.logSecurityEvent('auth_rate_limit_exceeded', {
      resource: 'auth',
      resourceId: req.body?.email || 'unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      metadata: {
        email: req.body?.email,
        attempts: RATE_LIMITS.AUTH.max
      },
      severity: 'high'
    });

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Demasiados intentos de autenticación. Intente más tarde.',
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(RATE_LIMITS.AUTH.windowMs / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter para recuperación de contraseña
 */
export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.windowMs,
  max: RATE_LIMITS.PASSWORD_RESET.max,
  message: {
    success: false,
    message: 'Demasiados intentos de recuperación de contraseña. Intente más tarde.',
    error: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.PASSWORD_RESET.windowMs / 1000),
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:password_reset:'
  }),
  keyGenerator: (req: Request) => {
    // Usar email para limitar por usuario
    return req.body?.email || ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown');
  }
});

/**
 * Rate limiter para pagos
 */
export const paymentLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: RATE_LIMITS.PAYMENT.windowMs,
  max: RATE_LIMITS.PAYMENT.max,
  message: {
    success: false,
    message: 'Demasiados intentos de pago. Intente más tarde.',
    error: 'PAYMENT_RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.PAYMENT.windowMs / 1000),
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:payment:'
  }),
  keyGenerator: (req: Request) => {
    // Usar user ID si está autenticado, sino IP
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown');
  }
});

/**
 * Rate limiter para facturación FEL
 */
export const felLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: RATE_LIMITS.FEL.windowMs,
  max: RATE_LIMITS.FEL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de facturación. Intente más tarde.',
    error: 'FEL_RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.FEL.windowMs / 1000),
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:fel:'
  }),
  keyGenerator: (req: Request) => {
    // Usar user ID para limitar por usuario
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown');
  }
});

/**
 * Rate limiter para generación de certificados
 */
export const certificateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: RATE_LIMITS.CERTIFICATES.windowMs,
  max: RATE_LIMITS.CERTIFICATES.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de certificados. Intente más tarde.',
    error: 'CERTIFICATE_RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.CERTIFICATES.windowMs / 1000),
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:certificate:'
  }),
  keyGenerator: (req: Request) => {
    // Usar user ID para limitar por usuario
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown');
  }
});

/**
 * Rate limiter para envío de notificaciones
 */
export const notificationLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: RATE_LIMITS.NOTIFICATIONS.windowMs,
  max: RATE_LIMITS.NOTIFICATIONS.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de notificaciones. Intente más tarde.',
    error: 'NOTIFICATION_RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(RATE_LIMITS.NOTIFICATIONS.windowMs / 1000),
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:notification:'
  }),
  keyGenerator: (req: Request) => {
    // Usar user ID para limitar por usuario
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown');
  }
});

/**
 * Rate limiter específico para códigos promocionales
 */
export const promoCodeLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo 20 intentos por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de validación de códigos promocionales. Intente más tarde.',
    error: 'PROMO_CODE_RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60,
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
    prefix: 'rl:promo_code:'
  }),
  keyGenerator: (req: Request) => {
    // Usar combinación de IP y user ID para mayor precisión
    const userId = (req as any).user?.id;
    const ip = ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown');
    return userId ? `user:${userId}:${ip}` : ip;
  },
  handler: async (req: Request, res: Response) => {
    // Log de rate limit excedido para códigos promocionales
    await securityService.logSecurityEvent('rate_limit_exceeded', {
      resource: 'promo_code',
      resourceId: req.body?.code || 'unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      metadata: {
        path: req.path,
        method: req.method,
        code: req.body?.code,
        userId: (req as any).user?.id
      },
      severity: 'high'
    });

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Demasiados intentos de validación de códigos promocionales. Intente más tarde.',
      error: 'PROMO_CODE_RATE_LIMIT_EXCEEDED',
      retryAfter: 15 * 60,
      timestamp: new Date().toISOString()
    });
  }
});

// ====================================================================
// MIDDLEWARE DE RATE LIMITING ADAPTATIVO
// ====================================================================

/**
 * Rate limiter adaptativo basado en el comportamiento del usuario
 */
export const adaptiveLimiter = (
  baseWindowMs: number = 15 * 60 * 1000, // 15 minutos
  baseMax: number = 100,
  suspiciousMultiplier: number = 0.5 // Reducir límite para usuarios sospechosos
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userId = (req as any).user?.id;

      // Verificar si la IP está bloqueada
      const isBlocked = await securityService.isIPBlocked(ip);
      if (isBlocked) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Acceso bloqueado temporalmente',
          error: 'IP_BLOCKED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar si hay actividad sospechosa reciente
      let maxRequests = baseMax;
      if (userId) {
        const suspiciousActivity = await securityService.detectSuspiciousActivity(userId, 60); // Última hora
        if (suspiciousActivity.success && suspiciousActivity.data.isSuspicious) {
          maxRequests = Math.floor(maxRequests * suspiciousMultiplier);
        }
      }

      // Aplicar rate limiting adaptativo
      const limiter = rateLimit({
        windowMs: baseWindowMs,
        max: maxRequests,
        message: {
          success: false,
          message: 'Demasiadas solicitudes. Intente más tarde.',
          error: 'ADAPTIVE_RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(baseWindowMs / 1000),
          timestamp: new Date().toISOString()
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
          sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
          prefix: 'rl:adaptive:'
        }),
        keyGenerator: () => userId ? `user:${userId}` : ipKeyGenerator(ip)
      });

      limiter(req, res, next);

    } catch (error) {
      logger.error('Error en rate limiting adaptativo:', error);
      next();
    }
  };
};

// ====================================================================
// MIDDLEWARE DE DETECCIÓN DE ATAQUES
// ====================================================================

/**
 * Middleware para detectar y prevenir ataques de fuerza bruta
 */
export const bruteForceProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Verificar intentos de fuerza bruta
    const bruteForceCheck = await securityService.detectBruteForce(ip);

    if (bruteForceCheck.isBruteForce) {
      // Bloquear IP temporalmente
      await securityService.blockIP(ip, 30 * 60, 'Intento de fuerza bruta detectado', 0); // 30 minutos

      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Demasiados intentos fallidos. Acceso bloqueado temporalmente.',
        error: 'BRUTE_FORCE_DETECTED',
        retryAfter: 30 * 60, // 30 minutos en segundos
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();

  } catch (error) {
    logger.error('Error en protección contra fuerza bruta:', error);
    next();
  }
};

/**
 * Middleware para detectar solicitudes sospechosas
 */
export const suspiciousRequestDetection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    const path = req.path;
    const method = req.method;

    // Detectar user agents sospechosos
    const suspiciousPatterns = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /dirbuster/i,
      /gobuster/i,
      /burpsuite/i,
      /owasp/i,
      /acunetix/i,
      /nessus/i
    ];

    const isSuspiciousUA = suspiciousPatterns.some(pattern => pattern.test(userAgent));

    if (isSuspiciousUA) {
      await securityService.logSecurityEvent('suspicious_user_agent', {
        resource: 'api',
        resourceId: path,
        ipAddress: ip,
        userAgent,
        metadata: { method, path },
        severity: 'high'
      });
    }

    // Detectar paths de ataque comunes
    const attackPaths = [
      /\.\./,  // Directory traversal
      /<script/i,  // XSS attempts
      /union.*select/i,  // SQL injection
      /eval\(/i,  // Code injection
      /base64_/i,  // Base64 encoding attempts
      /phpinfo/i,  // PHP info disclosure
      /\.env/i,  // Environment file access
      /\.git/i,  // Git repository access
      /wp-admin/i,  // WordPress admin access
      /adminer/i,  // Adminer access
      /phpmyadmin/i  // phpMyAdmin access
    ];

    const isAttackPath = attackPaths.some(pattern => pattern.test(path));

    if (isAttackPath) {
      await securityService.logSecurityEvent('suspicious_path_access', {
        resource: 'api',
        resourceId: path,
        ipAddress: ip,
        userAgent,
        metadata: { method, path },
        severity: 'high'
      });

      // Bloquear temporalmente
      await securityService.blockIP(ip, 60 * 60, 'Acceso a path sospechoso', 0); // 1 hora

      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Acceso denegado',
        error: 'SUSPICIOUS_ACCESS',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();

  } catch (error) {
    logger.error('Error en detección de solicitudes sospechosas:', error);
    next();
  }
};

// ====================================================================
// MIDDLEWARE DE RATE LIMITING POR USUARIO
// ====================================================================

/**
 * Rate limiter que se adapta al nivel de privilegios del usuario
 */
export const privilegeBasedLimiter = (
  normalLimit: number = 100,
  adminLimit: number = 1000
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const isAdmin = user?.roles?.some((role: string) =>
        ['super_admin', 'admin'].includes(role)
      );

      const limit = isAdmin ? adminLimit : normalLimit;

      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: limit,
        message: {
          success: false,
          message: 'Demasiadas solicitudes. Intente más tarde.',
          error: 'PRIVILEGE_RATE_LIMIT_EXCEEDED',
          retryAfter: 15 * 60,
          timestamp: new Date().toISOString()
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
          sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
          prefix: 'rl:privilege:'
        }),
        keyGenerator: () => user?.id ? `user:${user.id}` : ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown')
      });

      limiter(req, res, next);

    } catch (error) {
      logger.error('Error en rate limiting por privilegios:', error);
      next();
    }
  };
};

// ====================================================================
// UTILIDADES DE RATE LIMITING
// ====================================================================

/**
 * Función para crear rate limiter personalizado
 */
export const createCustomLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  prefix?: string;
  keyGenerator?: (req: Request) => string;
}): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message || 'Demasiadas solicitudes. Intente más tarde.',
      error: 'CUSTOM_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000),
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
      prefix: options.prefix || 'rl:custom:'
    }),
    keyGenerator: options.keyGenerator || ((req: Request) =>
      ipKeyGenerator(req.ip || req.connection.remoteAddress || 'unknown')
    )
  });
};

/**
 * Middleware para resetear contador de rate limiting después de éxito
 */
export const resetLimiterOnSuccess = (limiter: RateLimitRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json;
    res.json = function(data: any) {
      // Si la respuesta es exitosa, podríamos resetear el contador aquí
      // Pero express-rate-limit no expone esta funcionalidad directamente
      return originalJson.call(this, data);
    };
    limiter(req, res, next);
  };
};
