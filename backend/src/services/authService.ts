/**
 * @fileoverview Servicio de Autenticación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Lógica de negocio para autenticación, autorización y gestión de sesiones
 * 
 * Archivo: backend/src/services/authService.ts
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Session } from '../models/Session';
import { TwoFactorAuth } from '../models/TwoFactorAuth';
import { AuditLog } from '../models/AuditLog';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  AuthUser,
  ChangePasswordData,
  ResetPasswordData,
  SessionInfo,
  SecurityAuditLog,
  AuthErrorCode,
  SessionStatus
} from '../types/auth.types';
import { ApiResponse } from '../types/global.types';
import { config } from '../config/environment';
import { redis } from '../config/redis';
import { emailService } from './emailService';
import { logger } from '../utils/logger';
import { UserRole, Permission as PermissionType } from '../utils/constants';
import { Permission } from '../models/Permission';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: usuario@tradeconnect.gt
 *         password:
 *           type: string
 *           minLength: 8
 *           example: password123
 *         twoFactorCode:
 *           type: string
 *           length: 6
 *           example: "123456"
 *         rememberMe:
 *           type: boolean
 *           default: false
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - confirmPassword
 *         - firstName
 *         - lastName
 *         - termsAccepted
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: nuevo@tradeconnect.gt
 *         password:
 *           type: string
 *           minLength: 8
 *           example: password123
 *         confirmPassword:
 *           type: string
 *           minLength: 8
 *           example: password123
 *         firstName:
 *           type: string
 *           example: Juan
 *         lastName:
 *           type: string
 *           example: Pérez
 *         phone:
 *           type: string
 *           example: "+502 1234-5678"
 *         nit:
 *           type: string
 *           example: "12345678-9"
 *         cui:
 *           type: string
 *           example: "1234567890101"
 *         termsAccepted:
 *           type: boolean
 *           example: true
 *         marketingAccepted:
 *           type: boolean
 *           default: false
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *         expiresIn:
 *           type: integer
 *           example: 3600
 *         tokenType:
 *           type: string
 *           example: "Bearer"
 *         requires2FA:
 *           type: boolean
 *           example: false
 *         requiresEmailVerification:
 *           type: boolean
 *           example: false
 *     
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           example: usuario@tradeconnect.gt
 *         firstName:
 *           type: string
 *           example: Juan
 *         lastName:
 *           type: string
 *           example: Pérez
 *         fullName:
 *           type: string
 *           example: Juan Pérez
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           example: ["user"]
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["read_event", "create_registration"]
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *         is2FAEnabled:
 *           type: boolean
 *           example: false
 *         isActive:
 *           type: boolean
 *           example: true
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

export class AuthService {
  private readonly JWT_SECRET = config.jwt.secret;
  private readonly JWT_REFRESH_SECRET = config.jwt.refreshSecret;
  private readonly JWT_EXPIRE = config.jwt.expire;
  private readonly JWT_REFRESH_EXPIRE = config.jwt.refreshExpire;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_TIME = 30 * 60 * 1000; // 30 minutos

  // ====================================================================
  // MÉTODOS DE AUTENTICACIÓN
  // ====================================================================

  /**
   * Autentica un usuario con email y contraseña
   */
  async login(credentials: LoginCredentials, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<AuthResponse>> {
    try {
      const { email, password, twoFactorCode, rememberMe } = credentials;
      const { ipAddress, userAgent } = clientInfo;

      // Buscar usuario por email
      const user = await User.findByEmail(email);
      if (!user) {
        await this.logSecurityEvent('login_failed', {
          email,
          reason: 'Usuario no encontrado',
          ipAddress,
          userAgent
        });

        return {
          success: false,
          message: 'Credenciales inválidas',
          error: AuthErrorCode.INVALID_CREDENTIALS,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si la cuenta está bloqueada
      if (user.isTemporarilyLocked) {
        await this.logSecurityEvent('login_blocked', {
          userId: user.id,
          email: user.email,
          reason: 'Cuenta bloqueada por intentos fallidos',
          ipAddress,
          userAgent
        });

        return {
          success: false,
          message: 'Cuenta temporalmente bloqueada. Intente más tarde.',
          error: AuthErrorCode.ACCOUNT_LOCKED,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si la cuenta está activa
      if (!user.isActive) {
        return {
          success: false,
          message: 'Cuenta desactivada. Contacte al administrador.',
          error: AuthErrorCode.ACCOUNT_DISABLED,
          timestamp: new Date().toISOString()
        };
      }

      // Validar contraseña
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        await user.incrementFailedLoginAttempts();
        
        await this.logSecurityEvent('login_failed', {
          userId: user.id,
          email: user.email,
          reason: 'Contraseña incorrecta',
          attempts: user.failedLoginAttempts,
          ipAddress,
          userAgent
        });

        return {
          success: false,
          message: 'Credenciales inválidas',
          error: AuthErrorCode.INVALID_CREDENTIALS,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar 2FA si está habilitado
      if (user.is2FAEnabled) {
        if (!twoFactorCode) {
          return {
            success: false,
            message: 'Código de verificación 2FA requerido',
            error: AuthErrorCode.TWO_FACTOR_REQUIRED,
            timestamp: new Date().toISOString()
          };
        }

        const is2FAValid = await this.verify2FA(user.id, twoFactorCode);
        if (!is2FAValid) {
          await this.logSecurityEvent('2fa_verification_failed', {
            userId: user.id,
            email: user.email,
            ipAddress,
            userAgent
          });

          return {
            success: false,
            message: 'Código 2FA inválido',
            error: AuthErrorCode.TWO_FACTOR_INVALID,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Login exitoso - resetear intentos fallidos
      await user.resetFailedLoginAttempts();
      await user.updateLastLogin(ipAddress);

      // Crear sesión
      const session = await this.createSession(user.id, {
        ipAddress,
        userAgent,
        loginMethod: user.is2FAEnabled ? '2fa' : 'password',
        rememberMe: rememberMe || false
      });

      // Generar tokens
      const authUser = await this.buildAuthUser(user);
      const tokens = await this.generateTokens(authUser, session.sessionId, rememberMe || false);

      // Actualizar refresh token en la sesión
      await session.setRefreshToken(tokens.refreshToken, rememberMe ? 30 : 7);

      await this.logSecurityEvent('login_success', {
        userId: user.id,
        email: user.email,
        sessionId: session.sessionId,
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Autenticación exitosa',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: authUser,
          expiresIn: this.getTokenExpiration(),
          tokenType: 'Bearer' as const,
          requires2FA: false,
          requiresEmailVerification: !user.isEmailVerified
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(userData: RegisterData, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<{ user: AuthUser; requiresEmailVerification: boolean }>> {
    try {
      const { 
        email, 
        password, 
        confirmPassword, 
        firstName, 
        lastName, 
        phone, 
        nit, 
        cui,
        termsAccepted,
        marketingAccepted 
      } = userData;
      const { ipAddress, userAgent } = clientInfo;

      // Validaciones básicas
      if (password !== confirmPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden',
          error: 'PASSWORD_MISMATCH',
          timestamp: new Date().toISOString()
        };
      }

      if (!termsAccepted) {
        return {
          success: false,
          message: 'Debe aceptar los términos y condiciones',
          error: 'TERMS_NOT_ACCEPTED',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si el email ya está registrado
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: 'El email ya está registrado',
          error: 'EMAIL_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar NIT si se proporciona
      if (nit && await User.isNitTaken(nit)) {
        return {
          success: false,
          message: 'El NIT ya está registrado',
          error: 'NIT_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Crear nuevo usuario
      const newUser = await User.create({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        phone,
        nit,
        cui,
        marketingAccepted: marketingAccepted || false,
        termsAcceptedAt: new Date(),
        isEmailVerified: false,
        isActive: true,
        is2FAEnabled: false,
        failedLoginAttempts: 0,
        isAccountLocked: false,
        timezone: 'America/Guatemala',
        locale: 'es'
      });

      // Asignar rol por defecto
      const defaultRole = await Role.getDefaultRole();
      if (defaultRole) {
        await newUser.$add('roles', defaultRole);
      }

      // Generar token de verificación de email
      const emailVerificationToken = await newUser.setEmailVerificationToken();

      // Enviar email de verificación
      await emailService.sendEmailVerification(newUser.email, {
        firstName: newUser.firstName,
        verificationToken: emailVerificationToken,
        verificationUrl: `${config.app.frontendUrl}/verify-email?token=${emailVerificationToken}`
      });

      // Construir objeto de respuesta
      const authUser = await this.buildAuthUser(newUser);

      await this.logSecurityEvent('user_registered', {
        userId: newUser.id,
        email: newUser.email,
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Usuario registrado exitosamente. Revise su email para verificar la cuenta.',
        data: {
          user: authUser,
          requiresEmailVerification: true
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Refresca un token de acceso usando el refresh token
   */
  async refreshToken(refreshToken: string, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      
      // Buscar sesión asociada
      const session = await Session.findBySessionId(decoded.sessionId);
      if (!session || !session.isValid) {
        return {
          success: false,
          message: 'Sesión inválida o expirada',
          error: AuthErrorCode.SESSION_EXPIRED,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar que el refresh token coincida
      if (session.refreshToken !== refreshToken || !session.isRefreshTokenValid) {
        return {
          success: false,
          message: 'Refresh token inválido',
          error: AuthErrorCode.TOKEN_INVALID,
          timestamp: new Date().toISOString()
        };
      }

      // Buscar usuario
      const user = await User.findByPk(session.userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            include: [
              {
                model: Permission,
                as: 'permissions'
              }
            ]
          }
        ]
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'Usuario no válido',
          error: AuthErrorCode.USER_NOT_FOUND,
          timestamp: new Date().toISOString()
        };
      }

      // Actualizar actividad de la sesión
      await session.updateActivity();

      // Generar nuevo access token
      const authUser = await this.buildAuthUser(user);
      const newAccessToken = this.generateAccessToken(authUser, session.sessionId);

      await this.logSecurityEvent('token_refresh', {
        userId: user.id,
        sessionId: session.sessionId,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent
      });

      return {
        success: true,
        message: 'Token refrescado exitosamente',
        data: {
          accessToken: newAccessToken,
          expiresIn: this.getTokenExpiration()
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          message: 'Refresh token inválido',
          error: AuthErrorCode.TOKEN_INVALID,
          timestamp: new Date().toISOString()
        };
      }

      logger.error('Error en refresh token:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cierra sesión del usuario
   */
  async logout(sessionId: string, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<void>> {
    try {
      const session = await Session.findBySessionId(sessionId);
      if (session) {
        await session.terminate();
        await session.clearRefreshToken();

        await this.logSecurityEvent('logout', {
          userId: session.userId,
          sessionId: session.sessionId,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        });

        // Invalidar token en Redis (blacklist)
        await this.blacklistToken(sessionId);
      }

      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en logout:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS DE GESTIÓN DE CONTRASEÑAS
  // ====================================================================

  /**
   * Inicia el proceso de recuperación de contraseña
   */
  async forgotPassword(email: string, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<void>> {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // No revelar si el email existe o no por seguridad
        return {
          success: true,
          message: 'Si el email existe, recibirá instrucciones para resetear su contraseña.',
          timestamp: new Date().toISOString()
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Esta cuenta está desactivada',
          error: AuthErrorCode.ACCOUNT_DISABLED,
          timestamp: new Date().toISOString()
        };
      }

      // Generar token de reset
      const resetToken = await user.setPasswordResetToken();

      // Enviar email con instrucciones
      await emailService.sendPasswordReset(user.email, {
        firstName: user.firstName,
        resetToken,
        resetUrl: `${config.app.frontendUrl}/reset-password?token=${resetToken}`
      });

      await this.logSecurityEvent('password_reset_request', {
        userId: user.id,
        email: user.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent
      });

      return {
        success: true,
        message: 'Si el email existe, recibirá instrucciones para resetear su contraseña.',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en forgot password:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Resetea la contraseña usando el token de reset
   */
  async resetPassword(resetData: ResetPasswordData, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<void>> {
    try {
      const { resetToken, newPassword, confirmPassword } = resetData;

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden',
          error: 'PASSWORD_MISMATCH',
          timestamp: new Date().toISOString()
        };
      }

      const user = await User.findByPasswordResetToken(resetToken);
      if (!user) {
        return {
          success: false,
          message: 'Token de reset inválido o expirado',
          error: AuthErrorCode.TOKEN_INVALID,
          timestamp: new Date().toISOString()
        };
      }

      // Actualizar contraseña
      user.password = newPassword;
      await user.clearPasswordResetToken();
      await user.save();

      // Terminar todas las sesiones del usuario por seguridad
      await Session.terminateUserSessions(user.id);

      await this.logSecurityEvent('password_reset_complete', {
        userId: user.id,
        email: user.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent
      });

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en reset password:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(userId: number, passwordData: ChangePasswordData, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<void>> {
    try {
      const { currentPassword, newPassword, confirmNewPassword } = passwordData;

      if (newPassword !== confirmNewPassword) {
        return {
          success: false,
          message: 'Las contraseñas no coinciden',
          error: 'PASSWORD_MISMATCH',
          timestamp: new Date().toISOString()
        };
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          error: AuthErrorCode.USER_NOT_FOUND,
          timestamp: new Date().toISOString()
        };
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await user.validatePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Contraseña actual incorrecta',
          error: AuthErrorCode.INVALID_CREDENTIALS,
          timestamp: new Date().toISOString()
        };
      }

      // Actualizar contraseña
      user.password = newPassword;
      await user.save();

      // Terminar todas las otras sesiones excepto la actual
      await Session.terminateUserSessions(user.id);

      await this.logSecurityEvent('password_change', {
        userId: user.id,
        email: user.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent
      });

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en change password:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS DE VERIFICACIÓN DE EMAIL
  // ====================================================================

  /**
   * Verifica el email del usuario usando el token enviado
   */
  async verifyEmail(token: string, clientInfo: {
    ipAddress: string;
    userAgent: string;
  }): Promise<ApiResponse<void>> {
    try {
      const user = await User.findByEmailVerificationToken(token);
      if (!user) {
        return {
          success: false,
          message: 'Token de verificación inválido o expirado',
          error: AuthErrorCode.TOKEN_INVALID,
          timestamp: new Date().toISOString()
        };
      }

      await user.markEmailAsVerified();

      await this.logSecurityEvent('email_verification', {
        userId: user.id,
        email: user.email,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent
      });

      return {
        success: true,
        message: 'Email verificado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en verify email:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Reenvía el email de verificación
   */
  async resendEmailVerification(email: string): Promise<ApiResponse<void>> {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return {
          success: true,
          message: 'Si el email existe, recibirá un nuevo email de verificación.',
          timestamp: new Date().toISOString()
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          message: 'El email ya está verificado',
          error: 'EMAIL_ALREADY_VERIFIED',
          timestamp: new Date().toISOString()
        };
      }

      const emailVerificationToken = await user.setEmailVerificationToken();

      await emailService.sendEmailVerification(user.email, {
        firstName: user.firstName,
        verificationToken: emailVerificationToken,
        verificationUrl: `${config.app.frontendUrl}/verify-email?token=${emailVerificationToken}`
      });

      return {
        success: true,
        message: 'Si el email existe, recibirá un nuevo email de verificación.',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en resend email verification:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS DE GESTIÓN DE SESIONES
  // ====================================================================

  /**
   * Crea una nueva sesión para el usuario
   */
  private async createSession(userId: number, sessionData: {
    ipAddress: string;
    userAgent: string;
    loginMethod: 'password' | '2fa' | 'social' | 'token';
    rememberMe: boolean;
  }): Promise<Session> {
    const { ipAddress, userAgent, loginMethod, rememberMe } = sessionData;
    
    // Parsear información del dispositivo
    const deviceInfo = Session.parseUserAgentString(userAgent);
    
    // Configurar duración de la sesión
    const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionDuration);
    
    const session = await Session.create({
      userId,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      deviceOS: deviceInfo.os,
      deviceBrowser: deviceInfo.browser,
      isActive: true,
      isCurrent: true,
      lastActivity: new Date(),
      expiresAt,
      loginMethod,
      sessionId: '' // Se genera automáticamente en el hook
    });

    // Limitar número de sesiones activas por usuario (máximo 10)
    await this.limitUserSessions(userId, 10);

    return session;
  }

  /**
   * Obtiene las sesiones activas del usuario
   */
  async getUserSessions(userId: number): Promise<ApiResponse<SessionInfo[]>> {
    try {
      const sessions = await Session.getActiveUserSessions(userId);
      
      const sessionInfos: SessionInfo[] = sessions.map(session => ({
        sessionId: session.sessionId,
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        device: {
          type: session.deviceType,
          os: session.deviceOS,
          browser: session.deviceBrowser
        },
        location: {
          country: session.locationCountry || 'Unknown',
          city: session.locationCity || 'Unknown',
          region: session.locationRegion || 'Unknown'
        },
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
        isCurrent: session.isCurrent
      }));

      return {
        success: true,
        message: 'Sesiones obtenidas exitosamente',
        data: sessionInfos,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo sesiones del usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Termina una sesión específica del usuario
   */
  async terminateSession(userId: number, sessionId: string): Promise<ApiResponse<void>> {
    try {
      const session = await Session.findBySessionId(sessionId);
      
      if (!session || session.userId !== userId) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        };
      }

      await session.terminate();
      await this.blacklistToken(sessionId);

      return {
        success: true,
        message: 'Sesión terminada exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error terminando sesión:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Termina todas las sesiones del usuario excepto la actual
   */
  async terminateAllOtherSessions(userId: number, currentSessionId: string): Promise<ApiResponse<{ terminatedCount: number }>> {
    try {
      const terminatedCount = await Session.terminateUserSessions(userId, currentSessionId);

      return {
        success: true,
        message: `${terminatedCount} sesiones terminadas exitosamente`,
        data: { terminatedCount },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error terminando sesiones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // MÉTODOS AUXILIARES
  // ====================================================================

  /**
   * Genera tokens JWT para el usuario
   */
  private async generateTokens(user: AuthUser, sessionId: string, rememberMe: boolean): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateAccessToken(user, sessionId);
    const refreshToken = this.generateRefreshToken(user.id, sessionId, rememberMe);

    return { accessToken, refreshToken };
  }

  /**
   * Genera un token de acceso JWT
   */
  private generateAccessToken(user: AuthUser, sessionId: string): string {
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      sessionId
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRE,
      issuer: 'tradeconnect',
      audience: 'tradeconnect-app'
    } as any);
  }

  /**
   * Genera un refresh token JWT
   */
  private generateRefreshToken(userId: number, sessionId: string, rememberMe: boolean): string {
    const payload = {
      userId,
      sessionId,
      type: 'refresh'
    };

    const expiresIn = rememberMe ? this.JWT_REFRESH_EXPIRE : '7d';

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn,
      issuer: 'tradeconnect',
      audience: 'tradeconnect-refresh'
    } as any);
  }

  /**
   * Obtiene la expiración del token en segundos
   */
  private getTokenExpiration(): number {
    const expiration = this.JWT_EXPIRE;
    if (typeof expiration === 'string') {
      // Convertir formato "7d", "24h", etc. a segundos
      const unit = expiration.slice(-1);
      const value = parseInt(expiration.slice(0, -1));
      
      switch (unit) {
        case 'd': return value * 24 * 60 * 60;
        case 'h': return value * 60 * 60;
        case 'm': return value * 60;
        case 's': return value;
        default: return 3600; // 1 hora por defecto
      }
    }
    return expiration;
  }

  /**
   * Construye el objeto AuthUser con roles y permisos
   */
  private async buildAuthUser(user: User): Promise<AuthUser> {
    const userWithRoles = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions'
            }
          ]
        }
      ]
    });

    if (!userWithRoles) {
      throw new Error('Usuario no encontrado');
    }

    // Extraer roles únicos
    const roles = userWithRoles.roles.map(role => role.name);
    
    // Extraer permisos únicos de todos los roles
    const permissionSet = new Set<string>();
    userWithRoles.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionSet.add(permission.name);
      });
    });
    
    const permissions = Array.from(permissionSet) as PermissionType[];

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      roles,
      permissions,
      isEmailVerified: user.isEmailVerified,
      is2FAEnabled: user.is2FAEnabled,
      isActive: user.isActive,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };
  }

  /**
   * Verifica código 2FA
   */
  private async verify2FA(userId: number, code: string): Promise<boolean> {
    // TODO: Implementar verificación 2FA con TwoFactorAuth model
    // Por ahora retorna true para testing
    return true;
  }

  /**
   * Limita el número de sesiones activas por usuario
   */
  private async limitUserSessions(userId: number, maxSessions: number): Promise<void> {
    const activeSessions = await Session.getActiveUserSessions(userId);
    
    if (activeSessions.length >= maxSessions) {
      // Terminar las sesiones más antiguas
      const sessionsToTerminate = activeSessions
        .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
        .slice(0, activeSessions.length - maxSessions + 1);
      
      for (const session of sessionsToTerminate) {
        await session.terminate();
        await this.blacklistToken(session.sessionId);
      }
    }
  }

  /**
   * Agrega un token a la lista negra en Redis
   */
  private async blacklistToken(sessionId: string): Promise<void> {
    try {
      const expiration = this.getTokenExpiration();
      await redis.setex(`blacklist:${sessionId}`, expiration, '1');
    } catch (error) {
      logger.error('Error agregando token a blacklist:', error);
    }
  }

  /**
   * Verifica si un token está en la lista negra
   */
  async isTokenBlacklisted(sessionId: string): Promise<boolean> {
    try {
      const result = await redis.get(`blacklist:${sessionId}`);
      return result === '1';
    } catch (error) {
      logger.error('Error verificando blacklist:', error);
      return false;
    }
  }

  /**
   * Registra eventos de seguridad para auditoría
   */
  private async logSecurityEvent(eventType: string, data: any): Promise<void> {
    try {
      await AuditLog.create({
        userId: data.userId || null,
        action: eventType,
        resource: 'auth',
        resourceId: data.userId?.toString() || null,
        oldValues: undefined,
        newValues: undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        severity: 'low',
        status: 'success',
        metadata: data
      });
    } catch (error) {
      logger.error('Error registrando evento de seguridad:', error);
    }
  }
}

export const authService = new AuthService();