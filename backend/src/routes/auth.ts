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
import { authLimiter } from '../middleware/rateLimiting';
import { authenticated } from '../middleware/auth';

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
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido solo puede contener letras'),
  body('phone')
    .optional()
    .matches(/^\+502\s?\d{4}-?\d{4}$/)
    .withMessage('Teléfono debe tener formato guatemalteco (+502 1234-5678)'),
  body('nit')
    .optional()
    .matches(/^\d{8}(-[0-9K])?$/i)
    .withMessage('NIT debe tener formato guatemalteco (12345678 o 12345678-9)'),
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
 *     description: Autentica un usuario con email y contraseña. Soporta autenticación de dos factores opcional.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@ejemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 1
 *                 description: Contraseña del usuario
 *                 example: "MiContraseña123"
 *               twoFactorCode:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: '^\d{6}$'
 *                 description: Código de autenticación de dos factores (opcional)
 *                 example: "123456"
 *               rememberMe:
 *                 type: boolean
 *                 description: Recordar sesión por período extendido
 *                 example: true
 *           examples:
 *             login_basico:
 *               summary: Login básico
 *               value:
 *                 email: "usuario@ejemplo.com"
 *                 password: "MiContraseña123"
 *             login_con_2fa:
 *               summary: Login con 2FA
 *               value:
 *                 email: "usuario@ejemplo.com"
 *                 password: "MiContraseña123"
 *                 twoFactorCode: "123456"
 *                 rememberMe: false
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
 *                   example: "Login exitoso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "usuario@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Juan"
 *                         lastName:
 *                           type: string
 *                           example: "Pérez"
 *                         role:
 *                           type: string
 *                           example: "user"
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         expiresIn:
 *                           type: integer
 *                           example: 3600
 *                     requiresTwoFactor:
 *                       type: boolean
 *                       example: false
 *             examples:
 *               login_exitoso:
 *                 summary: Login exitoso
 *                 value:
 *                   success: true
 *                   message: "Login exitoso"
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "usuario@ejemplo.com"
 *                       firstName: "Juan"
 *                       lastName: "Pérez"
 *                       role: "user"
 *                     tokens:
 *                       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       expiresIn: 3600
 *                     requiresTwoFactor: false
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email inválido"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       401:
 *         description: Credenciales incorrectas o 2FA requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Credenciales incorrectas"
 *                 error:
 *                   type: string
 *                   example: "INVALID_CREDENTIALS"
 *                 requiresTwoFactor:
 *                   type: boolean
 *                   example: true
 *                 sessionId:
 *                   type: string
 *                   example: "sess_123456"
 *       429:
 *         description: Demasiados intentos de login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Demasiados intentos de login. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-01T12:00:00.000Z"
 */
