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
 *     description: Genera un código QR único para una inscripción aprobada
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
 *     description: Obtiene información del código QR asociado a una inscripción
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
 *     description: Invalida el QR actual y genera uno nuevo para la inscripción
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
 *     description: Valida un código QR escaneado y registra asistencia si es válido
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