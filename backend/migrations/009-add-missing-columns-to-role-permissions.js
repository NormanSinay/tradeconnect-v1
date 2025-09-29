'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna granted_at
    await queryInterface.addColumn('role_permissions', 'granted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha cuando se otorgó el permiso'
    });

    // Agregar columna expires_at
    await queryInterface.addColumn('role_permissions', 'expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de expiración del permiso (opcional)'
    });

    // Agregar índices para las nuevas columnas
    await queryInterface.addIndex('role_permissions', ['granted_at'], {
      name: 'role_permissions_granted_at_index'
    });

    await queryInterface.addIndex('role_permissions', ['expires_at'], {
      name: 'role_permissions_expires_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('role_permissions', 'role_permissions_expires_at_index');
    await queryInterface.removeIndex('role_permissions', 'role_permissions_granted_at_index');
    await queryInterface.removeColumn('role_permissions', 'expires_at');
    await queryInterface.removeColumn('role_permissions', 'granted_at');
  }
};