router.post('/login', loginLimiter, loginValidation, authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario con validación completa de datos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *               - firstName
 *               - lastName
 *               - termsAccepted
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "nuevo@ejemplo.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'
 *                 description: Contraseña con mayúsculas, minúsculas y números
 *                 example: "MiContraseña123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmación de contraseña
 *                 example: "MiContraseña123"
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'
 *                 description: Nombre del usuario
 *                 example: "María"
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$'
 *                 description: Apellido del usuario
 *                 example: "González"
 *               phone:
 *                 type: string
 *                 pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                 description: Teléfono en formato guatemalteco (opcional)
 *                 example: "+502 1234-5678"
 *               nit:
 *                 type: string
 *                 pattern: '^\\d{8}(-[0-9K])?$'
 *                 description: NIT guatemalteco (opcional)
 *                 example: "12345678-9"
 *               cui:
 *                 type: string
 *                 minLength: 13
 *                 maxLength: 13
 *                 pattern: '^\\d{13}$'
 *                 description: CUI guatemalteco (opcional)
 *                 example: "1234567890123"
 *               termsAccepted:
 *                 type: boolean
 *                 description: Aceptación de términos y condiciones
 *                 example: true
 *               marketingAccepted:
 *                 type: boolean
 *                 description: Aceptación de comunicaciones de marketing (opcional)
 *                 example: false
 *           examples:
 *             registro_basico:
 *               summary: Registro básico
 *               value:
 *                 email: "nuevo@ejemplo.com"
 *                 password: "MiContraseña123"
 *                 confirmPassword: "MiContraseña123"
 *                 firstName: "María"
 *                 lastName: "González"
 *                 termsAccepted: true
 *             registro_completo:
 *               summary: Registro con datos completos
 *               value:
 *                 email: "nuevo@ejemplo.com"
 *                 password: "MiContraseña123"
 *                 confirmPassword: "MiContraseña123"
 *                 firstName: "María"
 *                 lastName: "González"
 *                 phone: "+502 1234-5678"
 *                 nit: "12345678-9"
 *                 cui: "1234567890123"
 *                 termsAccepted: true
 *                 marketingAccepted: false
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
 *                   example: "Usuario registrado exitosamente. Verifique su email."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 2
 *                         email:
 *                           type: string
 *                           example: "nuevo@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "María"
 *                         lastName:
 *                           type: string
 *                           example: "González"
 *                         emailVerified:
 *                           type: boolean
 *                           example: false
 *             examples:
 *               registro_exitoso:
 *                 summary: Registro exitoso
 *                 value:
 *                   success: true
 *                   message: "Usuario registrado exitosamente. Verifique su email."
 *                   data:
 *                     user:
 *                       id: 2
 *                       email: "nuevo@ejemplo.com"
 *                       firstName: "María"
 *                       lastName: "González"
 *                       emailVerified: false
 *       400:
 *         description: Datos de entrada inválidos o usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email ya está registrado"
 *                 error:
 *                   type: string
 *                   example: "USER_ALREADY_EXISTS"
 *       429:
 *         description: Demasiados intentos de registro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Demasiados intentos. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/register', authLimiter, registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Solicitar reseteo de contraseña
 *     description: Envía email con instrucciones para resetear contraseña
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
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@ejemplo.com"
 *           examples:
 *             solicitud_reset:
 *               summary: Solicitud de reset
 *               value:
 *                 email: "usuario@ejemplo.com"
 *     responses:
 *       200:
 *         description: Email de reset enviado exitosamente
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
 *                   example: "Se ha enviado un email con instrucciones para resetear su contraseña"
 *             examples:
 *               email_enviado:
 *                 summary: Email enviado
 *                 value:
 *                   success: true
 *                   message: "Se ha enviado un email con instrucciones para resetear su contraseña"
 *       400:
 *         description: Email inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email inválido"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *                 error:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
 *       429:
 *         description: Demasiados intentos de reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Demasiados intentos de reseteo de contraseña. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/forgot-password', authLimiter, passwordResetLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido')
], authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Resetear contraseña
 *     description: Establece nueva contraseña usando token de reset enviado por email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: Token de reset recibido por email
 *                 example: "abc123def456"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'
 *                 description: Nueva contraseña con mayúsculas, minúsculas y números
 *                 example: "NuevaContraseña123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmación de nueva contraseña
 *                 example: "NuevaContraseña123"
 *           examples:
 *             reset_password:
 *               summary: Reset de contraseña
 *               value:
 *                 resetToken: "abc123def456"
 *                 newPassword: "NuevaContraseña123"
 *                 confirmPassword: "NuevaContraseña123"
 *     responses:
 *       200:
 *         description: Contraseña reseteada exitosamente
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
 *                   example: "Contraseña reseteada exitosamente"
 *             examples:
 *               reset_exitoso:
 *                 summary: Reset exitoso
 *                 value:
 *                   success: true
 *                   message: "Contraseña reseteada exitosamente"
 *       400:
 *         description: Datos inválidos o token expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de reset inválido o expirado"
 *                 error:
 *                   type: string
 *                   example: "INVALID_RESET_TOKEN"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
 */
