/**
 * @fileoverview Rutas de Códigos QR para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de códigos QR y control de acceso
 *
 * Archivo: backend/src/routes/qr.ts
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { qrController } from '../controllers/qrController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA QR
// ====================================================================

// Rate limiter para generación de QR
const qrGenerationLimiter = rateLimit({
  windowMs: RATE_LIMITS.QR_GENERATION?.windowMs || 15 * 60 * 1000, // 15 minutos
  max: RATE_LIMITS.QR_GENERATION?.max || 10, // 10 QRs por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes de generación de QR. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para validación de QR (más permisivo para escaneos)
const qrValidationLimiter = rateLimit({
  windowMs: RATE_LIMITS.QR_VALIDATION?.windowMs || 60 * 1000, // 1 minuto
  max: RATE_LIMITS.QR_VALIDATION?.max || 30, // 30 validaciones por minuto
  message: {
    success: false,
    message: 'Demasiadas validaciones de QR. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para consultas públicas
const publicQRLimiter = rateLimit({
  windowMs: RATE_LIMITS.PUBLIC_QR?.windowMs || 60 * 1000, // 1 minuto
  max: RATE_LIMITS.PUBLIC_QR?.max || 20, // 20 consultas públicas por minuto
  message: {
    success: false,
    message: 'Demasiadas consultas públicas. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para generación de QR
const generateQRValidation = [
  param('registrationId')
    .isInt({ min: 1 })
    .withMessage('ID de inscripción debe ser un número entero positivo'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración debe tener formato ISO 8601'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadatos deben ser un objeto válido')
];

// Validación para obtener QR
const getQRValidation = [
  param('registrationId')
    .isInt({ min: 1 })
    .withMessage('ID de inscripción debe ser un número entero positivo')
];

// Validación para validar QR
const validateQRValidation = [
  body('qrHash')
    .notEmpty()
    .withMessage('Hash del QR es requerido')
    .isLength({ min: 64, max: 64 })
    .withMessage('Hash del QR debe tener exactamente 64 caracteres')
    .matches(/^[a-f0-9]+$/i)
    .withMessage('Hash del QR debe contener solo caracteres hexadecimales'),
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('ID del evento debe ser un número entero positivo'),
  body('accessPoint')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Punto de acceso debe tener entre 1 y 100 caracteres'),
  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Información del dispositivo debe ser un objeto válido'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Ubicación debe ser un objeto válido')
];

// Validación para regenerar QR
const regenerateQRValidation = [
  param('registrationId')
    .isInt({ min: 1 })
    .withMessage('ID de inscripción debe ser un número entero positivo'),
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Razón debe tener entre 1 y 500 caracteres'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Fecha de expiración debe tener formato ISO 8601')
];

// Validación para verificar QR en blockchain
const blockchainVerifyValidation = [
  param('code')
    .notEmpty()
    .withMessage('Código QR es requerido')
    .isLength({ min: 64, max: 64 })
    .withMessage('Código QR debe tener exactamente 64 caracteres')
    .matches(/^[a-f0-9]+$/i)
    .withMessage('Código QR debe contener solo caracteres hexadecimales')
];

// Validación para invalidar QR
const invalidateQRValidation = [
  param('qrId')
    .isInt({ min: 1 })
    .withMessage('ID del QR debe ser un número entero positivo'),
  body('reason')
    .notEmpty()
    .withMessage('Razón de invalidación es requerida')
    .isLength({ min: 1, max: 500 })
    .withMessage('Razón debe tener entre 1 y 500 caracteres')
];

// Validación para estadísticas
const qrStatsValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('ID del evento debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

/**
 * @swagger
 * /api/qr/generate/{registrationId}:
 *   post:
 *     tags: [QR Codes]
 *     summary: Generar código QR
 *     description: Genera un código QR único y seguro para control de acceso a eventos
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la inscripción
 *         example: 123
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración opcional del QR
 *                 example: "2023-12-01T23:59:59.000Z"
 *               metadata:
 *                 type: object
 *                 description: Metadatos adicionales para incluir en el QR
 *                 properties:
 *                   accessLevel:
 *                     type: string
 *                     enum: [standard, vip, staff]
 *                     example: "standard"
 *                   specialRequirements:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["vegetarian", "wheelchair_access"]
 *           examples:
 *             generar_qr_basico:
 *               summary: Generar QR básico
 *               value: {}
 *             generar_qr_con_expiracion:
 *               summary: Generar QR con expiración
 *               value:
 *                 expiresAt: "2023-12-01T23:59:59.000Z"
 *                 metadata:
 *                   accessLevel: "vip"
 *                   specialRequirements: ["vegetarian"]
 *     responses:
 *       201:
 *         description: Código QR generado exitosamente
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
 *                   example: "Código QR generado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     qr:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         registrationId:
 *                           type: integer
 *                           example: 123
 *                         qrHash:
 *                           type: string
 *                           description: Hash único de 64 caracteres hexadecimales
 *                           example: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                         qrCode:
 *                           type: string
 *                           description: Código QR en formato base64
 *                           example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                         status:
 *                           type: string
 *                           enum: [active, used, expired, invalidated]
 *                           example: "active"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T23:59:59.000Z"
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T10:00:00.000Z"
 *                         metadata:
 *                           type: object
 *                           example: { "accessLevel": "vip" }
 *                         blockchainHash:
 *                           type: string
 *                           description: Hash registrado en blockchain para verificación
 *                           example: "0x1234567890abcdef..."
 *             examples:
 *               qr_generado:
 *                 summary: QR generado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Código QR generado exitosamente"
 *                   data:
 *                     qr:
 *                       id: 456
 *                       registrationId: 123
 *                       qrHash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                       qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                       status: "active"
 *                       expiresAt: "2023-12-01T23:59:59.000Z"
 *                       generatedAt: "2023-10-01T10:00:00.000Z"
 *                       metadata: { "accessLevel": "vip" }
 *                       blockchainHash: "0x1234567890abcdef..."
 *       400:
 *         description: Datos inválidos o QR ya existe
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
 *                   example: "Ya existe un QR activo para esta inscripción"
 *                 error:
 *                   type: string
 *                   example: "QR_ALREADY_EXISTS"
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
 *         description: Permisos insuficientes o inscripción no aprobada
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
 *                   example: "La inscripción no está aprobada para generar QR"
 *                 error:
 *                   type: string
 *                   example: "REGISTRATION_NOT_APPROVED"
 *       404:
 *         description: Inscripción no encontrada
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
 *                   example: "Inscripción no encontrada"
 *                 error:
 *                   type: string
 *                   example: "REGISTRATION_NOT_FOUND"
 *       429:
 *         description: Demasiadas solicitudes de generación
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
 *                   example: "Demasiadas solicitudes de generación de QR. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/generate/:registrationId',
  authenticated,
  qrGenerationLimiter,
  generateQRValidation,
  qrController.generateQR
);

/**
 * @swagger
 * /api/qr/{registrationId}:
 *   get:
 *     tags: [QR Codes]
 *     summary: Obtener código QR
 *     description: Obtiene información detallada del código QR activo asociado a una inscripción
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la inscripción
 *         example: 123
 *     responses:
 *       200:
 *         description: Código QR obtenido exitosamente
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
 *                   example: "Código QR obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     qr:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         registrationId:
 *                           type: integer
 *                           example: 123
 *                         qrHash:
 *                           type: string
 *                           description: Hash único del QR
 *                           example: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                         qrCode:
 *                           type: string
 *                           description: Imagen del QR en base64
 *                           example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                         status:
 *                           type: string
 *                           enum: [active, used, expired, invalidated]
 *                           example: "active"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-01T23:59:59.000Z"
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T10:00:00.000Z"
 *                         lastUsedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T14:30:00.000Z"
 *                         usageCount:
 *                           type: integer
 *                           description: Número de veces que se ha usado el QR
 *                           example: 1
 *                         metadata:
 *                           type: object
 *                           example: { "accessLevel": "vip" }
 *                         blockchainVerified:
 *                           type: boolean
 *                           description: Si el QR está verificado en blockchain
 *                           example: true
 *             examples:
 *               qr_obtenido:
 *                 summary: QR obtenido exitosamente
 *                 value:
 *                   success: true
 *                   message: "Código QR obtenido exitosamente"
 *                   data:
 *                     qr:
 *                       id: 456
 *                       registrationId: 123
 *                       qrHash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                       qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                       status: "active"
 *                       expiresAt: "2023-12-01T23:59:59.000Z"
 *                       generatedAt: "2023-10-01T10:00:00.000Z"
 *                       lastUsedAt: "2023-10-15T14:30:00.000Z"
 *                       usageCount: 1
 *                       metadata: { "accessLevel": "vip" }
 *                       blockchainVerified: true
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
 *                   example: "No tienes permisos para acceder a este QR"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: QR no encontrado
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
 *                   example: "No se encontró un QR activo para esta inscripción"
 *                 error:
 *                   type: string
 *                   example: "QR_NOT_FOUND"
 */
