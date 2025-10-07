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
 *     description: Endpoint para recibir notificaciones de PayPal sobre eventos de pago. Incluye verificación de firma para seguridad.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - create_time
 *               - resource_type
 *               - event_type
 *               - resource
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID único del webhook
 *                 example: "wh_123456789"
 *               create_time:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp de creación del evento
 *                 example: "2023-10-01T12:00:00.000Z"
 *               resource_type:
 *                 type: string
 *                 description: Tipo de recurso del evento
 *                 example: "capture"
 *               event_type:
 *                 type: string
 *                 description: Tipo específico del evento
 *                 example: "PAYMENT.CAPTURE.COMPLETED"
 *               summary:
 *                 type: string
 *                 description: Resumen del evento
 *                 example: "Payment completed for EUR 10.00 EUR"
 *               resource:
 *                 type: object
 *                 required:
 *                   - id
 *                   - amount
 *                   - status
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID del recurso (captura, reembolso, etc.)
 *                     example: "8AC12359NE2342313"
 *                   amount:
 *                     type: object
 *                     required:
 *                       - currency_code
 *                       - value
 *                     properties:
 *                       currency_code:
 *                         type: string
 *                         description: Código de moneda ISO
 *                         example: "EUR"
 *                       value:
 *                         type: string
 *                         description: Monto del pago
 *                         example: "10.00"
 *                   seller_protection:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         description: Estado de protección del vendedor
 *                         example: "ELIGIBLE"
 *                   status:
 *                     type: string
 *                     description: Estado del pago
 *                     example: "COMPLETED"
 *                   create_time:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-10-01T12:00:00.000Z"
 *                   update_time:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-10-01T12:00:00.000Z"
 *                   links:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                           example: "https://api.paypal.com/v2/payments/captures/8AC12359NE2342313"
 *                         rel:
 *                           type: string
 *                           example: "self"
 *                         method:
 *                           type: string
 *                           example: "GET"
 *               links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     href:
 *                       type: string
 *                       example: "https://api.paypal.com/v2/notifications/webhooks-events/wh-123456789"
 *                     rel:
 *                       type: string
 *                       example: "self"
 *                     method:
 *                       type: string
 *                       example: "GET"
 *           examples:
 *             paypal_payment_completed:
 *               summary: Pago completado en PayPal
 *               value:
 *                 id: "wh_123456789"
 *                 create_time: "2023-10-01T12:00:00.000Z"
 *                 resource_type: "capture"
 *                 event_type: "PAYMENT.CAPTURE.COMPLETED"
 *                 summary: "Payment completed for EUR 10.00 EUR"
 *                 resource:
 *                   id: "8AC12359NE2342313"
 *                   amount:
 *                     currency_code: "EUR"
 *                     value: "10.00"
 *                   seller_protection:
 *                     status: "ELIGIBLE"
 *                   status: "COMPLETED"
 *                   create_time: "2023-10-01T12:00:00.000Z"
 *                   update_time: "2023-10-01T12:00:00.000Z"
 *                   links:
 *                     - href: "https://api.paypal.com/v2/payments/captures/8AC12359NE2342313"
 *                       rel: "self"
 *                       method: "GET"
 *                 links:
 *                   - href: "https://api.paypal.com/v2/notifications/webhooks-events/wh-123456789"
 *                     rel: "self"
 *                     method: "GET"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
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
 *                   example: "Webhook procesado exitosamente"
 *             examples:
 *               webhook_success:
 *                 summary: Webhook procesado correctamente
 *                 value:
 *                   success: true
 *                   message: "Webhook procesado exitosamente"
 *       400:
 *         description: Firma inválida o payload malformado
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
 *                   example: "Firma de webhook inválida"
 *                 error:
 *                   type: string
 *                   example: "INVALID_SIGNATURE"
 *       500:
 *         description: Error interno procesando webhook
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
 *                   example: "Error procesando webhook"
 *                 error:
 *                   type: string
 *                   example: "WEBHOOK_PROCESSING_ERROR"
 */
