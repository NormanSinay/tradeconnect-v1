'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear usuario administrador por defecto
    const bcrypt = require('bcryptjs');

    const adminUser = {
      email: 'admin@tradeconnect.gt',
      password: await bcrypt.hash('Admin123!', 12), // Contraseña hasheada
      firstName: 'Super',
      lastName: 'Administrador',
      phone: '+502 1234-5678',
      nit: '12345678-9',
      cui: '1234567890101',
      isEmailVerified: true,
      isActive: true,
      is2FAEnabled: false,
      timezone: 'America/Guatemala',
      locale: 'es',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insertar usuario administrador
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
        userId: userId,
        roleId: superAdminRole[0].id,
        isActive: true,
        reason: 'Usuario administrador por defecto',
        createdAt: new Date(),
        updatedAt: new Date()
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