/**
 * @fileoverview Servicio de Autenticación de Dos Factores para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para gestión de 2FA
 *
 * Archivo: backend/src/services/twoFactorService.ts
 */

import { TwoFactorAuth } from '../models/TwoFactorAuth';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { TwoFactorSetup, TwoFactorVerification } from '../types/auth.types';
import { ApiResponse } from '../types/global.types';
import { logger } from '../utils/logger';

/**
 * Servicio para manejo de autenticación de dos factores
 */
export class TwoFactorService {

  /**
   * Genera configuración inicial para 2FA
   */
  async generate2FASetup(userId: number, method: 'totp' | 'sms' | 'email'): Promise<ApiResponse<TwoFactorSetup>> {
    try {
      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que no tenga 2FA ya habilitado
      const existing2FA = await TwoFactorAuth.findByUserId(userId);
      if (existing2FA && existing2FA.isEnabled) {
        return {
          success: false,
          message: '2FA ya está habilitado para este usuario',
          error: 'TWO_FA_ALREADY_ENABLED',
          timestamp: new Date().toISOString()
        };
      }

      let setupData: Partial<TwoFactorSetup> = {
        method
      };

      // Generar configuración según el método
      switch (method) {
        case 'totp':
          const secret = TwoFactorAuth.generateTOTPUrl('', user.email, 'TradeConnect');
          setupData.secret = secret.split('secret=')[1]?.split('&')[0] || '';
          setupData.qrCodeUrl = TwoFactorAuth.generateTOTPUrl(setupData.secret, user.email, 'TradeConnect');
          break;

        case 'sms':
          if (!user.phone) {
            return {
              success: false,
              message: 'El usuario no tiene un número de teléfono registrado',
              error: 'PHONE_NOT_REGISTERED',
              timestamp: new Date().toISOString()
            };
          }
          setupData.phoneNumber = user.phone;
          break;

        case 'email':
          setupData.emailAddress = user.email;
          break;
      }

      // Generar códigos de respaldo
      const backupCodes = TwoFactorAuth.prototype.generateBackupCodes.call({}, 10);
      setupData.backupCodes = backupCodes;

      return {
        success: true,
        message: 'Configuración 2FA generada exitosamente',
        data: setupData as TwoFactorSetup,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error generando configuración 2FA:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Habilita 2FA para un usuario
   */
  async enable2FA(
    userId: number,
    setupData: TwoFactorSetup,
    verificationCode: string,
    clientInfo: { ipAddress: string; userAgent: string }
  ): Promise<ApiResponse<void>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar código de verificación
      const isValidCode = await this.verify2FACode(userId, verificationCode, setupData.method);
      if (!isValidCode) {
        return {
          success: false,
          message: 'Código de verificación inválido',
          error: 'INVALID_VERIFICATION_CODE',
          timestamp: new Date().toISOString()
        };
      }

      // Crear o actualizar registro 2FA
      const twoFactorData = {
        userId,
        secret: setupData.secret,
        backupCodes: TwoFactorAuth.prototype.hashBackupCodes.call({}, setupData.backupCodes),
        isEnabled: true,
        method: setupData.method,
        phoneNumber: setupData.phoneNumber,
        emailAddress: setupData.emailAddress
      };

      await TwoFactorAuth.upsert({
        ...twoFactorData,
        failedAttempts: 0,
        method: setupData.method || 'totp'
      });

      // Actualizar usuario
      user.is2faEnabled = true;
      await user.save();

      // Registrar en auditoría
      await AuditLog.log(
        '2fa_enabled',
        'user',
        {
          userId,
          resourceId: userId.toString(),
          newValues: {
            method: setupData.method,
            enabled: true
          },
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        }
      );

      return {
        success: true,
        message: '2FA habilitado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error habilitando 2FA:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Deshabilita 2FA para un usuario
   */
  async disable2FA(
    userId: number,
    password: string,
    clientInfo: { ipAddress: string; userAgent: string }
  ): Promise<ApiResponse<void>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar contraseña
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Contraseña incorrecta',
          error: 'INVALID_PASSWORD',
          timestamp: new Date().toISOString()
        };
      }

      // Deshabilitar 2FA
      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      if (twoFactorAuth) {
        await twoFactorAuth.disable();
      }

      // Actualizar usuario
      user.is2faEnabled = false;
      await user.save();

      // Registrar en auditoría
      await AuditLog.log(
        '2fa_disabled',
        'user',
        {
          userId,
          resourceId: userId.toString(),
          oldValues: { is2faEnabled: true },
          newValues: { is2faEnabled: false },
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        }
      );

      return {
        success: true,
        message: '2FA deshabilitado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error deshabilitando 2FA:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica un código 2FA
   */
  async verify2FACode(
    userId: number,
    code: string,
    method?: 'totp' | 'sms' | 'email' | 'backup'
  ): Promise<boolean> {
    try {
      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
        return false;
      }

      // Si está bloqueado temporalmente
      if (twoFactorAuth.isLocked) {
        return false;
      }

      let isValid = false;

      if (method === 'backup' || (!method && twoFactorAuth.backupCodes.some(bc => bc))) {
        // Intentar como código de respaldo
        isValid = await twoFactorAuth.verifyBackupCode(code);
      } else {
        // Verificar según método
        switch (twoFactorAuth.method) {
          case 'totp':
            isValid = TwoFactorAuth.verifyTOTPCode(twoFactorAuth.secret, code);
            break;
          case 'sms':
          case 'email':
            // TODO: Implementar verificación SMS/Email
            // Por ahora, simular verificación
            isValid = code === '123456'; // Código de prueba
            break;
        }

        if (isValid) {
          await twoFactorAuth.resetFailedAttempts();
        } else {
          await twoFactorAuth.incrementFailedAttempts();
        }
      }

      return isValid;

    } catch (error) {
      logger.error('Error verificando código 2FA:', error);
      return false;
    }
  }

  /**
   * Regenera códigos de respaldo
   */
  async regenerateBackupCodes(userId: number): Promise<ApiResponse<string[]>> {
    try {
      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
        return {
          success: false,
          message: '2FA no está habilitado para este usuario',
          error: 'TWO_FA_NOT_ENABLED',
          timestamp: new Date().toISOString()
        };
      }

      const newCodes = await twoFactorAuth.regenerateBackupCodes();

      return {
        success: true,
        message: 'Códigos de respaldo regenerados exitosamente',
        data: newCodes,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error regenerando códigos de respaldo:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estado de 2FA de un usuario
   */
  async get2FAStatus(userId: number): Promise<ApiResponse<any>> {
    try {
      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);

      if (!twoFactorAuth) {
        return {
          success: true,
          message: 'Estado 2FA obtenido exitosamente',
          data: {
            isEnabled: false,
            method: null,
            lastUsedAt: null,
            backupCodesCount: 0
          },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'Estado 2FA obtenido exitosamente',
        data: {
          isEnabled: twoFactorAuth.isEnabled,
          method: twoFactorAuth.method,
          methodInfo: twoFactorAuth.methodInfo,
          lastUsedAt: twoFactorAuth.lastUsedAt,
          backupCodesCount: twoFactorAuth.backupCodes.length,
          isLocked: twoFactorAuth.isLocked,
          failedAttempts: twoFactorAuth.failedAttempts
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estado 2FA:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Envía código 2FA por SMS
   */
  async sendSMSCode(userId: number): Promise<ApiResponse<void>> {
    try {
      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      if (!twoFactorAuth || !twoFactorAuth.isEnabled || twoFactorAuth.method !== 'sms') {
        return {
          success: false,
          message: '2FA por SMS no está configurado',
          error: 'SMS_2FA_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      // TODO: Implementar envío real de SMS
      // Por ahora, solo loggear
      logger.info(`Código 2FA enviado por SMS a ${twoFactorAuth.phoneNumber} para usuario ${userId}`);

      return {
        success: true,
        message: 'Código enviado por SMS exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error enviando código por SMS:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Envía código 2FA por email
   */
  async sendEmailCode(userId: number): Promise<ApiResponse<void>> {
    try {
      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      if (!twoFactorAuth || !twoFactorAuth.isEnabled || twoFactorAuth.method !== 'email') {
        return {
          success: false,
          message: '2FA por email no está configurado',
          error: 'EMAIL_2FA_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      // TODO: Implementar envío real de email
      // Por ahora, solo loggear
      logger.info(`Código 2FA enviado por email a ${twoFactorAuth.emailAddress} para usuario ${userId}`);

      return {
        success: true,
        message: 'Código enviado por email exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error enviando código por email:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtiene estadísticas de uso de 2FA
   */
  async get2FAStats(): Promise<ApiResponse<any>> {
    try {
      const stats = await TwoFactorAuth.get2FAStats();
      const usersWith2FA = await TwoFactorAuth.getUsersWith2FAEnabled();

      return {
        success: true,
        message: 'Estadísticas 2FA obtenidas exitosamente',
        data: {
          methodDistribution: stats,
          totalUsersWith2FA: usersWith2FA.length,
          usersWith2FA: usersWith2FA.map(u => ({
            userId: u.userId,
            method: u.method,
            enabledAt: u.createdAt
          }))
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas 2FA:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fuerza deshabilitación de 2FA (para administradores)
   */
  async forceDisable2FA(
    userId: number,
    adminId: number,
    reason: string
  ): Promise<ApiResponse<void>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      if (twoFactorAuth) {
        await twoFactorAuth.disable();
      }

      user.is2faEnabled = false;
      await user.save();

      // Registrar en auditoría
      await AuditLog.log(
        '2fa_force_disabled',
        'user',
        {
          userId: adminId,
          resourceId: userId.toString(),
          oldValues: { is2faEnabled: true },
          newValues: {
            is2faEnabled: false,
            reason,
            adminId
          },
          ipAddress: 'system',
          userAgent: 'system'
        }
      );

      return {
        success: true,
        message: '2FA deshabilitado exitosamente por administrador',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error forzando deshabilitación de 2FA:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Valida configuración de 2FA
   */
  async validate2FAConfig(userId: number): Promise<ApiResponse<any>> {
    try {
      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);

      if (!twoFactorAuth) {
        return {
          success: true,
          message: 'Configuración 2FA validada',
          data: {
            isConfigured: false,
            isEnabled: false,
            issues: ['2FA no configurado']
          },
          timestamp: new Date().toISOString()
        };
      }

      const issues: string[] = [];

      // Verificar configuración según método
      switch (twoFactorAuth.method) {
        case 'totp':
          if (!twoFactorAuth.secret) {
            issues.push('Secret TOTP no configurado');
          }
          break;
        case 'sms':
          if (!twoFactorAuth.phoneNumber) {
            issues.push('Número de teléfono no configurado');
          }
          break;
        case 'email':
          if (!twoFactorAuth.emailAddress) {
            issues.push('Email alternativo no configurado');
          }
          break;
      }

      if (twoFactorAuth.backupCodes.length === 0) {
        issues.push('No hay códigos de respaldo configurados');
      }

      return {
        success: true,
        message: 'Configuración 2FA validada',
        data: {
          isConfigured: true,
          isEnabled: twoFactorAuth.isEnabled,
          method: twoFactorAuth.method,
          hasBackupCodes: twoFactorAuth.backupCodes.length > 0,
          isLocked: twoFactorAuth.isLocked,
          issues
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error validando configuración 2FA:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const twoFactorService = new TwoFactorService();