router.post('/reset-password', authLimiter, resetPasswordValidation, authController.resetPassword);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Verificar email
 *     description: Verifica dirección de email usando token enviado por email
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
 *                 description: Token de verificación recibido por email
 *                 example: "xyz789token"
 *           examples:
 *             verificar_email:
 *               summary: Verificación de email
 *               value:
 *                 token: "xyz789token"
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
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
 *                   example: "Email verificado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "usuario@ejemplo.com"
 *                         emailVerified:
 *                           type: boolean
 *                           example: true
 *             examples:
 *               verificacion_exitosa:
 *                 summary: Verificación exitosa
 *                 value:
 *                   success: true
 *                   message: "Email verificado exitosamente"
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "usuario@ejemplo.com"
 *                       emailVerified: true
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de verificación inválido o expirado"
 *                 error:
 *                   type: string
 *                   example: "INVALID_VERIFICATION_TOKEN"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *                 error:
 *                   type: string
 *                   example: "USER_NOT_FOUND"
 */
router.post('/verify-email', authLimiter, [
  body('token').notEmpty().withMessage('Token de verificación es requerido')
], authController.verifyEmail);

/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     tags: [Authentication]
 *     summary: Verificar código 2FA
 *     description: Verifica código 2FA durante proceso de login para completar autenticación
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
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: '^\d{6}$'
 *                 description: Código de 6 dígitos generado por app 2FA
 *                 example: "123456"
 *               sessionId:
 *                 type: string
 *                 description: ID de sesión temporal generado durante login
 *                 example: "sess_123456"
 *           examples:
 *             verificar_2fa:
 *               summary: Verificación 2FA
 *               value:
 *                 code: "123456"
 *                 sessionId: "sess_123456"
 *     responses:
 *       200:
 *         description: 2FA verificado exitosamente, login completado
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
 *                   example: "Autenticación completada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "usuario@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Juan"
 *                         lastName:
 *                           type: string
 *                           example: "Pérez"
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         expiresIn:
 *                           type: integer
 *                           example: 3600
 *             examples:
 *               verificacion_exitosa:
 *                 summary: Verificación exitosa
 *                 value:
 *                   success: true
 *                   message: "Autenticación completada exitosamente"
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "usuario@ejemplo.com"
 *                       firstName: "Juan"
 *                       lastName: "Pérez"
 *                     tokens:
 *                       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       expiresIn: 3600
 *       400:
 *         description: Código inválido o sesión expirada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Código 2FA inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_2FA_CODE"
 *       401:
 *         description: Sesión no encontrada o expirada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sesión de autenticación expirada"
 *                 error:
 *                   type: string
 *                   example: "SESSION_EXPIRED"
 */
router.post('/2fa/verify', authLimiter, verify2FAValidation, authController.verify2FA);

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Cerrar sesión
 *     description: Termina la sesión actual del usuario y revoca el token de acceso
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
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
 *                   example: "Sesión cerrada exitosamente"
 *             examples:
 *               logout_exitoso:
 *                 summary: Logout exitoso
 *                 value:
 *                   success: true
 *                   message: "Sesión cerrada exitosamente"
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_SERVER_ERROR"
 */
router.post('/logout', authenticated, authController.logout);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Refrescar token de acceso
 *     description: Genera nuevo par de tokens de acceso usando refresh token válido
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
 *                 description: Refresh token obtenido durante login
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           examples:
 *             refresh_token:
 *               summary: Refresh de token
 *               value:
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens refrescados exitosamente
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
 *                   example: "Tokens refrescados exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         expiresIn:
 *                           type: integer
 *                           example: 3600
 *             examples:
 *               refresh_exitoso:
 *                 summary: Refresh exitoso
 *                 value:
 *                   success: true
 *                   message: "Tokens refrescados exitosamente"
 *                   data:
 *                     tokens:
 *                       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       expiresIn: 3600
 *       400:
 *         description: Refresh token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Refresh token inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_REFRESH_TOKEN"
 *       401:
 *         description: Refresh token expirado o revocado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Refresh token expirado"
 *                 error:
 *                   type: string
 *                   example: "REFRESH_TOKEN_EXPIRED"
 *       429:
 *         description: Demasiados intentos de refresh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Demasiados intentos. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/refresh-token', authLimiter, [
  body('refreshToken').notEmpty().withMessage('Refresh token es requerido')
], authController.refreshToken);

