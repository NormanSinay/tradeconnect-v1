'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Nombre único del estado'
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre para mostrar del estado'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del estado'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color hexadecimal para UI (#FF0000)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el estado está activo'
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
    await queryInterface.addIndex('event_statuses', ['name'], {
      unique: true,
      name: 'event_statuses_name_unique'
    });

    await queryInterface.addIndex('event_statuses', ['is_active'], {
      name: 'event_statuses_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_statuses');
  }
};