/**
 * @fileoverview Rutas de Validación FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para validación de NIT y CUI
 */

import { Router } from 'express';
import { getFelValidationController } from '../controllers/felValidationController';
import { authenticated } from '../middleware/auth';
import { felLimiter } from '../middleware/rateLimiting';

const router = Router();
const felValidationController = getFelValidationController();

/**
 * @swagger
 * /api/fel/validate-nit:
 *   post:
 *     summary: Validar NIT
 *     tags: [FEL Validation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nit
 *             properties:
 *               nit:
 *                 type: string
 *                 description: Número de Identificación Tributaria
 *                 example: "12345678-9"
 *     responses:
 *       200:
 *         description: NIT validado exitosamente
 *       400:
 *         description: NIT inválido o error en validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/validate-nit', authenticated, felLimiter, felValidationController.validateNit.bind(felValidationController));

/**
 * @swagger
 * /api/fel/validate-cui:
 *   post:
 *     summary: Validar CUI
 *     tags: [FEL Validation]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Código Único de Identificación
 *                 example: "1234567890123"
 *     responses:
 *       200:
 *         description: CUI validado exitosamente
 *       400:
 *         description: CUI inválido o error en validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/validate-cui', authenticated, felLimiter, felValidationController.validateCui.bind(felValidationController));


/**
 * @swagger
 * /api/fel/validation-stats:
 *   get:
 *     summary: Obtener estadísticas de validaciones
 *     tags: [FEL Validation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [nit, cui]
 *         description: Tipo de validación (opcional)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (opcional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (opcional)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/validation-stats', authenticated, felValidationController.getValidationStats.bind(felValidationController));


export default router;
