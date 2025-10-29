/**
 * @fileoverview Rutas de Validación Pública de Certificados para TradeConnect
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Definición de rutas públicas para verificación de certificados (sin autenticación)
 *
 * Archivo: backend/src/routes/certificate-validation.ts
 */

import { Router } from 'express';
import { param, body } from 'express-validator';
import { certificateValidationController } from '../controllers/certificateValidationController';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// ====================================================================
// RATE LIMITING PARA VALIDACIÓN PÚBLICA
// ====================================================================

// Rate limiter más estricto para validaciones públicas
const publicValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 verificaciones por IP cada 15 minutos
  message: {
    success: false,
    message: 'Demasiadas verificaciones. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para descargas públicas
const publicDownloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 descargas por IP cada hora
  message: {
    success: false,
    message: 'Demasiadas descargas. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

const certificateNumberValidation = [
  param('certificateNumber')
    .matches(/^CERT-\d{4}-\d{6}-\w+$/)
    .withMessage('Formato de número de certificado inválido')
];

const hashValidation = [
  param('hash')
    .isLength({ min: 64, max: 64 })
    .withMessage('Hash debe tener exactamente 64 caracteres')
    .matches(/^[a-f0-9]+$/i)
    .withMessage('Hash debe contener solo caracteres hexadecimales')
];

const publicValidationBody = [
  body('captchaToken')
    .optional()
    .isString()
    .withMessage('Token de captcha inválido'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Ubicación debe ser un objeto'),
  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Información de dispositivo debe ser un objeto')
];

// ====================================================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ====================================================================

// ====================================================================
// VERIFICACIÓN DE CERTIFICADOS
// ====================================================================

/**
 * @swagger
 * /api/public/certificates/verify:
 *   post:
 *     tags: [Public Certificate Validation]
 *     summary: Verificar certificado
 *     description: Verifica la autenticidad de un certificado por número, hash o QR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               certificateNumber:
 *                 type: string
 *                 description: Número del certificado (ej. CERT-2025-001234-ABC123)
 *               hash:
 *                 type: string
 *                 description: Hash SHA-256 del certificado
 *               qrData:
 *                 type: string
 *                 description: Datos del código QR
 *               method:
 *                 type: string
 *                 enum: [number_lookup, hash_lookup, qr_scan]
 *                 description: Método de verificación
 *               captchaToken:
 *                 type: string
 *                 description: Token de verificación captcha
 *               location:
 *                 type: object
 *                 description: Información de ubicación
 *               deviceInfo:
 *                 type: object
 *                 description: Información del dispositivo
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     certificate:
 *                       type: object
 *                       description: Datos del certificado si es válido
 *                     verificationDetails:
 *                       type: object
 *                       description: Detalles de la verificación
 */
router.post('/verify',
  publicValidationLimiter,
  publicValidationBody,
  certificateValidationController.verifyCertificate
);

/**
 * @swagger
 * /api/public/certificates/verify/{certificateNumber}:
 *   post:
 *     tags: [Public Certificate Validation]
 *     summary: Verificar por número de certificado
 *     description: Verifica un certificado usando su número único
 *     parameters:
 *       - in: path
 *         name: certificateNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número del certificado
 */
router.post('/verify/:certificateNumber',
  publicValidationLimiter,
  certificateNumberValidation,
  publicValidationBody,
  certificateValidationController.verifyByNumber
);

/**
 * @swagger
 * /api/public/certificates/verify-hash/{hash}:
 *   post:
 *     tags: [Public Certificate Validation]
 *     summary: Verificar por hash
 *     description: Verifica un certificado usando su hash SHA-256
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Hash SHA-256 del certificado
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               captchaToken:
 *                 type: string
 *                 description: Token de verificación captcha
 *               location:
 *                 type: object
 *                 description: Información de ubicación
 *               deviceInfo:
 *                 type: object
 *                 description: Información del dispositivo
 */
router.post('/verify-hash/:hash',
  publicValidationLimiter,
  hashValidation,
  publicValidationBody,
  certificateValidationController.verifyByHash
);

/**
 * @swagger
 * /api/public/certificates/verify-qr:
 *   post:
 *     tags: [Public Certificate Validation]
 *     summary: Verificar por QR
 *     description: Verifica un certificado escaneando su código QR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrData
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: Datos extraídos del código QR
 *               captchaToken:
 *                 type: string
 *                 description: Token de verificación captcha
 *               location:
 *                 type: object
 *                 description: Información de ubicación
 *               deviceInfo:
 *                 type: object
 *                 description: Información del dispositivo
 */
router.post('/verify-qr',
  publicValidationLimiter,
  [
    body('qrData')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Datos QR son requeridos'),
    ...publicValidationBody
  ],
  certificateValidationController.verifyByQR
);

// ====================================================================
// DESCARGA PÚBLICA DE CERTIFICADOS
// ====================================================================

/**
 * @swagger
 * /api/public/certificates/download/{certificateNumber}:
 *   get:
 *     tags: [Public Certificate Download]
 *     summary: Descargar certificado PDF
 *     description: Descarga el PDF de un certificado (si está disponible para descarga pública)
 *     parameters:
 *       - in: path
 *         name: certificateNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número del certificado
 *     responses:
 *       200:
 *         description: PDF del certificado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Certificado no encontrado o no disponible
 */
router.get('/download/:certificateNumber',
  publicDownloadLimiter,
  certificateNumberValidation,
  certificateValidationController.downloadCertificate
);

// ====================================================================
// INFORMACIÓN PÚBLICA
// ====================================================================

/**
 * @swagger
 * /api/public/certificates/info:
 *   get:
 *     tags: [Public Certificate Info]
 *     summary: Información del sistema
 *     description: Obtiene información pública sobre el sistema de certificados
 *     responses:
 *       200:
 *         description: Información del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 systemName:
 *                   type: string
 *                 version:
 *                   type: string
 *                 blockchainNetwork:
 *                   type: string
 *                 supportedVerificationMethods:
 *                   type: array
 *                   items:
 *                     type: string
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 */
router.get('/info',
  certificateValidationController.getPublicInfo
);

/**
 * @swagger
 * /api/public/certificates/health:
 *   get:
 *     tags: [Public Certificate Health]
 *     summary: Health check
 *     description: Verifica el estado de salud del sistema de certificados
 *     responses:
 *       200:
 *         description: Estado del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [ok, error]
 *                     redis:
 *                       type: string
 *                       enum: [ok, error]
 *                     blockchain:
 *                       type: string
 *                       enum: [ok, error]
 *                     pdf_generation:
 *                       type: string
 *                       enum: [ok, error]
 */
router.get('/health',
  certificateValidationController.healthCheck
);

export default router;