router.get('/:registrationId',
  authenticated,
  getQRValidation,
  qrController.getQR
);

/**
 * @swagger
 * /api/qr/regenerate/{registrationId}:
 *   post:
 *     tags: [QR Codes]
 *     summary: Regenerar código QR
 *     description: Invalida el QR actual por seguridad y genera uno nuevo con hash diferente
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la inscripción
 *         example: 123
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Razón de la regeneración (seguridad, pérdida, etc.)
 *                 example: "QR comprometido - posible fuga de información"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha de expiración opcional
 *                 example: "2023-12-15T23:59:59.000Z"
 *           examples:
 *             regenerar_qr:
 *               summary: Regenerar QR por seguridad
 *               value:
 *                 reason: "QR comprometido - posible fuga de información"
 *                 expiresAt: "2023-12-15T23:59:59.000Z"
 *     responses:
 *       200:
 *         description: Código QR regenerado exitosamente
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
 *                   example: "Código QR regenerado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     oldQr:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 456
 *                         qrHash:
 *                           type: string
 *                           example: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                         invalidatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-20T09:00:00.000Z"
 *                         invalidationReason:
 *                           type: string
 *                           example: "Regenerado por seguridad"
 *                     newQr:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 457
 *                         qrHash:
 *                           type: string
 *                           example: "b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1"
 *                         qrCode:
 *                           type: string
 *                           example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-12-15T23:59:59.000Z"
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-20T09:00:00.000Z"
 *             examples:
 *               qr_regenerado:
 *                 summary: QR regenerado exitosamente
 *                 value:
 *                   success: true
 *                   message: "Código QR regenerado exitosamente"
 *                   data:
 *                     oldQr:
 *                       id: 456
 *                       qrHash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                       invalidatedAt: "2023-10-20T09:00:00.000Z"
 *                       invalidationReason: "Regenerado por seguridad"
 *                     newQr:
 *                       id: 457
 *                       qrHash: "b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1"
 *                       qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *                       status: "active"
 *                       expiresAt: "2023-12-15T23:59:59.000Z"
 *                       generatedAt: "2023-10-20T09:00:00.000Z"
 *       400:
 *         description: Datos inválidos
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
 *                   example: "Fecha de expiración debe ser futura"
 *                 error:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
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
 *                   example: "No tienes permisos para regenerar este QR"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: QR activo no encontrado
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
 *                   example: "No se encontró un QR activo para regenerar"
 *                 error:
 *                   type: string
 *                   example: "ACTIVE_QR_NOT_FOUND"
 *       429:
 *         description: Demasiadas regeneraciones
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
 *                   example: "Demasiadas solicitudes de regeneración de QR. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/regenerate/:registrationId',
  authenticated,
  qrGenerationLimiter,
  regenerateQRValidation,
  qrController.regenerateQR
);

/**
 * @swagger
 * /api/qr/invalidate/{qrId}:
 *   post:
 *     tags: [QR Codes]
 *     summary: Invalidar código QR
 *     description: Invalida un código QR por razones de seguridad
 */
