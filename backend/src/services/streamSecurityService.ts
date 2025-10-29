/**
 * @fileoverview Servicio de Seguridad para Streams
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Seguridad avanzada para transmisiones: encriptación, rate limiting, auditoría
 *
 * Archivo: backend/src/services/streamSecurityService.ts
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { AuditLog } from '../models/AuditLog';

/**
 * Configuración de seguridad para streams
 */
interface StreamSecurityConfig {
  encryptionEnabled: boolean;
  jwtExpirationHours: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  blockDurationMinutes: number;
  auditAllActions: boolean;
}

/**
 * Datos de sesión de stream
 */
interface StreamSession {
  sessionId: string;
  eventId: number;
  participantId: number;
  platform: string;
  encryptionKey?: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Servicio de seguridad avanzada para streams
 */
export class StreamSecurityService {
  private config: StreamSecurityConfig;
  private encryptionKey: string;
  private jwtSecret: string;

  constructor() {
    this.config = {
      encryptionEnabled: process.env.STREAM_ENCRYPTION_ENABLED === 'true',
      jwtExpirationHours: parseInt(process.env.STREAM_JWT_EXPIRATION_HOURS || '24'),
      maxRequestsPerMinute: parseInt(process.env.STREAM_MAX_REQUESTS_PER_MINUTE || '60'),
      maxRequestsPerHour: parseInt(process.env.STREAM_MAX_REQUESTS_PER_HOUR || '1000'),
      blockDurationMinutes: parseInt(process.env.STREAM_BLOCK_DURATION_MINUTES || '15'),
      auditAllActions: process.env.STREAM_AUDIT_ALL_ACTIONS === 'true'
    };

    this.encryptionKey = process.env.STREAM_ENCRYPTION_KEY || 'default-stream-encryption-key-32-chars!';
    this.jwtSecret = process.env.STREAM_JWT_SECRET || 'default-stream-jwt-secret-32-chars!!!!';
  }

  // ====================================================================
  // AUTENTICACIÓN JWT PARA STREAMS PRIVADOS
  // ====================================================================

  /**
   * Genera token JWT para acceso a stream privado
   */
  async generateStreamToken(session: StreamSession): Promise<string> {
    try {
      const payload = {
        sessionId: session.sessionId,
        eventId: session.eventId,
        participantId: session.participantId,
        platform: session.platform,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(session.expiresAt.getTime() / 1000)
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        algorithm: 'HS256'
      });

      // Almacenar en cache para validación rápida
      await cacheService.set(`stream_token:${session.sessionId}`, {
        ...session,
        token
      }, this.config.jwtExpirationHours * 3600);

      // Registrar en auditoría
      await this.auditAction('stream_token_generated', {
        sessionId: session.sessionId,
        participantId: session.participantId,
        eventId: session.eventId
      });

      return token;

    } catch (error) {
      logger.error('Error generando token de stream:', error);
      throw new Error('Failed to generate stream token');
    }
  }

  /**
   * Valida token JWT de stream
   */
  async validateStreamToken(token: string): Promise<StreamSession | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;

      // Verificar en cache
      const cached = await cacheService.get(`stream_token:${decoded.sessionId}`);
      if (!cached) {
        logger.warn(`Token de stream expirado o inválido: ${decoded.sessionId}`);
        return null;
      }

      // Verificar expiración adicional
      if (new Date() > new Date((cached as any).expiresAt)) {
        await cacheService.delete(`stream_token:${decoded.sessionId}`);
        return null;
      }