/**
 * @swagger
 * /api/auth/password/change:
 *   post:
 *     tags: [Authentication]
 *     summary: Cambiar contraseña
 *     description: Cambia contraseña del usuario autenticado con verificación de contraseña actual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: "ContraseñaActual123"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'
 *                 description: Nueva contraseña con mayúsculas, minúsculas y números
 *                 example: "NuevaContraseña123"
 *               confirmNewPassword:
 *                 type: string
 *                 description: Confirmación de nueva contraseña
 *                 example: "NuevaContraseña123"
 *           examples:
 *             cambiar_password:
 *               summary: Cambio de contraseña
 *               value:
 *                 currentPassword: "ContraseñaActual123"
 *                 newPassword: "NuevaContraseña123"
 *                 confirmNewPassword: "NuevaContraseña123"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
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
 *                   example: "Contraseña cambiada exitosamente"
 *             examples:
 *               cambio_exitoso:
 *                 summary: Cambio exitoso
 *                 value:
 *                   success: true
 *                   message: "Contraseña cambiada exitosamente"
 *       400:
 *         description: Datos inválidos o contraseñas no coinciden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Las contraseñas no coinciden"
 *                 error:
 *                   type: string
 *                   example: "PASSWORDS_DO_NOT_MATCH"
 *       401:
 *         description: Contraseña actual incorrecta o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Contraseña actual incorrecta"
 *                 error:
 *                   type: string
 *                   example: "INVALID_CURRENT_PASSWORD"
 */
router.post('/password/change', authenticated, changePasswordValidation, authController.changePassword);

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     tags: [Authentication]
 *     summary: Habilitar 2FA
 *     description: Configura autenticación de dos factores con método especificado
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
 *                 description: Método de 2FA a habilitar
 *                 example: "totp"
 *               phoneNumber:
 *                 type: string
 *                 pattern: '^\\+502\\s?\\d{4}-?\\d{4}$'
 *                 description: Número de teléfono para SMS 2FA (requerido si method es sms)
 *                 example: "+502 1234-5678"
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: Dirección de email para email 2FA (requerido si method es email)
 *                 example: "usuario@ejemplo.com"
 *               verificationCode:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: '^\d{6}$'
 *                 description: Código de verificación de 6 dígitos
 *                 example: "123456"
 *           examples:
 *             habilitar_totp:
 *               summary: Habilitar TOTP
 *               value:
 *                 method: "totp"
 *                 verificationCode: "123456"
 *             habilitar_sms:
 *               summary: Habilitar SMS
 *               value:
 *                 method: "sms"
 *                 phoneNumber: "+502 1234-5678"
 *                 verificationCode: "123456"
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
 *                   example: "Autenticación de dos factores habilitada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                       example: "totp"
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Códigos de respaldo generados
 *                       example: ["ABC123", "DEF456", "GHI789"]
 *             examples:
 *               habilitacion_exitosa:
 *                 summary: Habilitación exitosa
 *                 value:
 *                   success: true
 *                   message: "Autenticación de dos factores habilitada exitosamente"
 *                   data:
 *                     method: "totp"
 *                     backupCodes: ["ABC123", "DEF456", "GHI789"]
 *       400:
 *         description: Datos inválidos o código de verificación incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Código de verificación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_VERIFICATION_CODE"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       409:
 *         description: 2FA ya habilitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "2FA ya está habilitado"
 *                 error:
 *                   type: string
 *                   example: "TWO_FA_ALREADY_ENABLED"
 */
router.post('/2fa/enable', authenticated, enable2FAValidation, authController.enable2FA);

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     tags: [Authentication]
 *     summary: Deshabilitar 2FA
 *     description: Desactiva autenticación de dos factores con verificación de contraseña
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
 *                 description: Contraseña actual del usuario para verificación
 *                 example: "MiContraseña123"
 *           examples:
 *             deshabilitar_2fa:
 *               summary: Deshabilitar 2FA
 *               value:
 *                 password: "MiContraseña123"
 *     responses:
 *       200:
 *         description: 2FA deshabilitado exitosamente
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
 *                   example: "Autenticación de dos factores deshabilitada exitosamente"
 *             examples:
 *               deshabilitacion_exitosa:
 *                 summary: Deshabilitación exitosa
 *                 value:
 *                   success: true
 *                   message: "Autenticación de dos factores deshabilitada exitosamente"
 *       400:
 *         description: Contraseña incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Contraseña incorrecta"
 *                 error:
 *                   type: string
 *                   example: "INVALID_PASSWORD"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       409:
 *         description: 2FA no está habilitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "2FA no está habilitado"
 *                 error:
 *                   type: string
 *                   example: "TWO_FA_NOT_ENABLED"
 */