router.post('/paypal', webhookController.handlePayPalWebhook);

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook Stripe
 *     description: Endpoint para recibir notificaciones de Stripe sobre eventos de pago. Incluye verificación de firma para seguridad.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - object
 *               - api_version
 *               - created
 *               - data
 *               - livemode
 *               - pending_webhooks
 *               - type
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID único del evento
 *                 example: "evt_1234567890"
 *               object:
 *                 type: string
 *                 description: Tipo de objeto (siempre 'event')
 *                 example: "event"
 *               api_version:
 *                 type: string
 *                 description: Versión de la API de Stripe
 *                 example: "2020-08-27"
 *               created:
 *                 type: integer
 *                 description: Timestamp Unix de creación
 *                 example: 1696166400
 *               data:
 *                 type: object
 *                 required:
 *                   - object
 *                 properties:
 *                   object:
 *                     type: object
 *                     description: Objeto del evento (PaymentIntent, Charge, etc.)
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "pi_1234567890"
 *                       object:
 *                         type: string
 *                         example: "payment_intent"
 *                       amount:
 *                         type: integer
 *                         description: Monto en centavos
 *                         example: 1000
 *                       currency:
 *                         type: string
 *                         example: "usd"
 *                       status:
 *                         type: string
 *                         example: "succeeded"
 *                       metadata:
 *                         type: object
 *                         description: Metadatos personalizados
 *                         example: { "order_id": "12345" }
 *                   previous_attributes:
 *                     type: object
 *                     description: Atributos anteriores (solo en eventos de actualización)
 *               livemode:
 *                 type: boolean
 *                 description: Si el evento es de modo producción
 *                 example: true
 *               pending_webhooks:
 *                 type: integer
 *                 description: Número de webhooks pendientes
 *                 example: 1
 *               request:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "req_1234567890"
 *                   idempotency_key:
 *                     type: string
 *                     example: "idemp_key_123"
 *               type:
 *                 type: string
 *                 description: Tipo del evento
 *                 example: "payment_intent.succeeded"
 *           examples:
 *             stripe_payment_succeeded:
 *               summary: Pago exitoso en Stripe
 *               value:
 *                 id: "evt_1234567890"
 *                 object: "event"
 *                 api_version: "2020-08-27"
 *                 created: 1696166400
 *                 data:
 *                   object:
 *                     id: "pi_1234567890"
 *                     object: "payment_intent"
 *                     amount: 1000
 *                     currency: "usd"
 *                     status: "succeeded"
 *                     metadata: { "order_id": "12345" }
 *                 livemode: true
 *                 pending_webhooks: 1
 *                 request: { "id": "req_1234567890" }
 *                 type: "payment_intent.succeeded"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
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
 *                   example: "Webhook procesado exitosamente"
 *             examples:
 *               webhook_success:
 *                 summary: Webhook procesado correctamente
 *                 value:
 *                   success: true
 *                   message: "Webhook procesado exitosamente"
 *       400:
 *         description: Firma inválida o payload malformado
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
 *                   example: "Firma de webhook inválida"
 *                 error:
 *                   type: string
 *                   example: "INVALID_SIGNATURE"
 *       500:
 *         description: Error interno procesando webhook
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
 *                   example: "Error procesando webhook"
 *                 error:
 *                   type: string
 *                   example: "WEBHOOK_PROCESSING_ERROR"
 */
router.post('/stripe', webhookController.handleStripeWebhook);

/**
 * @swagger
 * /api/webhooks/neonet:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook NeoNet
 *     description: Endpoint para recibir notificaciones de NeoNet sobre transacciones. Incluye verificación de firma opcional.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - transactionId
 *               - reference
 *               - amount
 *               - currency
 *               - status
 *               - timestamp
 *               - signature
 *             properties:
 *               eventType:
 *                 type: string
 *                 description: Tipo de evento de la transacción
 *                 example: "payment.completed"
 *               transactionId:
 *                 type: string
 *                 description: ID único de la transacción en NeoNet
 *                 example: "txn_123456789"
 *               reference:
 *                 type: string
 *                 description: Referencia de la transacción
 *                 example: "ref_987654321"
 *               amount:
 *                 type: number
 *                 description: Monto de la transacción
 *                 example: 100.00
 *               currency:
 *                 type: string
 *                 description: Código de moneda ISO
 *                 example: "GTQ"
 *               status:
 *                 type: string
 *                 description: Estado de la transacción
 *                 example: "approved"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp del evento
 *                 example: "2023-10-01T12:00:00.000Z"
 *               signature:
 *                 type: string
 *                 description: Firma digital para verificación
 *                 example: "sha256_signature_here"
 *               data:
 *                 type: object
 *                 description: Datos adicionales específicos de NeoNet
 *                 properties:
 *                   authorizationCode:
 *                     type: string
 *                     example: "AUTH123456"
 *                   responseCode:
 *                     type: string
 *                     example: "00"
 *                   responseMessage:
 *                     type: string
 *                     example: "Transacción aprobada"
 *                   cardInfo:
 *                     type: object
 *                     properties:
 *                       lastFour:
 *                         type: string
 *                         example: "1234"
 *                       brand:
 *                         type: string
 *                         example: "visa"
 *                       type:
 *                         type: string
 *                         example: "credit"
 *           examples:
 *             neonet_payment_approved:
 *               summary: Pago aprobado en NeoNet
 *               value:
 *                 eventType: "payment.completed"
 *                 transactionId: "txn_123456789"
 *                 reference: "ref_987654321"
 *                 amount: 100.00
 *                 currency: "GTQ"
 *                 status: "approved"
 *                 timestamp: "2023-10-01T12:00:00.000Z"
 *                 signature: "sha256_signature_here"
 *                 data:
 *                   authorizationCode: "AUTH123456"
 *                   responseCode: "00"
 *                   responseMessage: "Transacción aprobada"
 *                   cardInfo:
 *                     lastFour: "1234"
 *                     brand: "visa"
 *                     type: "credit"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
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
 *                   example: "Webhook procesado exitosamente"
 *             examples:
 *               webhook_success:
 *                 summary: Webhook procesado correctamente
 *                 value:
 *                   success: true
 *                   message: "Webhook procesado exitosamente"
 *       400:
 *         description: Firma inválida o payload malformado
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
 *                   example: "Firma de webhook inválida"
 *                 error:
 *                   type: string
 *                   example: "INVALID_SIGNATURE"
 *       500:
 *         description: Error interno procesando webhook
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
 *                   example: "Error procesando webhook"
 *                 error:
 *                   type: string
 *                   example: "WEBHOOK_PROCESSING_ERROR"
 */
