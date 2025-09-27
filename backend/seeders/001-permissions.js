'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar permisos del sistema
    const permissions = [
      // === GESTIÓN DE USUARIOS ===
      {
        name: 'create_user',
        displayName: 'Crear Usuario',
        description: 'Permite crear nuevos usuarios en el sistema',
        resource: 'user',
        action: 'create',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'read_user',
        displayName: 'Ver Usuario',
        description: 'Permite ver información de usuarios',
        resource: 'user',
        action: 'read',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'update_user',
        displayName: 'Actualizar Usuario',
        description: 'Permite actualizar información de usuarios',
        resource: 'user',
        action: 'update',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'delete_user',
        displayName: 'Eliminar Usuario',
        description: 'Permite eliminar usuarios del sistema',
        resource: 'user',
        action: 'delete',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_user_roles',
        displayName: 'Gestionar Roles de Usuario',
        description: 'Permite asignar y revocar roles a usuarios',
        resource: 'user',
        action: 'manage_roles',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_user_audit',
        displayName: 'Ver Auditoría de Usuario',
        description: 'Permite ver logs de auditoría de usuarios',
        resource: 'user',
        action: 'view_audit',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === GESTIÓN DE EVENTOS ===
      {
        name: 'create_event',
        displayName: 'Crear Evento',
        description: 'Permite crear nuevos eventos',
        resource: 'event',
        action: 'create',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'read_event',
        displayName: 'Ver Evento',
        description: 'Permite ver información de eventos',
        resource: 'event',
        action: 'read',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'update_event',
        displayName: 'Actualizar Evento',
        description: 'Permite actualizar información de eventos',
        resource: 'event',
        action: 'update',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'delete_event',
        displayName: 'Eliminar Evento',
        description: 'Permite eliminar eventos',
        resource: 'event',
        action: 'delete',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'publish_event',
        displayName: 'Publicar Evento',
        description: 'Permite publicar eventos para que sean visibles',
        resource: 'event',
        action: 'publish',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_event_capacity',
        displayName: 'Gestionar Capacidad de Evento',
        description: 'Permite gestionar la capacidad y límites de eventos',
        resource: 'event',
        action: 'manage_capacity',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'duplicate_event',
        displayName: 'Duplicar Evento',
        description: 'Permite duplicar eventos existentes',
        resource: 'event',
        action: 'duplicate',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === GESTIÓN DE SPEAKERS ===
      {
        name: 'create_speaker',
        displayName: 'Crear Speaker',
        description: 'Permite crear nuevos speakers',
        resource: 'speaker',
        action: 'create',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'read_speaker',
        displayName: 'Ver Speaker',
        description: 'Permite ver información de speakers',
        resource: 'speaker',
        action: 'read',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'update_speaker',
        displayName: 'Actualizar Speaker',
        description: 'Permite actualizar información de speakers',
        resource: 'speaker',
        action: 'update',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'delete_speaker',
        displayName: 'Eliminar Speaker',
        description: 'Permite eliminar speakers',
        resource: 'speaker',
        action: 'delete',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_speaker_contracts',
        displayName: 'Gestionar Contratos de Speaker',
        description: 'Permite gestionar contratos y acuerdos con speakers',
        resource: 'speaker',
        action: 'manage_contracts',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === SISTEMA DE INSCRIPCIONES ===
      {
        name: 'create_registration',
        displayName: 'Crear Inscripción',
        description: 'Permite crear nuevas inscripciones',
        resource: 'registration',
        action: 'create',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'read_registration',
        displayName: 'Ver Inscripción',
        description: 'Permite ver información de inscripciones',
        resource: 'registration',
        action: 'read',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'update_registration',
        displayName: 'Actualizar Inscripción',
        description: 'Permite actualizar información de inscripciones',
        resource: 'registration',
        action: 'update',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'delete_registration',
        displayName: 'Eliminar Inscripción',
        description: 'Permite eliminar inscripciones',
        resource: 'registration',
        action: 'delete',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_group_registration',
        displayName: 'Gestionar Inscripciones Grupales',
        description: 'Permite gestionar inscripciones para grupos',
        resource: 'registration',
        action: 'manage_group',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === PROCESAMIENTO DE PAGOS ===
      {
        name: 'process_payment',
        displayName: 'Procesar Pago',
        description: 'Permite procesar transacciones de pago',
        resource: 'payment',
        action: 'process',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'refund_payment',
        displayName: 'Reembolsar Pago',
        description: 'Permite procesar reembolsos de pagos',
        resource: 'payment',
        action: 'refund',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_payments',
        displayName: 'Ver Pagos',
        description: 'Permite ver información de pagos',
        resource: 'payment',
        action: 'view',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_payment_methods',
        displayName: 'Gestionar Métodos de Pago',
        description: 'Permite gestionar métodos y configuraciones de pago',
        resource: 'payment',
        action: 'manage_methods',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_financial_reports',
        displayName: 'Ver Reportes Financieros',
        description: 'Permite ver reportes y análisis financieros',
        resource: 'payment',
        action: 'view_reports',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === FACTURACIÓN FEL ===
      {
        name: 'generate_invoice',
        displayName: 'Generar Factura',
        description: 'Permite generar facturas electrónicas',
        resource: 'invoice',
        action: 'generate',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'cancel_invoice',
        displayName: 'Anular Factura',
        description: 'Permite anular facturas electrónicas',
        resource: 'invoice',
        action: 'cancel',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_invoices',
        displayName: 'Ver Facturas',
        description: 'Permite ver información de facturas',
        resource: 'invoice',
        action: 'view',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_fel_config',
        displayName: 'Gestionar Configuración FEL',
        description: 'Permite gestionar configuración de facturación electrónica',
        resource: 'invoice',
        action: 'manage_config',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'retry_fel_operations',
        displayName: 'Reintentar Operaciones FEL',
        description: 'Permite reintentar operaciones de facturación fallidas',
        resource: 'invoice',
        action: 'retry',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === PROMOCIONES Y DESCUENTOS ===
      {
        name: 'create_promotion',
        displayName: 'Crear Promoción',
        description: 'Permite crear nuevas promociones y descuentos',
        resource: 'promotion',
        action: 'create',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'read_promotion',
        displayName: 'Ver Promoción',
        description: 'Permite ver información de promociones',
        resource: 'promotion',
        action: 'read',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'update_promotion',
        displayName: 'Actualizar Promoción',
        description: 'Permite actualizar información de promociones',
        resource: 'promotion',
        action: 'update',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'delete_promotion',
        displayName: 'Eliminar Promoción',
        description: 'Permite eliminar promociones',
        resource: 'promotion',
        action: 'delete',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'apply_discount',
        displayName: 'Aplicar Descuento',
        description: 'Permite aplicar descuentos a inscripciones',
        resource: 'promotion',
        action: 'apply',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === CÓDIGOS QR Y ACCESO ===
      {
        name: 'generate_qr',
        displayName: 'Generar Código QR',
        description: 'Permite generar códigos QR para acceso',
        resource: 'qr',
        action: 'generate',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'validate_qr',
        displayName: 'Validar Código QR',
        description: 'Permite validar códigos QR de acceso',
        resource: 'qr',
        action: 'validate',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_access_control',
        displayName: 'Gestionar Control de Acceso',
        description: 'Permite gestionar configuraciones de control de acceso',
        resource: 'qr',
        action: 'manage_access',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_attendance',
        displayName: 'Ver Asistencia',
        description: 'Permite ver registros de asistencia',
        resource: 'qr',
        action: 'view_attendance',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === CERTIFICADOS ===
      {
        name: 'generate_certificate',
        displayName: 'Generar Certificado',
        description: 'Permite generar certificados de participación',
        resource: 'certificate',
        action: 'generate',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_certificate',
        displayName: 'Ver Certificado',
        description: 'Permite ver información de certificados',
        resource: 'certificate',
        action: 'view',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_certificate_templates',
        displayName: 'Gestionar Plantillas de Certificado',
        description: 'Permite gestionar plantillas de certificados',
        resource: 'certificate',
        action: 'manage_templates',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'verify_certificate',
        displayName: 'Verificar Certificado',
        description: 'Permite verificar autenticidad de certificados',
        resource: 'certificate',
        action: 'verify',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === NOTIFICACIONES ===
      {
        name: 'send_notification',
        displayName: 'Enviar Notificación',
        description: 'Permite enviar notificaciones a usuarios',
        resource: 'notification',
        action: 'send',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_email_templates',
        displayName: 'Gestionar Plantillas de Email',
        description: 'Permite gestionar plantillas de correos electrónicos',
        resource: 'notification',
        action: 'manage_templates',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_notification_logs',
        displayName: 'Ver Logs de Notificaciones',
        description: 'Permite ver logs de envío de notificaciones',
        resource: 'notification',
        action: 'view_logs',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === REPORTES Y ANALYTICS ===
      {
        name: 'view_reports',
        displayName: 'Ver Reportes',
        description: 'Permite ver reportes del sistema',
        resource: 'report',
        action: 'view',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'export_reports',
        displayName: 'Exportar Reportes',
        description: 'Permite exportar reportes del sistema',
        resource: 'report',
        action: 'export',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_analytics',
        displayName: 'Ver Analytics',
        description: 'Permite ver análisis y métricas del sistema',
        resource: 'report',
        action: 'view_analytics',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_dashboards',
        displayName: 'Gestionar Dashboards',
        description: 'Permite gestionar dashboards y visualizaciones',
        resource: 'report',
        action: 'manage_dashboards',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === CONFIGURACIÓN SISTEMA ===
      {
        name: 'manage_system_config',
        displayName: 'Gestionar Configuración del Sistema',
        description: 'Permite gestionar configuraciones del sistema',
        resource: 'system',
        action: 'manage_config',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_audit_logs',
        displayName: 'Ver Logs de Auditoría',
        description: 'Permite ver logs de auditoría del sistema',
        resource: 'system',
        action: 'view_audit',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'manage_integrations',
        displayName: 'Gestionar Integraciones',
        description: 'Permite gestionar integraciones con servicios externos',
        resource: 'system',
        action: 'manage_integrations',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // === WORKFLOWS ===
      {
        name: 'create_workflow',
        displayName: 'Crear Workflow',
        description: 'Permite crear nuevos workflows',
        resource: 'workflow',
        action: 'create',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'execute_workflow',
        displayName: 'Ejecutar Workflow',
        description: 'Permite ejecutar workflows',
        resource: 'workflow',
        action: 'execute',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'view_workflow_history',
        displayName: 'Ver Historial de Workflow',
        description: 'Permite ver historial de ejecución de workflows',
        resource: 'workflow',
        action: 'view_history',
        isActive: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('permissions', permissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};