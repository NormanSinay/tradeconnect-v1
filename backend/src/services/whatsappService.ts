/**
 * @fileoverview Servicio de WhatsApp para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para envío de mensajes WhatsApp usando 360Dialog API
 *
 * Archivo: backend/src/services/whatsappService.ts
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface WhatsAppData {
  to: string;
  message?: string;
  template?: {
    name: string;
    language: string;
    components: any[];
  };
}

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppService {
  private client?: AxiosInstance;
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';

    if (!this.apiUrl || !this.apiToken) {
      logger.warn('WhatsApp API credentials not configured. WhatsApp service will be disabled.');
      return;
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'D360-API-KEY': this.apiToken,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Envía un mensaje de WhatsApp
   */
  async sendWhatsApp(data: WhatsAppData): Promise<WhatsAppResult> {
    try {
      if (!this.client) {
        throw new Error('WhatsApp service not configured');
      }

      // Validar número de teléfono
      if (!this.isValidPhoneNumber(data.to)) {
        throw new Error('Número de teléfono inválido');
      }

      let payload: any;

      if (data.template) {
        // Enviar mensaje de plantilla
        payload = {
          to: this.formatPhoneNumber(data.to),
          type: 'template',
          template: data.template
        };
      } else {
        // Enviar mensaje de texto
        payload = {
          to: this.formatPhoneNumber(data.to),
          type: 'text',
          text: {
            body: data.message
          }
        };
      }

      const response = await this.client.post('/messages', payload);

      if (response.data?.messages?.[0]?.id) {
        logger.info(`WhatsApp message sent successfully to ${data.to}, ID: ${response.data.messages[0].id}`);
        return {
          success: true,
          messageId: response.data.messages[0].id
        };
      } else {
        throw new Error('Invalid response from WhatsApp API');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      logger.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Envía mensajes de WhatsApp masivos
   */
  async sendBulkWhatsApp(recipients: string[], message: string): Promise<{
    successful: number;
    failed: number;
    results: WhatsAppResult[];
  }> {
    const results: WhatsAppResult[] = [];
    let successful = 0;
    let failed = 0;

    // Procesar en lotes para evitar rate limits
    const batchSize = 10;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(recipient =>
        this.sendWhatsApp({ to: recipient, message })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            successful++;
          } else {
            failed++;
          }
        } else {
          failed++;
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Pausa entre lotes
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { successful, failed, results };
  }

  /**
   * Verifica estado de un mensaje WhatsApp
   */
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      if (!this.client) {
        throw new Error('WhatsApp service not configured');
      }

      const response = await this.client.get(`/messages/${messageId}`);

      return {
        status: response.data?.status || 'unknown'
      };

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      logger.error('Error getting WhatsApp message status:', error);
      return {
        status: 'unknown',
        error: errorMessage
      };
    }
  }

  /**
   * Valida formato de número de teléfono
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Formatos aceptados para Guatemala:
    // +502 1234-5678
    // 502 1234-5678
    // 1234-5678
    // 12345678

    const guatemalaPhoneRegex = /^(\+502\s?)?(\d{4}-?\d{4}|\d{8})$/;
    return guatemalaPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Formatea número de teléfono para WhatsApp API
   */
  private formatPhoneNumber(phone: string): string {
    // Asegurar formato internacional sin +
    const cleaned = phone.replace(/\s|-/g, '');

    if (cleaned.startsWith('+')) {
      return cleaned.substring(1);
    }

    if (cleaned.startsWith('502')) {
      return cleaned;
    }

    // Números locales, agregar código de país
    return `502${cleaned}`;
  }

  /**
   * Verifica configuración de WhatsApp API
   */
  async validateConfiguration(): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      if (!this.client) {
        return { valid: false, error: 'WhatsApp client not initialized' };
      }

      // Intentar obtener información de la cuenta
      const response = await this.client.get('/configs');

      if (response.status === 200) {
        return { valid: true };
      } else {
        return { valid: false, error: 'Invalid API response' };
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Obtiene estadísticas de uso de WhatsApp
   */
  async getUsageStats(startDate: Date, endDate: Date): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    cost: number;
  }> {
    // La API de 360Dialog no proporciona estadísticas directas
    // Esto requeriría implementar webhooks para tracking
    logger.warn('WhatsApp usage stats not implemented - requires webhook integration');

    return {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      cost: 0
    };
  }

  /**
   * Envía mensaje de WhatsApp de prueba
   */
  async sendTestWhatsApp(to: string): Promise<WhatsAppResult> {
    const testMessage = `Test WhatsApp message from TradeConnect - ${new Date().toISOString()}`;

    return this.sendWhatsApp({
      to,
      message: testMessage
    });
  }

  /**
   * Envía mensaje de plantilla de WhatsApp
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string = 'es',
    components: any[] = []
  ): Promise<WhatsAppResult> {
    return this.sendWhatsApp({
      to,
      template: {
        name: templateName,
        language,
        components
      }
    });
  }
}

export const whatsappService = new WhatsAppService();