router.post('/neonet', webhookController.handleNeoNetWebhook);

/**
 * @swagger
 * /api/webhooks/bam:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook BAM
 *     description: Endpoint para recibir notificaciones de BAM sobre transacciones. Incluye verificación de firma opcional.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - transactionId
 *               - reference
 *               - amount
 *               - currency
 *               - status
 *               - timestamp
 *               - signature
 *             properties:
 *               eventType:
 *                 type: string
 *                 description: Tipo de evento de la transacción
 *                 example: "payment.completed"
 *               transactionId:
 *                 type: string
 *                 description: ID único de la transacción en BAM
 *                 example: "txn_987654321"
 *               reference:
 *                 type: string
 *                 description: Referencia de la transacción
 *                 example: "ref_123456789"
 *               amount:
 *                 type: number
 *                 description: Monto de la transacción
 *                 example: 250.00
 *               currency:
 *                 type: string
 *                 description: Código de moneda ISO
 *                 example: "GTQ"
 *               status:
 *                 type: string
 *                 description: Estado de la transacción
 *                 example: "approved"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp del evento
 *                 example: "2023-10-01T14:30:00.000Z"
 *               signature:
 *                 type: string
 *                 description: Firma digital para verificación
 *                 example: "bam_sha256_signature"
 *               data:
 *                 type: object
 *                 description: Datos adicionales específicos de BAM
 *                 properties:
 *                   authorizationCode:
 *                     type: string
 *                     example: "BAM_AUTH789"
 *                   responseCode:
 *                     type: string
 *                     example: "00"
 *                   responseMessage:
 *                     type: string
 *                     example: "Transacción procesada exitosamente"
 *                   cardInfo:
 *                     type: object
 *                     properties:
 *                       lastFour:
 *                         type: string
 *                         example: "5678"
 *                       brand:
 *                         type: string
 *                         example: "mastercard"
 *                       type:
 *                         type: string
 *                         example: "debit"
 *           examples:
 *             bam_payment_approved:
 *               summary: Pago aprobado en BAM
 *               value:
 *                 eventType: "payment.completed"
 *                 transactionId: "txn_987654321"
 *                 reference: "ref_123456789"
 *                 amount: 250.00
 *                 currency: "GTQ"
 *                 status: "approved"
 *                 timestamp: "2023-10-01T14:30:00.000Z"
 *                 signature: "bam_sha256_signature"
 *                 data:
 *                   authorizationCode: "BAM_AUTH789"
 *                   responseCode: "00"
 *                   responseMessage: "Transacción procesada exitosamente"
 *                   cardInfo:
 *                     lastFour: "5678"
 *                     brand: "mastercard"
 *                     type: "debit"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
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
 *                   example: "Webhook procesado exitosamente"
 *             examples:
 *               webhook_success:
 *                 summary: Webhook procesado correctamente
 *                 value:
 *                   success: true
 *                   message: "Webhook procesado exitosamente"
 *       400:
 *         description: Firma inválida o payload malformado
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
 *                   example: "Firma de webhook inválida"
 *                 error:
 *                   type: string
 *                   example: "INVALID_SIGNATURE"
 *       500:
 *         description: Error interno procesando webhook
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
 *                   example: "Error procesando webhook"
 *                 error:
 *                   type: string
 *                   example: "WEBHOOK_PROCESSING_ERROR"
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
 *     description: Endpoint para recibir notificaciones de Zoom sobre reuniones y eventos híbridos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - payload
 *             properties:
 *               event:
 *                 type: string
 *                 description: Tipo de evento de Zoom
 *                 example: "meeting.participant_joined"
 *               event_ts:
 *                 type: integer
 *                 description: Timestamp Unix del evento
 *                 example: 1696166400000
 *               payload:
 *                 type: object
 *                 required:
 *                   - account_id
 *                   - object
 *                 properties:
 *                   account_id:
 *                     type: string
 *                     description: ID de la cuenta de Zoom
 *                     example: "account_123456789"
 *                   object:
 *                     type: object
 *                     required:
 *                       - id
 *                       - uuid
 *                       - host_id
 *                       - topic
 *                       - type
 *                       - start_time
 *                       - timezone
 *                       - duration
 *                       - participant_count
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID numérico de la reunión
 *                         example: 123456789
 *                       uuid:
 *                         type: string
 *                         description: UUID único de la reunión
 *                         example: "uuid_123456789"
 *                       host_id:
 *                         type: string
 *                         description: ID del anfitrión
 *                         example: "host_987654321"
 *                       topic:
 *                         type: string
 *                         description: Título de la reunión
 *                         example: "Reunión de Proyecto TradeConnect"
 *                       type:
 *                         type: integer
 *                         description: Tipo de reunión (1=instantánea, 2=programada, etc.)
 *                         example: 2
 *                       start_time:
 *                         type: string
 *                         format: date-time
 *                         description: Hora de inicio
 *                         example: "2023-10-01T15:00:00Z"
 *                       timezone:
 *                         type: string
 *                         description: Zona horaria
 *                         example: "America/Guatemala"
 *                       duration:
 *                         type: integer
 *                         description: Duración en minutos
 *                         example: 60
 *                       participant_count:
 *                         type: integer
 *                         description: Número de participantes
 *                         example: 5
 *                       participant:
 *                         type: object
 *                         description: Información del participante (solo en eventos de participantes)
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "participant_123"
 *                           user_id:
 *                             type: string
 *                             example: "user_456"
 *                           user_name:
 *                             type: string
 *                             example: "Juan Pérez"
 *                           join_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T15:05:00Z"
 *                           leave_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T16:00:00Z"
 *           examples:
 *             zoom_participant_joined:
 *               summary: Participante se unió a reunión
 *               value:
 *                 event: "meeting.participant_joined"
 *                 event_ts: 1696166400000
 *                 payload:
 *                   account_id: "account_123456789"
 *                   object:
 *                     id: 123456789
 *                     uuid: "uuid_123456789"
 *                     host_id: "host_987654321"
 *                     topic: "Reunión de Proyecto TradeConnect"
 *                     type: 2
 *                     start_time: "2023-10-01T15:00:00Z"
 *                     timezone: "America/Guatemala"
 *                     duration: 60
 *                     participant_count: 5
 *                     participant:
 *                       id: "participant_123"
 *                       user_id: "user_456"
 *                       user_name: "Juan Pérez"
 *                       join_time: "2023-10-01T15:05:00Z"
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
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
 *                   example: "Webhook de Zoom procesado exitosamente"
 *             examples:
 *               webhook_success:
 *                 summary: Webhook procesado correctamente
 *                 value:
 *                   success: true
 *                   message: "Webhook de Zoom procesado exitosamente"
 *       500:
 *         description: Error interno procesando webhook
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
 *                   example: "Error procesando webhook de Zoom"
 *                 error:
 *                   type: string
 *                   example: "WEBHOOK_PROCESSING_ERROR"
 */
