/**
 * @fileoverview Rutas de Facturas FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para gestión de facturas FEL
 */

import { Router } from 'express';
import { getInvoiceController } from '../controllers/invoiceController';
import { authenticated } from '../middleware/auth';
import { felLimiter } from '../middleware/rateLimiting';

const router = Router();
const invoiceController = getInvoiceController();

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de resultados por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending, certified, sent, cancelled, expired]
 *         description: Filtrar por estado
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [FACTURA, NOTA_CREDITO, NOTA_DEBITO]
 *         description: Filtrar por tipo de documento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por NIT, nombre o número de autorización
 *     responses:
 *       200:
 *         description: Facturas obtenidas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticated, invoiceController.getInvoices.bind(invoiceController));

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura obtenida exitosamente
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticated, invoiceController.getInvoiceById.bind(invoiceController));

/**
 * @swagger
 * /api/invoices/registration/{regId}:
 *   get:
 *     summary: Obtener facturas por ID de registro
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: regId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     responses:
 *       200:
 *         description: Facturas obtenidas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/registration/:regId', authenticated, invoiceController.getInvoicesByRegistration.bind(invoiceController));

/**
 * @swagger
 * /api/invoices/generate:
 *   post:
 *     summary: Generar nueva factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationId
 *             properties:
 *               registrationId:
 *                 type: integer
 *                 description: ID de la inscripción
 *               customItems:
 *                 type: array
 *                 description: Items personalizados (opcional)
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     discount:
 *                       type: number
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
router.post('/generate', authenticated, felLimiter, invoiceController.generateInvoice.bind(invoiceController));

/**
 * @swagger
 * /api/invoices/{id}/status:
 *   put:
 *     summary: Actualizar estado de factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, pending, certified, sent, cancelled, expired]
 *                 description: Nuevo estado de la factura
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/status', authenticated, felLimiter, invoiceController.updateInvoiceStatus.bind(invoiceController));

/**
 * @swagger
 * /api/invoices/stats:
 *   get:
 *     summary: Obtener estadísticas de facturación
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', authenticated, invoiceController.getInvoiceStats.bind(invoiceController));

/**
 * @swagger
 * /api/invoices/{id}/download-pdf:
 *   get:
 *     summary: Descargar PDF de factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: URL de descarga del PDF
 *       404:
 *         description: Factura no encontrada o PDF no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/download-pdf', authenticated, invoiceController.downloadPdf.bind(invoiceController));

/**
 * @swagger
 * /api/invoices/{id}/download-xml:
 *   get:
 *     summary: Descargar XML de factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: URL de descarga del XML
 *       404:
 *         description: Factura no encontrada o XML no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/download-xml', authenticated, invoiceController.downloadXml.bind(invoiceController));

export default router;