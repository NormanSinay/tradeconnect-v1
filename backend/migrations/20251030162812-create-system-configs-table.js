'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('system_configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ID único de la configuración'
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Clave única de configuración'
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Valor de la configuración (JSON string)'
      },
      category: {
        type: Sequelize.ENUM('general', 'security', 'payment', 'notification', 'email', 'integration', 'ui', 'performance'),
        allowNull: false,
        comment: 'Categoría de configuración'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descripción de la configuración'
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Si la configuración es pública (visible para usuarios no admin)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Si la configuración está activa'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Usuario que creó la configuración'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de creación'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        comment: 'Fecha de actualización'
      }
    });

    // Crear índices
    await queryInterface.addIndex('system_configs', ['key'], {
      unique: true
    });

    await queryInterface.addIndex('system_configs', ['category']);
    await queryInterface.addIndex('system_configs', ['is_active']);
    await queryInterface.addIndex('system_configs', ['is_public']);
    await queryInterface.addIndex('system_configs', ['created_by']);
    await queryInterface.addIndex('system_configs', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('system_configs');
  }
};
