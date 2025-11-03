'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('policies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('privacy', 'cookies', 'data_processing', 'security'),
        allowNull: false,
        comment: 'Tipo de política'
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Versión de la política (ej: 1.0, 2.1)'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título de la política'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido completo de la política'
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
        comment: 'Fecha efectiva de la política'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que creó la política'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que actualizó la política'
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
    await queryInterface.addIndex('policies', ['type'], {
      name: 'policies_type_index'
    });

    await queryInterface.addIndex('policies', ['version'], {
      name: 'policies_version_index'
    });

    await queryInterface.addIndex('policies', ['is_active'], {
      name: 'policies_is_active_index'
    });

    await queryInterface.addIndex('policies', ['effective_date'], {
      name: 'policies_effective_date_index'
    });

    await queryInterface.addIndex('policies', ['created_by'], {
      name: 'policies_created_by_index'
    });

    // Índice compuesto único para type + version
    await queryInterface.addIndex('policies', ['type', 'version'], {
      unique: true,
      name: 'policies_type_version_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('policies');
  }
};
