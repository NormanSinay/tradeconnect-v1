/**
 * @fileoverview Rutas de Autenticación para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para autenticación y autorización
 *
 * Archivo: backend/src/routes/auth.ts
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authController } from '../controllers/authController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';

const router = Router();

// ====================================================================
// RATE LIMITING PARA AUTENTICACIÓN
// ====================================================================

// Rate limiter para login
const loginLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para password reset
const passwordResetLimiter = rateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.windowMs,
  max: RATE_LIMITS.PASSWORD_RESET.max,
  message: {
    success: false,
    message: 'Demasiados intentos de reseteo de contraseña. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida'),
  body('twoFactorCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Código 2FA debe tener 6 dígitos'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('rememberMe debe ser un booleano')
];

// Validación para registro
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Contraseña debe contener mayúsculas, minúsculas y números'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Apellido solo puede contener letras'),
  body('phone')
    .optional()
    .matches(/^\+502\s?\d{4}-?\d{4}$/)
    .withMessage('Teléfono debe tener formato guatemalteco (+502 1234-5678)'),
  body('nit')
    .optional()
    .matches(/^\d{8}-[0-9K]$/i)
    .withMessage('NIT debe tener formato guatemalteco (12345678-9)'),
  body('cui')
    .optional()
    .isLength({ min: 13, max: 13 })
    .isNumeric()
    .withMessage('CUI debe tener 13 dígitos'),
  body('termsAccepted')
    .isBoolean()
    .equals('true')
    .withMessage('Debe aceptar los términos y condiciones'),
  body('marketingAccepted')
    .optional()
    .isBoolean()
    .withMessage('marketingAccepted debe ser un booleano')
];

// Validación para cambio de contraseña
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nueva contraseña debe contener mayúsculas, minúsculas y números'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Validación para reset de contraseña
const resetPasswordValidation = [
  body('resetToken')
    .notEmpty()
    .withMessage('Token de reset es requerido'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nueva contraseña debe contener mayúsculas, minúsculas y números'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Validación para 2FA
const enable2FAValidation = [
  body('method')
    .isIn(['totp', 'sms', 'email'])
    .withMessage('Método 2FA inválido'),
  body('phoneNumber')
    .if(body('method').equals('sms'))
    .matches(/^\+502\s?\d{4}-?\d{4}$/)
    .withMessage('Teléfono debe tener formato guatemalteco (+502 1234-5678)'),
  body('emailAddress')
    .if(body('method').equals('email'))
    .isEmail()
    .withMessage('Email inválido'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Código de verificación debe tener 6 dígitos')
];

const verify2FAValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Código 2FA debe tener 6 dígitos'),
  body('sessionId')
    .notEmpty()
    .withMessage('ID de sesión es requerido')
];

const disable2FAValidation = [
  body('password')
    .notEmpty()
    .withMessage('Contraseña actual es requerida')
];

// ====================================================================
// RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña
 */
router.post('/login', loginLimiter, loginValidation, authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario
 */
router.post('/register', registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Solicitar reseteo de contraseña
 *     description: Envía email con instrucciones para resetear contraseña
 */
router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido')
], authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Resetear contraseña
 *     description: Establece nueva contraseña usando token de reset
 */
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Verificar email
 *     description: Verifica dirección de email usando token enviado
 */
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Token de verificación es requerido')
], authController.verifyEmail);

/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     tags: [Authentication]
 *     summary: Verificar código 2FA
 *     description: Verifica código 2FA durante proceso de login
 */
router.post('/2fa/verify', verify2FAValidation, authController.verify2FA);

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Cerrar sesión
 *     description: Termina la sesión actual del usuario
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refrescar token de acceso
 *     description: Genera nuevo token de acceso usando refresh token
 */
router.post('/refresh-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token es requerido')
], authController.refreshToken);

/**
 * @swagger
 * /api/auth/password/change:
 *   post:
 *     tags: [Authentication]
 *     summary: Cambiar contraseña
 *     description: Cambia contraseña del usuario autenticado
 *     security:
 *       - bearerAuth: []
 */
router.post('/password/change', changePasswordValidation, authController.changePassword);

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     tags: [Authentication]
 *     summary: Habilitar 2FA
 *     description: Configura autenticación de dos factores
 *     security:
 *       - bearerAuth: []
 */
router.post('/2fa/enable', enable2FAValidation, authController.enable2FA);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     tags: [Authentication]
 *     summary: Deshabilitar 2FA
 *     description: Desactiva autenticación de dos factores
 *     security:
 *       - bearerAuth: []
 */
router.post('/2fa/disable', disable2FAValidation, authController.disable2FA);

export default router;