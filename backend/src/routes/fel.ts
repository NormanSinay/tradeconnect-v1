/**
 * @fileoverview Rutas FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para operaciones FEL
 */

import { Router } from 'express';
import { getFelController } from '../controllers/felController';
import { authenticated } from '../middleware/auth';
import { felLimiter } from '../middleware/rateLimiting';

const router = Router();
const felController = getFelController();

/**
 * @swagger
 * /api/fel/authenticate:
 *   post:
 *     summary: Autenticación con certificador FEL
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certificador
 *             properties:
 *               certificador:
 *                 type: string
 *                 enum: [infile, dimexa]
 *                 example: "infile"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *       400:
 *         description: Error en autenticación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/authenticate', authenticated, felLimiter, felController.authenticate.bind(felController));

/**
 * @swagger
 * /api/fel/certify-dte/{documentId}:
 *   post:
 *     summary: Certificar DTE
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento FEL
 *     responses:
 *       200:
 *         description: DTE certificado exitosamente
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/certify-dte/:documentId', authenticated, felLimiter, felController.certifyDte.bind(felController));

/**
 * @swagger
 * /api/fel/cancel-dte/{invoiceId}:
 *   post:
 *     summary: Anular DTE
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo de la anulación
 *                 example: "Factura emitida por error"
 *               userId:
 *                 type: integer
 *                 description: ID del usuario que solicita la anulación
 *     responses:
 *       200:
 *         description: DTE anulado exitosamente
 *       400:
 *         description: Error en anulación
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/cancel-dte/:invoiceId', authenticated, felLimiter, felController.cancelDte.bind(felController));

/**
 * @swagger
 * /api/fel/consult-dte/{uuid}:
 *   get:
 *     summary: Consultar estado de DTE
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del DTE
 *     responses:
 *       200:
 *         description: Estado del DTE obtenido exitosamente
 *       404:
 *         description: DTE no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/consult-dte/:uuid', authenticated, felController.consultDte.bind(felController));

/**
 * @swagger
 * /api/fel/auto-generate/{registrationId}:
 *   post:
 *     summary: Generar factura automáticamente
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentId:
 *                 type: integer
 *                 description: ID del pago (opcional)
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       201:
 *         description: Factura generada exitosamente
 *       400:
 *         description: Error en generación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/auto-generate/:registrationId', authenticated, felLimiter, felController.autoGenerate.bind(felController));

/**
 * @swagger
 * /api/fel/download-pdf/{uuid}:
 *   get:
 *     summary: Descargar PDF de factura
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la factura
 *     responses:
 *       200:
 *         description: URL de descarga del PDF
 *       404:
 *         description: Factura no encontrada o PDF no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.get('/download-pdf/:uuid', authenticated, felController.downloadPdf.bind(felController));

/**
 * @swagger
 * /api/fel/retry-failed:
 *   post:
 *     summary: Reintentar operaciones fallidas
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operaciones reintentadas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/retry-failed', authenticated, felLimiter, felController.retryFailed.bind(felController));

/**
 * @swagger
 * /api/fel/token/status/{certificador}:
 *   get:
 *     summary: Estado del token FEL
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificador
 *         required: true
 *         schema:
 *           type: string
 *           enum: [infile, dimexa]
 *         description: Nombre del certificador
 *     responses:
 *       200:
 *         description: Estado del token obtenido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/token/status/:certificador', authenticated, felController.tokenStatus.bind(felController));

/**
 * @swagger
 * /api/fel/token/refresh:
 *   post:
 *     summary: Renovar token FEL
 *     tags: [FEL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certificador
 *             properties:
 *               certificador:
 *                 type: string
 *                 enum: [infile, dimexa]
 *                 example: "infile"
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *       400:
 *         description: Error en renovación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/token/refresh', authenticated, felLimiter, felController.refreshToken.bind(felController));

export default router;