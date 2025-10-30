/**
 * @fileoverview Rutas de Gestión Financiera para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión financiera, reportes y KPIs
 *
 * Archivo: backend/src/routes/finance.ts
 */

import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { FinanceController } from '../controllers/financeController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS, USER_ROLES } from '../utils/constants';
import { authenticated, requireRole } from '../middleware/auth';
import { auditLogger } from '../middleware/logging.middleware';

const router = Router();

console.log('🔍 [DEBUG] Finance routes module loaded successfully');

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Finance module is working!' });
});

// ====================================================================
// RATE LIMITING PARA FINANZAS
// ====================================================================

// Rate limiter para operaciones financieras (muy restrictivo por seguridad)
const financeLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: Math.floor(RATE_LIMITS.GLOBAL.max / 4), // Muy restrictivo para finanzas
  message: {
    success: false,
    message: 'Demasiadas solicitudes financieras. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para reportes financieros
const financeReportsLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: Math.floor(RATE_LIMITS.GLOBAL.max / 2), // Moderadamente restrictivo
  message: {
    success: false,
    message: 'Demasiadas solicitudes de reportes financieros. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para operaciones de reembolso (muy restrictivo)
const refundLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 operaciones de reembolso por usuario cada 15 minutos
  message: {
    success: false,
    message: 'Demasiadas operaciones de reembolso. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para filtros de fecha
const dateFiltersValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe tener formato YYYY-MM-DDTHH:mm:ssZ'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe tener formato YYYY-MM-DDTHH:mm:ssZ'),
  query('gateway')
    .optional()
    .isIn(['paypal', 'stripe', 'neonet', 'bam'])
    .withMessage('Pasarela de pago inválida')
];

// Validación para parámetros de evento
const eventIdValidation = [
  param('eventId')
    .isInt({ min: 1 })
    .withMessage('ID de evento debe ser un número entero positivo')
];

// Validación para parámetros de registro
const registrationIdValidation = [
  param('registrationId')
    .isInt({ min: 1 })
    .withMessage('ID de registro debe ser un número entero positivo')
];

// Validación para filtros de transacciones
const transactionFiltersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Límite debe estar entre 1 y 200'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe tener formato YYYY-MM-DDTHH:mm:ssZ'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe tener formato YYYY-MM-DDTHH:mm:ssZ'),
  query('gateway')
    .optional()
    .isIn(['paypal', 'stripe', 'neonet', 'bam'])
    .withMessage('Pasarela de pago inválida'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
    .withMessage('Estado de transacción inválido'),
  query('eventId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de evento debe ser un número entero positivo'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'amount', 'gateway', 'status'])
    .withMessage('Campo de ordenamiento inválido'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Orden de ordenamiento inválido')
];

// Validación para parámetros de tendencias
const trendsValidation = [
  query('periods')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Períodos debe estar entre 1 y 24'),
  query('periodType')
    .optional()
    .isIn(['month', 'week', 'day'])
    .withMessage('Tipo de período inválido')
];

// Validación para reembolso automático
const automaticRefundValidation = [
  body('daysBeforeEvent')
    .isInt({ min: 0 })
    .withMessage('Días antes del evento debe ser un número entero no negativo'),
  body('refundPercentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Porcentaje de reembolso debe estar entre 0 y 100'),
  body('reason')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Razón del reembolso es requerida y debe tener máximo 500 caracteres'),
  body('conditions')
    .optional()
    .isArray()
    .withMessage('Condiciones debe ser un arreglo')
];

// Validación para reembolso masivo
const bulkRefundValidation = [
  body('payments')
    .isArray({ min: 1 })
    .withMessage('Lista de pagos es requerida y no puede estar vacía'),
  body('payments.*')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('IDs de transacción inválidos'),
  body('reason')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Razón del reembolso es requerida y debe tener máximo 500 caracteres'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descripción debe tener máximo 1000 caracteres'),
  body('policy')
    .optional()
    .isObject()
    .withMessage('Política debe ser un objeto válido')
];

