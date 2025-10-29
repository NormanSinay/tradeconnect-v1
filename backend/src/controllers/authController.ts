/**
 * @fileoverview Controlador de Autenticación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para endpoints de autenticación y autorización
 * 
 * Archivo: backend/src/controllers/authController.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { sessionService } from '../services/sessionService';
import { turnstileService } from '../services/turnstileService';
import {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  ResetPasswordData,
  AuthenticatedRequest,
  AuthUser,
  CreateUserData,
  UserUpdateData
} from '../types/auth.types';
import { HTTP_STATUS, PERMISSIONS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { AuditLog } from '../models/AuditLog';

/**
 * Controlador para manejo de autenticación y autorización
 */
export class AuthController {

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: Iniciar sesión de usuario
   *     description: Autentica un usuario con email y contraseña, opcionalmente con 2FA
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login exitoso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Autenticación exitosa"
   *                 data:
   *                   $ref: '#/components/schemas/AuthResponse'
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Credenciales inválidas
   *       423:
   *         description: Cuenta bloqueada
   *       500:
   *         description: Error interno del servidor
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Verificar validaciones
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const credentials: LoginCredentials = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      // Verificar Turnstile si se proporciona
      if (credentials.recaptchaToken) {
        console.log('🔍 Verificando Cloudflare Turnstile para login...');
        const turnstileResult = await turnstileService.verifyLoginToken(
          credentials.recaptchaToken,
          clientInfo.ipAddress
        );

        if (!turnstileResult.isValid) {
          console.warn('❌ Turnstile inválido para login:', turnstileResult.reasons);
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Verificación de seguridad fallida',
            error: 'TURNSTILE_FAILED',
            details: turnstileResult.reasons,
            timestamp: new Date().toISOString()
          });
          return;
        }

        console.log('✅ Turnstile válido para login');
      }

      const result = await authService.login(credentials, clientInfo);

      const statusCode = result.success ? HTTP_STATUS.OK : 
        result.error === 'INVALID_CREDENTIALS' ? HTTP_STATUS.UNAUTHORIZED :
        result.error === 'ACCOUNT_LOCKED' ? HTTP_STATUS.LOCKED :
        result.error === 'ACCOUNT_DISABLED' ? HTTP_STATUS.FORBIDDEN :
        result.error === 'TWO_FACTOR_REQUIRED' ? HTTP_STATUS.UNAUTHORIZED :
        result.error === 'TWO_FACTOR_INVALID' ? HTTP_STATUS.UNAUTHORIZED :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en login controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: Registrar nuevo usuario
   *     description: Crea una nueva cuenta de usuario en el sistema
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: Usuario registrado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Usuario registrado exitosamente. Revise su email para verificar la cuenta."
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/AuthUser'
   *                     requiresEmailVerification:
   *                       type: boolean
   *                       example: true
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Datos de entrada inválidos
   *       409:
   *         description: Email ya registrado
   *       500:
   *         description: Error interno del servidor
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Verificar validaciones
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userData: RegisterData = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      // Verificar Turnstile si se proporciona
      if (userData.recaptchaToken) {
        console.log('🔍 Verificando Cloudflare Turnstile para registro...');
        const turnstileResult = await turnstileService.verifyRegisterToken(
          userData.recaptchaToken,
          clientInfo.ipAddress
        );

        if (!turnstileResult.isValid) {
          console.warn('❌ Turnstile inválido para registro:', turnstileResult.reasons);
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Verificación de seguridad fallida',
            error: 'TURNSTILE_FAILED',
            details: turnstileResult.reasons,
            timestamp: new Date().toISOString()
          });
          return;
        }

        console.log('✅ Turnstile válido para registro');
      }

      const result = await authService.register(userData, clientInfo);

      const statusCode = result.success ? HTTP_STATUS.CREATED :
        result.error === 'EMAIL_ALREADY_EXISTS' ? HTTP_STATUS.CONFLICT :
        result.error === 'NIT_ALREADY_EXISTS' ? HTTP_STATUS.CONFLICT :
        result.error === 'TERMS_NOT_ACCEPTED' ? HTTP_STATUS.BAD_REQUEST :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en register controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags: [Authentication]
   *     summary: Cerrar sesión
   *     description: Termina la sesión actual del usuario
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Sesión cerrada exitosamente
   *       401:
   *         description: Token inválido o expirado
   *       500:
   *         description: Error interno del servidor
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sessionId = req.sessionId;
      if (!sessionId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Sesión no encontrada',
          error: 'SESSION_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      const result = await authService.logout(sessionId, clientInfo);
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error en logout controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/refresh-token:
   *   post:
   *     tags: [Authentication]
   *     summary: Refrescar token de acceso
   *     description: Genera un nuevo token de acceso usando el refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *     responses:
   *       200:
   *         description: Token refrescado exitosamente
   *       401:
   *         description: Refresh token inválido
   *       500:
   *         description: Error interno del servidor
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Refresh token es requerido',
          error: 'MISSING_REFRESH_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      const result = await authService.refreshToken(refreshToken, clientInfo);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.UNAUTHORIZED;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en refresh token controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Solicitar reseteo de contraseña
   *     description: Envía un email con instrucciones para resetear la contraseña
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "usuario@tradeconnect.gt"
   *     responses:
   *       200:
   *         description: Email enviado (si el email existe)
   *       400:
   *         description: Email inválido
   *       429:
   *         description: Demasiados intentos
   *       500:
   *         description: Error interno del servidor
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email inválido',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { email, recaptchaToken } = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      // Verificar Turnstile si se proporciona
      if (recaptchaToken) {
        console.log('🔍 Verificando Cloudflare Turnstile para recuperación de contraseña...');
        const turnstileResult = await turnstileService.verifyForgotPasswordToken(
          recaptchaToken,
          clientInfo.ipAddress
        );

        if (!turnstileResult.isValid) {
          console.warn('❌ Turnstile inválido para recuperación de contraseña:', turnstileResult.reasons);
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Verificación de seguridad fallida',
            error: 'TURNSTILE_FAILED',
            details: turnstileResult.reasons,
            timestamp: new Date().toISOString()
          });
          return;
        }

        console.log('✅ Turnstile válido para recuperación de contraseña');
      }

      const result = await authService.forgotPassword(email, clientInfo);
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error en forgot password controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     tags: [Authentication]
   *     summary: Resetear contraseña
   *     description: Establece una nueva contraseña usando el token de reset
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResetPasswordData'
   *     responses:
   *       200:
   *         description: Contraseña actualizada exitosamente
   *       400:
   *         description: Datos inválidos o token expirado
   *       500:
   *         description: Error interno del servidor
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const resetData: ResetPasswordData = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      const result = await authService.resetPassword(resetData, clientInfo);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'TOKEN_INVALID' ? HTTP_STATUS.BAD_REQUEST :
        result.error === 'PASSWORD_MISMATCH' ? HTTP_STATUS.BAD_REQUEST :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en reset password controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/verify-email:
   *   post:
   *     tags: [Authentication]
   *     summary: Verificar email
   *     description: Verifica la dirección de email usando el token enviado
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *             properties:
   *               token:
   *                 type: string
   *                 example: "abc123def456"
   *     responses:
   *       200:
   *         description: Email verificado exitosamente
   *       400:
   *         description: Token inválido o expirado
   *       500:
   *         description: Error interno del servidor
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Token de verificación es requerido',
          error: 'MISSING_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      const result = await authService.verifyEmail(token, clientInfo);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en verify email controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/2fa/enable:
   *   post:
   *     tags: [Authentication]
   *     summary: Habilitar autenticación de dos factores
   *     description: Configura 2FA para la cuenta del usuario
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 2FA habilitado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "2FA habilitado exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     qrCode:
   *                       type: string
   *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
   *                     secret:
   *                       type: string
   *                       example: "JBSWY3DPEHPK3PXP"
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async enable2FA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar si 2FA ya está habilitado
      const user = await User.findByPk(userId);
      if (user?.is2faEnabled) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '2FA ya está habilitado para esta cuenta',
          error: '2FA_ALREADY_ENABLED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generar secreto TOTP
      const speakeasy = require('speakeasy');
      const qrcode = require('qrcode');

      const secret = speakeasy.generateSecret({
        name: `TradeConnect (${user?.email})`,
        issuer: 'TradeConnect'
      });

      // Generar QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      // Guardar secreto temporalmente (se confirmará después)
      // TODO: Implementar almacenamiento temporal seguro

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Configuración 2FA preparada. Escanea el código QR y confirma.',
        data: {
          qrCode: qrCodeUrl,
          secret: secret.base32
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en enable 2FA controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/2fa/verify:
   *   post:
   *     tags: [Authentication]
   *     summary: Verificar código 2FA para habilitar
   *     description: Verifica el código 2FA y completa la configuración
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - secret
   *             properties:
   *               code:
   *                 type: string
   *                 example: "123456"
   *               secret:
   *                 type: string
   *                 example: "JBSWY3DPEHPK3PXP"
   *     responses:
   *       200:
   *         description: Código 2FA verificado y 2FA habilitado
   *       400:
   *         description: Código inválido
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async verify2FA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code, secret } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!code || !secret) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Código y secreto son requeridos',
          error: 'MISSING_PARAMETERS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar código TOTP
      const speakeasy = require('speakeasy');
      const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2 // Permitir 30 segundos de tolerancia
      });

      if (!isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Código 2FA inválido',
          error: 'INVALID_2FA_CODE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Habilitar 2FA en la base de datos
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Guardar secreto de forma segura (encriptado)
      await user.update({
        is2faEnabled: true,
        // TODO: Agregar campo para secreto 2FA en modelo User
      });

      // Registrar en auditoría
      await AuditLog.log(
        '2fa_enabled',
        'user',
        {
          userId,
          resourceId: userId.toString(),
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '2FA habilitado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en verify 2FA controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/2fa/disable:
   *   post:
   *     tags: [Authentication]
   *     summary: Deshabilitar autenticación de dos factores
   *     description: Desactiva 2FA para la cuenta del usuario
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *             properties:
   *               code:
   *                 type: string
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: 2FA deshabilitado exitosamente
   *       400:
   *         description: Código inválido
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async disable2FA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!code) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Código 2FA es requerido',
          error: 'MISSING_CODE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar si 2FA está habilitado
      const user = await User.findByPk(userId);
      if (!user?.is2faEnabled) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '2FA no está habilitado para esta cuenta',
          error: '2FA_NOT_ENABLED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Obtener secreto 2FA del usuario (desde campo encriptado)
      // Por ahora, asumimos que el secreto está disponible
      const secret = 'TEMP_SECRET'; // TODO: Implementar recuperación segura

      // Verificar código TOTP
      const speakeasy = require('speakeasy');
      const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (!isValid) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Código 2FA inválido',
          error: 'INVALID_2FA_CODE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Deshabilitar 2FA
      await user.update({ is2faEnabled: false });

      // Registrar en auditoría
      await AuditLog.log(
        '2fa_disabled',
        'user',
        {
          userId,
          resourceId: userId.toString(),
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        }
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '2FA deshabilitado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error en disable 2FA controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/auth/password/change:
   *   post:
   *     tags: [Authentication]
   *     summary: Cambiar contraseña
   *     description: Cambia la contraseña del usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ChangePasswordData'
   *     responses:
   *       200:
   *         description: Contraseña cambiada exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: Contraseña actual incorrecta
   *       500:
   *         description: Error interno del servidor
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const passwordData: ChangePasswordData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      // Verificar Turnstile si se proporciona (para cambio de contraseña sensible)
      if (passwordData.recaptchaToken) {
        console.log('🔍 Verificando Cloudflare Turnstile para cambio de contraseña...');
        const turnstileResult = await turnstileService.verifyChangePasswordToken(
          passwordData.recaptchaToken,
          clientInfo.ipAddress
        );

        if (!turnstileResult.isValid) {
          console.warn('❌ Turnstile inválido para cambio de contraseña:', turnstileResult.reasons);
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Verificación de seguridad fallida',
            error: 'TURNSTILE_FAILED',
            details: turnstileResult.reasons,
            timestamp: new Date().toISOString()
          });
          return;
        }

        console.log('✅ Turnstile válido para cambio de contraseña');
      }

      const result = await authService.changePassword(userId, passwordData, clientInfo);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'INVALID_CREDENTIALS' ? HTTP_STATUS.UNAUTHORIZED :
        result.error === 'PASSWORD_MISMATCH' ? HTTP_STATUS.BAD_REQUEST :
        HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error en change password controller:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // MÉTODOS DE PERFIL DE USUARIO
  // ====================================================================

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await userService.getUserProfile(userId);

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Subir avatar del usuario
   */
  async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Implementar subida de archivos con multer
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad no implementada aún',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error subiendo avatar:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar avatar del usuario
   */
  async deleteAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await userService.updateUserProfile(userId, { avatar: undefined }, {
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      });

      const statusCode = result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error eliminando avatar:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // MÉTODOS DE GESTIÓN DE SESIONES
  // ====================================================================

  /**
   * Obtener sesiones activas del usuario
   */
  async getUserSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await authService.getUserSessions(userId);
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo sesiones:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Terminar otras sesiones del usuario
   */
  async terminateOtherSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const currentSessionId = req.sessionId;

      if (!userId || !currentSessionId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await authService.terminateAllOtherSessions(userId, currentSessionId);
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error terminando otras sesiones:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener estadísticas de sesiones
   */
  async getSessionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.VIEW_AUDIT_LOGS);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await sessionService.getSessionStats();
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo estadísticas de sesiones:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // MÉTODOS DE 2FA ADICIONALES
  // ====================================================================

  /**
   * Enviar código OTP para 2FA
   */
  async sendOTPCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

      const result = await authService.sendOTPCode(userId, clientInfo);
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error enviando código OTP:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener códigos de respaldo 2FA
   */
  async getBackupCodes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Implementar obtención de códigos de respaldo
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad no implementada aún',
        error: 'NOT_IMPLEMENTED',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error obteniendo códigos de respaldo:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // MÉTODOS DE ADMINISTRACIÓN DE USUARIOS
  // ====================================================================

  /**
   * Listar usuarios (admin)
   */
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.READ_USER);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { page, limit, search, role, isActive } = req.query;

      const filters = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        search: search as string,
        role: role as string,
        isActive: isActive ? isActive === 'true' : undefined
      };

      const result = await userService.getUsers(filters);
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Crear usuario (admin)
   */
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.CREATE_USER);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userData: CreateUserData = req.body;
      const result = await userService.createUser(userData);

      const statusCode = result.success ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST;
      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error creando usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Actualizar usuario (admin)
   */
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.UPDATE_USER);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'VALIDATION_ERROR',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = parseInt(req.params.id);
      const updateData: UserUpdateData = req.body;

      const result = await userService.updateUser(userId, updateData, req.user?.id || 0);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'USER_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error actualizando usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Eliminar usuario (admin)
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.DELETE_USER);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = parseInt(req.params.id);
      const result = await userService.deleteUser(userId, req.user?.id || 0);

      const statusCode = result.success ? HTTP_STATUS.OK :
        result.error === 'USER_NOT_FOUND' ? HTTP_STATUS.NOT_FOUND :
        HTTP_STATUS.BAD_REQUEST;

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener auditoría de usuario (admin)
   */
  async getUserAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verificar permisos administrativos
      const userPermissions = req.user?.permissions || [];
      const hasPermission = userPermissions.includes(PERMISSIONS.VIEW_USER_AUDIT);

      if (!hasPermission) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Permisos insuficientes',
          error: 'FORBIDDEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const userId = parseInt(req.params.id);
      const { page, limit } = req.query;

      const pagination = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20
      };

      const result = await userService.getUserAudit(userId, pagination);
      res.status(HTTP_STATUS.OK).json(result);

    } catch (error) {
      logger.error('Error obteniendo auditoría de usuario:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  // ====================================================================
  // MÉTODOS DE VALIDACIÓN GUATEMALA
  // ====================================================================

  /**
   * Validar CUI guatemalteco
   */
  async validateCui(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'CUI debe tener exactamente 13 dígitos',
          error: 'INVALID_CUI_FORMAT',
          details: errors.array(),
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { cui } = req.body;

      // Validar formato básico (ya validado por express-validator)
      const isValidFormat = /^\d{13}$/.test(cui);

      if (!isValidFormat) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'CUI debe tener exactamente 13 dígitos',
          error: 'INVALID_CUI_FORMAT',
          data: { cui, isValid: false },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar si ya está registrado
      const existingUser = await User.findOne({
        where: { cui },
        paranoid: false
      });

      const isAvailable = !existingUser;

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: isAvailable ? 'CUI válido y disponible' : 'CUI válido pero ya registrado',
        data: {
          cui,
          isValid: true,
          isAvailable
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error validando CUI:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const authController = new AuthController();
