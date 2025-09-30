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

interface OTPData {
  firstName: string;
  otpCode: string;
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
        pass: process.env.SMTP_PASSWORD
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
}

export const emailService = new EmailService();