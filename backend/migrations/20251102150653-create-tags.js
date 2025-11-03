'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Nombre del tag'
      },
      slug: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
        comment: 'Slug único del tag para URLs'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del tag'
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Color representativo del tag (hex)'
      },
      usage_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de veces que se usa el tag'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el tag está activo'
      },
      seo_title: {
        type: Sequelize.STRING(60),
        allowNull: true,
        comment: 'Título SEO personalizado'
      },
      seo_description: {
        type: Sequelize.STRING(160),
        allowNull: true,
        comment: 'Descripción SEO del tag'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del tag'
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
    await queryInterface.addIndex('tags', ['slug'], {
      name: 'tags_slug_index',
      unique: true
    });

    await queryInterface.addIndex('tags', ['is_active'], {
      name: 'tags_is_active_index'
    });

    await queryInterface.addIndex('tags', ['usage_count'], {
      name: 'tags_usage_count_index'
    });

    await queryInterface.addIndex('tags', ['created_at'], {
      name: 'tags_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tags');
  }
};
