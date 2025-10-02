'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar permisos del sistema
    const permissions = [
      // === GESTIÓN DE USUARIOS ===
      {
        name: 'create_user',
        display_name: 'Crear Usuario',
        description: 'Permite crear nuevos usuarios en el sistema',
        resource: 'user',
        action: 'create',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'read_user',
        display_name: 'Ver Usuario',
        description: 'Permite ver información de usuarios',
        resource: 'user',
        action: 'read',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'update_user',
        display_name: 'Actualizar Usuario',
        description: 'Permite actualizar información de usuarios',
        resource: 'user',
        action: 'update',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'delete_user',
        display_name: 'Eliminar Usuario',
        description: 'Permite eliminar usuarios del sistema',
        resource: 'user',
        action: 'delete',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_user_roles',
        display_name: 'Gestionar Roles de Usuario',
        description: 'Permite asignar y revocar roles a usuarios',
        resource: 'user',
        action: 'manage_roles',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_user_audit',
        display_name: 'Ver Auditoría de Usuario',
        description: 'Permite ver logs de auditoría de usuarios',
        resource: 'user',
        action: 'view_audit',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === GESTIÓN DE EVENTOS ===
      {
        name: 'create_event',
        display_name: 'Crear Evento',
        description: 'Permite crear nuevos eventos',
        resource: 'event',
        action: 'create',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'read_event',
        display_name: 'Ver Evento',
        description: 'Permite ver información de eventos',
        resource: 'event',
        action: 'read',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'update_event',
        display_name: 'Actualizar Evento',
        description: 'Permite actualizar información de eventos',
        resource: 'event',
        action: 'update',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'delete_event',
        display_name: 'Eliminar Evento',
        description: 'Permite eliminar eventos',
        resource: 'event',
        action: 'delete',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'publish_event',
        display_name: 'Publicar Evento',
        description: 'Permite publicar eventos para que sean visibles',
        resource: 'event',
        action: 'publish',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_event_capacity',
        display_name: 'Gestionar Capacidad de Evento',
        description: 'Permite gestionar la capacidad y límites de eventos',
        resource: 'event',
        action: 'manage_capacity',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'duplicate_event',
        display_name: 'Duplicar Evento',
        description: 'Permite duplicar eventos existentes',
        resource: 'event',
        action: 'duplicate',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === GESTIÓN DE SPEAKERS ===
      {
        name: 'create_speaker',
        display_name: 'Crear Speaker',
        description: 'Permite crear nuevos speakers',
        resource: 'speaker',
        action: 'create',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'read_speaker',
        display_name: 'Ver Speaker',
        description: 'Permite ver información de speakers',
        resource: 'speaker',
        action: 'read',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'update_speaker',
        display_name: 'Actualizar Speaker',
        description: 'Permite actualizar información de speakers',
        resource: 'speaker',
        action: 'update',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'delete_speaker',
        display_name: 'Eliminar Speaker',
        description: 'Permite eliminar speakers',
        resource: 'speaker',
        action: 'delete',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_speaker_contracts',
        display_name: 'Gestionar Contratos de Speaker',
        description: 'Permite gestionar contratos y acuerdos con speakers',
        resource: 'speaker',
        action: 'manage_contracts',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === SISTEMA DE INSCRIPCIONES ===
      {
        name: 'create_registration',
        display_name: 'Crear Inscripción',
        description: 'Permite crear nuevas inscripciones',
        resource: 'registration',
        action: 'create',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'read_registration',
        display_name: 'Ver Inscripción',
        description: 'Permite ver información de inscripciones',
        resource: 'registration',
        action: 'read',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'update_registration',
        display_name: 'Actualizar Inscripción',
        description: 'Permite actualizar información de inscripciones',
        resource: 'registration',
        action: 'update',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'delete_registration',
        display_name: 'Eliminar Inscripción',
        description: 'Permite eliminar inscripciones',
        resource: 'registration',
        action: 'delete',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_group_registration',
        display_name: 'Gestionar Inscripciones Grupales',
        description: 'Permite gestionar inscripciones para grupos',
        resource: 'registration',
        action: 'manage_group',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === PROCESAMIENTO DE PAGOS ===
      {
        name: 'process_payment',
        display_name: 'Procesar Pago',
        description: 'Permite procesar transacciones de pago',
        resource: 'payment',
        action: 'process',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'refund_payment',
        display_name: 'Reembolsar Pago',
        description: 'Permite procesar reembolsos de pagos',
        resource: 'payment',
        action: 'refund',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_payments',
        display_name: 'Ver Pagos',
        description: 'Permite ver información de pagos',
        resource: 'payment',
        action: 'view',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_payment_methods',
        display_name: 'Gestionar Métodos de Pago',
        description: 'Permite gestionar métodos y configuraciones de pago',
        resource: 'payment',
        action: 'manage_methods',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_financial_reports',
        display_name: 'Ver Reportes Financieros',
        description: 'Permite ver reportes y análisis financieros',
        resource: 'payment',
        action: 'view_reports',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === FACTURACIÓN FEL ===
      {
        name: 'generate_invoice',
        display_name: 'Generar Factura',
        description: 'Permite generar facturas electrónicas',
        resource: 'invoice',
        action: 'generate',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'cancel_invoice',
        display_name: 'Anular Factura',
        description: 'Permite anular facturas electrónicas',
        resource: 'invoice',
        action: 'cancel',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_invoices',
        display_name: 'Ver Facturas',
        description: 'Permite ver información de facturas',
        resource: 'invoice',
        action: 'view',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_fel_config',
        display_name: 'Gestionar Configuración FEL',
        description: 'Permite gestionar configuración de facturación electrónica',
        resource: 'invoice',
        action: 'manage_config',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'retry_fel_operations',
        display_name: 'Reintentar Operaciones FEL',
        description: 'Permite reintentar operaciones de facturación fallidas',
        resource: 'invoice',
        action: 'retry',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === PROMOCIONES Y DESCUENTOS ===
      {
        name: 'create_promotion',
        display_name: 'Crear Promoción',
        description: 'Permite crear nuevas promociones y descuentos',
        resource: 'promotion',
        action: 'create',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'read_promotion',
        display_name: 'Ver Promoción',
        description: 'Permite ver información de promociones',
        resource: 'promotion',
        action: 'read',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'update_promotion',
        display_name: 'Actualizar Promoción',
        description: 'Permite actualizar información de promociones',
        resource: 'promotion',
        action: 'update',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'delete_promotion',
        display_name: 'Eliminar Promoción',
        description: 'Permite eliminar promociones',
        resource: 'promotion',
        action: 'delete',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'apply_discount',
        display_name: 'Aplicar Descuento',
        description: 'Permite aplicar descuentos a inscripciones',
        resource: 'promotion',
        action: 'apply',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === CÓDIGOS QR Y ACCESO ===
      {
        name: 'generate_qr',
        display_name: 'Generar Código QR',
        description: 'Permite generar códigos QR para acceso',
        resource: 'qr',
        action: 'generate',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'validate_qr',
        display_name: 'Validar Código QR',
        description: 'Permite validar códigos QR de acceso',
        resource: 'qr',
        action: 'validate',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_access_control',
        display_name: 'Gestionar Control de Acceso',
        description: 'Permite gestionar configuraciones de control de acceso',
        resource: 'qr',
        action: 'manage_access',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_attendance',
        display_name: 'Ver Asistencia',
        description: 'Permite ver registros de asistencia',
        resource: 'qr',
        action: 'view_attendance',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === CERTIFICADOS ===
      {
        name: 'generate_certificate',
        display_name: 'Generar Certificado',
        description: 'Permite generar certificados de participación',
        resource: 'certificate',
        action: 'generate',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_certificate',
        display_name: 'Ver Certificado',
        description: 'Permite ver información de certificados',
        resource: 'certificate',
        action: 'view',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_certificate_templates',
        display_name: 'Gestionar Plantillas de Certificado',
        description: 'Permite gestionar plantillas de certificados',
        resource: 'certificate',
        action: 'manage_templates',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'verify_certificate',
        display_name: 'Verificar Certificado',
        description: 'Permite verificar autenticidad de certificados',
        resource: 'certificate',
        action: 'verify',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === NOTIFICACIONES ===
      {
        name: 'send_notification',
        display_name: 'Enviar Notificación',
        description: 'Permite enviar notificaciones a usuarios',
        resource: 'notification',
        action: 'send',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_email_templates',
        display_name: 'Gestionar Plantillas de Email',
        description: 'Permite gestionar plantillas de correos electrónicos',
        resource: 'notification',
        action: 'manage_templates',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_notification_logs',
        display_name: 'Ver Logs de Notificaciones',
        description: 'Permite ver logs de envío de notificaciones',
        resource: 'notification',
        action: 'view_logs',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === REPORTES Y ANALYTICS ===
      {
        name: 'view_reports',
        display_name: 'Ver Reportes',
        description: 'Permite ver reportes del sistema',
        resource: 'report',
        action: 'view',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'export_reports',
        display_name: 'Exportar Reportes',
        description: 'Permite exportar reportes del sistema',
        resource: 'report',
        action: 'export',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_analytics',
        display_name: 'Ver Analytics',
        description: 'Permite ver análisis y métricas del sistema',
        resource: 'report',
        action: 'view_analytics',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_dashboards',
        display_name: 'Gestionar Dashboards',
        description: 'Permite gestionar dashboards y visualizaciones',
        resource: 'report',
        action: 'manage_dashboards',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === CONFIGURACIÓN SISTEMA ===
      {
        name: 'manage_system_config',
        display_name: 'Gestionar Configuración del Sistema',
        description: 'Permite gestionar configuraciones del sistema',
        resource: 'system',
        action: 'manage_config',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_audit_logs',
        display_name: 'Ver Logs de Auditoría',
        description: 'Permite ver logs de auditoría del sistema',
        resource: 'system',
        action: 'view_audit',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'manage_integrations',
        display_name: 'Gestionar Integraciones',
        description: 'Permite gestionar integraciones con servicios externos',
        resource: 'system',
        action: 'manage_integrations',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // === WORKFLOWS ===
      {
        name: 'create_workflow',
        display_name: 'Crear Workflow',
        description: 'Permite crear nuevos workflows',
        resource: 'workflow',
        action: 'create',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'execute_workflow',
        display_name: 'Ejecutar Workflow',
        description: 'Permite ejecutar workflows',
        resource: 'workflow',
        action: 'execute',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'view_workflow_history',
        display_name: 'Ver Historial de Workflow',
        description: 'Permite ver historial de ejecución de workflows',
        resource: 'workflow',
        action: 'view_history',
        is_active: true,
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Verificar si ya existen permisos usando consulta SQL directa
    const [results] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM permissions',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (results.count > 0) {
      console.log('Permisos ya existen, saltando inserción...');
      return;
    }

    // Insertar permisos si no existen
    await queryInterface.bulkInsert('permissions', permissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};