router.post('/2fa/disable', authenticated, [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Código 2FA debe tener 6 dígitos')
], authController.disable2FA);

/**
 * @swagger
 * /api/auth/2fa/send-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Enviar código OTP para 2FA
 *     description: Envía un código OTP por el método configurado (email/SMS) para autenticación de dos factores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Código OTP enviado exitosamente
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
 *                   example: "Código OTP enviado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                       example: "email"
 *                     expiresIn:
 *                       type: integer
 *                       description: Tiempo de expiración en segundos
 *                       example: 300
 *             examples:
 *               otp_enviado:
 *                 summary: OTP enviado
 *                 value:
 *                   success: true
 *                   message: "Código OTP enviado exitosamente"
 *                   data:
 *                     method: "email"
 *                     expiresIn: 300
 *       400:
 *         description: 2FA no habilitado o método no soportado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "2FA no está habilitado para este usuario"
 *                 error:
 *                   type: string
 *                   example: "TWO_FA_NOT_ENABLED"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       429:
 *         description: Demasiados intentos de envío OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Demasiados intentos. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/2fa/send-otp', authenticated, authController.sendOTPCode);

// ====================================================================
// RUTAS DE PERFIL DE USUARIO
// ====================================================================

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener perfil del usuario autenticado
 *     description: Obtiene información completa del perfil del usuario incluyendo datos personales y configuración
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
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
 *                   example: "Perfil obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: "usuario@ejemplo.com"
 *                         firstName:
 *                           type: string
 *                           example: "Juan"
 *                         lastName:
 *                           type: string
 *                           example: "Pérez"
 *                         phone:
 *                           type: string
 *                           example: "+502 1234-5678"
 *                         nit:
 *                           type: string
 *                           example: "12345678-9"
 *                         cui:
 *                           type: string
 *                           example: "1234567890123"
 *                         emailVerified:
 *                           type: boolean
 *                           example: true
 *                         twoFactorEnabled:
 *                           type: boolean
 *                           example: true
 *                         twoFactorMethod:
 *                           type: string
 *                           example: "totp"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T12:00:00.000Z"
 *             examples:
 *               perfil_obtenido:
 *                 summary: Perfil obtenido
 *                 value:
 *                   success: true
 *                   message: "Perfil obtenido exitosamente"
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "usuario@ejemplo.com"
 *                       firstName: "Juan"
 *                       lastName: "Pérez"
 *                       phone: "+502 1234-5678"
 *                       nit: "12345678-9"
 *                       cui: "1234567890123"
 *                       emailVerified: true
 *                       twoFactorEnabled: true
 *                       twoFactorMethod: "totp"
 *                       avatar: "https://example.com/avatar.jpg"
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-10-01T12:00:00.000Z"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 */
router.get('/profile', authenticated, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile/avatar:
 *   post:
 *     tags: [Authentication]
 *     summary: Subir avatar del usuario
 *     description: "Sube una nueva imagen de avatar para el usuario (formatos: JPG, PNG, max 5MB)"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del avatar (JPG, PNG, max 5MB)
 *     responses:
 *       200:
 *         description: Avatar subido exitosamente
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
 *                   example: "Avatar subido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       example: "https://example.com/uploads/avatar_1_123456789.jpg"
 *             examples:
 *               avatar_subido:
 *                 summary: Avatar subido
 *                 value:
 *                   success: true
 *                   message: "Avatar subido exitosamente"
 *                   data:
 *                     avatarUrl: "https://example.com/uploads/avatar_1_123456789.jpg"
 *       400:
 *         description: Archivo inválido o demasiado grande
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Archivo debe ser una imagen JPG o PNG de máximo 5MB"
 *                 error:
 *                   type: string
 *                   example: "INVALID_FILE_FORMAT"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 */
router.post('/profile/avatar', authenticated, authController.uploadAvatar);

/**
 * @swagger
 * /api/auth/profile/avatar:
 *   delete:
 *     tags: [Authentication]
 *     summary: Eliminar avatar del usuario
 *     description: Elimina la imagen de avatar actual del usuario y restaura avatar por defecto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar eliminado exitosamente
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
 *                   example: "Avatar eliminado exitosamente"
 *             examples:
 *               avatar_eliminado:
 *                 summary: Avatar eliminado
 *                 value:
 *                   success: true
 *                   message: "Avatar eliminado exitosamente"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       404:
 *         description: Avatar no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No se encontró avatar para eliminar"
 *                 error:
 *                   type: string
 *                   example: "AVATAR_NOT_FOUND"
 */
router.delete('/profile/avatar', authenticated, authController.deleteAvatar);

// ====================================================================
// RUTAS DE GESTIÓN DE SESIONES
// ====================================================================

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     tags: [Authentication]
 *     summary: Listar sesiones activas
 *     description: Obtiene todas las sesiones activas del usuario autenticado con información detallada
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones obtenidas exitosamente
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
 *                   example: "Sesiones obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "sess_123456"
 *                           deviceInfo:
 *                             type: object
 *                             properties:
 *                               userAgent:
 *                                 type: string
 *                                 example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                               ipAddress:
 *                                 type: string
 *                                 example: "192.168.1.100"
 *                               location:
 *                                 type: string
 *                                 example: "Guatemala City, Guatemala"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T10:00:00.000Z"
 *                           lastActivity:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T12:00:00.000Z"
 *                           isCurrent:
 *                             type: boolean
 *                             example: true
 *                     totalSessions:
 *                       type: integer
 *                       example: 3
 *             examples:
 *               sesiones_obtenidas:
 *                 summary: Sesiones obtenidas
 *                 value:
 *                   success: true
 *                   message: "Sesiones obtenidas exitosamente"
 *                   data:
 *                     sessions:
 *                       - id: "sess_123456"
 *                         deviceInfo:
 *                           userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *                           ipAddress: "192.168.1.100"
 *                           location: "Guatemala City, Guatemala"
 *                         createdAt: "2023-10-01T10:00:00.000Z"
 *                         lastActivity: "2023-10-01T12:00:00.000Z"
 *                         isCurrent: true
 *                       - id: "sess_789012"
 *                         deviceInfo:
 *                           userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)"
 *                           ipAddress: "192.168.1.101"
 *                           location: "Guatemala City, Guatemala"
 *                         createdAt: "2023-09-28T08:00:00.000Z"
 *                         lastActivity: "2023-09-28T09:00:00.000Z"
 *                         isCurrent: false
 *                     totalSessions: 2
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 */
router.get('/sessions', authenticated, authController.getUserSessions);