router.post('/invalidate/:qrId',
  authenticated,
  invalidateQRValidation,
  qrController.invalidateQR
);

/**
 * @swagger
 * /api/qr/stats/{eventId}:
 *   get:
 *     tags: [QR Codes]
 *     summary: Estadísticas de QR
 *     description: Obtiene estadísticas de uso de códigos QR para un evento
 */
router.get('/stats/:eventId',
  authenticated,
  qrStatsValidation,
  qrController.getQRStats
);

// ====================================================================
// RUTAS PÚBLICAS (VALIDACIÓN DE QR)
// ====================================================================

/**
 * @swagger
 * /api/qr/validate:
 *   post:
 *     tags: [QR Codes]
 *     summary: Validar código QR
 *     description: Valida un código QR escaneado, registra asistencia y actualiza estado del QR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrHash
 *               - eventId
 *             properties:
 *               qrHash:
 *                 type: string
 *                 minLength: 64
 *                 maxLength: 64
 *                 pattern: '^[a-f0-9]+$'
 *                 description: Hash único del QR de 64 caracteres hexadecimales
 *                 example: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *               eventId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID del evento donde se está validando el QR
 *                 example: 123
 *               accessPoint:
 *                 type: string
 *                 maxLength: 100
 *                 description: Punto de acceso donde se escaneó el QR (puerta, entrada, etc.)
 *                 example: "Entrada Principal"
 *               deviceInfo:
 *                 type: object
 *                 description: Información del dispositivo que escanea
 *                 properties:
 *                   deviceId:
 *                     type: string
 *                     example: "device_123"
 *                   deviceType:
 *                     type: string
 *                     enum: [mobile, tablet, desktop, kiosk]
 *                     example: "mobile"
 *                   appVersion:
 *                     type: string
 *                     example: "1.2.3"
 *                   os:
 *                     type: string
 *                     example: "iOS 15.0"
 *               location:
 *                 type: object
 *                 description: Ubicación geográfica donde se escaneó
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                     example: 14.6349
 *                   longitude:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *                     example: -90.5069
 *                   accuracy:
 *                     type: number
 *                     example: 10.5
 *           examples:
 *             validar_qr_basico:
 *               summary: Validar QR básico
 *               value:
 *                 qrHash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                 eventId: 123
 *                 accessPoint: "Entrada Principal"
 *             validar_qr_completo:
 *               summary: Validar QR con información completa
 *               value:
 *                 qrHash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
 *                 eventId: 123
 *                 accessPoint: "Entrada Principal"
 *                 deviceInfo:
 *                   deviceId: "device_123"
 *                   deviceType: "mobile"
 *                   appVersion: "1.2.3"
 *                   os: "iOS 15.0"
 *                 location:
 *                   latitude: 14.6349
 *                   longitude: -90.5069
 *                   accuracy: 10.5
 *     responses:
 *       200:
 *         description: Código QR válido, asistencia registrada
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
 *                   example: "Código QR válido. Acceso concedido."
 *                 data:
 *                   type: object
 *                   properties:
 *                     validation:
 *                       type: object
 *                       properties:
 *                         isValid:
 *                           type: boolean
 *                           example: true
 *                         qrId:
 *                           type: integer
 *                           example: 456
 *                         registrationId:
 *                           type: integer
 *                           example: 123
 *                         userId:
 *                           type: integer
 *                           example: 789
 *                         userName:
 *                           type: string
 *                           example: "Juan Pérez"
 *                         accessGranted:
 *                           type: boolean
 *                           example: true
 *                     attendance:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 101
 *                         checkInTime:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-15T14:30:00.000Z"
 *                         accessPoint:
 *                           type: string
 *                           example: "Entrada Principal"
 *                         deviceInfo:
 *                           type: object
 *                           example: { "deviceType": "mobile" }
 *                         location:
 *                           type: object
 *                           example: { "latitude": 14.6349, "longitude": -90.5069 }
 *             examples:
 *               qr_valido:
 *                 summary: QR válido y asistencia registrada
 *                 value:
 *                   success: true
 *                   message: "Código QR válido. Acceso concedido."
 *                   data:
 *                     validation:
 *                       isValid: true
 *                       qrId: 456
 *                       registrationId: 123
 *                       userId: 789
 *                       userName: "Juan Pérez"
 *                       accessGranted: true
 *                     attendance:
 *                       id: 101
 *                       checkInTime: "2023-10-15T14:30:00.000Z"
 *                       accessPoint: "Entrada Principal"
 *                       deviceInfo: { "deviceType": "mobile" }
 *                       location: { "latitude": 14.6349, "longitude": -90.5069 }
 *       400:
 *         description: Datos inválidos o QR malformado
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
 *                   example: "Hash del QR inválido"
 *                 error:
 *                   type: string
 *                   example: "INVALID_QR_HASH"
 *       403:
 *         description: QR inválido, expirado o ya usado
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
 *                   example: "Código QR expirado"
 *                 error:
 *                   type: string
 *                   example: "QR_EXPIRED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrStatus:
 *                       type: string
 *                       enum: [expired, used, invalidated, not_found]
 *                       example: "expired"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-01T23:59:59.000Z"
 *             examples:
 *               qr_expirado:
 *                 summary: QR expirado
 *                 value:
 *                   success: false
 *                   message: "Código QR expirado"
 *                   error: "QR_EXPIRED"
 *                   data:
 *                     qrStatus: "expired"
 *                     expiresAt: "2023-10-01T23:59:59.000Z"
 *       404:
 *         description: QR no encontrado
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
 *                   example: "Código QR no encontrado"
 *                 error:
 *                   type: string
 *                   example: "QR_NOT_FOUND"
 *       409:
 *         description: QR ya usado o asistencia ya registrada
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
 *                   example: "Código QR ya utilizado"
 *                 error:
 *                   type: string
 *                   example: "QR_ALREADY_USED"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lastUsedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-10-15T10:00:00.000Z"
 *                     usageCount:
 *                       type: integer
 *                       example: 1
 *       429:
 *         description: Demasiadas validaciones
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
 *                   example: "Demasiadas validaciones de QR. Intente más tarde."
 *                 error:
 *                   type: string
 *                   example: "RATE_LIMIT_EXCEEDED"
 */
