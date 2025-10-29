/**
 * @fileoverview Controlador de Webhooks para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Controladores HTTP para procesamiento de webhooks de pasarelas de pago
 */

import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { paypalService } from '../services/paypalService';
import { stripeService } from '../services/stripeService';
import { neonetService } from '../services/neonetService';
import { bamService } from '../services/bamService';
import { PaymentGateway } from '../utils/constants';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Controlador para manejo de webhooks de pasarelas de pago
 */
export class WebhookController {

  /**
   * @swagger
   * /api/webhooks/paypal:
   *   post:
   *     tags: [Webhooks]
   *     summary: Webhook de PayPal
   *     description: Procesa notificaciones de PayPal
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook procesado exitosamente
   *       400:
   *         description: Webhook inválido
   *       500:
   *         description: Error interno del servidor
   */
  async handlePayPalWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      const signature = req.get('paypal-transmission-signature') ||
                       req.get('PAYPAL-TRANSMISSION-SIGNATURE');
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;

      // Verificar firma si está configurada
      if (webhookId && signature) {
        const rawBody = JSON.stringify(payload);
        const isValid = await paypalService.validateWebhookSignature(rawBody, signature, webhookId);

        if (!isValid) {
          logger.warn('Invalid PayPal webhook signature');
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Firma de webhook inválida',
            error: 'INVALID_SIGNATURE'
          });
          return;
        }
      }

      // Procesar webhook
      const eventData = paypalService.processWebhook(payload);

      if (eventData.transactionId) {
        // Confirmar pago usando el servicio principal
        const result = await paymentService.confirmPayment({
          transactionId: eventData.transactionId,
          status: eventData.status as any,
          gatewayResponse: payload
        });

        if (!result.success) {
          logger.error('Failed to confirm payment from PayPal webhook', {
            transactionId: eventData.transactionId,
            error: result.error
          });
        }
      }

      // Responder inmediatamente a PayPal
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Webhook procesado exitosamente'
      });

    } catch (error) {
      logger.error('Error processing PayPal webhook:', error);
      // Para webhooks, siempre responder 200 para evitar reintentos
      res.status(HTTP_STATUS.OK).json({
        success: false,
        message: 'Error procesando webhook',
        error: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/webhooks/stripe:
   *   post:
   *     tags: [Webhooks]
   *     summary: Webhook de Stripe
   *     description: Procesa notificaciones de Stripe
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook procesado exitosamente
   *       400:
   *         description: Webhook inválido
   *       500:
   *         description: Error interno del servidor
   */
  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      const signature = req.get('stripe-signature') || req.get('Stripe-Signature');

      // Verificar firma
      if (signature) {
        const rawBody = JSON.stringify(payload);
        const isValid = stripeService.validateWebhookSignature(rawBody, signature);

        if (!isValid) {
          logger.warn('Invalid Stripe webhook signature');
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Firma de webhook inválida',
            error: 'INVALID_SIGNATURE'
          });
          return;
        }
      }

      // Procesar webhook
      const eventData = stripeService.processWebhook(payload);

      if (eventData.transactionId) {
        // Confirmar pago usando el servicio principal
        const result = await paymentService.confirmPayment({
          transactionId: eventData.transactionId,
          status: eventData.status as any,
          gatewayResponse: payload
        });

        if (!result.success) {
          logger.error('Failed to confirm payment from Stripe webhook', {
            transactionId: eventData.transactionId,
            error: result.error
          });
        }
      }

      // Responder inmediatamente a Stripe
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Webhook procesado exitosamente'
      });

    } catch (error) {
      logger.error('Error processing Stripe webhook:', error);
      res.status(HTTP_STATUS.OK).json({
        success: false,
        message: 'Error procesando webhook',
        error: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/webhooks/neonet:
   *   post:
   *     tags: [Webhooks]
   *     summary: Webhook de NeoNet
   *     description: Procesa notificaciones de NeoNet
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook procesado exitosamente
   *       400:
   *         description: Webhook inválido
   *       500:
   *         description: Error interno del servidor
   */
  async handleNeoNetWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      // Para NeoNet, verificar firma si está disponible
      const signature = req.get('x-neonet-signature');
      if (signature) {
        // Implementar verificación de firma de NeoNet
        // const isValid = this.verifyNeoNetSignature(payload, signature);
        // if (!isValid) { ... }
      }

      // Procesar webhook
      const eventData = neonetService.processWebhook(payload);

      if (eventData.transactionId) {
        // Confirmar pago usando el servicio principal
        const result = await paymentService.confirmPayment({
          transactionId: eventData.transactionId,
          status: eventData.status as any,
          gatewayResponse: payload
        });

        if (!result.success) {
          logger.error('Failed to confirm payment from NeoNet webhook', {
            transactionId: eventData.transactionId,
            error: result.error
          });
        }
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Webhook procesado exitosamente'
      });

    } catch (error) {
      logger.error('Error processing NeoNet webhook:', error);
      res.status(HTTP_STATUS.OK).json({
        success: false,
        message: 'Error procesando webhook',
        error: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/webhooks/bam:
   *   post:
   *     tags: [Webhooks]
   *     summary: Webhook de BAM
   *     description: Procesa notificaciones de BAM
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook procesado exitosamente
   *       400:
   *         description: Webhook inválido
   *       500:
   *         description: Error interno del servidor
   */
  async handleBamWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      // Para BAM, verificar firma si está disponible
      const signature = req.get('x-bam-signature');
      if (signature) {
        // Implementar verificación de firma de BAM
        // const isValid = this.verifyBamSignature(payload, signature);
        // if (!isValid) { ... }
      }

      // Procesar webhook
      const eventData = bamService.processWebhook(payload);

      if (eventData.transactionId) {
        // Confirmar pago usando el servicio principal
        const result = await paymentService.confirmPayment({
          transactionId: eventData.transactionId,
          status: eventData.status as any,
          gatewayResponse: payload
        });

        if (!result.success) {
          logger.error('Failed to confirm payment from BAM webhook', {
            transactionId: eventData.transactionId,
            error: result.error
          });
        }
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Webhook procesado exitosamente'
      });

    } catch (error) {
      logger.error('Error processing BAM webhook:', error);
      res.status(HTTP_STATUS.OK).json({
        success: false,
        message: 'Error procesando webhook',
        error: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/webhooks/zoom:
   *   post:
   *     tags: [Webhooks]
   *     summary: Webhook de Zoom
   *     description: Procesa notificaciones de Zoom (para eventos híbridos)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook procesado exitosamente
   *       500:
   *         description: Error interno del servidor
   */
  async handleZoomWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      // Procesar eventos de Zoom (participantes, grabaciones, etc.)
      logger.info('Zoom webhook received', {
        event: payload.event,
        meetingId: payload.payload?.object?.id
      });

      // Aquí se implementaría la lógica específica de Zoom
      // Por ahora solo loggeamos

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Webhook de Zoom procesado exitosamente'
      });

    } catch (error) {
      logger.error('Error processing Zoom webhook:', error);
      res.status(HTTP_STATUS.OK).json({
        success: false,
        message: 'Error procesando webhook de Zoom',
        error: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * @swagger
   * /api/webhooks/calendar:
   *   post:
   *     tags: [Webhooks]
   *     summary: Webhook de Google Calendar
   *     description: Procesa notificaciones de Google Calendar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook procesado exitosamente
   *       500:
   *         description: Error interno del servidor
   */
  async handleCalendarWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      // Procesar eventos de Google Calendar
      logger.info('Google Calendar webhook received', {
        resourceId: req.get('X-Goog-Resource-ID'),
        channelId: req.get('X-Goog-Channel-ID')
      });

      // Aquí se implementaría la lógica específica de Google Calendar
      // Por ahora solo loggeamos

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Webhook de Calendar procesado exitosamente'
      });

    } catch (error) {
      logger.error('Error processing Calendar webhook:', error);
      res.status(HTTP_STATUS.OK).json({
        success: false,
        message: 'Error procesando webhook de Calendar',
        error: 'WEBHOOK_PROCESSING_ERROR'
      });
    }
  }

  /**
   * Método genérico para procesar webhooks con idempotencia
   */
  private async processWebhookWithIdempotency(
    webhookId: string,
    processor: () => Promise<void>
  ): Promise<void> {
    // Implementar lógica de idempotencia usando Redis o base de datos
    // Para evitar procesar el mismo webhook múltiples veces

    try {
      // Verificar si el webhook ya fue procesado
      // const processed = await redis.get(`webhook:${webhookId}`);
      // if (processed) return;

      // Procesar webhook
      await processor();

      // Marcar como procesado
      // await redis.setex(`webhook:${webhookId}`, 3600, 'processed'); // 1 hora

    } catch (error) {
      logger.error('Error in idempotent webhook processing:', error);
      throw error;
    }
  }
}

export const webhookController = new WebhookController();
