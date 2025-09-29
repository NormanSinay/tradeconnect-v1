'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero obtener los IDs de los roles y permisos
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles WHERE is_active = true',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissions = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions WHERE is_active = true',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Crear mapas para fácil acceso
    const roleMap = roles.reduce((map, role) => {
      map[role.name] = role.id;
      return map;
    }, {});

    const permissionMap = permissions.reduce((map, perm) => {
      map[perm.name] = perm.id;
      return map;
    }, {});

    // Definir permisos por rol
    const rolePermissions = [];

    // === SUPER_ADMIN - Todos los permisos ===
    const allPermissions = permissions.map(p => p.id);
    allPermissions.forEach(permissionId => {
      rolePermissions.push({
        role_id: roleMap.super_admin,
        permission_id: permissionId,
        is_active: true,
        reason: 'Permisos completos para Super Administrador',
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    // === ADMIN - La mayoría de permisos administrativos ===
    const adminPermissions = [
      // Gestión de usuarios
      'create_user', 'read_user', 'update_user', 'delete_user', 'manage_user_roles', 'view_user_audit',
      // Gestión de eventos
      'create_event', 'read_event', 'update_event', 'delete_event', 'publish_event', 'manage_event_capacity', 'duplicate_event',
      // Gestión de speakers
      'create_speaker', 'read_speaker', 'update_speaker', 'delete_speaker', 'manage_speaker_contracts',
      // Sistema de inscripciones
      'create_registration', 'read_registration', 'update_registration', 'delete_registration', 'manage_group_registration',
      // Procesamiento de pagos
      'process_payment', 'refund_payment', 'view_payments', 'manage_payment_methods', 'view_financial_reports',
      // Facturación FEL
      'generate_invoice', 'cancel_invoice', 'view_invoices', 'manage_fel_config', 'retry_fel_operations',
      // Promociones
      'create_promotion', 'read_promotion', 'update_promotion', 'delete_promotion', 'apply_discount',
      // QR y acceso
      'generate_qr', 'validate_qr', 'manage_access_control', 'view_attendance',
      // Certificados
      'generate_certificate', 'view_certificate', 'manage_certificate_templates', 'verify_certificate',
      // Notificaciones
      'send_notification', 'manage_email_templates', 'view_notification_logs',
      // Reportes
      'view_reports', 'export_reports', 'view_analytics', 'manage_dashboards',
      // Configuración sistema
      'manage_system_config', 'view_audit_logs', 'manage_integrations',
      // Workflows
      'create_workflow', 'execute_workflow', 'view_workflow_history'
    ];

    adminPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap.admin,
          permission_id: permissionMap[permName],
          is_active: true,
          reason: 'Permisos administrativos completos',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // === MANAGER - Permisos de gestión ===
    const managerPermissions = [
      // Gestión de usuarios (limitada)
      'read_user', 'update_user', 'view_user_audit',
      // Gestión de eventos
      'create_event', 'read_event', 'update_event', 'publish_event', 'manage_event_capacity', 'duplicate_event',
      // Gestión de speakers
      'create_speaker', 'read_speaker', 'update_speaker', 'manage_speaker_contracts',
      // Sistema de inscripciones
      'create_registration', 'read_registration', 'update_registration', 'manage_group_registration',
      // Procesamiento de pagos (solo ver)
      'view_payments', 'view_financial_reports',
      // Facturación FEL (solo ver)
      'view_invoices',
      // Promociones
      'create_promotion', 'read_promotion', 'update_promotion', 'delete_promotion', 'apply_discount',
      // QR y acceso
      'generate_qr', 'validate_qr', 'view_attendance',
      // Certificados
      'generate_certificate', 'view_certificate', 'verify_certificate',
      // Notificaciones
      'send_notification', 'view_notification_logs',
      // Reportes
      'view_reports', 'export_reports', 'view_analytics'
    ];

    managerPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap.manager,
          permission_id: permissionMap[permName],
          is_active: true,
          reason: 'Permisos de gestión de eventos y usuarios',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // === OPERATOR - Permisos operativos limitados ===
    const operatorPermissions = [
      // Gestión de usuarios (solo lectura)
      'read_user',
      // Gestión de eventos (limitada)
      'read_event', 'update_event',
      // Sistema de inscripciones
      'create_registration', 'read_registration', 'update_registration',
      // Procesamiento de pagos (solo ver)
      'view_payments',
      // Facturación FEL (solo ver)
      'view_invoices',
      // QR y acceso
      'validate_qr', 'view_attendance',
      // Certificados
      'generate_certificate', 'view_certificate', 'verify_certificate',
      // Notificaciones
      'send_notification',
      // Reportes (limitados)
      'view_reports'
    ];

    operatorPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap.operator,
          permission_id: permissionMap[permName],
          is_active: true,
          reason: 'Permisos operativos básicos',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // === USER - Permisos básicos de usuario ===
    const userPermissions = [
      // Sistema de inscripciones
      'create_registration', 'read_registration', 'update_registration',
      // Procesamiento de pagos (solo propios)
      'view_payments',
      // Facturación FEL (solo propia)
      'view_invoices',
      // Certificados
      'view_certificate', 'verify_certificate',
      // Notificaciones (solo recibir)
      'view_notification_logs'
    ];

    userPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap.user,
          permission_id: permissionMap[permName],
          is_active: true,
          reason: 'Permisos básicos de usuario registrado',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // === SPEAKER - Permisos para expositores ===
    const speakerPermissions = [
      // Gestión propia
      'read_user', 'update_user',
      // Sistema de inscripciones
      'create_registration', 'read_registration', 'update_registration',
      // Procesamiento de pagos
      'view_payments',
      // Facturación FEL
      'view_invoices',
      // Certificados
      'view_certificate', 'verify_certificate',
      // Notificaciones
      'view_notification_logs'
    ];

    speakerPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap.speaker,
          permission_id: permissionMap[permName],
          is_active: true,
          reason: 'Permisos para expositores de eventos',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // === PARTICIPANT - Permisos mínimos para participantes ===
    const participantPermissions = [
      // Sistema de inscripciones (solo ver y actualizar propia)
      'read_registration', 'update_registration',
      // Procesamiento de pagos (solo ver propios)
      'view_payments',
      // Facturación FEL (solo ver propia)
      'view_invoices',
      // Certificados
      'view_certificate', 'verify_certificate',
      // Notificaciones
      'view_notification_logs'
    ];

    participantPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap.participant,
          permission_id: permissionMap[permName],
          is_active: true,
          reason: 'Permisos mínimos para participantes',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // === CLIENT - Permisos muy limitados para clientes externos ===
    const clientPermissions = [
      // Sistema de inscripciones (solo crear y ver)
      'create_registration', 'read_registration',
      // Procesamiento de pagos (solo ver propios)
      'view_payments',
      // Facturación FEL (solo ver propia)
      'view_invoices',
      // Certificados
      'view_certificate', 'verify_certificate'
    ];

    clientPermissions.forEach(permName => {
      if (permissionMap[permName]) {
        rolePermissions.push({
          role_id: roleMap.client,
          permission_id: permissionMap[permName],
          is_active: true,
          reason: 'Permisos limitados para clientes externos',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // Insertar todas las asignaciones de permisos
    await queryInterface.bulkInsert('role_permissions', rolePermissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};