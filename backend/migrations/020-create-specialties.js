'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('specialties', {
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
        comment: 'Nombre de la especialidad'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la especialidad'
      },
      category: {
        type: Sequelize.ENUM('technology', 'business', 'marketing', 'design', 'education', 'health', 'other'),
        allowNull: false,
        defaultValue: 'other',
        comment: 'Categoría de la especialidad'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la especialidad está activa'
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
    await queryInterface.addIndex('specialties', ['name'], {
      name: 'specialties_name_index',
      unique: true
    });

    await queryInterface.addIndex('specialties', ['category'], {
      name: 'specialties_category_index'
    });

    await queryInterface.addIndex('specialties', ['is_active'], {
      name: 'specialties_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('specialties');
  }
};