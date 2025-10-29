/**
 * @fileoverview Servicio de SMS para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para envío de mensajes SMS usando Twilio
 *
 * Archivo: backend/src/services/smsService.ts
 */

import twilio from 'twilio';
import { logger } from '../utils/logger';

interface SMSData {
  to: string;
  message: string;
  from?: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private client?: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken || !this.fromNumber) {
      logger.warn('Twilio credentials not configured. SMS service will be disabled.');
      return;
    }

    this.client = twilio(accountSid, authToken);
  }

  /**
   * Envía un SMS
   */
  async sendSMS(data: SMSData): Promise<SMSResult> {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured');
      }

      // Validar número de teléfono guatemalteco
      if (!this.isValidGuatemalaPhone(data.to)) {
        throw new Error('Número de teléfono guatemalteco inválido');
      }

      const message = await this.client.messages.create({
        body: data.message,
        from: data.from || this.fromNumber,
        to: this.formatPhoneNumber(data.to)
      });

      logger.info(`SMS sent successfully to ${data.to}, SID: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error sending SMS:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Envía SMS masivos
   */
  async sendBulkSMS(recipients: string[], message: string): Promise<{
    successful: number;
    failed: number;
    results: SMSResult[];
  }> {
    const results: SMSResult[] = [];
    let successful = 0;
    let failed = 0;

    // Procesar en lotes para evitar rate limits
    const batchSize = 10;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(recipient =>
        this.sendSMS({ to: recipient, message })
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
   * Verifica estado de un mensaje SMS
   */
  async getSMSStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured');
      }

      const message = await this.client.messages(messageId).fetch();

      return {
        status: message.status
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error getting SMS status:', error);
      return {
        status: 'unknown',
        error: errorMessage
      };
    }
  }

  /**
   * Valida formato de número de teléfono guatemalteco
   */
  private isValidGuatemalaPhone(phone: string): boolean {
    // Formatos aceptados:
    // +502 1234-5678
    // 502 1234-5678
    // 1234-5678
    // 12345678

    const guatemalaPhoneRegex = /^(\+502\s?)?(\d{4}-?\d{4}|\d{8})$/;
    return guatemalaPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Formatea número de teléfono para Twilio
   */
  private formatPhoneNumber(phone: string): string {
    // Asegurar formato internacional
    const cleaned = phone.replace(/\s|-/g, '');

    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    if (cleaned.startsWith('502')) {
      return `+${cleaned}`;
    }

    // Números locales, agregar código de país
    return `+502${cleaned}`;
  }

  /**
   * Verifica configuración de Twilio
   */
  async validateConfiguration(): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      if (!this.client) {
        return { valid: false, error: 'Twilio client not initialized' };
      }

      // Intentar obtener el balance de la cuenta
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();

      return { valid: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Obtiene estadísticas de uso de SMS
   */
  async getUsageStats(startDate: Date, endDate: Date): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    cost: number;
  }> {
    try {
      if (!this.client) {
        throw new Error('SMS service not configured');
      }

      // Obtener mensajes del período
      const messages = await this.client.messages.list({
        dateSentAfter: startDate,
        dateSentBefore: endDate,
        limit: 1000
      });

      let totalSent = 0;
      let totalDelivered = 0;
      let totalFailed = 0;
      let totalCost = 0;

      messages.forEach(message => {
        totalSent++;

        if (message.status === 'delivered') {
          totalDelivered++;
        } else if (['failed', 'undelivered'].includes(message.status)) {
          totalFailed++;
        }

        if (message.price) {
          totalCost += parseFloat(message.price);
        }
      });

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        cost: totalCost
      };

    } catch (error) {
      logger.error('Error getting SMS usage stats:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        cost: 0
      };
    }
  }

  /**
   * Envía SMS de prueba
   */
  async sendTestSMS(to: string): Promise<SMSResult> {
    const testMessage = `Test SMS from TradeConnect - ${new Date().toISOString()}`;

    return this.sendSMS({
      to,
      message: testMessage
    });
  }
}

export const smsService = new SMSService();
