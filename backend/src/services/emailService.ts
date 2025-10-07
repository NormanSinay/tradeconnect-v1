import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { EmailTemplate } from '../models/EmailTemplate';
import { Notification } from '../models/Notification';
import { NotificationLog } from '../models/NotificationLog';
import {
  EmailTemplateAttributes,
  NotificationAttachment,
  NotificationStatus,
  EmailTemplateType
} from '../types/notification.types';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

interface EmailVerificationData {
  firstName: string;
  verificationToken: string;
  verificationUrl: string;
}

interface PasswordResetData {
  firstName: string;
  resetToken: string;
  resetUrl: string;
}

interface OTPData {
  firstName: string;
  otpCode: string;
}

interface TemplateEmailData {
  to: string;
  templateCode: string;
  variables: Record<string, any>;
  attachments?: NotificationAttachment[];
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
  notificationId?: number;
}

interface BulkEmailData {
  recipients: Array<{
    email: string;
    variables: Record<string, any>;
  }>;
  templateCode: string;
  commonVariables?: Record<string, any>;
  attachments?: NotificationAttachment[];
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  name: string;
  maxConnections?: number;
  timeout?: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private smtpConfig: SMTPConfig;

  constructor() {
    this.smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
      },
      from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
      name: process.env.SMTP_NAME || 'TradeConnect',
      maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5'),
      timeout: parseInt(process.env.SMTP_TIMEOUT || '30000')
    };

    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: this.smtpConfig.auth,
      pool: true,
      maxConnections: this.smtpConfig.maxConnections,
      rateLimit: 10 // 10 emails por segundo
    });
  }

  async sendEmailVerification(to: string, data: EmailVerificationData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
        to,
        subject: 'Verifica tu cuenta - TradeConnect',
        html: `
          <h1>¡Bienvenido a TradeConnect, ${data.firstName}!</h1>
          <p>Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
          <a href="${data.verificationUrl}">Verificar Email</a>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no solicitaste esta cuenta, ignora este mensaje.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email verification sent to ${to}`);
    } catch (error) {
      logger.error('Error sending email verification:', error);
      throw error;
    }
  }

  async sendPasswordReset(to: string, data: PasswordResetData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
        to,
        subject: 'Restablece tu contraseña - TradeConnect',
        html: `
          <h1>Restablece tu contraseña, ${data.firstName}</h1>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${data.resetUrl}">Restablecer Contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendOTP(to: string, data: OTPData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
        to,
        subject: 'Código de verificación 2FA - TradeConnect',
        html: `
          <h1>Verificación de dos factores</h1>
          <p>Hola ${data.firstName},</p>
          <p>Tu código de verificación de dos factores es:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${data.otpCode}
          </div>
          <p>Este código expirará en 5 minutos.</p>
          <p>Si no solicitaste este código, ignora este mensaje.</p>
          <p style="color: #666; font-size: 12px;">TradeConnect - Plataforma E-commerce</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`2FA OTP sent to ${to}`);
    } catch (error) {
      logger.error('Error sending 2FA OTP:', error);
      throw error;
    }
  }

  // ====================================================================
  // NUEVOS MÉTODOS PARA PLANTILLAS Y TRACKING
  // ====================================================================

  /**
   * Envía email usando plantilla
   */
  async sendTemplateEmail(data: TemplateEmailData): Promise<void> {
    try {
      const template = await EmailTemplate.findActiveByCode(data.templateCode);
      if (!template) {
        throw new Error(`Template ${data.templateCode} not found or inactive`);
      }

      const rendered = template.render(data.variables);

      // Agregar tracking si es transaccional
      let htmlContent = rendered.html;
      let trackingPixel = '';
      let unsubscribeLink = '';

      if (template.type === EmailTemplateType.TRANSACTIONAL) {
        // Agregar pixel de tracking
        if (data.notificationId) {
          const trackingToken = this.generateTrackingToken(data.notificationId, 'open');
          trackingPixel = `<img src="${process.env.BASE_URL}/api/notifications/track/open/${trackingToken}" width="1" height="1" style="display:none;" alt="" />`;
        }
      } else if (template.type === EmailTemplateType.PROMOTIONAL) {
        // Agregar link de unsubscribe
        const unsubscribeToken = this.generateUnsubscribeToken(data.to);
        unsubscribeLink = `<p style="font-size: 12px; color: #666;">
          <a href="${process.env.BASE_URL}/api/notifications/unsubscribe/${unsubscribeToken}">Darse de baja</a>
        </p>`;
      }

      // Reemplazar enlaces con tracking
      htmlContent = this.addLinkTracking(htmlContent, data.notificationId);

      const mailOptions: any = {
        from: `"${this.smtpConfig.name}" <${this.smtpConfig.from}>`,
        to: data.to,
        subject: rendered.subject,
        html: htmlContent + trackingPixel + unsubscribeLink,
        priority: data.priority || 'normal'
      };

      // Agregar attachments si existen
      if (data.attachments && data.attachments.length > 0) {
        mailOptions.attachments = data.attachments.map(att => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType
        }));
      }

      await this.transporter.sendMail(mailOptions);

      // Actualizar estado de notificación si existe
      if (data.notificationId) {
        await this.updateNotificationStatus(data.notificationId, NotificationStatus.SENT);
        await NotificationLog.logSendAttempt(data.notificationId, true);
      }

      logger.info(`Template email sent to ${data.to} using ${data.templateCode}`);
    } catch (error) {
      logger.error('Error sending template email:', error);

      if (data.notificationId) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.updateNotificationStatus(data.notificationId, NotificationStatus.FAILED, errorMessage);
        await NotificationLog.logSendAttempt(data.notificationId, false, { error: errorMessage });
      }

      throw error;
    }
  }

  /**
   * Envía emails masivos usando plantilla
   */
  async sendBulkTemplateEmails(data: BulkEmailData): Promise<void> {
    const batchSize = 50; // Procesar en lotes para evitar sobrecarga

    for (let i = 0; i < data.recipients.length; i += batchSize) {
      const batch = data.recipients.slice(i, i + batchSize);

      const promises = batch.map(recipient => {
        const variables = { ...data.commonVariables, ...recipient.variables };
        return this.sendTemplateEmail({
          to: recipient.email,
          templateCode: data.templateCode,
          variables,
          attachments: data.attachments,
          priority: data.priority
        });
      });

      await Promise.allSettled(promises);

      // Pequeña pausa entre lotes para no sobrecargar
      if (i + batchSize < data.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`Bulk email campaign completed: ${data.recipients.length} recipients`);
  }

  /**
   * Genera token de tracking para aperturas
   */
  private generateTrackingToken(notificationId: number, action: string): string {
    const payload = `${notificationId}:${action}:${Date.now()}`;
    return crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16);
  }

  /**
   * Genera token de unsubscribe
   */
  private generateUnsubscribeToken(email: string): string {
    const payload = `${email}:${Date.now()}`;
    return crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16);
  }

  /**
   * Agrega tracking a enlaces en el HTML
   */
  private addLinkTracking(html: string, notificationId?: number): string {
    if (!notificationId) return html;

    // Reemplazar href con tracking
    return html.replace(
      /href="([^"]+)"/g,
      (match, url) => {
        const trackingToken = this.generateTrackingToken(notificationId, 'click');
        const trackingUrl = `${process.env.BASE_URL}/api/notifications/track/click/${trackingToken}/${encodeURIComponent(url)}`;
        return `href="${trackingUrl}"`;
      }
    );
  }

  /**
   * Actualiza estado de notificación
   */
  private async updateNotificationStatus(
    notificationId: number,
    status: NotificationStatus,
    errorMessage?: string
  ): Promise<void> {
    const notification = await Notification.findByPk(notificationId);
    if (notification) {
      if (status === NotificationStatus.SENT) {
        await notification.markAsSent();
      } else if (status === NotificationStatus.FAILED) {
        await notification.markAsFailed(errorMessage);
      }
    }
  }

  /**
   * Valida configuración SMTP
   */
  async validateSMTPConfig(): Promise<{ valid: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { valid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Obtiene estadísticas de envío
   */
  async getEmailStats(startDate: Date, endDate: Date): Promise<{
    sent: number;
    delivered: number;
    failed: number;
    openRate: number;
    clickRate: number;
  }> {
    // Esta implementación requeriría consultas a la base de datos
    // Por simplicidad, retornamos estructura básica
    return {
      sent: 0,
      delivered: 0,
      failed: 0,
      openRate: 0,
      clickRate: 0
    };
  }

  /**
   * Envía email de prueba
   */
  async sendTestEmail(to: string, templateCode?: string): Promise<void> {
    const testData = {
      firstName: 'Usuario de Prueba',
      verificationUrl: `${process.env.BASE_URL}/verify/test`,
      resetUrl: `${process.env.BASE_URL}/reset/test`,
      otpCode: '123456'
    };

    if (templateCode) {
      await this.sendTemplateEmail({
        to,
        templateCode,
        variables: testData
      });
    } else {
      // Enviar email básico de prueba
      await this.transporter.sendMail({
        from: `"${this.smtpConfig.name}" <${this.smtpConfig.from}>`,
        to,
        subject: 'Email de Prueba - TradeConnect',
        html: `
          <h1>Email de Prueba</h1>
          <p>Este es un email de prueba del sistema de notificaciones de TradeConnect.</p>
          <p>Si recibiste este email, la configuración SMTP está funcionando correctamente.</p>
          <p>Fecha de envío: ${new Date().toISOString()}</p>
        `
      });
    }

    logger.info(`Test email sent to ${to}`);
  }
}

export const emailService = new EmailService();