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
import { 
  LoginCredentials, 
  RegisterData, 
  ChangePasswordData, 
  ResetPasswordData,
  AuthenticatedRequest 
} from '../types/auth.types';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';

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

      const { email } = req.body;
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      };

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
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - method
   *               - verificationCode
   *             properties:
   *               method:
   *                 type: string
   *                 enum: [totp, sms, email]
   *                 example: "totp"
   *               phoneNumber:
   *                 type: string
   *                 example: "+502 1234-5678"
   *               emailAddress:
   *                 type: string
   *                 example: "backup@email.com"
   *               verificationCode:
   *                 type: string
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: 2FA habilitado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async enable2FA(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { method, phoneNumber, emailAddress, verificationCode } = req.body;
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

      // TODO: Implementar lógica de habilitación 2FA en authService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad no implementada aún',
        error: 'NOT_IMPLEMENTED',
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
   *     summary: Verificar código 2FA
   *     description: Verifica un código 2FA durante el proceso de login
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - sessionId
   *             properties:
   *               code:
   *                 type: string
   *                 example: "123456"
   *               sessionId:
   *                 type: string
   *                 example: "session_123"
   *     responses:
   *       200:
   *         description: Código 2FA verificado exitosamente
   *       400:
   *         description: Código inválido
   *       500:
   *         description: Error interno del servidor
   */
  async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const { code, sessionId } = req.body;

      if (!code || !sessionId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Código y sessionId son requeridos',
          error: 'MISSING_PARAMETERS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Implementar lógica de verificación 2FA en authService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad no implementada aún',
        error: 'NOT_IMPLEMENTED',
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
   *               - password
   *             properties:
   *               password:
   *                 type: string
   *                 example: "current_password"
   *     responses:
   *       200:
   *         description: 2FA deshabilitado exitosamente
   *       400:
   *         description: Contraseña incorrecta
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  async disable2FA(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { password } = req.body;
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

      if (!password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Contraseña actual es requerida',
          error: 'MISSING_PASSWORD',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Implementar lógica de deshabilitación 2FA en authService
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        message: 'Funcionalidad no implementada aún',
        error: 'NOT_IMPLEMENTED',
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
}

export const authController = new AuthController();