/**
 * @swagger
 * /api/auth/sessions/terminate-others:
 *   post:
 *     tags: [Authentication]
 *     summary: Terminar otras sesiones
 *     description: Termina todas las sesiones activas del usuario excepto la sesión actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Otras sesiones terminadas exitosamente
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
 *                   example: "Otras sesiones terminadas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     terminatedSessions:
 *                       type: integer
 *                       example: 2
 *                     remainingSessions:
 *                       type: integer
 *                       example: 1
 *             examples:
 *               sesiones_terminadas:
 *                 summary: Sesiones terminadas
 *                 value:
 *                   success: true
 *                   message: "Otras sesiones terminadas exitosamente"
 *                   data:
 *                     terminatedSessions: 2
 *                     remainingSessions: 1
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 */
router.post('/sessions/terminate-others', authenticated, authController.terminateOtherSessions);

/**
 * @swagger
 * /api/auth/sessions/stats:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener estadísticas de sesiones
 *     description: Obtiene estadísticas detalladas de uso de sesiones del sistema (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                   example: "Estadísticas de sesiones obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                       example: 150
 *                     activeSessions:
 *                       type: integer
 *                       example: 45
 *                     sessionsByDevice:
 *                       type: object
 *                       properties:
 *                         desktop:
 *                           type: integer
 *                           example: 30
 *                         mobile:
 *                           type: integer
 *                           example: 12
 *                         tablet:
 *                           type: integer
 *                           example: 3
 *                     averageSessionDuration:
 *                       type: integer
 *                       description: Duración promedio en minutos
 *                       example: 45
 *                     topLocations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           location:
 *                             type: string
 *                             example: "Guatemala City, Guatemala"
 *                           count:
 *                             type: integer
 *                             example: 25
 *             examples:
 *               estadisticas_sesiones:
 *                 summary: Estadísticas obtenidas
 *                 value:
 *                   success: true
 *                   message: "Estadísticas de sesiones obtenidas exitosamente"
 *                   data:
 *                     totalSessions: 150
 *                     activeSessions: 45
 *                     sessionsByDevice:
 *                       desktop: 30
 *                       mobile: 12
 *                       tablet: 3
 *                     averageSessionDuration: 45
 *                     topLocations:
 *                       - location: "Guatemala City, Guatemala"
 *                         count: 25
 *                       - location: "Quetzaltenango, Guatemala"
 *                         count: 8
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 *       403:
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No tienes permisos para acceder a estas estadísticas"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 */
router.get('/sessions/stats', authenticated, authController.getSessionStats);

