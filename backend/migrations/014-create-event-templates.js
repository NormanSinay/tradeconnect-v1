'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre de la plantilla'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la plantilla'
      },
      template_data: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Datos de la plantilla en formato JSON'
      },
      thumbnail_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL de la imagen miniatura'
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la plantilla es pública'
      },
      usage_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de veces que se ha usado la plantilla'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que creó la plantilla'
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
    await queryInterface.addIndex('event_templates', ['name'], {
      name: 'event_templates_name_index'
    });

    await queryInterface.addIndex('event_templates', ['is_public'], {
      name: 'event_templates_is_public_index'
    });

    await queryInterface.addIndex('event_templates', ['created_by'], {
      name: 'event_templates_created_by_index'
    });

    await queryInterface.addIndex('event_templates', ['usage_count'], {
      name: 'event_templates_usage_count_index'
    });

    await queryInterface.addIndex('event_templates', ['created_at'], {
      name: 'event_templates_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_templates');
  }
};