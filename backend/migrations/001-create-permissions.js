'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre técnico del permiso'
      },
      display_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Nombre visible del permiso'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción del permiso'
      },
      resource: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Recurso al que aplica el permiso'
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Acción permitida sobre el recurso'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el permiso está activo'
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es un permiso del sistema (no eliminable)'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de actualización'
      }
    });

    // Índices
    await queryInterface.addIndex('permissions', ['name'], {
      unique: true,
      name: 'permissions_name_unique'
    });

    await queryInterface.addIndex('permissions', ['resource'], {
      name: 'permissions_resource_index'
    });

    await queryInterface.addIndex('permissions', ['action'], {
      name: 'permissions_action_index'
    });

    await queryInterface.addIndex('permissions', ['is_active'], {
      name: 'permissions_is_active_index'
    });

    await queryInterface.addIndex('permissions', ['is_system'], {
      name: 'permissions_is_system_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permissions');
  }
};