      return cached as StreamSession;

    } catch (error) {
      logger.error('Error validando token de stream:', error);
      return null;
    }
  }

  /**
   * Revoca token de stream
   */
  async revokeStreamToken(sessionId: string): Promise<void> {
    try {
      await cacheService.delete(`stream_token:${sessionId}`);

      await this.auditAction('stream_token_revoked', {
        sessionId
      });

    } catch (error) {
      logger.error('Error revocando token de stream:', error);
      throw error;
    }
  }

  // ====================================================================
  // ENCRIPTACIÓN END-TO-END
  // ====================================================================

  /**
   * Genera clave de encriptación para stream
   */
  generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encripta datos usando AES-256-GCM
   */
  encryptData(data: string, key?: string): string {
    if (!this.config.encryptionEnabled) {
      return data;
    }

    try {
      const encryptionKey = key || this.encryptionKey;
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'utf8'), iv);

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Retornar IV + Auth Tag + Datos encriptados
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

    } catch (error) {
      logger.error('Error encriptando datos:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Desencripta datos usando AES-256-GCM
   */
  decryptData(encryptedData: string, key?: string): string {
    if (!this.config.encryptionEnabled) {
      return encryptedData;
    }

    try {
      const encryptionKey = key || this.encryptionKey;
      const parts = encryptedData.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'utf8'), iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      logger.error('Error desencriptando datos:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Encripta metadatos de stream para transmisión segura
   */
  encryptStreamMetadata(metadata: any, sessionKey?: string): string {
    return this.encryptData(JSON.stringify(metadata), sessionKey);
  }

  /**
   * Desencripta metadatos de stream
   */
  decryptStreamMetadata(encryptedMetadata: string, sessionKey?: string): any {
    const decrypted = this.decryptData(encryptedMetadata, sessionKey);
    return JSON.parse(decrypted);
  }

  // ====================================================================
  // RATE LIMITING POR PARTICIPANTE
  // ====================================================================

  /**
   * Verifica rate limiting para participante
   */
  async checkRateLimit(participantId: number, action: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      const key = `rate_limit:${participantId}:${action}`;
      const now = Date.now();
      const windowMs = 60000; // 1 minuto
      const maxRequests = this.config.maxRequestsPerMinute;

      // Obtener contador actual
      const current = await cacheService.get(key) as any || {
        count: 0,
        resetTime: now + windowMs
      };

      // Resetear si la ventana expiró
      if (now > current.resetTime) {
        current.count = 0;
        current.resetTime = now + windowMs;
      }

      const allowed = current.count < maxRequests;
      const remaining = Math.max(0, maxRequests - current.count - 1);

      if (allowed) {
        current.count++;
        await cacheService.set(key, current, Math.ceil(windowMs / 1000));
      } else {
        // Registrar intento de rate limit excedido
        await this.auditAction('rate_limit_exceeded', {
          participantId,
          action,
          count: current.count,
          maxRequests
        });
      }

      return {
        allowed,
        remaining,
        resetTime: new Date(current.resetTime)
      };

    } catch (error) {
      logger.error('Error verificando rate limit:', error);
      // En caso de error, permitir la acción
      return {
        allowed: true,
        remaining: this.config.maxRequestsPerMinute,
        resetTime: new Date(Date.now() + 60000)
      };
    }
  }

  /**
   * Bloquea temporalmente a un participante por abuso
   */
  async blockParticipant(participantId: number, reason: string, durationMinutes?: number): Promise<void> {
    try {
      const blockDuration = (durationMinutes || this.config.blockDurationMinutes) * 60; // convertir a segundos
      const blockKey = `blocked:${participantId}`;

      await cacheService.set(blockKey, {
        reason,
        blockedAt: new Date(),
        expiresAt: new Date(Date.now() + blockDuration * 1000)
      }, blockDuration);

      await this.auditAction('participant_blocked', {
        participantId,
        reason,
        durationMinutes: durationMinutes || this.config.blockDurationMinutes
      });

    } catch (error) {
      logger.error('Error bloqueando participante:', error);
      throw error;
    }
  }

  /**
   * Verifica si un participante está bloqueado
   */
  async isParticipantBlocked(participantId: number): Promise<{ blocked: boolean; reason?: string; expiresAt?: Date }> {
    try {
      const blockData = await cacheService.get(`blocked:${participantId}`) as any;

      if (!blockData) {
        return { blocked: false };
      }

      if (new Date() > new Date(blockData.expiresAt)) {
        await cacheService.delete(`blocked:${participantId}`);
        return { blocked: false };
      }

      return {
        blocked: true,
        reason: blockData.reason,
        expiresAt: new Date(blockData.expiresAt)
      };

    } catch (error) {
      logger.error('Error verificando bloqueo de participante:', error);
      return { blocked: false };
    }
  }

  // ====================================================================
  // AUDITORÍA COMPLETA
  // ====================================================================

  /**
   * Registra acción en auditoría
   */
  private async auditAction(action: string, data: any): Promise<void> {
    try {
      if (!this.config.auditAllActions && !['stream_token_generated', 'stream_token_revoked', 'rate_limit_exceeded', 'participant_blocked'].includes(action)) {
        return;
      }

      await AuditLog.log(
        action,
        'stream_security',
        {
          ...data,
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: 'stream-security-service'
        }
      );

    } catch (error) {
      logger.error('Error registrando en auditoría:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Obtiene estadísticas de seguridad
   */
  async getSecurityStats(timeRangeHours: number = 24): Promise<any> {
    try {
      // TODO: Implementar consultas de auditoría para estadísticas
      // Por ahora, retornar datos básicos
      return {
        totalTokensGenerated: 0, // TODO: contar desde auditoría
        totalTokensRevoked: 0,
        totalRateLimitExceeded: 0,
        totalParticipantsBlocked: 0,
        activeBlocks: 0,
        timeRangeHours,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas de seguridad:', error);
      throw error;
    }
  }

  /**
   * Valida configuración de seguridad
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.encryptionEnabled && this.encryptionKey.length < 32) {
      errors.push('STREAM_ENCRYPTION_KEY debe tener al menos 32 caracteres');
    }

    if (this.jwtSecret.length < 32) {
      errors.push('STREAM_JWT_SECRET debe tener al menos 32 caracteres');
    }

    if (this.config.maxRequestsPerMinute < 1) {
      errors.push('STREAM_MAX_REQUESTS_PER_MINUTE debe ser mayor a 0');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const streamSecurityService = new StreamSecurityService();
