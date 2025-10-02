'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear usuario administrador por defecto
    const bcrypt = require('bcryptjs');

    const adminUser = {
      email: 'admin@tradeconnect.gt',
      password: await bcrypt.hash('Admin123!', 12), // Contraseña hasheada
      first_name: 'Super',
      last_name: 'Administrador',
      phone: '+502 1234-5678',
      nit: '12345678-9',
      cui: '1234567890101',
      is_email_verified: true,
      is_active: true,
      is_2fa_enabled: false,
      timezone: 'America/Guatemala',
      locale: 'es',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Verificar si ya existe el usuario administrador
    const [results] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM users WHERE email = $1',
      { bind: ['admin@tradeconnect.gt'], type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (results.count > 0) {
      console.log('Usuario administrador ya existe, saltando creación...');
      return;
    }

    // Insertar usuario administrador si no existe
    const [userResult] = await queryInterface.bulkInsert('users', [adminUser], { returning: true });

    // Obtener el ID del usuario creado
    const userId = userResult ? userResult.id : 1;

    // Asignar rol de super_admin al usuario
    const superAdminRole = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE name = $1',
      { bind: ['super_admin'], type: Sequelize.QueryTypes.SELECT }
    );

    if (superAdminRole && superAdminRole.length > 0) {
      await queryInterface.bulkInsert('user_roles', [{
        user_id: userId,
        role_id: superAdminRole[0].id,
        is_active: true,
        reason: 'Usuario administrador por defecto',
        created_at: new Date(),
        updated_at: new Date()
      }], {});
    }

    console.log('Usuario administrador creado:');
    console.log('Email: admin@tradeconnect.gt');
    console.log('Contraseña: Admin123!');
    console.log('Rol: Super Administrador');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar usuario administrador por defecto
    await queryInterface.bulkDelete('user_roles', { user_id: 1 }, {});
    await queryInterface.bulkDelete('users', { email: 'admin@tradeconnect.gt' }, {});
  }
};