router.post('/zoom', webhookController.handleZoomWebhook);

/**
 * @swagger
 * /api/webhooks/calendar:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook Google Calendar
 *     description: Endpoint para recibir notificaciones de Google Calendar sobre cambios en eventos
 *     parameters:
 *       - in: header
 *         name: X-Goog-Resource-ID
 *         schema:
 *           type: string
 *         description: ID del recurso de Calendar que cambió
 *         example: "resource_123456789"
 *       - in: header
 *         name: X-Goog-Channel-ID
 *         schema:
 *           type: string
 *         description: ID del canal de notificaciones
 *         example: "channel_987654321"
 *       - in: header
 *         name: X-Goog-Channel-Token
 *         schema:
 *           type: string
 *         description: Token de verificación del canal
 *         example: "token_abc123"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Google Calendar generalmente envía un body vacío, la información viene en headers
 *           examples:
 *             calendar_notification:
 *               summary: Notificación de cambio en Calendar
 *               value: {}
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
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
 *                   example: "Webhook de Calendar procesado exitosamente"
 *             examples:
 *               webhook_success:
 *                 summary: Webhook procesado correctamente
 *                 value:
 *                   success: true
 *                   message: "Webhook de Calendar procesado exitosamente"
 *       500:
 *         description: Error interno procesando webhook
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
 *                   example: "Error procesando webhook de Calendar"
 *                 error:
 *                   type: string
 *                   example: "WEBHOOK_PROCESSING_ERROR"
 */
router.post('/calendar', webhookController.handleCalendarWebhook);

export default router;