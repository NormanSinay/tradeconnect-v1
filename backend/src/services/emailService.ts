import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { EmailTemplate } from '../models/EmailTemplate';
import { Notification } from '../models/Notification';
import { NotificationLog } from '../models/NotificationLog';
import { EmailCampaign } from '../models/EmailCampaign';
import { CampaignRecipient } from '../models/CampaignRecipient';
import { CampaignEmail } from '../models/CampaignEmail';
import { CampaignSchedule } from '../models/CampaignSchedule';
import {
  EmailTemplateAttributes,
  NotificationAttachment,
  NotificationStatus,
  EmailTemplateType,
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

interface CampaignEmailData {
  campaignId: number;
  recipientId: number;
  to: string;
  templateCode: string;
  variables: Record<string, any>;
  attachments?: NotificationAttachment[];
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
}

interface SendCampaignData {
  campaignId: number;
  batchSize?: number;
  delayBetweenBatches?: number;
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
        pass: process.env.SMTP_PASSWORD || '',
      },
      from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
      name: process.env.SMTP_NAME || 'TradeConnect',
      maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5'),
      timeout: parseInt(process.env.SMTP_TIMEOUT || '30000'),
    };

    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: this.smtpConfig.auth,
      pool: true,
      maxConnections: this.smtpConfig.maxConnections,
      rateLimit: 10, // 10 emails por segundo
    });
  }

  async sendEmailVerification(
    to: string,
    data: EmailVerificationData
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
        to,
        subject: 'Verifica tu cuenta - TradeConnect',
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
      
      <div style="background: linear-gradient(90deg, #007BFF, #00C6FF); color: white; padding: 20px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Bienvenido a <span style="font-weight: bold;">TradeConnect</span></h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px;">Hola <strong>${data.firstName}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Gracias por registrarte en <strong>TradeConnect</strong>. Para completar tu registro y activar tu cuenta, 
          por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationUrl}" 
             style="background: #007BFF; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; 
                    font-size: 16px; display: inline-block; font-weight: bold;">
             Verificar Email
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">
          Este enlace expirará en <strong>24 horas</strong>.
        </p>
        <p style="font-size: 14px; color: #888;">
          Si no solicitaste esta cuenta, puedes ignorar este mensaje.
        </p>
      </div>

      <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
      </div>

    </div>
  </div>