router.post('/validate',
  qrValidationLimiter,
  validateQRValidation,
  qrController.validateQR
);

/**
 * @swagger
 * /api/qr/blockchain-verify/{code}:
 *   get:
 *     tags: [QR Codes]
 *     summary: Verificar QR en blockchain
 *     description: Verifica la autenticidad de un código QR consultando blockchain
 */
router.get('/blockchain-verify/:code',
  publicQRLimiter,
  blockchainVerifyValidation,
  qrController.verifyQRBlockchain
);

// ====================================================================
// RUTAS PARA FUNCIONALIDAD OFFLINE (FUTURAS)
// ====================================================================

/**
 * @swagger
 * /api/qr/offline/download-list/{eventId}:
 *   post:
 *     tags: [QR Codes - Offline]
 *     summary: Descargar lista offline
 *     description: Descarga una lista encriptada de QRs válidos para modo offline
 */
router.post('/offline/download-list/:eventId',
  authenticated,
  [
    param('eventId')
      .isInt({ min: 1 })
      .withMessage('ID del evento debe ser un número entero positivo'),
    body('deviceId')
      .notEmpty()
      .withMessage('ID del dispositivo es requerido'),
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Información del dispositivo debe ser un objeto válido')
  ],
  // TODO: Implementar controlador para offline
  (req: any, res: any) => {
    res.status(501).json({
      success: false,
      message: 'Funcionalidad offline no implementada aún',
      error: 'NOT_IMPLEMENTED',
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * @swagger
 * /api/qr/offline/validate:
 *   post:
 *     tags: [QR Codes - Offline]
 *     summary: Validar QR offline
 *     description: Valida un QR en modo offline (sin conexión a internet)
 */
router.post('/offline/validate',
  [
    body('qrHash')
      .notEmpty()
      .withMessage('Hash del QR es requerido'),
    body('batchId')
      .notEmpty()
      .withMessage('ID del lote offline es requerido'),
    body('timestamp')
      .isISO8601()
      .withMessage('Timestamp debe tener formato ISO 8601'),
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Información del dispositivo debe ser un objeto válido')
  ],
  // TODO: Implementar controlador para offline
  (req: any, res: any) => {
    res.status(501).json({
      success: false,
      message: 'Funcionalidad offline no implementada aún',
      error: 'NOT_IMPLEMENTED',
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * @swagger
 * /api/qr/offline/sync-attendance:
 *   post:
 *     tags: [QR Codes - Offline]
 *     summary: Sincronizar asistencia offline
 *     description: Sincroniza registros de asistencia realizados en modo offline
 */
router.post('/offline/sync-attendance',
  authenticated,
  [
    body('deviceId')
      .notEmpty()
      .withMessage('ID del dispositivo es requerido'),
    body('batchId')
      .notEmpty()
      .withMessage('ID del lote es requerido'),
    body('attendanceRecords')
      .isArray()
      .withMessage('Registros de asistencia deben ser un arreglo'),
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Información del dispositivo debe ser un objeto válido')
  ],
  // TODO: Implementar controlador para offline
  (req: any, res: any) => {
    res.status(501).json({
      success: false,
      message: 'Funcionalidad offline no implementada aún',
      error: 'NOT_IMPLEMENTED',
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * @swagger
 * /api/qr/offline/sync-status:
 *   get:
 *     tags: [QR Codes - Offline]
 *     summary: Estado de sincronización
 *     description: Consulta el estado de sincronización offline para un dispositivo
 */
router.get('/offline/sync-status',
  authenticated,
  [
    // TODO: Agregar query parameters para filtrar por deviceId, batchId, etc.
  ],
  // TODO: Implementar controlador para offline
  (req: any, res: any) => {
    res.status(501).json({
      success: false,
      message: 'Funcionalidad offline no implementada aún',
      error: 'NOT_IMPLEMENTED',
      timestamp: new Date().toISOString()
    });
  }
);

export default router;