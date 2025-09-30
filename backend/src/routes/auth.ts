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

/**
 * @swagger
 * /api/auth/2fa/send-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Enviar código OTP para 2FA
 *     description: Envía un código OTP por email para autenticación de dos factores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Código OTP enviado exitosamente
 *       400:
 *         description: 2FA no habilitado
 *       401:
 *         description: No autorizado
 */
router.post('/2fa/send-otp', authController.sendOTPCode);

// ====================================================================
// RUTAS DE PERFIL DE USUARIO
// ====================================================================

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener perfil del usuario autenticado
 *     description: Obtiene información completa del perfil del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/profile', authController.getProfile);

/**
 * @swagger
 * /api/auth/profile/avatar:
 *   post:
 *     tags: [Authentication]
 *     summary: Subir avatar del usuario
 *     description: Sube una nueva imagen de avatar para el usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del avatar
 *     responses:
 *       200:
 *         description: Avatar subido exitosamente
 *       400:
 *         description: Archivo inválido
 *       401:
 *         description: No autorizado
 */
router.post('/profile/avatar', authController.uploadAvatar);

/**
 * @swagger
 * /api/auth/profile/avatar:
 *   delete:
 *     tags: [Authentication]
 *     summary: Eliminar avatar del usuario
 *     description: Elimina la imagen de avatar actual del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar eliminado exitosamente
 *       401:
 *         description: No autorizado
 */
router.delete('/profile/avatar', authController.deleteAvatar);

// ====================================================================
// RUTAS DE GESTIÓN DE SESIONES
// ====================================================================

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     tags: [Authentication]
 *     summary: Listar sesiones activas
 *     description: Obtiene todas las sesiones activas del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/sessions', authController.getUserSessions);

/**
 * @swagger
 * /api/auth/sessions/terminate-others:
 *   post:
 *     tags: [Authentication]
 *     summary: Terminar otras sesiones
 *     description: Termina todas las sesiones activas excepto la actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Otras sesiones terminadas exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/sessions/terminate-others', authController.terminateOtherSessions);

/**
 * @swagger
 * /api/auth/sessions/stats:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener estadísticas de sesiones
 *     description: Obtiene estadísticas de uso de sesiones (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.get('/sessions/stats', authController.getSessionStats);

// ====================================================================
// RUTAS DE 2FA ADICIONALES
// ====================================================================

/**
 * @swagger
 * /api/auth/2fa/backup-codes:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener códigos de respaldo 2FA
 *     description: Obtiene los códigos de respaldo para autenticación de dos factores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Códigos de respaldo obtenidos
 *       401:
 *         description: No autorizado
 */
router.get('/2fa/backup-codes', authController.getBackupCodes);

// ====================================================================
// RUTAS DE ADMINISTRACIÓN DE USUARIOS
// ====================================================================

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     tags: [Authentication]
 *     summary: Listar usuarios (admin)
 *     description: Obtiene lista paginada de usuarios (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por rol
 *     responses:
 *       200:
 *         description: Usuarios obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.get('/users', authController.getUsers);

/**
 * @swagger
 * /api/auth/users:
 *   post:
 *     tags: [Authentication]
 *     summary: Crear usuario (admin)
 *     description: Crea un nuevo usuario en el sistema (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.post('/users', authController.createUser);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     tags: [Authentication]
 *     summary: Actualizar usuario (admin)
 *     description: Actualiza información de un usuario específico (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/users/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo')
], authController.updateUser);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     tags: [Authentication]
 *     summary: Eliminar usuario (admin)
 *     description: Elimina un usuario del sistema (soft delete, requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/users/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo')
], authController.deleteUser);

/**
 * @swagger
 * /api/auth/users/{id}/audit:
 *   get:
 *     tags: [Authentication]
 *     summary: Obtener auditoría de usuario (admin)
 *     description: Obtiene el historial de auditoría de un usuario específico (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Auditoría obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/users/:id/audit', [
  param('id').isInt({ min: 1 }).withMessage('ID de usuario debe ser un número entero positivo')
], authController.getUserAudit);

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