// ====================================================================
// MIDDLEWARE DE AUDITORÍA
// ====================================================================

/**
 * Middleware para logging de auditoría financiera
 */
const financeAuditLogger = (action: string, resource: string) => {
  return (req: any, res: any, next: any) => {
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Log de acceso a ruta financiera
    auditLogger(userId, action, resource, req.params?.eventId || req.params?.registrationId, {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    }, ipAddress);

    next();
  };
};

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN Y PERMISOS DE SUPER ADMIN)
// ====================================================================

// ====================================================================
// COMISIONES
// ====================================================================

/**
 * @swagger
 * /api/finance/commissions:
 *   get:
 *     tags: [Finance]
 *     summary: Calcular comisiones por pasarela
 *     description: Calcula las comisiones aplicables para una transacción específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: gateway
 *         required: true
 *         schema:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *         description: Pasarela de pago
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *         description: Monto de la transacción
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           default: GTQ
 *         description: Moneda de la transacción
 *     responses:
 *       200:
 *         description: Comisiones calculadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/commissions',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeLimiter,
  financeAuditLogger('calculate_gateway_commissions', 'commissions'),
  [
    query('gateway')
      .isIn(['paypal', 'stripe', 'neonet', 'bam'])
      .withMessage('Pasarela de pago requerida y debe ser válida'),
    query('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Monto debe ser un número positivo'),
    query('currency')
      .optional()
      .isString()
      .withMessage('Moneda debe ser una cadena')
  ],
  FinanceController.getGatewayCommissions
);

/**
 * @swagger
 * /api/finance/commissions/event/{eventId}:
 *   get:
 *     tags: [Finance]
 *     summary: Obtener comisiones por evento
 *     description: Calcula las comisiones totales para un evento específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Comisiones del evento obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/commissions/event/:eventId',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeLimiter,
  eventIdValidation,
  financeAuditLogger('get_event_commissions', 'commissions'),
  FinanceController.getEventCommissions
);

/**
 * @swagger
 * /api/finance/commissions/period:
 *   get:
 *     tags: [Finance]
 *     summary: Obtener comisiones por período
 *     description: Calcula las comisiones para un período específico con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin del período
 *       - in: query
 *         name: gateway
 *         schema:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *         description: Filtrar por pasarela específica
 *     responses:
 *       200:
 *         description: Comisiones del período obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/commissions/period',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeLimiter,
  [
    query('startDate')
      .isISO8601()
      .withMessage('Fecha de inicio es requerida y debe tener formato válido'),
    query('endDate')
      .isISO8601()
      .withMessage('Fecha de fin es requerida y debe tener formato válido'),
    query('gateway')
      .optional()
      .isIn(['paypal', 'stripe', 'neonet', 'bam'])
      .withMessage('Pasarela de pago inválida')
  ],
  financeAuditLogger('get_period_commissions', 'commissions'),
  FinanceController.getPeriodCommissions
);

// ====================================================================
// REPORTES FINANCIEROS
// ====================================================================

/**
 * @swagger
 * /api/finance/reports:
 *   get:
 *     tags: [Finance]
 *     summary: Generar reporte financiero completo
 *     description: Genera un reporte financiero completo para un período específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio del reporte
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin del reporte
 *     responses:
 *       200:
 *         description: Reporte financiero generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/reports',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeReportsLimiter,
  [
    query('startDate')
      .isISO8601()
      .withMessage('Fecha de inicio es requerida y debe tener formato válido'),
    query('endDate')
      .isISO8601()
      .withMessage('Fecha de fin es requerida y debe tener formato válido')
  ],
  financeAuditLogger('generate_financial_report', 'reports'),
  FinanceController.getFinancialReport
);

// ====================================================================
// KPIs FINANCIEROS
// ====================================================================

/**
 * @swagger
 * /api/finance/kpis:
 *   get:
 *     tags: [Finance]
 *     summary: Calcular KPIs financieros
 *     description: Calcula los indicadores clave de rendimiento financiero para un período
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin del período
 *     responses:
 *       200:
 *         description: KPIs financieros calculados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/kpis',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeReportsLimiter,
  [
    query('startDate')
      .isISO8601()
      .withMessage('Fecha de inicio es requerida y debe tener formato válido'),
    query('endDate')
      .isISO8601()
      .withMessage('Fecha de fin es requerida y debe tener formato válido')
  ],
  financeAuditLogger('calculate_financial_kpis', 'kpis'),
  FinanceController.getFinancialKPIs
);

// ====================================================================
// ANÁLISIS DE TENDENCIAS
// ====================================================================

/**
 * @swagger
 * /api/finance/trends:
 *   get:
 *     tags: [Finance]
 *     summary: Analizar tendencias financieras
 *     description: Analiza las tendencias financieras a lo largo del tiempo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periods
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 12
 *         description: Número de períodos a analizar
 *       - in: query
 *         name: periodType
 *         schema:
 *           type: string
 *           enum: [month, week, day]
 *           default: month
 *         description: Tipo de período para el análisis
 *     responses:
 *       200:
 *         description: Tendencias financieras analizadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/trends',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeReportsLimiter,
  trendsValidation,
  financeAuditLogger('analyze_financial_trends', 'trends'),
  FinanceController.getFinancialTrends
);

// ====================================================================
// REEMBOLSOS
// ====================================================================

/**
 * @swagger
 * /api/finance/refunds/automatic/{registrationId}:
 *   post:
 *     tags: [Finance]
 *     summary: Procesar reembolso automático
 *     description: Procesa un reembolso automático basado en políticas definidas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro para reembolso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - daysBeforeEvent
 *               - refundPercentage
 *               - reason
 *             properties:
 *               daysBeforeEvent:
 *                 type: integer
 *                 minimum: 0
 *               refundPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Reembolso automático procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.post('/refunds/automatic/:registrationId',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  refundLimiter,
  registrationIdValidation,
  automaticRefundValidation,
  financeAuditLogger('process_automatic_refund', 'refunds'),
  FinanceController.processAutomaticRefund
);

/**
 * @swagger
 * /api/finance/refunds/bulk:
 *   post:
 *     tags: [Finance]
 *     summary: Procesar reembolsos masivos
 *     description: Procesa múltiples reembolsos en una sola operación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payments
 *               - reason
 *             properties:
 *               payments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               policy:
 *                 type: object
 *     responses:
 *       200:
 *         description: Reembolsos masivos procesados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.post('/refunds/bulk',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  refundLimiter,
  bulkRefundValidation,
  financeAuditLogger('process_bulk_refunds', 'refunds'),
  FinanceController.processBulkRefunds
);

// ====================================================================
// TRANSACCIONES
// ====================================================================

/**
 * @swagger
 * /api/finance/transactions:
 *   get:
 *     tags: [Finance]
 *     summary: Listar transacciones
 *     description: Obtiene una lista paginada de transacciones con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 50
 *         description: Número de resultados por página
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio del filtro
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin del filtro
 *       - in: query
 *         name: gateway
 *         schema:
 *           type: string
 *           enum: [paypal, stripe, neonet, bam]
 *         description: Filtrar por pasarela
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded, cancelled]
 *         description: Filtrar por estado
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrar por evento
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, amount, gateway, status]
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Transacciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/transactions',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeReportsLimiter,
  transactionFiltersValidation,
  financeAuditLogger('list_transactions', 'transactions'),
  FinanceController.getTransactions
);

// ====================================================================
// ESTADÍSTICAS GENERALES
// ====================================================================

/**
 * @swagger
 * /api/finance/stats:
 *   get:
 *     tags: [Finance]
 *     summary: Obtener estadísticas financieras generales
 *     description: Obtiene estadísticas generales del sistema financiero
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas financieras obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 */
router.get('/stats',
  authenticated,
  requireRole(USER_ROLES.SUPER_ADMIN),
  financeReportsLimiter,
  financeAuditLogger('get_financial_stats', 'stats'),
  FinanceController.getFinancialStats
);

export default router;