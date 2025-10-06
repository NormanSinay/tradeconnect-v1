/**
 * @fileoverview Rutas de Certificados para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de certificados blockchain
 *
 * Archivo: backend/src/routes/certificates.ts
 */

import { Router } from 'express';
import { param } from 'express-validator';
import { CertificateController } from '../controllers/certificateController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA CERTIFICADOS
// ====================================================================

// Rate limiter para operaciones de certificados
const certificateLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de certificados. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para generación masiva
const bulkCertificateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 generaciones masivas por usuario cada 15 minutos
  message: {
    success: false,
    message: 'Demasiadas generaciones masivas. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para parámetros de ruta
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
];

const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número entero positivo')
];

const eventIdValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('ID de evento debe ser un número entero positivo')
];

const registrationIdValidation = [
  param('registrationId')
    .isInt({ min: 1 })
    .withMessage('ID de registro debe ser un número entero positivo')
];

const hashValidation = [
  param('hash')
    .isLength({ min: 64, max: 64 })
    .withMessage('Hash debe tener exactamente 64 caracteres')
    .matches(/^[a-f0-9]+$/)
    .withMessage('Hash debe contener solo caracteres hexadecimales')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

// ====================================================================
// GESTIÓN DE CERTIFICADOS
// ====================================================================

/**
 * @swagger
 * /api/certificates/events/{eventId}/users/{userId}/registrations/{registrationId}/generate:
 *   post:
 *     tags: [Certificates]
 *     summary: Generar certificado de asistencia
 *     description: Genera un certificado de asistencia para un participante específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 */
router.post('/events/:eventId/users/:userId/registrations/:registrationId/generate',
  authenticated,
  certificateLimiter,
  eventIdValidation,
  userIdValidation,
  registrationIdValidation,
  CertificateController.generateCertificate
);

/**
 * @swagger
 * /api/certificates/events/{eventId}/generate-bulk:
 *   post:
 *     tags: [Certificates]
 *     summary: Generar certificados masivos
 *     description: Genera certificados de asistencia para todos los participantes que asistieron al evento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 */
router.post('/events/:eventId/generate-bulk',
  authenticated,
  bulkCertificateLimiter,
  eventIdValidation,
  CertificateController.generateBulkCertificates
);

// ====================================================================
// CONSULTAS DE CERTIFICADOS
// ====================================================================

/**
 * @swagger
 * /api/certificates/users/{userId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Obtener certificados de usuario
 *     description: Obtiene todos los certificados de un usuario específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 */
router.get('/users/:userId',
  authenticated,
  certificateLimiter,
  userIdValidation,
  CertificateController.getUserCertificates
);

/**
 * @swagger
 * /api/certificates/events/{eventId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Obtener certificados de evento
 *     description: Obtiene todos los certificados generados para un evento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 */
router.get('/events/:eventId',
  authenticated,
  certificateLimiter,
  eventIdValidation,
  CertificateController.getEventCertificates
);

/**
 * @swagger
 * /api/certificates/registrations/{registrationId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Obtener certificado por registro
 *     description: Obtiene el certificado asociado a una inscripción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 */
router.get('/registrations/:registrationId',
  authenticated,
  certificateLimiter,
  registrationIdValidation,
  CertificateController.getCertificateByRegistration
);

// ====================================================================
// VERIFICACIÓN ADMINISTRATIVA
// ====================================================================

/**
 * @swagger
 * /api/certificates/verify/{hash}:
 *   get:
 *     tags: [Certificates]
 *     summary: Verificar certificado (admin)
 *     description: Verifica la validez de un certificado por su hash (endpoint administrativo)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Hash del certificado (64 caracteres hexadecimales)
 */
router.get('/verify/:hash',
  authenticated,
  certificateLimiter,
  hashValidation,
  CertificateController.verifyCertificateAdmin
);

// ====================================================================
// ESTADÍSTICAS
// ====================================================================

/**
 * @swagger
 * /api/certificates/stats:
 *   get:
 *     tags: [Certificates]
 *     summary: Obtener estadísticas de certificados
 *     description: Obtiene estadísticas generales del sistema de certificados
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats',
  authenticated,
  certificateLimiter,
  CertificateController.getCertificateStats
);

export default router;