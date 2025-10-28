/**
 * @fileoverview Rutas de Administración para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para funcionalidades administrativas avanzadas
 *
 * Archivo: backend/src/routes/admin.ts
 */

import { Router } from 'express';
import { query } from 'express-validator';
import { SecurityService } from '../services/securityService';
import { rateLimit } from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants';
import { authenticated } from '../middleware/auth';

const router = Router();

// ====================================================================
// RATE LIMITING PARA ADMIN
// ====================================================================

// Rate limiter para operaciones administrativas (más restrictivo)
const adminLimiter = rateLimit({
  windowMs: RATE_LIMITS.GLOBAL.windowMs,
  max: 100, // máximo 100 requests por usuario cada 15 minutos para admin
  message: {
    success: false,
    message: 'Demasiadas operaciones administrativas. Intente más tarde.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ====================================================================
// VALIDACIONES
// ====================================================================

// Validación para parámetros de auditoría
const auditValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  query('action')
    .optional()
    .isString()
    .withMessage('Acción debe ser una cadena de texto'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario debe ser un número entero positivo'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe tener formato YYYY-MM-DDTHH:mm:ssZ'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe tener formato YYYY-MM-DDTHH:mm:ssZ')
];

// ====================================================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN Y PERMISOS ADMIN)
// ====================================================================

/**
 * @swagger
 * /api/admin/audit:
 *   get:
 *     tags: [Admin]
 *     summary: Obtener logs de auditoría del sistema
 *     description: Obtiene logs de auditoría paginados con filtros avanzados (requiere permisos administrativos)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Registros por página
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de acción
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin (ISO 8601)
 *     responses:
 *       200:
 *         description: Logs de auditoría obtenidos exitosamente
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
 *                   example: "Logs de auditoría obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: integer
 *                             example: 123
 *                           action:
 *                             type: string
 *                             example: "user_login"
 *                           description:
 *                             type: string
 *                             example: "Usuario inició sesión"
 *                           ipAddress:
 *                             type: string
 *                             example: "192.168.1.100"
 *                           location:
 *                             type: string
 *                             example: "Guatemala City, Guatemala"
 *                           metadata:
 *                             type: object
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-25T09:32:15Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-25T09:32:15Z"
 *       403:
 *         description: No tienes permisos para acceder a la auditoría
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
 *                   example: "No tienes permisos para acceder a la auditoría"
 *                 error:
 *                   type: string
 *                   example: "INSUFFICIENT_PERMISSIONS"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-25T09:32:15Z"
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
 *                   example: "Error obteniendo logs de auditoría"
 *                 error:
 *                   type: string
 *                   example: "INTERNAL_SERVER_ERROR"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-10-25T09:32:15Z"
 */
router.get('/audit',
  authenticated,
  adminLimiter,
  auditValidation,
  async (req: any, res: any) => {
    try {
      // Verificar permisos
      const userPermissions = req.user?.permissions || [];
      if (!userPermissions.includes('view_audit_logs')) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a la auditoría',
          error: 'INSUFFICIENT_PERMISSIONS',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const {
        page = 1,
        limit = 50,
        action,
        userId,
        startDate,
        endDate
      } = req.query;

      const filters = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        action: action as string,
        userId: userId ? parseInt(userId as string, 10) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const securityService = new SecurityService();
      const result = await securityService.getAuditLogs(filters);

      res.json(result);
    } catch (error) {
      console.error('Error getting audit logs:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo logs de auditoría',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;