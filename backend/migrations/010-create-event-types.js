'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_types', {
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
        comment: 'Nombre único del tipo de evento'
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre para mostrar del tipo de evento'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del tipo de evento'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el tipo está activo'
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
    await queryInterface.addIndex('event_types', ['name'], {
      unique: true,
      name: 'event_types_name_unique'
    });

    await queryInterface.addIndex('event_types', ['is_active'], {
      name: 'event_types_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_types');
  }
};