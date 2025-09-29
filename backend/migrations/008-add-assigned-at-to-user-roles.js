'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_roles', 'assigned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha cuando se asignó el rol'
    });

    // Agregar índice para la nueva columna
    await queryInterface.addIndex('user_roles', ['assigned_at'], {
      name: 'user_roles_assigned_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('user_roles', 'user_roles_assigned_at_index');
    await queryInterface.removeColumn('user_roles', 'assigned_at');
  }
};