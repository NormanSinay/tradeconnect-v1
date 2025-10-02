/**
 * @fileoverview Rutas de Contratos de Speakers para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de contratos y pagos de speakers
 *
 * Archivo: backend/src/routes/speaker-contracts.ts
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { speakerContractController } from '../controllers/speakerContractController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA CONTRATOS
// ====================================================================

// Rate limiter general para operaciones de contratos
const contractLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para operaciones de creación/edición
const createEditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 operaciones por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de creación/edición. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para crear contrato
const createContractValidation = [
  body('speakerId')
    .isInt({ min: 1 })
    .withMessage('El ID del speaker debe ser un número entero positivo'),
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  body('agreedAmount')
    .isFloat({ min: 0 })
    .withMessage('El monto acordado debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('paymentTerms')
    .isIn(['full_payment', 'advance_payment', 'installments'])
    .withMessage('Los términos de pago son inválidos'),
  body('advancePercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El porcentaje de anticipo debe estar entre 0 y 100'),
  body('termsConditions')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Los términos y condiciones no pueden exceder 5000 caracteres'),
  body('customClauses')
    .optional()
    .isArray()
    .withMessage('Las cláusulas personalizadas deben ser un arreglo'),
  body('customClauses.*')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Cada cláusula no puede exceder 1000 caracteres')
];

// Validación para actualizar contrato
const updateContractValidation = [
  body('agreedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto acordado debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('paymentTerms')
    .optional()
    .isIn(['full_payment', 'advance_payment', 'installments'])
    .withMessage('Los términos de pago son inválidos'),
  body('advancePercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('El porcentaje de anticipo debe estar entre 0 y 100'),
  body('termsConditions')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Los términos y condiciones no pueden exceder 5000 caracteres'),
  body('customClauses')
    .optional()
    .isArray()
    .withMessage('Las cláusulas personalizadas deben ser un arreglo'),
  body('customClauses.*')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Cada cláusula no puede exceder 1000 caracteres')
];

// Validación para crear pago
const createPaymentValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('El monto debe ser un número positivo'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('La moneda debe ser GTQ o USD'),
  body('paymentType')
    .isIn(['advance', 'final', 'installment'])
    .withMessage('El tipo de pago es inválido'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('La fecha programada debe ser una fecha válida'),
  body('paymentMethod')
    .isIn(['bank_transfer', 'check', 'cash', 'paypal', 'other'])
    .withMessage('El método de pago es inválido'),
  body('referenceNumber')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El número de referencia no puede exceder 100 caracteres'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

// Validación para parámetros de ruta
const contractIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del contrato debe ser un número entero positivo')
];

// Validación para parámetros de consulta
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('status')
    .optional()
    .isArray()
    .withMessage('Los estados deben ser un arreglo'),
  query('status.*')
    .optional()
    .isIn(['draft', 'sent', 'signed', 'rejected', 'cancelled'])
    .withMessage('Estado inválido'),
  query('speakerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del speaker debe ser un número entero positivo'),
  query('eventId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del evento debe ser un número entero positivo'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres')
];

// ====================================================================
// RUTAS PROTEGIDAS
// ====================================================================

/**
 * @swagger
 * /api/speaker-contracts:
 *   get:
 *     tags: [Speaker Contracts]
 *     summary: Listar contratos
 *     description: Obtiene una lista de contratos con filtros
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticated, contractLimiter, queryValidation, speakerContractController.getContracts);

/**
 * @swagger
 * /api/speaker-contracts:
 *   post:
 *     tags: [Speaker Contracts]
 *     summary: Crear contrato
 *     description: Crea un nuevo contrato para un speaker y evento
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticated, createEditLimiter, createContractValidation, speakerContractController.createContract);

/**
 * @swagger
 * /api/speaker-contracts/{id}:
 *   get:
 *     tags: [Speaker Contracts]
 *     summary: Obtener contrato
 *     description: Obtiene los detalles de un contrato específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authenticated, contractLimiter, contractIdValidation, speakerContractController.getContract);

/**
 * @swagger
 * /api/speaker-contracts/{id}:
 *   put:
 *     tags: [Speaker Contracts]
 *     summary: Actualizar contrato
 *     description: Actualiza la información de un contrato específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', authenticated, createEditLimiter, contractIdValidation, updateContractValidation, speakerContractController.updateContract);

/**
 * @swagger
 * /api/speaker-contracts/{id}/approve:
 *   post:
 *     tags: [Speaker Contracts]
 *     summary: Aprobar contrato
 *     description: Aprueba un contrato pendiente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/approve', authenticated, contractLimiter, contractIdValidation, speakerContractController.approveContract);

/**
 * @swagger
 * /api/speaker-contracts/{id}/payment:
 *   post:
 *     tags: [Speaker Contracts]
 *     summary: Crear pago para contrato
 *     description: Registra un nuevo pago para un contrato específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post('/:id/payment', authenticated, createEditLimiter, contractIdValidation, createPaymentValidation, speakerContractController.createPayment);

export default router;