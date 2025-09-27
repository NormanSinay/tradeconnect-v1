import nodemailer from 'nodemailer';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

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

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
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
}

export const emailService = new EmailService();