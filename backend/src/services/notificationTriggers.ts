/**
 * @fileoverview Servicio de Triggers Automáticos de Notificaciones para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Triggers automáticos para notificaciones basadas en eventos del sistema
 *
 * Archivo: backend/src/services/notificationTriggers.ts
 */

import { EventEmitter } from 'events';
import { notificationService } from './notificationService';
import { logger } from '../utils/logger';
import { NotificationChannel, NotificationPriority, NotificationType } from '../types/notification.types';

/**
 * Servicio que maneja los triggers automáticos de notificaciones
 */
export class NotificationTriggersService {
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.registerTriggers();
  }

  /**
   * Registra todos los triggers automáticos
   */
  private registerTriggers(): void {
    // Triggers para eventos de registro/inscripción
    this.eventEmitter.on('RegistrationCreated', this.handleRegistrationCreated.bind(this));
    this.eventEmitter.on('RegistrationConfirmed', this.handleRegistrationConfirmed.bind(this));
    this.eventEmitter.on('RegistrationCancelled', this.handleRegistrationCancelled.bind(this));

    // Triggers para eventos de pago
    this.eventEmitter.on('PaymentApproved', this.handlePaymentApproved.bind(this));
    this.eventEmitter.on('PaymentRejected', this.handlePaymentRejected.bind(this));
    this.eventEmitter.on('PaymentRefunded', this.handlePaymentRefunded.bind(this));

    // Triggers para eventos de certificados
    this.eventEmitter.on('CertificateGenerated', this.handleCertificateGenerated.bind(this));
    this.eventEmitter.on('CertificateValidated', this.handleCertificateValidated.bind(this));

    // Triggers para eventos próximos
    this.eventEmitter.on('EventReminder24h', this.handleEventReminder24h.bind(this));
    this.eventEmitter.on('EventReminder1h', this.handleEventReminder1h.bind(this));

    // Triggers para eventos del sistema
    this.eventEmitter.on('UserAccountLocked', this.handleUserAccountLocked.bind(this));
    this.eventEmitter.on('UserPasswordChanged', this.handleUserPasswordChanged.bind(this));

    logger.info('Notification triggers registered successfully');
  }

  /**
   * Maneja la creación de una nueva inscripción
   */
  private async handleRegistrationCreated(data: {
    registrationId: number;
    userId: number;
    eventId: number;
    eventData: any;
    userData: any;
  }): Promise<void> {
    try {
      logger.info(`Processing registration created notification for user ${data.userId}, event ${data.eventId}`);

      // Notificación de confirmación de inscripción
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        subject: 'Confirmación de Inscripción',
        message: 'Tu inscripción ha sido registrada exitosamente',
        data: {
          registrationId: data.registrationId,
          eventTitle: data.eventData.title,
          eventDate: data.eventData.startDate,
          eventLocation: data.eventData.location,
          userName: data.userData.firstName
        },
        templateCode: 'INSCRIPCION_CONFIRMADA'
      });

      // Notificación popup en tiempo real
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.POPUP,
        channel: NotificationChannel.POPUP,
        priority: NotificationPriority.NORMAL,
        subject: '¡Inscripción exitosa!',
        message: `Te has inscrito exitosamente al evento "${data.eventData.title}"`,
        data: {
          eventId: data.eventId,
          eventTitle: data.eventData.title
        }
      });

    } catch (error) {
      logger.error('Error handling registration created notification:', error);
    }
  }

  /**
   * Maneja la confirmación de una inscripción
   */
  private async handleRegistrationConfirmed(data: {
    registrationId: number;
    userId: number;
    eventId: number;
    eventData: any;
    userData: any;
  }): Promise<void> {
    try {
      logger.info(`Processing registration confirmed notification for user ${data.userId}, event ${data.eventId}`);

      // Email de confirmación con detalles y QR
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        subject: 'Inscripción Confirmada - Detalles del Evento',
        message: 'Tu inscripción ha sido confirmada',
        data: {
          registrationId: data.registrationId,
          eventTitle: data.eventData.title,
          eventDate: data.eventData.startDate,
          eventLocation: data.eventData.location,
          eventDescription: data.eventData.description,
          userName: data.userData.firstName,
          qrCodeUrl: `https://api.tradeconnect.com/qr/${data.registrationId}`
        },
        templateCode: 'INSCRIPCION_CONFIRMADA'
      });

      // Notificación popup
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.POPUP,
        channel: NotificationChannel.POPUP,
        priority: NotificationPriority.NORMAL,
        subject: '¡Inscripción confirmada!',
        message: `Tu inscripción al evento "${data.eventData.title}" ha sido confirmada`,
        data: {
          eventId: data.eventId,
          registrationId: data.registrationId
        }
      });

    } catch (error) {
      logger.error('Error handling registration confirmed notification:', error);
    }
  }

  /**
   * Maneja la cancelación de una inscripción
   */
  private async handleRegistrationCancelled(data: {
    registrationId: number;
    userId: number;
    eventId: number;
    eventData: any;
    userData: any;
    reason?: string;
  }): Promise<void> {
    try {
      logger.info(`Processing registration cancelled notification for user ${data.userId}, event ${data.eventId}`);

      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        subject: 'Inscripción Cancelada',
        message: 'Tu inscripción ha sido cancelada',
        data: {
          registrationId: data.registrationId,
          eventTitle: data.eventData.title,
          cancellationReason: data.reason,
          userName: data.userData.firstName
        },
        templateCode: 'INSCRIPCION_CANCELADA'
      });

    } catch (error) {
      logger.error('Error handling registration cancelled notification:', error);
    }
  }

  /**
   * Maneja la aprobación de un pago
   */
  private async handlePaymentApproved(data: {
    paymentId: number;
    registrationId: number;
    userId: number;
    amount: number;
    currency: string;
    eventData: any;
    userData: any;
  }): Promise<void> {
    try {
      logger.info(`Processing payment approved notification for user ${data.userId}, payment ${data.paymentId}`);

      // Email con recibo de pago + factura PDF
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
        subject: 'Pago Aprobado - Recibo de Pago',
        message: 'Tu pago ha sido procesado exitosamente',
        data: {
          paymentId: data.paymentId,
          registrationId: data.registrationId,
          amount: data.amount,
          currency: data.currency,
          eventTitle: data.eventData.title,
          userName: data.userData.firstName,
          paymentDate: new Date().toISOString(),
          invoiceUrl: `https://api.tradeconnect.com/invoices/${data.registrationId}/download`
        },
        templateCode: 'PAGO_APROBADO'
      });

      // Notificación popup
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.POPUP,
        channel: NotificationChannel.POPUP,
        priority: NotificationPriority.HIGH,
        subject: 'Pago procesado correctamente',
        message: `Tu pago de ${data.currency} ${data.amount} ha sido aprobado`,
        data: {
          paymentId: data.paymentId,
          amount: data.amount,
          currency: data.currency
        }
      });

    } catch (error) {
      logger.error('Error handling payment approved notification:', error);
    }
  }

  /**
   * Maneja el rechazo de un pago
   */
  private async handlePaymentRejected(data: {
    paymentId: number;
    registrationId: number;
    userId: number;
    amount: number;
    currency: string;
    reason: string;
    eventData: any;
    userData: any;
  }): Promise<void> {
    try {
      logger.info(`Processing payment rejected notification for user ${data.userId}, payment ${data.paymentId}`);

      // Email con instrucciones para reintentar
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
        subject: 'Pago Rechazado - Acción Requerida',
        message: 'Tu pago ha sido rechazado',
        data: {
          paymentId: data.paymentId,
          registrationId: data.registrationId,
          amount: data.amount,
          currency: data.currency,
          rejectionReason: data.reason,
          eventTitle: data.eventData.title,
          userName: data.userData.firstName,
          retryUrl: `https://app.tradeconnect.com/payments/${data.paymentId}/retry`
        },
        templateCode: 'PAGO_RECHAZADO'
      });

      // Notificación popup de error
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.POPUP,
        channel: NotificationChannel.POPUP,
        priority: NotificationPriority.CRITICAL,
        subject: 'Error en el pago',
        message: `Tu pago ha sido rechazado. Revisa tu email para más detalles.`,
        data: {
          paymentId: data.paymentId,
          reason: data.reason
        }
      });

    } catch (error) {
      logger.error('Error handling payment rejected notification:', error);
    }
  }

  /**
   * Maneja el reembolso de un pago
   */
  private async handlePaymentRefunded(data: {
    paymentId: number;
    registrationId: number;
    userId: number;
    amount: number;
    currency: string;
    reason: string;
    eventData: any;
    userData: any;
  }): Promise<void> {
    try {
      logger.info(`Processing payment refunded notification for user ${data.userId}, payment ${data.paymentId}`);

      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        subject: 'Reembolso Procesado',
        message: 'Tu reembolso ha sido procesado',
        data: {
          paymentId: data.paymentId,
          registrationId: data.registrationId,
          amount: data.amount,
          currency: data.currency,
          refundReason: data.reason,
          eventTitle: data.eventData.title,
          userName: data.userData.firstName,
          processedDate: new Date().toISOString()
        },
        templateCode: 'PAGO_REEMBOLSADO'
      });

    } catch (error) {
      logger.error('Error handling payment refunded notification:', error);
    }
  }

  /**
   * Maneja la generación de un certificado
   */
  private async handleCertificateGenerated(data: {
    certificateId: number;
    registrationId: number;
    userId: number;
    eventData: any;
    userData: any;
    certificateUrl: string;
  }): Promise<void> {
    try {
      logger.info(`Processing certificate generated notification for user ${data.userId}, certificate ${data.certificateId}`);

      // Email con link de descarga del certificado
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        subject: 'Tu Certificado Está Listo',
        message: 'Tu certificado de participación ha sido generado',
        data: {
          certificateId: data.certificateId,
          registrationId: data.registrationId,
          eventTitle: data.eventData.title,
          userName: data.userData.firstName,
          certificateUrl: data.certificateUrl,
          downloadUrl: `https://api.tradeconnect.com/certificates/${data.certificateId}/download`
        },
        templateCode: 'CERTIFICADO_GENERADO'
      });

      // Notificación popup
      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.POPUP,
        channel: NotificationChannel.POPUP,
        priority: NotificationPriority.NORMAL,
        subject: 'Tu certificado está listo',
        message: `El certificado para el evento "${data.eventData.title}" ya está disponible`,
        data: {
          certificateId: data.certificateId,
          certificateUrl: data.certificateUrl
        }
      });

    } catch (error) {
      logger.error('Error handling certificate generated notification:', error);
    }
  }

  /**
   * Maneja la validación de un certificado
   */
  private async handleCertificateValidated(data: {
    certificateId: number;
    registrationId: number;
    userId: number;
    validatorUserId: number;
    eventData: any;
    userData: any;
  }): Promise<void> {
    try {
      logger.info(`Processing certificate validated notification for user ${data.userId}, certificate ${data.certificateId}`);

      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        subject: 'Certificado Validado',
        message: 'Tu certificado ha sido validado exitosamente',
        data: {
          certificateId: data.certificateId,
          registrationId: data.registrationId,
          eventTitle: data.eventData.title,
          userName: data.userData.firstName,
          validationDate: new Date().toISOString()
        },
        templateCode: 'CERTIFICADO_VALIDADO'
      });

    } catch (error) {
      logger.error('Error handling certificate validated notification:', error);
    }
  }

  /**
   * Maneja el recordatorio 24h antes del evento
   */
  private async handleEventReminder24h(data: {
    eventId: number;
    eventData: any;
    registrations: Array<{
      registrationId: number;
      userId: number;
      userData: any;
    }>;
  }): Promise<void> {
    try {
      logger.info(`Processing 24h reminder for event ${data.eventId}, ${data.registrations.length} registrations`);

      // Enviar recordatorios a todos los registrados
      for (const registration of data.registrations) {
        await notificationService.sendNotification({
          userId: registration.userId,
          type: NotificationType.EMAIL,
          channel: NotificationChannel.EMAIL,
          priority: NotificationPriority.NORMAL,
          subject: 'Recordatorio: Tu evento es mañana',
          message: 'Recordatorio de evento programado para mañana',
          data: {
            registrationId: registration.registrationId,
            eventTitle: data.eventData.title,
            eventDate: data.eventData.startDate,
            eventLocation: data.eventData.location,
            eventDescription: data.eventData.description,
            userName: registration.userData.firstName,
            eventUrl: `https://app.tradeconnect.com/events/${data.eventId}`
          },
          templateCode: 'EVENTO_PROXIMO_24H'
        });
      }

    } catch (error) {
      logger.error('Error handling event reminder 24h:', error);
    }
  }

  /**
   * Maneja el recordatorio 1h antes del evento
   */
  private async handleEventReminder1h(data: {
    eventId: number;
    eventData: any;
    registrations: Array<{
      registrationId: number;
      userId: number;
      userData: any;
    }>;
  }): Promise<void> {
    try {
      logger.info(`Processing 1h reminder for event ${data.eventId}, ${data.registrations.length} registrations`);

      // Enviar recordatorios urgentes
      for (const registration of data.registrations) {
        await notificationService.sendNotification({
          userId: registration.userId,
          type: NotificationType.POPUP,
          channel: NotificationChannel.POPUP,
          priority: NotificationPriority.HIGH,
          subject: '¡Tu evento comienza en 1 hora!',
          message: `El evento "${data.eventData.title}" comienza en 1 hora`,
          data: {
            registrationId: registration.registrationId,
            eventId: data.eventId,
            eventTitle: data.eventData.title,
            eventTime: data.eventData.startDate,
            eventLocation: data.eventData.location
          }
        });
      }

    } catch (error) {
      logger.error('Error handling event reminder 1h:', error);
    }
  }

  /**
   * Maneja el bloqueo de cuenta de usuario
   */
  private async handleUserAccountLocked(data: {
    userId: number;
    userData: any;
    reason: string;
    lockExpiresAt: Date;
  }): Promise<void> {
    try {
      logger.info(`Processing account locked notification for user ${data.userId}`);

      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.CRITICAL,
        subject: 'Cuenta Bloqueada - Acción Requerida',
        message: 'Tu cuenta ha sido bloqueada temporalmente',
        data: {
          userName: data.userData.firstName,
          lockReason: data.reason,
          lockExpiresAt: data.lockExpiresAt.toISOString(),
          supportEmail: 'support@tradeconnect.com'
        },
        templateCode: 'CUENTA_BLOQUEADA'
      });

    } catch (error) {
      logger.error('Error handling user account locked notification:', error);
    }
  }

  /**
   * Maneja el cambio de contraseña
   */
  private async handleUserPasswordChanged(data: {
    userId: number;
    userData: any;
    changedBy: number; // Para distinguir si fue el usuario o admin
  }): Promise<void> {
    try {
      logger.info(`Processing password changed notification for user ${data.userId}`);

      await notificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.EMAIL,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
        subject: 'Contraseña Cambiada',
        message: 'Tu contraseña ha sido cambiada exitosamente',
        data: {
          userName: data.userData.firstName,
          changeDate: new Date().toISOString(),
          changedByUser: data.changedBy === data.userId,
          supportEmail: 'support@tradeconnect.com'
        },
        templateCode: 'CONTRASENA_CAMBIADA'
      });

    } catch (error) {
      logger.error('Error handling user password changed notification:', error);
    }
  }

  /**
   * Obtiene estadísticas de triggers procesados
   */
  public getStats(): {
    triggersRegistered: number;
    eventsProcessed: { [key: string]: number };
  } {
    // TODO: Implementar tracking de estadísticas
    return {
      triggersRegistered: 12, // Número de triggers registrados
      eventsProcessed: {
        RegistrationCreated: 0,
        RegistrationConfirmed: 0,
        RegistrationCancelled: 0,
        PaymentApproved: 0,
        PaymentRejected: 0,
        PaymentRefunded: 0,
        CertificateGenerated: 0,
        CertificateValidated: 0,
        EventReminder24h: 0,
        EventReminder1h: 0,
        UserAccountLocked: 0,
        UserPasswordChanged: 0
      }
    };
  }
}

export const notificationTriggersService = (eventEmitter: EventEmitter) =>
  new NotificationTriggersService(eventEmitter);