/**
 * @fileoverview Rutas de Webhooks para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definición de rutas para procesamiento de webhooks de pasarelas de pago
 */

import { Router } from 'express';
import { webhookController } from '../controllers/webhookController';

const router = Router();

// ====================================================================
// WEBHOOKS DE PASARELAS DE PAGO
// ====================================================================

/**
 * @swagger
 * /api/webhooks/paypal:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook PayPal
 *     description: Endpoint para recibir notificaciones de PayPal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.post('/paypal', webhookController.handlePayPalWebhook);

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook Stripe
 *     description: Endpoint para recibir notificaciones de Stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.post('/stripe', webhookController.handleStripeWebhook);

/**
 * @swagger
 * /api/webhooks/neonet:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook NeoNet
 *     description: Endpoint para recibir notificaciones de NeoNet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.post('/neonet', webhookController.handleNeoNetWebhook);

/**
 * @swagger
 * /api/webhooks/bam:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook BAM
 *     description: Endpoint para recibir notificaciones de BAM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.post('/bam', webhookController.handleBamWebhook);

// ====================================================================
// WEBHOOKS DE SERVICIOS EXTERNOS
// ====================================================================

/**
 * @swagger
 * /api/webhooks/zoom:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook Zoom
 *     description: Endpoint para recibir notificaciones de Zoom (eventos híbridos)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.post('/zoom', webhookController.handleZoomWebhook);

/**
 * @swagger
 * /api/webhooks/calendar:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook Google Calendar
 *     description: Endpoint para recibir notificaciones de Google Calendar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.post('/calendar', webhookController.handleCalendarWebhook);

export default router;