`,
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
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: linear-gradient(90deg, #007BFF, #00C6FF); color: white; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Restablecer Contraseña</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hola <strong>${data.firstName}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Hemos recibido una solicitud para restablecer tu contraseña. 
            Para continuar, haz clic en el siguiente botón:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #007BFF; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; 
                      font-size: 16px; display: inline-block; font-weight: bold;">
               Restablecer Contraseña
            </a>
          </div>

          <p style="font-size: 14px; color: #555;">
            Este enlace expirará en <strong>1 hora</strong>.
          </p>
          <p style="font-size: 14px; color: #888;">
            Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña permanecerá igual.
          </p>
        </div>

        <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
        </div>

      </div>
    </div>
  `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, data: { firstName: string; email: string; tempPassword?: string }): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
        to,
        subject: 'Bienvenido a TradeConnect',
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

      <div style="background: linear-gradient(90deg, #007BFF, #00C6FF); color: white; padding: 20px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">¡Bienvenido a <span style="font-weight: bold;">TradeConnect</span>!</h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px;">Hola <strong>${data.firstName}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Tu cuenta ha sido creada exitosamente en <strong>TradeConnect</strong>.
          Ya puedes acceder a nuestra plataforma con las siguientes credenciales:
        </p>

        <div style="background-color: #f4f4f4; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
          ${data.tempPassword ? `<p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> ${data.tempPassword}</p>` : '<p style="margin: 5px 0; color: #666;"><em>Utiliza la contraseña que configuraste durante el registro</em></p>'}
        </div>

        ${data.tempPassword ? `
        <p style="font-size: 14px; color: #d9534f; background-color: #f9f2f4; padding: 10px; border-left: 4px solid #d9534f; border-radius: 4px;">
          <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
        </p>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://tradeconnect.gt'}/login"
             style="background: #007BFF; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px;
                    font-size: 16px; display: inline-block; font-weight: bold;">
             Iniciar Sesión
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
      </div>

      <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
      </div>

    </div>
  </div>
`,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
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
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

        <div style="background: linear-gradient(90deg, #007BFF, #00C6FF); color: white; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Verificación de Dos Factores</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hola <strong>${data.firstName}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Tu código de verificación de dos factores es el siguiente:
          </p>

          <div style="background-color: #f4f4f4; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #007BFF;">
              ${data.otpCode}
            </span>
          </div>

          <p style="font-size: 14px; color: #555;">
            Este código expirará en <strong>5 minutos</strong>.
          </p>
          <p style="font-size: 14px; color: #888;">
            Si no solicitaste este código, puedes ignorar este mensaje.
          </p>
        </div>

        <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          TradeConnect - Plataforma E-commerce<br>
          © ${new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
        </div>

      </div>
    </div>
  `,
};

      await this.transporter.sendMail(mailOptions);
      logger.info(`2FA OTP sent to ${to}`);
    } catch (error) {
      logger.error('Error sending 2FA OTP:', error);
      throw error;
    }
  }

  async sendRegistrationConfirmation(to: string, data: {
    firstName: string;
    lastName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    registrationCode: string;
    isPendingPayment: boolean;
    paymentMethod?: string;
    amount?: number;
    isVirtual?: boolean;
    virtualLink?: string;
  }): Promise<void> {
    try {
      const isPending = data.isPendingPayment;
      const isBankTransfer = data.paymentMethod === 'bank_transfer';

      // Determinar qué ubicación mostrar según el estado del pago
      let locationDisplay = data.eventLocation;
      if (data.isVirtual && !isPending && data.virtualLink) {
        // Solo mostrar el link de Zoom si el pago está confirmado
        locationDisplay = `<a href="${data.virtualLink}" style="color: #6B1E22; text-decoration: underline;">${data.virtualLink}</a>`;
      } else if (data.isVirtual && isPending) {
        // Si es virtual pero el pago está pendiente, solo mostrar "Virtual"
        locationDisplay = 'Virtual (el link se enviará una vez confirmado el pago)';
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@tradeconnect.gt',
        to,
        subject: isPending
          ? `Inscripción Registrada - ${data.eventTitle}`
          : `Confirmación de Inscripción - ${data.eventTitle}`,
        html: `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px 0; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

        <div style="background: linear-gradient(90deg, #6B1E22, #8a2b30); color: white; padding: 20px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${isPending ? '¡Inscripción Registrada!' : '¡Inscripción Confirmada!'}</h1>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hola <strong>${data.firstName} ${data.lastName}</strong>,</p>

          ${isPending ? `
            <p style="font-size: 15px; line-height: 1.6;">
              Tu inscripción ha sido registrada exitosamente y está <strong style="color: #f0ad4e;">pendiente de pago</strong>.
            </p>

            ${isBankTransfer ? `
              <div style="background-color: #fff3cd; border-left: 4px solid #f0ad4e; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⏳ Pendiente de confirmación</strong><br>
                  Un ejecutivo se contactará contigo en las próximas 24 horas para proporcionarte los datos bancarios y completar el proceso de inscripción.
                </p>
              </div>
            ` : `
              <div style="background-color: #fff3cd; border-left: 4px solid #f0ad4e; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⚠️ Importante:</strong> Tu inscripción está pendiente de pago. Una vez completado el pago, recibirás tu código QR de acceso${data.isVirtual ? ' y el link de acceso al evento virtual' : ''}.
                </p>
              </div>
            `}
          ` : `
            <p style="font-size: 15px; line-height: 1.6;">
              ¡Gracias por tu inscripción! Tu pago ha sido procesado exitosamente y tu inscripción está <strong style="color: #28a745;">confirmada</strong>.
            </p>

            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #155724;">
                <strong>✓ Pago confirmado</strong><br>
                Tu inscripción ha sido confirmada. ${data.isVirtual ? 'Puedes acceder al evento usando el link más abajo.' : 'Recibirás tu código QR de acceso próximamente.'}
              </p>
            </div>
          `}

          <div style="background-color: #f4f4f4; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #6B1E22; font-size: 18px;">Detalles del Evento</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Evento:</strong></td>
                <td style="padding: 8px 0;">${data.eventTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Fecha:</strong></td>
                <td style="padding: 8px 0;">${data.eventDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Hora:</strong></td>
                <td style="padding: 8px 0;">${data.eventTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>${data.isVirtual ? 'Acceso' : 'Ubicación'}:</strong></td>
                <td style="padding: 8px 0;">${locationDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Código de Inscripción:</strong></td>
                <td style="padding: 8px 0;"><strong>${data.registrationCode}</strong></td>
              </tr>
              ${data.amount ? `
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Monto:</strong></td>
                <td style="padding: 8px 0;">GTQ ${data.amount.toFixed(2)}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${isBankTransfer && isPending ? `
            <div style="background-color: #e7f3ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #004085; font-size: 16px;">Próximos pasos:</h4>
              <ol style="margin: 0; padding-left: 20px; color: #004085;">
                <li style="margin: 8px 0;">Un ejecutivo se contactará contigo en las próximas 24 horas</li>
                <li style="margin: 8px 0;">Te proporcionaremos los datos bancarios para realizar el depósito o transferencia</li>
                <li style="margin: 8px 0;">Una vez confirmado el pago, recibirás tu código QR de acceso${data.isVirtual ? ' y el link del evento' : ''}</li>
              </ol>
            </div>
          ` : ''}

          ${!isPending && data.isVirtual && data.virtualLink ? `
            <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h4 style="margin-top: 0; color: #1565c0; font-size: 16px;">🎥 Acceso al Evento Virtual</h4>
              <p style="color: #1976d2; margin: 15px 0;">Tu inscripción está confirmada. Únete al evento usando el siguiente enlace:</p>
              <a href="${data.virtualLink}"
                 style="background: #1976d2; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px;
                        font-size: 16px; display: inline-block; font-weight: bold; margin: 10px 0;">
                 🔗 Unirse al Evento
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 15px;">
                Guarda este enlace para acceder el día del evento
              </p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/dashboard/user"
               style="background: #6B1E22; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px;
                      font-size: 16px; display: inline-block; font-weight: bold;">
               Ver Mis Inscripciones
            </a>
          </div>

          <p style="font-size: 14px; color: #555; line-height: 1.6;">
            Guarda este correo para futuras referencias. Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>

        <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          TradeConnect - Plataforma de Gestión de Eventos<br>
          © ${new Date().getFullYear()} TradeConnect. Todos los derechos reservados.
        </div>

      </div>
    </div>
  `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Registration confirmation email sent to ${to} for event ${data.eventTitle}`);
    } catch (error) {
      logger.error('Error sending registration confirmation email:', error);
      // No lanzar el error para no bloquear el flujo de inscripción
      // Solo registramos el error
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
          const trackingToken = this.generateTrackingToken(
            data.notificationId,
            'open'
          );
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
        priority: data.priority || 'normal',
      };

      // Agregar attachments si existen
      if (data.attachments && data.attachments.length > 0) {
        mailOptions.attachments = data.attachments.map(att => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType,
        }));
      }

      await this.transporter.sendMail(mailOptions);

      // Actualizar estado de notificación si existe
      if (data.notificationId) {
        await this.updateNotificationStatus(
          data.notificationId,
          NotificationStatus.SENT
        );
        await NotificationLog.logSendAttempt(data.notificationId, true);
      }

      logger.info(
        `Template email sent to ${data.to} using ${data.templateCode}`
      );
    } catch (error) {
      logger.error('Error sending template email:', error);

      if (data.notificationId) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        await this.updateNotificationStatus(
          data.notificationId,
          NotificationStatus.FAILED,
          errorMessage
        );
        await NotificationLog.logSendAttempt(data.notificationId, false, {
          error: errorMessage,
        });
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
          priority: data.priority,
        });
      });

      await Promise.allSettled(promises);

      // Pequeña pausa entre lotes para no sobrecargar
      if (i + batchSize < data.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(
      `Bulk email campaign completed: ${data.recipients.length} recipients`
    );
  }

  /**
   * Genera token de tracking para aperturas
   */
  private generateTrackingToken(
    notificationId: number,
    action: string
  ): string {
    const payload = `${notificationId}:${action}:${Date.now()}`;
    return crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Genera token de unsubscribe
   */
  private generateUnsubscribeToken(email: string): string {
    const payload = `${email}:${Date.now()}`;
    return crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Agrega tracking a enlaces en el HTML
   */
  private addLinkTracking(html: string, notificationId?: number): string {
    if (!notificationId) return html;

    // Reemplazar href con tracking
    return html.replace(/href="([^"]+)"/g, (match, url) => {
      const trackingToken = this.generateTrackingToken(notificationId, 'click');
      const trackingUrl = `${process.env.BASE_URL}/api/notifications/track/click/${trackingToken}/${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    });
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Obtiene estadísticas de envío
   */
  async getEmailStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
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
      clickRate: 0,
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
      otpCode: '123456',
    };

    if (templateCode) {
      await this.sendTemplateEmail({
        to,
        templateCode,
        variables: testData,
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
        `,
      });
    }

    logger.info(`Test email sent to ${to}`);
  }

  // ====================================================================
  // MÉTODOS PARA CAMPAÑAS DE EMAIL MARKETING
  // ====================================================================

  /**
   * Envía un email de campaña con tracking completo
   */
  async sendCampaignEmail(data: CampaignEmailData): Promise<string> {
    try {
      // Obtener campaña y destinatario
      const campaign = await EmailCampaign.findByPk(data.campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${data.campaignId} not found`);
      }

      const recipient = await CampaignRecipient.findByPk(data.recipientId);
      if (!recipient) {
        throw new Error(`Recipient ${data.recipientId} not found`);
      }

      // Obtener plantilla
      const template = await EmailTemplate.findActiveByCode(data.templateCode);
      if (!template) {
        throw new Error(`Template ${data.templateCode} not found or inactive`);
      }

      // Renderizar contenido
      const rendered = template.render(data.variables);

      // Generar messageId único para tracking
      const messageId = this.generateMessageId(data.campaignId, data.recipientId);

      // Preparar contenido con tracking
      let htmlContent = rendered.html;
      let trackingPixel = '';
      let unsubscribeLink = '';

      // Agregar tracking de apertura si está habilitado
      if (campaign.trackOpens) {
        const trackingToken = this.generateCampaignTrackingToken(
          data.campaignId,
          data.recipientId,
          'open'
        );
        trackingPixel = `<img src="${process.env.BASE_URL}/api/campaigns/track/open/${trackingToken}" width="1" height="1" style="display:none;" alt="" />`;
      }

      // Agregar tracking a enlaces si está habilitado
      if (campaign.trackClicks) {
        htmlContent = this.addCampaignLinkTracking(htmlContent, data.campaignId, data.recipientId);
      }

      // Agregar link de unsubscribe para emails promocionales
      if (template.type === EmailTemplateType.PROMOTIONAL) {
        const unsubscribeToken = this.generateCampaignUnsubscribeToken(data.to);
        unsubscribeLink = `<p style="font-size: 12px; color: #666;">
          <a href="${process.env.BASE_URL}/api/campaigns/unsubscribe/${unsubscribeToken}">Darse de baja</a>
        </p>`;
      }

      // Preparar opciones de email
      const mailOptions: any = {
        from: `"${campaign.fromName}" <${campaign.fromEmail}>`,
        to: data.to,
        subject: rendered.subject,
        html: htmlContent + trackingPixel + unsubscribeLink,
        messageId: `<${messageId}@${process.env.SMTP_DOMAIN || 'tradeconnect.gt'}>`,
        priority: data.priority || 'normal',
      };

      // Agregar reply-to si está configurado
      if (campaign.replyToEmail) {
        mailOptions.replyTo = campaign.replyToEmail;
      }

      // Agregar attachments si existen
      if (data.attachments && data.attachments.length > 0) {
        mailOptions.attachments = data.attachments.map(att => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType,
        }));
      }

      // Crear registro de email de campaña
      const campaignEmail = await CampaignEmail.create({
        campaignId: data.campaignId,
        recipientId: data.recipientId,
        messageId,
        status: require('../models/CampaignEmail').CampaignEmailStatus.QUEUED,
        openCount: 0,
        clickCount: 0,
        retryCount: 0,
        maxRetries: 3
      });

      // Enviar email
      const info = await this.transporter.sendMail(mailOptions);

      // Actualizar estado del email de campaña
      await campaignEmail.markAsSent(messageId);

      // Actualizar estadísticas de campaña
      await campaign.incrementSentCount();

      // Actualizar estado del destinatario
      await recipient.markAsSent();

      logger.info(
        `Campaign email sent: campaign=${data.campaignId}, recipient=${data.recipientId}, messageId=${messageId}`
      );

      return messageId;
    } catch (error) {
      logger.error('Error sending campaign email:', error);

      // Marcar como fallido si existe el registro
      if (data.campaignId && data.recipientId) {
        try {
          const campaignEmail = await CampaignEmail.findOne({
            where: {
              campaignId: data.campaignId,
              recipientId: data.recipientId
            }
          });

          if (campaignEmail) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await campaignEmail.markAsFailed(errorMessage);
          }
        } catch (updateError) {
          logger.error('Error updating campaign email status:', updateError);
        }
      }

      throw error;
    }
  }

  /**
   * Envía una campaña completa
   */
  async sendCampaign(data: SendCampaignData): Promise<{
    totalSent: number;
    totalFailed: number;
    campaignId: number;
  }> {
    try {
      const campaign = await EmailCampaign.findByPk(data.campaignId);
      if (!campaign) {
        throw new Error(`Campaign ${data.campaignId} not found`);
      }

      if (!campaign.canSend) {
        throw new Error(`Campaign ${data.campaignId} cannot be sent (status: ${campaign.status})`);
      }

      // Marcar campaña como enviando
      await campaign.markAsSending();

      // Obtener destinatarios pendientes
      const batchSize = data.batchSize || campaign.batchSize || 50;
      const delayBetweenBatches = data.delayBetweenBatches || 1000;

      let totalSent = 0;
      let totalFailed = 0;

      let hasMoreRecipients = true;

      while (hasMoreRecipients) {
        // Obtener lote de destinatarios pendientes
        const recipients = await CampaignRecipient.findPendingByCampaign(
          data.campaignId,
          batchSize
        );

        if (recipients.length === 0) {
          hasMoreRecipients = false;
          break;
        }

        // Procesar lote
        const promises = recipients.map(async (recipient) => {
          try {
            // Combinar variables globales con variables del destinatario
            const variables = {
              ...campaign.variables,
              ...recipient.variables,
              recipient_email: recipient.email,
              recipient_first_name: recipient.firstName,
              recipient_last_name: recipient.lastName,
              recipient_full_name: recipient.fullName,
              campaign_name: campaign.name,
              campaign_id: campaign.id,
              unsubscribe_url: `${process.env.BASE_URL}/api/campaigns/unsubscribe/${this.generateCampaignUnsubscribeToken(recipient.email)}`
            };

            await this.sendCampaignEmail({
              campaignId: data.campaignId,
              recipientId: recipient.id,
              to: recipient.email,
              templateCode: campaign.templateCode || 'DEFAULT_CAMPAIGN',
              variables,
              priority: campaign.priority >= 8 ? 'HIGH' : campaign.priority >= 5 ? 'NORMAL' : 'LOW'
            });

            totalSent++;
          } catch (error) {
            logger.error(`Failed to send email to ${recipient.email}:`, error);
            totalFailed++;

            // Marcar destinatario como fallido
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await recipient.markAsBounced(errorMessage);
          }
        });

        // Esperar a que termine el lote
        await Promise.allSettled(promises);

        // Pausa entre lotes para no sobrecargar
        if (hasMoreRecipients) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      // Marcar campaña como completada
      await campaign.markAsCompleted();

      logger.info(
        `Campaign ${data.campaignId} completed: sent=${totalSent}, failed=${totalFailed}`
      );

      return {
        totalSent,
        totalFailed,
        campaignId: data.campaignId
      };
    } catch (error) {
      logger.error('Error sending campaign:', error);

      // Marcar campaña como fallida
      try {
        const campaign = await EmailCampaign.findByPk(data.campaignId);
        if (campaign) {
          await campaign.markAsFailed();
        }
      } catch (updateError) {
        logger.error('Error updating campaign status:', updateError);
      }

      throw error;
    }
  }

  /**
   * Procesa programaciones de campañas pendientes
   */
  async processScheduledCampaigns(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    try {
      const schedules = await CampaignSchedule.findDueSchedules();

      let processed = 0;
      let sent = 0;
      let failed = 0;

      for (const schedule of schedules) {
        try {
          processed++;

          // Enviar campaña
          const result = await this.sendCampaign({
            campaignId: schedule.campaignId,
            batchSize: 100,
            delayBetweenBatches: 2000
          });

          sent += result.totalSent;

          // Registrar ejecución de programación
          await schedule.recordExecution();

          logger.info(`Scheduled campaign ${schedule.campaignId} processed successfully`);
        } catch (error) {
          failed++;
          logger.error(`Failed to process scheduled campaign ${schedule.campaignId}:`, error);

          // Podríamos implementar lógica de reintentos aquí
        }
      }

      return { processed, sent, failed };
    } catch (error) {
      logger.error('Error processing scheduled campaigns:', error);
      throw error;
    }
  }

  /**
   * Genera ID único para mensaje
   */
  private generateMessageId(campaignId: number, recipientId: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `campaign-${campaignId}-recipient-${recipientId}-${timestamp}-${random}`;
  }

  /**
   * Genera token de tracking para campañas
   */
  private generateCampaignTrackingToken(
    campaignId: number,
    recipientId: number,
    action: string
  ): string {
    const payload = `${campaignId}:${recipientId}:${action}:${Date.now()}`;
    return crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Genera token de unsubscribe para campañas
   */
  private generateCampaignUnsubscribeToken(email: string): string {
    const payload = `campaign:${email}:${Date.now()}`;
    return crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Agrega tracking a enlaces en campañas
   */
  private addCampaignLinkTracking(
    html: string,
    campaignId: number,
    recipientId: number
  ): string {
    return html.replace(/href="([^"]+)"/g, (match, url) => {
      const trackingToken = this.generateCampaignTrackingToken(campaignId, recipientId, 'click');
      const trackingUrl = `${process.env.BASE_URL}/api/campaigns/track/click/${trackingToken}/${encodeURIComponent(url)}`;
      return `href="${trackingUrl}"`;
    });
  }

  /**
   * Registra evento de tracking de campaña
   */
  async trackCampaignEvent(
    token: string,
    eventType: 'open' | 'click',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Decodificar token (simplificado - en producción usar JWT o similar)
      const [campaignIdStr, recipientIdStr, action, timestamp] = token.split(':');

      if (!campaignIdStr || !recipientIdStr || action !== eventType) {
        throw new Error('Invalid tracking token');
      }

      const campaignId = parseInt(campaignIdStr);
      const recipientId = parseInt(recipientIdStr);

      // Buscar email de campaña
      const campaignEmail = await CampaignEmail.findOne({
        where: { campaignId, recipientId }
      });

      if (!campaignEmail) {
        throw new Error('Campaign email not found');
      }

      // Registrar evento según tipo
      if (eventType === 'open') {
        await campaignEmail.recordOpen(metadata?.ipAddress, metadata?.userAgent);

        // Actualizar estadísticas de campaña
        const campaign = await EmailCampaign.findByPk(campaignId);
        if (campaign) {
          await campaign.incrementOpenedCount();
        }

      } else if (eventType === 'click') {
        await campaignEmail.recordClick(
          metadata?.linkId || 'unknown',
          metadata?.linkUrl || 'unknown',
          metadata?.ipAddress,
          metadata?.userAgent
        );

        // Actualizar estadísticas de campaña
        const campaign = await EmailCampaign.findByPk(campaignId);
        if (campaign) {
          await campaign.incrementClickedCount();
        }
      }

      logger.info(`Campaign event tracked: ${eventType} for campaign ${campaignId}, recipient ${recipientId}`);
    } catch (error) {
      logger.error('Error tracking campaign event:', error);
      throw error;
    }
  }

  /**
   * Procesa unsubscribe de campaña
   */
  async processCampaignUnsubscribe(token: string): Promise<void> {
    try {
      // Decodificar token (simplificado)
      const decoded = Buffer.from(token, 'hex').toString('utf8');
      const [prefix, email, timestamp] = decoded.split(':');

      if (prefix !== 'campaign') {
        throw new Error('Invalid unsubscribe token');
      }

      // Aquí implementar lógica de unsubscribe
      // Por ejemplo, agregar email a lista de suprimidos
      // o marcar preferencias del usuario

      logger.info(`Campaign unsubscribe processed for ${email}`);
    } catch (error) {
      logger.error('Error processing campaign unsubscribe:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
