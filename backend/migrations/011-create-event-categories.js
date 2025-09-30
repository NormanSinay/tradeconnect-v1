'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_categories', {
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
        comment: 'Nombre único de la categoría'
      },
      display_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre para mostrar de la categoría'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la categoría'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la categoría está activa'
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
    await queryInterface.addIndex('event_categories', ['name'], {
      unique: true,
      name: 'event_categories_name_unique'
    });

    await queryInterface.addIndex('event_categories', ['is_active'], {
      name: 'event_categories_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_categories');
  }
};