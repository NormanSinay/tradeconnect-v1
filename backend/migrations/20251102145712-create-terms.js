'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('terms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Versión de los términos (ej: 1.0, 2.1)'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título de los términos'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido completo de los términos'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si esta versión está activa'
      },
      effective_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha efectiva de los términos'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que creó los términos'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que actualizó los términos'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación (soft delete)'
      }
    });

    // Índices
    await queryInterface.addIndex('terms', ['version'], {
      unique: true,
      name: 'terms_version_unique'
    });

    await queryInterface.addIndex('terms', ['is_active'], {
      name: 'terms_is_active_index'
    });

    await queryInterface.addIndex('terms', ['effective_date'], {
      name: 'terms_effective_date_index'
    });

    await queryInterface.addIndex('terms', ['created_by'], {
      name: 'terms_created_by_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('terms');
  }
};