// ====================================================================
// RUTAS DE 2FA ADICIONALES
// ====================================================================

/**
 * @swagger
 * /api/auth/2fa/backup-codes:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener códigos de respaldo 2FA
 *     description: Obtiene los códigos de respaldo para autenticación de dos factores (solo si 2FA está habilitado)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Códigos de respaldo obtenidos
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
 *                   example: "Códigos de respaldo obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de códigos de respaldo (cada uno usable una vez)
 *                       example: ["ABC123-DEF456", "GHI789-JKL012", "MNO345-PQR678"]
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T10:00:00.000Z"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Los códigos no expiran pero se invalidan al usarlos
 *                       example: null
 *             examples:
 *               codigos_respaldo:
 *                 summary: Códigos obtenidos
 *                 value:
 *                   success: true
 *                   message: "Códigos de respaldo obtenidos exitosamente"
 *                   data:
 *                     backupCodes: ["ABC123-DEF456", "GHI789-JKL012", "MNO345-PQR678"]
 *                     generatedAt: "2023-10-01T10:00:00.000Z"
 *                     expiresAt: null
 *       400:
 *         description: 2FA no habilitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "2FA no está habilitado para este usuario"
 *                 error:
 *                   type: string
 *                   example: "TWO_FA_NOT_ENABLED"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autenticación inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_TOKEN"
 */
router.get('/2fa/backup-codes', authenticated, authController.getBackupCodes);


// ====================================================================
// RUTAS DE VALIDACIÓN GUATEMALA
// ====================================================================

/**
 * @swagger
 * /api/auth/validate/cui:
 *   post:
 *     tags: [Authentication]
 *     summary: Validar CUI guatemalteco
 *     description: Valida que un CUI tenga exactamente 13 dígitos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cui
 *             properties:
 *               cui:
 *                 type: string
 *                 description: CUI a validar
 *                 example: "1234567890123"
 *     responses:
 *       200:
 *         description: CUI válido
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
 *                   example: "CUI válido"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cui:
 *                       type: string
 *                       example: "1234567890123"
 *                     isValid:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: CUI inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "CUI debe tener exactamente 13 dígitos"
 *                 error:
 *                   type: string
 *                   example: "INVALID_CUI_FORMAT"
 */
router.post('/validate/cui', [
  body('cui')
    .notEmpty()
    .withMessage('CUI es requerido')
    .isLength({ min: 13, max: 13 })
    .withMessage('CUI debe tener exactamente 13 dígitos')
    .isNumeric()
    .withMessage('CUI debe contener solo números')
], authController.validateCui);

export default router;