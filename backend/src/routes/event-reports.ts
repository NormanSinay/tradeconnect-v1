/**
 * @fileoverview Rutas de Reportes y Analytics para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de reportes y analytics de eventos
 *
 * Archivo: backend/src/routes/event-reports.ts
 */

import { Router } from 'express';
import { query } from 'express-validator';
import { EventReportsController } from '../controllers/eventReportsController';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA REPORTES
// ====================================================================

// Rate limiter para reportes (menos restrictivo ya que son operaciones de lectura)
const reportsLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: RATE_LIMITS.GLOBAL.max * 2, // Permitir más requests para reportes
  message: {
    success: false,
    message: 'Demasiadas solicitudes de reportes. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter específico para exportaciones
const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 exportaciones por usuario cada 15 minutos
  message: {
    success: false,
    message: 'Demasiadas exportaciones. Intente más tarde.',
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
    .withMessage('Fecha de inicio debe tener formato YYYY-MM-DD'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe tener formato YYYY-MM-DD'),
  query('eventId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de evento debe ser un número entero positivo'),
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número entero positivo'),
  query('typeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de tipo debe ser un número entero positivo'),
  query('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Estado de evento inválido'),
  query('organizerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de organizador debe ser un número entero positivo')
];

// Validación para parámetros de ruta
const eventIdValidation = [
  query('eventId')
    .isInt({ min: 1 })
    .withMessage('ID de evento debe ser un número entero positivo')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ====================================================================

// ====================================================================
// REPORTES DE VENTAS
// ====================================================================

/**
 * @swagger
 * /api/event-reports/sales:
 *   get:
 *     tags: [Event Reports]
 *     summary: Obtener reporte de ventas
 *     description: Genera un reporte completo de ventas de eventos con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de evento específico
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: Filtrar por estado del evento
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de organizador
 */
router.get('/sales',
  authenticated,
  reportsLimiter,
  dateFiltersValidation,
  EventReportsController.getSalesReport
);

/**
 * @swagger
 * /api/event-reports/sales/export:
 *   get:
 *     tags: [Event Reports]
 *     summary: Exportar reporte de ventas
 *     description: Exporta el reporte de ventas en formato CSV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de evento específico
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: Filtrar por estado del evento
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de organizador
 *     responses:
 *       200:
 *         description: Archivo CSV generado exitosamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/sales/export',
  authenticated,
  exportLimiter,
  dateFiltersValidation,
  EventReportsController.exportSalesReport
);

// ====================================================================
// REPORTES DE ASISTENCIA
// ====================================================================

/**
 * @swagger
 * /api/event-reports/attendance:
 *   get:
 *     tags: [Event Reports]
 *     summary: Obtener reporte de asistencia
 *     description: Genera un reporte completo de asistencia a eventos con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de evento específico
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: Filtrar por estado del evento
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de organizador
 */
router.get('/attendance',
  authenticated,
  reportsLimiter,
  dateFiltersValidation,
  EventReportsController.getAttendanceReport
);

/**
 * @swagger
 * /api/event-reports/attendance/export:
 *   get:
 *     tags: [Event Reports]
 *     summary: Exportar reporte de asistencia
 *     description: Exporta el reporte de asistencia en formato CSV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de evento específico
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: Filtrar por estado del evento
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de organizador
 *     responses:
 *       200:
 *         description: Archivo CSV generado exitosamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/attendance/export',
  authenticated,
  exportLimiter,
  dateFiltersValidation,
  EventReportsController.exportAttendanceReport
);

// ====================================================================
// ANALYTICS DE EVENTOS INDIVIDUALES
// ====================================================================

/**
 * @swagger
 * /api/event-reports/events/{eventId}/analytics:
 *   get:
 *     tags: [Event Reports]
 *     summary: Obtener analytics de evento
 *     description: Genera analytics detallados de un evento específico
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
router.get('/events/:eventId/analytics',
  authenticated,
  reportsLimiter,
  eventIdValidation,
  EventReportsController.getEventAnalytics
);

// ====================================================================
// MÉTRICAS DEL SISTEMA
// ====================================================================

/**
 * @swagger
 * /api/event-reports/system/metrics:
 *   get:
 *     tags: [Event Reports]
 *     summary: Obtener métricas del sistema
 *     description: Obtiene métricas generales del sistema de eventos
 *     security:
 *       - bearerAuth: []
 */
router.get('/system/metrics',
  authenticated,
  reportsLimiter,
  EventReportsController.getSystemMetrics
);

// ====================================================================
// ANALYTICS PARA DASHBOARD
// ====================================================================

/**
 * @swagger
 * /api/analytics/user-activity:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener datos de actividad de usuarios
 *     description: Obtiene datos de actividad de usuarios para gráficos del dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: number
 */
router.get('/analytics/user-activity',
  authenticated,
  reportsLimiter,
  EventReportsController.getUserActivityData
);

/**
 * @swagger
 * /api/analytics/revenue-by-category:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener ingresos por categoría
 *     description: Obtiene datos de ingresos por categoría de eventos para gráficos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: number
 */
router.get('/analytics/revenue-by-category',
  authenticated,
  reportsLimiter,
  EventReportsController.getRevenueByCategory
);

/**
 * @swagger
 * /api/analytics/popular-events:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener eventos populares
 *     description: Obtiene datos de eventos más populares por número de registros
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: number
 */
router.get('/analytics/popular-events',
  authenticated,
  reportsLimiter,
  EventReportsController.getPopularEventsData
);

/**
 * @swagger
 * /api/analytics/system-performance:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener rendimiento del sistema
 *     description: Obtiene métricas de rendimiento del sistema para gráficos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                 responseTime:
 *                   type: array
 *                   items:
 *                     type: number
 *                 uptime:
 *                   type: array
 *                   items:
 *                     type: number
 */
router.get('/analytics/system-performance',
  authenticated,
  reportsLimiter,
  EventReportsController.getSystemPerformanceData
);

export default router;
