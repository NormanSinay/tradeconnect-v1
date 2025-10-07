'use strict';

/**
 * Seeder para crear plantillas de notificaciones básicas
 * @version 1.0.0
 * @author TradeConnect Team
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🌱 Creating notification templates...');

      const templates = [
        {
          code: 'INSCRIPCION_CONFIRMADA',
          name: 'Confirmación de Inscripción',
          subject: '¡Inscripción Confirmada! - {{eventTitle}}',
          html_content: '<div style="font-family: Arial, sans-serif;"><h1>¡Inscripción Confirmada!</h1><p>Hola {{userName}},</p><p>Tu inscripción al evento {{eventTitle}} ha sido confirmada exitosamente.</p><p>Fecha: {{eventDate}}</p><p>Ubicación: {{eventLocation}}</p><p>Descripción: {{eventDescription}}</p><p><a href="{{eventUrl}}">Ver Detalles del Evento</a></p><p>¡Te esperamos!</p></div>',
          text_content: '¡Inscripción Confirmada!\n\nHola {{userName}},\n\nTu inscripción al evento {{eventTitle}} ha sido confirmada exitosamente.\n\nDetalles del Evento:\n- Fecha: {{eventDate}}\n- Ubicación: {{eventLocation}}\n- Descripción: {{eventDescription}}\n\nRecibirás recordatorios automáticos antes del evento.\n\n¡Te esperamos!\nEquipo TradeConnect',
          variables: JSON.stringify({
            userName: 'string',
            eventTitle: 'string',
            eventDate: 'string',
            eventLocation: 'string',
            eventDescription: 'string',
            eventUrl: 'string',
            unsubscribeUrl: 'string'
          }),
          type: 'TRANSACTIONAL',
          active: true,
          version: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          code: 'PAGO_APROBADO',
          name: 'Pago Aprobado',
          subject: 'Pago Aprobado - Recibo #{{paymentId}}',
          html_content: '<div style="font-family: Arial, sans-serif;"><h1>✅ Pago Aprobado</h1><p>Hola {{userName}},</p><p>Tu pago ha sido procesado exitosamente.</p><p>ID de Pago: #{{paymentId}}</p><p>Monto: {{currency}} {{amount}}</p><p>Fecha: {{paymentDate}}</p><p>Evento: {{eventTitle}}</p><p><a href="{{invoiceUrl}}">Descargar Factura</a></p><p>¡Gracias por tu confianza!</p></div>',
          text_content: '✅ Pago Aprobado\n\nHola {{userName}},\n\nTu pago ha sido procesado exitosamente.\n\nDetalles del Pago:\n- ID de Pago: #{{paymentId}}\n- Monto: {{currency}} {{amount}}\n- Fecha: {{paymentDate}}\n- Evento: {{eventTitle}}\n\nSi tienes alguna pregunta sobre tu pago, contacta a nuestro equipo de soporte.\n\n¡Gracias por tu confianza!\nEquipo TradeConnect',
          variables: JSON.stringify({
            userName: 'string',
            paymentId: 'number',
            currency: 'string',
            amount: 'number',
            paymentDate: 'string',
            eventTitle: 'string',
            invoiceUrl: 'string',
            unsubscribeUrl: 'string'
          }),
          type: 'TRANSACTIONAL',
          active: true,
          version: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          code: 'EVENTO_PROXIMO_24H',
          name: 'Recordatorio 24h antes del evento',
          subject: 'Recordatorio: Tu evento es mañana - {{eventTitle}}',
          html_content: '<div style="font-family: Arial, sans-serif;"><h1>⏰ Recordatorio de Evento</h1><p>Hola {{userName}},</p><p>Te recordamos que tu evento {{eventTitle}} se llevará a cabo mañana.</p><p>Fecha: {{eventDate}}</p><p>Ubicación: {{eventLocation}}</p><p>Descripción: {{eventDescription}}</p><p><a href="{{eventUrl}}">Ver Detalles del Evento</a></p><p>¡Nos vemos pronto!</p></div>',
          text_content: '⏰ Recordatorio de Evento\n\nHola {{userName}},\n\nTe recordamos que tu evento {{eventTitle}} se llevará a cabo mañana.\n\nDetalles del Evento:\n- Fecha: {{eventDate}}\n- Ubicación: {{eventLocation}}\n- Descripción: {{eventDescription}}\n\n¡Nos vemos pronto!\nEquipo TradeConnect',
          variables: JSON.stringify({
            userName: 'string',
            eventTitle: 'string',
            eventDate: 'string',
            eventLocation: 'string',
            eventDescription: 'string',
            eventUrl: 'string',
            unsubscribeUrl: 'string'
          }),
          type: 'OPERATIONAL',
          active: true,
          version: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          code: 'CERTIFICADO_GENERADO',
          name: 'Certificado Generado',
          subject: 'Tu Certificado Está Listo - {{eventTitle}}',
          html_content: '<div style="font-family: Arial, sans-serif;"><h1>🎓 Certificado Disponible</h1><p>Hola {{userName}},</p><p>¡Felicitaciones! Tu certificado de participación en el evento {{eventTitle}} ya está disponible.</p><p>Fecha de Emisión: {{certificateDate}}</p><p>ID de Certificado: #{{certificateId}}</p><p><a href="{{certificateUrl}}">Descargar Certificado</a></p><p>¡Gracias por participar!</p></div>',
          text_content: '🎓 Certificado Disponible\n\nHola {{userName}},\n\n¡Felicitaciones! Tu certificado de participación en el evento {{eventTitle}} ya está disponible.\n\nDetalles del Certificado:\n- Evento: {{eventTitle}}\n- Fecha de Emisión: {{certificateDate}}\n- ID de Certificado: #{{certificateId}}\n\nTu certificado está verificado en blockchain.\n\n¡Gracias por participar!\nEquipo TradeConnect',
          variables: JSON.stringify({
            userName: 'string',
            eventTitle: 'string',
            certificateDate: 'string',
            certificateId: 'number',
            certificateUrl: 'string',
            unsubscribeUrl: 'string'
          }),
          type: 'TRANSACTIONAL',
          active: true,
          version: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          code: 'CUENTA_BLOQUEADA',
          name: 'Cuenta Bloqueada',
          subject: 'Cuenta Bloqueada Temporalmente',
          html_content: '<div style="font-family: Arial, sans-serif;"><h1>🚫 Cuenta Bloqueada</h1><p>Hola {{userName}},</p><p>Tu cuenta ha sido bloqueada temporalmente por motivos de seguridad.</p><p>Razón del Bloqueo: {{lockReason}}</p><p>Fecha del Bloqueo: {{lockDate}}</p><p>Expira: {{lockExpiresAt}}</p><p>Si crees que esto es un error, contacta a nuestro equipo de soporte.</p></div>',
          text_content: '🚫 Cuenta Bloqueada\n\nHola {{userName}},\n\nTu cuenta ha sido bloqueada temporalmente por motivos de seguridad.\n\nRazón del Bloqueo: {{lockReason}}\nFecha del Bloqueo: {{lockDate}}\nExpira: {{lockExpiresAt}}\n\nSi crees que esto es un error, contacta a nuestro equipo de soporte.\n\nEquipo TradeConnect',
          variables: JSON.stringify({
            userName: 'string',
            lockReason: 'string',
            lockDate: 'string',
            lockExpiresAt: 'string',
            supportEmail: 'string'
          }),
          type: 'OPERATIONAL',
          active: true,
          version: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await queryInterface.bulkInsert('email_templates', templates, {});
      console.log(`✅ Created ${templates.length} notification templates`);

      console.log('✅ Notification templates seeding completed');

    } catch (error) {
      console.error('❌ Error seeding notification templates:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🗑️  Removing notification templates...');

      const templateCodes = [
        'INSCRIPCION_CONFIRMADA',
        'PAGO_APROBADO',
        'EVENTO_PROXIMO_24H',
        'CERTIFICADO_GENERADO',
        'CUENTA_BLOQUEADA'
      ];

      await queryInterface.bulkDelete('email_templates', {
        code: templateCodes
      }, {});

      console.log('✅ Notification templates removed');

    } catch (error) {
      console.error('❌ Error removing notification templates:', error);
      throw error;
    }
  }
};
